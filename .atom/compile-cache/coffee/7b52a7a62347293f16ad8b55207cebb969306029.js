(function() {
  var ClangProvider, CompositeDisposable, configurations, jumper, pchEmitter;

  CompositeDisposable = require('atom').CompositeDisposable;

  pchEmitter = require('./pch-emitter');

  jumper = require('./jumper');

  configurations = require('./configurations');

  ClangProvider = null;

  module.exports = {
    config: configurations,
    deactivationDisposables: null,
    activate: function(state) {
      this.deactivationDisposables = new CompositeDisposable;
      this.deactivationDisposables.add(atom.commands.add('atom-text-editor:not([mini])', {
        'autocomplete-clang:emit-pch': (function(_this) {
          return function() {
            return _this.emitPch(atom.workspace.getActiveTextEditor());
          };
        })(this)
      }));
      return this.deactivationDisposables.add(atom.commands.add('atom-text-editor:not([mini])', {
        'autocomplete-clang:go-declaration': (function(_this) {
          return function(e) {
            return _this.goDeclaration(atom.workspace.getActiveTextEditor(), e);
          };
        })(this)
      }));
    },
    emitPch: function(editor) {
      return pchEmitter.emitPch(editor);
    },
    goDeclaration: function(editor, e) {
      return jumper.goDeclaration(editor, e);
    },
    deactivate: function() {
      return this.deactivationDisposables.dispose();
    },
    provide: function() {
      if (ClangProvider == null) {
        ClangProvider = require('./clang-provider');
      }
      return new ClangProvider();
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvYW5hbm1heTMvLmF0b20vcGFja2FnZXMvYXV0b2NvbXBsZXRlLWNsYW5nL2xpYi9hdXRvY29tcGxldGUtY2xhbmcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQyxzQkFBdUIsT0FBQSxDQUFRLE1BQVI7O0VBQ3hCLFVBQUEsR0FBYSxPQUFBLENBQVEsZUFBUjs7RUFDYixNQUFBLEdBQVMsT0FBQSxDQUFRLFVBQVI7O0VBQ1QsY0FBQSxHQUFpQixPQUFBLENBQVEsa0JBQVI7O0VBRWpCLGFBQUEsR0FBZ0I7O0VBRWhCLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7SUFBQSxNQUFBLEVBQVEsY0FBUjtJQUVBLHVCQUFBLEVBQXlCLElBRnpCO0lBSUEsUUFBQSxFQUFVLFNBQUMsS0FBRDtNQUNSLElBQUMsQ0FBQSx1QkFBRCxHQUEyQixJQUFJO01BQy9CLElBQUMsQ0FBQSx1QkFBdUIsQ0FBQyxHQUF6QixDQUE2QixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWQsQ0FBa0IsOEJBQWxCLEVBQzNCO1FBQUEsNkJBQUEsRUFBK0IsQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQTttQkFDN0IsS0FBQyxDQUFBLE9BQUQsQ0FBUyxJQUFJLENBQUMsU0FBUyxDQUFDLG1CQUFmLENBQUEsQ0FBVDtVQUQ2QjtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBL0I7T0FEMkIsQ0FBN0I7YUFHQSxJQUFDLENBQUEsdUJBQXVCLENBQUMsR0FBekIsQ0FBNkIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFkLENBQWtCLDhCQUFsQixFQUMzQjtRQUFBLG1DQUFBLEVBQXFDLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUMsQ0FBRDttQkFDbkMsS0FBQyxDQUFBLGFBQUQsQ0FBZSxJQUFJLENBQUMsU0FBUyxDQUFDLG1CQUFmLENBQUEsQ0FBZixFQUFxRCxDQUFyRDtVQURtQztRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBckM7T0FEMkIsQ0FBN0I7SUFMUSxDQUpWO0lBYUEsT0FBQSxFQUFTLFNBQUMsTUFBRDthQUFZLFVBQVUsQ0FBQyxPQUFYLENBQW1CLE1BQW5CO0lBQVosQ0FiVDtJQWVBLGFBQUEsRUFBZSxTQUFDLE1BQUQsRUFBUyxDQUFUO2FBQWUsTUFBTSxDQUFDLGFBQVAsQ0FBcUIsTUFBckIsRUFBNkIsQ0FBN0I7SUFBZixDQWZmO0lBaUJBLFVBQUEsRUFBWSxTQUFBO2FBQ1YsSUFBQyxDQUFBLHVCQUF1QixDQUFDLE9BQXpCLENBQUE7SUFEVSxDQWpCWjtJQW9CQSxPQUFBLEVBQVMsU0FBQTs7UUFDUCxnQkFBaUIsT0FBQSxDQUFRLGtCQUFSOzthQUNqQixJQUFJLGFBQUosQ0FBQTtJQUZPLENBcEJUOztBQVJGIiwic291cmNlc0NvbnRlbnQiOlsie0NvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSAnYXRvbSdcbnBjaEVtaXR0ZXIgPSByZXF1aXJlICcuL3BjaC1lbWl0dGVyJ1xuanVtcGVyID0gcmVxdWlyZSAnLi9qdW1wZXInXG5jb25maWd1cmF0aW9ucyA9IHJlcXVpcmUgJy4vY29uZmlndXJhdGlvbnMnXG5cbkNsYW5nUHJvdmlkZXIgPSBudWxsXG5cbm1vZHVsZS5leHBvcnRzID1cbiAgY29uZmlnOiBjb25maWd1cmF0aW9uc1xuXG4gIGRlYWN0aXZhdGlvbkRpc3Bvc2FibGVzOiBudWxsXG5cbiAgYWN0aXZhdGU6IChzdGF0ZSkgLT5cbiAgICBAZGVhY3RpdmF0aW9uRGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuICAgIEBkZWFjdGl2YXRpb25EaXNwb3NhYmxlcy5hZGQgYXRvbS5jb21tYW5kcy5hZGQgJ2F0b20tdGV4dC1lZGl0b3I6bm90KFttaW5pXSknLFxuICAgICAgJ2F1dG9jb21wbGV0ZS1jbGFuZzplbWl0LXBjaCc6ID0+XG4gICAgICAgIEBlbWl0UGNoIGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgIEBkZWFjdGl2YXRpb25EaXNwb3NhYmxlcy5hZGQgYXRvbS5jb21tYW5kcy5hZGQgJ2F0b20tdGV4dC1lZGl0b3I6bm90KFttaW5pXSknLFxuICAgICAgJ2F1dG9jb21wbGV0ZS1jbGFuZzpnby1kZWNsYXJhdGlvbic6IChlKT0+XG4gICAgICAgIEBnb0RlY2xhcmF0aW9uIGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKSwgZVxuXG4gIGVtaXRQY2g6IChlZGl0b3IpIC0+IHBjaEVtaXR0ZXIuZW1pdFBjaCBlZGl0b3JcblxuICBnb0RlY2xhcmF0aW9uOiAoZWRpdG9yLCBlKSAtPiBqdW1wZXIuZ29EZWNsYXJhdGlvbiBlZGl0b3IsIGVcblxuICBkZWFjdGl2YXRlOiAtPlxuICAgIEBkZWFjdGl2YXRpb25EaXNwb3NhYmxlcy5kaXNwb3NlKClcblxuICBwcm92aWRlOiAtPlxuICAgIENsYW5nUHJvdmlkZXIgPz0gcmVxdWlyZSgnLi9jbGFuZy1wcm92aWRlcicpXG4gICAgbmV3IENsYW5nUHJvdmlkZXIoKVxuIl19
