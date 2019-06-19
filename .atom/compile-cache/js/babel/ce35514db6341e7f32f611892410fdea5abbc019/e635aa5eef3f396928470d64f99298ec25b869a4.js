var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _atomSpacePenViews = require('atom-space-pen-views');

'use babel';

var FtpLogView = (function (_ScrollView) {
  _inherits(FtpLogView, _ScrollView);

  function FtpLogView() {
    _classCallCheck(this, FtpLogView);

    _get(Object.getPrototypeOf(FtpLogView.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(FtpLogView, [{
    key: 'initialize',
    value: function initialize(state) {
      _get(Object.getPrototypeOf(FtpLogView.prototype), 'initialize', this).call(this, state);

      var self = this;

      // Resize Panel
      self.verticalResize.on('mousedown', function (e) {
        self.resizeVerticalStarted(e);
      });
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      var self = this;

      self.remove();
    }
  }, {
    key: 'addLine',
    value: function addLine(msg) {
      var self = this;

      self.log.prepend('<li>' + msg + '</li>');
      var children = self.log.children();
      if (children.length > 50) {
        children.last().remove();
      }
    }
  }, {
    key: 'resizeVerticalStarted',
    value: function resizeVerticalStarted(e) {
      e.preventDefault();

      this.resizeHeightStart = this.height();
      this.resizeMouseStart = e.pageY;
      (0, _atomSpacePenViews.$)(document).on('mousemove', this.resizeVerticalView.bind(this));
      (0, _atomSpacePenViews.$)(document).on('mouseup', this.resizeVerticalStopped);
    }
  }, {
    key: 'resizeVerticalStopped',
    value: function resizeVerticalStopped() {
      delete this.resizeHeightStart;
      delete this.resizeMouseStart;
      (0, _atomSpacePenViews.$)(document).off('mousemove', this.resizeVerticalView);
      (0, _atomSpacePenViews.$)(document).off('mouseup', this.resizeVerticalStopped);
    }
  }, {
    key: 'resizeVerticalView',
    value: function resizeVerticalView(e) {
      if (e.which !== 1) {
        return this.resizeVerticalStopped();
      }

      var delta = e.pageY - this.resizeMouseStart;
      var height = Math.max(26, this.resizeHeightStart - delta);

      this.height(height);
      this.parentView.scroller.css('bottom', height + 'px');
    }
  }], [{
    key: 'content',
    value: function content() {
      var _this = this;

      return this.div({
        'class': 'ftp-remote-edit-queue tool-panel panel-bottom',
        tabindex: -1,
        outlet: 'queue'
      }, function () {
        _this.ul({
          'class': 'list',
          tabindex: -1,
          outlet: 'log'
        });
        _this.div({
          'class': 'ftp-remote-edit-resize-handle',
          outlet: 'verticalResize'
        });
      });
    }
  }]);

  return FtpLogView;
})(_atomSpacePenViews.ScrollView);

module.exports = FtpLogView;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2FuYW5tYXlqYWluLy5hdG9tL3BhY2thZ2VzL2Z0cC1yZW1vdGUtZWRpdC9saWIvdmlld3MvZnRwLWxvZy12aWV3LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O2lDQUU4QixzQkFBc0I7O0FBRnBELFdBQVcsQ0FBQzs7SUFJTixVQUFVO1lBQVYsVUFBVTs7V0FBVixVQUFVOzBCQUFWLFVBQVU7OytCQUFWLFVBQVU7OztlQUFWLFVBQVU7O1dBb0JKLG9CQUFDLEtBQUssRUFBRTtBQUNoQixpQ0FyQkUsVUFBVSw0Q0FxQkssS0FBSyxFQUFDOztBQUV2QixVQUFNLElBQUksR0FBRyxJQUFJLENBQUM7OztBQUdsQixVQUFJLENBQUMsY0FBYyxDQUFDLEVBQUUsQ0FBQyxXQUFXLEVBQUUsVUFBQyxDQUFDLEVBQUs7QUFDekMsWUFBSSxDQUFDLHFCQUFxQixDQUFDLENBQUMsQ0FBQyxDQUFDO09BQy9CLENBQUMsQ0FBQztLQUNKOzs7V0FFTSxtQkFBRztBQUNSLFVBQU0sSUFBSSxHQUFHLElBQUksQ0FBQzs7QUFFbEIsVUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO0tBQ2Y7OztXQUVNLGlCQUFDLEdBQUcsRUFBRTtBQUNYLFVBQU0sSUFBSSxHQUFHLElBQUksQ0FBQzs7QUFFbEIsVUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLFVBQVEsR0FBRyxXQUFRLENBQUM7QUFDcEMsVUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsQ0FBQztBQUNyQyxVQUFJLFFBQVEsQ0FBQyxNQUFNLEdBQUcsRUFBRSxFQUFFO0FBQ3hCLGdCQUFRLENBQUMsSUFBSSxFQUFFLENBQUMsTUFBTSxFQUFFLENBQUM7T0FDMUI7S0FDRjs7O1dBRW9CLCtCQUFDLENBQUMsRUFBRTtBQUN2QixPQUFDLENBQUMsY0FBYyxFQUFFLENBQUM7O0FBRW5CLFVBQUksQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7QUFDdkMsVUFBSSxDQUFDLGdCQUFnQixHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUM7QUFDaEMsZ0NBQUUsUUFBUSxDQUFDLENBQUMsRUFBRSxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7QUFDaEUsZ0NBQUUsUUFBUSxDQUFDLENBQUMsRUFBRSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMscUJBQXFCLENBQUMsQ0FBQztLQUN2RDs7O1dBRW9CLGlDQUFHO0FBQ3RCLGFBQU8sSUFBSSxDQUFDLGlCQUFpQixDQUFDO0FBQzlCLGFBQU8sSUFBSSxDQUFDLGdCQUFnQixDQUFDO0FBQzdCLGdDQUFFLFFBQVEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUM7QUFDdEQsZ0NBQUUsUUFBUSxDQUFDLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMscUJBQXFCLENBQUMsQ0FBQztLQUN4RDs7O1dBRWlCLDRCQUFDLENBQUMsRUFBRTtBQUNwQixVQUFJLENBQUMsQ0FBQyxLQUFLLEtBQUssQ0FBQyxFQUFFO0FBQ2pCLGVBQU8sSUFBSSxDQUFDLHFCQUFxQixFQUFFLENBQUM7T0FDckM7O0FBRUQsVUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUM7QUFDNUMsVUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLGlCQUFpQixHQUFHLEtBQUssQ0FBQyxDQUFDOztBQUUxRCxVQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ3BCLFVBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUssTUFBTSxRQUFLLENBQUM7S0FDdkQ7OztXQXZFYSxtQkFBRzs7O0FBQ2YsYUFBTyxJQUFJLENBQUMsR0FBRyxDQUFDO0FBQ2QsaUJBQU8sK0NBQStDO0FBQ3RELGdCQUFRLEVBQUUsQ0FBQyxDQUFDO0FBQ1osY0FBTSxFQUFFLE9BQU87T0FDaEIsRUFBRSxZQUFNO0FBQ1AsY0FBSyxFQUFFLENBQUM7QUFDTixtQkFBTyxNQUFNO0FBQ2Isa0JBQVEsRUFBRSxDQUFDLENBQUM7QUFDWixnQkFBTSxFQUFFLEtBQUs7U0FDZCxDQUFDLENBQUM7QUFDSCxjQUFLLEdBQUcsQ0FBQztBQUNQLG1CQUFPLCtCQUErQjtBQUN0QyxnQkFBTSxFQUFFLGdCQUFnQjtTQUN6QixDQUFDLENBQUM7T0FDSixDQUFDLENBQUM7S0FDSjs7O1NBbEJHLFVBQVU7OztBQTRFaEIsTUFBTSxDQUFDLE9BQU8sR0FBRyxVQUFVLENBQUMiLCJmaWxlIjoiL2hvbWUvYW5hbm1heWphaW4vLmF0b20vcGFja2FnZXMvZnRwLXJlbW90ZS1lZGl0L2xpYi92aWV3cy9mdHAtbG9nLXZpZXcuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcblxuaW1wb3J0IHsgJCwgU2Nyb2xsVmlldyB9IGZyb20gJ2F0b20tc3BhY2UtcGVuLXZpZXdzJztcblxuY2xhc3MgRnRwTG9nVmlldyBleHRlbmRzIFNjcm9sbFZpZXcge1xuXG4gIHN0YXRpYyBjb250ZW50KCkge1xuICAgIHJldHVybiB0aGlzLmRpdih7XG4gICAgICBjbGFzczogJ2Z0cC1yZW1vdGUtZWRpdC1xdWV1ZSB0b29sLXBhbmVsIHBhbmVsLWJvdHRvbScsXG4gICAgICB0YWJpbmRleDogLTEsXG4gICAgICBvdXRsZXQ6ICdxdWV1ZScsXG4gICAgfSwgKCkgPT4ge1xuICAgICAgdGhpcy51bCh7XG4gICAgICAgIGNsYXNzOiAnbGlzdCcsXG4gICAgICAgIHRhYmluZGV4OiAtMSxcbiAgICAgICAgb3V0bGV0OiAnbG9nJyxcbiAgICAgIH0pO1xuICAgICAgdGhpcy5kaXYoe1xuICAgICAgICBjbGFzczogJ2Z0cC1yZW1vdGUtZWRpdC1yZXNpemUtaGFuZGxlJyxcbiAgICAgICAgb3V0bGV0OiAndmVydGljYWxSZXNpemUnLFxuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICBpbml0aWFsaXplKHN0YXRlKSB7XG4gICAgc3VwZXIuaW5pdGlhbGl6ZShzdGF0ZSlcblxuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuXG4gICAgLy8gUmVzaXplIFBhbmVsXG4gICAgc2VsZi52ZXJ0aWNhbFJlc2l6ZS5vbignbW91c2Vkb3duJywgKGUpID0+IHtcbiAgICAgIHNlbGYucmVzaXplVmVydGljYWxTdGFydGVkKGUpO1xuICAgIH0pO1xuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcblxuICAgIHNlbGYucmVtb3ZlKCk7XG4gIH1cblxuICBhZGRMaW5lKG1zZykge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuXG4gICAgc2VsZi5sb2cucHJlcGVuZChgPGxpPiR7bXNnfTwvbGk+YCk7XG4gICAgY29uc3QgY2hpbGRyZW4gPSBzZWxmLmxvZy5jaGlsZHJlbigpO1xuICAgIGlmIChjaGlsZHJlbi5sZW5ndGggPiA1MCkge1xuICAgICAgY2hpbGRyZW4ubGFzdCgpLnJlbW92ZSgpO1xuICAgIH1cbiAgfVxuXG4gIHJlc2l6ZVZlcnRpY2FsU3RhcnRlZChlKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgdGhpcy5yZXNpemVIZWlnaHRTdGFydCA9IHRoaXMuaGVpZ2h0KCk7XG4gICAgdGhpcy5yZXNpemVNb3VzZVN0YXJ0ID0gZS5wYWdlWTtcbiAgICAkKGRvY3VtZW50KS5vbignbW91c2Vtb3ZlJywgdGhpcy5yZXNpemVWZXJ0aWNhbFZpZXcuYmluZCh0aGlzKSk7XG4gICAgJChkb2N1bWVudCkub24oJ21vdXNldXAnLCB0aGlzLnJlc2l6ZVZlcnRpY2FsU3RvcHBlZCk7XG4gIH1cblxuICByZXNpemVWZXJ0aWNhbFN0b3BwZWQoKSB7XG4gICAgZGVsZXRlIHRoaXMucmVzaXplSGVpZ2h0U3RhcnQ7XG4gICAgZGVsZXRlIHRoaXMucmVzaXplTW91c2VTdGFydDtcbiAgICAkKGRvY3VtZW50KS5vZmYoJ21vdXNlbW92ZScsIHRoaXMucmVzaXplVmVydGljYWxWaWV3KTtcbiAgICAkKGRvY3VtZW50KS5vZmYoJ21vdXNldXAnLCB0aGlzLnJlc2l6ZVZlcnRpY2FsU3RvcHBlZCk7XG4gIH1cblxuICByZXNpemVWZXJ0aWNhbFZpZXcoZSkge1xuICAgIGlmIChlLndoaWNoICE9PSAxKSB7XG4gICAgICByZXR1cm4gdGhpcy5yZXNpemVWZXJ0aWNhbFN0b3BwZWQoKTtcbiAgICB9XG5cbiAgICBsZXQgZGVsdGEgPSBlLnBhZ2VZIC0gdGhpcy5yZXNpemVNb3VzZVN0YXJ0O1xuICAgIGxldCBoZWlnaHQgPSBNYXRoLm1heCgyNiwgdGhpcy5yZXNpemVIZWlnaHRTdGFydCAtIGRlbHRhKTtcblxuICAgIHRoaXMuaGVpZ2h0KGhlaWdodCk7XG4gICAgdGhpcy5wYXJlbnRWaWV3LnNjcm9sbGVyLmNzcygnYm90dG9tJywgYCR7aGVpZ2h0fXB4YCk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBGdHBMb2dWaWV3O1xuIl19