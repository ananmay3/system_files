(function() {
  var ExNormalModeInputElement, Input, ViewModel;

  ExNormalModeInputElement = require('./ex-normal-mode-input-element');

  ViewModel = (function() {
    function ViewModel(command, opts) {
      var ref;
      this.command = command;
      if (opts == null) {
        opts = {};
      }
      ref = this.command, this.editor = ref.editor, this.exState = ref.exState;
      this.view = new ExNormalModeInputElement().initialize(this, opts);
      this.editor.normalModeInputView = this.view;
      this.exState.onDidFailToExecute((function(_this) {
        return function() {
          return _this.view.remove();
        };
      })(this));
      this.done = false;
    }

    ViewModel.prototype.confirm = function(view) {
      this.exState.pushOperations(new Input(this.view.value));
      return this.done = true;
    };

    ViewModel.prototype.cancel = function(view) {
      if (!this.done) {
        this.exState.pushOperations(new Input(''));
        return this.done = true;
      }
    };

    return ViewModel;

  })();

  Input = (function() {
    function Input(characters) {
      this.characters = characters;
    }

    return Input;

  })();

  module.exports = {
    ViewModel: ViewModel,
    Input: Input
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvYW5hbm1heWphaW4vLmF0b20vcGFja2FnZXMvZXgtbW9kZS9saWIvdmlldy1tb2RlbC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLHdCQUFBLEdBQTJCLE9BQUEsQ0FBUSxnQ0FBUjs7RUFFckI7SUFDUyxtQkFBQyxPQUFELEVBQVcsSUFBWDtBQUNYLFVBQUE7TUFEWSxJQUFDLENBQUEsVUFBRDs7UUFBVSxPQUFLOztNQUMzQixNQUFzQixJQUFDLENBQUEsT0FBdkIsRUFBQyxJQUFDLENBQUEsYUFBQSxNQUFGLEVBQVUsSUFBQyxDQUFBLGNBQUE7TUFFWCxJQUFDLENBQUEsSUFBRCxHQUFRLElBQUksd0JBQUosQ0FBQSxDQUE4QixDQUFDLFVBQS9CLENBQTBDLElBQTFDLEVBQTZDLElBQTdDO01BQ1IsSUFBQyxDQUFBLE1BQU0sQ0FBQyxtQkFBUixHQUE4QixJQUFDLENBQUE7TUFDL0IsSUFBQyxDQUFBLE9BQU8sQ0FBQyxrQkFBVCxDQUE0QixDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7aUJBQUcsS0FBQyxDQUFBLElBQUksQ0FBQyxNQUFOLENBQUE7UUFBSDtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBNUI7TUFDQSxJQUFDLENBQUEsSUFBRCxHQUFRO0lBTkc7O3dCQVFiLE9BQUEsR0FBUyxTQUFDLElBQUQ7TUFDUCxJQUFDLENBQUEsT0FBTyxDQUFDLGNBQVQsQ0FBd0IsSUFBSSxLQUFKLENBQVUsSUFBQyxDQUFBLElBQUksQ0FBQyxLQUFoQixDQUF4QjthQUNBLElBQUMsQ0FBQSxJQUFELEdBQVE7SUFGRDs7d0JBSVQsTUFBQSxHQUFRLFNBQUMsSUFBRDtNQUNOLElBQUEsQ0FBTyxJQUFDLENBQUEsSUFBUjtRQUNFLElBQUMsQ0FBQSxPQUFPLENBQUMsY0FBVCxDQUF3QixJQUFJLEtBQUosQ0FBVSxFQUFWLENBQXhCO2VBQ0EsSUFBQyxDQUFBLElBQUQsR0FBUSxLQUZWOztJQURNOzs7Ozs7RUFLSjtJQUNTLGVBQUMsVUFBRDtNQUFDLElBQUMsQ0FBQSxhQUFEO0lBQUQ7Ozs7OztFQUVmLE1BQU0sQ0FBQyxPQUFQLEdBQWlCO0lBQ2YsV0FBQSxTQURlO0lBQ0osT0FBQSxLQURJOztBQXZCakIiLCJzb3VyY2VzQ29udGVudCI6WyJFeE5vcm1hbE1vZGVJbnB1dEVsZW1lbnQgPSByZXF1aXJlICcuL2V4LW5vcm1hbC1tb2RlLWlucHV0LWVsZW1lbnQnXG5cbmNsYXNzIFZpZXdNb2RlbFxuICBjb25zdHJ1Y3RvcjogKEBjb21tYW5kLCBvcHRzPXt9KSAtPlxuICAgIHtAZWRpdG9yLCBAZXhTdGF0ZX0gPSBAY29tbWFuZFxuXG4gICAgQHZpZXcgPSBuZXcgRXhOb3JtYWxNb2RlSW5wdXRFbGVtZW50KCkuaW5pdGlhbGl6ZShALCBvcHRzKVxuICAgIEBlZGl0b3Iubm9ybWFsTW9kZUlucHV0VmlldyA9IEB2aWV3XG4gICAgQGV4U3RhdGUub25EaWRGYWlsVG9FeGVjdXRlID0+IEB2aWV3LnJlbW92ZSgpXG4gICAgQGRvbmUgPSBmYWxzZVxuXG4gIGNvbmZpcm06ICh2aWV3KSAtPlxuICAgIEBleFN0YXRlLnB1c2hPcGVyYXRpb25zKG5ldyBJbnB1dChAdmlldy52YWx1ZSkpXG4gICAgQGRvbmUgPSB0cnVlXG5cbiAgY2FuY2VsOiAodmlldykgLT5cbiAgICB1bmxlc3MgQGRvbmVcbiAgICAgIEBleFN0YXRlLnB1c2hPcGVyYXRpb25zKG5ldyBJbnB1dCgnJykpXG4gICAgICBAZG9uZSA9IHRydWVcblxuY2xhc3MgSW5wdXRcbiAgY29uc3RydWN0b3I6IChAY2hhcmFjdGVycykgLT5cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIFZpZXdNb2RlbCwgSW5wdXRcbn1cbiJdfQ==
