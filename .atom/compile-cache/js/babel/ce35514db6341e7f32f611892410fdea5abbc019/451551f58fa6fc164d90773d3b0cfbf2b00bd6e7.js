Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _helperSsh2SftpClient = require('./../helper/ssh2-sftp-client');

var _helperSsh2SftpClient2 = _interopRequireDefault(_helperSsh2SftpClient);

'use babel';

var FileSystem = require('fs-plus');
var EventEmitter = require('events');
var progress = require('progress-stream');

var Sftp = (function (_EventEmitter) {
  _inherits(Sftp, _EventEmitter);

  function Sftp() {
    _classCallCheck(this, Sftp);

    _get(Object.getPrototypeOf(Sftp.prototype), 'constructor', this).call(this);
    var self = this;

    self.connection = null;
    self.clientReadyEvent = null;
    self.clientErrorEvent = null;
    self.clientEndEvent = null;
    self.clientCloseEvent = null;
  }

  _createClass(Sftp, [{
    key: 'connect',
    value: function connect(connection) {
      var _this = this;

      var self = this;
      self.emit('debug', 'sftp:connect');

      self.connection = connection;
      self.client = new _helperSsh2SftpClient2['default']();

      // add remove listener support, because it's not implemented in lib
      self.client.removeListener = function (eventType, callback) {
        self.client.client.removeListener(eventType, callback);
      };

      self.clientReadyEvent = function () {
        self.emit('debug', 'sftp:connect:ready');
        _this.emit('connected');
      };
      self.client.on('ready', self.clientReadyEvent);

      self.clientErrorEvent = function (err) {
        self.emit('debug', 'sftp:connect:error');
        // self.emit('error', err);
      };
      self.client.on('error', self.clientErrorEvent);

      self.clientEndEvent = function () {
        self.emit('debug', 'sftp:connect:end');
        self.emit('ended', 'Connection end');
      };
      self.client.on('end', self.clientEndEvent);

      self.clientCloseEvent = function () {
        self.emit('debug', 'sftp:connect:close');
        self.emit('closed', 'Connection closed');
      };
      self.client.on('close', self.clientCloseEvent);

      var pw = true;
      if (connection.useAgent) {
        var agent = self.getSshAgent();
        if (agent) {
          connection.agent = agent;
          pw = false;
        } else {
          atom.notifications.addWarning('No SSH agent found.', {
            description: 'Falling back to keyfile or password based authentication.'
          });
        }
      }
      if (pw && connection.privatekeyfile && !connection.privateKey) {
        if (FileSystem.existsSync(connection.privatekeyfile)) {
          connection.privateKey = FileSystem.readFileSync(connection.privatekeyfile, 'utf8');
        } else {
          return new Promise(function (resolve, reject) {
            reject({ message: 'Private Keyfile not found...' });
          });
        }
      }
      if (pw && connection.privateKey && !connection.passphrase) {
        connection.passphrase = connection.password;
      }

      connection.debug = function (msg) {
        if (!msg.includes('DEBUG: Parser')) {
          self.emit('debug', msg.replace('DEBUG:', 'sftp:debug:'));
        }
      };

      return self.client.connect(connection).then(function () {
        return new Promise(function (resolve, reject) {
          resolve(self);
        });
      })['catch'](function (err) {
        return new Promise(function (resolve, reject) {
          reject(err);
        });
      });
    }
  }, {
    key: 'getSshAgent',
    value: function getSshAgent() {
      var sock = process.env['SSH_AUTH_SOCK'];
      if (sock) {
        return sock;
      } else {
        if (process.platform == 'win32') {
          return 'pageant';
        } else {
          return null;
        }
      }
    }
  }, {
    key: 'isConnected',
    value: function isConnected() {
      var self = this;

      if (!self.client) return false;
      if (!self.client.sftp) return false;
      if (!self.client.sftp._stream) return false;
      return self.client.sftp._stream.readable;
    }
  }, {
    key: 'list',
    value: function list(remotePath) {
      var self = this;
      self.emit('debug', 'sftp:list', remotePath);

      var timer = null;

      // issue-76 Cannot connect to servers after resuming from suspend
      // sftp server don't react after loosing Connection
      // Workaround: Wait 10 sec, reconnect and try again
      // if the reconnection fails, throw error

      // reconnect and try list again
      var promiseA = new Promise(function (resolve, reject) {
        timer = setTimeout(function () {
          return self.end().then(function () {
            return self.connect(self.connection).then(function () {
              return self.list(remotePath).then(function (list) {
                resolve(list);
              })['catch'](function (err) {
                reject(err);
              });
            })['catch'](function (err) {
              reject(err);
            });
          })['catch'](function (err) {
            reject(err);
          });
        }, 10000);
      });

      // list
      var promiseB = self.client.list(remotePath).then(function (list) {
        clearTimeout(timer);
        return new Promise(function (resolve, reject) {
          resolve(list);
        });
      })['catch'](function (err) {
        clearTimeout(timer);
        return new Promise(function (resolve, reject) {
          reject(err);
        });
      });

      return Promise.race([promiseA, promiseB]);
    }
  }, {
    key: 'mkdir',
    value: function mkdir(remotePath) {
      var self = this;
      self.emit('debug', 'sftp:mkdir', remotePath);

      return self.client.mkdir(remotePath).then(function () {
        return new Promise(function (resolve, reject) {
          resolve(remotePath.trim());
        });
      })['catch'](function (err) {
        return new Promise(function (resolve, reject) {
          reject(err);
        });
      });
    }
  }, {
    key: 'rmdir',
    value: function rmdir(remotePath, recursive) {
      var self = this;
      self.emit('debug', 'sftp:rmdir', remotePath);

      return self.client.rmdir(remotePath, recursive).then(function () {
        return new Promise(function (resolve, reject) {
          resolve(remotePath.trim());
        });
      })['catch'](function (err) {
        return new Promise(function (resolve, reject) {
          reject(err);
        });
      });
    }
  }, {
    key: 'chmod',
    value: function chmod(remotePath, permissions) {
      var self = this;
      self.emit('debug', 'sftp:chmod', remotePath);

      return self.client.chmod(remotePath, permissions);
    }
  }, {
    key: 'put',
    value: function put(queueItem) {
      var self = this;
      self.emit('debug', 'sftp:put', remotePath);

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
            reject(Error('sftp closed connection'));
          } else {
            resolve(localPath.trim());
          }
        };
        var clientErrorEvent = function clientErrorEvent(err) {
          queueItem.changeStatus('Error');
          reject(err);
        };

        // Add event listener
        str.on('progress', progressEvent);
        self.client.on('close', clientCloseEvent);
        self.client.on('error', clientErrorEvent);

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

          queueItem.changeStatus('Error');
          reject(err);
        });

        // check file exists and get permissions
        return self.client.stat(remotePath).then(function (info) {
          // file  exists
          var otherOptions = null;
          if (info.permissions) {
            info.permissions = info.permissions.toString(8).substr(-3);
            otherOptions = { mode: parseInt('0' + info.permissions, 8) };
          } else {
            otherOptions = { mode: 420 };
          }

          return self.client.put(input.pipe(str), remotePath, null, null, otherOptions).then(function () {
            // Remove event listener
            str.removeListener('progress', progressEvent);
            self.client.removeListener('close', clientCloseEvent);
            self.client.removeListener('error', clientErrorEvent);

            queueItem.changeProgress(queueItem.info.size);
            resolve(localPath.trim());
          })['catch'](function (err) {
            // Remove event listener
            str.removeListener('progress', progressEvent);
            self.client.removeListener('close', clientCloseEvent);
            self.client.removeListener('error', clientErrorEvent);

            queueItem.changeStatus('Error');
            reject(err);
          });
        })['catch'](function (err) {
          // file doesn't exists
          return self.client.put(input.pipe(str), remotePath, null, null, { mode: 420 }).then(function () {
            // Remove event listener
            str.removeListener('progress', progressEvent);
            self.client.removeListener('close', clientCloseEvent);
            self.client.removeListener('error', clientErrorEvent);

            queueItem.changeProgress(queueItem.info.size);
            resolve(localPath.trim());
          })['catch'](function (err) {
            // Remove event listener
            str.removeListener('progress', progressEvent);
            self.client.removeListener('close', clientCloseEvent);
            self.client.removeListener('error', clientErrorEvent);

            queueItem.changeStatus('Error');
            reject(err);
          });
        });
      });

      return promise;
    }
  }, {
    key: 'get',
    value: function get(queueItem) {
      var self = this;
      self.emit('debug', 'sftp:get', remotePath, localPath);

      var remotePath = queueItem.info.remotePath;
      var localPath = queueItem.info.localPath;

      var promise = new Promise(function (resolve, reject) {
        var str = progress({ time: 100 });

        // Declare events 
        var progressEvent = function progressEvent(progress) {
          self.emit('debug', 'sftp:get:client.get:progress');
          queueItem.changeProgress(progress.transferred);
          self.emit('data', progress.transferred);
        };
        var clientCloseEvent = function clientCloseEvent(hadError) {
          if (hadError) {
            queueItem.changeStatus('Error');
            reject(Error('sftp closed connection'));
          } else {
            resolve(localPath.trim());
          }
        };
        var clientErrorEvent = function clientErrorEvent(err) {
          queueItem.changeStatus('Error');
          reject(err);
        };

        // Add event listener
        str.on('progress', progressEvent);
        self.client.on('close', clientCloseEvent);
        self.client.on('error', clientErrorEvent);

        return self.client.get(remotePath, null, null).then(function (stream) {
          stream.pause();

          stream.on('readable', function () {
            self.emit('debug', 'sftp:get:stream.readable');
          });

          self.emit('debug', 'sftp:get:client.get:success');
          var file = FileSystem.createWriteStream(localPath, { autoClose: true });

          file.on('open', function (err) {
            self.emit('debug', 'sftp:get:file.open');
            queueItem.addStream(file);
            queueItem.changeStatus('Transferring');
          });
          file.on('error', function (err) {
            self.emit('debug', 'sftp:get:file.error');
            // Remove event listener
            str.removeListener('progress', progressEvent);
            self.client.removeListener('close', clientCloseEvent);
            self.client.removeListener('error', clientErrorEvent);

            queueItem.changeStatus('Error');
            reject(err);
          });
          file.once('finish', function () {
            self.emit('debug', 'sftp:get:file.finish');
            // Remove event listener
            str.removeListener('progress', progressEvent);
            self.client.removeListener('close', clientCloseEvent);
            self.client.removeListener('error', clientErrorEvent);

            queueItem.changeProgress(queueItem.info.size);
            resolve(localPath.trim());
          });

          stream.once('end', function () {
            self.emit('debug', 'sftp:get:stream.end');
            // Remove event listener
            str.removeListener('progress', progressEvent);
            self.client.removeListener('close', clientCloseEvent);
            self.client.removeListener('error', clientErrorEvent);

            queueItem.changeProgress(queueItem.info.size);
            resolve(localPath.trim());
          });
          stream.once('finish', function () {
            self.emit('debug', 'sftp:get:stream.finish');
            // Remove event listener
            str.removeListener('progress', progressEvent);
            self.client.removeListener('close', clientCloseEvent);
            self.client.removeListener('error', clientErrorEvent);

            queueItem.changeProgress(queueItem.info.size);
            resolve(localPath.trim());
          });
          stream.once('error', function (err) {
            self.emit('debug', 'sftp:get:stream.error');
            // Remove event listener
            str.removeListener('progress', progressEvent);
            self.client.removeListener('close', clientCloseEvent);
            self.client.removeListener('error', clientErrorEvent);

            queueItem.changeStatus('Error');
            reject(err);
          });

          self.emit('debug', 'sftp:get:stream.pipe');
          stream.pipe(str).pipe(file);
        })['catch'](function (err) {
          self.emit('debug', 'sftp:get:client.get:error');
          // Remove event listener
          str.removeListener('progress', progressEvent);
          self.client.removeListener('close', clientCloseEvent);
          self.client.removeListener('error', clientErrorEvent);

          queueItem.changeStatus('Error');
          reject(err);
        });
      });

      return promise;
    }
  }, {
    key: 'delete',
    value: function _delete(remotePath) {
      var self = this;
      self.emit('debug', 'sftp:delete', remotePath);

      return self.client['delete'](remotePath);
    }
  }, {
    key: 'rename',
    value: function rename(oldRemotePath, newRemotePath) {
      var self = this;
      self.emit('debug', 'sftp:rename', oldRemotePath, newRemotePath);

      return self.client.rename(oldRemotePath, newRemotePath);
    }
  }, {
    key: 'end',
    value: function end() {
      var self = this;
      self.emit('debug', 'sftp:end');

      // Remove event listener
      self.client.removeListener('ready', self.clientReadyEvent);
      self.client.removeListener('error', self.clientErrorEvent);
      self.client.removeListener('end', self.clientEndEvent);
      self.client.removeListener('close', self.clientCloseEvent);

      return self.client.end();
    }
  }, {
    key: 'abort',
    value: function abort() {
      var self = this;
      self.emit('debug', 'sftp:abort');

      return self.end().then(function () {
        return self.connect(self.connection);
      });
    }
  }]);

  return Sftp;
})(EventEmitter);

exports['default'] = Sftp;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2FuYW5tYXlqYWluLy5hdG9tL3BhY2thZ2VzL2Z0cC1yZW1vdGUtZWRpdC9saWIvY29ubmVjdG9ycy9zZnRwLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O29DQUV1Qiw4QkFBOEI7Ozs7QUFGckQsV0FBVyxDQUFDOztBQUlaLElBQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUN0QyxJQUFNLFlBQVksR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDdkMsSUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLGlCQUFpQixDQUFDLENBQUM7O0lBRXZCLElBQUk7WUFBSixJQUFJOztBQUVaLFdBRlEsSUFBSSxHQUVUOzBCQUZLLElBQUk7O0FBR3JCLCtCQUhpQixJQUFJLDZDQUdiO0FBQ1IsUUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDOztBQUVsQixRQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQztBQUN2QixRQUFJLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDO0FBQzdCLFFBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUM7QUFDN0IsUUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUM7QUFDM0IsUUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksQ0FBQztHQUM5Qjs7ZUFYa0IsSUFBSTs7V0FhaEIsaUJBQUMsVUFBVSxFQUFFOzs7QUFDbEIsVUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDO0FBQ2xCLFVBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLGNBQWMsQ0FBQyxDQUFDOztBQUVuQyxVQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQztBQUM3QixVQUFJLENBQUMsTUFBTSxHQUFHLHVDQUFnQixDQUFDOzs7QUFHL0IsVUFBSSxDQUFDLE1BQU0sQ0FBQyxjQUFjLEdBQUcsVUFBVSxTQUFTLEVBQUUsUUFBUSxFQUFFO0FBQzFELFlBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxD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Y0FBYyxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQzs7QUFFM0QsYUFBTyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDO0tBQzFCOzs7V0FFSSxpQkFBRztBQUNOLFVBQU0sSUFBSSxHQUFHLElBQUksQ0FBQztBQUNsQixVQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxZQUFZLENBQUMsQ0FBQzs7QUFFakMsYUFBTyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLFlBQU07QUFDM0IsZUFBTyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQTtPQUNyQyxDQUFDLENBQUM7S0FDSjs7O1NBN2NrQixJQUFJO0dBQVMsWUFBWTs7cUJBQXpCLElBQUkiLCJmaWxlIjoiL2hvbWUvYW5hbm1heWphaW4vLmF0b20vcGFja2FnZXMvZnRwLXJlbW90ZS1lZGl0L2xpYi9jb25uZWN0b3JzL3NmdHAuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcblxuaW1wb3J0IHNmdHBDbGllbnQgZnJvbSAnLi8uLi9oZWxwZXIvc3NoMi1zZnRwLWNsaWVudCc7XG5cbmNvbnN0IEZpbGVTeXN0ZW0gPSByZXF1aXJlKCdmcy1wbHVzJyk7XG5jb25zdCBFdmVudEVtaXR0ZXIgPSByZXF1aXJlKCdldmVudHMnKTtcbmNvbnN0IHByb2dyZXNzID0gcmVxdWlyZSgncHJvZ3Jlc3Mtc3RyZWFtJyk7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNmdHAgZXh0ZW5kcyBFdmVudEVtaXR0ZXIge1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKCk7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG5cbiAgICBzZWxmLmNvbm5lY3Rpb24gPSBudWxsO1xuICAgIHNlbGYuY2xpZW50UmVhZHlFdmVudCA9IG51bGw7XG4gICAgc2VsZi5jbGllbnRFcnJvckV2ZW50ID0gbnVsbDtcbiAgICBzZWxmLmNsaWVudEVuZEV2ZW50ID0gbnVsbDtcbiAgICBzZWxmLmNsaWVudENsb3NlRXZlbnQgPSBudWxsO1xuICB9XG5cbiAgY29ubmVjdChjb25uZWN0aW9uKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gICAgc2VsZi5lbWl0KCdkZWJ1ZycsICdzZnRwOmNvbm5lY3QnKTtcblxuICAgIHNlbGYuY29ubmVjdGlvbiA9IGNvbm5lY3Rpb247XG4gICAgc2VsZi5jbGllbnQgPSBuZXcgc2Z0cENsaWVudCgpO1xuXG4gICAgLy8gYWRkIHJlbW92ZSBsaXN0ZW5lciBzdXBwb3J0LCBiZWNhdXNlIGl0J3Mgbm90IGltcGxlbWVudGVkIGluIGxpYlxuICAgIHNlbGYuY2xpZW50LnJlbW92ZUxpc3RlbmVyID0gZnVuY3Rpb24gKGV2ZW50VHlwZSwgY2FsbGJhY2spIHtcbiAgICAgIHNlbGYuY2xpZW50LmNsaWVudC5yZW1vdmVMaXN0ZW5lcihldmVudFR5cGUsIGNhbGxiYWNrKTtcbiAgICB9O1xuXG4gICAgc2VsZi5jbGllbnRSZWFkeUV2ZW50ID0gKCkgPT4ge1xuICAgICAgc2VsZi5lbWl0KCdkZWJ1ZycsICdzZnRwOmNvbm5lY3Q6cmVhZHknKTtcbiAgICAgIHRoaXMuZW1pdCgnY29ubmVjdGVkJyk7XG4gICAgfTtcbiAgICBzZWxmLmNsaWVudC5vbigncmVhZHknLCBzZWxmLmNsaWVudFJlYWR5RXZlbnQpO1xuXG4gICAgc2VsZi5jbGllbnRFcnJvckV2ZW50ID0gKGVycikgPT4ge1xuICAgICAgc2VsZi5lbWl0KCdkZWJ1ZycsICdzZnRwOmNvbm5lY3Q6ZXJyb3InKTtcbiAgICAgIC8vIHNlbGYuZW1pdCgnZXJyb3InLCBlcnIpO1xuICAgIH07XG4gICAgc2VsZi5jbGllbnQub24oJ2Vycm9yJywgc2VsZi5jbGllbnRFcnJvckV2ZW50KTtcblxuICAgIHNlbGYuY2xpZW50RW5kRXZlbnQgPSAoKSA9PiB7XG4gICAgICBzZWxmLmVtaXQoJ2RlYnVnJywgJ3NmdHA6Y29ubmVjdDplbmQnKTtcbiAgICAgIHNlbGYuZW1pdCgnZW5kZWQnLCAnQ29ubmVjdGlvbiBlbmQnKTtcbiAgICB9O1xuICAgIHNlbGYuY2xpZW50Lm9uKCdlbmQnLCBzZWxmLmNsaWVudEVuZEV2ZW50KTtcblxuICAgIHNlbGYuY2xpZW50Q2xvc2VFdmVudCA9ICgpID0+IHtcbiAgICAgIHNlbGYuZW1pdCgnZGVidWcnLCAnc2Z0cDpjb25uZWN0OmNsb3NlJyk7XG4gICAgICBzZWxmLmVtaXQoJ2Nsb3NlZCcsICdDb25uZWN0aW9uIGNsb3NlZCcpO1xuICAgIH07XG4gICAgc2VsZi5jbGllbnQub24oJ2Nsb3NlJywgc2VsZi5jbGllbnRDbG9zZUV2ZW50KTtcblxuICAgIGxldCBwdyA9IHRydWU7XG4gICAgaWYgKGNvbm5lY3Rpb24udXNlQWdlbnQpIHtcbiAgICAgIGxldCBhZ2VudCA9IHNlbGYuZ2V0U3NoQWdlbnQoKTtcbiAgICAgIGlmIChhZ2VudCkge1xuICAgICAgICBjb25uZWN0aW9uLmFnZW50ID0gYWdlbnQ7XG4gICAgICAgIHB3ID0gZmFsc2U7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkV2FybmluZygnTm8gU1NIIGFnZW50IGZvdW5kLicsIHtcbiAgICAgICAgICBkZXNjcmlwdGlvbjogJ0ZhbGxpbmcgYmFjayB0byBrZXlmaWxlIG9yIHBhc3N3b3JkIGJhc2VkIGF1dGhlbnRpY2F0aW9uLidcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChwdyAmJiBjb25uZWN0aW9uLnByaXZhdGVrZXlmaWxlICYmICFjb25uZWN0aW9uLnByaXZhdGVLZXkpIHtcbiAgICAgIGlmIChGaWxlU3lzdGVtLmV4aXN0c1N5bmMoY29ubmVjdGlvbi5wcml2YXRla2V5ZmlsZSkpIHtcbiAgICAgICAgY29ubmVjdGlvbi5wcml2YXRlS2V5ID0gRmlsZVN5c3RlbS5yZWFkRmlsZVN5bmMoY29ubmVjdGlvbi5wcml2YXRla2V5ZmlsZSwgJ3V0ZjgnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgcmVqZWN0KHsgbWVzc2FnZTogJ1ByaXZhdGUgS2V5ZmlsZSBub3QgZm91bmQuLi4nIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHB3ICYmIGNvbm5lY3Rpb24ucHJpdmF0ZUtleSAmJiAhY29ubmVjdGlvbi5wYXNzcGhyYXNlKSB7XG4gICAgICBjb25uZWN0aW9uLnBhc3NwaHJhc2UgPSBjb25uZWN0aW9uLnBhc3N3b3JkO1xuICAgIH1cblxuICAgIGNvbm5lY3Rpb24uZGVidWcgPSAobXNnKSA9PiB7XG4gICAgICBpZiAoIW1zZy5pbmNsdWRlcygnREVCVUc6IFBhcnNlcicpKSB7XG4gICAgICAgIHNlbGYuZW1pdCgnZGVidWcnLCBtc2cucmVwbGFjZSgnREVCVUc6JywgJ3NmdHA6ZGVidWc6JykpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBzZWxmLmNsaWVudC5jb25uZWN0KGNvbm5lY3Rpb24pLnRoZW4oKCkgPT4ge1xuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgcmVzb2x2ZShzZWxmKTtcbiAgICAgIH0pO1xuICAgIH0pLmNhdGNoKChlcnIpID0+IHtcbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICBnZXRTc2hBZ2VudCgpIHtcbiAgICBsZXQgc29jayA9IHByb2Nlc3MuZW52WydTU0hfQVVUSF9TT0NLJ11cbiAgICBpZiAoc29jaykge1xuICAgICAgcmV0dXJuIHNvY2tcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHByb2Nlc3MucGxhdGZvcm0gPT0gJ3dpbjMyJykge1xuICAgICAgICByZXR1cm4gJ3BhZ2VhbnQnXG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gbnVsbFxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGlzQ29ubmVjdGVkKCkge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuXG4gICAgaWYgKCFzZWxmLmNsaWVudCkgcmV0dXJuIGZhbHNlO1xuICAgIGlmICghc2VsZi5jbGllbnQuc2Z0cCkgcmV0dXJuIGZhbHNlO1xuICAgIGlmICghc2VsZi5jbGllbnQuc2Z0cC5fc3RyZWFtKSByZXR1cm4gZmFsc2U7XG4gICAgcmV0dXJuIHNlbGYuY2xpZW50LnNmdHAuX3N0cmVhbS5yZWFkYWJsZTtcbiAgfVxuXG4gIGxpc3QocmVtb3RlUGF0aCkge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuICAgIHNlbGYuZW1pdCgnZGVidWcnLCAnc2Z0cDpsaXN0JywgcmVtb3RlUGF0aCk7XG5cbiAgICBsZXQgdGltZXIgPSBudWxsO1xuXG4gICAgLy8gaXNzdWUtNzYgQ2Fubm90IGNvbm5lY3QgdG8gc2VydmVycyBhZnRlciByZXN1bWluZyBmcm9tIHN1c3BlbmRcbiAgICAvLyBzZnRwIHNlcnZlciBkb24ndCByZWFjdCBhZnRlciBsb29zaW5nIENvbm5lY3Rpb25cbiAgICAvLyBXb3JrYXJvdW5kOiBXYWl0IDEwIHNlYywgcmVjb25uZWN0IGFuZCB0cnkgYWdhaW5cbiAgICAvLyBpZiB0aGUgcmVjb25uZWN0aW9uIGZhaWxzLCB0aHJvdyBlcnJvclxuXG4gICAgLy8gcmVjb25uZWN0IGFuZCB0cnkgbGlzdCBhZ2FpblxuICAgIGxldCBwcm9taXNlQSA9IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIHRpbWVyID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHJldHVybiBzZWxmLmVuZCgpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgIHJldHVybiBzZWxmLmNvbm5lY3Qoc2VsZi5jb25uZWN0aW9uKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBzZWxmLmxpc3QocmVtb3RlUGF0aCkudGhlbigobGlzdCkgPT4ge1xuICAgICAgICAgICAgICByZXNvbHZlKGxpc3QpO1xuICAgICAgICAgICAgfSkuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0pLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9KS5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgICAgcmVqZWN0KGVycik7XG4gICAgICAgIH0pO1xuICAgICAgfSwgMTAwMDApO1xuICAgIH0pO1xuXG4gICAgLy8gbGlzdFxuICAgIGxldCBwcm9taXNlQiA9IHNlbGYuY2xpZW50Lmxpc3QocmVtb3RlUGF0aCkudGhlbigobGlzdCkgPT4ge1xuICAgICAgY2xlYXJUaW1lb3V0KHRpbWVyKTtcbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgIHJlc29sdmUobGlzdCk7XG4gICAgICB9KTtcbiAgICB9KS5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICBjbGVhclRpbWVvdXQodGltZXIpO1xuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgcmVqZWN0KGVycik7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIHJldHVybiBQcm9taXNlLnJhY2UoW1xuICAgICAgcHJvbWlzZUEsXG4gICAgICBwcm9taXNlQlxuICAgIF0pO1xuICB9XG5cbiAgbWtkaXIocmVtb3RlUGF0aCkge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuICAgIHNlbGYuZW1pdCgnZGVidWcnLCAnc2Z0cDpta2RpcicsIHJlbW90ZVBhdGgpO1xuXG4gICAgcmV0dXJuIHNlbGYuY2xpZW50Lm1rZGlyKHJlbW90ZVBhdGgpLnRoZW4oKCkgPT4ge1xuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgcmVzb2x2ZShyZW1vdGVQYXRoLnRyaW0oKSk7XG4gICAgICB9KTtcbiAgICB9KS5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgcm1kaXIocmVtb3RlUGF0aCwgcmVjdXJzaXZlKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gICAgc2VsZi5lbWl0KCdkZWJ1ZycsICdzZnRwOnJtZGlyJywgcmVtb3RlUGF0aCk7XG5cbiAgICByZXR1cm4gc2VsZi5jbGllbnQucm1kaXIocmVtb3RlUGF0aCwgcmVjdXJzaXZlKS50aGVuKCgpID0+IHtcbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgIHJlc29sdmUocmVtb3RlUGF0aC50cmltKCkpO1xuICAgICAgfSk7XG4gICAgfSkuY2F0Y2goKGVycikgPT4ge1xuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgcmVqZWN0KGVycik7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIGNobW9kKHJlbW90ZVBhdGgsIHBlcm1pc3Npb25zKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gICAgc2VsZi5lbWl0KCdkZWJ1ZycsICdzZnRwOmNobW9kJywgcmVtb3RlUGF0aCk7XG5cbiAgICByZXR1cm4gc2VsZi5jbGllbnQuY2htb2QocmVtb3RlUGF0aCwgcGVybWlzc2lvbnMpO1xuICB9XG5cbiAgcHV0KHF1ZXVlSXRlbSkge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuICAgIHNlbGYuZW1pdCgnZGVidWcnLCAnc2Z0cDpwdXQnLCByZW1vdGVQYXRoKTtcblxuICAgIGxldCByZW1vdGVQYXRoID0gcXVldWVJdGVtLmluZm8ucmVtb3RlUGF0aDtcbiAgICBsZXQgbG9jYWxQYXRoID0gcXVldWVJdGVtLmluZm8ubG9jYWxQYXRoO1xuXG4gICAgbGV0IHByb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBsZXQgc3RyID0gcHJvZ3Jlc3MoeyB0aW1lOiAxMDAgfSk7XG4gICAgICBsZXQgaW5wdXQgPSBGaWxlU3lzdGVtLmNyZWF0ZVJlYWRTdHJlYW0obG9jYWxQYXRoKTtcbiAgICAgIGlucHV0LnBhdXNlKCk7XG5cbiAgICAgIC8vIERlY2xhcmUgZXZlbnRzICBcbiAgICAgIGNvbnN0IHByb2dyZXNzRXZlbnQgPSAocHJvZ3Jlc3MpID0+IHtcbiAgICAgICAgcXVldWVJdGVtLmNoYW5nZVByb2dyZXNzKHByb2dyZXNzLnRyYW5zZmVycmVkKTtcbiAgICAgICAgc2VsZi5lbWl0KCdkYXRhJywgcHJvZ3Jlc3MudHJhbnNmZXJyZWQpO1xuICAgICAgfTtcbiAgICAgIGNvbnN0IGNsaWVudENsb3NlRXZlbnQgPSAoaGFkRXJyb3IpID0+IHtcbiAgICAgICAgaWYgKGhhZEVycm9yKSB7XG4gICAgICAgICAgcXVldWVJdGVtLmNoYW5nZVN0YXR1cygnRXJyb3InKTtcbiAgICAgICAgICByZWplY3QoRXJyb3IoJ3NmdHAgY2xvc2VkIGNvbm5lY3Rpb24nKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmVzb2x2ZShsb2NhbFBhdGgudHJpbSgpKTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgIGNvbnN0IGNsaWVudEVycm9yRXZlbnQgPSAoZXJyKSA9PiB7XG4gICAgICAgIHF1ZXVlSXRlbS5jaGFuZ2VTdGF0dXMoJ0Vycm9yJyk7XG4gICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgfTtcblxuICAgICAgLy8gQWRkIGV2ZW50IGxpc3RlbmVyXG4gICAgICBzdHIub24oJ3Byb2dyZXNzJywgcHJvZ3Jlc3NFdmVudCk7XG4gICAgICBzZWxmLmNsaWVudC5vbignY2xvc2UnLCBjbGllbnRDbG9zZUV2ZW50KTtcbiAgICAgIHNlbGYuY2xpZW50Lm9uKCdlcnJvcicsIGNsaWVudEVycm9yRXZlbnQpO1xuXG4gICAgICBpbnB1dC5vbignb3BlbicsICgpID0+IHtcbiAgICAgICAgcXVldWVJdGVtLmNoYW5nZVN0YXR1cygnVHJhbnNmZXJyaW5nJyk7XG4gICAgICB9KTtcbiAgICAgIC8vIGlucHV0Lm9uY2UoJ2VuZCcsICgpID0+IHtcbiAgICAgIC8vICAgcXVldWVJdGVtLmNoYW5nZVByb2dyZXNzKHF1ZXVlSXRlbS5pbmZvLnNpemUpO1xuICAgICAgLy8gICByZXNvbHZlKGxvY2FsUGF0aC50cmltKCkpO1xuICAgICAgLy8gfSk7XG4gICAgICAvLyBpbnB1dC5vbmNlKCdmaW5pc2gnLCAoKSA9PiB7XG4gICAgICAvLyAgIHF1ZXVlSXRlbS5jaGFuZ2VQcm9ncmVzcyhxdWV1ZUl0ZW0uaW5mby5zaXplKTtcbiAgICAgIC8vICAgcmVzb2x2ZShsb2NhbFBhdGgudHJpbSgpKTtcbiAgICAgIC8vIH0pO1xuICAgICAgaW5wdXQub25jZSgnZXJyb3InLCAoZXJyKSA9PiB7XG4gICAgICAgIC8vIFJlbW92ZSBldmVudCBsaXN0ZW5lclxuICAgICAgICBzdHIucmVtb3ZlTGlzdGVuZXIoJ3Byb2dyZXNzJywgcHJvZ3Jlc3NFdmVudCk7XG4gICAgICAgIHNlbGYuY2xpZW50LnJlbW92ZUxpc3RlbmVyKCdjbG9zZScsIGNsaWVudENsb3NlRXZlbnQpO1xuICAgICAgICBzZWxmLmNsaWVudC5yZW1vdmVMaXN0ZW5lcignZXJyb3InLCBjbGllbnRFcnJvckV2ZW50KTtcblxuICAgICAgICBxdWV1ZUl0ZW0uY2hhbmdlU3RhdHVzKCdFcnJvcicpO1xuICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgIH0pO1xuXG4gICAgICAvLyBjaGVjayBmaWxlIGV4aXN0cyBhbmQgZ2V0IHBlcm1pc3Npb25zXG4gICAgICByZXR1cm4gc2VsZi5jbGllbnQuc3RhdChyZW1vdGVQYXRoKS50aGVuKChpbmZvKSA9PiB7XG4gICAgICAgIC8vIGZpbGUgIGV4aXN0c1xuICAgICAgICBsZXQgb3RoZXJPcHRpb25zID0gbnVsbDtcbiAgICAgICAgaWYgKGluZm8ucGVybWlzc2lvbnMpIHtcbiAgICAgICAgICBpbmZvLnBlcm1pc3Npb25zID0gaW5mby5wZXJtaXNzaW9ucy50b1N0cmluZyg4KS5zdWJzdHIoLTMpO1xuICAgICAgICAgIG90aGVyT3B0aW9ucyA9IHsgbW9kZTogcGFyc2VJbnQoJzAnICsgaW5mby5wZXJtaXNzaW9ucywgOCkgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG90aGVyT3B0aW9ucyA9IHsgbW9kZTogMG82NDQgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHNlbGYuY2xpZW50LnB1dChpbnB1dC5waXBlKHN0ciksIHJlbW90ZVBhdGgsIG51bGwsIG51bGwsIG90aGVyT3B0aW9ucykudGhlbigoKSA9PiB7XG4gICAgICAgICAgLy8gUmVtb3ZlIGV2ZW50IGxpc3RlbmVyXG4gICAgICAgICAgc3RyLnJlbW92ZUxpc3RlbmVyKCdwcm9ncmVzcycsIHByb2dyZXNzRXZlbnQpO1xuICAgICAgICAgIHNlbGYuY2xpZW50LnJlbW92ZUxpc3RlbmVyKCdjbG9zZScsIGNsaWVudENsb3NlRXZlbnQpO1xuICAgICAgICAgIHNlbGYuY2xpZW50LnJlbW92ZUxpc3RlbmVyKCdlcnJvcicsIGNsaWVudEVycm9yRXZlbnQpO1xuXG4gICAgICAgICAgcXVldWVJdGVtLmNoYW5nZVByb2dyZXNzKHF1ZXVlSXRlbS5pbmZvLnNpemUpO1xuICAgICAgICAgIHJlc29sdmUobG9jYWxQYXRoLnRyaW0oKSk7XG4gICAgICAgIH0pLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgICAvLyBSZW1vdmUgZXZlbnQgbGlzdGVuZXJcbiAgICAgICAgICBzdHIucmVtb3ZlTGlzdGVuZXIoJ3Byb2dyZXNzJywgcHJvZ3Jlc3NFdmVudCk7XG4gICAgICAgICAgc2VsZi5jbGllbnQucmVtb3ZlTGlzdGVuZXIoJ2Nsb3NlJywgY2xpZW50Q2xvc2VFdmVudCk7XG4gICAgICAgICAgc2VsZi5jbGllbnQucmVtb3ZlTGlzdGVuZXIoJ2Vycm9yJywgY2xpZW50RXJyb3JFdmVudCk7XG5cbiAgICAgICAgICBxdWV1ZUl0ZW0uY2hhbmdlU3RhdHVzKCdFcnJvcicpO1xuICAgICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICB9KTtcbiAgICAgIH0pLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgLy8gZmlsZSBkb2Vzbid0IGV4aXN0c1xuICAgICAgICByZXR1cm4gc2VsZi5jbGllbnQucHV0KGlucHV0LnBpcGUoc3RyKSwgcmVtb3RlUGF0aCwgbnVsbCwgbnVsbCwgeyBtb2RlOiAwbzY0NCB9KS50aGVuKCgpID0+IHtcbiAgICAgICAgICAvLyBSZW1vdmUgZXZlbnQgbGlzdGVuZXJcbiAgICAgICAgICBzdHIucmVtb3ZlTGlzdGVuZXIoJ3Byb2dyZXNzJywgcHJvZ3Jlc3NFdmVudCk7XG4gICAgICAgICAgc2VsZi5jbGllbnQucmVtb3ZlTGlzdGVuZXIoJ2Nsb3NlJywgY2xpZW50Q2xvc2VFdmVudCk7XG4gICAgICAgICAgc2VsZi5jbGllbnQucmVtb3ZlTGlzdGVuZXIoJ2Vycm9yJywgY2xpZW50RXJyb3JFdmVudCk7XG5cbiAgICAgICAgICBxdWV1ZUl0ZW0uY2hhbmdlUHJvZ3Jlc3MocXVldWVJdGVtLmluZm8uc2l6ZSk7XG4gICAgICAgICAgcmVzb2x2ZShsb2NhbFBhdGgudHJpbSgpKTtcbiAgICAgICAgfSkuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICAgIC8vIFJlbW92ZSBldmVudCBsaXN0ZW5lclxuICAgICAgICAgIHN0ci5yZW1vdmVMaXN0ZW5lcigncHJvZ3Jlc3MnLCBwcm9ncmVzc0V2ZW50KTtcbiAgICAgICAgICBzZWxmLmNsaWVudC5yZW1vdmVMaXN0ZW5lcignY2xvc2UnLCBjbGllbnRDbG9zZUV2ZW50KTtcbiAgICAgICAgICBzZWxmLmNsaWVudC5yZW1vdmVMaXN0ZW5lcignZXJyb3InLCBjbGllbnRFcnJvckV2ZW50KTtcblxuICAgICAgICAgIHF1ZXVlSXRlbS5jaGFuZ2VTdGF0dXMoJ0Vycm9yJyk7XG4gICAgICAgICAgcmVqZWN0KGVycik7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gcHJvbWlzZTtcbiAgfVxuXG4gIGdldChxdWV1ZUl0ZW0pIHtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcbiAgICBzZWxmLmVtaXQoJ2RlYnVnJywgJ3NmdHA6Z2V0JywgcmVtb3RlUGF0aCwgbG9jYWxQYXRoKTtcblxuICAgIGxldCByZW1vdGVQYXRoID0gcXVldWVJdGVtLmluZm8ucmVtb3RlUGF0aDtcbiAgICBsZXQgbG9jYWxQYXRoID0gcXVldWVJdGVtLmluZm8ubG9jYWxQYXRoO1xuXG4gICAgbGV0IHByb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBsZXQgc3RyID0gcHJvZ3Jlc3MoeyB0aW1lOiAxMDAgfSk7XG5cbiAgICAgIC8vIERlY2xhcmUgZXZlbnRzICBcbiAgICAgIGNvbnN0IHByb2dyZXNzRXZlbnQgPSAocHJvZ3Jlc3MpID0+IHtcbiAgICAgICAgc2VsZi5lbWl0KCdkZWJ1ZycsICdzZnRwOmdldDpjbGllbnQuZ2V0OnByb2dyZXNzJyk7XG4gICAgICAgIHF1ZXVlSXRlbS5jaGFuZ2VQcm9ncmVzcyhwcm9ncmVzcy50cmFuc2ZlcnJlZCk7XG4gICAgICAgIHNlbGYuZW1pdCgnZGF0YScsIHByb2dyZXNzLnRyYW5zZmVycmVkKTtcbiAgICAgIH07XG4gICAgICBjb25zdCBjbGllbnRDbG9zZUV2ZW50ID0gKGhhZEVycm9yKSA9PiB7XG4gICAgICAgIGlmIChoYWRFcnJvcikge1xuICAgICAgICAgIHF1ZXVlSXRlbS5jaGFuZ2VTdGF0dXMoJ0Vycm9yJyk7XG4gICAgICAgICAgcmVqZWN0KEVycm9yKCdzZnRwIGNsb3NlZCBjb25uZWN0aW9uJykpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJlc29sdmUobG9jYWxQYXRoLnRyaW0oKSk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICBjb25zdCBjbGllbnRFcnJvckV2ZW50ID0gKGVycikgPT4ge1xuICAgICAgICBxdWV1ZUl0ZW0uY2hhbmdlU3RhdHVzKCdFcnJvcicpO1xuICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgIH07XG5cbiAgICAgIC8vIEFkZCBldmVudCBsaXN0ZW5lclxuICAgICAgc3RyLm9uKCdwcm9ncmVzcycsIHByb2dyZXNzRXZlbnQpO1xuICAgICAgc2VsZi5jbGllbnQub24oJ2Nsb3NlJywgY2xpZW50Q2xvc2VFdmVudCk7XG4gICAgICBzZWxmLmNsaWVudC5vbignZXJyb3InLCBjbGllbnRFcnJvckV2ZW50KTtcblxuICAgICAgcmV0dXJuIHNlbGYuY2xpZW50LmdldChyZW1vdGVQYXRoLCBudWxsLCBudWxsKS50aGVuKChzdHJlYW0pID0+IHtcbiAgICAgICAgc3RyZWFtLnBhdXNlKCk7XG5cbiAgICAgICAgc3RyZWFtLm9uKCdyZWFkYWJsZScsICgpID0+IHtcbiAgICAgICAgICBzZWxmLmVtaXQoJ2RlYnVnJywgJ3NmdHA6Z2V0OnN0cmVhbS5yZWFkYWJsZScpO1xuXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHNlbGYuZW1pdCgnZGVidWcnLCAnc2Z0cDpnZXQ6Y2xpZW50LmdldDpzdWNjZXNzJyk7XG4gICAgICAgIGxldCBmaWxlID0gRmlsZVN5c3RlbS5jcmVhdGVXcml0ZVN0cmVhbShsb2NhbFBhdGgsIHsgYXV0b0Nsb3NlOiB0cnVlIH0pO1xuXG4gICAgICAgIGZpbGUub24oJ29wZW4nLCAoZXJyKSA9PiB7XG4gICAgICAgICAgc2VsZi5lbWl0KCdkZWJ1ZycsICdzZnRwOmdldDpmaWxlLm9wZW4nKTtcbiAgICAgICAgICBxdWV1ZUl0ZW0uYWRkU3RyZWFtKGZpbGUpO1xuICAgICAgICAgIHF1ZXVlSXRlbS5jaGFuZ2VTdGF0dXMoJ1RyYW5zZmVycmluZycpO1xuICAgICAgICB9KTtcbiAgICAgICAgZmlsZS5vbignZXJyb3InLCAoZXJyKSA9PiB7XG4gICAgICAgICAgc2VsZi5lbWl0KCdkZWJ1ZycsICdzZnRwOmdldDpmaWxlLmVycm9yJyk7XG4gICAgICAgICAgLy8gUmVtb3ZlIGV2ZW50IGxpc3RlbmVyXG4gICAgICAgICAgc3RyLnJlbW92ZUxpc3RlbmVyKCdwcm9ncmVzcycsIHByb2dyZXNzRXZlbnQpO1xuICAgICAgICAgIHNlbGYuY2xpZW50LnJlbW92ZUxpc3RlbmVyKCdjbG9zZScsIGNsaWVudENsb3NlRXZlbnQpO1xuICAgICAgICAgIHNlbGYuY2xpZW50LnJlbW92ZUxpc3RlbmVyKCdlcnJvcicsIGNsaWVudEVycm9yRXZlbnQpO1xuXG4gICAgICAgICAgcXVldWVJdGVtLmNoYW5nZVN0YXR1cygnRXJyb3InKTtcbiAgICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGZpbGUub25jZSgnZmluaXNoJywgKCkgPT4ge1xuICAgICAgICAgIHNlbGYuZW1pdCgnZGVidWcnLCAnc2Z0cDpnZXQ6ZmlsZS5maW5pc2gnKTtcbiAgICAgICAgICAvLyBSZW1vdmUgZXZlbnQgbGlzdGVuZXJcbiAgICAgICAgICBzdHIucmVtb3ZlTGlzdGVuZXIoJ3Byb2dyZXNzJywgcHJvZ3Jlc3NFdmVudCk7XG4gICAgICAgICAgc2VsZi5jbGllbnQucmVtb3ZlTGlzdGVuZXIoJ2Nsb3NlJywgY2xpZW50Q2xvc2VFdmVudCk7XG4gICAgICAgICAgc2VsZi5jbGllbnQucmVtb3ZlTGlzdGVuZXIoJ2Vycm9yJywgY2xpZW50RXJyb3JFdmVudCk7XG5cbiAgICAgICAgICBxdWV1ZUl0ZW0uY2hhbmdlUHJvZ3Jlc3MocXVldWVJdGVtLmluZm8uc2l6ZSk7XG4gICAgICAgICAgcmVzb2x2ZShsb2NhbFBhdGgudHJpbSgpKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgc3RyZWFtLm9uY2UoJ2VuZCcsICgpID0+IHtcbiAgICAgICAgICBzZWxmLmVtaXQoJ2RlYnVnJywgJ3NmdHA6Z2V0OnN0cmVhbS5lbmQnKTtcbiAgICAgICAgICAvLyBSZW1vdmUgZXZlbnQgbGlzdGVuZXJcbiAgICAgICAgICBzdHIucmVtb3ZlTGlzdGVuZXIoJ3Byb2dyZXNzJywgcHJvZ3Jlc3NFdmVudCk7XG4gICAgICAgICAgc2VsZi5jbGllbnQucmVtb3ZlTGlzdGVuZXIoJ2Nsb3NlJywgY2xpZW50Q2xvc2VFdmVudCk7XG4gICAgICAgICAgc2VsZi5jbGllbnQucmVtb3ZlTGlzdGVuZXIoJ2Vycm9yJywgY2xpZW50RXJyb3JFdmVudCk7XG5cbiAgICAgICAgICBxdWV1ZUl0ZW0uY2hhbmdlUHJvZ3Jlc3MocXVldWVJdGVtLmluZm8uc2l6ZSk7XG4gICAgICAgICAgcmVzb2x2ZShsb2NhbFBhdGgudHJpbSgpKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHN0cmVhbS5vbmNlKCdmaW5pc2gnLCAoKSA9PiB7XG4gICAgICAgICAgc2VsZi5lbWl0KCdkZWJ1ZycsICdzZnRwOmdldDpzdHJlYW0uZmluaXNoJyk7XG4gICAgICAgICAgLy8gUmVtb3ZlIGV2ZW50IGxpc3RlbmVyXG4gICAgICAgICAgc3RyLnJlbW92ZUxpc3RlbmVyKCdwcm9ncmVzcycsIHByb2dyZXNzRXZlbnQpO1xuICAgICAgICAgIHNlbGYuY2xpZW50LnJlbW92ZUxpc3RlbmVyKCdjbG9zZScsIGNsaWVudENsb3NlRXZlbnQpO1xuICAgICAgICAgIHNlbGYuY2xpZW50LnJlbW92ZUxpc3RlbmVyKCdlcnJvcicsIGNsaWVudEVycm9yRXZlbnQpO1xuXG4gICAgICAgICAgcXVldWVJdGVtLmNoYW5nZVByb2dyZXNzKHF1ZXVlSXRlbS5pbmZvLnNpemUpO1xuICAgICAgICAgIHJlc29sdmUobG9jYWxQYXRoLnRyaW0oKSk7XG4gICAgICAgIH0pO1xuICAgICAgICBzdHJlYW0ub25jZSgnZXJyb3InLCAoZXJyKSA9PiB7XG4gICAgICAgICAgc2VsZi5lbWl0KCdkZWJ1ZycsICdzZnRwOmdldDpzdHJlYW0uZXJyb3InKTtcbiAgICAgICAgICAvLyBSZW1vdmUgZXZlbnQgbGlzdGVuZXJcbiAgICAgICAgICBzdHIucmVtb3ZlTGlzdGVuZXIoJ3Byb2dyZXNzJywgcHJvZ3Jlc3NFdmVudCk7XG4gICAgICAgICAgc2VsZi5jbGllbnQucmVtb3ZlTGlzdGVuZXIoJ2Nsb3NlJywgY2xpZW50Q2xvc2VFdmVudCk7XG4gICAgICAgICAgc2VsZi5jbGllbnQucmVtb3ZlTGlzdGVuZXIoJ2Vycm9yJywgY2xpZW50RXJyb3JFdmVudCk7XG5cbiAgICAgICAgICBxdWV1ZUl0ZW0uY2hhbmdlU3RhdHVzKCdFcnJvcicpO1xuICAgICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICB9KTtcblxuICAgICAgICBzZWxmLmVtaXQoJ2RlYnVnJywgJ3NmdHA6Z2V0OnN0cmVhbS5waXBlJyk7XG4gICAgICAgIHN0cmVhbS5waXBlKHN0cikucGlwZShmaWxlKTtcbiAgICAgIH0pLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgc2VsZi5lbWl0KCdkZWJ1ZycsICdzZnRwOmdldDpjbGllbnQuZ2V0OmVycm9yJyk7XG4gICAgICAgIC8vIFJlbW92ZSBldmVudCBsaXN0ZW5lclxuICAgICAgICBzdHIucmVtb3ZlTGlzdGVuZXIoJ3Byb2dyZXNzJywgcHJvZ3Jlc3NFdmVudCk7XG4gICAgICAgIHNlbGYuY2xpZW50LnJlbW92ZUxpc3RlbmVyKCdjbG9zZScsIGNsaWVudENsb3NlRXZlbnQpO1xuICAgICAgICBzZWxmLmNsaWVudC5yZW1vdmVMaXN0ZW5lcignZXJyb3InLCBjbGllbnRFcnJvckV2ZW50KTtcblxuICAgICAgICBxdWV1ZUl0ZW0uY2hhbmdlU3RhdHVzKCdFcnJvcicpO1xuICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHByb21pc2U7XG4gIH1cblxuICBkZWxldGUocmVtb3RlUGF0aCkge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuICAgIHNlbGYuZW1pdCgnZGVidWcnLCAnc2Z0cDpkZWxldGUnLCByZW1vdGVQYXRoKTtcblxuICAgIHJldHVybiBzZWxmLmNsaWVudC5kZWxldGUocmVtb3RlUGF0aCk7XG4gIH1cblxuICByZW5hbWUob2xkUmVtb3RlUGF0aCwgbmV3UmVtb3RlUGF0aCkge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuICAgIHNlbGYuZW1pdCgnZGVidWcnLCAnc2Z0cDpyZW5hbWUnLCBvbGRSZW1vdGVQYXRoLCBuZXdSZW1vdGVQYXRoKTtcblxuICAgIHJldHVybiBzZWxmLmNsaWVudC5yZW5hbWUob2xkUmVtb3RlUGF0aCwgbmV3UmVtb3RlUGF0aCk7XG4gIH1cblxuICBlbmQoKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gICAgc2VsZi5lbWl0KCdkZWJ1ZycsICdzZnRwOmVuZCcpO1xuXG4gICAgLy8gUmVtb3ZlIGV2ZW50IGxpc3RlbmVyXG4gICAgc2VsZi5jbGllbnQucmVtb3ZlTGlzdGVuZXIoJ3JlYWR5Jywgc2VsZi5jbGllbnRSZWFkeUV2ZW50KTtcbiAgICBzZWxmLmNsaWVudC5yZW1vdmVMaXN0ZW5lcignZXJyb3InLCBzZWxmLmNsaWVudEVycm9yRXZlbnQpO1xuICAgIHNlbGYuY2xpZW50LnJlbW92ZUxpc3RlbmVyKCdlbmQnLCBzZWxmLmNsaWVudEVuZEV2ZW50KTtcbiAgICBzZWxmLmNsaWVudC5yZW1vdmVMaXN0ZW5lcignY2xvc2UnLCBzZWxmLmNsaWVudENsb3NlRXZlbnQpO1xuXG4gICAgcmV0dXJuIHNlbGYuY2xpZW50LmVuZCgpO1xuICB9XG5cbiAgYWJvcnQoKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gICAgc2VsZi5lbWl0KCdkZWJ1ZycsICdzZnRwOmFib3J0Jyk7XG5cbiAgICByZXR1cm4gc2VsZi5lbmQoKS50aGVuKCgpID0+IHtcbiAgICAgIHJldHVybiBzZWxmLmNvbm5lY3Qoc2VsZi5jb25uZWN0aW9uKVxuICAgIH0pO1xuICB9XG59XG4iXX0=