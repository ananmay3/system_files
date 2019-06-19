Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _dialog = require('./dialog');

var _dialog2 = _interopRequireDefault(_dialog);

var _helperFormatJs = require('../helper/format.js');

'use babel';

var DuplicateDialog = (function (_Dialog) {
  _inherits(DuplicateDialog, _Dialog);

  function DuplicateDialog(initialPath) {
    _classCallCheck(this, DuplicateDialog);

    _get(Object.getPrototypeOf(DuplicateDialog.prototype), 'constructor', this).call(this, {
      prompt: 'Enter the new path for the duplicate.',
      initialPath: initialPath,
      select: true,
      iconClass: 'icon-arrow-right'
    });
  }

  _createClass(DuplicateDialog, [{
    key: 'onConfirm',
    value: function onConfirm(relativePath) {
      // correct whitespaces and slashes
      relativePath = (0, _helperFormatJs.normalize)(relativePath);

      this.trigger('new-path', [relativePath]);
    }
  }]);

  return DuplicateDialog;
})(_dialog2['default']);

exports['default'] = DuplicateDialog;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2FuYW5tYXlqYWluLy5hdG9tL3BhY2thZ2VzL2Z0cC1yZW1vdGUtZWRpdC9saWIvZGlhbG9ncy9kdXBsaWNhdGUtZGlhbG9nLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O3NCQUVtQixVQUFVOzs7OzhCQUNILHFCQUFxQjs7QUFIL0MsV0FBVyxDQUFDOztJQUtTLGVBQWU7WUFBZixlQUFlOztBQUV2QixXQUZRLGVBQWUsQ0FFdEIsV0FBVyxFQUFFOzBCQUZOLGVBQWU7O0FBR2hDLCtCQUhpQixlQUFlLDZDQUcxQjtBQUNKLFlBQU0sRUFBRSx1Q0FBdUM7QUFDL0MsaUJBQVcsRUFBWCxXQUFXO0FBQ1gsWUFBTSxFQUFFLElBQUk7QUFDWixlQUFTLEVBQUUsa0JBQWtCO0tBQzlCLEVBQUU7R0FDSjs7ZUFUa0IsZUFBZTs7V0FXekIsbUJBQUMsWUFBWSxFQUFFOztBQUV0QixrQkFBWSxHQUFHLCtCQUFVLFlBQVksQ0FBQyxDQUFDOztBQUV2QyxVQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7S0FDMUM7OztTQWhCa0IsZUFBZTs7O3FCQUFmLGVBQWUiLCJmaWxlIjoiL2hvbWUvYW5hbm1heWphaW4vLmF0b20vcGFja2FnZXMvZnRwLXJlbW90ZS1lZGl0L2xpYi9kaWFsb2dzL2R1cGxpY2F0ZS1kaWFsb2cuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcblxuaW1wb3J0IERpYWxvZyBmcm9tICcuL2RpYWxvZyc7XG5pbXBvcnQgeyBub3JtYWxpemUgfSBmcm9tICcuLi9oZWxwZXIvZm9ybWF0LmpzJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRHVwbGljYXRlRGlhbG9nIGV4dGVuZHMgRGlhbG9nIHtcblxuICBjb25zdHJ1Y3Rvcihpbml0aWFsUGF0aCkge1xuICAgIHN1cGVyKHtcbiAgICAgIHByb21wdDogJ0VudGVyIHRoZSBuZXcgcGF0aCBmb3IgdGhlIGR1cGxpY2F0ZS4nLFxuICAgICAgaW5pdGlhbFBhdGgsXG4gICAgICBzZWxlY3Q6IHRydWUsXG4gICAgICBpY29uQ2xhc3M6ICdpY29uLWFycm93LXJpZ2h0JyxcbiAgICB9KTtcbiAgfVxuXG4gIG9uQ29uZmlybShyZWxhdGl2ZVBhdGgpIHtcbiAgICAvLyBjb3JyZWN0IHdoaXRlc3BhY2VzIGFuZCBzbGFzaGVzXG4gICAgcmVsYXRpdmVQYXRoID0gbm9ybWFsaXplKHJlbGF0aXZlUGF0aCk7XG5cbiAgICB0aGlzLnRyaWdnZXIoJ25ldy1wYXRoJywgW3JlbGF0aXZlUGF0aF0pO1xuICB9XG59XG4iXX0=