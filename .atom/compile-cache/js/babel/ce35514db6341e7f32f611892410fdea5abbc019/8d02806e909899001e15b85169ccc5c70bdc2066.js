var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _atomSpacePenViews = require('atom-space-pen-views');

var _serverViewJs = require('./server-view.js');

var _serverViewJs2 = _interopRequireDefault(_serverViewJs);

var _helperHelperJs = require('./../helper/helper.js');

'use babel';

var FolderView = (function (_View) {
  _inherits(FolderView, _View);

  function FolderView() {
    _classCallCheck(this, FolderView);

    _get(Object.getPrototypeOf(FolderView.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(FolderView, [{
    key: 'initialize',
    value: function initialize(config, parent) {
      var self = this;

      self.onDidAddServer = function (server) {};
      self.onDidAddFolder = function (folder) {};

      self.config = config;
      self.parent = parent;
      self.expanded = false;

      self.name = self.config.name;
      self.children = self.config.children;
      self.id = self.config.id;

      self.label.text(self.name);
      self.label.addClass('icon-file-submodule');

      self.attr('id', self.id);

      // Events
      self.on('click', function (e) {
        e.stopPropagation();
        self.toggle();
      });
      self.on('dblclick', function (e) {
        e.stopPropagation();
      });

      // Drag & Drop
      self.on('dragstart', function (e) {
        e.stopPropagation();return false;
      });
      self.on('dragenter', function (e) {
        e.stopPropagation();return false;
      });
      self.on('dragleave', function (e) {
        e.stopPropagation();return false;
      });
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      var self = this;

      this.remove();
    }
  }, {
    key: 'getRoot',
    value: function getRoot() {
      var self = this;

      return self.parent.getRoot();
    }
  }, {
    key: 'expand',
    value: function expand() {
      var self = this;

      self.expanded = true;
      self.addClass('expanded').removeClass('collapsed');

      self.entries.children().detach();

      self.children.forEach(function (config) {
        if (typeof config.children !== 'undefined') {
          self.addFolder(config);
        } else {
          self.addServer(config);
        }
      });
    }
  }, {
    key: 'isExpanded',
    value: function isExpanded() {
      var self = this;

      return self.expanded;
    }
  }, {
    key: 'addServer',
    value: function addServer(config) {
      var self = this;

      var server = new _serverViewJs2['default'](config);

      self.onDidAddServer(server);

      self.entries.append(server);
    }
  }, {
    key: 'addFolder',
    value: function addFolder(config) {
      var self = this;

      var folder = new FolderView(config, self);

      folder.onDidAddServer = function (server) {
        self.onDidAddServer(server);
      };
      self.onDidAddFolder(folder);

      self.entries.append(folder);
    }
  }, {
    key: 'collapse',
    value: function collapse() {
      var self = this;

      self.expanded = false;
      self.addClass('collapsed').removeClass('expanded');

      if (self.entries.children().length > 0) {
        var childNodes = Array.from(self.entries.children());
        childNodes.forEach(function (childNode) {
          var child = (0, _atomSpacePenViews.$)(childNode).view();
          if (child.isExpanded()) {
            child.collapse();
          }
        });
      }
    }
  }, {
    key: 'toggle',
    value: function toggle() {
      var self = this;

      if (self.expanded) {
        self.collapse();
      } else {
        self.expand();
      }
    }
  }, {
    key: 'select',
    value: function select() {
      var deselectAllOther = arguments.length <= 0 || arguments[0] === undefined ? true : arguments[0];

      var self = this;

      if (deselectAllOther) {
        elementsToDeselect = (0, _atomSpacePenViews.$)('.ftp-remote-edit-view .selected');
        for (i = 0, len = elementsToDeselect.length; i < len; i++) {
          selected = elementsToDeselect[i];
          (0, _atomSpacePenViews.$)(selected).removeClass('selected');
        }
      }

      if (!self.hasClass('selected')) {
        self.addClass('selected');
      }
    }
  }, {
    key: 'deselect',
    value: function deselect() {
      var self = this;

      if (self.hasClass('selected')) {
        self.removeClass('selected');
      }
    }
  }], [{
    key: 'content',
    value: function content() {
      var _this = this;

      return this.li({
        'class': 'folder entry list-nested-item project-root collapsed'
      }, function () {
        _this.div({
          'class': 'header list-item project-root-header',
          outlet: 'header'
        }, function () {
          return _this.span({
            'class': 'name icon',
            outlet: 'label'
          });
        });
        _this.ol({
          'class': 'entries list-tree',
          outlet: 'entries'
        });
      });
    }
  }]);

  return FolderView;
})(_atomSpacePenViews.View);

module.exports = FolderView;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2FuYW5tYXlqYWluLy5hdG9tL3BhY2thZ2VzL2Z0cC1yZW1vdGUtZWRpdC9saWIvdmlld3MvZm9sZGVyLXZpZXcuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztpQ0FFd0Isc0JBQXNCOzs0QkFDdkIsa0JBQWtCOzs7OzhCQUNiLHVCQUF1Qjs7QUFKbkQsV0FBVyxDQUFDOztJQU1OLFVBQVU7WUFBVixVQUFVOztXQUFWLFVBQVU7MEJBQVYsVUFBVTs7K0JBQVYsVUFBVTs7O2VBQVYsVUFBVTs7V0FvQkosb0JBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRTtBQUN6QixVQUFNLElBQUksR0FBRyxJQUFJLENBQUM7O0FBRWxCLFVBQUksQ0FBQyxjQUFjLEdBQUcsVUFBQyxNQUFNLEVBQUssRUFBRyxDQUFBO0FBQ3JDLFVBQUksQ0FBQyxjQUFjLEdBQUcsVUFBQyxNQUFNLEVBQUssRUFBRyxDQUFBOztBQUVyQyxVQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztBQUNyQixVQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztBQUNyQixVQUFJLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQzs7QUFFdEIsVUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQztBQUM3QixVQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDO0FBQ3JDLFVBQUksQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUM7O0FBRXpCLFVBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUMzQixVQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDOztBQUczQyxVQUFJLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7OztBQUd6QixVQUFJLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxVQUFDLENBQUMsRUFBSztBQUN0QixTQUFDLENBQUMsZUFBZSxFQUFFLENBQUM7QUFDcEIsWUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO09BQ2YsQ0FBQyxDQUFDO0FBQ0gsVUFBSSxDQUFDLEVBQUUsQ0FBQyxVQUFVLEVBQUUsVUFBQyxDQUFDLEVBQUs7QUFBRSxTQUFDLENBQUMsZUFBZSxFQUFFLENBQUM7T0FBRSxDQUFDLENBQUM7OztBQUdyRCxVQUFJLENBQUMsRUFBRSxDQUFDLFdBQVcsRUFBRSxVQUFDLENBQUMsRUFBSztBQUFFLFNBQUMsQ0FBQyxlQUFlLEVBQUUsQ0FBQyxBQUFDLE9BQU8sS0FBSyxDQUFDO09BQUUsQ0FBQyxDQUFDO0FBQ3BFLFVBQUksQ0FBQyxFQUFFLENBQUMsV0FBVyxFQUFFLFVBQUMsQ0FBQyxFQUFLO0FBQUUsU0FBQyxDQUFDLGVBQWUsRUFBRSxDQUFDLEFBQUMsT0FBTyxLQUFLLENBQUM7T0FBRSxDQUFDLENBQUM7QUFDcEUsVUFBSSxDQUFDLEVBQUUsQ0FBQyxXQUFXLEVBQUUsVUFBQyxDQUFDLEVBQUs7QUFBRSxTQUFDLENBQUMsZUFBZSxFQUFFLENBQUMsQUFBQyxPQUFPLEtBQUssQ0FBQztPQUFFLENBQUMsQ0FBQztLQUVyRTs7O1dBRU0sbUJBQUc7QUFDUixVQUFNLElBQUksR0FBRyxJQUFJLENBQUM7O0FBRWxCLFVBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztLQUNmOzs7V0FFTSxtQkFBRztBQUNSLFVBQU0sSUFBSSxHQUFHLElBQUksQ0FBQzs7QUFFbEIsYUFBTyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDO0tBQzlCOzs7V0FFSyxrQkFBRztBQUNQLFVBQU0sSUFBSSxHQUFHLElBQUksQ0FBQzs7QUFFbEIsVUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7QUFDckIsVUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFDLENBQUM7O0FBRW5ELFVBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUMsTUFBTSxFQUFFLENBQUM7O0FBRWpDLFVBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLFVBQUMsTUFBTSxFQUFLO0FBQ2hDLFlBQUksT0FBTyxNQUFNLENBQUMsUUFBUSxLQUFLLFdBQVcsRUFBRTtBQUMxQyxjQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1NBQ3hCLE1BQU07QUFDTCxjQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1NBQ3hCO09BQ0YsQ0FBQyxDQUFDO0tBRUo7OztXQUVTLHNCQUFHO0FBQ1gsVUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDOztBQUVsQixhQUFPLElBQUksQ0FBQyxRQUFRLENBQUM7S0FFdEI7OztXQUVRLG1CQUFDLE1BQU0sRUFBRTtBQUNoQixVQUFNLElBQUksR0FBRyxJQUFJLENBQUM7O0FBRWxCLFVBQUksTUFBTSxHQUFHLDhCQUFlLE1BQU0sQ0FBQyxDQUFDOztBQUVwQyxVQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxDQUFDOztBQUU1QixVQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztLQUM3Qjs7O1dBRVEsbUJBQUMsTUFBTSxFQUFFO0FBQ2hCLFVBQU0sSUFBSSxHQUFHLElBQUksQ0FBQzs7QUFFbEIsVUFBSSxNQUFNLEdBQUcsSUFBSSxVQUFVLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDOztBQUUxQyxZQUFNLENBQUMsY0FBYyxHQUFHLFVBQUMsTUFBTSxFQUFLO0FBQ2xDLFlBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLENBQUM7T0FDN0IsQ0FBQztBQUNGLFVBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLENBQUM7O0FBRTVCLFVBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0tBQzdCOzs7V0FFTyxvQkFBRztBQUNULFVBQU0sSUFBSSxHQUFHLElBQUksQ0FBQzs7QUFFbEIsVUFBSSxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7QUFDdEIsVUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLENBQUM7O0FBRW5ELFVBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO0FBQ3RDLFlBQU0sVUFBVSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO0FBQ3ZELGtCQUFVLENBQUMsT0FBTyxDQUFDLFVBQUMsU0FBUyxFQUFLO0FBQ2hDLGNBQU0sS0FBSyxHQUFHLDBCQUFFLFNBQVMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO0FBQ2xDLGNBQUksS0FBSyxDQUFDLFVBQVUsRUFBRSxFQUFFO0FBQ3RCLGlCQUFLLENBQUMsUUFBUSxFQUFFLENBQUM7V0FDbEI7U0FDRixDQUFDLENBQUM7T0FDSjtLQUNGOzs7V0FFSyxrQkFBRztBQUNQLFVBQU0sSUFBSSxHQUFHLElBQUksQ0FBQzs7QUFFbEIsVUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFO0FBQ2pCLFlBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztPQUNqQixNQUFNO0FBQ0wsWUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO09BQ2Y7S0FDRjs7O1dBRUssa0JBQTBCO1VBQXpCLGdCQUFnQix5REFBRyxJQUFJOztBQUM1QixVQUFNLElBQUksR0FBRyxJQUFJLENBQUM7O0FBRWxCLFVBQUksZ0JBQWdCLEVBQUU7QUFDcEIsMEJBQWtCLEdBQUcsMEJBQUUsaUNBQWlDLENBQUMsQ0FBQztBQUMxRCxhQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxHQUFHLGtCQUFrQixDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQ3pELGtCQUFRLEdBQUcsa0JBQWtCLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDakMsb0NBQUUsUUFBUSxDQUFDLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1NBQ3JDO09BQ0Y7O0FBRUQsVUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLEVBQUU7QUFDOUIsWUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQztPQUMzQjtLQUNGOzs7V0FFTyxvQkFBRztBQUNULFVBQU0sSUFBSSxHQUFHLElBQUksQ0FBQzs7QUFFbEIsVUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxFQUFFO0FBQzdCLFlBQUksQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLENBQUM7T0FDOUI7S0FDRjs7O1dBakthLG1CQUFHOzs7QUFDZixhQUFPLElBQUksQ0FBQyxFQUFFLENBQUM7QUFDYixpQkFBTyxzREFBc0Q7T0FDOUQsRUFBRSxZQUFNO0FBQ1AsY0FBSyxHQUFHLENBQUM7QUFDUCxtQkFBTyxzQ0FBc0M7QUFDN0MsZ0JBQU0sRUFBRSxRQUFRO1NBQ2pCLEVBQUU7aUJBQU0sTUFBSyxJQUFJLENBQUM7QUFDakIscUJBQU8sV0FBVztBQUNsQixrQkFBTSxFQUFFLE9BQU87V0FDaEIsQ0FBQztTQUFBLENBQUMsQ0FBQztBQUNKLGNBQUssRUFBRSxDQUFDO0FBQ04sbUJBQU8sbUJBQW1CO0FBQzFCLGdCQUFNLEVBQUUsU0FBUztTQUNsQixDQUFDLENBQUM7T0FDSixDQUFDLENBQUM7S0FDSjs7O1NBbEJHLFVBQVU7OztBQXVLaEIsTUFBTSxDQUFDLE9BQU8sR0FBRyxVQUFVLENBQUMiLCJmaWxlIjoiL2hvbWUvYW5hbm1heWphaW4vLmF0b20vcGFja2FnZXMvZnRwLXJlbW90ZS1lZGl0L2xpYi92aWV3cy9mb2xkZXItdmlldy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG5pbXBvcnQgeyAkLCBWaWV3IH0gZnJvbSAnYXRvbS1zcGFjZS1wZW4tdmlld3MnO1xuaW1wb3J0IFNlcnZlclZpZXcgZnJvbSAnLi9zZXJ2ZXItdmlldy5qcyc7XG5pbXBvcnQgeyBzaG93TWVzc2FnZSB9IGZyb20gJy4vLi4vaGVscGVyL2hlbHBlci5qcyc7XG5cbmNsYXNzIEZvbGRlclZpZXcgZXh0ZW5kcyBWaWV3IHtcblxuICBzdGF0aWMgY29udGVudCgpIHtcbiAgICByZXR1cm4gdGhpcy5saSh7XG4gICAgICBjbGFzczogJ2ZvbGRlciBlbnRyeSBsaXN0LW5lc3RlZC1pdGVtIHByb2plY3Qtcm9vdCBjb2xsYXBzZWQnLFxuICAgIH0sICgpID0+IHtcbiAgICAgIHRoaXMuZGl2KHtcbiAgICAgICAgY2xhc3M6ICdoZWFkZXIgbGlzdC1pdGVtIHByb2plY3Qtcm9vdC1oZWFkZXInLFxuICAgICAgICBvdXRsZXQ6ICdoZWFkZXInLFxuICAgICAgfSwgKCkgPT4gdGhpcy5zcGFuKHtcbiAgICAgICAgY2xhc3M6ICduYW1lIGljb24nLFxuICAgICAgICBvdXRsZXQ6ICdsYWJlbCcsXG4gICAgICB9KSk7XG4gICAgICB0aGlzLm9sKHtcbiAgICAgICAgY2xhc3M6ICdlbnRyaWVzIGxpc3QtdHJlZScsXG4gICAgICAgIG91dGxldDogJ2VudHJpZXMnLFxuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICBpbml0aWFsaXplKGNvbmZpZywgcGFyZW50KSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG5cbiAgICBzZWxmLm9uRGlkQWRkU2VydmVyID0gKHNlcnZlcikgPT4geyB9XG4gICAgc2VsZi5vbkRpZEFkZEZvbGRlciA9IChmb2xkZXIpID0+IHsgfVxuXG4gICAgc2VsZi5jb25maWcgPSBjb25maWc7XG4gICAgc2VsZi5wYXJlbnQgPSBwYXJlbnQ7XG4gICAgc2VsZi5leHBhbmRlZCA9IGZhbHNlO1xuXG4gICAgc2VsZi5uYW1lID0gc2VsZi5jb25maWcubmFtZTtcbiAgICBzZWxmLmNoaWxkcmVuID0gc2VsZi5jb25maWcuY2hpbGRyZW47XG4gICAgc2VsZi5pZCA9IHNlbGYuY29uZmlnLmlkO1xuXG4gICAgc2VsZi5sYWJlbC50ZXh0KHNlbGYubmFtZSk7XG4gICAgc2VsZi5sYWJlbC5hZGRDbGFzcygnaWNvbi1maWxlLXN1Ym1vZHVsZScpO1xuXG5cbiAgICBzZWxmLmF0dHIoJ2lkJywgc2VsZi5pZCk7XG5cbiAgICAvLyBFdmVudHNcbiAgICBzZWxmLm9uKCdjbGljaycsIChlKSA9PiB7XG4gICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgc2VsZi50b2dnbGUoKTtcbiAgICB9KTtcbiAgICBzZWxmLm9uKCdkYmxjbGljaycsIChlKSA9PiB7IGUuc3RvcFByb3BhZ2F0aW9uKCk7IH0pO1xuXG4gICAgLy8gRHJhZyAmIERyb3BcbiAgICBzZWxmLm9uKCdkcmFnc3RhcnQnLCAoZSkgPT4geyBlLnN0b3BQcm9wYWdhdGlvbigpOyByZXR1cm4gZmFsc2U7IH0pO1xuICAgIHNlbGYub24oJ2RyYWdlbnRlcicsIChlKSA9PiB7IGUuc3RvcFByb3BhZ2F0aW9uKCk7IHJldHVybiBmYWxzZTsgfSk7XG4gICAgc2VsZi5vbignZHJhZ2xlYXZlJywgKGUpID0+IHsgZS5zdG9wUHJvcGFnYXRpb24oKTsgcmV0dXJuIGZhbHNlOyB9KTtcblxuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcblxuICAgIHRoaXMucmVtb3ZlKCk7XG4gIH1cblxuICBnZXRSb290KCkge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuXG4gICAgcmV0dXJuIHNlbGYucGFyZW50LmdldFJvb3QoKTtcbiAgfVxuXG4gIGV4cGFuZCgpIHtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcblxuICAgIHNlbGYuZXhwYW5kZWQgPSB0cnVlO1xuICAgIHNlbGYuYWRkQ2xhc3MoJ2V4cGFuZGVkJykucmVtb3ZlQ2xhc3MoJ2NvbGxhcHNlZCcpO1xuXG4gICAgc2VsZi5lbnRyaWVzLmNoaWxkcmVuKCkuZGV0YWNoKCk7XG5cbiAgICBzZWxmLmNoaWxkcmVuLmZvckVhY2goKGNvbmZpZykgPT4ge1xuICAgICAgaWYgKHR5cGVvZiBjb25maWcuY2hpbGRyZW4gIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHNlbGYuYWRkRm9sZGVyKGNvbmZpZyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzZWxmLmFkZFNlcnZlcihjb25maWcpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gIH1cblxuICBpc0V4cGFuZGVkKCkge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuXG4gICAgcmV0dXJuIHNlbGYuZXhwYW5kZWQ7XG5cbiAgfVxuXG4gIGFkZFNlcnZlcihjb25maWcpIHtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcblxuICAgIGxldCBzZXJ2ZXIgPSBuZXcgU2VydmVyVmlldyhjb25maWcpO1xuXG4gICAgc2VsZi5vbkRpZEFkZFNlcnZlcihzZXJ2ZXIpO1xuXG4gICAgc2VsZi5lbnRyaWVzLmFwcGVuZChzZXJ2ZXIpO1xuICB9XG5cbiAgYWRkRm9sZGVyKGNvbmZpZykge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuXG4gICAgbGV0IGZvbGRlciA9IG5ldyBGb2xkZXJWaWV3KGNvbmZpZywgc2VsZik7XG5cbiAgICBmb2xkZXIub25EaWRBZGRTZXJ2ZXIgPSAoc2VydmVyKSA9PiB7XG4gICAgICBzZWxmLm9uRGlkQWRkU2VydmVyKHNlcnZlcik7XG4gICAgfTtcbiAgICBzZWxmLm9uRGlkQWRkRm9sZGVyKGZvbGRlcik7XG5cbiAgICBzZWxmLmVudHJpZXMuYXBwZW5kKGZvbGRlcik7XG4gIH1cblxuICBjb2xsYXBzZSgpIHtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcblxuICAgIHNlbGYuZXhwYW5kZWQgPSBmYWxzZTtcbiAgICBzZWxmLmFkZENsYXNzKCdjb2xsYXBzZWQnKS5yZW1vdmVDbGFzcygnZXhwYW5kZWQnKTtcblxuICAgIGlmIChzZWxmLmVudHJpZXMuY2hpbGRyZW4oKS5sZW5ndGggPiAwKSB7XG4gICAgICBjb25zdCBjaGlsZE5vZGVzID0gQXJyYXkuZnJvbShzZWxmLmVudHJpZXMuY2hpbGRyZW4oKSk7XG4gICAgICBjaGlsZE5vZGVzLmZvckVhY2goKGNoaWxkTm9kZSkgPT4ge1xuICAgICAgICBjb25zdCBjaGlsZCA9ICQoY2hpbGROb2RlKS52aWV3KCk7XG4gICAgICAgIGlmIChjaGlsZC5pc0V4cGFuZGVkKCkpIHtcbiAgICAgICAgICBjaGlsZC5jb2xsYXBzZSgpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICB0b2dnbGUoKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG5cbiAgICBpZiAoc2VsZi5leHBhbmRlZCkge1xuICAgICAgc2VsZi5jb2xsYXBzZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICBzZWxmLmV4cGFuZCgpO1xuICAgIH1cbiAgfVxuXG4gIHNlbGVjdChkZXNlbGVjdEFsbE90aGVyID0gdHJ1ZSkge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuXG4gICAgaWYgKGRlc2VsZWN0QWxsT3RoZXIpIHtcbiAgICAgIGVsZW1lbnRzVG9EZXNlbGVjdCA9ICQoJy5mdHAtcmVtb3RlLWVkaXQtdmlldyAuc2VsZWN0ZWQnKTtcbiAgICAgIGZvciAoaSA9IDAsIGxlbiA9IGVsZW1lbnRzVG9EZXNlbGVjdC5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICBzZWxlY3RlZCA9IGVsZW1lbnRzVG9EZXNlbGVjdFtpXTtcbiAgICAgICAgJChzZWxlY3RlZCkucmVtb3ZlQ2xhc3MoJ3NlbGVjdGVkJyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKCFzZWxmLmhhc0NsYXNzKCdzZWxlY3RlZCcpKSB7XG4gICAgICBzZWxmLmFkZENsYXNzKCdzZWxlY3RlZCcpO1xuICAgIH1cbiAgfVxuXG4gIGRlc2VsZWN0KCkge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuXG4gICAgaWYgKHNlbGYuaGFzQ2xhc3MoJ3NlbGVjdGVkJykpIHtcbiAgICAgIHNlbGYucmVtb3ZlQ2xhc3MoJ3NlbGVjdGVkJyk7XG4gICAgfVxuICB9XG5cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBGb2xkZXJWaWV3O1xuIl19