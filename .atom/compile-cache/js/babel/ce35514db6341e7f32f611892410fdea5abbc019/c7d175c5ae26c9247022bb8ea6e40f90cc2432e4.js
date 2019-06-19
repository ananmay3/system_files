Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _atomSelectList = require('atom-select-list');

var _atomSelectList2 = _interopRequireDefault(_atomSelectList);

var _fuzzaldrin = require('fuzzaldrin');

var _fuzzaldrin2 = _interopRequireDefault(_fuzzaldrin);

var _fuzzaldrinPlus = require('fuzzaldrin-plus');

var _fuzzaldrinPlus2 = _interopRequireDefault(_fuzzaldrinPlus);

var _atom = require('atom');

var _helperHelperJs = require('./../helper/helper.js');

'use babel';

var EventEmitter = require('events');
var Path = require('path');

var FinderView = (function (_EventEmitter) {
  _inherits(FinderView, _EventEmitter);

  function FinderView() {
    var _this = this;

    _classCallCheck(this, FinderView);

    _get(Object.getPrototypeOf(FinderView.prototype), 'constructor', this).call(this);
    var self = this;

    self.subscriptions = null;
    self.items = [];
    self.itemsCache = null;
    self.root = null;

    self.selectListView = new _atomSelectList2['default']({
      items: [],
      maxResults: 25,
      emptyMessage: 'No files found…',
      filterKeyForItem: function filterKeyForItem(item) {
        if (atom.config.get('ftp-remote-edit.finder.filterKeyForItem') == "Filename") {
          return item.file;
        } else {
          return item.relativePath;
        }
      },
      didCancelSelection: function didCancelSelection() {
        self.cancel();
      },
      didConfirmSelection: function didConfirmSelection(item) {
        self.open(item);
        self.cancel();
      },
      elementForItem: function elementForItem(_ref) {
        var file = _ref.file;
        var relativePath = _ref.relativePath;

        var key = null;
        if (atom.config.get('ftp-remote-edit.finder.filterKeyForItem') == "Filename") {
          key = file;
        } else {
          key = relativePath;
        }
        var filterQuery = self.selectListView.getFilterQuery();
        var matches = self.useAlternateScoring ? _fuzzaldrin2['default'].match(key, filterQuery) : _fuzzaldrinPlus2['default'].match(key, filterQuery);
        var li = document.createElement('li');
        var fileBasename = Path.basename(relativePath);
        var baseOffset = relativePath.length - fileBasename.length;
        var primaryLine = document.createElement('div');
        var secondaryLine = document.createElement('div');

        li.classList.add('two-lines');

        primaryLine.classList.add('primary-line', 'file', 'icon-file-text');
        primaryLine.dataset.name = fileBasename;
        primaryLine.dataset.path = relativePath;
        if (atom.config.get('ftp-remote-edit.finder.filterKeyForItem') == "Filename") {
          primaryLine.appendChild((0, _helperHelperJs.highlight)(key, matches, 0));
        } else {
          primaryLine.appendChild((0, _helperHelperJs.highlight)(fileBasename, matches, baseOffset));
        }
        li.appendChild(primaryLine);

        secondaryLine.classList.add('secondary-line', 'path', 'no-icon');
        if (atom.config.get('ftp-remote-edit.finder.filterKeyForItem') == "Filename") {
          var fragment = (0, _helperHelperJs.highlight)(key, matches, 0);
          var beforefragment = document.createTextNode(relativePath.replace(fileBasename, ""));
          secondaryLine.appendChild(beforefragment);
          secondaryLine.appendChild(fragment);
        } else {
          secondaryLine.appendChild((0, _helperHelperJs.highlight)(key, matches, 0));
        }
        li.appendChild(secondaryLine);

        return li;
      },
      order: function order(item1, item2) {
        return item1.relativePath.length - item2.relativePath.length;
      }
    });

    // Add class to use stylesheets from this package
    self.selectListView.element.classList.add('remote-finder');

    self.subscriptions = new _atom.CompositeDisposable();
    self.subscriptions.add(atom.config.observe('remote-finder.useAlternateScoring', function (newValue) {
      _this.useAlternateScoring = newValue;
      if (_this.useAlternateScoring) {
        _this.selectListView.update({
          filter: function filter(items, query) {
            return query ? _fuzzaldrinPlus2['default'].filter(items, query, { key: atom.config.get('ftp-remote-edit.finder.filterKeyForItem') }) : items;
          }
        });
      } else {
        _this.selectListView.update({ filter: null });
      }
    }));
  }

  _createClass(FinderView, [{
    key: 'show',
    value: function show() {
      var self = this;

      self.previouslyFocusedElement = document.activeElement;
      if (!self.panel) {
        self.panel = atom.workspace.addModalPanel({ item: self });
      }
      self.panel.show();
      self.selectListView.focus();
      self.emit('ftp-remote-edit-finder:show');
    }
  }, {
    key: 'hide',
    value: function hide() {
      var self = this;

      if (self.panel) {
        self.panel.hide();
      }
      if (self.previouslyFocusedElement) {
        self.previouslyFocusedElement.focus();
        self.previouslyFocusedElement = null;
      }
      self.emit('ftp-remote-edit-finder:hide');
    }
  }, {
    key: 'cancel',
    value: function cancel() {
      var self = this;

      self.selectListView.reset();
      self.hide();
    }
  }, {
    key: 'toggle',
    value: function toggle() {
      var self = this;

      if (self.panel && self.panel.isVisible()) {
        self.cancel();
      } else {
        self.show();
      }
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      var self = this;

      if (self.panel) {
        self.panel.destroy();
      }

      if (self.subscriptions) {
        self.subscriptions.dispose();
        self.subscriptions = null;
      }
      return self.selectListView.destroy();
    }
  }, {
    key: 'open',
    value: function open(item) {
      var self = this;

      self.emit('ftp-remote-edit-finder:open', item);
    }
  }, {
    key: 'element',
    get: function get() {
      var self = this;

      return self.selectListView.element;
    }
  }]);

  return FinderView;
})(EventEmitter);

exports['default'] = FinderView;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2FuYW5tYXlqYWluLy5hdG9tL3BhY2thZ2VzL2Z0cC1yZW1vdGUtZWRpdC9saWIvdmlld3MvZmluZGVyLXZpZXcuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7OEJBRTJCLGtCQUFrQjs7OzswQkFDdEIsWUFBWTs7Ozs4QkFDUixpQkFBaUI7Ozs7b0JBQ1IsTUFBTTs7OEJBQ2hCLHVCQUF1Qjs7QUFOakQsV0FBVyxDQUFDOztBQVFaLElBQU0sWUFBWSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUN2QyxJQUFNLElBQUksR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7O0lBRVIsVUFBVTtZQUFWLFVBQVU7O0FBRWxCLFdBRlEsVUFBVSxHQUVmOzs7MEJBRkssVUFBVTs7QUFHM0IsK0JBSGlCLFVBQVUsNkNBR25CO0FBQ1IsUUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDOztBQUVsQixRQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQztBQUMxQixRQUFJLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQztBQUNoQixRQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQztBQUN2QixRQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQzs7QUFFakIsUUFBSSxDQUFDLGNBQWMsR0FBRyxnQ0FBbUI7QUFDdkMsV0FBSyxFQUFFLEVBQUU7QUFDVCxnQkFBVSxFQUFFLEVBQUU7QUFDZCxrQkFBWSxFQUFFLGlCQUFzQjtBQUNwQyxzQkFBZ0IsRUFBRSwwQkFBQyxJQUFJLEVBQUs7QUFDMUIsWUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyx5Q0FBeUMsQ0FBQyxJQUFJLFVBQVUsRUFBRTtBQUM1RSxpQkFBTyxJQUFJLENBQUMsSUFBSSxDQUFDO1NBQ2xCLE1BQU07QUFDTCxpQkFBTyxJQUFJLENBQUMsWUFBWSxDQUFDO1NBQzFCO09BQ0Y7QUFDRCx3QkFBa0IsRUFBRSw4QkFBTTtBQUFFLFlBQUksQ0FB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RU0sbUJBQUc7QUFDUixVQUFNLElBQUksR0FBRyxJQUFJLENBQUM7O0FBRWxCLFVBQUksSUFBSSxDQUFDLEtBQUssRUFBRTtBQUNkLFlBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUM7T0FDdEI7O0FBRUQsVUFBSSxJQUFJLENBQUMsYUFBYSxFQUFFO0FBQ3RCLFlBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDN0IsWUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUM7T0FDM0I7QUFDRCxhQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxFQUFFLENBQUM7S0FDdEM7OztXQUVHLGNBQUMsSUFBSSxFQUFFO0FBQ1QsVUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDOztBQUVsQixVQUFJLENBQUMsSUFBSSxDQUFDLDZCQUE2QixFQUFFLElBQUksQ0FBQyxDQUFDO0tBQ2hEOzs7U0FsRVUsZUFBRztBQUNaLFVBQU0sSUFBSSxHQUFHLElBQUksQ0FBQzs7QUFFbEIsYUFBTyxJQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQztLQUNwQzs7O1NBaEdrQixVQUFVO0dBQVMsWUFBWTs7cUJBQS9CLFVBQVUiLCJmaWxlIjoiL2hvbWUvYW5hbm1heWphaW4vLmF0b20vcGFja2FnZXMvZnRwLXJlbW90ZS1lZGl0L2xpYi92aWV3cy9maW5kZXItdmlldy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG5pbXBvcnQgU2VsZWN0TGlzdFZpZXcgZnJvbSAnYXRvbS1zZWxlY3QtbGlzdCdcbmltcG9ydCBmdXp6YWxkcmluIGZyb20gJ2Z1enphbGRyaW4nXG5pbXBvcnQgZnV6emFsZHJpblBsdXMgZnJvbSAnZnV6emFsZHJpbi1wbHVzJ1xuaW1wb3J0IHsgQ29tcG9zaXRlRGlzcG9zYWJsZSB9IGZyb20gJ2F0b20nXG5pbXBvcnQgeyBoaWdobGlnaHQgfSBmcm9tICcuLy4uL2hlbHBlci9oZWxwZXIuanMnO1xuXG5jb25zdCBFdmVudEVtaXR0ZXIgPSByZXF1aXJlKCdldmVudHMnKTtcbmNvbnN0IFBhdGggPSByZXF1aXJlKCdwYXRoJyk7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEZpbmRlclZpZXcgZXh0ZW5kcyBFdmVudEVtaXR0ZXIge1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKCk7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG5cbiAgICBzZWxmLnN1YnNjcmlwdGlvbnMgPSBudWxsO1xuICAgIHNlbGYuaXRlbXMgPSBbXTtcbiAgICBzZWxmLml0ZW1zQ2FjaGUgPSBudWxsO1xuICAgIHNlbGYucm9vdCA9IG51bGw7XG5cbiAgICBzZWxmLnNlbGVjdExpc3RWaWV3ID0gbmV3IFNlbGVjdExpc3RWaWV3KHtcbiAgICAgIGl0ZW1zOiBbXSxcbiAgICAgIG1heFJlc3VsdHM6IDI1LFxuICAgICAgZW1wdHlNZXNzYWdlOiAnTm8gZmlsZXMgZm91bmRcXHUyMDI2JyxcbiAgICAgIGZpbHRlcktleUZvckl0ZW06IChpdGVtKSA9PiB7XG4gICAgICAgIGlmIChhdG9tLmNvbmZpZy5nZXQoJ2Z0cC1yZW1vdGUtZWRpdC5maW5kZXIuZmlsdGVyS2V5Rm9ySXRlbScpID09IFwiRmlsZW5hbWVcIikge1xuICAgICAgICAgIHJldHVybiBpdGVtLmZpbGU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIGl0ZW0ucmVsYXRpdmVQYXRoO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgZGlkQ2FuY2VsU2VsZWN0aW9uOiAoKSA9PiB7IHNlbGYuY2FuY2VsKCk7IH0sXG4gICAgICBkaWRDb25maXJtU2VsZWN0aW9uOiAoaXRlbSkgPT4ge1xuICAgICAgICBzZWxmLm9wZW4oaXRlbSk7XG4gICAgICAgIHNlbGYuY2FuY2VsKCk7XG4gICAgICB9LFxuICAgICAgZWxlbWVudEZvckl0ZW06ICh7IGZpbGUsIHJlbGF0aXZlUGF0aCB9KSA9PiB7XG4gICAgICAgIGxldCBrZXkgPSBudWxsO1xuICAgICAgICBpZiAoYXRvbS5jb25maWcuZ2V0KCdmdHAtcmVtb3RlLWVkaXQuZmluZGVyLmZpbHRlcktleUZvckl0ZW0nKSA9PSBcIkZpbGVuYW1lXCIpIHtcbiAgICAgICAgICBrZXkgPSBmaWxlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGtleSA9IHJlbGF0aXZlUGF0aDtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBmaWx0ZXJRdWVyeSA9IHNlbGYuc2VsZWN0TGlzdFZpZXcuZ2V0RmlsdGVyUXVlcnkoKTtcbiAgICAgICAgY29uc3QgbWF0Y2hlcyA9IHNlbGYudXNlQWx0ZXJuYXRlU2NvcmluZyA/IGZ1enphbGRyaW4ubWF0Y2goa2V5LCBmaWx0ZXJRdWVyeSkgOiBmdXp6YWxkcmluUGx1cy5tYXRjaChrZXksIGZpbHRlclF1ZXJ5KTtcbiAgICAgICAgY29uc3QgbGkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaScpO1xuICAgICAgICBjb25zdCBmaWxlQmFzZW5hbWUgPSBQYXRoLmJhc2VuYW1lKHJlbGF0aXZlUGF0aCk7XG4gICAgICAgIGNvbnN0IGJhc2VPZmZzZXQgPSByZWxhdGl2ZVBhdGgubGVuZ3RoIC0gZmlsZUJhc2VuYW1lLmxlbmd0aDtcbiAgICAgICAgY29uc3QgcHJpbWFyeUxpbmUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgY29uc3Qgc2Vjb25kYXJ5TGluZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuXG4gICAgICAgIGxpLmNsYXNzTGlzdC5hZGQoJ3R3by1saW5lcycpO1xuXG4gICAgICAgIHByaW1hcnlMaW5lLmNsYXNzTGlzdC5hZGQoJ3ByaW1hcnktbGluZScsICdmaWxlJywgJ2ljb24tZmlsZS10ZXh0Jyk7XG4gICAgICAgIHByaW1hcnlMaW5lLmRhdGFzZXQubmFtZSA9IGZpbGVCYXNlbmFtZTtcbiAgICAgICAgcHJpbWFyeUxpbmUuZGF0YXNldC5wYXRoID0gcmVsYXRpdmVQYXRoO1xuICAgICAgICBpZiAoYXRvbS5jb25maWcuZ2V0KCdmdHAtcmVtb3RlLWVkaXQuZmluZGVyLmZpbHRlcktleUZvckl0ZW0nKSA9PSBcIkZpbGVuYW1lXCIpIHtcbiAgICAgICAgICBwcmltYXJ5TGluZS5hcHBlbmRDaGlsZChoaWdobGlnaHQoa2V5LCBtYXRjaGVzLCAwKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcHJpbWFyeUxpbmUuYXBwZW5kQ2hpbGQoaGlnaGxpZ2h0KGZpbGVCYXNlbmFtZSwgbWF0Y2hlcywgYmFzZU9mZnNldCkpO1xuICAgICAgICB9XG4gICAgICAgIGxpLmFwcGVuZENoaWxkKHByaW1hcnlMaW5lKTtcblxuICAgICAgICBzZWNvbmRhcnlMaW5lLmNsYXNzTGlzdC5hZGQoJ3NlY29uZGFyeS1saW5lJywgJ3BhdGgnLCAnbm8taWNvbicpO1xuICAgICAgICBpZiAoYXRvbS5jb25maWcuZ2V0KCdmdHAtcmVtb3RlLWVkaXQuZmluZGVyLmZpbHRlcktleUZvckl0ZW0nKSA9PSBcIkZpbGVuYW1lXCIpIHtcbiAgICAgICAgICBsZXQgZnJhZ21lbnQgPSBoaWdobGlnaHQoa2V5LCBtYXRjaGVzLCAwKVxuICAgICAgICAgIGxldCBiZWZvcmVmcmFnbWVudCA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHJlbGF0aXZlUGF0aC5yZXBsYWNlKGZpbGVCYXNlbmFtZSwgXCJcIikpO1xuICAgICAgICAgIHNlY29uZGFyeUxpbmUuYXBwZW5kQ2hpbGQoYmVmb3JlZnJhZ21lbnQpO1xuICAgICAgICAgIHNlY29uZGFyeUxpbmUuYXBwZW5kQ2hpbGQoZnJhZ21lbnQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHNlY29uZGFyeUxpbmUuYXBwZW5kQ2hpbGQoaGlnaGxpZ2h0KGtleSwgbWF0Y2hlcywgMCkpO1xuICAgICAgICB9XG4gICAgICAgIGxpLmFwcGVuZENoaWxkKHNlY29uZGFyeUxpbmUpO1xuXG4gICAgICAgIHJldHVybiBsaTtcbiAgICAgIH0sXG4gICAgICBvcmRlcjogKGl0ZW0xLCBpdGVtMikgPT4ge1xuICAgICAgICByZXR1cm4gaXRlbTEucmVsYXRpdmVQYXRoLmxlbmd0aCAtIGl0ZW0yLnJlbGF0aXZlUGF0aC5sZW5ndGg7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBBZGQgY2xhc3MgdG8gdXNlIHN0eWxlc2hlZXRzIGZyb20gdGhpcyBwYWNrYWdlXG4gICAgc2VsZi5zZWxlY3RMaXN0Vmlldy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoJ3JlbW90ZS1maW5kZXInKTtcblxuICAgIHNlbGYuc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gICAgc2VsZi5zdWJzY3JpcHRpb25zLmFkZChcbiAgICAgIGF0b20uY29uZmlnLm9ic2VydmUoJ3JlbW90ZS1maW5kZXIudXNlQWx0ZXJuYXRlU2NvcmluZycsIChuZXdWYWx1ZSkgPT4ge1xuICAgICAgICB0aGlzLnVzZUFsdGVybmF0ZVNjb3JpbmcgPSBuZXdWYWx1ZVxuICAgICAgICBpZiAodGhpcy51c2VBbHRlcm5hdGVTY29yaW5nKSB7XG4gICAgICAgICAgdGhpcy5zZWxlY3RMaXN0Vmlldy51cGRhdGUoe1xuICAgICAgICAgICAgZmlsdGVyOiAoaXRlbXMsIHF1ZXJ5KSA9PiB7XG4gICAgICAgICAgICAgIHJldHVybiBxdWVyeSA/IGZ1enphbGRyaW5QbHVzLmZpbHRlcihpdGVtcywgcXVlcnksIHsga2V5OiBhdG9tLmNvbmZpZy5nZXQoJ2Z0cC1yZW1vdGUtZWRpdC5maW5kZXIuZmlsdGVyS2V5Rm9ySXRlbScpIH0pIDogaXRlbXNcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuc2VsZWN0TGlzdFZpZXcudXBkYXRlKHsgZmlsdGVyOiBudWxsIH0pXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgKTtcbiAgfVxuXG4gIGdldCBlbGVtZW50KCkge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuXG4gICAgcmV0dXJuIHNlbGYuc2VsZWN0TGlzdFZpZXcuZWxlbWVudDtcbiAgfVxuXG4gIHNob3coKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG5cbiAgICBzZWxmLnByZXZpb3VzbHlGb2N1c2VkRWxlbWVudCA9IGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQ7XG4gICAgaWYgKCFzZWxmLnBhbmVsKSB7XG4gICAgICBzZWxmLnBhbmVsID0gYXRvbS53b3Jrc3BhY2UuYWRkTW9kYWxQYW5lbCh7IGl0ZW06IHNlbGYgfSk7XG4gICAgfVxuICAgIHNlbGYucGFuZWwuc2hvdygpO1xuICAgIHNlbGYuc2VsZWN0TGlzdFZpZXcuZm9jdXMoKTtcbiAgICBzZWxmLmVtaXQoJ2Z0cC1yZW1vdGUtZWRpdC1maW5kZXI6c2hvdycpO1xuICB9XG5cbiAgaGlkZSgpIHtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcblxuICAgIGlmIChzZWxmLnBhbmVsKSB7XG4gICAgICBzZWxmLnBhbmVsLmhpZGUoKTtcbiAgICB9XG4gICAgaWYgKHNlbGYucHJldmlvdXNseUZvY3VzZWRFbGVtZW50KSB7XG4gICAgICBzZWxmLnByZXZpb3VzbHlGb2N1c2VkRWxlbWVudC5mb2N1cygpO1xuICAgICAgc2VsZi5wcmV2aW91c2x5Rm9jdXNlZEVsZW1lbnQgPSBudWxsO1xuICAgIH1cbiAgICBzZWxmLmVtaXQoJ2Z0cC1yZW1vdGUtZWRpdC1maW5kZXI6aGlkZScpO1xuICB9XG5cbiAgY2FuY2VsKCkge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuXG4gICAgc2VsZi5zZWxlY3RMaXN0Vmlldy5yZXNldCgpO1xuICAgIHNlbGYuaGlkZSgpO1xuICB9XG5cbiAgdG9nZ2xlKCkge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuXG4gICAgaWYgKHNlbGYucGFuZWwgJiYgc2VsZi5wYW5lbC5pc1Zpc2libGUoKSkge1xuICAgICAgc2VsZi5jYW5jZWwoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc2VsZi5zaG93KCk7XG4gICAgfVxuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcblxuICAgIGlmIChzZWxmLnBhbmVsKSB7XG4gICAgICBzZWxmLnBhbmVsLmRlc3Ryb3koKTtcbiAgICB9XG5cbiAgICBpZiAoc2VsZi5zdWJzY3JpcHRpb25zKSB7XG4gICAgICBzZWxmLnN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpO1xuICAgICAgc2VsZi5zdWJzY3JpcHRpb25zID0gbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIHNlbGYuc2VsZWN0TGlzdFZpZXcuZGVzdHJveSgpO1xuICB9XG5cbiAgb3BlbihpdGVtKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG5cbiAgICBzZWxmLmVtaXQoJ2Z0cC1yZW1vdGUtZWRpdC1maW5kZXI6b3BlbicsIGl0ZW0pO1xuICB9XG59XG4iXX0=