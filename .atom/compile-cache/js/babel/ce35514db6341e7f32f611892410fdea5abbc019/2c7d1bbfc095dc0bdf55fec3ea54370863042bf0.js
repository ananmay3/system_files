var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x6, _x7, _x8) { var _again = true; _function: while (_again) { var object = _x6, property = _x7, receiver = _x8; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x6 = parent; _x7 = property; _x8 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _atomSpacePenViews = require('atom-space-pen-views');

var _helperFormatJs = require('./../helper/format.js');

'use babel';

var md5 = require('md5');
var Path = require('path');
var getIconServices = require('./../helper/icon.js');

var FileView = (function (_View) {
  _inherits(FileView, _View);

  function FileView() {
    _classCallCheck(this, FileView);

    _get(Object.getPrototypeOf(FileView.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(FileView, [{
    key: 'serialize',
    value: function serialize() {
      var self = this;

      return {
        id: self.id,
        config: self.config,
        name: self.name,
        size: self.size,
        rights: self.rights,
        path: self.getPath(false)
      };
    }
  }, {
    key: 'initialize',
    value: function initialize(parent, file) {
      var self = this;

      self.parent = parent;
      self.config = parent.config;

      self.name = file.name;
      self.size = file.size;
      self.rights = file.rights;
      self.id = self.getId();

      // Add filename
      self.label.text(self.name);

      // Add file icon
      getIconServices().updateFileIcon(self);

      self.attr('data-name', self.name);
      self.attr('data-host', self.config.host);
      self.attr('data-size', self.size);
      self.attr('id', self.id);

      // Events
      self.on('click', function (e) {
        e.stopPropagation();
        if (atom.config.get('ftp-remote-edit.tree.allowPendingPaneItems')) {
          atom.commands.dispatch(atom.views.getView(atom.workspace), 'ftp-remote-edit:open-file-pending');
        }
      });
      self.on('dblclick', function (e) {
        e.stopPropagation();
        atom.commands.dispatch(atom.views.getView(atom.workspace), 'ftp-remote-edit:open-file');
      });

      // Drag & Drop
      self.on('dragstart', function (e) {
        return self.onDragStart(e);
      });
      self.on('dragenter', function (e) {
        return self.onDragEnter(e);
      });
      self.on('dragleave', function (e) {
        return self.onDragLeave(e);
      });
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      var self = this;

      self.remove();
    }
  }, {
    key: 'getId',
    value: function getId() {
      var self = this;

      return 'ftp-remote-edit-' + md5(self.getPath(false) + self.name);
    }
  }, {
    key: 'getRoot',
    value: function getRoot() {
      var self = this;

      return self.parent.getRoot();
    }
  }, {
    key: 'getPath',
    value: function getPath() {
      var useRemote = arguments.length <= 0 || arguments[0] === undefined ? true : arguments[0];

      var self = this;

      return (0, _helperFormatJs.normalize)(self.parent.getPath(useRemote));
    }
  }, {
    key: 'getLocalPath',
    value: function getLocalPath() {
      var useRemote = arguments.length <= 0 || arguments[0] === undefined ? true : arguments[0];

      var self = this;

      return (0, _helperFormatJs.normalize)(self.parent.getLocalPath(useRemote), Path.sep);
    }
  }, {
    key: 'getConnector',
    value: function getConnector() {
      var self = this;

      return self.getRoot().getConnector();
    }
  }, {
    key: 'addSyncIcon',
    value: function addSyncIcon() {
      var element = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

      var self = this;

      if (!element) element = self;
      if (!element.label) return;

      element.label.addClass('icon-sync').addClass('spin');
    }
  }, {
    key: 'removeSyncIcon',
    value: function removeSyncIcon() {
      var element = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

      var self = this;

      if (!element) element = self;
      if (!element.label) return;

      element.label.removeClass('icon-sync').removeClass('spin');
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
  }, {
    key: 'isVisible',
    value: function isVisible() {
      var self = this;

      return self.parent.isExpanded();
    }
  }, {
    key: 'onDragStart',
    value: function onDragStart(e) {
      var self = this;

      var initialPath = undefined;

      if (entry = e.target.closest('.entry.file')) {
        e.stopPropagation();
        initialPath = self.getPath(false) + self.name;

        if (e.dataTransfer) {
          e.dataTransfer.effectAllowed = "move";
          e.dataTransfer.setData("initialPath", initialPath);
          e.dataTransfer.setData("initialType", "file");
          e.dataTransfer.setData("initialName", self.name);
        } else if (e.originalEvent.dataTransfer) {
          e.originalEvent.dataTransfer.effectAllowed = "move";
          e.originalEvent.dataTransfer.setData("initialPath", initialPath);
          e.originalEvent.dataTransfer.setData("initialType", "file");
          e.originalEvent.dataTransfer.setData("initialName", self.name);
        }
      }
    }
  }, {
    key: 'onDragEnter',
    value: function onDragEnter(e) {
      var self = this;

      var entry = undefined,
          initialType = undefined;

      if (entry = e.target.closest('.entry.file')) {
        e.stopPropagation();

        if (e.dataTransfer) {
          initialType = e.dataTransfer.getData("initialType");
        } else {
          initialType = e.originalEvent.dataTransfer.getData("initialType");
        }

        if (initialType == "server") {
          return;
        }

        (0, _atomSpacePenViews.$)(entry).view().select();
      }
    }
  }, {
    key: 'onDragLeave',
    value: function onDragLeave(e) {
      var self = this;

      var entry = undefined,
          initialType = undefined;

      if (entry = e.target.closest('.entry.file')) {
        e.stopPropagation();

        if (e.dataTransfer) {
          initialType = e.dataTransfer.getData("initialType");
        } else {
          initialType = e.originalEvent.dataTransfer.getData("initialType");
        }

        if (initialType == "server") {
          return;
        }

        (0, _atomSpacePenViews.$)(entry).view().deselect();
      }
    }
  }], [{
    key: 'content',
    value: function content() {
      var _this = this;

      return this.li({
        'class': 'file entry list-item'
      }, function () {
        return _this.span({
          'class': 'name icon',
          outlet: 'label'
        });
      });
    }
  }]);

  return FileView;
})(_atomSpacePenViews.View);

module.exports = FileView;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2FuYW5tYXlqYWluLy5hdG9tL3BhY2thZ2VzL2Z0cC1yZW1vdGUtZWRpdC9saWIvdmlld3MvZmlsZS12aWV3LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O2lDQUV3QixzQkFBc0I7OzhCQUNwQix1QkFBdUI7O0FBSGpELFdBQVcsQ0FBQzs7QUFLWixJQUFNLEdBQUcsR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDM0IsSUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQzdCLElBQU0sZUFBZSxHQUFHLE9BQU8sQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDOztJQUVqRCxRQUFRO1lBQVIsUUFBUTs7V0FBUixRQUFROzBCQUFSLFFBQVE7OytCQUFSLFFBQVE7OztlQUFSLFFBQVE7O1dBV0gscUJBQUc7QUFDVixVQUFNLElBQUksR0FBRyxJQUFJLENBQUM7O0FBRWxCLGFBQU87QUFDTCxVQUFFLEVBQUUsSUFBSSxDQUFDLEVBQUU7QUFDWCxjQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU07QUFDbkIsWUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJO0FBQ2YsWUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJO0FBQ2YsY0FBTSxFQUFFLElBQUksQ0FBQyxNQUFNO0FBQ25CLFlBQUksRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQztPQUMxQixDQUFDO0tBQ0g7OztXQUVTLG9CQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUU7QUFDdkIsVUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDOztBQUVsQixVQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztBQUNyQixVQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUM7O0FBRTVCLFVBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztBQUN0QixVQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7QUFDdEIsVUFB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R0FBRyxJQUFJLENBQUM7O0FBRWxCLFVBQUksS0FBSyxZQUFBO1VBQUUsV0FBVyxZQUFBLENBQUM7O0FBRXZCLFVBQUksS0FBSyxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxFQUFFO0FBQzNDLFNBQUMsQ0FBQyxlQUFlLEVBQUUsQ0FBQzs7QUFFcEIsWUFBSSxDQUFDLENBQUMsWUFBWSxFQUFFO0FBQ2xCLHFCQUFXLEdBQUcsQ0FBQyxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUM7U0FDckQsTUFBTTtBQUNMLHFCQUFXLEdBQUcsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDO1NBQ25FOztBQUVELFlBQUksV0FBVyxJQUFJLFFBQVEsRUFBRTtBQUMzQixpQkFBTztTQUNSOztBQUVELGtDQUFFLEtBQUssQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLFFBQVEsRUFBRSxDQUFDO09BQzVCO0tBQ0Y7OztXQW5OYSxtQkFBRzs7O0FBQ2YsYUFBTyxJQUFJLENBQUMsRUFBRSxDQUFDO0FBQ2IsaUJBQU8sc0JBQXNCO09BQzlCLEVBQUU7ZUFBTSxNQUFLLElBQUksQ0FBQztBQUNqQixtQkFBTyxXQUFXO0FBQ2xCLGdCQUFNLEVBQUUsT0FBTztTQUNoQixDQUFDO09BQUEsQ0FBQyxDQUFDO0tBQ0w7OztTQVRHLFFBQVE7OztBQXdOZCxNQUFNLENBQUMsT0FBTyxHQUFHLFFBQVEsQ0FBQyIsImZpbGUiOiIvaG9tZS9hbmFubWF5amFpbi8uYXRvbS9wYWNrYWdlcy9mdHAtcmVtb3RlLWVkaXQvbGliL3ZpZXdzL2ZpbGUtdmlldy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG5pbXBvcnQgeyAkLCBWaWV3IH0gZnJvbSAnYXRvbS1zcGFjZS1wZW4tdmlld3MnO1xuaW1wb3J0IHsgbm9ybWFsaXplIH0gZnJvbSAnLi8uLi9oZWxwZXIvZm9ybWF0LmpzJztcblxuY29uc3QgbWQ1ID0gcmVxdWlyZSgnbWQ1Jyk7XG5jb25zdCBQYXRoID0gcmVxdWlyZSgncGF0aCcpO1xuY29uc3QgZ2V0SWNvblNlcnZpY2VzID0gcmVxdWlyZSgnLi8uLi9oZWxwZXIvaWNvbi5qcycpO1xuXG5jbGFzcyBGaWxlVmlldyBleHRlbmRzIFZpZXcge1xuXG4gIHN0YXRpYyBjb250ZW50KCkge1xuICAgIHJldHVybiB0aGlzLmxpKHtcbiAgICAgIGNsYXNzOiAnZmlsZSBlbnRyeSBsaXN0LWl0ZW0nLFxuICAgIH0sICgpID0+IHRoaXMuc3Bhbih7XG4gICAgICBjbGFzczogJ25hbWUgaWNvbicsXG4gICAgICBvdXRsZXQ6ICdsYWJlbCcsXG4gICAgfSkpO1xuICB9XG5cbiAgc2VyaWFsaXplKCkge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIGlkOiBzZWxmLmlkLFxuICAgICAgY29uZmlnOiBzZWxmLmNvbmZpZyxcbiAgICAgIG5hbWU6IHNlbGYubmFtZSxcbiAgICAgIHNpemU6IHNlbGYuc2l6ZSxcbiAgICAgIHJpZ2h0czogc2VsZi5yaWdodHMsXG4gICAgICBwYXRoOiBzZWxmLmdldFBhdGgoZmFsc2UpLFxuICAgIH07XG4gIH1cblxuICBpbml0aWFsaXplKHBhcmVudCwgZmlsZSkge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuXG4gICAgc2VsZi5wYXJlbnQgPSBwYXJlbnQ7XG4gICAgc2VsZi5jb25maWcgPSBwYXJlbnQuY29uZmlnO1xuXG4gICAgc2VsZi5uYW1lID0gZmlsZS5uYW1lO1xuICAgIHNlbGYuc2l6ZSA9IGZpbGUuc2l6ZTtcbiAgICBzZWxmLnJpZ2h0cyA9IGZpbGUucmlnaHRzO1xuICAgIHNlbGYuaWQgPSBzZWxmLmdldElkKCk7XG5cbiAgICAvLyBBZGQgZmlsZW5hbWVcbiAgICBzZWxmLmxhYmVsLnRleHQoc2VsZi5uYW1lKTtcblxuICAgIC8vIEFkZCBmaWxlIGljb25cbiAgICBnZXRJY29uU2VydmljZXMoKS51cGRhdGVGaWxlSWNvbihzZWxmKTtcblxuICAgIHNlbGYuYXR0cignZGF0YS1uYW1lJywgc2VsZi5uYW1lKTtcbiAgICBzZWxmLmF0dHIoJ2RhdGEtaG9zdCcsIHNlbGYuY29uZmlnLmhvc3QpO1xuICAgIHNlbGYuYXR0cignZGF0YS1zaXplJywgc2VsZi5zaXplKTtcbiAgICBzZWxmLmF0dHIoJ2lkJywgc2VsZi5pZCk7XG5cbiAgICAvLyBFdmVudHNcbiAgICBzZWxmLm9uKCdjbGljaycsIChlKSA9PiB7XG4gICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgaWYgKGF0b20uY29uZmlnLmdldCgnZnRwLXJlbW90ZS1lZGl0LnRyZWUuYWxsb3dQZW5kaW5nUGFuZUl0ZW1zJykpIHtcbiAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChhdG9tLnZpZXdzLmdldFZpZXcoYXRvbS53b3Jrc3BhY2UpLCAnZnRwLXJlbW90ZS1lZGl0Om9wZW4tZmlsZS1wZW5kaW5nJyk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgc2VsZi5vbignZGJsY2xpY2snLCAoZSkgPT4ge1xuICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goYXRvbS52aWV3cy5nZXRWaWV3KGF0b20ud29ya3NwYWNlKSwgJ2Z0cC1yZW1vdGUtZWRpdDpvcGVuLWZpbGUnKTtcbiAgICB9KTtcblxuICAgIC8vIERyYWcgJiBEcm9wXG4gICAgc2VsZi5vbignZHJhZ3N0YXJ0JywgKGUpID0+IHNlbGYub25EcmFnU3RhcnQoZSkpO1xuICAgIHNlbGYub24oJ2RyYWdlbnRlcicsIChlKSA9PiBzZWxmLm9uRHJhZ0VudGVyKGUpKTtcbiAgICBzZWxmLm9uKCdkcmFnbGVhdmUnLCAoZSkgPT4gc2VsZi5vbkRyYWdMZWF2ZShlKSk7XG4gIH1cblxuICBkZXN0cm95KCkge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuXG4gICAgc2VsZi5yZW1vdmUoKTtcbiAgfVxuXG4gIGdldElkKCkge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuXG4gICAgcmV0dXJuICdmdHAtcmVtb3RlLWVkaXQtJyArIG1kNShzZWxmLmdldFBhdGgoZmFsc2UpICsgc2VsZi5uYW1lKTtcbiAgfVxuXG4gIGdldFJvb3QoKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG5cbiAgICByZXR1cm4gc2VsZi5wYXJlbnQuZ2V0Um9vdCgpO1xuICB9XG5cbiAgZ2V0UGF0aCh1c2VSZW1vdGUgPSB0cnVlKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG5cbiAgICByZXR1cm4gbm9ybWFsaXplKHNlbGYucGFyZW50LmdldFBhdGgodXNlUmVtb3RlKSk7XG4gIH1cblxuICBnZXRMb2NhbFBhdGgodXNlUmVtb3RlID0gdHJ1ZSkge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuXG4gICAgcmV0dXJuIG5vcm1hbGl6ZShzZWxmLnBhcmVudC5nZXRMb2NhbFBhdGgodXNlUmVtb3RlKSwgUGF0aC5zZXApO1xuICB9XG5cbiAgZ2V0Q29ubmVjdG9yKCkge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuXG4gICAgcmV0dXJuIHNlbGYuZ2V0Um9vdCgpLmdldENvbm5lY3RvcigpO1xuICB9XG5cbiAgYWRkU3luY0ljb24oZWxlbWVudCA9IG51bGwpIHtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcblxuICAgIGlmICghZWxlbWVudCkgZWxlbWVudCA9IHNlbGY7XG4gICAgaWYgKCFlbGVtZW50LmxhYmVsKSByZXR1cm47XG5cbiAgICBlbGVtZW50LmxhYmVsLmFkZENsYXNzKCdpY29uLXN5bmMnKS5hZGRDbGFzcygnc3BpbicpO1xuICB9XG5cbiAgcmVtb3ZlU3luY0ljb24oZWxlbWVudCA9IG51bGwpIHtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcblxuICAgIGlmICghZWxlbWVudCkgZWxlbWVudCA9IHNlbGY7XG4gICAgaWYgKCFlbGVtZW50LmxhYmVsKSByZXR1cm47XG5cbiAgICBlbGVtZW50LmxhYmVsLnJlbW92ZUNsYXNzKCdpY29uLXN5bmMnKS5yZW1vdmVDbGFzcygnc3BpbicpO1xuICB9XG5cbiAgc2VsZWN0KGRlc2VsZWN0QWxsT3RoZXIgPSB0cnVlKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG5cbiAgICBpZiAoZGVzZWxlY3RBbGxPdGhlcikge1xuICAgICAgZWxlbWVudHNUb0Rlc2VsZWN0ID0gJCgnLmZ0cC1yZW1vdGUtZWRpdC12aWV3IC5zZWxlY3RlZCcpO1xuICAgICAgZm9yIChpID0gMCwgbGVuID0gZWxlbWVudHNUb0Rlc2VsZWN0Lmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgIHNlbGVjdGVkID0gZWxlbWVudHNUb0Rlc2VsZWN0W2ldO1xuICAgICAgICAkKHNlbGVjdGVkKS5yZW1vdmVDbGFzcygnc2VsZWN0ZWQnKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoIXNlbGYuaGFzQ2xhc3MoJ3NlbGVjdGVkJykpIHtcbiAgICAgIHNlbGYuYWRkQ2xhc3MoJ3NlbGVjdGVkJyk7XG4gICAgfVxuICB9XG5cbiAgZGVzZWxlY3QoKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG5cbiAgICBpZiAoc2VsZi5oYXNDbGFzcygnc2VsZWN0ZWQnKSkge1xuICAgICAgc2VsZi5yZW1vdmVDbGFzcygnc2VsZWN0ZWQnKTtcbiAgICB9XG4gIH1cblxuICBpc1Zpc2libGUoKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG5cbiAgICByZXR1cm4gc2VsZi5wYXJlbnQuaXNFeHBhbmRlZCgpO1xuICB9XG5cbiAgb25EcmFnU3RhcnQoZSkge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuXG4gICAgbGV0IGluaXRpYWxQYXRoO1xuXG4gICAgaWYgKGVudHJ5ID0gZS50YXJnZXQuY2xvc2VzdCgnLmVudHJ5LmZpbGUnKSkge1xuICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgIGluaXRpYWxQYXRoID0gc2VsZi5nZXRQYXRoKGZhbHNlKSArIHNlbGYubmFtZTtcblxuICAgICAgaWYgKGUuZGF0YVRyYW5zZmVyKSB7XG4gICAgICAgIGUuZGF0YVRyYW5zZmVyLmVmZmVjdEFsbG93ZWQgPSBcIm1vdmVcIjtcbiAgICAgICAgZS5kYXRhVHJhbnNmZXIuc2V0RGF0YShcImluaXRpYWxQYXRoXCIsIGluaXRpYWxQYXRoKTtcbiAgICAgICAgZS5kYXRhVHJhbnNmZXIuc2V0RGF0YShcImluaXRpYWxUeXBlXCIsIFwiZmlsZVwiKTtcbiAgICAgICAgZS5kYXRhVHJhbnNmZXIuc2V0RGF0YShcImluaXRpYWxOYW1lXCIsIHNlbGYubmFtZSk7XG4gICAgICB9IGVsc2UgaWYgKGUub3JpZ2luYWxFdmVudC5kYXRhVHJhbnNmZXIpIHtcbiAgICAgICAgZS5vcmlnaW5hbEV2ZW50LmRhdGFUcmFuc2Zlci5lZmZlY3RBbGxvd2VkID0gXCJtb3ZlXCI7XG4gICAgICAgIGUub3JpZ2luYWxFdmVudC5kYXRhVHJhbnNmZXIuc2V0RGF0YShcImluaXRpYWxQYXRoXCIsIGluaXRpYWxQYXRoKTtcbiAgICAgICAgZS5vcmlnaW5hbEV2ZW50LmRhdGFUcmFuc2Zlci5zZXREYXRhKFwiaW5pdGlhbFR5cGVcIiwgXCJmaWxlXCIpO1xuICAgICAgICBlLm9yaWdpbmFsRXZlbnQuZGF0YVRyYW5zZmVyLnNldERhdGEoXCJpbml0aWFsTmFtZVwiLCBzZWxmLm5hbWUpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIG9uRHJhZ0VudGVyKGUpIHtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcblxuICAgIGxldCBlbnRyeSwgaW5pdGlhbFR5cGU7XG5cbiAgICBpZiAoZW50cnkgPSBlLnRhcmdldC5jbG9zZXN0KCcuZW50cnkuZmlsZScpKSB7XG4gICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuXG4gICAgICBpZiAoZS5kYXRhVHJhbnNmZXIpIHtcbiAgICAgICAgaW5pdGlhbFR5cGUgPSBlLmRhdGFUcmFuc2Zlci5nZXREYXRhKFwiaW5pdGlhbFR5cGVcIik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpbml0aWFsVHlwZSA9IGUub3JpZ2luYWxFdmVudC5kYXRhVHJhbnNmZXIuZ2V0RGF0YShcImluaXRpYWxUeXBlXCIpO1xuICAgICAgfVxuXG4gICAgICBpZiAoaW5pdGlhbFR5cGUgPT0gXCJzZXJ2ZXJcIikge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgICQoZW50cnkpLnZpZXcoKS5zZWxlY3QoKTtcbiAgICB9XG4gIH1cblxuICBvbkRyYWdMZWF2ZShlKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG5cbiAgICBsZXQgZW50cnksIGluaXRpYWxUeXBlO1xuXG4gICAgaWYgKGVudHJ5ID0gZS50YXJnZXQuY2xvc2VzdCgnLmVudHJ5LmZpbGUnKSkge1xuICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcblxuICAgICAgaWYgKGUuZGF0YVRyYW5zZmVyKSB7XG4gICAgICAgIGluaXRpYWxUeXBlID0gZS5kYXRhVHJhbnNmZXIuZ2V0RGF0YShcImluaXRpYWxUeXBlXCIpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaW5pdGlhbFR5cGUgPSBlLm9yaWdpbmFsRXZlbnQuZGF0YVRyYW5zZmVyLmdldERhdGEoXCJpbml0aWFsVHlwZVwiKTtcbiAgICAgIH1cblxuICAgICAgaWYgKGluaXRpYWxUeXBlID09IFwic2VydmVyXCIpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAkKGVudHJ5KS52aWV3KCkuZGVzZWxlY3QoKTtcbiAgICB9XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBGaWxlVmlldztcbiJdfQ==