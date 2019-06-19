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

var FindDialog = (function (_Dialog) {
  _inherits(FindDialog, _Dialog);

  function FindDialog(initialPath, isFile) {
    _classCallCheck(this, FindDialog);

    _get(Object.getPrototypeOf(FindDialog.prototype), 'constructor', this).call(this, {
      prompt: 'Enter the path for the folder.',
      initialPath: initialPath,
      select: false,
      iconClass: 'icon-search'
    });
    this.isCreatingFile = isFile;
  }

  _createClass(FindDialog, [{
    key: 'onConfirm',
    value: function onConfirm(relativePath) {
      // correct whitespaces and slashes
      relativePath = (0, _helperFormatJs.normalize)(relativePath);

      this.trigger('find-path', [relativePath]);
    }
  }]);

  return FindDialog;
})(_dialog2['default']);

exports['default'] = FindDialog;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2FuYW5tYXlqYWluLy5hdG9tL3BhY2thZ2VzL2Z0cC1yZW1vdGUtZWRpdC9saWIvZGlhbG9ncy9maW5kLWRpYWxvZy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztzQkFFbUIsVUFBVTs7Ozs4QkFDSCxxQkFBcUI7O0FBSC9DLFdBQVcsQ0FBQzs7SUFLUyxVQUFVO1lBQVYsVUFBVTs7QUFFbEIsV0FGUSxVQUFVLENBRWpCLFdBQVcsRUFBRSxNQUFNLEVBQUU7MEJBRmQsVUFBVTs7QUFHM0IsK0JBSGlCLFVBQVUsNkNBR3JCO0FBQ0osWUFBTSxFQUFFLGdDQUFnQztBQUN4QyxpQkFBVyxFQUFYLFdBQVc7QUFDWCxZQUFNLEVBQUUsS0FBSztBQUNiLGVBQVMsRUFBRSxhQUFhO0tBQ3pCLEVBQUU7QUFDSCxRQUFJLENBQUMsY0FBYyxHQUFHLE1BQU0sQ0FBQztHQUM5Qjs7ZUFWa0IsVUFBVTs7V0FZcEIsbUJBQUMsWUFBWSxFQUFFOztBQUV0QixrQkFBWSxHQUFHLCtCQUFVLFlBQVksQ0FBQyxDQUFDOztBQUV2QyxVQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsRUFBRSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7S0FDM0M7OztTQWpCa0IsVUFBVTs7O3FCQUFWLFVBQVUiLCJmaWxlIjoiL2hvbWUvYW5hbm1heWphaW4vLmF0b20vcGFja2FnZXMvZnRwLXJlbW90ZS1lZGl0L2xpYi9kaWFsb2dzL2ZpbmQtZGlhbG9nLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbmltcG9ydCBEaWFsb2cgZnJvbSAnLi9kaWFsb2cnO1xuaW1wb3J0IHsgbm9ybWFsaXplIH0gZnJvbSAnLi4vaGVscGVyL2Zvcm1hdC5qcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEZpbmREaWFsb2cgZXh0ZW5kcyBEaWFsb2cge1xuXG4gIGNvbnN0cnVjdG9yKGluaXRpYWxQYXRoLCBpc0ZpbGUpIHtcbiAgICBzdXBlcih7XG4gICAgICBwcm9tcHQ6ICdFbnRlciB0aGUgcGF0aCBmb3IgdGhlIGZvbGRlci4nLFxuICAgICAgaW5pdGlhbFBhdGgsXG4gICAgICBzZWxlY3Q6IGZhbHNlLFxuICAgICAgaWNvbkNsYXNzOiAnaWNvbi1zZWFyY2gnLFxuICAgIH0pO1xuICAgIHRoaXMuaXNDcmVhdGluZ0ZpbGUgPSBpc0ZpbGU7XG4gIH1cblxuICBvbkNvbmZpcm0ocmVsYXRpdmVQYXRoKSB7XG4gICAgLy8gY29ycmVjdCB3aGl0ZXNwYWNlcyBhbmQgc2xhc2hlc1xuICAgIHJlbGF0aXZlUGF0aCA9IG5vcm1hbGl6ZShyZWxhdGl2ZVBhdGgpO1xuXG4gICAgdGhpcy50cmlnZ2VyKCdmaW5kLXBhdGgnLCBbcmVsYXRpdmVQYXRoXSk7XG4gIH1cbn1cbiJdfQ==