Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _atomSpacePenViews = require('atom-space-pen-views');

var _helperHelperJs = require('./../helper/helper.js');

'use babel';

var PermissionsView = (function (_View) {
  _inherits(PermissionsView, _View);

  function PermissionsView() {
    _classCallCheck(this, PermissionsView);

    _get(Object.getPrototypeOf(PermissionsView.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(PermissionsView, [{
    key: 'initialize',
    value: function initialize(item) {
      var self = this;

      if (!item) return;

      self.disableEventhandler = false;
      self.item = item;
      self.rights = item.rights ? item.rights : { user: '', group: '', other: '' };

      if (self.item.is('.directory')) {
        self.isFile = false;
      } else {
        self.isFile = true;
      }

      var html = '<p>Change ' + (self.isFile ? 'file' : 'directory') + ' attributes</p>';
      html += '<p>Please select the new attributes for the ' + (self.isFile ? 'file' : 'directory') + ' "' + self.item.name + '".</p>';
      self.info.html(html);

      self.saveButton = document.createElement('button');
      self.saveButton.textContent = 'Save';
      self.saveButton.classList.add('btn');

      self.closeButton = document.createElement('button');
      self.closeButton.textContent = 'Cancel';
      self.closeButton.classList.add('btn');
      self.closeButton.classList.add('pull-right');

      self.elements.append(self.createPanelContent());

      self.elements.append(self.saveButton);
      self.elements.append(self.closeButton);

      // Events
      self.closeButton.addEventListener('click', function (event) {
        self.close();
      });

      self.saveButton.addEventListener('click', function (event) {
        self.save();
      });

      atom.commands.add(this.element, {
        'core:confirm': function coreConfirm() {
          // self.save();
        },
        'core:cancel': function coreCancel() {
          self.cancel();
        }
      });
    }
  }, {
    key: 'createPanelContent',
    value: function createPanelContent() {
      var self = this;

      var content = document.createElement('div');

      content.appendChild(self.createOwnerFieldset());
      content.appendChild(self.createGroupFieldset());
      content.appendChild(self.createOtherFieldset());

      var numericGroup = document.createElement('div');
      numericGroup.classList.add('control-group');
      numericGroup.style.marginBottom = '20px';

      var numericGroupControls = document.createElement('div');
      numericGroupControls.classList.add('controls');
      numericGroup.appendChild(numericGroupControls);

      var numericLabel = document.createElement('label');
      numericLabel.classList.add('control-label');
      var numericLabelTitle = document.createElement('div');
      numericLabelTitle.textContent = 'Numeric value';
      numericLabelTitle.classList.add('setting-title');
      numericLabel.appendChild(numericLabelTitle);
      numericGroup.appendChild(numericLabel);

      self.numericInput = new _atomSpacePenViews.TextEditorView({ mini: true });
      numericGroup.appendChild(self.numericInput.element);

      var infoLabel = document.createElement('p');
      infoLabel.textContent = 'You can use an x at any position to keep the permission the original ' + (self.isFile ? 'file' : 'directory') + ' have.';
      numericGroup.appendChild(infoLabel);

      content.appendChild(numericGroup);

      // Events
      self.numericInput.getModel().buffer.onDidChange(function (obj) {
        var allowed = ['x', '0', '1', '2', '3', '4', '5', '6', '7'];

        if (self.disableEventhandler) return;

        if (obj.newRange.end.column < obj.oldRange.end.column) {
          self.updateCheckboxInputs();
          return;
        }

        if (obj.newRange.end.column > 3) {
          self.numericInput.getModel().buffer.setTextInRange(obj.newRange, '');
          return;
        }

        obj.changes.forEach(function (change) {
          change.newText.split('').forEach(function (value) {
            if (allowed.indexOf(value) == -1) {
              self.numericInput.getModel().buffer.setTextInRange(obj.newRange, '');
            }
          });
        });

        self.updateCheckboxInputs();
      });

      return content;
    }
  }, {
    key: 'createOwnerFieldset',
    value: function createOwnerFieldset() {
      var self = this;

      var ownerGroup = document.createElement('div');
      ownerGroup.classList.add('control-group');
      ownerGroup.style.marginBottom = '20px';

      var ownerGroupLabel = document.createElement('label');
      ownerGroupLabel.classList.add('control-group-label');
      ownerGroupLabel.textContent = 'Owner permissions';
      ownerGroup.appendChild(ownerGroupLabel);

      var ownerGroupControl = document.createElement('div');
      ownerGroupControl.classList.add('controls');
      ownerGroupControl.classList.add('owner');
      ownerGroupControl.classList.add('checkbox');
      ownerGroup.appendChild(ownerGroupControl);

      var ownerGroupReadInputLabel = document.createElement('label');
      ownerGroupReadInputLabel.classList.add('control');
      ownerGroupControl.appendChild(ownerGroupReadInputLabel);

      self.ownerGroupReadInput = document.createElement('input');
      self.ownerGroupReadInput.type = 'checkbox';
      self.ownerGroupReadInput.checked = false;
      self.ownerGroupReadInput.classList.add('input-checkbox');
      var ownerGroupReadInputTitle = document.createElement('div');
      ownerGroupReadInputTitle.classList.add('input-title');
      ownerGroupReadInputTitle.textContent = 'Read';
      ownerGroupReadInputLabel.appendChild(self.ownerGroupReadInput);
      ownerGroupReadInputLabel.appendChild(ownerGroupReadInputTitle);

      var ownerGroupWriteInputLabel = document.createElement('label');
      ownerGroupWriteInputLabel.classList.add('control');
      ownerGroupControl.appendChild(ownerGroupWriteInputLabel);

      self.ownerGroupWriteInput = document.createElement('input');
      self.ownerGroupWriteInput.type = 'checkbox';
      self.ownerGroupWriteInput.checked = false;
      self.ownerGroupWriteInput.classList.add('input-checkbox');
      var ownerGroupWriteInputTitle = document.createElement('div');
      ownerGroupWriteInputTitle.classList.add('input-title');
      ownerGroupWriteInputTitle.textContent = 'Write';
      ownerGroupWriteInputLabel.appendChild(self.ownerGroupWriteInput);
      ownerGroupWriteInputLabel.appendChild(ownerGroupWriteInputTitle);

      var ownerGroupExecuteInputLabel = document.createElement('label');
      ownerGroupExecuteInputLabel.classList.add('control');
      ownerGroupControl.appendChild(ownerGroupExecuteInputLabel);

      self.ownerGroupExecuteInput = document.createElement('input');
      self.ownerGroupExecuteInput.type = 'checkbox';
      self.ownerGroupExecuteInput.checked = false;
      self.ownerGroupExecuteInput.classList.add('input-checkbox');
      var ownerGroupExecuteInputTitle = document.createElement('div');
      ownerGroupExecuteInputTitle.classList.add('input-title');
      ownerGroupExecuteInputTitle.textContent = 'Execute';
      ownerGroupExecuteInputLabel.appendChild(self.ownerGroupExecuteInput);
      ownerGroupExecuteInputLabel.appendChild(ownerGroupExecuteInputTitle);

      // Events
      self.ownerGroupReadInput.addEventListener('change', function (event) {
        if (self.disableEventhandler) return;
        self.updateNumericInput();
      });

      self.ownerGroupWriteInput.addEventListener('change', function (event) {
        if (self.disableEventhandler) return;
        self.updateNumericInput();
      });

      self.ownerGroupExecuteInput.addEventListener('change', function (event) {
        if (self.disableEventhandler) return;
        self.updateNumericInput();
      });

      return ownerGroup;
    }
  }, {
    key: 'createGroupFieldset',
    value: function createGroupFieldset() {
      var self = this;

      var groupGroup = document.createElement('div');
      groupGroup.classList.add('control-group');
      groupGroup.style.marginBottom = '20px';

      var groupGroupLabel = document.createElement('label');
      groupGroupLabel.classList.add('control-group-label');
      groupGroupLabel.textContent = 'Group permissions';
      groupGroup.appendChild(groupGroupLabel);

      var groupGroupControl = document.createElement('div');
      groupGroupControl.classList.add('controls');
      groupGroupControl.classList.add('group');
      groupGroupControl.classList.add('checkbox');
      groupGroup.appendChild(groupGroupControl);

      var groupGroupReadInputLabel = document.createElement('label');
      groupGroupReadInputLabel.classList.add('control');
      groupGroupControl.appendChild(groupGroupReadInputLabel);

      self.groupGroupReadInput = document.createElement('input');
      self.groupGroupReadInput.type = 'checkbox';
      self.groupGroupReadInput.checked = false;
      self.groupGroupReadInput.classList.add('input-checkbox');
      var groupGroupReadInputTitle = document.createElement('div');
      groupGroupReadInputTitle.classList.add('input-title');
      groupGroupReadInputTitle.textContent = 'Read';
      groupGroupReadInputLabel.appendChild(self.groupGroupReadInput);
      groupGroupReadInputLabel.appendChild(groupGroupReadInputTitle);

      var groupGroupWriteInputLabel = document.createElement('label');
      groupGroupWriteInputLabel.classList.add('control');
      groupGroupControl.appendChild(groupGroupWriteInputLabel);

      self.groupGroupWriteInput = document.createElement('input');
      self.groupGroupWriteInput.type = 'checkbox';
      self.groupGroupWriteInput.checked = false;
      self.groupGroupWriteInput.classList.add('input-checkbox');
      var groupGroupWriteInputTitle = document.createElement('div');
      groupGroupWriteInputTitle.classList.add('input-title');
      groupGroupWriteInputTitle.textContent = 'Write';
      groupGroupWriteInputLabel.appendChild(self.groupGroupWriteInput);
      groupGroupWriteInputLabel.appendChild(groupGroupWriteInputTitle);

      var groupGroupExecuteInputLabel = document.createElement('label');
      groupGroupExecuteInputLabel.classList.add('control');
      groupGroupControl.appendChild(groupGroupExecuteInputLabel);

      self.groupGroupExecuteInput = document.createElement('input');
      self.groupGroupExecuteInput.type = 'checkbox';
      self.groupGroupExecuteInput.checked = false;
      self.groupGroupExecuteInput.classList.add('input-checkbox');
      var groupGroupExecuteInputTitle = document.createElement('div');
      groupGroupExecuteInputTitle.classList.add('input-title');
      groupGroupExecuteInputTitle.textContent = 'Execute';
      groupGroupExecuteInputLabel.appendChild(self.groupGroupExecuteInput);
      groupGroupExecuteInputLabel.appendChild(groupGroupExecuteInputTitle);

      // Events
      self.groupGroupReadInput.addEventListener('change', function (event) {
        if (self.disableEventhandler) return;
        self.updateNumericInput();
      });

      self.groupGroupWriteInput.addEventListener('change', function (event) {
        if (self.disableEventhandler) return;
        self.updateNumericInput();
      });

      self.groupGroupExecuteInput.addEventListener('change', function (event) {
        if (self.disableEventhandler) return;
        self.updateNumericInput();
      });

      return groupGroup;
    }
  }, {
    key: 'createOtherFieldset',
    value: function createOtherFieldset() {
      var self = this;

      var otherGroup = document.createElement('div');
      otherGroup.classList.add('control-group');
      otherGroup.style.marginBottom = '20px';

      var otherGroupLabel = document.createElement('label');
      otherGroupLabel.classList.add('control-group-label');
      otherGroupLabel.textContent = 'Public permissions';
      otherGroup.appendChild(otherGroupLabel);

      var otherGroupControl = document.createElement('div');
      otherGroupControl.classList.add('controls');
      otherGroupControl.classList.add('other');
      otherGroupControl.classList.add('checkbox');
      otherGroup.appendChild(otherGroupControl);

      var otherGroupReadInputLabel = document.createElement('label');
      otherGroupReadInputLabel.classList.add('control');
      otherGroupControl.appendChild(otherGroupReadInputLabel);

      self.otherGroupReadInput = document.createElement('input');
      self.otherGroupReadInput.type = 'checkbox';
      self.otherGroupReadInput.checked = false;
      self.otherGroupReadInput.classList.add('input-checkbox');
      var otherGroupReadInputTitle = document.createElement('div');
      otherGroupReadInputTitle.classList.add('input-title');
      otherGroupReadInputTitle.textContent = 'Read';
      otherGroupReadInputLabel.appendChild(self.otherGroupReadInput);
      otherGroupReadInputLabel.appendChild(otherGroupReadInputTitle);

      var otherGroupWriteInputLabel = document.createElement('label');
      otherGroupWriteInputLabel.classList.add('control');
      otherGroupControl.appendChild(otherGroupWriteInputLabel);

      self.otherGroupWriteInput = document.createElement('input');
      self.otherGroupWriteInput.type = 'checkbox';
      self.otherGroupWriteInput.checked = false;
      self.otherGroupWriteInput.classList.add('input-checkbox');
      var otherGroupWriteInputTitle = document.createElement('div');
      otherGroupWriteInputTitle.classList.add('input-title');
      otherGroupWriteInputTitle.textContent = 'Write';
      otherGroupWriteInputLabel.appendChild(self.otherGroupWriteInput);
      otherGroupWriteInputLabel.appendChild(otherGroupWriteInputTitle);

      var otherGroupExecuteInputLabel = document.createElement('label');
      otherGroupExecuteInputLabel.classList.add('control');
      otherGroupControl.appendChild(otherGroupExecuteInputLabel);

      self.otherGroupExecuteInput = document.createElement('input');
      self.otherGroupExecuteInput.type = 'checkbox';
      self.otherGroupExecuteInput.checked = false;
      self.otherGroupExecuteInput.classList.add('input-checkbox');
      var otherGroupExecuteInputTitle = document.createElement('div');
      otherGroupExecuteInputTitle.classList.add('input-title');
      otherGroupExecuteInputTitle.textContent = 'Execute';
      otherGroupExecuteInputLabel.appendChild(self.otherGroupExecuteInput);
      otherGroupExecuteInputLabel.appendChild(otherGroupExecuteInputTitle);

      // Events
      self.otherGroupReadInput.addEventListener('change', function (event) {
        if (self.disableEventhandler) return;
        self.updateNumericInput();
      });

      self.otherGroupWriteInput.addEventListener('change', function (event) {
        if (self.disableEventhandler) return;
        self.updateNumericInput();
      });

      self.otherGroupExecuteInput.addEventListener('change', function (event) {
        if (self.disableEventhandler) return;
        self.updateNumericInput();
      });

      return otherGroup;
    }
  }, {
    key: 'enableFieldset',
    value: function enableFieldset(group) {
      var self = this;

      if (group == 'owner') {
        self.ownerGroupReadInput.removeAttribute("disabled");
        self.ownerGroupWriteInput.removeAttribute("disabled");
        self.ownerGroupExecuteInput.removeAttribute("disabled");
      }

      if (group == 'group') {
        self.groupGroupReadInput.removeAttribute("disabled");
        self.groupGroupWriteInput.removeAttribute("disabled");
        self.groupGroupExecuteInput.removeAttribute("disabled");
      }

      if (group == 'other') {
        self.otherGroupReadInput.removeAttribute("disabled");
        self.otherGroupWriteInput.removeAttribute("disabled");
        self.otherGroupExecuteInput.removeAttribute("disabled");
      }
    }
  }, {
    key: 'disableFieldset',
    value: function disableFieldset(group) {
      var self = this;

      if (group == 'owner') {
        self.ownerGroupReadInput.setAttribute("disabled", true);
        self.ownerGroupWriteInput.setAttribute("disabled", true);
        self.ownerGroupExecuteInput.setAttribute("disabled", true);
      }

      if (group == 'group') {
        self.groupGroupReadInput.setAttribute("disabled", true);
        self.groupGroupWriteInput.setAttribute("disabled", true);
        self.groupGroupExecuteInput.setAttribute("disabled", true);
      }

      if (group == 'other') {
        self.otherGroupReadInput.setAttribute("disabled", true);
        self.otherGroupWriteInput.setAttribute("disabled", true);
        self.otherGroupExecuteInput.setAttribute("disabled", true);
      }
    }
  }, {
    key: 'setCheckboxInputs',
    value: function setCheckboxInputs(rights) {
      var self = this;

      var user = rights.user.split('');
      var group = rights.group.split('');
      var other = rights.other.split('');

      self.ownerGroupReadInput.checked = false;
      self.ownerGroupWriteInput.checked = false;
      self.ownerGroupExecuteInput.checked = false;
      self.groupGroupReadInput.checked = false;
      self.groupGroupWriteInput.checked = false;
      self.groupGroupExecuteInput.checked = false;
      self.otherGroupReadInput.checked = false;
      self.otherGroupWriteInput.checked = false;
      self.otherGroupExecuteInput.checked = false;

      user.forEach(function (right) {
        if (right == 'r') self.ownerGroupReadInput.checked = true;
        if (right == 'w') self.ownerGroupWriteInput.checked = true;
        if (right == 'x') self.ownerGroupExecuteInput.checked = true;
      });

      group.forEach(function (right) {
        if (right == 'r') self.groupGroupReadInput.checked = true;
        if (right == 'w') self.groupGroupWriteInput.checked = true;
        if (right == 'x') self.groupGroupExecuteInput.checked = true;
      });

      other.forEach(function (right) {
        if (right == 'r') self.otherGroupReadInput.checked = true;
        if (right == 'w') self.otherGroupWriteInput.checked = true;
        if (right == 'x') self.otherGroupExecuteInput.checked = true;
      });
    }
  }, {
    key: 'setNumericInput',
    value: function setNumericInput(permissions) {
      var self = this;

      self.numericInput.getModel().setText(permissions);
    }
  }, {
    key: 'updateNumericInput',
    value: function updateNumericInput() {
      var self = this;

      var permissionsuser = 0;
      var permissionsgroup = 0;
      var permissionsother = 0;

      if (self.ownerGroupReadInput.checked == true) permissionsuser += 4;
      if (self.ownerGroupWriteInput.checked == true) permissionsuser += 2;
      if (self.ownerGroupExecuteInput.checked == true) permissionsuser += 1;

      if (self.groupGroupReadInput.checked == true) permissionsgroup += 4;
      if (self.groupGroupWriteInput.checked == true) permissionsgroup += 2;
      if (self.groupGroupExecuteInput.checked == true) permissionsgroup += 1;

      if (self.otherGroupReadInput.checked == true) permissionsother += 4;
      if (self.otherGroupWriteInput.checked == true) permissionsother += 2;
      if (self.otherGroupExecuteInput.checked == true) permissionsother += 1;

      var permissions = permissionsuser.toString() + permissionsgroup.toString() + permissionsother.toString();

      self.disableEventhandler = true;
      self.enableFieldset('owner');
      self.enableFieldset('group');
      self.enableFieldset('other');
      self.setNumericInput(permissions);
      self.validate();
      self.disableEventhandler = false;
    }
  }, {
    key: 'updateCheckboxInputs',
    value: function updateCheckboxInputs() {
      var self = this;

      var permissions = self.numericInput.getModel().getText();
      if (permissions.length != 0 && permissions.length != 3) return self.validate();
      var rights = (0, _helperHelperJs.permissionsToRights)(permissions);

      self.disableEventhandler = true;
      self.setCheckboxInputs(rights);
      if (permissions[0] == 'x') {
        self.disableFieldset('owner');
      } else {
        self.enableFieldset('owner');
      };
      if (permissions[1] == 'x') {
        self.disableFieldset('group');
      } else {
        self.enableFieldset('group');
      };
      if (permissions[2] == 'x') {
        self.disableFieldset('other');
      } else {
        self.enableFieldset('other');
      };
      self.validate();
      self.disableEventhandler = false;
    }
  }, {
    key: 'validate',
    value: function validate() {
      var self = this;

      var isvalid = true;
      var allowed = ['x', '0', '1', '2', '3', '4', '5', '6', '7'];
      var permissions = self.numericInput.getModel().getText();

      if (permissions.length != 3 || permissions == '000') isvalid = false;

      permissions.split('').forEach(function (value) {
        if (allowed.indexOf(value) == -1) {
          isvalid = false;
        }
      });

      if (isvalid) {
        self.saveButton.removeAttribute("disabled");
      } else {
        self.saveButton.setAttribute("disabled", true);
      }
    }
  }, {
    key: 'attach',
    value: function attach() {
      var self = this;

      if (!self.item) return;

      self.setCheckboxInputs(self.rights);
      self.setNumericInput((0, _helperHelperJs.rightsToPermissions)(self.rights));
      self.validate();

      this.panel = atom.workspace.addModalPanel({
        item: this
      });

      self.numericInput.focus();
      self.numericInput.getModel().scrollToCursorPosition();
    }
  }, {
    key: 'close',
    value: function close() {
      var destroyPanel = this.panel;
      this.panel = null;

      if (destroyPanel) {
        destroyPanel.destroy();
      }

      atom.workspace.getActivePane().activate();
    }
  }, {
    key: 'cancel',
    value: function cancel() {
      this.close();
    }
  }, {
    key: 'save',
    value: function save() {
      var self = this;

      var permissions = (0, _helperHelperJs.rightsToPermissions)((0, _helperHelperJs.permissionsToRights)(self.numericInput.getModel().getText()));

      this.trigger('change-permissions', {
        permissions: permissions,
        rights: (0, _helperHelperJs.permissionsToRights)(permissions)
      });
      self.close();
    }
  }], [{
    key: 'content',
    value: function content() {
      var _this = this;

      return this.div({
        'class': 'ftp-remote-edit permissions-view overlay from-top'
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
              outlet: 'elements'
            });
          });
        });
      });
    }
  }]);

  return PermissionsView;
})(_atomSpacePenViews.View);

exports['default'] = PermissionsView;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2FuYW5tYXlqYWluLy5hdG9tL3BhY2thZ2VzL2Z0cC1yZW1vdGUtZWRpdC9saWIvdmlld3MvcGVybWlzc2lvbnMtdmlldy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7aUNBRXdDLHNCQUFzQjs7OEJBQ0wsdUJBQXVCOztBQUhoRixXQUFXLENBQUM7O0lBS1MsZUFBZTtZQUFmLGVBQWU7O1dBQWYsZUFBZTswQkFBZixlQUFlOzsrQkFBZixlQUFlOzs7ZUFBZixlQUFlOztXQXlCeEIsb0JBQUMsSUFBSSxFQUFFO0FBQ2YsVUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDOztBQUVsQixVQUFJLENBQUMsSUFBSSxFQUFFLE9BQU87O0FBRWxCLFVBQUksQ0FBQyxtQkFBbUIsR0FBRyxLQUFLLENBQUM7QUFDakMsVUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7QUFDakIsVUFBSSxDQUFDLE1BQU0sR0FBRyxBQUFDLElBQUksQ0FBQyxNQUFNLEdBQUksSUFBSSxDQUFDLE1BQU0sR0FBRyxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFFLENBQUM7O0FBRS9FLFVBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsWUFBWSxDQUFDLEVBQUU7QUFDOUIsWUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7T0FDckIsTUFBTTtBQUNMLFlBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO09BQ3BCOztBQUVELFVBQUksSUFBSSxHQUFHLFlBQVksSUFBSSxBQUFDLElBQUksQ0FBQyxNQUFNLEdBQUksTUFBTSxHQUFHLFdBQVcsQ0FBQSxBQUFDLEdBQUcsaUJBQWlCLENBQUM7QUFDckYsVUFBSSxJQUFJLDhDQUE4QyxJQUFJLEFBQUMsSUFBSSxDQUFDLE1BQU0sR0FBSSxNQUFNLEdBQUcsV0FBVyxDQUFBLEFBQUMsR0FBRyxJQUFJLEdBQUcsSUFBSSxDQUFD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SSxDQUFDLG9CQUFvQixDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUM7QUFDMUMsVUFBSSxDQUFDLHNCQUFzQixDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUM7O0FBRTVDLFVBQUksQ0FBQyxPQUFPLENBQUMsVUFBQyxLQUFLLEVBQUs7QUFDdEIsWUFBSSxLQUFLLElBQUksR0FBRyxFQUFFLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO0FBQzFELFlBQUksS0FBSyxJQUFJLEdBQUcsRUFBRSxJQUFJLENBQUMsb0JBQW9CLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztBQUMzRCxZQUFJLEtBQUssSUFBSSxHQUFHLEVBQUUsSUFBSSxDQUFDLHNCQUFzQixDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7T0FDOUQsQ0FBQyxDQUFDOztBQUVILFdBQUssQ0FBQyxPQUFPLENBQUMsVUFBQyxLQUFLLEVBQUs7QUFDdkIsWUFBSSxLQUFLLElBQUksR0FBRyxFQUFFLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO0FBQzFELFlBQUksS0FBSyxJQUFJLEdBQUcsRUFBRSxJQUFJLENBQUMsb0JBQW9CLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztBQUMzRCxZQUFJLEtBQUssSUFBSSxHQUFHLEVBQUUsSUFBSSxDQUFDLHNCQUFzQixDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7T0FDOUQsQ0FBQyxDQUFDOztBQUVILFdBQUssQ0FBQyxPQUFPLENBQUMsVUFBQyxLQUFLLEVBQUs7QUFDdkIsWUFBSSxLQUFLLElBQUksR0FBRyxFQUFFLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO0FBQzFELFlBQUksS0FBSyxJQUFJLEdBQUcsRUFBRSxJQUFJLENBQUMsb0JBQW9CLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztBQUMzRCxZQUFJLEtBQUssSUFBSSxHQUFHLEVBQUUsSUFBSSxDQUFDLHNCQUFzQixDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7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SUFBSSxDQUFDOztBQUVsQixVQUFJLFdBQVcsR0FBRyx5Q0FBb0IseUNBQW9CLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxFQUFFLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDOztBQUVuRyxVQUFJLENBQUMsT0FBTyxDQUFDLG9CQUFvQixFQUFFO0FBQ2pDLG1CQUFXLEVBQUUsV0FBVztBQUN4QixjQUFNLEVBQUUseUNBQW9CLFdBQVcsQ0FBQztPQUN6QyxDQUFDLENBQUM7QUFDSCxVQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7S0FDZDs7O1dBNWpCYSxtQkFBRzs7O0FBQ2YsYUFBTyxJQUFJLENBQUMsR0FBRyxDQUFDO0FBQ2QsaUJBQU8sbURBQW1EO09BQzNELEVBQUUsWUFBTTtBQUNQLGNBQUssR0FBRyxDQUFDO0FBQ1AsbUJBQU8sUUFBUTtTQUNoQixFQUFFLFlBQU07QUFDUCxnQkFBSyxHQUFHLENBQUM7QUFDUCxxQkFBTyxhQUFhO1dBQ3JCLEVBQUUsWUFBTTtBQUNQLGtCQUFLLEtBQUssQ0FBQztBQUNULHVCQUFPLE1BQU07QUFDYixvQkFBTSxFQUFFLE1BQU07YUFDZixDQUFDLENBQUM7QUFDSCxrQkFBSyxHQUFHLENBQUM7QUFDUCx1QkFBTyxnQkFBZ0I7QUFDdkIsb0JBQU0sRUFBRSxVQUFVO2FBQ25CLENBQUMsQ0FBQztXQUNKLENBQUMsQ0FBQztTQUNKLENBQUMsQ0FBQztPQUNKLENBQUMsQ0FBQztLQUNKOzs7U0F2QmtCLGVBQWU7OztxQkFBZixlQUFlIiwiZmlsZSI6Ii9ob21lL2FuYW5tYXlqYWluLy5hdG9tL3BhY2thZ2VzL2Z0cC1yZW1vdGUtZWRpdC9saWIvdmlld3MvcGVybWlzc2lvbnMtdmlldy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG5pbXBvcnQgeyAkLCBWaWV3LCBUZXh0RWRpdG9yVmlldyB9IGZyb20gJ2F0b20tc3BhY2UtcGVuLXZpZXdzJztcbmltcG9ydCB7IHJpZ2h0c1RvUGVybWlzc2lvbnMsIHBlcm1pc3Npb25zVG9SaWdodHMgfSBmcm9tICcuLy4uL2hlbHBlci9oZWxwZXIuanMnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQZXJtaXNzaW9uc1ZpZXcgZXh0ZW5kcyBWaWV3IHtcblxuICBzdGF0aWMgY29udGVudCgpIHtcbiAgICByZXR1cm4gdGhpcy5kaXYoe1xuICAgICAgY2xhc3M6ICdmdHAtcmVtb3RlLWVkaXQgcGVybWlzc2lvbnMtdmlldyBvdmVybGF5IGZyb20tdG9wJyxcbiAgICB9LCAoKSA9PiB7XG4gICAgICB0aGlzLmRpdih7XG4gICAgICAgIGNsYXNzOiAncGFuZWxzJyxcbiAgICAgIH0sICgpID0+IHtcbiAgICAgICAgdGhpcy5kaXYoe1xuICAgICAgICAgIGNsYXNzOiAncGFuZWxzLWl0ZW0nLFxuICAgICAgICB9LCAoKSA9PiB7XG4gICAgICAgICAgdGhpcy5sYWJlbCh7XG4gICAgICAgICAgICBjbGFzczogJ2ljb24nLFxuICAgICAgICAgICAgb3V0bGV0OiAnaW5mbycsXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgdGhpcy5kaXYoe1xuICAgICAgICAgICAgY2xhc3M6ICdwYW5lbHMtY29udGVudCcsXG4gICAgICAgICAgICBvdXRsZXQ6ICdlbGVtZW50cycsXG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICBpbml0aWFsaXplKGl0ZW0pIHtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcblxuICAgIGlmICghaXRlbSkgcmV0dXJuO1xuXG4gICAgc2VsZi5kaXNhYmxlRXZlbnRoYW5kbGVyID0gZmFsc2U7XG4gICAgc2VsZi5pdGVtID0gaXRlbTtcbiAgICBzZWxmLnJpZ2h0cyA9IChpdGVtLnJpZ2h0cykgPyBpdGVtLnJpZ2h0cyA6IHsgdXNlcjogJycsIGdyb3VwOiAnJywgb3RoZXI6ICcnIH07XG5cbiAgICBpZiAoc2VsZi5pdGVtLmlzKCcuZGlyZWN0b3J5JykpIHtcbiAgICAgIHNlbGYuaXNGaWxlID0gZmFsc2U7XG4gICAgfSBlbHNlIHtcbiAgICAgIHNlbGYuaXNGaWxlID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBsZXQgaHRtbCA9ICc8cD5DaGFuZ2UgJyArICgoc2VsZi5pc0ZpbGUpID8gJ2ZpbGUnIDogJ2RpcmVjdG9yeScpICsgJyBhdHRyaWJ1dGVzPC9wPic7XG4gICAgaHRtbCArPSAnPHA+UGxlYXNlIHNlbGVjdCB0aGUgbmV3IGF0dHJpYnV0ZXMgZm9yIHRoZSAnICsgKChzZWxmLmlzRmlsZSkgPyAnZmlsZScgOiAnZGlyZWN0b3J5JykgKyAnIFwiJyArIHNlbGYuaXRlbS5uYW1lICsgJ1wiLjwvcD4nO1xuICAgIHNlbGYuaW5mby5odG1sKGh0bWwpO1xuXG4gICAgc2VsZi5zYXZlQnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XG4gICAgc2VsZi5zYXZlQnV0dG9uLnRleHRDb250ZW50ID0gJ1NhdmUnO1xuICAgIHNlbGYuc2F2ZUJ1dHRvbi5jbGFzc0xpc3QuYWRkKCdidG4nKTtcblxuICAgIHNlbGYuY2xvc2VCdXR0b24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKTtcbiAgICBzZWxmLmNsb3NlQnV0dG9uLnRleHRDb250ZW50ID0gJ0NhbmNlbCc7XG4gICAgc2VsZi5jbG9zZUJ1dHRvbi5jbGFzc0xpc3QuYWRkKCdidG4nKTtcbiAgICBzZWxmLmNsb3NlQnV0dG9uLmNsYXNzTGlzdC5hZGQoJ3B1bGwtcmlnaHQnKTtcblxuICAgIHNlbGYuZWxlbWVudHMuYXBwZW5kKHNlbGYuY3JlYXRlUGFuZWxDb250ZW50KCkpO1xuXG4gICAgc2VsZi5lbGVtZW50cy5hcHBlbmQoc2VsZi5zYXZlQnV0dG9uKTtcbiAgICBzZWxmLmVsZW1lbnRzLmFwcGVuZChzZWxmLmNsb3NlQnV0dG9uKTtcblxuICAgIC8vIEV2ZW50c1xuICAgIHNlbGYuY2xvc2VCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZXZlbnQpID0+IHtcbiAgICAgIHNlbGYuY2xvc2UoKTtcbiAgICB9KTtcblxuICAgIHNlbGYuc2F2ZUJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChldmVudCkgPT4ge1xuICAgICAgc2VsZi5zYXZlKCk7XG4gICAgfSk7XG5cbiAgICBhdG9tLmNvbW1hbmRzLmFkZCh0aGlzLmVsZW1lbnQsIHtcbiAgICAgICdjb3JlOmNvbmZpcm0nOiAoKSA9PiB7XG4gICAgICAgIC8vIHNlbGYuc2F2ZSgpO1xuICAgICAgfSxcbiAgICAgICdjb3JlOmNhbmNlbCc6ICgpID0+IHtcbiAgICAgICAgc2VsZi5jYW5jZWwoKTtcbiAgICAgIH0sXG4gICAgfSk7XG4gIH1cblxuICBjcmVhdGVQYW5lbENvbnRlbnQoKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG5cbiAgICBsZXQgY29udGVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuXG4gICAgY29udGVudC5hcHBlbmRDaGlsZChzZWxmLmNyZWF0ZU93bmVyRmllbGRzZXQoKSk7XG4gICAgY29udGVudC5hcHBlbmRDaGlsZChzZWxmLmNyZWF0ZUdyb3VwRmllbGRzZXQoKSk7XG4gICAgY29udGVudC5hcHBlbmRDaGlsZChzZWxmLmNyZWF0ZU90aGVyRmllbGRzZXQoKSk7XG5cbiAgICBsZXQgbnVtZXJpY0dyb3VwID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgbnVtZXJpY0dyb3VwLmNsYXNzTGlzdC5hZGQoJ2NvbnRyb2wtZ3JvdXAnKTtcbiAgICBudW1lcmljR3JvdXAuc3R5bGUubWFyZ2luQm90dG9tID0gJzIwcHgnO1xuXG4gICAgbGV0IG51bWVyaWNHcm91cENvbnRyb2xzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgbnVtZXJpY0dyb3VwQ29udHJvbHMuY2xhc3NMaXN0LmFkZCgnY29udHJvbHMnKTtcbiAgICBudW1lcmljR3JvdXAuYXBwZW5kQ2hpbGQobnVtZXJpY0dyb3VwQ29udHJvbHMpO1xuXG4gICAgbGV0IG51bWVyaWNMYWJlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xhYmVsJyk7XG4gICAgbnVtZXJpY0xhYmVsLmNsYXNzTGlzdC5hZGQoJ2NvbnRyb2wtbGFiZWwnKTtcbiAgICBsZXQgbnVtZXJpY0xhYmVsVGl0bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBudW1lcmljTGFiZWxUaXRsZS50ZXh0Q29udGVudCA9IGBOdW1lcmljIHZhbHVlYDtcbiAgICBudW1lcmljTGFiZWxUaXRsZS5jbGFzc0xpc3QuYWRkKCdzZXR0aW5nLXRpdGxlJyk7XG4gICAgbnVtZXJpY0xhYmVsLmFwcGVuZENoaWxkKG51bWVyaWNMYWJlbFRpdGxlKTtcbiAgICBudW1lcmljR3JvdXAuYXBwZW5kQ2hpbGQobnVtZXJpY0xhYmVsKTtcblxuICAgIHNlbGYubnVtZXJpY0lucHV0ID0gbmV3IFRleHRFZGl0b3JWaWV3KHsgbWluaTogdHJ1ZSB9KVxuICAgIG51bWVyaWNHcm91cC5hcHBlbmRDaGlsZChzZWxmLm51bWVyaWNJbnB1dC5lbGVtZW50KTtcblxuICAgIGxldCBpbmZvTGFiZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdwJyk7XG4gICAgaW5mb0xhYmVsLnRleHRDb250ZW50ID0gJ1lvdSBjYW4gdXNlIGFuIHggYXQgYW55IHBvc2l0aW9uIHRvIGtlZXAgdGhlIHBlcm1pc3Npb24gdGhlIG9yaWdpbmFsICcgKyAoKHNlbGYuaXNGaWxlKSA/ICdmaWxlJyA6ICdkaXJlY3RvcnknKSArICcgaGF2ZS4nO1xuICAgIG51bWVyaWNHcm91cC5hcHBlbmRDaGlsZChpbmZvTGFiZWwpO1xuXG4gICAgY29udGVudC5hcHBlbmRDaGlsZChudW1lcmljR3JvdXApO1xuXG4gICAgLy8gRXZlbnRzXG4gICAgc2VsZi5udW1lcmljSW5wdXQuZ2V0TW9kZWwoKS5idWZmZXIub25EaWRDaGFuZ2UoKG9iaikgPT4ge1xuICAgICAgbGV0IGFsbG93ZWQgPSBbJ3gnLCAnMCcsICcxJywgJzInLCAnMycsICc0JywgJzUnLCAnNicsICc3J107XG5cbiAgICAgIGlmIChzZWxmLmRpc2FibGVFdmVudGhhbmRsZXIpIHJldHVybjtcblxuICAgICAgaWYgKG9iai5uZXdSYW5nZS5lbmQuY29sdW1uIDwgb2JqLm9sZFJhbmdlLmVuZC5jb2x1bW4pIHtcbiAgICAgICAgc2VsZi51cGRhdGVDaGVja2JveElucHV0cygpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmIChvYmoubmV3UmFuZ2UuZW5kLmNvbHVtbiA+IDMpIHtcbiAgICAgICAgc2VsZi5udW1lcmljSW5wdXQuZ2V0TW9kZWwoKS5idWZmZXIuc2V0VGV4dEluUmFuZ2Uob2JqLm5ld1JhbmdlLCAnJyk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgb2JqLmNoYW5nZXMuZm9yRWFjaCgoY2hhbmdlKSA9PiB7XG4gICAgICAgIGNoYW5nZS5uZXdUZXh0LnNwbGl0KCcnKS5mb3JFYWNoKCh2YWx1ZSkgPT4ge1xuICAgICAgICAgIGlmIChhbGxvd2VkLmluZGV4T2YodmFsdWUpID09IC0xKSB7XG4gICAgICAgICAgICBzZWxmLm51bWVyaWNJbnB1dC5nZXRNb2RlbCgpLmJ1ZmZlci5zZXRUZXh0SW5SYW5nZShvYmoubmV3UmFuZ2UsICcnKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG5cbiAgICAgIHNlbGYudXBkYXRlQ2hlY2tib3hJbnB1dHMoKTtcbiAgICB9KTtcblxuICAgIHJldHVybiBjb250ZW50O1xuICB9XG5cbiAgY3JlYXRlT3duZXJGaWVsZHNldCgpIHtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcblxuICAgIGxldCBvd25lckdyb3VwID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgb3duZXJHcm91cC5jbGFzc0xpc3QuYWRkKCdjb250cm9sLWdyb3VwJyk7XG4gICAgb3duZXJHcm91cC5zdHlsZS5tYXJnaW5Cb3R0b20gPSAnMjBweCc7XG5cbiAgICBsZXQgb3duZXJHcm91cExhYmVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGFiZWwnKTtcbiAgICBvd25lckdyb3VwTGFiZWwuY2xhc3NMaXN0LmFkZCgnY29udHJvbC1ncm91cC1sYWJlbCcpO1xuICAgIG93bmVyR3JvdXBMYWJlbC50ZXh0Q29udGVudCA9ICdPd25lciBwZXJtaXNzaW9ucyc7XG4gICAgb3duZXJHcm91cC5hcHBlbmRDaGlsZChvd25lckdyb3VwTGFiZWwpO1xuXG4gICAgbGV0IG93bmVyR3JvdXBDb250cm9sID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgb3duZXJHcm91cENvbnRyb2wuY2xhc3NMaXN0LmFkZCgnY29udHJvbHMnKTtcbiAgICBvd25lckdyb3VwQ29udHJvbC5jbGFzc0xpc3QuYWRkKCdvd25lcicpO1xuICAgIG93bmVyR3JvdXBDb250cm9sLmNsYXNzTGlzdC5hZGQoJ2NoZWNrYm94Jyk7XG4gICAgb3duZXJHcm91cC5hcHBlbmRDaGlsZChvd25lckdyb3VwQ29udHJvbCk7XG5cbiAgICBsZXQgb3duZXJHcm91cFJlYWRJbnB1dExhYmVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGFiZWwnKTtcbiAgICBvd25lckdyb3VwUmVhZElucHV0TGFiZWwuY2xhc3NMaXN0LmFkZCgnY29udHJvbCcpO1xuICAgIG93bmVyR3JvdXBDb250cm9sLmFwcGVuZENoaWxkKG93bmVyR3JvdXBSZWFkSW5wdXRMYWJlbCk7XG5cbiAgICBzZWxmLm93bmVyR3JvdXBSZWFkSW5wdXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbnB1dCcpO1xuICAgIHNlbGYub3duZXJHcm91cFJlYWRJbnB1dC50eXBlID0gJ2NoZWNrYm94JztcbiAgICBzZWxmLm93bmVyR3JvdXBSZWFkSW5wdXQuY2hlY2tlZCA9IGZhbHNlO1xuICAgIHNlbGYub3duZXJHcm91cFJlYWRJbnB1dC5jbGFzc0xpc3QuYWRkKCdpbnB1dC1jaGVja2JveCcpO1xuICAgIGxldCBvd25lckdyb3VwUmVhZElucHV0VGl0bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBvd25lckdyb3VwUmVhZElucHV0VGl0bGUuY2xhc3NMaXN0LmFkZCgnaW5wdXQtdGl0bGUnKVxuICAgIG93bmVyR3JvdXBSZWFkSW5wdXRUaXRsZS50ZXh0Q29udGVudCA9ICdSZWFkJztcbiAgICBvd25lckdyb3VwUmVhZElucHV0TGFiZWwuYXBwZW5kQ2hpbGQoc2VsZi5vd25lckdyb3VwUmVhZElucHV0KTtcbiAgICBvd25lckdyb3VwUmVhZElucHV0TGFiZWwuYXBwZW5kQ2hpbGQob3duZXJHcm91cFJlYWRJbnB1dFRpdGxlKTtcblxuICAgIGxldCBvd25lckdyb3VwV3JpdGVJbnB1dExhYmVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGFiZWwnKTtcbiAgICBvd25lckdyb3VwV3JpdGVJbnB1dExhYmVsLmNsYXNzTGlzdC5hZGQoJ2NvbnRyb2wnKTtcbiAgICBvd25lckdyb3VwQ29udHJvbC5hcHBlbmRDaGlsZChvd25lckdyb3VwV3JpdGVJbnB1dExhYmVsKTtcblxuICAgIHNlbGYub3duZXJHcm91cFdyaXRlSW5wdXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbnB1dCcpO1xuICAgIHNlbGYub3duZXJHcm91cFdyaXRlSW5wdXQudHlwZSA9ICdjaGVja2JveCc7XG4gICAgc2VsZi5vd25lckdyb3VwV3JpdGVJbnB1dC5jaGVja2VkID0gZmFsc2U7XG4gICAgc2VsZi5vd25lckdyb3VwV3JpdGVJbnB1dC5jbGFzc0xpc3QuYWRkKCdpbnB1dC1jaGVja2JveCcpO1xuICAgIGxldCBvd25lckdyb3VwV3JpdGVJbnB1dFRpdGxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgb3duZXJHcm91cFdyaXRlSW5wdXRUaXRsZS5jbGFzc0xpc3QuYWRkKCdpbnB1dC10aXRsZScpXG4gICAgb3duZXJHcm91cFdyaXRlSW5wdXRUaXRsZS50ZXh0Q29udGVudCA9ICdXcml0ZSc7XG4gICAgb3duZXJHcm91cFdyaXRlSW5wdXRMYWJlbC5hcHBlbmRDaGlsZChzZWxmLm93bmVyR3JvdXBXcml0ZUlucHV0KTtcbiAgICBvd25lckdyb3VwV3JpdGVJbnB1dExhYmVsLmFwcGVuZENoaWxkKG93bmVyR3JvdXBXcml0ZUlucHV0VGl0bGUpO1xuXG4gICAgbGV0IG93bmVyR3JvdXBFeGVjdXRlSW5wdXRMYWJlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xhYmVsJyk7XG4gICAgb3duZXJHcm91cEV4ZWN1dGVJbnB1dExhYmVsLmNsYXNzTGlzdC5hZGQoJ2NvbnRyb2wnKTtcbiAgICBvd25lckdyb3VwQ29udHJvbC5hcHBlbmRDaGlsZChvd25lckdyb3VwRXhlY3V0ZUlucHV0TGFiZWwpO1xuXG4gICAgc2VsZi5vd25lckdyb3VwRXhlY3V0ZUlucHV0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW5wdXQnKTtcbiAgICBzZWxmLm93bmVyR3JvdXBFeGVjdXRlSW5wdXQudHlwZSA9ICdjaGVja2JveCc7XG4gICAgc2VsZi5vd25lckdyb3VwRXhlY3V0ZUlucHV0LmNoZWNrZWQgPSBmYWxzZTtcbiAgICBzZWxmLm93bmVyR3JvdXBFeGVjdXRlSW5wdXQuY2xhc3NMaXN0LmFkZCgnaW5wdXQtY2hlY2tib3gnKTtcbiAgICBsZXQgb3duZXJHcm91cEV4ZWN1dGVJbnB1dFRpdGxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgb3duZXJHcm91cEV4ZWN1dGVJbnB1dFRpdGxlLmNsYXNzTGlzdC5hZGQoJ2lucHV0LXRpdGxlJylcbiAgICBvd25lckdyb3VwRXhlY3V0ZUlucHV0VGl0bGUudGV4dENvbnRlbnQgPSAnRXhlY3V0ZSc7XG4gICAgb3duZXJHcm91cEV4ZWN1dGVJbnB1dExhYmVsLmFwcGVuZENoaWxkKHNlbGYub3duZXJHcm91cEV4ZWN1dGVJbnB1dCk7XG4gICAgb3duZXJHcm91cEV4ZWN1dGVJbnB1dExhYmVsLmFwcGVuZENoaWxkKG93bmVyR3JvdXBFeGVjdXRlSW5wdXRUaXRsZSk7XG5cbiAgICAvLyBFdmVudHNcbiAgICBzZWxmLm93bmVyR3JvdXBSZWFkSW5wdXQuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgKGV2ZW50KSA9PiB7XG4gICAgICBpZiAoc2VsZi5kaXNhYmxlRXZlbnRoYW5kbGVyKSByZXR1cm47XG4gICAgICBzZWxmLnVwZGF0ZU51bWVyaWNJbnB1dCgpO1xuICAgIH0pO1xuXG4gICAgc2VsZi5vd25lckdyb3VwV3JpdGVJbnB1dC5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCAoZXZlbnQpID0+IHtcbiAgICAgIGlmIChzZWxmLmRpc2FibGVFdmVudGhhbmRsZXIpIHJldHVybjtcbiAgICAgIHNlbGYudXBkYXRlTnVtZXJpY0lucHV0KCk7XG4gICAgfSk7XG5cbiAgICBzZWxmLm93bmVyR3JvdXBFeGVjdXRlSW5wdXQuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgKGV2ZW50KSA9PiB7XG4gICAgICBpZiAoc2VsZi5kaXNhYmxlRXZlbnRoYW5kbGVyKSByZXR1cm47XG4gICAgICBzZWxmLnVwZGF0ZU51bWVyaWNJbnB1dCgpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIG93bmVyR3JvdXA7XG4gIH1cblxuICBjcmVhdGVHcm91cEZpZWxkc2V0KCkge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuXG4gICAgbGV0IGdyb3VwR3JvdXAgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBncm91cEdyb3VwLmNsYXNzTGlzdC5hZGQoJ2NvbnRyb2wtZ3JvdXAnKTtcbiAgICBncm91cEdyb3VwLnN0eWxlLm1hcmdpbkJvdHRvbSA9ICcyMHB4JztcblxuICAgIGxldCBncm91cEdyb3VwTGFiZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsYWJlbCcpO1xuICAgIGdyb3VwR3JvdXBMYWJlbC5jbGFzc0xpc3QuYWRkKCdjb250cm9sLWdyb3VwLWxhYmVsJyk7XG4gICAgZ3JvdXBHcm91cExhYmVsLnRleHRDb250ZW50ID0gJ0dyb3VwIHBlcm1pc3Npb25zJztcbiAgICBncm91cEdyb3VwLmFwcGVuZENoaWxkKGdyb3VwR3JvdXBMYWJlbCk7XG5cbiAgICBsZXQgZ3JvdXBHcm91cENvbnRyb2wgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBncm91cEdyb3VwQ29udHJvbC5jbGFzc0xpc3QuYWRkKCdjb250cm9scycpO1xuICAgIGdyb3VwR3JvdXBDb250cm9sLmNsYXNzTGlzdC5hZGQoJ2dyb3VwJyk7XG4gICAgZ3JvdXBHcm91cENvbnRyb2wuY2xhc3NMaXN0LmFkZCgnY2hlY2tib3gnKTtcbiAgICBncm91cEdyb3VwLmFwcGVuZENoaWxkKGdyb3VwR3JvdXBDb250cm9sKTtcblxuICAgIGxldCBncm91cEdyb3VwUmVhZElucHV0TGFiZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsYWJlbCcpO1xuICAgIGdyb3VwR3JvdXBSZWFkSW5wdXRMYWJlbC5jbGFzc0xpc3QuYWRkKCdjb250cm9sJyk7XG4gICAgZ3JvdXBHcm91cENvbnRyb2wuYXBwZW5kQ2hpbGQoZ3JvdXBHcm91cFJlYWRJbnB1dExhYmVsKTtcblxuICAgIHNlbGYuZ3JvdXBHcm91cFJlYWRJbnB1dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lucHV0Jyk7XG4gICAgc2VsZi5ncm91cEdyb3VwUmVhZElucHV0LnR5cGUgPSAnY2hlY2tib3gnO1xuICAgIHNlbGYuZ3JvdXBHcm91cFJlYWRJbnB1dC5jaGVja2VkID0gZmFsc2U7XG4gICAgc2VsZi5ncm91cEdyb3VwUmVhZElucHV0LmNsYXNzTGlzdC5hZGQoJ2lucHV0LWNoZWNrYm94Jyk7XG4gICAgbGV0IGdyb3VwR3JvdXBSZWFkSW5wdXRUaXRsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGdyb3VwR3JvdXBSZWFkSW5wdXRUaXRsZS5jbGFzc0xpc3QuYWRkKCdpbnB1dC10aXRsZScpXG4gICAgZ3JvdXBHcm91cFJlYWRJbnB1dFRpdGxlLnRleHRDb250ZW50ID0gJ1JlYWQnO1xuICAgIGdyb3VwR3JvdXBSZWFkSW5wdXRMYWJlbC5hcHBlbmRDaGlsZChzZWxmLmdyb3VwR3JvdXBSZWFkSW5wdXQpO1xuICAgIGdyb3VwR3JvdXBSZWFkSW5wdXRMYWJlbC5hcHBlbmRDaGlsZChncm91cEdyb3VwUmVhZElucHV0VGl0bGUpO1xuXG4gICAgbGV0IGdyb3VwR3JvdXBXcml0ZUlucHV0TGFiZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsYWJlbCcpO1xuICAgIGdyb3VwR3JvdXBXcml0ZUlucHV0TGFiZWwuY2xhc3NMaXN0LmFkZCgnY29udHJvbCcpO1xuICAgIGdyb3VwR3JvdXBDb250cm9sLmFwcGVuZENoaWxkKGdyb3VwR3JvdXBXcml0ZUlucHV0TGFiZWwpO1xuXG4gICAgc2VsZi5ncm91cEdyb3VwV3JpdGVJbnB1dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lucHV0Jyk7XG4gICAgc2VsZi5ncm91cEdyb3VwV3JpdGVJbnB1dC50eXBlID0gJ2NoZWNrYm94JztcbiAgICBzZWxmLmdyb3VwR3JvdXBXcml0ZUlucHV0LmNoZWNrZWQgPSBmYWxzZTtcbiAgICBzZWxmLmdyb3VwR3JvdXBXcml0ZUlucHV0LmNsYXNzTGlzdC5hZGQoJ2lucHV0LWNoZWNrYm94Jyk7XG4gICAgbGV0IGdyb3VwR3JvdXBXcml0ZUlucHV0VGl0bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBncm91cEdyb3VwV3JpdGVJbnB1dFRpdGxlLmNsYXNzTGlzdC5hZGQoJ2lucHV0LXRpdGxlJylcbiAgICBncm91cEdyb3VwV3JpdGVJbnB1dFRpdGxlLnRleHRDb250ZW50ID0gJ1dyaXRlJztcbiAgICBncm91cEdyb3VwV3JpdGVJbnB1dExhYmVsLmFwcGVuZENoaWxkKHNlbGYuZ3JvdXBHcm91cFdyaXRlSW5wdXQpO1xuICAgIGdyb3VwR3JvdXBXcml0ZUlucHV0TGFiZWwuYXBwZW5kQ2hpbGQoZ3JvdXBHcm91cFdyaXRlSW5wdXRUaXRsZSk7XG5cbiAgICBsZXQgZ3JvdXBHcm91cEV4ZWN1dGVJbnB1dExhYmVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGFiZWwnKTtcbiAgICBncm91cEdyb3VwRXhlY3V0ZUlucHV0TGFiZWwuY2xhc3NMaXN0LmFkZCgnY29udHJvbCcpO1xuICAgIGdyb3VwR3JvdXBDb250cm9sLmFwcGVuZENoaWxkKGdyb3VwR3JvdXBFeGVjdXRlSW5wdXRMYWJlbCk7XG5cbiAgICBzZWxmLmdyb3VwR3JvdXBFeGVjdXRlSW5wdXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbnB1dCcpO1xuICAgIHNlbGYuZ3JvdXBHcm91cEV4ZWN1dGVJbnB1dC50eXBlID0gJ2NoZWNrYm94JztcbiAgICBzZWxmLmdyb3VwR3JvdXBFeGVjdXRlSW5wdXQuY2hlY2tlZCA9IGZhbHNlO1xuICAgIHNlbGYuZ3JvdXBHcm91cEV4ZWN1dGVJbnB1dC5jbGFzc0xpc3QuYWRkKCdpbnB1dC1jaGVja2JveCcpO1xuICAgIGxldCBncm91cEdyb3VwRXhlY3V0ZUlucHV0VGl0bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBncm91cEdyb3VwRXhlY3V0ZUlucHV0VGl0bGUuY2xhc3NMaXN0LmFkZCgnaW5wdXQtdGl0bGUnKVxuICAgIGdyb3VwR3JvdXBFeGVjdXRlSW5wdXRUaXRsZS50ZXh0Q29udGVudCA9ICdFeGVjdXRlJztcbiAgICBncm91cEdyb3VwRXhlY3V0ZUlucHV0TGFiZWwuYXBwZW5kQ2hpbGQoc2VsZi5ncm91cEdyb3VwRXhlY3V0ZUlucHV0KTtcbiAgICBncm91cEdyb3VwRXhlY3V0ZUlucHV0TGFiZWwuYXBwZW5kQ2hpbGQoZ3JvdXBHcm91cEV4ZWN1dGVJbnB1dFRpdGxlKTtcblxuICAgIC8vIEV2ZW50c1xuICAgIHNlbGYuZ3JvdXBHcm91cFJlYWRJbnB1dC5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCAoZXZlbnQpID0+IHtcbiAgICAgIGlmIChzZWxmLmRpc2FibGVFdmVudGhhbmRsZXIpIHJldHVybjtcbiAgICAgIHNlbGYudXBkYXRlTnVtZXJpY0lucHV0KCk7XG4gICAgfSk7XG5cbiAgICBzZWxmLmdyb3VwR3JvdXBXcml0ZUlucHV0LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIChldmVudCkgPT4ge1xuICAgICAgaWYgKHNlbGYuZGlzYWJsZUV2ZW50aGFuZGxlcikgcmV0dXJuO1xuICAgICAgc2VsZi51cGRhdGVOdW1lcmljSW5wdXQoKTtcbiAgICB9KTtcblxuICAgIHNlbGYuZ3JvdXBHcm91cEV4ZWN1dGVJbnB1dC5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCAoZXZlbnQpID0+IHtcbiAgICAgIGlmIChzZWxmLmRpc2FibGVFdmVudGhhbmRsZXIpIHJldHVybjtcbiAgICAgIHNlbGYudXBkYXRlTnVtZXJpY0lucHV0KCk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gZ3JvdXBHcm91cDtcbiAgfVxuXG4gIGNyZWF0ZU90aGVyRmllbGRzZXQoKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG5cbiAgICBsZXQgb3RoZXJHcm91cCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIG90aGVyR3JvdXAuY2xhc3NMaXN0LmFkZCgnY29udHJvbC1ncm91cCcpO1xuICAgIG90aGVyR3JvdXAuc3R5bGUubWFyZ2luQm90dG9tID0gJzIwcHgnO1xuXG4gICAgbGV0IG90aGVyR3JvdXBMYWJlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xhYmVsJyk7XG4gICAgb3RoZXJHcm91cExhYmVsLmNsYXNzTGlzdC5hZGQoJ2NvbnRyb2wtZ3JvdXAtbGFiZWwnKTtcbiAgICBvdGhlckdyb3VwTGFiZWwudGV4dENvbnRlbnQgPSAnUHVibGljIHBlcm1pc3Npb25zJztcbiAgICBvdGhlckdyb3VwLmFwcGVuZENoaWxkKG90aGVyR3JvdXBMYWJlbCk7XG5cbiAgICBsZXQgb3RoZXJHcm91cENvbnRyb2wgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBvdGhlckdyb3VwQ29udHJvbC5jbGFzc0xpc3QuYWRkKCdjb250cm9scycpO1xuICAgIG90aGVyR3JvdXBDb250cm9sLmNsYXNzTGlzdC5hZGQoJ290aGVyJyk7XG4gICAgb3RoZXJHcm91cENvbnRyb2wuY2xhc3NMaXN0LmFkZCgnY2hlY2tib3gnKTtcbiAgICBvdGhlckdyb3VwLmFwcGVuZENoaWxkKG90aGVyR3JvdXBDb250cm9sKTtcblxuICAgIGxldCBvdGhlckdyb3VwUmVhZElucHV0TGFiZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsYWJlbCcpO1xuICAgIG90aGVyR3JvdXBSZWFkSW5wdXRMYWJlbC5jbGFzc0xpc3QuYWRkKCdjb250cm9sJyk7XG4gICAgb3RoZXJHcm91cENvbnRyb2wuYXBwZW5kQ2hpbGQob3RoZXJHcm91cFJlYWRJbnB1dExhYmVsKTtcblxuICAgIHNlbGYub3RoZXJHcm91cFJlYWRJbnB1dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lucHV0Jyk7XG4gICAgc2VsZi5vdGhlckdyb3VwUmVhZElucHV0LnR5cGUgPSAnY2hlY2tib3gnO1xuICAgIHNlbGYub3RoZXJHcm91cFJlYWRJbnB1dC5jaGVja2VkID0gZmFsc2U7XG4gICAgc2VsZi5vdGhlckdyb3VwUmVhZElucHV0LmNsYXNzTGlzdC5hZGQoJ2lucHV0LWNoZWNrYm94Jyk7XG4gICAgbGV0IG90aGVyR3JvdXBSZWFkSW5wdXRUaXRsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIG90aGVyR3JvdXBSZWFkSW5wdXRUaXRsZS5jbGFzc0xpc3QuYWRkKCdpbnB1dC10aXRsZScpXG4gICAgb3RoZXJHcm91cFJlYWRJbnB1dFRpdGxlLnRleHRDb250ZW50ID0gJ1JlYWQnO1xuICAgIG90aGVyR3JvdXBSZWFkSW5wdXRMYWJlbC5hcHBlbmRDaGlsZChzZWxmLm90aGVyR3JvdXBSZWFkSW5wdXQpO1xuICAgIG90aGVyR3JvdXBSZWFkSW5wdXRMYWJlbC5hcHBlbmRDaGlsZChvdGhlckdyb3VwUmVhZElucHV0VGl0bGUpO1xuXG4gICAgbGV0IG90aGVyR3JvdXBXcml0ZUlucHV0TGFiZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsYWJlbCcpO1xuICAgIG90aGVyR3JvdXBXcml0ZUlucHV0TGFiZWwuY2xhc3NMaXN0LmFkZCgnY29udHJvbCcpO1xuICAgIG90aGVyR3JvdXBDb250cm9sLmFwcGVuZENoaWxkKG90aGVyR3JvdXBXcml0ZUlucHV0TGFiZWwpO1xuXG4gICAgc2VsZi5vdGhlckdyb3VwV3JpdGVJbnB1dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lucHV0Jyk7XG4gICAgc2VsZi5vdGhlckdyb3VwV3JpdGVJbnB1dC50eXBlID0gJ2NoZWNrYm94JztcbiAgICBzZWxmLm90aGVyR3JvdXBXcml0ZUlucHV0LmNoZWNrZWQgPSBmYWxzZTtcbiAgICBzZWxmLm90aGVyR3JvdXBXcml0ZUlucHV0LmNsYXNzTGlzdC5hZGQoJ2lucHV0LWNoZWNrYm94Jyk7XG4gICAgbGV0IG90aGVyR3JvdXBXcml0ZUlucHV0VGl0bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBvdGhlckdyb3VwV3JpdGVJbnB1dFRpdGxlLmNsYXNzTGlzdC5hZGQoJ2lucHV0LXRpdGxlJylcbiAgICBvdGhlckdyb3VwV3JpdGVJbnB1dFRpdGxlLnRleHRDb250ZW50ID0gJ1dyaXRlJztcbiAgICBvdGhlckdyb3VwV3JpdGVJbnB1dExhYmVsLmFwcGVuZENoaWxkKHNlbGYub3RoZXJHcm91cFdyaXRlSW5wdXQpO1xuICAgIG90aGVyR3JvdXBXcml0ZUlucHV0TGFiZWwuYXBwZW5kQ2hpbGQob3RoZXJHcm91cFdyaXRlSW5wdXRUaXRsZSk7XG5cbiAgICBsZXQgb3RoZXJHcm91cEV4ZWN1dGVJbnB1dExhYmVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGFiZWwnKTtcbiAgICBvdGhlckdyb3VwRXhlY3V0ZUlucHV0TGFiZWwuY2xhc3NMaXN0LmFkZCgnY29udHJvbCcpO1xuICAgIG90aGVyR3JvdXBDb250cm9sLmFwcGVuZENoaWxkKG90aGVyR3JvdXBFeGVjdXRlSW5wdXRMYWJlbCk7XG5cbiAgICBzZWxmLm90aGVyR3JvdXBFeGVjdXRlSW5wdXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbnB1dCcpO1xuICAgIHNlbGYub3RoZXJHcm91cEV4ZWN1dGVJbnB1dC50eXBlID0gJ2NoZWNrYm94JztcbiAgICBzZWxmLm90aGVyR3JvdXBFeGVjdXRlSW5wdXQuY2hlY2tlZCA9IGZhbHNlO1xuICAgIHNlbGYub3RoZXJHcm91cEV4ZWN1dGVJbnB1dC5jbGFzc0xpc3QuYWRkKCdpbnB1dC1jaGVja2JveCcpO1xuICAgIGxldCBvdGhlckdyb3VwRXhlY3V0ZUlucHV0VGl0bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBvdGhlckdyb3VwRXhlY3V0ZUlucHV0VGl0bGUuY2xhc3NMaXN0LmFkZCgnaW5wdXQtdGl0bGUnKVxuICAgIG90aGVyR3JvdXBFeGVjdXRlSW5wdXRUaXRsZS50ZXh0Q29udGVudCA9ICdFeGVjdXRlJztcbiAgICBvdGhlckdyb3VwRXhlY3V0ZUlucHV0TGFiZWwuYXBwZW5kQ2hpbGQoc2VsZi5vdGhlckdyb3VwRXhlY3V0ZUlucHV0KTtcbiAgICBvdGhlckdyb3VwRXhlY3V0ZUlucHV0TGFiZWwuYXBwZW5kQ2hpbGQob3RoZXJHcm91cEV4ZWN1dGVJbnB1dFRpdGxlKTtcblxuICAgIC8vIEV2ZW50c1xuICAgIHNlbGYub3RoZXJHcm91cFJlYWRJbnB1dC5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCAoZXZlbnQpID0+IHtcbiAgICAgIGlmIChzZWxmLmRpc2FibGVFdmVudGhhbmRsZXIpIHJldHVybjtcbiAgICAgIHNlbGYudXBkYXRlTnVtZXJpY0lucHV0KCk7XG4gICAgfSk7XG5cbiAgICBzZWxmLm90aGVyR3JvdXBXcml0ZUlucHV0LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIChldmVudCkgPT4ge1xuICAgICAgaWYgKHNlbGYuZGlzYWJsZUV2ZW50aGFuZGxlcikgcmV0dXJuO1xuICAgICAgc2VsZi51cGRhdGVOdW1lcmljSW5wdXQoKTtcbiAgICB9KTtcblxuICAgIHNlbGYub3RoZXJHcm91cEV4ZWN1dGVJbnB1dC5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCAoZXZlbnQpID0+IHtcbiAgICAgIGlmIChzZWxmLmRpc2FibGVFdmVudGhhbmRsZXIpIHJldHVybjtcbiAgICAgIHNlbGYudXBkYXRlTnVtZXJpY0lucHV0KCk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gb3RoZXJHcm91cDtcbiAgfVxuXG4gIGVuYWJsZUZpZWxkc2V0KGdyb3VwKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG5cbiAgICBpZiAoZ3JvdXAgPT0gJ293bmVyJykge1xuICAgICAgc2VsZi5vd25lckdyb3VwUmVhZElucHV0LnJlbW92ZUF0dHJpYnV0ZShcImRpc2FibGVkXCIpO1xuICAgICAgc2VsZi5vd25lckdyb3VwV3JpdGVJbnB1dC5yZW1vdmVBdHRyaWJ1dGUoXCJkaXNhYmxlZFwiKTtcbiAgICAgIHNlbGYub3duZXJHcm91cEV4ZWN1dGVJbnB1dC5yZW1vdmVBdHRyaWJ1dGUoXCJkaXNhYmxlZFwiKTtcbiAgICB9XG5cbiAgICBpZiAoZ3JvdXAgPT0gJ2dyb3VwJykge1xuICAgICAgc2VsZi5ncm91cEdyb3VwUmVhZElucHV0LnJlbW92ZUF0dHJpYnV0ZShcImRpc2FibGVkXCIpO1xuICAgICAgc2VsZi5ncm91cEdyb3VwV3JpdGVJbnB1dC5yZW1vdmVBdHRyaWJ1dGUoXCJkaXNhYmxlZFwiKTtcbiAgICAgIHNlbGYuZ3JvdXBHcm91cEV4ZWN1dGVJbnB1dC5yZW1vdmVBdHRyaWJ1dGUoXCJkaXNhYmxlZFwiKTtcbiAgICB9XG5cbiAgICBpZiAoZ3JvdXAgPT0gJ290aGVyJykge1xuICAgICAgc2VsZi5vdGhlckdyb3VwUmVhZElucHV0LnJlbW92ZUF0dHJpYnV0ZShcImRpc2FibGVkXCIpO1xuICAgICAgc2VsZi5vdGhlckdyb3VwV3JpdGVJbnB1dC5yZW1vdmVBdHRyaWJ1dGUoXCJkaXNhYmxlZFwiKTtcbiAgICAgIHNlbGYub3RoZXJHcm91cEV4ZWN1dGVJbnB1dC5yZW1vdmVBdHRyaWJ1dGUoXCJkaXNhYmxlZFwiKTtcbiAgICB9XG4gIH1cblxuICBkaXNhYmxlRmllbGRzZXQoZ3JvdXApIHtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcblxuICAgIGlmIChncm91cCA9PSAnb3duZXInKSB7XG4gICAgICBzZWxmLm93bmVyR3JvdXBSZWFkSW5wdXQuc2V0QXR0cmlidXRlKFwiZGlzYWJsZWRcIiwgdHJ1ZSk7XG4gICAgICBzZWxmLm93bmVyR3JvdXBXcml0ZUlucHV0LnNldEF0dHJpYnV0ZShcImRpc2FibGVkXCIsIHRydWUpO1xuICAgICAgc2VsZi5vd25lckdyb3VwRXhlY3V0ZUlucHV0LnNldEF0dHJpYnV0ZShcImRpc2FibGVkXCIsIHRydWUpO1xuICAgIH1cblxuICAgIGlmIChncm91cCA9PSAnZ3JvdXAnKSB7XG4gICAgICBzZWxmLmdyb3VwR3JvdXBSZWFkSW5wdXQuc2V0QXR0cmlidXRlKFwiZGlzYWJsZWRcIiwgdHJ1ZSk7XG4gICAgICBzZWxmLmdyb3VwR3JvdXBXcml0ZUlucHV0LnNldEF0dHJpYnV0ZShcImRpc2FibGVkXCIsIHRydWUpO1xuICAgICAgc2VsZi5ncm91cEdyb3VwRXhlY3V0ZUlucHV0LnNldEF0dHJpYnV0ZShcImRpc2FibGVkXCIsIHRydWUpO1xuICAgIH1cblxuICAgIGlmIChncm91cCA9PSAnb3RoZXInKSB7XG4gICAgICBzZWxmLm90aGVyR3JvdXBSZWFkSW5wdXQuc2V0QXR0cmlidXRlKFwiZGlzYWJsZWRcIiwgdHJ1ZSk7XG4gICAgICBzZWxmLm90aGVyR3JvdXBXcml0ZUlucHV0LnNldEF0dHJpYnV0ZShcImRpc2FibGVkXCIsIHRydWUpO1xuICAgICAgc2VsZi5vdGhlckdyb3VwRXhlY3V0ZUlucHV0LnNldEF0dHJpYnV0ZShcImRpc2FibGVkXCIsIHRydWUpO1xuICAgIH1cbiAgfVxuXG4gIHNldENoZWNrYm94SW5wdXRzKHJpZ2h0cykge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuXG4gICAgbGV0IHVzZXIgPSByaWdodHMudXNlci5zcGxpdCgnJyk7XG4gICAgbGV0IGdyb3VwID0gcmlnaHRzLmdyb3VwLnNwbGl0KCcnKTtcbiAgICBsZXQgb3RoZXIgPSByaWdodHMub3RoZXIuc3BsaXQoJycpO1xuXG4gICAgc2VsZi5vd25lckdyb3VwUmVhZElucHV0LmNoZWNrZWQgPSBmYWxzZTtcbiAgICBzZWxmLm93bmVyR3JvdXBXcml0ZUlucHV0LmNoZWNrZWQgPSBmYWxzZTtcbiAgICBzZWxmLm93bmVyR3JvdXBFeGVjdXRlSW5wdXQuY2hlY2tlZCA9IGZhbHNlO1xuICAgIHNlbGYuZ3JvdXBHcm91cFJlYWRJbnB1dC5jaGVja2VkID0gZmFsc2U7XG4gICAgc2VsZi5ncm91cEdyb3VwV3JpdGVJbnB1dC5jaGVja2VkID0gZmFsc2U7XG4gICAgc2VsZi5ncm91cEdyb3VwRXhlY3V0ZUlucHV0LmNoZWNrZWQgPSBmYWxzZTtcbiAgICBzZWxmLm90aGVyR3JvdXBSZWFkSW5wdXQuY2hlY2tlZCA9IGZhbHNlO1xuICAgIHNlbGYub3RoZXJHcm91cFdyaXRlSW5wdXQuY2hlY2tlZCA9IGZhbHNlO1xuICAgIHNlbGYub3RoZXJHcm91cEV4ZWN1dGVJbnB1dC5jaGVja2VkID0gZmFsc2U7XG5cbiAgICB1c2VyLmZvckVhY2goKHJpZ2h0KSA9PiB7XG4gICAgICBpZiAocmlnaHQgPT0gJ3InKSBzZWxmLm93bmVyR3JvdXBSZWFkSW5wdXQuY2hlY2tlZCA9IHRydWU7XG4gICAgICBpZiAocmlnaHQgPT0gJ3cnKSBzZWxmLm93bmVyR3JvdXBXcml0ZUlucHV0LmNoZWNrZWQgPSB0cnVlO1xuICAgICAgaWYgKHJpZ2h0ID09ICd4Jykgc2VsZi5vd25lckdyb3VwRXhlY3V0ZUlucHV0LmNoZWNrZWQgPSB0cnVlO1xuICAgIH0pO1xuXG4gICAgZ3JvdXAuZm9yRWFjaCgocmlnaHQpID0+IHtcbiAgICAgIGlmIChyaWdodCA9PSAncicpIHNlbGYuZ3JvdXBHcm91cFJlYWRJbnB1dC5jaGVja2VkID0gdHJ1ZTtcbiAgICAgIGlmIChyaWdodCA9PSAndycpIHNlbGYuZ3JvdXBHcm91cFdyaXRlSW5wdXQuY2hlY2tlZCA9IHRydWU7XG4gICAgICBpZiAocmlnaHQgPT0gJ3gnKSBzZWxmLmdyb3VwR3JvdXBFeGVjdXRlSW5wdXQuY2hlY2tlZCA9IHRydWU7XG4gICAgfSk7XG5cbiAgICBvdGhlci5mb3JFYWNoKChyaWdodCkgPT4ge1xuICAgICAgaWYgKHJpZ2h0ID09ICdyJykgc2VsZi5vdGhlckdyb3VwUmVhZElucHV0LmNoZWNrZWQgPSB0cnVlO1xuICAgICAgaWYgKHJpZ2h0ID09ICd3Jykgc2VsZi5vdGhlckdyb3VwV3JpdGVJbnB1dC5jaGVja2VkID0gdHJ1ZTtcbiAgICAgIGlmIChyaWdodCA9PSAneCcpIHNlbGYub3RoZXJHcm91cEV4ZWN1dGVJbnB1dC5jaGVja2VkID0gdHJ1ZTtcbiAgICB9KTtcbiAgfVxuXG4gIHNldE51bWVyaWNJbnB1dChwZXJtaXNzaW9ucykge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuXG4gICAgc2VsZi5udW1lcmljSW5wdXQuZ2V0TW9kZWwoKS5zZXRUZXh0KHBlcm1pc3Npb25zKTtcbiAgfVxuXG4gIHVwZGF0ZU51bWVyaWNJbnB1dCgpIHtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcblxuICAgIGxldCBwZXJtaXNzaW9uc3VzZXIgPSAwO1xuICAgIGxldCBwZXJtaXNzaW9uc2dyb3VwID0gMDtcbiAgICBsZXQgcGVybWlzc2lvbnNvdGhlciA9IDA7XG5cbiAgICBpZiAoc2VsZi5vd25lckdyb3VwUmVhZElucHV0LmNoZWNrZWQgPT0gdHJ1ZSkgcGVybWlzc2lvbnN1c2VyICs9IDQ7XG4gICAgaWYgKHNlbGYub3duZXJHcm91cFdyaXRlSW5wdXQuY2hlY2tlZCA9PSB0cnVlKSBwZXJtaXNzaW9uc3VzZXIgKz0gMjtcbiAgICBpZiAoc2VsZi5vd25lckdyb3VwRXhlY3V0ZUlucHV0LmNoZWNrZWQgPT0gdHJ1ZSkgcGVybWlzc2lvbnN1c2VyICs9IDE7XG5cbiAgICBpZiAoc2VsZi5ncm91cEdyb3VwUmVhZElucHV0LmNoZWNrZWQgPT0gdHJ1ZSkgcGVybWlzc2lvbnNncm91cCArPSA0O1xuICAgIGlmIChzZWxmLmdyb3VwR3JvdXBXcml0ZUlucHV0LmNoZWNrZWQgPT0gdHJ1ZSkgcGVybWlzc2lvbnNncm91cCArPSAyO1xuICAgIGlmIChzZWxmLmdyb3VwR3JvdXBFeGVjdXRlSW5wdXQuY2hlY2tlZCA9PSB0cnVlKSBwZXJtaXNzaW9uc2dyb3VwICs9IDE7XG5cbiAgICBpZiAoc2VsZi5vdGhlckdyb3VwUmVhZElucHV0LmNoZWNrZWQgPT0gdHJ1ZSkgcGVybWlzc2lvbnNvdGhlciArPSA0O1xuICAgIGlmIChzZWxmLm90aGVyR3JvdXBXcml0ZUlucHV0LmNoZWNrZWQgPT0gdHJ1ZSkgcGVybWlzc2lvbnNvdGhlciArPSAyO1xuICAgIGlmIChzZWxmLm90aGVyR3JvdXBFeGVjdXRlSW5wdXQuY2hlY2tlZCA9PSB0cnVlKSBwZXJtaXNzaW9uc290aGVyICs9IDE7XG5cbiAgICBsZXQgcGVybWlzc2lvbnMgPSBwZXJtaXNzaW9uc3VzZXIudG9TdHJpbmcoKSArIHBlcm1pc3Npb25zZ3JvdXAudG9TdHJpbmcoKSArIHBlcm1pc3Npb25zb3RoZXIudG9TdHJpbmcoKTtcblxuICAgIHNlbGYuZGlzYWJsZUV2ZW50aGFuZGxlciA9IHRydWU7XG4gICAgc2VsZi5lbmFibGVGaWVsZHNldCgnb3duZXInKTtcbiAgICBzZWxmLmVuYWJsZUZpZWxkc2V0KCdncm91cCcpO1xuICAgIHNlbGYuZW5hYmxlRmllbGRzZXQoJ290aGVyJyk7XG4gICAgc2VsZi5zZXROdW1lcmljSW5wdXQocGVybWlzc2lvbnMpO1xuICAgIHNlbGYudmFsaWRhdGUoKTtcbiAgICBzZWxmLmRpc2FibGVFdmVudGhhbmRsZXIgPSBmYWxzZTtcbiAgfVxuXG4gIHVwZGF0ZUNoZWNrYm94SW5wdXRzKCkge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuXG4gICAgbGV0IHBlcm1pc3Npb25zID0gc2VsZi5udW1lcmljSW5wdXQuZ2V0TW9kZWwoKS5nZXRUZXh0KCk7XG4gICAgaWYgKHBlcm1pc3Npb25zLmxlbmd0aCAhPSAwICYmIHBlcm1pc3Npb25zLmxlbmd0aCAhPSAzKSByZXR1cm4gc2VsZi52YWxpZGF0ZSgpO1xuICAgIGxldCByaWdodHMgPSBwZXJtaXNzaW9uc1RvUmlnaHRzKHBlcm1pc3Npb25zKTtcblxuICAgIHNlbGYuZGlzYWJsZUV2ZW50aGFuZGxlciA9IHRydWU7XG4gICAgc2VsZi5zZXRDaGVja2JveElucHV0cyhyaWdodHMpO1xuICAgIGlmIChwZXJtaXNzaW9uc1swXSA9PSAneCcpIHsgc2VsZi5kaXNhYmxlRmllbGRzZXQoJ293bmVyJyk7IH0gZWxzZSB7IHNlbGYuZW5hYmxlRmllbGRzZXQoJ293bmVyJyk7IH07XG4gICAgaWYgKHBlcm1pc3Npb25zWzFdID09ICd4JykgeyBzZWxmLmRpc2FibGVGaWVsZHNldCgnZ3JvdXAnKTsgfSBlbHNlIHsgc2VsZi5lbmFibGVGaWVsZHNldCgnZ3JvdXAnKTsgfTtcbiAgICBpZiAocGVybWlzc2lvbnNbMl0gPT0gJ3gnKSB7IHNlbGYuZGlzYWJsZUZpZWxkc2V0KCdvdGhlcicpOyB9IGVsc2UgeyBzZWxmLmVuYWJsZUZpZWxkc2V0KCdvdGhlcicpOyB9O1xuICAgIHNlbGYudmFsaWRhdGUoKTtcbiAgICBzZWxmLmRpc2FibGVFdmVudGhhbmRsZXIgPSBmYWxzZTtcbiAgfVxuXG4gIHZhbGlkYXRlKCkge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuXG4gICAgbGV0IGlzdmFsaWQgPSB0cnVlO1xuICAgIGxldCBhbGxvd2VkID0gWyd4JywgJzAnLCAnMScsICcyJywgJzMnLCAnNCcsICc1JywgJzYnLCAnNyddO1xuICAgIGxldCBwZXJtaXNzaW9ucyA9IHNlbGYubnVtZXJpY0lucHV0LmdldE1vZGVsKCkuZ2V0VGV4dCgpO1xuXG4gICAgaWYgKHBlcm1pc3Npb25zLmxlbmd0aCAhPSAzIHx8IHBlcm1pc3Npb25zID09ICcwMDAnKSBpc3ZhbGlkID0gZmFsc2U7XG5cbiAgICBwZXJtaXNzaW9ucy5zcGxpdCgnJykuZm9yRWFjaCgodmFsdWUpID0+IHtcbiAgICAgIGlmIChhbGxvd2VkLmluZGV4T2YodmFsdWUpID09IC0xKSB7XG4gICAgICAgIGlzdmFsaWQgPSBmYWxzZTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGlmIChpc3ZhbGlkKSB7XG4gICAgICBzZWxmLnNhdmVCdXR0b24ucmVtb3ZlQXR0cmlidXRlKFwiZGlzYWJsZWRcIik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHNlbGYuc2F2ZUJ1dHRvbi5zZXRBdHRyaWJ1dGUoXCJkaXNhYmxlZFwiLCB0cnVlKTtcbiAgICB9XG4gIH1cblxuICBhdHRhY2goKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG5cbiAgICBpZiAoIXNlbGYuaXRlbSkgcmV0dXJuO1xuXG4gICAgc2VsZi5zZXRDaGVja2JveElucHV0cyhzZWxmLnJpZ2h0cyk7XG4gICAgc2VsZi5zZXROdW1lcmljSW5wdXQocmlnaHRzVG9QZXJtaXNzaW9ucyhzZWxmLnJpZ2h0cykpO1xuICAgIHNlbGYudmFsaWRhdGUoKTtcblxuICAgIHRoaXMucGFuZWwgPSBhdG9tLndvcmtzcGFjZS5hZGRNb2RhbFBhbmVsKHtcbiAgICAgIGl0ZW06IHRoaXNcbiAgICB9KTtcblxuICAgIHNlbGYubnVtZXJpY0lucHV0LmZvY3VzKCk7XG4gICAgc2VsZi5udW1lcmljSW5wdXQuZ2V0TW9kZWwoKS5zY3JvbGxUb0N1cnNvclBvc2l0aW9uKCk7XG4gIH1cblxuICBjbG9zZSgpIHtcbiAgICBjb25zdCBkZXN0cm95UGFuZWwgPSB0aGlzLnBhbmVsO1xuICAgIHRoaXMucGFuZWwgPSBudWxsO1xuXG4gICAgaWYgKGRlc3Ryb3lQYW5lbCkge1xuICAgICAgZGVzdHJveVBhbmVsLmRlc3Ryb3koKTtcbiAgICB9XG5cbiAgICBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVQYW5lKCkuYWN0aXZhdGUoKTtcbiAgfVxuXG4gIGNhbmNlbCgpIHtcbiAgICB0aGlzLmNsb3NlKCk7XG4gIH1cblxuICBzYXZlKCkge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuXG4gICAgbGV0IHBlcm1pc3Npb25zID0gcmlnaHRzVG9QZXJtaXNzaW9ucyhwZXJtaXNzaW9uc1RvUmlnaHRzKHNlbGYubnVtZXJpY0lucHV0LmdldE1vZGVsKCkuZ2V0VGV4dCgpKSk7XG5cbiAgICB0aGlzLnRyaWdnZXIoJ2NoYW5nZS1wZXJtaXNzaW9ucycsIHtcbiAgICAgIHBlcm1pc3Npb25zOiBwZXJtaXNzaW9ucyxcbiAgICAgIHJpZ2h0czogcGVybWlzc2lvbnNUb1JpZ2h0cyhwZXJtaXNzaW9ucylcbiAgICB9KTtcbiAgICBzZWxmLmNsb3NlKCk7XG4gIH1cbn1cbiJdfQ==