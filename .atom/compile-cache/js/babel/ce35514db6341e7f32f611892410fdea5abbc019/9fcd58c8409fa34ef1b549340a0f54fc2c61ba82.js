var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x6, _x7, _x8) { var _again = true; _function: while (_again) { var object = _x6, property = _x7, receiver = _x8; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x6 = parent; _x7 = property; _x8 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _atomSpacePenViews = require('atom-space-pen-views');

var _helperHelperJs = require('./../helper/helper.js');

var _helperFormatJs = require('./../helper/format.js');

var _fileViewJs = require('./file-view.js');

var _fileViewJs2 = _interopRequireDefault(_fileViewJs);

'use babel';

var md5 = require('md5');
var Path = require('path');

var DirectoryView = (function (_View) {
  _inherits(DirectoryView, _View);

  function DirectoryView() {
    _classCallCheck(this, DirectoryView);

    _get(Object.getPrototypeOf(DirectoryView.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(DirectoryView, [{
    key: 'serialize',
    value: function serialize() {
      var self = this;

      return {
        id: self.id,
        config: self.config,
        name: self.name,
        rights: self.rights,
        path: self.getPath(false)
      };
    }
  }, {
    key: 'initialize',
    value: function initialize(parent, directory) {
      var self = this;

      self.parent = parent;
      self.config = parent.config;
      self.expanded = false;

      self.name = directory.name;
      self.rights = directory.rights;
      self.id = self.getId();

      // Add directory name
      self.label.text(self.name);

      // Add directory icon
      self.label.addClass('icon-file-directory');

      self.attr('data-name', self.name);
      self.attr('data-host', self.config.host);
      self.attr('id', self.id);

      // Events
      self.on('click', function (e) {
        e.stopPropagation();
        self.toggle();
      });
      self.on('dblclick', function (e) {
        e.stopPropagation();
      });

      // Drag & Drop
      self.on('dragstart', function (e) {
        return self.onDragStart(e);
      });
      self.on('dragenter', function (e) {
        return self.onDragEnter(e);
      });
      self.on('dragleave', function (e) {
        return self.onDragLeave(e);
      });
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      var self = this;

      self.remove();
    }
  }, {
    key: 'getId',
    value: function getId() {
      var self = this;

      return 'ftp-remote-edit-' + md5(self.getPath(false));
    }
  }, {
    key: 'getRoot',
    value: function getRoot() {
      var self = this;

      return self.parent.getRoot();
    }
  }, {
    key: 'getPath',
    value: function getPath() {
      var useRemote = arguments.length <= 0 || arguments[0] === undefined ? true : arguments[0];

      var self = this;

      return (0, _helperFormatJs.untrailingslashit)((0, _helperFormatJs.normalize)(self.parent.getPath(useRemote) + self.name));
    }
  }, {
    key: 'getLocalPath',
    value: function getLocalPath() {
      var useRemote = arguments.length <= 0 || arguments[0] === undefined ? true : arguments[0];

      var self = this;

      return (0, _helperFormatJs.untrailingslashit)((0, _helperFormatJs.normalize)(self.parent.getLocalPath(useRemote) + self.name, Path.sep), Path.sep);
    }
  }, {
    key: 'getConnector',
    value: function getConnector() {
      var self = this;

      return self.getRoot().getConnector();
    }
  }, {
    key: 'addSyncIcon',
    value: function addSyncIcon() {
      var element = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

      var self = this;

      if (!element) element = self;
      if (!element.label) return;

      element.label.addClass('icon-sync').addClass('spin');
    }
  }, {
    key: 'removeSyncIcon',
    value: function removeSyncIcon() {
      var element = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

      var self = this;

      if (!element) element = self;
      if (!element.label) return;

      element.label.removeClass('icon-sync').removeClass('spin');
    }
  }, {
    key: 'expand',
    value: function expand() {
      var _this = this;

      var self = this;

      var promise = new Promise(function (resolve, reject) {
        if (self.isExpanded()) return resolve(true);

        self.addSyncIcon();
        self.getConnector().listDirectory(self.getPath()).then(function (list) {
          self.expanded = true;
          self.addClass('expanded').removeClass('collapsed');
          self.removeSyncIcon();

          self.entries.children().detach();

          var directories = list.filter(function (item) {
            return item.type === 'd' && item.name !== '.' && item.name !== '..';
          });

          var files = list.filter(function (item) {
            return item.type === '-';
          });

          directories.sort(function (a, b) {
            if (a.name.toLowerCase() < b.name.toLowerCase()) return -1;
            if (a.name.toLowerCase() > b.name.toLowerCase()) return 1;
            return 0;
          });

          files.sort(function (a, b) {
            if (a.name.toLowerCase() < b.name.toLowerCase()) return -1;
            if (a.name.toLowerCase() > b.name.toLowerCase()) return 1;
            return 0;
          });

          var entries = [];

          directories.forEach(function (element) {
            var pathOnFileSystem = (0, _helperFormatJs.normalize)(self.getPath() + element.name, Path.sep);

            if (!(0, _helperHelperJs.isPathIgnored)(pathOnFileSystem)) {
              var li = new DirectoryView(self, {
                name: element.name,
                path: pathOnFileSystem,
                rights: element.rights
              });
              entries.push(li);
            }
          }, _this);

          files.forEach(function (element) {
            var pathOnFileSystem = (0, _helperFormatJs.normalize)(self.getPath() + element.name, Path.sep);

            if (!(0, _helperHelperJs.isPathIgnored)(pathOnFileSystem)) {
              var li = new _fileViewJs2['default'](self, {
                name: element.name,
                path: pathOnFileSystem,
                size: element.size,
                rights: element.rights
              });
              entries.push(li);
            }
          }, _this);

          // Refresh cache
          self.getRoot().getFinderCache().refreshDirectory(self.getPath(false), files);

          if (!atom.config.get('ftp-remote-edit.tree.sortFoldersBeforeFiles')) {
            entries.sort(function (a, b) {
              if (a.name.toLowerCase() < b.name.toLowerCase()) return -1;
              if (a.name.toLowerCase() > b.name.toLowerCase()) return 1;
              return 0;
            });
          }

          entries.forEach(function (entry) {
            self.entries.append(entry);
          });

          self.select();

          resolve(true);
        })['catch'](function (err) {
          self.collapse();
          (0, _helperHelperJs.showMessage)(err.message, 'error');
          reject(err);
        });
      });

      return promise;
    }
  }, {
    key: 'collapse',
    value: function collapse() {
      var self = this;

      self.expanded = false;
      self.addClass('collapsed').removeClass('expanded');
      self.removeSyncIcon();
    }
  }, {
    key: 'toggle',
    value: function toggle() {
      var self = this;

      if (self.isExpanded()) {
        self.collapse();
      } else {
        self.expand()['catch'](function (err) {
          (0, _helperHelperJs.showMessage)(err.message, 'error');
        });
      }
    }
  }, {
    key: 'select',
    value: function select() {
      var deselectAllOther = arguments.length <= 0 || arguments[0] === undefined ? true : arguments[0];

      var self = this;

      if (deselectAllOther) {
        elementsToDeselect = (0, _atomSpacePenViews.$)('.ftp-remote-edit-view .selected');
        for (i = 0, len = elementsToDeselect.length; i < len; i++) {
          selected = elementsToDeselect[i];
          (0, _atomSpacePenViews.$)(selected).removeClass('selected');
        }
      }

      if (!self.hasClass('selected')) {
        self.addClass('selected');
      }
    }
  }, {
    key: 'deselect',
    value: function deselect() {
      var self = this;

      if (self.hasClass('selected')) {
        self.removeClass('selected');
      }
    }
  }, {
    key: 'isExpanded',
    value: function isExpanded() {
      var self = this;

      return self.parent.isExpanded() && self.expanded;
    }
  }, {
    key: 'isVisible',
    value: function isVisible() {
      var self = this;

      return self.parent.isExpanded();
    }
  }, {
    key: 'refresh',
    value: function refresh(elementToRefresh) {
      var self = this;

      var sortFoldersBeforeFiles = atom.config.get('ftp-remote-edit.tree.sortFoldersBeforeFiles');
      if (elementToRefresh.entries[0].childNodes) {
        var e = elementToRefresh.entries[0].childNodes;
        [].slice.call(e).sort(function (a, b) {
          if (sortFoldersBeforeFiles) {
            if (a.classList.contains('directory') && b.classList.contains('file')) return -1;
            if (a.classList.contains('file') && b.classList.contains('directory')) return 1;
            if (a.spacePenView.name < b.spacePenView.name) return -1;
            if (a.spacePenView.name > b.spacePenView.name) return 1;
          } else {
            if (a.spacePenView.name < b.spacePenView.name) return -1;
            if (a.spacePenView.name > b.spacePenView.name) return 1;
          }
          return 0;
        }).forEach(function (val, index) {
          self.entries.append(val);
        });
      }
    }
  }, {
    key: 'onDragStart',
    value: function onDragStart(e) {
      var self = this;

      var initialPath = undefined;

      if (entry = e.target.closest('.entry.directory')) {
        e.stopPropagation();
        initialPath = self.getPath(false);

        if (e.dataTransfer) {
          e.dataTransfer.effectAllowed = "move";
          e.dataTransfer.setData("initialPath", initialPath);
          e.dataTransfer.setData("initialType", "directory");
          e.dataTransfer.setData("initialName", self.name);
        } else if (e.originalEvent.dataTransfer) {
          e.originalEvent.dataTransfer.effectAllowed = "move";
          e.originalEvent.dataTransfer.setData("initialPath", initialPath);
          e.originalEvent.dataTransfer.setData("initialType", "directory");
          e.originalEvent.dataTransfer.setData("initialName", self.name);
        }
      }
    }
  }, {
    key: 'onDragEnter',
    value: function onDragEnter(e) {
      var self = this;

      var entry = undefined,
          initialType = undefined;

      if (entry = e.target.closest('.entry.directory')) {
        e.stopPropagation();

        if (e.dataTransfer) {
          initialType = e.dataTransfer.getData("initialType");
        } else {
          initialType = e.originalEvent.dataTransfer.getData("initialType");
        }

        if (initialType == "server") {
          return;
        }

        (0, _atomSpacePenViews.$)(entry).view().select();
      }
    }
  }, {
    key: 'onDragLeave',
    value: function onDragLeave(e) {
      var self = this;

      var entry = undefined,
          initialType = undefined;

      if (entry = e.target.closest('.entry.directory')) {
        e.stopPropagation();

        if (e.dataTransfer) {
          initialType = e.dataTransfer.getData("initialType");
        } else {
          initialType = e.originalEvent.dataTransfer.getData("initialType");
        }

        if (initialType == "server") {
          return;
        }

        (0, _atomSpacePenViews.$)(entry).view().deselect();
      }
    }
  }], [{
    key: 'content',
    value: function content() {
      var _this2 = this;

      return this.li({
        'class': 'directory entry list-nested-item collapsed'
      }, function () {
        _this2.div({
          'class': 'header list-item',
          outlet: 'header',
          tabindex: -1
        }, function () {
          return _this2.span({
            'class': 'name icon',
            outlet: 'label'
          });
        });
        _this2.ol({
          'class': 'entries list-tree',
          outlet: 'entries',
          tabindex: -1
        });
      });
    }
  }]);

  return DirectoryView;
})(_atomSpacePenViews.View);

module.exports = DirectoryView;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2FuYW5tYXlqYWluLy5hdG9tL3BhY2thZ2VzL2Z0cC1yZW1vdGUtZWRpdC9saWIvdmlld3MvZGlyZWN0b3J5LXZpZXcuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztpQ0FFd0Isc0JBQXNCOzs4QkFDSCx1QkFBdUI7OzhCQUNILHVCQUF1Qjs7MEJBQ2pFLGdCQUFnQjs7OztBQUxyQyxXQUFXLENBQUM7O0FBT1osSUFBTSxHQUFHLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQzNCLElBQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQzs7SUFFdkIsYUFBYTtZQUFiLGFBQWE7O1dBQWIsYUFBYTswQkFBYixhQUFhOzsrQkFBYixhQUFhOzs7ZUFBYixhQUFhOztXQXNCUixxQkFBRztBQUNWLFVBQU0sSUFBSSxHQUFHLElBQUksQ0FBQzs7QUFFbEIsYUFBTztBQUNMLFVBQUUsRUFBRSxJQUFJLENBQUMsRUFBRTtBQUNYLGNBQU0sRUFBRSxJQUFJLENBQUMsTUFBTTtBQUNuQixZQUFJLEVBQUUsSUFBSSxDQUFDLElBQUk7QUFDZixjQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU07QUFDbkIsWUFBSSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDO09BQzFCLENBQUM7S0FDSDs7O1dBRVMsb0JBQUMsTUFBTSxFQUFFLFNBQVMsRUFBRTtBQUM1QixVQUFNLElBQUksR0FBRyxJQUFJLENBQUM7O0FBRWxCLFVBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO0FBQ3JCLFVBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQztBQUM1QixVQUFJLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQzs7QUFFdEIsVUFBSSxDQUFDLElBQUksR0FBRyxTQUFTLENBQUMsSUFBSSxDQUFDO0FBQzNCLFVBQUksQ0FBQyxNQUFNLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQztBQUMvQixVQUFJLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQzs7O0FBR3ZCLFVBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQzs7O0FBRzNCLFVBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLHFCQUFxQixDQUFDLENBQUM7O0FBRTNDLFVBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNsQyxVQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3pDLFVBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQzs7O0FBR3pCLFVBQUksQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLFVBQUMsQ0FBQyxFQUFLO0FBQ3RCLFNBQUMsQ0FBQyxlQUFlLEVBQUUsQ0FBQztBQUNwQixZQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7T0FDZixDQUFDLENBQUM7QUFDSCxVQUFJLENBQUMsRUFBRSxDQUFDLFVBQVUsRUFBRSxVQUFDLENBQUMsRUFBSztBQUFFLFNBQUMsQ0FBQyxlQUFlLEVBQUUsQ0FBQztPQUFFLENBQUMsQ0FBQzs7O0FBR3JELFVBQUksQ0FBQyxFQUFFLENBQUMsV0FBVyxFQUFFLFVBQUMsQ0FBQztlQUFLLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO09BQUEsQ0FBQyxDQUFDO0FBQ2pELFVBQUksQ0FBQyxFQUFFLENBQUMsV0FBVyxFQUFFLFVBQUMsQ0FBQztlQUFLLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO09BQUEsQ0FBQyxDQUFDO0FBQ2pELFVBQUksQ0FBQyxFQUFFLENBQUMsV0FBVyxFQUFFLFVBQUMsQ0FBQztlQUFLLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO09BQUEsQ0FBQyxDQUFDO0tBQ2xEOzs7V0FFTSxtQkFBRztBQUNSLFVBQU0sSUFBSSxH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LE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFO0FBQ2hELFNBQUMsQ0FBQyxlQUFlLEVBQUUsQ0FBQzs7QUFFcEIsWUFBSSxDQUFDLENBQUMsWUFBWSxFQUFFO0FBQ2xCLHFCQUFXLEdBQUcsQ0FBQyxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUM7U0FDckQsTUFBTTtBQUNMLHFCQUFXLEdBQUcsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDO1NBQ25FOztBQUVELFlBQUksV0FBVyxJQUFJLFFBQVEsRUFBRTtBQUMzQixpQkFBTztTQUNSOztBQUVELGtDQUFFLEtBQUssQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLFFBQVEsRUFBRSxDQUFDO09BQzVCO0tBQ0Y7OztXQW5XYSxtQkFBRzs7O0FBQ2YsYUFBTyxJQUFJLENBQUMsRUFBRSxDQUFDO0FBQ2IsaUJBQU8sNENBQTRDO09BQ3BELEVBQUUsWUFBTTtBQUNQLGVBQUssR0FBRyxDQUFDO0FBQ1AsbUJBQU8sa0JBQWtCO0FBQ3pCLGdCQUFNLEVBQUUsUUFBUTtBQUNoQixrQkFBUSxFQUFFLENBQUMsQ0FBQztTQUNiLEVBQUU7aUJBQU0sT0FBSyxJQUFJLENBQUM7QUFDakIscUJBQU8sV0FBVztBQUNsQixrQkFBTSxFQUFFLE9BQU87V0FDaEIsQ0FBQztTQUFBLENBQUMsQ0FBQztBQUNKLGVBQUssRUFBRSxDQUFDO0FBQ04sbUJBQU8sbUJBQW1CO0FBQzFCLGdCQUFNLEVBQUUsU0FBUztBQUNqQixrQkFBUSxFQUFFLENBQUMsQ0FBQztTQUNiLENBQUMsQ0FBQztPQUNKLENBQUMsQ0FBQztLQUNKOzs7U0FwQkcsYUFBYTs7O0FBd1duQixNQUFNLENBQUMsT0FBTyxHQUFHLGFBQWEsQ0FBQyIsImZpbGUiOiIvaG9tZS9hbmFubWF5amFpbi8uYXRvbS9wYWNrYWdlcy9mdHAtcmVtb3RlLWVkaXQvbGliL3ZpZXdzL2RpcmVjdG9yeS12aWV3LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbmltcG9ydCB7ICQsIFZpZXcgfSBmcm9tICdhdG9tLXNwYWNlLXBlbi12aWV3cyc7XG5pbXBvcnQgeyBzaG93TWVzc2FnZSwgaXNQYXRoSWdub3JlZCB9IGZyb20gJy4vLi4vaGVscGVyL2hlbHBlci5qcyc7XG5pbXBvcnQgeyB1bmxlYWRpbmdzbGFzaGl0LCB1bnRyYWlsaW5nc2xhc2hpdCwgbm9ybWFsaXplIH0gZnJvbSAnLi8uLi9oZWxwZXIvZm9ybWF0LmpzJztcbmltcG9ydCBGaWxlVmlldyBmcm9tICcuL2ZpbGUtdmlldy5qcyc7XG5cbmNvbnN0IG1kNSA9IHJlcXVpcmUoJ21kNScpO1xuY29uc3QgUGF0aCA9IHJlcXVpcmUoJ3BhdGgnKTtcblxuY2xhc3MgRGlyZWN0b3J5VmlldyBleHRlbmRzIFZpZXcge1xuXG4gIHN0YXRpYyBjb250ZW50KCkge1xuICAgIHJldHVybiB0aGlzLmxpKHtcbiAgICAgIGNsYXNzOiAnZGlyZWN0b3J5IGVudHJ5IGxpc3QtbmVzdGVkLWl0ZW0gY29sbGFwc2VkJyxcbiAgICB9LCAoKSA9PiB7XG4gICAgICB0aGlzLmRpdih7XG4gICAgICAgIGNsYXNzOiAnaGVhZGVyIGxpc3QtaXRlbScsXG4gICAgICAgIG91dGxldDogJ2hlYWRlcicsXG4gICAgICAgIHRhYmluZGV4OiAtMSxcbiAgICAgIH0sICgpID0+IHRoaXMuc3Bhbih7XG4gICAgICAgIGNsYXNzOiAnbmFtZSBpY29uJyxcbiAgICAgICAgb3V0bGV0OiAnbGFiZWwnLFxuICAgICAgfSkpO1xuICAgICAgdGhpcy5vbCh7XG4gICAgICAgIGNsYXNzOiAnZW50cmllcyBsaXN0LXRyZWUnLFxuICAgICAgICBvdXRsZXQ6ICdlbnRyaWVzJyxcbiAgICAgICAgdGFiaW5kZXg6IC0xLFxuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICBzZXJpYWxpemUoKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG5cbiAgICByZXR1cm4ge1xuICAgICAgaWQ6IHNlbGYuaWQsXG4gICAgICBjb25maWc6IHNlbGYuY29uZmlnLFxuICAgICAgbmFtZTogc2VsZi5uYW1lLFxuICAgICAgcmlnaHRzOiBzZWxmLnJpZ2h0cyxcbiAgICAgIHBhdGg6IHNlbGYuZ2V0UGF0aChmYWxzZSksXG4gICAgfTtcbiAgfVxuXG4gIGluaXRpYWxpemUocGFyZW50LCBkaXJlY3RvcnkpIHtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcblxuICAgIHNlbGYucGFyZW50ID0gcGFyZW50O1xuICAgIHNlbGYuY29uZmlnID0gcGFyZW50LmNvbmZpZztcbiAgICBzZWxmLmV4cGFuZGVkID0gZmFsc2U7XG5cbiAgICBzZWxmLm5hbWUgPSBkaXJlY3RvcnkubmFtZTtcbiAgICBzZWxmLnJpZ2h0cyA9IGRpcmVjdG9yeS5yaWdodHM7XG4gICAgc2VsZi5pZCA9IHNlbGYuZ2V0SWQoKTtcblxuICAgIC8vIEFkZCBkaXJlY3RvcnkgbmFtZVxuICAgIHNlbGYubGFiZWwudGV4dChzZWxmLm5hbWUpO1xuXG4gICAgLy8gQWRkIGRpcmVjdG9yeSBpY29uXG4gICAgc2VsZi5sYWJlbC5hZGRDbGFzcygnaWNvbi1maWxlLWRpcmVjdG9yeScpO1xuXG4gICAgc2VsZi5hdHRyKCdkYXRhLW5hbWUnLCBzZWxmLm5hbWUpO1xuICAgIHNlbGYuYXR0cignZGF0YS1ob3N0Jywgc2VsZi5jb25maWcuaG9zdCk7XG4gICAgc2VsZi5hdHRyKCdpZCcsIHNlbGYuaWQpO1xuXG4gICAgLy8gRXZlbnRzXG4gICAgc2VsZi5vbignY2xpY2snLCAoZSkgPT4ge1xuICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgIHNlbGYudG9nZ2xlKCk7XG4gICAgfSk7XG4gICAgc2VsZi5vbignZGJsY2xpY2snLCAoZSkgPT4geyBlLnN0b3BQcm9wYWdhdGlvbigpOyB9KTtcblxuICAgIC8vIERyYWcgJiBEcm9wXG4gICAgc2VsZi5vbignZHJhZ3N0YXJ0JywgKGUpID0+IHNlbGYub25EcmFnU3RhcnQoZSkpO1xuICAgIHNlbGYub24oJ2RyYWdlbnRlcicsIChlKSA9PiBzZWxmLm9uRHJhZ0VudGVyKGUpKTtcbiAgICBzZWxmLm9uKCdkcmFnbGVhdmUnLCAoZSkgPT4gc2VsZi5vbkRyYWdMZWF2ZShlKSk7XG4gIH1cblxuICBkZXN0cm95KCkge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuXG4gICAgc2VsZi5yZW1vdmUoKTtcbiAgfVxuXG4gIGdldElkKCkge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuXG4gICAgcmV0dXJuICdmdHAtcmVtb3RlLWVkaXQtJyArIG1kNShzZWxmLmdldFBhdGgoZmFsc2UpKTtcbiAgfVxuXG4gIGdldFJvb3QoKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG5cbiAgICByZXR1cm4gc2VsZi5wYXJlbnQuZ2V0Um9vdCgpO1xuICB9XG5cbiAgZ2V0UGF0aCh1c2VSZW1vdGUgPSB0cnVlKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG5cbiAgICByZXR1cm4gdW50cmFpbGluZ3NsYXNoaXQobm9ybWFsaXplKHNlbGYucGFyZW50LmdldFBhdGgodXNlUmVtb3RlKSArIHNlbGYubmFtZSkpO1xuICB9XG5cbiAgZ2V0TG9jYWxQYXRoKHVzZVJlbW90ZSA9IHRydWUpIHtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcblxuICAgIHJldHVybiB1bnRyYWlsaW5nc2xhc2hpdChub3JtYWxpemUoc2VsZi5wYXJlbnQuZ2V0TG9jYWxQYXRoKHVzZVJlbW90ZSkgKyBzZWxmLm5hbWUsIFBhdGguc2VwKSwgUGF0aC5zZXApO1xuICB9XG5cbiAgZ2V0Q29ubmVjdG9yKCkge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuXG4gICAgcmV0dXJuIHNlbGYuZ2V0Um9vdCgpLmdldENvbm5lY3RvcigpO1xuICB9XG5cbiAgYWRkU3luY0ljb24oZWxlbWVudCA9IG51bGwpIHtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcblxuICAgIGlmICghZWxlbWVudCkgZWxlbWVudCA9IHNlbGY7XG4gICAgaWYgKCFlbGVtZW50LmxhYmVsKSByZXR1cm47XG5cbiAgICBlbGVtZW50LmxhYmVsLmFkZENsYXNzKCdpY29uLXN5bmMnKS5hZGRDbGFzcygnc3BpbicpO1xuICB9XG5cbiAgcmVtb3ZlU3luY0ljb24oZWxlbWVudCA9IG51bGwpIHtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcblxuICAgIGlmICghZWxlbWVudCkgZWxlbWVudCA9IHNlbGY7XG4gICAgaWYgKCFlbGVtZW50LmxhYmVsKSByZXR1cm47XG5cbiAgICBlbGVtZW50LmxhYmVsLnJlbW92ZUNsYXNzKCdpY29uLXN5bmMnKS5yZW1vdmVDbGFzcygnc3BpbicpO1xuICB9XG5cbiAgZXhwYW5kKCkge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuXG4gICAgbGV0IHByb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBpZiAoc2VsZi5pc0V4cGFuZGVkKCkpIHJldHVybiByZXNvbHZlKHRydWUpO1xuXG4gICAgICBzZWxmLmFkZFN5bmNJY29uKCk7XG4gICAgICBzZWxmLmdldENvbm5lY3RvcigpLmxpc3REaXJlY3Rvcnkoc2VsZi5nZXRQYXRoKCkpLnRoZW4oKGxpc3QpID0+IHtcbiAgICAgICAgc2VsZi5leHBhbmRlZCA9IHRydWU7XG4gICAgICAgIHNlbGYuYWRkQ2xhc3MoJ2V4cGFuZGVkJykucmVtb3ZlQ2xhc3MoJ2NvbGxhcHNlZCcpO1xuICAgICAgICBzZWxmLnJlbW92ZVN5bmNJY29uKCk7XG5cbiAgICAgICAgc2VsZi5lbnRyaWVzLmNoaWxkcmVuKCkuZGV0YWNoKCk7XG5cbiAgICAgICAgbGV0IGRpcmVjdG9yaWVzID0gbGlzdC5maWx0ZXIoKGl0ZW0pID0+IHtcbiAgICAgICAgICByZXR1cm4gaXRlbS50eXBlID09PSAnZCcgJiYgaXRlbS5uYW1lICE9PSAnLicgJiYgaXRlbS5uYW1lICE9PSAnLi4nO1xuICAgICAgICB9KTtcblxuICAgICAgICBsZXQgZmlsZXMgPSBsaXN0LmZpbHRlcigoaXRlbSkgPT4ge1xuICAgICAgICAgIHJldHVybiBpdGVtLnR5cGUgPT09ICctJztcbiAgICAgICAgfSk7XG5cbiAgICAgICAgZGlyZWN0b3JpZXMuc29ydCgoYSwgYikgPT4ge1xuICAgICAgICAgIGlmIChhLm5hbWUudG9Mb3dlckNhc2UoKSA8IGIubmFtZS50b0xvd2VyQ2FzZSgpKSByZXR1cm4gLTE7XG4gICAgICAgICAgaWYgKGEubmFtZS50b0xvd2VyQ2FzZSgpID4gYi5uYW1lLnRvTG93ZXJDYXNlKCkpIHJldHVybiAxO1xuICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICB9KTtcblxuICAgICAgICBmaWxlcy5zb3J0KChhLCBiKSA9PiB7XG4gICAgICAgICAgaWYgKGEubmFtZS50b0xvd2VyQ2FzZSgpIDwgYi5uYW1lLnRvTG93ZXJDYXNlKCkpIHJldHVybiAtMTtcbiAgICAgICAgICBpZiAoYS5uYW1lLnRvTG93ZXJDYXNlKCkgPiBiLm5hbWUudG9Mb3dlckNhc2UoKSkgcmV0dXJuIDE7XG4gICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGxldCBlbnRyaWVzID0gW107XG5cbiAgICAgICAgZGlyZWN0b3JpZXMuZm9yRWFjaCgoZWxlbWVudCkgPT4ge1xuICAgICAgICAgIGNvbnN0IHBhdGhPbkZpbGVTeXN0ZW0gPSBub3JtYWxpemUoc2VsZi5nZXRQYXRoKCkgKyBlbGVtZW50Lm5hbWUsIFBhdGguc2VwKTtcblxuICAgICAgICAgIGlmICghaXNQYXRoSWdub3JlZChwYXRoT25GaWxlU3lzdGVtKSkge1xuICAgICAgICAgICAgbGV0IGxpID0gbmV3IERpcmVjdG9yeVZpZXcoc2VsZiwge1xuICAgICAgICAgICAgICBuYW1lOiBlbGVtZW50Lm5hbWUsXG4gICAgICAgICAgICAgIHBhdGg6IHBhdGhPbkZpbGVTeXN0ZW0sXG4gICAgICAgICAgICAgIHJpZ2h0czogZWxlbWVudC5yaWdodHNcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgZW50cmllcy5wdXNoKGxpKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sIHRoaXMpO1xuXG4gICAgICAgIGZpbGVzLmZvckVhY2goKGVsZW1lbnQpID0+IHtcbiAgICAgICAgICBjb25zdCBwYXRoT25GaWxlU3lzdGVtID0gbm9ybWFsaXplKHNlbGYuZ2V0UGF0aCgpICsgZWxlbWVudC5uYW1lLCBQYXRoLnNlcCk7XG5cbiAgICAgICAgICBpZiAoIWlzUGF0aElnbm9yZWQocGF0aE9uRmlsZVN5c3RlbSkpIHtcbiAgICAgICAgICAgIGxldCBsaSA9IG5ldyBGaWxlVmlldyhzZWxmLCB7XG4gICAgICAgICAgICAgIG5hbWU6IGVsZW1lbnQubmFtZSxcbiAgICAgICAgICAgICAgcGF0aDogcGF0aE9uRmlsZVN5c3RlbSxcbiAgICAgICAgICAgICAgc2l6ZTogZWxlbWVudC5zaXplLFxuICAgICAgICAgICAgICByaWdodHM6IGVsZW1lbnQucmlnaHRzXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGVudHJpZXMucHVzaChsaSk7XG4gICAgICAgICAgfVxuICAgICAgICB9LCB0aGlzKTtcblxuICAgICAgICAvLyBSZWZyZXNoIGNhY2hlXG4gICAgICAgIHNlbGYuZ2V0Um9vdCgpLmdldEZpbmRlckNhY2hlKCkucmVmcmVzaERpcmVjdG9yeShzZWxmLmdldFBhdGgoZmFsc2UpLCBmaWxlcyk7XG5cbiAgICAgICAgaWYgKCFhdG9tLmNvbmZpZy5nZXQoJ2Z0cC1yZW1vdGUtZWRpdC50cmVlLnNvcnRGb2xkZXJzQmVmb3JlRmlsZXMnKSkge1xuICAgICAgICAgIGVudHJpZXMuc29ydCgoYSwgYikgPT4ge1xuICAgICAgICAgICAgaWYgKGEubmFtZS50b0xvd2VyQ2FzZSgpIDwgYi5uYW1lLnRvTG93ZXJDYXNlKCkpIHJldHVybiAtMTtcbiAgICAgICAgICAgIGlmIChhLm5hbWUudG9Mb3dlckNhc2UoKSA+IGIubmFtZS50b0xvd2VyQ2FzZSgpKSByZXR1cm4gMTtcbiAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgZW50cmllcy5mb3JFYWNoKChlbnRyeSkgPT4ge1xuICAgICAgICAgIHNlbGYuZW50cmllcy5hcHBlbmQoZW50cnkpO1xuICAgICAgICB9KTtcblxuICAgICAgICBzZWxmLnNlbGVjdCgpO1xuXG4gICAgICAgIHJlc29sdmUodHJ1ZSk7XG4gICAgICB9KS5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgIHNlbGYuY29sbGFwc2UoKTtcbiAgICAgICAgc2hvd01lc3NhZ2UoZXJyLm1lc3NhZ2UsICdlcnJvcicpO1xuICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHByb21pc2U7XG4gIH1cblxuICBjb2xsYXBzZSgpIHtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcblxuICAgIHNlbGYuZXhwYW5kZWQgPSBmYWxzZTtcbiAgICBzZWxmLmFkZENsYXNzKCdjb2xsYXBzZWQnKS5yZW1vdmVDbGFzcygnZXhwYW5kZWQnKTtcbiAgICBzZWxmLnJlbW92ZVN5bmNJY29uKCk7XG4gIH1cblxuICB0b2dnbGUoKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG5cbiAgICBpZiAoc2VsZi5pc0V4cGFuZGVkKCkpIHtcbiAgICAgIHNlbGYuY29sbGFwc2UoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc2VsZi5leHBhbmQoKS5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgIHNob3dNZXNzYWdlKGVyci5tZXNzYWdlLCAnZXJyb3InKTtcbiAgICAgIH0pXG4gICAgfVxuICB9XG5cbiAgc2VsZWN0KGRlc2VsZWN0QWxsT3RoZXIgPSB0cnVlKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG5cbiAgICBpZiAoZGVzZWxlY3RBbGxPdGhlcikge1xuICAgICAgZWxlbWVudHNUb0Rlc2VsZWN0ID0gJCgnLmZ0cC1yZW1vdGUtZWRpdC12aWV3IC5zZWxlY3RlZCcpO1xuICAgICAgZm9yIChpID0gMCwgbGVuID0gZWxlbWVudHNUb0Rlc2VsZWN0Lmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgIHNlbGVjdGVkID0gZWxlbWVudHNUb0Rlc2VsZWN0W2ldO1xuICAgICAgICAkKHNlbGVjdGVkKS5yZW1vdmVDbGFzcygnc2VsZWN0ZWQnKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoIXNlbGYuaGFzQ2xhc3MoJ3NlbGVjdGVkJykpIHtcbiAgICAgIHNlbGYuYWRkQ2xhc3MoJ3NlbGVjdGVkJyk7XG4gICAgfVxuICB9XG5cbiAgZGVzZWxlY3QoKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG5cbiAgICBpZiAoc2VsZi5oYXNDbGFzcygnc2VsZWN0ZWQnKSkge1xuICAgICAgc2VsZi5yZW1vdmVDbGFzcygnc2VsZWN0ZWQnKTtcbiAgICB9XG4gIH1cblxuICBpc0V4cGFuZGVkKCkge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuXG4gICAgcmV0dXJuIHNlbGYucGFyZW50LmlzRXhwYW5kZWQoKSAmJiBzZWxmLmV4cGFuZGVkO1xuICB9XG5cbiAgaXNWaXNpYmxlKCkge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuXG4gICAgcmV0dXJuIHNlbGYucGFyZW50LmlzRXhwYW5kZWQoKTtcbiAgfVxuXG4gIHJlZnJlc2goZWxlbWVudFRvUmVmcmVzaCkge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuXG4gICAgbGV0IHNvcnRGb2xkZXJzQmVmb3JlRmlsZXMgPSBhdG9tLmNvbmZpZy5nZXQoJ2Z0cC1yZW1vdGUtZWRpdC50cmVlLnNvcnRGb2xkZXJzQmVmb3JlRmlsZXMnKTtcbiAgICBpZiAoZWxlbWVudFRvUmVmcmVzaC5lbnRyaWVzWzBdLmNoaWxkTm9kZXMpIHtcbiAgICAgIGxldCBlID0gZWxlbWVudFRvUmVmcmVzaC5lbnRyaWVzWzBdLmNoaWxkTm9kZXM7XG4gICAgICBbXS5zbGljZS5jYWxsKGUpLnNvcnQoKGEsIGIpID0+IHtcbiAgICAgICAgaWYgKHNvcnRGb2xkZXJzQmVmb3JlRmlsZXMpIHtcbiAgICAgICAgICBpZiAoYS5jbGFzc0xpc3QuY29udGFpbnMoJ2RpcmVjdG9yeScpICYmIGIuY2xhc3NMaXN0LmNvbnRhaW5zKCdmaWxlJykpIHJldHVybiAtMTtcbiAgICAgICAgICBpZiAoYS5jbGFzc0xpc3QuY29udGFpbnMoJ2ZpbGUnKSAmJiBiLmNsYXNzTGlzdC5jb250YWlucygnZGlyZWN0b3J5JykpIHJldHVybiAxO1xuICAgICAgICAgIGlmIChhLnNwYWNlUGVuVmlldy5uYW1lIDwgYi5zcGFjZVBlblZpZXcubmFtZSkgcmV0dXJuIC0xO1xuICAgICAgICAgIGlmIChhLnNwYWNlUGVuVmlldy5uYW1lID4gYi5zcGFjZVBlblZpZXcubmFtZSkgcmV0dXJuIDE7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKGEuc3BhY2VQZW5WaWV3Lm5hbWUgPCBiLnNwYWNlUGVuVmlldy5uYW1lKSByZXR1cm4gLTE7XG4gICAgICAgICAgaWYgKGEuc3BhY2VQZW5WaWV3Lm5hbWUgPiBiLnNwYWNlUGVuVmlldy5uYW1lKSByZXR1cm4gMTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gMDtcbiAgICAgIH0pLmZvckVhY2goKHZhbCwgaW5kZXgpID0+IHtcbiAgICAgICAgc2VsZi5lbnRyaWVzLmFwcGVuZCh2YWwpO1xuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgb25EcmFnU3RhcnQoZSkge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuXG4gICAgbGV0IGluaXRpYWxQYXRoO1xuXG4gICAgaWYgKGVudHJ5ID0gZS50YXJnZXQuY2xvc2VzdCgnLmVudHJ5LmRpcmVjdG9yeScpKSB7XG4gICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgaW5pdGlhbFBhdGggPSBzZWxmLmdldFBhdGgoZmFsc2UpO1xuXG4gICAgICBpZiAoZS5kYXRhVHJhbnNmZXIpIHtcbiAgICAgICAgZS5kYXRhVHJhbnNmZXIuZWZmZWN0QWxsb3dlZCA9IFwibW92ZVwiO1xuICAgICAgICBlLmRhdGFUcmFuc2Zlci5zZXREYXRhKFwiaW5pdGlhbFBhdGhcIiwgaW5pdGlhbFBhdGgpO1xuICAgICAgICBlLmRhdGFUcmFuc2Zlci5zZXREYXRhKFwiaW5pdGlhbFR5cGVcIiwgXCJkaXJlY3RvcnlcIik7XG4gICAgICAgIGUuZGF0YVRyYW5zZmVyLnNldERhdGEoXCJpbml0aWFsTmFtZVwiLCBzZWxmLm5hbWUpO1xuICAgICAgfSBlbHNlIGlmIChlLm9yaWdpbmFsRXZlbnQuZGF0YVRyYW5zZmVyKSB7XG4gICAgICAgIGUub3JpZ2luYWxFdmVudC5kYXRhVHJhbnNmZXIuZWZmZWN0QWxsb3dlZCA9IFwibW92ZVwiO1xuICAgICAgICBlLm9yaWdpbmFsRXZlbnQuZGF0YVRyYW5zZmVyLnNldERhdGEoXCJpbml0aWFsUGF0aFwiLCBpbml0aWFsUGF0aCk7XG4gICAgICAgIGUub3JpZ2luYWxFdmVudC5kYXRhVHJhbnNmZXIuc2V0RGF0YShcImluaXRpYWxUeXBlXCIsIFwiZGlyZWN0b3J5XCIpO1xuICAgICAgICBlLm9yaWdpbmFsRXZlbnQuZGF0YVRyYW5zZmVyLnNldERhdGEoXCJpbml0aWFsTmFtZVwiLCBzZWxmLm5hbWUpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIG9uRHJhZ0VudGVyKGUpIHtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcblxuICAgIGxldCBlbnRyeSwgaW5pdGlhbFR5cGU7XG5cbiAgICBpZiAoZW50cnkgPSBlLnRhcmdldC5jbG9zZXN0KCcuZW50cnkuZGlyZWN0b3J5JykpIHtcbiAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG5cbiAgICAgIGlmIChlLmRhdGFUcmFuc2Zlcikge1xuICAgICAgICBpbml0aWFsVHlwZSA9IGUuZGF0YVRyYW5zZmVyLmdldERhdGEoXCJpbml0aWFsVHlwZVwiKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGluaXRpYWxUeXBlID0gZS5vcmlnaW5hbEV2ZW50LmRhdGFUcmFuc2Zlci5nZXREYXRhKFwiaW5pdGlhbFR5cGVcIik7XG4gICAgICB9XG5cbiAgICAgIGlmIChpbml0aWFsVHlwZSA9PSBcInNlcnZlclwiKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgJChlbnRyeSkudmlldygpLnNlbGVjdCgpO1xuICAgIH1cbiAgfVxuXG4gIG9uRHJhZ0xlYXZlKGUpIHtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcblxuICAgIGxldCBlbnRyeSwgaW5pdGlhbFR5cGU7XG5cbiAgICBpZiAoZW50cnkgPSBlLnRhcmdldC5jbG9zZXN0KCcuZW50cnkuZGlyZWN0b3J5JykpIHtcbiAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG5cbiAgICAgIGlmIChlLmRhdGFUcmFuc2Zlcikge1xuICAgICAgICBpbml0aWFsVHlwZSA9IGUuZGF0YVRyYW5zZmVyLmdldERhdGEoXCJpbml0aWFsVHlwZVwiKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGluaXRpYWxUeXBlID0gZS5vcmlnaW5hbEV2ZW50LmRhdGFUcmFuc2Zlci5nZXREYXRhKFwiaW5pdGlhbFR5cGVcIik7XG4gICAgICB9XG5cbiAgICAgIGlmIChpbml0aWFsVHlwZSA9PSBcInNlcnZlclwiKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgJChlbnRyeSkudmlldygpLmRlc2VsZWN0KCk7XG4gICAgfVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRGlyZWN0b3J5VmlldztcbiJdfQ==