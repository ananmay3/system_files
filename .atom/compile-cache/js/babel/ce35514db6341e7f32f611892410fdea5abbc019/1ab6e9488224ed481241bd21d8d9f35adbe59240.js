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

var AddDialog = (function (_Dialog) {
  _inherits(AddDialog, _Dialog);

  function AddDialog(initialPath, isFile) {
    _classCallCheck(this, AddDialog);

    _get(Object.getPrototypeOf(AddDialog.prototype), 'constructor', this).call(this, {
      prompt: isFile ? 'Enter the path for the new file.' : 'Enter the path for the new folder.',
      initialPath: initialPath,
      select: false,
      iconClass: isFile ? 'icon-file-add' : 'icon-file-directory-create'
    });
    this.isCreatingFile = isFile;
  }

  _createClass(AddDialog, [{
    key: 'onConfirm',
    value: function onConfirm(relativePath) {
      // correct whitespaces and slashes
      relativePath = (0, _helperFormatJs.normalize)(relativePath);

      this.trigger('new-path', [relativePath]);
    }
  }]);

  return AddDialog;
})(_dialog2['default']);

exports['default'] = AddDialog;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2FuYW5tYXlqYWluLy5hdG9tL3BhY2thZ2VzL2Z0cC1yZW1vdGUtZWRpdC9saWIvZGlhbG9ncy9hZGQtZGlhbG9nLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O3NCQUVtQixVQUFVOzs7OzhCQUNILHFCQUFxQjs7QUFIL0MsV0FBVyxDQUFDOztJQUtTLFNBQVM7WUFBVCxTQUFTOztBQUVqQixXQUZRLFNBQVMsQ0FFaEIsV0FBVyxFQUFFLE1BQU0sRUFBRTswQkFGZCxTQUFTOztBQUcxQiwrQkFIaUIsU0FBUyw2Q0FHcEI7QUFDSixZQUFNLEVBQUUsTUFBTSxHQUFHLGtDQUFrQyxHQUFHLG9DQUFvQztBQUMxRixpQkFBVyxFQUFYLFdBQVc7QUFDWCxZQUFNLEVBQUUsS0FBSztBQUNiLGVBQVMsRUFBRSxNQUFNLEdBQUcsZUFBZSxHQUFHLDRCQUE0QjtLQUNuRSxFQUFFO0FBQ0gsUUFBSSxDQUFDLGNBQWMsR0FBRyxNQUFNLENBQUM7R0FDOUI7O2VBVmtCLFNBQVM7O1dBWW5CLG1CQUFDLFlBQVksRUFBRTs7QUFFdEIsa0JBQVksR0FBRywrQkFBVSxZQUFZLENBQUMsQ0FBQzs7QUFFdkMsVUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLEVBQUUsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO0tBQzFDOzs7U0FqQmtCLFNBQVM7OztxQkFBVCxTQUFTIiwiZmlsZSI6Ii9ob21lL2FuYW5tYXlqYWluLy5hdG9tL3BhY2thZ2VzL2Z0cC1yZW1vdGUtZWRpdC9saWIvZGlhbG9ncy9hZGQtZGlhbG9nLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbmltcG9ydCBEaWFsb2cgZnJvbSAnLi9kaWFsb2cnO1xuaW1wb3J0IHsgbm9ybWFsaXplIH0gZnJvbSAnLi4vaGVscGVyL2Zvcm1hdC5qcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEFkZERpYWxvZyBleHRlbmRzIERpYWxvZyB7XG5cbiAgY29uc3RydWN0b3IoaW5pdGlhbFBhdGgsIGlzRmlsZSkge1xuICAgIHN1cGVyKHtcbiAgICAgIHByb21wdDogaXNGaWxlID8gJ0VudGVyIHRoZSBwYXRoIGZvciB0aGUgbmV3IGZpbGUuJyA6ICdFbnRlciB0aGUgcGF0aCBmb3IgdGhlIG5ldyBmb2xkZXIuJyxcbiAgICAgIGluaXRpYWxQYXRoLFxuICAgICAgc2VsZWN0OiBmYWxzZSxcbiAgICAgIGljb25DbGFzczogaXNGaWxlID8gJ2ljb24tZmlsZS1hZGQnIDogJ2ljb24tZmlsZS1kaXJlY3RvcnktY3JlYXRlJyxcbiAgICB9KTtcbiAgICB0aGlzLmlzQ3JlYXRpbmdGaWxlID0gaXNGaWxlO1xuICB9XG5cbiAgb25Db25maXJtKHJlbGF0aXZlUGF0aCkge1xuICAgIC8vIGNvcnJlY3Qgd2hpdGVzcGFjZXMgYW5kIHNsYXNoZXNcbiAgICByZWxhdGl2ZVBhdGggPSBub3JtYWxpemUocmVsYXRpdmVQYXRoKTtcblxuICAgIHRoaXMudHJpZ2dlcignbmV3LXBhdGgnLCBbcmVsYXRpdmVQYXRoXSk7XG4gIH1cbn1cbiJdfQ==