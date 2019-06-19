'use babel';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ftpClient = require('@icetee/ftp');
var EventEmitter = require('events');
var FileSystem = require('fs-plus');
var progress = require('progress-stream');

var Ftp = (function (_EventEmitter) {
  _inherits(Ftp, _EventEmitter);

  function Ftp() {
    _classCallCheck(this, Ftp);

    _get(Object.getPrototypeOf(Ftp.prototype), 'constructor', this).call(this);

    self.clientReadyEvent = null;
    self.clientErrorEvent = null;
    self.clientEndEvent = null;
    self.clientCloseEvent = null;
  }

  _createClass(Ftp, [{
    key: 'connect',
    value: function connect(connection) {
      var _this = this;

      var self = this;
      self.emit('debug', 'ftp:connect');

      self.client = new ftpClient();
      var promise = new Promise(function (resolve, reject) {
        self.clientReadyEvent = function () {
          // Not able to get directory listing for regular FTP to an IBM i (or AS/400 or iSeries) #123
          // Force IBM i (or AS/400 or iSeries) returns information
          // for the LIST subcommand in the UNIX style list format.
          self.client.site('LISTFMT 1', function (err) {});

          if (self.client._socket) {
            self.client._socket.setTimeout(1000 * 30); // 30 seconds

            self.client._socket.on('ready', function () {
              self.emit('debug', 'ftp:socket:ready');
            });
            self.client._socket.on('end', function () {
              self.emit('debug', 'ftp:socket:end');
              self.connected = false;
            });
            self.client._socket.on('close', function () {
              self.emit('debug', 'ftp:socket:close');
              self.connected = false;
            });
            self.client._socket.on('timeout', function (err) {
              self.emit('debug', 'ftp:socket:timeout');
              self.connected = false;
              self.client._socket.destroy();
              self.client.emit('timeout', new Error('Connection timeout'));
            });
          }

          self.emit('debug', 'ftp:connect:ready');
          self.connected = true;
          _this.emit('connected');
          resolve(self);
        };
        self.client.on('ready', self.clientReadyEvent);

        self.clientErrorEvent = function (err) {
          self.emit('debug', 'ftp:connect:error', err);
          self.connected = self.client.connected;
          // self.emit('error', err);
          reject(err);
        };
        self.client.on('error', self.clientErrorEvent);

        self.clientEndEvent = function () {
          self.emit('debug', 'ftp:connect:end');
          self.connected = false;
          self.emit('log', '> Connection end');
          self.emit('ended', 'Connection end');
          reject({ message: 'Connection end' });
        };
        self.client.on('end', self.clientEndEvent);

        self.clientCloseEvent = function (hadError) {
          self.emit('debug', 'ftp:connect:close');
          self.connected = false;
          self.emit('log', '> Connection closed');
          self.emit('closed', 'Connection closed');
          reject({ message: 'Connection closed' });
        };
        self.client.on('close', self.clientCloseEvent);
      });

      connection.debug = function (msg) {
        var data = msg.split(/\[(.*)\] (>|<)(.*)/g);
        if (data[1] == "connection") {
          var direction = data[2];
          var cmd = data[3].replace(/\'+/g, "").replace(/\\r|\\n/g, " ");

          // mask password
          if (direction.trim() == ">") {
            var cmdparts = cmd.split(" ");
            if (cmdparts[1] == "PASS") {
              cmd = cmdparts[1] + " " + '*'.repeat(cmdparts[2].length);
            }
          }

          self.emit('log', direction + ' ' + cmd);
        }
      };

      self.client.connect(connection);

      return promise;
    }
  }, {
    key: 'isConnected',
    value: function isConnected() {
      var self = this;

      if (!self.client) return false;
      if (!self.client._socket) return false;
      if (!self.client._socket.readable) return false;

      return self.connected;
    }
  }, {
    key: 'list',
    value: function list(remotePath) {
      var self = this;
      self.emit('debug', 'ftp:list', remotePath);

      var showHiddenFiles = atom.config.get('ftp-remote-edit.tree.showHiddenFiles');

      var promise = new Promise(function (resolve, reject) {
        try {
          (function () {
            // Add event listener
            var clientCloseEvent = function clientCloseEvent(hadError) {
              reject(Error('ftp closed connection'));
            };
            var clientErrorEvent = function clientErrorEvent(err) {
              reject(err);
            };
            var clientTimeoutEvent = function clientTimeoutEvent(err) {
              reject(err);
            };

            self.client.once('close', clientCloseEvent);
            self.client.once('error', clientErrorEvent);
            self.client.once('timeout', clientTimeoutEvent);

            var path = showHiddenFiles ? '-al ' + remotePath.trim() : remotePath.trim();
            self.client.list(path, function (err, list) {
              self.client.removeListener('close', clientCloseEvent);
              self.client.removeListener('error', clientErrorEvent);
              self.client.removeListener('timeout', clientTimeoutEvent);

              if (err) {
                reject(err);
              } else if (list) {
                resolve(list);
              } else {
                resolve([]);
              }
            });
          })();
        } catch (err) {
          self.client.removeListener('close', clientCloseEvent);
          self.client.removeListener('error', clientErrorEvent);
          self.client.removeListener('timeout', clientTimeoutEvent);
          reject(err);
        }
      });

      return promise;
    }
  }, {
    key: 'mkdir',
    value: function mkdir(remotePath) {
      var self = this;
      self.emit('debug', 'ftp:mkdir', remotePath);

      var promise = new Promise(function (resolve, reject) {
        // Add event listener
        var clientCloseEvent = function clientCloseEvent(hadError) {
          reject(Error('ftp closed connection'));
        };
        var clientErrorEvent = function clientErrorEvent(err) {
          reject(err);
        };
        var clientTimeoutEvent = function clientTimeoutEvent(err) {
          reject(err);
        };

        self.client.once('close', clientCloseEvent);
        self.client.once('error', clientErrorEvent);
        self.client.once('timeout', clientTimeoutEvent);

        self.client.mkdir(remotePath.trim(), function (err) {
          self.client.removeListener('close', clientCloseEvent);
          self.client.removeListener('error', clientErrorEvent);
          self.client.removeListener('timeout', clientTimeoutEvent);

          if (err) {
            reject(err);
          } else {
            resolve(remotePath.trim());
          }
        });
      });

      return promise;
    }
  }, {
    key: 'rmdir',
    value: function rmdir(remotePath, recursive) {
      var self = this;
      self.emit('debug', 'ftp:rmdir', remotePath);

      var promise = new Promise(function (resolve, reject) {
        // Add event listener
        var clientCloseEvent = function clientCloseEvent(hadError) {
          reject(Error('ftp closed connection'));
        };
        var clientErrorEvent = function clientErrorEvent(err) {
          reject(err);
        };
        var clientTimeoutEvent = function clientTimeoutEvent(err) {
          reject(err);
        };

        self.client.once('close', clientCloseEvent);
        self.client.once('error', clientErrorEvent);
        self.client.once('timeout', clientTimeoutEvent);

        self.client.rmdir(remotePath.trim(), recursive, function (err) {
          self.client.removeListener('close', clientCloseEvent);
          self.client.removeListener('error', clientErrorEvent);
          self.client.removeListener('timeout', clientTimeoutEvent);

          if (err) {
            reject(err);
          } else {
            resolve(remotePath.trim());
          }
        });
      });

      return promise;
    }
  }, {
    key: 'chmod',
    value: function chmod(remotePath, permissions) {
      var self = this;
      self.emit('debug', 'ftp:chmod', remotePath);

      var promise = new Promise(function (resolve, reject) {
        // Add event listener
        var clientCloseEvent = function clientCloseEvent(hadError) {
          reject(Error('ftp closed connection'));
        };
        var clientErrorEvent = function clientErrorEvent(err) {
          reject(err);
        };
        var clientTimeoutEvent = function clientTimeoutEvent(err) {
          reject(err);
        };

        self.client.once('close', clientCloseEvent);
        self.client.once('error', clientErrorEvent);
        self.client.once('timeout', clientTimeoutEvent);

        self.client.site('CHMOD ' + permissions + ' ' + remotePath, function (err, responseText, responseCode) {
          self.client.removeListener('close', clientCloseEvent);
          self.client.removeListener('error', clientErrorEvent);
          self.client.removeListener('timeout', clientTimeoutEvent);

          if (err) {
            reject(err);
          } else {
            resolve(responseText);
          }
        });
      });

      return promise;
    }
  }, {
    key: 'put',
    value: function put(queueItem) {
      var self = this;
      self.emit('debug', 'ftp:put', remotePath);

      var remotePath = queueItem.info.remotePath;
      var localPath = queueItem.info.localPath;

      var promise = new Promise(function (resolve, reject) {
        var str = progress({ time: 100 });
        var input = FileSystem.createReadStream(localPath);
        input.pause();

        // Declare events 
        var progressEvent = function progressEvent(progress) {
          queueItem.changeProgress(progress.transferred);
          self.emit('data', progress.transferred);
        };
        var clientCloseEvent = function clientCloseEvent(hadError) {
          if (hadError) {
            queueItem.changeStatus('Error');
            reject(Error('ftp closed connection'));
          } else {
            resolve(localPath.trim());
          }
        };
        var clientErrorEvent = function clientErrorEvent(err) {
          queueItem.changeStatus('Error');
          reject(err);
        };
        var clientTimeoutEvent = function clientTimeoutEvent(err) {
          queueItem.changeStatus('Error');
          reject(err);
        };

        // Add event listener
        str.on('progress', progressEvent);
        self.client.once('close', clientCloseEvent);
        self.client.once('error', clientErrorEvent);
        self.client.once('timeout', clientTimeoutEvent);

        input.on('open', function () {
          queueItem.changeStatus('Transferring');
        });
        // input.once('end', () => {
        //   queueItem.changeProgress(queueItem.info.size);
        //   resolve(localPath.trim());
        // });
        // input.once('finish', () => {
        //   queueItem.changeProgress(queueItem.info.size);
        //   resolve(localPath.trim());
        // });
        input.once('error', function (err) {
          // Remove event listener
          str.removeListener('progress', progressEvent);
          self.client.removeListener('close', clientCloseEvent);
          self.client.removeListener('error', clientErrorEvent);
          self.client.removeListener('timeout', clientTimeoutEvent);

          queueItem.changeStatus('Error');
          reject(err);
        });

        self.client.put(input.pipe(str), remotePath, false, function (err) {
          if (err) {
            // Remove event listener
            str.removeListener('progress', progressEvent);
            self.client.removeListener('close', clientCloseEvent);
            self.client.removeListener('error', clientErrorEvent);
            self.client.removeListener('timeout', clientTimeoutEvent);

            queueItem.changeStatus('Error');
            reject(err);
          } else {
            // Remove event listener
            str.removeListener('progress', progressEvent);
            self.client.removeListener('close', clientCloseEvent);
            self.client.removeListener('error', clientErrorEvent);
            self.client.removeListener('timeout', clientTimeoutEvent);

            queueItem.changeProgress(queueItem.info.size);
            resolve(remotePath.trim());
          }
        });
      });

      return promise;
    }
  }, {
    key: 'get',
    value: function get(queueItem) {
      var self = this;
      self.emit('debug', 'ftp:get', remotePath, localPath);

      var remotePath = queueItem.info.remotePath;
      var localPath = queueItem.info.localPath;

      var promise = new Promise(function (resolve, reject) {
        var str = progress({ time: 100 });

        // Declare events 
        var progressEvent = function progressEvent(progress) {
          queueItem.changeProgress(progress.transferred);
          self.emit('data', progress.transferred);
        };
        var clientCloseEvent = function clientCloseEvent(hadError) {
          if (hadError) {
            queueItem.changeStatus('Error');
            reject(Error('ftp closed connection'));
          } else {
            resolve(localPath.trim());
          }
        };
        var clientErrorEvent = function clientErrorEvent(err) {
          queueItem.changeStatus('Error');
          reject(err);
        };
        var clientTimeoutEvent = function clientTimeoutEvent(err) {
          queueItem.changeStatus('Error');
          reject(err);
        };

        // Add event listener
        str.on('progress', progressEvent);
        self.client.once('close', clientCloseEvent);
        self.client.once('error', clientErrorEvent);
        self.client.once('timeout', clientTimeoutEvent);

        self.client.get(remotePath, function (err, stream) {
          if (err) {
            // Remove event listener
            str.removeListener('progress', progressEvent);
            self.client.removeListener('close', clientCloseEvent);
            self.client.removeListener('error', clientErrorEvent);
            self.client.removeListener('timeout', clientTimeoutEvent);

            queueItem.changeStatus('Error');
            reject(err);
          } else if (stream) {
            (function () {
              var file = FileSystem.createWriteStream(localPath, { autoClose: true });

              file.once('open', function () {
                queueItem.addStream(file);
                queueItem.changeStatus('Transferring');
              });
              file.once('error', function (err) {
                // Remove event listener
                str.removeListener('progress', progressEvent);
                self.client.removeListener('close', clientCloseEvent);
                self.client.removeListener('error', clientErrorEvent);
                self.client.removeListener('timeout', clientTimeoutEvent);

                queueItem.changeStatus('Error');
                reject(err);
              });

              stream.once('end', function () {
                // Remove event listener
                str.removeListener('progress', progressEvent);
                self.client.removeListener('close', clientCloseEvent);
                self.client.removeListener('error', clientErrorEvent);
                self.client.removeListener('timeout', clientTimeoutEvent);

                queueItem.changeProgress(queueItem.info.size);
                resolve(localPath.trim());
              });
              stream.once('finish', function () {
                // Remove event listener
                str.removeListener('progress', progressEvent);
                self.client.removeListener('close', clientCloseEvent);
                self.client.removeListener('error', clientErrorEvent);
                self.client.removeListener('timeout', clientTimeoutEvent);

                queueItem.changeProgress(queueItem.info.size);
                resolve(localPath.trim());
              });
              stream.once('error', function (err) {
                // Remove event listener
                str.removeListener('progress', progressEvent);
                self.client.removeListener('close', clientCloseEvent);
                self.client.removeListener('error', clientErrorEvent);
                self.client.removeListener('timeout', clientTimeoutEvent);

                queueItem.changeStatus('Error');
                reject(err);
              });

              stream.pause();
              stream.pipe(str).pipe(file);
            })();
          } else {
            // Remove event listener
            str.removeListener('progress', progressEvent);
            self.client.removeListener('close', clientCloseEvent);
            self.client.removeListener('error', clientErrorEvent);
            self.client.removeListener('timeout', clientTimeoutEvent);

            queueItem.changeStatus('Error');
            reject(new Error('File Stream closed'));
          }
        });
      });

      return promise;
    }
  }, {
    key: 'delete',
    value: function _delete(remotePath) {
      var self = this;
      self.emit('debug', 'ftp:delete', remotePath);

      var promise = new Promise(function (resolve, reject) {
        // Add event listener
        var clientCloseEvent = function clientCloseEvent(hadError) {
          reject(Error('ftp closed connection'));
        };
        var clientErrorEvent = function clientErrorEvent(err) {
          reject(err);
        };
        var clientTimeoutEvent = function clientTimeoutEvent(err) {
          reject(err);
        };

        self.client.once('close', clientCloseEvent);
        self.client.once('error', clientErrorEvent);
        self.client.once('timeout', clientTimeoutEvent);

        self.client['delete'](remotePath, function (err) {
          self.client.removeListener('close', clientCloseEvent);
          self.client.removeListener('error', clientErrorEvent);
          self.client.removeListener('timeout', clientTimeoutEvent);

          if (err) {
            reject(err);
          } else {
            resolve(remotePath.trim());
          }
        });
      });

      return promise;
    }
  }, {
    key: 'rename',
    value: function rename(oldRemotePath, newRemotePath) {
      var self = this;
      self.emit('debug', 'ftp:rename', oldRemotePath, newRemotePath);

      var promise = new Promise(function (resolve, reject) {
        // Add event listener
        var clientCloseEvent = function clientCloseEvent(hadError) {
          reject(Error('ftp closed connection'));
        };
        var clientErrorEvent = function clientErrorEvent(err) {
          reject(err);
        };
        var clientTimeoutEvent = function clientTimeoutEvent(err) {
          reject(err);
        };

        self.client.once('close', clientCloseEvent);
        self.client.once('error', clientErrorEvent);
        self.client.once('timeout', clientTimeoutEvent);

        self.client.rename(oldRemotePath.trim(), newRemotePath.trim(), function (err) {
          self.client.removeListener('close', clientCloseEvent);
          self.client.removeListener('error', clientErrorEvent);
          self.client.removeListener('timeout', clientTimeoutEvent);

          if (err) {
            reject(err);
          } else {
            resolve(newRemotePath.trim());
          }
        });
      });

      return promise;
    }
  }, {
    key: 'end',
    value: function end() {
      var self = this;
      self.emit('debug', 'ftp:end');

      self.connected = false;
      var promise = new Promise(function (resolve, reject) {
        if (!self.client) return resolve(true);

        // Declare events 
        var clientEndEvent = function clientEndEvent() {
          self.emit('debug', 'ftp:end');

          // Remove event listener
          self.client.removeListener('end', clientEndEvent);
          self.client.removeListener('close', clientCloseEvent);

          self.client.removeListener('ready', self.clientReadyEvent);
          self.client.removeListener('error', self.clientErrorEvent);
          self.client.removeListener('end', self.clientEndEvent);
          self.client.removeListener('close', self.clientCloseEvent);
          resolve(true);
        };
        var clientCloseEvent = function clientCloseEvent(hadError) {
          self.emit('debug', 'ftp:end');

          resolve(true);
        };

        // Add event listener
        self.client.on('end', clientEndEvent);
        self.client.on('close', clientCloseEvent);

        self.client.end();
      });

      return promise;
    }
  }, {
    key: 'abort',
    value: function abort() {
      var self = this;
      self.emit('debug', 'ftp:abort');

      var promise = new Promise(function (resolve, reject) {
        if (!self.client) return resolve(true);

        self.client.abort(function (err) {
          resolve();
        });
      });

      return promise;
    }
  }]);

  return Ftp;
})(EventEmitter);

exports['default'] = Ftp;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2FuYW5tYXlqYWluLy5hdG9tL3BhY2thZ2VzL2Z0cC1yZW1vdGUtZWRpdC9saWIvY29ubmVjdG9ycy9mdHAuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsV0FBVyxDQUFDOzs7Ozs7Ozs7Ozs7OztBQUVaLElBQU0sU0FBUyxHQUFHLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQztBQUN6QyxJQUFNLFlBQVksR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDdkMsSUFBTSxVQUFVLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ3RDLElBQU0sUUFBUSxHQUFHLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDOztJQUV2QixHQUFHO1lBQUgsR0FBRzs7QUFFWCxXQUZRLEdBQUcsR0FFUjswQkFGSyxHQUFHOztBQUdwQiwrQkFIaUIsR0FBRyw2Q0FHWjs7QUFFUixRQUFJLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDO0FBQzdCLFFBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUM7QUFDN0IsUUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUM7QUFDM0IsUUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksQ0FBQztHQUM5Qjs7ZUFUa0IsR0FBRzs7V0FXZixpQkFBQyxVQUFVLEVBQUU7OztBQUNsQixVQUFNLElBQUksR0FBRyxJQUFJLENBQUM7QUFDbEIsVUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsYUFBYSxDQUFDLENBQUM7O0FBRWxDLFVBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxTQUFTLEVBQUUsQ0FBQztBQUM5QixVQUFJLE9BQU8sR0FBRyxJQUFJLE9BQU8sQ0FBQyxVQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUs7QUFDN0MsWUFBSSxDQUFDLGdCQUFnQixHQUFHLFlBQU07Ozs7QUFJNUIsY0FBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLFVBQUMsR0FBRyxFQUFLLEVBQUcsQ0FB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QUM7O0FBRTlCLGlCQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDZixDQUFDOzs7QUFHRixZQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxLQUFLLEVBQUUsY0FBYyxDQUFDLENBQUM7QUFDdEMsWUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLGdCQUFnQixDQUFDLENBQUM7O0FBRTFDLFlBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUM7T0FDbkIsQ0FBQyxDQUFDOztBQUVILGFBQU8sT0FBTyxDQUFDO0tBQ2hCOzs7V0FFSSxpQkFBRztBQUNOLFVBQU0sSUFBSSxHQUFHLElBQUksQ0FBQztBQUNsQixVQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxXQUFXLENBQUMsQ0FBQzs7QUFFaEMsVUFBSSxPQUFPLEdBQUcsSUFBSSxPQUFPLENBQUMsVUFBQyxPQUFPLEVBQUUsTUFBTSxFQUFLO0FBQzdDLFlBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLE9BQU8sT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDOztBQUV2QyxZQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxVQUFDLEdBQUcsRUFBSztBQUN6QixpQkFBTyxFQUFFLENBQUM7U0FDWCxDQUFDLENBQUM7T0FDSixDQUFDLENBQUM7O0FBRUgsYUFBTyxPQUFPLENBQUM7S0FDaEI7OztTQWxsQmtCLEdBQUc7R0FBUyxZQUFZOztxQkFBeEIsR0FBRyIsImZpbGUiOiIvaG9tZS9hbmFubWF5amFpbi8uYXRvbS9wYWNrYWdlcy9mdHAtcmVtb3RlLWVkaXQvbGliL2Nvbm5lY3RvcnMvZnRwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbmNvbnN0IGZ0cENsaWVudCA9IHJlcXVpcmUoJ0BpY2V0ZWUvZnRwJyk7XG5jb25zdCBFdmVudEVtaXR0ZXIgPSByZXF1aXJlKCdldmVudHMnKTtcbmNvbnN0IEZpbGVTeXN0ZW0gPSByZXF1aXJlKCdmcy1wbHVzJyk7XG5jb25zdCBwcm9ncmVzcyA9IHJlcXVpcmUoJ3Byb2dyZXNzLXN0cmVhbScpO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBGdHAgZXh0ZW5kcyBFdmVudEVtaXR0ZXIge1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKCk7XG5cbiAgICBzZWxmLmNsaWVudFJlYWR5RXZlbnQgPSBudWxsO1xuICAgIHNlbGYuY2xpZW50RXJyb3JFdmVudCA9IG51bGw7XG4gICAgc2VsZi5jbGllbnRFbmRFdmVudCA9IG51bGw7XG4gICAgc2VsZi5jbGllbnRDbG9zZUV2ZW50ID0gbnVsbDtcbiAgfVxuXG4gIGNvbm5lY3QoY29ubmVjdGlvbikge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuICAgIHNlbGYuZW1pdCgnZGVidWcnLCAnZnRwOmNvbm5lY3QnKTtcblxuICAgIHNlbGYuY2xpZW50ID0gbmV3IGZ0cENsaWVudCgpO1xuICAgIGxldCBwcm9taXNlID0gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgc2VsZi5jbGllbnRSZWFkeUV2ZW50ID0gKCkgPT4ge1xuICAgICAgICAvLyBOb3QgYWJsZSB0byBnZXQgZGlyZWN0b3J5IGxpc3RpbmcgZm9yIHJlZ3VsYXIgRlRQIHRvIGFuIElCTSBpIChvciBBUy80MDAgb3IgaVNlcmllcykgIzEyM1xuICAgICAgICAvLyBGb3JjZSBJQk0gaSAob3IgQVMvNDAwIG9yIGlTZXJpZXMpIHJldHVybnMgaW5mb3JtYXRpb25cbiAgICAgICAgLy8gZm9yIHRoZSBMSVNUIHN1YmNvbW1hbmQgaW4gdGhlIFVOSVggc3R5bGUgbGlzdCBmb3JtYXQuXG4gICAgICAgIHNlbGYuY2xpZW50LnNpdGUoJ0xJU1RGTVQgMScsIChlcnIpID0+IHsgfSk7XG5cbiAgICAgICAgaWYgKHNlbGYuY2xpZW50Ll9zb2NrZXQpIHtcbiAgICAgICAgICBzZWxmLmNsaWVudC5fc29ja2V0LnNldFRpbWVvdXQoMTAwMCAqIDMwKTsgLy8gMzAgc2Vjb25kc1xuXG4gICAgICAgICAgc2VsZi5jbGllbnQuX3NvY2tldC5vbigncmVhZHknLCAoKSA9PiB7XG4gICAgICAgICAgICBzZWxmLmVtaXQoJ2RlYnVnJywgJ2Z0cDpzb2NrZXQ6cmVhZHknKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBzZWxmLmNsaWVudC5fc29ja2V0Lm9uKCdlbmQnLCAoKSA9PiB7XG4gICAgICAgICAgICBzZWxmLmVtaXQoJ2RlYnVnJywgJ2Z0cDpzb2NrZXQ6ZW5kJyk7XG4gICAgICAgICAgICBzZWxmLmNvbm5lY3RlZCA9IGZhbHNlO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIHNlbGYuY2xpZW50Ll9zb2NrZXQub24oJ2Nsb3NlJywgKCkgPT4ge1xuICAgICAgICAgICAgc2VsZi5lbWl0KCdkZWJ1ZycsICdmdHA6c29ja2V0OmNsb3NlJyk7XG4gICAgICAgICAgICBzZWxmLmNvbm5lY3RlZCA9IGZhbHNlO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIHNlbGYuY2xpZW50Ll9zb2NrZXQub24oJ3RpbWVvdXQnLCAoZXJyKSA9PiB7XG4gICAgICAgICAgICBzZWxmLmVtaXQoJ2RlYnVnJywgJ2Z0cDpzb2NrZXQ6dGltZW91dCcpO1xuICAgICAgICAgICAgc2VsZi5jb25uZWN0ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIHNlbGYuY2xpZW50Ll9zb2NrZXQuZGVzdHJveSgpO1xuICAgICAgICAgICAgc2VsZi5jbGllbnQuZW1pdCgndGltZW91dCcsIG5ldyBFcnJvcignQ29ubmVjdGlvbiB0aW1lb3V0JykpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgc2VsZi5lbWl0KCdkZWJ1ZycsICdmdHA6Y29ubmVjdDpyZWFkeScpO1xuICAgICAgICBzZWxmLmNvbm5lY3RlZCA9IHRydWU7XG4gICAgICAgIHRoaXMuZW1pdCgnY29ubmVjdGVkJyk7XG4gICAgICAgIHJlc29sdmUoc2VsZik7XG4gICAgICB9O1xuICAgICAgc2VsZi5jbGllbnQub24oJ3JlYWR5Jywgc2VsZi5jbGllbnRSZWFkeUV2ZW50KTtcblxuICAgICAgc2VsZi5jbGllbnRFcnJvckV2ZW50ID0gKGVycikgPT4ge1xuICAgICAgICBzZWxmLmVtaXQoJ2RlYnVnJywgJ2Z0cDpjb25uZWN0OmVycm9yJywgZXJyKTtcbiAgICAgICAgc2VsZi5jb25uZWN0ZWQgPSBzZWxmLmNsaWVudC5jb25uZWN0ZWQ7XG4gICAgICAgIC8vIHNlbGYuZW1pdCgnZXJyb3InLCBlcnIpO1xuICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgIH07XG4gICAgICBzZWxmLmNsaWVudC5vbignZXJyb3InLCBzZWxmLmNsaWVudEVycm9yRXZlbnQpO1xuXG4gICAgICBzZWxmLmNsaWVudEVuZEV2ZW50ID0gKCkgPT4ge1xuICAgICAgICBzZWxmLmVtaXQoJ2RlYnVnJywgJ2Z0cDpjb25uZWN0OmVuZCcpO1xuICAgICAgICBzZWxmLmNvbm5lY3RlZCA9IGZhbHNlO1xuICAgICAgICBzZWxmLmVtaXQoJ2xvZycsICc+IENvbm5lY3Rpb24gZW5kJyk7XG4gICAgICAgIHNlbGYuZW1pdCgnZW5kZWQnLCAnQ29ubmVjdGlvbiBlbmQnKTtcbiAgICAgICAgcmVqZWN0KHsgbWVzc2FnZTogJ0Nvbm5lY3Rpb24gZW5kJyB9KTtcbiAgICAgIH07XG4gICAgICBzZWxmLmNsaWVudC5vbignZW5kJywgc2VsZi5jbGllbnRFbmRFdmVudCk7XG5cbiAgICAgIHNlbGYuY2xpZW50Q2xvc2VFdmVudCA9IChoYWRFcnJvcikgPT4ge1xuICAgICAgICBzZWxmLmVtaXQoJ2RlYnVnJywgJ2Z0cDpjb25uZWN0OmNsb3NlJyk7XG4gICAgICAgIHNlbGYuY29ubmVjdGVkID0gZmFsc2U7XG4gICAgICAgIHNlbGYuZW1pdCgnbG9nJywgJz4gQ29ubmVjdGlvbiBjbG9zZWQnKTtcbiAgICAgICAgc2VsZi5lbWl0KCdjbG9zZWQnLCAnQ29ubmVjdGlvbiBjbG9zZWQnKTtcbiAgICAgICAgcmVqZWN0KHsgbWVzc2FnZTogJ0Nvbm5lY3Rpb24gY2xvc2VkJyB9KTtcbiAgICAgIH07XG4gICAgICBzZWxmLmNsaWVudC5vbignY2xvc2UnLCBzZWxmLmNsaWVudENsb3NlRXZlbnQpO1xuICAgIH0pO1xuXG4gICAgY29ubmVjdGlvbi5kZWJ1ZyA9IChtc2cpID0+IHtcbiAgICAgIGxldCBkYXRhID0gbXNnLnNwbGl0KC9cXFsoLiopXFxdICg+fDwpKC4qKS9nKTtcbiAgICAgIGlmIChkYXRhWzFdID09IFwiY29ubmVjdGlvblwiKSB7XG4gICAgICAgIGxldCBkaXJlY3Rpb24gPSBkYXRhWzJdO1xuICAgICAgICBsZXQgY21kID0gZGF0YVszXS5yZXBsYWNlKC9cXCcrL2csIFwiXCIpLnJlcGxhY2UoL1xcXFxyfFxcXFxuL2csIFwiIFwiKTtcblxuICAgICAgICAvLyBtYXNrIHBhc3N3b3JkXG4gICAgICAgIGlmIChkaXJlY3Rpb24udHJpbSgpID09IFwiPlwiKSB7XG4gICAgICAgICAgbGV0IGNtZHBhcnRzID0gY21kLnNwbGl0KFwiIFwiKTtcbiAgICAgICAgICBpZiAoY21kcGFydHNbMV0gPT0gXCJQQVNTXCIpIHtcbiAgICAgICAgICAgIGNtZCA9IGNtZHBhcnRzWzFdICsgXCIgXCIgKyAnKicucmVwZWF0KGNtZHBhcnRzWzJdLmxlbmd0aCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgc2VsZi5lbWl0KCdsb2cnLCBkaXJlY3Rpb24gKyAnICcgKyBjbWQpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHNlbGYuY2xpZW50LmNvbm5lY3QoY29ubmVjdGlvbik7XG5cbiAgICByZXR1cm4gcHJvbWlzZTtcbiAgfVxuXG4gIGlzQ29ubmVjdGVkKCkge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuXG4gICAgaWYgKCFzZWxmLmNsaWVudCkgcmV0dXJuIGZhbHNlO1xuICAgIGlmICghc2VsZi5jbGllbnQuX3NvY2tldCkgcmV0dXJuIGZhbHNlO1xuICAgIGlmICghc2VsZi5jbGllbnQuX3NvY2tldC5yZWFkYWJsZSkgcmV0dXJuIGZhbHNlO1xuXG4gICAgcmV0dXJuIHNlbGYuY29ubmVjdGVkO1xuICB9XG5cbiAgbGlzdChyZW1vdGVQYXRoKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gICAgc2VsZi5lbWl0KCdkZWJ1ZycsICdmdHA6bGlzdCcsIHJlbW90ZVBhdGgpO1xuXG4gICAgY29uc3Qgc2hvd0hpZGRlbkZpbGVzID0gYXRvbS5jb25maWcuZ2V0KCdmdHAtcmVtb3RlLWVkaXQudHJlZS5zaG93SGlkZGVuRmlsZXMnKTtcblxuICAgIGxldCBwcm9taXNlID0gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgLy8gQWRkIGV2ZW50IGxpc3RlbmVyXG4gICAgICAgIGNvbnN0IGNsaWVudENsb3NlRXZlbnQgPSAoaGFkRXJyb3IpID0+IHtcbiAgICAgICAgICByZWplY3QoRXJyb3IoJ2Z0cCBjbG9zZWQgY29ubmVjdGlvbicpKTtcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgY2xpZW50RXJyb3JFdmVudCA9IChlcnIpID0+IHtcbiAgICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgY2xpZW50VGltZW91dEV2ZW50ID0gKGVycikgPT4ge1xuICAgICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICB9O1xuXG4gICAgICAgIHNlbGYuY2xpZW50Lm9uY2UoJ2Nsb3NlJywgY2xpZW50Q2xvc2VFdmVudCk7XG4gICAgICAgIHNlbGYuY2xpZW50Lm9uY2UoJ2Vycm9yJywgY2xpZW50RXJyb3JFdmVudCk7XG4gICAgICAgIHNlbGYuY2xpZW50Lm9uY2UoJ3RpbWVvdXQnLCBjbGllbnRUaW1lb3V0RXZlbnQpO1xuXG4gICAgICAgIGxldCBwYXRoID0gKHNob3dIaWRkZW5GaWxlcyA/ICctYWwgJyArIHJlbW90ZVBhdGgudHJpbSgpIDogcmVtb3RlUGF0aC50cmltKCkpO1xuICAgICAgICBzZWxmLmNsaWVudC5saXN0KHBhdGgsIChlcnIsIGxpc3QpID0+IHtcbiAgICAgICAgICBzZWxmLmNsaWVudC5yZW1vdmVMaXN0ZW5lcignY2xvc2UnLCBjbGllbnRDbG9zZUV2ZW50KTtcbiAgICAgICAgICBzZWxmLmNsaWVudC5yZW1vdmVMaXN0ZW5lcignZXJyb3InLCBjbGllbnRFcnJvckV2ZW50KTtcbiAgICAgICAgICBzZWxmLmNsaWVudC5yZW1vdmVMaXN0ZW5lcigndGltZW91dCcsIGNsaWVudFRpbWVvdXRFdmVudCk7XG5cbiAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKGxpc3QpIHtcbiAgICAgICAgICAgIHJlc29sdmUobGlzdCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlc29sdmUoW10pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgc2VsZi5jbGllbnQucmVtb3ZlTGlzdGVuZXIoJ2Nsb3NlJywgY2xpZW50Q2xvc2VFdmVudCk7XG4gICAgICAgIHNlbGYuY2xpZW50LnJlbW92ZUxpc3RlbmVyKCdlcnJvcicsIGNsaWVudEVycm9yRXZlbnQpO1xuICAgICAgICBzZWxmLmNsaWVudC5yZW1vdmVMaXN0ZW5lcigndGltZW91dCcsIGNsaWVudFRpbWVvdXRFdmVudCk7XG4gICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIHByb21pc2U7XG4gIH1cblxuICBta2RpcihyZW1vdGVQYXRoKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gICAgc2VsZi5lbWl0KCdkZWJ1ZycsICdmdHA6bWtkaXInLCByZW1vdGVQYXRoKTtcblxuICAgIGxldCBwcm9taXNlID0gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgLy8gQWRkIGV2ZW50IGxpc3RlbmVyXG4gICAgICBjb25zdCBjbGllbnRDbG9zZUV2ZW50ID0gKGhhZEVycm9yKSA9PiB7XG4gICAgICAgIHJlamVjdChFcnJvcignZnRwIGNsb3NlZCBjb25uZWN0aW9uJykpO1xuICAgICAgfTtcbiAgICAgIGNvbnN0IGNsaWVudEVycm9yRXZlbnQgPSAoZXJyKSA9PiB7XG4gICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgfTtcbiAgICAgIGNvbnN0IGNsaWVudFRpbWVvdXRFdmVudCA9IChlcnIpID0+IHtcbiAgICAgICAgcmVqZWN0KGVycik7XG4gICAgICB9O1xuXG4gICAgICBzZWxmLmNsaWVudC5vbmNlKCdjbG9zZScsIGNsaWVudENsb3NlRXZlbnQpO1xuICAgICAgc2VsZi5jbGllbnQub25jZSgnZXJyb3InLCBjbGllbnRFcnJvckV2ZW50KTtcbiAgICAgIHNlbGYuY2xpZW50Lm9uY2UoJ3RpbWVvdXQnLCBjbGllbnRUaW1lb3V0RXZlbnQpO1xuXG4gICAgICBzZWxmLmNsaWVudC5ta2RpcihyZW1vdGVQYXRoLnRyaW0oKSwgKGVycikgPT4ge1xuICAgICAgICBzZWxmLmNsaWVudC5yZW1vdmVMaXN0ZW5lcignY2xvc2UnLCBjbGllbnRDbG9zZUV2ZW50KTtcbiAgICAgICAgc2VsZi5jbGllbnQucmVtb3ZlTGlzdGVuZXIoJ2Vycm9yJywgY2xpZW50RXJyb3JFdmVudCk7XG4gICAgICAgIHNlbGYuY2xpZW50LnJlbW92ZUxpc3RlbmVyKCd0aW1lb3V0JywgY2xpZW50VGltZW91dEV2ZW50KTtcblxuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgcmVqZWN0KGVycik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmVzb2x2ZShyZW1vdGVQYXRoLnRyaW0oKSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHByb21pc2U7XG4gIH1cblxuICBybWRpcihyZW1vdGVQYXRoLCByZWN1cnNpdmUpIHtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcbiAgICBzZWxmLmVtaXQoJ2RlYnVnJywgJ2Z0cDpybWRpcicsIHJlbW90ZVBhdGgpO1xuXG4gICAgbGV0IHByb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAvLyBBZGQgZXZlbnQgbGlzdGVuZXJcbiAgICAgIGNvbnN0IGNsaWVudENsb3NlRXZlbnQgPSAoaGFkRXJyb3IpID0+IHtcbiAgICAgICAgcmVqZWN0KEVycm9yKCdmdHAgY2xvc2VkIGNvbm5lY3Rpb24nKSk7XG4gICAgICB9O1xuICAgICAgY29uc3QgY2xpZW50RXJyb3JFdmVudCA9IChlcnIpID0+IHtcbiAgICAgICAgcmVqZWN0KGVycik7XG4gICAgICB9O1xuICAgICAgY29uc3QgY2xpZW50VGltZW91dEV2ZW50ID0gKGVycikgPT4ge1xuICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgIH07XG5cbiAgICAgIHNlbGYuY2xpZW50Lm9uY2UoJ2Nsb3NlJywgY2xpZW50Q2xvc2VFdmVudCk7XG4gICAgICBzZWxmLmNsaWVudC5vbmNlKCdlcnJvcicsIGNsaWVudEVycm9yRXZlbnQpO1xuICAgICAgc2VsZi5jbGllbnQub25jZSgndGltZW91dCcsIGNsaWVudFRpbWVvdXRFdmVudCk7XG5cbiAgICAgIHNlbGYuY2xpZW50LnJtZGlyKHJlbW90ZVBhdGgudHJpbSgpLCByZWN1cnNpdmUsIChlcnIpID0+IHtcbiAgICAgICAgc2VsZi5jbGllbnQucmVtb3ZlTGlzdGVuZXIoJ2Nsb3NlJywgY2xpZW50Q2xvc2VFdmVudCk7XG4gICAgICAgIHNlbGYuY2xpZW50LnJlbW92ZUxpc3RlbmVyKCdlcnJvcicsIGNsaWVudEVycm9yRXZlbnQpO1xuICAgICAgICBzZWxmLmNsaWVudC5yZW1vdmVMaXN0ZW5lcigndGltZW91dCcsIGNsaWVudFRpbWVvdXRFdmVudCk7XG5cbiAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJlc29sdmUocmVtb3RlUGF0aC50cmltKCkpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIHJldHVybiBwcm9taXNlO1xuICB9XG5cbiAgY2htb2QocmVtb3RlUGF0aCwgcGVybWlzc2lvbnMpIHtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcbiAgICBzZWxmLmVtaXQoJ2RlYnVnJywgJ2Z0cDpjaG1vZCcsIHJlbW90ZVBhdGgpO1xuXG4gICAgbGV0IHByb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAvLyBBZGQgZXZlbnQgbGlzdGVuZXJcbiAgICAgIGNvbnN0IGNsaWVudENsb3NlRXZlbnQgPSAoaGFkRXJyb3IpID0+IHtcbiAgICAgICAgcmVqZWN0KEVycm9yKCdmdHAgY2xvc2VkIGNvbm5lY3Rpb24nKSk7XG4gICAgICB9O1xuICAgICAgY29uc3QgY2xpZW50RXJyb3JFdmVudCA9IChlcnIpID0+IHtcbiAgICAgICAgcmVqZWN0KGVycik7XG4gICAgICB9O1xuICAgICAgY29uc3QgY2xpZW50VGltZW91dEV2ZW50ID0gKGVycikgPT4ge1xuICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgIH07XG5cbiAgICAgIHNlbGYuY2xpZW50Lm9uY2UoJ2Nsb3NlJywgY2xpZW50Q2xvc2VFdmVudCk7XG4gICAgICBzZWxmLmNsaWVudC5vbmNlKCdlcnJvcicsIGNsaWVudEVycm9yRXZlbnQpO1xuICAgICAgc2VsZi5jbGllbnQub25jZSgndGltZW91dCcsIGNsaWVudFRpbWVvdXRFdmVudCk7XG5cbiAgICAgIHNlbGYuY2xpZW50LnNpdGUoJ0NITU9EICcgKyBwZXJtaXNzaW9ucyArICcgJyArIHJlbW90ZVBhdGgsIChlcnIsIHJlc3BvbnNlVGV4dCwgcmVzcG9uc2VDb2RlKSA9PiB7XG4gICAgICAgIHNlbGYuY2xpZW50LnJlbW92ZUxpc3RlbmVyKCdjbG9zZScsIGNsaWVudENsb3NlRXZlbnQpO1xuICAgICAgICBzZWxmLmNsaWVudC5yZW1vdmVMaXN0ZW5lcignZXJyb3InLCBjbGllbnRFcnJvckV2ZW50KTtcbiAgICAgICAgc2VsZi5jbGllbnQucmVtb3ZlTGlzdGVuZXIoJ3RpbWVvdXQnLCBjbGllbnRUaW1lb3V0RXZlbnQpO1xuXG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXNvbHZlKHJlc3BvbnNlVGV4dCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHByb21pc2U7XG4gIH1cblxuICBwdXQocXVldWVJdGVtKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gICAgc2VsZi5lbWl0KCdkZWJ1ZycsICdmdHA6cHV0JywgcmVtb3RlUGF0aCk7XG5cbiAgICBsZXQgcmVtb3RlUGF0aCA9IHF1ZXVlSXRlbS5pbmZvLnJlbW90ZVBhdGg7XG4gICAgbGV0IGxvY2FsUGF0aCA9IHF1ZXVlSXRlbS5pbmZvLmxvY2FsUGF0aDtcblxuICAgIGxldCBwcm9taXNlID0gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgbGV0IHN0ciA9IHByb2dyZXNzKHsgdGltZTogMTAwIH0pO1xuICAgICAgbGV0IGlucHV0ID0gRmlsZVN5c3RlbS5jcmVhdGVSZWFkU3RyZWFtKGxvY2FsUGF0aCk7XG4gICAgICBpbnB1dC5wYXVzZSgpO1xuXG4gICAgICAvLyBEZWNsYXJlIGV2ZW50cyAgXG4gICAgICBjb25zdCBwcm9ncmVzc0V2ZW50ID0gKHByb2dyZXNzKSA9PiB7XG4gICAgICAgIHF1ZXVlSXRlbS5jaGFuZ2VQcm9ncmVzcyhwcm9ncmVzcy50cmFuc2ZlcnJlZCk7XG4gICAgICAgIHNlbGYuZW1pdCgnZGF0YScsIHByb2dyZXNzLnRyYW5zZmVycmVkKTtcbiAgICAgIH07XG4gICAgICBjb25zdCBjbGllbnRDbG9zZUV2ZW50ID0gKGhhZEVycm9yKSA9PiB7XG4gICAgICAgIGlmIChoYWRFcnJvcikge1xuICAgICAgICAgIHF1ZXVlSXRlbS5jaGFuZ2VTdGF0dXMoJ0Vycm9yJyk7XG4gICAgICAgICAgcmVqZWN0KEVycm9yKCdmdHAgY2xvc2VkIGNvbm5lY3Rpb24nKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmVzb2x2ZShsb2NhbFBhdGgudHJpbSgpKTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgIGNvbnN0IGNsaWVudEVycm9yRXZlbnQgPSAoZXJyKSA9PiB7XG4gICAgICAgIHF1ZXVlSXRlbS5jaGFuZ2VTdGF0dXMoJ0Vycm9yJyk7XG4gICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgfTtcbiAgICAgIGNvbnN0IGNsaWVudFRpbWVvdXRFdmVudCA9IChlcnIpID0+IHtcbiAgICAgICAgcXVldWVJdGVtLmNoYW5nZVN0YXR1cygnRXJyb3InKTtcbiAgICAgICAgcmVqZWN0KGVycik7XG4gICAgICB9O1xuXG4gICAgICAvLyBBZGQgZXZlbnQgbGlzdGVuZXJcbiAgICAgIHN0ci5vbigncHJvZ3Jlc3MnLCBwcm9ncmVzc0V2ZW50KTtcbiAgICAgIHNlbGYuY2xpZW50Lm9uY2UoJ2Nsb3NlJywgY2xpZW50Q2xvc2VFdmVudCk7XG4gICAgICBzZWxmLmNsaWVudC5vbmNlKCdlcnJvcicsIGNsaWVudEVycm9yRXZlbnQpO1xuICAgICAgc2VsZi5jbGllbnQub25jZSgndGltZW91dCcsIGNsaWVudFRpbWVvdXRFdmVudCk7XG5cbiAgICAgIGlucHV0Lm9uKCdvcGVuJywgKCkgPT4ge1xuICAgICAgICBxdWV1ZUl0ZW0uY2hhbmdlU3RhdHVzKCdUcmFuc2ZlcnJpbmcnKTtcbiAgICAgIH0pO1xuICAgICAgLy8gaW5wdXQub25jZSgnZW5kJywgKCkgPT4ge1xuICAgICAgLy8gICBxdWV1ZUl0ZW0uY2hhbmdlUHJvZ3Jlc3MocXVldWVJdGVtLmluZm8uc2l6ZSk7XG4gICAgICAvLyAgIHJlc29sdmUobG9jYWxQYXRoLnRyaW0oKSk7XG4gICAgICAvLyB9KTtcbiAgICAgIC8vIGlucHV0Lm9uY2UoJ2ZpbmlzaCcsICgpID0+IHtcbiAgICAgIC8vICAgcXVldWVJdGVtLmNoYW5nZVByb2dyZXNzKHF1ZXVlSXRlbS5pbmZvLnNpemUpO1xuICAgICAgLy8gICByZXNvbHZlKGxvY2FsUGF0aC50cmltKCkpO1xuICAgICAgLy8gfSk7XG4gICAgICBpbnB1dC5vbmNlKCdlcnJvcicsIChlcnIpID0+IHtcbiAgICAgICAgLy8gUmVtb3ZlIGV2ZW50IGxpc3RlbmVyXG4gICAgICAgIHN0ci5yZW1vdmVMaXN0ZW5lcigncHJvZ3Jlc3MnLCBwcm9ncmVzc0V2ZW50KTtcbiAgICAgICAgc2VsZi5jbGllbnQucmVtb3ZlTGlzdGVuZXIoJ2Nsb3NlJywgY2xpZW50Q2xvc2VFdmVudCk7XG4gICAgICAgIHNlbGYuY2xpZW50LnJlbW92ZUxpc3RlbmVyKCdlcnJvcicsIGNsaWVudEVycm9yRXZlbnQpO1xuICAgICAgICBzZWxmLmNsaWVudC5yZW1vdmVMaXN0ZW5lcigndGltZW91dCcsIGNsaWVudFRpbWVvdXRFdmVudCk7XG5cbiAgICAgICAgcXVldWVJdGVtLmNoYW5nZVN0YXR1cygnRXJyb3InKTtcbiAgICAgICAgcmVqZWN0KGVycik7XG4gICAgICB9KTtcblxuICAgICAgc2VsZi5jbGllbnQucHV0KGlucHV0LnBpcGUoc3RyKSwgcmVtb3RlUGF0aCwgZmFsc2UsIChlcnIpID0+IHtcbiAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgIC8vIFJlbW92ZSBldmVudCBsaXN0ZW5lclxuICAgICAgICAgIHN0ci5yZW1vdmVMaXN0ZW5lcigncHJvZ3Jlc3MnLCBwcm9ncmVzc0V2ZW50KTtcbiAgICAgICAgICBzZWxmLmNsaWVudC5yZW1vdmVMaXN0ZW5lcignY2xvc2UnLCBjbGllbnRDbG9zZUV2ZW50KTtcbiAgICAgICAgICBzZWxmLmNsaWVudC5yZW1vdmVMaXN0ZW5lcignZXJyb3InLCBjbGllbnRFcnJvckV2ZW50KTtcbiAgICAgICAgICBzZWxmLmNsaWVudC5yZW1vdmVMaXN0ZW5lcigndGltZW91dCcsIGNsaWVudFRpbWVvdXRFdmVudCk7XG5cbiAgICAgICAgICBxdWV1ZUl0ZW0uY2hhbmdlU3RhdHVzKCdFcnJvcicpO1xuICAgICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIFJlbW92ZSBldmVudCBsaXN0ZW5lclxuICAgICAgICAgIHN0ci5yZW1vdmVMaXN0ZW5lcigncHJvZ3Jlc3MnLCBwcm9ncmVzc0V2ZW50KTtcbiAgICAgICAgICBzZWxmLmNsaWVudC5yZW1vdmVMaXN0ZW5lcignY2xvc2UnLCBjbGllbnRDbG9zZUV2ZW50KTtcbiAgICAgICAgICBzZWxmLmNsaWVudC5yZW1vdmVMaXN0ZW5lcignZXJyb3InLCBjbGllbnRFcnJvckV2ZW50KTtcbiAgICAgICAgICBzZWxmLmNsaWVudC5yZW1vdmVMaXN0ZW5lcigndGltZW91dCcsIGNsaWVudFRpbWVvdXRFdmVudCk7XG5cbiAgICAgICAgICBxdWV1ZUl0ZW0uY2hhbmdlUHJvZ3Jlc3MocXVldWVJdGVtLmluZm8uc2l6ZSk7XG4gICAgICAgICAgcmVzb2x2ZShyZW1vdGVQYXRoLnRyaW0oKSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHByb21pc2U7XG4gIH1cblxuICBnZXQocXVldWVJdGVtKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gICAgc2VsZi5lbWl0KCdkZWJ1ZycsICdmdHA6Z2V0JywgcmVtb3RlUGF0aCwgbG9jYWxQYXRoKTtcblxuICAgIGxldCByZW1vdGVQYXRoID0gcXVldWVJdGVtLmluZm8ucmVtb3RlUGF0aDtcbiAgICBsZXQgbG9jYWxQYXRoID0gcXVldWVJdGVtLmluZm8ubG9jYWxQYXRoO1xuXG4gICAgbGV0IHByb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBsZXQgc3RyID0gcHJvZ3Jlc3MoeyB0aW1lOiAxMDAgfSk7XG5cbiAgICAgIC8vIERlY2xhcmUgZXZlbnRzICBcbiAgICAgIGNvbnN0IHByb2dyZXNzRXZlbnQgPSAocHJvZ3Jlc3MpID0+IHtcbiAgICAgICAgcXVldWVJdGVtLmNoYW5nZVByb2dyZXNzKHByb2dyZXNzLnRyYW5zZmVycmVkKTtcbiAgICAgICAgc2VsZi5lbWl0KCdkYXRhJywgcHJvZ3Jlc3MudHJhbnNmZXJyZWQpO1xuICAgICAgfTtcbiAgICAgIGNvbnN0IGNsaWVudENsb3NlRXZlbnQgPSAoaGFkRXJyb3IpID0+IHtcbiAgICAgICAgaWYgKGhhZEVycm9yKSB7XG4gICAgICAgICAgcXVldWVJdGVtLmNoYW5nZVN0YXR1cygnRXJyb3InKTtcbiAgICAgICAgICByZWplY3QoRXJyb3IoJ2Z0cCBjbG9zZWQgY29ubmVjdGlvbicpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXNvbHZlKGxvY2FsUGF0aC50cmltKCkpO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgY29uc3QgY2xpZW50RXJyb3JFdmVudCA9IChlcnIpID0+IHtcbiAgICAgICAgcXVldWVJdGVtLmNoYW5nZVN0YXR1cygnRXJyb3InKTtcbiAgICAgICAgcmVqZWN0KGVycik7XG4gICAgICB9O1xuICAgICAgY29uc3QgY2xpZW50VGltZW91dEV2ZW50ID0gKGVycikgPT4ge1xuICAgICAgICBxdWV1ZUl0ZW0uY2hhbmdlU3RhdHVzKCdFcnJvcicpO1xuICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgIH07XG5cbiAgICAgIC8vIEFkZCBldmVudCBsaXN0ZW5lclxuICAgICAgc3RyLm9uKCdwcm9ncmVzcycsIHByb2dyZXNzRXZlbnQpO1xuICAgICAgc2VsZi5jbGllbnQub25jZSgnY2xvc2UnLCBjbGllbnRDbG9zZUV2ZW50KTtcbiAgICAgIHNlbGYuY2xpZW50Lm9uY2UoJ2Vycm9yJywgY2xpZW50RXJyb3JFdmVudCk7XG4gICAgICBzZWxmLmNsaWVudC5vbmNlKCd0aW1lb3V0JywgY2xpZW50VGltZW91dEV2ZW50KTtcblxuICAgICAgc2VsZi5jbGllbnQuZ2V0KHJlbW90ZVBhdGgsIChlcnIsIHN0cmVhbSkgPT4ge1xuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgLy8gUmVtb3ZlIGV2ZW50IGxpc3RlbmVyXG4gICAgICAgICAgc3RyLnJlbW92ZUxpc3RlbmVyKCdwcm9ncmVzcycsIHByb2dyZXNzRXZlbnQpO1xuICAgICAgICAgIHNlbGYuY2xpZW50LnJlbW92ZUxpc3RlbmVyKCdjbG9zZScsIGNsaWVudENsb3NlRXZlbnQpO1xuICAgICAgICAgIHNlbGYuY2xpZW50LnJlbW92ZUxpc3RlbmVyKCdlcnJvcicsIGNsaWVudEVycm9yRXZlbnQpO1xuICAgICAgICAgIHNlbGYuY2xpZW50LnJlbW92ZUxpc3RlbmVyKCd0aW1lb3V0JywgY2xpZW50VGltZW91dEV2ZW50KTtcblxuICAgICAgICAgIHF1ZXVlSXRlbS5jaGFuZ2VTdGF0dXMoJ0Vycm9yJyk7XG4gICAgICAgICAgcmVqZWN0KGVycik7XG4gICAgICAgIH0gZWxzZSBpZiAoc3RyZWFtKSB7XG4gICAgICAgICAgbGV0IGZpbGUgPSBGaWxlU3lzdGVtLmNyZWF0ZVdyaXRlU3RyZWFtKGxvY2FsUGF0aCwgeyBhdXRvQ2xvc2U6IHRydWUgfSk7XG5cbiAgICAgICAgICBmaWxlLm9uY2UoJ29wZW4nLCAoKSA9PiB7XG4gICAgICAgICAgICBxdWV1ZUl0ZW0uYWRkU3RyZWFtKGZpbGUpO1xuICAgICAgICAgICAgcXVldWVJdGVtLmNoYW5nZVN0YXR1cygnVHJhbnNmZXJyaW5nJyk7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgZmlsZS5vbmNlKCdlcnJvcicsIChlcnIpID0+IHtcbiAgICAgICAgICAgIC8vIFJlbW92ZSBldmVudCBsaXN0ZW5lclxuICAgICAgICAgICAgc3RyLnJlbW92ZUxpc3RlbmVyKCdwcm9ncmVzcycsIHByb2dyZXNzRXZlbnQpO1xuICAgICAgICAgICAgc2VsZi5jbGllbnQucmVtb3ZlTGlzdGVuZXIoJ2Nsb3NlJywgY2xpZW50Q2xvc2VFdmVudCk7XG4gICAgICAgICAgICBzZWxmLmNsaWVudC5yZW1vdmVMaXN0ZW5lcignZXJyb3InLCBjbGllbnRFcnJvckV2ZW50KTtcbiAgICAgICAgICAgIHNlbGYuY2xpZW50LnJlbW92ZUxpc3RlbmVyKCd0aW1lb3V0JywgY2xpZW50VGltZW91dEV2ZW50KTtcblxuICAgICAgICAgICAgcXVldWVJdGVtLmNoYW5nZVN0YXR1cygnRXJyb3InKTtcbiAgICAgICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgc3RyZWFtLm9uY2UoJ2VuZCcsICgpID0+IHtcbiAgICAgICAgICAgIC8vIFJlbW92ZSBldmVudCBsaXN0ZW5lclxuICAgICAgICAgICAgc3RyLnJlbW92ZUxpc3RlbmVyKCdwcm9ncmVzcycsIHByb2dyZXNzRXZlbnQpO1xuICAgICAgICAgICAgc2VsZi5jbGllbnQucmVtb3ZlTGlzdGVuZXIoJ2Nsb3NlJywgY2xpZW50Q2xvc2VFdmVudCk7XG4gICAgICAgICAgICBzZWxmLmNsaWVudC5yZW1vdmVMaXN0ZW5lcignZXJyb3InLCBjbGllbnRFcnJvckV2ZW50KTtcbiAgICAgICAgICAgIHNlbGYuY2xpZW50LnJlbW92ZUxpc3RlbmVyKCd0aW1lb3V0JywgY2xpZW50VGltZW91dEV2ZW50KTtcblxuICAgICAgICAgICAgcXVldWVJdGVtLmNoYW5nZVByb2dyZXNzKHF1ZXVlSXRlbS5pbmZvLnNpemUpO1xuICAgICAgICAgICAgcmVzb2x2ZShsb2NhbFBhdGgudHJpbSgpKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBzdHJlYW0ub25jZSgnZmluaXNoJywgKCkgPT4ge1xuICAgICAgICAgICAgLy8gUmVtb3ZlIGV2ZW50IGxpc3RlbmVyXG4gICAgICAgICAgICBzdHIucmVtb3ZlTGlzdGVuZXIoJ3Byb2dyZXNzJywgcHJvZ3Jlc3NFdmVudCk7XG4gICAgICAgICAgICBzZWxmLmNsaWVudC5yZW1vdmVMaXN0ZW5lcignY2xvc2UnLCBjbGllbnRDbG9zZUV2ZW50KTtcbiAgICAgICAgICAgIHNlbGYuY2xpZW50LnJlbW92ZUxpc3RlbmVyKCdlcnJvcicsIGNsaWVudEVycm9yRXZlbnQpO1xuICAgICAgICAgICAgc2VsZi5jbGllbnQucmVtb3ZlTGlzdGVuZXIoJ3RpbWVvdXQnLCBjbGllbnRUaW1lb3V0RXZlbnQpO1xuXG4gICAgICAgICAgICBxdWV1ZUl0ZW0uY2hhbmdlUHJvZ3Jlc3MocXVldWVJdGVtLmluZm8uc2l6ZSk7XG4gICAgICAgICAgICByZXNvbHZlKGxvY2FsUGF0aC50cmltKCkpO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIHN0cmVhbS5vbmNlKCdlcnJvcicsIChlcnIpID0+IHtcbiAgICAgICAgICAgIC8vIFJlbW92ZSBldmVudCBsaXN0ZW5lclxuICAgICAgICAgICAgc3RyLnJlbW92ZUxpc3RlbmVyKCdwcm9ncmVzcycsIHByb2dyZXNzRXZlbnQpO1xuICAgICAgICAgICAgc2VsZi5jbGllbnQucmVtb3ZlTGlzdGVuZXIoJ2Nsb3NlJywgY2xpZW50Q2xvc2VFdmVudCk7XG4gICAgICAgICAgICBzZWxmLmNsaWVudC5yZW1vdmVMaXN0ZW5lcignZXJyb3InLCBjbGllbnRFcnJvckV2ZW50KTtcbiAgICAgICAgICAgIHNlbGYuY2xpZW50LnJlbW92ZUxpc3RlbmVyKCd0aW1lb3V0JywgY2xpZW50VGltZW91dEV2ZW50KTtcblxuICAgICAgICAgICAgcXVldWVJdGVtLmNoYW5nZVN0YXR1cygnRXJyb3InKTtcbiAgICAgICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgc3RyZWFtLnBhdXNlKCk7XG4gICAgICAgICAgc3RyZWFtLnBpcGUoc3RyKS5waXBlKGZpbGUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIFJlbW92ZSBldmVudCBsaXN0ZW5lclxuICAgICAgICAgIHN0ci5yZW1vdmVMaXN0ZW5lcigncHJvZ3Jlc3MnLCBwcm9ncmVzc0V2ZW50KTtcbiAgICAgICAgICBzZWxmLmNsaWVudC5yZW1vdmVMaXN0ZW5lcignY2xvc2UnLCBjbGllbnRDbG9zZUV2ZW50KTtcbiAgICAgICAgICBzZWxmLmNsaWVudC5yZW1vdmVMaXN0ZW5lcignZXJyb3InLCBjbGllbnRFcnJvckV2ZW50KTtcbiAgICAgICAgICBzZWxmLmNsaWVudC5yZW1vdmVMaXN0ZW5lcigndGltZW91dCcsIGNsaWVudFRpbWVvdXRFdmVudCk7XG5cbiAgICAgICAgICBxdWV1ZUl0ZW0uY2hhbmdlU3RhdHVzKCdFcnJvcicpO1xuICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IoJ0ZpbGUgU3RyZWFtIGNsb3NlZCcpKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gcHJvbWlzZTtcbiAgfVxuXG4gIGRlbGV0ZShyZW1vdGVQYXRoKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gICAgc2VsZi5lbWl0KCdkZWJ1ZycsICdmdHA6ZGVsZXRlJywgcmVtb3RlUGF0aCk7XG5cbiAgICBsZXQgcHJvbWlzZSA9IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIC8vIEFkZCBldmVudCBsaXN0ZW5lclxuICAgICAgY29uc3QgY2xpZW50Q2xvc2VFdmVudCA9IChoYWRFcnJvcikgPT4ge1xuICAgICAgICByZWplY3QoRXJyb3IoJ2Z0cCBjbG9zZWQgY29ubmVjdGlvbicpKTtcbiAgICAgIH07XG4gICAgICBjb25zdCBjbGllbnRFcnJvckV2ZW50ID0gKGVycikgPT4ge1xuICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgIH07XG4gICAgICBjb25zdCBjbGllbnRUaW1lb3V0RXZlbnQgPSAoZXJyKSA9PiB7XG4gICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgfTtcblxuICAgICAgc2VsZi5jbGllbnQub25jZSgnY2xvc2UnLCBjbGllbnRDbG9zZUV2ZW50KTtcbiAgICAgIHNlbGYuY2xpZW50Lm9uY2UoJ2Vycm9yJywgY2xpZW50RXJyb3JFdmVudCk7XG4gICAgICBzZWxmLmNsaWVudC5vbmNlKCd0aW1lb3V0JywgY2xpZW50VGltZW91dEV2ZW50KTtcblxuICAgICAgc2VsZi5jbGllbnQuZGVsZXRlKHJlbW90ZVBhdGgsIChlcnIpID0+IHtcbiAgICAgICAgc2VsZi5jbGllbnQucmVtb3ZlTGlzdGVuZXIoJ2Nsb3NlJywgY2xpZW50Q2xvc2VFdmVudCk7XG4gICAgICAgIHNlbGYuY2xpZW50LnJlbW92ZUxpc3RlbmVyKCdlcnJvcicsIGNsaWVudEVycm9yRXZlbnQpO1xuICAgICAgICBzZWxmLmNsaWVudC5yZW1vdmVMaXN0ZW5lcigndGltZW91dCcsIGNsaWVudFRpbWVvdXRFdmVudCk7XG5cbiAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJlc29sdmUocmVtb3RlUGF0aC50cmltKCkpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIHJldHVybiBwcm9taXNlO1xuICB9XG5cbiAgcmVuYW1lKG9sZFJlbW90ZVBhdGgsIG5ld1JlbW90ZVBhdGgpIHtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcbiAgICBzZWxmLmVtaXQoJ2RlYnVnJywgJ2Z0cDpyZW5hbWUnLCBvbGRSZW1vdGVQYXRoLCBuZXdSZW1vdGVQYXRoKTtcblxuICAgIGxldCBwcm9taXNlID0gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgLy8gQWRkIGV2ZW50IGxpc3RlbmVyXG4gICAgICBjb25zdCBjbGllbnRDbG9zZUV2ZW50ID0gKGhhZEVycm9yKSA9PiB7XG4gICAgICAgIHJlamVjdChFcnJvcignZnRwIGNsb3NlZCBjb25uZWN0aW9uJykpO1xuICAgICAgfTtcbiAgICAgIGNvbnN0IGNsaWVudEVycm9yRXZlbnQgPSAoZXJyKSA9PiB7XG4gICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgfTtcbiAgICAgIGNvbnN0IGNsaWVudFRpbWVvdXRFdmVudCA9IChlcnIpID0+IHtcbiAgICAgICAgcmVqZWN0KGVycik7XG4gICAgICB9O1xuXG4gICAgICBzZWxmLmNsaWVudC5vbmNlKCdjbG9zZScsIGNsaWVudENsb3NlRXZlbnQpO1xuICAgICAgc2VsZi5jbGllbnQub25jZSgnZXJyb3InLCBjbGllbnRFcnJvckV2ZW50KTtcbiAgICAgIHNlbGYuY2xpZW50Lm9uY2UoJ3RpbWVvdXQnLCBjbGllbnRUaW1lb3V0RXZlbnQpO1xuXG4gICAgICBzZWxmLmNsaWVudC5yZW5hbWUob2xkUmVtb3RlUGF0aC50cmltKCksIG5ld1JlbW90ZVBhdGgudHJpbSgpLCAoZXJyKSA9PiB7XG4gICAgICAgIHNlbGYuY2xpZW50LnJlbW92ZUxpc3RlbmVyKCdjbG9zZScsIGNsaWVudENsb3NlRXZlbnQpO1xuICAgICAgICBzZWxmLmNsaWVudC5yZW1vdmVMaXN0ZW5lcignZXJyb3InLCBjbGllbnRFcnJvckV2ZW50KTtcbiAgICAgICAgc2VsZi5jbGllbnQucmVtb3ZlTGlzdGVuZXIoJ3RpbWVvdXQnLCBjbGllbnRUaW1lb3V0RXZlbnQpO1xuXG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXNvbHZlKG5ld1JlbW90ZVBhdGgudHJpbSgpKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gcHJvbWlzZTtcbiAgfVxuXG4gIGVuZCgpIHtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcbiAgICBzZWxmLmVtaXQoJ2RlYnVnJywgJ2Z0cDplbmQnKTtcblxuICAgIHNlbGYuY29ubmVjdGVkID0gZmFsc2U7XG4gICAgbGV0IHByb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBpZiAoIXNlbGYuY2xpZW50KSByZXR1cm4gcmVzb2x2ZSh0cnVlKTtcblxuICAgICAgLy8gRGVjbGFyZSBldmVudHMgIFxuICAgICAgY29uc3QgY2xpZW50RW5kRXZlbnQgPSAoKSA9PiB7XG4gICAgICAgIHNlbGYuZW1pdCgnZGVidWcnLCAnZnRwOmVuZCcpO1xuXG4gICAgICAgIC8vIFJlbW92ZSBldmVudCBsaXN0ZW5lclxuICAgICAgICBzZWxmLmNsaWVudC5yZW1vdmVMaXN0ZW5lcignZW5kJywgY2xpZW50RW5kRXZlbnQpO1xuICAgICAgICBzZWxmLmNsaWVudC5yZW1vdmVMaXN0ZW5lcignY2xvc2UnLCBjbGllbnRDbG9zZUV2ZW50KTtcblxuICAgICAgICBzZWxmLmNsaWVudC5yZW1vdmVMaXN0ZW5lcigncmVhZHknLCBzZWxmLmNsaWVudFJlYWR5RXZlbnQpO1xuICAgICAgICBzZWxmLmNsaWVudC5yZW1vdmVMaXN0ZW5lcignZXJyb3InLCBzZWxmLmNsaWVudEVycm9yRXZlbnQpO1xuICAgICAgICBzZWxmLmNsaWVudC5yZW1vdmVMaXN0ZW5lcignZW5kJywgc2VsZi5jbGllbnRFbmRFdmVudCk7XG4gICAgICAgIHNlbGYuY2xpZW50LnJlbW92ZUxpc3RlbmVyKCdjbG9zZScsIHNlbGYuY2xpZW50Q2xvc2VFdmVudCk7XG4gICAgICAgIHJlc29sdmUodHJ1ZSk7XG4gICAgICB9O1xuICAgICAgY29uc3QgY2xpZW50Q2xvc2VFdmVudCA9IChoYWRFcnJvcikgPT4ge1xuICAgICAgICBzZWxmLmVtaXQoJ2RlYnVnJywgJ2Z0cDplbmQnKTtcblxuICAgICAgICByZXNvbHZlKHRydWUpO1xuICAgICAgfTtcblxuICAgICAgLy8gQWRkIGV2ZW50IGxpc3RlbmVyXG4gICAgICBzZWxmLmNsaWVudC5vbignZW5kJywgY2xpZW50RW5kRXZlbnQpO1xuICAgICAgc2VsZi5jbGllbnQub24oJ2Nsb3NlJywgY2xpZW50Q2xvc2VFdmVudCk7XG5cbiAgICAgIHNlbGYuY2xpZW50LmVuZCgpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHByb21pc2U7XG4gIH1cblxuICBhYm9ydCgpIHtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcbiAgICBzZWxmLmVtaXQoJ2RlYnVnJywgJ2Z0cDphYm9ydCcpO1xuXG4gICAgbGV0IHByb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBpZiAoIXNlbGYuY2xpZW50KSByZXR1cm4gcmVzb2x2ZSh0cnVlKTtcblxuICAgICAgc2VsZi5jbGllbnQuYWJvcnQoKGVycikgPT4ge1xuICAgICAgICByZXNvbHZlKCk7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIHJldHVybiBwcm9taXNlO1xuICB9XG59XG4iXX0=