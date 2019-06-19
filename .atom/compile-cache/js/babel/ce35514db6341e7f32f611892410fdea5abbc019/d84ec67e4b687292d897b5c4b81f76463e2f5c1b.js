var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x4, _x5, _x6) { var _again = true; _function: while (_again) { var object = _x4, property = _x5, receiver = _x6; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x4 = parent; _x5 = property; _x6 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _atomSpacePenViews = require('atom-space-pen-views');

var _helperFormatJs = require('./../helper/format.js');

var _helperSecureJs = require('./../helper/secure.js');

var _helperHelperJs = require('./../helper/helper.js');

var _helperIssueJs = require('./../helper/issue.js');

var _serverViewJs = require('./server-view.js');

var _serverViewJs2 = _interopRequireDefault(_serverViewJs);

var _folderViewJs = require('./folder-view.js');

var _folderViewJs2 = _interopRequireDefault(_folderViewJs);

var _directoryViewJs = require('./directory-view.js');

var _directoryViewJs2 = _interopRequireDefault(_directoryViewJs);

var _fileViewJs = require('./file-view.js');

var _fileViewJs2 = _interopRequireDefault(_fileViewJs);

var _ftpLogViewJs = require('./ftp-log-view.js');

var _ftpLogViewJs2 = _interopRequireDefault(_ftpLogViewJs);

'use babel';

var md5 = require('md5');
var Path = require('path');
var FileSystem = require('fs-plus');
var Storage = require('./../helper/storage.js');
var FTP_REMOTE_EDIT_URI = 'h3imdall://ftp-remote-edit';

var TreeView = (function (_ScrollView) {
  _inherits(TreeView, _ScrollView);

  function TreeView() {
    _classCallCheck(this, TreeView);

    _get(Object.getPrototypeOf(TreeView.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(TreeView, [{
    key: 'serialize',
    value: function serialize() {
      return {};
    }
  }, {
    key: 'initialize',
    value: function initialize(state) {
      _get(Object.getPrototypeOf(TreeView.prototype), 'initialize', this).call(this, state);
      var self = this;

      var html = '<background-tip>';
      html += '<ul class="centered background-message">';
      html += '<li class="message fade-in">You can edit the servers from the Settings View with ftp-remote-edit:edit-servers<br/><br/><a role="configure" class="btn btn-xs btn-default icon">Edit Servers</a></li>';
      html += '</ul>';
      html += '</background-tip>';
      self.info.html(html);

      // Events
      atom.config.onDidChange('ftp-remote-edit.tree.showOnRightSide', function () {
        self.element.dataset.showOnRightSide = atom.config.get('ftp-remote-edit.tree.showOnRightSide');
        if (self.isVisible() && atom.config.get('ftp-remote-edit.tree.showInDock') == false) {
          self.detach();
          self.attach();
        }
      });
      atom.config.onDidChange('ftp-remote-edit.tree.sortFoldersBeforeFiles', function () {
        if (self.isVisible()) {
          self.reload();
        }
      });
      atom.config.onDidChange('ftp-remote-edit.tree.sortServerProfilesByName', function () {
        if (self.isVisible()) {
          self.reload();
        }
      });
      atom.config.onDidChange('ftp-remote-edit.tree.hideIgnoredNames', function () {
        (0, _helperHelperJs.resetIgnoredPatterns)();
        if (self.isVisible()) {
          self.reload();
        }
      });
      atom.config.onDidChange('core.ignoredNames', function () {
        (0, _helperHelperJs.resetIgnoredPatterns)();
        (0, _helperHelperJs.resetIgnoredFinderPatterns)();
        if (self.isVisible()) {
          self.reload();
        }
      });
      atom.config.onDidChange('ftp-remote-edit.finder.ignoredNames', function () {
        (0, _helperHelperJs.resetIgnoredPatterns)();
        (0, _helperHelperJs.resetIgnoredFinderPatterns)();
        if (self.isVisible()) {
          self.reload();
        }
      });

      self.on('mousedown', function (e) {
        var entry = undefined;
        if (entry = e.target.closest('.entry')) {
          e.stopPropagation();

          setTimeout(function () {
            (0, _atomSpacePenViews.$)(entry).view().select();
            self.focus();
          }, 10);
        }
      });

      // Info Panel
      self.info.on('click', '[role="configure"]', function (e) {
        atom.commands.dispatch(atom.views.getView(atom.workspace), 'ftp-remote-edit:edit-servers');
      });
      self.info.on('click', '[role="toggle"]', function (e) {
        self.toggle();
      });

      // Resize Panel
      self.horizontalResize.on('dblclick', function (e) {
        self.resizeToFitContent(e);
      });
      self.horizontalResize.on('mousedown', function (e) {
        self.resizeHorizontalStarted(e);
      });

      // Keyboard Navigation
      self.on('keydown', function (e) {
        self.remoteKeyboardNavigation(e);
      });
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      var self = this;

      if (self.list) {
        if (self.list.children()) {
          self.list.children().detach();
        }
      }
      self.remove();
    }
  }, {
    key: 'getTitle',
    value: function getTitle() {
      return "Remote";
    }
  }, {
    key: 'getURI',
    value: function getURI() {
      return FTP_REMOTE_EDIT_URI;
    }
  }, {
    key: 'getAllowedLocations',
    value: function getAllowedLocations() {
      return ["left", "right"];
    }
  }, {
    key: 'getDefaultLocation',
    value: function getDefaultLocation() {
      if (atom.config.get('ftp-remote-edit.tree.showOnRightSide')) {
        return "right";
      } else {
        return "left";
      }
    }
  }, {
    key: 'isPermanentDockItem',
    value: function isPermanentDockItem() {
      return true;
    }
  }, {
    key: 'attach',
    value: function attach() {
      var self = this;

      if (atom.config.get('ftp-remote-edit.tree.showOnRightSide')) {
        self.panel = atom.workspace.addRightPanel({
          item: self
        });
      } else {
        self.panel = atom.workspace.addLeftPanel({
          item: self
        });
      }
    }
  }, {
    key: 'detach',
    value: function detach() {
      var self = this;

      if (self.panel) {
        self.panel.destroy();
        self.panel = null;
      }
    }
  }, {
    key: 'toggle',
    value: function toggle() {
      var self = this;

      if (atom.config.get('ftp-remote-edit.tree.showInDock')) {
        atom.workspace.toggle(this);
      } else {
        if (self.isVisible()) {
          self.detach();
        } else {
          self.attach();
          self.resizeToFitContent();
        }
      }

      if (self.list[0].children.length > 0) {
        self.hideInfo();
      }
    }
  }, {
    key: 'show',
    value: function show() {
      var _this = this;

      atom.workspace.open(this, {
        searchAllPanes: true,
        activatePane: true,
        activateItem: true
      }).then(function () {
        atom.workspace.paneContainerForURI(_this.getURI()).show();
      });
    }
  }, {
    key: 'hide',
    value: function hide() {
      atom.workspace.hide(this);
    }
  }, {
    key: 'focus',
    value: function focus() {
      (0, _atomSpacePenViews.$)(this).focus();
    }
  }, {
    key: 'unfocus',
    value: function unfocus() {
      atom.workspace.getCenter().activate();
    }
  }, {
    key: 'hasFocus',
    value: function hasFocus() {
      return document.activeElement === this.element;
    }
  }, {
    key: 'toggleFocus',
    value: function toggleFocus() {
      if (this.hasFocus()) {
        this.unfocus();
      } else {
        this.show();
      }
    }
  }, {
    key: 'showInfo',
    value: function showInfo() {
      this.info.css('display', 'flex');
    }
  }, {
    key: 'hideInfo',
    value: function hideInfo() {
      this.info.hide();
    }
  }, {
    key: 'reload',
    value: function reload() {
      var self = this;

      if (Storage.getServers().length === 0) {
        self.showInfo();
        return;
      } else {
        self.hideInfo();
      }

      var temp = self.list.children('.temp');

      self.list.children().detach();

      Storage.getTree().children.forEach(function (config) {
        if (typeof config.children !== 'undefined') {
          self.addFolder(config);
        } else {
          self.addServer(config);
        }
      });

      if (temp.length > 0) {
        self.list.append(temp);
      }
    }
  }, {
    key: 'addServer',
    value: function addServer(config) {
      var self = this;

      var server = new _serverViewJs2['default'](config);

      // Events
      server.getConnector().on('log', function (msg) {
        self.ftpLogView.addLine(msg);
      });

      server.getConnector().on('debug', function (cmd, param1, param2) {
        if (atom.config.get('ftp-remote-edit.dev.debug')) {
          if (param1 && param2) {
            console.log(cmd, param1, param2);
          } else if (param1) {
            console.log(cmd, param1);
          } else if (cmd) console.log(cmd);
        }
      });

      self.list.append(server);
      self.hideInfo();
    }
  }, {
    key: 'removeServer',
    value: function removeServer(root) {
      var self = this;

      if (root.isExpanded()) {
        root.collapse();
      }
      root.destroy();

      if (self.list[0].children.length === 0) {
        self.showInfo();
      }
    }
  }, {
    key: 'addFolder',
    value: function addFolder(config) {
      var self = this;

      var folder = new _folderViewJs2['default'](config, self);

      // Events
      folder.onDidAddServer = function (server) {
        server.getConnector().on('log', function (msg) {
          self.ftpLogView.addLine(msg);
        });

        server.getConnector().on('debug', function (cmd, param1, param2) {
          if (atom.config.get('ftp-remote-edit.dev.debug')) {
            if (param1 && param2) {
              console.log(cmd, param1, param2);
            } else if (param1) {
              console.log(cmd, param1);
            } else if (cmd) console.log(cmd);
          }
        });
      };

      self.list.append(folder);
      self.hideInfo();
    }
  }, {
    key: 'addDirectory',
    value: function addDirectory(root, relativePath) {
      var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

      var self = this;

      if (!options.rights) options.rights = (0, _helperHelperJs.permissionsToRights)('644');

      if (relativePath == '/') return root;

      var tmp = (0, _helperFormatJs.leadingslashit)(relativePath).split('/');
      var element = tmp.shift();
      var elementPath = (0, _helperFormatJs.normalize)(root.getPath(false) + (0, _helperFormatJs.trailingslashit)(element));

      var directory = self.findElementByPath(root.getRoot(), elementPath);
      if (!directory) {
        directory = new _directoryViewJs2['default'](root, {
          name: element,
          rights: options.rights
        });
        root.entries.append(directory);

        if (root.isExpanded()) {
          root.refresh(root);
        }
      }

      if (tmp.length > 0) {
        return self.addDirectory(directory, tmp.join('/'));
      } else {
        return directory;
      }
    }
  }, {
    key: 'addFile',
    value: function addFile(root, relativePath) {
      var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

      var self = this;

      if (!options.size) options.size = 0;
      if (!options.rights) options.rights = (0, _helperHelperJs.permissionsToRights)('755');

      if (relativePath == '/') return root;

      var tmp = (0, _helperFormatJs.leadingslashit)(relativePath).split('/');
      var element = tmp.pop();
      var elementPath = (0, _helperFormatJs.normalize)(root.getPath(false) + element);

      if (tmp.length > 0) {
        root = self.addDirectory(root, tmp.join('/'));
        elementPath = (0, _helperFormatJs.normalize)(root.getPath(false) + element);
      }

      var file = self.findElementByPath(root.getRoot(), elementPath);
      if (!file) {
        file = new _fileViewJs2['default'](root, {
          name: element,
          size: options.size,
          rights: options.rights
        });
        root.entries.append(file);

        if (root.isExpanded()) {
          root.refresh(root);
        }
      }

      return file;
    }
  }, {
    key: 'getRoot',
    value: function getRoot() {
      var self = this;

      return self;
    }
  }, {
    key: 'expand',
    value: function expand(root, relativePath) {
      var self = this;

      var promise = new Promise(function (resolve, reject) {
        relativePath = (0, _helperFormatJs.leadingslashit)((0, _helperFormatJs.normalize)(relativePath));
        if (relativePath == '' || relativePath == '/') {
          root.select();
          resolve(true);
        }

        root.getRoot().expand().then(function () {
          var arrPath = relativePath.split('/');
          var dir = (0, _helperFormatJs.trailingslashit)((0, _helperFormatJs.normalize)(root.getPath(false) + arrPath.shift()));
          var newRelativePath = arrPath.join('/');

          var find = self.findElementByPath(root.getRoot(), dir);
          if (find) {
            if (find.is('.directory')) {
              find.expand().then(function () {
                if (newRelativePath && newRelativePath != '/') {
                  self.expand(find, newRelativePath).then(function () {
                    resolve(true);
                  })['catch'](function (err) {
                    reject(err);
                  });
                } else {
                  find.select();
                  resolve(true);
                }
              })['catch'](function (err) {
                reject(err);
              });
            } else {
              find.select();
              resolve(true);
            }
          } else {
            reject('Path not found.');
          }
        })['catch'](function (err) {
          reject(err);
        });
      });

      return promise;
    }
  }, {
    key: 'getElementByLocalPath',
    value: function getElementByLocalPath(pathOnFileSystem, root) {
      var type = arguments.length <= 2 || arguments[2] === undefined ? 'directory' : arguments[2];

      var self = this;

      pathOnFileSystem = (0, _helperFormatJs.normalize)(pathOnFileSystem, Path.sep);
      var elementname = (0, _helperFormatJs.basename)(pathOnFileSystem, Path.sep);
      var elementpath = (0, _helperFormatJs.dirname)(pathOnFileSystem, Path.sep) + elementname;
      var dirpath = (0, _helperFormatJs.dirname)(pathOnFileSystem, Path.sep);

      var a = (0, _helperFormatJs.trailingslashit)(pathOnFileSystem, Path.sep);
      var b = (0, _helperFormatJs.trailingslashit)(root.getLocalPath(true), Path.sep);
      if (a == b) {
        return new _serverViewJs2['default'](root.config, root.treeView);
      } else if (type == 'file') {
        if (FileSystem.existsSync(elementpath)) {
          var stats = FileSystem.statSync(elementpath);
          if (stats) {
            return new _fileViewJs2['default'](self.getElementByLocalPath(dirpath, root), {
              name: elementname,
              path: elementpath,
              size: stats.size,
              rights: null
            });
          } else {
            return new _fileViewJs2['default'](self.getElementByLocalPath(dirpath, root), {
              name: elementname,
              path: elementpath,
              size: 0,
              rights: null
            });
          }
        } else {
          return new _fileViewJs2['default'](self.getElementByLocalPath(dirpath, root), {
            name: elementname,
            path: elementpath,
            size: 0,
            rights: null
          });
        }
      } else {
        return new _directoryViewJs2['default'](self.getElementByLocalPath(dirpath, root), {
          name: elementname,
          path: elementpath,
          rights: null
        });
      }
    }
  }, {
    key: 'findElementByPath',
    value: function findElementByPath(root, relativePath) {
      var self = this;

      var find = root.entries.find('li[id="' + 'ftp-remote-edit-' + md5(relativePath) + '"]');
      if (find.length > 0) {
        return find.view();
      }

      find = root.entries.find('li[id="' + 'ftp-remote-edit-' + md5(relativePath + '/') + '"]');
      if (find.length > 0) {
        return find.view();
      }

      return null;
    }
  }, {
    key: 'findElementByLocalPath',
    value: function findElementByLocalPath(pathOnFileSystem) {
      var self = this;

      pathOnFileSystem = (0, _helperFormatJs.trailingslashit)((0, _helperFormatJs.normalize)(pathOnFileSystem, Path.sep));

      if (!Storage.getServers()) return;
      if (!self.list) return;

      var found = null;
      Storage.getServers().forEach(function (config) {
        var server = new _serverViewJs2['default'](config, self);
        var path = server.getLocalPath(true);

        if (pathOnFileSystem.indexOf(path) != -1) {
          var object = {
            config: server.config,
            name: server.name,
            path: server.getPath(false)
          };

          var findRoot = self.list.find('li[id="' + 'ftp-remote-edit-' + md5(JSON.stringify(object)) + '"]');
          if (findRoot.length > 0) {
            var root = findRoot.view();
            var relativePath = pathOnFileSystem.replace(root.getLocalPath(), '');
            var _find = self.findElementByPath(root.getRoot(), (0, _helperFormatJs.normalize)((0, _helperFormatJs.unleadingslashit)(relativePath), '/'));
            if (_find) {
              found = _find;
              return;
            }
          }
        }
      });

      return found;
    }
  }, {
    key: 'resizeHorizontalStarted',
    value: function resizeHorizontalStarted(e) {
      e.preventDefault();

      this.resizeWidthStart = this.width();
      this.resizeMouseStart = e.pageX;
      (0, _atomSpacePenViews.$)(document).on('mousemove', this.resizeHorizontalView.bind(this));
      (0, _atomSpacePenViews.$)(document).on('mouseup', this.resizeHorizontalStopped);
    }
  }, {
    key: 'resizeHorizontalStopped',
    value: function resizeHorizontalStopped() {
      delete this.resizeWidthStart;
      delete this.resizeMouseStart;
      (0, _atomSpacePenViews.$)(document).off('mousemove', this.resizeHorizontalView);
      (0, _atomSpacePenViews.$)(document).off('mouseup', this.resizeHorizontalStopped);
    }
  }, {
    key: 'resizeHorizontalView',
    value: function resizeHorizontalView(e) {
      if (e.which !== 1) {
        return this.resizeHorizontalStopped();
      }

      var delta = e.pageX - this.resizeMouseStart;
      var width = 0;
      if (atom.config.get('ftp-remote-edit.tree.showOnRightSide')) {
        width = Math.max(50, this.resizeWidthStart - delta);
      } else {
        width = Math.max(50, this.resizeWidthStart + delta);
      }

      this.width(width);
    }
  }, {
    key: 'resizeToFitContent',
    value: function resizeToFitContent(e) {
      if (e) e.preventDefault();

      if (atom.config.get('ftp-remote-edit.tree.showInDock')) {
        var paneContainer = atom.workspace.paneContainerForItem(this);
        // NOTE: This is an internal API access
        // It's necessary because there's no Public API for it yet
        if (paneContainer && typeof paneContainer.state.size === 'number' && paneContainer.widthOrHeight == 'width' && typeof paneContainer.render === 'function') {
          paneContainer.state.size = 1;
          paneContainer.state.size = this.list.outerWidth() + 10;
          paneContainer.render(paneContainer.state);
        }
      } else {
        this.width(1);
        this.width(this.list.outerWidth() + 10);
      }
    }
  }, {
    key: 'remoteKeyboardNavigation',
    value: function remoteKeyboardNavigation(e) {
      var arrows = { left: 37, up: 38, right: 39, down: 40, enter: 13 };
      var keyCode = e.keyCode || e.which;

      switch (keyCode) {
        case arrows.up:
          this.remoteKeyboardNavigationUp();
          break;
        case arrows.down:
          this.remoteKeyboardNavigationDown();
          break;
        case arrows.left:
          this.remoteKeyboardNavigationLeft();
          break;
        case arrows.right:
          this.remoteKeyboardNavigationRight();
          break;
        case arrows.enter:
          this.remoteKeyboardNavigationEnter();
          break;
        default:
          return;
      }

      e.preventDefault();
      e.stopPropagation();
      this.remoteKeyboardNavigationMovePage();
    }
  }, {
    key: 'remoteKeyboardNavigationUp',
    value: function remoteKeyboardNavigationUp() {
      var current = this.list.find('.selected');
      if (current.length === 0) {
        if (this.list.children().length > 0) {
          current = this.list.children().last();
          (0, _atomSpacePenViews.$)(current).view().select();
          return;
        }
      }
      var next = current.prev('.entry:visible');

      if (next.length) {
        while (next.is('.expanded') && next.find('.entries .entry:visible').length) {
          next = next.find('.entries .entry:visible');
        }
      } else {
        next = current.closest('.entries').closest('.entry:visible');
      }
      if (next.length) {
        current.removeClass('selected');
        next.last().addClass('selected');
      }
    }
  }, {
    key: 'remoteKeyboardNavigationDown',
    value: function remoteKeyboardNavigationDown() {
      var current = this.list.find('.selected');
      if (current.length === 0) {
        if (this.list.children().length > 0) {
          current = this.list.children().first();
          (0, _atomSpacePenViews.$)(current).view().select();
          return;
        }
      }
      var next = current.find('.entries .entry:visible');

      if (!next.length) {
        tmp = current;

        // Workaround skip after 10
        var counter = 1;
        do {
          next = tmp.next('.entry:visible');
          if (!next.length) {
            tmp = tmp.closest('.entries').closest('.entry:visible');
          }
          counter++;
        } while (!next.length && !tmp.is('.project-root') && counter < 10);
      }
      if (next.length) {
        current.removeClass('selected');
        next.first().addClass('selected');
      }
    }
  }, {
    key: 'remoteKeyboardNavigationLeft',
    value: function remoteKeyboardNavigationLeft() {
      var current = this.list.find('.selected');

      if (current.is('.file')) {
        parent = current.view().parent.view();
        parent.collapse();
        current.removeClass('selected');
        parent.addClass('selected');
      } else if (current.is('.directory') && current.view().isExpanded()) {
        current.view().collapse();
      } else if (current.is('.directory') && !current.view().isExpanded()) {
        parent = current.view().parent.view();
        parent.collapse();
        current.removeClass('selected');
        parent.addClass('selected');
      } else if (current.is('.folder') && current.view().isExpanded()) {
        current.view().collapse();
      } else if (current.is('.folder') && !current.view().isExpanded() && current.view().parent.is('.folder')) {
        parent = current.view().parent.view();
        parent.collapse();
        current.removeClass('selected');
        parent.addClass('selected');
      } else if (current.is('.server')) {
        if (current.view().isExpanded()) {
          current.view().collapse();
        }
      }
    }
  }, {
    key: 'remoteKeyboardNavigationRight',
    value: function remoteKeyboardNavigationRight() {
      var current = this.list.find('.selected');

      if (current.is('.directory') || current.is('.server') || current.is('.folder')) {
        if (!current.view().isExpanded()) {
          current.view().expand();
        }
      } else if (current.is('.file')) {
        if (atom.config.get('ftp-remote-edit.tree.allowPendingPaneItems')) {
          atom.commands.dispatch(atom.views.getView(atom.workspace), 'ftp-remote-edit:open-file-pending');
        } else {
          atom.commands.dispatch(atom.views.getView(atom.workspace), 'ftp-remote-edit:open-file');
        }
      }
    }
  }, {
    key: 'remoteKeyboardNavigationMovePage',
    value: function remoteKeyboardNavigationMovePage() {
      var current = this.list.find('.selected');

      if (current.length > 0) {
        var scrollerTop = this.scroller.scrollTop(),
            selectedTop = current.position().top;
        if (selectedTop < scrollerTop - 10) {
          this.scroller.pageUp();
        } else if (selectedTop > scrollerTop + this.scroller.height() - 10) {
          this.scroller.pageDown();
        }
      }
    }
  }, {
    key: 'remoteKeyboardNavigationEnter',
    value: function remoteKeyboardNavigationEnter() {
      var current = this.list.find('.selected');

      if (current.is('.directory') || current.is('.server')) {
        if (!current.view().isExpanded()) {
          current.view().expand();
        } else {
          current.view().collapse();
        }
      } else if (current.is('.file')) {
        if (atom.config.get('ftp-remote-edit.tree.allowPendingPaneItems')) {
          atom.commands.dispatch(atom.views.getView(atom.workspace), 'ftp-remote-edit:open-file-pending');
        } else {
          atom.commands.dispatch(atom.views.getView(atom.workspace), 'ftp-remote-edit:open-file');
        }
      }
    }
  }], [{
    key: 'content',
    value: function content() {
      var _this2 = this;

      return this.div({
        'class': 'ftp-remote-edit-view ftp-remote-edit-resizer tool-panel',
        'tabIndex ': '-1',
        'data-show-on-right-side': atom.config.get('ftp-remote-edit.tree.showOnRightSide')
      }, function () {
        _this2.div({
          'class': 'ftp-remote-edit-scroller order--center',
          outlet: 'scroller'
        }, function () {
          _this2.ol({
            'class': 'ftp-remote-edit-list full-menu list-tree has-collapsable-children focusable-panel',
            tabindex: -1,
            outlet: 'list'
          });
        });

        _this2.div({
          'class': 'ftp-remote-edit-resize-handle',
          outlet: 'horizontalResize'
        });

        _this2.subview('ftpLogView', new _ftpLogViewJs2['default']());

        _this2.div({
          'class': 'info',
          tabindex: -1,
          outlet: 'info'
        });
      });
    }
  }]);

  return TreeView;
})(_atomSpacePenViews.ScrollView);

module.exports = TreeView;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2FuYW5tYXlqYWluLy5hdG9tL3BhY2thZ2VzL2Z0cC1yZW1vdGUtZWRpdC9saWIvdmlld3MvdHJlZS12aWV3LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7aUNBRThCLHNCQUFzQjs7OEJBQ2dGLHVCQUF1Qjs7OEJBQ25JLHVCQUF1Qjs7OEJBQ3VDLHVCQUF1Qjs7NkJBQzNFLHNCQUFzQjs7NEJBQ2pDLGtCQUFrQjs7Ozs0QkFDbEIsa0JBQWtCOzs7OytCQUNmLHFCQUFxQjs7OzswQkFDMUIsZ0JBQWdCOzs7OzRCQUNkLG1CQUFtQjs7OztBQVgxQyxXQUFXLENBQUM7O0FBYVosSUFBTSxHQUFHLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQzNCLElBQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUM3QixJQUFNLFVBQVUsR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDdEMsSUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLHdCQUF3QixDQUFDLENBQUM7QUFDbEQsSUFBTSxtQkFBbUIsR0FBRyw0QkFBNEIsQ0FBQzs7SUFFbkQsUUFBUTtZQUFSLFFBQVE7O1dBQVIsUUFBUTswQkFBUixRQUFROzsrQkFBUixRQUFROzs7ZUFBUixRQUFROztXQWtDSCxxQkFBRztBQUNWLGFBQU8sRUFBRSxDQUFDO0tBQ1g7OztXQUVTLG9CQUFDLEtBQUssRUFBRTtBQUNoQixpQ0F2Q0UsUUFBUSw0Q0F1Q08sS0FBSyxFQUFDO0FBQ3ZCLFVBQU0sSUFBSSxHQUFHLElBQUksQ0FBQzs7QUFFbEIsVUFBSSxJQUFJLEdBQUcsa0JBQWtCLENBQUM7QUFDOUIsVUFBSSxJQUFJLDBDQUEwQyxDQUFDO0FBQ25ELFVBQUksSUFBSSxzTUFBc00sQ0FBQztBQUMvTSxVQUFJLElBQUksT0FBTyxDQUFDO0FBQ2hCLFVBQUksSUFBSSxtQkFBbUIsQ0FBQztBQUM1QixVQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FB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LGFBQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQztBQUNkLGlCQUFPLHlEQUF5RDtBQUNoRSxtQkFBVyxFQUFFLElBQUk7QUFDakIsaUNBQXlCLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsc0NBQXNDLENBQUM7T0FDbkYsRUFBRSxZQUFNO0FBQ1AsZUFBSyxHQUFHLENBQUM7QUFDUCxtQkFBTyx3Q0FBd0M7QUFDL0MsZ0JBQU0sRUFBRSxVQUFVO1NBQ25CLEVBQUUsWUFBTTtBQUNQLGlCQUFLLEVBQUUsQ0FBQztBQUNOLHFCQUFPLG1GQUFtRjtBQUMxRixvQkFBUSxFQUFFLENBQUMsQ0FBQztBQUNaLGtCQUFNLEVBQUUsTUFBTTtXQUNmLENBQUMsQ0FBQztTQUNKLENBQUMsQ0FBQzs7QUFFSCxlQUFLLEdBQUcsQ0FBQztBQUNQLG1CQUFPLCtCQUErQjtBQUN0QyxnQkFBTSxFQUFFLGtCQUFrQjtTQUMzQixDQUFDLENBQUM7O0FBRUgsZUFBSyxPQUFPLENBQUMsWUFBWSxFQUFFLCtCQUFnQixDQUFDLENBQUM7O0FBRTdDLGVBQUssR0FBRyxDQUFDO0FBQ1AsbUJBQU8sTUFBTTtBQUNiLGtCQUFRLEVBQUUsQ0FBQyxDQUFDO0FBQ1osZ0JBQU0sRUFBRSxNQUFNO1NBQ2YsQ0FBQyxDQUFDO09BQ0osQ0FBQyxDQUFDO0tBQ0o7OztTQWhDRyxRQUFROzs7QUFzdkJkLE1BQU0sQ0FBQyxPQUFPLEdBQUcsUUFBUSxDQUFDIiwiZmlsZSI6Ii9ob21lL2FuYW5tYXlqYWluLy5hdG9tL3BhY2thZ2VzL2Z0cC1yZW1vdGUtZWRpdC9saWIvdmlld3MvdHJlZS12aWV3LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbmltcG9ydCB7ICQsIFNjcm9sbFZpZXcgfSBmcm9tICdhdG9tLXNwYWNlLXBlbi12aWV3cyc7XG5pbXBvcnQgeyBiYXNlbmFtZSwgZGlybmFtZSwgbGVhZGluZ3NsYXNoaXQsIHRyYWlsaW5nc2xhc2hpdCwgdW5sZWFkaW5nc2xhc2hpdCwgdW50cmFpbGluZ3NsYXNoaXQsIG5vcm1hbGl6ZSwgY2xlYW5Kc29uU3RyaW5nIH0gZnJvbSAnLi8uLi9oZWxwZXIvZm9ybWF0LmpzJztcbmltcG9ydCB7IGRlY3J5cHQgfSBmcm9tICcuLy4uL2hlbHBlci9zZWN1cmUuanMnO1xuaW1wb3J0IHsgcmVzZXRJZ25vcmVkUGF0dGVybnMsIHJlc2V0SWdub3JlZEZpbmRlclBhdHRlcm5zLCBwZXJtaXNzaW9uc1RvUmlnaHRzIH0gZnJvbSAnLi8uLi9oZWxwZXIvaGVscGVyLmpzJztcbmltcG9ydCB7IHRocm93RXJyb3JJc3N1ZTQ0IH0gZnJvbSAnLi8uLi9oZWxwZXIvaXNzdWUuanMnO1xuaW1wb3J0IFNlcnZlclZpZXcgZnJvbSAnLi9zZXJ2ZXItdmlldy5qcyc7XG5pbXBvcnQgRm9sZGVyVmlldyBmcm9tICcuL2ZvbGRlci12aWV3LmpzJztcbmltcG9ydCBEaXJlY3RvcnlWaWV3IGZyb20gJy4vZGlyZWN0b3J5LXZpZXcuanMnO1xuaW1wb3J0IEZpbGVWaWV3IGZyb20gJy4vZmlsZS12aWV3LmpzJztcbmltcG9ydCBGdHBMb2dWaWV3IGZyb20gJy4vZnRwLWxvZy12aWV3LmpzJztcblxuY29uc3QgbWQ1ID0gcmVxdWlyZSgnbWQ1Jyk7XG5jb25zdCBQYXRoID0gcmVxdWlyZSgncGF0aCcpO1xuY29uc3QgRmlsZVN5c3RlbSA9IHJlcXVpcmUoJ2ZzLXBsdXMnKTtcbmNvbnN0IFN0b3JhZ2UgPSByZXF1aXJlKCcuLy4uL2hlbHBlci9zdG9yYWdlLmpzJyk7XG5jb25zdCBGVFBfUkVNT1RFX0VESVRfVVJJID0gJ2gzaW1kYWxsOi8vZnRwLXJlbW90ZS1lZGl0JztcblxuY2xhc3MgVHJlZVZpZXcgZXh0ZW5kcyBTY3JvbGxWaWV3IHtcblxuICBzdGF0aWMgY29udGVudCgpIHtcbiAgICByZXR1cm4gdGhpcy5kaXYoe1xuICAgICAgY2xhc3M6ICdmdHAtcmVtb3RlLWVkaXQtdmlldyBmdHAtcmVtb3RlLWVkaXQtcmVzaXplciB0b29sLXBhbmVsJyxcbiAgICAgICd0YWJJbmRleCAnOiAnLTEnLFxuICAgICAgJ2RhdGEtc2hvdy1vbi1yaWdodC1zaWRlJzogYXRvbS5jb25maWcuZ2V0KCdmdHAtcmVtb3RlLWVkaXQudHJlZS5zaG93T25SaWdodFNpZGUnKSxcbiAgICB9LCAoKSA9PiB7XG4gICAgICB0aGlzLmRpdih7XG4gICAgICAgIGNsYXNzOiAnZnRwLXJlbW90ZS1lZGl0LXNjcm9sbGVyIG9yZGVyLS1jZW50ZXInLFxuICAgICAgICBvdXRsZXQ6ICdzY3JvbGxlcicsXG4gICAgICB9LCAoKSA9PiB7XG4gICAgICAgIHRoaXMub2woe1xuICAgICAgICAgIGNsYXNzOiAnZnRwLXJlbW90ZS1lZGl0LWxpc3QgZnVsbC1tZW51IGxpc3QtdHJlZSBoYXMtY29sbGFwc2FibGUtY2hpbGRyZW4gZm9jdXNhYmxlLXBhbmVsJyxcbiAgICAgICAgICB0YWJpbmRleDogLTEsXG4gICAgICAgICAgb3V0bGV0OiAnbGlzdCcsXG4gICAgICAgIH0pO1xuICAgICAgfSk7XG5cbiAgICAgIHRoaXMuZGl2KHtcbiAgICAgICAgY2xhc3M6ICdmdHAtcmVtb3RlLWVkaXQtcmVzaXplLWhhbmRsZScsXG4gICAgICAgIG91dGxldDogJ2hvcml6b250YWxSZXNpemUnLFxuICAgICAgfSk7XG5cbiAgICAgIHRoaXMuc3VidmlldygnZnRwTG9nVmlldycsIG5ldyBGdHBMb2dWaWV3KCkpO1xuXG4gICAgICB0aGlzLmRpdih7XG4gICAgICAgIGNsYXNzOiAnaW5mbycsXG4gICAgICAgIHRhYmluZGV4OiAtMSxcbiAgICAgICAgb3V0bGV0OiAnaW5mbycsXG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIHNlcmlhbGl6ZSgpIHtcbiAgICByZXR1cm4ge307XG4gIH1cblxuICBpbml0aWFsaXplKHN0YXRlKSB7XG4gICAgc3VwZXIuaW5pdGlhbGl6ZShzdGF0ZSlcbiAgICBjb25zdCBzZWxmID0gdGhpcztcblxuICAgIGxldCBodG1sID0gJzxiYWNrZ3JvdW5kLXRpcD4nO1xuICAgIGh0bWwgKz0gJzx1bCBjbGFzcz1cImNlbnRlcmVkIGJhY2tncm91bmQtbWVzc2FnZVwiPic7XG4gICAgaHRtbCArPSAnPGxpIGNsYXNzPVwibWVzc2FnZSBmYWRlLWluXCI+WW91IGNhbiBlZGl0IHRoZSBzZXJ2ZXJzIGZyb20gdGhlIFNldHRpbmdzIFZpZXcgd2l0aCBmdHAtcmVtb3RlLWVkaXQ6ZWRpdC1zZXJ2ZXJzPGJyLz48YnIvPjxhIHJvbGU9XCJjb25maWd1cmVcIiBjbGFzcz1cImJ0biBidG4teHMgYnRuLWRlZmF1bHQgaWNvblwiPkVkaXQgU2VydmVyczwvYT48L2xpPic7XG4gICAgaHRtbCArPSAnPC91bD4nO1xuICAgIGh0bWwgKz0gJzwvYmFja2dyb3VuZC10aXA+JztcbiAgICBzZWxmLmluZm8uaHRtbChodG1sKTtcblxuICAgIC8vIEV2ZW50c1xuICAgIGF0b20uY29uZmlnLm9uRGlkQ2hhbmdlKCdmdHAtcmVtb3RlLWVkaXQudHJlZS5zaG93T25SaWdodFNpZGUnLCAoKSA9PiB7XG4gICAgICBzZWxmLmVsZW1lbnQuZGF0YXNldC5zaG93T25SaWdodFNpZGUgPSBhdG9tLmNvbmZpZy5nZXQoJ2Z0cC1yZW1vdGUtZWRpdC50cmVlLnNob3dPblJpZ2h0U2lkZScpO1xuICAgICAgaWYgKHNlbGYuaXNWaXNpYmxlKCkgJiYgYXRvbS5jb25maWcuZ2V0KCdmdHAtcmVtb3RlLWVkaXQudHJlZS5zaG93SW5Eb2NrJykgPT0gZmFsc2UpIHtcbiAgICAgICAgc2VsZi5kZXRhY2goKTtcbiAgICAgICAgc2VsZi5hdHRhY2goKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBhdG9tLmNvbmZpZy5vbkRpZENoYW5nZSgnZnRwLXJlbW90ZS1lZGl0LnRyZWUuc29ydEZvbGRlcnNCZWZvcmVGaWxlcycsICgpID0+IHtcbiAgICAgIGlmIChzZWxmLmlzVmlzaWJsZSgpKSB7XG4gICAgICAgIHNlbGYucmVsb2FkKCk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgYXRvbS5jb25maWcub25EaWRDaGFuZ2UoJ2Z0cC1yZW1vdGUtZWRpdC50cmVlLnNvcnRTZXJ2ZXJQcm9maWxlc0J5TmFtZScsICgpID0+IHtcbiAgICAgIGlmIChzZWxmLmlzVmlzaWJsZSgpKSB7XG4gICAgICAgIHNlbGYucmVsb2FkKCk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgYXRvbS5jb25maWcub25EaWRDaGFuZ2UoJ2Z0cC1yZW1vdGUtZWRpdC50cmVlLmhpZGVJZ25vcmVkTmFtZXMnLCAoKSA9PiB7XG4gICAgICByZXNldElnbm9yZWRQYXR0ZXJucygpO1xuICAgICAgaWYgKHNlbGYuaXNWaXNpYmxlKCkpIHtcbiAgICAgICAgc2VsZi5yZWxvYWQoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBhdG9tLmNvbmZpZy5vbkRpZENoYW5nZSgnY29yZS5pZ25vcmVkTmFtZXMnLCAoKSA9PiB7XG4gICAgICByZXNldElnbm9yZWRQYXR0ZXJucygpO1xuICAgICAgcmVzZXRJZ25vcmVkRmluZGVyUGF0dGVybnMoKTtcbiAgICAgIGlmIChzZWxmLmlzVmlzaWJsZSgpKSB7XG4gICAgICAgIHNlbGYucmVsb2FkKCk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgYXRvbS5jb25maWcub25EaWRDaGFuZ2UoJ2Z0cC1yZW1vdGUtZWRpdC5maW5kZXIuaWdub3JlZE5hbWVzJywgKCkgPT4ge1xuICAgICAgcmVzZXRJZ25vcmVkUGF0dGVybnMoKTtcbiAgICAgIHJlc2V0SWdub3JlZEZpbmRlclBhdHRlcm5zKCk7XG4gICAgICBpZiAoc2VsZi5pc1Zpc2libGUoKSkge1xuICAgICAgICBzZWxmLnJlbG9hZCgpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgc2VsZi5vbignbW91c2Vkb3duJywgKGUpID0+IHtcbiAgICAgIGxldCBlbnRyeTtcbiAgICAgIGlmIChlbnRyeSA9IGUudGFyZ2V0LmNsb3Nlc3QoJy5lbnRyeScpKSB7XG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG5cbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgJChlbnRyeSkudmlldygpLnNlbGVjdCgpO1xuICAgICAgICAgIHNlbGYuZm9jdXMoKTtcbiAgICAgICAgfSwgMTApO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gSW5mbyBQYW5lbFxuICAgIHNlbGYuaW5mby5vbignY2xpY2snLCAnW3JvbGU9XCJjb25maWd1cmVcIl0nLCAoZSkgPT4ge1xuICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChhdG9tLnZpZXdzLmdldFZpZXcoYXRvbS53b3Jrc3BhY2UpLCAnZnRwLXJlbW90ZS1lZGl0OmVkaXQtc2VydmVycycpO1xuICAgIH0pO1xuICAgIHNlbGYuaW5mby5vbignY2xpY2snLCAnW3JvbGU9XCJ0b2dnbGVcIl0nLCAoZSkgPT4ge1xuICAgICAgc2VsZi50b2dnbGUoKTtcbiAgICB9KTtcblxuICAgIC8vIFJlc2l6ZSBQYW5lbFxuICAgIHNlbGYuaG9yaXpvbnRhbFJlc2l6ZS5vbignZGJsY2xpY2snLCAoZSkgPT4ge1xuICAgICAgc2VsZi5yZXNpemVUb0ZpdENvbnRlbnQoZSk7XG4gICAgfSk7XG4gICAgc2VsZi5ob3Jpem9udGFsUmVzaXplLm9uKCdtb3VzZWRvd24nLCAoZSkgPT4ge1xuICAgICAgc2VsZi5yZXNpemVIb3Jpem9udGFsU3RhcnRlZChlKTtcbiAgICB9KTtcblxuICAgIC8vIEtleWJvYXJkIE5hdmlnYXRpb25cbiAgICBzZWxmLm9uKCdrZXlkb3duJywgKGUpID0+IHsgc2VsZi5yZW1vdGVLZXlib2FyZE5hdmlnYXRpb24oZSk7IH0pO1xuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcblxuICAgIGlmIChzZWxmLmxpc3QpIHtcbiAgICAgIGlmIChzZWxmLmxpc3QuY2hpbGRyZW4oKSkge1xuICAgICAgICBzZWxmLmxpc3QuY2hpbGRyZW4oKS5kZXRhY2goKTtcbiAgICAgIH1cbiAgICB9XG4gICAgc2VsZi5yZW1vdmUoKTtcbiAgfVxuXG4gIGdldFRpdGxlKCkge1xuICAgIHJldHVybiBcIlJlbW90ZVwiO1xuICB9XG5cbiAgZ2V0VVJJKCkge1xuICAgIHJldHVybiBGVFBfUkVNT1RFX0VESVRfVVJJO1xuICB9XG5cbiAgZ2V0QWxsb3dlZExvY2F0aW9ucygpIHtcbiAgICByZXR1cm4gW1wibGVmdFwiLCBcInJpZ2h0XCJdO1xuICB9XG5cbiAgZ2V0RGVmYXVsdExvY2F0aW9uKCkge1xuICAgIGlmIChhdG9tLmNvbmZpZy5nZXQoJ2Z0cC1yZW1vdGUtZWRpdC50cmVlLnNob3dPblJpZ2h0U2lkZScpKSB7XG4gICAgICByZXR1cm4gXCJyaWdodFwiO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gXCJsZWZ0XCI7XG4gICAgfVxuICB9XG5cbiAgaXNQZXJtYW5lbnREb2NrSXRlbSgpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIGF0dGFjaCgpIHtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcblxuICAgIGlmIChhdG9tLmNvbmZpZy5nZXQoJ2Z0cC1yZW1vdGUtZWRpdC50cmVlLnNob3dPblJpZ2h0U2lkZScpKSB7XG4gICAgICBzZWxmLnBhbmVsID0gYXRvbS53b3Jrc3BhY2UuYWRkUmlnaHRQYW5lbCh7XG4gICAgICAgIGl0ZW06IHNlbGZcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBzZWxmLnBhbmVsID0gYXRvbS53b3Jrc3BhY2UuYWRkTGVmdFBhbmVsKHtcbiAgICAgICAgaXRlbTogc2VsZlxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgZGV0YWNoKCkge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuXG4gICAgaWYgKHNlbGYucGFuZWwpIHtcbiAgICAgIHNlbGYucGFuZWwuZGVzdHJveSgpO1xuICAgICAgc2VsZi5wYW5lbCA9IG51bGw7XG4gICAgfVxuICB9XG5cbiAgdG9nZ2xlKCkge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuXG4gICAgaWYgKGF0b20uY29uZmlnLmdldCgnZnRwLXJlbW90ZS1lZGl0LnRyZWUuc2hvd0luRG9jaycpKSB7XG4gICAgICBhdG9tLndvcmtzcGFjZS50b2dnbGUodGhpcyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChzZWxmLmlzVmlzaWJsZSgpKSB7XG4gICAgICAgIHNlbGYuZGV0YWNoKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzZWxmLmF0dGFjaCgpO1xuICAgICAgICBzZWxmLnJlc2l6ZVRvRml0Q29udGVudCgpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChzZWxmLmxpc3RbMF0uY2hpbGRyZW4ubGVuZ3RoID4gMCkge1xuICAgICAgc2VsZi5oaWRlSW5mbygpO1xuICAgIH1cbiAgfVxuXG4gIHNob3coKSB7XG4gICAgYXRvbS53b3Jrc3BhY2Uub3Blbih0aGlzLCB7XG4gICAgICBzZWFyY2hBbGxQYW5lczogdHJ1ZSxcbiAgICAgIGFjdGl2YXRlUGFuZTogdHJ1ZSxcbiAgICAgIGFjdGl2YXRlSXRlbTogdHJ1ZSxcbiAgICB9KS50aGVuKCgpID0+IHtcbiAgICAgIGF0b20ud29ya3NwYWNlLnBhbmVDb250YWluZXJGb3JVUkkodGhpcy5nZXRVUkkoKSkuc2hvdygpXG4gICAgfSk7XG4gIH1cblxuICBoaWRlKCkge1xuICAgIGF0b20ud29ya3NwYWNlLmhpZGUodGhpcylcbiAgfVxuXG4gIGZvY3VzKCkge1xuICAgICQodGhpcykuZm9jdXMoKTtcbiAgfVxuXG4gIHVuZm9jdXMoKSB7XG4gICAgYXRvbS53b3Jrc3BhY2UuZ2V0Q2VudGVyKCkuYWN0aXZhdGUoKVxuICB9XG5cbiAgaGFzRm9jdXMoKSB7XG4gICAgcmV0dXJuIChkb2N1bWVudC5hY3RpdmVFbGVtZW50ID09PSB0aGlzLmVsZW1lbnQpO1xuICB9XG5cbiAgdG9nZ2xlRm9jdXMoKSB7XG4gICAgaWYgKHRoaXMuaGFzRm9jdXMoKSkge1xuICAgICAgdGhpcy51bmZvY3VzKClcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5zaG93KCk7XG4gICAgfVxuICB9XG5cbiAgc2hvd0luZm8oKSB7XG4gICAgdGhpcy5pbmZvLmNzcygnZGlzcGxheScsICdmbGV4Jyk7XG4gIH1cblxuICBoaWRlSW5mbygpIHtcbiAgICB0aGlzLmluZm8uaGlkZSgpO1xuICB9XG5cbiAgcmVsb2FkKCkge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuXG4gICAgaWYgKFN0b3JhZ2UuZ2V0U2VydmVycygpLmxlbmd0aCA9PT0gMCkge1xuICAgICAgc2VsZi5zaG93SW5mbygpO1xuICAgICAgcmV0dXJuO1xuICAgIH0gZWxzZSB7XG4gICAgICBzZWxmLmhpZGVJbmZvKCk7XG4gICAgfVxuXG4gICAgbGV0IHRlbXAgPSBzZWxmLmxpc3QuY2hpbGRyZW4oJy50ZW1wJyk7XG5cbiAgICBzZWxmLmxpc3QuY2hpbGRyZW4oKS5kZXRhY2goKTtcblxuICAgIFN0b3JhZ2UuZ2V0VHJlZSgpLmNoaWxkcmVuLmZvckVhY2goKGNvbmZpZykgPT4ge1xuICAgICAgaWYgKHR5cGVvZiBjb25maWcuY2hpbGRyZW4gIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHNlbGYuYWRkRm9sZGVyKGNvbmZpZyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzZWxmLmFkZFNlcnZlcihjb25maWcpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgaWYgKHRlbXAubGVuZ3RoID4gMCkge1xuICAgICAgc2VsZi5saXN0LmFwcGVuZCh0ZW1wKTtcbiAgICB9XG4gIH1cblxuICBhZGRTZXJ2ZXIoY29uZmlnKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG5cbiAgICBsZXQgc2VydmVyID0gbmV3IFNlcnZlclZpZXcoY29uZmlnKTtcblxuICAgIC8vIEV2ZW50c1xuICAgIHNlcnZlci5nZXRDb25uZWN0b3IoKS5vbignbG9nJywgKG1zZykgPT4ge1xuICAgICAgc2VsZi5mdHBMb2dWaWV3LmFkZExpbmUobXNnKTtcbiAgICB9KTtcblxuICAgIHNlcnZlci5nZXRDb25uZWN0b3IoKS5vbignZGVidWcnLCAoY21kLCBwYXJhbTEsIHBhcmFtMikgPT4ge1xuICAgICAgaWYgKGF0b20uY29uZmlnLmdldCgnZnRwLXJlbW90ZS1lZGl0LmRldi5kZWJ1ZycpKSB7XG4gICAgICAgIGlmIChwYXJhbTEgJiYgcGFyYW0yKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coY21kLCBwYXJhbTEsIHBhcmFtMik7XG4gICAgICAgIH0gZWxzZSBpZiAocGFyYW0xKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coY21kLCBwYXJhbTEpO1xuICAgICAgICB9IGVsc2UgaWYgKGNtZCkgY29uc29sZS5sb2coY21kKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHNlbGYubGlzdC5hcHBlbmQoc2VydmVyKTtcbiAgICBzZWxmLmhpZGVJbmZvKCk7XG4gIH1cblxuICByZW1vdmVTZXJ2ZXIocm9vdCkge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuXG4gICAgaWYgKHJvb3QuaXNFeHBhbmRlZCgpKSB7XG4gICAgICByb290LmNvbGxhcHNlKCk7XG4gICAgfVxuICAgIHJvb3QuZGVzdHJveSgpO1xuXG4gICAgaWYgKHNlbGYubGlzdFswXS5jaGlsZHJlbi5sZW5ndGggPT09IDApIHtcbiAgICAgIHNlbGYuc2hvd0luZm8oKTtcbiAgICB9XG4gIH1cblxuICBhZGRGb2xkZXIoY29uZmlnKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG5cbiAgICBsZXQgZm9sZGVyID0gbmV3IEZvbGRlclZpZXcoY29uZmlnLCBzZWxmKTtcblxuICAgIC8vIEV2ZW50c1xuICAgIGZvbGRlci5vbkRpZEFkZFNlcnZlciA9IChzZXJ2ZXIpID0+IHtcbiAgICAgIHNlcnZlci5nZXRDb25uZWN0b3IoKS5vbignbG9nJywgKG1zZykgPT4ge1xuICAgICAgICBzZWxmLmZ0cExvZ1ZpZXcuYWRkTGluZShtc2cpO1xuICAgICAgfSk7XG5cbiAgICAgIHNlcnZlci5nZXRDb25uZWN0b3IoKS5vbignZGVidWcnLCAoY21kLCBwYXJhbTEsIHBhcmFtMikgPT4ge1xuICAgICAgICBpZiAoYXRvbS5jb25maWcuZ2V0KCdmdHAtcmVtb3RlLWVkaXQuZGV2LmRlYnVnJykpIHtcbiAgICAgICAgICBpZiAocGFyYW0xICYmIHBhcmFtMikge1xuICAgICAgICAgICAgY29uc29sZS5sb2coY21kLCBwYXJhbTEsIHBhcmFtMik7XG4gICAgICAgICAgfSBlbHNlIGlmIChwYXJhbTEpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGNtZCwgcGFyYW0xKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKGNtZCkgY29uc29sZS5sb2coY21kKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfTtcblxuICAgIHNlbGYubGlzdC5hcHBlbmQoZm9sZGVyKTtcbiAgICBzZWxmLmhpZGVJbmZvKCk7XG4gIH1cblxuICBhZGREaXJlY3Rvcnkocm9vdCwgcmVsYXRpdmVQYXRoLCBvcHRpb25zID0ge30pIHtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcblxuICAgIGlmICghb3B0aW9ucy5yaWdodHMpIG9wdGlvbnMucmlnaHRzID0gcGVybWlzc2lvbnNUb1JpZ2h0cygnNjQ0Jyk7XG5cbiAgICBpZiAocmVsYXRpdmVQYXRoID09ICcvJykgcmV0dXJuIHJvb3Q7XG5cbiAgICBsZXQgdG1wID0gbGVhZGluZ3NsYXNoaXQocmVsYXRpdmVQYXRoKS5zcGxpdCgnLycpO1xuICAgIGxldCBlbGVtZW50ID0gdG1wLnNoaWZ0KCk7XG4gICAgbGV0IGVsZW1lbnRQYXRoID0gbm9ybWFsaXplKHJvb3QuZ2V0UGF0aChmYWxzZSkgKyB0cmFpbGluZ3NsYXNoaXQoZWxlbWVudCkpO1xuXG4gICAgbGV0IGRpcmVjdG9yeSA9IHNlbGYuZmluZEVsZW1lbnRCeVBhdGgocm9vdC5nZXRSb290KCksIGVsZW1lbnRQYXRoKTtcbiAgICBpZiAoIWRpcmVjdG9yeSkge1xuICAgICAgZGlyZWN0b3J5ID0gbmV3IERpcmVjdG9yeVZpZXcocm9vdCwge1xuICAgICAgICBuYW1lOiBlbGVtZW50LFxuICAgICAgICByaWdodHM6IG9wdGlvbnMucmlnaHRzXG4gICAgICB9KTtcbiAgICAgIHJvb3QuZW50cmllcy5hcHBlbmQoZGlyZWN0b3J5KTtcblxuICAgICAgaWYgKHJvb3QuaXNFeHBhbmRlZCgpKSB7XG4gICAgICAgIHJvb3QucmVmcmVzaChyb290KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodG1wLmxlbmd0aCA+IDApIHtcbiAgICAgIHJldHVybiBzZWxmLmFkZERpcmVjdG9yeShkaXJlY3RvcnksIHRtcC5qb2luKCcvJykpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gZGlyZWN0b3J5O1xuICAgIH1cbiAgfVxuXG4gIGFkZEZpbGUocm9vdCwgcmVsYXRpdmVQYXRoLCBvcHRpb25zID0ge30pIHtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcblxuICAgIGlmICghb3B0aW9ucy5zaXplKSBvcHRpb25zLnNpemUgPSAwO1xuICAgIGlmICghb3B0aW9ucy5yaWdodHMpIG9wdGlvbnMucmlnaHRzID0gcGVybWlzc2lvbnNUb1JpZ2h0cygnNzU1Jyk7XG5cbiAgICBpZiAocmVsYXRpdmVQYXRoID09ICcvJykgcmV0dXJuIHJvb3Q7XG5cbiAgICBsZXQgdG1wID0gbGVhZGluZ3NsYXNoaXQocmVsYXRpdmVQYXRoKS5zcGxpdCgnLycpO1xuICAgIGxldCBlbGVtZW50ID0gdG1wLnBvcCgpO1xuICAgIGxldCBlbGVtZW50UGF0aCA9IG5vcm1hbGl6ZShyb290LmdldFBhdGgoZmFsc2UpICsgZWxlbWVudCk7XG5cbiAgICBpZiAodG1wLmxlbmd0aCA+IDApIHtcbiAgICAgIHJvb3QgPSBzZWxmLmFkZERpcmVjdG9yeShyb290LCB0bXAuam9pbignLycpKTtcbiAgICAgIGVsZW1lbnRQYXRoID0gbm9ybWFsaXplKHJvb3QuZ2V0UGF0aChmYWxzZSkgKyBlbGVtZW50KTtcbiAgICB9XG5cbiAgICBsZXQgZmlsZSA9IHNlbGYuZmluZEVsZW1lbnRCeVBhdGgocm9vdC5nZXRSb290KCksIGVsZW1lbnRQYXRoKTtcbiAgICBpZiAoIWZpbGUpIHtcbiAgICAgIGZpbGUgPSBuZXcgRmlsZVZpZXcocm9vdCwge1xuICAgICAgICBuYW1lOiBlbGVtZW50LFxuICAgICAgICBzaXplOiBvcHRpb25zLnNpemUsXG4gICAgICAgIHJpZ2h0czogb3B0aW9ucy5yaWdodHNcbiAgICAgIH0pO1xuICAgICAgcm9vdC5lbnRyaWVzLmFwcGVuZChmaWxlKTtcblxuICAgICAgaWYgKHJvb3QuaXNFeHBhbmRlZCgpKSB7XG4gICAgICAgIHJvb3QucmVmcmVzaChyb290KVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBmaWxlO1xuICB9XG5cbiAgZ2V0Um9vdCgpIHtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcblxuICAgIHJldHVybiBzZWxmO1xuICB9XG5cbiAgZXhwYW5kKHJvb3QsIHJlbGF0aXZlUGF0aCkge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuXG4gICAgbGV0IHByb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICByZWxhdGl2ZVBhdGggPSBsZWFkaW5nc2xhc2hpdChub3JtYWxpemUocmVsYXRpdmVQYXRoKSk7XG4gICAgICBpZiAocmVsYXRpdmVQYXRoID09ICcnIHx8IHJlbGF0aXZlUGF0aCA9PSAnLycpIHtcbiAgICAgICAgcm9vdC5zZWxlY3QoKTtcbiAgICAgICAgcmVzb2x2ZSh0cnVlKTtcbiAgICAgIH1cblxuICAgICAgcm9vdC5nZXRSb290KCkuZXhwYW5kKCkudGhlbigoKSA9PiB7XG4gICAgICAgIGxldCBhcnJQYXRoID0gcmVsYXRpdmVQYXRoLnNwbGl0KCcvJyk7XG4gICAgICAgIGxldCBkaXIgPSB0cmFpbGluZ3NsYXNoaXQobm9ybWFsaXplKHJvb3QuZ2V0UGF0aChmYWxzZSkgKyBhcnJQYXRoLnNoaWZ0KCkpKTtcbiAgICAgICAgbGV0IG5ld1JlbGF0aXZlUGF0aCA9IGFyclBhdGguam9pbignLycpO1xuXG4gICAgICAgIGxldCBmaW5kID0gc2VsZi5maW5kRWxlbWVudEJ5UGF0aChyb290LmdldFJvb3QoKSwgZGlyKTtcbiAgICAgICAgaWYgKGZpbmQpIHtcbiAgICAgICAgICBpZiAoZmluZC5pcygnLmRpcmVjdG9yeScpKSB7XG4gICAgICAgICAgICBmaW5kLmV4cGFuZCgpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICBpZiAobmV3UmVsYXRpdmVQYXRoICYmIG5ld1JlbGF0aXZlUGF0aCAhPSAnLycpIHtcbiAgICAgICAgICAgICAgICBzZWxmLmV4cGFuZChmaW5kLCBuZXdSZWxhdGl2ZVBhdGgpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh0cnVlKTtcbiAgICAgICAgICAgICAgICB9KS5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgICAgICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBmaW5kLnNlbGVjdCgpO1xuICAgICAgICAgICAgICAgIHJlc29sdmUodHJ1ZSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgICAgICAgcmVqZWN0KGVycik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZmluZC5zZWxlY3QoKTtcbiAgICAgICAgICAgIHJlc29sdmUodHJ1ZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJlamVjdCgnUGF0aCBub3QgZm91bmQuJyk7XG4gICAgICAgIH1cbiAgICAgIH0pLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgcmVqZWN0KGVycik7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIHJldHVybiBwcm9taXNlO1xuICB9XG5cbiAgZ2V0RWxlbWVudEJ5TG9jYWxQYXRoKHBhdGhPbkZpbGVTeXN0ZW0sIHJvb3QsIHR5cGUgPSAnZGlyZWN0b3J5Jykge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuXG4gICAgcGF0aE9uRmlsZVN5c3RlbSA9IG5vcm1hbGl6ZShwYXRoT25GaWxlU3lzdGVtLCBQYXRoLnNlcCk7XG4gICAgbGV0IGVsZW1lbnRuYW1lID0gYmFzZW5hbWUocGF0aE9uRmlsZVN5c3RlbSwgUGF0aC5zZXApO1xuICAgIGxldCBlbGVtZW50cGF0aCA9IGRpcm5hbWUocGF0aE9uRmlsZVN5c3RlbSwgUGF0aC5zZXApICsgZWxlbWVudG5hbWU7XG4gICAgbGV0IGRpcnBhdGggPSBkaXJuYW1lKHBhdGhPbkZpbGVTeXN0ZW0sIFBhdGguc2VwKTtcblxuICAgIGxldCBhID0gdHJhaWxpbmdzbGFzaGl0KHBhdGhPbkZpbGVTeXN0ZW0sIFBhdGguc2VwKTtcbiAgICBsZXQgYiA9IHRyYWlsaW5nc2xhc2hpdChyb290LmdldExvY2FsUGF0aCh0cnVlKSwgUGF0aC5zZXApO1xuICAgIGlmIChhID09IGIpIHtcbiAgICAgIHJldHVybiBuZXcgU2VydmVyVmlldyhyb290LmNvbmZpZywgcm9vdC50cmVlVmlldyk7XG4gICAgfSBlbHNlIGlmICh0eXBlID09ICdmaWxlJykge1xuICAgICAgaWYgKEZpbGVTeXN0ZW0uZXhpc3RzU3luYyhlbGVtZW50cGF0aCkpIHtcbiAgICAgICAgbGV0IHN0YXRzID0gRmlsZVN5c3RlbS5zdGF0U3luYyhlbGVtZW50cGF0aCk7XG4gICAgICAgIGlmIChzdGF0cykge1xuICAgICAgICAgIHJldHVybiBuZXcgRmlsZVZpZXcoc2VsZi5nZXRFbGVtZW50QnlMb2NhbFBhdGgoZGlycGF0aCwgcm9vdCksIHtcbiAgICAgICAgICAgIG5hbWU6IGVsZW1lbnRuYW1lLFxuICAgICAgICAgICAgcGF0aDogZWxlbWVudHBhdGgsXG4gICAgICAgICAgICBzaXplOiBzdGF0cy5zaXplLFxuICAgICAgICAgICAgcmlnaHRzOiBudWxsXG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIG5ldyBGaWxlVmlldyhzZWxmLmdldEVsZW1lbnRCeUxvY2FsUGF0aChkaXJwYXRoLCByb290KSwge1xuICAgICAgICAgICAgbmFtZTogZWxlbWVudG5hbWUsXG4gICAgICAgICAgICBwYXRoOiBlbGVtZW50cGF0aCxcbiAgICAgICAgICAgIHNpemU6IDAsXG4gICAgICAgICAgICByaWdodHM6IG51bGxcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIG5ldyBGaWxlVmlldyhzZWxmLmdldEVsZW1lbnRCeUxvY2FsUGF0aChkaXJwYXRoLCByb290KSwge1xuICAgICAgICAgIG5hbWU6IGVsZW1lbnRuYW1lLFxuICAgICAgICAgIHBhdGg6IGVsZW1lbnRwYXRoLFxuICAgICAgICAgIHNpemU6IDAsXG4gICAgICAgICAgcmlnaHRzOiBudWxsXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbmV3IERpcmVjdG9yeVZpZXcoc2VsZi5nZXRFbGVtZW50QnlMb2NhbFBhdGgoZGlycGF0aCwgcm9vdCksIHtcbiAgICAgICAgbmFtZTogZWxlbWVudG5hbWUsXG4gICAgICAgIHBhdGg6IGVsZW1lbnRwYXRoLFxuICAgICAgICByaWdodHM6IG51bGxcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIGZpbmRFbGVtZW50QnlQYXRoKHJvb3QsIHJlbGF0aXZlUGF0aCkge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuXG4gICAgbGV0IGZpbmQgPSByb290LmVudHJpZXMuZmluZCgnbGlbaWQ9XCInICsgJ2Z0cC1yZW1vdGUtZWRpdC0nICsgbWQ1KHJlbGF0aXZlUGF0aCkgKyAnXCJdJyk7XG4gICAgaWYgKGZpbmQubGVuZ3RoID4gMCkge1xuICAgICAgcmV0dXJuIGZpbmQudmlldygpO1xuICAgIH1cblxuICAgIGZpbmQgPSByb290LmVudHJpZXMuZmluZCgnbGlbaWQ9XCInICsgJ2Z0cC1yZW1vdGUtZWRpdC0nICsgbWQ1KHJlbGF0aXZlUGF0aCArICcvJykgKyAnXCJdJyk7XG4gICAgaWYgKGZpbmQubGVuZ3RoID4gMCkge1xuICAgICAgcmV0dXJuIGZpbmQudmlldygpO1xuICAgIH1cblxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgZmluZEVsZW1lbnRCeUxvY2FsUGF0aChwYXRoT25GaWxlU3lzdGVtKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG5cbiAgICBwYXRoT25GaWxlU3lzdGVtID0gdHJhaWxpbmdzbGFzaGl0KG5vcm1hbGl6ZShwYXRoT25GaWxlU3lzdGVtLCBQYXRoLnNlcCkpO1xuXG4gICAgaWYgKCFTdG9yYWdlLmdldFNlcnZlcnMoKSkgcmV0dXJuO1xuICAgIGlmICghc2VsZi5saXN0KSByZXR1cm47XG5cbiAgICBsZXQgZm91bmQgPSBudWxsO1xuICAgIFN0b3JhZ2UuZ2V0U2VydmVycygpLmZvckVhY2goKGNvbmZpZykgPT4ge1xuICAgICAgY29uc3Qgc2VydmVyID0gbmV3IFNlcnZlclZpZXcoY29uZmlnLCBzZWxmKTtcbiAgICAgIGNvbnN0IHBhdGggPSBzZXJ2ZXIuZ2V0TG9jYWxQYXRoKHRydWUpO1xuXG4gICAgICBpZiAocGF0aE9uRmlsZVN5c3RlbS5pbmRleE9mKHBhdGgpICE9IC0xKSB7XG4gICAgICAgIGNvbnN0IG9iamVjdCA9IHtcbiAgICAgICAgICBjb25maWc6IHNlcnZlci5jb25maWcsXG4gICAgICAgICAgbmFtZTogc2VydmVyLm5hbWUsXG4gICAgICAgICAgcGF0aDogc2VydmVyLmdldFBhdGgoZmFsc2UpLFxuICAgICAgICB9O1xuXG4gICAgICAgIGxldCBmaW5kUm9vdCA9IHNlbGYubGlzdC5maW5kKCdsaVtpZD1cIicgKyAnZnRwLXJlbW90ZS1lZGl0LScgKyBtZDUoSlNPTi5zdHJpbmdpZnkob2JqZWN0KSkgKyAnXCJdJyk7XG4gICAgICAgIGlmIChmaW5kUm9vdC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgY29uc3Qgcm9vdCA9IGZpbmRSb290LnZpZXcoKTtcbiAgICAgICAgICBjb25zdCByZWxhdGl2ZVBhdGggPSBwYXRoT25GaWxlU3lzdGVtLnJlcGxhY2Uocm9vdC5nZXRMb2NhbFBhdGgoKSwgJycpO1xuICAgICAgICAgIGNvbnN0IGZpbmQgPSBzZWxmLmZpbmRFbGVtZW50QnlQYXRoKHJvb3QuZ2V0Um9vdCgpLCBub3JtYWxpemUodW5sZWFkaW5nc2xhc2hpdChyZWxhdGl2ZVBhdGgpLCAnLycpKTtcbiAgICAgICAgICBpZiAoZmluZCkge1xuICAgICAgICAgICAgZm91bmQgPSBmaW5kO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIGZvdW5kO1xuXG4gIH1cblxuICByZXNpemVIb3Jpem9udGFsU3RhcnRlZChlKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgdGhpcy5yZXNpemVXaWR0aFN0YXJ0ID0gdGhpcy53aWR0aCgpO1xuICAgIHRoaXMucmVzaXplTW91c2VTdGFydCA9IGUucGFnZVg7XG4gICAgJChkb2N1bWVudCkub24oJ21vdXNlbW92ZScsIHRoaXMucmVzaXplSG9yaXpvbnRhbFZpZXcuYmluZCh0aGlzKSk7XG4gICAgJChkb2N1bWVudCkub24oJ21vdXNldXAnLCB0aGlzLnJlc2l6ZUhvcml6b250YWxTdG9wcGVkKTtcbiAgfVxuXG4gIHJlc2l6ZUhvcml6b250YWxTdG9wcGVkKCkge1xuICAgIGRlbGV0ZSB0aGlzLnJlc2l6ZVdpZHRoU3RhcnQ7XG4gICAgZGVsZXRlIHRoaXMucmVzaXplTW91c2VTdGFydDtcbiAgICAkKGRvY3VtZW50KS5vZmYoJ21vdXNlbW92ZScsIHRoaXMucmVzaXplSG9yaXpvbnRhbFZpZXcpO1xuICAgICQoZG9jdW1lbnQpLm9mZignbW91c2V1cCcsIHRoaXMucmVzaXplSG9yaXpvbnRhbFN0b3BwZWQpO1xuICB9XG5cbiAgcmVzaXplSG9yaXpvbnRhbFZpZXcoZSkge1xuICAgIGlmIChlLndoaWNoICE9PSAxKSB7XG4gICAgICByZXR1cm4gdGhpcy5yZXNpemVIb3Jpem9udGFsU3RvcHBlZCgpO1xuICAgIH1cblxuICAgIGxldCBkZWx0YSA9IGUucGFnZVggLSB0aGlzLnJlc2l6ZU1vdXNlU3RhcnQ7XG4gICAgbGV0IHdpZHRoID0gMDtcbiAgICBpZiAoYXRvbS5jb25maWcuZ2V0KCdmdHAtcmVtb3RlLWVkaXQudHJlZS5zaG93T25SaWdodFNpZGUnKSkge1xuICAgICAgd2lkdGggPSBNYXRoLm1heCg1MCwgdGhpcy5yZXNpemVXaWR0aFN0YXJ0IC0gZGVsdGEpO1xuICAgIH0gZWxzZSB7XG4gICAgICB3aWR0aCA9IE1hdGgubWF4KDUwLCB0aGlzLnJlc2l6ZVdpZHRoU3RhcnQgKyBkZWx0YSk7XG4gICAgfVxuXG4gICAgdGhpcy53aWR0aCh3aWR0aCk7XG4gIH1cblxuICByZXNpemVUb0ZpdENvbnRlbnQoZSkge1xuICAgIGlmIChlKSBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICBpZiAoYXRvbS5jb25maWcuZ2V0KCdmdHAtcmVtb3RlLWVkaXQudHJlZS5zaG93SW5Eb2NrJykpIHtcbiAgICAgIGNvbnN0IHBhbmVDb250YWluZXIgPSBhdG9tLndvcmtzcGFjZS5wYW5lQ29udGFpbmVyRm9ySXRlbSh0aGlzKVxuICAgICAgLy8gTk9URTogVGhpcyBpcyBhbiBpbnRlcm5hbCBBUEkgYWNjZXNzXG4gICAgICAvLyBJdCdzIG5lY2Vzc2FyeSBiZWNhdXNlIHRoZXJlJ3Mgbm8gUHVibGljIEFQSSBmb3IgaXQgeWV0XG4gICAgICBpZiAocGFuZUNvbnRhaW5lciAmJiB0eXBlb2YgcGFuZUNvbnRhaW5lci5zdGF0ZS5zaXplID09PSAnbnVtYmVyJyAmJiBwYW5lQ29udGFpbmVyLndpZHRoT3JIZWlnaHQgPT0gJ3dpZHRoJyAmJiB0eXBlb2YgcGFuZUNvbnRhaW5lci5yZW5kZXIgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgcGFuZUNvbnRhaW5lci5zdGF0ZS5zaXplID0gMVxuICAgICAgICBwYW5lQ29udGFpbmVyLnN0YXRlLnNpemUgPSAodGhpcy5saXN0Lm91dGVyV2lkdGgoKSArIDEwKTtcbiAgICAgICAgcGFuZUNvbnRhaW5lci5yZW5kZXIocGFuZUNvbnRhaW5lci5zdGF0ZSlcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy53aWR0aCgxKTtcbiAgICAgIHRoaXMud2lkdGgodGhpcy5saXN0Lm91dGVyV2lkdGgoKSArIDEwKTtcbiAgICB9XG4gIH1cblxuICByZW1vdGVLZXlib2FyZE5hdmlnYXRpb24oZSkge1xuICAgIGxldCBhcnJvd3MgPSB7IGxlZnQ6IDM3LCB1cDogMzgsIHJpZ2h0OiAzOSwgZG93bjogNDAsIGVudGVyOiAxMyB9O1xuICAgIGxldCBrZXlDb2RlID0gZS5rZXlDb2RlIHx8IGUud2hpY2g7XG5cbiAgICBzd2l0Y2ggKGtleUNvZGUpIHtcbiAgICAgIGNhc2UgYXJyb3dzLnVwOlxuICAgICAgICB0aGlzLnJlbW90ZUtleWJvYXJkTmF2aWdhdGlvblVwKCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBhcnJvd3MuZG93bjpcbiAgICAgICAgdGhpcy5yZW1vdGVLZXlib2FyZE5hdmlnYXRpb25Eb3duKCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBhcnJvd3MubGVmdDpcbiAgICAgICAgdGhpcy5yZW1vdGVLZXlib2FyZE5hdmlnYXRpb25MZWZ0KCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBhcnJvd3MucmlnaHQ6XG4gICAgICAgIHRoaXMucmVtb3RlS2V5Ym9hcmROYXZpZ2F0aW9uUmlnaHQoKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIGFycm93cy5lbnRlcjpcbiAgICAgICAgdGhpcy5yZW1vdGVLZXlib2FyZE5hdmlnYXRpb25FbnRlcigpO1xuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICB0aGlzLnJlbW90ZUtleWJvYXJkTmF2aWdhdGlvbk1vdmVQYWdlKCk7XG4gIH1cblxuICByZW1vdGVLZXlib2FyZE5hdmlnYXRpb25VcCgpIHtcbiAgICBsZXQgY3VycmVudCA9IHRoaXMubGlzdC5maW5kKCcuc2VsZWN0ZWQnKTtcbiAgICBpZiAoY3VycmVudC5sZW5ndGggPT09IDApIHtcbiAgICAgIGlmICh0aGlzLmxpc3QuY2hpbGRyZW4oKS5sZW5ndGggPiAwKSB7XG4gICAgICAgIGN1cnJlbnQgPSB0aGlzLmxpc3QuY2hpbGRyZW4oKS5sYXN0KCk7XG4gICAgICAgICQoY3VycmVudCkudmlldygpLnNlbGVjdCgpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgfVxuICAgIGxldCBuZXh0ID0gY3VycmVudC5wcmV2KCcuZW50cnk6dmlzaWJsZScpO1xuXG4gICAgaWYgKG5leHQubGVuZ3RoKSB7XG4gICAgICB3aGlsZSAobmV4dC5pcygnLmV4cGFuZGVkJykgJiYgbmV4dC5maW5kKCcuZW50cmllcyAuZW50cnk6dmlzaWJsZScpLmxlbmd0aCkge1xuICAgICAgICBuZXh0ID0gbmV4dC5maW5kKCcuZW50cmllcyAuZW50cnk6dmlzaWJsZScpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBuZXh0ID0gY3VycmVudC5jbG9zZXN0KCcuZW50cmllcycpLmNsb3Nlc3QoJy5lbnRyeTp2aXNpYmxlJyk7XG4gICAgfVxuICAgIGlmIChuZXh0Lmxlbmd0aCkge1xuICAgICAgY3VycmVudC5yZW1vdmVDbGFzcygnc2VsZWN0ZWQnKTtcbiAgICAgIG5leHQubGFzdCgpLmFkZENsYXNzKCdzZWxlY3RlZCcpO1xuICAgIH1cbiAgfVxuXG4gIHJlbW90ZUtleWJvYXJkTmF2aWdhdGlvbkRvd24oKSB7XG4gICAgbGV0IGN1cnJlbnQgPSB0aGlzLmxpc3QuZmluZCgnLnNlbGVjdGVkJyk7XG4gICAgaWYgKGN1cnJlbnQubGVuZ3RoID09PSAwKSB7XG4gICAgICBpZiAodGhpcy5saXN0LmNoaWxkcmVuKCkubGVuZ3RoID4gMCkge1xuICAgICAgICBjdXJyZW50ID0gdGhpcy5saXN0LmNoaWxkcmVuKCkuZmlyc3QoKTtcbiAgICAgICAgJChjdXJyZW50KS52aWV3KCkuc2VsZWN0KCk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9XG4gICAgbGV0IG5leHQgPSBjdXJyZW50LmZpbmQoJy5lbnRyaWVzIC5lbnRyeTp2aXNpYmxlJyk7XG5cbiAgICBpZiAoIW5leHQubGVuZ3RoKSB7XG4gICAgICB0bXAgPSBjdXJyZW50O1xuXG4gICAgICAvLyBXb3JrYXJvdW5kIHNraXAgYWZ0ZXIgMTBcbiAgICAgIGxldCBjb3VudGVyID0gMTtcbiAgICAgIGRvIHtcbiAgICAgICAgbmV4dCA9IHRtcC5uZXh0KCcuZW50cnk6dmlzaWJsZScpO1xuICAgICAgICBpZiAoIW5leHQubGVuZ3RoKSB7XG4gICAgICAgICAgdG1wID0gdG1wLmNsb3Nlc3QoJy5lbnRyaWVzJykuY2xvc2VzdCgnLmVudHJ5OnZpc2libGUnKTtcbiAgICAgICAgfVxuICAgICAgICBjb3VudGVyKys7XG4gICAgICB9IHdoaWxlICghbmV4dC5sZW5ndGggJiYgIXRtcC5pcygnLnByb2plY3Qtcm9vdCcpICYmIGNvdW50ZXIgPCAxMCk7XG4gICAgfVxuICAgIGlmIChuZXh0Lmxlbmd0aCkge1xuICAgICAgY3VycmVudC5yZW1vdmVDbGFzcygnc2VsZWN0ZWQnKTtcbiAgICAgIG5leHQuZmlyc3QoKS5hZGRDbGFzcygnc2VsZWN0ZWQnKTtcbiAgICB9XG4gIH1cblxuICByZW1vdGVLZXlib2FyZE5hdmlnYXRpb25MZWZ0KCkge1xuICAgIGNvbnN0IGN1cnJlbnQgPSB0aGlzLmxpc3QuZmluZCgnLnNlbGVjdGVkJyk7XG5cbiAgICBpZiAoY3VycmVudC5pcygnLmZpbGUnKSkge1xuICAgICAgcGFyZW50ID0gY3VycmVudC52aWV3KCkucGFyZW50LnZpZXcoKTtcbiAgICAgIHBhcmVudC5jb2xsYXBzZSgpO1xuICAgICAgY3VycmVudC5yZW1vdmVDbGFzcygnc2VsZWN0ZWQnKTtcbiAgICAgIHBhcmVudC5hZGRDbGFzcygnc2VsZWN0ZWQnKTtcbiAgICB9IGVsc2UgaWYgKGN1cnJlbnQuaXMoJy5kaXJlY3RvcnknKSAmJiBjdXJyZW50LnZpZXcoKS5pc0V4cGFuZGVkKCkpIHtcbiAgICAgIGN1cnJlbnQudmlldygpLmNvbGxhcHNlKCk7XG4gICAgfSBlbHNlIGlmIChjdXJyZW50LmlzKCcuZGlyZWN0b3J5JykgJiYgIWN1cnJlbnQudmlldygpLmlzRXhwYW5kZWQoKSkge1xuICAgICAgcGFyZW50ID0gY3VycmVudC52aWV3KCkucGFyZW50LnZpZXcoKTtcbiAgICAgIHBhcmVudC5jb2xsYXBzZSgpO1xuICAgICAgY3VycmVudC5yZW1vdmVDbGFzcygnc2VsZWN0ZWQnKTtcbiAgICAgIHBhcmVudC5hZGRDbGFzcygnc2VsZWN0ZWQnKTtcbiAgICB9IGVsc2UgaWYgKGN1cnJlbnQuaXMoJy5mb2xkZXInKSAmJiBjdXJyZW50LnZpZXcoKS5pc0V4cGFuZGVkKCkpIHtcbiAgICAgIGN1cnJlbnQudmlldygpLmNvbGxhcHNlKCk7XG4gICAgfSBlbHNlIGlmIChjdXJyZW50LmlzKCcuZm9sZGVyJykgJiYgIWN1cnJlbnQudmlldygpLmlzRXhwYW5kZWQoKSAmJiBjdXJyZW50LnZpZXcoKS5wYXJlbnQuaXMoJy5mb2xkZXInKSkge1xuICAgICAgcGFyZW50ID0gY3VycmVudC52aWV3KCkucGFyZW50LnZpZXcoKTtcbiAgICAgIHBhcmVudC5jb2xsYXBzZSgpO1xuICAgICAgY3VycmVudC5yZW1vdmVDbGFzcygnc2VsZWN0ZWQnKTtcbiAgICAgIHBhcmVudC5hZGRDbGFzcygnc2VsZWN0ZWQnKTtcbiAgICB9IGVsc2UgaWYgKGN1cnJlbnQuaXMoJy5zZXJ2ZXInKSkge1xuICAgICAgaWYgKGN1cnJlbnQudmlldygpLmlzRXhwYW5kZWQoKSkge1xuICAgICAgICBjdXJyZW50LnZpZXcoKS5jb2xsYXBzZSgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJlbW90ZUtleWJvYXJkTmF2aWdhdGlvblJpZ2h0KCkge1xuICAgIGNvbnN0IGN1cnJlbnQgPSB0aGlzLmxpc3QuZmluZCgnLnNlbGVjdGVkJyk7XG5cbiAgICBpZiAoY3VycmVudC5pcygnLmRpcmVjdG9yeScpIHx8IGN1cnJlbnQuaXMoJy5zZXJ2ZXInKSB8fCBjdXJyZW50LmlzKCcuZm9sZGVyJykpIHtcbiAgICAgIGlmICghY3VycmVudC52aWV3KCkuaXNFeHBhbmRlZCgpKSB7XG4gICAgICAgIGN1cnJlbnQudmlldygpLmV4cGFuZCgpO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoY3VycmVudC5pcygnLmZpbGUnKSkge1xuICAgICAgaWYgKGF0b20uY29uZmlnLmdldCgnZnRwLXJlbW90ZS1lZGl0LnRyZWUuYWxsb3dQZW5kaW5nUGFuZUl0ZW1zJykpIHtcbiAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChhdG9tLnZpZXdzLmdldFZpZXcoYXRvbS53b3Jrc3BhY2UpLCAnZnRwLXJlbW90ZS1lZGl0Om9wZW4tZmlsZS1wZW5kaW5nJyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKGF0b20udmlld3MuZ2V0VmlldyhhdG9tLndvcmtzcGFjZSksICdmdHAtcmVtb3RlLWVkaXQ6b3Blbi1maWxlJyk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmVtb3RlS2V5Ym9hcmROYXZpZ2F0aW9uTW92ZVBhZ2UoKSB7XG4gICAgY29uc3QgY3VycmVudCA9IHRoaXMubGlzdC5maW5kKCcuc2VsZWN0ZWQnKTtcblxuICAgIGlmIChjdXJyZW50Lmxlbmd0aCA+IDApIHtcbiAgICAgIGxldCBzY3JvbGxlclRvcCA9IHRoaXMuc2Nyb2xsZXIuc2Nyb2xsVG9wKCksXG4gICAgICAgIHNlbGVjdGVkVG9wID0gY3VycmVudC5wb3NpdGlvbigpLnRvcDtcbiAgICAgIGlmIChzZWxlY3RlZFRvcCA8IHNjcm9sbGVyVG9wIC0gMTApIHtcbiAgICAgICAgdGhpcy5zY3JvbGxlci5wYWdlVXAoKTtcbiAgICAgIH0gZWxzZSBpZiAoc2VsZWN0ZWRUb3AgPiBzY3JvbGxlclRvcCArIHRoaXMuc2Nyb2xsZXIuaGVpZ2h0KCkgLSAxMCkge1xuICAgICAgICB0aGlzLnNjcm9sbGVyLnBhZ2VEb3duKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmVtb3RlS2V5Ym9hcmROYXZpZ2F0aW9uRW50ZXIoKSB7XG4gICAgY29uc3QgY3VycmVudCA9IHRoaXMubGlzdC5maW5kKCcuc2VsZWN0ZWQnKTtcblxuICAgIGlmIChjdXJyZW50LmlzKCcuZGlyZWN0b3J5JykgfHwgY3VycmVudC5pcygnLnNlcnZlcicpKSB7XG4gICAgICBpZiAoIWN1cnJlbnQudmlldygpLmlzRXhwYW5kZWQoKSkge1xuICAgICAgICBjdXJyZW50LnZpZXcoKS5leHBhbmQoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGN1cnJlbnQudmlldygpLmNvbGxhcHNlKCk7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChjdXJyZW50LmlzKCcuZmlsZScpKSB7XG4gICAgICBpZiAoYXRvbS5jb25maWcuZ2V0KCdmdHAtcmVtb3RlLWVkaXQudHJlZS5hbGxvd1BlbmRpbmdQYW5lSXRlbXMnKSkge1xuICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKGF0b20udmlld3MuZ2V0VmlldyhhdG9tLndvcmtzcGFjZSksICdmdHAtcmVtb3RlLWVkaXQ6b3Blbi1maWxlLXBlbmRpbmcnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goYXRvbS52aWV3cy5nZXRWaWV3KGF0b20ud29ya3NwYWNlKSwgJ2Z0cC1yZW1vdGUtZWRpdDpvcGVuLWZpbGUnKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBUcmVlVmlldztcbiJdfQ==