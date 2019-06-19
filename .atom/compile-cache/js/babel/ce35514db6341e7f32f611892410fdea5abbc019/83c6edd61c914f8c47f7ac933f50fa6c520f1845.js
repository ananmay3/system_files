Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _atomSpacePenViews = require('atom-space-pen-views');

var _atom = require('atom');

'use babel';

var atom = global.atom;
var config = require('./../config/folder-schema.json');
var Storage = require('./../helper/storage.js');

var FolderConfigurationView = (function (_View) {
  _inherits(FolderConfigurationView, _View);

  function FolderConfigurationView() {
    _classCallCheck(this, FolderConfigurationView);

    _get(Object.getPrototypeOf(FolderConfigurationView.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(FolderConfigurationView, [{
    key: 'initialize',
    value: function initialize() {
      var self = this;

      self.subscriptions = null;
      self.disableEventhandler = false;

      var html = '<p>Ftp-Remote-Edit Folder Settings</p>';
      html += "<p>You can edit each folder at the time. All changes will only be saved by pushing the save button on the Server Settings window.</p>";
      self.info.html(html);

      var closeButton = document.createElement('button');
      closeButton.textContent = 'Close';
      closeButton.classList.add('btn');
      closeButton.classList.add('pull-right');

      self.content.append(self.createFolderSelect());
      self.content.append(self.createControls());

      self.footer.append(closeButton);

      // Events
      closeButton.addEventListener('click', function (event) {
        self.close();
      });

      self.subscriptions = new _atom.CompositeDisposable();
      self.subscriptions.add(atom.commands.add(this.element, {
        'core:confirm': function coreConfirm() {
          self.close();
        },
        'core:cancel': function coreCancel() {
          self.close();
        }
      }));
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
      divRequired.classList.add('folder-settings');

      var nameLabel = document.createElement('label');
      nameLabel.classList.add('control-label');
      var nameLabelTitle = document.createElement('div');
      nameLabelTitle.textContent = 'The name of the folder.';
      nameLabelTitle.classList.add('setting-title');
      nameLabel.appendChild(nameLabelTitle);
      self.nameInput = new _atomSpacePenViews.TextEditorView({ mini: true, placeholderText: "name" });
      self.nameInput.element.classList.add('form-control');

      var parentLabel = document.createElement('label');
      parentLabel.classList.add('control-label');
      var parentLabelTitle = document.createElement('div');
      parentLabelTitle.textContent = 'Choose parent folder';
      parentLabelTitle.classList.add('setting-title');
      parentLabel.appendChild(parentLabelTitle);

      self.parentSelect = document.createElement('select');
      self.parentSelect.classList.add('form-control');

      var parentSelectContainer = document.createElement('div');
      parentSelectContainer.classList.add('select-container');
      parentSelectContainer.appendChild(self.parentSelect);

      var nameControl = document.createElement('div');
      nameControl.classList.add('controls');
      nameControl.classList.add('name');
      nameControl.appendChild(nameLabel);
      nameControl.appendChild(self.nameInput.element);

      var parentControl = document.createElement('div');
      parentControl.classList.add('controls');
      parentControl.classList.add('parent');
      parentControl.appendChild(parentLabel);
      parentControl.appendChild(parentSelectContainer);

      var nameGroup = document.createElement('div');
      nameGroup.classList.add('control-group');
      nameGroup.appendChild(parentControl);
      nameGroup.appendChild(nameControl);

      divRequired.appendChild(nameGroup);

      // Events
      self.nameInput.getModel().onDidChange(function () {
        if (Storage.getFolders().length !== 0 && !self.disableEventhandler) {
          var index = self.selectFolder.selectedOptions[0].value;
          var folder = Storage.getFolder(index);
          folder.name = self.nameInput.getText().trim();
          self.selectFolder.selectedOptions[0].text = self.nameInput.getText().trim();
        }
      });

      self.parentSelect.addEventListener('change', function (event) {
        if (Storage.getFolders().length !== 0 && !self.disableEventhandler) {
          var index = self.selectFolder.selectedOptions[0].value;
          var option = event.currentTarget.selectedOptions[0].value;
          var folder = Storage.getFolder(index);
          folder.parent = parseInt(option);
        }
      });

      return divRequired;
    }
  }, {
    key: 'createControlsParent',
    value: function createControlsParent() {
      var self = this;

      while (self.parentSelect.firstChild) {
        self.parentSelect.removeChild(self.parentSelect.firstChild);
      }

      var option = document.createElement("option");
      option.text = '- None -';
      option.value = null;
      self.parentSelect.add(option);

      Storage.getFoldersStructuredByTree().forEach(function (config) {
        var folder_option = document.createElement("option");
        folder_option.text = config.name;
        folder_option.value = config.id;
        folder_option.dataset.parents_id = config.parents_id;
        self.parentSelect.add(folder_option);
      });
    }
  }, {
    key: 'createFolderSelect',
    value: function createFolderSelect() {
      var self = this;

      var div = document.createElement('div');
      div.classList.add('folder');
      div.style.marginBottom = '20px';

      var select = document.createElement('select');
      select.classList.add('form-control');
      self.selectFolder = select;
      self.selectFolder.focus();

      var folderControl = document.createElement('div');
      folderControl.classList.add('controls');
      folderControl.classList.add('folder');
      folderControl.appendChild(self.selectFolder);

      var newButton = document.createElement('button');
      newButton.textContent = 'New';
      newButton.classList.add('btn');

      self.deleteButton = document.createElement('button');
      self.deleteButton.textContent = 'Delete';
      self.deleteButton.classList.add('btn');

      var buttonControl = document.createElement('div');
      buttonControl.classList.add('controls');
      buttonControl.classList.add('folder-button');
      buttonControl.appendChild(newButton);
      buttonControl.appendChild(self.deleteButton);

      var folderGroup = document.createElement('div');
      folderGroup.classList.add('control-group');
      folderGroup.appendChild(folderControl);
      folderGroup.appendChild(buttonControl);

      div.appendChild(folderGroup);

      // Events
      select.addEventListener('change', function (event) {
        if (Storage.getFolders().length !== 0 && !self.disableEventhandler) {
          var option = event.currentTarget.selectedOptions[0];
          var indexInArray = option.value;

          self.fillInputFields(indexInArray ? Storage.getFolder(indexInArray) : null);
        }
      });

      newButton.addEventListener('click', function (event) {
        self['new']();
      });

      self.deleteButton.addEventListener('click', function (event) {
        self['delete']();
      });

      return div;
    }
  }, {
    key: 'reload',
    value: function reload(selectedFolder) {
      var self = this;

      self.disableEventhandler = true;

      while (self.selectFolder.firstChild) {
        self.selectFolder.removeChild(self.selectFolder.firstChild);
      }

      var selectedIndex = 0;
      if (Storage.getFolders().length !== 0) {
        Storage.getFolders().forEach(function (item, index) {
          var option = document.createElement("option");
          option.text = item.name;
          option.value = item.id;
          self.selectFolder.add(option);
        });

        if (typeof selectedFolder === 'undefined') {
          selectedFolder = Storage.getFolders()[0];
        }

        this.selectFolder.value = selectedFolder.id;
        self.fillInputFields(selectedFolder);

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

      if (Storage.getFolders().length === 0) {
        self.disableInputFields();
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

      this.trigger('close');
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
      var folder = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

      var self = this;

      self.disableEventhandler = true;

      self.createControlsParent();

      if (folder) {
        self.nameInput.setText(folder.name);
        if (folder.parent === null) {
          self.parentSelect.selectedIndex = 0;
        } else {
          self.parentSelect.value = folder.parent;
        }
        for (i = self.parentSelect.options.length - 1; i >= 0; i--) {
          self.parentSelect.options[i].disabled = self.parentSelect.options[i].hidden = self.parentSelect.options[i].value == folder.id || typeof self.parentSelect.options[i].dataset.parents_id !== 'undefined' && typeof self.parentSelect.options[i].dataset.parents_id.split(",").find(function (element) {
            return parseInt(element) === parseInt(folder.id);
          }) !== 'undefined';
        }
      } else {
        self.nameInput.setText('');
        self.parentSelect.selectedIndex = 0;
      }

      self.disableEventhandler = false;
    }
  }, {
    key: 'enableInputFields',
    value: function enableInputFields() {
      var self = this;

      self.deleteButton.classList.remove('disabled');
      self.deleteButton.disabled = false;

      self.nameInput[0].classList.remove('disabled');
      self.nameInput.disabled = false;

      self.parentSelect.classList.remove('disabled');
      self.parentSelect.disabled = false;
    }
  }, {
    key: 'disableInputFields',
    value: function disableInputFields() {
      var self = this;

      self.deleteButton.classList.add('disabled');
      self.deleteButton.disabled = true;

      self.nameInput[0].classList.add('disabled');
      self.nameInput.disabled = true;

      self.parentSelect.classList.add('disabled');
      self.parentSelect.disabled = true;

      var changing = false;
      self.nameInput.getModel().onDidChange(function () {
        if (!changing && self.nameInput.disabled) {
          changing = true;
          self.nameInput.setText('');
          changing = false;
        }
      });
    }
  }, {
    key: 'new',
    value: function _new() {
      var self = this;

      self.enableInputFields();

      var newconfig = JSON.parse(JSON.stringify(config));
      newconfig.name = config.name + " " + (Storage.getFolders().length + 1);
      newconfig = Storage.addFolder(newconfig);

      var option = document.createElement('option');
      option.text = newconfig.name;
      option.value = newconfig.id;

      this.selectFolder.add(option);
      this.selectFolder.value = option.value;
      this.selectFolder.dispatchEvent(new Event('change'));
    }
  }, {
    key: 'delete',
    value: function _delete() {
      var self = this;

      if (Storage.getFolders().length != 0) {
        var index = self.selectFolder.value;
        Storage.deleteFolder(index);
      }

      self.reload();
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

  return FolderConfigurationView;
})(_atomSpacePenViews.View);

exports['default'] = FolderConfigurationView;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2FuYW5tYXlqYWluLy5hdG9tL3BhY2thZ2VzL2Z0cC1yZW1vdGUtZWRpdC9saWIvdmlld3MvZm9sZGVyLWNvbmZpZ3VyYXRpb24tdmlldy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7aUNBRXdDLHNCQUFzQjs7b0JBQzFCLE1BQU07O0FBSDFDLFdBQVcsQ0FBQzs7QUFLWixJQUFNLElBQUksR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDO0FBQ3pCLElBQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUFDO0FBQ3pELElBQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDOztJQUU3Qix1QkFBdUI7WUFBdkIsdUJBQXVCOztXQUF2Qix1QkFBdUI7MEJBQXZCLHVCQUF1Qjs7K0JBQXZCLHVCQUF1Qjs7O2VBQXZCLHVCQUF1Qjs7V0FpQ2hDLHNCQUFHO0FBQ1gsVUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDOztBQUVsQixVQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQztBQUMxQixVQUFJLENBQUMsbUJBQW1CLEdBQUcsS0FBSyxDQUFDOztBQUVqQyxVQUFJLElBQUksR0FBRyx3Q0FBd0MsQ0FBQztBQUNwRCxVQUFJLElBQUksdUlBQXVJLENBQUM7QUFDaEosVUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7O0FBRXJCLFVBQUksV0FBVyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDbkQsaUJBQVcsQ0FBQyxXQUFXLEdBQUcsT0FBTyxDQUFDO0FBQ2xDLGlCQUFXLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUNqQyxpQkFBVyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7O0FBRXhDLFVBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxrQkFBa0Is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LFVBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztLQUNmOzs7V0E1WGEsbUJBQUc7OztBQUNmLGFBQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQztBQUNkLGlCQUFPLGdEQUFnRDtPQUN4RCxFQUFFLFlBQU07QUFDUCxjQUFLLEdBQUcsQ0FBQztBQUNQLG1CQUFPLFFBQVE7U0FDaEIsRUFBRSxZQUFNO0FBQ1AsZ0JBQUssR0FBRyxDQUFDO0FBQ1AscUJBQU8sYUFBYTtXQUNyQixFQUFFLFlBQU07QUFDUCxrQkFBSyxLQUFLLENBQUM7QUFDVCx1QkFBTyxNQUFNO0FBQ2Isb0JBQU0sRUFBRSxNQUFNO2FBQ2YsQ0FBQyxDQUFDO0FBQ0gsa0JBQUssR0FBRyxDQUFDO0FBQ1AsdUJBQU8sZ0JBQWdCO0FBQ3ZCLG9CQUFNLEVBQUUsU0FBUzthQUNsQixDQUFDLENBQUM7QUFDSCxrQkFBSyxHQUFHLENBQUM7QUFDUCx1QkFBTyxlQUFlO0FBQ3RCLG9CQUFNLEVBQUUsUUFBUTthQUNqQixDQUFDLENBQUM7V0FDSixDQUFDLENBQUM7U0FDSixDQUFDLENBQUM7QUFDSCxjQUFLLEdBQUcsQ0FBQztBQUNQLG1CQUFPLGVBQWU7QUFDdEIsZ0JBQU0sRUFBRSxPQUFPO1NBQ2hCLENBQUMsQ0FBQztPQUNKLENBQUMsQ0FBQztLQUNKOzs7U0EvQmtCLHVCQUF1Qjs7O3FCQUF2Qix1QkFBdUIiLCJmaWxlIjoiL2hvbWUvYW5hbm1heWphaW4vLmF0b20vcGFja2FnZXMvZnRwLXJlbW90ZS1lZGl0L2xpYi92aWV3cy9mb2xkZXItY29uZmlndXJhdGlvbi12aWV3LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbmltcG9ydCB7ICQsIFZpZXcsIFRleHRFZGl0b3JWaWV3IH0gZnJvbSAnYXRvbS1zcGFjZS1wZW4tdmlld3MnO1xuaW1wb3J0IHsgQ29tcG9zaXRlRGlzcG9zYWJsZSB9IGZyb20gJ2F0b20nO1xuXG5jb25zdCBhdG9tID0gZ2xvYmFsLmF0b207XG5jb25zdCBjb25maWcgPSByZXF1aXJlKCcuLy4uL2NvbmZpZy9mb2xkZXItc2NoZW1hLmpzb24nKTtcbmNvbnN0IFN0b3JhZ2UgPSByZXF1aXJlKCcuLy4uL2hlbHBlci9zdG9yYWdlLmpzJyk7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEZvbGRlckNvbmZpZ3VyYXRpb25WaWV3IGV4dGVuZHMgVmlldyB7XG5cbiAgc3RhdGljIGNvbnRlbnQoKSB7XG4gICAgcmV0dXJuIHRoaXMuZGl2KHtcbiAgICAgIGNsYXNzOiAnZnRwLXJlbW90ZS1lZGl0IHNldHRpbmdzLXZpZXcgb3ZlcmxheSBmcm9tLXRvcCdcbiAgICB9LCAoKSA9PiB7XG4gICAgICB0aGlzLmRpdih7XG4gICAgICAgIGNsYXNzOiAncGFuZWxzJyxcbiAgICAgIH0sICgpID0+IHtcbiAgICAgICAgdGhpcy5kaXYoe1xuICAgICAgICAgIGNsYXNzOiAncGFuZWxzLWl0ZW0nLFxuICAgICAgICB9LCAoKSA9PiB7XG4gICAgICAgICAgdGhpcy5sYWJlbCh7XG4gICAgICAgICAgICBjbGFzczogJ2ljb24nLFxuICAgICAgICAgICAgb3V0bGV0OiAnaW5mbycsXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgdGhpcy5kaXYoe1xuICAgICAgICAgICAgY2xhc3M6ICdwYW5lbHMtY29udGVudCcsXG4gICAgICAgICAgICBvdXRsZXQ6ICdjb250ZW50JyxcbiAgICAgICAgICB9KTtcbiAgICAgICAgICB0aGlzLmRpdih7XG4gICAgICAgICAgICBjbGFzczogJ3BhbmVscy1mb290ZXInLFxuICAgICAgICAgICAgb3V0bGV0OiAnZm9vdGVyJyxcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICAgIHRoaXMuZGl2KHtcbiAgICAgICAgY2xhc3M6ICdlcnJvci1tZXNzYWdlJyxcbiAgICAgICAgb3V0bGV0OiAnZXJyb3InLFxuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICBpbml0aWFsaXplKCkge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuXG4gICAgc2VsZi5zdWJzY3JpcHRpb25zID0gbnVsbDtcbiAgICBzZWxmLmRpc2FibGVFdmVudGhhbmRsZXIgPSBmYWxzZTtcblxuICAgIGxldCBodG1sID0gJzxwPkZ0cC1SZW1vdGUtRWRpdCBGb2xkZXIgU2V0dGluZ3M8L3A+JztcbiAgICBodG1sICs9IFwiPHA+WW91IGNhbiBlZGl0IGVhY2ggZm9sZGVyIGF0IHRoZSB0aW1lLiBBbGwgY2hhbmdlcyB3aWxsIG9ubHkgYmUgc2F2ZWQgYnkgcHVzaGluZyB0aGUgc2F2ZSBidXR0b24gb24gdGhlIFNlcnZlciBTZXR0aW5ncyB3aW5kb3cuPC9wPlwiO1xuICAgIHNlbGYuaW5mby5odG1sKGh0bWwpO1xuXG4gICAgbGV0IGNsb3NlQnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XG4gICAgY2xvc2VCdXR0b24udGV4dENvbnRlbnQgPSAnQ2xvc2UnO1xuICAgIGNsb3NlQnV0dG9uLmNsYXNzTGlzdC5hZGQoJ2J0bicpO1xuICAgIGNsb3NlQnV0dG9uLmNsYXNzTGlzdC5hZGQoJ3B1bGwtcmlnaHQnKTtcblxuICAgIHNlbGYuY29udGVudC5hcHBlbmQoc2VsZi5jcmVhdGVGb2xkZXJTZWxlY3QoKSk7XG4gICAgc2VsZi5jb250ZW50LmFwcGVuZChzZWxmLmNyZWF0ZUNvbnRyb2xzKCkpO1xuXG4gICAgc2VsZi5mb290ZXIuYXBwZW5kKGNsb3NlQnV0dG9uKTtcblxuICAgIC8vIEV2ZW50c1xuICAgIGNsb3NlQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGV2ZW50KSA9PiB7XG4gICAgICBzZWxmLmNsb3NlKCk7XG4gICAgfSk7XG5cbiAgICBzZWxmLnN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuICAgIHNlbGYuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb21tYW5kcy5hZGQodGhpcy5lbGVtZW50LCB7XG4gICAgICAnY29yZTpjb25maXJtJzogKCkgPT4ge1xuICAgICAgICBzZWxmLmNsb3NlKCk7XG4gICAgICB9LFxuICAgICAgJ2NvcmU6Y2FuY2VsJzogKCkgPT4ge1xuICAgICAgICBzZWxmLmNsb3NlKCk7XG4gICAgICB9LFxuICAgIH0pKTtcbiAgfVxuXG4gIGRlc3Ryb3koKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG5cbiAgICBpZiAoc2VsZi5zdWJzY3JpcHRpb25zKSB7XG4gICAgICBzZWxmLnN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpO1xuICAgICAgc2VsZi5zdWJzY3JpcHRpb25zID0gbnVsbDtcbiAgICB9XG4gIH1cblxuICBjcmVhdGVDb250cm9scygpIHtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcblxuICAgIGxldCBkaXZSZXF1aXJlZCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGRpdlJlcXVpcmVkLmNsYXNzTGlzdC5hZGQoJ2ZvbGRlci1zZXR0aW5ncycpO1xuXG4gICAgbGV0IG5hbWVMYWJlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xhYmVsJyk7XG4gICAgbmFtZUxhYmVsLmNsYXNzTGlzdC5hZGQoJ2NvbnRyb2wtbGFiZWwnKTtcbiAgICBsZXQgbmFtZUxhYmVsVGl0bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBuYW1lTGFiZWxUaXRsZS50ZXh0Q29udGVudCA9ICdUaGUgbmFtZSBvZiB0aGUgZm9sZGVyLic7XG4gICAgbmFtZUxhYmVsVGl0bGUuY2xhc3NMaXN0LmFkZCgnc2V0dGluZy10aXRsZScpO1xuICAgIG5hbWVMYWJlbC5hcHBlbmRDaGlsZChuYW1lTGFiZWxUaXRsZSk7XG4gICAgc2VsZi5uYW1lSW5wdXQgPSBuZXcgVGV4dEVkaXRvclZpZXcoeyBtaW5pOiB0cnVlLCBwbGFjZWhvbGRlclRleHQ6IFwibmFtZVwiIH0pO1xuICAgIHNlbGYubmFtZUlucHV0LmVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnZm9ybS1jb250cm9sJyk7XG5cbiAgICBsZXQgcGFyZW50TGFiZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsYWJlbCcpO1xuICAgIHBhcmVudExhYmVsLmNsYXNzTGlzdC5hZGQoJ2NvbnRyb2wtbGFiZWwnKTtcbiAgICBsZXQgcGFyZW50TGFiZWxUaXRsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIHBhcmVudExhYmVsVGl0bGUudGV4dENvbnRlbnQgPSAnQ2hvb3NlIHBhcmVudCBmb2xkZXInO1xuICAgIHBhcmVudExhYmVsVGl0bGUuY2xhc3NMaXN0LmFkZCgnc2V0dGluZy10aXRsZScpO1xuICAgIHBhcmVudExhYmVsLmFwcGVuZENoaWxkKHBhcmVudExhYmVsVGl0bGUpO1xuXG4gICAgc2VsZi5wYXJlbnRTZWxlY3QgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzZWxlY3QnKTtcbiAgICBzZWxmLnBhcmVudFNlbGVjdC5jbGFzc0xpc3QuYWRkKCdmb3JtLWNvbnRyb2wnKTtcblxuICAgIGxldCBwYXJlbnRTZWxlY3RDb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBwYXJlbnRTZWxlY3RDb250YWluZXIuY2xhc3NMaXN0LmFkZCgnc2VsZWN0LWNvbnRhaW5lcicpO1xuICAgIHBhcmVudFNlbGVjdENvbnRhaW5lci5hcHBlbmRDaGlsZChzZWxmLnBhcmVudFNlbGVjdCk7XG5cbiAgICBsZXQgbmFtZUNvbnRyb2wgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBuYW1lQ29udHJvbC5jbGFzc0xpc3QuYWRkKCdjb250cm9scycpO1xuICAgIG5hbWVDb250cm9sLmNsYXNzTGlzdC5hZGQoJ25hbWUnKTtcbiAgICBuYW1lQ29udHJvbC5hcHBlbmRDaGlsZChuYW1lTGFiZWwpO1xuICAgIG5hbWVDb250cm9sLmFwcGVuZENoaWxkKHNlbGYubmFtZUlucHV0LmVsZW1lbnQpO1xuXG4gICAgbGV0IHBhcmVudENvbnRyb2wgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBwYXJlbnRDb250cm9sLmNsYXNzTGlzdC5hZGQoJ2NvbnRyb2xzJyk7XG4gICAgcGFyZW50Q29udHJvbC5jbGFzc0xpc3QuYWRkKCdwYXJlbnQnKTtcbiAgICBwYXJlbnRDb250cm9sLmFwcGVuZENoaWxkKHBhcmVudExhYmVsKTtcbiAgICBwYXJlbnRDb250cm9sLmFwcGVuZENoaWxkKHBhcmVudFNlbGVjdENvbnRhaW5lcik7XG5cbiAgICBsZXQgbmFtZUdyb3VwID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgbmFtZUdyb3VwLmNsYXNzTGlzdC5hZGQoJ2NvbnRyb2wtZ3JvdXAnKTtcbiAgICBuYW1lR3JvdXAuYXBwZW5kQ2hpbGQocGFyZW50Q29udHJvbCk7XG4gICAgbmFtZUdyb3VwLmFwcGVuZENoaWxkKG5hbWVDb250cm9sKTtcblxuICAgIGRpdlJlcXVpcmVkLmFwcGVuZENoaWxkKG5hbWVHcm91cCk7XG5cbiAgICAvLyBFdmVudHNcbiAgICBzZWxmLm5hbWVJbnB1dC5nZXRNb2RlbCgpLm9uRGlkQ2hhbmdlKCgpID0+IHtcbiAgICAgIGlmIChTdG9yYWdlLmdldEZvbGRlcnMoKS5sZW5ndGggIT09IDAgJiYgIXNlbGYuZGlzYWJsZUV2ZW50aGFuZGxlcikge1xuICAgICAgICBsZXQgaW5kZXggPSBzZWxmLnNlbGVjdEZvbGRlci5zZWxlY3RlZE9wdGlvbnNbMF0udmFsdWU7XG4gICAgICAgIGxldCBmb2xkZXIgPSBTdG9yYWdlLmdldEZvbGRlcihpbmRleCk7XG4gICAgICAgIGZvbGRlci5uYW1lID0gc2VsZi5uYW1lSW5wdXQuZ2V0VGV4dCgpLnRyaW0oKTtcbiAgICAgICAgc2VsZi5zZWxlY3RGb2xkZXIuc2VsZWN0ZWRPcHRpb25zWzBdLnRleHQgPSBzZWxmLm5hbWVJbnB1dC5nZXRUZXh0KCkudHJpbSgpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgc2VsZi5wYXJlbnRTZWxlY3QuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgKGV2ZW50KSA9PiB7XG4gICAgICBpZiAoU3RvcmFnZS5nZXRGb2xkZXJzKCkubGVuZ3RoICE9PSAwICYmICFzZWxmLmRpc2FibGVFdmVudGhhbmRsZXIpIHtcbiAgICAgICAgbGV0IGluZGV4ID0gc2VsZi5zZWxlY3RGb2xkZXIuc2VsZWN0ZWRPcHRpb25zWzBdLnZhbHVlO1xuICAgICAgICBsZXQgb3B0aW9uID0gZXZlbnQuY3VycmVudFRhcmdldC5zZWxlY3RlZE9wdGlvbnNbMF0udmFsdWU7XG4gICAgICAgIGxldCBmb2xkZXIgPSBTdG9yYWdlLmdldEZvbGRlcihpbmRleCk7XG4gICAgICAgIGZvbGRlci5wYXJlbnQgPSBwYXJzZUludChvcHRpb24pO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIGRpdlJlcXVpcmVkO1xuICB9XG5cbiAgY3JlYXRlQ29udHJvbHNQYXJlbnQoKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG5cbiAgICB3aGlsZSAoc2VsZi5wYXJlbnRTZWxlY3QuZmlyc3RDaGlsZCkge1xuICAgICAgc2VsZi5wYXJlbnRTZWxlY3QucmVtb3ZlQ2hpbGQoc2VsZi5wYXJlbnRTZWxlY3QuZmlyc3RDaGlsZCk7XG4gICAgfVxuXG4gICAgbGV0IG9wdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJvcHRpb25cIik7XG4gICAgb3B0aW9uLnRleHQgPSAnLSBOb25lIC0nO1xuICAgIG9wdGlvbi52YWx1ZSA9IG51bGw7XG4gICAgc2VsZi5wYXJlbnRTZWxlY3QuYWRkKG9wdGlvbik7XG5cbiAgICBTdG9yYWdlLmdldEZvbGRlcnNTdHJ1Y3R1cmVkQnlUcmVlKCkuZm9yRWFjaCgoY29uZmlnKSA9PiB7XG4gICAgICBsZXQgZm9sZGVyX29wdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJvcHRpb25cIik7XG4gICAgICBmb2xkZXJfb3B0aW9uLnRleHQgPSBjb25maWcubmFtZTtcbiAgICAgIGZvbGRlcl9vcHRpb24udmFsdWUgPSBjb25maWcuaWQ7XG4gICAgICBmb2xkZXJfb3B0aW9uLmRhdGFzZXQucGFyZW50c19pZCA9IGNvbmZpZy5wYXJlbnRzX2lkO1xuICAgICAgc2VsZi5wYXJlbnRTZWxlY3QuYWRkKGZvbGRlcl9vcHRpb24pO1xuICAgIH0pO1xuICB9XG5cbiAgY3JlYXRlRm9sZGVyU2VsZWN0KCkge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuXG4gICAgbGV0IGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGRpdi5jbGFzc0xpc3QuYWRkKCdmb2xkZXInKTtcbiAgICBkaXYuc3R5bGUubWFyZ2luQm90dG9tID0gJzIwcHgnO1xuXG4gICAgbGV0IHNlbGVjdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NlbGVjdCcpO1xuICAgIHNlbGVjdC5jbGFzc0xpc3QuYWRkKCdmb3JtLWNvbnRyb2wnKTtcbiAgICBzZWxmLnNlbGVjdEZvbGRlciA9IHNlbGVjdDtcbiAgICBzZWxmLnNlbGVjdEZvbGRlci5mb2N1cygpO1xuXG4gICAgbGV0IGZvbGRlckNvbnRyb2wgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBmb2xkZXJDb250cm9sLmNsYXNzTGlzdC5hZGQoJ2NvbnRyb2xzJyk7XG4gICAgZm9sZGVyQ29udHJvbC5jbGFzc0xpc3QuYWRkKCdmb2xkZXInKTtcbiAgICBmb2xkZXJDb250cm9sLmFwcGVuZENoaWxkKHNlbGYuc2VsZWN0Rm9sZGVyKTtcblxuICAgIGxldCBuZXdCdXR0b24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKTtcbiAgICBuZXdCdXR0b24udGV4dENvbnRlbnQgPSAnTmV3JztcbiAgICBuZXdCdXR0b24uY2xhc3NMaXN0LmFkZCgnYnRuJyk7XG5cbiAgICBzZWxmLmRlbGV0ZUJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xuICAgIHNlbGYuZGVsZXRlQnV0dG9uLnRleHRDb250ZW50ID0gJ0RlbGV0ZSc7XG4gICAgc2VsZi5kZWxldGVCdXR0b24uY2xhc3NMaXN0LmFkZCgnYnRuJyk7XG5cbiAgICBsZXQgYnV0dG9uQ29udHJvbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGJ1dHRvbkNvbnRyb2wuY2xhc3NMaXN0LmFkZCgnY29udHJvbHMnKTtcbiAgICBidXR0b25Db250cm9sLmNsYXNzTGlzdC5hZGQoJ2ZvbGRlci1idXR0b24nKTtcbiAgICBidXR0b25Db250cm9sLmFwcGVuZENoaWxkKG5ld0J1dHRvbik7XG4gICAgYnV0dG9uQ29udHJvbC5hcHBlbmRDaGlsZChzZWxmLmRlbGV0ZUJ1dHRvbik7XG5cbiAgICBsZXQgZm9sZGVyR3JvdXAgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBmb2xkZXJHcm91cC5jbGFzc0xpc3QuYWRkKCdjb250cm9sLWdyb3VwJyk7XG4gICAgZm9sZGVyR3JvdXAuYXBwZW5kQ2hpbGQoZm9sZGVyQ29udHJvbCk7XG4gICAgZm9sZGVyR3JvdXAuYXBwZW5kQ2hpbGQoYnV0dG9uQ29udHJvbCk7XG5cbiAgICBkaXYuYXBwZW5kQ2hpbGQoZm9sZGVyR3JvdXApO1xuXG4gICAgLy8gRXZlbnRzXG4gICAgc2VsZWN0LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIChldmVudCkgPT4ge1xuICAgICAgaWYgKFN0b3JhZ2UuZ2V0Rm9sZGVycygpLmxlbmd0aCAhPT0gMCAmJiAhc2VsZi5kaXNhYmxlRXZlbnRoYW5kbGVyKSB7XG4gICAgICAgIGxldCBvcHRpb24gPSBldmVudC5jdXJyZW50VGFyZ2V0LnNlbGVjdGVkT3B0aW9uc1swXTtcbiAgICAgICAgbGV0IGluZGV4SW5BcnJheSA9IG9wdGlvbi52YWx1ZTtcblxuICAgICAgICBzZWxmLmZpbGxJbnB1dEZpZWxkcygoaW5kZXhJbkFycmF5KSA/IFN0b3JhZ2UuZ2V0Rm9sZGVyKGluZGV4SW5BcnJheSkgOiBudWxsKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIG5ld0J1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChldmVudCkgPT4ge1xuICAgICAgc2VsZi5uZXcoKTtcbiAgICB9KTtcblxuICAgIHNlbGYuZGVsZXRlQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGV2ZW50KSA9PiB7XG4gICAgICBzZWxmLmRlbGV0ZSgpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIGRpdjtcbiAgfVxuXG4gIHJlbG9hZChzZWxlY3RlZEZvbGRlcikge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuXG4gICAgc2VsZi5kaXNhYmxlRXZlbnRoYW5kbGVyID0gdHJ1ZTtcblxuICAgIHdoaWxlIChzZWxmLnNlbGVjdEZvbGRlci5maXJzdENoaWxkKSB7XG4gICAgICBzZWxmLnNlbGVjdEZvbGRlci5yZW1vdmVDaGlsZChzZWxmLnNlbGVjdEZvbGRlci5maXJzdENoaWxkKTtcbiAgICB9XG5cbiAgICBsZXQgc2VsZWN0ZWRJbmRleCA9IDA7XG4gICAgaWYgKFN0b3JhZ2UuZ2V0Rm9sZGVycygpLmxlbmd0aCAhPT0gMCkge1xuICAgICAgU3RvcmFnZS5nZXRGb2xkZXJzKCkuZm9yRWFjaCgoaXRlbSwgaW5kZXgpID0+IHtcbiAgICAgICAgbGV0IG9wdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJvcHRpb25cIik7XG4gICAgICAgIG9wdGlvbi50ZXh0ID0gaXRlbS5uYW1lO1xuICAgICAgICBvcHRpb24udmFsdWUgPSBpdGVtLmlkO1xuICAgICAgICBzZWxmLnNlbGVjdEZvbGRlci5hZGQob3B0aW9uKTtcbiAgICAgIH0pO1xuXG4gICAgICBpZiAodHlwZW9mIHNlbGVjdGVkRm9sZGVyID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICBzZWxlY3RlZEZvbGRlciA9IFN0b3JhZ2UuZ2V0Rm9sZGVycygpWzBdO1xuICAgICAgfVxuXG4gICAgICB0aGlzLnNlbGVjdEZvbGRlci52YWx1ZSA9IHNlbGVjdGVkRm9sZGVyLmlkO1xuICAgICAgc2VsZi5maWxsSW5wdXRGaWVsZHMoc2VsZWN0ZWRGb2xkZXIpO1xuXG4gICAgICAvLyBFbmFibGUgSW5wdXQgRmllbGRzXG4gICAgICBzZWxmLmVuYWJsZUlucHV0RmllbGRzKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHNlbGYuZmlsbElucHV0RmllbGRzKCk7XG5cbiAgICAgIC8vIERpc2FibGUgSW5wdXQgRmllbGRzXG4gICAgICBzZWxmLmRpc2FibGVJbnB1dEZpZWxkcygpO1xuICAgIH1cbiAgICBzZWxmLmRpc2FibGVFdmVudGhhbmRsZXIgPSBmYWxzZTtcbiAgfVxuXG4gIGF0dGFjaCgpIHtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcblxuICAgIHNlbGYucGFuZWwgPSBhdG9tLndvcmtzcGFjZS5hZGRNb2RhbFBhbmVsKHtcbiAgICAgIGl0ZW06IHNlbGZcbiAgICB9KTtcblxuICAgIGlmIChTdG9yYWdlLmdldEZvbGRlcnMoKS5sZW5ndGggPT09IDApIHtcbiAgICAgIHNlbGYuZGlzYWJsZUlucHV0RmllbGRzKCk7XG4gICAgfVxuICB9XG5cbiAgY2xvc2UoKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG5cbiAgICBjb25zdCBkZXN0cm95UGFuZWwgPSB0aGlzLnBhbmVsO1xuICAgIHRoaXMucGFuZWwgPSBudWxsO1xuICAgIGlmIChkZXN0cm95UGFuZWwpIHtcbiAgICAgIGRlc3Ryb3lQYW5lbC5kZXN0cm95KCk7XG4gICAgfVxuXG4gICAgdGhpcy50cmlnZ2VyKCdjbG9zZScpO1xuICB9XG5cbiAgc2hvd0Vycm9yKG1lc3NhZ2UpIHtcbiAgICB0aGlzLmVycm9yLnRleHQobWVzc2FnZSk7XG4gICAgaWYgKG1lc3NhZ2UpIHtcbiAgICAgIHRoaXMuZmxhc2hFcnJvcigpO1xuICAgIH1cbiAgfVxuXG4gIGZpbGxJbnB1dEZpZWxkcyhmb2xkZXIgPSBudWxsKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG5cbiAgICBzZWxmLmRpc2FibGVFdmVudGhhbmRsZXIgPSB0cnVlO1xuXG4gICAgc2VsZi5jcmVhdGVDb250cm9sc1BhcmVudCgpO1xuXG4gICAgaWYgKGZvbGRlcikge1xuICAgICAgc2VsZi5uYW1lSW5wdXQuc2V0VGV4dChmb2xkZXIubmFtZSk7XG4gICAgICBpZiAoZm9sZGVyLnBhcmVudCA9PT0gbnVsbCkge1xuICAgICAgICBzZWxmLnBhcmVudFNlbGVjdC5zZWxlY3RlZEluZGV4ID0gMDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNlbGYucGFyZW50U2VsZWN0LnZhbHVlID0gZm9sZGVyLnBhcmVudDtcbiAgICAgIH1cbiAgICAgIGZvciAoaSA9IHNlbGYucGFyZW50U2VsZWN0Lm9wdGlvbnMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgc2VsZi5wYXJlbnRTZWxlY3Qub3B0aW9uc1tpXS5kaXNhYmxlZCA9IHNlbGYucGFyZW50U2VsZWN0Lm9wdGlvbnNbaV0uaGlkZGVuID0gKHNlbGYucGFyZW50U2VsZWN0Lm9wdGlvbnNbaV0udmFsdWUgPT0gZm9sZGVyLmlkIHx8ICh0eXBlb2Ygc2VsZi5wYXJlbnRTZWxlY3Qub3B0aW9uc1tpXS5kYXRhc2V0LnBhcmVudHNfaWQgIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBzZWxmLnBhcmVudFNlbGVjdC5vcHRpb25zW2ldLmRhdGFzZXQucGFyZW50c19pZC5zcGxpdChcIixcIikuZmluZCgoZWxlbWVudCkgPT4geyByZXR1cm4gcGFyc2VJbnQoZWxlbWVudCkgPT09IHBhcnNlSW50KGZvbGRlci5pZCk7IH0pICE9PSAndW5kZWZpbmVkJykpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBzZWxmLm5hbWVJbnB1dC5zZXRUZXh0KCcnKTtcbiAgICAgIHNlbGYucGFyZW50U2VsZWN0LnNlbGVjdGVkSW5kZXggPSAwO1xuICAgIH1cblxuICAgIHNlbGYuZGlzYWJsZUV2ZW50aGFuZGxlciA9IGZhbHNlO1xuICB9XG5cbiAgZW5hYmxlSW5wdXRGaWVsZHMoKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG5cbiAgICBzZWxmLmRlbGV0ZUJ1dHRvbi5jbGFzc0xpc3QucmVtb3ZlKCdkaXNhYmxlZCcpO1xuICAgIHNlbGYuZGVsZXRlQnV0dG9uLmRpc2FibGVkID0gZmFsc2U7XG5cbiAgICBzZWxmLm5hbWVJbnB1dFswXS5jbGFzc0xpc3QucmVtb3ZlKCdkaXNhYmxlZCcpO1xuICAgIHNlbGYubmFtZUlucHV0LmRpc2FibGVkID0gZmFsc2U7XG5cbiAgICBzZWxmLnBhcmVudFNlbGVjdC5jbGFzc0xpc3QucmVtb3ZlKCdkaXNhYmxlZCcpO1xuICAgIHNlbGYucGFyZW50U2VsZWN0LmRpc2FibGVkID0gZmFsc2U7XG4gIH1cblxuICBkaXNhYmxlSW5wdXRGaWVsZHMoKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG5cbiAgICBzZWxmLmRlbGV0ZUJ1dHRvbi5jbGFzc0xpc3QuYWRkKCdkaXNhYmxlZCcpO1xuICAgIHNlbGYuZGVsZXRlQnV0dG9uLmRpc2FibGVkID0gdHJ1ZTtcblxuICAgIHNlbGYubmFtZUlucHV0WzBdLmNsYXNzTGlzdC5hZGQoJ2Rpc2FibGVkJyk7XG4gICAgc2VsZi5uYW1lSW5wdXQuZGlzYWJsZWQgPSB0cnVlO1xuXG4gICAgc2VsZi5wYXJlbnRTZWxlY3QuY2xhc3NMaXN0LmFkZCgnZGlzYWJsZWQnKTtcbiAgICBzZWxmLnBhcmVudFNlbGVjdC5kaXNhYmxlZCA9IHRydWU7XG5cbiAgICBsZXQgY2hhbmdpbmcgPSBmYWxzZTtcbiAgICBzZWxmLm5hbWVJbnB1dC5nZXRNb2RlbCgpLm9uRGlkQ2hhbmdlKCgpID0+IHtcbiAgICAgIGlmICghY2hhbmdpbmcgJiYgc2VsZi5uYW1lSW5wdXQuZGlzYWJsZWQpIHtcbiAgICAgICAgY2hhbmdpbmcgPSB0cnVlO1xuICAgICAgICBzZWxmLm5hbWVJbnB1dC5zZXRUZXh0KCcnKTtcbiAgICAgICAgY2hhbmdpbmcgPSBmYWxzZTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIG5ldygpIHtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcblxuICAgIHNlbGYuZW5hYmxlSW5wdXRGaWVsZHMoKTtcblxuICAgIGxldCBuZXdjb25maWcgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGNvbmZpZykpO1xuICAgIG5ld2NvbmZpZy5uYW1lID0gY29uZmlnLm5hbWUgKyBcIiBcIiArIChTdG9yYWdlLmdldEZvbGRlcnMoKS5sZW5ndGggKyAxKTtcbiAgICBuZXdjb25maWcgPSBTdG9yYWdlLmFkZEZvbGRlcihuZXdjb25maWcpO1xuXG4gICAgbGV0IG9wdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ29wdGlvbicpO1xuICAgIG9wdGlvbi50ZXh0ID0gbmV3Y29uZmlnLm5hbWU7XG4gICAgb3B0aW9uLnZhbHVlID0gbmV3Y29uZmlnLmlkO1xuXG4gICAgdGhpcy5zZWxlY3RGb2xkZXIuYWRkKG9wdGlvbik7XG4gICAgdGhpcy5zZWxlY3RGb2xkZXIudmFsdWUgPSBvcHRpb24udmFsdWVcbiAgICB0aGlzLnNlbGVjdEZvbGRlci5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudCgnY2hhbmdlJykpO1xuICB9XG5cbiAgZGVsZXRlKCkge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuXG4gICAgaWYgKFN0b3JhZ2UuZ2V0Rm9sZGVycygpLmxlbmd0aCAhPSAwKSB7XG4gICAgICBsZXQgaW5kZXggPSBzZWxmLnNlbGVjdEZvbGRlci52YWx1ZTtcbiAgICAgIFN0b3JhZ2UuZGVsZXRlRm9sZGVyKGluZGV4KTtcbiAgICB9XG5cbiAgICBzZWxmLnJlbG9hZCgpO1xuICB9XG59XG4iXX0=