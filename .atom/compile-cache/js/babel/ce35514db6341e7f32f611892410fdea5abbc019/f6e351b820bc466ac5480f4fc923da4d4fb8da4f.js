var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _atomSpacePenViews = require('atom-space-pen-views');

var _helperFormatJs = require('./../helper/format.js');

'use babel';

var ProtocolItemView = (function (_View) {
  _inherits(ProtocolItemView, _View);

  function ProtocolItemView() {
    _classCallCheck(this, ProtocolItemView);

    _get(Object.getPrototypeOf(ProtocolItemView.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(ProtocolItemView, [{
    key: 'initialize',
    value: function initialize(fileinfo) {
      var self = this;

      self.onError = function () {};
      self.onTransferring = function () {};
      self.onFinished = function () {};

      self.fileinfo = fileinfo;
      self.info = {
        client: fileinfo.client,
        direction: fileinfo.direction,
        remotePath: fileinfo.remotePath,
        localPath: fileinfo.localPath,
        size: fileinfo.size ? fileinfo.size : 0,
        progress: 0,
        stream: fileinfo.stream ? fileinfo.stream : null,
        status: fileinfo.status ? fileinfo.status : "Waiting"
      };

      if (self.info.direction == "download") {
        self.filename_a.html(self.info.localPath);
        self.filename_b.html(self.info.remotePath);
        self.direction.html("<--");
        self.size.html((0, _helperFormatJs.formatNumber)(self.info.size));
        self.status.html(self.info.status);
      } else {
        self.filename_a.html(self.info.localPath);
        self.filename_b.html(self.info.remotePath);
        self.direction.html("-->");
        self.size.html((0, _helperFormatJs.formatNumber)(self.info.size));
        self.status.html(self.info.status);
      }
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      var self = this;

      self.remove();
    }
  }, {
    key: 'addStream',
    value: function addStream(stream) {
      var self = this;

      self.info.stream = stream;
    }
  }, {
    key: 'changeProgress',
    value: function changeProgress(data) {
      var self = this;

      self.info.progress = data;
      if (self.info.size && self.info.progress) {
        var percent = (100 / self.info.size * self.info.progress).toFixed(1);
        self.progress.html((0, _helperFormatJs.formatNumber)(self.info.progress) + ' (' + percent + ' %)');
      } else if (self.info.progress) {
        self.progress.html((0, _helperFormatJs.formatNumber)(self.info.progress) + ' (? %)');
      } else {
        self.progress.html('0 (0 %)');
      }
    }
  }, {
    key: 'changeStatus',
    value: function changeStatus(status) {
      var self = this;

      if (status.toLowerCase() == "connection closed" && self.info.status == "Transferring") {
        self.onError();
        self.info.status = 'Error';
        self.status.html('Error');
      } else if (status.toLowerCase() == "connection closed") {
        // Do nothing
      } else if (status.toLowerCase() == "error") {
          self.onError();
          self.info.status = status;
          self.status.html(self.info.status);
        } else if (status.toLowerCase() == "transferring" && self.info.status != "Waiting") {
          // Do nothing
        } else {
            if (status.toLowerCase() == "transferring") {
              self.onTransferring();
            } else if (status.toLowerCase() == "finished") {
              self.progress.html((0, _helperFormatJs.formatNumber)(self.info.size) + ' (100 %)');
              self.onFinished();
            }
            self.info.status = status;
            self.status.html(self.info.status);
          }
    }
  }], [{
    key: 'content',
    value: function content() {
      var _this = this;

      return this.tr({
        'class': 'ftp-remote-edit-protocol-item'
      }, function () {
        _this.td({
          outlet: 'filename_a'
        });
        _this.td({
          outlet: 'direction'
        });
        _this.td({
          outlet: 'filename_b'
        });
        _this.td({
          outlet: 'size'
        });
        _this.td({
          outlet: 'progress'
        });
        _this.td({
          outlet: 'status'
        });
      });
    }
  }]);

  return ProtocolItemView;
})(_atomSpacePenViews.View);

module.exports = ProtocolItemView;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2FuYW5tYXlqYWluLy5hdG9tL3BhY2thZ2VzL2Z0cC1yZW1vdGUtZWRpdC9saWIvdmlld3MvcHJvdG9jb2wtaXRlbS12aWV3LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O2lDQUVxQixzQkFBc0I7OzhCQUNkLHVCQUF1Qjs7QUFIcEQsV0FBVyxDQUFDOztJQUtOLGdCQUFnQjtZQUFoQixnQkFBZ0I7O1dBQWhCLGdCQUFnQjswQkFBaEIsZ0JBQWdCOzsrQkFBaEIsZ0JBQWdCOzs7ZUFBaEIsZ0JBQWdCOztXQTJCVixvQkFBQyxRQUFRLEVBQUU7QUFDbkIsVUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDOztBQUVsQixVQUFJLENBQUMsT0FBTyxHQUFHLFlBQU0sRUFBRyxDQUFDO0FBQ3pCLFVBQUksQ0FBQyxjQUFjLEdBQUcsWUFBTSxFQUFHLENBQUM7QUFDaEMsVUFBSSxDQUFDLFVBQVUsR0FBRyxZQUFNLEVBQUcsQ0FBQzs7QUFFNUIsVUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7QUFDekIsVUFBSSxDQUFDLElBQUksR0FBRztBQUNWLGNBQU0sRUFBRSxRQUFRLENBQUMsTUFBTTtBQUN2QixpQkFBUyxFQUFFLFFBQVEsQ0FBQyxTQUFTO0FBQzdCLGtCQUFVLEVBQUUsUUFBUSxDQUFDLFVBQVU7QUFDL0IsaUJBQVMsRUFBRSxRQUFRLENBQUMsU0FBUztBQUM3QixZQUFJLEVBQUUsQUFBQyxRQUFRLENBQUMsSUFBSSxHQUFJLFFBQVEsQ0FBQyxJQUFJLEdBQUcsQ0FBQztBQUN6QyxnQkFBUSxFQUFFLENBQUM7QUFDWCxjQUFNLEVBQUUsQUFBQyxRQUFRLENBQUMsTUFBTSxHQUFJLFFBQVEsQ0FBQyxNQUFNLEdBQUcsSUFBSTtBQUNsRCxjQUFNLEVBQUUsQUFBQyxRQUFRLENBQUMsTUFBTSxHQUFJLFFBQVEsQ0FBQyxNQUFNLEdBQUcsU0FBUztPQUN4RCxDQUFDOztBQUVGLFVBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLElBQUksVUFBVSxFQUFFO0FBQ3JDLFlBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDMUMsWUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUMzQyxZQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUMzQixZQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxrQ0FBYSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7QUFDN0MsWUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztPQUNwQyxNQUFNO0FBQ0wsWUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUMxQyxZQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQzNDLFlBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQzNCLFlBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGtDQUFhLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztBQUM3QyxZQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO09BQ3BDO0tBQ0Y7OztXQUVNLG1CQUFHO0FBQ1IsVUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDOztBQUVsQixVQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7S0FDZjs7O1dBRVEsbUJBQUMsTUFBTSxFQUFFO0FBQ2hCLFVBQU0sSUFBSSxHQUFHLElBQUksQ0FBQzs7QUFFbEIsVUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO0tBQzNCOzs7V0FFYSx3QkFBQyxJQUFJLEVBQUU7QUFDbkIsVUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDOztBQUVsQixVQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7QUFDMUIsVUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRTtBQUN4QyxZQUFNLE9BQU8sR0FBRyxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQSxDQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN2RSxZQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxrQ0FBYSxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLElBQUksR0FBRyxPQUFPLEdBQUcsS0FBSyxDQUFDLENBQUM7T0FDL0UsTUFBTSxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFO0FBQzdCLFlBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLGtDQUFhLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsUUFBUSxDQUFDLENBQUM7T0FDakUsTUFBTTtBQUNMLFlBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO09BQy9CO0tBQ0Y7OztXQUVXLHNCQUFDLE1BQU0sRUFBRTtBQUNuQixVQUFNLElBQUksR0FBRyxJQUFJLENBQUM7O0FBRWxCLFVBQUksTUFBTSxDQUFDLFdBQVcsRUFBRSxJQUFJLG1CQUFtQixJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxJQUFJLGNBQWMsRUFBRTtBQUNyRixZQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDZixZQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxPQUFPLENBQUM7QUFDM0IsWUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7T0FDM0IsTUFBTSxJQUFJLE1BQU0sQ0FBQyxXQUFXLEVBQUUsSUFBSSxtQkFBbUIsRUFBRTs7T0FFdkQsTUFBTSxJQUFJLE1BQU0sQ0FBQyxXQUFXLEVBQUUsSUFBSSxPQUFPLEVBQUU7QUFDMUMsY0FBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQ2YsY0FBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO0FBQzFCLGNBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7U0FDcEMsTUFBTSxJQUFJLE1BQU0sQ0FBQyxXQUFXLEVBQUUsSUFBSSxjQUFjLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLElBQUksU0FBUyxFQUFFOztTQUVuRixNQUFNO0FBQ0wsZ0JBQUksTUFBTSxDQUFDLFdBQVcsRUFBRSxJQUFJLGNBQWMsRUFBRTtBQUMxQyxrQkFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO2FBQ3ZCLE1BQU0sSUFBSSxNQUFNLENBQUMsV0FBVyxFQUFFLElBQUksVUFBVSxFQUFFO0FBQzdDLGtCQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxrQ0FBYSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLFVBQVUsQ0FBQyxDQUFDO0FBQzlELGtCQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7YUFDbkI7QUFDRCxnQkFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO0FBQzFCLGdCQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1dBQ3BDO0tBQ0Y7OztXQTlHYSxtQkFBRzs7O0FBQ2YsYUFBTyxJQUFJLENBQUMsRUFBRSxDQUFDO0FBQ2IsaUJBQU8sK0JBQStCO09BQ3ZDLEVBQUUsWUFBTTtBQUNQLGNBQUssRUFBRSxDQUFDO0FBQ04sZ0JBQU0sRUFBRSxZQUFZO1NBQ3JCLENBQUMsQ0FBQztBQUNILGNBQUssRUFBRSxDQUFDO0FBQ04sZ0JBQU0sRUFBRSxXQUFXO1NBQ3BCLENBQUMsQ0FBQztBQUNILGNBQUssRUFBRSxDQUFDO0FBQ04sZ0JBQU0sRUFBRSxZQUFZO1NBQ3JCLENBQUMsQ0FBQztBQUNILGNBQUssRUFBRSxDQUFDO0FBQ04sZ0JBQU0sRUFBRSxNQUFNO1NBQ2YsQ0FBQyxDQUFDO0FBQ0gsY0FBSyxFQUFFLENBQUM7QUFDTixnQkFBTSxFQUFFLFVBQVU7U0FDbkIsQ0FBQyxDQUFDO0FBQ0gsY0FBSyxFQUFFLENBQUM7QUFDTixnQkFBTSxFQUFFLFFBQVE7U0FDakIsQ0FBQyxDQUFDO09BQ0osQ0FBQyxDQUFDO0tBQ0o7OztTQXpCRyxnQkFBZ0I7OztBQW1IdEIsTUFBTSxDQUFDLE9BQU8sR0FBRyxnQkFBZ0IsQ0FBQyIsImZpbGUiOiIvaG9tZS9hbmFubWF5amFpbi8uYXRvbS9wYWNrYWdlcy9mdHAtcmVtb3RlLWVkaXQvbGliL3ZpZXdzL3Byb3RvY29sLWl0ZW0tdmlldy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG5pbXBvcnQgeyBWaWV3IH0gZnJvbSAnYXRvbS1zcGFjZS1wZW4tdmlld3MnO1xuaW1wb3J0IHsgZm9ybWF0TnVtYmVyIH0gZnJvbSAnLi8uLi9oZWxwZXIvZm9ybWF0LmpzJztcblxuY2xhc3MgUHJvdG9jb2xJdGVtVmlldyBleHRlbmRzIFZpZXcge1xuXG4gIHN0YXRpYyBjb250ZW50KCkge1xuICAgIHJldHVybiB0aGlzLnRyKHtcbiAgICAgIGNsYXNzOiAnZnRwLXJlbW90ZS1lZGl0LXByb3RvY29sLWl0ZW0nLFxuICAgIH0sICgpID0+IHtcbiAgICAgIHRoaXMudGQoe1xuICAgICAgICBvdXRsZXQ6ICdmaWxlbmFtZV9hJyxcbiAgICAgIH0pO1xuICAgICAgdGhpcy50ZCh7XG4gICAgICAgIG91dGxldDogJ2RpcmVjdGlvbicsXG4gICAgICB9KTtcbiAgICAgIHRoaXMudGQoe1xuICAgICAgICBvdXRsZXQ6ICdmaWxlbmFtZV9iJyxcbiAgICAgIH0pO1xuICAgICAgdGhpcy50ZCh7XG4gICAgICAgIG91dGxldDogJ3NpemUnLFxuICAgICAgfSk7XG4gICAgICB0aGlzLnRkKHtcbiAgICAgICAgb3V0bGV0OiAncHJvZ3Jlc3MnLFxuICAgICAgfSk7XG4gICAgICB0aGlzLnRkKHtcbiAgICAgICAgb3V0bGV0OiAnc3RhdHVzJyxcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgaW5pdGlhbGl6ZShmaWxlaW5mbykge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuXG4gICAgc2VsZi5vbkVycm9yID0gKCkgPT4geyB9O1xuICAgIHNlbGYub25UcmFuc2ZlcnJpbmcgPSAoKSA9PiB7IH07XG4gICAgc2VsZi5vbkZpbmlzaGVkID0gKCkgPT4geyB9O1xuXG4gICAgc2VsZi5maWxlaW5mbyA9IGZpbGVpbmZvO1xuICAgIHNlbGYuaW5mbyA9IHtcbiAgICAgIGNsaWVudDogZmlsZWluZm8uY2xpZW50LFxuICAgICAgZGlyZWN0aW9uOiBmaWxlaW5mby5kaXJlY3Rpb24sXG4gICAgICByZW1vdGVQYXRoOiBmaWxlaW5mby5yZW1vdGVQYXRoLFxuICAgICAgbG9jYWxQYXRoOiBmaWxlaW5mby5sb2NhbFBhdGgsXG4gICAgICBzaXplOiAoZmlsZWluZm8uc2l6ZSkgPyBmaWxlaW5mby5zaXplIDogMCxcbiAgICAgIHByb2dyZXNzOiAwLFxuICAgICAgc3RyZWFtOiAoZmlsZWluZm8uc3RyZWFtKSA/IGZpbGVpbmZvLnN0cmVhbSA6IG51bGwsXG4gICAgICBzdGF0dXM6IChmaWxlaW5mby5zdGF0dXMpID8gZmlsZWluZm8uc3RhdHVzIDogXCJXYWl0aW5nXCJcbiAgICB9O1xuXG4gICAgaWYgKHNlbGYuaW5mby5kaXJlY3Rpb24gPT0gXCJkb3dubG9hZFwiKSB7XG4gICAgICBzZWxmLmZpbGVuYW1lX2EuaHRtbChzZWxmLmluZm8ubG9jYWxQYXRoKTtcbiAgICAgIHNlbGYuZmlsZW5hbWVfYi5odG1sKHNlbGYuaW5mby5yZW1vdGVQYXRoKTtcbiAgICAgIHNlbGYuZGlyZWN0aW9uLmh0bWwoXCI8LS1cIik7XG4gICAgICBzZWxmLnNpemUuaHRtbChmb3JtYXROdW1iZXIoc2VsZi5pbmZvLnNpemUpKTtcbiAgICAgIHNlbGYuc3RhdHVzLmh0bWwoc2VsZi5pbmZvLnN0YXR1cyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHNlbGYuZmlsZW5hbWVfYS5odG1sKHNlbGYuaW5mby5sb2NhbFBhdGgpO1xuICAgICAgc2VsZi5maWxlbmFtZV9iLmh0bWwoc2VsZi5pbmZvLnJlbW90ZVBhdGgpO1xuICAgICAgc2VsZi5kaXJlY3Rpb24uaHRtbChcIi0tPlwiKTtcbiAgICAgIHNlbGYuc2l6ZS5odG1sKGZvcm1hdE51bWJlcihzZWxmLmluZm8uc2l6ZSkpO1xuICAgICAgc2VsZi5zdGF0dXMuaHRtbChzZWxmLmluZm8uc3RhdHVzKTtcbiAgICB9XG4gIH1cblxuICBkZXN0cm95KCkge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuXG4gICAgc2VsZi5yZW1vdmUoKTtcbiAgfVxuXG4gIGFkZFN0cmVhbShzdHJlYW0pIHtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcblxuICAgIHNlbGYuaW5mby5zdHJlYW0gPSBzdHJlYW07XG4gIH1cblxuICBjaGFuZ2VQcm9ncmVzcyhkYXRhKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG5cbiAgICBzZWxmLmluZm8ucHJvZ3Jlc3MgPSBkYXRhO1xuICAgIGlmIChzZWxmLmluZm8uc2l6ZSAmJiBzZWxmLmluZm8ucHJvZ3Jlc3MpIHtcbiAgICAgIGNvbnN0IHBlcmNlbnQgPSAoMTAwIC8gc2VsZi5pbmZvLnNpemUgKiBzZWxmLmluZm8ucHJvZ3Jlc3MpLnRvRml4ZWQoMSk7XG4gICAgICBzZWxmLnByb2dyZXNzLmh0bWwoZm9ybWF0TnVtYmVyKHNlbGYuaW5mby5wcm9ncmVzcykgKyAnICgnICsgcGVyY2VudCArICcgJSknKTtcbiAgICB9IGVsc2UgaWYgKHNlbGYuaW5mby5wcm9ncmVzcykge1xuICAgICAgc2VsZi5wcm9ncmVzcy5odG1sKGZvcm1hdE51bWJlcihzZWxmLmluZm8ucHJvZ3Jlc3MpICsgJyAoPyAlKScpO1xuICAgIH0gZWxzZSB7XG4gICAgICBzZWxmLnByb2dyZXNzLmh0bWwoJzAgKDAgJSknKTtcbiAgICB9XG4gIH1cblxuICBjaGFuZ2VTdGF0dXMoc3RhdHVzKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG5cbiAgICBpZiAoc3RhdHVzLnRvTG93ZXJDYXNlKCkgPT0gXCJjb25uZWN0aW9uIGNsb3NlZFwiICYmIHNlbGYuaW5mby5zdGF0dXMgPT0gXCJUcmFuc2ZlcnJpbmdcIikge1xuICAgICAgc2VsZi5vbkVycm9yKCk7XG4gICAgICBzZWxmLmluZm8uc3RhdHVzID0gJ0Vycm9yJztcbiAgICAgIHNlbGYuc3RhdHVzLmh0bWwoJ0Vycm9yJyk7XG4gICAgfSBlbHNlIGlmIChzdGF0dXMudG9Mb3dlckNhc2UoKSA9PSBcImNvbm5lY3Rpb24gY2xvc2VkXCIpIHtcbiAgICAgIC8vIERvIG5vdGhpbmdcbiAgICB9IGVsc2UgaWYgKHN0YXR1cy50b0xvd2VyQ2FzZSgpID09IFwiZXJyb3JcIikge1xuICAgICAgc2VsZi5vbkVycm9yKCk7XG4gICAgICBzZWxmLmluZm8uc3RhdHVzID0gc3RhdHVzO1xuICAgICAgc2VsZi5zdGF0dXMuaHRtbChzZWxmLmluZm8uc3RhdHVzKTtcbiAgICB9IGVsc2UgaWYgKHN0YXR1cy50b0xvd2VyQ2FzZSgpID09IFwidHJhbnNmZXJyaW5nXCIgJiYgc2VsZi5pbmZvLnN0YXR1cyAhPSBcIldhaXRpbmdcIikge1xuICAgICAgLy8gRG8gbm90aGluZ1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoc3RhdHVzLnRvTG93ZXJDYXNlKCkgPT0gXCJ0cmFuc2ZlcnJpbmdcIikge1xuICAgICAgICBzZWxmLm9uVHJhbnNmZXJyaW5nKCk7XG4gICAgICB9IGVsc2UgaWYgKHN0YXR1cy50b0xvd2VyQ2FzZSgpID09IFwiZmluaXNoZWRcIikge1xuICAgICAgICBzZWxmLnByb2dyZXNzLmh0bWwoZm9ybWF0TnVtYmVyKHNlbGYuaW5mby5zaXplKSArICcgKDEwMCAlKScpO1xuICAgICAgICBzZWxmLm9uRmluaXNoZWQoKTtcbiAgICAgIH1cbiAgICAgIHNlbGYuaW5mby5zdGF0dXMgPSBzdGF0dXM7XG4gICAgICBzZWxmLnN0YXR1cy5odG1sKHNlbGYuaW5mby5zdGF0dXMpO1xuICAgIH1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFByb3RvY29sSXRlbVZpZXc7XG4iXX0=