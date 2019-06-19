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

var RenameDialog = (function (_Dialog) {
  _inherits(RenameDialog, _Dialog);

  function RenameDialog(initialPath, isFile) {
    _classCallCheck(this, RenameDialog);

    _get(Object.getPrototypeOf(RenameDialog.prototype), 'constructor', this).call(this, {
      prompt: isFile ? 'Enter the new path for the file.' : 'Enter the new path for the directory.',
      initialPath: initialPath,
      select: true,
      iconClass: 'icon-arrow-right'
    });
    this.isCreatingFile = isFile;
  }

  _createClass(RenameDialog, [{
    key: 'onConfirm',
    value: function onConfirm(relativePath) {
      // correct whitespaces and slashes
      relativePath = (0, _helperFormatJs.normalize)(relativePath);

      this.trigger('new-path', [relativePath]);
    }
  }]);

  return RenameDialog;
})(_dialog2['default']);

exports['default'] = RenameDialog;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2FuYW5tYXlqYWluLy5hdG9tL3BhY2thZ2VzL2Z0cC1yZW1vdGUtZWRpdC9saWIvZGlhbG9ncy9yZW5hbWUtZGlhbG9nLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O3NCQUVtQixVQUFVOzs7OzhCQUNILHFCQUFxQjs7QUFIL0MsV0FBVyxDQUFDOztJQUtTLFlBQVk7WUFBWixZQUFZOztBQUVwQixXQUZRLFlBQVksQ0FFbkIsV0FBVyxFQUFFLE1BQU0sRUFBRTswQkFGZCxZQUFZOztBQUc3QiwrQkFIaUIsWUFBWSw2Q0FHdkI7QUFDSixZQUFNLEVBQUUsTUFBTSxHQUFHLGtDQUFrQyxHQUFHLHVDQUF1QztBQUM3RixpQkFBVyxFQUFYLFdBQVc7QUFDWCxZQUFNLEVBQUUsSUFBSTtBQUNaLGVBQVMsRUFBRSxrQkFBa0I7S0FDOUIsRUFBRTtBQUNILFFBQUksQ0FBQyxjQUFjLEdBQUcsTUFBTSxDQUFDO0dBQzlCOztlQVZrQixZQUFZOztXQVl0QixtQkFBQyxZQUFZLEVBQUU7O0FBRXRCLGtCQUFZLEdBQUcsK0JBQVUsWUFBWSxDQUFDLENBQUM7O0FBRXZDLFVBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxFQUFFLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztLQUMxQzs7O1NBakJrQixZQUFZOzs7cUJBQVosWUFBWSIsImZpbGUiOiIvaG9tZS9hbmFubWF5amFpbi8uYXRvbS9wYWNrYWdlcy9mdHAtcmVtb3RlLWVkaXQvbGliL2RpYWxvZ3MvcmVuYW1lLWRpYWxvZy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG5pbXBvcnQgRGlhbG9nIGZyb20gJy4vZGlhbG9nJztcbmltcG9ydCB7IG5vcm1hbGl6ZSB9IGZyb20gJy4uL2hlbHBlci9mb3JtYXQuanMnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSZW5hbWVEaWFsb2cgZXh0ZW5kcyBEaWFsb2cge1xuXG4gIGNvbnN0cnVjdG9yKGluaXRpYWxQYXRoLCBpc0ZpbGUpIHtcbiAgICBzdXBlcih7XG4gICAgICBwcm9tcHQ6IGlzRmlsZSA/ICdFbnRlciB0aGUgbmV3IHBhdGggZm9yIHRoZSBmaWxlLicgOiAnRW50ZXIgdGhlIG5ldyBwYXRoIGZvciB0aGUgZGlyZWN0b3J5LicsXG4gICAgICBpbml0aWFsUGF0aCxcbiAgICAgIHNlbGVjdDogdHJ1ZSxcbiAgICAgIGljb25DbGFzczogJ2ljb24tYXJyb3ctcmlnaHQnLFxuICAgIH0pO1xuICAgIHRoaXMuaXNDcmVhdGluZ0ZpbGUgPSBpc0ZpbGU7XG4gIH1cblxuICBvbkNvbmZpcm0ocmVsYXRpdmVQYXRoKSB7XG4gICAgLy8gY29ycmVjdCB3aGl0ZXNwYWNlcyBhbmQgc2xhc2hlc1xuICAgIHJlbGF0aXZlUGF0aCA9IG5vcm1hbGl6ZShyZWxhdGl2ZVBhdGgpO1xuXG4gICAgdGhpcy50cmlnZ2VyKCduZXctcGF0aCcsIFtyZWxhdGl2ZVBhdGhdKTtcbiAgfVxufVxuIl19