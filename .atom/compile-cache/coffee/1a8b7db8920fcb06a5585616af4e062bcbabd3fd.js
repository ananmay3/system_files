(function() {
  var Dialog, TextEditorView, View, ref,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  ref = require('atom-space-pen-views'), TextEditorView = ref.TextEditorView, View = ref.View;

  module.exports = Dialog = (function(superClass) {
    extend(Dialog, superClass);

    function Dialog() {
      return Dialog.__super__.constructor.apply(this, arguments);
    }

    Dialog.content = function(arg) {
      var prompt;
      prompt = (arg != null ? arg : {}).prompt;
      return this.div({
        "class": 'terminal-plus-dialog'
      }, (function(_this) {
        return function() {
          _this.label(prompt, {
            "class": 'icon',
            outlet: 'promptText'
          });
          _this.subview('miniEditor', new TextEditorView({
            mini: true
          }));
          _this.label('Escape (Esc) to exit', {
            style: 'float: left;'
          });
          return _this.label('Enter (\u21B5) to confirm', {
            style: 'float: right;'
          });
        };
      })(this));
    };

    Dialog.prototype.initialize = function(arg) {
      var iconClass, placeholderText, ref1, stayOpen;
      ref1 = arg != null ? arg : {}, iconClass = ref1.iconClass, placeholderText = ref1.placeholderText, stayOpen = ref1.stayOpen;
      if (iconClass) {
        this.promptText.addClass(iconClass);
      }
      atom.commands.add(this.element, {
        'core:confirm': (function(_this) {
          return function() {
            return _this.onConfirm(_this.miniEditor.getText());
          };
        })(this),
        'core:cancel': (function(_this) {
          return function() {
            return _this.cancel();
          };
        })(this)
      });
      if (!stayOpen) {
        this.miniEditor.on('blur', (function(_this) {
          return function() {
            return _this.close();
          };
        })(this));
      }
      if (placeholderText) {
        this.miniEditor.getModel().setText(placeholderText);
        return this.miniEditor.getModel().selectAll();
      }
    };

    Dialog.prototype.attach = function() {
      this.panel = atom.workspace.addModalPanel({
        item: this.element
      });
      this.miniEditor.focus();
      return this.miniEditor.getModel().scrollToCursorPosition();
    };

    Dialog.prototype.close = function() {
      var panelToDestroy;
      panelToDestroy = this.panel;
      this.panel = null;
      if (panelToDestroy != null) {
        panelToDestroy.destroy();
      }
      return atom.workspace.getActivePane().activate();
    };

    Dialog.prototype.cancel = function() {
      return this.close();
    };

    return Dialog;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvYW5hbm1heTMvLmF0b20vcGFja2FnZXMvdGVybWluYWwtcGx1cy9saWIvZGlhbG9nLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsaUNBQUE7SUFBQTs7O0VBQUEsTUFBeUIsT0FBQSxDQUFRLHNCQUFSLENBQXpCLEVBQUMsbUNBQUQsRUFBaUI7O0VBRWpCLE1BQU0sQ0FBQyxPQUFQLEdBQ007Ozs7Ozs7SUFDSixNQUFDLENBQUEsT0FBRCxHQUFVLFNBQUMsR0FBRDtBQUNSLFVBQUE7TUFEVSx3QkFBRCxNQUFXO2FBQ3BCLElBQUMsQ0FBQSxHQUFELENBQUs7UUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLHNCQUFQO09BQUwsRUFBb0MsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO1VBQ2xDLEtBQUMsQ0FBQSxLQUFELENBQU8sTUFBUCxFQUFlO1lBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxNQUFQO1lBQWUsTUFBQSxFQUFRLFlBQXZCO1dBQWY7VUFDQSxLQUFDLENBQUEsT0FBRCxDQUFTLFlBQVQsRUFBdUIsSUFBSSxjQUFKLENBQW1CO1lBQUEsSUFBQSxFQUFNLElBQU47V0FBbkIsQ0FBdkI7VUFDQSxLQUFDLENBQUEsS0FBRCxDQUFPLHNCQUFQLEVBQStCO1lBQUEsS0FBQSxFQUFPLGNBQVA7V0FBL0I7aUJBQ0EsS0FBQyxDQUFBLEtBQUQsQ0FBTywyQkFBUCxFQUFvQztZQUFBLEtBQUEsRUFBTyxlQUFQO1dBQXBDO1FBSmtDO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFwQztJQURROztxQkFPVixVQUFBLEdBQVksU0FBQyxHQUFEO0FBQ1YsVUFBQTsyQkFEVyxNQUF5QyxJQUF4Qyw0QkFBVyx3Q0FBaUI7TUFDeEMsSUFBbUMsU0FBbkM7UUFBQSxJQUFDLENBQUEsVUFBVSxDQUFDLFFBQVosQ0FBcUIsU0FBckIsRUFBQTs7TUFDQSxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWQsQ0FBa0IsSUFBQyxDQUFBLE9BQW5CLEVBQ0U7UUFBQSxjQUFBLEVBQWdCLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUE7bUJBQUcsS0FBQyxDQUFBLFNBQUQsQ0FBVyxLQUFDLENBQUEsVUFBVSxDQUFDLE9BQVosQ0FBQSxDQUFYO1VBQUg7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWhCO1FBQ0EsYUFBQSxFQUFlLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUE7bUJBQUcsS0FBQyxDQUFBLE1BQUQsQ0FBQTtVQUFIO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQURmO09BREY7TUFJQSxJQUFBLENBQU8sUUFBUDtRQUNFLElBQUMsQ0FBQSxVQUFVLENBQUMsRUFBWixDQUFlLE1BQWYsRUFBdUIsQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQTttQkFBRyxLQUFDLENBQUEsS0FBRCxDQUFBO1VBQUg7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXZCLEVBREY7O01BR0EsSUFBRyxlQUFIO1FBQ0UsSUFBQyxDQUFBLFVBQVUsQ0FBQyxRQUFaLENBQUEsQ0FBc0IsQ0FBQyxPQUF2QixDQUErQixlQUEvQjtlQUNBLElBQUMsQ0FBQSxVQUFVLENBQUMsUUFBWixDQUFBLENBQXNCLENBQUMsU0FBdkIsQ0FBQSxFQUZGOztJQVRVOztxQkFhWixNQUFBLEdBQVEsU0FBQTtNQUNOLElBQUMsQ0FBQSxLQUFELEdBQVMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFmLENBQTZCO1FBQUEsSUFBQSxFQUFNLElBQUksQ0FBQyxPQUFYO09BQTdCO01BQ1QsSUFBQyxDQUFBLFVBQVUsQ0FBQyxLQUFaLENBQUE7YUFDQSxJQUFDLENBQUEsVUFBVSxDQUFDLFFBQVosQ0FBQSxDQUFzQixDQUFDLHNCQUF2QixDQUFBO0lBSE07O3FCQUtSLEtBQUEsR0FBTyxTQUFBO0FBQ0wsVUFBQTtNQUFBLGNBQUEsR0FBaUIsSUFBQyxDQUFBO01BQ2xCLElBQUMsQ0FBQSxLQUFELEdBQVM7O1FBQ1QsY0FBYyxDQUFFLE9BQWhCLENBQUE7O2FBQ0EsSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFmLENBQUEsQ0FBOEIsQ0FBQyxRQUEvQixDQUFBO0lBSks7O3FCQU1QLE1BQUEsR0FBUSxTQUFBO2FBQ04sSUFBQyxDQUFBLEtBQUQsQ0FBQTtJQURNOzs7O0tBaENXO0FBSHJCIiwic291cmNlc0NvbnRlbnQiOlsie1RleHRFZGl0b3JWaWV3LCBWaWV3fSA9IHJlcXVpcmUgJ2F0b20tc3BhY2UtcGVuLXZpZXdzJ1xuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBEaWFsb2cgZXh0ZW5kcyBWaWV3XG4gIEBjb250ZW50OiAoe3Byb21wdH0gPSB7fSkgLT5cbiAgICBAZGl2IGNsYXNzOiAndGVybWluYWwtcGx1cy1kaWFsb2cnLCA9PlxuICAgICAgQGxhYmVsIHByb21wdCwgY2xhc3M6ICdpY29uJywgb3V0bGV0OiAncHJvbXB0VGV4dCdcbiAgICAgIEBzdWJ2aWV3ICdtaW5pRWRpdG9yJywgbmV3IFRleHRFZGl0b3JWaWV3KG1pbmk6IHRydWUpXG4gICAgICBAbGFiZWwgJ0VzY2FwZSAoRXNjKSB0byBleGl0Jywgc3R5bGU6ICdmbG9hdDogbGVmdDsnXG4gICAgICBAbGFiZWwgJ0VudGVyIChcXHUyMUI1KSB0byBjb25maXJtJywgc3R5bGU6ICdmbG9hdDogcmlnaHQ7J1xuXG4gIGluaXRpYWxpemU6ICh7aWNvbkNsYXNzLCBwbGFjZWhvbGRlclRleHQsIHN0YXlPcGVufSA9IHt9KSAtPlxuICAgIEBwcm9tcHRUZXh0LmFkZENsYXNzKGljb25DbGFzcykgaWYgaWNvbkNsYXNzXG4gICAgYXRvbS5jb21tYW5kcy5hZGQgQGVsZW1lbnQsXG4gICAgICAnY29yZTpjb25maXJtJzogPT4gQG9uQ29uZmlybShAbWluaUVkaXRvci5nZXRUZXh0KCkpXG4gICAgICAnY29yZTpjYW5jZWwnOiA9PiBAY2FuY2VsKClcblxuICAgIHVubGVzcyBzdGF5T3BlblxuICAgICAgQG1pbmlFZGl0b3Iub24gJ2JsdXInLCA9PiBAY2xvc2UoKVxuXG4gICAgaWYgcGxhY2Vob2xkZXJUZXh0XG4gICAgICBAbWluaUVkaXRvci5nZXRNb2RlbCgpLnNldFRleHQgcGxhY2Vob2xkZXJUZXh0XG4gICAgICBAbWluaUVkaXRvci5nZXRNb2RlbCgpLnNlbGVjdEFsbCgpXG5cbiAgYXR0YWNoOiAtPlxuICAgIEBwYW5lbCA9IGF0b20ud29ya3NwYWNlLmFkZE1vZGFsUGFuZWwoaXRlbTogdGhpcy5lbGVtZW50KVxuICAgIEBtaW5pRWRpdG9yLmZvY3VzKClcbiAgICBAbWluaUVkaXRvci5nZXRNb2RlbCgpLnNjcm9sbFRvQ3Vyc29yUG9zaXRpb24oKVxuXG4gIGNsb3NlOiAtPlxuICAgIHBhbmVsVG9EZXN0cm95ID0gQHBhbmVsXG4gICAgQHBhbmVsID0gbnVsbFxuICAgIHBhbmVsVG9EZXN0cm95Py5kZXN0cm95KClcbiAgICBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVQYW5lKCkuYWN0aXZhdGUoKVxuXG4gIGNhbmNlbDogLT5cbiAgICBAY2xvc2UoKVxuIl19
