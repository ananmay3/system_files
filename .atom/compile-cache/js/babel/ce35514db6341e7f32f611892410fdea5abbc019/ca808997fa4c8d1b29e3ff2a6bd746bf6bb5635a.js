var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _helper = require('./helper');

'use babel';

/**
 * ssh2 sftp client for node
 * https://github.com/jyu213/ssh2-sftp-client
 */

'use strict';

var Client = require('ssh2').Client;
var osPath = require('path').posix;

var SftpClient = function SftpClient() {
  this.client = new Client();
};

/**
 * Retrieves a directory listing
 *
 * @param {String} path, a string containing the path to a directory
 * @return {Promise} data, list info
 */
SftpClient.prototype.list = function (path) {
  var _this = this;

  var reg = /-/gi;

  return new Promise(function (resolve, reject) {
    var sftp = _this.sftp;

    if (!sftp) {
      return reject(new Error('sftp connect error'));
    }
    sftp.readdir(path, function (err, list) {
      if (err) {
        reject(new Error('Failed to list ' + path + ': ' + err.message));
      } else {
        var newList = [];
        // reset file info
        if (list) {
          newList = list.map(function (item) {
            return {
              type: item.longname.substr(0, 1),
              name: item.filename,
              size: item.attrs.size,
              modifyTime: item.attrs.mtime * 1000,
              accessTime: item.attrs.atime * 1000,
              rights: {
                user: item.longname.substr(1, 3).replace(reg, ''),
                group: item.longname.substr(4, 3).replace(reg, ''),
                other: item.longname.substr(7, 3).replace(reg, '')
              },
              owner: item.attrs.uid,
              group: item.attrs.gid
            };
          });
        }
        resolve(newList);
      }
    });
    return undefined;
  });
};

/**
 * @async
 
 * Tests to see if an object exists. If it does, return the type of that object
 * (in the format returned by list). If it does not exist, return false.
 *
 * @param {string} path - path to the object on the sftp server.
 *
 * @return {boolean} returns false if object does not exist. Returns type of
 *                   object if it does
 */
SftpClient.prototype.exists = function (path) {
  var _this2 = this;

  return new Promise(function (resolve, reject) {
    var sftp = _this2.sftp;

    if (!sftp) {
      return reject(new Error('sftp connect error'));
    }

    var _osPath$parse = osPath.parse(path);

    var dir = _osPath$parse.dir;
    var base = _osPath$parse.base;

    sftp.readdir(dir, function (err, list) {
      if (err) {
        if (err.code === 2) {
          resolve(false);
        } else {
          reject(new Error('Error listing ' + dir + ': code: ' + err.code + ' ' + err.message));
        }
      } else {
        var _list$filter$map = list.filter(function (item) {
          return item.filename === base;
        }).map(function (item) {
          return item.longname.substr(0, 1);
        });

        var _list$filter$map2 = _slicedToArray(_list$filter$map, 1);

        var type = _list$filter$map2[0];

        if (type) {
          resolve(type);
        } else {
          resolve(false);
        }
      }
    });
    return undefined;
  });
};

/**
 * Retrieves attributes for path
 *
 * @param {String} path, a string containing the path to a file
 * @return {Promise} stats, attributes info
 */
SftpClient.prototype.stat = function (remotePath) {
  var _this3 = this;

  return new Promise(function (resolve, reject) {
    var sftp = _this3.sftp;

    if (!sftp) {
      return reject(Error('sftp connect error'));
    }
    sftp.stat(remotePath, function (err, stats) {
      if (err) {
        reject(new Error('Failed to stat ' + remotePath + ': ' + err.message));
      } else {
        // format similarly to sftp.list
        resolve({
          mode: stats.mode,
          permissions: stats.permissions,
          owner: stats.uid,
          group: stats.guid,
          size: stats.size,
          accessTime: stats.atime * 1000,
          modifyTime: stats.mtime * 1000
        });
      }
    });
    return undefined;
  });
};

/**
 * get file
 *
 * @param {String} path, path
 * @param {Object} useCompression, config options
 * @param {String} encoding. Encoding for the ReadStream, can be any value
 * supported by node streams. Use 'null' for binary
 * (https://nodejs.org/api/stream.html#stream_readable_setencoding_encoding)
 * @return {Promise} stream, readable stream
 */
SftpClient.prototype.get = function (path, useCompression, encoding, otherOptions) {
  var _this4 = this;

  var options = this.getOptions(useCompression, encoding, otherOptions);

  return new Promise(function (resolve, reject) {
    var sftp = _this4.sftp;

    if (sftp) {
      try {
        var _ret = (function () {
          _this4.client.on('error', reject);

          var stream = sftp.createReadStream(path, options);

          stream.on('error', function (err) {
            _this4.client.removeListener('error', reject);
            return reject(new Error('Failed get for ' + path + ': ' + err.message));
          });
          stream.on('readable', function () {
            _this4.client.removeListener('error', reject);
            // Ater node V10.0.0, 'readable' takes precedence in controlling the flow,
            // i.e. 'data' will be emitted only when stream.read() is called.
            while (stream.read() !== null) {}
          });

          // Return always the stream, not only when readable event is triggerd.
          return {
            v: resolve(stream)
          };
        })();

        if (typeof _ret === 'object') return _ret.v;
      } catch (err) {
        _this4.client.removeListener('error', reject);
        return reject(new Error('Failed get on ' + path + ': ' + err.message));
      }
    } else {
      return reject(new Error('sftp connect error'));
    }
  });
};

/**
 * Use SSH2 fastGet for downloading the file.
 * Downloads a file at remotePath to localPath using parallel reads for faster throughput.
 * See 'fastGet' at https://github.com/mscdex/ssh2-streams/blob/master/SFTPStream.md
 * @param {String} remotePath
 * @param {String} localPath
 * @param {Object} options
 * @return {Promise} the result of downloading the file
 */
SftpClient.prototype.fastGet = function (remotePath, localPath, options) {
  var _this5 = this;

  options = options || { concurrency: 64, chunkSize: 32768 };
  return new Promise(function (resolve, reject) {
    var sftp = _this5.sftp;

    if (!sftp) {
      return reject(Error('sftp connect error'));
    }
    sftp.fastGet(remotePath, localPath, options, function (err) {
      if (err) {
        reject(new Error('Failed to get ' + remotePath + ': ' + err.message));
      }
      resolve(remotePath + ' was successfully download to ' + localPath + '!');
    });
    return undefined;
  });
};

/**
 * Use SSH2 fastPut for uploading the file.
 * Uploads a file from localPath to remotePath using parallel reads for faster throughput.
 * See 'fastPut' at https://github.com/mscdex/ssh2-streams/blob/master/SFTPStream.md
 * @param {String} localPath
 * @param {String} remotePath
 * @param {Object} options
 * @return {Promise} the result of downloading the file
 */
SftpClient.prototype.fastPut = function (localPath, remotePath, options) {
  var _this6 = this;

  options = options || {};
  return new Promise(function (resolve, reject) {
    var sftp = _this6.sftp;

    if (!sftp) {
      return reject(new Error('sftp connect error'));
    }
    sftp.fastPut(localPath, remotePath, options, function (err) {
      if (err) {
        reject(new Error('Failed to upload ' + localPath + ' to ' + remotePath + ': ' + err.message));
      }
      resolve(localPath + ' was successfully uploaded to ' + remotePath + '!');
    });
    return undefined;
  });
};

/**
 * Create file
 *
 * @param  {String|Buffer|stream} input
 * @param  {String} remotePath,
 * @param  {Object} useCompression [description]
 * @param  {String} encoding. Encoding for the WriteStream, can be any value supported by node streams.
 * @return {[type]}                [description]
 */
SftpClient.prototype.put = function (input, remotePath, useCompression, encoding, otherOptions) {
  var _this7 = this;

  var options = this.getOptions(useCompression, encoding, otherOptions);

  return new Promise(function (resolve, reject) {
    var sftp = _this7.sftp;

    if (sftp) {
      if (typeof input === 'string') {
        sftp.fastPut(input, remotePath, options, function (err) {
          if (err) {
            return reject(new Error('Failed to upload ' + input + ' to ' + remotePath + ': ' + err.message));
          }
          return resolve('Uploaded ' + input + ' to ' + remotePath);
        });
        return false;
      }
      var stream = sftp.createWriteStream(remotePath, options);

      stream.on('error', function (err) {
        return reject(new Error('Failed to upload data stream to ' + remotePath + ': ' + err.message));
      });

      stream.on('close', function () {
        return resolve('Uploaded data stream to ' + remotePath);
      });

      if (input instanceof Buffer) {
        stream.end(input);
        return false;
      }
      input.pipe(stream);
    } else {
      return reject(Error('sftp connect error'));
    }
  });
};
/**
 * Append to file
 *
 * @param  {Buffer|stream} input
 * @param  {String} remotePath,
 * @param  {Object} useCompression [description]
 * @param  {String} encoding. Encoding for the WriteStream, can be any value supported by node streams.
 * @return {[type]}                [description]
 */
SftpClient.prototype.append = function (input, remotePath, useCompression, encoding, otherOptions) {
  var _this8 = this;

  var options = this.getOptions(useCompression, encoding, otherOptions);

  return new Promise(function (resolve, reject) {
    var sftp = _this8.sftp;

    if (sftp) {
      if (typeof input === 'string') {
        throw new Error('Cannot append a file to another');
      }
      var stream = sftp.createWriteStream(remotePath, options);

      stream.on('error', function (err) {
        return reject(new Error('Failed to upload data stream to ' + remotePath + ': ' + err.message));
      });

      stream.on('close', function () {
        return resolve('Uploaded data stream to ' + remotePath);
      });

      if (input instanceof Buffer) {
        stream.end(input);
        return false;
      }
      input.pipe(stream);
    } else {
      return reject(Error('sftp connect error'));
    }
  });
};

SftpClient.prototype.mkdir = function (path) {
  var _this9 = this;

  var recursive = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

  var sftp = this.sftp;

  var doMkdir = function doMkdir(p) {
    return new Promise(function (resolve, reject) {

      if (!sftp) {
        return reject(new Error('sftp connect error'));
      }
      sftp.mkdir(p, function (err) {
        if (err) {
          reject(new Error('Failed to create directory ' + p + ': ' + err.message));
        }
        resolve(p + ' directory created');
      });
      return undefined;
    });
  };

  if (!recursive) {
    return doMkdir(path);
  }
  var mkdir = function mkdir(p) {
    var _osPath$parse2 = osPath.parse(p);

    var dir = _osPath$parse2.dir;

    return _this9.exists(dir).then(function (type) {
      if (!type) {
        return mkdir(dir);
      }
    }).then(function () {
      return doMkdir(p);
    });
  };
  return mkdir(path);
};

SftpClient.prototype.rmdir = function (path) {
  var _this10 = this;

  var recursive = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

  var sftp = this.sftp;

  var doRmdir = function doRmdir(p) {
    return new Promise(function (resolve, reject) {

      if (!sftp) {
        return reject(new Error('sftp connect error'));
      }
      sftp.rmdir(p, function (err) {
        if (err) {
          reject(new Error('Failed to remove directory ' + p + ': ' + err.message));
        }
        resolve('Successfully removed directory');
      });
      return undefined;
    });
  };

  if (!recursive) {
    return doRmdir(path);
  }

  var rmdir = function rmdir(p) {
    var list = undefined;
    var files = undefined;
    var dirs = undefined;
    return _this10.list(p).then(function (res) {
      list = res;
      files = list.filter(function (item) {
        return item.type === '-';
      });
      dirs = list.filter(function (item) {
        return item.type === 'd';
      });
      return (0, _helper.forEachAsync)(files, function (f) {
        return _this10['delete'](osPath.join(p, f.name));
      });
    }).then(function () {
      return (0, _helper.forEachAsync)(dirs, function (d) {
        return rmdir(osPath.join(p, d.name));
      });
    }).then(function () {
      return doRmdir(p);
    });
  };
  return rmdir(path);
};

/**
 * @async
 *
 * Delete a file on the remote SFTP server
 *
 * @param {string} path - path to the file to delete
 * @return {Promise} with string 'Successfully deleeted file' once resolved
 * 
 */
SftpClient.prototype['delete'] = function (path) {
  var _this11 = this;

  return new Promise(function (resolve, reject) {
    var sftp = _this11.sftp;

    if (!sftp) {
      return reject(new Error('sftp connect error'));
    }
    sftp.unlink(path, function (err) {
      if (err) {
        reject(new Error('Failed to delete file ' + path + ': ' + err.message));
      }
      resolve('Successfully deleted file');
    });
    return undefined;
  });
};

/**
 * @async
 *
 * Rename a file on the remote SFTP repository
 *
 * @param {sring} srcPath - path to the file to be renamced.
 * @param {string} remotePath - path to the new name.
 *
 * @return {Promise}
 * 
 */
SftpClient.prototype.rename = function (srcPath, remotePath) {
  var _this12 = this;

  return new Promise(function (resolve, reject) {
    var sftp = _this12.sftp;

    if (!sftp) {
      return reject(new Error('sftp connect error'));
    }
    sftp.rename(srcPath, remotePath, function (err) {
      if (err) {
        reject(new Error('Failed to rename file ' + srcPath + ' to ' + remotePath + ': ' + err.message));
      }
      resolve('Successfully renamed ' + srcPath + ' to ' + remotePath);
    });
    return undefined;
  });
};

/**
 * @async
 *
 * Change the mode of a remote file on the SFTP repository
 *
 * @param {string} remotePath - path to the remote target object.
 * @param {Octal} mode - the new mode to set
 *
 * @return {Promise}.
 */
SftpClient.prototype.chmod = function (remotePath, mode) {
  var _this13 = this;

  return new Promise(function (resolve, reject) {
    var sftp = _this13.sftp;

    if (!sftp) {
      return reject(new Error('sftp connect error'));
    }
    sftp.chmod(remotePath, mode, function (err) {
      if (err) {
        reject(new Error('Failed to change mode for ' + remotePath + ': ' + err.message));
      }
      resolve('Successfully change file mode');
    });
    return undefined;
  });
};

/**
 * @async
 *
 * Create a new SFTP connection to a remote SFTP server
 *
 * @param {Object} config - an SFTP configuration object
 * @param {string} connectMethod - ???
 *
 * @return {Promise} which will resolve to an sftp client object
 * 
 */
SftpClient.prototype.connect = function (config, connectMethod) {
  var _this14 = this;

  connectMethod = connectMethod || 'on';

  return new Promise(function (resolve, reject) {
    _this14.client[connectMethod]('ready', function () {
      _this14.client.sftp(function (err, sftp) {
        _this14.client.removeListener('error', reject);
        _this14.client.removeListener('end', reject);
        if (err) {
          reject(new Error('Failed to connect to server: ' + err.message));
        }
        _this14.sftp = sftp;
        resolve(sftp);
      });
    }).on('end', reject).on('error', reject).connect(config);
  });
};

/**
 * @async
 *
 * Close the SFTP connection
 * 
 */
SftpClient.prototype.end = function () {
  var _this15 = this;

  return new Promise(function (resolve) {
    _this15.client.end();
    resolve();
  });
};

SftpClient.prototype.getOptions = function (useCompression, encoding, otherOptions) {
  if (encoding === undefined) {
    encoding = 'utf8';
  }
  var options = Object.assign({}, otherOptions || {}, { encoding: encoding }, useCompression);
  return options;
};

// add Event type support
SftpClient.prototype.on = function (eventType, callback) {
  this.client.on(eventType, callback);
};

module.exports = SftpClient;

// sftp = new SftpClient()
// sftp.client.on('event')
//
// sftp.on('end', ()=>{})   => this.client.on('event', callback)
// sftp.on('error', () => {})
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2FuYW5tYXlqYWluLy5hdG9tL3BhY2thZ2VzL2Z0cC1yZW1vdGUtZWRpdC9saWIvaGVscGVyL3NzaDItc2Z0cC1jbGllbnQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7c0JBUzZCLFVBQVU7O0FBVHZDLFdBQVcsQ0FBQzs7Ozs7OztBQU9aLFlBQVksQ0FBQzs7QUFJYixJQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsTUFBTSxDQUFDO0FBQ3RDLElBQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxLQUFLLENBQUM7O0FBRXJDLElBQUksVUFBVSxHQUFHLFNBQWIsVUFBVSxHQUFhO0FBQ3pCLE1BQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxNQUFNLEVBQUUsQ0FBQztDQUM1QixDQUFDOzs7Ozs7OztBQVFGLFVBQVUsQ0FBQyxTQUFTLENBQUMsSUFBSSxHQUFHLFVBQVMsSUFBSSxFQUFFOzs7QUFDekMsTUFBTSxHQUFHLEdBQUcsS0FBSyxDQUFDOztBQUVsQixTQUFPLElBQUksT0FBTyxDQUFDLFVBQUMsT0FBTyxFQUFFLE1BQU0sRUFBSztBQUN0QyxRQUFJLElBQUksR0FBRyxNQUFLLElBQUksQ0FBQzs7QUFFckIsUUFBSSxDQUFDLElBQUksRUFBRTtBQUNULGFBQU8sTUFBTSxDQUFDLElBQUksS0FBSyxDQUFDLG9CQUFvQixDQUFDLENBQUMsQ0FBQztLQUNoRDtBQUNELFFBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLFVBQUMsR0FBRyxFQUFFLElBQUksRUFBSztBQUNoQyxVQUFJLEdBQUcsRUFBRTtBQUNQLGNBQU0sQ0FBQyxJQUFJLEtBQUsscUJBQW1CLElBQUksVUFBSyxHQUFHLENBQUMsT0FBTyxDQUFHLENBQUMsQ0FBQztPQUM3RCxNQUFNO0FBQ0wsWUFBSSxPQUFPLEdBQUcsRUFBRSxDQUFDOztBQUVqQixZQUFJLElBQUksRUFBRTtBQUNSLGlCQUFPLEdBQUcsSUFBSSxDQUFDLEdB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QUFDakYsTUFBRyxRQUFRLEtBQUssU0FBUyxFQUFDO0FBQ3hCLFlBQVEsR0FBRyxNQUFNLENBQUM7R0FDbkI7QUFDRCxNQUFJLE9BQU8sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxZQUFZLElBQUksRUFBRSxFQUFFLEVBQUMsUUFBUSxFQUFFLFFBQVEsRUFBQyxFQUFFLGNBQWMsQ0FBQyxDQUFDO0FBQzFGLFNBQU8sT0FBTyxDQUFDO0NBQ2hCLENBQUM7OztBQUdGLFVBQVUsQ0FBQyxTQUFTLENBQUMsRUFBRSxHQUFHLFVBQVMsU0FBUyxFQUFFLFFBQVEsRUFBRTtBQUN0RCxNQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxTQUFTLEVBQUUsUUFBUSxDQUFDLENBQUM7Q0FDckMsQ0FBQzs7QUFHRixNQUFNLENBQUMsT0FBTyxHQUFHLFVBQVUsQ0FBQyIsImZpbGUiOiIvaG9tZS9hbmFubWF5amFpbi8uYXRvbS9wYWNrYWdlcy9mdHAtcmVtb3RlLWVkaXQvbGliL2hlbHBlci9zc2gyLXNmdHAtY2xpZW50LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbi8qKlxuICogc3NoMiBzZnRwIGNsaWVudCBmb3Igbm9kZVxuICogaHR0cHM6Ly9naXRodWIuY29tL2p5dTIxMy9zc2gyLXNmdHAtY2xpZW50XG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgeyBmb3JFYWNoQXN5bmMgfSBmcm9tICcuL2hlbHBlcic7XG5cbmNvbnN0IENsaWVudCA9IHJlcXVpcmUoJ3NzaDInKS5DbGllbnQ7XG5jb25zdCBvc1BhdGggPSByZXF1aXJlKCdwYXRoJykucG9zaXg7XG5cbmxldCBTZnRwQ2xpZW50ID0gZnVuY3Rpb24oKXtcbiAgdGhpcy5jbGllbnQgPSBuZXcgQ2xpZW50KCk7XG59O1xuXG4vKipcbiAqIFJldHJpZXZlcyBhIGRpcmVjdG9yeSBsaXN0aW5nXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHBhdGgsIGEgc3RyaW5nIGNvbnRhaW5pbmcgdGhlIHBhdGggdG8gYSBkaXJlY3RvcnlcbiAqIEByZXR1cm4ge1Byb21pc2V9IGRhdGEsIGxpc3QgaW5mb1xuICovXG5TZnRwQ2xpZW50LnByb3RvdHlwZS5saXN0ID0gZnVuY3Rpb24ocGF0aCkge1xuICBjb25zdCByZWcgPSAvLS9naTtcblxuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGxldCBzZnRwID0gdGhpcy5zZnRwO1xuXG4gICAgaWYgKCFzZnRwKSB7XG4gICAgICByZXR1cm4gcmVqZWN0KG5ldyBFcnJvcignc2Z0cCBjb25uZWN0IGVycm9yJykpO1xuICAgIH1cbiAgICBzZnRwLnJlYWRkaXIocGF0aCwgKGVyciwgbGlzdCkgPT4ge1xuICAgICAgaWYgKGVycikge1xuICAgICAgICByZWplY3QobmV3IEVycm9yKGBGYWlsZWQgdG8gbGlzdCAke3BhdGh9OiAke2Vyci5tZXNzYWdlfWApKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxldCBuZXdMaXN0ID0gW107XG4gICAgICAgIC8vIHJlc2V0IGZpbGUgaW5mb1xuICAgICAgICBpZiAobGlzdCkge1xuICAgICAgICAgIG5ld0xpc3QgPSBsaXN0Lm1hcChpdGVtID0+IHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgIHR5cGU6IGl0ZW0ubG9uZ25hbWUuc3Vic3RyKDAsIDEpLFxuICAgICAgICAgICAgICBuYW1lOiBpdGVtLmZpbGVuYW1lLFxuICAgICAgICAgICAgICBzaXplOiBpdGVtLmF0dHJzLnNpemUsXG4gICAgICAgICAgICAgIG1vZGlmeVRpbWU6IGl0ZW0uYXR0cnMubXRpbWUgKiAxMDAwLFxuICAgICAgICAgICAgICBhY2Nlc3NUaW1lOiBpdGVtLmF0dHJzLmF0aW1lICogMTAwMCxcbiAgICAgICAgICAgICAgcmlnaHRzOiB7XG4gICAgICAgICAgICAgICAgdXNlcjogaXRlbS5sb25nbmFtZS5zdWJzdHIoMSwgMykucmVwbGFjZShyZWcsICcnKSxcbiAgICAgICAgICAgICAgICBncm91cDogaXRlbS5sb25nbmFtZS5zdWJzdHIoNCwzKS5yZXBsYWNlKHJlZywgJycpLFxuICAgICAgICAgICAgICAgIG90aGVyOiBpdGVtLmxvbmduYW1lLnN1YnN0cig3LCAzKS5yZXBsYWNlKHJlZywgJycpXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIG93bmVyOiBpdGVtLmF0dHJzLnVpZCxcbiAgICAgICAgICAgICAgZ3JvdXA6IGl0ZW0uYXR0cnMuZ2lkXG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJlc29sdmUobmV3TGlzdCk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfSk7XG59O1xuXG4vKipcbiAqIEBhc3luY1xuIFxuICogVGVzdHMgdG8gc2VlIGlmIGFuIG9iamVjdCBleGlzdHMuIElmIGl0IGRvZXMsIHJldHVybiB0aGUgdHlwZSBvZiB0aGF0IG9iamVjdFxuICogKGluIHRoZSBmb3JtYXQgcmV0dXJuZWQgYnkgbGlzdCkuIElmIGl0IGRvZXMgbm90IGV4aXN0LCByZXR1cm4gZmFsc2UuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHBhdGggLSBwYXRoIHRvIHRoZSBvYmplY3Qgb24gdGhlIHNmdHAgc2VydmVyLlxuICpcbiAqIEByZXR1cm4ge2Jvb2xlYW59IHJldHVybnMgZmFsc2UgaWYgb2JqZWN0IGRvZXMgbm90IGV4aXN0LiBSZXR1cm5zIHR5cGUgb2ZcbiAqICAgICAgICAgICAgICAgICAgIG9iamVjdCBpZiBpdCBkb2VzXG4gKi9cblNmdHBDbGllbnQucHJvdG90eXBlLmV4aXN0cyA9IGZ1bmN0aW9uKHBhdGgpIHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBsZXQgc2Z0cCA9IHRoaXMuc2Z0cDtcblxuICAgIGlmICghc2Z0cCkge1xuICAgICAgcmV0dXJuIHJlamVjdChuZXcgRXJyb3IoJ3NmdHAgY29ubmVjdCBlcnJvcicpKTtcbiAgICB9XG4gICAgbGV0IHtkaXIsIGJhc2V9ID0gb3NQYXRoLnBhcnNlKHBhdGgpO1xuICAgIHNmdHAucmVhZGRpcihkaXIsIChlcnIsIGxpc3QpID0+IHtcbiAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgaWYgKGVyci5jb2RlID09PSAyKSB7XG4gICAgICAgICAgcmVzb2x2ZShmYWxzZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihgRXJyb3IgbGlzdGluZyAke2Rpcn06IGNvZGU6ICR7ZXJyLmNvZGV9ICR7ZXJyLm1lc3NhZ2V9YCkpOyAgICAgICAgICBcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbGV0IFt0eXBlXSA9IGxpc3QuZmlsdGVyKGl0ZW0gPT4gaXRlbS5maWxlbmFtZSA9PT0gYmFzZSkubWFwKGl0ZW0gPT4gaXRlbS5sb25nbmFtZS5zdWJzdHIoMCwgMSkpO1xuICAgICAgICBpZiAodHlwZSkge1xuICAgICAgICAgIHJlc29sdmUodHlwZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmVzb2x2ZShmYWxzZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9KTtcbn07XG5cbi8qKlxuICogUmV0cmlldmVzIGF0dHJpYnV0ZXMgZm9yIHBhdGhcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gcGF0aCwgYSBzdHJpbmcgY29udGFpbmluZyB0aGUgcGF0aCB0byBhIGZpbGVcbiAqIEByZXR1cm4ge1Byb21pc2V9IHN0YXRzLCBhdHRyaWJ1dGVzIGluZm9cbiAqL1xuU2Z0cENsaWVudC5wcm90b3R5cGUuc3RhdCA9IGZ1bmN0aW9uKHJlbW90ZVBhdGgpIHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBsZXQgc2Z0cCA9IHRoaXMuc2Z0cDtcblxuICAgIGlmICghc2Z0cCkge1xuICAgICAgcmV0dXJuIHJlamVjdChFcnJvcignc2Z0cCBjb25uZWN0IGVycm9yJykpOyAgICAgIFxuICAgIH1cbiAgICBzZnRwLnN0YXQocmVtb3RlUGF0aCwgZnVuY3Rpb24gKGVyciwgc3RhdHMpIHtcbiAgICAgIGlmIChlcnIpe1xuICAgICAgICByZWplY3QobmV3IEVycm9yKGBGYWlsZWQgdG8gc3RhdCAke3JlbW90ZVBhdGh9OiAke2Vyci5tZXNzYWdlfWApKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAvLyBmb3JtYXQgc2ltaWxhcmx5IHRvIHNmdHAubGlzdFxuICAgICAgICByZXNvbHZlKHtcbiAgICAgICAgICBtb2RlOiBzdGF0cy5tb2RlLFxuICAgICAgICAgIHBlcm1pc3Npb25zOiBzdGF0cy5wZXJtaXNzaW9ucyxcbiAgICAgICAgICBvd25lcjogc3RhdHMudWlkLFxuICAgICAgICAgIGdyb3VwOiBzdGF0cy5ndWlkLFxuICAgICAgICAgIHNpemU6IHN0YXRzLnNpemUsXG4gICAgICAgICAgYWNjZXNzVGltZTogc3RhdHMuYXRpbWUgKiAxMDAwLFxuICAgICAgICAgIG1vZGlmeVRpbWU6IHN0YXRzLm10aW1lICogMTAwMFxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9KTtcbn07XG5cbi8qKlxuICogZ2V0IGZpbGVcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gcGF0aCwgcGF0aFxuICogQHBhcmFtIHtPYmplY3R9IHVzZUNvbXByZXNzaW9uLCBjb25maWcgb3B0aW9uc1xuICogQHBhcmFtIHtTdHJpbmd9IGVuY29kaW5nLiBFbmNvZGluZyBmb3IgdGhlIFJlYWRTdHJlYW0sIGNhbiBiZSBhbnkgdmFsdWVcbiAqIHN1cHBvcnRlZCBieSBub2RlIHN0cmVhbXMuIFVzZSAnbnVsbCcgZm9yIGJpbmFyeVxuICogKGh0dHBzOi8vbm9kZWpzLm9yZy9hcGkvc3RyZWFtLmh0bWwjc3RyZWFtX3JlYWRhYmxlX3NldGVuY29kaW5nX2VuY29kaW5nKVxuICogQHJldHVybiB7UHJvbWlzZX0gc3RyZWFtLCByZWFkYWJsZSBzdHJlYW1cbiAqL1xuU2Z0cENsaWVudC5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24ocGF0aCwgdXNlQ29tcHJlc3Npb24sIGVuY29kaW5nLCBvdGhlck9wdGlvbnMpIHtcbiAgbGV0IG9wdGlvbnMgPSB0aGlzLmdldE9wdGlvbnModXNlQ29tcHJlc3Npb24sIGVuY29kaW5nLCBvdGhlck9wdGlvbnMpO1xuXG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgbGV0IHNmdHAgPSB0aGlzLnNmdHA7XG5cbiAgICBpZiAoc2Z0cCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgdGhpcy5jbGllbnQub24oJ2Vycm9yJywgcmVqZWN0KTtcbiAgICAgICBcbiAgICAgICAgbGV0IHN0cmVhbSA9IHNmdHAuY3JlYXRlUmVhZFN0cmVhbShwYXRoLCBvcHRpb25zKTtcbiAgICAgICAgXG4gICAgICAgIHN0cmVhbS5vbignZXJyb3InLCAoZXJyKSA9PiB7XG4gICAgICAgICAgdGhpcy5jbGllbnQucmVtb3ZlTGlzdGVuZXIoJ2Vycm9yJywgcmVqZWN0KTtcbiAgICAgICAgICByZXR1cm4gcmVqZWN0KG5ldyBFcnJvcihgRmFpbGVkIGdldCBmb3IgJHtwYXRofTogJHtlcnIubWVzc2FnZX1gKSk7XG4gICAgICAgIH0pO1xuICAgICAgICBzdHJlYW0ub24oJ3JlYWRhYmxlJywgKCkgPT4ge1xuICAgICAgICAgIHRoaXMuY2xpZW50LnJlbW92ZUxpc3RlbmVyKCdlcnJvcicsIHJlamVjdCk7XG4gICAgICAgICAgLy8gQXRlciBub2RlIFYxMC4wLjAsICdyZWFkYWJsZScgdGFrZXMgcHJlY2VkZW5jZSBpbiBjb250cm9sbGluZyB0aGUgZmxvdyxcbiAgICAgICAgICAvLyBpLmUuICdkYXRhJyB3aWxsIGJlIGVtaXR0ZWQgb25seSB3aGVuIHN0cmVhbS5yZWFkKCkgaXMgY2FsbGVkLlxuICAgICAgICAgIHdoaWxlKChzdHJlYW0ucmVhZCgpKSAhPT0gbnVsbCkge31cbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gUmV0dXJuIGFsd2F5cyB0aGUgc3RyZWFtLCBub3Qgb25seSB3aGVuIHJlYWRhYmxlIGV2ZW50IGlzIHRyaWdnZXJkLlxuICAgICAgICByZXR1cm4gcmVzb2x2ZShzdHJlYW0pO1xuICAgICAgfSBjYXRjaChlcnIpIHtcbiAgICAgICAgdGhpcy5jbGllbnQucmVtb3ZlTGlzdGVuZXIoJ2Vycm9yJywgcmVqZWN0KTtcbiAgICAgICAgcmV0dXJuIHJlamVjdChuZXcgRXJyb3IoYEZhaWxlZCBnZXQgb24gJHtwYXRofTogJHtlcnIubWVzc2FnZX1gKSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiByZWplY3QobmV3IEVycm9yKCdzZnRwIGNvbm5lY3QgZXJyb3InKSk7XG4gICAgfVxuICB9KTtcbn07XG5cbi8qKlxuICogVXNlIFNTSDIgZmFzdEdldCBmb3IgZG93bmxvYWRpbmcgdGhlIGZpbGUuXG4gKiBEb3dubG9hZHMgYSBmaWxlIGF0IHJlbW90ZVBhdGggdG8gbG9jYWxQYXRoIHVzaW5nIHBhcmFsbGVsIHJlYWRzIGZvciBmYXN0ZXIgdGhyb3VnaHB1dC5cbiAqIFNlZSAnZmFzdEdldCcgYXQgaHR0cHM6Ly9naXRodWIuY29tL21zY2RleC9zc2gyLXN0cmVhbXMvYmxvYi9tYXN0ZXIvU0ZUUFN0cmVhbS5tZFxuICogQHBhcmFtIHtTdHJpbmd9IHJlbW90ZVBhdGhcbiAqIEBwYXJhbSB7U3RyaW5nfSBsb2NhbFBhdGhcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gKiBAcmV0dXJuIHtQcm9taXNlfSB0aGUgcmVzdWx0IG9mIGRvd25sb2FkaW5nIHRoZSBmaWxlXG4gKi9cblNmdHBDbGllbnQucHJvdG90eXBlLmZhc3RHZXQgPSBmdW5jdGlvbihyZW1vdGVQYXRoLCBsb2NhbFBhdGgsIG9wdGlvbnMpIHtcbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge2NvbmN1cnJlbmN5OiA2NCwgY2h1bmtTaXplOiAzMjc2OH07XG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgbGV0IHNmdHAgPSB0aGlzLnNmdHA7XG5cbiAgICBpZiAoIXNmdHApIHtcbiAgICAgIHJldHVybiByZWplY3QoRXJyb3IoJ3NmdHAgY29ubmVjdCBlcnJvcicpKTsgICAgICBcbiAgICB9XG4gICAgc2Z0cC5mYXN0R2V0KHJlbW90ZVBhdGgsIGxvY2FsUGF0aCwgb3B0aW9ucywgZnVuY3Rpb24gKGVycikge1xuICAgICAgaWYgKGVycil7XG4gICAgICAgIHJlamVjdChuZXcgRXJyb3IoYEZhaWxlZCB0byBnZXQgJHtyZW1vdGVQYXRofTogJHtlcnIubWVzc2FnZX1gKSk7XG4gICAgICB9XG4gICAgICByZXNvbHZlKGAke3JlbW90ZVBhdGh9IHdhcyBzdWNjZXNzZnVsbHkgZG93bmxvYWQgdG8gJHtsb2NhbFBhdGh9IWApO1xuICAgIH0pO1xuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH0pO1xufTtcblxuLyoqXG4gKiBVc2UgU1NIMiBmYXN0UHV0IGZvciB1cGxvYWRpbmcgdGhlIGZpbGUuXG4gKiBVcGxvYWRzIGEgZmlsZSBmcm9tIGxvY2FsUGF0aCB0byByZW1vdGVQYXRoIHVzaW5nIHBhcmFsbGVsIHJlYWRzIGZvciBmYXN0ZXIgdGhyb3VnaHB1dC5cbiAqIFNlZSAnZmFzdFB1dCcgYXQgaHR0cHM6Ly9naXRodWIuY29tL21zY2RleC9zc2gyLXN0cmVhbXMvYmxvYi9tYXN0ZXIvU0ZUUFN0cmVhbS5tZFxuICogQHBhcmFtIHtTdHJpbmd9IGxvY2FsUGF0aFxuICogQHBhcmFtIHtTdHJpbmd9IHJlbW90ZVBhdGhcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gKiBAcmV0dXJuIHtQcm9taXNlfSB0aGUgcmVzdWx0IG9mIGRvd25sb2FkaW5nIHRoZSBmaWxlXG4gKi9cblNmdHBDbGllbnQucHJvdG90eXBlLmZhc3RQdXQgPSBmdW5jdGlvbihsb2NhbFBhdGgsIHJlbW90ZVBhdGgsIG9wdGlvbnMpIHtcbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgbGV0IHNmdHAgPSB0aGlzLnNmdHA7XG5cbiAgICBpZiAoIXNmdHApIHtcbiAgICAgIHJldHVybiByZWplY3QobmV3IEVycm9yKCdzZnRwIGNvbm5lY3QgZXJyb3InKSk7ICAgICAgXG4gICAgfVxuICAgIHNmdHAuZmFzdFB1dChsb2NhbFBhdGgsIHJlbW90ZVBhdGgsIG9wdGlvbnMsIGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihgRmFpbGVkIHRvIHVwbG9hZCAke2xvY2FsUGF0aH0gdG8gJHtyZW1vdGVQYXRofTogJHtlcnIubWVzc2FnZX1gKSk7XG4gICAgICB9XG4gICAgICByZXNvbHZlKGAke2xvY2FsUGF0aH0gd2FzIHN1Y2Nlc3NmdWxseSB1cGxvYWRlZCB0byAke3JlbW90ZVBhdGh9IWApO1xuICAgIH0pO1xuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH0pO1xufTtcblxuXG4vKipcbiAqIENyZWF0ZSBmaWxlXG4gKlxuICogQHBhcmFtICB7U3RyaW5nfEJ1ZmZlcnxzdHJlYW19IGlucHV0XG4gKiBAcGFyYW0gIHtTdHJpbmd9IHJlbW90ZVBhdGgsXG4gKiBAcGFyYW0gIHtPYmplY3R9IHVzZUNvbXByZXNzaW9uIFtkZXNjcmlwdGlvbl1cbiAqIEBwYXJhbSAge1N0cmluZ30gZW5jb2RpbmcuIEVuY29kaW5nIGZvciB0aGUgV3JpdGVTdHJlYW0sIGNhbiBiZSBhbnkgdmFsdWUgc3VwcG9ydGVkIGJ5IG5vZGUgc3RyZWFtcy5cbiAqIEByZXR1cm4ge1t0eXBlXX0gICAgICAgICAgICAgICAgW2Rlc2NyaXB0aW9uXVxuICovXG5TZnRwQ2xpZW50LnByb3RvdHlwZS5wdXQgPSBmdW5jdGlvbihpbnB1dCwgcmVtb3RlUGF0aCwgdXNlQ29tcHJlc3Npb24sIGVuY29kaW5nLCBvdGhlck9wdGlvbnMpIHtcbiAgbGV0IG9wdGlvbnMgPSB0aGlzLmdldE9wdGlvbnModXNlQ29tcHJlc3Npb24sIGVuY29kaW5nLCBvdGhlck9wdGlvbnMpO1xuXG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgbGV0IHNmdHAgPSB0aGlzLnNmdHA7XG5cbiAgICBpZiAoc2Z0cCkge1xuICAgICAgaWYgKHR5cGVvZiBpbnB1dCA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgc2Z0cC5mYXN0UHV0KGlucHV0LCByZW1vdGVQYXRoLCBvcHRpb25zLCAoZXJyKSA9PiB7XG4gICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgcmV0dXJuIHJlamVjdChuZXcgRXJyb3IoYEZhaWxlZCB0byB1cGxvYWQgJHtpbnB1dH0gdG8gJHtyZW1vdGVQYXRofTogJHtlcnIubWVzc2FnZX1gKSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiByZXNvbHZlKGBVcGxvYWRlZCAke2lucHV0fSB0byAke3JlbW90ZVBhdGh9YCk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICBsZXQgc3RyZWFtID0gc2Z0cC5jcmVhdGVXcml0ZVN0cmVhbShyZW1vdGVQYXRoLCBvcHRpb25zKTtcblxuICAgICAgc3RyZWFtLm9uKCdlcnJvcicsIGVyciA9PiB7XG4gICAgICAgIHJldHVybiByZWplY3QobmV3IEVycm9yKGBGYWlsZWQgdG8gdXBsb2FkIGRhdGEgc3RyZWFtIHRvICR7cmVtb3RlUGF0aH06ICR7ZXJyLm1lc3NhZ2V9YCkpO1xuICAgICAgfSk7XG4gICAgICBcbiAgICAgIHN0cmVhbS5vbignY2xvc2UnLCAoKSA9PiB7XG4gICAgICAgIHJldHVybiByZXNvbHZlKGBVcGxvYWRlZCBkYXRhIHN0cmVhbSB0byAke3JlbW90ZVBhdGh9YCk7XG4gICAgICB9KTtcbiAgICAgIFxuICAgICAgaWYgKGlucHV0IGluc3RhbmNlb2YgQnVmZmVyKSB7XG4gICAgICAgIHN0cmVhbS5lbmQoaW5wdXQpO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICBpbnB1dC5waXBlKHN0cmVhbSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiByZWplY3QoRXJyb3IoJ3NmdHAgY29ubmVjdCBlcnJvcicpKTtcbiAgICB9XG4gIH0pO1xufTtcbi8qKlxuICogQXBwZW5kIHRvIGZpbGVcbiAqXG4gKiBAcGFyYW0gIHtCdWZmZXJ8c3RyZWFtfSBpbnB1dFxuICogQHBhcmFtICB7U3RyaW5nfSByZW1vdGVQYXRoLFxuICogQHBhcmFtICB7T2JqZWN0fSB1c2VDb21wcmVzc2lvbiBbZGVzY3JpcHRpb25dXG4gKiBAcGFyYW0gIHtTdHJpbmd9IGVuY29kaW5nLiBFbmNvZGluZyBmb3IgdGhlIFdyaXRlU3RyZWFtLCBjYW4gYmUgYW55IHZhbHVlIHN1cHBvcnRlZCBieSBub2RlIHN0cmVhbXMuXG4gKiBAcmV0dXJuIHtbdHlwZV19ICAgICAgICAgICAgICAgIFtkZXNjcmlwdGlvbl1cbiAqL1xuU2Z0cENsaWVudC5wcm90b3R5cGUuYXBwZW5kID0gZnVuY3Rpb24oaW5wdXQsIHJlbW90ZVBhdGgsIHVzZUNvbXByZXNzaW9uLCBlbmNvZGluZywgb3RoZXJPcHRpb25zKSB7XG4gIGxldCBvcHRpb25zID0gdGhpcy5nZXRPcHRpb25zKHVzZUNvbXByZXNzaW9uLCBlbmNvZGluZywgb3RoZXJPcHRpb25zKTtcblxuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGxldCBzZnRwID0gdGhpcy5zZnRwO1xuXG4gICAgaWYgKHNmdHApIHtcbiAgICAgIGlmICh0eXBlb2YgaW5wdXQgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignQ2Fubm90IGFwcGVuZCBhIGZpbGUgdG8gYW5vdGhlcicpXG4gICAgICB9XG4gICAgICBsZXQgc3RyZWFtID0gc2Z0cC5jcmVhdGVXcml0ZVN0cmVhbShyZW1vdGVQYXRoLCBvcHRpb25zKTtcblxuICAgICAgc3RyZWFtLm9uKCdlcnJvcicsIGVyciA9PiB7XG4gICAgICAgIHJldHVybiByZWplY3QobmV3IEVycm9yKGBGYWlsZWQgdG8gdXBsb2FkIGRhdGEgc3RyZWFtIHRvICR7cmVtb3RlUGF0aH06ICR7ZXJyLm1lc3NhZ2V9YCkpO1xuICAgICAgfSk7XG5cbiAgICAgIHN0cmVhbS5vbignY2xvc2UnLCAoKSA9PiB7XG4gICAgICAgIHJldHVybiByZXNvbHZlKGBVcGxvYWRlZCBkYXRhIHN0cmVhbSB0byAke3JlbW90ZVBhdGh9YCk7XG4gICAgICB9KTtcblxuICAgICAgaWYgKGlucHV0IGluc3RhbmNlb2YgQnVmZmVyKSB7XG4gICAgICAgIHN0cmVhbS5lbmQoaW5wdXQpO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICBpbnB1dC5waXBlKHN0cmVhbSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiByZWplY3QoRXJyb3IoJ3NmdHAgY29ubmVjdCBlcnJvcicpKTtcbiAgICB9XG4gIH0pO1xufTtcblxuU2Z0cENsaWVudC5wcm90b3R5cGUubWtkaXIgPSBmdW5jdGlvbihwYXRoLCByZWN1cnNpdmUgPSBmYWxzZSkge1xuICBsZXQgc2Z0cCA9IHRoaXMuc2Z0cDtcblxuICBsZXQgZG9Na2RpciA9IHAgPT4ge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG5cblxuICAgICAgaWYgKCFzZnRwKSB7XG4gICAgICAgIHJldHVybiByZWplY3QobmV3IEVycm9yKCdzZnRwIGNvbm5lY3QgZXJyb3InKSk7XG4gICAgICB9XG4gICAgICBzZnRwLm1rZGlyKHAsIGVyciA9PiB7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICByZWplY3QobmV3IEVycm9yKGBGYWlsZWQgdG8gY3JlYXRlIGRpcmVjdG9yeSAke3B9OiAke2Vyci5tZXNzYWdlfWApKTtcbiAgICAgICAgfVxuICAgICAgICByZXNvbHZlKGAke3B9IGRpcmVjdG9yeSBjcmVhdGVkYCk7XG4gICAgICB9KTtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfSk7XG4gIH07XG5cbiAgaWYgKCFyZWN1cnNpdmUpIHtcbiAgICByZXR1cm4gZG9Na2RpcihwYXRoKTtcbiAgfVxuICBsZXQgbWtkaXIgPSBwID0+IHtcbiAgICAgIGxldCB7ZGlyfSA9IG9zUGF0aC5wYXJzZShwKTtcbiAgICAgIHJldHVybiB0aGlzLmV4aXN0cyhkaXIpLnRoZW4oKHR5cGUpID0+IHtcbiAgICAgICAgaWYgKCF0eXBlKSB7XG4gICAgICAgICAgcmV0dXJuIG1rZGlyKGRpcik7XG4gICAgICAgIH1cbiAgICAgIH0pLnRoZW4oKCkgPT4ge1xuICAgICAgICByZXR1cm4gZG9Na2RpcihwKTtcbiAgICAgIH0pO1xuICB9O1xuICByZXR1cm4gbWtkaXIocGF0aCk7XG59O1xuXG5TZnRwQ2xpZW50LnByb3RvdHlwZS5ybWRpciA9IGZ1bmN0aW9uKHBhdGgsIHJlY3Vyc2l2ZSA9IGZhbHNlKSB7XG4gIGxldCBzZnRwID0gdGhpcy5zZnRwO1xuXG4gIGxldCBkb1JtZGlyID0gcCA9PiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcblxuICAgICAgaWYgKCFzZnRwKSB7XG4gICAgICAgIHJldHVybiByZWplY3QobmV3IEVycm9yKCdzZnRwIGNvbm5lY3QgZXJyb3InKSk7XG4gICAgICB9XG4gICAgICBzZnRwLnJtZGlyKHAsIGVyciA9PiB7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICByZWplY3QobmV3IEVycm9yKGBGYWlsZWQgdG8gcmVtb3ZlIGRpcmVjdG9yeSAke3B9OiAke2Vyci5tZXNzYWdlfWApKTtcbiAgICAgICAgfVxuICAgICAgICByZXNvbHZlKCdTdWNjZXNzZnVsbHkgcmVtb3ZlZCBkaXJlY3RvcnknKTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9KTtcbiAgfTtcblxuICBpZiAoIXJlY3Vyc2l2ZSkge1xuICAgIHJldHVybiBkb1JtZGlyKHBhdGgpO1xuICB9XG5cbiAgbGV0IHJtZGlyID0gcCA9PiB7XG4gICAgbGV0IGxpc3Q7XG4gICAgbGV0IGZpbGVzO1xuICAgIGxldCBkaXJzO1xuICAgIHJldHVybiB0aGlzLmxpc3QocCkudGhlbigocmVzKSA9PiB7XG4gICAgICBsaXN0ID0gcmVzO1xuICAgICAgZmlsZXMgPSBsaXN0LmZpbHRlcihpdGVtID0+IGl0ZW0udHlwZSA9PT0gJy0nKTtcbiAgICAgIGRpcnMgPSBsaXN0LmZpbHRlcihpdGVtID0+IGl0ZW0udHlwZSA9PT0gJ2QnKTtcbiAgICAgIHJldHVybiBmb3JFYWNoQXN5bmMoZmlsZXMsIChmKSA9PiB7XG4gICAgICAgIHJldHVybiB0aGlzLmRlbGV0ZShvc1BhdGguam9pbihwLCBmLm5hbWUpKTtcbiAgICAgIH0pO1xuICAgIH0pLnRoZW4oKCkgPT4ge1xuICAgICAgcmV0dXJuIGZvckVhY2hBc3luYyhkaXJzLCAoZCkgPT4ge1xuICAgICAgICByZXR1cm4gcm1kaXIob3NQYXRoLmpvaW4ocCwgZC5uYW1lKSk7XG4gICAgICB9KTtcbiAgICB9KS50aGVuKCgpID0+IHtcbiAgICAgIHJldHVybiBkb1JtZGlyKHApO1xuICAgIH0pO1xuICB9O1xuICByZXR1cm4gcm1kaXIocGF0aCk7XG59O1xuXG4vKipcbiAqIEBhc3luY1xuICpcbiAqIERlbGV0ZSBhIGZpbGUgb24gdGhlIHJlbW90ZSBTRlRQIHNlcnZlclxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBwYXRoIC0gcGF0aCB0byB0aGUgZmlsZSB0byBkZWxldGVcbiAqIEByZXR1cm4ge1Byb21pc2V9IHdpdGggc3RyaW5nICdTdWNjZXNzZnVsbHkgZGVsZWV0ZWQgZmlsZScgb25jZSByZXNvbHZlZFxuICogXG4gKi9cblNmdHBDbGllbnQucHJvdG90eXBlLmRlbGV0ZSA9IGZ1bmN0aW9uKHBhdGgpIHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBsZXQgc2Z0cCA9IHRoaXMuc2Z0cDtcblxuICAgIGlmICghc2Z0cCkge1xuICAgICAgcmV0dXJuIHJlamVjdChuZXcgRXJyb3IoJ3NmdHAgY29ubmVjdCBlcnJvcicpKTsgICAgICBcbiAgICB9XG4gICAgc2Z0cC51bmxpbmsocGF0aCwgKGVycikgPT4ge1xuICAgICAgaWYgKGVycikge1xuICAgICAgICByZWplY3QobmV3IEVycm9yKGBGYWlsZWQgdG8gZGVsZXRlIGZpbGUgJHtwYXRofTogJHtlcnIubWVzc2FnZX1gKSk7XG4gICAgICB9XG4gICAgICByZXNvbHZlKCdTdWNjZXNzZnVsbHkgZGVsZXRlZCBmaWxlJyk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfSk7XG59O1xuXG4vKipcbiAqIEBhc3luY1xuICpcbiAqIFJlbmFtZSBhIGZpbGUgb24gdGhlIHJlbW90ZSBTRlRQIHJlcG9zaXRvcnlcbiAqXG4gKiBAcGFyYW0ge3NyaW5nfSBzcmNQYXRoIC0gcGF0aCB0byB0aGUgZmlsZSB0byBiZSByZW5hbWNlZC5cbiAqIEBwYXJhbSB7c3RyaW5nfSByZW1vdGVQYXRoIC0gcGF0aCB0byB0aGUgbmV3IG5hbWUuXG4gKlxuICogQHJldHVybiB7UHJvbWlzZX1cbiAqIFxuICovXG5TZnRwQ2xpZW50LnByb3RvdHlwZS5yZW5hbWUgPSBmdW5jdGlvbihzcmNQYXRoLCByZW1vdGVQYXRoKSB7XG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgbGV0IHNmdHAgPSB0aGlzLnNmdHA7XG5cbiAgICBpZiAoIXNmdHApIHtcbiAgICAgIHJldHVybiByZWplY3QobmV3IEVycm9yKCdzZnRwIGNvbm5lY3QgZXJyb3InKSk7ICAgICAgXG4gICAgfVxuICAgIHNmdHAucmVuYW1lKHNyY1BhdGgsIHJlbW90ZVBhdGgsIChlcnIpID0+IHtcbiAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihgRmFpbGVkIHRvIHJlbmFtZSBmaWxlICR7c3JjUGF0aH0gdG8gJHtyZW1vdGVQYXRofTogJHtlcnIubWVzc2FnZX1gKSk7XG4gICAgICB9XG4gICAgICByZXNvbHZlKGBTdWNjZXNzZnVsbHkgcmVuYW1lZCAke3NyY1BhdGh9IHRvICR7cmVtb3RlUGF0aH1gKTtcbiAgICB9KTtcbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9KTtcbn07XG5cbi8qKlxuICogQGFzeW5jXG4gKlxuICogQ2hhbmdlIHRoZSBtb2RlIG9mIGEgcmVtb3RlIGZpbGUgb24gdGhlIFNGVFAgcmVwb3NpdG9yeVxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSByZW1vdGVQYXRoIC0gcGF0aCB0byB0aGUgcmVtb3RlIHRhcmdldCBvYmplY3QuXG4gKiBAcGFyYW0ge09jdGFsfSBtb2RlIC0gdGhlIG5ldyBtb2RlIHRvIHNldFxuICpcbiAqIEByZXR1cm4ge1Byb21pc2V9LlxuICovXG5TZnRwQ2xpZW50LnByb3RvdHlwZS5jaG1vZCA9IGZ1bmN0aW9uKHJlbW90ZVBhdGgsIG1vZGUpIHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBsZXQgc2Z0cCA9IHRoaXMuc2Z0cDtcblxuICAgIGlmICghc2Z0cCkge1xuICAgICAgcmV0dXJuIHJlamVjdChuZXcgRXJyb3IoJ3NmdHAgY29ubmVjdCBlcnJvcicpKTsgICAgICBcbiAgICB9XG4gICAgc2Z0cC5jaG1vZChyZW1vdGVQYXRoLCBtb2RlLCAoZXJyKSA9PiB7XG4gICAgICBpZiAoZXJyKSB7XG4gICAgICAgIHJlamVjdChuZXcgRXJyb3IoYEZhaWxlZCB0byBjaGFuZ2UgbW9kZSBmb3IgJHtyZW1vdGVQYXRofTogJHtlcnIubWVzc2FnZX1gKSk7XG4gICAgICB9XG4gICAgICByZXNvbHZlKCdTdWNjZXNzZnVsbHkgY2hhbmdlIGZpbGUgbW9kZScpO1xuICAgIH0pO1xuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH0pO1xufTtcblxuLyoqXG4gKiBAYXN5bmNcbiAqXG4gKiBDcmVhdGUgYSBuZXcgU0ZUUCBjb25uZWN0aW9uIHRvIGEgcmVtb3RlIFNGVFAgc2VydmVyXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZyAtIGFuIFNGVFAgY29uZmlndXJhdGlvbiBvYmplY3RcbiAqIEBwYXJhbSB7c3RyaW5nfSBjb25uZWN0TWV0aG9kIC0gPz8/XG4gKlxuICogQHJldHVybiB7UHJvbWlzZX0gd2hpY2ggd2lsbCByZXNvbHZlIHRvIGFuIHNmdHAgY2xpZW50IG9iamVjdFxuICogXG4gKi9cblNmdHBDbGllbnQucHJvdG90eXBlLmNvbm5lY3QgPSBmdW5jdGlvbihjb25maWcsIGNvbm5lY3RNZXRob2QpIHtcbiAgY29ubmVjdE1ldGhvZCA9IGNvbm5lY3RNZXRob2QgfHwgJ29uJztcblxuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIHRoaXMuY2xpZW50W2Nvbm5lY3RNZXRob2RdKCdyZWFkeScsICgpID0+IHtcbiAgICAgIHRoaXMuY2xpZW50LnNmdHAoKGVyciwgc2Z0cCkgPT4ge1xuICAgICAgICB0aGlzLmNsaWVudC5yZW1vdmVMaXN0ZW5lcignZXJyb3InLCByZWplY3QpO1xuICAgICAgICB0aGlzLmNsaWVudC5yZW1vdmVMaXN0ZW5lcignZW5kJywgcmVqZWN0KTtcbiAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IoYEZhaWxlZCB0byBjb25uZWN0IHRvIHNlcnZlcjogJHtlcnIubWVzc2FnZX1gKSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zZnRwID0gc2Z0cDtcbiAgICAgICAgcmVzb2x2ZShzZnRwKTtcbiAgICAgIH0pO1xuICAgIH0pXG4gICAgICAub24oJ2VuZCcsIHJlamVjdClcbiAgICAgIC5vbignZXJyb3InLCByZWplY3QpXG4gICAgICAuY29ubmVjdChjb25maWcpO1xuICB9KTtcbn07XG5cbi8qKlxuICogQGFzeW5jXG4gKlxuICogQ2xvc2UgdGhlIFNGVFAgY29ubmVjdGlvblxuICogXG4gKi9cblNmdHBDbGllbnQucHJvdG90eXBlLmVuZCA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICB0aGlzLmNsaWVudC5lbmQoKTtcbiAgICByZXNvbHZlKCk7XG4gIH0pO1xufTtcblxuU2Z0cENsaWVudC5wcm90b3R5cGUuZ2V0T3B0aW9ucyA9IGZ1bmN0aW9uKHVzZUNvbXByZXNzaW9uLCBlbmNvZGluZywgb3RoZXJPcHRpb25zKSB7XG4gIGlmKGVuY29kaW5nID09PSB1bmRlZmluZWQpe1xuICAgIGVuY29kaW5nID0gJ3V0ZjgnO1xuICB9XG4gIGxldCBvcHRpb25zID0gT2JqZWN0LmFzc2lnbih7fSwgb3RoZXJPcHRpb25zIHx8IHt9LCB7ZW5jb2Rpbmc6IGVuY29kaW5nfSwgdXNlQ29tcHJlc3Npb24pO1xuICByZXR1cm4gb3B0aW9ucztcbn07XG5cbi8vIGFkZCBFdmVudCB0eXBlIHN1cHBvcnRcblNmdHBDbGllbnQucHJvdG90eXBlLm9uID0gZnVuY3Rpb24oZXZlbnRUeXBlLCBjYWxsYmFjaykge1xuICB0aGlzLmNsaWVudC5vbihldmVudFR5cGUsIGNhbGxiYWNrKTtcbn07XG5cblxubW9kdWxlLmV4cG9ydHMgPSBTZnRwQ2xpZW50O1xuXG4vLyBzZnRwID0gbmV3IFNmdHBDbGllbnQoKVxuLy8gc2Z0cC5jbGllbnQub24oJ2V2ZW50Jylcbi8vXG4vLyBzZnRwLm9uKCdlbmQnLCAoKT0+e30pICAgPT4gdGhpcy5jbGllbnQub24oJ2V2ZW50JywgY2FsbGJhY2spXG4vLyBzZnRwLm9uKCdlcnJvcicsICgpID0+IHt9KVxuIl19