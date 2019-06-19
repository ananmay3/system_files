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

'use babel';

var atom = global.atom;

var Dialog = (function (_View) {
  _inherits(Dialog, _View);

  _createClass(Dialog, null, [{
    key: 'content',
    value: function content(opts) {
      var _this = this;

      var options = opts || {};
      return this.div({
        'class': 'tree-view-dialog overlay from-top'
      }, function () {
        _this.label(options.prompt, {
          'class': 'icon',
          outlet: 'text'
        });
        _this.div({
          'class': 'error-message',
          style: 'margin-bottom: 15px; color: #ff0000;',
          outlet: 'error'
        });
        _this.subview('miniEditor', new _atomSpacePenViews.TextEditorView({
          mini: true
        }));
      });
    }
  }]);

  function Dialog(opts) {
    var _this2 = this;

    _classCallCheck(this, Dialog);

    var options = opts || {};
    _get(Object.getPrototypeOf(Dialog.prototype), 'constructor', this).call(this, options);
    var self = this;

    this.prompt = options.prompt || '';
    this.initialPath = options.initialPath || '';
    this.select = options.select || false;
    this.iconClass = options.iconClass || '';

    if (this.iconClass) {
      this.text.addClass(this.iconClass);
    }

    atom.commands.add(this.element, {
      'core:confirm': function coreConfirm() {
        self.onConfirm(self.miniEditor.getText());
      },
      'core:cancel': function coreCancel() {
        self.cancel();
      }
    });

    this.miniEditor.on('blur', function () {
      _this2.close();
    });

    this.miniEditor.getModel().onDidChange(function () {
      _this2.showError();
    });

    if (this.initialPath) {
      this.miniEditor.getModel().setText(this.initialPath);
    }

    if (this.select) {
      var ext = _path2['default'].extname(this.initialPath);
      var _name = _path2['default'].basename(this.initialPath);
      var selEnd = undefined;
      if (_name === ext) {
        selEnd = this.initialPath.length;
      } else {
        selEnd = this.initialPath.length - ext.length;
      }
      var range = [[0, this.initialPath.length - _name.length], [0, selEnd]];
      this.miniEditor.getModel().setSelectedBufferRange(range);
    }
  }

  _createClass(Dialog, [{
    key: 'attach',
    value: function attach() {
      this.panel = atom.workspace.addModalPanel({
        item: this.element
      });
      this.miniEditor.focus();
      this.miniEditor.getModel().scrollToCursorPosition();
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

  return Dialog;
})(_atomSpacePenViews.View);

exports['default'] = Dialog;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2FuYW5tYXlqYWluLy5hdG9tL3BhY2thZ2VzL2Z0cC1yZW1vdGUtZWRpdC9saWIvZGlhbG9ncy9kaWFsb2cuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7b0JBRWlCLE1BQU07Ozs7aUNBQ2lCLHNCQUFzQjs7QUFIOUQsV0FBVyxDQUFDOztBQUtaLElBQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUM7O0lBRUosTUFBTTtZQUFOLE1BQU07O2VBQU4sTUFBTTs7V0FFWCxpQkFBQyxJQUFJLEVBQUU7OztBQUNuQixVQUFNLE9BQU8sR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO0FBQzNCLGFBQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQztBQUNkLGlCQUFPLG1DQUFtQztPQUMzQyxFQUFFLFlBQU07QUFDUCxjQUFLLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFO0FBQ3pCLG1CQUFPLE1BQU07QUFDYixnQkFBTSxFQUFFLE1BQU07U0FDZixDQUFDLENBQUM7QUFDSCxjQUFLLEdBQUcsQ0FBQztBQUNQLG1CQUFPLGVBQWU7QUFDdEIsZUFBSyxFQUFFLHNDQUFzQztBQUM3QyxnQkFBTSxFQUFFLE9BQU87U0FDaEIsQ0FBQyxDQUFDO0FBQ0gsY0FBSyxPQUFPLENBQUMsWUFBWSxFQUFFLHNDQUFtQjtBQUM1QyxjQUFJLEVBQUUsSUFBSTtTQUNYLENBQUMsQ0FBQyxDQUFDO09BQ0wsQ0FBQyxDQUFDO0tBQ0o7OztBQUVVLFdBdEJRLE1BQU0sQ0FzQmIsSUFBSSxFQUFFOzs7MEJBdEJDLE1BQU07O0FBdUJ2QixRQUFNLE9BQU8sR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO0FBQzNCLCtCQXhCaUIsTUFBTSw2Q0F3QmpCLE9BQU8sRUFBRTtBQUNmLFFBQU0sSUFBSSxHQUFHLElBQUksQ0FBQzs7QUFFbEIsUUFBSSxDQUFDLE1BQU0sR0FBRyxPQUFPLENBQUMsTUFBTSxJQUFJLEVBQUUsQ0FBQztBQUNuQyxRQUFJLENB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QUFLLEVBQUUsQ0FBQztLQUNkOzs7V0FFUSxtQkFBQyxPQUFPLEVBQUU7QUFDakIsVUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDekIsVUFBSSxPQUFPLEVBQUU7QUFDWCxZQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7T0FDbkI7S0FDRjs7O1NBckdrQixNQUFNOzs7cUJBQU4sTUFBTSIsImZpbGUiOiIvaG9tZS9hbmFubWF5amFpbi8uYXRvbS9wYWNrYWdlcy9mdHAtcmVtb3RlLWVkaXQvbGliL2RpYWxvZ3MvZGlhbG9nLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHsgJCwgVmlldywgVGV4dEVkaXRvclZpZXcgfSBmcm9tICdhdG9tLXNwYWNlLXBlbi12aWV3cyc7XG5cbmNvbnN0IGF0b20gPSBnbG9iYWwuYXRvbTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRGlhbG9nIGV4dGVuZHMgVmlldyB7XG5cbiAgc3RhdGljIGNvbnRlbnQob3B0cykge1xuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRzIHx8IHt9O1xuICAgIHJldHVybiB0aGlzLmRpdih7XG4gICAgICBjbGFzczogJ3RyZWUtdmlldy1kaWFsb2cgb3ZlcmxheSBmcm9tLXRvcCcsXG4gICAgfSwgKCkgPT4ge1xuICAgICAgdGhpcy5sYWJlbChvcHRpb25zLnByb21wdCwge1xuICAgICAgICBjbGFzczogJ2ljb24nLFxuICAgICAgICBvdXRsZXQ6ICd0ZXh0JyxcbiAgICAgIH0pO1xuICAgICAgdGhpcy5kaXYoe1xuICAgICAgICBjbGFzczogJ2Vycm9yLW1lc3NhZ2UnLFxuICAgICAgICBzdHlsZTogJ21hcmdpbi1ib3R0b206IDE1cHg7IGNvbG9yOiAjZmYwMDAwOycsXG4gICAgICAgIG91dGxldDogJ2Vycm9yJyxcbiAgICAgIH0pO1xuICAgICAgdGhpcy5zdWJ2aWV3KCdtaW5pRWRpdG9yJywgbmV3IFRleHRFZGl0b3JWaWV3KHtcbiAgICAgICAgbWluaTogdHJ1ZSxcbiAgICAgIH0pKTtcbiAgICB9KTtcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKG9wdHMpIHtcbiAgICBjb25zdCBvcHRpb25zID0gb3B0cyB8fCB7fTtcbiAgICBzdXBlcihvcHRpb25zKTtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcblxuICAgIHRoaXMucHJvbXB0ID0gb3B0aW9ucy5wcm9tcHQgfHwgJyc7XG4gICAgdGhpcy5pbml0aWFsUGF0aCA9IG9wdGlvbnMuaW5pdGlhbFBhdGggfHwgJyc7XG4gICAgdGhpcy5zZWxlY3QgPSBvcHRpb25zLnNlbGVjdCB8fCBmYWxzZTtcbiAgICB0aGlzLmljb25DbGFzcyA9IG9wdGlvbnMuaWNvbkNsYXNzIHx8ICcnO1xuXG4gICAgaWYgKHRoaXMuaWNvbkNsYXNzKSB7XG4gICAgICB0aGlzLnRleHQuYWRkQ2xhc3ModGhpcy5pY29uQ2xhc3MpO1xuICAgIH1cblxuICAgIGF0b20uY29tbWFuZHMuYWRkKHRoaXMuZWxlbWVudCwge1xuICAgICAgJ2NvcmU6Y29uZmlybSc6ICgpID0+IHtcbiAgICAgICAgc2VsZi5vbkNvbmZpcm0oc2VsZi5taW5pRWRpdG9yLmdldFRleHQoKSk7XG4gICAgICB9LFxuICAgICAgJ2NvcmU6Y2FuY2VsJzogKCkgPT4ge1xuICAgICAgICBzZWxmLmNhbmNlbCgpO1xuICAgICAgfSxcbiAgICB9KTtcblxuICAgIHRoaXMubWluaUVkaXRvci5vbignYmx1cicsICgpID0+IHtcbiAgICAgIHRoaXMuY2xvc2UoKTtcbiAgICB9KTtcblxuICAgIHRoaXMubWluaUVkaXRvci5nZXRNb2RlbCgpLm9uRGlkQ2hhbmdlKCgpID0+IHtcbiAgICAgIHRoaXMuc2hvd0Vycm9yKCk7XG4gICAgfSk7XG5cbiAgICBpZiAodGhpcy5pbml0aWFsUGF0aCkge1xuICAgICAgdGhpcy5taW5pRWRpdG9yLmdldE1vZGVsKCkuc2V0VGV4dCh0aGlzLmluaXRpYWxQYXRoKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5zZWxlY3QpIHtcbiAgICAgIGNvbnN0IGV4dCA9IHBhdGguZXh0bmFtZSh0aGlzLmluaXRpYWxQYXRoKTtcbiAgICAgIGNvbnN0IG5hbWUgPSBwYXRoLmJhc2VuYW1lKHRoaXMuaW5pdGlhbFBhdGgpO1xuICAgICAgbGV0IHNlbEVuZDtcbiAgICAgIGlmIChuYW1lID09PSBleHQpIHtcbiAgICAgICAgc2VsRW5kID0gdGhpcy5pbml0aWFsUGF0aC5sZW5ndGg7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzZWxFbmQgPSB0aGlzLmluaXRpYWxQYXRoLmxlbmd0aCAtIGV4dC5sZW5ndGg7XG4gICAgICB9XG4gICAgICBjb25zdCByYW5nZSA9IFtcbiAgICAgICAgWzAsIHRoaXMuaW5pdGlhbFBhdGgubGVuZ3RoIC0gbmFtZS5sZW5ndGhdLFxuICAgICAgICBbMCwgc2VsRW5kXVxuICAgICAgXTtcbiAgICAgIHRoaXMubWluaUVkaXRvci5nZXRNb2RlbCgpLnNldFNlbGVjdGVkQnVmZmVyUmFuZ2UocmFuZ2UpO1xuICAgIH1cbiAgfVxuXG4gIGF0dGFjaCgpIHtcbiAgICB0aGlzLnBhbmVsID0gYXRvbS53b3Jrc3BhY2UuYWRkTW9kYWxQYW5lbCh7XG4gICAgICBpdGVtOiB0aGlzLmVsZW1lbnRcbiAgICB9KTtcbiAgICB0aGlzLm1pbmlFZGl0b3IuZm9jdXMoKTtcbiAgICB0aGlzLm1pbmlFZGl0b3IuZ2V0TW9kZWwoKS5zY3JvbGxUb0N1cnNvclBvc2l0aW9uKCk7XG4gIH1cblxuICBjbG9zZSgpIHtcbiAgICBjb25zdCBkZXN0cm95UGFuZWwgPSB0aGlzLnBhbmVsO1xuICAgIHRoaXMucGFuZWwgPSBudWxsO1xuICAgIGlmIChkZXN0cm95UGFuZWwpIHtcbiAgICAgIGRlc3Ryb3lQYW5lbC5kZXN0cm95KCk7XG4gICAgfVxuXG4gICAgYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZSgpLmFjdGl2YXRlKCk7XG4gIH1cblxuICBjYW5jZWwoKSB7XG4gICAgdGhpcy5jbG9zZSgpO1xuICB9XG5cbiAgc2hvd0Vycm9yKG1lc3NhZ2UpIHtcbiAgICB0aGlzLmVycm9yLnRleHQobWVzc2FnZSk7XG4gICAgaWYgKG1lc3NhZ2UpIHtcbiAgICAgIHRoaXMuZmxhc2hFcnJvcigpO1xuICAgIH1cbiAgfVxufVxuIl19