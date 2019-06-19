var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x5, _x6, _x7) { var _again = true; _function: while (_again) { var object = _x5, property = _x6, receiver = _x7; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x5 = parent; _x6 = property; _x7 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _helperJs = require('./helper.js');

var _formatJs = require('./format.js');

'use babel';

var EventEmitter = require('events');
var tempDirectory = require('os').tmpdir();
var shortHash = require('short-hash');
var Path = require('path');
var FileSystem = require('fs-plus');

var FinderItemsCache = (function (_EventEmitter) {
  _inherits(FinderItemsCache, _EventEmitter);

  function FinderItemsCache(config, connector) {
    _classCallCheck(this, FinderItemsCache);

    _get(Object.getPrototypeOf(FinderItemsCache.prototype), 'constructor', this).call(this);
    var self = this;

    self.items = [];
    self.paths = [];
    self.config = config;
    self.connector = connector;
    self.loadTask = false;
  }

  _createClass(FinderItemsCache, [{
    key: 'load',
    value: function load() {
      var reindex = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

      var self = this;

      if (reindex) {
        self.loadTask = false;
        self.items = [];
        self.paths = [];
      }

      if (self.loadTask) return;

      if (reindex) {
        self.deleteCache();
      } else if (self.loadCache()) {
        if (self.paths.length > 0) {
          self.emit('finder-items-cache-queue:update', self.items);
        } else {
          self.emit('finder-items-cache-queue:finish', self.items);
          return true;
        }
      }

      if (self.paths.length == 0) {
        self.paths.push({
          path: self.config.remote + '/',
          relativePath: '/'
        });
      }

      self.loadTask = true;
      self.list(self.paths).then(function (list) {
        self.storeCache(true);
        self.loadTask = false;
        self.emit('finder-items-cache-queue:finish', self.items);
      })['catch'](function (err) {
        self.storeCache(true);
        self.loadTask = false;
        self.emit('finder-items-cache-queue:error', err);
      });
    }
  }, {
    key: 'list',
    value: function list() {
      var self = this;

      var tmp = self.paths.shift();
      var path = tmp.path;
      var relativePath = tmp.relativePath;

      if (!self.loadTask) {
        return new Promise(function (resolve, reject) {
          resolve();
        });
      }

      return self.connector.listDirectory(path).then(function (list) {
        list.forEach(function (element) {
          if (element.type == 'd' && !(0, _helperJs.isFinderPathIgnored)(element.name)) {
            self.paths.push({ path: path + element.name + '/', relativePath: relativePath + element.name + '/' });
          } else if (element.type === '-' && !(0, _helperJs.isFinderPathIgnored)(element.name)) {
            self.items.push({ file: element.name, directory: relativePath, relativePath: relativePath + element.name, size: element.size });
          }
        });
        self.emit('finder-items-cache-queue:index', self.items);

        if (self.paths.length > 0) {
          return self.list().then(function () {
            return new Promise(function (resolve, reject) {
              resolve();
            });
          })['catch'](function (err) {
            return new Promise(function (resolve, reject) {
              reject(err);
            });
          });
        } else {
          return new Promise(function (resolve, reject) {
            resolve();
          });
        }
      })['catch'](function (err) {
        self.loadTask = false;
        return new Promise(function (resolve, reject) {
          reject(err);
        });
      });
    }
  }, {
    key: 'storeCache',
    value: function storeCache() {
      var createFile = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

      var self = this;

      var path = (self.config.remote ? tempDirectory + '/' + shortHash(self.config.host + self.config.name) + '/' + self.config.host + '/' + self.config.remote + '/' : tempDirectory + '/' + shortHash(self.config.host + self.config.name) + '/' + self.config.host + '/').replace(/\/+/g, Path.sep);
      var file = path + Path.sep + '.cache';

      if (!createFile && !FileSystem.existsSync(file)) return;

      var cache = {
        paths: self.paths,
        items: self.items
      };
      try {
        FileSystem.writeFileSync(file, JSON.stringify(cache));
      } catch (ex) {}
    }
  }, {
    key: 'loadCache',
    value: function loadCache() {
      var self = this;

      if (self.loadTask) return true;

      var path = (self.config.remote ? tempDirectory + '/' + shortHash(self.config.host + self.config.name) + '/' + self.config.host + '/' + self.config.remote + '/' : tempDirectory + '/' + shortHash(self.config.host + self.config.name) + '/' + self.config.host + '/').replace(/\/+/g, Path.sep);
      var file = path + Path.sep + '.cache';

      try {
        if (FileSystem.existsSync(file)) {
          var tmp = FileSystem.readFileSync(file);
          cache = JSON.parse(tmp);
          self.paths = cache.paths;
          self.items = cache.items;
          return true;
        }
      } catch (ex) {}
      return false;
    }
  }, {
    key: 'deleteCache',
    value: function deleteCache() {
      var self = this;

      var path = (self.config.remote ? tempDirectory + '/' + shortHash(self.config.host + self.config.name) + '/' + self.config.host + '/' + self.config.remote + '/' : tempDirectory + '/' + shortHash(self.config.host + self.config.name) + '/' + self.config.host + '/').replace(/\/+/g, Path.sep);
      var file = path + Path.sep + '.cache';

      try {
        if (FileSystem.existsSync(file)) {
          FileSystem.unlinkSync(file);
          self.paths = [];
          self.items = [];
          return true;
        }
      } catch (ex) {
        self.paths = [];
        self.items = [];
      }

      return false;
    }
  }, {
    key: 'addFile',
    value: function addFile(relativePath) {
      var size = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];

      var self = this;

      if (!self.items) return;
      if (!self.loadTask && !self.loadCache()) return;

      var file = (0, _formatJs.basename)(relativePath);
      self.items.push({ file: file, directory: (0, _formatJs.dirname)(relativePath), relativePath: relativePath, size: size });
      self.storeCache();
      self.emit('finder-items-cache-queue:update', self.items);
    }
  }, {
    key: 'renameFile',
    value: function renameFile(oldRelativePath, newRelativePath) {
      var size = arguments.length <= 2 || arguments[2] === undefined ? 0 : arguments[2];

      var self = this;

      if (!self.items) return;
      if (!self.loadTask && !self.loadCache()) return;

      // Remove old
      self.items = self.items.filter(function (item) {
        return item.relativePath != oldRelativePath;
      });

      // Add new
      self.items.push({ file: (0, _formatJs.basename)(newRelativePath), directory: (0, _formatJs.dirname)(newRelativePath), relativePath: newRelativePath, size: size });
      self.storeCache();
      self.emit('finder-items-cache-queue:update', self.items);
    }
  }, {
    key: 'deleteFile',
    value: function deleteFile(relativePath) {
      var self = this;

      if (!self.items) return;
      if (!self.loadTask && !self.loadCache()) return;

      self.items = self.items.filter(function (item) {
        return item.relativePath != relativePath;
      });
      self.storeCache();
      self.emit('finder-items-cache-queue:update', self.items);
    }
  }, {
    key: 'refreshDirectory',
    value: function refreshDirectory(directory, files) {
      var self = this;

      if (!self.items || !files) return;
      if (!self.loadTask && !self.loadCache()) return;

      // Remove old files in same directory
      self.items = self.items.filter(function (item) {
        return item.directory != directory;
      });

      // Add new files for same directory
      files.forEach(function (file) {
        self.items.push({ file: file.name, directory: directory, relativePath: directory + file.name, size: file.size });
      });

      self.storeCache();
      self.emit('finder-items-cache-queue:update', self.items);
    }
  }, {
    key: 'renameDirectory',
    value: function renameDirectory(oldRelativePath, newRelativePath) {
      var self = this;

      if (!self.items) return;
      if (!self.loadTask && !self.loadCache()) return;

      // get files
      var items = self.items.filter(function (item) {
        return item.directory.startsWith(oldRelativePath);
      });

      // Remove files in directory
      self.items = self.items.filter(function (item) {
        return !item.directory.startsWith(oldRelativePath);
      });

      // Add new files for directory
      items.forEach(function (item) {
        self.items.push({ file: item.file, directory: item.directory.replace(oldRelativePath, newRelativePath), relativePath: item.relativePath.replace(oldRelativePath, newRelativePath), size: item.size });
      });

      self.storeCache();
      self.emit('finder-items-cache-queue:update', self.items);
    }
  }, {
    key: 'deleteDirectory',
    value: function deleteDirectory(relativePath) {
      var self = this;

      if (!self.items) return;
      if (!self.loadTask && !self.loadCache()) return;

      // Remove files in directory
      self.items = self.items.filter(function (item) {
        return !item.directory.startsWith(relativePath);
      });

      self.storeCache();
      self.emit('finder-items-cache-queue:update', self.items);
    }
  }]);

  return FinderItemsCache;
})(EventEmitter);

module.exports = FinderItemsCache;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2FuYW5tYXlqYWluLy5hdG9tL3BhY2thZ2VzL2Z0cC1yZW1vdGUtZWRpdC9saWIvaGVscGVyL2ZpbmRlci1pdGVtcy1jYWNoZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozt3QkFFb0MsYUFBYTs7d0JBQ2YsYUFBYTs7QUFIL0MsV0FBVyxDQUFDOztBQUtaLElBQU0sWUFBWSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUN2QyxJQUFNLGFBQWEsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7QUFDN0MsSUFBTSxTQUFTLEdBQUcsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQ3hDLElBQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUM3QixJQUFNLFVBQVUsR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7O0lBRWhDLGdCQUFnQjtZQUFoQixnQkFBZ0I7O0FBRVQsV0FGUCxnQkFBZ0IsQ0FFUixNQUFNLEVBQUUsU0FBUyxFQUFFOzBCQUYzQixnQkFBZ0I7O0FBR2xCLCtCQUhFLGdCQUFnQiw2Q0FHVjtBQUNSLFFBQU0sSUFBSSxHQUFHLElBQUksQ0FBQzs7QUFFbEIsUUFBSSxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUM7QUFDaEIsUUFBSSxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUM7QUFDaEIsUUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7QUFDckIsUUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7QUFDM0IsUUFBSSxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7R0FDdkI7O2VBWEcsZ0JBQWdCOztXQWFoQixnQkFBa0I7VUFBakIsT0FBTyx5REFBRyxLQUFLOztBQUNsQixVQUFNLElBQUksR0FBRyxJQUFJLENBQUM7O0FBRWxCLFVBQUksT0FBTyxFQUFFO0FBQ1gsWUFBSSxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7QUFDdEIsWUFB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QUksQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLGVBQWUsRUFBRSxlQUFlLENBQUMsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7T0FDdk0sQ0FBQyxDQUFDOztBQUVILFVBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztBQUNsQixVQUFJLENBQUMsSUFBSSxDQUFDLGlDQUFpQyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztLQUMxRDs7O1dBRWMseUJBQUMsWUFBWSxFQUFFO0FBQzVCLFVBQU0sSUFBSSxHQUFHLElBQUksQ0FBQzs7QUFFbEIsVUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsT0FBTztBQUN4QixVQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsRUFBRSxPQUFPOzs7QUFHaEQsVUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxVQUFDLElBQUksRUFBSztBQUN2QyxlQUFPLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsWUFBWSxDQUFDLENBQUM7T0FDakQsQ0FBQyxDQUFDOztBQUVILFVBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztBQUNsQixVQUFJLENBQUMsSUFBSSxDQUFDLGlDQUFpQyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztLQUMxRDs7O1NBeFFHLGdCQUFnQjtHQUFTLFlBQVk7O0FBMlEzQyxNQUFNLENBQUMsT0FBTyxHQUFHLGdCQUFnQixDQUFDIiwiZmlsZSI6Ii9ob21lL2FuYW5tYXlqYWluLy5hdG9tL3BhY2thZ2VzL2Z0cC1yZW1vdGUtZWRpdC9saWIvaGVscGVyL2ZpbmRlci1pdGVtcy1jYWNoZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG5pbXBvcnQgeyBpc0ZpbmRlclBhdGhJZ25vcmVkIH0gZnJvbSAnLi9oZWxwZXIuanMnO1xuaW1wb3J0IHsgYmFzZW5hbWUsIGRpcm5hbWUgfSBmcm9tICcuL2Zvcm1hdC5qcyc7XG5cbmNvbnN0IEV2ZW50RW1pdHRlciA9IHJlcXVpcmUoJ2V2ZW50cycpO1xuY29uc3QgdGVtcERpcmVjdG9yeSA9IHJlcXVpcmUoJ29zJykudG1wZGlyKCk7XG5jb25zdCBzaG9ydEhhc2ggPSByZXF1aXJlKCdzaG9ydC1oYXNoJyk7XG5jb25zdCBQYXRoID0gcmVxdWlyZSgncGF0aCcpO1xuY29uc3QgRmlsZVN5c3RlbSA9IHJlcXVpcmUoJ2ZzLXBsdXMnKTtcblxuY2xhc3MgRmluZGVySXRlbXNDYWNoZSBleHRlbmRzIEV2ZW50RW1pdHRlciB7XG5cbiAgY29uc3RydWN0b3IoY29uZmlnLCBjb25uZWN0b3IpIHtcbiAgICBzdXBlcigpO1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuXG4gICAgc2VsZi5pdGVtcyA9IFtdO1xuICAgIHNlbGYucGF0aHMgPSBbXTtcbiAgICBzZWxmLmNvbmZpZyA9IGNvbmZpZztcbiAgICBzZWxmLmNvbm5lY3RvciA9IGNvbm5lY3RvcjtcbiAgICBzZWxmLmxvYWRUYXNrID0gZmFsc2U7XG4gIH1cblxuICBsb2FkKHJlaW5kZXggPSBmYWxzZSkge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuXG4gICAgaWYgKHJlaW5kZXgpIHtcbiAgICAgIHNlbGYubG9hZFRhc2sgPSBmYWxzZTtcbiAgICAgIHNlbGYuaXRlbXMgPSBbXTtcbiAgICAgIHNlbGYucGF0aHMgPSBbXTtcbiAgICB9XG5cbiAgICBpZiAoc2VsZi5sb2FkVGFzaykgcmV0dXJuO1xuXG4gICAgaWYgKHJlaW5kZXgpIHtcbiAgICAgIHNlbGYuZGVsZXRlQ2FjaGUoKTtcbiAgICB9IGVsc2UgaWYgKHNlbGYubG9hZENhY2hlKCkpIHtcbiAgICAgIGlmIChzZWxmLnBhdGhzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgc2VsZi5lbWl0KCdmaW5kZXItaXRlbXMtY2FjaGUtcXVldWU6dXBkYXRlJywgc2VsZi5pdGVtcyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzZWxmLmVtaXQoJ2ZpbmRlci1pdGVtcy1jYWNoZS1xdWV1ZTpmaW5pc2gnLCBzZWxmLml0ZW1zKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHNlbGYucGF0aHMubGVuZ3RoID09IDApIHtcbiAgICAgIHNlbGYucGF0aHMucHVzaCh7XG4gICAgICAgIHBhdGg6IHNlbGYuY29uZmlnLnJlbW90ZSArICcvJyxcbiAgICAgICAgcmVsYXRpdmVQYXRoOiAnLydcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHNlbGYubG9hZFRhc2sgPSB0cnVlO1xuICAgIHNlbGYubGlzdChzZWxmLnBhdGhzKS50aGVuKChsaXN0KSA9PiB7XG4gICAgICBzZWxmLnN0b3JlQ2FjaGUodHJ1ZSk7XG4gICAgICBzZWxmLmxvYWRUYXNrID0gZmFsc2U7XG4gICAgICBzZWxmLmVtaXQoJ2ZpbmRlci1pdGVtcy1jYWNoZS1xdWV1ZTpmaW5pc2gnLCBzZWxmLml0ZW1zKTtcbiAgICB9KS5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICBzZWxmLnN0b3JlQ2FjaGUodHJ1ZSk7XG4gICAgICBzZWxmLmxvYWRUYXNrID0gZmFsc2U7XG4gICAgICBzZWxmLmVtaXQoJ2ZpbmRlci1pdGVtcy1jYWNoZS1xdWV1ZTplcnJvcicsIGVycik7XG4gICAgfSk7XG4gIH1cblxuICBsaXN0KCkge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuXG4gICAgbGV0IHRtcCA9IHNlbGYucGF0aHMuc2hpZnQoKTtcbiAgICBsZXQgcGF0aCA9IHRtcC5wYXRoO1xuICAgIGxldCByZWxhdGl2ZVBhdGggPSB0bXAucmVsYXRpdmVQYXRoO1xuXG4gICAgaWYgKCFzZWxmLmxvYWRUYXNrKSB7XG4gICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICByZXNvbHZlKCk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gc2VsZi5jb25uZWN0b3IubGlzdERpcmVjdG9yeShwYXRoKS50aGVuKChsaXN0KSA9PiB7XG4gICAgICBsaXN0LmZvckVhY2goKGVsZW1lbnQpID0+IHtcbiAgICAgICAgaWYgKGVsZW1lbnQudHlwZSA9PSAnZCcgJiYgIWlzRmluZGVyUGF0aElnbm9yZWQoZWxlbWVudC5uYW1lKSkge1xuICAgICAgICAgIHNlbGYucGF0aHMucHVzaCh7IHBhdGg6IHBhdGggKyBlbGVtZW50Lm5hbWUgKyAnLycsIHJlbGF0aXZlUGF0aDogcmVsYXRpdmVQYXRoICsgZWxlbWVudC5uYW1lICsgJy8nIH0pO1xuICAgICAgICB9IGVsc2UgaWYgKGVsZW1lbnQudHlwZSA9PT0gJy0nICYmICFpc0ZpbmRlclBhdGhJZ25vcmVkKGVsZW1lbnQubmFtZSkpIHtcbiAgICAgICAgICBzZWxmLml0ZW1zLnB1c2goeyBmaWxlOiBlbGVtZW50Lm5hbWUsIGRpcmVjdG9yeTogcmVsYXRpdmVQYXRoLCByZWxhdGl2ZVBhdGg6IHJlbGF0aXZlUGF0aCArIGVsZW1lbnQubmFtZSwgc2l6ZTogZWxlbWVudC5zaXplIH0pO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIHNlbGYuZW1pdCgnZmluZGVyLWl0ZW1zLWNhY2hlLXF1ZXVlOmluZGV4Jywgc2VsZi5pdGVtcyk7XG5cbiAgICAgIGlmIChzZWxmLnBhdGhzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgcmV0dXJuIHNlbGYubGlzdCgpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgcmVqZWN0KGVycik7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0pLmNhdGNoKChlcnIpID0+IHtcbiAgICAgIHNlbGYubG9hZFRhc2sgPSBmYWxzZTtcbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICBzdG9yZUNhY2hlKGNyZWF0ZUZpbGUgPSBmYWxzZSkge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuXG4gICAgbGV0IHBhdGggPSAoKHNlbGYuY29uZmlnLnJlbW90ZSkgP1xuICAgICAgdGVtcERpcmVjdG9yeSArICcvJyArIHNob3J0SGFzaChzZWxmLmNvbmZpZy5ob3N0ICsgc2VsZi5jb25maWcubmFtZSkgKyAnLycgKyBzZWxmLmNvbmZpZy5ob3N0ICsgJy8nICsgc2VsZi5jb25maWcucmVtb3RlICsgJy8nIDpcbiAgICAgIHRlbXBEaXJlY3RvcnkgKyAnLycgKyBzaG9ydEhhc2goc2VsZi5jb25maWcuaG9zdCArIHNlbGYuY29uZmlnLm5hbWUpICsgJy8nICsgc2VsZi5jb25maWcuaG9zdCArICcvJykucmVwbGFjZSgvXFwvKy9nLCBQYXRoLnNlcCk7XG4gICAgbGV0IGZpbGUgPSBwYXRoICsgUGF0aC5zZXAgKyAnLmNhY2hlJztcblxuICAgIGlmICghY3JlYXRlRmlsZSAmJiAhRmlsZVN5c3RlbS5leGlzdHNTeW5jKGZpbGUpKSByZXR1cm47XG5cbiAgICBsZXQgY2FjaGUgPSB7XG4gICAgICBwYXRoczogc2VsZi5wYXRocyxcbiAgICAgIGl0ZW1zOiBzZWxmLml0ZW1zLFxuICAgIH1cbiAgICB0cnkge1xuICAgICAgRmlsZVN5c3RlbS53cml0ZUZpbGVTeW5jKGZpbGUsIEpTT04uc3RyaW5naWZ5KGNhY2hlKSk7XG4gICAgfSBjYXRjaCAoZXgpIHt9XG4gIH1cblxuICBsb2FkQ2FjaGUoKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG5cbiAgICBpZiAoc2VsZi5sb2FkVGFzaykgcmV0dXJuIHRydWU7XG5cbiAgICBsZXQgcGF0aCA9ICgoc2VsZi5jb25maWcucmVtb3RlKSA/XG4gICAgICB0ZW1wRGlyZWN0b3J5ICsgJy8nICsgc2hvcnRIYXNoKHNlbGYuY29uZmlnLmhvc3QgKyBzZWxmLmNvbmZpZy5uYW1lKSArICcvJyArIHNlbGYuY29uZmlnLmhvc3QgKyAnLycgKyBzZWxmLmNvbmZpZy5yZW1vdGUgKyAnLycgOlxuICAgICAgdGVtcERpcmVjdG9yeSArICcvJyArIHNob3J0SGFzaChzZWxmLmNvbmZpZy5ob3N0ICsgc2VsZi5jb25maWcubmFtZSkgKyAnLycgKyBzZWxmLmNvbmZpZy5ob3N0ICsgJy8nKS5yZXBsYWNlKC9cXC8rL2csIFBhdGguc2VwKTtcbiAgICBsZXQgZmlsZSA9IHBhdGggKyBQYXRoLnNlcCArICcuY2FjaGUnO1xuXG4gICAgdHJ5IHtcbiAgICAgIGlmIChGaWxlU3lzdGVtLmV4aXN0c1N5bmMoZmlsZSkpIHtcbiAgICAgICAgbGV0IHRtcCA9IEZpbGVTeXN0ZW0ucmVhZEZpbGVTeW5jKGZpbGUpO1xuICAgICAgICBjYWNoZSA9IEpTT04ucGFyc2UodG1wKTtcbiAgICAgICAgc2VsZi5wYXRocyA9IGNhY2hlLnBhdGhzO1xuICAgICAgICBzZWxmLml0ZW1zID0gY2FjaGUuaXRlbXM7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGV4KSB7fVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGRlbGV0ZUNhY2hlKCkge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuXG4gICAgbGV0IHBhdGggPSAoKHNlbGYuY29uZmlnLnJlbW90ZSkgP1xuICAgICAgdGVtcERpcmVjdG9yeSArICcvJyArIHNob3J0SGFzaChzZWxmLmNvbmZpZy5ob3N0ICsgc2VsZi5jb25maWcubmFtZSkgKyAnLycgKyBzZWxmLmNvbmZpZy5ob3N0ICsgJy8nICsgc2VsZi5jb25maWcucmVtb3RlICsgJy8nIDpcbiAgICAgIHRlbXBEaXJlY3RvcnkgKyAnLycgKyBzaG9ydEhhc2goc2VsZi5jb25maWcuaG9zdCArIHNlbGYuY29uZmlnLm5hbWUpICsgJy8nICsgc2VsZi5jb25maWcuaG9zdCArICcvJykucmVwbGFjZSgvXFwvKy9nLCBQYXRoLnNlcCk7XG4gICAgbGV0IGZpbGUgPSBwYXRoICsgUGF0aC5zZXAgKyAnLmNhY2hlJztcblxuICAgIHRyeSB7XG4gICAgICBpZiAoRmlsZVN5c3RlbS5leGlzdHNTeW5jKGZpbGUpKSB7XG4gICAgICAgIEZpbGVTeXN0ZW0udW5saW5rU3luYyhmaWxlKTtcbiAgICAgICAgc2VsZi5wYXRocyA9IFtdO1xuICAgICAgICBzZWxmLml0ZW1zID0gW107XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGV4KSB7XG4gICAgICBzZWxmLnBhdGhzID0gW107XG4gICAgICBzZWxmLml0ZW1zID0gW107XG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgYWRkRmlsZShyZWxhdGl2ZVBhdGgsIHNpemUgPSAwKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG5cbiAgICBpZiAoIXNlbGYuaXRlbXMpIHJldHVybjtcbiAgICBpZiAoIXNlbGYubG9hZFRhc2sgJiYgIXNlbGYubG9hZENhY2hlKCkpIHJldHVybjtcblxuICAgIGxldCBmaWxlID0gYmFzZW5hbWUocmVsYXRpdmVQYXRoKTtcbiAgICBzZWxmLml0ZW1zLnB1c2goeyBmaWxlOiBmaWxlLCBkaXJlY3Rvcnk6IGRpcm5hbWUocmVsYXRpdmVQYXRoKSwgcmVsYXRpdmVQYXRoOiByZWxhdGl2ZVBhdGgsIHNpemU6IHNpemUgfSk7XG4gICAgc2VsZi5zdG9yZUNhY2hlKCk7XG4gICAgc2VsZi5lbWl0KCdmaW5kZXItaXRlbXMtY2FjaGUtcXVldWU6dXBkYXRlJywgc2VsZi5pdGVtcyk7XG4gIH1cblxuICByZW5hbWVGaWxlKG9sZFJlbGF0aXZlUGF0aCwgbmV3UmVsYXRpdmVQYXRoLCBzaXplID0gMCkge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuXG4gICAgaWYgKCFzZWxmLml0ZW1zKSByZXR1cm47XG4gICAgaWYgKCFzZWxmLmxvYWRUYXNrICYmICFzZWxmLmxvYWRDYWNoZSgpKSByZXR1cm47XG5cbiAgICAvLyBSZW1vdmUgb2xkXG4gICAgc2VsZi5pdGVtcyA9IHNlbGYuaXRlbXMuZmlsdGVyKChpdGVtKSA9PiB7XG4gICAgICByZXR1cm4gaXRlbS5yZWxhdGl2ZVBhdGggIT0gb2xkUmVsYXRpdmVQYXRoO1xuICAgIH0pO1xuXG4gICAgLy8gQWRkIG5ld1xuICAgIHNlbGYuaXRlbXMucHVzaCh7IGZpbGU6IGJhc2VuYW1lKG5ld1JlbGF0aXZlUGF0aCksIGRpcmVjdG9yeTogZGlybmFtZShuZXdSZWxhdGl2ZVBhdGgpLCByZWxhdGl2ZVBhdGg6IG5ld1JlbGF0aXZlUGF0aCwgc2l6ZTogc2l6ZSB9KTtcbiAgICBzZWxmLnN0b3JlQ2FjaGUoKTtcbiAgICBzZWxmLmVtaXQoJ2ZpbmRlci1pdGVtcy1jYWNoZS1xdWV1ZTp1cGRhdGUnLCBzZWxmLml0ZW1zKTtcbiAgfVxuXG4gIGRlbGV0ZUZpbGUocmVsYXRpdmVQYXRoKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG5cbiAgICBpZiAoIXNlbGYuaXRlbXMpIHJldHVybjtcbiAgICBpZiAoIXNlbGYubG9hZFRhc2sgJiYgIXNlbGYubG9hZENhY2hlKCkpIHJldHVybjtcblxuICAgIHNlbGYuaXRlbXMgPSBzZWxmLml0ZW1zLmZpbHRlcigoaXRlbSkgPT4ge1xuICAgICAgcmV0dXJuIGl0ZW0ucmVsYXRpdmVQYXRoICE9IHJlbGF0aXZlUGF0aDtcbiAgICB9KTtcbiAgICBzZWxmLnN0b3JlQ2FjaGUoKTtcbiAgICBzZWxmLmVtaXQoJ2ZpbmRlci1pdGVtcy1jYWNoZS1xdWV1ZTp1cGRhdGUnLCBzZWxmLml0ZW1zKTtcbiAgfVxuXG4gIHJlZnJlc2hEaXJlY3RvcnkoZGlyZWN0b3J5LCBmaWxlcykge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuXG4gICAgaWYgKCFzZWxmLml0ZW1zIHx8ICFmaWxlcykgcmV0dXJuO1xuICAgIGlmICghc2VsZi5sb2FkVGFzayAmJiAhc2VsZi5sb2FkQ2FjaGUoKSkgcmV0dXJuO1xuXG4gICAgLy8gUmVtb3ZlIG9sZCBmaWxlcyBpbiBzYW1lIGRpcmVjdG9yeVxuICAgIHNlbGYuaXRlbXMgPSBzZWxmLml0ZW1zLmZpbHRlcigoaXRlbSkgPT4ge1xuICAgICAgcmV0dXJuIGl0ZW0uZGlyZWN0b3J5ICE9IGRpcmVjdG9yeTtcbiAgICB9KTtcblxuICAgIC8vIEFkZCBuZXcgZmlsZXMgZm9yIHNhbWUgZGlyZWN0b3J5XG4gICAgZmlsZXMuZm9yRWFjaCgoZmlsZSkgPT4ge1xuICAgICAgc2VsZi5pdGVtcy5wdXNoKHsgZmlsZTogZmlsZS5uYW1lLCBkaXJlY3Rvcnk6IGRpcmVjdG9yeSwgcmVsYXRpdmVQYXRoOiBkaXJlY3RvcnkgKyBmaWxlLm5hbWUsIHNpemU6IGZpbGUuc2l6ZSB9KTtcbiAgICB9KTtcblxuICAgIHNlbGYuc3RvcmVDYWNoZSgpO1xuICAgIHNlbGYuZW1pdCgnZmluZGVyLWl0ZW1zLWNhY2hlLXF1ZXVlOnVwZGF0ZScsIHNlbGYuaXRlbXMpO1xuICB9XG5cbiAgcmVuYW1lRGlyZWN0b3J5KG9sZFJlbGF0aXZlUGF0aCwgbmV3UmVsYXRpdmVQYXRoKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG5cbiAgICBpZiAoIXNlbGYuaXRlbXMpIHJldHVybjtcbiAgICBpZiAoIXNlbGYubG9hZFRhc2sgJiYgIXNlbGYubG9hZENhY2hlKCkpIHJldHVybjtcblxuICAgIC8vIGdldCBmaWxlc1xuICAgIGxldCBpdGVtcyA9IHNlbGYuaXRlbXMuZmlsdGVyKChpdGVtKSA9PiB7XG4gICAgICByZXR1cm4gaXRlbS5kaXJlY3Rvcnkuc3RhcnRzV2l0aChvbGRSZWxhdGl2ZVBhdGgpO1xuICAgIH0pO1xuXG4gICAgLy8gUmVtb3ZlIGZpbGVzIGluIGRpcmVjdG9yeVxuICAgIHNlbGYuaXRlbXMgPSBzZWxmLml0ZW1zLmZpbHRlcigoaXRlbSkgPT4ge1xuICAgICAgcmV0dXJuICFpdGVtLmRpcmVjdG9yeS5zdGFydHNXaXRoKG9sZFJlbGF0aXZlUGF0aCk7XG4gICAgfSk7XG5cbiAgICAvLyBBZGQgbmV3IGZpbGVzIGZvciBkaXJlY3RvcnlcbiAgICBpdGVtcy5mb3JFYWNoKChpdGVtKSA9PiB7XG4gICAgICBzZWxmLml0ZW1zLnB1c2goeyBmaWxlOiBpdGVtLmZpbGUsIGRpcmVjdG9yeTogaXRlbS5kaXJlY3RvcnkucmVwbGFjZShvbGRSZWxhdGl2ZVBhdGgsIG5ld1JlbGF0aXZlUGF0aCksIHJlbGF0aXZlUGF0aDogaXRlbS5yZWxhdGl2ZVBhdGgucmVwbGFjZShvbGRSZWxhdGl2ZVBhdGgsIG5ld1JlbGF0aXZlUGF0aCksIHNpemU6IGl0ZW0uc2l6ZSB9KTtcbiAgICB9KTtcblxuICAgIHNlbGYuc3RvcmVDYWNoZSgpO1xuICAgIHNlbGYuZW1pdCgnZmluZGVyLWl0ZW1zLWNhY2hlLXF1ZXVlOnVwZGF0ZScsIHNlbGYuaXRlbXMpO1xuICB9XG5cbiAgZGVsZXRlRGlyZWN0b3J5KHJlbGF0aXZlUGF0aCkge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuXG4gICAgaWYgKCFzZWxmLml0ZW1zKSByZXR1cm47XG4gICAgaWYgKCFzZWxmLmxvYWRUYXNrICYmICFzZWxmLmxvYWRDYWNoZSgpKSByZXR1cm47XG5cbiAgICAvLyBSZW1vdmUgZmlsZXMgaW4gZGlyZWN0b3J5XG4gICAgc2VsZi5pdGVtcyA9IHNlbGYuaXRlbXMuZmlsdGVyKChpdGVtKSA9PiB7XG4gICAgICByZXR1cm4gIWl0ZW0uZGlyZWN0b3J5LnN0YXJ0c1dpdGgocmVsYXRpdmVQYXRoKTtcbiAgICB9KTtcblxuICAgIHNlbGYuc3RvcmVDYWNoZSgpO1xuICAgIHNlbGYuZW1pdCgnZmluZGVyLWl0ZW1zLWNhY2hlLXF1ZXVlOnVwZGF0ZScsIHNlbGYuaXRlbXMpO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRmluZGVySXRlbXNDYWNoZTtcbiJdfQ==