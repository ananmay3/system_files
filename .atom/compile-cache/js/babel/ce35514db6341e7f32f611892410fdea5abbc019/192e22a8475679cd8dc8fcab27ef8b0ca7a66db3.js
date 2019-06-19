Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _atomSpacePenViews = require('atom-space-pen-views');

var _atom = require('atom');

var _helperSecureJs = require('../helper/secure.js');

'use babel';

var atom = global.atom;

var ChangePassDialog = (function (_View) {
  _inherits(ChangePassDialog, _View);

  _createClass(ChangePassDialog, null, [{
    key: 'content',
    value: function content(opts) {
      var _this = this;

      var options = opts || {};
      return this.div({
        'class': 'tree-view-dialog overlay from-top'
      }, function () {
        _this.div({
          'class': 'panels'
        }, function () {
          _this.div({
            'class': 'panels-item'
          }, function () {
            _this.label({
              'class': 'icon',
              outlet: 'text'
            });
            _this.div({
              'class': 'error-message',
              style: 'margin-bottom: 15px; color: #ff0000;',
              outlet: 'error'
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

  function ChangePassDialog(opts) {
    _classCallCheck(this, ChangePassDialog);

    var options = opts || {};
    _get(Object.getPrototypeOf(ChangePassDialog.prototype), 'constructor', this).call(this, options);
    var self = this;

    self.mode = options.mode || 'change';
    self.title = options.title || 'Ftp-Remote-Edit';
    self.prompt = options.prompt || 'To change your password, you need to enter the old one and confirm the new one by entering it 2 times.';
    self.iconClass = options.iconClass || '';

    if (self.iconClass) {
      self.text.addClass(this.iconClass);
    }

    var html = '<p>' + self.title + '</p>';
    html += '<p>' + self.prompt + '</p>';
    self.text.html(html);

    var oldPwdLabel = document.createElement('label');
    oldPwdLabel.classList.add('control-label');
    var oldPwdLabelTitle = document.createElement('div');
    oldPwdLabelTitle.textContent = 'Old password:';
    oldPwdLabelTitle.classList.add('setting-title');
    oldPwdLabel.appendChild(oldPwdLabelTitle);
    self.oldPwdInput = new _atomSpacePenViews.TextEditorView({ mini: true, placeholderText: "Enter old password..." });

    var newPwdLabel = document.createElement('label');
    newPwdLabel.classList.add('control-label');
    var newPwdLabelTitle = document.createElement('div');
    newPwdLabelTitle.textContent = 'New password:';
    newPwdLabelTitle.classList.add('setting-title');
    newPwdLabel.appendChild(newPwdLabelTitle);
    self.newPwdInput = new _atomSpacePenViews.TextEditorView({ mini: true, placeholderText: "Enter new password..." });

    var confirmPwdLabel = document.createElement('label');
    confirmPwdLabel.classList.add('control-label');
    var confirmPwdLabelTitle = document.createElement('div');
    confirmPwdLabelTitle.textContent = 'Confirm password:';
    confirmPwdLabelTitle.classList.add('setting-title');
    confirmPwdLabel.appendChild(confirmPwdLabelTitle);
    self.confirmPwdInput = new _atomSpacePenViews.TextEditorView({ mini: true, placeholderText: "Enter new password..." });

    var oldPwdControl = document.createElement('div');
    oldPwdControl.classList.add('controls');
    oldPwdControl.classList.add('oldPwd');
    oldPwdControl.appendChild(oldPwdLabel);
    oldPwdControl.appendChild(self.oldPwdInput.element);

    var newPwdControl = document.createElement('div');
    newPwdControl.classList.add('controls');
    newPwdControl.classList.add('newPwd');
    newPwdControl.appendChild(newPwdLabel);
    newPwdControl.appendChild(self.newPwdInput.element);

    var confirmPwdControl = document.createElement('div');
    confirmPwdControl.classList.add('controls');
    confirmPwdControl.classList.add('confirmPwd');
    confirmPwdControl.appendChild(confirmPwdLabel);
    confirmPwdControl.appendChild(self.confirmPwdInput.element);

    var pwdGroup = document.createElement('div');
    pwdGroup.classList.add('control-group');
    if (self.mode == 'change') pwdGroup.appendChild(oldPwdControl);
    pwdGroup.appendChild(newPwdControl);
    pwdGroup.appendChild(confirmPwdControl);

    var groups = document.createElement('div');
    groups.classList.add('control-groups');
    groups.appendChild(pwdGroup);

    var saveButton = document.createElement('button');
    saveButton.textContent = 'Apply';
    saveButton.classList.add('btn');

    var closeButton = document.createElement('button');
    closeButton.textContent = 'Cancel';
    closeButton.classList.add('btn');
    closeButton.classList.add('pull-right');

    self.elements.append(groups);
    self.elements.append(saveButton);
    self.elements.append(closeButton);

    var oldPasswordModel = self.oldPwdInput.getModel();
    var newPasswordModel = self.newPwdInput.getModel();
    var confirmPasswordModel = self.confirmPwdInput.getModel();

    var changing = false;
    oldPasswordModel.clearTextPassword = new _atom.TextBuffer('');
    oldPasswordModel.buffer.onDidChange(function (obj) {
      if (!changing) {
        changing = true;
        oldPasswordModel.clearTextPassword.setTextInRange(obj.oldRange, obj.newText);
        oldPasswordModel.buffer.setTextInRange(obj.newRange, '*'.repeat(obj.newText.length));
        changing = false;
      }
    });

    newPasswordModel.clearTextPassword = new _atom.TextBuffer('');
    newPasswordModel.buffer.onDidChange(function (obj) {
      if (!changing) {
        changing = true;
        newPasswordModel.clearTextPassword.setTextInRange(obj.oldRange, obj.newText);
        newPasswordModel.buffer.setTextInRange(obj.newRange, '*'.repeat(obj.newText.length));
        changing = false;
      }
    });

    confirmPasswordModel.clearTextPassword = new _atom.TextBuffer('');
    confirmPasswordModel.buffer.onDidChange(function (obj) {
      if (!changing) {
        changing = true;
        confirmPasswordModel.clearTextPassword.setTextInRange(obj.oldRange, obj.newText);
        confirmPasswordModel.buffer.setTextInRange(obj.newRange, '*'.repeat(obj.newText.length));
        changing = false;
      }
    });

    // Events
    closeButton.addEventListener('click', function (event) {
      self.close();
    });

    saveButton.addEventListener('click', function (event) {
      self.save();
    });

    atom.commands.add(this.element, {
      'core:confirm': function coreConfirm() {
        self.save();
      },
      'core:cancel': function coreCancel() {
        self.cancel();
      }
    });
  }

  _createClass(ChangePassDialog, [{
    key: 'attach',
    value: function attach() {
      var self = this;

      self.panel = atom.workspace.addModalPanel({
        item: this.element
      });

      if (self.mode == 'change') {
        self.oldPwdInput.focus();
        self.oldPwdInput.getModel().scrollToCursorPosition();
      } else {
        self.newPwdInput.focus();
        self.newPwdInput.getModel().scrollToCursorPosition();
      }
    }
  }, {
    key: 'save',
    value: function save() {
      var self = this;

      var oldPassword = self.oldPwdInput.getModel().clearTextPassword.getText();
      var newPassword = self.newPwdInput.getModel().clearTextPassword.getText();
      var confirmPassword = self.confirmPwdInput.getModel().clearTextPassword.getText();

      if (!(0, _helperSecureJs.checkPassword)(oldPassword)) {
        return self.showError('Old password do not match.');
      }
      if (newPassword == '') {
        return self.showError('New password can not be empty.');
      }
      if (newPassword != confirmPassword) {
        return self.showError('New passwords do not match.');
      }

      var passwords = {
        'oldPassword': oldPassword,
        'newPassword': newPassword
      };

      this.trigger('dialog-done', [passwords]);
      self.close();
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
    key: 'showError',
    value: function showError(message) {
      this.error.text(message);
      if (message) {
        this.flashError();
      }
    }
  }]);

  return ChangePassDialog;
})(_atomSpacePenViews.View);

exports['default'] = ChangePassDialog;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2FuYW5tYXlqYWluLy5hdG9tL3BhY2thZ2VzL2Z0cC1yZW1vdGUtZWRpdC9saWIvZGlhbG9ncy9jaGFuZ2UtcGFzcy1kaWFsb2cuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7b0JBRWlCLE1BQU07Ozs7aUNBQ2lCLHNCQUFzQjs7b0JBQ25DLE1BQU07OzhCQUNILHFCQUFxQjs7QUFMbkQsV0FBVyxDQUFDOztBQU9aLElBQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUM7O0lBRUosZ0JBQWdCO1lBQWhCLGdCQUFnQjs7ZUFBaEIsZ0JBQWdCOztXQUVyQixpQkFBQyxJQUFJLEVBQUU7OztBQUNuQixVQUFNLE9BQU8sR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO0FBQzNCLGFBQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQztBQUNkLGlCQUFPLG1DQUFtQztPQUMzQyxFQUFFLFlBQU07QUFDUCxjQUFLLEdBQUcsQ0FBQztBQUNQLG1CQUFPLFFBQVE7U0FDaEIsRUFBRSxZQUFNO0FBQ1AsZ0JBQUssR0FBRyxDQUFDO0FBQ1AscUJBQU8sYUFBYTtXQUNyQixFQUFFLFlBQU07QUFDUCxrQkFBSyxLQUFLLENBQUM7QUFDVCx1QkFBTyxNQUFNO0FBQ2Isb0JBQU0sRUFBRSxNQUFNO2FBQ2YsQ0FBQyxDQUFDO0FBQ0gsa0JBQUssR0FBRyxDQUFDO0FBQ1AsdUJBQU8sZUFBZTtBQUN0QixtQkFBSyxFQUFFLHNDQUFzQztBQUM3QyxvQkFBTSxFQUFFLE9BQU87YUFDaEIsQ0FBQyxDQUFDO0FBQ0gsa0JBQUssR0FBRyxDQUFDO0FBQ1AsdUJBQU8sZ0JBQWdCO0FBQ3ZCLG9CQUFNLEVBQUUsVUFBVTthQUNuQixDQUFDLENBQUM7V0FDSixDQUFDLENBQUM7U0FDSixDQUFDLENBQUM7T0FDSixDQUFDLENBQUM7S0FDSjs7O0FBRVUsV0EvQlEsZ0JBQWdCLENBK0J2QixJQUFJLEVBQUU7MEJBL0JDLGdCQUFnQjs7QUFnQ2pDLFFBQU0s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QUNkLHFCQUFhLEVBQUUsV0FBVztBQUMxQixxQkFBYSxFQUFFLFdBQVc7T0FDM0IsQ0FBQTs7QUFFRCxVQUFJLENBQUMsT0FBTyxDQUFDLGFBQWEsRUFBRSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7QUFDekMsVUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO0tBQ2Q7OztXQUVJLGlCQUFHO0FBQ04sVUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztBQUNoQyxVQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztBQUNsQixVQUFJLFlBQVksRUFBRTtBQUNoQixvQkFBWSxDQUFDLE9BQU8sRUFBRSxDQUFDO09BQ3hCOztBQUVELFVBQUksQ0FBQyxTQUFTLENBQUMsYUFBYSxFQUFFLENBQUMsUUFBUSxFQUFFLENBQUM7S0FDM0M7OztXQUVLLGtCQUFHO0FBQ1AsVUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO0tBQ2Q7OztXQUVRLG1CQUFDLE9BQU8sRUFBRTtBQUNqQixVQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUN6QixVQUFJLE9BQU8sRUFBRTtBQUNYLFlBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztPQUNuQjtLQUNGOzs7U0FyT2tCLGdCQUFnQjs7O3FCQUFoQixnQkFBZ0IiLCJmaWxlIjoiL2hvbWUvYW5hbm1heWphaW4vLmF0b20vcGFja2FnZXMvZnRwLXJlbW90ZS1lZGl0L2xpYi9kaWFsb2dzL2NoYW5nZS1wYXNzLWRpYWxvZy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB7ICQsIFZpZXcsIFRleHRFZGl0b3JWaWV3IH0gZnJvbSAnYXRvbS1zcGFjZS1wZW4tdmlld3MnO1xuaW1wb3J0IHsgVGV4dEJ1ZmZlciB9IGZyb20gJ2F0b20nO1xuaW1wb3J0IHsgY2hlY2tQYXNzd29yZCB9IGZyb20gJy4uL2hlbHBlci9zZWN1cmUuanMnO1xuXG5jb25zdCBhdG9tID0gZ2xvYmFsLmF0b207XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENoYW5nZVBhc3NEaWFsb2cgZXh0ZW5kcyBWaWV3IHtcblxuICBzdGF0aWMgY29udGVudChvcHRzKSB7XG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdHMgfHwge307XG4gICAgcmV0dXJuIHRoaXMuZGl2KHtcbiAgICAgIGNsYXNzOiAndHJlZS12aWV3LWRpYWxvZyBvdmVybGF5IGZyb20tdG9wJyxcbiAgICB9LCAoKSA9PiB7XG4gICAgICB0aGlzLmRpdih7XG4gICAgICAgIGNsYXNzOiAncGFuZWxzJyxcbiAgICAgIH0sICgpID0+IHtcbiAgICAgICAgdGhpcy5kaXYoe1xuICAgICAgICAgIGNsYXNzOiAncGFuZWxzLWl0ZW0nLFxuICAgICAgICB9LCAoKSA9PiB7XG4gICAgICAgICAgdGhpcy5sYWJlbCh7XG4gICAgICAgICAgICBjbGFzczogJ2ljb24nLFxuICAgICAgICAgICAgb3V0bGV0OiAndGV4dCcsXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgdGhpcy5kaXYoe1xuICAgICAgICAgICAgY2xhc3M6ICdlcnJvci1tZXNzYWdlJyxcbiAgICAgICAgICAgIHN0eWxlOiAnbWFyZ2luLWJvdHRvbTogMTVweDsgY29sb3I6ICNmZjAwMDA7JyxcbiAgICAgICAgICAgIG91dGxldDogJ2Vycm9yJyxcbiAgICAgICAgICB9KTtcbiAgICAgICAgICB0aGlzLmRpdih7XG4gICAgICAgICAgICBjbGFzczogJ3BhbmVscy1jb250ZW50JyxcbiAgICAgICAgICAgIG91dGxldDogJ2VsZW1lbnRzJyxcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKG9wdHMpIHtcbiAgICBjb25zdCBvcHRpb25zID0gb3B0cyB8fCB7fTtcbiAgICBzdXBlcihvcHRpb25zKTtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcblxuICAgIHNlbGYubW9kZSA9IG9wdGlvbnMubW9kZSB8fCAnY2hhbmdlJztcbiAgICBzZWxmLnRpdGxlID0gb3B0aW9ucy50aXRsZSB8fCAnRnRwLVJlbW90ZS1FZGl0JztcbiAgICBzZWxmLnByb21wdCA9IG9wdGlvbnMucHJvbXB0IHx8ICdUbyBjaGFuZ2UgeW91ciBwYXNzd29yZCwgeW91IG5lZWQgdG8gZW50ZXIgdGhlIG9sZCBvbmUgYW5kIGNvbmZpcm0gdGhlIG5ldyBvbmUgYnkgZW50ZXJpbmcgaXQgMiB0aW1lcy4nO1xuICAgIHNlbGYuaWNvbkNsYXNzID0gb3B0aW9ucy5pY29uQ2xhc3MgfHwgJyc7XG5cbiAgICBpZiAoc2VsZi5pY29uQ2xhc3MpIHtcbiAgICAgIHNlbGYudGV4dC5hZGRDbGFzcyh0aGlzLmljb25DbGFzcyk7XG4gICAgfVxuXG4gICAgbGV0IGh0bWwgPSAnPHA+JyArIHNlbGYudGl0bGUgKyAnPC9wPic7XG4gICAgaHRtbCArPSAnPHA+JyArIHNlbGYucHJvbXB0ICsgJzwvcD4nO1xuICAgIHNlbGYudGV4dC5odG1sKGh0bWwpO1xuXG4gICAgbGV0IG9sZFB3ZExhYmVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGFiZWwnKTtcbiAgICBvbGRQd2RMYWJlbC5jbGFzc0xpc3QuYWRkKCdjb250cm9sLWxhYmVsJyk7XG4gICAgbGV0IG9sZFB3ZExhYmVsVGl0bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBvbGRQd2RMYWJlbFRpdGxlLnRleHRDb250ZW50ID0gJ09sZCBwYXNzd29yZDonO1xuICAgIG9sZFB3ZExhYmVsVGl0bGUuY2xhc3NMaXN0LmFkZCgnc2V0dGluZy10aXRsZScpO1xuICAgIG9sZFB3ZExhYmVsLmFwcGVuZENoaWxkKG9sZFB3ZExhYmVsVGl0bGUpO1xuICAgIHNlbGYub2xkUHdkSW5wdXQgPSBuZXcgVGV4dEVkaXRvclZpZXcoeyBtaW5pOiB0cnVlLCBwbGFjZWhvbGRlclRleHQ6IFwiRW50ZXIgb2xkIHBhc3N3b3JkLi4uXCIgfSk7XG5cbiAgICBsZXQgbmV3UHdkTGFiZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsYWJlbCcpO1xuICAgIG5ld1B3ZExhYmVsLmNsYXNzTGlzdC5hZGQoJ2NvbnRyb2wtbGFiZWwnKTtcbiAgICBsZXQgbmV3UHdkTGFiZWxUaXRsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIG5ld1B3ZExhYmVsVGl0bGUudGV4dENvbnRlbnQgPSAnTmV3IHBhc3N3b3JkOic7XG4gICAgbmV3UHdkTGFiZWxUaXRsZS5jbGFzc0xpc3QuYWRkKCdzZXR0aW5nLXRpdGxlJyk7XG4gICAgbmV3UHdkTGFiZWwuYXBwZW5kQ2hpbGQobmV3UHdkTGFiZWxUaXRsZSk7XG4gICAgc2VsZi5uZXdQd2RJbnB1dCA9IG5ldyBUZXh0RWRpdG9yVmlldyh7IG1pbmk6IHRydWUsIHBsYWNlaG9sZGVyVGV4dDogXCJFbnRlciBuZXcgcGFzc3dvcmQuLi5cIiB9KTtcblxuICAgIGxldCBjb25maXJtUHdkTGFiZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsYWJlbCcpO1xuICAgIGNvbmZpcm1Qd2RMYWJlbC5jbGFzc0xpc3QuYWRkKCdjb250cm9sLWxhYmVsJyk7XG4gICAgbGV0IGNvbmZpcm1Qd2RMYWJlbFRpdGxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgY29uZmlybVB3ZExhYmVsVGl0bGUudGV4dENvbnRlbnQgPSAnQ29uZmlybSBwYXNzd29yZDonO1xuICAgIGNvbmZpcm1Qd2RMYWJlbFRpdGxlLmNsYXNzTGlzdC5hZGQoJ3NldHRpbmctdGl0bGUnKTtcbiAgICBjb25maXJtUHdkTGFiZWwuYXBwZW5kQ2hpbGQoY29uZmlybVB3ZExhYmVsVGl0bGUpO1xuICAgIHNlbGYuY29uZmlybVB3ZElucHV0ID0gbmV3IFRleHRFZGl0b3JWaWV3KHsgbWluaTogdHJ1ZSwgcGxhY2Vob2xkZXJUZXh0OiBcIkVudGVyIG5ldyBwYXNzd29yZC4uLlwiIH0pO1xuXG4gICAgbGV0IG9sZFB3ZENvbnRyb2wgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBvbGRQd2RDb250cm9sLmNsYXNzTGlzdC5hZGQoJ2NvbnRyb2xzJyk7XG4gICAgb2xkUHdkQ29udHJvbC5jbGFzc0xpc3QuYWRkKCdvbGRQd2QnKTtcbiAgICBvbGRQd2RDb250cm9sLmFwcGVuZENoaWxkKG9sZFB3ZExhYmVsKTtcbiAgICBvbGRQd2RDb250cm9sLmFwcGVuZENoaWxkKHNlbGYub2xkUHdkSW5wdXQuZWxlbWVudCk7XG5cbiAgICBsZXQgbmV3UHdkQ29udHJvbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIG5ld1B3ZENvbnRyb2wuY2xhc3NMaXN0LmFkZCgnY29udHJvbHMnKTtcbiAgICBuZXdQd2RDb250cm9sLmNsYXNzTGlzdC5hZGQoJ25ld1B3ZCcpO1xuICAgIG5ld1B3ZENvbnRyb2wuYXBwZW5kQ2hpbGQobmV3UHdkTGFiZWwpO1xuICAgIG5ld1B3ZENvbnRyb2wuYXBwZW5kQ2hpbGQoc2VsZi5uZXdQd2RJbnB1dC5lbGVtZW50KTtcblxuICAgIGxldCBjb25maXJtUHdkQ29udHJvbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGNvbmZpcm1Qd2RDb250cm9sLmNsYXNzTGlzdC5hZGQoJ2NvbnRyb2xzJyk7XG4gICAgY29uZmlybVB3ZENvbnRyb2wuY2xhc3NMaXN0LmFkZCgnY29uZmlybVB3ZCcpO1xuICAgIGNvbmZpcm1Qd2RDb250cm9sLmFwcGVuZENoaWxkKGNvbmZpcm1Qd2RMYWJlbCk7XG4gICAgY29uZmlybVB3ZENvbnRyb2wuYXBwZW5kQ2hpbGQoc2VsZi5jb25maXJtUHdkSW5wdXQuZWxlbWVudCk7XG5cbiAgICBsZXQgcHdkR3JvdXAgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBwd2RHcm91cC5jbGFzc0xpc3QuYWRkKCdjb250cm9sLWdyb3VwJyk7XG4gICAgaWYgKHNlbGYubW9kZSA9PSAnY2hhbmdlJykgcHdkR3JvdXAuYXBwZW5kQ2hpbGQob2xkUHdkQ29udHJvbCk7XG4gICAgcHdkR3JvdXAuYXBwZW5kQ2hpbGQobmV3UHdkQ29udHJvbCk7XG4gICAgcHdkR3JvdXAuYXBwZW5kQ2hpbGQoY29uZmlybVB3ZENvbnRyb2wpO1xuXG4gICAgbGV0IGdyb3VwcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGdyb3Vwcy5jbGFzc0xpc3QuYWRkKCdjb250cm9sLWdyb3VwcycpO1xuICAgIGdyb3Vwcy5hcHBlbmRDaGlsZChwd2RHcm91cCk7XG5cbiAgICBsZXQgc2F2ZUJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xuICAgIHNhdmVCdXR0b24udGV4dENvbnRlbnQgPSAnQXBwbHknO1xuICAgIHNhdmVCdXR0b24uY2xhc3NMaXN0LmFkZCgnYnRuJyk7XG5cbiAgICBsZXQgY2xvc2VCdXR0b24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKTtcbiAgICBjbG9zZUJ1dHRvbi50ZXh0Q29udGVudCA9ICdDYW5jZWwnO1xuICAgIGNsb3NlQnV0dG9uLmNsYXNzTGlzdC5hZGQoJ2J0bicpO1xuICAgIGNsb3NlQnV0dG9uLmNsYXNzTGlzdC5hZGQoJ3B1bGwtcmlnaHQnKTtcblxuICAgIHNlbGYuZWxlbWVudHMuYXBwZW5kKGdyb3Vwcyk7XG4gICAgc2VsZi5lbGVtZW50cy5hcHBlbmQoc2F2ZUJ1dHRvbik7XG4gICAgc2VsZi5lbGVtZW50cy5hcHBlbmQoY2xvc2VCdXR0b24pO1xuXG4gICAgY29uc3Qgb2xkUGFzc3dvcmRNb2RlbCA9IHNlbGYub2xkUHdkSW5wdXQuZ2V0TW9kZWwoKTtcbiAgICBjb25zdCBuZXdQYXNzd29yZE1vZGVsID0gc2VsZi5uZXdQd2RJbnB1dC5nZXRNb2RlbCgpO1xuICAgIGNvbnN0IGNvbmZpcm1QYXNzd29yZE1vZGVsID0gc2VsZi5jb25maXJtUHdkSW5wdXQuZ2V0TW9kZWwoKTtcblxuICAgIGxldCBjaGFuZ2luZyA9IGZhbHNlO1xuICAgIG9sZFBhc3N3b3JkTW9kZWwuY2xlYXJUZXh0UGFzc3dvcmQgPSBuZXcgVGV4dEJ1ZmZlcignJyk7XG4gICAgb2xkUGFzc3dvcmRNb2RlbC5idWZmZXIub25EaWRDaGFuZ2UoKG9iaikgPT4ge1xuICAgICAgaWYgKCFjaGFuZ2luZykge1xuICAgICAgICBjaGFuZ2luZyA9IHRydWU7XG4gICAgICAgIG9sZFBhc3N3b3JkTW9kZWwuY2xlYXJUZXh0UGFzc3dvcmQuc2V0VGV4dEluUmFuZ2Uob2JqLm9sZFJhbmdlLCBvYmoubmV3VGV4dCk7XG4gICAgICAgIG9sZFBhc3N3b3JkTW9kZWwuYnVmZmVyLnNldFRleHRJblJhbmdlKG9iai5uZXdSYW5nZSwgJyonLnJlcGVhdChvYmoubmV3VGV4dC5sZW5ndGgpKTtcbiAgICAgICAgY2hhbmdpbmcgPSBmYWxzZTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIG5ld1Bhc3N3b3JkTW9kZWwuY2xlYXJUZXh0UGFzc3dvcmQgPSBuZXcgVGV4dEJ1ZmZlcignJyk7XG4gICAgbmV3UGFzc3dvcmRNb2RlbC5idWZmZXIub25EaWRDaGFuZ2UoKG9iaikgPT4ge1xuICAgICAgaWYgKCFjaGFuZ2luZykge1xuICAgICAgICBjaGFuZ2luZyA9IHRydWU7XG4gICAgICAgIG5ld1Bhc3N3b3JkTW9kZWwuY2xlYXJUZXh0UGFzc3dvcmQuc2V0VGV4dEluUmFuZ2Uob2JqLm9sZFJhbmdlLCBvYmoubmV3VGV4dCk7XG4gICAgICAgIG5ld1Bhc3N3b3JkTW9kZWwuYnVmZmVyLnNldFRleHRJblJhbmdlKG9iai5uZXdSYW5nZSwgJyonLnJlcGVhdChvYmoubmV3VGV4dC5sZW5ndGgpKTtcbiAgICAgICAgY2hhbmdpbmcgPSBmYWxzZTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGNvbmZpcm1QYXNzd29yZE1vZGVsLmNsZWFyVGV4dFBhc3N3b3JkID0gbmV3IFRleHRCdWZmZXIoJycpO1xuICAgIGNvbmZpcm1QYXNzd29yZE1vZGVsLmJ1ZmZlci5vbkRpZENoYW5nZSgob2JqKSA9PiB7XG4gICAgICBpZiAoIWNoYW5naW5nKSB7XG4gICAgICAgIGNoYW5naW5nID0gdHJ1ZTtcbiAgICAgICAgY29uZmlybVBhc3N3b3JkTW9kZWwuY2xlYXJUZXh0UGFzc3dvcmQuc2V0VGV4dEluUmFuZ2Uob2JqLm9sZFJhbmdlLCBvYmoubmV3VGV4dCk7XG4gICAgICAgIGNvbmZpcm1QYXNzd29yZE1vZGVsLmJ1ZmZlci5zZXRUZXh0SW5SYW5nZShvYmoubmV3UmFuZ2UsICcqJy5yZXBlYXQob2JqLm5ld1RleHQubGVuZ3RoKSk7XG4gICAgICAgIGNoYW5naW5nID0gZmFsc2U7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBFdmVudHNcbiAgICBjbG9zZUJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChldmVudCkgPT4ge1xuICAgICAgc2VsZi5jbG9zZSgpO1xuICAgIH0pO1xuXG4gICAgc2F2ZUJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChldmVudCkgPT4ge1xuICAgICAgc2VsZi5zYXZlKCk7XG4gICAgfSk7XG5cbiAgICBhdG9tLmNvbW1hbmRzLmFkZCh0aGlzLmVsZW1lbnQsIHtcbiAgICAgICdjb3JlOmNvbmZpcm0nOiAoKSA9PiB7XG4gICAgICAgIHNlbGYuc2F2ZSgpO1xuICAgICAgfSxcbiAgICAgICdjb3JlOmNhbmNlbCc6ICgpID0+IHtcbiAgICAgICAgc2VsZi5jYW5jZWwoKTtcbiAgICAgIH0sXG4gICAgfSk7XG4gIH1cblxuICBhdHRhY2goKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG5cbiAgICBzZWxmLnBhbmVsID0gYXRvbS53b3Jrc3BhY2UuYWRkTW9kYWxQYW5lbCh7XG4gICAgICBpdGVtOiB0aGlzLmVsZW1lbnRcbiAgICB9KTtcblxuICAgIGlmIChzZWxmLm1vZGUgPT0gJ2NoYW5nZScpIHtcbiAgICAgIHNlbGYub2xkUHdkSW5wdXQuZm9jdXMoKTtcbiAgICAgIHNlbGYub2xkUHdkSW5wdXQuZ2V0TW9kZWwoKS5zY3JvbGxUb0N1cnNvclBvc2l0aW9uKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHNlbGYubmV3UHdkSW5wdXQuZm9jdXMoKTtcbiAgICAgIHNlbGYubmV3UHdkSW5wdXQuZ2V0TW9kZWwoKS5zY3JvbGxUb0N1cnNvclBvc2l0aW9uKCk7XG4gICAgfVxuICB9XG5cbiAgc2F2ZSgpIHtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcblxuICAgIGNvbnN0IG9sZFBhc3N3b3JkID0gc2VsZi5vbGRQd2RJbnB1dC5nZXRNb2RlbCgpLmNsZWFyVGV4dFBhc3N3b3JkLmdldFRleHQoKTtcbiAgICBjb25zdCBuZXdQYXNzd29yZCA9IHNlbGYubmV3UHdkSW5wdXQuZ2V0TW9kZWwoKS5jbGVhclRleHRQYXNzd29yZC5nZXRUZXh0KCk7XG4gICAgY29uc3QgY29uZmlybVBhc3N3b3JkID0gc2VsZi5jb25maXJtUHdkSW5wdXQuZ2V0TW9kZWwoKS5jbGVhclRleHRQYXNzd29yZC5nZXRUZXh0KCk7XG5cbiAgICBpZiAoIWNoZWNrUGFzc3dvcmQob2xkUGFzc3dvcmQpKSB7XG4gICAgICByZXR1cm4gc2VsZi5zaG93RXJyb3IoJ09sZCBwYXNzd29yZCBkbyBub3QgbWF0Y2guJyk7XG4gICAgfVxuICAgIGlmIChuZXdQYXNzd29yZCA9PSAnJykge1xuICAgICAgcmV0dXJuIHNlbGYuc2hvd0Vycm9yKCdOZXcgcGFzc3dvcmQgY2FuIG5vdCBiZSBlbXB0eS4nKTtcbiAgICB9XG4gICAgaWYgKG5ld1Bhc3N3b3JkICE9IGNvbmZpcm1QYXNzd29yZCkge1xuICAgICAgcmV0dXJuIHNlbGYuc2hvd0Vycm9yKCdOZXcgcGFzc3dvcmRzIGRvIG5vdCBtYXRjaC4nKTtcbiAgICB9XG5cbiAgICBsZXQgcGFzc3dvcmRzID0ge1xuICAgICAgJ29sZFBhc3N3b3JkJzogb2xkUGFzc3dvcmQsXG4gICAgICAnbmV3UGFzc3dvcmQnOiBuZXdQYXNzd29yZCxcbiAgICB9XG5cbiAgICB0aGlzLnRyaWdnZXIoJ2RpYWxvZy1kb25lJywgW3Bhc3N3b3Jkc10pO1xuICAgIHNlbGYuY2xvc2UoKTtcbiAgfVxuXG4gIGNsb3NlKCkge1xuICAgIGNvbnN0IGRlc3Ryb3lQYW5lbCA9IHRoaXMucGFuZWw7XG4gICAgdGhpcy5wYW5lbCA9IG51bGw7XG4gICAgaWYgKGRlc3Ryb3lQYW5lbCkge1xuICAgICAgZGVzdHJveVBhbmVsLmRlc3Ryb3koKTtcbiAgICB9XG5cbiAgICBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVQYW5lKCkuYWN0aXZhdGUoKTtcbiAgfVxuXG4gIGNhbmNlbCgpIHtcbiAgICB0aGlzLmNsb3NlKCk7XG4gIH1cblxuICBzaG93RXJyb3IobWVzc2FnZSkge1xuICAgIHRoaXMuZXJyb3IudGV4dChtZXNzYWdlKTtcbiAgICBpZiAobWVzc2FnZSkge1xuICAgICAgdGhpcy5mbGFzaEVycm9yKCk7XG4gICAgfVxuICB9XG59XG4iXX0=