var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _viewsProtocolItemViewJs = require('./../views/protocol-item-view.js');

var _viewsProtocolItemViewJs2 = _interopRequireDefault(_viewsProtocolItemViewJs);

'use babel';

var Queue = (function () {
  function Queue() {
    _classCallCheck(this, Queue);

    var self = this;

    self.onDidAddFile = function () {};
    self.onDidRemoveFile = function () {};

    self.list = [];
  }

  _createClass(Queue, [{
    key: 'destroy',
    value: function destroy() {
      var self = this;

      self.list = [];
    }
  }, {
    key: 'addFile',
    value: function addFile(file) {
      var self = this;

      var item = new _viewsProtocolItemViewJs2['default']({
        client: file.client,
        direction: file.direction,
        remotePath: file.remotePath,
        localPath: file.localPath,
        size: file.size,
        stream: file.stream
      });

      self.list.push(item);

      self.onDidAddFile(item);

      return item;
    }
  }, {
    key: 'removeFile',
    value: function removeFile(file) {
      var self = this;

      self.list = self.list.filter(function (item) {
        return item != file;
      });

      self.onDidRemoveFile(file);
    }
  }, {
    key: 'existsFile',
    value: function existsFile(path) {
      var self = this;

      if (self.list.length == 0) return false;

      var items = self.list.filter(function (item) {
        return item.info.localPath === path && (item.info.status == 'Waiting' || item.info.status == 'Transferring');
      });

      return items.length > 0 ? true : false;
    }
  }]);

  return Queue;
})();

module.exports = new Queue();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2FuYW5tYXlqYWluLy5hdG9tL3BhY2thZ2VzL2Z0cC1yZW1vdGUtZWRpdC9saWIvaGVscGVyL3F1ZXVlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozt1Q0FFNkIsa0NBQWtDOzs7O0FBRi9ELFdBQVcsQ0FBQzs7SUFJTixLQUFLO0FBRUUsV0FGUCxLQUFLLEdBRUs7MEJBRlYsS0FBSzs7QUFHUCxRQUFNLElBQUksR0FBRyxJQUFJLENBQUM7O0FBRWxCLFFBQUksQ0FBQyxZQUFZLEdBQUcsWUFBTSxFQUFFLENBQUM7QUFDN0IsUUFBSSxDQUFDLGVBQWUsR0FBRyxZQUFNLEVBQUUsQ0FBQzs7QUFFaEMsUUFBSSxDQUFDLElBQUksR0FBRyxFQUFFLENBQUM7R0FDaEI7O2VBVEcsS0FBSzs7V0FXRixtQkFBRztBQUNSLFVBQU0sSUFBSSxHQUFHLElBQUksQ0FBQzs7QUFFbEIsVUFBSSxDQUFDLElBQUksR0FBRyxFQUFFLENBQUM7S0FDaEI7OztXQUVNLGlCQUFDLElBQUksRUFBRTtBQUNaLFVBQU0sSUFBSSxHQUFHLElBQUksQ0FBQzs7QUFFbEIsVUFBSSxJQUFJLEdBQUcseUNBQXFCO0FBQzlCLGNBQU0sRUFBRSxJQUFJLENBQUMsTUFBTTtBQUNuQixpQkFBUyxFQUFFLElBQUksQ0FBQyxTQUFTO0FBQ3pCLGtCQUFVLEVBQUUsSUFBSSxDQUFDLFVBQVU7QUFDM0IsaUJBQVMsRUFBRSxJQUFJLENBQUMsU0FBUztBQUN6QixZQUFJLEVBQUUsSUFBSSxDQUFDLElBQUk7QUFDZixjQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU07T0FDcEIsQ0FBQyxDQUFDOztBQUVILFVBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDOztBQUVyQixVQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDOztBQUV4QixhQUFPLElBQUksQ0FBQztLQUNiOzs7V0FFUyxvQkFBQyxJQUFJLEVBQUU7QUFDZixVQUFNLElBQUksR0FBRyxJQUFJLENBQUM7O0FBRWxCLFVBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBQyxJQUFJLEVBQUs7QUFDckMsZUFBTyxJQUFJLElBQUksSUFBSSxDQUFDO09BQ3JCLENBQUMsQ0FBQzs7QUFFSCxVQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDO0tBQzVCOzs7V0FFUyxvQkFBQyxJQUFJLEVBQUU7QUFDZixVQUFNLElBQUksR0FBRyxJQUFJLENBQUM7O0FBRWxCLFVBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLElBQUksQ0FBQyxFQUFFLE9BQU8sS0FBSyxDQUFDOztBQUV4QyxVQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFDLElBQUksRUFBSztBQUNyQyxlQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxLQUFLLElBQUksS0FBSyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sSUFBSSxTQUFTLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLElBQUksY0FBYyxDQUFBLEFBQUMsQ0FBQztPQUM5RyxDQUFDLENBQUM7O0FBRUgsYUFBTyxBQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxHQUFJLElBQUksR0FBRyxLQUFLLENBQUM7S0FDMUM7OztTQXhERyxLQUFLOzs7QUEwRFgsTUFBTSxDQUFDLE9BQU8sR0FBRyxJQUFJLEtBQUssRUFBQSxDQUFDIiwiZmlsZSI6Ii9ob21lL2FuYW5tYXlqYWluLy5hdG9tL3BhY2thZ2VzL2Z0cC1yZW1vdGUtZWRpdC9saWIvaGVscGVyL3F1ZXVlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbmltcG9ydCBQcm90b2NvbEl0ZW1WaWV3IGZyb20gJy4vLi4vdmlld3MvcHJvdG9jb2wtaXRlbS12aWV3LmpzJztcblxuY2xhc3MgUXVldWUge1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuXG4gICAgc2VsZi5vbkRpZEFkZEZpbGUgPSAoKSA9PiB7fTtcbiAgICBzZWxmLm9uRGlkUmVtb3ZlRmlsZSA9ICgpID0+IHt9O1xuXG4gICAgc2VsZi5saXN0ID0gW107XG4gIH1cblxuICBkZXN0cm95KCkge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuXG4gICAgc2VsZi5saXN0ID0gW107XG4gIH1cblxuICBhZGRGaWxlKGZpbGUpIHtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcblxuICAgIGxldCBpdGVtID0gbmV3IFByb3RvY29sSXRlbVZpZXcoe1xuICAgICAgY2xpZW50OiBmaWxlLmNsaWVudCxcbiAgICAgIGRpcmVjdGlvbjogZmlsZS5kaXJlY3Rpb24sXG4gICAgICByZW1vdGVQYXRoOiBmaWxlLnJlbW90ZVBhdGgsXG4gICAgICBsb2NhbFBhdGg6IGZpbGUubG9jYWxQYXRoLFxuICAgICAgc2l6ZTogZmlsZS5zaXplLFxuICAgICAgc3RyZWFtOiBmaWxlLnN0cmVhbVxuICAgIH0pO1xuXG4gICAgc2VsZi5saXN0LnB1c2goaXRlbSk7XG4gICAgXG4gICAgc2VsZi5vbkRpZEFkZEZpbGUoaXRlbSk7XG5cbiAgICByZXR1cm4gaXRlbTtcbiAgfVxuXG4gIHJlbW92ZUZpbGUoZmlsZSkge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuXG4gICAgc2VsZi5saXN0ID0gc2VsZi5saXN0LmZpbHRlcigoaXRlbSkgPT4ge1xuICAgICAgcmV0dXJuIGl0ZW0gIT0gZmlsZTtcbiAgICB9KTtcblxuICAgIHNlbGYub25EaWRSZW1vdmVGaWxlKGZpbGUpO1xuICB9XG5cbiAgZXhpc3RzRmlsZShwYXRoKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG5cbiAgICBpZiAoc2VsZi5saXN0Lmxlbmd0aCA9PSAwKSByZXR1cm4gZmFsc2U7XG5cbiAgICBsZXQgaXRlbXMgPSBzZWxmLmxpc3QuZmlsdGVyKChpdGVtKSA9PiB7XG4gICAgICByZXR1cm4gaXRlbS5pbmZvLmxvY2FsUGF0aCA9PT0gcGF0aCAmJiAoaXRlbS5pbmZvLnN0YXR1cyA9PSAnV2FpdGluZycgfHwgaXRlbS5pbmZvLnN0YXR1cyA9PSAnVHJhbnNmZXJyaW5nJyk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gKGl0ZW1zLmxlbmd0aCA+IDApID8gdHJ1ZSA6IGZhbHNlO1xuICB9XG59XG5tb2R1bGUuZXhwb3J0cyA9IG5ldyBRdWV1ZTtcbiJdfQ==