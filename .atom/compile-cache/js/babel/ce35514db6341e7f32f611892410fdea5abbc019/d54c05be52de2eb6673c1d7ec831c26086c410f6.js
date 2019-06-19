var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x6, _x7, _x8) { var _again = true; _function: while (_again) { var object = _x6, property = _x7, receiver = _x8; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x6 = parent; _x7 = property; _x8 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _atomSpacePenViews = require('atom-space-pen-views');

var _helperHelperJs = require('./../helper/helper.js');

var _helperFormatJs = require('./../helper/format.js');

var _helperFinderItemsCacheJs = require('./../helper/finder-items-cache.js');

var _helperFinderItemsCacheJs2 = _interopRequireDefault(_helperFinderItemsCacheJs);

var _connectorsConnectorJs = require('./../connectors/connector.js');

var _connectorsConnectorJs2 = _interopRequireDefault(_connectorsConnectorJs);

var _directoryViewJs = require('./directory-view.js');

var _directoryViewJs2 = _interopRequireDefault(_directoryViewJs);

var _fileViewJs = require('./file-view.js');

var _fileViewJs2 = _interopRequireDefault(_fileViewJs);

'use babel';

var shortHash = require('short-hash');
var md5 = require('md5');
var Path = require('path');
var tempDirectory = require('os').tmpdir();

var ServerView = (function (_View) {
  _inherits(ServerView, _View);

  function ServerView() {
    _classCallCheck(this, ServerView);

    _get(Object.getPrototypeOf(ServerView.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(ServerView, [{
    key: 'serialize',
    value: function serialize() {
      var self = this;

      return {
        id: self.id,
        config: self.config,
        name: self.name,
        path: self.getPath(false)
      };
    }
  }, {
    key: 'initialize',
    value: function initialize(config) {
      var self = this;

      self.config = config;
      self.expanded = false;
      self.finderItemsCache = null;

      self.name = self.config.name ? self.config.name : self.config.host;
      self.id = self.getId();

      self.label.text(self.name);
      self.label.addClass('icon-file-symlink-directory');
      self.addClass('project-root');

      if (typeof self.config.temp != 'undefined' && self.config.temp) {
        self.addClass('temp');
      }

      self.attr('data-name', '/');
      self.attr('data-host', self.config.host);
      self.attr('id', self.id);

      self.connector = new _connectorsConnectorJs2['default'](self.config);

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

      if (self.finderItemsCache) {
        self.finderItemsCache = null;
      }

      this.remove();
    }
  }, {
    key: 'getId',
    value: function getId() {
      var self = this;

      var object = {
        config: self.config,
        name: self.name,
        path: self.getPath(false)
      };

      return 'ftp-remote-edit-' + md5(JSON.stringify(object));
    }
  }, {
    key: 'getRoot',
    value: function getRoot() {
      var self = this;

      return self;
    }
  }, {
    key: 'getPath',
    value: function getPath() {
      var useRemote = arguments.length <= 0 || arguments[0] === undefined ? true : arguments[0];

      var self = this;

      if (self.config.remote && useRemote) {
        return (0, _helperFormatJs.unleadingslashit)((0, _helperFormatJs.untrailingslashit)((0, _helperFormatJs.normalize)(self.config.remote)));
      } else {
        return '/';
      }
    }
  }, {
    key: 'getLocalPath',
    value: function getLocalPath() {
      var useRemote = arguments.length <= 0 || arguments[0] === undefined ? true : arguments[0];

      var self = this;

      if (self.config.remote && useRemote) {
        return (0, _helperFormatJs.untrailingslashit)((0, _helperFormatJs.normalize)(tempDirectory + '/' + shortHash(self.config.host + self.config.name) + '/' + self.config.host + '/' + self.config.remote, Path.sep), Path.sep);
      } else {
        return (0, _helperFormatJs.untrailingslashit)((0, _helperFormatJs.normalize)(tempDirectory + '/' + shortHash(self.config.host + self.config.name) + '/' + self.config.host, Path.sep), Path.sep);
      }
    }
  }, {
    key: 'getConnector',
    value: function getConnector() {
      var self = this;

      return self.connector;
    }
  }, {
    key: 'getFinderCache',
    value: function getFinderCache() {
      var self = this;

      if (self.finderItemsCache) return self.finderItemsCache;

      self.finderItemsCache = new _helperFinderItemsCacheJs2['default'](self.config, self.getConnector());

      return self.finderItemsCache;
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
              var li = new _directoryViewJs2['default'](self, {
                name: element.name,
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
                size: element.size,
                rights: element.rights
              });
              entries.push(li);
            }
          }, _this);

          // Refresh cache
          self.getFinderCache().refreshDirectory(self.getPath(false), files);

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

      self.connector.destroy();

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

      return self.expanded;
    }
  }, {
    key: 'isVisible',
    value: function isVisible() {
      var self = this;

      return true;
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

      if (entry = e.target.closest('.entry.server')) {
        e.stopPropagation();
        initialPath = self.getPath(true);

        if (e.dataTransfer) {
          e.dataTransfer.effectAllowed = "move";
          e.dataTransfer.setData("initialType", "server");
        } else if (e.originalEvent.dataTransfer) {
          e.originalEvent.dataTransfer.effectAllowed = "move";
          e.originalEvent.dataTransfer.setData("initialType", "server");
        }
      }
    }
  }, {
    key: 'onDragEnter',
    value: function onDragEnter(e) {
      var self = this;

      var entry = undefined,
          initialType = undefined;

      if (entry = e.target.closest('.entry.server')) {
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

      if (entry = e.target.closest('.entry.server')) {
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
        'class': 'server entry list-nested-item project-root collapsed'
      }, function () {
        _this2.div({
          'class': 'header list-item project-root-header',
          outlet: 'header'
        }, function () {
          return _this2.span({
            'class': 'name icon',
            outlet: 'label'
          });
        });
        _this2.ol({
          'class': 'entries list-tree',
          outlet: 'entries'
        });
      });
    }
  }]);

  return ServerView;
})(_atomSpacePenViews.View);

module.exports = ServerView;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2FuYW5tYXlqYWluLy5hdG9tL3BhY2thZ2VzL2Z0cC1yZW1vdGUtZWRpdC9saWIvdmlld3Mvc2VydmVyLXZpZXcuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztpQ0FFd0Isc0JBQXNCOzs4QkFDSCx1QkFBdUI7OzhCQUNILHVCQUF1Qjs7d0NBQ3pELG1DQUFtQzs7OztxQ0FDMUMsOEJBQThCOzs7OytCQUMxQixxQkFBcUI7Ozs7MEJBQzFCLGdCQUFnQjs7OztBQVJyQyxXQUFXLENBQUM7O0FBVVosSUFBTSxTQUFTLEdBQUcsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQ3hDLElBQU0sR0FBRyxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUMzQixJQUFNLElBQUksR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDN0IsSUFBTSxhQUFhLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDOztJQUV2QyxVQUFVO1lBQVYsVUFBVTs7V0FBVixVQUFVOzBCQUFWLFVBQVU7OytCQUFWLFVBQVU7OztlQUFWLFVBQVU7O1dBb0JMLHFCQUFHO0FBQ1YsVUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDOztBQUVsQixhQUFPO0FBQ0wsVUFBRSxFQUFFLElBQUksQ0FBQyxFQUFFO0FBQ1gsY0FBTSxFQUFFLElBQUksQ0FBQyxNQUFNO0FBQ25CLFlBQUksRUFBRSxJQUFJLENBQUMsSUFBSTtBQUNmLFlBQUksRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQztPQUMxQixDQUFDO0tBQ0g7OztXQUVTLG9CQUFDLE1BQU0sRUFBRTtBQUNqQixVQUFNLElBQUksR0FBRyxJQUFJLENBQUM7O0FBRWxCLFVBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO0FBQ3JCLFVBQUksQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDO0FBQ3RCLFVBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUM7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LENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQztTQUNyRCxNQUFNO0FBQ0wscUJBQVcsR0FBRyxDQUFDLENBQUMsYUFBYSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUM7U0FDbkU7O0FBRUQsWUFBSSxXQUFXLElBQUksUUFBUSxFQUFFO0FBQzNCLGlCQUFPO1NBQ1I7O0FBRUQsa0NBQUUsS0FBSyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsUUFBUSxFQUFFLENBQUM7T0FDNUI7S0FDRjs7O1dBeFhhLG1CQUFHOzs7QUFDZixhQUFPLElBQUksQ0FBQyxFQUFFLENBQUM7QUFDYixpQkFBTyxzREFBc0Q7T0FDOUQsRUFBRSxZQUFNO0FBQ1AsZUFBSyxHQUFHLENBQUM7QUFDUCxtQkFBTyxzQ0FBc0M7QUFDN0MsZ0JBQU0sRUFBRSxRQUFRO1NBQ2pCLEVBQUU7aUJBQU0sT0FBSyxJQUFJLENBQUM7QUFDakIscUJBQU8sV0FBVztBQUNsQixrQkFBTSxFQUFFLE9BQU87V0FDaEIsQ0FBQztTQUFBLENBQUMsQ0FBQztBQUNKLGVBQUssRUFBRSxDQUFDO0FBQ04sbUJBQU8sbUJBQW1CO0FBQzFCLGdCQUFNLEVBQUUsU0FBUztTQUNsQixDQUFDLENBQUM7T0FDSixDQUFDLENBQUM7S0FDSjs7O1NBbEJHLFVBQVU7OztBQTZYaEIsTUFBTSxDQUFDLE9BQU8sR0FBRyxVQUFVLENBQUMiLCJmaWxlIjoiL2hvbWUvYW5hbm1heWphaW4vLmF0b20vcGFja2FnZXMvZnRwLXJlbW90ZS1lZGl0L2xpYi92aWV3cy9zZXJ2ZXItdmlldy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG5pbXBvcnQgeyAkLCBWaWV3IH0gZnJvbSAnYXRvbS1zcGFjZS1wZW4tdmlld3MnO1xuaW1wb3J0IHsgc2hvd01lc3NhZ2UsIGlzUGF0aElnbm9yZWQgfSBmcm9tICcuLy4uL2hlbHBlci9oZWxwZXIuanMnO1xuaW1wb3J0IHsgdW5sZWFkaW5nc2xhc2hpdCwgdW50cmFpbGluZ3NsYXNoaXQsIG5vcm1hbGl6ZSB9IGZyb20gJy4vLi4vaGVscGVyL2Zvcm1hdC5qcyc7XG5pbXBvcnQgRmluZGVySXRlbXNDYWNoZSBmcm9tICcuLy4uL2hlbHBlci9maW5kZXItaXRlbXMtY2FjaGUuanMnO1xuaW1wb3J0IENvbm5lY3RvciBmcm9tICcuLy4uL2Nvbm5lY3RvcnMvY29ubmVjdG9yLmpzJztcbmltcG9ydCBEaXJlY3RvcnlWaWV3IGZyb20gJy4vZGlyZWN0b3J5LXZpZXcuanMnO1xuaW1wb3J0IEZpbGVWaWV3IGZyb20gJy4vZmlsZS12aWV3LmpzJztcblxuY29uc3Qgc2hvcnRIYXNoID0gcmVxdWlyZSgnc2hvcnQtaGFzaCcpO1xuY29uc3QgbWQ1ID0gcmVxdWlyZSgnbWQ1Jyk7XG5jb25zdCBQYXRoID0gcmVxdWlyZSgncGF0aCcpO1xuY29uc3QgdGVtcERpcmVjdG9yeSA9IHJlcXVpcmUoJ29zJykudG1wZGlyKCk7XG5cbmNsYXNzIFNlcnZlclZpZXcgZXh0ZW5kcyBWaWV3IHtcblxuICBzdGF0aWMgY29udGVudCgpIHtcbiAgICByZXR1cm4gdGhpcy5saSh7XG4gICAgICBjbGFzczogJ3NlcnZlciBlbnRyeSBsaXN0LW5lc3RlZC1pdGVtIHByb2plY3Qtcm9vdCBjb2xsYXBzZWQnLFxuICAgIH0sICgpID0+IHtcbiAgICAgIHRoaXMuZGl2KHtcbiAgICAgICAgY2xhc3M6ICdoZWFkZXIgbGlzdC1pdGVtIHByb2plY3Qtcm9vdC1oZWFkZXInLFxuICAgICAgICBvdXRsZXQ6ICdoZWFkZXInLFxuICAgICAgfSwgKCkgPT4gdGhpcy5zcGFuKHtcbiAgICAgICAgY2xhc3M6ICduYW1lIGljb24nLFxuICAgICAgICBvdXRsZXQ6ICdsYWJlbCcsXG4gICAgICB9KSk7XG4gICAgICB0aGlzLm9sKHtcbiAgICAgICAgY2xhc3M6ICdlbnRyaWVzIGxpc3QtdHJlZScsXG4gICAgICAgIG91dGxldDogJ2VudHJpZXMnLFxuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICBzZXJpYWxpemUoKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG5cbiAgICByZXR1cm4ge1xuICAgICAgaWQ6IHNlbGYuaWQsXG4gICAgICBjb25maWc6IHNlbGYuY29uZmlnLFxuICAgICAgbmFtZTogc2VsZi5uYW1lLFxuICAgICAgcGF0aDogc2VsZi5nZXRQYXRoKGZhbHNlKSxcbiAgICB9O1xuICB9XG5cbiAgaW5pdGlhbGl6ZShjb25maWcpIHtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcblxuICAgIHNlbGYuY29uZmlnID0gY29uZmlnO1xuICAgIHNlbGYuZXhwYW5kZWQgPSBmYWxzZTtcbiAgICBzZWxmLmZpbmRlckl0ZW1zQ2FjaGUgPSBudWxsO1xuXG4gICAgc2VsZi5uYW1lID0gc2VsZi5jb25maWcubmFtZSA/IHNlbGYuY29uZmlnLm5hbWUgOiBzZWxmLmNvbmZpZy5ob3N0O1xuICAgIHNlbGYuaWQgPSBzZWxmLmdldElkKCk7XG5cbiAgICBzZWxmLmxhYmVsLnRleHQoc2VsZi5uYW1lKTtcbiAgICBzZWxmLmxhYmVsLmFkZENsYXNzKCdpY29uLWZpbGUtc3ltbGluay1kaXJlY3RvcnknKTtcbiAgICBzZWxmLmFkZENsYXNzKCdwcm9qZWN0LXJvb3QnKTtcblxuICAgIGlmICh0eXBlb2Ygc2VsZi5jb25maWcudGVtcCAhPSAndW5kZWZpbmVkJyAmJiBzZWxmLmNvbmZpZy50ZW1wKSB7XG4gICAgICBzZWxmLmFkZENsYXNzKCd0ZW1wJyk7XG4gICAgfVxuXG4gICAgc2VsZi5hdHRyKCdkYXRhLW5hbWUnLCAnLycpO1xuICAgIHNlbGYuYXR0cignZGF0YS1ob3N0Jywgc2VsZi5jb25maWcuaG9zdCk7XG4gICAgc2VsZi5hdHRyKCdpZCcsIHNlbGYuaWQpO1xuXG4gICAgc2VsZi5jb25uZWN0b3IgPSBuZXcgQ29ubmVjdG9yKHNlbGYuY29uZmlnKTtcblxuICAgIC8vIEV2ZW50c1xuICAgIHNlbGYub24oJ2NsaWNrJywgKGUpID0+IHtcbiAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICBzZWxmLnRvZ2dsZSgpO1xuICAgIH0pO1xuICAgIHNlbGYub24oJ2RibGNsaWNrJywgKGUpID0+IHsgZS5zdG9wUHJvcGFnYXRpb24oKTsgfSk7XG5cbiAgICAvLyBEcmFnICYgRHJvcFxuICAgIHNlbGYub24oJ2RyYWdzdGFydCcsIChlKSA9PiBzZWxmLm9uRHJhZ1N0YXJ0KGUpKTtcbiAgICBzZWxmLm9uKCdkcmFnZW50ZXInLCAoZSkgPT4gc2VsZi5vbkRyYWdFbnRlcihlKSk7XG4gICAgc2VsZi5vbignZHJhZ2xlYXZlJywgKGUpID0+IHNlbGYub25EcmFnTGVhdmUoZSkpO1xuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcblxuICAgIGlmIChzZWxmLmZpbmRlckl0ZW1zQ2FjaGUpIHtcbiAgICAgIHNlbGYuZmluZGVySXRlbXNDYWNoZSA9IG51bGw7XG4gICAgfVxuXG4gICAgdGhpcy5yZW1vdmUoKTtcbiAgfVxuXG4gIGdldElkKCkge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuXG4gICAgbGV0IG9iamVjdCA9IHtcbiAgICAgIGNvbmZpZzogc2VsZi5jb25maWcsXG4gICAgICBuYW1lOiBzZWxmLm5hbWUsXG4gICAgICBwYXRoOiBzZWxmLmdldFBhdGgoZmFsc2UpLFxuICAgIH07XG5cbiAgICByZXR1cm4gJ2Z0cC1yZW1vdGUtZWRpdC0nICsgbWQ1KEpTT04uc3RyaW5naWZ5KG9iamVjdCkpO1xuICB9XG5cbiAgZ2V0Um9vdCgpIHtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcblxuICAgIHJldHVybiBzZWxmO1xuICB9XG5cbiAgZ2V0UGF0aCh1c2VSZW1vdGUgPSB0cnVlKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG5cbiAgICBpZiAoc2VsZi5jb25maWcucmVtb3RlICYmIHVzZVJlbW90ZSkge1xuICAgICAgcmV0dXJuIHVubGVhZGluZ3NsYXNoaXQodW50cmFpbGluZ3NsYXNoaXQobm9ybWFsaXplKHNlbGYuY29uZmlnLnJlbW90ZSkpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuICcvJztcbiAgICB9XG4gIH1cblxuICBnZXRMb2NhbFBhdGgodXNlUmVtb3RlID0gdHJ1ZSkge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuXG4gICAgaWYgKHNlbGYuY29uZmlnLnJlbW90ZSAmJiB1c2VSZW1vdGUpIHtcbiAgICAgIHJldHVybiB1bnRyYWlsaW5nc2xhc2hpdChub3JtYWxpemUodGVtcERpcmVjdG9yeSArICcvJyArIHNob3J0SGFzaChzZWxmLmNvbmZpZy5ob3N0ICsgc2VsZi5jb25maWcubmFtZSkgKyAnLycgKyBzZWxmLmNvbmZpZy5ob3N0ICsgJy8nICsgc2VsZi5jb25maWcucmVtb3RlLCBQYXRoLnNlcCksIFBhdGguc2VwKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHVudHJhaWxpbmdzbGFzaGl0KG5vcm1hbGl6ZSh0ZW1wRGlyZWN0b3J5ICsgJy8nICsgc2hvcnRIYXNoKHNlbGYuY29uZmlnLmhvc3QgKyBzZWxmLmNvbmZpZy5uYW1lKSArICcvJyArIHNlbGYuY29uZmlnLmhvc3QsIFBhdGguc2VwKSwgUGF0aC5zZXApO1xuICAgIH1cbiAgfVxuXG4gIGdldENvbm5lY3RvcigpIHtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcblxuICAgIHJldHVybiBzZWxmLmNvbm5lY3RvcjtcbiAgfVxuXG4gIGdldEZpbmRlckNhY2hlKCkge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuXG4gICAgaWYgKHNlbGYuZmluZGVySXRlbXNDYWNoZSkgcmV0dXJuIHNlbGYuZmluZGVySXRlbXNDYWNoZTtcblxuICAgIHNlbGYuZmluZGVySXRlbXNDYWNoZSA9IG5ldyBGaW5kZXJJdGVtc0NhY2hlKHNlbGYuY29uZmlnLCBzZWxmLmdldENvbm5lY3RvcigpKTtcblxuICAgIHJldHVybiBzZWxmLmZpbmRlckl0ZW1zQ2FjaGU7XG4gIH1cblxuICBhZGRTeW5jSWNvbihlbGVtZW50ID0gbnVsbCkge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuXG4gICAgaWYgKCFlbGVtZW50KSBlbGVtZW50ID0gc2VsZjtcbiAgICBpZiAoIWVsZW1lbnQubGFiZWwpIHJldHVybjtcblxuICAgIGVsZW1lbnQubGFiZWwuYWRkQ2xhc3MoJ2ljb24tc3luYycpLmFkZENsYXNzKCdzcGluJyk7XG4gIH1cblxuICByZW1vdmVTeW5jSWNvbihlbGVtZW50ID0gbnVsbCkge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuXG4gICAgaWYgKCFlbGVtZW50KSBlbGVtZW50ID0gc2VsZjtcbiAgICBpZiAoIWVsZW1lbnQubGFiZWwpIHJldHVybjtcblxuICAgIGVsZW1lbnQubGFiZWwucmVtb3ZlQ2xhc3MoJ2ljb24tc3luYycpLnJlbW92ZUNsYXNzKCdzcGluJyk7XG4gIH1cblxuICBleHBhbmQoKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG5cbiAgICBsZXQgcHJvbWlzZSA9IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGlmIChzZWxmLmlzRXhwYW5kZWQoKSkgcmV0dXJuIHJlc29sdmUodHJ1ZSk7XG5cbiAgICAgIHNlbGYuYWRkU3luY0ljb24oKTtcbiAgICAgIHNlbGYuZ2V0Q29ubmVjdG9yKCkubGlzdERpcmVjdG9yeShzZWxmLmdldFBhdGgoKSkudGhlbigobGlzdCkgPT4ge1xuICAgICAgICBzZWxmLmV4cGFuZGVkID0gdHJ1ZTtcbiAgICAgICAgc2VsZi5hZGRDbGFzcygnZXhwYW5kZWQnKS5yZW1vdmVDbGFzcygnY29sbGFwc2VkJyk7XG4gICAgICAgIHNlbGYucmVtb3ZlU3luY0ljb24oKTtcblxuICAgICAgICBzZWxmLmVudHJpZXMuY2hpbGRyZW4oKS5kZXRhY2goKTtcblxuICAgICAgICBsZXQgZGlyZWN0b3JpZXMgPSBsaXN0LmZpbHRlcigoaXRlbSkgPT4ge1xuICAgICAgICAgIHJldHVybiBpdGVtLnR5cGUgPT09ICdkJyAmJiBpdGVtLm5hbWUgIT09ICcuJyAmJiBpdGVtLm5hbWUgIT09ICcuLic7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGxldCBmaWxlcyA9IGxpc3QuZmlsdGVyKChpdGVtKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIGl0ZW0udHlwZSA9PT0gJy0nO1xuICAgICAgICB9KTtcblxuICAgICAgICBkaXJlY3Rvcmllcy5zb3J0KChhLCBiKSA9PiB7XG4gICAgICAgICAgaWYgKGEubmFtZS50b0xvd2VyQ2FzZSgpIDwgYi5uYW1lLnRvTG93ZXJDYXNlKCkpIHJldHVybiAtMTtcbiAgICAgICAgICBpZiAoYS5uYW1lLnRvTG93ZXJDYXNlKCkgPiBiLm5hbWUudG9Mb3dlckNhc2UoKSkgcmV0dXJuIDE7XG4gICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGZpbGVzLnNvcnQoKGEsIGIpID0+IHtcbiAgICAgICAgICBpZiAoYS5uYW1lLnRvTG93ZXJDYXNlKCkgPCBiLm5hbWUudG9Mb3dlckNhc2UoKSkgcmV0dXJuIC0xO1xuICAgICAgICAgIGlmIChhLm5hbWUudG9Mb3dlckNhc2UoKSA+IGIubmFtZS50b0xvd2VyQ2FzZSgpKSByZXR1cm4gMTtcbiAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgbGV0IGVudHJpZXMgPSBbXTtcblxuICAgICAgICBkaXJlY3Rvcmllcy5mb3JFYWNoKChlbGVtZW50KSA9PiB7XG4gICAgICAgICAgY29uc3QgcGF0aE9uRmlsZVN5c3RlbSA9IG5vcm1hbGl6ZShzZWxmLmdldFBhdGgoKSArIGVsZW1lbnQubmFtZSwgUGF0aC5zZXApO1xuXG4gICAgICAgICAgaWYgKCFpc1BhdGhJZ25vcmVkKHBhdGhPbkZpbGVTeXN0ZW0pKSB7XG4gICAgICAgICAgICBsZXQgbGkgPSBuZXcgRGlyZWN0b3J5VmlldyhzZWxmLCB7XG4gICAgICAgICAgICAgIG5hbWU6IGVsZW1lbnQubmFtZSxcbiAgICAgICAgICAgICAgcmlnaHRzOiBlbGVtZW50LnJpZ2h0c1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBlbnRyaWVzLnB1c2gobGkpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSwgdGhpcyk7XG5cbiAgICAgICAgZmlsZXMuZm9yRWFjaCgoZWxlbWVudCkgPT4ge1xuICAgICAgICAgIGNvbnN0IHBhdGhPbkZpbGVTeXN0ZW0gPSBub3JtYWxpemUoc2VsZi5nZXRQYXRoKCkgKyBlbGVtZW50Lm5hbWUsIFBhdGguc2VwKTtcblxuICAgICAgICAgIGlmICghaXNQYXRoSWdub3JlZChwYXRoT25GaWxlU3lzdGVtKSkge1xuICAgICAgICAgICAgbGV0IGxpID0gbmV3IEZpbGVWaWV3KHNlbGYsIHtcbiAgICAgICAgICAgICAgbmFtZTogZWxlbWVudC5uYW1lLFxuICAgICAgICAgICAgICBzaXplOiBlbGVtZW50LnNpemUsXG4gICAgICAgICAgICAgIHJpZ2h0czogZWxlbWVudC5yaWdodHNcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgZW50cmllcy5wdXNoKGxpKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sIHRoaXMpO1xuXG4gICAgICAgIC8vIFJlZnJlc2ggY2FjaGVcbiAgICAgICAgc2VsZi5nZXRGaW5kZXJDYWNoZSgpLnJlZnJlc2hEaXJlY3Rvcnkoc2VsZi5nZXRQYXRoKGZhbHNlKSwgZmlsZXMpO1xuXG4gICAgICAgIGlmICghYXRvbS5jb25maWcuZ2V0KCdmdHAtcmVtb3RlLWVkaXQudHJlZS5zb3J0Rm9sZGVyc0JlZm9yZUZpbGVzJykpIHtcbiAgICAgICAgICBlbnRyaWVzLnNvcnQoKGEsIGIpID0+IHtcbiAgICAgICAgICAgIGlmIChhLm5hbWUudG9Mb3dlckNhc2UoKSA8IGIubmFtZS50b0xvd2VyQ2FzZSgpKSByZXR1cm4gLTE7XG4gICAgICAgICAgICBpZiAoYS5uYW1lLnRvTG93ZXJDYXNlKCkgPiBiLm5hbWUudG9Mb3dlckNhc2UoKSkgcmV0dXJuIDE7XG4gICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGVudHJpZXMuZm9yRWFjaCgoZW50cnkpID0+IHtcbiAgICAgICAgICBzZWxmLmVudHJpZXMuYXBwZW5kKGVudHJ5KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgc2VsZi5zZWxlY3QoKTtcblxuICAgICAgICByZXNvbHZlKHRydWUpO1xuICAgICAgfSkuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICBzZWxmLmNvbGxhcHNlKCk7XG4gICAgICAgIHNob3dNZXNzYWdlKGVyci5tZXNzYWdlLCAnZXJyb3InKTtcbiAgICAgICAgcmVqZWN0KGVycik7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIHJldHVybiBwcm9taXNlO1xuICB9XG5cbiAgY29sbGFwc2UoKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG5cbiAgICBzZWxmLmNvbm5lY3Rvci5kZXN0cm95KCk7XG5cbiAgICBzZWxmLmV4cGFuZGVkID0gZmFsc2U7XG4gICAgc2VsZi5hZGRDbGFzcygnY29sbGFwc2VkJykucmVtb3ZlQ2xhc3MoJ2V4cGFuZGVkJyk7XG4gICAgc2VsZi5yZW1vdmVTeW5jSWNvbigpO1xuICB9XG5cbiAgdG9nZ2xlKCkge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuXG4gICAgaWYgKHNlbGYuaXNFeHBhbmRlZCgpKSB7XG4gICAgICBzZWxmLmNvbGxhcHNlKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHNlbGYuZXhwYW5kKCkuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICBzaG93TWVzc2FnZShlcnIubWVzc2FnZSwgJ2Vycm9yJyk7XG4gICAgICB9KVxuICAgIH1cbiAgfVxuXG4gIHNlbGVjdChkZXNlbGVjdEFsbE90aGVyID0gdHJ1ZSkge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuXG4gICAgaWYgKGRlc2VsZWN0QWxsT3RoZXIpIHtcbiAgICAgIGVsZW1lbnRzVG9EZXNlbGVjdCA9ICQoJy5mdHAtcmVtb3RlLWVkaXQtdmlldyAuc2VsZWN0ZWQnKTtcbiAgICAgIGZvciAoaSA9IDAsIGxlbiA9IGVsZW1lbnRzVG9EZXNlbGVjdC5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICBzZWxlY3RlZCA9IGVsZW1lbnRzVG9EZXNlbGVjdFtpXTtcbiAgICAgICAgJChzZWxlY3RlZCkucmVtb3ZlQ2xhc3MoJ3NlbGVjdGVkJyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKCFzZWxmLmhhc0NsYXNzKCdzZWxlY3RlZCcpKSB7XG4gICAgICBzZWxmLmFkZENsYXNzKCdzZWxlY3RlZCcpO1xuICAgIH1cbiAgfVxuXG4gIGRlc2VsZWN0KCkge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuXG4gICAgaWYgKHNlbGYuaGFzQ2xhc3MoJ3NlbGVjdGVkJykpIHtcbiAgICAgIHNlbGYucmVtb3ZlQ2xhc3MoJ3NlbGVjdGVkJyk7XG4gICAgfVxuICB9XG5cbiAgaXNFeHBhbmRlZCgpIHtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcblxuICAgIHJldHVybiBzZWxmLmV4cGFuZGVkO1xuICB9XG5cbiAgaXNWaXNpYmxlKCkge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuXG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICByZWZyZXNoKGVsZW1lbnRUb1JlZnJlc2gpIHtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcblxuICAgIGxldCBzb3J0Rm9sZGVyc0JlZm9yZUZpbGVzID0gYXRvbS5jb25maWcuZ2V0KCdmdHAtcmVtb3RlLWVkaXQudHJlZS5zb3J0Rm9sZGVyc0JlZm9yZUZpbGVzJyk7XG4gICAgaWYgKGVsZW1lbnRUb1JlZnJlc2guZW50cmllc1swXS5jaGlsZE5vZGVzKSB7XG4gICAgICBsZXQgZSA9IGVsZW1lbnRUb1JlZnJlc2guZW50cmllc1swXS5jaGlsZE5vZGVzO1xuICAgICAgW10uc2xpY2UuY2FsbChlKS5zb3J0KChhLCBiKSA9PiB7XG4gICAgICAgIGlmIChzb3J0Rm9sZGVyc0JlZm9yZUZpbGVzKSB7XG4gICAgICAgICAgaWYgKGEuY2xhc3NMaXN0LmNvbnRhaW5zKCdkaXJlY3RvcnknKSAmJiBiLmNsYXNzTGlzdC5jb250YWlucygnZmlsZScpKSByZXR1cm4gLTE7XG4gICAgICAgICAgaWYgKGEuY2xhc3NMaXN0LmNvbnRhaW5zKCdmaWxlJykgJiYgYi5jbGFzc0xpc3QuY29udGFpbnMoJ2RpcmVjdG9yeScpKSByZXR1cm4gMTtcbiAgICAgICAgICBpZiAoYS5zcGFjZVBlblZpZXcubmFtZSA8IGIuc3BhY2VQZW5WaWV3Lm5hbWUpIHJldHVybiAtMTtcbiAgICAgICAgICBpZiAoYS5zcGFjZVBlblZpZXcubmFtZSA+IGIuc3BhY2VQZW5WaWV3Lm5hbWUpIHJldHVybiAxO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmIChhLnNwYWNlUGVuVmlldy5uYW1lIDwgYi5zcGFjZVBlblZpZXcubmFtZSkgcmV0dXJuIC0xO1xuICAgICAgICAgIGlmIChhLnNwYWNlUGVuVmlldy5uYW1lID4gYi5zcGFjZVBlblZpZXcubmFtZSkgcmV0dXJuIDE7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIDA7XG4gICAgICB9KS5mb3JFYWNoKCh2YWwsIGluZGV4KSA9PiB7XG4gICAgICAgIHNlbGYuZW50cmllcy5hcHBlbmQodmFsKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIG9uRHJhZ1N0YXJ0KGUpIHtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcblxuICAgIGlmIChlbnRyeSA9IGUudGFyZ2V0LmNsb3Nlc3QoJy5lbnRyeS5zZXJ2ZXInKSkge1xuICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgIGluaXRpYWxQYXRoID0gc2VsZi5nZXRQYXRoKHRydWUpO1xuXG4gICAgICBpZiAoZS5kYXRhVHJhbnNmZXIpIHtcbiAgICAgICAgZS5kYXRhVHJhbnNmZXIuZWZmZWN0QWxsb3dlZCA9IFwibW92ZVwiO1xuICAgICAgICBlLmRhdGFUcmFuc2Zlci5zZXREYXRhKFwiaW5pdGlhbFR5cGVcIiwgXCJzZXJ2ZXJcIik7XG4gICAgICB9IGVsc2UgaWYgKGUub3JpZ2luYWxFdmVudC5kYXRhVHJhbnNmZXIpIHtcbiAgICAgICAgZS5vcmlnaW5hbEV2ZW50LmRhdGFUcmFuc2Zlci5lZmZlY3RBbGxvd2VkID0gXCJtb3ZlXCI7XG4gICAgICAgIGUub3JpZ2luYWxFdmVudC5kYXRhVHJhbnNmZXIuc2V0RGF0YShcImluaXRpYWxUeXBlXCIsIFwic2VydmVyXCIpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIG9uRHJhZ0VudGVyKGUpIHtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcblxuICAgIGxldCBlbnRyeSwgaW5pdGlhbFR5cGU7XG5cbiAgICBpZiAoZW50cnkgPSBlLnRhcmdldC5jbG9zZXN0KCcuZW50cnkuc2VydmVyJykpIHtcbiAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG5cbiAgICAgIGlmIChlLmRhdGFUcmFuc2Zlcikge1xuICAgICAgICBpbml0aWFsVHlwZSA9IGUuZGF0YVRyYW5zZmVyLmdldERhdGEoXCJpbml0aWFsVHlwZVwiKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGluaXRpYWxUeXBlID0gZS5vcmlnaW5hbEV2ZW50LmRhdGFUcmFuc2Zlci5nZXREYXRhKFwiaW5pdGlhbFR5cGVcIik7XG4gICAgICB9XG4gICAgICBpZiAoaW5pdGlhbFR5cGUgPT0gXCJzZXJ2ZXJcIikge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgICQoZW50cnkpLnZpZXcoKS5zZWxlY3QoKTtcbiAgICB9XG4gIH1cblxuICBvbkRyYWdMZWF2ZShlKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG5cbiAgICBsZXQgZW50cnksIGluaXRpYWxUeXBlO1xuXG4gICAgaWYgKGVudHJ5ID0gZS50YXJnZXQuY2xvc2VzdCgnLmVudHJ5LnNlcnZlcicpKSB7XG4gICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuXG4gICAgICBpZiAoZS5kYXRhVHJhbnNmZXIpIHtcbiAgICAgICAgaW5pdGlhbFR5cGUgPSBlLmRhdGFUcmFuc2Zlci5nZXREYXRhKFwiaW5pdGlhbFR5cGVcIik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpbml0aWFsVHlwZSA9IGUub3JpZ2luYWxFdmVudC5kYXRhVHJhbnNmZXIuZ2V0RGF0YShcImluaXRpYWxUeXBlXCIpO1xuICAgICAgfVxuXG4gICAgICBpZiAoaW5pdGlhbFR5cGUgPT0gXCJzZXJ2ZXJcIikge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgICQoZW50cnkpLnZpZXcoKS5kZXNlbGVjdCgpO1xuICAgIH1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFNlcnZlclZpZXc7XG4iXX0=