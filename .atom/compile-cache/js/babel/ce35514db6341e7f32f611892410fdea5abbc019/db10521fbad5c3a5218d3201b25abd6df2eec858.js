Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _viewsConfigurationView = require('./views/configuration-view');

var _viewsConfigurationView2 = _interopRequireDefault(_viewsConfigurationView);

var _viewsPermissionsView = require('./views/permissions-view');

var _viewsPermissionsView2 = _interopRequireDefault(_viewsPermissionsView);

var _viewsTreeView = require('./views/tree-view');

var _viewsTreeView2 = _interopRequireDefault(_viewsTreeView);

var _viewsProtocolView = require('./views/protocol-view');

var _viewsProtocolView2 = _interopRequireDefault(_viewsProtocolView);

var _viewsFinderView = require('./views/finder-view');

var _viewsFinderView2 = _interopRequireDefault(_viewsFinderView);

var _dialogsChangePassDialogJs = require('./dialogs/change-pass-dialog.js');

var _dialogsChangePassDialogJs2 = _interopRequireDefault(_dialogsChangePassDialogJs);

var _dialogsPromptPassDialogJs = require('./dialogs/prompt-pass-dialog.js');

var _dialogsPromptPassDialogJs2 = _interopRequireDefault(_dialogsPromptPassDialogJs);

var _dialogsAddDialogJs = require('./dialogs/add-dialog.js');

var _dialogsAddDialogJs2 = _interopRequireDefault(_dialogsAddDialogJs);

var _dialogsRenameDialogJs = require('./dialogs/rename-dialog.js');

var _dialogsRenameDialogJs2 = _interopRequireDefault(_dialogsRenameDialogJs);

var _dialogsFindDialogJs = require('./dialogs/find-dialog.js');

var _dialogsFindDialogJs2 = _interopRequireDefault(_dialogsFindDialogJs);

var _dialogsDuplicateDialog = require('./dialogs/duplicate-dialog');

var _dialogsDuplicateDialog2 = _interopRequireDefault(_dialogsDuplicateDialog);

var _atom = require('atom');

var _helperSecureJs = require('./helper/secure.js');

var _helperFormatJs = require('./helper/format.js');

var _helperHelperJs = require('./helper/helper.js');

'use babel';

var config = require('./config/config-schema.json');
var server_config = require('./config/server-schema.json');

var atom = global.atom;
var Electron = require('electron');
var Path = require('path');
var FileSystem = require('fs-plus');
var getIconServices = require('./helper/icon.js');
var Queue = require('./helper/queue.js');
var Storage = require('./helper/storage.js');

require('events').EventEmitter.defaultMaxListeners = 0;

var FtpRemoteEdit = (function () {
  function FtpRemoteEdit() {
    _classCallCheck(this, FtpRemoteEdit);

    var self = this;

    self.info = [];
    self.config = config;
    self.subscriptions = null;

    self.treeView = null;
    self.protocolView = null;
    self.configurationView = null;
    self.finderView = null;
  }

  _createClass(FtpRemoteEdit, [{
    key: 'activate',
    value: function activate() {
      var self = this;

      self.treeView = new _viewsTreeView2['default']();
      self.protocolView = new _viewsProtocolView2['default']();

      // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
      self.subscriptions = new _atom.CompositeDisposable();

      // Register command that toggles this view
      self.subscriptions.add(atom.commands.add('atom-workspace', {
        'ftp-remote-edit:toggle': function ftpRemoteEditToggle() {
          return self.toggle();
        },
        'ftp-remote-edit:toggle-focus': function ftpRemoteEditToggleFocus() {
          return self.toggleFocus();
        },
        'ftp-remote-edit:show': function ftpRemoteEditShow() {
          return self.show();
        },
        'ftp-remote-edit:hide': function ftpRemoteEditHide() {
          return self.hide();
        },
        'ftp-remote-edit:unfocus': function ftpRemoteEditUnfocus() {
          return self.treeView.unfocus();
        },
        'ftp-remote-edit:edit-servers': function ftpRemoteEditEditServers() {
          return self.configuration();
        },
        'ftp-remote-edit:change-password': function ftpRemoteEditChangePassword() {
          return self.changePassword();
        },
        'ftp-remote-edit:open-file': function ftpRemoteEditOpenFile() {
          return self.open();
        },
        'ftp-remote-edit:open-file-pending': function ftpRemoteEditOpenFilePending() {
          return self.open(true);
        },
        'ftp-remote-edit:new-file': function ftpRemoteEditNewFile() {
          return self.create('file');
        },
        'ftp-remote-edit:new-directory': function ftpRemoteEditNewDirectory() {
          return self.create('directory');
        },
        'ftp-remote-edit:duplicate': function ftpRemoteEditDuplicate() {
          return self.duplicate();
        },
        'ftp-remote-edit:delete': function ftpRemoteEditDelete() {
          return self['delete']();
        },
        'ftp-remote-edit:rename': function ftpRemoteEditRename() {
          return self.rename();
        },
        'ftp-remote-edit:copy': function ftpRemoteEditCopy() {
          return self.copy();
        },
        'ftp-remote-edit:cut': function ftpRemoteEditCut() {
          return self.cut();
        },
        'ftp-remote-edit:paste': function ftpRemoteEditPaste() {
          return self.paste();
        },
        'ftp-remote-edit:chmod': function ftpRemoteEditChmod() {
          return self.chmod();
        },
        'ftp-remote-edit:upload-file': function ftpRemoteEditUploadFile() {
          return self.upload('file');
        },
        'ftp-remote-edit:upload-directory': function ftpRemoteEditUploadDirectory() {
          return self.upload('directory');
        },
        'ftp-remote-edit:download': function ftpRemoteEditDownload() {
          return self.download();
        },
        'ftp-remote-edit:reload': function ftpRemoteEditReload() {
          return self.reload();
        },
        'ftp-remote-edit:find-remote-path': function ftpRemoteEditFindRemotePath() {
          return self.findRemotePath();
        },
        'ftp-remote-edit:copy-remote-path': function ftpRemoteEditCopyRemotePath() {
          return self.copyRemotePath();
        },
        'ftp-remote-edit:finder': function ftpRemoteEditFinder() {
          return self.remotePathFinder();
        },
        'ftp-remote-edit:finder-reindex-cache': function ftpRemoteEditFinderReindexCache() {
          return self.remotePathFinder(true);
        },
        'ftp-remote-edit:add-temp-server': function ftpRemoteEditAddTempServer() {
          return self.addTempServer();
        },
        'ftp-remote-edit:remove-temp-server': function ftpRemoteEditRemoveTempServer() {
          return self.removeTempServer();
        }
      }));

      // Events
      atom.config.onDidChange('ftp-remote-edit.config', function () {
        if (Storage.getPassword()) {
          Storage.load(true);
          self.treeView.reload();
        }
      });

      // Drag & Drop
      self.treeView.on('drop', function (e) {
        self.drop(e);
      });

      // Auto Reveal Active File
      atom.workspace.getCenter().onDidStopChangingActivePaneItem(function (item) {
        self.autoRevealActiveFile();
      });

      // workaround to activate core.allowPendingPaneItems if ftp-remote-edit.tree.allowPendingPaneItems is activated
      atom.config.onDidChange('ftp-remote-edit.tree.allowPendingPaneItems', function (_ref) {
        var newValue = _ref.newValue;
        var oldValue = _ref.oldValue;

        if (newValue == true && !atom.config.get('core.allowPendingPaneItems')) {
          atom.config.set('core.allowPendingPaneItems', true);
        }
      });
      if (atom.config.get('ftp-remote-edit.tree.allowPendingPaneItems')) {
        atom.config.set('core.allowPendingPaneItems', true);
      }

      // Toggle on startup
      atom.packages.onDidActivatePackage(function (activatePackage) {
        if (activatePackage.name == 'ftp-remote-edit') {
          if (atom.config.get('ftp-remote-edit.tree.toggleOnStartup')) {
            self.toggle();
          }
        }
      });
    }
  }, {
    key: 'deactivate',
    value: function deactivate() {
      var self = this;

      if (self.subscriptions) {
        self.subscriptions.dispose();
        self.subscriptions = null;
      }

      if (self.treeView) {
        self.treeView.destroy();
      }

      if (self.protocolView) {
        self.protocolView.destroy();
      }

      if (self.configurationView) {
        self.configurationView.destroy();
      }

      if (self.finderView) {
        finderView.destroy();
      }
    }
  }, {
    key: 'serialize',
    value: function serialize() {
      return {};
    }
  }, {
    key: 'handleURI',
    value: function handleURI(parsedUri) {
      var self = this;

      var regex = /(\/)?([a-z0-9_\-]{1,5}:\/\/)(([^:]{1,})((:(.{1,}))?[\@\x40]))?([a-z0-9_\-.]+)(:([0-9]*))?(.*)/gi;
      var is_matched = parsedUri.path.match(regex);

      if (is_matched) {

        if (!self.treeView.isVisible()) {
          self.toggle();
        }

        var matched = regex.exec(parsedUri.path);

        var protocol = matched[2];
        var username = matched[4] !== undefined ? decodeURIComponent(matched[4]) : '';
        var password = matched[7] !== undefined ? decodeURIComponent(matched[7]) : '';
        var host = matched[8] !== undefined ? matched[8] : '';
        var port = matched[10] !== undefined ? matched[10] : '';
        var path = matched[11] !== undefined ? decodeURIComponent(matched[11]) : "/";

        var newconfig = JSON.parse(JSON.stringify(server_config));
        newconfig.name = username ? protocol + username + '@' + host : protocol + host;
        newconfig.host = host;
        newconfig.port = port ? port : protocol == 'sftp://' ? '22' : '21';
        newconfig.user = username;
        newconfig.password = password;
        newconfig.sftp = protocol == 'sftp://';
        newconfig.remote = path;
        newconfig.temp = true;

        (0, _helperHelperJs.logDebug)("Adding new server by uri handler", newconfig);

        self.treeView.addServer(newconfig);
      }
    }
  }, {
    key: 'openRemoteFile',
    value: function openRemoteFile() {
      var self = this;

      return function (file) {
        var selected = self.treeView.list.find('.selected');

        if (selected.length === 0) return;

        var root = selected.view().getRoot();
        var localPath = (0, _helperFormatJs.normalize)(root.getLocalPath());
        localPath = (0, _helperFormatJs.normalize)(Path.join(localPath.slice(0, localPath.lastIndexOf(root.getPath())), file).replace(/\/+/g, Path.sep), Path.sep);

        try {
          var _file = self.treeView.getElementByLocalPath(localPath, root, 'file');
          self.openFile(_file);

          return true;
        } catch (ex) {
          (0, _helperHelperJs.logDebug)(ex);

          return false;
        }
      };
    }
  }, {
    key: 'getCurrentServerName',
    value: function getCurrentServerName() {
      var self = this;

      return function () {
        return new Promise(function (resolve, reject) {
          var selected = self.treeView.list.find('.selected');
          if (selected.length === 0) reject('noservers');

          var root = selected.view().getRoot();
          resolve(root.name);
        });
      };
    }
  }, {
    key: 'getCurrentServerConfig',
    value: function getCurrentServerConfig() {
      var self = this;

      return function (reasonForRequest) {
        return new Promise(function (resolve, reject) {
          if (!reasonForRequest) {
            reject('noreasongiven');
            return;
          }

          var selected = self.treeView.list.find('.selected');
          if (selected.length === 0) {
            reject('noservers');
            return;
          }

          if (!Storage.hasPassword()) {
            reject('nopassword');
            return;
          }

          var root = selected.view().getRoot();
          var buttondismiss = false;

          if ((0, _helperSecureJs.isInBlackList)(Storage.getPassword(), reasonForRequest)) {
            reject('userdeclined');
            return;
          }
          if ((0, _helperSecureJs.isInWhiteList)(Storage.getPassword(), reasonForRequest)) {
            resolve(root.config);
            return;
          }

          var caution = 'Decline this message if you did not initiate a request to share your server configuration with a pacakge!';
          var notif = atom.notifications.addWarning('Server Configuration Requested', {
            detail: reasonForRequest + '\n-------------------------------\n' + caution,
            dismissable: true,
            buttons: [{
              text: 'Always',
              onDidClick: function onDidClick() {
                buttondismiss = true;
                notif.dismiss();
                (0, _helperSecureJs.addToWhiteList)(Storage.getPassword(), reasonForRequest);
                resolve(root.config);
              }
            }, {
              text: 'Accept',
              onDidClick: function onDidClick() {
                buttondismiss = true;
                notif.dismiss();
                resolve(root.config);
              }
            }, {
              text: 'Decline',
              onDidClick: function onDidClick() {
                buttondismiss = true;
                notif.dismiss();
                reject('userdeclined');
              }
            }, {
              text: 'Never',
              onDidClick: function onDidClick() {
                buttondismiss = true;
                notif.dismiss();
                (0, _helperSecureJs.addToBlackList)(Storage.getPassword(), reasonForRequest);
                reject('userdeclined');
              }
            }]
          });

          var disposable = notif.onDidDismiss(function () {
            if (!buttondismiss) reject('userdeclined');
            disposable.dispose();
          });
        });
      };
    }
  }, {
    key: 'consumeElementIcons',
    value: function consumeElementIcons(service) {
      getIconServices().setElementIcons(service);

      return new _atom.Disposable(function () {
        getIconServices().resetElementIcons();
      });
    }
  }, {
    key: 'promtPassword',
    value: function promtPassword() {
      var self = this;
      var dialog = new _dialogsPromptPassDialogJs2['default']();

      var promise = new Promise(function (resolve, reject) {
        dialog.on('dialog-done', function (e, password) {
          if ((0, _helperSecureJs.checkPassword)(password)) {
            Storage.setPassword(password);
            dialog.close();

            resolve(true);
          } else {
            dialog.showError('Wrong password, try again!');
          }
        });

        dialog.attach();
      });

      return promise;
    }
  }, {
    key: 'changePassword',
    value: function changePassword(mode) {
      var self = this;

      var options = {};
      if (mode == 'add') {
        options.mode = 'add';
        options.prompt = 'Enter the master password. All information about your server settings will be encrypted with this password.';
      } else {
        options.mode = 'change';
      }

      var dialog = new _dialogsChangePassDialogJs2['default'](options);
      var promise = new Promise(function (resolve, reject) {
        dialog.on('dialog-done', function (e, passwords) {

          // Check that password from new master password can decrypt current config
          if (mode == 'add') {
            var configHash = atom.config.get('ftp-remote-edit.config');
            if (configHash) {
              var newPassword = passwords.newPassword;
              var testConfig = (0, _helperSecureJs.decrypt)(newPassword, configHash);

              try {
                var testJson = JSON.parse(testConfig);
              } catch (e) {
                // If master password does not decrypt current config,
                // prompt the user to reply to insert correct password
                // or reset config content
                (0, _helperHelperJs.showMessage)('Master password does not match with previous used. Please retry or delete "config" entry in ftp-remote-edit configuration node.', 'error');

                dialog.close();
                resolve(false);
                return;
              }
            }
          }

          var oldPasswordValue = mode == 'add' ? passwords.newPassword : passwords.oldPassword;

          (0, _helperSecureJs.changePassword)(oldPasswordValue, passwords.newPassword).then(function () {
            Storage.setPassword(passwords.newPassword);

            if (mode != 'add') {
              (0, _helperHelperJs.showMessage)('Master password successfully changed. Please restart atom!', 'success');
            }
            resolve(true);
          });

          dialog.close();
        });

        dialog.attach();
      });

      return promise;
    }
  }, {
    key: 'toggle',
    value: function toggle() {
      var self = this;

      if (!Storage.hasPassword()) {
        if (!(0, _helperSecureJs.checkPasswordExists)()) {
          self.changePassword('add').then(function (returnValue) {
            if (returnValue) {
              if (Storage.load()) {
                self.treeView.reload();
                self.treeView.toggle();
              }
            }
          });
          return;
        } else {
          self.promtPassword().then(function () {
            if (Storage.load()) {
              self.treeView.reload();
              self.treeView.toggle();
            }
          });
          return;
        }
      } else if (!Storage.loaded && Storage.load()) {
        self.treeView.reload();
      }
      self.treeView.toggle();
    }
  }, {
    key: 'toggleFocus',
    value: function toggleFocus() {
      var self = this;

      if (!Storage.hasPassword()) {
        self.toggle();
      } else {
        self.treeView.toggleFocus();
      }
    }
  }, {
    key: 'show',
    value: function show() {
      var self = this;

      if (!Storage.hasPassword()) {
        self.toggle();
      } else {
        self.treeView.show();
      }
    }
  }, {
    key: 'hide',
    value: function hide() {
      var self = this;

      self.treeView.hide();
    }
  }, {
    key: 'configuration',
    value: function configuration() {
      var self = this;
      var selected = self.treeView.list.find('.selected');

      var root = null;
      if (selected.length !== 0) {
        root = selected.view().getRoot();
      };

      if (self.configurationView == null) {
        self.configurationView = new _viewsConfigurationView2['default']();
      }

      if (!Storage.hasPassword()) {
        self.promtPassword().then(function () {
          if (Storage.load()) {
            self.configurationView.reload(root);
            self.configurationView.attach();
          }
        });
        return;
      }

      self.configurationView.reload(root);
      self.configurationView.attach();
    }
  }, {
    key: 'addTempServer',
    value: function addTempServer() {
      var self = this;
      var selected = self.treeView.list.find('.selected');

      var root = null;
      if (selected.length !== 0) {
        root = selected.view().getRoot();
        root.config.temp = false;
        self.treeView.removeServer(selected.view());
        Storage.addServer(root.config);
        Storage.save();
      };
    }
  }, {
    key: 'removeTempServer',
    value: function removeTempServer() {
      var self = this;
      var selected = self.treeView.list.find('.selected');

      if (selected.length !== 0) {
        self.treeView.removeServer(selected.view());
      };
    }
  }, {
    key: 'open',
    value: function open() {
      var pending = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

      var self = this;
      var selected = self.treeView.list.find('.selected');

      if (selected.length === 0) return;

      if (selected.view().is('.file')) {
        var file = selected.view();
        if (file) {
          self.openFile(file, pending);
        }
      } else if (selected.view().is('.directory')) {
        var _directory = selected.view();
        if (_directory) {
          self.openDirectory(_directory);
        }
      }
    }
  }, {
    key: 'openFile',
    value: function openFile(file) {
      var pending = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

      var self = this;

      var fullRelativePath = (0, _helperFormatJs.normalize)(file.getPath(true) + file.name);
      var fullLocalPath = (0, _helperFormatJs.normalize)(file.getLocalPath(true) + file.name, Path.sep);

      // Check if file is already opened in texteditor
      if ((0, _helperHelperJs.getTextEditor)(fullLocalPath, true)) {
        atom.workspace.open(fullLocalPath, { pending: pending, searchAllPanes: true });
        return false;
      }

      self.downloadFile(file.getRoot(), fullRelativePath, fullLocalPath, { filesize: file.size }).then(function () {
        // Open file and add handler to editor to upload file on save
        return self.openFileInEditor(file, pending);
      })['catch'](function (err) {
        (0, _helperHelperJs.showMessage)(err, 'error');
      });
    }
  }, {
    key: 'openDirectory',
    value: function openDirectory(directory) {
      var self = this;

      directory.expand();
    }
  }, {
    key: 'create',
    value: function create(type) {
      var self = this;
      var selected = self.treeView.list.find('.selected');

      if (selected.length === 0) return;

      if (selected.view().is('.file')) {
        directory = selected.view().parent;
      } else {
        directory = selected.view();
      }

      if (directory) {
        if (type == 'file') {
          (function () {
            var dialog = new _dialogsAddDialogJs2['default'](directory.getPath(false), true);
            dialog.on('new-path', function (e, relativePath) {
              if (relativePath) {
                self.createFile(directory, relativePath);
                dialog.close();
              }
            });
            dialog.attach();
          })();
        } else if (type == 'directory') {
          (function () {
            var dialog = new _dialogsAddDialogJs2['default'](directory.getPath(false), false);
            dialog.on('new-path', function (e, relativePath) {
              if (relativePath) {
                self.createDirectory(directory, relativePath);
                dialog.close();
              }
            });
            dialog.attach();
          })();
        }
      }
    }
  }, {
    key: 'createFile',
    value: function createFile(directory, relativePath) {
      var self = this;

      var fullRelativePath = (0, _helperFormatJs.normalize)(directory.getRoot().getPath(true) + relativePath);
      var fullLocalPath = (0, _helperFormatJs.normalize)(directory.getRoot().getLocalPath(true) + relativePath, Path.sep);

      try {
        // create local file
        if (!FileSystem.existsSync(fullLocalPath)) {
          // Create local Directory
          (0, _helperHelperJs.createLocalPath)(fullLocalPath);
          FileSystem.writeFileSync(fullLocalPath, '');
        }
      } catch (err) {
        (0, _helperHelperJs.showMessage)(err, 'error');
        return false;
      }

      directory.getConnector().existsFile(fullRelativePath).then(function () {
        (0, _helperHelperJs.showMessage)('File ' + relativePath.trim() + ' already exists', 'error');
      })['catch'](function () {
        self.uploadFile(directory, fullLocalPath, fullRelativePath, false).then(function (duplicatedFile) {
          if (duplicatedFile) {
            // Open file and add handler to editor to upload file on save
            return self.openFileInEditor(duplicatedFile);
          }
        })['catch'](function (err) {
          (0, _helperHelperJs.showMessage)(err, 'error');
        });
      });
    }
  }, {
    key: 'createDirectory',
    value: function createDirectory(directory, relativePath) {
      var self = this;

      relativePath = (0, _helperFormatJs.trailingslashit)(relativePath);
      var fullRelativePath = (0, _helperFormatJs.normalize)(directory.getRoot().getPath(true) + relativePath);
      var fullLocalPath = (0, _helperFormatJs.normalize)(directory.getRoot().getLocalPath(true) + relativePath, Path.sep);

      // create local directory
      try {
        if (!FileSystem.existsSync(fullLocalPath)) {
          (0, _helperHelperJs.createLocalPath)(fullLocalPath);
        }
      } catch (err) {}

      directory.getConnector().existsDirectory(fullRelativePath).then(function (result) {
        (0, _helperHelperJs.showMessage)('Directory ' + relativePath.trim() + ' already exists', 'error');
      })['catch'](function (err) {
        return directory.getConnector().createDirectory(fullRelativePath).then(function (result) {
          // Add to tree
          var element = self.treeView.addDirectory(directory.getRoot(), relativePath);
          if (element.isVisible()) {
            element.select();
          }
        })['catch'](function (err) {
          (0, _helperHelperJs.showMessage)(err.message, 'error');
        });
      });
    }
  }, {
    key: 'rename',
    value: function rename() {
      var self = this;
      var selected = self.treeView.list.find('.selected');

      if (selected.length === 0) return;

      if (selected.view().is('.file')) {
        (function () {
          var file = selected.view();
          if (file) {
            (function () {
              var dialog = new _dialogsRenameDialogJs2['default'](file.getPath(false) + file.name, true);
              dialog.on('new-path', function (e, relativePath) {
                if (relativePath) {
                  self.renameFile(file, relativePath);
                  dialog.close();
                }
              });
              dialog.attach();
            })();
          }
        })();
      } else if (selected.view().is('.directory')) {
        (function () {
          var directory = selected.view();
          if (directory) {
            (function () {
              var dialog = new _dialogsRenameDialogJs2['default']((0, _helperFormatJs.trailingslashit)(directory.getPath(false)), false);
              dialog.on('new-path', function (e, relativePath) {
                if (relativePath) {
                  self.renameDirectory(directory, relativePath);
                  dialog.close();
                }
              });
              dialog.attach();
            })();
          }
        })();
      }
    }
  }, {
    key: 'renameFile',
    value: function renameFile(file, relativePath) {
      var self = this;

      var fullRelativePath = (0, _helperFormatJs.normalize)(file.getRoot().getPath(true) + relativePath);
      var fullLocalPath = (0, _helperFormatJs.normalize)(file.getRoot().getLocalPath(true) + relativePath, Path.sep);

      file.getConnector().rename(file.getPath(true) + file.name, fullRelativePath).then(function () {
        // Refresh cache
        file.getRoot().getFinderCache().renameFile((0, _helperFormatJs.normalize)(file.getPath(false) + file.name), (0, _helperFormatJs.normalize)(relativePath), file.size);

        // Add to tree
        var element = self.treeView.addFile(file.getRoot(), relativePath, { size: file.size, rights: file.rights });
        if (element.isVisible()) {
          element.select();
        }

        // Check if file is already opened in texteditor
        var found = (0, _helperHelperJs.getTextEditor)(file.getLocalPath(true) + file.name);
        if (found) {
          element.addClass('open');
          found.saveObject = element;
          found.saveAs(element.getLocalPath(true) + element.name);
        }

        // Move local file
        (0, _helperHelperJs.moveLocalPath)(file.getLocalPath(true) + file.name, fullLocalPath);

        // Remove old file from tree
        if (file) file.remove();
      })['catch'](function (err) {
        (0, _helperHelperJs.showMessage)(err.message, 'error');
      });
    }
  }, {
    key: 'renameDirectory',
    value: function renameDirectory(directory, relativePath) {
      var self = this;

      relativePath = (0, _helperFormatJs.trailingslashit)(relativePath);
      var fullRelativePath = (0, _helperFormatJs.normalize)(directory.getRoot().getPath(true) + relativePath);
      var fullLocalPath = (0, _helperFormatJs.normalize)(directory.getRoot().getLocalPath(true) + relativePath, Path.sep);

      directory.getConnector().rename(directory.getPath(), fullRelativePath).then(function () {
        // Refresh cache
        directory.getRoot().getFinderCache().renameDirectory((0, _helperFormatJs.normalize)(directory.getPath(false)), (0, _helperFormatJs.normalize)(relativePath + '/'));

        // Add to tree
        var element = self.treeView.addDirectory(directory.getRoot(), relativePath, { rights: directory.rights });
        if (element.isVisible()) {
          element.select();
        }

        // TODO
        // Check if files are already opened in texteditor

        // Move local directory
        (0, _helperHelperJs.moveLocalPath)(directory.getLocalPath(true), fullLocalPath);

        // Remove old directory from tree
        if (directory) directory.remove();
      })['catch'](function (err) {
        (0, _helperHelperJs.showMessage)(err.message, 'error');
      });
    }
  }, {
    key: 'duplicate',
    value: function duplicate() {
      var self = this;
      var selected = self.treeView.list.find('.selected');

      if (selected.length === 0) return;

      if (selected.view().is('.file')) {
        (function () {
          var file = selected.view();
          if (file) {
            (function () {
              var dialog = new _dialogsDuplicateDialog2['default'](file.getPath(false) + file.name);
              dialog.on('new-path', function (e, relativePath) {
                if (relativePath) {
                  self.duplicateFile(file, relativePath);
                  dialog.close();
                }
              });
              dialog.attach();
            })();
          }
        })();
      } else if (selected.view().is('.directory')) {
        // TODO
        // let directory = selected.view();
        // if (directory) {
        //   const dialog = new DuplicateDialog(trailingslashit(directory.getPath(false)));
        //   dialog.on('new-path', (e, relativePath) => {
        //     if (relativePath) {
        //       self.duplicateDirectory(directory, relativePath);
        //       dialog.close();
        //     }
        //   });
        //   dialog.attach();
        // }
      }
    }
  }, {
    key: 'duplicateFile',
    value: function duplicateFile(file, relativePath) {
      var self = this;

      var fullRelativePath = (0, _helperFormatJs.normalize)(file.getRoot().getPath(true) + relativePath);
      var fullLocalPath = (0, _helperFormatJs.normalize)(file.getRoot().getLocalPath(true) + relativePath, Path.sep);

      file.getConnector().existsFile(fullRelativePath).then(function () {
        (0, _helperHelperJs.showMessage)('File ' + relativePath.trim() + ' already exists', 'error');
      })['catch'](function () {
        self.downloadFile(file.getRoot(), file.getPath(true) + file.name, fullLocalPath, { filesize: file.size }).then(function () {
          self.uploadFile(file.getRoot(), fullLocalPath, fullRelativePath).then(function (duplicatedFile) {
            if (duplicatedFile) {
              // Open file and add handler to editor to upload file on save
              return self.openFileInEditor(duplicatedFile);
            }
          })['catch'](function (err) {
            (0, _helperHelperJs.showMessage)(err, 'error');
          });
        })['catch'](function (err) {
          (0, _helperHelperJs.showMessage)(err, 'error');
        });
      });
    }
  }, {
    key: 'duplicateDirectory',
    value: function duplicateDirectory(directory, relativePath) {
      var self = this;

      var fullRelativePath = (0, _helperFormatJs.normalize)(directory.getRoot().getPath(true) + relativePath);
      var fullLocalPath = (0, _helperFormatJs.normalize)(directory.getRoot().getLocalPath(true) + relativePath, Path.sep);

      // TODO
    }
  }, {
    key: 'delete',
    value: function _delete() {
      var self = this;
      var selected = self.treeView.list.find('.selected');

      if (selected.length === 0) return;

      if (selected.view().is('.file')) {
        (function () {
          var file = selected.view();
          if (file) {
            atom.confirm({
              message: 'Are you sure you want to delete this file?',
              detailedMessage: "You are deleting:\n" + file.getPath(false) + file.name,
              buttons: {
                Yes: function Yes() {
                  self.deleteFile(file);
                },
                Cancel: function Cancel() {
                  return true;
                }
              }
            });
          }
        })();
      } else if (selected.view().is('.directory')) {
        (function () {
          var directory = selected.view();
          if (directory) {
            atom.confirm({
              message: 'Are you sure you want to delete this folder?',
              detailedMessage: "You are deleting:\n" + (0, _helperFormatJs.trailingslashit)(directory.getPath(false)),
              buttons: {
                Yes: function Yes() {
                  self.deleteDirectory(directory, true);
                },
                Cancel: function Cancel() {
                  return true;
                }
              }
            });
          }
        })();
      }
    }
  }, {
    key: 'deleteFile',
    value: function deleteFile(file) {
      var self = this;

      var fullLocalPath = (0, _helperFormatJs.normalize)(file.getLocalPath(true) + file.name, Path.sep);

      file.getConnector().deleteFile(file.getPath(true) + file.name).then(function () {
        // Refresh cache
        file.getRoot().getFinderCache().deleteFile((0, _helperFormatJs.normalize)(file.getPath(false) + file.name));

        // Delete local file
        try {
          if (FileSystem.existsSync(fullLocalPath)) {
            FileSystem.unlinkSync(fullLocalPath);
          }
        } catch (err) {}

        file.parent.select();
        file.destroy();
      })['catch'](function (err) {
        (0, _helperHelperJs.showMessage)(err.message, 'error');
      });
    }
  }, {
    key: 'deleteDirectory',
    value: function deleteDirectory(directory, recursive) {
      var self = this;

      directory.getConnector().deleteDirectory(directory.getPath(), recursive).then(function () {
        // Refresh cache
        directory.getRoot().getFinderCache().deleteDirectory((0, _helperFormatJs.normalize)(directory.getPath(false)));

        var fullLocalPath = directory.getLocalPath(true).replace(/\/+/g, Path.sep);

        // Delete local directory
        (0, _helperHelperJs.deleteLocalPath)(fullLocalPath);

        directory.parent.select();
        directory.destroy();
      })['catch'](function (err) {
        (0, _helperHelperJs.showMessage)(err.message, 'error');
      });
    }
  }, {
    key: 'chmod',
    value: function chmod() {
      var self = this;
      var selected = self.treeView.list.find('.selected');

      if (selected.length === 0) return;

      if (selected.view().is('.file')) {
        (function () {
          var file = selected.view();
          if (file) {
            var permissionsView = new _viewsPermissionsView2['default'](file);
            permissionsView.on('change-permissions', function (e, result) {
              self.chmodFile(file, result.permissions);
            });
            permissionsView.attach();
          }
        })();
      } else if (selected.view().is('.directory')) {
        (function () {
          var directory = selected.view();
          if (directory) {
            var permissionsView = new _viewsPermissionsView2['default'](directory);
            permissionsView.on('change-permissions', function (e, result) {
              self.chmodDirectory(directory, result.permissions);
            });
            permissionsView.attach();
          }
        })();
      }
    }
  }, {
    key: 'chmodFile',
    value: function chmodFile(file, permissions) {
      var self = this;

      file.getConnector().chmodFile(file.getPath(true) + file.name, permissions).then(function (responseText) {
        file.rights = (0, _helperHelperJs.permissionsToRights)(permissions);
      })['catch'](function (err) {
        (0, _helperHelperJs.showMessage)(err.message, 'error');
      });
    }
  }, {
    key: 'chmodDirectory',
    value: function chmodDirectory(directory, permissions) {
      var self = this;

      directory.getConnector().chmodDirectory(directory.getPath(true), permissions).then(function (responseText) {
        directory.rights = (0, _helperHelperJs.permissionsToRights)(permissions);
      })['catch'](function (err) {
        (0, _helperHelperJs.showMessage)(err.message, 'error');
      });
    }
  }, {
    key: 'reload',
    value: function reload() {
      var self = this;
      var selected = self.treeView.list.find('.selected');

      if (selected.length === 0) return;

      if (selected.view().is('.file')) {
        var file = selected.view();
        if (file) {
          self.reloadFile(file);
        }
      } else if (selected.view().is('.directory') || selected.view().is('.server')) {
        var _directory2 = selected.view();
        if (_directory2) {
          self.reloadDirectory(_directory2);
        }
      }
    }
  }, {
    key: 'reloadFile',
    value: function reloadFile(file) {
      var self = this;

      var fullRelativePath = (0, _helperFormatJs.normalize)(file.getPath(true) + file.name);
      var fullLocalPath = (0, _helperFormatJs.normalize)(file.getLocalPath(true) + file.name, Path.sep);

      // Check if file is already opened in texteditor
      if ((0, _helperHelperJs.getTextEditor)(fullLocalPath, true)) {
        self.downloadFile(file.getRoot(), fullRelativePath, fullLocalPath, { filesize: file.size })['catch'](function (err) {
          (0, _helperHelperJs.showMessage)(err, 'error');
        });
      }
    }
  }, {
    key: 'reloadDirectory',
    value: function reloadDirectory(directory) {
      var self = this;

      directory.expanded = false;
      directory.expand();
    }
  }, {
    key: 'copy',
    value: function copy() {
      var self = this;
      var selected = self.treeView.list.find('.selected');

      if (selected.length === 0) return;
      if (!Storage.hasPassword()) return;

      var element = selected.view();
      if (element.is('.file')) {
        var storage = element.serialize();
        window.sessionStorage.removeItem('ftp-remote-edit:cutPath');
        window.sessionStorage['ftp-remote-edit:copyPath'] = (0, _helperSecureJs.encrypt)(Storage.getPassword(), JSON.stringify(storage));
      } else if (element.is('.directory')) {
        // TODO
      }
    }
  }, {
    key: 'cut',
    value: function cut() {
      var self = this;
      var selected = self.treeView.list.find('.selected');

      if (selected.length === 0) return;
      if (!Storage.hasPassword()) return;

      var element = selected.view();

      if (element.is('.file') || element.is('.directory')) {
        var storage = element.serialize();
        window.sessionStorage.removeItem('ftp-remote-edit:copyPath');
        window.sessionStorage['ftp-remote-edit:cutPath'] = (0, _helperSecureJs.encrypt)(Storage.getPassword(), JSON.stringify(storage));
      }
    }
  }, {
    key: 'paste',
    value: function paste() {
      var self = this;
      var selected = self.treeView.list.find('.selected');

      if (selected.length === 0) return;
      if (!Storage.hasPassword()) return;

      var destObject = selected.view();
      if (destObject.is('.file')) {
        destObject = destObject.parent;
      }

      var dataObject = null;
      var srcObject = null;
      var handleEvent = null;

      var srcType = null;
      var srcPath = null;
      var destPath = null;

      // Parse data from copy/cut/drag event
      if (window.sessionStorage['ftp-remote-edit:cutPath']) {
        // Cut event from Atom
        handleEvent = "cut";

        var cutObjectString = (0, _helperSecureJs.decrypt)(Storage.getPassword(), window.sessionStorage['ftp-remote-edit:cutPath']);
        dataObject = cutObjectString ? JSON.parse(cutObjectString) : null;

        var _find = self.treeView.list.find('#' + dataObject.id);
        if (!_find) return;

        srcObject = _find.view();
        if (!srcObject) return;

        if (srcObject.is('.directory')) {
          srcType = 'directory';
          srcPath = srcObject.getPath(true);
          destPath = destObject.getPath(true) + srcObject.name;
        } else {
          srcType = 'file';
          srcPath = srcObject.getPath(true) + srcObject.name;
          destPath = destObject.getPath(true) + srcObject.name;
        }

        // Check if copy/cut operation should be performed on the same server
        if (JSON.stringify(destObject.config) != JSON.stringify(srcObject.config)) return;

        window.sessionStorage.removeItem('ftp-remote-edit:cutPath');
        window.sessionStorage.removeItem('ftp-remote-edit:copyPath');
      } else if (window.sessionStorage['ftp-remote-edit:copyPath']) {
        // Copy event from Atom
        handleEvent = "copy";

        var copiedObjectString = (0, _helperSecureJs.decrypt)(Storage.getPassword(), window.sessionStorage['ftp-remote-edit:copyPath']);
        dataObject = copiedObjectString ? JSON.parse(copiedObjectString) : null;

        var _find2 = self.treeView.list.find('#' + dataObject.id);
        if (!_find2) return;

        srcObject = _find2.view();
        if (!srcObject) return;

        if (srcObject.is('.directory')) {
          srcType = 'directory';
          srcPath = srcObject.getPath(true);
          destPath = destObject.getPath(true) + srcObject.name;
        } else {
          srcType = 'file';
          srcPath = srcObject.getPath(true) + srcObject.name;
          destPath = destObject.getPath(true) + srcObject.name;
        }

        // Check if copy/cut operation should be performed on the same server
        if (JSON.stringify(destObject.config) != JSON.stringify(srcObject.config)) return;

        window.sessionStorage.removeItem('ftp-remote-edit:cutPath');
        window.sessionStorage.removeItem('ftp-remote-edit:copyPath');
      } else {
        return;
      }

      if (handleEvent == "cut") {
        if (srcType == 'directory') self.moveDirectory(destObject.getRoot(), srcPath, destPath);
        if (srcType == 'file') self.moveFile(destObject.getRoot(), srcPath, destPath);
      } else if (handleEvent == "copy") {
        if (srcType == 'directory') self.copyDirectory(destObject.getRoot(), srcPath, destPath);
        if (srcType == 'file') self.copyFile(destObject.getRoot(), srcPath, destPath, { filesize: srcObject.size });
      }
    }
  }, {
    key: 'drop',
    value: function drop(e) {
      var self = this;
      var selected = self.treeView.list.find('.selected');

      if (selected.length === 0) return;
      if (!Storage.hasPassword()) return;

      var destObject = selected.view();
      if (destObject.is('.file')) {
        destObject = destObject.parent;
      }

      var initialPath = undefined,
          initialName = undefined,
          initialType = undefined,
          ref = undefined;
      if (entry = e.target.closest('.entry')) {
        e.preventDefault();
        e.stopPropagation();

        if (!destObject.is('.directory') && !destObject.is('.server')) {
          return;
        }

        if (e.dataTransfer) {
          initialPath = e.dataTransfer.getData("initialPath");
          initialName = e.dataTransfer.getData("initialName");
          initialType = e.dataTransfer.getData("initialType");
        } else {
          initialPath = e.originalEvent.dataTransfer.getData("initialPath");
          initialName = e.originalEvent.dataTransfer.getData("initialName");
          initialType = e.originalEvent.dataTransfer.getData("initialType");
        }

        if (initialType == "directory") {
          if ((0, _helperFormatJs.normalize)(initialPath) == (0, _helperFormatJs.normalize)(destObject.getPath(false) + initialName + '/')) return;
        } else if (initialType == "file") {
          if ((0, _helperFormatJs.normalize)(initialPath) == (0, _helperFormatJs.normalize)(destObject.getPath(false) + initialName)) return;
        }

        if (initialPath) {
          // Drop event from Atom
          if (initialType == "directory") {
            var srcPath = (0, _helperFormatJs.trailingslashit)(destObject.getRoot().getPath(true)) + initialPath;
            var destPath = destObject.getPath(true) + initialName + '/';
            self.moveDirectory(destObject.getRoot(), srcPath, destPath);
          } else if (initialType == "file") {
            var srcPath = (0, _helperFormatJs.trailingslashit)(destObject.getRoot().getPath(true)) + initialPath;
            var destPath = destObject.getPath(true) + initialName;
            self.moveFile(destObject.getRoot(), srcPath, destPath);
          }
        } else {
          // Drop event from OS
          if (e.dataTransfer) {
            ref = e.dataTransfer.files;
          } else {
            ref = e.originalEvent.dataTransfer.files;
          }

          for (var i = 0, len = ref.length; i < len; i++) {
            var file = ref[i];
            var srcPath = file.path;
            var destPath = destObject.getPath(true) + (0, _helperFormatJs.basename)(file.path, Path.sep);

            if (FileSystem.statSync(file.path).isDirectory()) {
              self.uploadDirectory(destObject.getRoot(), srcPath, destPath)['catch'](function (err) {
                (0, _helperHelperJs.showMessage)(err, 'error');
              });
            } else {
              self.uploadFile(destObject.getRoot(), srcPath, destPath)['catch'](function (err) {
                (0, _helperHelperJs.showMessage)(err, 'error');
              });
            }
          }
        }
      }
    }
  }, {
    key: 'upload',
    value: function upload(type) {
      var self = this;
      var selected = self.treeView.list.find('.selected');

      if (selected.length === 0) return;
      if (!Storage.hasPassword()) return;

      var destObject = selected.view();
      if (destObject.is('.file')) {
        destObject = destObject.parent;
      }

      var defaultPath = atom.config.get('ftp-remote-edit.transfer.defaultUploadPath') || 'desktop';
      if (defaultPath == 'project') {
        var projects = atom.project.getPaths();
        defaultPath = projects.shift();
      } else if (defaultPath == 'desktop') {
        defaultPath = Electron.remote.app.getPath("desktop");
      } else if (defaultPath == 'downloads') {
        defaultPath = Electron.remote.app.getPath("downloads");
      }
      var srcPath = null;
      var destPath = null;

      if (type == 'file') {
        Electron.remote.dialog.showOpenDialog(null, { title: 'Select file(s) for upload...', defaultPath: defaultPath, buttonLabel: 'Upload', properties: ['openFile', 'multiSelections', 'showHiddenFiles'] }, function (filePaths, bookmarks) {
          if (filePaths) {
            Promise.all(filePaths.map(function (filePath) {
              srcPath = filePath;
              destPath = destObject.getPath(true) + (0, _helperFormatJs.basename)(filePath, Path.sep);
              return self.uploadFile(destObject.getRoot(), srcPath, destPath);
            })).then(function () {
              (0, _helperHelperJs.showMessage)('File(s) has been uploaded to: \r \n' + filePaths.join('\r \n'), 'success');
            })['catch'](function (err) {
              (0, _helperHelperJs.showMessage)(err, 'error');
            });
          }
        });
      } else if (type == 'directory') {
        Electron.remote.dialog.showOpenDialog(null, { title: 'Select directory for upload...', defaultPath: defaultPath, buttonLabel: 'Upload', properties: ['openDirectory', 'showHiddenFiles'] }, function (directoryPaths, bookmarks) {
          if (directoryPaths) {
            directoryPaths.forEach(function (directoryPath, index) {
              srcPath = directoryPath;
              destPath = destObject.getPath(true) + (0, _helperFormatJs.basename)(directoryPath, Path.sep);

              self.uploadDirectory(destObject.getRoot(), srcPath, destPath).then(function () {
                (0, _helperHelperJs.showMessage)('Directory has been uploaded to ' + destPath, 'success');
              })['catch'](function (err) {
                (0, _helperHelperJs.showMessage)(err, 'error');
              });
            });
          }
        });
      }
    }
  }, {
    key: 'download',
    value: function download() {
      var self = this;
      var selected = self.treeView.list.find('.selected');

      if (selected.length === 0) return;
      if (!Storage.hasPassword()) return;

      var defaultPath = atom.config.get('ftp-remote-edit.transfer.defaultDownloadPath') || 'downloads';
      if (defaultPath == 'project') {
        var projects = atom.project.getPaths();
        defaultPath = projects.shift();
      } else if (defaultPath == 'desktop') {
        defaultPath = Electron.remote.app.getPath("desktop");
      } else if (defaultPath == 'downloads') {
        defaultPath = Electron.remote.app.getPath("downloads");
      }

      if (selected.view().is('.file')) {
        (function () {
          var file = selected.view();
          if (file) {
            (function () {
              var srcPath = (0, _helperFormatJs.normalize)(file.getPath(true) + file.name);

              Electron.remote.dialog.showSaveDialog(null, { defaultPath: defaultPath + "/" + file.name }, function (destPath) {
                if (destPath) {
                  self.downloadFile(file.getRoot(), srcPath, destPath, { filesize: file.size }).then(function () {
                    (0, _helperHelperJs.showMessage)('File has been downloaded to ' + destPath, 'success');
                  })['catch'](function (err) {
                    (0, _helperHelperJs.showMessage)(err, 'error');
                  });
                }
              });
            })();
          }
        })();
      } else if (selected.view().is('.directory')) {
        (function () {
          var directory = selected.view();
          if (directory) {
            (function () {
              var srcPath = (0, _helperFormatJs.normalize)(directory.getPath(true));

              Electron.remote.dialog.showSaveDialog(null, { defaultPath: defaultPath + "/" + directory.name }, function (destPath) {
                if (destPath) {
                  self.downloadDirectory(directory.getRoot(), srcPath, destPath).then(function () {
                    (0, _helperHelperJs.showMessage)('Directory has been downloaded to ' + destPath, 'success');
                  })['catch'](function (err) {
                    (0, _helperHelperJs.showMessage)(err, 'error');
                  });
                }
              });
            })();
          }
        })();
      } else if (selected.view().is('.server')) {
        (function () {
          var server = selected.view();
          if (server) {
            (function () {
              var srcPath = (0, _helperFormatJs.normalize)(server.getPath(true));

              Electron.remote.dialog.showSaveDialog(null, { defaultPath: defaultPath + "/" }, function (destPath) {
                if (destPath) {
                  self.downloadDirectory(server, srcPath, destPath).then(function () {
                    (0, _helperHelperJs.showMessage)('Directory has been downloaded to ' + destPath, 'success');
                  })['catch'](function (err) {
                    (0, _helperHelperJs.showMessage)(err, 'error');
                  });
                }
              });
            })();
          }
        })();
      }
    }
  }, {
    key: 'moveFile',
    value: function moveFile(server, srcPath, destPath) {
      var self = this;

      if ((0, _helperFormatJs.normalize)(srcPath) == (0, _helperFormatJs.normalize)(destPath)) return;

      server.getConnector().existsFile(destPath).then(function (result) {
        return new Promise(function (resolve, reject) {
          atom.confirm({
            message: 'File already exists. Are you sure you want to overwrite this file?',
            detailedMessage: "You are overwrite:\n" + destPath.trim(),
            buttons: {
              Yes: function Yes() {
                server.getConnector().deleteFile(destPath).then(function () {
                  reject(true);
                })['catch'](function (err) {
                  (0, _helperHelperJs.showMessage)(err.message, 'error');
                  resolve(false);
                });
              },
              Cancel: function Cancel() {
                resolve(false);
              }
            }
          });
        });
      })['catch'](function () {
        server.getConnector().rename(srcPath, destPath).then(function () {
          // get info from old object
          var oldObject = self.treeView.findElementByPath(server, (0, _helperFormatJs.trailingslashit)(srcPath.replace(server.config.remote, '')));
          var cachePath = (0, _helperFormatJs.normalize)(destPath.replace(server.getRoot().config.remote, '/'));

          // Add to tree
          var element = self.treeView.addFile(server, cachePath, { size: oldObject ? oldObject.size : null, rights: oldObject ? oldObject.rights : null });
          if (element.isVisible()) {
            element.select();
          }

          // Refresh cache
          server.getFinderCache().renameFile((0, _helperFormatJs.normalize)(srcPath.replace(server.config.remote, '/')), (0, _helperFormatJs.normalize)(destPath.replace(server.config.remote, '/')), oldObject ? oldObject.size : 0);

          if (oldObject) {
            // Check if file is already opened in texteditor
            var found = (0, _helperHelperJs.getTextEditor)(oldObject.getLocalPath(true) + oldObject.name);
            if (found) {
              element.addClass('open');
              found.saveObject = element;
              found.saveAs(element.getLocalPath(true) + element.name);
            }

            // Move local file
            (0, _helperHelperJs.moveLocalPath)(oldObject.getLocalPath(true) + oldObject.name, element.getLocalPath(true) + element.name);

            // Remove old object
            oldObject.remove();
          }
        })['catch'](function (err) {
          (0, _helperHelperJs.showMessage)(err.message, 'error');
        });
      });
    }
  }, {
    key: 'moveDirectory',
    value: function moveDirectory(server, srcPath, destPath) {
      var self = this;

      initialPath = (0, _helperFormatJs.trailingslashit)(srcPath);
      destPath = (0, _helperFormatJs.trailingslashit)(destPath);

      if ((0, _helperFormatJs.normalize)(srcPath) == (0, _helperFormatJs.normalize)(destPath)) return;

      server.getConnector().existsDirectory(destPath).then(function (result) {
        return new Promise(function (resolve, reject) {
          atom.confirm({
            message: 'Directory already exists. Are you sure you want to overwrite this directory?',
            detailedMessage: "You are overwrite:\n" + destPath.trim(),
            buttons: {
              Yes: function Yes() {
                server.getConnector().deleteDirectory(destPath, recursive).then(function () {
                  reject(true);
                })['catch'](function (err) {
                  (0, _helperHelperJs.showMessage)(err.message, 'error');
                  resolve(false);
                });
              },
              Cancel: function Cancel() {
                resolve(false);
              }
            }
          });
        });
      })['catch'](function () {
        server.getConnector().rename(srcPath, destPath).then(function () {
          // get info from old object
          var oldObject = self.treeView.findElementByPath(server, (0, _helperFormatJs.trailingslashit)(srcPath.replace(server.config.remote, '')));
          var cachePath = (0, _helperFormatJs.normalize)(destPath.replace(server.getRoot().config.remote, '/'));

          // Add to tree
          var element = self.treeView.addDirectory(server.getRoot(), cachePath, { size: oldObject ? oldObject.size : null, rights: oldObject ? oldObject.rights : null });
          if (element.isVisible()) {
            element.select();
          }

          // Refresh cache
          server.getFinderCache().renameDirectory((0, _helperFormatJs.normalize)(srcPath.replace(server.config.remote, '/')), (0, _helperFormatJs.normalize)(destPath.replace(server.config.remote, '/')));

          if (oldObject) {
            // TODO
            // Check if file is already opened in texteditor

            // Move local file
            (0, _helperHelperJs.moveLocalPath)(oldObject.getLocalPath(true), element.getLocalPath(true));

            // Remove old object
            if (oldObject) oldObject.remove();
          }
        })['catch'](function (err) {
          (0, _helperHelperJs.showMessage)(err.message, 'error');
        });
      });
    }
  }, {
    key: 'copyFile',
    value: function copyFile(server, srcPath, destPath) {
      var param = arguments.length <= 3 || arguments[3] === undefined ? {} : arguments[3];

      var self = this;

      var srcLocalPath = (0, _helperFormatJs.normalize)(server.getLocalPath(false) + srcPath, Path.sep);
      var destLocalPath = (0, _helperFormatJs.normalize)(server.getLocalPath(false) + destPath, Path.sep);

      // Rename file if exists
      if (srcPath == destPath) {
        var _ret19 = (function () {
          var originalPath = (0, _helperFormatJs.normalize)(destPath);
          var parentPath = (0, _helperFormatJs.normalize)((0, _helperFormatJs.dirname)(destPath));

          server.getConnector().listDirectory(parentPath).then(function (list) {
            var files = [];
            var fileList = list.filter(function (item) {
              return item.type === '-';
            });

            fileList.forEach(function (element) {
              files.push(element.name);
            });

            var filePath = undefined;
            var fileCounter = 0;
            var extension = (0, _helperHelperJs.getFullExtension)(originalPath);

            // append a number to the file if an item with the same name exists
            while (files.includes((0, _helperFormatJs.basename)(destPath))) {
              filePath = Path.dirname(originalPath) + '/' + Path.basename(originalPath, extension);
              destPath = filePath + fileCounter + extension;
              fileCounter += 1;
            }

            self.copyFile(server, srcPath, destPath);
          })['catch'](function (err) {
            (0, _helperHelperJs.showMessage)(err.message, 'error');
          });

          return {
            v: undefined
          };
        })();

        if (typeof _ret19 === 'object') return _ret19.v;
      }

      server.getConnector().existsFile(destPath).then(function (result) {
        return new Promise(function (resolve, reject) {
          atom.confirm({
            message: 'File already exists. Are you sure you want to overwrite this file?',
            detailedMessage: "You are overwrite:\n" + destPath.trim(),
            buttons: {
              Yes: function Yes() {
                fileexists = true;
                reject(true);
              },
              Cancel: function Cancel() {
                resolve(false);
              }
            }
          });
        });
      })['catch'](function () {
        // Create local Directories
        (0, _helperHelperJs.createLocalPath)(srcLocalPath);
        (0, _helperHelperJs.createLocalPath)(destLocalPath);

        self.downloadFile(server, srcPath, destLocalPath, param).then(function () {
          self.uploadFile(server, destLocalPath, destPath).then(function (duplicatedFile) {
            if (duplicatedFile) {
              // Open file and add handler to editor to upload file on save
              return self.openFileInEditor(duplicatedFile);
            }
          })['catch'](function (err) {
            (0, _helperHelperJs.showMessage)(err, 'error');
          });
        })['catch'](function (err) {
          (0, _helperHelperJs.showMessage)(err, 'error');
        });
      });
    }
  }, {
    key: 'copyDirectory',
    value: function copyDirectory(server, srcPath, destPath) {
      var self = this;

      if ((0, _helperFormatJs.normalize)(srcPath) == (0, _helperFormatJs.normalize)(destPath)) return;

      // TODO
      console.log('TODO copy', srcPath, destPath);
    }
  }, {
    key: 'uploadFile',
    value: function uploadFile(server, srcPath, destPath) {
      var checkFileExists = arguments.length <= 3 || arguments[3] === undefined ? true : arguments[3];

      var self = this;

      if (checkFileExists) {
        var promise = new Promise(function (resolve, reject) {
          return server.getConnector().existsFile(destPath).then(function (result) {
            var cachePath = (0, _helperFormatJs.normalize)(destPath.replace(server.getRoot().config.remote, '/'));

            return new Promise(function (resolve, reject) {
              atom.confirm({
                message: 'File already exists. Are you sure you want to overwrite this file?',
                detailedMessage: "You are overwrite:\n" + cachePath,
                buttons: {
                  Yes: function Yes() {
                    server.getConnector().deleteFile(destPath).then(function () {
                      reject(true);
                    })['catch'](function (err) {
                      (0, _helperHelperJs.showMessage)(err.message, 'error');
                      resolve(false);
                    });
                  },
                  Cancel: function Cancel() {
                    resolve(false);
                  }
                }
              });
            });
          })['catch'](function (err) {
            var filestat = FileSystem.statSync(srcPath);

            var pathOnFileSystem = (0, _helperFormatJs.normalize)((0, _helperFormatJs.trailingslashit)(srcPath), Path.sep);
            var foundInTreeView = self.treeView.findElementByLocalPath(pathOnFileSystem);
            if (foundInTreeView) {
              // Add sync icon
              foundInTreeView.addSyncIcon();
            }

            // Add to Upload Queue
            var queueItem = Queue.addFile({
              direction: "upload",
              remotePath: destPath,
              localPath: srcPath,
              size: filestat.size
            });

            return server.getConnector().uploadFile(queueItem, 1).then(function () {
              var cachePath = (0, _helperFormatJs.normalize)(destPath.replace(server.getRoot().config.remote, '/'));

              // Add to tree
              var element = self.treeView.addFile(server.getRoot(), cachePath, { size: filestat.size });
              if (element.isVisible()) {
                element.select();
              }

              // Refresh cache
              server.getRoot().getFinderCache().deleteFile((0, _helperFormatJs.normalize)(cachePath));
              server.getRoot().getFinderCache().addFile((0, _helperFormatJs.normalize)(cachePath), filestat.size);

              if (foundInTreeView) {
                // Remove sync icon
                foundInTreeView.removeSyncIcon();
              }

              resolve(element);
            })['catch'](function (err) {
              queueItem.changeStatus('Error');

              if (foundInTreeView) {
                // Remove sync icon
                foundInTreeView.removeSyncIcon();
              }

              reject(err);
            });
          });
        });

        return promise;
      } else {
        var promise = new Promise(function (resolve, reject) {
          var filestat = FileSystem.statSync(srcPath);

          var pathOnFileSystem = (0, _helperFormatJs.normalize)((0, _helperFormatJs.trailingslashit)(srcPath), Path.sep);
          var foundInTreeView = self.treeView.findElementByLocalPath(pathOnFileSystem);
          if (foundInTreeView) {
            // Add sync icon
            foundInTreeView.addSyncIcon();
          }

          // Add to Upload Queue
          var queueItem = Queue.addFile({
            direction: "upload",
            remotePath: destPath,
            localPath: srcPath,
            size: filestat.size
          });

          return server.getConnector().uploadFile(queueItem, 1).then(function () {
            var cachePath = (0, _helperFormatJs.normalize)(destPath.replace(server.getRoot().config.remote, '/'));

            // Add to tree
            var element = self.treeView.addFile(server.getRoot(), cachePath, { size: filestat.size });
            if (element.isVisible()) {
              element.select();
            }

            // Refresh cache
            server.getRoot().getFinderCache().deleteFile((0, _helperFormatJs.normalize)(cachePath));
            server.getRoot().getFinderCache().addFile((0, _helperFormatJs.normalize)(cachePath), filestat.size);

            if (foundInTreeView) {
              // Remove sync icon
              foundInTreeView.removeSyncIcon();
            }

            resolve(element);
          })['catch'](function (err) {
            queueItem.changeStatus('Error');

            if (foundInTreeView) {
              // Remove sync icon
              foundInTreeView.removeSyncIcon();
            }

            reject(err);
          });
        });

        return promise;
      }
    }
  }, {
    key: 'uploadDirectory',
    value: function uploadDirectory(server, srcPath, destPath) {
      var self = this;

      return new Promise(function (resolve, reject) {
        FileSystem.listTreeSync(srcPath).filter(function (path) {
          return FileSystem.isFileSync(path);
        }).reduce(function (prevPromise, path) {
          return prevPromise.then(function () {
            return self.uploadFile(server, path, (0, _helperFormatJs.normalize)(destPath + '/' + path.replace(srcPath, '/'), '/'));
          });
        }, Promise.resolve()).then(function () {
          return resolve();
        })['catch'](function (error) {
          return reject(error);
        });
      });
    }
  }, {
    key: 'downloadFile',
    value: function downloadFile(server, srcPath, destPath) {
      var param = arguments.length <= 3 || arguments[3] === undefined ? {} : arguments[3];

      var self = this;

      var promise = new Promise(function (resolve, reject) {
        // Check if file is already in Queue
        if (Queue.existsFile(destPath)) {
          return reject(false);
        }

        var pathOnFileSystem = (0, _helperFormatJs.normalize)((0, _helperFormatJs.trailingslashit)(server.getLocalPath(false) + srcPath), Path.sep);
        var foundInTreeView = self.treeView.findElementByLocalPath(pathOnFileSystem);
        if (foundInTreeView) {
          // Add sync icon
          foundInTreeView.addSyncIcon();
        }

        // Create local Directories
        (0, _helperHelperJs.createLocalPath)(destPath);

        // Add to Download Queue
        var queueItem = Queue.addFile({
          direction: "download",
          remotePath: srcPath,
          localPath: destPath,
          size: param.filesize ? param.filesize : 0
        });

        // Download file
        server.getConnector().downloadFile(queueItem).then(function () {
          if (foundInTreeView) {
            // Remove sync icon
            foundInTreeView.removeSyncIcon();
          }

          resolve(true);
        })['catch'](function (err) {
          queueItem.changeStatus('Error');

          if (foundInTreeView) {
            // Remove sync icon
            foundInTreeView.removeSyncIcon();
          }

          reject(err);
        });
      });

      return promise;
    }
  }, {
    key: 'downloadDirectory',
    value: function downloadDirectory(server, srcPath, destPath) {
      var self = this;

      var scanDir = function scanDir(path) {
        return server.getConnector().listDirectory(path).then(function (list) {
          var files = list.filter(function (item) {
            return item.type === '-';
          }).map(function (item) {
            item.path = (0, _helperFormatJs.normalize)(path + '/' + item.name);
            return item;
          });
          var dirs = list.filter(function (item) {
            return item.type === 'd' && item.name !== '.' && item.name !== '..';
          }).map(function (item) {
            item.path = (0, _helperFormatJs.normalize)(path + '/' + item.name);
            return item;
          });

          return dirs.reduce(function (prevPromise, dir) {
            return prevPromise.then(function (output) {
              return scanDir((0, _helperFormatJs.normalize)(dir.path)).then(function (files) {
                return output.concat(files);
              });
            });
          }, Promise.resolve(files));
        });
      };

      return scanDir(srcPath).then(function (files) {
        try {
          if (!FileSystem.existsSync(destPath)) {
            FileSystem.mkdirSync(destPath);
          }
        } catch (error) {
          return Promise.reject(error);
        }

        return new Promise(function (resolve, reject) {
          files.reduce(function (prevPromise, file) {
            return prevPromise.then(function () {
              return self.downloadFile(server, file.path, (0, _helperFormatJs.normalize)(destPath + Path.sep + file.path.replace(srcPath, '/'), Path.sep), { filesize: file.size });
            });
          }, Promise.resolve()).then(function () {
            return resolve();
          })['catch'](function (error) {
            return reject(error);
          });
        });
      })['catch'](function (error) {
        return Promise.reject(error);
      });
    }
  }, {
    key: 'findRemotePath',
    value: function findRemotePath() {
      var self = this;
      var selected = self.treeView.list.find('.selected');

      if (selected.length === 0) return;

      var dialog = new _dialogsFindDialogJs2['default']('/', false);
      dialog.on('find-path', function (e, relativePath) {
        if (relativePath) {
          relativePath = (0, _helperFormatJs.normalize)(relativePath);

          var root = selected.view().getRoot();

          // Remove initial path if exists
          if (root.config.remote) {
            if (relativePath.startsWith(root.config.remote)) {
              relativePath = relativePath.replace(root.config.remote, "");
            }
          }

          self.treeView.expand(root, relativePath)['catch'](function (err) {
            (0, _helperHelperJs.showMessage)(err, 'error');
          });

          dialog.close();
        }
      });
      dialog.attach();
    }
  }, {
    key: 'copyRemotePath',
    value: function copyRemotePath() {
      var self = this;
      var selected = self.treeView.list.find('.selected');

      if (selected.length === 0) return;

      var element = selected.view();
      if (element.is('.directory')) {
        pathToCopy = element.getPath(true);
      } else {
        pathToCopy = element.getPath(true) + element.name;
      }
      atom.clipboard.write(pathToCopy);
    }
  }, {
    key: 'remotePathFinder',
    value: function remotePathFinder() {
      var reindex = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

      var self = this;
      var selected = self.treeView.list.find('.selected');

      if (selected.length === 0) return;

      var root = selected.view().getRoot();
      var itemsCache = root.getFinderCache();

      if (self.finderView == null) {
        self.finderView = new _viewsFinderView2['default'](self.treeView);

        self.finderView.on('ftp-remote-edit-finder:open', function (item) {
          var relativePath = item.relativePath;
          var localPath = (0, _helperFormatJs.normalize)(self.finderView.root.getLocalPath() + relativePath, Path.sep);
          var file = self.treeView.getElementByLocalPath(localPath, self.finderView.root, 'file');
          file.size = item.size;

          if (file) self.openFile(file);
        });

        self.finderView.on('ftp-remote-edit-finder:hide', function () {
          itemsCache.loadTask = false;
        });
      }
      self.finderView.root = root;
      self.finderView.selectListView.update({ items: itemsCache.items });

      var index = function index(items) {
        self.finderView.selectListView.update({ items: items, errorMessage: '', loadingMessage: 'Indexing…' + items.length });
      };
      itemsCache.removeListener('finder-items-cache-queue:index', index);
      itemsCache.on('finder-items-cache-queue:index', index);

      var update = function update(items) {
        self.finderView.selectListView.update({ items: items, errorMessage: '', loadingMessage: '' });
      };
      itemsCache.removeListener('finder-items-cache-queue:update', update);
      itemsCache.on('finder-items-cache-queue:update', update);

      var finish = function finish(items) {
        self.finderView.selectListView.update({ items: items, errorMessage: '', loadingMessage: '' });
      };
      itemsCache.removeListener('finder-items-cache-queue:finish', finish);
      itemsCache.on('finder-items-cache-queue:finish', finish);

      var error = function error(err) {
        self.finderView.selectListView.update({ errorMessage: 'Error: ' + err.message });
      };
      itemsCache.removeListener('finder-items-cache-queue:error', error);
      itemsCache.on('finder-items-cache-queue:error', error);

      itemsCache.load(reindex);
      self.finderView.toggle();
    }
  }, {
    key: 'autoRevealActiveFile',
    value: function autoRevealActiveFile() {
      var self = this;

      if (atom.config.get('ftp-remote-edit.tree.autoRevealActiveFile')) {
        if (self.treeView.isVisible()) {
          var editor = atom.workspace.getActiveTextEditor();

          if (editor && editor.getPath()) {
            var pathOnFileSystem = (0, _helperFormatJs.normalize)((0, _helperFormatJs.trailingslashit)(editor.getPath()), Path.sep);

            var _entry = self.treeView.findElementByLocalPath(pathOnFileSystem);
            if (_entry && _entry.isVisible()) {
              _entry.select();
              self.treeView.remoteKeyboardNavigationMovePage();
            }
          }
        }
      }
    }
  }, {
    key: 'openFileInEditor',
    value: function openFileInEditor(file, pending) {
      var self = this;

      return atom.workspace.open((0, _helperFormatJs.normalize)(file.getLocalPath(true) + file.name, Path.sep), { pending: pending, searchAllPanes: true }).then(function (editor) {
        editor.saveObject = file;
        editor.saveObject.addClass('open');

        try {
          // Save file on remote server
          editor.onDidSave(function (saveObject) {
            if (!editor.saveObject) return;

            // Get filesize
            var filestat = FileSystem.statSync(editor.getPath(true));
            editor.saveObject.size = filestat.size;
            editor.saveObject.attr('data-size', filestat.size);

            var srcPath = editor.saveObject.getLocalPath(true) + editor.saveObject.name;
            var destPath = editor.saveObject.getPath(true) + editor.saveObject.name;
            self.uploadFile(editor.saveObject.getRoot(), srcPath, destPath, false).then(function (duplicatedFile) {
              if (duplicatedFile) {
                if (atom.config.get('ftp-remote-edit.notifications.showNotificationOnUpload')) {
                  (0, _helperHelperJs.showMessage)('File successfully uploaded.', 'success');
                }
              }
            });
          });

          editor.onDidDestroy(function () {
            if (!editor.saveObject) return;

            editor.saveObject.removeClass('open');
          });
        } catch (err) {}
      })['catch'](function (err) {
        (0, _helperHelperJs.showMessage)(err.message, 'error');
      });
    }
  }]);

  return FtpRemoteEdit;
})();

exports['default'] = new FtpRemoteEdit();
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2FuYW5tYXlqYWluLy5hdG9tL3BhY2thZ2VzL2Z0cC1yZW1vdGUtZWRpdC9saWIvZnRwLXJlbW90ZS1lZGl0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7c0NBRThCLDRCQUE0Qjs7OztvQ0FDOUIsMEJBQTBCOzs7OzZCQUNqQyxtQkFBbUI7Ozs7aUNBQ2YsdUJBQXVCOzs7OytCQUN6QixxQkFBcUI7Ozs7eUNBRWYsaUNBQWlDOzs7O3lDQUNqQyxpQ0FBaUM7Ozs7a0NBQ3hDLHlCQUF5Qjs7OztxQ0FDdEIsNEJBQTRCOzs7O21DQUM5QiwwQkFBMEI7Ozs7c0NBQ3JCLDRCQUE0Qjs7OztvQkFFSSxNQUFNOzs4QkFDOEYsb0JBQW9COzs4QkFDakUsb0JBQW9COzs4QkFDTSxvQkFBb0I7O0FBbEJqSyxXQUFXLENBQUM7O0FBb0JaLElBQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyw2QkFBNkIsQ0FBQyxDQUFDO0FBQ3RELElBQU0sYUFBYSxHQUFHLE9BQU8sQ0FBQyw2QkFBNkIsQ0FBQyxDQUFDOztBQUU3RCxJQUFNLElBQUksR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDO0FBQ3pCLElBQU0sUUFBUSxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUNyQyxJQUFNLElBQUksR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDN0IsSUFBTSxVQUFVLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ3RDLElBQU0sZUFBZSxHQUFHLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO0FBQ3BELElBQU0sS0FBSyxHQUFHLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO0FBQzNDLElBQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDOztBQUUvQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsWUFBWSxDQUFDLG1CQUFtQixHQUFHLENBQUMsQ0FBQzs7SUFFakQsYUFBYTtBQUVOLFdBRlAsYUFB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LENBQUMsR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQztBQUMxRSxnQkFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQUMsY0FBYyxFQUFLO0FBQzlGLGtCQUFJLGNBQWMsRUFBRTtBQUNsQixvQkFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyx3REFBd0QsQ0FBQyxFQUFFO0FBQzdFLG1EQUFZLDZCQUE2QixFQUFFLFNBQVMsQ0FBQyxDQUFDO2lCQUN2RDtlQUNGO2FBQ0YsQ0FBQyxDQUFDO1dBQ0osQ0FBQyxDQUFDOztBQUVILGdCQUFNLENBQUMsWUFBWSxDQUFDLFlBQU07QUFDeEIsZ0JBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFLE9BQU87O0FBRS9CLGtCQUFNLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQztXQUN2QyxDQUFDLENBQUM7U0FDSixDQUFDLE9BQU8sR0FBRyxFQUFFLEVBQUc7T0FDbEIsQ0FBQyxTQUFNLENBQUMsVUFBQyxHQUFHLEVBQUs7QUFDaEIseUNBQVksR0FBRyxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztPQUNuQyxDQUFDLENBQUM7S0FDSjs7O1NBejBERyxhQUFhOzs7cUJBNDBESixJQUFJLGFBQWEsRUFBRSIsImZpbGUiOiIvaG9tZS9hbmFubWF5amFpbi8uYXRvbS9wYWNrYWdlcy9mdHAtcmVtb3RlLWVkaXQvbGliL2Z0cC1yZW1vdGUtZWRpdC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG5pbXBvcnQgQ29uZmlndXJhdGlvblZpZXcgZnJvbSAnLi92aWV3cy9jb25maWd1cmF0aW9uLXZpZXcnO1xuaW1wb3J0IFBlcm1pc3Npb25zVmlldyBmcm9tICcuL3ZpZXdzL3Blcm1pc3Npb25zLXZpZXcnO1xuaW1wb3J0IFRyZWVWaWV3IGZyb20gJy4vdmlld3MvdHJlZS12aWV3JztcbmltcG9ydCBQcm90b2NvbFZpZXcgZnJvbSAnLi92aWV3cy9wcm90b2NvbC12aWV3JztcbmltcG9ydCBGaW5kZXJWaWV3IGZyb20gJy4vdmlld3MvZmluZGVyLXZpZXcnO1xuXG5pbXBvcnQgQ2hhbmdlUGFzc0RpYWxvZyBmcm9tICcuL2RpYWxvZ3MvY2hhbmdlLXBhc3MtZGlhbG9nLmpzJztcbmltcG9ydCBQcm9tcHRQYXNzRGlhbG9nIGZyb20gJy4vZGlhbG9ncy9wcm9tcHQtcGFzcy1kaWFsb2cuanMnO1xuaW1wb3J0IEFkZERpYWxvZyBmcm9tICcuL2RpYWxvZ3MvYWRkLWRpYWxvZy5qcyc7XG5pbXBvcnQgUmVuYW1lRGlhbG9nIGZyb20gJy4vZGlhbG9ncy9yZW5hbWUtZGlhbG9nLmpzJztcbmltcG9ydCBGaW5kRGlhbG9nIGZyb20gJy4vZGlhbG9ncy9maW5kLWRpYWxvZy5qcyc7XG5pbXBvcnQgRHVwbGljYXRlRGlhbG9nIGZyb20gJy4vZGlhbG9ncy9kdXBsaWNhdGUtZGlhbG9nJztcblxuaW1wb3J0IHsgQ29tcG9zaXRlRGlzcG9zYWJsZSwgRGlzcG9zYWJsZSwgVGV4dEVkaXRvciB9IGZyb20gJ2F0b20nO1xuaW1wb3J0IHsgZGVjcnlwdCwgZW5jcnlwdCwgY2hlY2tQYXNzd29yZEV4aXN0cywgY2hlY2tQYXNzd29yZCwgc2V0UGFzc3dvcmQsIGNoYW5nZVBhc3N3b3JkLCBpc0luV2hpdGVMaXN0LCBpc0luQmxhY2tMaXN0LCBhZGRUb1doaXRlTGlzdCwgYWRkVG9CbGFja0xpc3QgfSBmcm9tICcuL2hlbHBlci9zZWN1cmUuanMnO1xuaW1wb3J0IHsgYmFzZW5hbWUsIGRpcm5hbWUsIHRyYWlsaW5nc2xhc2hpdCwgdW50cmFpbGluZ3NsYXNoaXQsIGxlYWRpbmdzbGFzaGl0LCB1bmxlYWRpbmdzbGFzaGl0LCBub3JtYWxpemUgfSBmcm9tICcuL2hlbHBlci9mb3JtYXQuanMnO1xuaW1wb3J0IHsgbG9nRGVidWcsIHNob3dNZXNzYWdlLCBnZXRGdWxsRXh0ZW5zaW9uLCBjcmVhdGVMb2NhbFBhdGgsIGRlbGV0ZUxvY2FsUGF0aCwgbW92ZUxvY2FsUGF0aCwgZ2V0VGV4dEVkaXRvciwgcGVybWlzc2lvbnNUb1JpZ2h0cyB9IGZyb20gJy4vaGVscGVyL2hlbHBlci5qcyc7XG5cbmNvbnN0IGNvbmZpZyA9IHJlcXVpcmUoJy4vY29uZmlnL2NvbmZpZy1zY2hlbWEuanNvbicpO1xuY29uc3Qgc2VydmVyX2NvbmZpZyA9IHJlcXVpcmUoJy4vY29uZmlnL3NlcnZlci1zY2hlbWEuanNvbicpO1xuXG5jb25zdCBhdG9tID0gZ2xvYmFsLmF0b207XG5jb25zdCBFbGVjdHJvbiA9IHJlcXVpcmUoJ2VsZWN0cm9uJyk7XG5jb25zdCBQYXRoID0gcmVxdWlyZSgncGF0aCcpO1xuY29uc3QgRmlsZVN5c3RlbSA9IHJlcXVpcmUoJ2ZzLXBsdXMnKTtcbmNvbnN0IGdldEljb25TZXJ2aWNlcyA9IHJlcXVpcmUoJy4vaGVscGVyL2ljb24uanMnKTtcbmNvbnN0IFF1ZXVlID0gcmVxdWlyZSgnLi9oZWxwZXIvcXVldWUuanMnKTtcbmNvbnN0IFN0b3JhZ2UgPSByZXF1aXJlKCcuL2hlbHBlci9zdG9yYWdlLmpzJyk7XG5cbnJlcXVpcmUoJ2V2ZW50cycpLkV2ZW50RW1pdHRlci5kZWZhdWx0TWF4TGlzdGVuZXJzID0gMDtcblxuY2xhc3MgRnRwUmVtb3RlRWRpdCB7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG5cbiAgICBzZWxmLmluZm8gPSBbXTtcbiAgICBzZWxmLmNvbmZpZyA9IGNvbmZpZztcbiAgICBzZWxmLnN1YnNjcmlwdGlvbnMgPSBudWxsO1xuXG4gICAgc2VsZi50cmVlVmlldyA9IG51bGw7XG4gICAgc2VsZi5wcm90b2NvbFZpZXcgPSBudWxsO1xuICAgIHNlbGYuY29uZmlndXJhdGlvblZpZXcgPSBudWxsO1xuICAgIHNlbGYuZmluZGVyVmlldyA9IG51bGw7XG4gIH1cblxuICBhY3RpdmF0ZSgpIHtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcblxuICAgIHNlbGYudHJlZVZpZXcgPSBuZXcgVHJlZVZpZXcoKTtcbiAgICBzZWxmLnByb3RvY29sVmlldyA9IG5ldyBQcm90b2NvbFZpZXcoKTtcblxuICAgIC8vIEV2ZW50cyBzdWJzY3JpYmVkIHRvIGluIGF0b20ncyBzeXN0ZW0gY2FuIGJlIGVhc2lseSBjbGVhbmVkIHVwIHdpdGggYSBDb21wb3NpdGVEaXNwb3NhYmxlXG4gICAgc2VsZi5zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcblxuICAgIC8vIFJlZ2lzdGVyIGNvbW1hbmQgdGhhdCB0b2dnbGVzIHRoaXMgdmlld1xuICAgIHNlbGYuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20td29ya3NwYWNlJywge1xuICAgICAgJ2Z0cC1yZW1vdGUtZWRpdDp0b2dnbGUnOiAoKSA9PiBzZWxmLnRvZ2dsZSgpLFxuICAgICAgJ2Z0cC1yZW1vdGUtZWRpdDp0b2dnbGUtZm9jdXMnOiAoKSA9PiBzZWxmLnRvZ2dsZUZvY3VzKCksXG4gICAgICAnZnRwLXJlbW90ZS1lZGl0OnNob3cnOiAoKSA9PiBzZWxmLnNob3coKSxcbiAgICAgICdmdHAtcmVtb3RlLWVkaXQ6aGlkZSc6ICgpID0+IHNlbGYuaGlkZSgpLFxuICAgICAgJ2Z0cC1yZW1vdGUtZWRpdDp1bmZvY3VzJzogKCkgPT4gc2VsZi50cmVlVmlldy51bmZvY3VzKCksXG4gICAgICAnZnRwLXJlbW90ZS1lZGl0OmVkaXQtc2VydmVycyc6ICgpID0+IHNlbGYuY29uZmlndXJhdGlvbigpLFxuICAgICAgJ2Z0cC1yZW1vdGUtZWRpdDpjaGFuZ2UtcGFzc3dvcmQnOiAoKSA9PiBzZWxmLmNoYW5nZVBhc3N3b3JkKCksXG4gICAgICAnZnRwLXJlbW90ZS1lZGl0Om9wZW4tZmlsZSc6ICgpID0+IHNlbGYub3BlbigpLFxuICAgICAgJ2Z0cC1yZW1vdGUtZWRpdDpvcGVuLWZpbGUtcGVuZGluZyc6ICgpID0+IHNlbGYub3Blbih0cnVlKSxcbiAgICAgICdmdHAtcmVtb3RlLWVkaXQ6bmV3LWZpbGUnOiAoKSA9PiBzZWxmLmNyZWF0ZSgnZmlsZScpLFxuICAgICAgJ2Z0cC1yZW1vdGUtZWRpdDpuZXctZGlyZWN0b3J5JzogKCkgPT4gc2VsZi5jcmVhdGUoJ2RpcmVjdG9yeScpLFxuICAgICAgJ2Z0cC1yZW1vdGUtZWRpdDpkdXBsaWNhdGUnOiAoKSA9PiBzZWxmLmR1cGxpY2F0ZSgpLFxuICAgICAgJ2Z0cC1yZW1vdGUtZWRpdDpkZWxldGUnOiAoKSA9PiBzZWxmLmRlbGV0ZSgpLFxuICAgICAgJ2Z0cC1yZW1vdGUtZWRpdDpyZW5hbWUnOiAoKSA9PiBzZWxmLnJlbmFtZSgpLFxuICAgICAgJ2Z0cC1yZW1vdGUtZWRpdDpjb3B5JzogKCkgPT4gc2VsZi5jb3B5KCksXG4gICAgICAnZnRwLXJlbW90ZS1lZGl0OmN1dCc6ICgpID0+IHNlbGYuY3V0KCksXG4gICAgICAnZnRwLXJlbW90ZS1lZGl0OnBhc3RlJzogKCkgPT4gc2VsZi5wYXN0ZSgpLFxuICAgICAgJ2Z0cC1yZW1vdGUtZWRpdDpjaG1vZCc6ICgpID0+IHNlbGYuY2htb2QoKSxcbiAgICAgICdmdHAtcmVtb3RlLWVkaXQ6dXBsb2FkLWZpbGUnOiAoKSA9PiBzZWxmLnVwbG9hZCgnZmlsZScpLFxuICAgICAgJ2Z0cC1yZW1vdGUtZWRpdDp1cGxvYWQtZGlyZWN0b3J5JzogKCkgPT4gc2VsZi51cGxvYWQoJ2RpcmVjdG9yeScpLFxuICAgICAgJ2Z0cC1yZW1vdGUtZWRpdDpkb3dubG9hZCc6ICgpID0+IHNlbGYuZG93bmxvYWQoKSxcbiAgICAgICdmdHAtcmVtb3RlLWVkaXQ6cmVsb2FkJzogKCkgPT4gc2VsZi5yZWxvYWQoKSxcbiAgICAgICdmdHAtcmVtb3RlLWVkaXQ6ZmluZC1yZW1vdGUtcGF0aCc6ICgpID0+IHNlbGYuZmluZFJlbW90ZVBhdGgoKSxcbiAgICAgICdmdHAtcmVtb3RlLWVkaXQ6Y29weS1yZW1vdGUtcGF0aCc6ICgpID0+IHNlbGYuY29weVJlbW90ZVBhdGgoKSxcbiAgICAgICdmdHAtcmVtb3RlLWVkaXQ6ZmluZGVyJzogKCkgPT4gc2VsZi5yZW1vdGVQYXRoRmluZGVyKCksXG4gICAgICAnZnRwLXJlbW90ZS1lZGl0OmZpbmRlci1yZWluZGV4LWNhY2hlJzogKCkgPT4gc2VsZi5yZW1vdGVQYXRoRmluZGVyKHRydWUpLFxuICAgICAgJ2Z0cC1yZW1vdGUtZWRpdDphZGQtdGVtcC1zZXJ2ZXInOiAoKSA9PiBzZWxmLmFkZFRlbXBTZXJ2ZXIoKSxcbiAgICAgICdmdHAtcmVtb3RlLWVkaXQ6cmVtb3ZlLXRlbXAtc2VydmVyJzogKCkgPT4gc2VsZi5yZW1vdmVUZW1wU2VydmVyKCksXG4gICAgfSkpO1xuXG4gICAgLy8gRXZlbnRzXG4gICAgYXRvbS5jb25maWcub25EaWRDaGFuZ2UoJ2Z0cC1yZW1vdGUtZWRpdC5jb25maWcnLCAoKSA9PiB7XG4gICAgICBpZiAoU3RvcmFnZS5nZXRQYXNzd29yZCgpKSB7XG4gICAgICAgIFN0b3JhZ2UubG9hZCh0cnVlKTtcbiAgICAgICAgc2VsZi50cmVlVmlldy5yZWxvYWQoKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIERyYWcgJiBEcm9wXG4gICAgc2VsZi50cmVlVmlldy5vbignZHJvcCcsIChlKSA9PiB7XG4gICAgICBzZWxmLmRyb3AoZSk7XG4gICAgfSk7XG5cbiAgICAvLyBBdXRvIFJldmVhbCBBY3RpdmUgRmlsZVxuICAgIGF0b20ud29ya3NwYWNlLmdldENlbnRlcigpLm9uRGlkU3RvcENoYW5naW5nQWN0aXZlUGFuZUl0ZW0oKGl0ZW0pID0+IHtcbiAgICAgIHNlbGYuYXV0b1JldmVhbEFjdGl2ZUZpbGUoKTtcbiAgICB9KTtcblxuICAgIC8vIHdvcmthcm91bmQgdG8gYWN0aXZhdGUgY29yZS5hbGxvd1BlbmRpbmdQYW5lSXRlbXMgaWYgZnRwLXJlbW90ZS1lZGl0LnRyZWUuYWxsb3dQZW5kaW5nUGFuZUl0ZW1zIGlzIGFjdGl2YXRlZFxuICAgIGF0b20uY29uZmlnLm9uRGlkQ2hhbmdlKCdmdHAtcmVtb3RlLWVkaXQudHJlZS5hbGxvd1BlbmRpbmdQYW5lSXRlbXMnLCAoeyBuZXdWYWx1ZSwgb2xkVmFsdWUgfSkgPT4ge1xuICAgICAgaWYgKG5ld1ZhbHVlID09IHRydWUgJiYgIWF0b20uY29uZmlnLmdldCgnY29yZS5hbGxvd1BlbmRpbmdQYW5lSXRlbXMnKSkge1xuICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ2NvcmUuYWxsb3dQZW5kaW5nUGFuZUl0ZW1zJywgdHJ1ZSlcbiAgICAgIH1cbiAgICB9KTtcbiAgICBpZiAoYXRvbS5jb25maWcuZ2V0KCdmdHAtcmVtb3RlLWVkaXQudHJlZS5hbGxvd1BlbmRpbmdQYW5lSXRlbXMnKSkge1xuICAgICAgYXRvbS5jb25maWcuc2V0KCdjb3JlLmFsbG93UGVuZGluZ1BhbmVJdGVtcycsIHRydWUpXG4gICAgfVxuXG4gICAgLy8gVG9nZ2xlIG9uIHN0YXJ0dXBcbiAgICBhdG9tLnBhY2thZ2VzLm9uRGlkQWN0aXZhdGVQYWNrYWdlKChhY3RpdmF0ZVBhY2thZ2UpID0+IHtcbiAgICAgIGlmIChhY3RpdmF0ZVBhY2thZ2UubmFtZSA9PSAnZnRwLXJlbW90ZS1lZGl0Jykge1xuICAgICAgICBpZiAoYXRvbS5jb25maWcuZ2V0KCdmdHAtcmVtb3RlLWVkaXQudHJlZS50b2dnbGVPblN0YXJ0dXAnKSkge1xuICAgICAgICAgIHNlbGYudG9nZ2xlKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGRlYWN0aXZhdGUoKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG5cbiAgICBpZiAoc2VsZi5zdWJzY3JpcHRpb25zKSB7XG4gICAgICBzZWxmLnN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpO1xuICAgICAgc2VsZi5zdWJzY3JpcHRpb25zID0gbnVsbDtcbiAgICB9XG5cbiAgICBpZiAoc2VsZi50cmVlVmlldykge1xuICAgICAgc2VsZi50cmVlVmlldy5kZXN0cm95KCk7XG4gICAgfVxuXG4gICAgaWYgKHNlbGYucHJvdG9jb2xWaWV3KSB7XG4gICAgICBzZWxmLnByb3RvY29sVmlldy5kZXN0cm95KCk7XG4gICAgfVxuXG4gICAgaWYgKHNlbGYuY29uZmlndXJhdGlvblZpZXcpIHtcbiAgICAgIHNlbGYuY29uZmlndXJhdGlvblZpZXcuZGVzdHJveSgpO1xuICAgIH1cblxuICAgIGlmIChzZWxmLmZpbmRlclZpZXcpIHtcbiAgICAgIGZpbmRlclZpZXcuZGVzdHJveSgpO1xuICAgIH1cbiAgfVxuXG4gIHNlcmlhbGl6ZSgpIHtcbiAgICByZXR1cm4ge307XG4gIH1cblxuICBoYW5kbGVVUkkocGFyc2VkVXJpKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG5cbiAgICBsZXQgcmVnZXggPSAvKFxcLyk/KFthLXowLTlfXFwtXXsxLDV9OlxcL1xcLykoKFteOl17MSx9KSgoOiguezEsfSkpP1tcXEBcXHg0MF0pKT8oW2EtejAtOV9cXC0uXSspKDooWzAtOV0qKSk/KC4qKS9naTtcbiAgICBsZXQgaXNfbWF0Y2hlZCA9IHBhcnNlZFVyaS5wYXRoLm1hdGNoKHJlZ2V4KTtcblxuICAgIGlmIChpc19tYXRjaGVkKSB7XG5cbiAgICAgIGlmICghc2VsZi50cmVlVmlldy5pc1Zpc2libGUoKSkge1xuICAgICAgICBzZWxmLnRvZ2dsZSgpO1xuICAgICAgfVxuXG4gICAgICBsZXQgbWF0Y2hlZCA9IHJlZ2V4LmV4ZWMocGFyc2VkVXJpLnBhdGgpO1xuXG4gICAgICBsZXQgcHJvdG9jb2wgPSBtYXRjaGVkWzJdO1xuICAgICAgbGV0IHVzZXJuYW1lID0gKG1hdGNoZWRbNF0gIT09IHVuZGVmaW5lZCkgPyBkZWNvZGVVUklDb21wb25lbnQobWF0Y2hlZFs0XSkgOiAnJztcbiAgICAgIGxldCBwYXNzd29yZCA9IChtYXRjaGVkWzddICE9PSB1bmRlZmluZWQpID8gZGVjb2RlVVJJQ29tcG9uZW50KG1hdGNoZWRbN10pIDogJyc7XG4gICAgICBsZXQgaG9zdCA9IChtYXRjaGVkWzhdICE9PSB1bmRlZmluZWQpID8gbWF0Y2hlZFs4XSA6ICcnO1xuICAgICAgbGV0IHBvcnQgPSAobWF0Y2hlZFsxMF0gIT09IHVuZGVmaW5lZCkgPyBtYXRjaGVkWzEwXSA6ICcnO1xuICAgICAgbGV0IHBhdGggPSAobWF0Y2hlZFsxMV0gIT09IHVuZGVmaW5lZCkgPyBkZWNvZGVVUklDb21wb25lbnQobWF0Y2hlZFsxMV0pIDogXCIvXCI7XG5cbiAgICAgIGxldCBuZXdjb25maWcgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHNlcnZlcl9jb25maWcpKTtcbiAgICAgIG5ld2NvbmZpZy5uYW1lID0gKHVzZXJuYW1lKSA/IHByb3RvY29sICsgdXNlcm5hbWUgKyAnQCcgKyBob3N0IDogcHJvdG9jb2wgKyBob3N0O1xuICAgICAgbmV3Y29uZmlnLmhvc3QgPSBob3N0O1xuICAgICAgbmV3Y29uZmlnLnBvcnQgPSAocG9ydCkgPyBwb3J0IDogKChwcm90b2NvbCA9PSAnc2Z0cDovLycpID8gJzIyJyA6ICcyMScpO1xuICAgICAgbmV3Y29uZmlnLnVzZXIgPSB1c2VybmFtZTtcbiAgICAgIG5ld2NvbmZpZy5wYXNzd29yZCA9IHBhc3N3b3JkO1xuICAgICAgbmV3Y29uZmlnLnNmdHAgPSAocHJvdG9jb2wgPT0gJ3NmdHA6Ly8nKTtcbiAgICAgIG5ld2NvbmZpZy5yZW1vdGUgPSBwYXRoO1xuICAgICAgbmV3Y29uZmlnLnRlbXAgPSB0cnVlO1xuXG4gICAgICBsb2dEZWJ1ZyhcIkFkZGluZyBuZXcgc2VydmVyIGJ5IHVyaSBoYW5kbGVyXCIsIG5ld2NvbmZpZyk7XG5cbiAgICAgIHNlbGYudHJlZVZpZXcuYWRkU2VydmVyKG5ld2NvbmZpZyk7XG4gICAgfVxuICB9XG5cbiAgb3BlblJlbW90ZUZpbGUoKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG5cbiAgICByZXR1cm4gKGZpbGUpID0+IHtcbiAgICAgIGNvbnN0IHNlbGVjdGVkID0gc2VsZi50cmVlVmlldy5saXN0LmZpbmQoJy5zZWxlY3RlZCcpO1xuXG4gICAgICBpZiAoc2VsZWN0ZWQubGVuZ3RoID09PSAwKSByZXR1cm47XG5cbiAgICAgIGxldCByb290ID0gc2VsZWN0ZWQudmlldygpLmdldFJvb3QoKTtcbiAgICAgIGxldCBsb2NhbFBhdGggPSBub3JtYWxpemUocm9vdC5nZXRMb2NhbFBhdGgoKSk7XG4gICAgICBsb2NhbFBhdGggPSBub3JtYWxpemUoUGF0aC5qb2luKGxvY2FsUGF0aC5zbGljZSgwLCBsb2NhbFBhdGgubGFzdEluZGV4T2Yocm9vdC5nZXRQYXRoKCkpKSwgZmlsZSkucmVwbGFjZSgvXFwvKy9nLCBQYXRoLnNlcCksIFBhdGguc2VwKTtcblxuICAgICAgdHJ5IHtcbiAgICAgICAgbGV0IGZpbGUgPSBzZWxmLnRyZWVWaWV3LmdldEVsZW1lbnRCeUxvY2FsUGF0aChsb2NhbFBhdGgsIHJvb3QsICdmaWxlJyk7XG4gICAgICAgIHNlbGYub3BlbkZpbGUoZmlsZSk7XG5cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9IGNhdGNoIChleCkge1xuICAgICAgICBsb2dEZWJ1ZyhleClcblxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZ2V0Q3VycmVudFNlcnZlck5hbWUoKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG5cbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgY29uc3Qgc2VsZWN0ZWQgPSBzZWxmLnRyZWVWaWV3Lmxpc3QuZmluZCgnLnNlbGVjdGVkJyk7XG4gICAgICAgIGlmIChzZWxlY3RlZC5sZW5ndGggPT09IDApIHJlamVjdCgnbm9zZXJ2ZXJzJyk7XG5cbiAgICAgICAgbGV0IHJvb3QgPSBzZWxlY3RlZC52aWV3KCkuZ2V0Um9vdCgpO1xuICAgICAgICByZXNvbHZlKHJvb3QubmFtZSk7XG4gICAgICB9KVxuICAgIH1cbiAgfVxuXG4gIGdldEN1cnJlbnRTZXJ2ZXJDb25maWcoKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG5cbiAgICByZXR1cm4gKHJlYXNvbkZvclJlcXVlc3QpID0+IHtcbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgIGlmICghcmVhc29uRm9yUmVxdWVzdCkge1xuICAgICAgICAgIHJlamVjdCgnbm9yZWFzb25naXZlbicpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHNlbGVjdGVkID0gc2VsZi50cmVlVmlldy5saXN0LmZpbmQoJy5zZWxlY3RlZCcpO1xuICAgICAgICBpZiAoc2VsZWN0ZWQubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgcmVqZWN0KCdub3NlcnZlcnMnKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIVN0b3JhZ2UuaGFzUGFzc3dvcmQoKSkge1xuICAgICAgICAgIHJlamVjdCgnbm9wYXNzd29yZCcpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCByb290ID0gc2VsZWN0ZWQudmlldygpLmdldFJvb3QoKTtcbiAgICAgICAgbGV0IGJ1dHRvbmRpc21pc3MgPSBmYWxzZTtcblxuICAgICAgICBpZiAoaXNJbkJsYWNrTGlzdChTdG9yYWdlLmdldFBhc3N3b3JkKCksIHJlYXNvbkZvclJlcXVlc3QpKSB7XG4gICAgICAgICAgcmVqZWN0KCd1c2VyZGVjbGluZWQnKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGlzSW5XaGl0ZUxpc3QoU3RvcmFnZS5nZXRQYXNzd29yZCgpLCByZWFzb25Gb3JSZXF1ZXN0KSkge1xuICAgICAgICAgIHJlc29sdmUocm9vdC5jb25maWcpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBjYXV0aW9uID0gJ0RlY2xpbmUgdGhpcyBtZXNzYWdlIGlmIHlvdSBkaWQgbm90IGluaXRpYXRlIGEgcmVxdWVzdCB0byBzaGFyZSB5b3VyIHNlcnZlciBjb25maWd1cmF0aW9uIHdpdGggYSBwYWNha2dlISdcbiAgICAgICAgbGV0IG5vdGlmID0gYXRvbS5ub3RpZmljYXRpb25zLmFkZFdhcm5pbmcoJ1NlcnZlciBDb25maWd1cmF0aW9uIFJlcXVlc3RlZCcsIHtcbiAgICAgICAgICBkZXRhaWw6IHJlYXNvbkZvclJlcXVlc3QgKyAnXFxuLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxcbicgKyBjYXV0aW9uLFxuICAgICAgICAgIGRpc21pc3NhYmxlOiB0cnVlLFxuICAgICAgICAgIGJ1dHRvbnM6IFt7XG4gICAgICAgICAgICB0ZXh0OiAnQWx3YXlzJyxcbiAgICAgICAgICAgIG9uRGlkQ2xpY2s6ICgpID0+IHtcbiAgICAgICAgICAgICAgYnV0dG9uZGlzbWlzcyA9IHRydWU7XG4gICAgICAgICAgICAgIG5vdGlmLmRpc21pc3MoKTtcbiAgICAgICAgICAgICAgYWRkVG9XaGl0ZUxpc3QoU3RvcmFnZS5nZXRQYXNzd29yZCgpLCByZWFzb25Gb3JSZXF1ZXN0KTtcbiAgICAgICAgICAgICAgcmVzb2x2ZShyb290LmNvbmZpZyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICB0ZXh0OiAnQWNjZXB0JyxcbiAgICAgICAgICAgIG9uRGlkQ2xpY2s6ICgpID0+IHtcbiAgICAgICAgICAgICAgYnV0dG9uZGlzbWlzcyA9IHRydWU7XG4gICAgICAgICAgICAgIG5vdGlmLmRpc21pc3MoKTtcbiAgICAgICAgICAgICAgcmVzb2x2ZShyb290LmNvbmZpZyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICB0ZXh0OiAnRGVjbGluZScsXG4gICAgICAgICAgICBvbkRpZENsaWNrOiAoKSA9PiB7XG4gICAgICAgICAgICAgIGJ1dHRvbmRpc21pc3MgPSB0cnVlO1xuICAgICAgICAgICAgICBub3RpZi5kaXNtaXNzKCk7XG4gICAgICAgICAgICAgIHJlamVjdCgndXNlcmRlY2xpbmVkJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICB0ZXh0OiAnTmV2ZXInLFxuICAgICAgICAgICAgb25EaWRDbGljazogKCkgPT4ge1xuICAgICAgICAgICAgICBidXR0b25kaXNtaXNzID0gdHJ1ZTtcbiAgICAgICAgICAgICAgbm90aWYuZGlzbWlzcygpO1xuICAgICAgICAgICAgICBhZGRUb0JsYWNrTGlzdChTdG9yYWdlLmdldFBhc3N3b3JkKCksIHJlYXNvbkZvclJlcXVlc3QpO1xuICAgICAgICAgICAgICByZWplY3QoJ3VzZXJkZWNsaW5lZCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sXG4gICAgICAgICAgXVxuICAgICAgICB9KTtcblxuICAgICAgICBsZXQgZGlzcG9zYWJsZSA9IG5vdGlmLm9uRGlkRGlzbWlzcygoKSA9PiB7XG4gICAgICAgICAgaWYgKCFidXR0b25kaXNtaXNzKSByZWplY3QoJ3VzZXJkZWNsaW5lZCcpO1xuICAgICAgICAgIGRpc3Bvc2FibGUuZGlzcG9zZSgpO1xuICAgICAgICB9KVxuICAgICAgfSlcbiAgICB9XG4gIH1cblxuICBjb25zdW1lRWxlbWVudEljb25zKHNlcnZpY2UpIHtcbiAgICBnZXRJY29uU2VydmljZXMoKS5zZXRFbGVtZW50SWNvbnMoc2VydmljZSk7XG5cbiAgICByZXR1cm4gbmV3IERpc3Bvc2FibGUoKCkgPT4ge1xuICAgICAgZ2V0SWNvblNlcnZpY2VzKCkucmVzZXRFbGVtZW50SWNvbnMoKTtcbiAgICB9KVxuICB9XG5cbiAgcHJvbXRQYXNzd29yZCgpIHtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcbiAgICBjb25zdCBkaWFsb2cgPSBuZXcgUHJvbXB0UGFzc0RpYWxvZygpO1xuXG4gICAgbGV0IHByb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBkaWFsb2cub24oJ2RpYWxvZy1kb25lJywgKGUsIHBhc3N3b3JkKSA9PiB7XG4gICAgICAgIGlmIChjaGVja1Bhc3N3b3JkKHBhc3N3b3JkKSkge1xuICAgICAgICAgIFN0b3JhZ2Uuc2V0UGFzc3dvcmQocGFzc3dvcmQpO1xuICAgICAgICAgIGRpYWxvZy5jbG9zZSgpO1xuXG4gICAgICAgICAgcmVzb2x2ZSh0cnVlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBkaWFsb2cuc2hvd0Vycm9yKCdXcm9uZyBwYXNzd29yZCwgdHJ5IGFnYWluIScpO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgZGlhbG9nLmF0dGFjaCgpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHByb21pc2U7XG4gIH1cblxuICBjaGFuZ2VQYXNzd29yZChtb2RlKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG5cbiAgICBjb25zdCBvcHRpb25zID0ge307XG4gICAgaWYgKG1vZGUgPT0gJ2FkZCcpIHtcbiAgICAgIG9wdGlvbnMubW9kZSA9ICdhZGQnO1xuICAgICAgb3B0aW9ucy5wcm9tcHQgPSAnRW50ZXIgdGhlIG1hc3RlciBwYXNzd29yZC4gQWxsIGluZm9ybWF0aW9uIGFib3V0IHlvdXIgc2VydmVyIHNldHRpbmdzIHdpbGwgYmUgZW5jcnlwdGVkIHdpdGggdGhpcyBwYXNzd29yZC4nO1xuICAgIH0gZWxzZSB7XG4gICAgICBvcHRpb25zLm1vZGUgPSAnY2hhbmdlJztcbiAgICB9XG5cbiAgICBjb25zdCBkaWFsb2cgPSBuZXcgQ2hhbmdlUGFzc0RpYWxvZyhvcHRpb25zKTtcbiAgICBsZXQgcHJvbWlzZSA9IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGRpYWxvZy5vbignZGlhbG9nLWRvbmUnLCAoZSwgcGFzc3dvcmRzKSA9PiB7XG5cbiAgICAgICAgLy8gQ2hlY2sgdGhhdCBwYXNzd29yZCBmcm9tIG5ldyBtYXN0ZXIgcGFzc3dvcmQgY2FuIGRlY3J5cHQgY3VycmVudCBjb25maWdcbiAgICAgICAgaWYgKG1vZGUgPT0gJ2FkZCcpIHtcbiAgICAgICAgICBsZXQgY29uZmlnSGFzaCA9IGF0b20uY29uZmlnLmdldCgnZnRwLXJlbW90ZS1lZGl0LmNvbmZpZycpO1xuICAgICAgICAgIGlmIChjb25maWdIYXNoKSB7XG4gICAgICAgICAgICBsZXQgbmV3UGFzc3dvcmQgPSBwYXNzd29yZHMubmV3UGFzc3dvcmQ7XG4gICAgICAgICAgICBsZXQgdGVzdENvbmZpZyA9IGRlY3J5cHQobmV3UGFzc3dvcmQsIGNvbmZpZ0hhc2gpO1xuXG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICBsZXQgdGVzdEpzb24gPSBKU09OLnBhcnNlKHRlc3RDb25maWcpO1xuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAvLyBJZiBtYXN0ZXIgcGFzc3dvcmQgZG9lcyBub3QgZGVjcnlwdCBjdXJyZW50IGNvbmZpZyxcbiAgICAgICAgICAgICAgLy8gcHJvbXB0IHRoZSB1c2VyIHRvIHJlcGx5IHRvIGluc2VydCBjb3JyZWN0IHBhc3N3b3JkXG4gICAgICAgICAgICAgIC8vIG9yIHJlc2V0IGNvbmZpZyBjb250ZW50XG4gICAgICAgICAgICAgIHNob3dNZXNzYWdlKCdNYXN0ZXIgcGFzc3dvcmQgZG9lcyBub3QgbWF0Y2ggd2l0aCBwcmV2aW91cyB1c2VkLiBQbGVhc2UgcmV0cnkgb3IgZGVsZXRlIFwiY29uZmlnXCIgZW50cnkgaW4gZnRwLXJlbW90ZS1lZGl0IGNvbmZpZ3VyYXRpb24gbm9kZS4nLCAnZXJyb3InKTtcblxuICAgICAgICAgICAgICBkaWFsb2cuY2xvc2UoKTtcbiAgICAgICAgICAgICAgcmVzb2x2ZShmYWxzZSk7XG4gICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgb2xkUGFzc3dvcmRWYWx1ZSA9IChtb2RlID09ICdhZGQnKSA/IHBhc3N3b3Jkcy5uZXdQYXNzd29yZCA6IHBhc3N3b3Jkcy5vbGRQYXNzd29yZDtcblxuICAgICAgICBjaGFuZ2VQYXNzd29yZChvbGRQYXNzd29yZFZhbHVlLCBwYXNzd29yZHMubmV3UGFzc3dvcmQpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgIFN0b3JhZ2Uuc2V0UGFzc3dvcmQocGFzc3dvcmRzLm5ld1Bhc3N3b3JkKTtcblxuICAgICAgICAgIGlmIChtb2RlICE9ICdhZGQnKSB7XG4gICAgICAgICAgICBzaG93TWVzc2FnZSgnTWFzdGVyIHBhc3N3b3JkIHN1Y2Nlc3NmdWxseSBjaGFuZ2VkLiBQbGVhc2UgcmVzdGFydCBhdG9tIScsICdzdWNjZXNzJyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJlc29sdmUodHJ1ZSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGRpYWxvZy5jbG9zZSgpO1xuICAgICAgfSk7XG5cbiAgICAgIGRpYWxvZy5hdHRhY2goKTtcbiAgICB9KTtcblxuICAgIHJldHVybiBwcm9taXNlO1xuICB9XG5cbiAgdG9nZ2xlKCkge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuXG4gICAgaWYgKCFTdG9yYWdlLmhhc1Bhc3N3b3JkKCkpIHtcbiAgICAgIGlmICghY2hlY2tQYXNzd29yZEV4aXN0cygpKSB7XG4gICAgICAgIHNlbGYuY2hhbmdlUGFzc3dvcmQoJ2FkZCcpLnRoZW4oKHJldHVyblZhbHVlKSA9PiB7XG4gICAgICAgICAgaWYgKHJldHVyblZhbHVlKSB7XG4gICAgICAgICAgICBpZiAoU3RvcmFnZS5sb2FkKCkpIHtcbiAgICAgICAgICAgICAgc2VsZi50cmVlVmlldy5yZWxvYWQoKTtcbiAgICAgICAgICAgICAgc2VsZi50cmVlVmlldy50b2dnbGUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm47XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzZWxmLnByb210UGFzc3dvcmQoKS50aGVuKCgpID0+IHtcbiAgICAgICAgICBpZiAoU3RvcmFnZS5sb2FkKCkpIHtcbiAgICAgICAgICAgIHNlbGYudHJlZVZpZXcucmVsb2FkKCk7XG4gICAgICAgICAgICBzZWxmLnRyZWVWaWV3LnRvZ2dsZSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKCFTdG9yYWdlLmxvYWRlZCAmJiBTdG9yYWdlLmxvYWQoKSkge1xuICAgICAgc2VsZi50cmVlVmlldy5yZWxvYWQoKTtcbiAgICB9XG4gICAgc2VsZi50cmVlVmlldy50b2dnbGUoKTtcbiAgfVxuXG4gIHRvZ2dsZUZvY3VzKCkge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuXG4gICAgaWYgKCFTdG9yYWdlLmhhc1Bhc3N3b3JkKCkpIHtcbiAgICAgIHNlbGYudG9nZ2xlKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHNlbGYudHJlZVZpZXcudG9nZ2xlRm9jdXMoKTtcbiAgICB9XG4gIH1cblxuICBzaG93KCkge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuXG4gICAgaWYgKCFTdG9yYWdlLmhhc1Bhc3N3b3JkKCkpIHtcbiAgICAgIHNlbGYudG9nZ2xlKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHNlbGYudHJlZVZpZXcuc2hvdygpO1xuICAgIH1cbiAgfVxuXG4gIGhpZGUoKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG5cbiAgICBzZWxmLnRyZWVWaWV3LmhpZGUoKTtcbiAgfVxuXG4gIGNvbmZpZ3VyYXRpb24oKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gICAgY29uc3Qgc2VsZWN0ZWQgPSBzZWxmLnRyZWVWaWV3Lmxpc3QuZmluZCgnLnNlbGVjdGVkJyk7XG5cbiAgICBsZXQgcm9vdCA9IG51bGw7XG4gICAgaWYgKHNlbGVjdGVkLmxlbmd0aCAhPT0gMCkge1xuICAgICAgcm9vdCA9IHNlbGVjdGVkLnZpZXcoKS5nZXRSb290KCk7XG4gICAgfTtcblxuICAgIGlmIChzZWxmLmNvbmZpZ3VyYXRpb25WaWV3ID09IG51bGwpIHtcbiAgICAgIHNlbGYuY29uZmlndXJhdGlvblZpZXcgPSBuZXcgQ29uZmlndXJhdGlvblZpZXcoKTtcbiAgICB9XG5cbiAgICBpZiAoIVN0b3JhZ2UuaGFzUGFzc3dvcmQoKSkge1xuICAgICAgc2VsZi5wcm9tdFBhc3N3b3JkKCkudGhlbigoKSA9PiB7XG4gICAgICAgIGlmIChTdG9yYWdlLmxvYWQoKSkge1xuICAgICAgICAgIHNlbGYuY29uZmlndXJhdGlvblZpZXcucmVsb2FkKHJvb3QpO1xuICAgICAgICAgIHNlbGYuY29uZmlndXJhdGlvblZpZXcuYXR0YWNoKCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHNlbGYuY29uZmlndXJhdGlvblZpZXcucmVsb2FkKHJvb3QpO1xuICAgIHNlbGYuY29uZmlndXJhdGlvblZpZXcuYXR0YWNoKCk7XG4gIH1cblxuICBhZGRUZW1wU2VydmVyKCkge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuICAgIGNvbnN0IHNlbGVjdGVkID0gc2VsZi50cmVlVmlldy5saXN0LmZpbmQoJy5zZWxlY3RlZCcpO1xuXG4gICAgbGV0IHJvb3QgPSBudWxsO1xuICAgIGlmIChzZWxlY3RlZC5sZW5ndGggIT09IDApIHtcbiAgICAgIHJvb3QgPSBzZWxlY3RlZC52aWV3KCkuZ2V0Um9vdCgpO1xuICAgICAgcm9vdC5jb25maWcudGVtcCA9IGZhbHNlO1xuICAgICAgc2VsZi50cmVlVmlldy5yZW1vdmVTZXJ2ZXIoc2VsZWN0ZWQudmlldygpKTtcbiAgICAgIFN0b3JhZ2UuYWRkU2VydmVyKHJvb3QuY29uZmlnKTtcbiAgICAgIFN0b3JhZ2Uuc2F2ZSgpO1xuICAgIH07XG4gIH1cblxuICByZW1vdmVUZW1wU2VydmVyKCkge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuICAgIGNvbnN0IHNlbGVjdGVkID0gc2VsZi50cmVlVmlldy5saXN0LmZpbmQoJy5zZWxlY3RlZCcpO1xuXG4gICAgaWYgKHNlbGVjdGVkLmxlbmd0aCAhPT0gMCkge1xuICAgICAgc2VsZi50cmVlVmlldy5yZW1vdmVTZXJ2ZXIoc2VsZWN0ZWQudmlldygpKTtcbiAgICB9O1xuICB9XG5cbiAgb3BlbihwZW5kaW5nID0gZmFsc2UpIHtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcbiAgICBjb25zdCBzZWxlY3RlZCA9IHNlbGYudHJlZVZpZXcubGlzdC5maW5kKCcuc2VsZWN0ZWQnKTtcblxuICAgIGlmIChzZWxlY3RlZC5sZW5ndGggPT09IDApIHJldHVybjtcblxuICAgIGlmIChzZWxlY3RlZC52aWV3KCkuaXMoJy5maWxlJykpIHtcbiAgICAgIGxldCBmaWxlID0gc2VsZWN0ZWQudmlldygpO1xuICAgICAgaWYgKGZpbGUpIHtcbiAgICAgICAgc2VsZi5vcGVuRmlsZShmaWxlLCBwZW5kaW5nKTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHNlbGVjdGVkLnZpZXcoKS5pcygnLmRpcmVjdG9yeScpKSB7XG4gICAgICBsZXQgZGlyZWN0b3J5ID0gc2VsZWN0ZWQudmlldygpO1xuICAgICAgaWYgKGRpcmVjdG9yeSkge1xuICAgICAgICBzZWxmLm9wZW5EaXJlY3RvcnkoZGlyZWN0b3J5KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBvcGVuRmlsZShmaWxlLCBwZW5kaW5nID0gZmFsc2UpIHtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcblxuICAgIGNvbnN0IGZ1bGxSZWxhdGl2ZVBhdGggPSBub3JtYWxpemUoZmlsZS5nZXRQYXRoKHRydWUpICsgZmlsZS5uYW1lKTtcbiAgICBjb25zdCBmdWxsTG9jYWxQYXRoID0gbm9ybWFsaXplKGZpbGUuZ2V0TG9jYWxQYXRoKHRydWUpICsgZmlsZS5uYW1lLCBQYXRoLnNlcCk7XG5cbiAgICAvLyBDaGVjayBpZiBmaWxlIGlzIGFscmVhZHkgb3BlbmVkIGluIHRleHRlZGl0b3JcbiAgICBpZiAoZ2V0VGV4dEVkaXRvcihmdWxsTG9jYWxQYXRoLCB0cnVlKSkge1xuICAgICAgYXRvbS53b3Jrc3BhY2Uub3BlbihmdWxsTG9jYWxQYXRoLCB7IHBlbmRpbmc6IHBlbmRpbmcsIHNlYXJjaEFsbFBhbmVzOiB0cnVlIH0pXG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgc2VsZi5kb3dubG9hZEZpbGUoZmlsZS5nZXRSb290KCksIGZ1bGxSZWxhdGl2ZVBhdGgsIGZ1bGxMb2NhbFBhdGgsIHsgZmlsZXNpemU6IGZpbGUuc2l6ZSB9KS50aGVuKCgpID0+IHtcbiAgICAgIC8vIE9wZW4gZmlsZSBhbmQgYWRkIGhhbmRsZXIgdG8gZWRpdG9yIHRvIHVwbG9hZCBmaWxlIG9uIHNhdmVcbiAgICAgIHJldHVybiBzZWxmLm9wZW5GaWxlSW5FZGl0b3IoZmlsZSwgcGVuZGluZyk7XG4gICAgfSkuY2F0Y2goKGVycikgPT4ge1xuICAgICAgc2hvd01lc3NhZ2UoZXJyLCAnZXJyb3InKTtcbiAgICB9KTtcbiAgfVxuXG4gIG9wZW5EaXJlY3RvcnkoZGlyZWN0b3J5KSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG5cbiAgICBkaXJlY3RvcnkuZXhwYW5kKCk7XG4gIH1cblxuICBjcmVhdGUodHlwZSkge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuICAgIGNvbnN0IHNlbGVjdGVkID0gc2VsZi50cmVlVmlldy5saXN0LmZpbmQoJy5zZWxlY3RlZCcpO1xuXG4gICAgaWYgKHNlbGVjdGVkLmxlbmd0aCA9PT0gMCkgcmV0dXJuO1xuXG4gICAgaWYgKHNlbGVjdGVkLnZpZXcoKS5pcygnLmZpbGUnKSkge1xuICAgICAgZGlyZWN0b3J5ID0gc2VsZWN0ZWQudmlldygpLnBhcmVudDtcbiAgICB9IGVsc2Uge1xuICAgICAgZGlyZWN0b3J5ID0gc2VsZWN0ZWQudmlldygpO1xuICAgIH1cblxuICAgIGlmIChkaXJlY3RvcnkpIHtcbiAgICAgIGlmICh0eXBlID09ICdmaWxlJykge1xuICAgICAgICBjb25zdCBkaWFsb2cgPSBuZXcgQWRkRGlhbG9nKGRpcmVjdG9yeS5nZXRQYXRoKGZhbHNlKSwgdHJ1ZSk7XG4gICAgICAgIGRpYWxvZy5vbignbmV3LXBhdGgnLCAoZSwgcmVsYXRpdmVQYXRoKSA9PiB7XG4gICAgICAgICAgaWYgKHJlbGF0aXZlUGF0aCkge1xuICAgICAgICAgICAgc2VsZi5jcmVhdGVGaWxlKGRpcmVjdG9yeSwgcmVsYXRpdmVQYXRoKTtcbiAgICAgICAgICAgIGRpYWxvZy5jbG9zZSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIGRpYWxvZy5hdHRhY2goKTtcbiAgICAgIH0gZWxzZSBpZiAodHlwZSA9PSAnZGlyZWN0b3J5Jykge1xuICAgICAgICBjb25zdCBkaWFsb2cgPSBuZXcgQWRkRGlhbG9nKGRpcmVjdG9yeS5nZXRQYXRoKGZhbHNlKSwgZmFsc2UpO1xuICAgICAgICBkaWFsb2cub24oJ25ldy1wYXRoJywgKGUsIHJlbGF0aXZlUGF0aCkgPT4ge1xuICAgICAgICAgIGlmIChyZWxhdGl2ZVBhdGgpIHtcbiAgICAgICAgICAgIHNlbGYuY3JlYXRlRGlyZWN0b3J5KGRpcmVjdG9yeSwgcmVsYXRpdmVQYXRoKTtcbiAgICAgICAgICAgIGRpYWxvZy5jbG9zZSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIGRpYWxvZy5hdHRhY2goKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBjcmVhdGVGaWxlKGRpcmVjdG9yeSwgcmVsYXRpdmVQYXRoKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG5cbiAgICBjb25zdCBmdWxsUmVsYXRpdmVQYXRoID0gbm9ybWFsaXplKGRpcmVjdG9yeS5nZXRSb290KCkuZ2V0UGF0aCh0cnVlKSArIHJlbGF0aXZlUGF0aCk7XG4gICAgY29uc3QgZnVsbExvY2FsUGF0aCA9IG5vcm1hbGl6ZShkaXJlY3RvcnkuZ2V0Um9vdCgpLmdldExvY2FsUGF0aCh0cnVlKSArIHJlbGF0aXZlUGF0aCwgUGF0aC5zZXApO1xuXG4gICAgdHJ5IHtcbiAgICAgIC8vIGNyZWF0ZSBsb2NhbCBmaWxlXG4gICAgICBpZiAoIUZpbGVTeXN0ZW0uZXhpc3RzU3luYyhmdWxsTG9jYWxQYXRoKSkge1xuICAgICAgICAvLyBDcmVhdGUgbG9jYWwgRGlyZWN0b3J5XG4gICAgICAgIGNyZWF0ZUxvY2FsUGF0aChmdWxsTG9jYWxQYXRoKTtcbiAgICAgICAgRmlsZVN5c3RlbS53cml0ZUZpbGVTeW5jKGZ1bGxMb2NhbFBhdGgsICcnKTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIHNob3dNZXNzYWdlKGVyciwgJ2Vycm9yJyk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgZGlyZWN0b3J5LmdldENvbm5lY3RvcigpLmV4aXN0c0ZpbGUoZnVsbFJlbGF0aXZlUGF0aCkudGhlbigoKSA9PiB7XG4gICAgICBzaG93TWVzc2FnZSgnRmlsZSAnICsgcmVsYXRpdmVQYXRoLnRyaW0oKSArICcgYWxyZWFkeSBleGlzdHMnLCAnZXJyb3InKTtcbiAgICB9KS5jYXRjaCgoKSA9PiB7XG4gICAgICBzZWxmLnVwbG9hZEZpbGUoZGlyZWN0b3J5LCBmdWxsTG9jYWxQYXRoLCBmdWxsUmVsYXRpdmVQYXRoLCBmYWxzZSkudGhlbigoZHVwbGljYXRlZEZpbGUpID0+IHtcbiAgICAgICAgaWYgKGR1cGxpY2F0ZWRGaWxlKSB7XG4gICAgICAgICAgLy8gT3BlbiBmaWxlIGFuZCBhZGQgaGFuZGxlciB0byBlZGl0b3IgdG8gdXBsb2FkIGZpbGUgb24gc2F2ZVxuICAgICAgICAgIHJldHVybiBzZWxmLm9wZW5GaWxlSW5FZGl0b3IoZHVwbGljYXRlZEZpbGUpO1xuICAgICAgICB9XG4gICAgICB9KS5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgIHNob3dNZXNzYWdlKGVyciwgJ2Vycm9yJyk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIGNyZWF0ZURpcmVjdG9yeShkaXJlY3RvcnksIHJlbGF0aXZlUGF0aCkge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuXG4gICAgcmVsYXRpdmVQYXRoID0gdHJhaWxpbmdzbGFzaGl0KHJlbGF0aXZlUGF0aCk7XG4gICAgY29uc3QgZnVsbFJlbGF0aXZlUGF0aCA9IG5vcm1hbGl6ZShkaXJlY3RvcnkuZ2V0Um9vdCgpLmdldFBhdGgodHJ1ZSkgKyByZWxhdGl2ZVBhdGgpO1xuICAgIGNvbnN0IGZ1bGxMb2NhbFBhdGggPSBub3JtYWxpemUoZGlyZWN0b3J5LmdldFJvb3QoKS5nZXRMb2NhbFBhdGgodHJ1ZSkgKyByZWxhdGl2ZVBhdGgsIFBhdGguc2VwKTtcblxuICAgIC8vIGNyZWF0ZSBsb2NhbCBkaXJlY3RvcnlcbiAgICB0cnkge1xuICAgICAgaWYgKCFGaWxlU3lzdGVtLmV4aXN0c1N5bmMoZnVsbExvY2FsUGF0aCkpIHtcbiAgICAgICAgY3JlYXRlTG9jYWxQYXRoKGZ1bGxMb2NhbFBhdGgpO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycikgeyB9XG5cbiAgICBkaXJlY3RvcnkuZ2V0Q29ubmVjdG9yKCkuZXhpc3RzRGlyZWN0b3J5KGZ1bGxSZWxhdGl2ZVBhdGgpLnRoZW4oKHJlc3VsdCkgPT4ge1xuICAgICAgc2hvd01lc3NhZ2UoJ0RpcmVjdG9yeSAnICsgcmVsYXRpdmVQYXRoLnRyaW0oKSArICcgYWxyZWFkeSBleGlzdHMnLCAnZXJyb3InKTtcbiAgICB9KS5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICByZXR1cm4gZGlyZWN0b3J5LmdldENvbm5lY3RvcigpLmNyZWF0ZURpcmVjdG9yeShmdWxsUmVsYXRpdmVQYXRoKS50aGVuKChyZXN1bHQpID0+IHtcbiAgICAgICAgLy8gQWRkIHRvIHRyZWVcbiAgICAgICAgbGV0IGVsZW1lbnQgPSBzZWxmLnRyZWVWaWV3LmFkZERpcmVjdG9yeShkaXJlY3RvcnkuZ2V0Um9vdCgpLCByZWxhdGl2ZVBhdGgpO1xuICAgICAgICBpZiAoZWxlbWVudC5pc1Zpc2libGUoKSkge1xuICAgICAgICAgIGVsZW1lbnQuc2VsZWN0KCk7XG4gICAgICAgIH1cbiAgICAgIH0pLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgc2hvd01lc3NhZ2UoZXJyLm1lc3NhZ2UsICdlcnJvcicpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICByZW5hbWUoKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gICAgY29uc3Qgc2VsZWN0ZWQgPSBzZWxmLnRyZWVWaWV3Lmxpc3QuZmluZCgnLnNlbGVjdGVkJyk7XG5cbiAgICBpZiAoc2VsZWN0ZWQubGVuZ3RoID09PSAwKSByZXR1cm47XG5cbiAgICBpZiAoc2VsZWN0ZWQudmlldygpLmlzKCcuZmlsZScpKSB7XG4gICAgICBsZXQgZmlsZSA9IHNlbGVjdGVkLnZpZXcoKTtcbiAgICAgIGlmIChmaWxlKSB7XG4gICAgICAgIGNvbnN0IGRpYWxvZyA9IG5ldyBSZW5hbWVEaWFsb2coZmlsZS5nZXRQYXRoKGZhbHNlKSArIGZpbGUubmFtZSwgdHJ1ZSk7XG4gICAgICAgIGRpYWxvZy5vbignbmV3LXBhdGgnLCAoZSwgcmVsYXRpdmVQYXRoKSA9PiB7XG4gICAgICAgICAgaWYgKHJlbGF0aXZlUGF0aCkge1xuICAgICAgICAgICAgc2VsZi5yZW5hbWVGaWxlKGZpbGUsIHJlbGF0aXZlUGF0aCk7XG4gICAgICAgICAgICBkaWFsb2cuY2xvc2UoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBkaWFsb2cuYXR0YWNoKCk7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChzZWxlY3RlZC52aWV3KCkuaXMoJy5kaXJlY3RvcnknKSkge1xuICAgICAgbGV0IGRpcmVjdG9yeSA9IHNlbGVjdGVkLnZpZXcoKTtcbiAgICAgIGlmIChkaXJlY3RvcnkpIHtcbiAgICAgICAgY29uc3QgZGlhbG9nID0gbmV3IFJlbmFtZURpYWxvZyh0cmFpbGluZ3NsYXNoaXQoZGlyZWN0b3J5LmdldFBhdGgoZmFsc2UpKSwgZmFsc2UpO1xuICAgICAgICBkaWFsb2cub24oJ25ldy1wYXRoJywgKGUsIHJlbGF0aXZlUGF0aCkgPT4ge1xuICAgICAgICAgIGlmIChyZWxhdGl2ZVBhdGgpIHtcbiAgICAgICAgICAgIHNlbGYucmVuYW1lRGlyZWN0b3J5KGRpcmVjdG9yeSwgcmVsYXRpdmVQYXRoKTtcbiAgICAgICAgICAgIGRpYWxvZy5jbG9zZSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIGRpYWxvZy5hdHRhY2goKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZW5hbWVGaWxlKGZpbGUsIHJlbGF0aXZlUGF0aCkge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuXG4gICAgY29uc3QgZnVsbFJlbGF0aXZlUGF0aCA9IG5vcm1hbGl6ZShmaWxlLmdldFJvb3QoKS5nZXRQYXRoKHRydWUpICsgcmVsYXRpdmVQYXRoKTtcbiAgICBjb25zdCBmdWxsTG9jYWxQYXRoID0gbm9ybWFsaXplKGZpbGUuZ2V0Um9vdCgpLmdldExvY2FsUGF0aCh0cnVlKSArIHJlbGF0aXZlUGF0aCwgUGF0aC5zZXApO1xuXG4gICAgZmlsZS5nZXRDb25uZWN0b3IoKS5yZW5hbWUoZmlsZS5nZXRQYXRoKHRydWUpICsgZmlsZS5uYW1lLCBmdWxsUmVsYXRpdmVQYXRoKS50aGVuKCgpID0+IHtcbiAgICAgIC8vIFJlZnJlc2ggY2FjaGVcbiAgICAgIGZpbGUuZ2V0Um9vdCgpLmdldEZpbmRlckNhY2hlKCkucmVuYW1lRmlsZShub3JtYWxpemUoZmlsZS5nZXRQYXRoKGZhbHNlKSArIGZpbGUubmFtZSksIG5vcm1hbGl6ZShyZWxhdGl2ZVBhdGgpLCBmaWxlLnNpemUpO1xuXG4gICAgICAvLyBBZGQgdG8gdHJlZVxuICAgICAgbGV0IGVsZW1lbnQgPSBzZWxmLnRyZWVWaWV3LmFkZEZpbGUoZmlsZS5nZXRSb290KCksIHJlbGF0aXZlUGF0aCwgeyBzaXplOiBmaWxlLnNpemUsIHJpZ2h0czogZmlsZS5yaWdodHMgfSk7XG4gICAgICBpZiAoZWxlbWVudC5pc1Zpc2libGUoKSkge1xuICAgICAgICBlbGVtZW50LnNlbGVjdCgpO1xuICAgICAgfVxuXG4gICAgICAvLyBDaGVjayBpZiBmaWxlIGlzIGFscmVhZHkgb3BlbmVkIGluIHRleHRlZGl0b3JcbiAgICAgIGxldCBmb3VuZCA9IGdldFRleHRFZGl0b3IoZmlsZS5nZXRMb2NhbFBhdGgodHJ1ZSkgKyBmaWxlLm5hbWUpO1xuICAgICAgaWYgKGZvdW5kKSB7XG4gICAgICAgIGVsZW1lbnQuYWRkQ2xhc3MoJ29wZW4nKTtcbiAgICAgICAgZm91bmQuc2F2ZU9iamVjdCA9IGVsZW1lbnQ7XG4gICAgICAgIGZvdW5kLnNhdmVBcyhlbGVtZW50LmdldExvY2FsUGF0aCh0cnVlKSArIGVsZW1lbnQubmFtZSk7XG4gICAgICB9XG5cbiAgICAgIC8vIE1vdmUgbG9jYWwgZmlsZVxuICAgICAgbW92ZUxvY2FsUGF0aChmaWxlLmdldExvY2FsUGF0aCh0cnVlKSArIGZpbGUubmFtZSwgZnVsbExvY2FsUGF0aCk7XG5cbiAgICAgIC8vIFJlbW92ZSBvbGQgZmlsZSBmcm9tIHRyZWVcbiAgICAgIGlmIChmaWxlKSBmaWxlLnJlbW92ZSgpXG4gICAgfSkuY2F0Y2goKGVycikgPT4ge1xuICAgICAgc2hvd01lc3NhZ2UoZXJyLm1lc3NhZ2UsICdlcnJvcicpO1xuICAgIH0pO1xuICB9XG5cbiAgcmVuYW1lRGlyZWN0b3J5KGRpcmVjdG9yeSwgcmVsYXRpdmVQYXRoKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG5cbiAgICByZWxhdGl2ZVBhdGggPSB0cmFpbGluZ3NsYXNoaXQocmVsYXRpdmVQYXRoKTtcbiAgICBjb25zdCBmdWxsUmVsYXRpdmVQYXRoID0gbm9ybWFsaXplKGRpcmVjdG9yeS5nZXRSb290KCkuZ2V0UGF0aCh0cnVlKSArIHJlbGF0aXZlUGF0aCk7XG4gICAgY29uc3QgZnVsbExvY2FsUGF0aCA9IG5vcm1hbGl6ZShkaXJlY3RvcnkuZ2V0Um9vdCgpLmdldExvY2FsUGF0aCh0cnVlKSArIHJlbGF0aXZlUGF0aCwgUGF0aC5zZXApO1xuXG4gICAgZGlyZWN0b3J5LmdldENvbm5lY3RvcigpLnJlbmFtZShkaXJlY3RvcnkuZ2V0UGF0aCgpLCBmdWxsUmVsYXRpdmVQYXRoKS50aGVuKCgpID0+IHtcbiAgICAgIC8vIFJlZnJlc2ggY2FjaGVcbiAgICAgIGRpcmVjdG9yeS5nZXRSb290KCkuZ2V0RmluZGVyQ2FjaGUoKS5yZW5hbWVEaXJlY3Rvcnkobm9ybWFsaXplKGRpcmVjdG9yeS5nZXRQYXRoKGZhbHNlKSksIG5vcm1hbGl6ZShyZWxhdGl2ZVBhdGggKyAnLycpKTtcblxuICAgICAgLy8gQWRkIHRvIHRyZWVcbiAgICAgIGxldCBlbGVtZW50ID0gc2VsZi50cmVlVmlldy5hZGREaXJlY3RvcnkoZGlyZWN0b3J5LmdldFJvb3QoKSwgcmVsYXRpdmVQYXRoLCB7IHJpZ2h0czogZGlyZWN0b3J5LnJpZ2h0cyB9KTtcbiAgICAgIGlmIChlbGVtZW50LmlzVmlzaWJsZSgpKSB7XG4gICAgICAgIGVsZW1lbnQuc2VsZWN0KCk7XG4gICAgICB9XG5cbiAgICAgIC8vIFRPRE9cbiAgICAgIC8vIENoZWNrIGlmIGZpbGVzIGFyZSBhbHJlYWR5IG9wZW5lZCBpbiB0ZXh0ZWRpdG9yXG5cbiAgICAgIC8vIE1vdmUgbG9jYWwgZGlyZWN0b3J5XG4gICAgICBtb3ZlTG9jYWxQYXRoKGRpcmVjdG9yeS5nZXRMb2NhbFBhdGgodHJ1ZSksIGZ1bGxMb2NhbFBhdGgpO1xuXG4gICAgICAvLyBSZW1vdmUgb2xkIGRpcmVjdG9yeSBmcm9tIHRyZWVcbiAgICAgIGlmIChkaXJlY3RvcnkpIGRpcmVjdG9yeS5yZW1vdmUoKVxuICAgIH0pLmNhdGNoKChlcnIpID0+IHtcbiAgICAgIHNob3dNZXNzYWdlKGVyci5tZXNzYWdlLCAnZXJyb3InKTtcbiAgICB9KTtcbiAgfVxuXG4gIGR1cGxpY2F0ZSgpIHtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcbiAgICBjb25zdCBzZWxlY3RlZCA9IHNlbGYudHJlZVZpZXcubGlzdC5maW5kKCcuc2VsZWN0ZWQnKTtcblxuICAgIGlmIChzZWxlY3RlZC5sZW5ndGggPT09IDApIHJldHVybjtcblxuICAgIGlmIChzZWxlY3RlZC52aWV3KCkuaXMoJy5maWxlJykpIHtcbiAgICAgIGxldCBmaWxlID0gc2VsZWN0ZWQudmlldygpO1xuICAgICAgaWYgKGZpbGUpIHtcbiAgICAgICAgY29uc3QgZGlhbG9nID0gbmV3IER1cGxpY2F0ZURpYWxvZyhmaWxlLmdldFBhdGgoZmFsc2UpICsgZmlsZS5uYW1lKTtcbiAgICAgICAgZGlhbG9nLm9uKCduZXctcGF0aCcsIChlLCByZWxhdGl2ZVBhdGgpID0+IHtcbiAgICAgICAgICBpZiAocmVsYXRpdmVQYXRoKSB7XG4gICAgICAgICAgICBzZWxmLmR1cGxpY2F0ZUZpbGUoZmlsZSwgcmVsYXRpdmVQYXRoKTtcbiAgICAgICAgICAgIGRpYWxvZy5jbG9zZSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIGRpYWxvZy5hdHRhY2goKTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHNlbGVjdGVkLnZpZXcoKS5pcygnLmRpcmVjdG9yeScpKSB7XG4gICAgICAvLyBUT0RPXG4gICAgICAvLyBsZXQgZGlyZWN0b3J5ID0gc2VsZWN0ZWQudmlldygpO1xuICAgICAgLy8gaWYgKGRpcmVjdG9yeSkge1xuICAgICAgLy8gICBjb25zdCBkaWFsb2cgPSBuZXcgRHVwbGljYXRlRGlhbG9nKHRyYWlsaW5nc2xhc2hpdChkaXJlY3RvcnkuZ2V0UGF0aChmYWxzZSkpKTtcbiAgICAgIC8vICAgZGlhbG9nLm9uKCduZXctcGF0aCcsIChlLCByZWxhdGl2ZVBhdGgpID0+IHtcbiAgICAgIC8vICAgICBpZiAocmVsYXRpdmVQYXRoKSB7XG4gICAgICAvLyAgICAgICBzZWxmLmR1cGxpY2F0ZURpcmVjdG9yeShkaXJlY3RvcnksIHJlbGF0aXZlUGF0aCk7XG4gICAgICAvLyAgICAgICBkaWFsb2cuY2xvc2UoKTtcbiAgICAgIC8vICAgICB9XG4gICAgICAvLyAgIH0pO1xuICAgICAgLy8gICBkaWFsb2cuYXR0YWNoKCk7XG4gICAgICAvLyB9XG4gICAgfVxuICB9XG5cbiAgZHVwbGljYXRlRmlsZShmaWxlLCByZWxhdGl2ZVBhdGgpIHtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcblxuICAgIGNvbnN0IGZ1bGxSZWxhdGl2ZVBhdGggPSBub3JtYWxpemUoZmlsZS5nZXRSb290KCkuZ2V0UGF0aCh0cnVlKSArIHJlbGF0aXZlUGF0aCk7XG4gICAgY29uc3QgZnVsbExvY2FsUGF0aCA9IG5vcm1hbGl6ZShmaWxlLmdldFJvb3QoKS5nZXRMb2NhbFBhdGgodHJ1ZSkgKyByZWxhdGl2ZVBhdGgsIFBhdGguc2VwKTtcblxuICAgIGZpbGUuZ2V0Q29ubmVjdG9yKCkuZXhpc3RzRmlsZShmdWxsUmVsYXRpdmVQYXRoKS50aGVuKCgpID0+IHtcbiAgICAgIHNob3dNZXNzYWdlKCdGaWxlICcgKyByZWxhdGl2ZVBhdGgudHJpbSgpICsgJyBhbHJlYWR5IGV4aXN0cycsICdlcnJvcicpO1xuICAgIH0pLmNhdGNoKCgpID0+IHtcbiAgICAgIHNlbGYuZG93bmxvYWRGaWxlKGZpbGUuZ2V0Um9vdCgpLCBmaWxlLmdldFBhdGgodHJ1ZSkgKyBmaWxlLm5hbWUsIGZ1bGxMb2NhbFBhdGgsIHsgZmlsZXNpemU6IGZpbGUuc2l6ZSB9KS50aGVuKCgpID0+IHtcbiAgICAgICAgc2VsZi51cGxvYWRGaWxlKGZpbGUuZ2V0Um9vdCgpLCBmdWxsTG9jYWxQYXRoLCBmdWxsUmVsYXRpdmVQYXRoKS50aGVuKChkdXBsaWNhdGVkRmlsZSkgPT4ge1xuICAgICAgICAgIGlmIChkdXBsaWNhdGVkRmlsZSkge1xuICAgICAgICAgICAgLy8gT3BlbiBmaWxlIGFuZCBhZGQgaGFuZGxlciB0byBlZGl0b3IgdG8gdXBsb2FkIGZpbGUgb24gc2F2ZVxuICAgICAgICAgICAgcmV0dXJuIHNlbGYub3BlbkZpbGVJbkVkaXRvcihkdXBsaWNhdGVkRmlsZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KS5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgICAgc2hvd01lc3NhZ2UoZXJyLCAnZXJyb3InKTtcbiAgICAgICAgfSk7XG4gICAgICB9KS5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgIHNob3dNZXNzYWdlKGVyciwgJ2Vycm9yJyk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIGR1cGxpY2F0ZURpcmVjdG9yeShkaXJlY3RvcnksIHJlbGF0aXZlUGF0aCkge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuXG4gICAgY29uc3QgZnVsbFJlbGF0aXZlUGF0aCA9IG5vcm1hbGl6ZShkaXJlY3RvcnkuZ2V0Um9vdCgpLmdldFBhdGgodHJ1ZSkgKyByZWxhdGl2ZVBhdGgpO1xuICAgIGNvbnN0IGZ1bGxMb2NhbFBhdGggPSBub3JtYWxpemUoZGlyZWN0b3J5LmdldFJvb3QoKS5nZXRMb2NhbFBhdGgodHJ1ZSkgKyByZWxhdGl2ZVBhdGgsIFBhdGguc2VwKTtcblxuICAgIC8vIFRPRE9cbiAgfVxuXG4gIGRlbGV0ZSgpIHtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcbiAgICBjb25zdCBzZWxlY3RlZCA9IHNlbGYudHJlZVZpZXcubGlzdC5maW5kKCcuc2VsZWN0ZWQnKTtcblxuICAgIGlmIChzZWxlY3RlZC5sZW5ndGggPT09IDApIHJldHVybjtcblxuICAgIGlmIChzZWxlY3RlZC52aWV3KCkuaXMoJy5maWxlJykpIHtcbiAgICAgIGxldCBmaWxlID0gc2VsZWN0ZWQudmlldygpO1xuICAgICAgaWYgKGZpbGUpIHtcbiAgICAgICAgYXRvbS5jb25maXJtKHtcbiAgICAgICAgICBtZXNzYWdlOiAnQXJlIHlvdSBzdXJlIHlvdSB3YW50IHRvIGRlbGV0ZSB0aGlzIGZpbGU/JyxcbiAgICAgICAgICBkZXRhaWxlZE1lc3NhZ2U6IFwiWW91IGFyZSBkZWxldGluZzpcXG5cIiArIGZpbGUuZ2V0UGF0aChmYWxzZSkgKyBmaWxlLm5hbWUsXG4gICAgICAgICAgYnV0dG9uczoge1xuICAgICAgICAgICAgWWVzOiAoKSA9PiB7XG4gICAgICAgICAgICAgIHNlbGYuZGVsZXRlRmlsZShmaWxlKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBDYW5jZWw6ICgpID0+IHtcbiAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHNlbGVjdGVkLnZpZXcoKS5pcygnLmRpcmVjdG9yeScpKSB7XG4gICAgICBsZXQgZGlyZWN0b3J5ID0gc2VsZWN0ZWQudmlldygpO1xuICAgICAgaWYgKGRpcmVjdG9yeSkge1xuICAgICAgICBhdG9tLmNvbmZpcm0oe1xuICAgICAgICAgIG1lc3NhZ2U6ICdBcmUgeW91IHN1cmUgeW91IHdhbnQgdG8gZGVsZXRlIHRoaXMgZm9sZGVyPycsXG4gICAgICAgICAgZGV0YWlsZWRNZXNzYWdlOiBcIllvdSBhcmUgZGVsZXRpbmc6XFxuXCIgKyB0cmFpbGluZ3NsYXNoaXQoZGlyZWN0b3J5LmdldFBhdGgoZmFsc2UpKSxcbiAgICAgICAgICBidXR0b25zOiB7XG4gICAgICAgICAgICBZZXM6ICgpID0+IHtcbiAgICAgICAgICAgICAgc2VsZi5kZWxldGVEaXJlY3RvcnkoZGlyZWN0b3J5LCB0cnVlKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBDYW5jZWw6ICgpID0+IHtcbiAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBkZWxldGVGaWxlKGZpbGUpIHtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcblxuICAgIGNvbnN0IGZ1bGxMb2NhbFBhdGggPSBub3JtYWxpemUoZmlsZS5nZXRMb2NhbFBhdGgodHJ1ZSkgKyBmaWxlLm5hbWUsIFBhdGguc2VwKTtcblxuICAgIGZpbGUuZ2V0Q29ubmVjdG9yKCkuZGVsZXRlRmlsZShmaWxlLmdldFBhdGgodHJ1ZSkgKyBmaWxlLm5hbWUpLnRoZW4oKCkgPT4ge1xuICAgICAgLy8gUmVmcmVzaCBjYWNoZVxuICAgICAgZmlsZS5nZXRSb290KCkuZ2V0RmluZGVyQ2FjaGUoKS5kZWxldGVGaWxlKG5vcm1hbGl6ZShmaWxlLmdldFBhdGgoZmFsc2UpICsgZmlsZS5uYW1lKSk7XG5cbiAgICAgIC8vIERlbGV0ZSBsb2NhbCBmaWxlXG4gICAgICB0cnkge1xuICAgICAgICBpZiAoRmlsZVN5c3RlbS5leGlzdHNTeW5jKGZ1bGxMb2NhbFBhdGgpKSB7XG4gICAgICAgICAgRmlsZVN5c3RlbS51bmxpbmtTeW5jKGZ1bGxMb2NhbFBhdGgpO1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlcnIpIHsgfVxuXG4gICAgICBmaWxlLnBhcmVudC5zZWxlY3QoKTtcbiAgICAgIGZpbGUuZGVzdHJveSgpO1xuICAgIH0pLmNhdGNoKChlcnIpID0+IHtcbiAgICAgIHNob3dNZXNzYWdlKGVyci5tZXNzYWdlLCAnZXJyb3InKTtcbiAgICB9KTtcbiAgfVxuXG4gIGRlbGV0ZURpcmVjdG9yeShkaXJlY3RvcnksIHJlY3Vyc2l2ZSkge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuXG4gICAgZGlyZWN0b3J5LmdldENvbm5lY3RvcigpLmRlbGV0ZURpcmVjdG9yeShkaXJlY3RvcnkuZ2V0UGF0aCgpLCByZWN1cnNpdmUpLnRoZW4oKCkgPT4ge1xuICAgICAgLy8gUmVmcmVzaCBjYWNoZVxuICAgICAgZGlyZWN0b3J5LmdldFJvb3QoKS5nZXRGaW5kZXJDYWNoZSgpLmRlbGV0ZURpcmVjdG9yeShub3JtYWxpemUoZGlyZWN0b3J5LmdldFBhdGgoZmFsc2UpKSk7XG5cbiAgICAgIGNvbnN0IGZ1bGxMb2NhbFBhdGggPSAoZGlyZWN0b3J5LmdldExvY2FsUGF0aCh0cnVlKSkucmVwbGFjZSgvXFwvKy9nLCBQYXRoLnNlcCk7XG5cbiAgICAgIC8vIERlbGV0ZSBsb2NhbCBkaXJlY3RvcnlcbiAgICAgIGRlbGV0ZUxvY2FsUGF0aChmdWxsTG9jYWxQYXRoKTtcblxuICAgICAgZGlyZWN0b3J5LnBhcmVudC5zZWxlY3QoKTtcbiAgICAgIGRpcmVjdG9yeS5kZXN0cm95KCk7XG4gICAgfSkuY2F0Y2goKGVycikgPT4ge1xuICAgICAgc2hvd01lc3NhZ2UoZXJyLm1lc3NhZ2UsICdlcnJvcicpO1xuICAgIH0pO1xuICB9XG5cbiAgY2htb2QoKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gICAgY29uc3Qgc2VsZWN0ZWQgPSBzZWxmLnRyZWVWaWV3Lmxpc3QuZmluZCgnLnNlbGVjdGVkJyk7XG5cbiAgICBpZiAoc2VsZWN0ZWQubGVuZ3RoID09PSAwKSByZXR1cm47XG5cbiAgICBpZiAoc2VsZWN0ZWQudmlldygpLmlzKCcuZmlsZScpKSB7XG4gICAgICBsZXQgZmlsZSA9IHNlbGVjdGVkLnZpZXcoKTtcbiAgICAgIGlmIChmaWxlKSB7XG4gICAgICAgIGNvbnN0IHBlcm1pc3Npb25zVmlldyA9IG5ldyBQZXJtaXNzaW9uc1ZpZXcoZmlsZSk7XG4gICAgICAgIHBlcm1pc3Npb25zVmlldy5vbignY2hhbmdlLXBlcm1pc3Npb25zJywgKGUsIHJlc3VsdCkgPT4ge1xuICAgICAgICAgIHNlbGYuY2htb2RGaWxlKGZpbGUsIHJlc3VsdC5wZXJtaXNzaW9ucyk7XG4gICAgICAgIH0pO1xuICAgICAgICBwZXJtaXNzaW9uc1ZpZXcuYXR0YWNoKCk7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChzZWxlY3RlZC52aWV3KCkuaXMoJy5kaXJlY3RvcnknKSkge1xuICAgICAgbGV0IGRpcmVjdG9yeSA9IHNlbGVjdGVkLnZpZXcoKTtcbiAgICAgIGlmIChkaXJlY3RvcnkpIHtcbiAgICAgICAgY29uc3QgcGVybWlzc2lvbnNWaWV3ID0gbmV3IFBlcm1pc3Npb25zVmlldyhkaXJlY3RvcnkpO1xuICAgICAgICBwZXJtaXNzaW9uc1ZpZXcub24oJ2NoYW5nZS1wZXJtaXNzaW9ucycsIChlLCByZXN1bHQpID0+IHtcbiAgICAgICAgICBzZWxmLmNobW9kRGlyZWN0b3J5KGRpcmVjdG9yeSwgcmVzdWx0LnBlcm1pc3Npb25zKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHBlcm1pc3Npb25zVmlldy5hdHRhY2goKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBjaG1vZEZpbGUoZmlsZSwgcGVybWlzc2lvbnMpIHtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcblxuICAgIGZpbGUuZ2V0Q29ubmVjdG9yKCkuY2htb2RGaWxlKGZpbGUuZ2V0UGF0aCh0cnVlKSArIGZpbGUubmFtZSwgcGVybWlzc2lvbnMpLnRoZW4oKHJlc3BvbnNlVGV4dCkgPT4ge1xuICAgICAgZmlsZS5yaWdodHMgPSBwZXJtaXNzaW9uc1RvUmlnaHRzKHBlcm1pc3Npb25zKTtcbiAgICB9KS5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICBzaG93TWVzc2FnZShlcnIubWVzc2FnZSwgJ2Vycm9yJyk7XG4gICAgfSk7XG4gIH1cblxuICBjaG1vZERpcmVjdG9yeShkaXJlY3RvcnksIHBlcm1pc3Npb25zKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG5cbiAgICBkaXJlY3RvcnkuZ2V0Q29ubmVjdG9yKCkuY2htb2REaXJlY3RvcnkoZGlyZWN0b3J5LmdldFBhdGgodHJ1ZSksIHBlcm1pc3Npb25zKS50aGVuKChyZXNwb25zZVRleHQpID0+IHtcbiAgICAgIGRpcmVjdG9yeS5yaWdodHMgPSBwZXJtaXNzaW9uc1RvUmlnaHRzKHBlcm1pc3Npb25zKTtcbiAgICB9KS5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICBzaG93TWVzc2FnZShlcnIubWVzc2FnZSwgJ2Vycm9yJyk7XG4gICAgfSk7XG4gIH1cblxuICByZWxvYWQoKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gICAgY29uc3Qgc2VsZWN0ZWQgPSBzZWxmLnRyZWVWaWV3Lmxpc3QuZmluZCgnLnNlbGVjdGVkJyk7XG5cbiAgICBpZiAoc2VsZWN0ZWQubGVuZ3RoID09PSAwKSByZXR1cm47XG5cbiAgICBpZiAoc2VsZWN0ZWQudmlldygpLmlzKCcuZmlsZScpKSB7XG4gICAgICBsZXQgZmlsZSA9IHNlbGVjdGVkLnZpZXcoKTtcbiAgICAgIGlmIChmaWxlKSB7XG4gICAgICAgIHNlbGYucmVsb2FkRmlsZShmaWxlKTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHNlbGVjdGVkLnZpZXcoKS5pcygnLmRpcmVjdG9yeScpIHx8IHNlbGVjdGVkLnZpZXcoKS5pcygnLnNlcnZlcicpKSB7XG4gICAgICBsZXQgZGlyZWN0b3J5ID0gc2VsZWN0ZWQudmlldygpO1xuICAgICAgaWYgKGRpcmVjdG9yeSkge1xuICAgICAgICBzZWxmLnJlbG9hZERpcmVjdG9yeShkaXJlY3RvcnkpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJlbG9hZEZpbGUoZmlsZSkge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuXG4gICAgY29uc3QgZnVsbFJlbGF0aXZlUGF0aCA9IG5vcm1hbGl6ZShmaWxlLmdldFBhdGgodHJ1ZSkgKyBmaWxlLm5hbWUpO1xuICAgIGNvbnN0IGZ1bGxMb2NhbFBhdGggPSBub3JtYWxpemUoZmlsZS5nZXRMb2NhbFBhdGgodHJ1ZSkgKyBmaWxlLm5hbWUsIFBhdGguc2VwKTtcblxuICAgIC8vIENoZWNrIGlmIGZpbGUgaXMgYWxyZWFkeSBvcGVuZWQgaW4gdGV4dGVkaXRvclxuICAgIGlmIChnZXRUZXh0RWRpdG9yKGZ1bGxMb2NhbFBhdGgsIHRydWUpKSB7XG4gICAgICBzZWxmLmRvd25sb2FkRmlsZShmaWxlLmdldFJvb3QoKSwgZnVsbFJlbGF0aXZlUGF0aCwgZnVsbExvY2FsUGF0aCwgeyBmaWxlc2l6ZTogZmlsZS5zaXplIH0pLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgc2hvd01lc3NhZ2UoZXJyLCAnZXJyb3InKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIHJlbG9hZERpcmVjdG9yeShkaXJlY3RvcnkpIHtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcblxuICAgIGRpcmVjdG9yeS5leHBhbmRlZCA9IGZhbHNlO1xuICAgIGRpcmVjdG9yeS5leHBhbmQoKTtcbiAgfVxuXG4gIGNvcHkoKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gICAgY29uc3Qgc2VsZWN0ZWQgPSBzZWxmLnRyZWVWaWV3Lmxpc3QuZmluZCgnLnNlbGVjdGVkJyk7XG5cbiAgICBpZiAoc2VsZWN0ZWQubGVuZ3RoID09PSAwKSByZXR1cm47XG4gICAgaWYgKCFTdG9yYWdlLmhhc1Bhc3N3b3JkKCkpIHJldHVybjtcblxuICAgIGxldCBlbGVtZW50ID0gc2VsZWN0ZWQudmlldygpO1xuICAgIGlmIChlbGVtZW50LmlzKCcuZmlsZScpKSB7XG4gICAgICBsZXQgc3RvcmFnZSA9IGVsZW1lbnQuc2VyaWFsaXplKCk7XG4gICAgICB3aW5kb3cuc2Vzc2lvblN0b3JhZ2UucmVtb3ZlSXRlbSgnZnRwLXJlbW90ZS1lZGl0OmN1dFBhdGgnKVxuICAgICAgd2luZG93LnNlc3Npb25TdG9yYWdlWydmdHAtcmVtb3RlLWVkaXQ6Y29weVBhdGgnXSA9IGVuY3J5cHQoU3RvcmFnZS5nZXRQYXNzd29yZCgpLCBKU09OLnN0cmluZ2lmeShzdG9yYWdlKSk7XG4gICAgfSBlbHNlIGlmIChlbGVtZW50LmlzKCcuZGlyZWN0b3J5JykpIHtcbiAgICAgIC8vIFRPRE9cbiAgICB9XG4gIH1cblxuICBjdXQoKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gICAgY29uc3Qgc2VsZWN0ZWQgPSBzZWxmLnRyZWVWaWV3Lmxpc3QuZmluZCgnLnNlbGVjdGVkJyk7XG5cbiAgICBpZiAoc2VsZWN0ZWQubGVuZ3RoID09PSAwKSByZXR1cm47XG4gICAgaWYgKCFTdG9yYWdlLmhhc1Bhc3N3b3JkKCkpIHJldHVybjtcblxuICAgIGxldCBlbGVtZW50ID0gc2VsZWN0ZWQudmlldygpO1xuXG4gICAgaWYgKGVsZW1lbnQuaXMoJy5maWxlJykgfHwgZWxlbWVudC5pcygnLmRpcmVjdG9yeScpKSB7XG4gICAgICBsZXQgc3RvcmFnZSA9IGVsZW1lbnQuc2VyaWFsaXplKCk7XG4gICAgICB3aW5kb3cuc2Vzc2lvblN0b3JhZ2UucmVtb3ZlSXRlbSgnZnRwLXJlbW90ZS1lZGl0OmNvcHlQYXRoJylcbiAgICAgIHdpbmRvdy5zZXNzaW9uU3RvcmFnZVsnZnRwLXJlbW90ZS1lZGl0OmN1dFBhdGgnXSA9IGVuY3J5cHQoU3RvcmFnZS5nZXRQYXNzd29yZCgpLCBKU09OLnN0cmluZ2lmeShzdG9yYWdlKSk7XG4gICAgfVxuICB9XG5cbiAgcGFzdGUoKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gICAgY29uc3Qgc2VsZWN0ZWQgPSBzZWxmLnRyZWVWaWV3Lmxpc3QuZmluZCgnLnNlbGVjdGVkJyk7XG5cbiAgICBpZiAoc2VsZWN0ZWQubGVuZ3RoID09PSAwKSByZXR1cm47XG4gICAgaWYgKCFTdG9yYWdlLmhhc1Bhc3N3b3JkKCkpIHJldHVybjtcblxuICAgIGxldCBkZXN0T2JqZWN0ID0gc2VsZWN0ZWQudmlldygpO1xuICAgIGlmIChkZXN0T2JqZWN0LmlzKCcuZmlsZScpKSB7XG4gICAgICBkZXN0T2JqZWN0ID0gZGVzdE9iamVjdC5wYXJlbnQ7XG4gICAgfVxuXG4gICAgbGV0IGRhdGFPYmplY3QgPSBudWxsO1xuICAgIGxldCBzcmNPYmplY3QgPSBudWxsO1xuICAgIGxldCBoYW5kbGVFdmVudCA9IG51bGw7XG5cbiAgICBsZXQgc3JjVHlwZSA9IG51bGw7XG4gICAgbGV0IHNyY1BhdGggPSBudWxsO1xuICAgIGxldCBkZXN0UGF0aCA9IG51bGw7XG5cbiAgICAvLyBQYXJzZSBkYXRhIGZyb20gY29weS9jdXQvZHJhZyBldmVudFxuICAgIGlmICh3aW5kb3cuc2Vzc2lvblN0b3JhZ2VbJ2Z0cC1yZW1vdGUtZWRpdDpjdXRQYXRoJ10pIHtcbiAgICAgIC8vIEN1dCBldmVudCBmcm9tIEF0b21cbiAgICAgIGhhbmRsZUV2ZW50ID0gXCJjdXRcIjtcblxuICAgICAgbGV0IGN1dE9iamVjdFN0cmluZyA9IGRlY3J5cHQoU3RvcmFnZS5nZXRQYXNzd29yZCgpLCB3aW5kb3cuc2Vzc2lvblN0b3JhZ2VbJ2Z0cC1yZW1vdGUtZWRpdDpjdXRQYXRoJ10pO1xuICAgICAgZGF0YU9iamVjdCA9IChjdXRPYmplY3RTdHJpbmcpID8gSlNPTi5wYXJzZShjdXRPYmplY3RTdHJpbmcpIDogbnVsbDtcblxuICAgICAgbGV0IGZpbmQgPSBzZWxmLnRyZWVWaWV3Lmxpc3QuZmluZCgnIycgKyBkYXRhT2JqZWN0LmlkKTtcbiAgICAgIGlmICghZmluZCkgcmV0dXJuO1xuXG4gICAgICBzcmNPYmplY3QgPSBmaW5kLnZpZXcoKTtcbiAgICAgIGlmICghc3JjT2JqZWN0KSByZXR1cm47XG5cbiAgICAgIGlmIChzcmNPYmplY3QuaXMoJy5kaXJlY3RvcnknKSkge1xuICAgICAgICBzcmNUeXBlID0gJ2RpcmVjdG9yeSc7XG4gICAgICAgIHNyY1BhdGggPSBzcmNPYmplY3QuZ2V0UGF0aCh0cnVlKTtcbiAgICAgICAgZGVzdFBhdGggPSBkZXN0T2JqZWN0LmdldFBhdGgodHJ1ZSkgKyBzcmNPYmplY3QubmFtZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNyY1R5cGUgPSAnZmlsZSc7XG4gICAgICAgIHNyY1BhdGggPSBzcmNPYmplY3QuZ2V0UGF0aCh0cnVlKSArIHNyY09iamVjdC5uYW1lO1xuICAgICAgICBkZXN0UGF0aCA9IGRlc3RPYmplY3QuZ2V0UGF0aCh0cnVlKSArIHNyY09iamVjdC5uYW1lO1xuICAgICAgfVxuXG4gICAgICAvLyBDaGVjayBpZiBjb3B5L2N1dCBvcGVyYXRpb24gc2hvdWxkIGJlIHBlcmZvcm1lZCBvbiB0aGUgc2FtZSBzZXJ2ZXJcbiAgICAgIGlmIChKU09OLnN0cmluZ2lmeShkZXN0T2JqZWN0LmNvbmZpZykgIT0gSlNPTi5zdHJpbmdpZnkoc3JjT2JqZWN0LmNvbmZpZykpIHJldHVybjtcblxuICAgICAgd2luZG93LnNlc3Npb25TdG9yYWdlLnJlbW92ZUl0ZW0oJ2Z0cC1yZW1vdGUtZWRpdDpjdXRQYXRoJyk7XG4gICAgICB3aW5kb3cuc2Vzc2lvblN0b3JhZ2UucmVtb3ZlSXRlbSgnZnRwLXJlbW90ZS1lZGl0OmNvcHlQYXRoJyk7XG4gICAgfSBlbHNlIGlmICh3aW5kb3cuc2Vzc2lvblN0b3JhZ2VbJ2Z0cC1yZW1vdGUtZWRpdDpjb3B5UGF0aCddKSB7XG4gICAgICAvLyBDb3B5IGV2ZW50IGZyb20gQXRvbVxuICAgICAgaGFuZGxlRXZlbnQgPSBcImNvcHlcIjtcblxuICAgICAgbGV0IGNvcGllZE9iamVjdFN0cmluZyA9IGRlY3J5cHQoU3RvcmFnZS5nZXRQYXNzd29yZCgpLCB3aW5kb3cuc2Vzc2lvblN0b3JhZ2VbJ2Z0cC1yZW1vdGUtZWRpdDpjb3B5UGF0aCddKTtcbiAgICAgIGRhdGFPYmplY3QgPSAoY29waWVkT2JqZWN0U3RyaW5nKSA/IEpTT04ucGFyc2UoY29waWVkT2JqZWN0U3RyaW5nKSA6IG51bGw7XG5cbiAgICAgIGxldCBmaW5kID0gc2VsZi50cmVlVmlldy5saXN0LmZpbmQoJyMnICsgZGF0YU9iamVjdC5pZCk7XG4gICAgICBpZiAoIWZpbmQpIHJldHVybjtcblxuICAgICAgc3JjT2JqZWN0ID0gZmluZC52aWV3KCk7XG4gICAgICBpZiAoIXNyY09iamVjdCkgcmV0dXJuO1xuXG4gICAgICBpZiAoc3JjT2JqZWN0LmlzKCcuZGlyZWN0b3J5JykpIHtcbiAgICAgICAgc3JjVHlwZSA9ICdkaXJlY3RvcnknO1xuICAgICAgICBzcmNQYXRoID0gc3JjT2JqZWN0LmdldFBhdGgodHJ1ZSk7XG4gICAgICAgIGRlc3RQYXRoID0gZGVzdE9iamVjdC5nZXRQYXRoKHRydWUpICsgc3JjT2JqZWN0Lm5hbWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzcmNUeXBlID0gJ2ZpbGUnO1xuICAgICAgICBzcmNQYXRoID0gc3JjT2JqZWN0LmdldFBhdGgodHJ1ZSkgKyBzcmNPYmplY3QubmFtZTtcbiAgICAgICAgZGVzdFBhdGggPSBkZXN0T2JqZWN0LmdldFBhdGgodHJ1ZSkgKyBzcmNPYmplY3QubmFtZTtcbiAgICAgIH1cblxuICAgICAgLy8gQ2hlY2sgaWYgY29weS9jdXQgb3BlcmF0aW9uIHNob3VsZCBiZSBwZXJmb3JtZWQgb24gdGhlIHNhbWUgc2VydmVyXG4gICAgICBpZiAoSlNPTi5zdHJpbmdpZnkoZGVzdE9iamVjdC5jb25maWcpICE9IEpTT04uc3RyaW5naWZ5KHNyY09iamVjdC5jb25maWcpKSByZXR1cm47XG5cbiAgICAgIHdpbmRvdy5zZXNzaW9uU3RvcmFnZS5yZW1vdmVJdGVtKCdmdHAtcmVtb3RlLWVkaXQ6Y3V0UGF0aCcpO1xuICAgICAgd2luZG93LnNlc3Npb25TdG9yYWdlLnJlbW92ZUl0ZW0oJ2Z0cC1yZW1vdGUtZWRpdDpjb3B5UGF0aCcpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKGhhbmRsZUV2ZW50ID09IFwiY3V0XCIpIHtcbiAgICAgIGlmIChzcmNUeXBlID09ICdkaXJlY3RvcnknKSBzZWxmLm1vdmVEaXJlY3RvcnkoZGVzdE9iamVjdC5nZXRSb290KCksIHNyY1BhdGgsIGRlc3RQYXRoKTtcbiAgICAgIGlmIChzcmNUeXBlID09ICdmaWxlJykgc2VsZi5tb3ZlRmlsZShkZXN0T2JqZWN0LmdldFJvb3QoKSwgc3JjUGF0aCwgZGVzdFBhdGgpO1xuICAgIH0gZWxzZSBpZiAoaGFuZGxlRXZlbnQgPT0gXCJjb3B5XCIpIHtcbiAgICAgIGlmIChzcmNUeXBlID09ICdkaXJlY3RvcnknKSBzZWxmLmNvcHlEaXJlY3RvcnkoZGVzdE9iamVjdC5nZXRSb290KCksIHNyY1BhdGgsIGRlc3RQYXRoKTtcbiAgICAgIGlmIChzcmNUeXBlID09ICdmaWxlJykgc2VsZi5jb3B5RmlsZShkZXN0T2JqZWN0LmdldFJvb3QoKSwgc3JjUGF0aCwgZGVzdFBhdGgsIHsgZmlsZXNpemU6IHNyY09iamVjdC5zaXplIH0pO1xuICAgIH1cbiAgfVxuXG4gIGRyb3AoZSkge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuICAgIGNvbnN0IHNlbGVjdGVkID0gc2VsZi50cmVlVmlldy5saXN0LmZpbmQoJy5zZWxlY3RlZCcpO1xuXG4gICAgaWYgKHNlbGVjdGVkLmxlbmd0aCA9PT0gMCkgcmV0dXJuO1xuICAgIGlmICghU3RvcmFnZS5oYXNQYXNzd29yZCgpKSByZXR1cm47XG5cbiAgICBsZXQgZGVzdE9iamVjdCA9IHNlbGVjdGVkLnZpZXcoKTtcbiAgICBpZiAoZGVzdE9iamVjdC5pcygnLmZpbGUnKSkge1xuICAgICAgZGVzdE9iamVjdCA9IGRlc3RPYmplY3QucGFyZW50O1xuICAgIH1cblxuICAgIGxldCBpbml0aWFsUGF0aCwgaW5pdGlhbE5hbWUsIGluaXRpYWxUeXBlLCByZWY7XG4gICAgaWYgKGVudHJ5ID0gZS50YXJnZXQuY2xvc2VzdCgnLmVudHJ5JykpIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG5cbiAgICAgIGlmICghZGVzdE9iamVjdC5pcygnLmRpcmVjdG9yeScpICYmICFkZXN0T2JqZWN0LmlzKCcuc2VydmVyJykpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAoZS5kYXRhVHJhbnNmZXIpIHtcbiAgICAgICAgaW5pdGlhbFBhdGggPSBlLmRhdGFUcmFuc2Zlci5nZXREYXRhKFwiaW5pdGlhbFBhdGhcIik7XG4gICAgICAgIGluaXRpYWxOYW1lID0gZS5kYXRhVHJhbnNmZXIuZ2V0RGF0YShcImluaXRpYWxOYW1lXCIpO1xuICAgICAgICBpbml0aWFsVHlwZSA9IGUuZGF0YVRyYW5zZmVyLmdldERhdGEoXCJpbml0aWFsVHlwZVwiKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGluaXRpYWxQYXRoID0gZS5vcmlnaW5hbEV2ZW50LmRhdGFUcmFuc2Zlci5nZXREYXRhKFwiaW5pdGlhbFBhdGhcIik7XG4gICAgICAgIGluaXRpYWxOYW1lID0gZS5vcmlnaW5hbEV2ZW50LmRhdGFUcmFuc2Zlci5nZXREYXRhKFwiaW5pdGlhbE5hbWVcIik7XG4gICAgICAgIGluaXRpYWxUeXBlID0gZS5vcmlnaW5hbEV2ZW50LmRhdGFUcmFuc2Zlci5nZXREYXRhKFwiaW5pdGlhbFR5cGVcIik7XG4gICAgICB9XG5cbiAgICAgIGlmIChpbml0aWFsVHlwZSA9PSBcImRpcmVjdG9yeVwiKSB7XG4gICAgICAgIGlmIChub3JtYWxpemUoaW5pdGlhbFBhdGgpID09IG5vcm1hbGl6ZShkZXN0T2JqZWN0LmdldFBhdGgoZmFsc2UpICsgaW5pdGlhbE5hbWUgKyAnLycpKSByZXR1cm47XG4gICAgICB9IGVsc2UgaWYgKGluaXRpYWxUeXBlID09IFwiZmlsZVwiKSB7XG4gICAgICAgIGlmIChub3JtYWxpemUoaW5pdGlhbFBhdGgpID09IG5vcm1hbGl6ZShkZXN0T2JqZWN0LmdldFBhdGgoZmFsc2UpICsgaW5pdGlhbE5hbWUpKSByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmIChpbml0aWFsUGF0aCkge1xuICAgICAgICAvLyBEcm9wIGV2ZW50IGZyb20gQXRvbVxuICAgICAgICBpZiAoaW5pdGlhbFR5cGUgPT0gXCJkaXJlY3RvcnlcIikge1xuICAgICAgICAgIGxldCBzcmNQYXRoID0gdHJhaWxpbmdzbGFzaGl0KGRlc3RPYmplY3QuZ2V0Um9vdCgpLmdldFBhdGgodHJ1ZSkpICsgaW5pdGlhbFBhdGg7XG4gICAgICAgICAgbGV0IGRlc3RQYXRoID0gZGVzdE9iamVjdC5nZXRQYXRoKHRydWUpICsgaW5pdGlhbE5hbWUgKyAnLyc7XG4gICAgICAgICAgc2VsZi5tb3ZlRGlyZWN0b3J5KGRlc3RPYmplY3QuZ2V0Um9vdCgpLCBzcmNQYXRoLCBkZXN0UGF0aCk7XG4gICAgICAgIH0gZWxzZSBpZiAoaW5pdGlhbFR5cGUgPT0gXCJmaWxlXCIpIHtcbiAgICAgICAgICBsZXQgc3JjUGF0aCA9IHRyYWlsaW5nc2xhc2hpdChkZXN0T2JqZWN0LmdldFJvb3QoKS5nZXRQYXRoKHRydWUpKSArIGluaXRpYWxQYXRoO1xuICAgICAgICAgIGxldCBkZXN0UGF0aCA9IGRlc3RPYmplY3QuZ2V0UGF0aCh0cnVlKSArIGluaXRpYWxOYW1lO1xuICAgICAgICAgIHNlbGYubW92ZUZpbGUoZGVzdE9iamVjdC5nZXRSb290KCksIHNyY1BhdGgsIGRlc3RQYXRoKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gRHJvcCBldmVudCBmcm9tIE9TXG4gICAgICAgIGlmIChlLmRhdGFUcmFuc2Zlcikge1xuICAgICAgICAgIHJlZiA9IGUuZGF0YVRyYW5zZmVyLmZpbGVzO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJlZiA9IGUub3JpZ2luYWxFdmVudC5kYXRhVHJhbnNmZXIuZmlsZXM7XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKGxldCBpID0gMCwgbGVuID0gcmVmLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgICAgbGV0IGZpbGUgPSByZWZbaV07XG4gICAgICAgICAgbGV0IHNyY1BhdGggPSBmaWxlLnBhdGg7XG4gICAgICAgICAgbGV0IGRlc3RQYXRoID0gZGVzdE9iamVjdC5nZXRQYXRoKHRydWUpICsgYmFzZW5hbWUoZmlsZS5wYXRoLCBQYXRoLnNlcCk7XG5cbiAgICAgICAgICBpZiAoRmlsZVN5c3RlbS5zdGF0U3luYyhmaWxlLnBhdGgpLmlzRGlyZWN0b3J5KCkpIHtcbiAgICAgICAgICAgIHNlbGYudXBsb2FkRGlyZWN0b3J5KGRlc3RPYmplY3QuZ2V0Um9vdCgpLCBzcmNQYXRoLCBkZXN0UGF0aCkuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICAgICAgICBzaG93TWVzc2FnZShlcnIsICdlcnJvcicpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHNlbGYudXBsb2FkRmlsZShkZXN0T2JqZWN0LmdldFJvb3QoKSwgc3JjUGF0aCwgZGVzdFBhdGgpLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgICAgICAgc2hvd01lc3NhZ2UoZXJyLCAnZXJyb3InKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHVwbG9hZCh0eXBlKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gICAgY29uc3Qgc2VsZWN0ZWQgPSBzZWxmLnRyZWVWaWV3Lmxpc3QuZmluZCgnLnNlbGVjdGVkJyk7XG5cbiAgICBpZiAoc2VsZWN0ZWQubGVuZ3RoID09PSAwKSByZXR1cm47XG4gICAgaWYgKCFTdG9yYWdlLmhhc1Bhc3N3b3JkKCkpIHJldHVybjtcblxuICAgIGxldCBkZXN0T2JqZWN0ID0gc2VsZWN0ZWQudmlldygpO1xuICAgIGlmIChkZXN0T2JqZWN0LmlzKCcuZmlsZScpKSB7XG4gICAgICBkZXN0T2JqZWN0ID0gZGVzdE9iamVjdC5wYXJlbnQ7XG4gICAgfVxuXG4gICAgbGV0IGRlZmF1bHRQYXRoID0gYXRvbS5jb25maWcuZ2V0KCdmdHAtcmVtb3RlLWVkaXQudHJhbnNmZXIuZGVmYXVsdFVwbG9hZFBhdGgnKSB8fCAnZGVza3RvcCc7XG4gICAgaWYgKGRlZmF1bHRQYXRoID09ICdwcm9qZWN0Jykge1xuICAgICAgY29uc3QgcHJvamVjdHMgPSBhdG9tLnByb2plY3QuZ2V0UGF0aHMoKTtcbiAgICAgIGRlZmF1bHRQYXRoID0gcHJvamVjdHMuc2hpZnQoKTtcbiAgICB9IGVsc2UgaWYgKGRlZmF1bHRQYXRoID09ICdkZXNrdG9wJykge1xuICAgICAgZGVmYXVsdFBhdGggPSBFbGVjdHJvbi5yZW1vdGUuYXBwLmdldFBhdGgoXCJkZXNrdG9wXCIpXG4gICAgfSBlbHNlIGlmIChkZWZhdWx0UGF0aCA9PSAnZG93bmxvYWRzJykge1xuICAgICAgZGVmYXVsdFBhdGggPSBFbGVjdHJvbi5yZW1vdGUuYXBwLmdldFBhdGgoXCJkb3dubG9hZHNcIilcbiAgICB9XG4gICAgbGV0IHNyY1BhdGggPSBudWxsO1xuICAgIGxldCBkZXN0UGF0aCA9IG51bGw7XG5cbiAgICBpZiAodHlwZSA9PSAnZmlsZScpIHtcbiAgICAgIEVsZWN0cm9uLnJlbW90ZS5kaWFsb2cuc2hvd09wZW5EaWFsb2cobnVsbCwgeyB0aXRsZTogJ1NlbGVjdCBmaWxlKHMpIGZvciB1cGxvYWQuLi4nLCBkZWZhdWx0UGF0aDogZGVmYXVsdFBhdGgsIGJ1dHRvbkxhYmVsOiAnVXBsb2FkJywgcHJvcGVydGllczogWydvcGVuRmlsZScsICdtdWx0aVNlbGVjdGlvbnMnLCAnc2hvd0hpZGRlbkZpbGVzJ10gfSwgKGZpbGVQYXRocywgYm9va21hcmtzKSA9PiB7XG4gICAgICAgIGlmIChmaWxlUGF0aHMpIHtcbiAgICAgICAgICBQcm9taXNlLmFsbChmaWxlUGF0aHMubWFwKChmaWxlUGF0aCkgPT4ge1xuICAgICAgICAgICAgc3JjUGF0aCA9IGZpbGVQYXRoO1xuICAgICAgICAgICAgZGVzdFBhdGggPSBkZXN0T2JqZWN0LmdldFBhdGgodHJ1ZSkgKyBiYXNlbmFtZShmaWxlUGF0aCwgUGF0aC5zZXApO1xuICAgICAgICAgICAgcmV0dXJuIHNlbGYudXBsb2FkRmlsZShkZXN0T2JqZWN0LmdldFJvb3QoKSwgc3JjUGF0aCwgZGVzdFBhdGgpO1xuICAgICAgICAgIH0pKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIHNob3dNZXNzYWdlKCdGaWxlKHMpIGhhcyBiZWVuIHVwbG9hZGVkIHRvOiBcXHIgXFxuJyArIGZpbGVQYXRocy5qb2luKCdcXHIgXFxuJyksICdzdWNjZXNzJyk7XG4gICAgICAgICAgfSkuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICAgICAgc2hvd01lc3NhZ2UoZXJyLCAnZXJyb3InKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSBlbHNlIGlmICh0eXBlID09ICdkaXJlY3RvcnknKSB7XG4gICAgICBFbGVjdHJvbi5yZW1vdGUuZGlhbG9nLnNob3dPcGVuRGlhbG9nKG51bGwsIHsgdGl0bGU6ICdTZWxlY3QgZGlyZWN0b3J5IGZvciB1cGxvYWQuLi4nLCBkZWZhdWx0UGF0aDogZGVmYXVsdFBhdGgsIGJ1dHRvbkxhYmVsOiAnVXBsb2FkJywgcHJvcGVydGllczogWydvcGVuRGlyZWN0b3J5JywgJ3Nob3dIaWRkZW5GaWxlcyddIH0sIChkaXJlY3RvcnlQYXRocywgYm9va21hcmtzKSA9PiB7XG4gICAgICAgIGlmIChkaXJlY3RvcnlQYXRocykge1xuICAgICAgICAgIGRpcmVjdG9yeVBhdGhzLmZvckVhY2goKGRpcmVjdG9yeVBhdGgsIGluZGV4KSA9PiB7XG4gICAgICAgICAgICBzcmNQYXRoID0gZGlyZWN0b3J5UGF0aDtcbiAgICAgICAgICAgIGRlc3RQYXRoID0gZGVzdE9iamVjdC5nZXRQYXRoKHRydWUpICsgYmFzZW5hbWUoZGlyZWN0b3J5UGF0aCwgUGF0aC5zZXApO1xuXG4gICAgICAgICAgICBzZWxmLnVwbG9hZERpcmVjdG9yeShkZXN0T2JqZWN0LmdldFJvb3QoKSwgc3JjUGF0aCwgZGVzdFBhdGgpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICBzaG93TWVzc2FnZSgnRGlyZWN0b3J5IGhhcyBiZWVuIHVwbG9hZGVkIHRvICcgKyBkZXN0UGF0aCwgJ3N1Y2Nlc3MnKTtcbiAgICAgICAgICAgIH0pLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgICAgICAgc2hvd01lc3NhZ2UoZXJyLCAnZXJyb3InKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBkb3dubG9hZCgpIHtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcbiAgICBjb25zdCBzZWxlY3RlZCA9IHNlbGYudHJlZVZpZXcubGlzdC5maW5kKCcuc2VsZWN0ZWQnKTtcblxuICAgIGlmIChzZWxlY3RlZC5sZW5ndGggPT09IDApIHJldHVybjtcbiAgICBpZiAoIVN0b3JhZ2UuaGFzUGFzc3dvcmQoKSkgcmV0dXJuO1xuXG4gICAgbGV0IGRlZmF1bHRQYXRoID0gYXRvbS5jb25maWcuZ2V0KCdmdHAtcmVtb3RlLWVkaXQudHJhbnNmZXIuZGVmYXVsdERvd25sb2FkUGF0aCcpIHx8ICdkb3dubG9hZHMnO1xuICAgIGlmIChkZWZhdWx0UGF0aCA9PSAncHJvamVjdCcpIHtcbiAgICAgIGNvbnN0IHByb2plY3RzID0gYXRvbS5wcm9qZWN0LmdldFBhdGhzKCk7XG4gICAgICBkZWZhdWx0UGF0aCA9IHByb2plY3RzLnNoaWZ0KCk7XG4gICAgfSBlbHNlIGlmIChkZWZhdWx0UGF0aCA9PSAnZGVza3RvcCcpIHtcbiAgICAgIGRlZmF1bHRQYXRoID0gRWxlY3Ryb24ucmVtb3RlLmFwcC5nZXRQYXRoKFwiZGVza3RvcFwiKVxuICAgIH0gZWxzZSBpZiAoZGVmYXVsdFBhdGggPT0gJ2Rvd25sb2FkcycpIHtcbiAgICAgIGRlZmF1bHRQYXRoID0gRWxlY3Ryb24ucmVtb3RlLmFwcC5nZXRQYXRoKFwiZG93bmxvYWRzXCIpXG4gICAgfVxuXG4gICAgaWYgKHNlbGVjdGVkLnZpZXcoKS5pcygnLmZpbGUnKSkge1xuICAgICAgbGV0IGZpbGUgPSBzZWxlY3RlZC52aWV3KCk7XG4gICAgICBpZiAoZmlsZSkge1xuICAgICAgICBjb25zdCBzcmNQYXRoID0gbm9ybWFsaXplKGZpbGUuZ2V0UGF0aCh0cnVlKSArIGZpbGUubmFtZSk7XG5cbiAgICAgICAgRWxlY3Ryb24ucmVtb3RlLmRpYWxvZy5zaG93U2F2ZURpYWxvZyhudWxsLCB7IGRlZmF1bHRQYXRoOiBkZWZhdWx0UGF0aCArIFwiL1wiICsgZmlsZS5uYW1lIH0sIChkZXN0UGF0aCkgPT4ge1xuICAgICAgICAgIGlmIChkZXN0UGF0aCkge1xuICAgICAgICAgICAgc2VsZi5kb3dubG9hZEZpbGUoZmlsZS5nZXRSb290KCksIHNyY1BhdGgsIGRlc3RQYXRoLCB7IGZpbGVzaXplOiBmaWxlLnNpemUgfSkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgIHNob3dNZXNzYWdlKCdGaWxlIGhhcyBiZWVuIGRvd25sb2FkZWQgdG8gJyArIGRlc3RQYXRoLCAnc3VjY2VzcycpO1xuICAgICAgICAgICAgfSkuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICAgICAgICBzaG93TWVzc2FnZShlcnIsICdlcnJvcicpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHNlbGVjdGVkLnZpZXcoKS5pcygnLmRpcmVjdG9yeScpKSB7XG4gICAgICBsZXQgZGlyZWN0b3J5ID0gc2VsZWN0ZWQudmlldygpO1xuICAgICAgaWYgKGRpcmVjdG9yeSkge1xuICAgICAgICBjb25zdCBzcmNQYXRoID0gbm9ybWFsaXplKGRpcmVjdG9yeS5nZXRQYXRoKHRydWUpKTtcblxuICAgICAgICBFbGVjdHJvbi5yZW1vdGUuZGlhbG9nLnNob3dTYXZlRGlhbG9nKG51bGwsIHsgZGVmYXVsdFBhdGg6IGRlZmF1bHRQYXRoICsgXCIvXCIgKyBkaXJlY3RvcnkubmFtZSB9LCAoZGVzdFBhdGgpID0+IHtcbiAgICAgICAgICBpZiAoZGVzdFBhdGgpIHtcbiAgICAgICAgICAgIHNlbGYuZG93bmxvYWREaXJlY3RvcnkoZGlyZWN0b3J5LmdldFJvb3QoKSwgc3JjUGF0aCwgZGVzdFBhdGgpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICBzaG93TWVzc2FnZSgnRGlyZWN0b3J5IGhhcyBiZWVuIGRvd25sb2FkZWQgdG8gJyArIGRlc3RQYXRoLCAnc3VjY2VzcycpO1xuICAgICAgICAgICAgfSkuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICAgICAgICBzaG93TWVzc2FnZShlcnIsICdlcnJvcicpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHNlbGVjdGVkLnZpZXcoKS5pcygnLnNlcnZlcicpKSB7XG4gICAgICBsZXQgc2VydmVyID0gc2VsZWN0ZWQudmlldygpO1xuICAgICAgaWYgKHNlcnZlcikge1xuICAgICAgICBjb25zdCBzcmNQYXRoID0gbm9ybWFsaXplKHNlcnZlci5nZXRQYXRoKHRydWUpKTtcblxuICAgICAgICBFbGVjdHJvbi5yZW1vdGUuZGlhbG9nLnNob3dTYXZlRGlhbG9nKG51bGwsIHsgZGVmYXVsdFBhdGg6IGRlZmF1bHRQYXRoICsgXCIvXCIgfSwgKGRlc3RQYXRoKSA9PiB7XG4gICAgICAgICAgaWYgKGRlc3RQYXRoKSB7XG4gICAgICAgICAgICBzZWxmLmRvd25sb2FkRGlyZWN0b3J5KHNlcnZlciwgc3JjUGF0aCwgZGVzdFBhdGgpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICBzaG93TWVzc2FnZSgnRGlyZWN0b3J5IGhhcyBiZWVuIGRvd25sb2FkZWQgdG8gJyArIGRlc3RQYXRoLCAnc3VjY2VzcycpO1xuICAgICAgICAgICAgfSkuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICAgICAgICBzaG93TWVzc2FnZShlcnIsICdlcnJvcicpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBtb3ZlRmlsZShzZXJ2ZXIsIHNyY1BhdGgsIGRlc3RQYXRoKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG5cbiAgICBpZiAobm9ybWFsaXplKHNyY1BhdGgpID09IG5vcm1hbGl6ZShkZXN0UGF0aCkpIHJldHVybjtcblxuICAgIHNlcnZlci5nZXRDb25uZWN0b3IoKS5leGlzdHNGaWxlKGRlc3RQYXRoKS50aGVuKChyZXN1bHQpID0+IHtcbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgIGF0b20uY29uZmlybSh7XG4gICAgICAgICAgbWVzc2FnZTogJ0ZpbGUgYWxyZWFkeSBleGlzdHMuIEFyZSB5b3Ugc3VyZSB5b3Ugd2FudCB0byBvdmVyd3JpdGUgdGhpcyBmaWxlPycsXG4gICAgICAgICAgZGV0YWlsZWRNZXNzYWdlOiBcIllvdSBhcmUgb3ZlcndyaXRlOlxcblwiICsgZGVzdFBhdGgudHJpbSgpLFxuICAgICAgICAgIGJ1dHRvbnM6IHtcbiAgICAgICAgICAgIFllczogKCkgPT4ge1xuICAgICAgICAgICAgICBzZXJ2ZXIuZ2V0Q29ubmVjdG9yKCkuZGVsZXRlRmlsZShkZXN0UGF0aCkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgcmVqZWN0KHRydWUpO1xuICAgICAgICAgICAgICB9KS5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgICAgICAgICAgc2hvd01lc3NhZ2UoZXJyLm1lc3NhZ2UsICdlcnJvcicpO1xuICAgICAgICAgICAgICAgIHJlc29sdmUoZmFsc2UpO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBDYW5jZWw6ICgpID0+IHtcbiAgICAgICAgICAgICAgcmVzb2x2ZShmYWxzZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0pLmNhdGNoKCgpID0+IHtcbiAgICAgIHNlcnZlci5nZXRDb25uZWN0b3IoKS5yZW5hbWUoc3JjUGF0aCwgZGVzdFBhdGgpLnRoZW4oKCkgPT4ge1xuICAgICAgICAvLyBnZXQgaW5mbyBmcm9tIG9sZCBvYmplY3RcbiAgICAgICAgbGV0IG9sZE9iamVjdCA9IHNlbGYudHJlZVZpZXcuZmluZEVsZW1lbnRCeVBhdGgoc2VydmVyLCB0cmFpbGluZ3NsYXNoaXQoc3JjUGF0aC5yZXBsYWNlKHNlcnZlci5jb25maWcucmVtb3RlLCAnJykpKTtcbiAgICAgICAgY29uc3QgY2FjaGVQYXRoID0gbm9ybWFsaXplKGRlc3RQYXRoLnJlcGxhY2Uoc2VydmVyLmdldFJvb3QoKS5jb25maWcucmVtb3RlLCAnLycpKTtcblxuICAgICAgICAvLyBBZGQgdG8gdHJlZVxuICAgICAgICBsZXQgZWxlbWVudCA9IHNlbGYudHJlZVZpZXcuYWRkRmlsZShzZXJ2ZXIsIGNhY2hlUGF0aCwgeyBzaXplOiAob2xkT2JqZWN0KSA/IG9sZE9iamVjdC5zaXplIDogbnVsbCwgcmlnaHRzOiAob2xkT2JqZWN0KSA/IG9sZE9iamVjdC5yaWdodHMgOiBudWxsIH0pO1xuICAgICAgICBpZiAoZWxlbWVudC5pc1Zpc2libGUoKSkge1xuICAgICAgICAgIGVsZW1lbnQuc2VsZWN0KCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBSZWZyZXNoIGNhY2hlXG4gICAgICAgIHNlcnZlci5nZXRGaW5kZXJDYWNoZSgpLnJlbmFtZUZpbGUobm9ybWFsaXplKHNyY1BhdGgucmVwbGFjZShzZXJ2ZXIuY29uZmlnLnJlbW90ZSwgJy8nKSksIG5vcm1hbGl6ZShkZXN0UGF0aC5yZXBsYWNlKHNlcnZlci5jb25maWcucmVtb3RlLCAnLycpKSwgKG9sZE9iamVjdCkgPyBvbGRPYmplY3Quc2l6ZSA6IDApO1xuXG4gICAgICAgIGlmIChvbGRPYmplY3QpIHtcbiAgICAgICAgICAvLyBDaGVjayBpZiBmaWxlIGlzIGFscmVhZHkgb3BlbmVkIGluIHRleHRlZGl0b3JcbiAgICAgICAgICBsZXQgZm91bmQgPSBnZXRUZXh0RWRpdG9yKG9sZE9iamVjdC5nZXRMb2NhbFBhdGgodHJ1ZSkgKyBvbGRPYmplY3QubmFtZSk7XG4gICAgICAgICAgaWYgKGZvdW5kKSB7XG4gICAgICAgICAgICBlbGVtZW50LmFkZENsYXNzKCdvcGVuJyk7XG4gICAgICAgICAgICBmb3VuZC5zYXZlT2JqZWN0ID0gZWxlbWVudDtcbiAgICAgICAgICAgIGZvdW5kLnNhdmVBcyhlbGVtZW50LmdldExvY2FsUGF0aCh0cnVlKSArIGVsZW1lbnQubmFtZSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gTW92ZSBsb2NhbCBmaWxlXG4gICAgICAgICAgbW92ZUxvY2FsUGF0aChvbGRPYmplY3QuZ2V0TG9jYWxQYXRoKHRydWUpICsgb2xkT2JqZWN0Lm5hbWUsIGVsZW1lbnQuZ2V0TG9jYWxQYXRoKHRydWUpICsgZWxlbWVudC5uYW1lKTtcblxuICAgICAgICAgIC8vIFJlbW92ZSBvbGQgb2JqZWN0XG4gICAgICAgICAgb2xkT2JqZWN0LnJlbW92ZSgpO1xuICAgICAgICB9XG4gICAgICB9KS5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgIHNob3dNZXNzYWdlKGVyci5tZXNzYWdlLCAnZXJyb3InKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgbW92ZURpcmVjdG9yeShzZXJ2ZXIsIHNyY1BhdGgsIGRlc3RQYXRoKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG5cbiAgICBpbml0aWFsUGF0aCA9IHRyYWlsaW5nc2xhc2hpdChzcmNQYXRoKTtcbiAgICBkZXN0UGF0aCA9IHRyYWlsaW5nc2xhc2hpdChkZXN0UGF0aCk7XG5cbiAgICBpZiAobm9ybWFsaXplKHNyY1BhdGgpID09IG5vcm1hbGl6ZShkZXN0UGF0aCkpIHJldHVybjtcblxuICAgIHNlcnZlci5nZXRDb25uZWN0b3IoKS5leGlzdHNEaXJlY3RvcnkoZGVzdFBhdGgpLnRoZW4oKHJlc3VsdCkgPT4ge1xuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgYXRvbS5jb25maXJtKHtcbiAgICAgICAgICBtZXNzYWdlOiAnRGlyZWN0b3J5IGFscmVhZHkgZXhpc3RzLiBBcmUgeW91IHN1cmUgeW91IHdhbnQgdG8gb3ZlcndyaXRlIHRoaXMgZGlyZWN0b3J5PycsXG4gICAgICAgICAgZGV0YWlsZWRNZXNzYWdlOiBcIllvdSBhcmUgb3ZlcndyaXRlOlxcblwiICsgZGVzdFBhdGgudHJpbSgpLFxuICAgICAgICAgIGJ1dHRvbnM6IHtcbiAgICAgICAgICAgIFllczogKCkgPT4ge1xuICAgICAgICAgICAgICBzZXJ2ZXIuZ2V0Q29ubmVjdG9yKCkuZGVsZXRlRGlyZWN0b3J5KGRlc3RQYXRoLCByZWN1cnNpdmUpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgIHJlamVjdCh0cnVlKTtcbiAgICAgICAgICAgICAgfSkuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICAgICAgICAgIHNob3dNZXNzYWdlKGVyci5tZXNzYWdlLCAnZXJyb3InKTtcbiAgICAgICAgICAgICAgICByZXNvbHZlKGZhbHNlKTtcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgQ2FuY2VsOiAoKSA9PiB7XG4gICAgICAgICAgICAgIHJlc29sdmUoZmFsc2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9KS5jYXRjaCgoKSA9PiB7XG4gICAgICBzZXJ2ZXIuZ2V0Q29ubmVjdG9yKCkucmVuYW1lKHNyY1BhdGgsIGRlc3RQYXRoKS50aGVuKCgpID0+IHtcbiAgICAgICAgLy8gZ2V0IGluZm8gZnJvbSBvbGQgb2JqZWN0XG4gICAgICAgIGxldCBvbGRPYmplY3QgPSBzZWxmLnRyZWVWaWV3LmZpbmRFbGVtZW50QnlQYXRoKHNlcnZlciwgdHJhaWxpbmdzbGFzaGl0KHNyY1BhdGgucmVwbGFjZShzZXJ2ZXIuY29uZmlnLnJlbW90ZSwgJycpKSk7XG4gICAgICAgIGNvbnN0IGNhY2hlUGF0aCA9IG5vcm1hbGl6ZShkZXN0UGF0aC5yZXBsYWNlKHNlcnZlci5nZXRSb290KCkuY29uZmlnLnJlbW90ZSwgJy8nKSk7XG5cbiAgICAgICAgLy8gQWRkIHRvIHRyZWVcbiAgICAgICAgbGV0IGVsZW1lbnQgPSBzZWxmLnRyZWVWaWV3LmFkZERpcmVjdG9yeShzZXJ2ZXIuZ2V0Um9vdCgpLCBjYWNoZVBhdGgsIHsgc2l6ZTogKG9sZE9iamVjdCkgPyBvbGRPYmplY3Quc2l6ZSA6IG51bGwsIHJpZ2h0czogKG9sZE9iamVjdCkgPyBvbGRPYmplY3QucmlnaHRzIDogbnVsbCB9KTtcbiAgICAgICAgaWYgKGVsZW1lbnQuaXNWaXNpYmxlKCkpIHtcbiAgICAgICAgICBlbGVtZW50LnNlbGVjdCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gUmVmcmVzaCBjYWNoZVxuICAgICAgICBzZXJ2ZXIuZ2V0RmluZGVyQ2FjaGUoKS5yZW5hbWVEaXJlY3Rvcnkobm9ybWFsaXplKHNyY1BhdGgucmVwbGFjZShzZXJ2ZXIuY29uZmlnLnJlbW90ZSwgJy8nKSksIG5vcm1hbGl6ZShkZXN0UGF0aC5yZXBsYWNlKHNlcnZlci5jb25maWcucmVtb3RlLCAnLycpKSk7XG5cbiAgICAgICAgaWYgKG9sZE9iamVjdCkge1xuICAgICAgICAgIC8vIFRPRE9cbiAgICAgICAgICAvLyBDaGVjayBpZiBmaWxlIGlzIGFscmVhZHkgb3BlbmVkIGluIHRleHRlZGl0b3JcblxuICAgICAgICAgIC8vIE1vdmUgbG9jYWwgZmlsZVxuICAgICAgICAgIG1vdmVMb2NhbFBhdGgob2xkT2JqZWN0LmdldExvY2FsUGF0aCh0cnVlKSwgZWxlbWVudC5nZXRMb2NhbFBhdGgodHJ1ZSkpO1xuXG4gICAgICAgICAgLy8gUmVtb3ZlIG9sZCBvYmplY3RcbiAgICAgICAgICBpZiAob2xkT2JqZWN0KSBvbGRPYmplY3QucmVtb3ZlKCk7XG4gICAgICAgIH1cbiAgICAgIH0pLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgc2hvd01lc3NhZ2UoZXJyLm1lc3NhZ2UsICdlcnJvcicpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICBjb3B5RmlsZShzZXJ2ZXIsIHNyY1BhdGgsIGRlc3RQYXRoLCBwYXJhbSA9IHt9KSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG5cbiAgICBjb25zdCBzcmNMb2NhbFBhdGggPSBub3JtYWxpemUoc2VydmVyLmdldExvY2FsUGF0aChmYWxzZSkgKyBzcmNQYXRoLCBQYXRoLnNlcCk7XG4gICAgY29uc3QgZGVzdExvY2FsUGF0aCA9IG5vcm1hbGl6ZShzZXJ2ZXIuZ2V0TG9jYWxQYXRoKGZhbHNlKSArIGRlc3RQYXRoLCBQYXRoLnNlcCk7XG5cbiAgICAvLyBSZW5hbWUgZmlsZSBpZiBleGlzdHNcbiAgICBpZiAoc3JjUGF0aCA9PSBkZXN0UGF0aCkge1xuICAgICAgbGV0IG9yaWdpbmFsUGF0aCA9IG5vcm1hbGl6ZShkZXN0UGF0aCk7XG4gICAgICBsZXQgcGFyZW50UGF0aCA9IG5vcm1hbGl6ZShkaXJuYW1lKGRlc3RQYXRoKSk7XG5cbiAgICAgIHNlcnZlci5nZXRDb25uZWN0b3IoKS5saXN0RGlyZWN0b3J5KHBhcmVudFBhdGgpLnRoZW4oKGxpc3QpID0+IHtcbiAgICAgICAgbGV0IGZpbGVzID0gW107XG4gICAgICAgIGxldCBmaWxlTGlzdCA9IGxpc3QuZmlsdGVyKChpdGVtKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIGl0ZW0udHlwZSA9PT0gJy0nO1xuICAgICAgICB9KTtcblxuICAgICAgICBmaWxlTGlzdC5mb3JFYWNoKChlbGVtZW50KSA9PiB7XG4gICAgICAgICAgZmlsZXMucHVzaChlbGVtZW50Lm5hbWUpO1xuICAgICAgICB9KTtcblxuICAgICAgICBsZXQgZmlsZVBhdGg7XG4gICAgICAgIGxldCBmaWxlQ291bnRlciA9IDA7XG4gICAgICAgIGNvbnN0IGV4dGVuc2lvbiA9IGdldEZ1bGxFeHRlbnNpb24ob3JpZ2luYWxQYXRoKTtcblxuICAgICAgICAvLyBhcHBlbmQgYSBudW1iZXIgdG8gdGhlIGZpbGUgaWYgYW4gaXRlbSB3aXRoIHRoZSBzYW1lIG5hbWUgZXhpc3RzXG4gICAgICAgIHdoaWxlIChmaWxlcy5pbmNsdWRlcyhiYXNlbmFtZShkZXN0UGF0aCkpKSB7XG4gICAgICAgICAgZmlsZVBhdGggPSBQYXRoLmRpcm5hbWUob3JpZ2luYWxQYXRoKSArICcvJyArIFBhdGguYmFzZW5hbWUob3JpZ2luYWxQYXRoLCBleHRlbnNpb24pO1xuICAgICAgICAgIGRlc3RQYXRoID0gZmlsZVBhdGggKyBmaWxlQ291bnRlciArIGV4dGVuc2lvbjtcbiAgICAgICAgICBmaWxlQ291bnRlciArPSAxO1xuICAgICAgICB9XG5cbiAgICAgICAgc2VsZi5jb3B5RmlsZShzZXJ2ZXIsIHNyY1BhdGgsIGRlc3RQYXRoKTtcbiAgICAgIH0pLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgc2hvd01lc3NhZ2UoZXJyLm1lc3NhZ2UsICdlcnJvcicpO1xuICAgICAgfSk7XG5cbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBzZXJ2ZXIuZ2V0Q29ubmVjdG9yKCkuZXhpc3RzRmlsZShkZXN0UGF0aCkudGhlbigocmVzdWx0KSA9PiB7XG4gICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICBhdG9tLmNvbmZpcm0oe1xuICAgICAgICAgIG1lc3NhZ2U6ICdGaWxlIGFscmVhZHkgZXhpc3RzLiBBcmUgeW91IHN1cmUgeW91IHdhbnQgdG8gb3ZlcndyaXRlIHRoaXMgZmlsZT8nLFxuICAgICAgICAgIGRldGFpbGVkTWVzc2FnZTogXCJZb3UgYXJlIG92ZXJ3cml0ZTpcXG5cIiArIGRlc3RQYXRoLnRyaW0oKSxcbiAgICAgICAgICBidXR0b25zOiB7XG4gICAgICAgICAgICBZZXM6ICgpID0+IHtcbiAgICAgICAgICAgICAgZmlsZWV4aXN0cyA9IHRydWU7XG4gICAgICAgICAgICAgIHJlamVjdCh0cnVlKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBDYW5jZWw6ICgpID0+IHtcbiAgICAgICAgICAgICAgcmVzb2x2ZShmYWxzZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0pLmNhdGNoKCgpID0+IHtcbiAgICAgIC8vIENyZWF0ZSBsb2NhbCBEaXJlY3Rvcmllc1xuICAgICAgY3JlYXRlTG9jYWxQYXRoKHNyY0xvY2FsUGF0aCk7XG4gICAgICBjcmVhdGVMb2NhbFBhdGgoZGVzdExvY2FsUGF0aCk7XG5cbiAgICAgIHNlbGYuZG93bmxvYWRGaWxlKHNlcnZlciwgc3JjUGF0aCwgZGVzdExvY2FsUGF0aCwgcGFyYW0pLnRoZW4oKCkgPT4ge1xuICAgICAgICBzZWxmLnVwbG9hZEZpbGUoc2VydmVyLCBkZXN0TG9jYWxQYXRoLCBkZXN0UGF0aCkudGhlbigoZHVwbGljYXRlZEZpbGUpID0+IHtcbiAgICAgICAgICBpZiAoZHVwbGljYXRlZEZpbGUpIHtcbiAgICAgICAgICAgIC8vIE9wZW4gZmlsZSBhbmQgYWRkIGhhbmRsZXIgdG8gZWRpdG9yIHRvIHVwbG9hZCBmaWxlIG9uIHNhdmVcbiAgICAgICAgICAgIHJldHVybiBzZWxmLm9wZW5GaWxlSW5FZGl0b3IoZHVwbGljYXRlZEZpbGUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSkuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICAgIHNob3dNZXNzYWdlKGVyciwgJ2Vycm9yJyk7XG4gICAgICAgIH0pO1xuICAgICAgfSkuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICBzaG93TWVzc2FnZShlcnIsICdlcnJvcicpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICBjb3B5RGlyZWN0b3J5KHNlcnZlciwgc3JjUGF0aCwgZGVzdFBhdGgpIHtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcblxuICAgIGlmIChub3JtYWxpemUoc3JjUGF0aCkgPT0gbm9ybWFsaXplKGRlc3RQYXRoKSkgcmV0dXJuO1xuXG4gICAgLy8gVE9ET1xuICAgIGNvbnNvbGUubG9nKCdUT0RPIGNvcHknLCBzcmNQYXRoLCBkZXN0UGF0aCk7XG4gIH1cblxuICB1cGxvYWRGaWxlKHNlcnZlciwgc3JjUGF0aCwgZGVzdFBhdGgsIGNoZWNrRmlsZUV4aXN0cyA9IHRydWUpIHtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcblxuICAgIGlmIChjaGVja0ZpbGVFeGlzdHMpIHtcbiAgICAgIGxldCBwcm9taXNlID0gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICByZXR1cm4gc2VydmVyLmdldENvbm5lY3RvcigpLmV4aXN0c0ZpbGUoZGVzdFBhdGgpLnRoZW4oKHJlc3VsdCkgPT4ge1xuICAgICAgICAgIGNvbnN0IGNhY2hlUGF0aCA9IG5vcm1hbGl6ZShkZXN0UGF0aC5yZXBsYWNlKHNlcnZlci5nZXRSb290KCkuY29uZmlnLnJlbW90ZSwgJy8nKSk7XG5cbiAgICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgYXRvbS5jb25maXJtKHtcbiAgICAgICAgICAgICAgbWVzc2FnZTogJ0ZpbGUgYWxyZWFkeSBleGlzdHMuIEFyZSB5b3Ugc3VyZSB5b3Ugd2FudCB0byBvdmVyd3JpdGUgdGhpcyBmaWxlPycsXG4gICAgICAgICAgICAgIGRldGFpbGVkTWVzc2FnZTogXCJZb3UgYXJlIG92ZXJ3cml0ZTpcXG5cIiArIGNhY2hlUGF0aCxcbiAgICAgICAgICAgICAgYnV0dG9uczoge1xuICAgICAgICAgICAgICAgIFllczogKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgc2VydmVyLmdldENvbm5lY3RvcigpLmRlbGV0ZUZpbGUoZGVzdFBhdGgpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZWplY3QodHJ1ZSk7XG4gICAgICAgICAgICAgICAgICB9KS5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHNob3dNZXNzYWdlKGVyci5tZXNzYWdlLCAnZXJyb3InKTtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShmYWxzZSk7XG4gICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIENhbmNlbDogKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgcmVzb2x2ZShmYWxzZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSkuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICAgIGxldCBmaWxlc3RhdCA9IEZpbGVTeXN0ZW0uc3RhdFN5bmMoc3JjUGF0aCk7XG5cbiAgICAgICAgICBsZXQgcGF0aE9uRmlsZVN5c3RlbSA9IG5vcm1hbGl6ZSh0cmFpbGluZ3NsYXNoaXQoc3JjUGF0aCksIFBhdGguc2VwKTtcbiAgICAgICAgICBsZXQgZm91bmRJblRyZWVWaWV3ID0gc2VsZi50cmVlVmlldy5maW5kRWxlbWVudEJ5TG9jYWxQYXRoKHBhdGhPbkZpbGVTeXN0ZW0pO1xuICAgICAgICAgIGlmIChmb3VuZEluVHJlZVZpZXcpIHtcbiAgICAgICAgICAgIC8vIEFkZCBzeW5jIGljb25cbiAgICAgICAgICAgIGZvdW5kSW5UcmVlVmlldy5hZGRTeW5jSWNvbigpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIEFkZCB0byBVcGxvYWQgUXVldWVcbiAgICAgICAgICBsZXQgcXVldWVJdGVtID0gUXVldWUuYWRkRmlsZSh7XG4gICAgICAgICAgICBkaXJlY3Rpb246IFwidXBsb2FkXCIsXG4gICAgICAgICAgICByZW1vdGVQYXRoOiBkZXN0UGF0aCxcbiAgICAgICAgICAgIGxvY2FsUGF0aDogc3JjUGF0aCxcbiAgICAgICAgICAgIHNpemU6IGZpbGVzdGF0LnNpemVcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIHJldHVybiBzZXJ2ZXIuZ2V0Q29ubmVjdG9yKCkudXBsb2FkRmlsZShxdWV1ZUl0ZW0sIDEpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgY2FjaGVQYXRoID0gbm9ybWFsaXplKGRlc3RQYXRoLnJlcGxhY2Uoc2VydmVyLmdldFJvb3QoKS5jb25maWcucmVtb3RlLCAnLycpKTtcblxuICAgICAgICAgICAgLy8gQWRkIHRvIHRyZWVcbiAgICAgICAgICAgIGxldCBlbGVtZW50ID0gc2VsZi50cmVlVmlldy5hZGRGaWxlKHNlcnZlci5nZXRSb290KCksIGNhY2hlUGF0aCwgeyBzaXplOiBmaWxlc3RhdC5zaXplIH0pO1xuICAgICAgICAgICAgaWYgKGVsZW1lbnQuaXNWaXNpYmxlKCkpIHtcbiAgICAgICAgICAgICAgZWxlbWVudC5zZWxlY3QoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gUmVmcmVzaCBjYWNoZVxuICAgICAgICAgICAgc2VydmVyLmdldFJvb3QoKS5nZXRGaW5kZXJDYWNoZSgpLmRlbGV0ZUZpbGUobm9ybWFsaXplKGNhY2hlUGF0aCkpO1xuICAgICAgICAgICAgc2VydmVyLmdldFJvb3QoKS5nZXRGaW5kZXJDYWNoZSgpLmFkZEZpbGUobm9ybWFsaXplKGNhY2hlUGF0aCksIGZpbGVzdGF0LnNpemUpO1xuXG4gICAgICAgICAgICBpZiAoZm91bmRJblRyZWVWaWV3KSB7XG4gICAgICAgICAgICAgIC8vIFJlbW92ZSBzeW5jIGljb25cbiAgICAgICAgICAgICAgZm91bmRJblRyZWVWaWV3LnJlbW92ZVN5bmNJY29uKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJlc29sdmUoZWxlbWVudCk7XG4gICAgICAgICAgfSkuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICAgICAgcXVldWVJdGVtLmNoYW5nZVN0YXR1cygnRXJyb3InKTtcblxuICAgICAgICAgICAgaWYgKGZvdW5kSW5UcmVlVmlldykge1xuICAgICAgICAgICAgICAvLyBSZW1vdmUgc3luYyBpY29uXG4gICAgICAgICAgICAgIGZvdW5kSW5UcmVlVmlldy5yZW1vdmVTeW5jSWNvbigpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIHByb21pc2U7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxldCBwcm9taXNlID0gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICBsZXQgZmlsZXN0YXQgPSBGaWxlU3lzdGVtLnN0YXRTeW5jKHNyY1BhdGgpO1xuXG4gICAgICAgIGxldCBwYXRoT25GaWxlU3lzdGVtID0gbm9ybWFsaXplKHRyYWlsaW5nc2xhc2hpdChzcmNQYXRoKSwgUGF0aC5zZXApO1xuICAgICAgICBsZXQgZm91bmRJblRyZWVWaWV3ID0gc2VsZi50cmVlVmlldy5maW5kRWxlbWVudEJ5TG9jYWxQYXRoKHBhdGhPbkZpbGVTeXN0ZW0pO1xuICAgICAgICBpZiAoZm91bmRJblRyZWVWaWV3KSB7XG4gICAgICAgICAgLy8gQWRkIHN5bmMgaWNvblxuICAgICAgICAgIGZvdW5kSW5UcmVlVmlldy5hZGRTeW5jSWNvbigpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQWRkIHRvIFVwbG9hZCBRdWV1ZVxuICAgICAgICBsZXQgcXVldWVJdGVtID0gUXVldWUuYWRkRmlsZSh7XG4gICAgICAgICAgZGlyZWN0aW9uOiBcInVwbG9hZFwiLFxuICAgICAgICAgIHJlbW90ZVBhdGg6IGRlc3RQYXRoLFxuICAgICAgICAgIGxvY2FsUGF0aDogc3JjUGF0aCxcbiAgICAgICAgICBzaXplOiBmaWxlc3RhdC5zaXplXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBzZXJ2ZXIuZ2V0Q29ubmVjdG9yKCkudXBsb2FkRmlsZShxdWV1ZUl0ZW0sIDEpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgIGNvbnN0IGNhY2hlUGF0aCA9IG5vcm1hbGl6ZShkZXN0UGF0aC5yZXBsYWNlKHNlcnZlci5nZXRSb290KCkuY29uZmlnLnJlbW90ZSwgJy8nKSk7XG5cbiAgICAgICAgICAvLyBBZGQgdG8gdHJlZVxuICAgICAgICAgIGxldCBlbGVtZW50ID0gc2VsZi50cmVlVmlldy5hZGRGaWxlKHNlcnZlci5nZXRSb290KCksIGNhY2hlUGF0aCwgeyBzaXplOiBmaWxlc3RhdC5zaXplIH0pO1xuICAgICAgICAgIGlmIChlbGVtZW50LmlzVmlzaWJsZSgpKSB7XG4gICAgICAgICAgICBlbGVtZW50LnNlbGVjdCgpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIFJlZnJlc2ggY2FjaGVcbiAgICAgICAgICBzZXJ2ZXIuZ2V0Um9vdCgpLmdldEZpbmRlckNhY2hlKCkuZGVsZXRlRmlsZShub3JtYWxpemUoY2FjaGVQYXRoKSk7XG4gICAgICAgICAgc2VydmVyLmdldFJvb3QoKS5nZXRGaW5kZXJDYWNoZSgpLmFkZEZpbGUobm9ybWFsaXplKGNhY2hlUGF0aCksIGZpbGVzdGF0LnNpemUpO1xuXG4gICAgICAgICAgaWYgKGZvdW5kSW5UcmVlVmlldykge1xuICAgICAgICAgICAgLy8gUmVtb3ZlIHN5bmMgaWNvblxuICAgICAgICAgICAgZm91bmRJblRyZWVWaWV3LnJlbW92ZVN5bmNJY29uKCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmVzb2x2ZShlbGVtZW50KTtcbiAgICAgICAgfSkuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICAgIHF1ZXVlSXRlbS5jaGFuZ2VTdGF0dXMoJ0Vycm9yJyk7XG5cbiAgICAgICAgICBpZiAoZm91bmRJblRyZWVWaWV3KSB7XG4gICAgICAgICAgICAvLyBSZW1vdmUgc3luYyBpY29uXG4gICAgICAgICAgICBmb3VuZEluVHJlZVZpZXcucmVtb3ZlU3luY0ljb24oKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIHByb21pc2U7XG4gICAgfVxuICB9XG5cbiAgdXBsb2FkRGlyZWN0b3J5KHNlcnZlciwgc3JjUGF0aCwgZGVzdFBhdGgpIHtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcblxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBGaWxlU3lzdGVtLmxpc3RUcmVlU3luYyhzcmNQYXRoKS5maWx0ZXIoKHBhdGgpID0+IEZpbGVTeXN0ZW0uaXNGaWxlU3luYyhwYXRoKSkucmVkdWNlKChwcmV2UHJvbWlzZSwgcGF0aCkgPT4ge1xuICAgICAgICByZXR1cm4gcHJldlByb21pc2UudGhlbigoKSA9PiBzZWxmLnVwbG9hZEZpbGUoc2VydmVyLCBwYXRoLCBub3JtYWxpemUoZGVzdFBhdGggKyAnLycgKyBwYXRoLnJlcGxhY2Uoc3JjUGF0aCwgJy8nKSwgJy8nKSkpO1xuICAgICAgfSwgUHJvbWlzZS5yZXNvbHZlKCkpLnRoZW4oKCkgPT4gcmVzb2x2ZSgpKS5jYXRjaCgoZXJyb3IpID0+IHJlamVjdChlcnJvcikpO1xuICAgIH0pO1xuICB9XG5cbiAgZG93bmxvYWRGaWxlKHNlcnZlciwgc3JjUGF0aCwgZGVzdFBhdGgsIHBhcmFtID0ge30pIHtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcblxuICAgIGxldCBwcm9taXNlID0gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgLy8gQ2hlY2sgaWYgZmlsZSBpcyBhbHJlYWR5IGluIFF1ZXVlXG4gICAgICBpZiAoUXVldWUuZXhpc3RzRmlsZShkZXN0UGF0aCkpIHtcbiAgICAgICAgcmV0dXJuIHJlamVjdChmYWxzZSk7XG4gICAgICB9XG5cbiAgICAgIGxldCBwYXRoT25GaWxlU3lzdGVtID0gbm9ybWFsaXplKHRyYWlsaW5nc2xhc2hpdChzZXJ2ZXIuZ2V0TG9jYWxQYXRoKGZhbHNlKSArIHNyY1BhdGgpLCBQYXRoLnNlcCk7XG4gICAgICBsZXQgZm91bmRJblRyZWVWaWV3ID0gc2VsZi50cmVlVmlldy5maW5kRWxlbWVudEJ5TG9jYWxQYXRoKHBhdGhPbkZpbGVTeXN0ZW0pO1xuICAgICAgaWYgKGZvdW5kSW5UcmVlVmlldykge1xuICAgICAgICAvLyBBZGQgc3luYyBpY29uXG4gICAgICAgIGZvdW5kSW5UcmVlVmlldy5hZGRTeW5jSWNvbigpO1xuICAgICAgfVxuXG4gICAgICAvLyBDcmVhdGUgbG9jYWwgRGlyZWN0b3JpZXNcbiAgICAgIGNyZWF0ZUxvY2FsUGF0aChkZXN0UGF0aCk7XG5cbiAgICAgIC8vIEFkZCB0byBEb3dubG9hZCBRdWV1ZVxuICAgICAgbGV0IHF1ZXVlSXRlbSA9IFF1ZXVlLmFkZEZpbGUoe1xuICAgICAgICBkaXJlY3Rpb246IFwiZG93bmxvYWRcIixcbiAgICAgICAgcmVtb3RlUGF0aDogc3JjUGF0aCxcbiAgICAgICAgbG9jYWxQYXRoOiBkZXN0UGF0aCxcbiAgICAgICAgc2l6ZTogKHBhcmFtLmZpbGVzaXplKSA/IHBhcmFtLmZpbGVzaXplIDogMFxuICAgICAgfSk7XG5cbiAgICAgIC8vIERvd25sb2FkIGZpbGVcbiAgICAgIHNlcnZlci5nZXRDb25uZWN0b3IoKS5kb3dubG9hZEZpbGUocXVldWVJdGVtKS50aGVuKCgpID0+IHtcbiAgICAgICAgaWYgKGZvdW5kSW5UcmVlVmlldykge1xuICAgICAgICAgIC8vIFJlbW92ZSBzeW5jIGljb25cbiAgICAgICAgICBmb3VuZEluVHJlZVZpZXcucmVtb3ZlU3luY0ljb24oKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJlc29sdmUodHJ1ZSk7XG4gICAgICB9KS5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgIHF1ZXVlSXRlbS5jaGFuZ2VTdGF0dXMoJ0Vycm9yJyk7XG5cbiAgICAgICAgaWYgKGZvdW5kSW5UcmVlVmlldykge1xuICAgICAgICAgIC8vIFJlbW92ZSBzeW5jIGljb25cbiAgICAgICAgICBmb3VuZEluVHJlZVZpZXcucmVtb3ZlU3luY0ljb24oKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gcHJvbWlzZTtcbiAgfVxuXG4gIGRvd25sb2FkRGlyZWN0b3J5KHNlcnZlciwgc3JjUGF0aCwgZGVzdFBhdGgpIHtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcblxuICAgIGNvbnN0IHNjYW5EaXIgPSAocGF0aCkgPT4ge1xuICAgICAgcmV0dXJuIHNlcnZlci5nZXRDb25uZWN0b3IoKS5saXN0RGlyZWN0b3J5KHBhdGgpLnRoZW4obGlzdCA9PiB7XG4gICAgICAgIGNvbnN0IGZpbGVzID0gbGlzdC5maWx0ZXIoKGl0ZW0pID0+IChpdGVtLnR5cGUgPT09ICctJykpLm1hcCgoaXRlbSkgPT4ge1xuICAgICAgICAgIGl0ZW0ucGF0aCA9IG5vcm1hbGl6ZShwYXRoICsgJy8nICsgaXRlbS5uYW1lKTtcbiAgICAgICAgICByZXR1cm4gaXRlbTtcbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnN0IGRpcnMgPSBsaXN0LmZpbHRlcigoaXRlbSkgPT4gKGl0ZW0udHlwZSA9PT0gJ2QnICYmIGl0ZW0ubmFtZSAhPT0gJy4nICYmIGl0ZW0ubmFtZSAhPT0gJy4uJykpLm1hcCgoaXRlbSkgPT4ge1xuICAgICAgICAgIGl0ZW0ucGF0aCA9IG5vcm1hbGl6ZShwYXRoICsgJy8nICsgaXRlbS5uYW1lKTtcbiAgICAgICAgICByZXR1cm4gaXRlbTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIGRpcnMucmVkdWNlKChwcmV2UHJvbWlzZSwgZGlyKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIHByZXZQcm9taXNlLnRoZW4ob3V0cHV0ID0+IHtcbiAgICAgICAgICAgIHJldHVybiBzY2FuRGlyKG5vcm1hbGl6ZShkaXIucGF0aCkpLnRoZW4oZmlsZXMgPT4ge1xuICAgICAgICAgICAgICByZXR1cm4gb3V0cHV0LmNvbmNhdChmaWxlcyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSwgUHJvbWlzZS5yZXNvbHZlKGZpbGVzKSk7XG4gICAgICB9KTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIHNjYW5EaXIoc3JjUGF0aCkudGhlbigoZmlsZXMpID0+IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmICghRmlsZVN5c3RlbS5leGlzdHNTeW5jKGRlc3RQYXRoKSkge1xuICAgICAgICAgIEZpbGVTeXN0ZW0ubWtkaXJTeW5jKGRlc3RQYXRoKTtcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KGVycm9yKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgZmlsZXMucmVkdWNlKChwcmV2UHJvbWlzZSwgZmlsZSkgPT4ge1xuICAgICAgICAgIHJldHVybiBwcmV2UHJvbWlzZS50aGVuKCgpID0+IHNlbGYuZG93bmxvYWRGaWxlKHNlcnZlciwgZmlsZS5wYXRoLCBub3JtYWxpemUoZGVzdFBhdGggKyBQYXRoLnNlcCArIGZpbGUucGF0aC5yZXBsYWNlKHNyY1BhdGgsICcvJyksIFBhdGguc2VwKSwgeyBmaWxlc2l6ZTogZmlsZS5zaXplIH0pKTtcbiAgICAgICAgfSwgUHJvbWlzZS5yZXNvbHZlKCkpLnRoZW4oKCkgPT4gcmVzb2x2ZSgpKS5jYXRjaCgoZXJyb3IpID0+IHJlamVjdChlcnJvcikpO1xuICAgICAgfSk7XG4gICAgfSkuY2F0Y2goKGVycm9yKSA9PiB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QoZXJyb3IpO1xuICAgIH0pO1xuICB9XG5cbiAgZmluZFJlbW90ZVBhdGgoKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gICAgY29uc3Qgc2VsZWN0ZWQgPSBzZWxmLnRyZWVWaWV3Lmxpc3QuZmluZCgnLnNlbGVjdGVkJyk7XG5cbiAgICBpZiAoc2VsZWN0ZWQubGVuZ3RoID09PSAwKSByZXR1cm47XG5cbiAgICBjb25zdCBkaWFsb2cgPSBuZXcgRmluZERpYWxvZygnLycsIGZhbHNlKTtcbiAgICBkaWFsb2cub24oJ2ZpbmQtcGF0aCcsIChlLCByZWxhdGl2ZVBhdGgpID0+IHtcbiAgICAgIGlmIChyZWxhdGl2ZVBhdGgpIHtcbiAgICAgICAgcmVsYXRpdmVQYXRoID0gbm9ybWFsaXplKHJlbGF0aXZlUGF0aCk7XG5cbiAgICAgICAgbGV0IHJvb3QgPSBzZWxlY3RlZC52aWV3KCkuZ2V0Um9vdCgpO1xuXG4gICAgICAgIC8vIFJlbW92ZSBpbml0aWFsIHBhdGggaWYgZXhpc3RzXG4gICAgICAgIGlmIChyb290LmNvbmZpZy5yZW1vdGUpIHtcbiAgICAgICAgICBpZiAocmVsYXRpdmVQYXRoLnN0YXJ0c1dpdGgocm9vdC5jb25maWcucmVtb3RlKSkge1xuICAgICAgICAgICAgcmVsYXRpdmVQYXRoID0gcmVsYXRpdmVQYXRoLnJlcGxhY2Uocm9vdC5jb25maWcucmVtb3RlLCBcIlwiKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBzZWxmLnRyZWVWaWV3LmV4cGFuZChyb290LCByZWxhdGl2ZVBhdGgpLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgICBzaG93TWVzc2FnZShlcnIsICdlcnJvcicpO1xuICAgICAgICB9KTtcblxuICAgICAgICBkaWFsb2cuY2xvc2UoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBkaWFsb2cuYXR0YWNoKCk7XG4gIH1cblxuICBjb3B5UmVtb3RlUGF0aCgpIHtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcbiAgICBjb25zdCBzZWxlY3RlZCA9IHNlbGYudHJlZVZpZXcubGlzdC5maW5kKCcuc2VsZWN0ZWQnKTtcblxuICAgIGlmIChzZWxlY3RlZC5sZW5ndGggPT09IDApIHJldHVybjtcblxuICAgIGxldCBlbGVtZW50ID0gc2VsZWN0ZWQudmlldygpO1xuICAgIGlmIChlbGVtZW50LmlzKCcuZGlyZWN0b3J5JykpIHtcbiAgICAgIHBhdGhUb0NvcHkgPSBlbGVtZW50LmdldFBhdGgodHJ1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHBhdGhUb0NvcHkgPSBlbGVtZW50LmdldFBhdGgodHJ1ZSkgKyBlbGVtZW50Lm5hbWU7XG4gICAgfVxuICAgIGF0b20uY2xpcGJvYXJkLndyaXRlKHBhdGhUb0NvcHkpXG4gIH1cblxuICByZW1vdGVQYXRoRmluZGVyKHJlaW5kZXggPSBmYWxzZSkge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuICAgIGNvbnN0IHNlbGVjdGVkID0gc2VsZi50cmVlVmlldy5saXN0LmZpbmQoJy5zZWxlY3RlZCcpO1xuXG4gICAgaWYgKHNlbGVjdGVkLmxlbmd0aCA9PT0gMCkgcmV0dXJuO1xuXG4gICAgbGV0IHJvb3QgPSBzZWxlY3RlZC52aWV3KCkuZ2V0Um9vdCgpO1xuICAgIGxldCBpdGVtc0NhY2hlID0gcm9vdC5nZXRGaW5kZXJDYWNoZSgpO1xuXG4gICAgaWYgKHNlbGYuZmluZGVyVmlldyA9PSBudWxsKSB7XG4gICAgICBzZWxmLmZpbmRlclZpZXcgPSBuZXcgRmluZGVyVmlldyhzZWxmLnRyZWVWaWV3KTtcblxuICAgICAgc2VsZi5maW5kZXJWaWV3Lm9uKCdmdHAtcmVtb3RlLWVkaXQtZmluZGVyOm9wZW4nLCAoaXRlbSkgPT4ge1xuICAgICAgICBsZXQgcmVsYXRpdmVQYXRoID0gaXRlbS5yZWxhdGl2ZVBhdGg7XG4gICAgICAgIGxldCBsb2NhbFBhdGggPSBub3JtYWxpemUoc2VsZi5maW5kZXJWaWV3LnJvb3QuZ2V0TG9jYWxQYXRoKCkgKyByZWxhdGl2ZVBhdGgsIFBhdGguc2VwKTtcbiAgICAgICAgbGV0IGZpbGUgPSBzZWxmLnRyZWVWaWV3LmdldEVsZW1lbnRCeUxvY2FsUGF0aChsb2NhbFBhdGgsIHNlbGYuZmluZGVyVmlldy5yb290LCAnZmlsZScpO1xuICAgICAgICBmaWxlLnNpemUgPSBpdGVtLnNpemU7XG5cbiAgICAgICAgaWYgKGZpbGUpIHNlbGYub3BlbkZpbGUoZmlsZSk7XG4gICAgICB9KTtcblxuICAgICAgc2VsZi5maW5kZXJWaWV3Lm9uKCdmdHAtcmVtb3RlLWVkaXQtZmluZGVyOmhpZGUnLCAoKSA9PiB7XG4gICAgICAgIGl0ZW1zQ2FjaGUubG9hZFRhc2sgPSBmYWxzZTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICBzZWxmLmZpbmRlclZpZXcucm9vdCA9IHJvb3Q7XG4gICAgc2VsZi5maW5kZXJWaWV3LnNlbGVjdExpc3RWaWV3LnVwZGF0ZSh7IGl0ZW1zOiBpdGVtc0NhY2hlLml0ZW1zIH0pXG5cbiAgICBjb25zdCBpbmRleCA9IChpdGVtcykgPT4ge1xuICAgICAgc2VsZi5maW5kZXJWaWV3LnNlbGVjdExpc3RWaWV3LnVwZGF0ZSh7IGl0ZW1zOiBpdGVtcywgZXJyb3JNZXNzYWdlOiAnJywgbG9hZGluZ01lc3NhZ2U6ICdJbmRleGluZ1xcdTIwMjYnICsgaXRlbXMubGVuZ3RoIH0pXG4gICAgfTtcbiAgICBpdGVtc0NhY2hlLnJlbW92ZUxpc3RlbmVyKCdmaW5kZXItaXRlbXMtY2FjaGUtcXVldWU6aW5kZXgnLCBpbmRleCk7XG4gICAgaXRlbXNDYWNoZS5vbignZmluZGVyLWl0ZW1zLWNhY2hlLXF1ZXVlOmluZGV4JywgaW5kZXgpO1xuXG4gICAgY29uc3QgdXBkYXRlID0gKGl0ZW1zKSA9PiB7XG4gICAgICBzZWxmLmZpbmRlclZpZXcuc2VsZWN0TGlzdFZpZXcudXBkYXRlKHsgaXRlbXM6IGl0ZW1zLCBlcnJvck1lc3NhZ2U6ICcnLCBsb2FkaW5nTWVzc2FnZTogJycgfSlcbiAgICB9O1xuICAgIGl0ZW1zQ2FjaGUucmVtb3ZlTGlzdGVuZXIoJ2ZpbmRlci1pdGVtcy1jYWNoZS1xdWV1ZTp1cGRhdGUnLCB1cGRhdGUpO1xuICAgIGl0ZW1zQ2FjaGUub24oJ2ZpbmRlci1pdGVtcy1jYWNoZS1xdWV1ZTp1cGRhdGUnLCB1cGRhdGUpO1xuXG4gICAgY29uc3QgZmluaXNoID0gKGl0ZW1zKSA9PiB7XG4gICAgICBzZWxmLmZpbmRlclZpZXcuc2VsZWN0TGlzdFZpZXcudXBkYXRlKHsgaXRlbXM6IGl0ZW1zLCBlcnJvck1lc3NhZ2U6ICcnLCBsb2FkaW5nTWVzc2FnZTogJycgfSlcbiAgICB9O1xuICAgIGl0ZW1zQ2FjaGUucmVtb3ZlTGlzdGVuZXIoJ2ZpbmRlci1pdGVtcy1jYWNoZS1xdWV1ZTpmaW5pc2gnLCBmaW5pc2gpO1xuICAgIGl0ZW1zQ2FjaGUub24oJ2ZpbmRlci1pdGVtcy1jYWNoZS1xdWV1ZTpmaW5pc2gnLCBmaW5pc2gpO1xuXG4gICAgY29uc3QgZXJyb3IgPSAoZXJyKSA9PiB7XG4gICAgICBzZWxmLmZpbmRlclZpZXcuc2VsZWN0TGlzdFZpZXcudXBkYXRlKHsgZXJyb3JNZXNzYWdlOiAnRXJyb3I6ICcgKyBlcnIubWVzc2FnZSB9KVxuICAgIH07XG4gICAgaXRlbXNDYWNoZS5yZW1vdmVMaXN0ZW5lcignZmluZGVyLWl0ZW1zLWNhY2hlLXF1ZXVlOmVycm9yJywgZXJyb3IpO1xuICAgIGl0ZW1zQ2FjaGUub24oJ2ZpbmRlci1pdGVtcy1jYWNoZS1xdWV1ZTplcnJvcicsIGVycm9yKTtcblxuICAgIGl0ZW1zQ2FjaGUubG9hZChyZWluZGV4KTtcbiAgICBzZWxmLmZpbmRlclZpZXcudG9nZ2xlKCk7XG4gIH1cblxuICBhdXRvUmV2ZWFsQWN0aXZlRmlsZSgpIHtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcblxuICAgIGlmIChhdG9tLmNvbmZpZy5nZXQoJ2Z0cC1yZW1vdGUtZWRpdC50cmVlLmF1dG9SZXZlYWxBY3RpdmVGaWxlJykpIHtcbiAgICAgIGlmIChzZWxmLnRyZWVWaWV3LmlzVmlzaWJsZSgpKSB7XG4gICAgICAgIGxldCBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCk7XG5cbiAgICAgICAgaWYgKGVkaXRvciAmJiBlZGl0b3IuZ2V0UGF0aCgpKSB7XG4gICAgICAgICAgbGV0IHBhdGhPbkZpbGVTeXN0ZW0gPSBub3JtYWxpemUodHJhaWxpbmdzbGFzaGl0KGVkaXRvci5nZXRQYXRoKCkpLCBQYXRoLnNlcCk7XG5cbiAgICAgICAgICBsZXQgZW50cnkgPSBzZWxmLnRyZWVWaWV3LmZpbmRFbGVtZW50QnlMb2NhbFBhdGgocGF0aE9uRmlsZVN5c3RlbSk7XG4gICAgICAgICAgaWYgKGVudHJ5ICYmIGVudHJ5LmlzVmlzaWJsZSgpKSB7XG4gICAgICAgICAgICBlbnRyeS5zZWxlY3QoKTtcbiAgICAgICAgICAgIHNlbGYudHJlZVZpZXcucmVtb3RlS2V5Ym9hcmROYXZpZ2F0aW9uTW92ZVBhZ2UoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBvcGVuRmlsZUluRWRpdG9yKGZpbGUsIHBlbmRpbmcpIHtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcblxuICAgIHJldHVybiBhdG9tLndvcmtzcGFjZS5vcGVuKG5vcm1hbGl6ZShmaWxlLmdldExvY2FsUGF0aCh0cnVlKSArIGZpbGUubmFtZSwgUGF0aC5zZXApLCB7IHBlbmRpbmc6IHBlbmRpbmcsIHNlYXJjaEFsbFBhbmVzOiB0cnVlIH0pLnRoZW4oKGVkaXRvcikgPT4ge1xuICAgICAgZWRpdG9yLnNhdmVPYmplY3QgPSBmaWxlO1xuICAgICAgZWRpdG9yLnNhdmVPYmplY3QuYWRkQ2xhc3MoJ29wZW4nKTtcblxuICAgICAgdHJ5IHtcbiAgICAgICAgLy8gU2F2ZSBmaWxlIG9uIHJlbW90ZSBzZXJ2ZXJcbiAgICAgICAgZWRpdG9yLm9uRGlkU2F2ZSgoc2F2ZU9iamVjdCkgPT4ge1xuICAgICAgICAgIGlmICghZWRpdG9yLnNhdmVPYmplY3QpIHJldHVybjtcblxuICAgICAgICAgIC8vIEdldCBmaWxlc2l6ZVxuICAgICAgICAgIGNvbnN0IGZpbGVzdGF0ID0gRmlsZVN5c3RlbS5zdGF0U3luYyhlZGl0b3IuZ2V0UGF0aCh0cnVlKSk7XG4gICAgICAgICAgZWRpdG9yLnNhdmVPYmplY3Quc2l6ZSA9IGZpbGVzdGF0LnNpemU7XG4gICAgICAgICAgZWRpdG9yLnNhdmVPYmplY3QuYXR0cignZGF0YS1zaXplJywgZmlsZXN0YXQuc2l6ZSk7XG5cbiAgICAgICAgICBjb25zdCBzcmNQYXRoID0gZWRpdG9yLnNhdmVPYmplY3QuZ2V0TG9jYWxQYXRoKHRydWUpICsgZWRpdG9yLnNhdmVPYmplY3QubmFtZTtcbiAgICAgICAgICBjb25zdCBkZXN0UGF0aCA9IGVkaXRvci5zYXZlT2JqZWN0LmdldFBhdGgodHJ1ZSkgKyBlZGl0b3Iuc2F2ZU9iamVjdC5uYW1lO1xuICAgICAgICAgIHNlbGYudXBsb2FkRmlsZShlZGl0b3Iuc2F2ZU9iamVjdC5nZXRSb290KCksIHNyY1BhdGgsIGRlc3RQYXRoLCBmYWxzZSkudGhlbigoZHVwbGljYXRlZEZpbGUpID0+IHtcbiAgICAgICAgICAgIGlmIChkdXBsaWNhdGVkRmlsZSkge1xuICAgICAgICAgICAgICBpZiAoYXRvbS5jb25maWcuZ2V0KCdmdHAtcmVtb3RlLWVkaXQubm90aWZpY2F0aW9ucy5zaG93Tm90aWZpY2F0aW9uT25VcGxvYWQnKSkge1xuICAgICAgICAgICAgICAgIHNob3dNZXNzYWdlKCdGaWxlIHN1Y2Nlc3NmdWxseSB1cGxvYWRlZC4nLCAnc3VjY2VzcycpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGVkaXRvci5vbkRpZERlc3Ryb3koKCkgPT4ge1xuICAgICAgICAgIGlmICghZWRpdG9yLnNhdmVPYmplY3QpIHJldHVybjtcblxuICAgICAgICAgIGVkaXRvci5zYXZlT2JqZWN0LnJlbW92ZUNsYXNzKCdvcGVuJyk7XG4gICAgICAgIH0pO1xuICAgICAgfSBjYXRjaCAoZXJyKSB7IH1cbiAgICB9KS5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICBzaG93TWVzc2FnZShlcnIubWVzc2FnZSwgJ2Vycm9yJyk7XG4gICAgfSk7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgbmV3IEZ0cFJlbW90ZUVkaXQoKTtcbiJdfQ==