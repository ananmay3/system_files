(function() {
  var AutocompleteView, CompositeDisposable, Disposable, _, ref;

  ref = require('atom'), CompositeDisposable = ref.CompositeDisposable, Disposable = ref.Disposable;

  _ = require('underscore-plus');

  AutocompleteView = require('./autocomplete-view');

  module.exports = {
    config: {
      includeCompletionsFromAllBuffers: {
        type: 'boolean',
        "default": false
      }
    },
    autocompleteViewsByEditor: null,
    deactivationDisposables: null,
    activate: function() {
      var getAutocompleteView;
      this.autocompleteViewsByEditor = new WeakMap;
      this.deactivationDisposables = new CompositeDisposable;
      this.deactivationDisposables.add(atom.workspace.observeTextEditors((function(_this) {
        return function(editor) {
          var autocompleteView, disposable;
          if (editor.mini) {
            return;
          }
          autocompleteView = new AutocompleteView(editor);
          _this.autocompleteViewsByEditor.set(editor, autocompleteView);
          disposable = new Disposable(function() {
            return autocompleteView.destroy();
          });
          _this.deactivationDisposables.add(editor.onDidDestroy(function() {
            return disposable.dispose();
          }));
          return _this.deactivationDisposables.add(disposable);
        };
      })(this)));
      getAutocompleteView = (function(_this) {
        return function(editorElement) {
          return _this.autocompleteViewsByEditor.get(editorElement.getModel());
        };
      })(this);
      return this.deactivationDisposables.add(atom.commands.add('atom-text-editor:not([mini])', {
        'autocomplete:toggle': function() {
          var ref1;
          return (ref1 = getAutocompleteView(this)) != null ? ref1.toggle() : void 0;
        },
        'autocomplete:next': function() {
          var ref1;
          return (ref1 = getAutocompleteView(this)) != null ? ref1.selectNextItemView() : void 0;
        },
        'autocomplete:previous': function() {
          var ref1;
          return (ref1 = getAutocompleteView(this)) != null ? ref1.selectPreviousItemView() : void 0;
        }
      }));
    },
    deactivate: function() {
      return this.deactivationDisposables.dispose();
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvYW5hbm1heWphaW4vLmF0b20vcGFja2FnZXMvYXV0b2NvbXBsZXRlL2xpYi9hdXRvY29tcGxldGUuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxNQUFvQyxPQUFBLENBQVEsTUFBUixDQUFwQyxFQUFDLDZDQUFELEVBQXNCOztFQUN0QixDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSOztFQUNKLGdCQUFBLEdBQW1CLE9BQUEsQ0FBUSxxQkFBUjs7RUFFbkIsTUFBTSxDQUFDLE9BQVAsR0FDRTtJQUFBLE1BQUEsRUFDRTtNQUFBLGdDQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sU0FBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsS0FEVDtPQURGO0tBREY7SUFLQSx5QkFBQSxFQUEyQixJQUwzQjtJQU1BLHVCQUFBLEVBQXlCLElBTnpCO0lBUUEsUUFBQSxFQUFVLFNBQUE7QUFDUixVQUFBO01BQUEsSUFBQyxDQUFBLHlCQUFELEdBQTZCLElBQUk7TUFDakMsSUFBQyxDQUFBLHVCQUFELEdBQTJCLElBQUk7TUFFL0IsSUFBQyxDQUFBLHVCQUF1QixDQUFDLEdBQXpCLENBQTZCLElBQUksQ0FBQyxTQUFTLENBQUMsa0JBQWYsQ0FBa0MsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLE1BQUQ7QUFDN0QsY0FBQTtVQUFBLElBQVUsTUFBTSxDQUFDLElBQWpCO0FBQUEsbUJBQUE7O1VBRUEsZ0JBQUEsR0FBbUIsSUFBSSxnQkFBSixDQUFxQixNQUFyQjtVQUNuQixLQUFDLENBQUEseUJBQXlCLENBQUMsR0FBM0IsQ0FBK0IsTUFBL0IsRUFBdUMsZ0JBQXZDO1VBRUEsVUFBQSxHQUFhLElBQUksVUFBSixDQUFlLFNBQUE7bUJBQUcsZ0JBQWdCLENBQUMsT0FBakIsQ0FBQTtVQUFILENBQWY7VUFDYixLQUFDLENBQUEsdUJBQXVCLENBQUMsR0FBekIsQ0FBNkIsTUFBTSxDQUFDLFlBQVAsQ0FBb0IsU0FBQTttQkFBRyxVQUFVLENBQUMsT0FBWCxDQUFBO1VBQUgsQ0FBcEIsQ0FBN0I7aUJBQ0EsS0FBQyxDQUFBLHVCQUF1QixDQUFDLEdBQXpCLENBQTZCLFVBQTdCO1FBUjZEO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFsQyxDQUE3QjtNQVVBLG1CQUFBLEdBQXNCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxhQUFEO2lCQUNwQixLQUFDLENBQUEseUJBQXlCLENBQUMsR0FBM0IsQ0FBK0IsYUFBYSxDQUFDLFFBQWQsQ0FBQSxDQUEvQjtRQURvQjtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUE7YUFHdEIsSUFBQyxDQUFBLHVCQUF1QixDQUFDLEdBQXpCLENBQTZCLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBZCxDQUFrQiw4QkFBbEIsRUFDM0I7UUFBQSxxQkFBQSxFQUF1QixTQUFBO0FBQ3JCLGNBQUE7a0VBQXlCLENBQUUsTUFBM0IsQ0FBQTtRQURxQixDQUF2QjtRQUVBLG1CQUFBLEVBQXFCLFNBQUE7QUFDbkIsY0FBQTtrRUFBeUIsQ0FBRSxrQkFBM0IsQ0FBQTtRQURtQixDQUZyQjtRQUlBLHVCQUFBLEVBQXlCLFNBQUE7QUFDdkIsY0FBQTtrRUFBeUIsQ0FBRSxzQkFBM0IsQ0FBQTtRQUR1QixDQUp6QjtPQUQyQixDQUE3QjtJQWpCUSxDQVJWO0lBaUNBLFVBQUEsRUFBWSxTQUFBO2FBQ1YsSUFBQyxDQUFBLHVCQUF1QixDQUFDLE9BQXpCLENBQUE7SUFEVSxDQWpDWjs7QUFMRiIsInNvdXJjZXNDb250ZW50IjpbIntDb21wb3NpdGVEaXNwb3NhYmxlLCBEaXNwb3NhYmxlfSA9IHJlcXVpcmUgJ2F0b20nXG5fID0gcmVxdWlyZSAndW5kZXJzY29yZS1wbHVzJ1xuQXV0b2NvbXBsZXRlVmlldyA9IHJlcXVpcmUgJy4vYXV0b2NvbXBsZXRlLXZpZXcnXG5cbm1vZHVsZS5leHBvcnRzID1cbiAgY29uZmlnOlxuICAgIGluY2x1ZGVDb21wbGV0aW9uc0Zyb21BbGxCdWZmZXJzOlxuICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICBkZWZhdWx0OiBmYWxzZVxuXG4gIGF1dG9jb21wbGV0ZVZpZXdzQnlFZGl0b3I6IG51bGxcbiAgZGVhY3RpdmF0aW9uRGlzcG9zYWJsZXM6IG51bGxcblxuICBhY3RpdmF0ZTogLT5cbiAgICBAYXV0b2NvbXBsZXRlVmlld3NCeUVkaXRvciA9IG5ldyBXZWFrTWFwXG4gICAgQGRlYWN0aXZhdGlvbkRpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGVcblxuICAgIEBkZWFjdGl2YXRpb25EaXNwb3NhYmxlcy5hZGQgYXRvbS53b3Jrc3BhY2Uub2JzZXJ2ZVRleHRFZGl0b3JzIChlZGl0b3IpID0+XG4gICAgICByZXR1cm4gaWYgZWRpdG9yLm1pbmlcblxuICAgICAgYXV0b2NvbXBsZXRlVmlldyA9IG5ldyBBdXRvY29tcGxldGVWaWV3KGVkaXRvcilcbiAgICAgIEBhdXRvY29tcGxldGVWaWV3c0J5RWRpdG9yLnNldChlZGl0b3IsIGF1dG9jb21wbGV0ZVZpZXcpXG5cbiAgICAgIGRpc3Bvc2FibGUgPSBuZXcgRGlzcG9zYWJsZSA9PiBhdXRvY29tcGxldGVWaWV3LmRlc3Ryb3koKVxuICAgICAgQGRlYWN0aXZhdGlvbkRpc3Bvc2FibGVzLmFkZCBlZGl0b3Iub25EaWREZXN0cm95ID0+IGRpc3Bvc2FibGUuZGlzcG9zZSgpXG4gICAgICBAZGVhY3RpdmF0aW9uRGlzcG9zYWJsZXMuYWRkIGRpc3Bvc2FibGVcblxuICAgIGdldEF1dG9jb21wbGV0ZVZpZXcgPSAoZWRpdG9yRWxlbWVudCkgPT5cbiAgICAgIEBhdXRvY29tcGxldGVWaWV3c0J5RWRpdG9yLmdldChlZGl0b3JFbGVtZW50LmdldE1vZGVsKCkpXG5cbiAgICBAZGVhY3RpdmF0aW9uRGlzcG9zYWJsZXMuYWRkIGF0b20uY29tbWFuZHMuYWRkICdhdG9tLXRleHQtZWRpdG9yOm5vdChbbWluaV0pJyxcbiAgICAgICdhdXRvY29tcGxldGU6dG9nZ2xlJzogLT5cbiAgICAgICAgZ2V0QXV0b2NvbXBsZXRlVmlldyh0aGlzKT8udG9nZ2xlKClcbiAgICAgICdhdXRvY29tcGxldGU6bmV4dCc6IC0+XG4gICAgICAgIGdldEF1dG9jb21wbGV0ZVZpZXcodGhpcyk/LnNlbGVjdE5leHRJdGVtVmlldygpXG4gICAgICAnYXV0b2NvbXBsZXRlOnByZXZpb3VzJzogLT5cbiAgICAgICAgZ2V0QXV0b2NvbXBsZXRlVmlldyh0aGlzKT8uc2VsZWN0UHJldmlvdXNJdGVtVmlldygpXG5cbiAgZGVhY3RpdmF0ZTogLT5cbiAgICBAZGVhY3RpdmF0aW9uRGlzcG9zYWJsZXMuZGlzcG9zZSgpXG4iXX0=
