Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x3, _x4, _x5) { var _again = true; _function: while (_again) { var object = _x3, property = _x4, receiver = _x5; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x3 = parent; _x4 = property; _x5 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _atomSpacePenViews = require('atom-space-pen-views');

var _atom = require('atom');

var _helperHelperJs = require('./../helper/helper.js');

var _connectorsConnectorJs = require('./../connectors/connector.js');

var _connectorsConnectorJs2 = _interopRequireDefault(_connectorsConnectorJs);

var _helperImportJs = require('./../helper/import.js');

var _helperImportJs2 = _interopRequireDefault(_helperImportJs);

var _viewsFolderConfigurationView = require('./../views/folder-configuration-view');

var _viewsFolderConfigurationView2 = _interopRequireDefault(_viewsFolderConfigurationView);

'use babel';

var atom = global.atom;
var config = require('./../config/server-schema.json');
var debugConfig = __dirname + './../config/server-test-schema.json';
var Storage = require('./../helper/storage.js');

var ConfigurationView = (function (_View) {
  _inherits(ConfigurationView, _View);

  function ConfigurationView() {
    _classCallCheck(this, ConfigurationView);

    _get(Object.getPrototypeOf(ConfigurationView.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(ConfigurationView, [{
    key: 'initialize',
    value: function initialize() {
      var self = this;

      self.subscriptions = null;
      self.disableEventhandler = false;

      var html = '<p>Ftp-Remote-Edit Server Settings</p>';
      html += "<p>You can edit each connection at the time. All changes will only be saved by pushing the save button.</p>";
      self.info.html(html);

      var saveButton = document.createElement('button');
      saveButton.textContent = 'Save';
      saveButton.classList.add('btn');

      var importButton = document.createElement('button');
      importButton.textContent = 'Import';
      importButton.classList.add('btn');

      var closeButton = document.createElement('button');
      closeButton.textContent = 'Cancel';
      closeButton.classList.add('btn');
      closeButton.classList.add('pull-right');

      self.content.append(self.createServerSelect());
      self.content.append(self.createControls());

      self.footer.append(saveButton);
      self.footer.append(importButton);
      self.footer.append(closeButton);

      // Events
      closeButton.addEventListener('click', function (event) {
        self.close();
      });

      saveButton.addEventListener('click', function (event) {
        self.save();
        self.close();
      });

      importButton.addEventListener('click', function (event) {
        self['import']();
      });

      self.subscriptions = new _atom.CompositeDisposable();
      self.subscriptions.add(atom.commands.add(this.element, {
        'core:confirm': function coreConfirm() {
          // self.save();
        },
        'core:cancel': function coreCancel() {
          self.cancel();
        }
      }));

      // Handle keydown by tab events to switch between fields
      closeButton.addEventListener('keydown', function (event) {
        if (event.key == 'Tab') {
          event.preventDefault();
          self.selectServer.focus();
        }
      });
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      var self = this;

      if (self.subscriptions) {
        self.subscriptions.dispose();
        self.subscriptions = null;
      }
    }
  }, {
    key: 'createControls',
    value: function createControls() {
      var self = this;

      var divRequired = document.createElement('div');
      divRequired.classList.add('server-settings');

      var nameLabel = document.createElement('label');
      nameLabel.classList.add('control-label');
      var nameLabelTitle = document.createElement('div');
      nameLabelTitle.textContent = 'The name of the server.';
      nameLabelTitle.classList.add('setting-title');
      nameLabel.appendChild(nameLabelTitle);
      self.nameInput = new _atomSpacePenViews.TextEditorView({ mini: true, placeholderText: "name" });
      self.nameInput.element.classList.add('form-control');

      var folderLabel = document.createElement('label');
      folderLabel.classList.add('control-label');
      var folderLabelTitle = document.createElement('div');
      folderLabelTitle.textContent = 'Folder';
      folderLabelTitle.classList.add('setting-title');
      folderLabel.appendChild(folderLabelTitle);

      self.folderSelect = document.createElement('select');
      self.folderSelect.classList.add('form-control');
      self.createControlsFolderSelect();

      self.folderEdit = document.createElement('button');
      self.folderEdit.textContent = 'Edit';
      self.folderEdit.classList.add('btn');

      var hostLabel = document.createElement('label');
      hostLabel.classList.add('control-label');
      var hostLabelTitle = document.createElement('div');
      hostLabelTitle.textContent = 'The hostname or IP address of the server.';
      hostLabelTitle.classList.add('setting-title');
      hostLabel.appendChild(hostLabelTitle);
      self.hostInput = new _atomSpacePenViews.TextEditorView({ mini: true, placeholderText: "localhost" });
      self.hostInput.element.classList.add('form-control');

      var portLabel = document.createElement('label');
      portLabel.classList.add('control-label');
      var portLabelTitle = document.createElement('div');
      portLabelTitle.textContent = 'Port';
      portLabelTitle.classList.add('setting-title');
      portLabel.appendChild(portLabelTitle);
      self.portInput = new _atomSpacePenViews.TextEditorView({ mini: true, placeholderText: "21" });
      self.portInput.element.classList.add('form-control');

      var protocolLabel = document.createElement('label');
      protocolLabel.classList.add('control-label');
      var protocolLabelTitle = document.createElement('div');
      protocolLabelTitle.textContent = 'Protocol';
      protocolLabelTitle.classList.add('setting-title');
      protocolLabel.appendChild(protocolLabelTitle);

      self.protocolSelect = document.createElement('select');
      self.protocolSelect.classList.add('form-control');
      var optionFTP = document.createElement("option");
      optionFTP.text = 'FTP - File Transfer Protocol';
      optionFTP.value = 'ftp';
      self.protocolSelect.add(optionFTP);
      var optionSFTP = document.createElement("option");
      optionSFTP.text = 'SFTP - SSH File Transfer Protocol';
      optionSFTP.value = 'sftp';
      self.protocolSelect.add(optionSFTP);
      var protocolSelectContainer = document.createElement('div');
      protocolSelectContainer.classList.add('select-container');
      protocolSelectContainer.appendChild(self.protocolSelect);

      var logonTypeLabel = document.createElement('label');
      logonTypeLabel.classList.add('control-label');
      var logonTypeLabelTitle = document.createElement('div');
      logonTypeLabelTitle.textContent = 'Logon Type';
      logonTypeLabelTitle.classList.add('setting-title');
      logonTypeLabel.appendChild(logonTypeLabelTitle);

      self.logonTypeSelect = document.createElement('select');
      self.logonTypeSelect.classList.add('form-control');
      var optionNormal = document.createElement("option");
      optionNormal.text = 'Username / Password';
      optionNormal.value = 'credentials';
      self.logonTypeSelect.add(optionNormal);
      var optionKeyFile = document.createElement("option");
      optionKeyFile.text = 'Keyfile (OpenSSH format - PEM)';
      optionKeyFile.value = 'keyfile';
      self.logonTypeSelect.add(optionKeyFile);
      var optionAgent = document.createElement("option");
      optionAgent.text = 'SSH Agent';
      optionAgent.value = 'agent';
      self.logonTypeSelect.add(optionAgent);
      var logonTypeSelectContainer = document.createElement('div');
      logonTypeSelectContainer.classList.add('select-container');
      logonTypeSelectContainer.appendChild(self.logonTypeSelect);

      var userLabel = document.createElement('label');
      userLabel.classList.add('control-label');
      var userLabelTitle = document.createElement('div');
      userLabelTitle.textContent = 'Username for authentication.';
      userLabelTitle.classList.add('setting-title');
      userLabel.appendChild(userLabelTitle);
      self.userInput = new _atomSpacePenViews.TextEditorView({ mini: true, placeholderText: "username" });
      self.userInput.element.classList.add('form-control');

      var passwordLabel = document.createElement('label');
      passwordLabel.classList.add('control-label');
      var passwordLabelTitle = document.createElement('div');
      passwordLabelTitle.textContent = 'Password/Passphrase for authentication.';
      passwordLabelTitle.classList.add('setting-title');
      passwordLabel.appendChild(passwordLabelTitle);
      self.passwordInput = new _atomSpacePenViews.TextEditorView({ mini: true, placeholderText: "password" });
      self.passwordInput.element.classList.add('form-control');

      var privatekeyfileLabel = document.createElement('label');
      privatekeyfileLabel.classList.add('control-label');
      var privatekeyfileLabelTitle = document.createElement('div');
      privatekeyfileLabelTitle.textContent = 'Path to private keyfile.';
      privatekeyfileLabelTitle.classList.add('setting-title');
      privatekeyfileLabel.appendChild(privatekeyfileLabelTitle);
      self.privatekeyfileInput = new _atomSpacePenViews.TextEditorView({ mini: true, placeholderText: "path to private keyfile (optional)" });
      self.privatekeyfileInput.element.classList.add('form-control');

      var remoteLabel = document.createElement('label');
      remoteLabel.classList.add('control-label');
      var remoteLabelTitle = document.createElement('div');
      remoteLabelTitle.textContent = 'Initial Directory.';
      remoteLabelTitle.classList.add('setting-title');
      remoteLabel.appendChild(remoteLabelTitle);
      self.remoteInput = new _atomSpacePenViews.TextEditorView({ mini: true, placeholderText: "/" });
      self.remoteInput.element.classList.add('form-control');

      var nameControl = document.createElement('div');
      nameControl.classList.add('controls');
      nameControl.classList.add('name');
      nameControl.appendChild(nameLabel);
      nameControl.appendChild(self.nameInput.element);

      var folderControl = document.createElement('div');
      folderControl.classList.add('controls');
      folderControl.classList.add('folder');
      folderControl.appendChild(folderLabel);
      folderControl.appendChild(self.folderSelect);

      var folderButtonControl = document.createElement('div');
      folderButtonControl.classList.add('controls');
      folderButtonControl.classList.add('folder-button');
      folderButtonControl.appendChild(self.folderEdit);

      var hostControl = document.createElement('div');
      hostControl.classList.add('controls');
      hostControl.classList.add('host');
      hostControl.appendChild(hostLabel);
      hostControl.appendChild(self.hostInput.element);

      var portControl = document.createElement('div');
      portControl.classList.add('controls');
      portControl.classList.add('port');
      portControl.appendChild(portLabel);
      portControl.appendChild(self.portInput.element);

      var protocolControl = document.createElement('div');
      protocolControl.classList.add('controls');
      protocolControl.classList.add('protocol');
      protocolControl.appendChild(protocolLabel);
      protocolControl.appendChild(protocolSelectContainer);

      var logonTypeControl = document.createElement('div');
      logonTypeControl.classList.add('controls');
      logonTypeControl.classList.add('protocol');
      logonTypeControl.appendChild(logonTypeLabel);
      logonTypeControl.appendChild(logonTypeSelectContainer);

      var nameGroup = document.createElement('div');
      nameGroup.classList.add('control-group');
      nameGroup.appendChild(nameControl);
      nameGroup.appendChild(folderControl);
      nameGroup.appendChild(folderButtonControl);
      divRequired.appendChild(nameGroup);

      var hostGroup = document.createElement('div');
      hostGroup.classList.add('control-group');
      hostGroup.appendChild(hostControl);
      hostGroup.appendChild(portControl);
      divRequired.appendChild(hostGroup);

      var protocolGroup = document.createElement('div');
      protocolGroup.classList.add('control-group');
      protocolGroup.appendChild(protocolControl);
      protocolGroup.appendChild(logonTypeControl);
      divRequired.appendChild(protocolGroup);

      var usernameControl = document.createElement('div');
      usernameControl.classList.add('controls');
      usernameControl.classList.add('username');
      usernameControl.appendChild(userLabel);
      usernameControl.appendChild(self.userInput.element);

      self.passwordControl = document.createElement('div');
      self.passwordControl.classList.add('controls');
      self.passwordControl.classList.add('password');
      self.passwordControl.appendChild(passwordLabel);
      self.passwordControl.appendChild(self.passwordInput.element);

      var credentialGroup = document.createElement('div');
      credentialGroup.classList.add('control-group');
      credentialGroup.appendChild(usernameControl);
      credentialGroup.appendChild(self.passwordControl);
      divRequired.appendChild(credentialGroup);

      self.privatekeyfileControl = document.createElement('div');
      self.privatekeyfileControl.classList.add('controls');
      self.privatekeyfileControl.classList.add('privatekeyfile');
      self.privatekeyfileControl.appendChild(privatekeyfileLabel);
      self.privatekeyfileControl.appendChild(self.privatekeyfileInput.element);

      var remoteControl = document.createElement('div');
      remoteControl.classList.add('controls');
      remoteControl.classList.add('remote');
      remoteControl.appendChild(remoteLabel);
      remoteControl.appendChild(self.remoteInput.element);

      var advancedSettingsGroup = document.createElement('div');
      advancedSettingsGroup.classList.add('control-group');
      advancedSettingsGroup.appendChild(self.privatekeyfileControl);
      advancedSettingsGroup.appendChild(remoteControl);
      divRequired.appendChild(advancedSettingsGroup);

      // Events
      self.nameInput.getModel().onDidChange(function () {
        if (Storage.getServers().length !== 0 && !self.disableEventhandler) {
          var index = self.selectServer.selectedOptions[0].value;
          Storage.getServers()[index].name = self.nameInput.getText().trim();
          self.selectServer.selectedOptions[0].text = self.nameInput.getText().trim();
        }
      });
      self.hostInput.getModel().onDidChange(function () {
        if (Storage.getServers().length !== 0 && !self.disableEventhandler) {
          var index = self.selectServer.selectedOptions[0].value;
          Storage.getServers()[index].host = self.hostInput.getText().trim();
        }
      });
      self.portInput.getModel().onDidChange(function () {
        if (Storage.getServers().length !== 0 && !self.disableEventhandler) {
          var index = self.selectServer.selectedOptions[0].value;
          Storage.getServers()[index].port = self.portInput.getText().trim();
        }
      });

      self.folderSelect.addEventListener('change', function (event) {
        if (Storage.getFolders().length !== 0 && !self.disableEventhandler) {
          var index = self.selectServer.selectedOptions[0].value;
          var option = event.currentTarget.selectedOptions[0];
          Storage.getServers()[index].parent = parseInt(option.value);
        }
      });

      self.folderEdit.addEventListener('click', function (event) {
        self.editFolders();
      });

      self.protocolSelect.addEventListener('change', function (event) {
        if (Storage.getServers().length !== 0 && !self.disableEventhandler) {
          var index = self.selectServer.selectedOptions[0].value;
          var option = event.currentTarget.selectedOptions[0];

          if (option.value == 'sftp') {
            Storage.getServers()[index].sftp = true;
          } else {
            Storage.getServers()[index].logon = 'credentials';
            Storage.getServers()[index].sftp = false;
            Storage.getServers()[index].useAgent = false;
            Storage.getServers()[index].privatekeyfile = '';
          }
          self.fillInputFields(Storage.getServers()[index]);
        }
      });

      self.logonTypeSelect.addEventListener('change', function (event) {
        if (Storage.getServers().length !== 0 && !self.disableEventhandler) {
          var index = self.selectServer.selectedOptions[0].value;
          var option = event.currentTarget.selectedOptions[0];

          if (option.value == 'credentials') {
            Storage.getServers()[index].logon = 'credentials';
            Storage.getServers()[index].useAgent = false;
            Storage.getServers()[index].privatekeyfile = '';
          } else if (option.value == 'keyfile') {
            Storage.getServers()[index].logon = 'keyfile';
            Storage.getServers()[index].useAgent = false;
          } else if (option.value == 'agent') {
            Storage.getServers()[index].logon = 'agent';
            Storage.getServers()[index].useAgent = true;
            Storage.getServers()[index].privatekeyfile = '';
            Storage.getServers()[index].password = '';
          } else {
            Storage.getServers()[index].useAgent = false;
          }
          self.fillInputFields(Storage.getServers()[index]);
        }
      });

      self.userInput.getModel().onDidChange(function () {
        if (Storage.getServers().length !== 0 && !self.disableEventhandler) {
          var index = self.selectServer.selectedOptions[0].value;
          Storage.getServers()[index].user = self.userInput.getText().trim();
        }
      });

      var changing = false;
      var passwordModel = self.passwordInput.getModel();
      passwordModel.clearTextPassword = new _atom.TextBuffer('');
      passwordModel.buffer.onDidChange(function (obj) {
        if (!changing) {
          changing = true;
          passwordModel.clearTextPassword.setTextInRange(obj.oldRange, obj.newText);
          passwordModel.buffer.setTextInRange(obj.newRange, '*'.repeat(obj.newText.length));

          if (Storage.getServers().length !== 0 && !self.disableEventhandler) {
            var index = self.selectServer.selectedOptions[0].value;
            Storage.getServers()[index].password = passwordModel.clearTextPassword.getText().trim();
          }

          changing = false;
        }
      });

      self.privatekeyfileInput.getModel().onDidChange(function () {
        if (Storage.getServers().length !== 0 && !self.disableEventhandler) {
          var index = self.selectServer.selectedOptions[0].value;
          Storage.getServers()[index].privatekeyfile = self.privatekeyfileInput.getText().trim();
        }
      });
      self.remoteInput.getModel().onDidChange(function () {
        if (Storage.getServers().length !== 0 && !self.disableEventhandler) {
          var index = self.selectServer.selectedOptions[0].value;
          Storage.getServers()[index].remote = self.remoteInput.getText().trim();
        }
      });

      // Handle keydown by tab events to switch between fields
      self.nameInput.getModel().getElement().addEventListener('keydown', function (event) {
        if (event.key == 'Tab') {
          event.preventDefault();
          (0, _atomSpacePenViews.$)(self.folderSelect).focus();
        }
      });

      self.folderSelect.addEventListener('keydown', function (event) {
        if (event.key == 'Tab') {
          event.preventDefault();
          self.hostInput.focus();
        }
      });

      self.hostInput.getModel().getElement().addEventListener('keydown', function (event) {
        if (event.key == 'Tab') {
          event.preventDefault();
          self.portInput.focus();
        }
      });

      self.logonTypeSelect.addEventListener('keydown', function (event) {
        if (event.key == 'Tab') {
          event.preventDefault();
          self.userInput.focus();
        }
      });

      self.userInput.getModel().getElement().addEventListener('keydown', function (event) {
        if (event.key == 'Tab') {
          event.preventDefault();
          if (Storage.getServers().length !== 0) {
            var option = self.logonTypeSelect.selectedOptions[0].value;
            if (option == 'credentials') {
              self.passwordInput.focus();
            } else if (option == 'keyfile') {
              self.passwordInput.focus();
            } else if (option == 'agent') {
              self.remoteInput.focus();
            }
          }
        }
      });

      self.passwordInput.getModel().getElement().addEventListener('keydown', function (event) {
        if (event.key == 'Tab') {
          event.preventDefault();
          if (Storage.getServers().length !== 0) {
            var option = self.logonTypeSelect.selectedOptions[0].value;
            if (option == 'credentials') {
              self.remoteInput.focus();
            } else if (option == 'keyfile') {
              self.privatekeyfileInput.focus();
            } else if (option == 'agent') {
              self.remoteInput.focus();
            }
          }
        }
      });

      self.privatekeyfileInput.getModel().getElement().addEventListener('keydown', function (event) {
        if (event.key == 'Tab') {
          event.preventDefault();
          self.remoteInput.focus();
        }
      });

      return divRequired;
    }
  }, {
    key: 'createControlsFolderSelect',
    value: function createControlsFolderSelect() {
      var self = this;

      var selected_value = self.folderSelect.value;

      while (self.folderSelect.firstChild) {
        self.folderSelect.removeChild(self.folderSelect.firstChild);
      }

      var optionNone = document.createElement("option");
      optionNone.text = '- None -';
      optionNone.value = null;
      self.folderSelect.add(optionNone);

      Storage.getFoldersStructuredByTree().forEach(function (config) {
        var folder_option = document.createElement("option");
        folder_option.text = config.name;
        folder_option.value = config.id;
        self.folderSelect.add(folder_option);
      });

      self.folderSelect.value = selected_value;
    }
  }, {
    key: 'createServerSelect',
    value: function createServerSelect() {
      var self = this;

      var div = document.createElement('div');
      div.classList.add('server');
      div.style.marginBottom = '20px';

      var select = document.createElement('select');
      select.classList.add('form-control');
      self.selectServer = select;
      self.selectServer.focus();

      var serverControl = document.createElement('div');
      serverControl.classList.add('controls');
      serverControl.classList.add('server');
      serverControl.appendChild(self.selectServer);

      var newButton = document.createElement('button');
      newButton.textContent = 'New';
      newButton.classList.add('btn');

      self.deleteButton = document.createElement('button');
      self.deleteButton.textContent = 'Delete';
      self.deleteButton.classList.add('btn');

      self.duplicateButton = document.createElement('button');
      self.duplicateButton.textContent = 'Duplicate';
      self.duplicateButton.classList.add('btn');

      self.testButton = document.createElement('button');
      self.testButton.textContent = 'Test';
      self.testButton.classList.add('btn');

      var buttonControl = document.createElement('div');
      buttonControl.classList.add('controls');
      buttonControl.classList.add('server-button');
      buttonControl.appendChild(newButton);
      buttonControl.appendChild(self.deleteButton);
      buttonControl.appendChild(self.duplicateButton);
      buttonControl.appendChild(self.testButton);

      var serverGroup = document.createElement('div');
      serverGroup.classList.add('control-group');
      serverGroup.appendChild(serverControl);
      serverGroup.appendChild(buttonControl);

      div.appendChild(serverGroup);

      // Events
      select.addEventListener('change', function (event) {
        if (Storage.getServers().length !== 0 && !self.disableEventhandler) {
          var option = event.currentTarget.selectedOptions[0];
          var indexInArray = option.value;

          self.fillInputFields(indexInArray ? Storage.getServers()[indexInArray] : null);
        }
      });

      newButton.addEventListener('click', function (event) {
        self['new']();
      });

      self.deleteButton.addEventListener('click', function (event) {
        self['delete']();
      });

      self.duplicateButton.addEventListener('click', function (event) {
        self.duplicate();
      });

      self.testButton.addEventListener('click', function (event) {
        self.test();
      });

      // Handle keydown by tab events to switch between fields
      self.testButton.addEventListener('keydown', function (event) {
        if (event.key == 'Tab') {
          event.preventDefault();
          self.nameInput.focus();
        }
      });

      return div;
    }
  }, {
    key: 'reload',
    value: function reload() {
      var selectedServer = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

      var self = this;

      self.disableEventhandler = true;

      self.createControlsFolderSelect();

      while (self.selectServer.firstChild) {
        self.selectServer.removeChild(self.selectServer.firstChild);
      }

      var selectedIndex = 0;
      if (Storage.getServers().length !== 0) {
        Storage.getServers().forEach(function (item, index) {
          var option = document.createElement("option");
          option.text = item.name;
          option.value = index;
          self.selectServer.add(option);

          if (selectedServer && typeof selectedServer.config !== 'undefined' && selectedServer.config.host !== 'undefined') {
            if (selectedServer.config.host == item.host && selectedServer.config.name == item.name) {
              selectedIndex = index;
            }
          }
        });

        self.selectServer.selectedIndex = selectedIndex;
        self.fillInputFields(Storage.getServers()[selectedIndex]);

        // Enable Input Fields
        self.enableInputFields();
      } else {
        self.fillInputFields();

        // Disable Input Fields
        self.disableInputFields();
      }
      self.disableEventhandler = false;
    }
  }, {
    key: 'attach',
    value: function attach() {
      var self = this;

      self.panel = atom.workspace.addModalPanel({
        item: self
      });

      // Resize content to fit on smaller displays
      var body = document.body.offsetHeight;
      var content = self.panel.element.offsetHeight;
      var offset = (0, _atomSpacePenViews.$)(self.panel.element).position().top;

      if (content + 2 * offset > body) {
        var settings = self.content.find('.server-settings')[0];
        var height = 2 * offset + content - body;
        (0, _atomSpacePenViews.$)(settings).height((0, _atomSpacePenViews.$)(settings).height() - height);
      }
    }
  }, {
    key: 'close',
    value: function close() {
      var self = this;

      var destroyPanel = this.panel;
      this.panel = null;
      if (destroyPanel) {
        destroyPanel.destroy();
      }

      Storage.load(true);

      atom.workspace.getActivePane().activate();
    }
  }, {
    key: 'cancel',
    value: function cancel() {
      this.close();
    }
  }, {
    key: 'showError',
    value: function showError(message) {
      this.error.text(message);
      if (message) {
        this.flashError();
      }
    }
  }, {
    key: 'fillInputFields',
    value: function fillInputFields() {
      var server = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

      var self = this;

      self.disableEventhandler = true;

      if (server) {
        self.nameInput.setText(server.name ? server.name : server.host);
        self.hostInput.setText(server.host);
        self.portInput.setText(server.port);
        if (Storage.getFolder(server.parent)) {
          self.folderSelect.value = Storage.getFolder(server.parent).id;
        } else {
          self.folderSelect.value = 'null';
        }

        if (server.sftp) {
          self.protocolSelect.selectedIndex = 1;
          self.portInput.element.setAttribute('placeholder-text', '22');

          self.logonTypeSelect.options[1].disabled = false;
          self.logonTypeSelect.options[2].disabled = false;
        } else {
          self.protocolSelect.selectedIndex = 0;
          self.portInput.element.setAttribute('placeholder-text', '21');

          self.logonTypeSelect.selectedIndex = 0; // Username/Password
          self.logonTypeSelect.options[1].disabled = true;
          self.logonTypeSelect.options[2].disabled = true;

          self.passwordControl.removeAttribute("style");
          self.privatekeyfileControl.setAttribute("style", "display:none;");
        }

        if (server.logon == 'keyfile') {
          self.logonTypeSelect.selectedIndex = 1; // Keyfile
          self.passwordControl.removeAttribute("style");
          self.privatekeyfileControl.removeAttribute("style");
        } else if (server.logon == 'agent') {
          self.logonTypeSelect.selectedIndex = 2; // SSH Agent
          self.passwordControl.setAttribute("style", "display:none;");
          self.privatekeyfileControl.setAttribute("style", "display:none;");
        } else {
          self.logonTypeSelect.selectedIndex = 0; // Username/Password
          self.passwordControl.removeAttribute("style");
          self.privatekeyfileControl.setAttribute("style", "display:none;");
        }

        self.userInput.setText(server.user);
        self.passwordInput.setText(server.password);
        self.privatekeyfileInput.setText(server.privatekeyfile ? server.privatekeyfile : '');
        self.remoteInput.setText(server.remote ? server.remote : '/');
      } else {
        self.nameInput.setText('');
        self.hostInput.setText('');
        self.portInput.setText('');

        self.protocolSelect.selectedIndex = 0;
        self.logonTypeSelect.selectedIndex = 0;

        self.userInput.setText('');
        self.passwordInput.setText('');
        self.privatekeyfileInput.setText('');
        self.remoteInput.setText('');

        self.privatekeyfileControl.setAttribute("style", "display:none;");
      }

      self.disableEventhandler = false;
    }
  }, {
    key: 'enableInputFields',
    value: function enableInputFields() {
      var self = this;

      self.deleteButton.classList.remove('disabled');
      self.deleteButton.disabled = false;

      self.duplicateButton.classList.remove('disabled');
      self.duplicateButton.disabled = false;

      self.testButton.classList.remove('disabled');
      self.testButton.disabled = false;

      self.nameInput[0].classList.remove('disabled');
      self.nameInput.disabled = false;

      self.folderSelect.classList.remove('disabled');
      self.folderSelect.disabled = false;

      self.hostInput[0].classList.remove('disabled');
      self.hostInput.disabled = false;

      self.portInput[0].classList.remove('disabled');
      self.portInput.disabled = false;

      self.protocolSelect.classList.remove('disabled');
      self.protocolSelect.disabled = false;

      self.logonTypeSelect.classList.remove('disabled');
      self.logonTypeSelect.disabled = false;

      self.userInput[0].classList.remove('disabled');
      self.userInput.disabled = false;

      self.passwordInput[0].classList.remove('disabled');
      self.passwordInput.disabled = false;

      self.privatekeyfileInput[0].classList.remove('disabled');
      self.privatekeyfileInput.disabled = false;

      self.remoteInput[0].classList.remove('disabled');
      self.remoteInput.disabled = false;
    }
  }, {
    key: 'disableInputFields',
    value: function disableInputFields() {
      var self = this;

      self.deleteButton.classList.add('disabled');
      self.deleteButton.disabled = true;

      self.duplicateButton.classList.add('disabled');
      self.duplicateButton.disabled = true;

      self.testButton.classList.add('disabled');
      self.testButton.disabled = true;

      self.nameInput[0].classList.add('disabled');
      self.nameInput.disabled = true;

      self.folderSelect.classList.add('disabled');
      self.folderSelect.disabled = true;

      self.hostInput[0].classList.add('disabled');
      self.hostInput.disabled = true;

      self.portInput[0].classList.add('disabled');
      self.portInput.disabled = true;

      self.protocolSelect.classList.add('disabled');
      self.protocolSelect.disabled = true;

      self.logonTypeSelect.classList.add('disabled');
      self.logonTypeSelect.disabled = true;

      self.userInput[0].classList.add('disabled');
      self.userInput.disabled = true;

      self.passwordInput[0].classList.add('disabled');
      self.passwordInput.disabled = true;

      self.privatekeyfileInput[0].classList.add('disabled');
      self.privatekeyfileInput.disabled = true;

      self.remoteInput[0].classList.add('disabled');
      self.remoteInput.disabled = true;

      var changing = false;
      self.nameInput.getModel().onDidChange(function () {
        if (!changing && self.nameInput.disabled) {
          changing = true;
          self.nameInput.setText('');
          changing = false;
        }
      });
      self.hostInput.getModel().onDidChange(function () {
        if (!changing && self.hostInput.disabled) {
          changing = true;
          self.hostInput.setText('');
          changing = false;
        }
      });
      self.portInput.getModel().onDidChange(function () {
        if (!changing && self.portInput.disabled) {
          changing = true;
          self.portInput.setText('');
          changing = false;
        }
      });
      self.userInput.getModel().onDidChange(function () {
        if (!changing && self.userInput.disabled) {
          changing = true;
          self.userInput.setText('');
          changing = false;
        }
      });
      self.passwordInput.getModel().onDidChange(function () {
        if (!changing && self.passwordInput.disabled) {
          changing = true;
          self.passwordInput.setText('');
          changing = false;
        }
      });
      self.privatekeyfileInput.getModel().onDidChange(function () {
        if (!changing && self.privatekeyfileInput.disabled) {
          changing = true;
          self.privatekeyfileInput.setText('');
          changing = false;
        }
      });
      self.remoteInput.getModel().onDidChange(function () {
        if (!changing && self.remoteInput.disabled) {
          changing = true;
          self.remoteInput.setText('');
          changing = false;
        }
      });
    }
  }, {
    key: 'test',
    value: function test() {
      var self = this;

      if (Storage.getServers().length == 0) return;

      try {
        (function () {
          var index = self.selectServer.selectedOptions[0].value;
          var config = JSON.parse(JSON.stringify(Storage.getServers()[index]));

          var connector = new _connectorsConnectorJs2['default'](config);

          connector.on('debug', function (cmd, param1, param2) {
            if (atom.config.get('ftp-remote-edit.dev.debug')) {
              if (param1 && param2) {
                console.log(cmd, param1, param2);
              } else if (param1) {
                console.log(cmd, param1);
              } else if (cmd) console.log(cmd);
            }
          });

          connector.connect().then(function () {
            (0, _helperHelperJs.showMessage)('Connection could be established successfully');
            connector.disconnect(null)['catch'](function () {});
            connector.destroy();
          })['catch'](function (err) {
            (0, _helperHelperJs.showMessage)(err, 'error');
            connector.disconnect(null)['catch'](function () {});
            connector.destroy();
          });
        })();
      } catch (e) {}
    }
  }, {
    key: 'new',
    value: function _new() {
      var self = this;

      self.enableInputFields();

      var newconfig = JSON.parse(JSON.stringify(config));
      newconfig.name = config.name + " " + (Storage.getServers().length + 1);
      Storage.addServer(newconfig);

      var option = document.createElement('option');
      option.text = newconfig.name;
      option.value = Storage.getServers().length - 1;

      this.selectServer.add(option);
      this.selectServer.value = Storage.getServers().length - 1;
      this.selectServer.dispatchEvent(new Event('change'));
      self.nameInput.focus();
    }
  }, {
    key: 'save',
    value: function save() {
      var self = this;
      Storage.save();
      self.close();
    }
  }, {
    key: 'delete',
    value: function _delete() {
      var self = this;

      if (Storage.getServers().length == 0) return;

      var index = self.selectServer.selectedOptions[0].value;
      Storage.deleteServer(index);

      self.reload();
      self.selectServer.focus();
    }
  }, {
    key: 'duplicate',
    value: function duplicate() {
      var self = this;

      if (Storage.getServers().length == 0) return;

      var index = self.selectServer.selectedOptions[0].value;

      self.enableInputFields();

      var newconfig = JSON.parse(JSON.stringify(Storage.getServers()[index]));
      newconfig.name = newconfig.name + " " + (Storage.getServers().length + 1);
      Storage.addServer(newconfig);

      var option = document.createElement('option');
      option.text = newconfig.name;
      option.value = Storage.getServers().length - 1;

      this.selectServer.add(option);
      this.selectServer.value = Storage.getServers().length - 1;
      this.selectServer.dispatchEvent(new Event('change'));
      self.nameInput.focus();
    }
  }, {
    key: 'import',
    value: function _import() {
      var self = this;
      var importHandler = new _helperImportJs2['default']();

      importHandler.onFinished = function (statistic) {
        var detail = [];

        if (statistic.createdServers) {
          detail.push(statistic.createdServers + " New Server(s)");
        }
        if (statistic.updatedServers) {
          detail.push(statistic.updatedServers + " Updated Server(s)");
        }
        if (statistic.createdFolders) {
          detail.push(statistic.createdFolders + " New Folder(s)");
        }

        atom.notifications.addSuccess('Import completed', {
          detail: 'Imported: ' + detail.join(', ') + '.',
          dismissable: true
        });

        self.reload();
      };

      importHandler.onWarning = function (error) {
        // TODO
      };

      importHandler.onError = function (error) {
        atom.notifications.addError('An error occurred during import.', {
          detail: error.message,
          dismissable: true
        });
      };

      importHandler['import']();
    }
  }, {
    key: 'editFolders',
    value: function editFolders() {
      var self = this;

      var folderConfigurationView = new _viewsFolderConfigurationView2['default']('', true);

      var index = self.folderSelect.selectedOptions[0].value;

      if (index > 0) {
        var folder = Storage.getFolder(index);
        folderConfigurationView.reload(folder);
      } else if (Storage.getFolders().length > 0) {
        var folder = Storage.getFolders()[0];
        folderConfigurationView.reload(folder);
      }

      folderConfigurationView.on('close', function (e) {
        self.createControlsFolderSelect();
        self.attach();
      });

      folderConfigurationView.attach();
    }
  }], [{
    key: 'content',
    value: function content() {
      var _this = this;

      return this.div({
        'class': 'ftp-remote-edit settings-view overlay from-top'
      }, function () {
        _this.div({
          'class': 'panels'
        }, function () {
          _this.div({
            'class': 'panels-item'
          }, function () {
            _this.label({
              'class': 'icon',
              outlet: 'info'
            });
            _this.div({
              'class': 'panels-content',
              outlet: 'content'
            });
            _this.div({
              'class': 'panels-footer',
              outlet: 'footer'
            });
          });
        });
        _this.div({
          'class': 'error-message',
          outlet: 'error'
        });
      });
    }
  }]);

  return ConfigurationView;
})(_atomSpacePenViews.View);

exports['default'] = ConfigurationView;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2FuYW5tYXlqYWluLy5hdG9tL3BhY2thZ2VzL2Z0cC1yZW1vdGUtZWRpdC9saWIvdmlld3MvY29uZmlndXJhdGlvbi12aWV3LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O2lDQUV3QyxzQkFBc0I7O29CQUNkLE1BQU07OzhCQUMxQix1QkFBdUI7O3FDQUM3Qiw4QkFBOEI7Ozs7OEJBQ2pDLHVCQUF1Qjs7Ozs0Q0FDTixzQ0FBc0M7Ozs7QUFQMUUsV0FBVyxDQUFDOztBQVNaLElBQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUM7QUFDekIsSUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLGdDQUFnQyxDQUFDLENBQUM7QUFDekQsSUFBTSxXQUFXLEdBQUcsU0FBUyxHQUFHLHFDQUFxQyxDQUFDO0FBQ3RFLElBQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDOztJQUU3QixpQkFBaUI7WUFBakIsaUJBQWlCOztXQUFqQixpQkFBaUI7MEJBQWpCLGlCQUFpQjs7K0JBQWpCLGlCQUFpQjs7O2VBQWpCLGlCQUFpQjs7V0FpQzFCLHNCQUFHO0FBQ1gsVUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDOztBQUVsQixVQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQztBQUMxQixVQUFJLENBQUMsbUJBQW1CLEdBQUcsS0FBSyxDQUFDOztBQUVqQyxVQUFJLElBQUksR0FBRyx3Q0FBd0MsQ0FBQztBQUNwRCxVQUFJLElBQUksNkdBQTZHLENBQUM7QUFDdEgsVUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7O0FBRXJCLFVBQUksVUFBVSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDbEQsZ0JBQVUsQ0FBQyxXQUFXLEdBQUcsTUFBTSxDQUFDO0FBQ2hDLGdCQUFVLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQzs7QUFF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SSxDQUFDLFlBQVksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDOztBQUVsQyxVQUFJLENBQUMsZUFBZSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDL0MsVUFBSSxDQUFDLGVBQWUsQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDOztBQUVyQyxVQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDMUMsVUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDOztBQUVoQyxVQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDNUMsVUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDOztBQUUvQixVQUFJLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDNUMsVUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDOztBQUVsQyxVQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDNUMsVUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDOztBQUUvQixVQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDNUMsVUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDOztBQUUvQixVQUFJLENBQUMsY0FBYyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDOUMsVUFBSSxDQUFDLGNBQWMsQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDOztBQUVwQyxVQUFJLENBQUMsZUFBZSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7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TTtBQUNiLG9CQUFNLEVBQUUsTUFBTTthQUNmLENBQUMsQ0FBQztBQUNILGtCQUFLLEdBQUcsQ0FBQztBQUNQLHVCQUFPLGdCQUFnQjtBQUN2QixvQkFBTSxFQUFFLFNBQVM7YUFDbEIsQ0FBQyxDQUFDO0FBQ0gsa0JBQUssR0FBRyxDQUFDO0FBQ1AsdUJBQU8sZUFBZTtBQUN0QixvQkFBTSxFQUFFLFFBQVE7YUFDakIsQ0FBQyxDQUFDO1dBQ0osQ0FBQyxDQUFDO1NBQ0osQ0FBQyxDQUFDO0FBQ0gsY0FBSyxHQUFHLENBQUM7QUFDUCxtQkFBTyxlQUFlO0FBQ3RCLGdCQUFNLEVBQUUsT0FBTztTQUNoQixDQUFDLENBQUM7T0FDSixDQUFDLENBQUM7S0FDSjs7O1NBL0JrQixpQkFBaUI7OztxQkFBakIsaUJBQWlCIiwiZmlsZSI6Ii9ob21lL2FuYW5tYXlqYWluLy5hdG9tL3BhY2thZ2VzL2Z0cC1yZW1vdGUtZWRpdC9saWIvdmlld3MvY29uZmlndXJhdGlvbi12aWV3LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbmltcG9ydCB7ICQsIFZpZXcsIFRleHRFZGl0b3JWaWV3IH0gZnJvbSAnYXRvbS1zcGFjZS1wZW4tdmlld3MnO1xuaW1wb3J0IHsgVGV4dEJ1ZmZlciwgQ29tcG9zaXRlRGlzcG9zYWJsZSB9IGZyb20gJ2F0b20nO1xuaW1wb3J0IHsgc2hvd01lc3NhZ2UgfSBmcm9tICcuLy4uL2hlbHBlci9oZWxwZXIuanMnO1xuaW1wb3J0IENvbm5lY3RvciBmcm9tICcuLy4uL2Nvbm5lY3RvcnMvY29ubmVjdG9yLmpzJztcbmltcG9ydCBJbXBvcnQgZnJvbSAnLi8uLi9oZWxwZXIvaW1wb3J0LmpzJztcbmltcG9ydCBGb2xkZXJDb25maWd1cmF0aW9uVmlldyBmcm9tICcuLy4uL3ZpZXdzL2ZvbGRlci1jb25maWd1cmF0aW9uLXZpZXcnO1xuXG5jb25zdCBhdG9tID0gZ2xvYmFsLmF0b207XG5jb25zdCBjb25maWcgPSByZXF1aXJlKCcuLy4uL2NvbmZpZy9zZXJ2ZXItc2NoZW1hLmpzb24nKTtcbmNvbnN0IGRlYnVnQ29uZmlnID0gX19kaXJuYW1lICsgJy4vLi4vY29uZmlnL3NlcnZlci10ZXN0LXNjaGVtYS5qc29uJztcbmNvbnN0IFN0b3JhZ2UgPSByZXF1aXJlKCcuLy4uL2hlbHBlci9zdG9yYWdlLmpzJyk7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENvbmZpZ3VyYXRpb25WaWV3IGV4dGVuZHMgVmlldyB7XG5cbiAgc3RhdGljIGNvbnRlbnQoKSB7XG4gICAgcmV0dXJuIHRoaXMuZGl2KHtcbiAgICAgIGNsYXNzOiAnZnRwLXJlbW90ZS1lZGl0IHNldHRpbmdzLXZpZXcgb3ZlcmxheSBmcm9tLXRvcCdcbiAgICB9LCAoKSA9PiB7XG4gICAgICB0aGlzLmRpdih7XG4gICAgICAgIGNsYXNzOiAncGFuZWxzJyxcbiAgICAgIH0sICgpID0+IHtcbiAgICAgICAgdGhpcy5kaXYoe1xuICAgICAgICAgIGNsYXNzOiAncGFuZWxzLWl0ZW0nLFxuICAgICAgICB9LCAoKSA9PiB7XG4gICAgICAgICAgdGhpcy5sYWJlbCh7XG4gICAgICAgICAgICBjbGFzczogJ2ljb24nLFxuICAgICAgICAgICAgb3V0bGV0OiAnaW5mbycsXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgdGhpcy5kaXYoe1xuICAgICAgICAgICAgY2xhc3M6ICdwYW5lbHMtY29udGVudCcsXG4gICAgICAgICAgICBvdXRsZXQ6ICdjb250ZW50JyxcbiAgICAgICAgICB9KTtcbiAgICAgICAgICB0aGlzLmRpdih7XG4gICAgICAgICAgICBjbGFzczogJ3BhbmVscy1mb290ZXInLFxuICAgICAgICAgICAgb3V0bGV0OiAnZm9vdGVyJyxcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICAgIHRoaXMuZGl2KHtcbiAgICAgICAgY2xhc3M6ICdlcnJvci1tZXNzYWdlJyxcbiAgICAgICAgb3V0bGV0OiAnZXJyb3InLFxuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICBpbml0aWFsaXplKCkge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuXG4gICAgc2VsZi5zdWJzY3JpcHRpb25zID0gbnVsbDtcbiAgICBzZWxmLmRpc2FibGVFdmVudGhhbmRsZXIgPSBmYWxzZTtcblxuICAgIGxldCBodG1sID0gJzxwPkZ0cC1SZW1vdGUtRWRpdCBTZXJ2ZXIgU2V0dGluZ3M8L3A+JztcbiAgICBodG1sICs9IFwiPHA+WW91IGNhbiBlZGl0IGVhY2ggY29ubmVjdGlvbiBhdCB0aGUgdGltZS4gQWxsIGNoYW5nZXMgd2lsbCBvbmx5IGJlIHNhdmVkIGJ5IHB1c2hpbmcgdGhlIHNhdmUgYnV0dG9uLjwvcD5cIjtcbiAgICBzZWxmLmluZm8uaHRtbChodG1sKTtcblxuICAgIGxldCBzYXZlQnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XG4gICAgc2F2ZUJ1dHRvbi50ZXh0Q29udGVudCA9ICdTYXZlJztcbiAgICBzYXZlQnV0dG9uLmNsYXNzTGlzdC5hZGQoJ2J0bicpO1xuXG4gICAgbGV0IGltcG9ydEJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xuICAgIGltcG9ydEJ1dHRvbi50ZXh0Q29udGVudCA9ICdJbXBvcnQnO1xuICAgIGltcG9ydEJ1dHRvbi5jbGFzc0xpc3QuYWRkKCdidG4nKTtcblxuICAgIGxldCBjbG9zZUJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xuICAgIGNsb3NlQnV0dG9uLnRleHRDb250ZW50ID0gJ0NhbmNlbCc7XG4gICAgY2xvc2VCdXR0b24uY2xhc3NMaXN0LmFkZCgnYnRuJyk7XG4gICAgY2xvc2VCdXR0b24uY2xhc3NMaXN0LmFkZCgncHVsbC1yaWdodCcpO1xuXG4gICAgc2VsZi5jb250ZW50LmFwcGVuZChzZWxmLmNyZWF0ZVNlcnZlclNlbGVjdCgpKTtcbiAgICBzZWxmLmNvbnRlbnQuYXBwZW5kKHNlbGYuY3JlYXRlQ29udHJvbHMoKSk7XG5cbiAgICBzZWxmLmZvb3Rlci5hcHBlbmQoc2F2ZUJ1dHRvbik7XG4gICAgc2VsZi5mb290ZXIuYXBwZW5kKGltcG9ydEJ1dHRvbik7XG4gICAgc2VsZi5mb290ZXIuYXBwZW5kKGNsb3NlQnV0dG9uKTtcblxuICAgIC8vIEV2ZW50c1xuICAgIGNsb3NlQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGV2ZW50KSA9PiB7XG4gICAgICBzZWxmLmNsb3NlKCk7XG4gICAgfSk7XG5cbiAgICBzYXZlQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGV2ZW50KSA9PiB7XG4gICAgICBzZWxmLnNhdmUoKTtcbiAgICAgIHNlbGYuY2xvc2UoKTtcbiAgICB9KTtcblxuICAgIGltcG9ydEJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChldmVudCkgPT4ge1xuICAgICAgc2VsZi5pbXBvcnQoKTtcbiAgICB9KTtcblxuICAgIHNlbGYuc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gICAgc2VsZi5zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbW1hbmRzLmFkZCh0aGlzLmVsZW1lbnQsIHtcbiAgICAgICdjb3JlOmNvbmZpcm0nOiAoKSA9PiB7XG4gICAgICAgIC8vIHNlbGYuc2F2ZSgpO1xuICAgICAgfSxcbiAgICAgICdjb3JlOmNhbmNlbCc6ICgpID0+IHtcbiAgICAgICAgc2VsZi5jYW5jZWwoKTtcbiAgICAgIH0sXG4gICAgfSkpO1xuXG4gICAgLy8gSGFuZGxlIGtleWRvd24gYnkgdGFiIGV2ZW50cyB0byBzd2l0Y2ggYmV0d2VlbiBmaWVsZHNcbiAgICBjbG9zZUJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgKGV2ZW50KSA9PiB7XG4gICAgICBpZiAoZXZlbnQua2V5ID09ICdUYWInKSB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHNlbGYuc2VsZWN0U2VydmVyLmZvY3VzKCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBkZXN0cm95KCkge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuXG4gICAgaWYgKHNlbGYuc3Vic2NyaXB0aW9ucykge1xuICAgICAgc2VsZi5zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKTtcbiAgICAgIHNlbGYuc3Vic2NyaXB0aW9ucyA9IG51bGw7XG4gICAgfVxuICB9XG5cbiAgY3JlYXRlQ29udHJvbHMoKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG5cbiAgICBsZXQgZGl2UmVxdWlyZWQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBkaXZSZXF1aXJlZC5jbGFzc0xpc3QuYWRkKCdzZXJ2ZXItc2V0dGluZ3MnKTtcblxuICAgIGxldCBuYW1lTGFiZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsYWJlbCcpO1xuICAgIG5hbWVMYWJlbC5jbGFzc0xpc3QuYWRkKCdjb250cm9sLWxhYmVsJyk7XG4gICAgbGV0IG5hbWVMYWJlbFRpdGxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgbmFtZUxhYmVsVGl0bGUudGV4dENvbnRlbnQgPSAnVGhlIG5hbWUgb2YgdGhlIHNlcnZlci4nO1xuICAgIG5hbWVMYWJlbFRpdGxlLmNsYXNzTGlzdC5hZGQoJ3NldHRpbmctdGl0bGUnKTtcbiAgICBuYW1lTGFiZWwuYXBwZW5kQ2hpbGQobmFtZUxhYmVsVGl0bGUpO1xuICAgIHNlbGYubmFtZUlucHV0ID0gbmV3IFRleHRFZGl0b3JWaWV3KHsgbWluaTogdHJ1ZSwgcGxhY2Vob2xkZXJUZXh0OiBcIm5hbWVcIiB9KTtcbiAgICBzZWxmLm5hbWVJbnB1dC5lbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2Zvcm0tY29udHJvbCcpO1xuXG4gICAgbGV0IGZvbGRlckxhYmVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGFiZWwnKTtcbiAgICBmb2xkZXJMYWJlbC5jbGFzc0xpc3QuYWRkKCdjb250cm9sLWxhYmVsJyk7XG4gICAgbGV0IGZvbGRlckxhYmVsVGl0bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBmb2xkZXJMYWJlbFRpdGxlLnRleHRDb250ZW50ID0gJ0ZvbGRlcic7XG4gICAgZm9sZGVyTGFiZWxUaXRsZS5jbGFzc0xpc3QuYWRkKCdzZXR0aW5nLXRpdGxlJyk7XG4gICAgZm9sZGVyTGFiZWwuYXBwZW5kQ2hpbGQoZm9sZGVyTGFiZWxUaXRsZSk7XG5cbiAgICBzZWxmLmZvbGRlclNlbGVjdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NlbGVjdCcpO1xuICAgIHNlbGYuZm9sZGVyU2VsZWN0LmNsYXNzTGlzdC5hZGQoJ2Zvcm0tY29udHJvbCcpO1xuICAgIHNlbGYuY3JlYXRlQ29udHJvbHNGb2xkZXJTZWxlY3QoKTtcblxuICAgIHNlbGYuZm9sZGVyRWRpdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xuICAgIHNlbGYuZm9sZGVyRWRpdC50ZXh0Q29udGVudCA9ICdFZGl0JztcbiAgICBzZWxmLmZvbGRlckVkaXQuY2xhc3NMaXN0LmFkZCgnYnRuJyk7XG5cbiAgICBsZXQgaG9zdExhYmVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGFiZWwnKTtcbiAgICBob3N0TGFiZWwuY2xhc3NMaXN0LmFkZCgnY29udHJvbC1sYWJlbCcpO1xuICAgIGxldCBob3N0TGFiZWxUaXRsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGhvc3RMYWJlbFRpdGxlLnRleHRDb250ZW50ID0gJ1RoZSBob3N0bmFtZSBvciBJUCBhZGRyZXNzIG9mIHRoZSBzZXJ2ZXIuJztcbiAgICBob3N0TGFiZWxUaXRsZS5jbGFzc0xpc3QuYWRkKCdzZXR0aW5nLXRpdGxlJyk7XG4gICAgaG9zdExhYmVsLmFwcGVuZENoaWxkKGhvc3RMYWJlbFRpdGxlKTtcbiAgICBzZWxmLmhvc3RJbnB1dCA9IG5ldyBUZXh0RWRpdG9yVmlldyh7IG1pbmk6IHRydWUsIHBsYWNlaG9sZGVyVGV4dDogXCJsb2NhbGhvc3RcIiB9KTtcbiAgICBzZWxmLmhvc3RJbnB1dC5lbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2Zvcm0tY29udHJvbCcpO1xuXG4gICAgbGV0IHBvcnRMYWJlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xhYmVsJyk7XG4gICAgcG9ydExhYmVsLmNsYXNzTGlzdC5hZGQoJ2NvbnRyb2wtbGFiZWwnKTtcbiAgICBsZXQgcG9ydExhYmVsVGl0bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBwb3J0TGFiZWxUaXRsZS50ZXh0Q29udGVudCA9ICdQb3J0JztcbiAgICBwb3J0TGFiZWxUaXRsZS5jbGFzc0xpc3QuYWRkKCdzZXR0aW5nLXRpdGxlJyk7XG4gICAgcG9ydExhYmVsLmFwcGVuZENoaWxkKHBvcnRMYWJlbFRpdGxlKTtcbiAgICBzZWxmLnBvcnRJbnB1dCA9IG5ldyBUZXh0RWRpdG9yVmlldyh7IG1pbmk6IHRydWUsIHBsYWNlaG9sZGVyVGV4dDogXCIyMVwiIH0pO1xuICAgIHNlbGYucG9ydElucHV0LmVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnZm9ybS1jb250cm9sJyk7XG5cbiAgICBsZXQgcHJvdG9jb2xMYWJlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xhYmVsJyk7XG4gICAgcHJvdG9jb2xMYWJlbC5jbGFzc0xpc3QuYWRkKCdjb250cm9sLWxhYmVsJyk7XG4gICAgbGV0IHByb3RvY29sTGFiZWxUaXRsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIHByb3RvY29sTGFiZWxUaXRsZS50ZXh0Q29udGVudCA9ICdQcm90b2NvbCc7XG4gICAgcHJvdG9jb2xMYWJlbFRpdGxlLmNsYXNzTGlzdC5hZGQoJ3NldHRpbmctdGl0bGUnKTtcbiAgICBwcm90b2NvbExhYmVsLmFwcGVuZENoaWxkKHByb3RvY29sTGFiZWxUaXRsZSk7XG5cbiAgICBzZWxmLnByb3RvY29sU2VsZWN0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2VsZWN0Jyk7XG4gICAgc2VsZi5wcm90b2NvbFNlbGVjdC5jbGFzc0xpc3QuYWRkKCdmb3JtLWNvbnRyb2wnKTtcbiAgICBsZXQgb3B0aW9uRlRQID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcIm9wdGlvblwiKTtcbiAgICBvcHRpb25GVFAudGV4dCA9ICdGVFAgLSBGaWxlIFRyYW5zZmVyIFByb3RvY29sJztcbiAgICBvcHRpb25GVFAudmFsdWUgPSAnZnRwJztcbiAgICBzZWxmLnByb3RvY29sU2VsZWN0LmFkZChvcHRpb25GVFApO1xuICAgIGxldCBvcHRpb25TRlRQID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcIm9wdGlvblwiKTtcbiAgICBvcHRpb25TRlRQLnRleHQgPSAnU0ZUUCAtIFNTSCBGaWxlIFRyYW5zZmVyIFByb3RvY29sJztcbiAgICBvcHRpb25TRlRQLnZhbHVlID0gJ3NmdHAnO1xuICAgIHNlbGYucHJvdG9jb2xTZWxlY3QuYWRkKG9wdGlvblNGVFApO1xuICAgIGxldCBwcm90b2NvbFNlbGVjdENvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIHByb3RvY29sU2VsZWN0Q29udGFpbmVyLmNsYXNzTGlzdC5hZGQoJ3NlbGVjdC1jb250YWluZXInKTtcbiAgICBwcm90b2NvbFNlbGVjdENvbnRhaW5lci5hcHBlbmRDaGlsZChzZWxmLnByb3RvY29sU2VsZWN0KTtcblxuICAgIGxldCBsb2dvblR5cGVMYWJlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xhYmVsJyk7XG4gICAgbG9nb25UeXBlTGFiZWwuY2xhc3NMaXN0LmFkZCgnY29udHJvbC1sYWJlbCcpO1xuICAgIGxldCBsb2dvblR5cGVMYWJlbFRpdGxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgbG9nb25UeXBlTGFiZWxUaXRsZS50ZXh0Q29udGVudCA9ICdMb2dvbiBUeXBlJztcbiAgICBsb2dvblR5cGVMYWJlbFRpdGxlLmNsYXNzTGlzdC5hZGQoJ3NldHRpbmctdGl0bGUnKTtcbiAgICBsb2dvblR5cGVMYWJlbC5hcHBlbmRDaGlsZChsb2dvblR5cGVMYWJlbFRpdGxlKTtcblxuICAgIHNlbGYubG9nb25UeXBlU2VsZWN0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2VsZWN0Jyk7XG4gICAgc2VsZi5sb2dvblR5cGVTZWxlY3QuY2xhc3NMaXN0LmFkZCgnZm9ybS1jb250cm9sJyk7XG4gICAgbGV0IG9wdGlvbk5vcm1hbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJvcHRpb25cIik7XG4gICAgb3B0aW9uTm9ybWFsLnRleHQgPSAnVXNlcm5hbWUgLyBQYXNzd29yZCc7XG4gICAgb3B0aW9uTm9ybWFsLnZhbHVlID0gJ2NyZWRlbnRpYWxzJztcbiAgICBzZWxmLmxvZ29uVHlwZVNlbGVjdC5hZGQob3B0aW9uTm9ybWFsKTtcbiAgICBsZXQgb3B0aW9uS2V5RmlsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJvcHRpb25cIik7XG4gICAgb3B0aW9uS2V5RmlsZS50ZXh0ID0gJ0tleWZpbGUgKE9wZW5TU0ggZm9ybWF0IC0gUEVNKSc7XG4gICAgb3B0aW9uS2V5RmlsZS52YWx1ZSA9ICdrZXlmaWxlJztcbiAgICBzZWxmLmxvZ29uVHlwZVNlbGVjdC5hZGQob3B0aW9uS2V5RmlsZSk7XG4gICAgbGV0IG9wdGlvbkFnZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcIm9wdGlvblwiKTtcbiAgICBvcHRpb25BZ2VudC50ZXh0ID0gJ1NTSCBBZ2VudCc7XG4gICAgb3B0aW9uQWdlbnQudmFsdWUgPSAnYWdlbnQnO1xuICAgIHNlbGYubG9nb25UeXBlU2VsZWN0LmFkZChvcHRpb25BZ2VudCk7XG4gICAgbGV0IGxvZ29uVHlwZVNlbGVjdENvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGxvZ29uVHlwZVNlbGVjdENvbnRhaW5lci5jbGFzc0xpc3QuYWRkKCdzZWxlY3QtY29udGFpbmVyJyk7XG4gICAgbG9nb25UeXBlU2VsZWN0Q29udGFpbmVyLmFwcGVuZENoaWxkKHNlbGYubG9nb25UeXBlU2VsZWN0KTtcblxuICAgIGxldCB1c2VyTGFiZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsYWJlbCcpO1xuICAgIHVzZXJMYWJlbC5jbGFzc0xpc3QuYWRkKCdjb250cm9sLWxhYmVsJyk7XG4gICAgbGV0IHVzZXJMYWJlbFRpdGxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgdXNlckxhYmVsVGl0bGUudGV4dENvbnRlbnQgPSBgVXNlcm5hbWUgZm9yIGF1dGhlbnRpY2F0aW9uLmA7XG4gICAgdXNlckxhYmVsVGl0bGUuY2xhc3NMaXN0LmFkZCgnc2V0dGluZy10aXRsZScpO1xuICAgIHVzZXJMYWJlbC5hcHBlbmRDaGlsZCh1c2VyTGFiZWxUaXRsZSk7XG4gICAgc2VsZi51c2VySW5wdXQgPSBuZXcgVGV4dEVkaXRvclZpZXcoeyBtaW5pOiB0cnVlLCBwbGFjZWhvbGRlclRleHQ6IFwidXNlcm5hbWVcIiB9KTtcbiAgICBzZWxmLnVzZXJJbnB1dC5lbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2Zvcm0tY29udHJvbCcpO1xuXG4gICAgbGV0IHBhc3N3b3JkTGFiZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsYWJlbCcpO1xuICAgIHBhc3N3b3JkTGFiZWwuY2xhc3NMaXN0LmFkZCgnY29udHJvbC1sYWJlbCcpO1xuICAgIGxldCBwYXNzd29yZExhYmVsVGl0bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBwYXNzd29yZExhYmVsVGl0bGUudGV4dENvbnRlbnQgPSBgUGFzc3dvcmQvUGFzc3BocmFzZSBmb3IgYXV0aGVudGljYXRpb24uYDtcbiAgICBwYXNzd29yZExhYmVsVGl0bGUuY2xhc3NMaXN0LmFkZCgnc2V0dGluZy10aXRsZScpO1xuICAgIHBhc3N3b3JkTGFiZWwuYXBwZW5kQ2hpbGQocGFzc3dvcmRMYWJlbFRpdGxlKTtcbiAgICBzZWxmLnBhc3N3b3JkSW5wdXQgPSBuZXcgVGV4dEVkaXRvclZpZXcoeyBtaW5pOiB0cnVlLCBwbGFjZWhvbGRlclRleHQ6IFwicGFzc3dvcmRcIiB9KTtcbiAgICBzZWxmLnBhc3N3b3JkSW5wdXQuZWxlbWVudC5jbGFzc0xpc3QuYWRkKCdmb3JtLWNvbnRyb2wnKTtcblxuICAgIGxldCBwcml2YXRla2V5ZmlsZUxhYmVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGFiZWwnKTtcbiAgICBwcml2YXRla2V5ZmlsZUxhYmVsLmNsYXNzTGlzdC5hZGQoJ2NvbnRyb2wtbGFiZWwnKTtcbiAgICBsZXQgcHJpdmF0ZWtleWZpbGVMYWJlbFRpdGxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgcHJpdmF0ZWtleWZpbGVMYWJlbFRpdGxlLnRleHRDb250ZW50ID0gYFBhdGggdG8gcHJpdmF0ZSBrZXlmaWxlLmA7XG4gICAgcHJpdmF0ZWtleWZpbGVMYWJlbFRpdGxlLmNsYXNzTGlzdC5hZGQoJ3NldHRpbmctdGl0bGUnKTtcbiAgICBwcml2YXRla2V5ZmlsZUxhYmVsLmFwcGVuZENoaWxkKHByaXZhdGVrZXlmaWxlTGFiZWxUaXRsZSk7XG4gICAgc2VsZi5wcml2YXRla2V5ZmlsZUlucHV0ID0gbmV3IFRleHRFZGl0b3JWaWV3KHsgbWluaTogdHJ1ZSwgcGxhY2Vob2xkZXJUZXh0OiBcInBhdGggdG8gcHJpdmF0ZSBrZXlmaWxlIChvcHRpb25hbClcIiB9KTtcbiAgICBzZWxmLnByaXZhdGVrZXlmaWxlSW5wdXQuZWxlbWVudC5jbGFzc0xpc3QuYWRkKCdmb3JtLWNvbnRyb2wnKTtcblxuICAgIGxldCByZW1vdGVMYWJlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xhYmVsJyk7XG4gICAgcmVtb3RlTGFiZWwuY2xhc3NMaXN0LmFkZCgnY29udHJvbC1sYWJlbCcpO1xuICAgIGxldCByZW1vdGVMYWJlbFRpdGxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgcmVtb3RlTGFiZWxUaXRsZS50ZXh0Q29udGVudCA9IGBJbml0aWFsIERpcmVjdG9yeS5gO1xuICAgIHJlbW90ZUxhYmVsVGl0bGUuY2xhc3NMaXN0LmFkZCgnc2V0dGluZy10aXRsZScpO1xuICAgIHJlbW90ZUxhYmVsLmFwcGVuZENoaWxkKHJlbW90ZUxhYmVsVGl0bGUpO1xuICAgIHNlbGYucmVtb3RlSW5wdXQgPSBuZXcgVGV4dEVkaXRvclZpZXcoeyBtaW5pOiB0cnVlLCBwbGFjZWhvbGRlclRleHQ6IFwiL1wiIH0pO1xuICAgIHNlbGYucmVtb3RlSW5wdXQuZWxlbWVudC5jbGFzc0xpc3QuYWRkKCdmb3JtLWNvbnRyb2wnKTtcblxuICAgIGxldCBuYW1lQ29udHJvbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIG5hbWVDb250cm9sLmNsYXNzTGlzdC5hZGQoJ2NvbnRyb2xzJyk7XG4gICAgbmFtZUNvbnRyb2wuY2xhc3NMaXN0LmFkZCgnbmFtZScpO1xuICAgIG5hbWVDb250cm9sLmFwcGVuZENoaWxkKG5hbWVMYWJlbCk7XG4gICAgbmFtZUNvbnRyb2wuYXBwZW5kQ2hpbGQoc2VsZi5uYW1lSW5wdXQuZWxlbWVudCk7XG5cbiAgICBsZXQgZm9sZGVyQ29udHJvbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGZvbGRlckNvbnRyb2wuY2xhc3NMaXN0LmFkZCgnY29udHJvbHMnKTtcbiAgICBmb2xkZXJDb250cm9sLmNsYXNzTGlzdC5hZGQoJ2ZvbGRlcicpO1xuICAgIGZvbGRlckNvbnRyb2wuYXBwZW5kQ2hpbGQoZm9sZGVyTGFiZWwpO1xuICAgIGZvbGRlckNvbnRyb2wuYXBwZW5kQ2hpbGQoc2VsZi5mb2xkZXJTZWxlY3QpO1xuXG4gICAgbGV0IGZvbGRlckJ1dHRvbkNvbnRyb2wgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBmb2xkZXJCdXR0b25Db250cm9sLmNsYXNzTGlzdC5hZGQoJ2NvbnRyb2xzJyk7XG4gICAgZm9sZGVyQnV0dG9uQ29udHJvbC5jbGFzc0xpc3QuYWRkKCdmb2xkZXItYnV0dG9uJyk7XG4gICAgZm9sZGVyQnV0dG9uQ29udHJvbC5hcHBlbmRDaGlsZChzZWxmLmZvbGRlckVkaXQpO1xuXG4gICAgbGV0IGhvc3RDb250cm9sID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgaG9zdENvbnRyb2wuY2xhc3NMaXN0LmFkZCgnY29udHJvbHMnKTtcbiAgICBob3N0Q29udHJvbC5jbGFzc0xpc3QuYWRkKCdob3N0Jyk7XG4gICAgaG9zdENvbnRyb2wuYXBwZW5kQ2hpbGQoaG9zdExhYmVsKTtcbiAgICBob3N0Q29udHJvbC5hcHBlbmRDaGlsZChzZWxmLmhvc3RJbnB1dC5lbGVtZW50KTtcblxuICAgIGxldCBwb3J0Q29udHJvbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIHBvcnRDb250cm9sLmNsYXNzTGlzdC5hZGQoJ2NvbnRyb2xzJyk7XG4gICAgcG9ydENvbnRyb2wuY2xhc3NMaXN0LmFkZCgncG9ydCcpO1xuICAgIHBvcnRDb250cm9sLmFwcGVuZENoaWxkKHBvcnRMYWJlbCk7XG4gICAgcG9ydENvbnRyb2wuYXBwZW5kQ2hpbGQoc2VsZi5wb3J0SW5wdXQuZWxlbWVudCk7XG5cbiAgICBsZXQgcHJvdG9jb2xDb250cm9sID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgcHJvdG9jb2xDb250cm9sLmNsYXNzTGlzdC5hZGQoJ2NvbnRyb2xzJyk7XG4gICAgcHJvdG9jb2xDb250cm9sLmNsYXNzTGlzdC5hZGQoJ3Byb3RvY29sJyk7XG4gICAgcHJvdG9jb2xDb250cm9sLmFwcGVuZENoaWxkKHByb3RvY29sTGFiZWwpO1xuICAgIHByb3RvY29sQ29udHJvbC5hcHBlbmRDaGlsZChwcm90b2NvbFNlbGVjdENvbnRhaW5lcik7XG5cbiAgICBsZXQgbG9nb25UeXBlQ29udHJvbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGxvZ29uVHlwZUNvbnRyb2wuY2xhc3NMaXN0LmFkZCgnY29udHJvbHMnKTtcbiAgICBsb2dvblR5cGVDb250cm9sLmNsYXNzTGlzdC5hZGQoJ3Byb3RvY29sJyk7XG4gICAgbG9nb25UeXBlQ29udHJvbC5hcHBlbmRDaGlsZChsb2dvblR5cGVMYWJlbCk7XG4gICAgbG9nb25UeXBlQ29udHJvbC5hcHBlbmRDaGlsZChsb2dvblR5cGVTZWxlY3RDb250YWluZXIpO1xuXG4gICAgbGV0IG5hbWVHcm91cCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIG5hbWVHcm91cC5jbGFzc0xpc3QuYWRkKCdjb250cm9sLWdyb3VwJyk7XG4gICAgbmFtZUdyb3VwLmFwcGVuZENoaWxkKG5hbWVDb250cm9sKTtcbiAgICBuYW1lR3JvdXAuYXBwZW5kQ2hpbGQoZm9sZGVyQ29udHJvbCk7XG4gICAgbmFtZUdyb3VwLmFwcGVuZENoaWxkKGZvbGRlckJ1dHRvbkNvbnRyb2wpO1xuICAgIGRpdlJlcXVpcmVkLmFwcGVuZENoaWxkKG5hbWVHcm91cCk7XG5cbiAgICBsZXQgaG9zdEdyb3VwID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgaG9zdEdyb3VwLmNsYXNzTGlzdC5hZGQoJ2NvbnRyb2wtZ3JvdXAnKTtcbiAgICBob3N0R3JvdXAuYXBwZW5kQ2hpbGQoaG9zdENvbnRyb2wpO1xuICAgIGhvc3RHcm91cC5hcHBlbmRDaGlsZChwb3J0Q29udHJvbCk7XG4gICAgZGl2UmVxdWlyZWQuYXBwZW5kQ2hpbGQoaG9zdEdyb3VwKTtcblxuICAgIGxldCBwcm90b2NvbEdyb3VwID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgcHJvdG9jb2xHcm91cC5jbGFzc0xpc3QuYWRkKCdjb250cm9sLWdyb3VwJyk7XG4gICAgcHJvdG9jb2xHcm91cC5hcHBlbmRDaGlsZChwcm90b2NvbENvbnRyb2wpO1xuICAgIHByb3RvY29sR3JvdXAuYXBwZW5kQ2hpbGQobG9nb25UeXBlQ29udHJvbCk7XG4gICAgZGl2UmVxdWlyZWQuYXBwZW5kQ2hpbGQocHJvdG9jb2xHcm91cCk7XG5cbiAgICBsZXQgdXNlcm5hbWVDb250cm9sID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgdXNlcm5hbWVDb250cm9sLmNsYXNzTGlzdC5hZGQoJ2NvbnRyb2xzJyk7XG4gICAgdXNlcm5hbWVDb250cm9sLmNsYXNzTGlzdC5hZGQoJ3VzZXJuYW1lJyk7XG4gICAgdXNlcm5hbWVDb250cm9sLmFwcGVuZENoaWxkKHVzZXJMYWJlbCk7XG4gICAgdXNlcm5hbWVDb250cm9sLmFwcGVuZENoaWxkKHNlbGYudXNlcklucHV0LmVsZW1lbnQpO1xuXG4gICAgc2VsZi5wYXNzd29yZENvbnRyb2wgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBzZWxmLnBhc3N3b3JkQ29udHJvbC5jbGFzc0xpc3QuYWRkKCdjb250cm9scycpO1xuICAgIHNlbGYucGFzc3dvcmRDb250cm9sLmNsYXNzTGlzdC5hZGQoJ3Bhc3N3b3JkJyk7XG4gICAgc2VsZi5wYXNzd29yZENvbnRyb2wuYXBwZW5kQ2hpbGQocGFzc3dvcmRMYWJlbCk7XG4gICAgc2VsZi5wYXNzd29yZENvbnRyb2wuYXBwZW5kQ2hpbGQoc2VsZi5wYXNzd29yZElucHV0LmVsZW1lbnQpO1xuXG4gICAgbGV0IGNyZWRlbnRpYWxHcm91cCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGNyZWRlbnRpYWxHcm91cC5jbGFzc0xpc3QuYWRkKCdjb250cm9sLWdyb3VwJyk7XG4gICAgY3JlZGVudGlhbEdyb3VwLmFwcGVuZENoaWxkKHVzZXJuYW1lQ29udHJvbCk7XG4gICAgY3JlZGVudGlhbEdyb3VwLmFwcGVuZENoaWxkKHNlbGYucGFzc3dvcmRDb250cm9sKTtcbiAgICBkaXZSZXF1aXJlZC5hcHBlbmRDaGlsZChjcmVkZW50aWFsR3JvdXApO1xuXG4gICAgc2VsZi5wcml2YXRla2V5ZmlsZUNvbnRyb2wgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBzZWxmLnByaXZhdGVrZXlmaWxlQ29udHJvbC5jbGFzc0xpc3QuYWRkKCdjb250cm9scycpO1xuICAgIHNlbGYucHJpdmF0ZWtleWZpbGVDb250cm9sLmNsYXNzTGlzdC5hZGQoJ3ByaXZhdGVrZXlmaWxlJyk7XG4gICAgc2VsZi5wcml2YXRla2V5ZmlsZUNvbnRyb2wuYXBwZW5kQ2hpbGQocHJpdmF0ZWtleWZpbGVMYWJlbCk7XG4gICAgc2VsZi5wcml2YXRla2V5ZmlsZUNvbnRyb2wuYXBwZW5kQ2hpbGQoc2VsZi5wcml2YXRla2V5ZmlsZUlucHV0LmVsZW1lbnQpO1xuXG4gICAgbGV0IHJlbW90ZUNvbnRyb2wgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICByZW1vdGVDb250cm9sLmNsYXNzTGlzdC5hZGQoJ2NvbnRyb2xzJyk7XG4gICAgcmVtb3RlQ29udHJvbC5jbGFzc0xpc3QuYWRkKCdyZW1vdGUnKTtcbiAgICByZW1vdGVDb250cm9sLmFwcGVuZENoaWxkKHJlbW90ZUxhYmVsKTtcbiAgICByZW1vdGVDb250cm9sLmFwcGVuZENoaWxkKHNlbGYucmVtb3RlSW5wdXQuZWxlbWVudCk7XG5cbiAgICBsZXQgYWR2YW5jZWRTZXR0aW5nc0dyb3VwID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgYWR2YW5jZWRTZXR0aW5nc0dyb3VwLmNsYXNzTGlzdC5hZGQoJ2NvbnRyb2wtZ3JvdXAnKTtcbiAgICBhZHZhbmNlZFNldHRpbmdzR3JvdXAuYXBwZW5kQ2hpbGQoc2VsZi5wcml2YXRla2V5ZmlsZUNvbnRyb2wpO1xuICAgIGFkdmFuY2VkU2V0dGluZ3NHcm91cC5hcHBlbmRDaGlsZChyZW1vdGVDb250cm9sKTtcbiAgICBkaXZSZXF1aXJlZC5hcHBlbmRDaGlsZChhZHZhbmNlZFNldHRpbmdzR3JvdXApO1xuXG4gICAgLy8gRXZlbnRzXG4gICAgc2VsZi5uYW1lSW5wdXQuZ2V0TW9kZWwoKS5vbkRpZENoYW5nZSgoKSA9PiB7XG4gICAgICBpZiAoU3RvcmFnZS5nZXRTZXJ2ZXJzKCkubGVuZ3RoICE9PSAwICYmICFzZWxmLmRpc2FibGVFdmVudGhhbmRsZXIpIHtcbiAgICAgICAgbGV0IGluZGV4ID0gc2VsZi5zZWxlY3RTZXJ2ZXIuc2VsZWN0ZWRPcHRpb25zWzBdLnZhbHVlO1xuICAgICAgICBTdG9yYWdlLmdldFNlcnZlcnMoKVtpbmRleF0ubmFtZSA9IHNlbGYubmFtZUlucHV0LmdldFRleHQoKS50cmltKCk7XG4gICAgICAgIHNlbGYuc2VsZWN0U2VydmVyLnNlbGVjdGVkT3B0aW9uc1swXS50ZXh0ID0gc2VsZi5uYW1lSW5wdXQuZ2V0VGV4dCgpLnRyaW0oKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBzZWxmLmhvc3RJbnB1dC5nZXRNb2RlbCgpLm9uRGlkQ2hhbmdlKCgpID0+IHtcbiAgICAgIGlmIChTdG9yYWdlLmdldFNlcnZlcnMoKS5sZW5ndGggIT09IDAgJiYgIXNlbGYuZGlzYWJsZUV2ZW50aGFuZGxlcikge1xuICAgICAgICBsZXQgaW5kZXggPSBzZWxmLnNlbGVjdFNlcnZlci5zZWxlY3RlZE9wdGlvbnNbMF0udmFsdWU7XG4gICAgICAgIFN0b3JhZ2UuZ2V0U2VydmVycygpW2luZGV4XS5ob3N0ID0gc2VsZi5ob3N0SW5wdXQuZ2V0VGV4dCgpLnRyaW0oKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBzZWxmLnBvcnRJbnB1dC5nZXRNb2RlbCgpLm9uRGlkQ2hhbmdlKCgpID0+IHtcbiAgICAgIGlmIChTdG9yYWdlLmdldFNlcnZlcnMoKS5sZW5ndGggIT09IDAgJiYgIXNlbGYuZGlzYWJsZUV2ZW50aGFuZGxlcikge1xuICAgICAgICBsZXQgaW5kZXggPSBzZWxmLnNlbGVjdFNlcnZlci5zZWxlY3RlZE9wdGlvbnNbMF0udmFsdWU7XG4gICAgICAgIFN0b3JhZ2UuZ2V0U2VydmVycygpW2luZGV4XS5wb3J0ID0gc2VsZi5wb3J0SW5wdXQuZ2V0VGV4dCgpLnRyaW0oKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHNlbGYuZm9sZGVyU2VsZWN0LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIChldmVudCkgPT4ge1xuICAgICAgaWYgKFN0b3JhZ2UuZ2V0Rm9sZGVycygpLmxlbmd0aCAhPT0gMCAmJiAhc2VsZi5kaXNhYmxlRXZlbnRoYW5kbGVyKSB7XG4gICAgICAgIGxldCBpbmRleCA9IHNlbGYuc2VsZWN0U2VydmVyLnNlbGVjdGVkT3B0aW9uc1swXS52YWx1ZTtcbiAgICAgICAgbGV0IG9wdGlvbiA9IGV2ZW50LmN1cnJlbnRUYXJnZXQuc2VsZWN0ZWRPcHRpb25zWzBdO1xuICAgICAgICBTdG9yYWdlLmdldFNlcnZlcnMoKVtpbmRleF0ucGFyZW50ID0gcGFyc2VJbnQob3B0aW9uLnZhbHVlKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHNlbGYuZm9sZGVyRWRpdC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChldmVudCkgPT4ge1xuICAgICAgc2VsZi5lZGl0Rm9sZGVycygpO1xuICAgIH0pO1xuXG4gICAgc2VsZi5wcm90b2NvbFNlbGVjdC5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCAoZXZlbnQpID0+IHtcbiAgICAgIGlmIChTdG9yYWdlLmdldFNlcnZlcnMoKS5sZW5ndGggIT09IDAgJiYgIXNlbGYuZGlzYWJsZUV2ZW50aGFuZGxlcikge1xuICAgICAgICBsZXQgaW5kZXggPSBzZWxmLnNlbGVjdFNlcnZlci5zZWxlY3RlZE9wdGlvbnNbMF0udmFsdWU7XG4gICAgICAgIGxldCBvcHRpb24gPSBldmVudC5jdXJyZW50VGFyZ2V0LnNlbGVjdGVkT3B0aW9uc1swXTtcblxuICAgICAgICBpZiAob3B0aW9uLnZhbHVlID09ICdzZnRwJykge1xuICAgICAgICAgIFN0b3JhZ2UuZ2V0U2VydmVycygpW2luZGV4XS5zZnRwID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBTdG9yYWdlLmdldFNlcnZlcnMoKVtpbmRleF0ubG9nb24gPSAnY3JlZGVudGlhbHMnO1xuICAgICAgICAgIFN0b3JhZ2UuZ2V0U2VydmVycygpW2luZGV4XS5zZnRwID0gZmFsc2U7XG4gICAgICAgICAgU3RvcmFnZS5nZXRTZXJ2ZXJzKClbaW5kZXhdLnVzZUFnZW50ID0gZmFsc2U7XG4gICAgICAgICAgU3RvcmFnZS5nZXRTZXJ2ZXJzKClbaW5kZXhdLnByaXZhdGVrZXlmaWxlID0gJyc7XG4gICAgICAgIH1cbiAgICAgICAgc2VsZi5maWxsSW5wdXRGaWVsZHMoU3RvcmFnZS5nZXRTZXJ2ZXJzKClbaW5kZXhdKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHNlbGYubG9nb25UeXBlU2VsZWN0LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIChldmVudCkgPT4ge1xuICAgICAgaWYgKFN0b3JhZ2UuZ2V0U2VydmVycygpLmxlbmd0aCAhPT0gMCAmJiAhc2VsZi5kaXNhYmxlRXZlbnRoYW5kbGVyKSB7XG4gICAgICAgIGxldCBpbmRleCA9IHNlbGYuc2VsZWN0U2VydmVyLnNlbGVjdGVkT3B0aW9uc1swXS52YWx1ZTtcbiAgICAgICAgbGV0IG9wdGlvbiA9IGV2ZW50LmN1cnJlbnRUYXJnZXQuc2VsZWN0ZWRPcHRpb25zWzBdO1xuXG4gICAgICAgIGlmIChvcHRpb24udmFsdWUgPT0gJ2NyZWRlbnRpYWxzJykge1xuICAgICAgICAgIFN0b3JhZ2UuZ2V0U2VydmVycygpW2luZGV4XS5sb2dvbiA9ICdjcmVkZW50aWFscyc7XG4gICAgICAgICAgU3RvcmFnZS5nZXRTZXJ2ZXJzKClbaW5kZXhdLnVzZUFnZW50ID0gZmFsc2U7XG4gICAgICAgICAgU3RvcmFnZS5nZXRTZXJ2ZXJzKClbaW5kZXhdLnByaXZhdGVrZXlmaWxlID0gJyc7XG4gICAgICAgIH0gZWxzZSBpZiAob3B0aW9uLnZhbHVlID09ICdrZXlmaWxlJykge1xuICAgICAgICAgIFN0b3JhZ2UuZ2V0U2VydmVycygpW2luZGV4XS5sb2dvbiA9ICdrZXlmaWxlJztcbiAgICAgICAgICBTdG9yYWdlLmdldFNlcnZlcnMoKVtpbmRleF0udXNlQWdlbnQgPSBmYWxzZTtcbiAgICAgICAgfSBlbHNlIGlmIChvcHRpb24udmFsdWUgPT0gJ2FnZW50Jykge1xuICAgICAgICAgIFN0b3JhZ2UuZ2V0U2VydmVycygpW2luZGV4XS5sb2dvbiA9ICdhZ2VudCc7XG4gICAgICAgICAgU3RvcmFnZS5nZXRTZXJ2ZXJzKClbaW5kZXhdLnVzZUFnZW50ID0gdHJ1ZTtcbiAgICAgICAgICBTdG9yYWdlLmdldFNlcnZlcnMoKVtpbmRleF0ucHJpdmF0ZWtleWZpbGUgPSAnJztcbiAgICAgICAgICBTdG9yYWdlLmdldFNlcnZlcnMoKVtpbmRleF0ucGFzc3dvcmQgPSAnJztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBTdG9yYWdlLmdldFNlcnZlcnMoKVtpbmRleF0udXNlQWdlbnQgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBzZWxmLmZpbGxJbnB1dEZpZWxkcyhTdG9yYWdlLmdldFNlcnZlcnMoKVtpbmRleF0pO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgc2VsZi51c2VySW5wdXQuZ2V0TW9kZWwoKS5vbkRpZENoYW5nZSgoKSA9PiB7XG4gICAgICBpZiAoU3RvcmFnZS5nZXRTZXJ2ZXJzKCkubGVuZ3RoICE9PSAwICYmICFzZWxmLmRpc2FibGVFdmVudGhhbmRsZXIpIHtcbiAgICAgICAgbGV0IGluZGV4ID0gc2VsZi5zZWxlY3RTZXJ2ZXIuc2VsZWN0ZWRPcHRpb25zWzBdLnZhbHVlO1xuICAgICAgICBTdG9yYWdlLmdldFNlcnZlcnMoKVtpbmRleF0udXNlciA9IHNlbGYudXNlcklucHV0LmdldFRleHQoKS50cmltKCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBsZXQgY2hhbmdpbmcgPSBmYWxzZTtcbiAgICBjb25zdCBwYXNzd29yZE1vZGVsID0gc2VsZi5wYXNzd29yZElucHV0LmdldE1vZGVsKCk7XG4gICAgcGFzc3dvcmRNb2RlbC5jbGVhclRleHRQYXNzd29yZCA9IG5ldyBUZXh0QnVmZmVyKCcnKTtcbiAgICBwYXNzd29yZE1vZGVsLmJ1ZmZlci5vbkRpZENoYW5nZSgob2JqKSA9PiB7XG4gICAgICBpZiAoIWNoYW5naW5nKSB7XG4gICAgICAgIGNoYW5naW5nID0gdHJ1ZTtcbiAgICAgICAgcGFzc3dvcmRNb2RlbC5jbGVhclRleHRQYXNzd29yZC5zZXRUZXh0SW5SYW5nZShvYmoub2xkUmFuZ2UsIG9iai5uZXdUZXh0KTtcbiAgICAgICAgcGFzc3dvcmRNb2RlbC5idWZmZXIuc2V0VGV4dEluUmFuZ2Uob2JqLm5ld1JhbmdlLCAnKicucmVwZWF0KG9iai5uZXdUZXh0Lmxlbmd0aCkpO1xuXG4gICAgICAgIGlmIChTdG9yYWdlLmdldFNlcnZlcnMoKS5sZW5ndGggIT09IDAgJiYgIXNlbGYuZGlzYWJsZUV2ZW50aGFuZGxlcikge1xuICAgICAgICAgIGxldCBpbmRleCA9IHNlbGYuc2VsZWN0U2VydmVyLnNlbGVjdGVkT3B0aW9uc1swXS52YWx1ZTtcbiAgICAgICAgICBTdG9yYWdlLmdldFNlcnZlcnMoKVtpbmRleF0ucGFzc3dvcmQgPSBwYXNzd29yZE1vZGVsLmNsZWFyVGV4dFBhc3N3b3JkLmdldFRleHQoKS50cmltKCk7XG4gICAgICAgIH1cblxuICAgICAgICBjaGFuZ2luZyA9IGZhbHNlO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgc2VsZi5wcml2YXRla2V5ZmlsZUlucHV0LmdldE1vZGVsKCkub25EaWRDaGFuZ2UoKCkgPT4ge1xuICAgICAgaWYgKFN0b3JhZ2UuZ2V0U2VydmVycygpLmxlbmd0aCAhPT0gMCAmJiAhc2VsZi5kaXNhYmxlRXZlbnRoYW5kbGVyKSB7XG4gICAgICAgIGxldCBpbmRleCA9IHNlbGYuc2VsZWN0U2VydmVyLnNlbGVjdGVkT3B0aW9uc1swXS52YWx1ZTtcbiAgICAgICAgU3RvcmFnZS5nZXRTZXJ2ZXJzKClbaW5kZXhdLnByaXZhdGVrZXlmaWxlID0gc2VsZi5wcml2YXRla2V5ZmlsZUlucHV0LmdldFRleHQoKS50cmltKCk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgc2VsZi5yZW1vdGVJbnB1dC5nZXRNb2RlbCgpLm9uRGlkQ2hhbmdlKCgpID0+IHtcbiAgICAgIGlmIChTdG9yYWdlLmdldFNlcnZlcnMoKS5sZW5ndGggIT09IDAgJiYgIXNlbGYuZGlzYWJsZUV2ZW50aGFuZGxlcikge1xuICAgICAgICBsZXQgaW5kZXggPSBzZWxmLnNlbGVjdFNlcnZlci5zZWxlY3RlZE9wdGlvbnNbMF0udmFsdWU7XG4gICAgICAgIFN0b3JhZ2UuZ2V0U2VydmVycygpW2luZGV4XS5yZW1vdGUgPSBzZWxmLnJlbW90ZUlucHV0LmdldFRleHQoKS50cmltKCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBIYW5kbGUga2V5ZG93biBieSB0YWIgZXZlbnRzIHRvIHN3aXRjaCBiZXR3ZWVuIGZpZWxkc1xuICAgIHNlbGYubmFtZUlucHV0LmdldE1vZGVsKCkuZ2V0RWxlbWVudCgpLmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCAoZXZlbnQpID0+IHtcbiAgICAgIGlmIChldmVudC5rZXkgPT0gJ1RhYicpIHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgJChzZWxmLmZvbGRlclNlbGVjdCkuZm9jdXMoKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHNlbGYuZm9sZGVyU2VsZWN0LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCAoZXZlbnQpID0+IHtcbiAgICAgIGlmIChldmVudC5rZXkgPT0gJ1RhYicpIHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgc2VsZi5ob3N0SW5wdXQuZm9jdXMoKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHNlbGYuaG9zdElucHV0LmdldE1vZGVsKCkuZ2V0RWxlbWVudCgpLmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCAoZXZlbnQpID0+IHtcbiAgICAgIGlmIChldmVudC5rZXkgPT0gJ1RhYicpIHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgc2VsZi5wb3J0SW5wdXQuZm9jdXMoKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHNlbGYubG9nb25UeXBlU2VsZWN0LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCAoZXZlbnQpID0+IHtcbiAgICAgIGlmIChldmVudC5rZXkgPT0gJ1RhYicpIHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgc2VsZi51c2VySW5wdXQuZm9jdXMoKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHNlbGYudXNlcklucHV0LmdldE1vZGVsKCkuZ2V0RWxlbWVudCgpLmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCAoZXZlbnQpID0+IHtcbiAgICAgIGlmIChldmVudC5rZXkgPT0gJ1RhYicpIHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgaWYgKFN0b3JhZ2UuZ2V0U2VydmVycygpLmxlbmd0aCAhPT0gMCkge1xuICAgICAgICAgIGNvbnN0IG9wdGlvbiA9IHNlbGYubG9nb25UeXBlU2VsZWN0LnNlbGVjdGVkT3B0aW9uc1swXS52YWx1ZTtcbiAgICAgICAgICBpZiAob3B0aW9uID09ICdjcmVkZW50aWFscycpIHtcbiAgICAgICAgICAgIHNlbGYucGFzc3dvcmRJbnB1dC5mb2N1cygpO1xuICAgICAgICAgIH0gZWxzZSBpZiAob3B0aW9uID09ICdrZXlmaWxlJykge1xuICAgICAgICAgICAgc2VsZi5wYXNzd29yZElucHV0LmZvY3VzKCk7XG4gICAgICAgICAgfSBlbHNlIGlmIChvcHRpb24gPT0gJ2FnZW50Jykge1xuICAgICAgICAgICAgc2VsZi5yZW1vdGVJbnB1dC5mb2N1cygpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuXG4gICAgc2VsZi5wYXNzd29yZElucHV0LmdldE1vZGVsKCkuZ2V0RWxlbWVudCgpLmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCAoZXZlbnQpID0+IHtcbiAgICAgIGlmIChldmVudC5rZXkgPT0gJ1RhYicpIHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgaWYgKFN0b3JhZ2UuZ2V0U2VydmVycygpLmxlbmd0aCAhPT0gMCkge1xuICAgICAgICAgIGNvbnN0IG9wdGlvbiA9IHNlbGYubG9nb25UeXBlU2VsZWN0LnNlbGVjdGVkT3B0aW9uc1swXS52YWx1ZTtcbiAgICAgICAgICBpZiAob3B0aW9uID09ICdjcmVkZW50aWFscycpIHtcbiAgICAgICAgICAgIHNlbGYucmVtb3RlSW5wdXQuZm9jdXMoKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKG9wdGlvbiA9PSAna2V5ZmlsZScpIHtcbiAgICAgICAgICAgIHNlbGYucHJpdmF0ZWtleWZpbGVJbnB1dC5mb2N1cygpO1xuICAgICAgICAgIH0gZWxzZSBpZiAob3B0aW9uID09ICdhZ2VudCcpIHtcbiAgICAgICAgICAgIHNlbGYucmVtb3RlSW5wdXQuZm9jdXMoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHNlbGYucHJpdmF0ZWtleWZpbGVJbnB1dC5nZXRNb2RlbCgpLmdldEVsZW1lbnQoKS5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgKGV2ZW50KSA9PiB7XG4gICAgICBpZiAoZXZlbnQua2V5ID09ICdUYWInKSB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHNlbGYucmVtb3RlSW5wdXQuZm9jdXMoKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiBkaXZSZXF1aXJlZDtcbiAgfVxuXG4gIGNyZWF0ZUNvbnRyb2xzRm9sZGVyU2VsZWN0KCkge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuXG4gICAgbGV0IHNlbGVjdGVkX3ZhbHVlID0gc2VsZi5mb2xkZXJTZWxlY3QudmFsdWU7XG5cbiAgICB3aGlsZSAoc2VsZi5mb2xkZXJTZWxlY3QuZmlyc3RDaGlsZCkge1xuICAgICAgc2VsZi5mb2xkZXJTZWxlY3QucmVtb3ZlQ2hpbGQoc2VsZi5mb2xkZXJTZWxlY3QuZmlyc3RDaGlsZCk7XG4gICAgfVxuXG4gICAgbGV0IG9wdGlvbk5vbmUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwib3B0aW9uXCIpO1xuICAgIG9wdGlvbk5vbmUudGV4dCA9ICctIE5vbmUgLSc7XG4gICAgb3B0aW9uTm9uZS52YWx1ZSA9IG51bGw7XG4gICAgc2VsZi5mb2xkZXJTZWxlY3QuYWRkKG9wdGlvbk5vbmUpO1xuXG4gICAgU3RvcmFnZS5nZXRGb2xkZXJzU3RydWN0dXJlZEJ5VHJlZSgpLmZvckVhY2goKGNvbmZpZykgPT4ge1xuICAgICAgbGV0IGZvbGRlcl9vcHRpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwib3B0aW9uXCIpO1xuICAgICAgZm9sZGVyX29wdGlvbi50ZXh0ID0gY29uZmlnLm5hbWU7XG4gICAgICBmb2xkZXJfb3B0aW9uLnZhbHVlID0gY29uZmlnLmlkO1xuICAgICAgc2VsZi5mb2xkZXJTZWxlY3QuYWRkKGZvbGRlcl9vcHRpb24pO1xuICAgIH0pO1xuXG4gICAgc2VsZi5mb2xkZXJTZWxlY3QudmFsdWUgPSBzZWxlY3RlZF92YWx1ZTtcbiAgfVxuXG4gIGNyZWF0ZVNlcnZlclNlbGVjdCgpIHtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcblxuICAgIGxldCBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBkaXYuY2xhc3NMaXN0LmFkZCgnc2VydmVyJyk7XG4gICAgZGl2LnN0eWxlLm1hcmdpbkJvdHRvbSA9ICcyMHB4JztcblxuICAgIGxldCBzZWxlY3QgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzZWxlY3QnKTtcbiAgICBzZWxlY3QuY2xhc3NMaXN0LmFkZCgnZm9ybS1jb250cm9sJyk7XG4gICAgc2VsZi5zZWxlY3RTZXJ2ZXIgPSBzZWxlY3Q7XG4gICAgc2VsZi5zZWxlY3RTZXJ2ZXIuZm9jdXMoKTtcblxuICAgIGxldCBzZXJ2ZXJDb250cm9sID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgc2VydmVyQ29udHJvbC5jbGFzc0xpc3QuYWRkKCdjb250cm9scycpO1xuICAgIHNlcnZlckNvbnRyb2wuY2xhc3NMaXN0LmFkZCgnc2VydmVyJyk7XG4gICAgc2VydmVyQ29udHJvbC5hcHBlbmRDaGlsZChzZWxmLnNlbGVjdFNlcnZlcik7XG5cbiAgICBsZXQgbmV3QnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XG4gICAgbmV3QnV0dG9uLnRleHRDb250ZW50ID0gJ05ldyc7XG4gICAgbmV3QnV0dG9uLmNsYXNzTGlzdC5hZGQoJ2J0bicpO1xuXG4gICAgc2VsZi5kZWxldGVCdXR0b24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKTtcbiAgICBzZWxmLmRlbGV0ZUJ1dHRvbi50ZXh0Q29udGVudCA9ICdEZWxldGUnO1xuICAgIHNlbGYuZGVsZXRlQnV0dG9uLmNsYXNzTGlzdC5hZGQoJ2J0bicpO1xuXG4gICAgc2VsZi5kdXBsaWNhdGVCdXR0b24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKTtcbiAgICBzZWxmLmR1cGxpY2F0ZUJ1dHRvbi50ZXh0Q29udGVudCA9ICdEdXBsaWNhdGUnO1xuICAgIHNlbGYuZHVwbGljYXRlQnV0dG9uLmNsYXNzTGlzdC5hZGQoJ2J0bicpO1xuXG4gICAgc2VsZi50ZXN0QnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XG4gICAgc2VsZi50ZXN0QnV0dG9uLnRleHRDb250ZW50ID0gJ1Rlc3QnO1xuICAgIHNlbGYudGVzdEJ1dHRvbi5jbGFzc0xpc3QuYWRkKCdidG4nKTtcblxuICAgIGxldCBidXR0b25Db250cm9sID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgYnV0dG9uQ29udHJvbC5jbGFzc0xpc3QuYWRkKCdjb250cm9scycpO1xuICAgIGJ1dHRvbkNvbnRyb2wuY2xhc3NMaXN0LmFkZCgnc2VydmVyLWJ1dHRvbicpO1xuICAgIGJ1dHRvbkNvbnRyb2wuYXBwZW5kQ2hpbGQobmV3QnV0dG9uKTtcbiAgICBidXR0b25Db250cm9sLmFwcGVuZENoaWxkKHNlbGYuZGVsZXRlQnV0dG9uKTtcbiAgICBidXR0b25Db250cm9sLmFwcGVuZENoaWxkKHNlbGYuZHVwbGljYXRlQnV0dG9uKTtcbiAgICBidXR0b25Db250cm9sLmFwcGVuZENoaWxkKHNlbGYudGVzdEJ1dHRvbik7XG5cbiAgICBsZXQgc2VydmVyR3JvdXAgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBzZXJ2ZXJHcm91cC5jbGFzc0xpc3QuYWRkKCdjb250cm9sLWdyb3VwJyk7XG4gICAgc2VydmVyR3JvdXAuYXBwZW5kQ2hpbGQoc2VydmVyQ29udHJvbCk7XG4gICAgc2VydmVyR3JvdXAuYXBwZW5kQ2hpbGQoYnV0dG9uQ29udHJvbCk7XG5cbiAgICBkaXYuYXBwZW5kQ2hpbGQoc2VydmVyR3JvdXApO1xuXG4gICAgLy8gRXZlbnRzXG4gICAgc2VsZWN0LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIChldmVudCkgPT4ge1xuICAgICAgaWYgKFN0b3JhZ2UuZ2V0U2VydmVycygpLmxlbmd0aCAhPT0gMCAmJiAhc2VsZi5kaXNhYmxlRXZlbnRoYW5kbGVyKSB7XG4gICAgICAgIGxldCBvcHRpb24gPSBldmVudC5jdXJyZW50VGFyZ2V0LnNlbGVjdGVkT3B0aW9uc1swXTtcbiAgICAgICAgbGV0IGluZGV4SW5BcnJheSA9IG9wdGlvbi52YWx1ZTtcblxuICAgICAgICBzZWxmLmZpbGxJbnB1dEZpZWxkcygoaW5kZXhJbkFycmF5KSA/IFN0b3JhZ2UuZ2V0U2VydmVycygpW2luZGV4SW5BcnJheV0gOiBudWxsKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIG5ld0J1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChldmVudCkgPT4ge1xuICAgICAgc2VsZi5uZXcoKTtcbiAgICB9KTtcblxuICAgIHNlbGYuZGVsZXRlQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGV2ZW50KSA9PiB7XG4gICAgICBzZWxmLmRlbGV0ZSgpO1xuICAgIH0pO1xuXG4gICAgc2VsZi5kdXBsaWNhdGVCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZXZlbnQpID0+IHtcbiAgICAgIHNlbGYuZHVwbGljYXRlKCk7XG4gICAgfSk7XG5cbiAgICBzZWxmLnRlc3RCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZXZlbnQpID0+IHtcbiAgICAgIHNlbGYudGVzdCgpO1xuICAgIH0pO1xuXG4gICAgLy8gSGFuZGxlIGtleWRvd24gYnkgdGFiIGV2ZW50cyB0byBzd2l0Y2ggYmV0d2VlbiBmaWVsZHNcbiAgICBzZWxmLnRlc3RCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIChldmVudCkgPT4ge1xuICAgICAgaWYgKGV2ZW50LmtleSA9PSAnVGFiJykge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBzZWxmLm5hbWVJbnB1dC5mb2N1cygpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIGRpdjtcbiAgfVxuXG4gIHJlbG9hZChzZWxlY3RlZFNlcnZlciA9IG51bGwpIHtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcblxuICAgIHNlbGYuZGlzYWJsZUV2ZW50aGFuZGxlciA9IHRydWU7XG5cbiAgICBzZWxmLmNyZWF0ZUNvbnRyb2xzRm9sZGVyU2VsZWN0KCk7XG5cbiAgICB3aGlsZSAoc2VsZi5zZWxlY3RTZXJ2ZXIuZmlyc3RDaGlsZCkge1xuICAgICAgc2VsZi5zZWxlY3RTZXJ2ZXIucmVtb3ZlQ2hpbGQoc2VsZi5zZWxlY3RTZXJ2ZXIuZmlyc3RDaGlsZCk7XG4gICAgfVxuXG4gICAgbGV0IHNlbGVjdGVkSW5kZXggPSAwO1xuICAgIGlmIChTdG9yYWdlLmdldFNlcnZlcnMoKS5sZW5ndGggIT09IDApIHtcbiAgICAgIFN0b3JhZ2UuZ2V0U2VydmVycygpLmZvckVhY2goKGl0ZW0sIGluZGV4KSA9PiB7XG4gICAgICAgIGxldCBvcHRpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwib3B0aW9uXCIpO1xuICAgICAgICBvcHRpb24udGV4dCA9IGl0ZW0ubmFtZTtcbiAgICAgICAgb3B0aW9uLnZhbHVlID0gaW5kZXg7XG4gICAgICAgIHNlbGYuc2VsZWN0U2VydmVyLmFkZChvcHRpb24pO1xuXG4gICAgICAgIGlmIChzZWxlY3RlZFNlcnZlciAmJiB0eXBlb2Ygc2VsZWN0ZWRTZXJ2ZXIuY29uZmlnICE9PSAndW5kZWZpbmVkJyAmJiBzZWxlY3RlZFNlcnZlci5jb25maWcuaG9zdCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICBpZiAoc2VsZWN0ZWRTZXJ2ZXIuY29uZmlnLmhvc3QgPT0gaXRlbS5ob3N0ICYmIHNlbGVjdGVkU2VydmVyLmNvbmZpZy5uYW1lID09IGl0ZW0ubmFtZSkge1xuICAgICAgICAgICAgc2VsZWN0ZWRJbmRleCA9IGluZGV4O1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIHNlbGYuc2VsZWN0U2VydmVyLnNlbGVjdGVkSW5kZXggPSBzZWxlY3RlZEluZGV4O1xuICAgICAgc2VsZi5maWxsSW5wdXRGaWVsZHMoU3RvcmFnZS5nZXRTZXJ2ZXJzKClbc2VsZWN0ZWRJbmRleF0pO1xuXG4gICAgICAvLyBFbmFibGUgSW5wdXQgRmllbGRzXG4gICAgICBzZWxmLmVuYWJsZUlucHV0RmllbGRzKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHNlbGYuZmlsbElucHV0RmllbGRzKCk7XG5cbiAgICAgIC8vIERpc2FibGUgSW5wdXQgRmllbGRzXG4gICAgICBzZWxmLmRpc2FibGVJbnB1dEZpZWxkcygpO1xuICAgIH1cbiAgICBzZWxmLmRpc2FibGVFdmVudGhhbmRsZXIgPSBmYWxzZTtcbiAgfVxuXG4gIGF0dGFjaCgpIHtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcblxuICAgIHNlbGYucGFuZWwgPSBhdG9tLndvcmtzcGFjZS5hZGRNb2RhbFBhbmVsKHtcbiAgICAgIGl0ZW06IHNlbGZcbiAgICB9KTtcblxuICAgIC8vIFJlc2l6ZSBjb250ZW50IHRvIGZpdCBvbiBzbWFsbGVyIGRpc3BsYXlzXG4gICAgbGV0IGJvZHkgPSBkb2N1bWVudC5ib2R5Lm9mZnNldEhlaWdodDtcbiAgICBsZXQgY29udGVudCA9IHNlbGYucGFuZWwuZWxlbWVudC5vZmZzZXRIZWlnaHQ7XG4gICAgbGV0IG9mZnNldCA9ICQoc2VsZi5wYW5lbC5lbGVtZW50KS5wb3NpdGlvbigpLnRvcDtcblxuICAgIGlmIChjb250ZW50ICsgKDIgKiBvZmZzZXQpID4gYm9keSkge1xuICAgICAgbGV0IHNldHRpbmdzID0gc2VsZi5jb250ZW50LmZpbmQoJy5zZXJ2ZXItc2V0dGluZ3MnKVswXTtcbiAgICAgIGxldCBoZWlnaHQgPSAoMiAqIG9mZnNldCkgKyBjb250ZW50IC0gYm9keTtcbiAgICAgICQoc2V0dGluZ3MpLmhlaWdodCgkKHNldHRpbmdzKS5oZWlnaHQoKSAtIGhlaWdodCk7XG4gICAgfVxuICB9XG5cbiAgY2xvc2UoKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG5cbiAgICBjb25zdCBkZXN0cm95UGFuZWwgPSB0aGlzLnBhbmVsO1xuICAgIHRoaXMucGFuZWwgPSBudWxsO1xuICAgIGlmIChkZXN0cm95UGFuZWwpIHtcbiAgICAgIGRlc3Ryb3lQYW5lbC5kZXN0cm95KCk7XG4gICAgfVxuXG4gICAgU3RvcmFnZS5sb2FkKHRydWUpO1xuXG4gICAgYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZSgpLmFjdGl2YXRlKCk7XG4gIH1cblxuICBjYW5jZWwoKSB7XG4gICAgdGhpcy5jbG9zZSgpO1xuICB9XG5cbiAgc2hvd0Vycm9yKG1lc3NhZ2UpIHtcbiAgICB0aGlzLmVycm9yLnRleHQobWVzc2FnZSk7XG4gICAgaWYgKG1lc3NhZ2UpIHtcbiAgICAgIHRoaXMuZmxhc2hFcnJvcigpO1xuICAgIH1cbiAgfVxuXG4gIGZpbGxJbnB1dEZpZWxkcyhzZXJ2ZXIgPSBudWxsKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG5cbiAgICBzZWxmLmRpc2FibGVFdmVudGhhbmRsZXIgPSB0cnVlO1xuXG4gICAgaWYgKHNlcnZlcikge1xuICAgICAgc2VsZi5uYW1lSW5wdXQuc2V0VGV4dChzZXJ2ZXIubmFtZSA/IHNlcnZlci5uYW1lIDogc2VydmVyLmhvc3QpO1xuICAgICAgc2VsZi5ob3N0SW5wdXQuc2V0VGV4dChzZXJ2ZXIuaG9zdCk7XG4gICAgICBzZWxmLnBvcnRJbnB1dC5zZXRUZXh0KHNlcnZlci5wb3J0KTtcbiAgICAgIGlmIChTdG9yYWdlLmdldEZvbGRlcihzZXJ2ZXIucGFyZW50KSkge1xuICAgICAgICBzZWxmLmZvbGRlclNlbGVjdC52YWx1ZSA9IFN0b3JhZ2UuZ2V0Rm9sZGVyKHNlcnZlci5wYXJlbnQpLmlkO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2VsZi5mb2xkZXJTZWxlY3QudmFsdWUgPSAnbnVsbCc7XG4gICAgICB9XG5cbiAgICAgIGlmIChzZXJ2ZXIuc2Z0cCkge1xuICAgICAgICBzZWxmLnByb3RvY29sU2VsZWN0LnNlbGVjdGVkSW5kZXggPSAxO1xuICAgICAgICBzZWxmLnBvcnRJbnB1dC5lbGVtZW50LnNldEF0dHJpYnV0ZSgncGxhY2Vob2xkZXItdGV4dCcsICcyMicpO1xuXG4gICAgICAgIHNlbGYubG9nb25UeXBlU2VsZWN0Lm9wdGlvbnNbMV0uZGlzYWJsZWQgPSBmYWxzZTtcbiAgICAgICAgc2VsZi5sb2dvblR5cGVTZWxlY3Qub3B0aW9uc1syXS5kaXNhYmxlZCA9IGZhbHNlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2VsZi5wcm90b2NvbFNlbGVjdC5zZWxlY3RlZEluZGV4ID0gMDtcbiAgICAgICAgc2VsZi5wb3J0SW5wdXQuZWxlbWVudC5zZXRBdHRyaWJ1dGUoJ3BsYWNlaG9sZGVyLXRleHQnLCAnMjEnKTtcblxuICAgICAgICBzZWxmLmxvZ29uVHlwZVNlbGVjdC5zZWxlY3RlZEluZGV4ID0gMDsgLy8gVXNlcm5hbWUvUGFzc3dvcmRcbiAgICAgICAgc2VsZi5sb2dvblR5cGVTZWxlY3Qub3B0aW9uc1sxXS5kaXNhYmxlZCA9IHRydWU7XG4gICAgICAgIHNlbGYubG9nb25UeXBlU2VsZWN0Lm9wdGlvbnNbMl0uZGlzYWJsZWQgPSB0cnVlO1xuXG4gICAgICAgIHNlbGYucGFzc3dvcmRDb250cm9sLnJlbW92ZUF0dHJpYnV0ZShcInN0eWxlXCIpO1xuICAgICAgICBzZWxmLnByaXZhdGVrZXlmaWxlQ29udHJvbC5zZXRBdHRyaWJ1dGUoXCJzdHlsZVwiLCBcImRpc3BsYXk6bm9uZTtcIik7XG4gICAgICB9XG5cbiAgICAgIGlmIChzZXJ2ZXIubG9nb24gPT0gJ2tleWZpbGUnKSB7XG4gICAgICAgIHNlbGYubG9nb25UeXBlU2VsZWN0LnNlbGVjdGVkSW5kZXggPSAxOyAvLyBLZXlmaWxlXG4gICAgICAgIHNlbGYucGFzc3dvcmRDb250cm9sLnJlbW92ZUF0dHJpYnV0ZShcInN0eWxlXCIpO1xuICAgICAgICBzZWxmLnByaXZhdGVrZXlmaWxlQ29udHJvbC5yZW1vdmVBdHRyaWJ1dGUoXCJzdHlsZVwiKTtcbiAgICAgIH0gZWxzZSBpZiAoc2VydmVyLmxvZ29uID09ICdhZ2VudCcpIHtcbiAgICAgICAgc2VsZi5sb2dvblR5cGVTZWxlY3Quc2VsZWN0ZWRJbmRleCA9IDI7IC8vIFNTSCBBZ2VudFxuICAgICAgICBzZWxmLnBhc3N3b3JkQ29udHJvbC5zZXRBdHRyaWJ1dGUoXCJzdHlsZVwiLCBcImRpc3BsYXk6bm9uZTtcIik7XG4gICAgICAgIHNlbGYucHJpdmF0ZWtleWZpbGVDb250cm9sLnNldEF0dHJpYnV0ZShcInN0eWxlXCIsIFwiZGlzcGxheTpub25lO1wiKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNlbGYubG9nb25UeXBlU2VsZWN0LnNlbGVjdGVkSW5kZXggPSAwOyAvLyBVc2VybmFtZS9QYXNzd29yZFxuICAgICAgICBzZWxmLnBhc3N3b3JkQ29udHJvbC5yZW1vdmVBdHRyaWJ1dGUoXCJzdHlsZVwiKTtcbiAgICAgICAgc2VsZi5wcml2YXRla2V5ZmlsZUNvbnRyb2wuc2V0QXR0cmlidXRlKFwic3R5bGVcIiwgXCJkaXNwbGF5Om5vbmU7XCIpO1xuICAgICAgfVxuXG4gICAgICBzZWxmLnVzZXJJbnB1dC5zZXRUZXh0KHNlcnZlci51c2VyKTtcbiAgICAgIHNlbGYucGFzc3dvcmRJbnB1dC5zZXRUZXh0KHNlcnZlci5wYXNzd29yZCk7XG4gICAgICBzZWxmLnByaXZhdGVrZXlmaWxlSW5wdXQuc2V0VGV4dChzZXJ2ZXIucHJpdmF0ZWtleWZpbGUgPyBzZXJ2ZXIucHJpdmF0ZWtleWZpbGUgOiAnJyk7XG4gICAgICBzZWxmLnJlbW90ZUlucHV0LnNldFRleHQoc2VydmVyLnJlbW90ZSA/IHNlcnZlci5yZW1vdGUgOiAnLycpO1xuICAgIH0gZWxzZSB7XG4gICAgICBzZWxmLm5hbWVJbnB1dC5zZXRUZXh0KCcnKTtcbiAgICAgIHNlbGYuaG9zdElucHV0LnNldFRleHQoJycpO1xuICAgICAgc2VsZi5wb3J0SW5wdXQuc2V0VGV4dCgnJyk7XG5cbiAgICAgIHNlbGYucHJvdG9jb2xTZWxlY3Quc2VsZWN0ZWRJbmRleCA9IDA7XG4gICAgICBzZWxmLmxvZ29uVHlwZVNlbGVjdC5zZWxlY3RlZEluZGV4ID0gMDtcblxuICAgICAgc2VsZi51c2VySW5wdXQuc2V0VGV4dCgnJyk7XG4gICAgICBzZWxmLnBhc3N3b3JkSW5wdXQuc2V0VGV4dCgnJyk7XG4gICAgICBzZWxmLnByaXZhdGVrZXlmaWxlSW5wdXQuc2V0VGV4dCgnJyk7XG4gICAgICBzZWxmLnJlbW90ZUlucHV0LnNldFRleHQoJycpO1xuXG4gICAgICBzZWxmLnByaXZhdGVrZXlmaWxlQ29udHJvbC5zZXRBdHRyaWJ1dGUoXCJzdHlsZVwiLCBcImRpc3BsYXk6bm9uZTtcIik7XG4gICAgfVxuXG4gICAgc2VsZi5kaXNhYmxlRXZlbnRoYW5kbGVyID0gZmFsc2U7XG4gIH1cblxuICBlbmFibGVJbnB1dEZpZWxkcygpIHtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcblxuICAgIHNlbGYuZGVsZXRlQnV0dG9uLmNsYXNzTGlzdC5yZW1vdmUoJ2Rpc2FibGVkJyk7XG4gICAgc2VsZi5kZWxldGVCdXR0b24uZGlzYWJsZWQgPSBmYWxzZTtcblxuICAgIHNlbGYuZHVwbGljYXRlQnV0dG9uLmNsYXNzTGlzdC5yZW1vdmUoJ2Rpc2FibGVkJyk7XG4gICAgc2VsZi5kdXBsaWNhdGVCdXR0b24uZGlzYWJsZWQgPSBmYWxzZTtcblxuICAgIHNlbGYudGVzdEJ1dHRvbi5jbGFzc0xpc3QucmVtb3ZlKCdkaXNhYmxlZCcpO1xuICAgIHNlbGYudGVzdEJ1dHRvbi5kaXNhYmxlZCA9IGZhbHNlO1xuXG4gICAgc2VsZi5uYW1lSW5wdXRbMF0uY2xhc3NMaXN0LnJlbW92ZSgnZGlzYWJsZWQnKTtcbiAgICBzZWxmLm5hbWVJbnB1dC5kaXNhYmxlZCA9IGZhbHNlO1xuXG4gICAgc2VsZi5mb2xkZXJTZWxlY3QuY2xhc3NMaXN0LnJlbW92ZSgnZGlzYWJsZWQnKTtcbiAgICBzZWxmLmZvbGRlclNlbGVjdC5kaXNhYmxlZCA9IGZhbHNlO1xuXG4gICAgc2VsZi5ob3N0SW5wdXRbMF0uY2xhc3NMaXN0LnJlbW92ZSgnZGlzYWJsZWQnKTtcbiAgICBzZWxmLmhvc3RJbnB1dC5kaXNhYmxlZCA9IGZhbHNlO1xuXG4gICAgc2VsZi5wb3J0SW5wdXRbMF0uY2xhc3NMaXN0LnJlbW92ZSgnZGlzYWJsZWQnKTtcbiAgICBzZWxmLnBvcnRJbnB1dC5kaXNhYmxlZCA9IGZhbHNlO1xuXG4gICAgc2VsZi5wcm90b2NvbFNlbGVjdC5jbGFzc0xpc3QucmVtb3ZlKCdkaXNhYmxlZCcpO1xuICAgIHNlbGYucHJvdG9jb2xTZWxlY3QuZGlzYWJsZWQgPSBmYWxzZTtcblxuICAgIHNlbGYubG9nb25UeXBlU2VsZWN0LmNsYXNzTGlzdC5yZW1vdmUoJ2Rpc2FibGVkJyk7XG4gICAgc2VsZi5sb2dvblR5cGVTZWxlY3QuZGlzYWJsZWQgPSBmYWxzZTtcblxuICAgIHNlbGYudXNlcklucHV0WzBdLmNsYXNzTGlzdC5yZW1vdmUoJ2Rpc2FibGVkJyk7XG4gICAgc2VsZi51c2VySW5wdXQuZGlzYWJsZWQgPSBmYWxzZTtcblxuICAgIHNlbGYucGFzc3dvcmRJbnB1dFswXS5jbGFzc0xpc3QucmVtb3ZlKCdkaXNhYmxlZCcpO1xuICAgIHNlbGYucGFzc3dvcmRJbnB1dC5kaXNhYmxlZCA9IGZhbHNlO1xuXG4gICAgc2VsZi5wcml2YXRla2V5ZmlsZUlucHV0WzBdLmNsYXNzTGlzdC5yZW1vdmUoJ2Rpc2FibGVkJyk7XG4gICAgc2VsZi5wcml2YXRla2V5ZmlsZUlucHV0LmRpc2FibGVkID0gZmFsc2U7XG5cbiAgICBzZWxmLnJlbW90ZUlucHV0WzBdLmNsYXNzTGlzdC5yZW1vdmUoJ2Rpc2FibGVkJyk7XG4gICAgc2VsZi5yZW1vdGVJbnB1dC5kaXNhYmxlZCA9IGZhbHNlO1xuICB9XG5cbiAgZGlzYWJsZUlucHV0RmllbGRzKCkge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuXG4gICAgc2VsZi5kZWxldGVCdXR0b24uY2xhc3NMaXN0LmFkZCgnZGlzYWJsZWQnKTtcbiAgICBzZWxmLmRlbGV0ZUJ1dHRvbi5kaXNhYmxlZCA9IHRydWU7XG5cbiAgICBzZWxmLmR1cGxpY2F0ZUJ1dHRvbi5jbGFzc0xpc3QuYWRkKCdkaXNhYmxlZCcpO1xuICAgIHNlbGYuZHVwbGljYXRlQnV0dG9uLmRpc2FibGVkID0gdHJ1ZTtcblxuICAgIHNlbGYudGVzdEJ1dHRvbi5jbGFzc0xpc3QuYWRkKCdkaXNhYmxlZCcpO1xuICAgIHNlbGYudGVzdEJ1dHRvbi5kaXNhYmxlZCA9IHRydWU7XG5cbiAgICBzZWxmLm5hbWVJbnB1dFswXS5jbGFzc0xpc3QuYWRkKCdkaXNhYmxlZCcpO1xuICAgIHNlbGYubmFtZUlucHV0LmRpc2FibGVkID0gdHJ1ZTtcblxuICAgIHNlbGYuZm9sZGVyU2VsZWN0LmNsYXNzTGlzdC5hZGQoJ2Rpc2FibGVkJyk7XG4gICAgc2VsZi5mb2xkZXJTZWxlY3QuZGlzYWJsZWQgPSB0cnVlO1xuXG4gICAgc2VsZi5ob3N0SW5wdXRbMF0uY2xhc3NMaXN0LmFkZCgnZGlzYWJsZWQnKTtcbiAgICBzZWxmLmhvc3RJbnB1dC5kaXNhYmxlZCA9IHRydWU7XG5cbiAgICBzZWxmLnBvcnRJbnB1dFswXS5jbGFzc0xpc3QuYWRkKCdkaXNhYmxlZCcpO1xuICAgIHNlbGYucG9ydElucHV0LmRpc2FibGVkID0gdHJ1ZTtcblxuICAgIHNlbGYucHJvdG9jb2xTZWxlY3QuY2xhc3NMaXN0LmFkZCgnZGlzYWJsZWQnKTtcbiAgICBzZWxmLnByb3RvY29sU2VsZWN0LmRpc2FibGVkID0gdHJ1ZTtcblxuICAgIHNlbGYubG9nb25UeXBlU2VsZWN0LmNsYXNzTGlzdC5hZGQoJ2Rpc2FibGVkJyk7XG4gICAgc2VsZi5sb2dvblR5cGVTZWxlY3QuZGlzYWJsZWQgPSB0cnVlO1xuXG4gICAgc2VsZi51c2VySW5wdXRbMF0uY2xhc3NMaXN0LmFkZCgnZGlzYWJsZWQnKTtcbiAgICBzZWxmLnVzZXJJbnB1dC5kaXNhYmxlZCA9IHRydWU7XG5cbiAgICBzZWxmLnBhc3N3b3JkSW5wdXRbMF0uY2xhc3NMaXN0LmFkZCgnZGlzYWJsZWQnKTtcbiAgICBzZWxmLnBhc3N3b3JkSW5wdXQuZGlzYWJsZWQgPSB0cnVlO1xuXG4gICAgc2VsZi5wcml2YXRla2V5ZmlsZUlucHV0WzBdLmNsYXNzTGlzdC5hZGQoJ2Rpc2FibGVkJyk7XG4gICAgc2VsZi5wcml2YXRla2V5ZmlsZUlucHV0LmRpc2FibGVkID0gdHJ1ZTtcblxuICAgIHNlbGYucmVtb3RlSW5wdXRbMF0uY2xhc3NMaXN0LmFkZCgnZGlzYWJsZWQnKTtcbiAgICBzZWxmLnJlbW90ZUlucHV0LmRpc2FibGVkID0gdHJ1ZTtcblxuICAgIGxldCBjaGFuZ2luZyA9IGZhbHNlO1xuICAgIHNlbGYubmFtZUlucHV0LmdldE1vZGVsKCkub25EaWRDaGFuZ2UoKCkgPT4ge1xuICAgICAgaWYgKCFjaGFuZ2luZyAmJiBzZWxmLm5hbWVJbnB1dC5kaXNhYmxlZCkge1xuICAgICAgICBjaGFuZ2luZyA9IHRydWU7XG4gICAgICAgIHNlbGYubmFtZUlucHV0LnNldFRleHQoJycpO1xuICAgICAgICBjaGFuZ2luZyA9IGZhbHNlO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHNlbGYuaG9zdElucHV0LmdldE1vZGVsKCkub25EaWRDaGFuZ2UoKCkgPT4ge1xuICAgICAgaWYgKCFjaGFuZ2luZyAmJiBzZWxmLmhvc3RJbnB1dC5kaXNhYmxlZCkge1xuICAgICAgICBjaGFuZ2luZyA9IHRydWU7XG4gICAgICAgIHNlbGYuaG9zdElucHV0LnNldFRleHQoJycpO1xuICAgICAgICBjaGFuZ2luZyA9IGZhbHNlO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHNlbGYucG9ydElucHV0LmdldE1vZGVsKCkub25EaWRDaGFuZ2UoKCkgPT4ge1xuICAgICAgaWYgKCFjaGFuZ2luZyAmJiBzZWxmLnBvcnRJbnB1dC5kaXNhYmxlZCkge1xuICAgICAgICBjaGFuZ2luZyA9IHRydWU7XG4gICAgICAgIHNlbGYucG9ydElucHV0LnNldFRleHQoJycpO1xuICAgICAgICBjaGFuZ2luZyA9IGZhbHNlO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHNlbGYudXNlcklucHV0LmdldE1vZGVsKCkub25EaWRDaGFuZ2UoKCkgPT4ge1xuICAgICAgaWYgKCFjaGFuZ2luZyAmJiBzZWxmLnVzZXJJbnB1dC5kaXNhYmxlZCkge1xuICAgICAgICBjaGFuZ2luZyA9IHRydWU7XG4gICAgICAgIHNlbGYudXNlcklucHV0LnNldFRleHQoJycpO1xuICAgICAgICBjaGFuZ2luZyA9IGZhbHNlO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHNlbGYucGFzc3dvcmRJbnB1dC5nZXRNb2RlbCgpLm9uRGlkQ2hhbmdlKCgpID0+IHtcbiAgICAgIGlmICghY2hhbmdpbmcgJiYgc2VsZi5wYXNzd29yZElucHV0LmRpc2FibGVkKSB7XG4gICAgICAgIGNoYW5naW5nID0gdHJ1ZTtcbiAgICAgICAgc2VsZi5wYXNzd29yZElucHV0LnNldFRleHQoJycpO1xuICAgICAgICBjaGFuZ2luZyA9IGZhbHNlO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHNlbGYucHJpdmF0ZWtleWZpbGVJbnB1dC5nZXRNb2RlbCgpLm9uRGlkQ2hhbmdlKCgpID0+IHtcbiAgICAgIGlmICghY2hhbmdpbmcgJiYgc2VsZi5wcml2YXRla2V5ZmlsZUlucHV0LmRpc2FibGVkKSB7XG4gICAgICAgIGNoYW5naW5nID0gdHJ1ZTtcbiAgICAgICAgc2VsZi5wcml2YXRla2V5ZmlsZUlucHV0LnNldFRleHQoJycpO1xuICAgICAgICBjaGFuZ2luZyA9IGZhbHNlO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHNlbGYucmVtb3RlSW5wdXQuZ2V0TW9kZWwoKS5vbkRpZENoYW5nZSgoKSA9PiB7XG4gICAgICBpZiAoIWNoYW5naW5nICYmIHNlbGYucmVtb3RlSW5wdXQuZGlzYWJsZWQpIHtcbiAgICAgICAgY2hhbmdpbmcgPSB0cnVlO1xuICAgICAgICBzZWxmLnJlbW90ZUlucHV0LnNldFRleHQoJycpO1xuICAgICAgICBjaGFuZ2luZyA9IGZhbHNlO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgdGVzdCgpIHtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcblxuICAgIGlmIChTdG9yYWdlLmdldFNlcnZlcnMoKS5sZW5ndGggPT0gMCkgcmV0dXJuO1xuXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGluZGV4ID0gc2VsZi5zZWxlY3RTZXJ2ZXIuc2VsZWN0ZWRPcHRpb25zWzBdLnZhbHVlO1xuICAgICAgY29uc3QgY29uZmlnID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShTdG9yYWdlLmdldFNlcnZlcnMoKVtpbmRleF0pKTtcblxuICAgICAgY29uc3QgY29ubmVjdG9yID0gbmV3IENvbm5lY3Rvcihjb25maWcpO1xuXG4gICAgICBjb25uZWN0b3Iub24oJ2RlYnVnJywgKGNtZCwgcGFyYW0xLCBwYXJhbTIpID0+IHtcbiAgICAgICAgaWYgKGF0b20uY29uZmlnLmdldCgnZnRwLXJlbW90ZS1lZGl0LmRldi5kZWJ1ZycpKSB7XG4gICAgICAgICAgaWYgKHBhcmFtMSAmJiBwYXJhbTIpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGNtZCwgcGFyYW0xLCBwYXJhbTIpO1xuICAgICAgICAgIH0gZWxzZSBpZiAocGFyYW0xKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhjbWQsIHBhcmFtMSk7XG4gICAgICAgICAgfSBlbHNlIGlmIChjbWQpIGNvbnNvbGUubG9nKGNtZCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICBjb25uZWN0b3IuY29ubmVjdCgpLnRoZW4oKCkgPT4ge1xuICAgICAgICBzaG93TWVzc2FnZSgnQ29ubmVjdGlvbiBjb3VsZCBiZSBlc3RhYmxpc2hlZCBzdWNjZXNzZnVsbHknKVxuICAgICAgICBjb25uZWN0b3IuZGlzY29ubmVjdChudWxsKS5jYXRjaCgoKSA9PiB7IH0pO1xuICAgICAgICBjb25uZWN0b3IuZGVzdHJveSgpO1xuICAgICAgfSkuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICBzaG93TWVzc2FnZShlcnIsICdlcnJvcicpO1xuICAgICAgICBjb25uZWN0b3IuZGlzY29ubmVjdChudWxsKS5jYXRjaCgoKSA9PiB7IH0pO1xuICAgICAgICBjb25uZWN0b3IuZGVzdHJveSgpO1xuICAgICAgfSk7XG4gICAgfSBjYXRjaCAoZSkgeyB9XG4gIH1cblxuICBuZXcoKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG5cbiAgICBzZWxmLmVuYWJsZUlucHV0RmllbGRzKCk7XG5cbiAgICBsZXQgbmV3Y29uZmlnID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShjb25maWcpKTtcbiAgICBuZXdjb25maWcubmFtZSA9IGNvbmZpZy5uYW1lICsgXCIgXCIgKyAoU3RvcmFnZS5nZXRTZXJ2ZXJzKCkubGVuZ3RoICsgMSk7XG4gICAgU3RvcmFnZS5hZGRTZXJ2ZXIobmV3Y29uZmlnKTtcblxuICAgIGxldCBvcHRpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdvcHRpb24nKTtcbiAgICBvcHRpb24udGV4dCA9IG5ld2NvbmZpZy5uYW1lO1xuICAgIG9wdGlvbi52YWx1ZSA9IFN0b3JhZ2UuZ2V0U2VydmVycygpLmxlbmd0aCAtIDE7XG5cbiAgICB0aGlzLnNlbGVjdFNlcnZlci5hZGQob3B0aW9uKTtcbiAgICB0aGlzLnNlbGVjdFNlcnZlci52YWx1ZSA9IFN0b3JhZ2UuZ2V0U2VydmVycygpLmxlbmd0aCAtIDE7XG4gICAgdGhpcy5zZWxlY3RTZXJ2ZXIuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoJ2NoYW5nZScpKTtcbiAgICBzZWxmLm5hbWVJbnB1dC5mb2N1cygpO1xuICB9XG5cbiAgc2F2ZSgpIHtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcbiAgICBTdG9yYWdlLnNhdmUoKTtcbiAgICBzZWxmLmNsb3NlKCk7XG4gIH1cblxuICBkZWxldGUoKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG5cbiAgICBpZiAoU3RvcmFnZS5nZXRTZXJ2ZXJzKCkubGVuZ3RoID09IDApIHJldHVybjtcblxuICAgIGxldCBpbmRleCA9IHNlbGYuc2VsZWN0U2VydmVyLnNlbGVjdGVkT3B0aW9uc1swXS52YWx1ZTtcbiAgICBTdG9yYWdlLmRlbGV0ZVNlcnZlcihpbmRleCk7XG5cbiAgICBzZWxmLnJlbG9hZCgpO1xuICAgIHNlbGYuc2VsZWN0U2VydmVyLmZvY3VzKCk7XG4gIH1cblxuICBkdXBsaWNhdGUoKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG5cbiAgICBpZiAoU3RvcmFnZS5nZXRTZXJ2ZXJzKCkubGVuZ3RoID09IDApIHJldHVybjtcblxuICAgIGxldCBpbmRleCA9IHNlbGYuc2VsZWN0U2VydmVyLnNlbGVjdGVkT3B0aW9uc1swXS52YWx1ZTtcblxuICAgIHNlbGYuZW5hYmxlSW5wdXRGaWVsZHMoKTtcblxuICAgIGxldCBuZXdjb25maWcgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KFN0b3JhZ2UuZ2V0U2VydmVycygpW2luZGV4XSkpO1xuICAgIG5ld2NvbmZpZy5uYW1lID0gbmV3Y29uZmlnLm5hbWUgKyBcIiBcIiArIChTdG9yYWdlLmdldFNlcnZlcnMoKS5sZW5ndGggKyAxKTtcbiAgICBTdG9yYWdlLmFkZFNlcnZlcihuZXdjb25maWcpO1xuXG4gICAgbGV0IG9wdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ29wdGlvbicpO1xuICAgIG9wdGlvbi50ZXh0ID0gbmV3Y29uZmlnLm5hbWU7XG4gICAgb3B0aW9uLnZhbHVlID0gU3RvcmFnZS5nZXRTZXJ2ZXJzKCkubGVuZ3RoIC0gMTtcblxuICAgIHRoaXMuc2VsZWN0U2VydmVyLmFkZChvcHRpb24pO1xuICAgIHRoaXMuc2VsZWN0U2VydmVyLnZhbHVlID0gU3RvcmFnZS5nZXRTZXJ2ZXJzKCkubGVuZ3RoIC0gMTtcbiAgICB0aGlzLnNlbGVjdFNlcnZlci5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudCgnY2hhbmdlJykpO1xuICAgIHNlbGYubmFtZUlucHV0LmZvY3VzKCk7XG4gIH1cblxuICBpbXBvcnQoKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gICAgY29uc3QgaW1wb3J0SGFuZGxlciA9IG5ldyBJbXBvcnQoKTtcblxuICAgIGltcG9ydEhhbmRsZXIub25GaW5pc2hlZCA9IChzdGF0aXN0aWMpID0+IHtcbiAgICAgIGxldCBkZXRhaWwgPSBbXTtcblxuICAgICAgaWYgKHN0YXRpc3RpYy5jcmVhdGVkU2VydmVycykge1xuICAgICAgICBkZXRhaWwucHVzaChzdGF0aXN0aWMuY3JlYXRlZFNlcnZlcnMgKyBcIiBOZXcgU2VydmVyKHMpXCIpO1xuICAgICAgfVxuICAgICAgaWYgKHN0YXRpc3RpYy51cGRhdGVkU2VydmVycykge1xuICAgICAgICBkZXRhaWwucHVzaChzdGF0aXN0aWMudXBkYXRlZFNlcnZlcnMgKyBcIiBVcGRhdGVkIFNlcnZlcihzKVwiKTtcbiAgICAgIH1cbiAgICAgIGlmIChzdGF0aXN0aWMuY3JlYXRlZEZvbGRlcnMpIHtcbiAgICAgICAgZGV0YWlsLnB1c2goc3RhdGlzdGljLmNyZWF0ZWRGb2xkZXJzICsgXCIgTmV3IEZvbGRlcihzKVwiKTtcbiAgICAgIH1cblxuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZFN1Y2Nlc3MoJ0ltcG9ydCBjb21wbGV0ZWQnLCB7XG4gICAgICAgIGRldGFpbDogJ0ltcG9ydGVkOiAnICsgZGV0YWlsLmpvaW4oJywgJykgKyAnLicsXG4gICAgICAgIGRpc21pc3NhYmxlOiB0cnVlLFxuICAgICAgfSk7XG5cbiAgICAgIHNlbGYucmVsb2FkKCk7XG4gICAgfTtcblxuICAgIGltcG9ydEhhbmRsZXIub25XYXJuaW5nID0gKGVycm9yKSA9PiB7XG4gICAgICAvLyBUT0RPXG4gICAgfTtcblxuICAgIGltcG9ydEhhbmRsZXIub25FcnJvciA9IChlcnJvcikgPT4ge1xuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKCdBbiBlcnJvciBvY2N1cnJlZCBkdXJpbmcgaW1wb3J0LicsIHtcbiAgICAgICAgZGV0YWlsOiBlcnJvci5tZXNzYWdlLFxuICAgICAgICBkaXNtaXNzYWJsZTogdHJ1ZSxcbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICBpbXBvcnRIYW5kbGVyLmltcG9ydCgpO1xuICB9XG5cbiAgZWRpdEZvbGRlcnMoKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG5cbiAgICBjb25zdCBmb2xkZXJDb25maWd1cmF0aW9uVmlldyA9IG5ldyBGb2xkZXJDb25maWd1cmF0aW9uVmlldygnJywgdHJ1ZSk7XG5cbiAgICBsZXQgaW5kZXggPSBzZWxmLmZvbGRlclNlbGVjdC5zZWxlY3RlZE9wdGlvbnNbMF0udmFsdWU7XG5cbiAgICBpZiAoaW5kZXggPiAwKSB7XG4gICAgICBsZXQgZm9sZGVyID0gU3RvcmFnZS5nZXRGb2xkZXIoaW5kZXgpO1xuICAgICAgZm9sZGVyQ29uZmlndXJhdGlvblZpZXcucmVsb2FkKGZvbGRlcik7XG4gICAgfSBlbHNlIGlmIChTdG9yYWdlLmdldEZvbGRlcnMoKS5sZW5ndGggPiAwKSB7XG4gICAgICBsZXQgZm9sZGVyID0gU3RvcmFnZS5nZXRGb2xkZXJzKClbMF07XG4gICAgICBmb2xkZXJDb25maWd1cmF0aW9uVmlldy5yZWxvYWQoZm9sZGVyKTtcbiAgICB9XG5cbiAgICBmb2xkZXJDb25maWd1cmF0aW9uVmlldy5vbignY2xvc2UnLCAoZSkgPT4ge1xuICAgICAgc2VsZi5jcmVhdGVDb250cm9sc0ZvbGRlclNlbGVjdCgpO1xuICAgICAgc2VsZi5hdHRhY2goKTtcbiAgICB9KTtcblxuICAgIGZvbGRlckNvbmZpZ3VyYXRpb25WaWV3LmF0dGFjaCgpO1xuICB9XG59XG4iXX0=