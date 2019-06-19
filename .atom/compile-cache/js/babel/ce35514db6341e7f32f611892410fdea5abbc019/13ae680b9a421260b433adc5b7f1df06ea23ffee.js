'use babel';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x3, _x4, _x5) { var _again = true; _function: while (_again) { var object = _x3, property = _x4, receiver = _x5; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x3 = parent; _x4 = property; _x5 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ftpClient = require('./ftp');
var sftpClient = require('./sftp');
var EventEmitter = require('events');
var PQueue = require('p-queue');

var Connector = (function (_EventEmitter) {
  _inherits(Connector, _EventEmitter);

  function Connector(connection) {
    _classCallCheck(this, Connector);

    _get(Object.getPrototypeOf(Connector.prototype), 'constructor', this).call(this);
    var self = this;

    self.connection = connection;
    self.client = null;
    self.queue = new PQueue({ concurrency: 1 });

    if (self.connection.sftp === true || self.connection.useAgent === true) {
      self.client = new sftpClient();
    } else {
      self.client = new ftpClient();
    }

    // Events
    self.client.on('debug', function (msg) {
      self.emit('debug', msg);
    });
    self.client.on('log', function (msg) {
      self.emit('log', msg);
    });
  }

  // Tear down any state and detach

  _createClass(Connector, [{
    key: 'destroy',
    value: function destroy() {
      var self = this;

      return self.abortAll().then(function () {
        return self.client.end();
      })['catch'](function (error) {
        return self.client.end();
      });
    }
  }, {
    key: 'connect',
    value: function connect() {
      var self = this;
      self.emit('debug', 'connector:connect');

      // Keep connection alive
      if (self.client.isConnected()) {
        return new Promise(function (resolve, reject) {
          resolve(self.client);
        });
      }

      try {
        // Start new connection
        return self.client.connect(self.connection);
      } catch (error) {
        console.log(error);
        return self.disconnect(null, error);
      }
    }
  }, {
    key: 'disconnect',
    value: function disconnect(result, error) {
      var self = this;
      self.emit('debug', 'connector:disconnect');

      // Keep connection alive
      return new Promise(function (resolve, reject) {
        if (result) resolve(result);
        if (error) reject(error);
      });

      // return self.client.end()
      //   .then(() => {
      //     return new Promise((resolve, reject) => {
      //       if (result) resolve(result);
      //       if (error) reject(error);
      //     });
      //   })
      //   .catch(() => {
      //     return new Promise((resolve, reject) => {
      //       if (result) resolve(result);
      //       if (error) reject(error);
      //     });
      //   });
    }
  }, {
    key: 'abort',
    value: function abort() {
      var self = this;
      self.emit('debug', 'connector:abort');

      if (!self.client.isConnected()) return self.disconnect(true);

      return self.connect().then(function (Client) {
        return Client.abort(function () {
          return self.disconnect(true);
        });
      })['catch'](function (error) {
        return self.disconnect(null, error);
      });
    }
  }, {
    key: 'abortAll',
    value: function abortAll() {
      var self = this;
      self.emit('debug', 'connector:abortAll');

      self.queue.clear();

      if (!self.client.isConnected()) return self.disconnect(true);

      return self.connect().then(function (Client) {
        return Client.abort(function () {
          return self.disconnect(true);
        });
      })['catch'](function (error) {
        return self.disconnect(null, error);
      });
    }
  }, {
    key: 'listDirectory',
    value: function listDirectory(remotePath) {
      var self = this;
      self.emit('debug', 'connector:listDirectory', remotePath);

      return self.queue.add(function () {
        return self.connect().then(function (Client) {
          return Client.list(remotePath.trim()).then(function (result) {
            return self.disconnect(result);
          })['catch'](function (error) {
            return self.disconnect(null, error);
          });
        })['catch'](function (error) {
          return self.disconnect(null, error);
        });
      }, { priority: 10 });
    }
  }, {
    key: 'createDirectory',
    value: function createDirectory(remotePath) {
      var self = this;
      self.emit('debug', 'connector:createDirectory', remotePath);

      return self.queue.add(function () {
        return self._createDirectory(remotePath);
      }, { priority: 9 });
    }
  }, {
    key: '_createDirectory',
    value: function _createDirectory(remotePath) {
      var self = this;

      // Check directory already exists
      return self._existsDirectory(remotePath.trim()).then(function () {
        // Directory already exists
        // Nothing to do
        return Promise.resolve(remotePath.trim());
      })['catch'](function () {
        // Directory not exists and must be created
        return self.connect().then(function (Client) {

          var paths = [];
          remotePath.split('/').reduce(function (path, dir) {
            path += '/' + dir.trim();
            paths.push(path);
            return path;
          });

          // Walk recursive through directory tree and create non existing directories
          return self._createDirectoryStructure(Client, paths).then(function () {
            return self.disconnect(remotePath.trim());
          })['catch'](function (error) {
            return self.disconnect(null, error);
          });
        })['catch'](function (error) {
          return self.disconnect(null, error);
        });
      });
    }
  }, {
    key: '_createDirectoryStructure',
    value: function _createDirectoryStructure(Client, remotePaths) {
      var self = this;
      self.emit('debug', 'connector:createDirectoryStructure', remotePaths);

      var path = remotePaths.shift();
      var directory = path.split('/');
      directory.pop();
      directory = directory.join('/');
      if (!directory) directory = '/';

      // Walk recursive through directory tree and create non existing directories
      return Client.list(directory).then(function (list) {
        var dir = list.find(function (item) {
          return item.name == path.split('/').slice(-1)[0];
        });

        if (dir) {
          if (remotePaths.length > 0) {
            return self._createDirectoryStructure(Client, remotePaths).then(function () {
              return Promise.resolve(path.trim());
            })['catch'](function (error) {
              return Promise.reject(error);
            });
          } else {
            return Promise.resolve(path.trim());
          }
        } else {
          return Client.mkdir(path.trim()).then(function () {
            if (remotePaths.length > 0) {
              return self._createDirectoryStructure(Client, remotePaths).then(function () {
                return Promise.resolve(path.trim());
              })['catch'](function (error) {
                return Promise.reject(error);
              });
            } else {
              return Promise.resolve(path.trim());
            }
          })['catch'](function (error) {
            return Promise.reject(error);
          });
        }
      })['catch'](function (error) {
        return Promise.reject(error);
      });
    }
  }, {
    key: 'deleteDirectory',
    value: function deleteDirectory(remotePath, recursive) {
      var self = this;
      self.emit('debug', 'connector:deleteDirectory', remotePath);

      return self.queue.add(function () {
        return self.connect().then(function (Client) {
          return Client.rmdir(remotePath.trim(), true).then(function (result) {
            return self.disconnect(result);
          })['catch'](function (error) {
            return self.disconnect(null, error);
          });
        })['catch'](function (error) {
          return self.disconnect(null, error);
        });
      }, { priority: 6 });
    }
  }, {
    key: 'existsDirectory',
    value: function existsDirectory(remotePath) {
      var self = this;
      self.emit('debug', 'connector:existsDirectory', remotePath);

      return self.queue.add(function () {
        return self._existsDirectory(remotePath);
      }, { priority: 10 });
    }
  }, {
    key: '_existsDirectory',
    value: function _existsDirectory(remotePath) {
      var self = this;

      if (!remotePath || remotePath == '/') {
        return Promise.resolve(remotePath);
      }

      return self.connect().then(function (Client) {
        var directory = remotePath.split('/');
        directory.pop();
        directory = directory.join('/');

        return Client.list(directory).then(function (list) {
          var dir = list.find(function (item) {
            return item.name == remotePath.split('/').slice(-1)[0];
          });
          if (dir) {
            return self.disconnect(remotePath);
          }
          return self.disconnect(null, { message: 'Directory not exists.' });
        })['catch'](function (error) {
          return self.disconnect(null, error);
        });
      })['catch'](function (error) {
        return self.disconnect(null, error);
      });
    }
  }, {
    key: 'chmodDirectory',
    value: function chmodDirectory(remotePath, permissions) {
      var self = this;
      self.emit('debug', 'connector:chmodDirectory', remotePath + ' ' + permissions);

      return self.queue.add(function () {
        return self.connect().then(function (Client) {
          return Client.chmod(remotePath, permissions).then(function (responseText) {
            return self.disconnect(responseText);
          })['catch'](function (error) {
            return self.disconnect(null, error);
          });
        })['catch'](function (error) {
          return self.disconnect(null, error);
        });
      }, { priority: 5 });
    }
  }, {
    key: 'uploadFile',
    value: function uploadFile(queueItem) {
      var priority = arguments.length <= 1 || arguments[1] === undefined ? 8 : arguments[1];

      var self = this;
      self.emit('debug', 'connector:uploadFile', queueItem.info.remotePath, queueItem.info.localPath);

      var arrPath = queueItem.info.remotePath.split('/');
      arrPath.pop();

      return self.queue.add(function () {
        return self._createDirectory(arrPath.join('/')).then(function () {
          return self.connect().then(function (Client) {
            return Client.put(queueItem).then(function (remotePath) {
              queueItem.changeStatus('Finished');
              return self.disconnect(remotePath);
            })['catch'](function (error) {
              queueItem.changeStatus('Error');
              return self.disconnect(null, error);
            });
          })['catch'](function (error) {
            queueItem.changeStatus('Error');
            return self.disconnect(null, error);
          });
        })['catch'](function (error) {
          queueItem.changeStatus('Error');
          return self.disconnect(null, error);
        });
      }, { priority: priority });
    }
  }, {
    key: 'downloadFile',
    value: function downloadFile(queueItem) {
      var priority = arguments.length <= 1 || arguments[1] === undefined ? 7 : arguments[1];

      var self = this;
      self.emit('debug', 'connector:downloadFile', queueItem.info.remotePath, queueItem.info.localPath);

      return self.queue.add(function () {
        return self.connect().then(function (Client) {
          return Client.get(queueItem).then(function (localPath) {
            queueItem.changeStatus('Finished');
            return self.disconnect(localPath);
          })['catch'](function (error) {
            queueItem.changeStatus('Error');
            return self.disconnect(null, error);
          });
        })['catch'](function (error) {
          queueItem.changeStatus('Error');
          return self.disconnect(null, error);
        });
      }, { priority: priority });
    }
  }, {
    key: 'deleteFile',
    value: function deleteFile(remotePath) {
      var self = this;
      self.emit('debug', 'connector:deleteFile', remotePath);

      return self.queue.add(function () {
        return self.connect().then(function (Client) {
          return Client['delete'](remotePath.trim()).then(function () {
            return self.disconnect(remotePath.trim());
          })['catch'](function (error) {
            return self.disconnect(null, error);
          });
        })['catch'](function (error) {
          return self.disconnect(null, error);
        });
      }, { priority: 6 });
    }
  }, {
    key: 'existsFile',
    value: function existsFile(remotePath) {
      var self = this;
      self.emit('debug', 'connector:existsFile', remotePath);

      return self.queue.add(function () {
        return self.connect().then(function (Client) {
          var directory = remotePath.split('/');
          directory.pop();
          directory = directory.join('/');

          return Client.list(directory).then(function (list) {
            var file = list.find(function (item) {
              return item.name == remotePath.split('/').slice(-1)[0];
            });
            if (file) {
              return self.disconnect(remotePath);
            }
            return self.disconnect(null, { message: 'File not exists.' });
          })['catch'](function (error) {
            return self.disconnect(null, error);
          });
        })['catch'](function (error) {
          return self.disconnect(null, error);
        });
      }, { priority: 10 });
    }
  }, {
    key: 'chmodFile',
    value: function chmodFile(remotePath, permissions) {
      var self = this;
      self.emit('debug', 'connector:chmodFile', remotePath + ' ' + permissions);

      return self.queue.add(function () {
        return self.connect().then(function (Client) {
          return Client.chmod(remotePath, permissions).then(function (responseText) {
            return self.disconnect(responseText);
          })['catch'](function (error) {
            return self.disconnect(null, error);
          });
        })['catch'](function (error) {
          return self.disconnect(null, error);
        });
      }, { priority: 5 });
    }
  }, {
    key: 'rename',
    value: function rename(oldRemotePath, newRemotePath) {
      var self = this;
      self.emit('debug', 'connector:rename', oldRemotePath, newRemotePath);

      return self.queue.add(function () {
        return self.connect().then(function (Client) {
          return Client.rename(oldRemotePath.trim(), newRemotePath.trim()).then(function () {
            return self.disconnect(newRemotePath.trim());
          })['catch'](function (error) {
            return self.disconnect(null, error);
          });
        })['catch'](function (error) {
          return self.disconnect(null, error);
        });
      }, { priority: 6 });
    }
  }]);

  return Connector;
})(EventEmitter);

exports['default'] = Connector;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2FuYW5tYXlqYWluLy5hdG9tL3BhY2thZ2VzL2Z0cC1yZW1vdGUtZWRpdC9saWIvY29ubmVjdG9ycy9jb25uZWN0b3IuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsV0FBVyxDQUFDOzs7Ozs7Ozs7Ozs7OztBQUVaLElBQU0sU0FBUyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUNuQyxJQUFNLFVBQVUsR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDckMsSUFBTSxZQUFZLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ3ZDLElBQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQzs7SUFFYixTQUFTO1lBQVQsU0FBUzs7QUFFakIsV0FGUSxTQUFTLENBRWhCLFVBQVUsRUFBRTswQkFGTCxTQUFTOztBQUcxQiwrQkFIaUIsU0FBUyw2Q0FHbEI7QUFDUixRQUFNLElBQUksR0FBRyxJQUFJLENBQUM7O0FBRWxCLFFBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDO0FBQzdCLFFBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO0FBQ25CLFFBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxNQUFNLENBQUMsRUFBRSxXQUFXLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQzs7QUFFNUMsUUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksS0FBSyxJQUFJLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLEtBQUssSUFBSSxFQUFFO0FBQ3RFLFVBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxVQUFVLEVBQUUsQ0FBQztLQUNoQyxNQUFNO0FBQ0wsVUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLFNBQVMsRUFBRSxDQUFDO0tBQy9COzs7QUFHRCxRQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUUsVUFBQyxHQUFHLEVBQUs7QUFDL0IsVUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUFDLENBQUM7S0FDekIsQ0FBQyxDQUFDO0FBQ0gsUUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsS0FBSyxFQUFFLFVBQUMsR0FBRyxFQUFLO0FBQzdCLFVBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0tBQ3ZCLENBQUMsQ0FBQztHQUNKOzs7O2VBdkJrQixTQUFTOztXQTBCckIsbUJBQUc7QUFDUixVQUFNLElBQUksR0FBRyxJQUFJLENBQUM7O0FBRWxCLGFBQU8sSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLElBQUksQ0FBQyxZQUFNO0FBQ2hDLGVBQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQztPQUMxQixDQUFDLFNBQU0sQ0FBQyxVQUFDLEtBQUssRUFBSztBQUNsQixlQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUM7T0FDMUIsQ0FBQyxDQUFDO0tBQ0o7OztXQUVNLG1CQUFHO0FBQ1IsVUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDO0FBQ2xCLFVBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLG1CQUFtQixDQUFDLENBQUM7OztBQUd4QyxVQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxFQUFFLEVBQUU7QUFDN0IsZUFBTyxJQUFJLE9BQU8sQ0FBQyxVQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUs7QUFDdEMsaUJBQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7U0FDdEIsQ0FBQyxDQUFDO09BQ0o7O0FBRUQsVUFBSTs7QUFFRixlQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztPQUM3QyxDQUFDLE9BQU8sS0FBSyxFQUFFO0FBQ2QsZUFBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQTtBQUNsQixlQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO09BQ3JDO0tBQ0Y7OztXQUVTLG9CQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUU7QUFDeEIsVUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDO0FBQ2xCLFVBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLHNCQUFzQixDQUFDLENBQUM7OztBQUczQyxhQUFPLElBQUksT0FBTyxDQUFDLFVBQUMsT0FBTyxFQUFFLE1BQU0sRUFBSztBQUN0QyxZQUFJLE1BQU0sRUFBRSxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDNUIsWUFBSSxLQUFLLEVBQUUsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO09BQzFCLENBQUMsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7O0tBZUo7OztXQUVJLGlCQUFHO0FBQ04sVUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDO0FBQ2xCLFVBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLGlCQUFpQixDQUFDLENBQUM7O0FBRXRDLFVBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsRUFBRSxFQUFFLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQzs7QUFFN0QsYUFBTyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsSUFBSSxDQUFDLFVBQUMsTUFBTSxFQUFLO0FBQ3JDLGVBQU8sTUFBTSxDQUFDLEtBQUssQ0FBQyxZQUFNO0FBQ3hCLGlCQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDOUIsQ0FBQyxDQUFDO09BQ0osQ0FBQyxTQUFNLENBQUMsVUFBQyxLQUFLLEVBQUs7QUFDbEIsZUFBTyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztPQUNyQyxDQUFDLENBQUM7S0FDSjs7O1dBRU8sb0JBQUc7QUFDVCxVQUFNLElBQUksR0FBRyxJQUFJLENBQUM7QUFDbEIsVUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsb0JBQW9CLENBQUMsQ0FBQzs7QUFFekMsVUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQzs7QUFFbkIsVUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxFQUFFLEVBQUUsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDOztBQUU3RCxhQUFPLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxJQUFJLENBQUMsVUFBQyxNQUFNLEVBQUs7QUFDckMsZUFBTyxNQUFNLENBQUMsS0FBSyxDQUFDLFlBQU07QUFDeEIsaUJBQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUM5QixDQUFDLENBQUM7T0FDSixDQUFDLFNBQU0sQ0FBQyxVQUFDLEtBQUssRUFBSztBQUNsQixlQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO09BQ3JDLENBQUMsQ0FBQztLQUNKOzs7V0FFWSx1QkFBQyxVQUFVLEVBQUU7QUFDeEIsVUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDO0FBQ2xCLFVBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLHlCQUF5QixFQUFFLFVBQVUsQ0FBQyxDQUFDOztBQUUxRCxhQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLFlBQU07QUFDMUIsZUFBTyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsSUFBSSxDQUFDLFVBQUMsTUFBTSxFQUFLO0FBQ3JDLGlCQUFPLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQUMsTUFBTSxFQUFLO0FBQ3JELG1CQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUM7V0FDaEMsQ0FBQyxTQUFNLENBQUMsVUFBQyxLQUFLLEVBQUs7QUFBRSxtQkFBTyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztXQUFFLENBQUMsQ0FBQztTQUMvRCxDQUFDLFNBQU0sQ0FBQyxVQUFDLEtBQUssRUFBSztBQUNsQixpQkFBTyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztTQUNyQyxDQUFDLENBQUM7T0FDSixFQUFFLEVBQUUsUUFBUSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7S0FDdEI7OztXQUVjLHlCQUFDLFVBQVUsRUFBRTtBQUMxQixVQUFNLElBQUksR0FBRyxJQUFJLENBQUM7QUFDbEIsVUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsMkJBQTJCLEVBQUUsVUFBVSxDQUFDLENBQUM7O0FBRTVELGFBQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsWUFBTTtBQUMxQixlQUFPLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLENBQUMsQ0FBQztPQUMxQyxFQUFFLEVBQUUsUUFBUSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7S0FDckI7OztXQUVlLDBCQUFDLFVBQVUsRUFBRTtBQUMzQixVQUFNLElBQUksR0FBRyxJQUFJLENBQUM7OztBQUdsQixhQUFPLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBTTs7O0FBR3pELGVBQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztPQUMzQyxDQUFDLFNBQU0sQ0FBQyxZQUFNOztBQUViLGVBQU8sSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLElBQUksQ0FBQyxVQUFDLE1BQU0sRUFBSzs7QUFFckMsY0FBSSxLQUFLLEdBQUcsRUFBRSxDQUFDO0FBQ2Ysb0JBQVUsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLFVBQUMsSUFBSSxFQUFFLEdBQUcsRUFBSztBQUMxQyxnQkFBSSxJQUFJLEdBQUcsR0FBRyxHQUFHLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDekIsaUJBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDakIsbUJBQU8sSUFBSSxDQUFDO1dBQ2IsQ0FBQyxDQUFDOzs7QUFHSCxpQkFBTyxJQUFJLENBQUMseUJBQXlCLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxZQUFNO0FBQzlELG1CQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7V0FDM0MsQ0FBQyxTQUFNLENBQUMsVUFBQyxLQUFLLEVBQUs7QUFDbEIsbUJBQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7V0FDckMsQ0FBQyxDQUFDO1NBQ0osQ0FBQyxTQUFNLENBQUMsVUFBQyxLQUFLLEVBQUs7QUFDbEIsaUJBQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7U0FDckMsQ0FBQyxDQUFDO09BQ0osQ0FBQyxDQUFDO0tBQ0o7OztXQUV3QixtQ0FBQyxNQUFNLEVBQUUsV0FBVyxFQUFFO0FBQzdDLFVBQU0sSUFBSSxHQUFHLElBQUksQ0FBQztBQUNsQixVQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxvQ0FBb0MsRUFBRSxXQUFXLENBQUMsQ0FBQzs7QUFFdEUsVUFBSSxJQUFJLEdBQUcsV0FBVyxDQUFDLEtBQUssRUFBRSxDQUFDO0FBQy9CLFVBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDaEMsZUFBUyxDQUFDLEdBQUcsRUFBRSxDQUFDO0FBQ2hCLGVBQVMsR0FBRyxTQUFTLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ2hDLFVBQUksQ0FBQyxTQUFTLEVBQUUsU0FBUyxHQUFHLEdBQUcsQ0FBQzs7O0FBR2hDLGFBQU8sTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBQyxJQUFJLEVBQUs7QUFDM0MsWUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFDLElBQUksRUFBSztBQUM1QixpQkFBTyxJQUFJLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDbEQsQ0FBQyxDQUFDOztBQUVILFlBQUksR0FBRyxFQUFFO0FBQ1AsY0FBSSxXQUFXLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtBQUMxQixtQkFBTyxJQUFJLENBQUMseUJBQXlCLENBQUMsTUFBTSxFQUFFLFdBQVcsQ0FBQyxDQUFDLElBQUksQ0FBQyxZQUFNO0FBQ3BFLHFCQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7YUFDckMsQ0FBQyxTQUFNLENBQUMsVUFBQyxLQUFLLEVBQUs7QUFDbEIscUJBQU8sT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQzthQUM5QixDQUFDLENBQUM7V0FDSixNQUFNO0FBQ0wsbUJBQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztXQUNyQztTQUNGLE1BQU07QUFDTCxpQkFBTyxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxZQUFNO0FBQzFDLGdCQUFJLFdBQVcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO0FBQzFCLHFCQUFPLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxNQUFNLEVBQUUsV0FBVyxDQUFDLENBQUMsSUFBSSxDQUFDLFlBQU07QUFDcEUsdUJBQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztlQUNyQyxDQUFDLFNBQU0sQ0FBQyxVQUFDLEtBQUssRUFBSztBQUNsQix1QkFBTyxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO2VBQzlCLENBQUMsQ0FBQzthQUNKLE1BQU07QUFDTCxxQkFBTyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO2FBQ3JDO1dBQ0YsQ0FBQyxTQUFNLENBQUMsVUFBQyxLQUFLLEVBQUs7QUFDbEIsbUJBQU8sT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztXQUM5QixDQUFDLENBQUM7U0FDSjtPQUNGLENBQUMsU0FBTSxDQUFDLFVBQUMsS0FBSyxFQUFLO0FBQ2xCLGVBQU8sT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztPQUM5QixDQUFDLENBQUM7S0FDSjs7O1dBRWMseUJBQUMsVUFBVSxFQUFFLFNBQVMsRUFBRTtBQUNyQyxVQUFNLElBQUksR0FBRyxJQUFJLENBQUM7QUFDbEIsVUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsMkJBQTJCLEVBQUUsVUFBVSxDQUFDLENBQUM7O0FBRTVELGFBQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsWUFBTTtBQUMxQixlQUFPLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxJQUFJLENBQUMsVUFBQyxNQUFNLEVBQUs7QUFDckMsaUJBQU8sTUFBTSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQUMsTUFBTSxFQUFLO0FBQzVELG1CQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUM7V0FDaEMsQ0FBQyxTQUFNLENBQUMsVUFBQyxLQUFLLEVBQUs7QUFBRSxtQkFBTyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztXQUFFLENBQUMsQ0FBQztTQUMvRCxDQUFDLFNBQU0sQ0FBQyxVQUFDLEtBQUssRUFBSztBQUFFLGlCQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO1NBQUUsQ0FBQyxDQUFDO09BQy9ELEVBQUUsRUFBRSxRQUFRLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztLQUNyQjs7O1dBRWMseUJBQUMsVUFBVSxFQUFFO0FBQzFCLFVBQU0sSUFBSSxHQUFHLElBQUksQ0FBQztBQUNsQixVQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSwyQkFBMkIsRUFBRSxVQUFVLENBQUMsQ0FBQzs7QUFFNUQsYUFBTyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxZQUFNO0FBQzFCLGVBQU8sSUFBSSxDQUFDLGdCQUFnQixDQUFDLFVBQVUsQ0FBQyxDQUFDO09BQzFDLEVBQUUsRUFBRSxRQUFRLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztLQUN0Qjs7O1dBRWUsMEJBQUMsVUFBVSxFQUFFO0FBQzNCLFVBQU0sSUFBSSxHQUFHLElBQUksQ0FBQzs7QUFFbEIsVUFBSSxDQUFDLFVBQVUsSUFBSSxVQUFVLElBQUksR0FBRyxFQUFFO0FBQ3BDLGVBQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztPQUNwQzs7QUFFRCxhQUFPLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxJQUFJLENBQUMsVUFBQyxNQUFNLEVBQUs7QUFDckMsWUFBSSxTQUFTLEdBQUcsVUFBVSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUN0QyxpQkFBUyxDQUFDLEdBQUcsRUFBRSxDQUFDO0FBQ2hCLGlCQUFTLEdBQUcsU0FBUyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQzs7QUFFaEMsZUFBTyxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFDLElBQUksRUFBSztBQUMzQyxjQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQUMsSUFBSSxFQUFLO0FBQzVCLG1CQUFPLElBQUksQ0FBQyxJQUFJLElBQUksVUFBVSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztXQUN4RCxDQUFDLENBQUM7QUFDSCxjQUFJLEdBQUcsRUFBRTtBQUNQLG1CQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLENBQUM7V0FDcEM7QUFDRCxpQkFBTyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxFQUFFLE9BQU8sRUFBRSx1QkFBdUIsRUFBRSxDQUFDLENBQUM7U0FDcEUsQ0FBQyxTQUFNLENBQUMsVUFBQyxLQUFLLEVBQUs7QUFBRSxpQkFBTyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztTQUFFLENBQUMsQ0FBQztPQUMvRCxDQUFDLFNBQU0sQ0FBQyxVQUFDLEtBQUssRUFBSztBQUFFLGVBQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7T0FBRSxDQUFDLENBQUM7S0FDL0Q7OztXQUVhLHdCQUFDLFVBQVUsRUFBRSxXQUFXLEVBQUU7QUFDdEMsVUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDO0FBQ2xCLFVBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLDBCQUEwQixFQUFFLFVBQVUsR0FBRyxHQUFHLEdBQUcsV0FBVyxDQUFDLENBQUM7O0FBRS9FLGFBQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsWUFBTTtBQUMxQixlQUFPLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxJQUFJLENBQUMsVUFBQyxNQUFNLEVBQUs7QUFDckMsaUJBQU8sTUFBTSxDQUFDLEtBQUssQ0FBQyxVQUFVLEVBQUUsV0FBVyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQUMsWUFBWSxFQUFLO0FBQ2xFLG1CQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsWUFBWSxDQUFDLENBQUM7V0FDdEMsQ0FBQyxTQUFNLENBQUMsVUFBQyxLQUFLLEVBQUs7QUFBRSxtQkFBTyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztXQUFFLENBQUMsQ0FBQztTQUMvRCxDQUFDLFNBQU0sQ0FBQyxVQUFDLEtBQUssRUFBSztBQUFFLGlCQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO1NBQUUsQ0FBQyxDQUFDO09BQy9ELEVBQUUsRUFBRSxRQUFRLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztLQUNyQjs7O1dBRVMsb0JBQUMsU0FBUyxFQUFnQjtVQUFkLFFBQVEseURBQUcsQ0FBQzs7QUFDaEMsVUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDO0FBQ2xCLFVBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLHNCQUFzQixFQUFFLFNBQVMsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLFNBQVMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7O0FBRWhHLFVBQUksT0FBTyxHQUFHLFNBQVMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNuRCxhQUFPLENBQUMsR0FBRyxFQUFFLENBQUM7O0FBRWQsYUFBTyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxZQUFNO0FBQzFCLGVBQU8sSUFBSSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBTTtBQUN6RCxpQkFBTyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsSUFBSSxDQUFDLFVBQUMsTUFBTSxFQUFLO0FBQ3JDLG1CQUFPLE1BQU0sQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQUMsVUFBVSxFQUFLO0FBQ2hELHVCQUFTLENBQUMsWUFBWSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQ25DLHFCQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLENBQUM7YUFDcEMsQ0FBQyxTQUFNLENBQUMsVUFBQyxLQUFLLEVBQUs7QUFDbEIsdUJBQVMsQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDaEMscUJBQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7YUFDckMsQ0FBQyxDQUFDO1dBQ0osQ0FBQyxTQUFNLENBQUMsVUFBQyxLQUFLLEVBQUs7QUFDbEIscUJBQVMsQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDaEMsbUJBQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7V0FDckMsQ0FBQyxDQUFDO1NBQ0osQ0FBQyxTQUFNLENBQUMsVUFBQyxLQUFLLEVBQUs7QUFDbEIsbUJBQVMsQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDaEMsaUJBQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7U0FDckMsQ0FBQyxDQUFDO09BQ0osRUFBRSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsQ0FBQyxDQUFDO0tBQzVCOzs7V0FFVyxzQkFBQyxTQUFTLEVBQWdCO1VBQWQsUUFBUSx5REFBRyxDQUFDOztBQUNsQyxVQUFNLElBQUksR0FBRyxJQUFJLENBQUM7QUFDbEIsVUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsd0JBQXdCLEVBQUUsU0FBUyxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsU0FBUyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQzs7QUFFbEcsYUFBTyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxZQUFNO0FBQzFCLGVBQU8sSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLElBQUksQ0FBQyxVQUFDLE1BQU0sRUFBSztBQUNyQyxpQkFBTyxNQUFNLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFDLFNBQVMsRUFBSztBQUMvQyxxQkFBUyxDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUNuQyxtQkFBTyxJQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1dBQ25DLENBQUMsU0FBTSxDQUFDLFVBQUMsS0FBSyxFQUFLO0FBQ2xCLHFCQUFTLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ2hDLG1CQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO1dBQ3JDLENBQUMsQ0FBQztTQUNKLENBQUMsU0FBTSxDQUFDLFVBQUMsS0FBSyxFQUFLO0FBQ2xCLG1CQUFTLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ2hDLGlCQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO1NBQ3JDLENBQUMsQ0FBQztPQUNKLEVBQUUsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLENBQUMsQ0FBQztLQUM1Qjs7O1dBRVMsb0JBQUMsVUFBVSxFQUFFO0FBQ3JCLFVBQU0sSUFBSSxHQUFHLElBQUksQ0FBQztBQUNsQixVQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxVQUFVLENBQUMsQ0FBQzs7QUFFdkQsYUFBTyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxZQUFNO0FBQzFCLGVBQU8sSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLElBQUksQ0FBQyxVQUFDLE1BQU0sRUFBSztBQUNyQyxpQkFBTyxNQUFNLFVBQU8sQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBTTtBQUNqRCxtQkFBTyxJQUFJLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO1dBQzNDLENBQUMsU0FBTSxDQUFDLFVBQUMsS0FBSyxFQUFLO0FBQUUsbUJBQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7V0FBRSxDQUFDLENBQUM7U0FDL0QsQ0FBQyxTQUFNLENBQUMsVUFBQyxLQUFLLEVBQUs7QUFBRSxpQkFBTyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztTQUFFLENBQUMsQ0FBQztPQUMvRCxFQUFFLEVBQUUsUUFBUSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7S0FDckI7OztXQUVTLG9CQUFDLFVBQVUsRUFBRTtBQUNyQixVQUFNLElBQUksR0FBRyxJQUFJLENBQUM7QUFDbEIsVUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsc0JBQXNCLEVBQUUsVUFBVSxDQUFDLENBQUM7O0FBRXZELGFBQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsWUFBTTtBQUMxQixlQUFPLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxJQUFJLENBQUMsVUFBQyxNQUFNLEVBQUs7QUFDckMsY0FBSSxTQUFTLEdBQUcsVUFBVSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUN0QyxtQkFBUyxDQUFDLEdBQUcsRUFBRSxDQUFDO0FBQ2hCLG1CQUFTLEdBQUcsU0FBUyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQzs7QUFFaEMsaUJBQU8sTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBQyxJQUFJLEVBQUs7QUFDM0MsZ0JBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBQyxJQUFJLEVBQUs7QUFDN0IscUJBQU8sSUFBSSxDQUFDLElBQUksSUFBSSxVQUFVLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ3hELENBQUMsQ0FBQztBQUNILGdCQUFJLElBQUksRUFBRTtBQUNSLHFCQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLENBQUM7YUFDcEM7QUFDRCxtQkFBTyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxFQUFFLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxDQUFDLENBQUM7V0FDL0QsQ0FBQyxTQUFNLENBQUMsVUFBQyxLQUFLLEVBQUs7QUFBRSxtQkFBTyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztXQUFFLENBQUMsQ0FBQztTQUMvRCxDQUFDLFNBQU0sQ0FBQyxVQUFDLEtBQUssRUFBSztBQUFFLGlCQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO1NBQUUsQ0FBQyxDQUFDO09BQy9ELEVBQUUsRUFBRSxRQUFRLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztLQUN0Qjs7O1dBRVEsbUJBQUMsVUFBVSxFQUFFLFdBQVcsRUFBRTtBQUNqQyxVQUFNLElBQUksR0FBRyxJQUFJLENBQUM7QUFDbEIsVUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUscUJBQXFCLEVBQUUsVUFBVSxHQUFHLEdBQUcsR0FBRyxXQUFXLENBQUMsQ0FBQzs7QUFFMUUsYUFBTyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxZQUFNO0FBQzFCLGVBQU8sSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLElBQUksQ0FBQyxVQUFDLE1BQU0sRUFBSztBQUNyQyxpQkFBTyxNQUFNLENBQUMsS0FBSyxDQUFDLFVBQVUsRUFBRSxXQUFXLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBQyxZQUFZLEVBQUs7QUFDbEUsbUJBQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxZQUFZLENBQUMsQ0FBQztXQUN0QyxDQUFDLFNBQU0sQ0FBQyxVQUFDLEtBQUssRUFBSztBQUFFLG1CQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO1dBQUUsQ0FBQyxDQUFDO1NBQy9ELENBQUMsU0FBTSxDQUFDLFVBQUMsS0FBSyxFQUFLO0FBQUUsaUJBQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7U0FBRSxDQUFDLENBQUM7T0FDL0QsRUFBRSxFQUFFLFFBQVEsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0tBQ3JCOzs7V0FFSyxnQkFBQyxhQUFhLEVBQUUsYUFBYSxFQUFFO0FBQ25DLFVBQU0sSUFBSSxHQUFHLElBQUksQ0FBQztBQUNsQixVQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxhQUFhLEVBQUUsYUFBYSxDQUFDLENBQUM7O0FBRXJFLGFBQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsWUFBTTtBQUMxQixlQUFPLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxJQUFJLENBQUMsVUFBQyxNQUFNLEVBQUs7QUFDckMsaUJBQU8sTUFBTSxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsSUFBSSxFQUFFLEVBQUUsYUFBYSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFlBQU07QUFDMUUsbUJBQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxhQUFhLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztXQUM5QyxDQUFDLFNBQU0sQ0FBQyxVQUFDLEtBQUssRUFBSztBQUFFLG1CQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO1dBQUUsQ0FBQyxDQUFDO1NBQy9ELENBQUMsU0FBTSxDQUFDLFVBQUMsS0FBSyxFQUFLO0FBQUUsaUJBQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7U0FBRSxDQUFDLENBQUM7T0FDL0QsRUFBRSxFQUFFLFFBQVEsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0tBQ3JCOzs7U0E3WGtCLFNBQVM7R0FBUyxZQUFZOztxQkFBOUIsU0FBUyIsImZpbGUiOiIvaG9tZS9hbmFubWF5amFpbi8uYXRvbS9wYWNrYWdlcy9mdHAtcmVtb3RlLWVkaXQvbGliL2Nvbm5lY3RvcnMvY29ubmVjdG9yLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbmNvbnN0IGZ0cENsaWVudCA9IHJlcXVpcmUoJy4vZnRwJyk7XG5jb25zdCBzZnRwQ2xpZW50ID0gcmVxdWlyZSgnLi9zZnRwJyk7XG5jb25zdCBFdmVudEVtaXR0ZXIgPSByZXF1aXJlKCdldmVudHMnKTtcbmNvbnN0IFBRdWV1ZSA9IHJlcXVpcmUoJ3AtcXVldWUnKTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ29ubmVjdG9yIGV4dGVuZHMgRXZlbnRFbWl0dGVyIHtcblxuICBjb25zdHJ1Y3Rvcihjb25uZWN0aW9uKSB7XG4gICAgc3VwZXIoKTtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcblxuICAgIHNlbGYuY29ubmVjdGlvbiA9IGNvbm5lY3Rpb247XG4gICAgc2VsZi5jbGllbnQgPSBudWxsO1xuICAgIHNlbGYucXVldWUgPSBuZXcgUFF1ZXVlKHsgY29uY3VycmVuY3k6IDEgfSk7XG5cbiAgICBpZiAoc2VsZi5jb25uZWN0aW9uLnNmdHAgPT09IHRydWUgfHwgc2VsZi5jb25uZWN0aW9uLnVzZUFnZW50ID09PSB0cnVlKSB7XG4gICAgICBzZWxmLmNsaWVudCA9IG5ldyBzZnRwQ2xpZW50KCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHNlbGYuY2xpZW50ID0gbmV3IGZ0cENsaWVudCgpO1xuICAgIH1cblxuICAgIC8vIEV2ZW50c1xuICAgIHNlbGYuY2xpZW50Lm9uKCdkZWJ1ZycsIChtc2cpID0+IHtcbiAgICAgIHNlbGYuZW1pdCgnZGVidWcnLCBtc2cpO1xuICAgIH0pO1xuICAgIHNlbGYuY2xpZW50Lm9uKCdsb2cnLCAobXNnKSA9PiB7XG4gICAgICBzZWxmLmVtaXQoJ2xvZycsIG1zZyk7XG4gICAgfSk7XG4gIH1cblxuICAvLyBUZWFyIGRvd24gYW55IHN0YXRlIGFuZCBkZXRhY2hcbiAgZGVzdHJveSgpIHtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcblxuICAgIHJldHVybiBzZWxmLmFib3J0QWxsKCkudGhlbigoKSA9PiB7XG4gICAgICByZXR1cm4gc2VsZi5jbGllbnQuZW5kKCk7XG4gICAgfSkuY2F0Y2goKGVycm9yKSA9PiB7XG4gICAgICByZXR1cm4gc2VsZi5jbGllbnQuZW5kKCk7XG4gICAgfSk7XG4gIH1cblxuICBjb25uZWN0KCkge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuICAgIHNlbGYuZW1pdCgnZGVidWcnLCAnY29ubmVjdG9yOmNvbm5lY3QnKTtcblxuICAgIC8vIEtlZXAgY29ubmVjdGlvbiBhbGl2ZVxuICAgIGlmIChzZWxmLmNsaWVudC5pc0Nvbm5lY3RlZCgpKSB7XG4gICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICByZXNvbHZlKHNlbGYuY2xpZW50KTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHRyeSB7XG4gICAgICAvLyBTdGFydCBuZXcgY29ubmVjdGlvblxuICAgICAgcmV0dXJuIHNlbGYuY2xpZW50LmNvbm5lY3Qoc2VsZi5jb25uZWN0aW9uKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY29uc29sZS5sb2coZXJyb3IpXG4gICAgICByZXR1cm4gc2VsZi5kaXNjb25uZWN0KG51bGwsIGVycm9yKTtcbiAgICB9XG4gIH1cblxuICBkaXNjb25uZWN0KHJlc3VsdCwgZXJyb3IpIHtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcbiAgICBzZWxmLmVtaXQoJ2RlYnVnJywgJ2Nvbm5lY3RvcjpkaXNjb25uZWN0Jyk7XG5cbiAgICAvLyBLZWVwIGNvbm5lY3Rpb24gYWxpdmVcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgaWYgKHJlc3VsdCkgcmVzb2x2ZShyZXN1bHQpO1xuICAgICAgaWYgKGVycm9yKSByZWplY3QoZXJyb3IpO1xuICAgIH0pO1xuXG4gICAgLy8gcmV0dXJuIHNlbGYuY2xpZW50LmVuZCgpXG4gICAgLy8gICAudGhlbigoKSA9PiB7XG4gICAgLy8gICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgLy8gICAgICAgaWYgKHJlc3VsdCkgcmVzb2x2ZShyZXN1bHQpO1xuICAgIC8vICAgICAgIGlmIChlcnJvcikgcmVqZWN0KGVycm9yKTtcbiAgICAvLyAgICAgfSk7XG4gICAgLy8gICB9KVxuICAgIC8vICAgLmNhdGNoKCgpID0+IHtcbiAgICAvLyAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAvLyAgICAgICBpZiAocmVzdWx0KSByZXNvbHZlKHJlc3VsdCk7XG4gICAgLy8gICAgICAgaWYgKGVycm9yKSByZWplY3QoZXJyb3IpO1xuICAgIC8vICAgICB9KTtcbiAgICAvLyAgIH0pO1xuICB9XG5cbiAgYWJvcnQoKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gICAgc2VsZi5lbWl0KCdkZWJ1ZycsICdjb25uZWN0b3I6YWJvcnQnKTtcblxuICAgIGlmICghc2VsZi5jbGllbnQuaXNDb25uZWN0ZWQoKSkgcmV0dXJuIHNlbGYuZGlzY29ubmVjdCh0cnVlKTtcblxuICAgIHJldHVybiBzZWxmLmNvbm5lY3QoKS50aGVuKChDbGllbnQpID0+IHtcbiAgICAgIHJldHVybiBDbGllbnQuYWJvcnQoKCkgPT4ge1xuICAgICAgICByZXR1cm4gc2VsZi5kaXNjb25uZWN0KHRydWUpO1xuICAgICAgfSk7XG4gICAgfSkuY2F0Y2goKGVycm9yKSA9PiB7XG4gICAgICByZXR1cm4gc2VsZi5kaXNjb25uZWN0KG51bGwsIGVycm9yKTtcbiAgICB9KTtcbiAgfVxuXG4gIGFib3J0QWxsKCkge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuICAgIHNlbGYuZW1pdCgnZGVidWcnLCAnY29ubmVjdG9yOmFib3J0QWxsJyk7XG5cbiAgICBzZWxmLnF1ZXVlLmNsZWFyKCk7XG5cbiAgICBpZiAoIXNlbGYuY2xpZW50LmlzQ29ubmVjdGVkKCkpIHJldHVybiBzZWxmLmRpc2Nvbm5lY3QodHJ1ZSk7XG5cbiAgICByZXR1cm4gc2VsZi5jb25uZWN0KCkudGhlbigoQ2xpZW50KSA9PiB7XG4gICAgICByZXR1cm4gQ2xpZW50LmFib3J0KCgpID0+IHtcbiAgICAgICAgcmV0dXJuIHNlbGYuZGlzY29ubmVjdCh0cnVlKTtcbiAgICAgIH0pO1xuICAgIH0pLmNhdGNoKChlcnJvcikgPT4ge1xuICAgICAgcmV0dXJuIHNlbGYuZGlzY29ubmVjdChudWxsLCBlcnJvcik7XG4gICAgfSk7XG4gIH1cblxuICBsaXN0RGlyZWN0b3J5KHJlbW90ZVBhdGgpIHtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcbiAgICBzZWxmLmVtaXQoJ2RlYnVnJywgJ2Nvbm5lY3RvcjpsaXN0RGlyZWN0b3J5JywgcmVtb3RlUGF0aCk7XG5cbiAgICByZXR1cm4gc2VsZi5xdWV1ZS5hZGQoKCkgPT4ge1xuICAgICAgcmV0dXJuIHNlbGYuY29ubmVjdCgpLnRoZW4oKENsaWVudCkgPT4ge1xuICAgICAgICByZXR1cm4gQ2xpZW50Lmxpc3QocmVtb3RlUGF0aC50cmltKCkpLnRoZW4oKHJlc3VsdCkgPT4ge1xuICAgICAgICAgIHJldHVybiBzZWxmLmRpc2Nvbm5lY3QocmVzdWx0KTtcbiAgICAgICAgfSkuY2F0Y2goKGVycm9yKSA9PiB7IHJldHVybiBzZWxmLmRpc2Nvbm5lY3QobnVsbCwgZXJyb3IpOyB9KTtcbiAgICAgIH0pLmNhdGNoKChlcnJvcikgPT4ge1xuICAgICAgICByZXR1cm4gc2VsZi5kaXNjb25uZWN0KG51bGwsIGVycm9yKTtcbiAgICAgIH0pO1xuICAgIH0sIHsgcHJpb3JpdHk6IDEwIH0pO1xuICB9XG5cbiAgY3JlYXRlRGlyZWN0b3J5KHJlbW90ZVBhdGgpIHtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcbiAgICBzZWxmLmVtaXQoJ2RlYnVnJywgJ2Nvbm5lY3RvcjpjcmVhdGVEaXJlY3RvcnknLCByZW1vdGVQYXRoKTtcblxuICAgIHJldHVybiBzZWxmLnF1ZXVlLmFkZCgoKSA9PiB7XG4gICAgICByZXR1cm4gc2VsZi5fY3JlYXRlRGlyZWN0b3J5KHJlbW90ZVBhdGgpO1xuICAgIH0sIHsgcHJpb3JpdHk6IDkgfSk7XG4gIH1cblxuICBfY3JlYXRlRGlyZWN0b3J5KHJlbW90ZVBhdGgpIHtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcblxuICAgIC8vIENoZWNrIGRpcmVjdG9yeSBhbHJlYWR5IGV4aXN0c1xuICAgIHJldHVybiBzZWxmLl9leGlzdHNEaXJlY3RvcnkocmVtb3RlUGF0aC50cmltKCkpLnRoZW4oKCkgPT4ge1xuICAgICAgLy8gRGlyZWN0b3J5IGFscmVhZHkgZXhpc3RzXG4gICAgICAvLyBOb3RoaW5nIHRvIGRvXG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHJlbW90ZVBhdGgudHJpbSgpKTtcbiAgICB9KS5jYXRjaCgoKSA9PiB7XG4gICAgICAvLyBEaXJlY3Rvcnkgbm90IGV4aXN0cyBhbmQgbXVzdCBiZSBjcmVhdGVkXG4gICAgICByZXR1cm4gc2VsZi5jb25uZWN0KCkudGhlbigoQ2xpZW50KSA9PiB7XG5cbiAgICAgICAgbGV0IHBhdGhzID0gW107XG4gICAgICAgIHJlbW90ZVBhdGguc3BsaXQoJy8nKS5yZWR1Y2UoKHBhdGgsIGRpcikgPT4ge1xuICAgICAgICAgIHBhdGggKz0gJy8nICsgZGlyLnRyaW0oKTtcbiAgICAgICAgICBwYXRocy5wdXNoKHBhdGgpO1xuICAgICAgICAgIHJldHVybiBwYXRoO1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyBXYWxrIHJlY3Vyc2l2ZSB0aHJvdWdoIGRpcmVjdG9yeSB0cmVlIGFuZCBjcmVhdGUgbm9uIGV4aXN0aW5nIGRpcmVjdG9yaWVzXG4gICAgICAgIHJldHVybiBzZWxmLl9jcmVhdGVEaXJlY3RvcnlTdHJ1Y3R1cmUoQ2xpZW50LCBwYXRocykudGhlbigoKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIHNlbGYuZGlzY29ubmVjdChyZW1vdGVQYXRoLnRyaW0oKSk7XG4gICAgICAgIH0pLmNhdGNoKChlcnJvcikgPT4ge1xuICAgICAgICAgIHJldHVybiBzZWxmLmRpc2Nvbm5lY3QobnVsbCwgZXJyb3IpO1xuICAgICAgICB9KTtcbiAgICAgIH0pLmNhdGNoKChlcnJvcikgPT4ge1xuICAgICAgICByZXR1cm4gc2VsZi5kaXNjb25uZWN0KG51bGwsIGVycm9yKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgX2NyZWF0ZURpcmVjdG9yeVN0cnVjdHVyZShDbGllbnQsIHJlbW90ZVBhdGhzKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gICAgc2VsZi5lbWl0KCdkZWJ1ZycsICdjb25uZWN0b3I6Y3JlYXRlRGlyZWN0b3J5U3RydWN0dXJlJywgcmVtb3RlUGF0aHMpO1xuXG4gICAgbGV0IHBhdGggPSByZW1vdGVQYXRocy5zaGlmdCgpO1xuICAgIGxldCBkaXJlY3RvcnkgPSBwYXRoLnNwbGl0KCcvJyk7XG4gICAgZGlyZWN0b3J5LnBvcCgpO1xuICAgIGRpcmVjdG9yeSA9IGRpcmVjdG9yeS5qb2luKCcvJyk7XG4gICAgaWYgKCFkaXJlY3RvcnkpIGRpcmVjdG9yeSA9ICcvJztcblxuICAgIC8vIFdhbGsgcmVjdXJzaXZlIHRocm91Z2ggZGlyZWN0b3J5IHRyZWUgYW5kIGNyZWF0ZSBub24gZXhpc3RpbmcgZGlyZWN0b3JpZXNcbiAgICByZXR1cm4gQ2xpZW50Lmxpc3QoZGlyZWN0b3J5KS50aGVuKChsaXN0KSA9PiB7XG4gICAgICBsZXQgZGlyID0gbGlzdC5maW5kKChpdGVtKSA9PiB7XG4gICAgICAgIHJldHVybiBpdGVtLm5hbWUgPT0gcGF0aC5zcGxpdCgnLycpLnNsaWNlKC0xKVswXTtcbiAgICAgIH0pO1xuXG4gICAgICBpZiAoZGlyKSB7XG4gICAgICAgIGlmIChyZW1vdGVQYXRocy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgcmV0dXJuIHNlbGYuX2NyZWF0ZURpcmVjdG9yeVN0cnVjdHVyZShDbGllbnQsIHJlbW90ZVBhdGhzKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUocGF0aC50cmltKCkpO1xuICAgICAgICAgIH0pLmNhdGNoKChlcnJvcikgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KGVycm9yKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHBhdGgudHJpbSgpKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIENsaWVudC5ta2RpcihwYXRoLnRyaW0oKSkudGhlbigoKSA9PiB7XG4gICAgICAgICAgaWYgKHJlbW90ZVBhdGhzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHJldHVybiBzZWxmLl9jcmVhdGVEaXJlY3RvcnlTdHJ1Y3R1cmUoQ2xpZW50LCByZW1vdGVQYXRocykudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUocGF0aC50cmltKCkpO1xuICAgICAgICAgICAgfSkuY2F0Y2goKGVycm9yKSA9PiB7XG4gICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChlcnJvcik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShwYXRoLnRyaW0oKSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KS5jYXRjaCgoZXJyb3IpID0+IHtcbiAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QoZXJyb3IpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9KS5jYXRjaCgoZXJyb3IpID0+IHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChlcnJvcik7XG4gICAgfSk7XG4gIH1cblxuICBkZWxldGVEaXJlY3RvcnkocmVtb3RlUGF0aCwgcmVjdXJzaXZlKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gICAgc2VsZi5lbWl0KCdkZWJ1ZycsICdjb25uZWN0b3I6ZGVsZXRlRGlyZWN0b3J5JywgcmVtb3RlUGF0aCk7XG5cbiAgICByZXR1cm4gc2VsZi5xdWV1ZS5hZGQoKCkgPT4ge1xuICAgICAgcmV0dXJuIHNlbGYuY29ubmVjdCgpLnRoZW4oKENsaWVudCkgPT4ge1xuICAgICAgICByZXR1cm4gQ2xpZW50LnJtZGlyKHJlbW90ZVBhdGgudHJpbSgpLCB0cnVlKS50aGVuKChyZXN1bHQpID0+IHtcbiAgICAgICAgICByZXR1cm4gc2VsZi5kaXNjb25uZWN0KHJlc3VsdCk7XG4gICAgICAgIH0pLmNhdGNoKChlcnJvcikgPT4geyByZXR1cm4gc2VsZi5kaXNjb25uZWN0KG51bGwsIGVycm9yKTsgfSk7XG4gICAgICB9KS5jYXRjaCgoZXJyb3IpID0+IHsgcmV0dXJuIHNlbGYuZGlzY29ubmVjdChudWxsLCBlcnJvcik7IH0pO1xuICAgIH0sIHsgcHJpb3JpdHk6IDYgfSk7XG4gIH1cblxuICBleGlzdHNEaXJlY3RvcnkocmVtb3RlUGF0aCkge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuICAgIHNlbGYuZW1pdCgnZGVidWcnLCAnY29ubmVjdG9yOmV4aXN0c0RpcmVjdG9yeScsIHJlbW90ZVBhdGgpO1xuXG4gICAgcmV0dXJuIHNlbGYucXVldWUuYWRkKCgpID0+IHtcbiAgICAgIHJldHVybiBzZWxmLl9leGlzdHNEaXJlY3RvcnkocmVtb3RlUGF0aCk7XG4gICAgfSwgeyBwcmlvcml0eTogMTAgfSk7XG4gIH1cblxuICBfZXhpc3RzRGlyZWN0b3J5KHJlbW90ZVBhdGgpIHtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcblxuICAgIGlmICghcmVtb3RlUGF0aCB8fCByZW1vdGVQYXRoID09ICcvJykge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShyZW1vdGVQYXRoKTtcbiAgICB9XG5cbiAgICByZXR1cm4gc2VsZi5jb25uZWN0KCkudGhlbigoQ2xpZW50KSA9PiB7XG4gICAgICBsZXQgZGlyZWN0b3J5ID0gcmVtb3RlUGF0aC5zcGxpdCgnLycpO1xuICAgICAgZGlyZWN0b3J5LnBvcCgpO1xuICAgICAgZGlyZWN0b3J5ID0gZGlyZWN0b3J5LmpvaW4oJy8nKTtcblxuICAgICAgcmV0dXJuIENsaWVudC5saXN0KGRpcmVjdG9yeSkudGhlbigobGlzdCkgPT4ge1xuICAgICAgICBsZXQgZGlyID0gbGlzdC5maW5kKChpdGVtKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIGl0ZW0ubmFtZSA9PSByZW1vdGVQYXRoLnNwbGl0KCcvJykuc2xpY2UoLTEpWzBdO1xuICAgICAgICB9KTtcbiAgICAgICAgaWYgKGRpcikge1xuICAgICAgICAgIHJldHVybiBzZWxmLmRpc2Nvbm5lY3QocmVtb3RlUGF0aCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHNlbGYuZGlzY29ubmVjdChudWxsLCB7IG1lc3NhZ2U6ICdEaXJlY3Rvcnkgbm90IGV4aXN0cy4nIH0pO1xuICAgICAgfSkuY2F0Y2goKGVycm9yKSA9PiB7IHJldHVybiBzZWxmLmRpc2Nvbm5lY3QobnVsbCwgZXJyb3IpOyB9KTtcbiAgICB9KS5jYXRjaCgoZXJyb3IpID0+IHsgcmV0dXJuIHNlbGYuZGlzY29ubmVjdChudWxsLCBlcnJvcik7IH0pO1xuICB9XG5cbiAgY2htb2REaXJlY3RvcnkocmVtb3RlUGF0aCwgcGVybWlzc2lvbnMpIHtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcbiAgICBzZWxmLmVtaXQoJ2RlYnVnJywgJ2Nvbm5lY3RvcjpjaG1vZERpcmVjdG9yeScsIHJlbW90ZVBhdGggKyAnICcgKyBwZXJtaXNzaW9ucyk7XG5cbiAgICByZXR1cm4gc2VsZi5xdWV1ZS5hZGQoKCkgPT4ge1xuICAgICAgcmV0dXJuIHNlbGYuY29ubmVjdCgpLnRoZW4oKENsaWVudCkgPT4ge1xuICAgICAgICByZXR1cm4gQ2xpZW50LmNobW9kKHJlbW90ZVBhdGgsIHBlcm1pc3Npb25zKS50aGVuKChyZXNwb25zZVRleHQpID0+IHtcbiAgICAgICAgICByZXR1cm4gc2VsZi5kaXNjb25uZWN0KHJlc3BvbnNlVGV4dCk7XG4gICAgICAgIH0pLmNhdGNoKChlcnJvcikgPT4geyByZXR1cm4gc2VsZi5kaXNjb25uZWN0KG51bGwsIGVycm9yKTsgfSk7XG4gICAgICB9KS5jYXRjaCgoZXJyb3IpID0+IHsgcmV0dXJuIHNlbGYuZGlzY29ubmVjdChudWxsLCBlcnJvcik7IH0pO1xuICAgIH0sIHsgcHJpb3JpdHk6IDUgfSk7XG4gIH1cblxuICB1cGxvYWRGaWxlKHF1ZXVlSXRlbSwgcHJpb3JpdHkgPSA4KSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gICAgc2VsZi5lbWl0KCdkZWJ1ZycsICdjb25uZWN0b3I6dXBsb2FkRmlsZScsIHF1ZXVlSXRlbS5pbmZvLnJlbW90ZVBhdGgsIHF1ZXVlSXRlbS5pbmZvLmxvY2FsUGF0aCk7XG5cbiAgICBsZXQgYXJyUGF0aCA9IHF1ZXVlSXRlbS5pbmZvLnJlbW90ZVBhdGguc3BsaXQoJy8nKTtcbiAgICBhcnJQYXRoLnBvcCgpO1xuXG4gICAgcmV0dXJuIHNlbGYucXVldWUuYWRkKCgpID0+IHtcbiAgICAgIHJldHVybiBzZWxmLl9jcmVhdGVEaXJlY3RvcnkoYXJyUGF0aC5qb2luKCcvJykpLnRoZW4oKCkgPT4ge1xuICAgICAgICByZXR1cm4gc2VsZi5jb25uZWN0KCkudGhlbigoQ2xpZW50KSA9PiB7XG4gICAgICAgICAgcmV0dXJuIENsaWVudC5wdXQocXVldWVJdGVtKS50aGVuKChyZW1vdGVQYXRoKSA9PiB7XG4gICAgICAgICAgICBxdWV1ZUl0ZW0uY2hhbmdlU3RhdHVzKCdGaW5pc2hlZCcpO1xuICAgICAgICAgICAgcmV0dXJuIHNlbGYuZGlzY29ubmVjdChyZW1vdGVQYXRoKTtcbiAgICAgICAgICB9KS5jYXRjaCgoZXJyb3IpID0+IHtcbiAgICAgICAgICAgIHF1ZXVlSXRlbS5jaGFuZ2VTdGF0dXMoJ0Vycm9yJyk7XG4gICAgICAgICAgICByZXR1cm4gc2VsZi5kaXNjb25uZWN0KG51bGwsIGVycm9yKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSkuY2F0Y2goKGVycm9yKSA9PiB7XG4gICAgICAgICAgcXVldWVJdGVtLmNoYW5nZVN0YXR1cygnRXJyb3InKTtcbiAgICAgICAgICByZXR1cm4gc2VsZi5kaXNjb25uZWN0KG51bGwsIGVycm9yKTtcbiAgICAgICAgfSk7XG4gICAgICB9KS5jYXRjaCgoZXJyb3IpID0+IHtcbiAgICAgICAgcXVldWVJdGVtLmNoYW5nZVN0YXR1cygnRXJyb3InKTtcbiAgICAgICAgcmV0dXJuIHNlbGYuZGlzY29ubmVjdChudWxsLCBlcnJvcik7XG4gICAgICB9KTtcbiAgICB9LCB7IHByaW9yaXR5OiBwcmlvcml0eSB9KTtcbiAgfVxuXG4gIGRvd25sb2FkRmlsZShxdWV1ZUl0ZW0sIHByaW9yaXR5ID0gNykge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuICAgIHNlbGYuZW1pdCgnZGVidWcnLCAnY29ubmVjdG9yOmRvd25sb2FkRmlsZScsIHF1ZXVlSXRlbS5pbmZvLnJlbW90ZVBhdGgsIHF1ZXVlSXRlbS5pbmZvLmxvY2FsUGF0aCk7XG5cbiAgICByZXR1cm4gc2VsZi5xdWV1ZS5hZGQoKCkgPT4ge1xuICAgICAgcmV0dXJuIHNlbGYuY29ubmVjdCgpLnRoZW4oKENsaWVudCkgPT4ge1xuICAgICAgICByZXR1cm4gQ2xpZW50LmdldChxdWV1ZUl0ZW0pLnRoZW4oKGxvY2FsUGF0aCkgPT4ge1xuICAgICAgICAgIHF1ZXVlSXRlbS5jaGFuZ2VTdGF0dXMoJ0ZpbmlzaGVkJyk7XG4gICAgICAgICAgcmV0dXJuIHNlbGYuZGlzY29ubmVjdChsb2NhbFBhdGgpO1xuICAgICAgICB9KS5jYXRjaCgoZXJyb3IpID0+IHtcbiAgICAgICAgICBxdWV1ZUl0ZW0uY2hhbmdlU3RhdHVzKCdFcnJvcicpO1xuICAgICAgICAgIHJldHVybiBzZWxmLmRpc2Nvbm5lY3QobnVsbCwgZXJyb3IpO1xuICAgICAgICB9KTtcbiAgICAgIH0pLmNhdGNoKChlcnJvcikgPT4ge1xuICAgICAgICBxdWV1ZUl0ZW0uY2hhbmdlU3RhdHVzKCdFcnJvcicpO1xuICAgICAgICByZXR1cm4gc2VsZi5kaXNjb25uZWN0KG51bGwsIGVycm9yKTtcbiAgICAgIH0pO1xuICAgIH0sIHsgcHJpb3JpdHk6IHByaW9yaXR5IH0pO1xuICB9XG5cbiAgZGVsZXRlRmlsZShyZW1vdGVQYXRoKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gICAgc2VsZi5lbWl0KCdkZWJ1ZycsICdjb25uZWN0b3I6ZGVsZXRlRmlsZScsIHJlbW90ZVBhdGgpO1xuXG4gICAgcmV0dXJuIHNlbGYucXVldWUuYWRkKCgpID0+IHtcbiAgICAgIHJldHVybiBzZWxmLmNvbm5lY3QoKS50aGVuKChDbGllbnQpID0+IHtcbiAgICAgICAgcmV0dXJuIENsaWVudC5kZWxldGUocmVtb3RlUGF0aC50cmltKCkpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgIHJldHVybiBzZWxmLmRpc2Nvbm5lY3QocmVtb3RlUGF0aC50cmltKCkpO1xuICAgICAgICB9KS5jYXRjaCgoZXJyb3IpID0+IHsgcmV0dXJuIHNlbGYuZGlzY29ubmVjdChudWxsLCBlcnJvcik7IH0pO1xuICAgICAgfSkuY2F0Y2goKGVycm9yKSA9PiB7IHJldHVybiBzZWxmLmRpc2Nvbm5lY3QobnVsbCwgZXJyb3IpOyB9KTtcbiAgICB9LCB7IHByaW9yaXR5OiA2IH0pO1xuICB9XG5cbiAgZXhpc3RzRmlsZShyZW1vdGVQYXRoKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gICAgc2VsZi5lbWl0KCdkZWJ1ZycsICdjb25uZWN0b3I6ZXhpc3RzRmlsZScsIHJlbW90ZVBhdGgpO1xuXG4gICAgcmV0dXJuIHNlbGYucXVldWUuYWRkKCgpID0+IHtcbiAgICAgIHJldHVybiBzZWxmLmNvbm5lY3QoKS50aGVuKChDbGllbnQpID0+IHtcbiAgICAgICAgbGV0IGRpcmVjdG9yeSA9IHJlbW90ZVBhdGguc3BsaXQoJy8nKTtcbiAgICAgICAgZGlyZWN0b3J5LnBvcCgpO1xuICAgICAgICBkaXJlY3RvcnkgPSBkaXJlY3Rvcnkuam9pbignLycpO1xuXG4gICAgICAgIHJldHVybiBDbGllbnQubGlzdChkaXJlY3RvcnkpLnRoZW4oKGxpc3QpID0+IHtcbiAgICAgICAgICBsZXQgZmlsZSA9IGxpc3QuZmluZCgoaXRlbSkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGl0ZW0ubmFtZSA9PSByZW1vdGVQYXRoLnNwbGl0KCcvJykuc2xpY2UoLTEpWzBdO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIGlmIChmaWxlKSB7XG4gICAgICAgICAgICByZXR1cm4gc2VsZi5kaXNjb25uZWN0KHJlbW90ZVBhdGgpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gc2VsZi5kaXNjb25uZWN0KG51bGwsIHsgbWVzc2FnZTogJ0ZpbGUgbm90IGV4aXN0cy4nIH0pO1xuICAgICAgICB9KS5jYXRjaCgoZXJyb3IpID0+IHsgcmV0dXJuIHNlbGYuZGlzY29ubmVjdChudWxsLCBlcnJvcik7IH0pO1xuICAgICAgfSkuY2F0Y2goKGVycm9yKSA9PiB7IHJldHVybiBzZWxmLmRpc2Nvbm5lY3QobnVsbCwgZXJyb3IpOyB9KTtcbiAgICB9LCB7IHByaW9yaXR5OiAxMCB9KTtcbiAgfVxuXG4gIGNobW9kRmlsZShyZW1vdGVQYXRoLCBwZXJtaXNzaW9ucykge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuICAgIHNlbGYuZW1pdCgnZGVidWcnLCAnY29ubmVjdG9yOmNobW9kRmlsZScsIHJlbW90ZVBhdGggKyAnICcgKyBwZXJtaXNzaW9ucyk7XG5cbiAgICByZXR1cm4gc2VsZi5xdWV1ZS5hZGQoKCkgPT4ge1xuICAgICAgcmV0dXJuIHNlbGYuY29ubmVjdCgpLnRoZW4oKENsaWVudCkgPT4ge1xuICAgICAgICByZXR1cm4gQ2xpZW50LmNobW9kKHJlbW90ZVBhdGgsIHBlcm1pc3Npb25zKS50aGVuKChyZXNwb25zZVRleHQpID0+IHtcbiAgICAgICAgICByZXR1cm4gc2VsZi5kaXNjb25uZWN0KHJlc3BvbnNlVGV4dCk7XG4gICAgICAgIH0pLmNhdGNoKChlcnJvcikgPT4geyByZXR1cm4gc2VsZi5kaXNjb25uZWN0KG51bGwsIGVycm9yKTsgfSk7XG4gICAgICB9KS5jYXRjaCgoZXJyb3IpID0+IHsgcmV0dXJuIHNlbGYuZGlzY29ubmVjdChudWxsLCBlcnJvcik7IH0pO1xuICAgIH0sIHsgcHJpb3JpdHk6IDUgfSk7XG4gIH1cblxuICByZW5hbWUob2xkUmVtb3RlUGF0aCwgbmV3UmVtb3RlUGF0aCkge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuICAgIHNlbGYuZW1pdCgnZGVidWcnLCAnY29ubmVjdG9yOnJlbmFtZScsIG9sZFJlbW90ZVBhdGgsIG5ld1JlbW90ZVBhdGgpO1xuXG4gICAgcmV0dXJuIHNlbGYucXVldWUuYWRkKCgpID0+IHtcbiAgICAgIHJldHVybiBzZWxmLmNvbm5lY3QoKS50aGVuKChDbGllbnQpID0+IHtcbiAgICAgICAgcmV0dXJuIENsaWVudC5yZW5hbWUob2xkUmVtb3RlUGF0aC50cmltKCksIG5ld1JlbW90ZVBhdGgudHJpbSgpKS50aGVuKCgpID0+IHtcbiAgICAgICAgICByZXR1cm4gc2VsZi5kaXNjb25uZWN0KG5ld1JlbW90ZVBhdGgudHJpbSgpKTtcbiAgICAgICAgfSkuY2F0Y2goKGVycm9yKSA9PiB7IHJldHVybiBzZWxmLmRpc2Nvbm5lY3QobnVsbCwgZXJyb3IpOyB9KTtcbiAgICAgIH0pLmNhdGNoKChlcnJvcikgPT4geyByZXR1cm4gc2VsZi5kaXNjb25uZWN0KG51bGwsIGVycm9yKTsgfSk7XG4gICAgfSwgeyBwcmlvcml0eTogNiB9KTtcbiAgfVxufVxuIl19