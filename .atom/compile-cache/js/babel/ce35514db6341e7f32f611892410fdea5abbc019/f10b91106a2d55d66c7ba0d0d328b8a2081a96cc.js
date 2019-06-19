var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _atomSpacePenViews = require('atom-space-pen-views');

'use babel';

var FTP_REMOTE_EDIT_PROTOCOL_URI = 'h3imdall://ftp-remote-edit-protocol';
var Queue = require('./../helper/queue.js');

var ProtocolView = (function (_ScrollView) {
  _inherits(ProtocolView, _ScrollView);

  function ProtocolView() {
    _classCallCheck(this, ProtocolView);

    _get(Object.getPrototypeOf(ProtocolView.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(ProtocolView, [{
    key: 'initialize',
    value: function initialize(state) {
      _get(Object.getPrototypeOf(ProtocolView.prototype), 'initialize', this).call(this, state);
      var self = this;

      atom.workspace.addOpener(function (uri) {
        if (uri === FTP_REMOTE_EDIT_PROTOCOL_URI) {
          return self;
        }
      });
      atom.workspace.open(FTP_REMOTE_EDIT_PROTOCOL_URI, { activatePane: false, activateItem: false });

      self.head.prepend('<tr><th>Local file</th><th>Direction</th><th>Remote file</th><th>Size</th><th>Progress</th><th>Status</th></tr>');

      try {
        Queue.onDidAddFile = function (item) {
          self.list.prepend(item);
          var children = self.list.children();
          if (children.length > 50) {
            children.last().remove();
          }

          item.onError = function () {
            if (atom.config.get('ftp-remote-edit.notifications.openProtocolViewOnError')) {
              atom.workspace.open(FTP_REMOTE_EDIT_PROTOCOL_URI);
            }
            // TODO
          };

          item.onTransferring = function () {
            // TODO
          };

          item.onFinished = function () {
            //TODO
          };
        };
      } catch (e) {
        console.log(e);
      }
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      var self = this;

      self.remove();
    }
  }, {
    key: 'getTitle',
    value: function getTitle() {
      return "Remote Transfer Log";
    }
  }, {
    key: 'getIconName',
    value: function getIconName() {
      return "list-unordered";
    }
  }, {
    key: 'getURI',
    value: function getURI() {
      return FTP_REMOTE_EDIT_PROTOCOL_URI;
    }
  }, {
    key: 'getAllowedLocations',
    value: function getAllowedLocations() {
      return ["bottom"];
    }
  }, {
    key: 'getDefaultLocation',
    value: function getDefaultLocation() {
      return "bottom";
    }
  }, {
    key: 'toggle',
    value: function toggle() {
      atom.workspace.toggle(this);
    }
  }], [{
    key: 'content',
    value: function content() {
      var _this = this;

      return this.div({
        'class': 'ftp-remote-edit-protocol tool-panel'
      }, function () {
        _this.table({
          'class': 'ftp-remote-edit-protocol-table',
          tabindex: -1,
          outlet: 'table'
        }, function () {
          _this.thead({
            outlet: 'head'
          });
          _this.tbody({
            outlet: 'list'
          });
        });
      });
    }
  }]);

  return ProtocolView;
})(_atomSpacePenViews.ScrollView);

module.exports = ProtocolView;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2FuYW5tYXlqYWluLy5hdG9tL3BhY2thZ2VzL2Z0cC1yZW1vdGUtZWRpdC9saWIvdmlld3MvcHJvdG9jb2wtdmlldy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7OztpQ0FFMkIsc0JBQXNCOztBQUZqRCxXQUFXLENBQUM7O0FBSVosSUFBTSw0QkFBNEIsR0FBRyxxQ0FBcUMsQ0FBQztBQUMzRSxJQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsc0JBQXNCLENBQUMsQ0FBQzs7SUFFeEMsWUFBWTtZQUFaLFlBQVk7O1dBQVosWUFBWTswQkFBWixZQUFZOzsrQkFBWixZQUFZOzs7ZUFBWixZQUFZOztXQXFCTixvQkFBQyxLQUFLLEVBQUU7QUFDaEIsaUNBdEJFLFlBQVksNENBc0JHLEtBQUssRUFBQztBQUN2QixVQUFNLElBQUksR0FBRyxJQUFJLENBQUM7O0FBRWxCLFVBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLFVBQUEsR0FBRyxFQUFJO0FBQzlCLFlBQUksR0FBRyxLQUFLLDRCQUE0QixFQUFFO0FBQ3hDLGlCQUFPLElBQUksQ0FBQztTQUNiO09BQ0YsQ0FBQyxDQUFDO0FBQ0gsVUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsNEJBQTRCLEVBQUUsRUFBRSxZQUFZLEVBQUUsS0FBSyxFQUFFLFlBQVksRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDOztBQUVoRyxVQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sbUhBQW1ILENBQUM7O0FBRXJJLFVBQUk7QUFDRixhQUFLLENBQUMsWUFBWSxHQUFHLFVBQUMsSUFBSSxFQUFLO0FBQzdCLGNBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3hCLGNBQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7QUFDdEMsY0FBSSxRQUFRLENBQUMsTUFBTSxHQUFHLEVBQUUsRUFBRTtBQUN4QixvQkFBUSxDQUFDLElBQUksRUFBRSxDQUFDLE1BQU0sRUFBRSxDQUFDO1dBQzFCOztBQUVELGNBQUksQ0FBQyxPQUFPLEdBQUcsWUFBTTtBQUNuQixnQkFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyx1REFBdUQsQ0FBQyxFQUFFO0FBQzVFLGtCQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDO2FBQ25EOztXQUVGLENBQUM7O0FBRUYsY0FBSSxDQUFDLGNBQWMsR0FBRyxZQUFNOztXQUUzQixDQUFDOztBQUVGLGNBQUksQ0FBQyxVQUFVLEdBQUcsWUFBTTs7V0FFdkIsQ0FBQztTQUNILENBQUM7T0FDSCxDQUFDLE9BQU8sQ0FBQyxFQUFFO0FBQUUsZUFBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztPQUFFO0tBQ2hDOzs7V0FFTSxtQkFBRztBQUNSLFVBQU0sSUFBSSxHQUFHLElBQUksQ0FBQzs7QUFFbEIsVUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO0tBQ2Y7OztXQUVPLG9CQUFHO0FBQ1QsYUFBTyxxQkFBcUIsQ0FBQztLQUM5Qjs7O1dBRVUsdUJBQUc7QUFDWixhQUFPLGdCQUFnQixDQUFDO0tBQ3pCOzs7V0FFSyxrQkFBRztBQUNQLGFBQU8sNEJBQTRCLENBQUM7S0FDckM7OztXQUVrQiwrQkFBRztBQUNwQixhQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7S0FDbkI7OztXQUVpQiw4QkFBRztBQUNuQixhQUFPLFFBQVEsQ0FBQztLQUNqQjs7O1dBRUssa0JBQUc7QUFDUCxVQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztLQUM3Qjs7O1dBdEZhLG1CQUFHOzs7QUFDZixhQUFPLElBQUksQ0FBQyxHQUFHLENBQUM7QUFDZCxpQkFBTyxxQ0FBcUM7T0FDN0MsRUFBRSxZQUFNO0FBQ1AsY0FBSyxLQUFLLENBQUM7QUFDVCxtQkFBTyxnQ0FBZ0M7QUFDdkMsa0JBQVEsRUFBRSxDQUFDLENBQUM7QUFDWixnQkFBTSxFQUFFLE9BQU87U0FDaEIsRUFBRSxZQUFNO0FBQ1AsZ0JBQUssS0FBSyxDQUFDO0FBQ1Qsa0JBQU0sRUFBRSxNQUFNO1dBQ2YsQ0FBQyxDQUFDO0FBQ0gsZ0JBQUssS0FBSyxDQUFDO0FBQ1Qsa0JBQU0sRUFBRSxNQUFNO1dBQ2YsQ0FBQyxDQUFDO1NBQ0osQ0FBQyxDQUFDO09BQ0osQ0FBQyxDQUFDO0tBQ0o7OztTQW5CRyxZQUFZOzs7QUEyRmxCLE1BQU0sQ0FBQyxPQUFPLEdBQUcsWUFBWSxDQUFDIiwiZmlsZSI6Ii9ob21lL2FuYW5tYXlqYWluLy5hdG9tL3BhY2thZ2VzL2Z0cC1yZW1vdGUtZWRpdC9saWIvdmlld3MvcHJvdG9jb2wtdmlldy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG5pbXBvcnQgeyBTY3JvbGxWaWV3IH0gZnJvbSAnYXRvbS1zcGFjZS1wZW4tdmlld3MnO1xuXG5jb25zdCBGVFBfUkVNT1RFX0VESVRfUFJPVE9DT0xfVVJJID0gJ2gzaW1kYWxsOi8vZnRwLXJlbW90ZS1lZGl0LXByb3RvY29sJztcbmNvbnN0IFF1ZXVlID0gcmVxdWlyZSgnLi8uLi9oZWxwZXIvcXVldWUuanMnKTtcblxuY2xhc3MgUHJvdG9jb2xWaWV3IGV4dGVuZHMgU2Nyb2xsVmlldyB7XG5cbiAgc3RhdGljIGNvbnRlbnQoKSB7XG4gICAgcmV0dXJuIHRoaXMuZGl2KHtcbiAgICAgIGNsYXNzOiAnZnRwLXJlbW90ZS1lZGl0LXByb3RvY29sIHRvb2wtcGFuZWwnLFxuICAgIH0sICgpID0+IHtcbiAgICAgIHRoaXMudGFibGUoe1xuICAgICAgICBjbGFzczogJ2Z0cC1yZW1vdGUtZWRpdC1wcm90b2NvbC10YWJsZScsXG4gICAgICAgIHRhYmluZGV4OiAtMSxcbiAgICAgICAgb3V0bGV0OiAndGFibGUnLFxuICAgICAgfSwgKCkgPT4ge1xuICAgICAgICB0aGlzLnRoZWFkKHtcbiAgICAgICAgICBvdXRsZXQ6ICdoZWFkJyxcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMudGJvZHkoe1xuICAgICAgICAgIG91dGxldDogJ2xpc3QnLFxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgaW5pdGlhbGl6ZShzdGF0ZSkge1xuICAgIHN1cGVyLmluaXRpYWxpemUoc3RhdGUpXG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG5cbiAgICBhdG9tLndvcmtzcGFjZS5hZGRPcGVuZXIodXJpID0+IHtcbiAgICAgIGlmICh1cmkgPT09IEZUUF9SRU1PVEVfRURJVF9QUk9UT0NPTF9VUkkpIHtcbiAgICAgICAgcmV0dXJuIHNlbGY7XG4gICAgICB9XG4gICAgfSk7XG4gICAgYXRvbS53b3Jrc3BhY2Uub3BlbihGVFBfUkVNT1RFX0VESVRfUFJPVE9DT0xfVVJJLCB7IGFjdGl2YXRlUGFuZTogZmFsc2UsIGFjdGl2YXRlSXRlbTogZmFsc2UgfSk7XG5cbiAgICBzZWxmLmhlYWQucHJlcGVuZChgPHRyPjx0aD5Mb2NhbCBmaWxlPC90aD48dGg+RGlyZWN0aW9uPC90aD48dGg+UmVtb3RlIGZpbGU8L3RoPjx0aD5TaXplPC90aD48dGg+UHJvZ3Jlc3M8L3RoPjx0aD5TdGF0dXM8L3RoPjwvdHI+YCk7XG5cbiAgICB0cnkge1xuICAgICAgUXVldWUub25EaWRBZGRGaWxlID0gKGl0ZW0pID0+IHtcbiAgICAgICAgc2VsZi5saXN0LnByZXBlbmQoaXRlbSk7XG4gICAgICAgIGNvbnN0IGNoaWxkcmVuID0gc2VsZi5saXN0LmNoaWxkcmVuKCk7XG4gICAgICAgIGlmIChjaGlsZHJlbi5sZW5ndGggPiA1MCkge1xuICAgICAgICAgIGNoaWxkcmVuLmxhc3QoKS5yZW1vdmUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGl0ZW0ub25FcnJvciA9ICgpID0+IHtcbiAgICAgICAgICBpZiAoYXRvbS5jb25maWcuZ2V0KCdmdHAtcmVtb3RlLWVkaXQubm90aWZpY2F0aW9ucy5vcGVuUHJvdG9jb2xWaWV3T25FcnJvcicpKSB7XG4gICAgICAgICAgICBhdG9tLndvcmtzcGFjZS5vcGVuKEZUUF9SRU1PVEVfRURJVF9QUk9UT0NPTF9VUkkpO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvLyBUT0RPXG4gICAgICAgIH07XG5cbiAgICAgICAgaXRlbS5vblRyYW5zZmVycmluZyA9ICgpID0+IHsgICAgIFxuICAgICAgICAgIC8vIFRPRE9cbiAgICAgICAgfTtcblxuICAgICAgICBpdGVtLm9uRmluaXNoZWQgPSAoKSA9PiB7XG4gICAgICAgICAgLy9UT0RPXG4gICAgICAgIH07XG4gICAgICB9O1xuICAgIH0gY2F0Y2ggKGUpIHsgY29uc29sZS5sb2coZSk7IH1cbiAgfVxuXG4gIGRlc3Ryb3koKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG5cbiAgICBzZWxmLnJlbW92ZSgpO1xuICB9XG5cbiAgZ2V0VGl0bGUoKSB7XG4gICAgcmV0dXJuIFwiUmVtb3RlIFRyYW5zZmVyIExvZ1wiO1xuICB9XG5cbiAgZ2V0SWNvbk5hbWUoKSB7XG4gICAgcmV0dXJuIFwibGlzdC11bm9yZGVyZWRcIjtcbiAgfVxuXG4gIGdldFVSSSgpIHtcbiAgICByZXR1cm4gRlRQX1JFTU9URV9FRElUX1BST1RPQ09MX1VSSTtcbiAgfVxuXG4gIGdldEFsbG93ZWRMb2NhdGlvbnMoKSB7XG4gICAgcmV0dXJuIFtcImJvdHRvbVwiXTtcbiAgfVxuXG4gIGdldERlZmF1bHRMb2NhdGlvbigpIHtcbiAgICByZXR1cm4gXCJib3R0b21cIjtcbiAgfVxuXG4gIHRvZ2dsZSgpIHtcbiAgICBhdG9tLndvcmtzcGFjZS50b2dnbGUodGhpcyk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBQcm90b2NvbFZpZXc7XG4iXX0=