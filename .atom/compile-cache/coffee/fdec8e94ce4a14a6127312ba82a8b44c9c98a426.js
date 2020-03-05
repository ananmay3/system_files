(function() {
  module.exports = {
    config: {
      fontFamily: {
        description: 'Use one of the fonts available in this package. View the README for descriptions of each.',
        type: 'string',
        "default": 'System Default',
        "enum": ['Cantarell', 'Clear Sans', 'Fira Sans', 'Open Sans', 'Oxygen', 'Roboto', 'Source Sans Pro', 'Ubuntu', 'System Default']
      },
      fontWeight: {
        description: 'Not all fonts come in all weights: Canterell and Oxygen only have regular, Ubuntu and Open Sans don\'t have thin.',
        type: 'string',
        "default": 'Regular',
        "enum": ['Extra light / Thin', 'Light', 'Regular']
      },
      customBackgroundColor: {
        description: 'Choose a custom background color.',
        type: 'boolean',
        "default": false
      },
      customBackgroundColorPicker: {
        description: 'Choose your background color.',
        type: 'color',
        "default": 'white'
      },
      backgroundGradient: {
        description: 'Apply a subtle gradient to the background.',
        type: 'boolean',
        "default": false
      },
      backgroundImage: {
        description: 'Use an image as a background.',
        type: 'boolean',
        "default": false
      },
      backgroundImagePath: {
        description: 'The path to an image from your computer or the internets (e.g. hubblesite.org or unsplash.com).',
        type: 'string',
        "default": 'atom://isotope-ui/resources/images/raket.jpg'
      },
      lowContrastTooltip: {
        description: 'Make tooltips low contrast and not so colorful.',
        type: 'boolean',
        "default": false
      },
      matchEditorFont: {
        description: 'Match the font family you set for the editor.',
        type: 'boolean',
        "default": false
      },
      minimalMode: {
        description: 'Make the layout more minimal.',
        type: 'boolean',
        "default": false
      },
      tabSizing: {
        description: 'In Even mode all tabs will be the same size. Great for quickly closing many tabs. In Minimum mode the tabs will only take as little space as needed and also show longer file names.',
        type: 'string',
        "default": 'Even',
        "enum": ['Even', 'Minimum']
      }
    },
    activate: function(state) {
      return atom.themes.onDidChangeActiveThemes(function() {
        var Config;
        Config = require('./config');
        return Config.apply();
      });
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvYW5hbm1heTMvLmF0b20vcGFja2FnZXMvaXNvdG9wZS11aS9saWIvaXNvdG9wZS11aS5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFBQSxNQUFNLENBQUMsT0FBUCxHQUVFO0lBQUEsTUFBQSxFQUNFO01BQUEsVUFBQSxFQUNFO1FBQUEsV0FBQSxFQUFhLDJGQUFiO1FBRUEsSUFBQSxFQUFNLFFBRk47UUFHQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLGdCQUhUO1FBSUEsQ0FBQSxJQUFBLENBQUEsRUFBTSxDQUNKLFdBREksRUFFSixZQUZJLEVBR0osV0FISSxFQUlKLFdBSkksRUFLSixRQUxJLEVBTUosUUFOSSxFQU9KLGlCQVBJLEVBUUosUUFSSSxFQVNKLGdCQVRJLENBSk47T0FERjtNQWdCQSxVQUFBLEVBQ0U7UUFBQSxXQUFBLEVBQWEsbUhBQWI7UUFFQSxJQUFBLEVBQU0sUUFGTjtRQUdBLENBQUEsT0FBQSxDQUFBLEVBQVMsU0FIVDtRQUlBLENBQUEsSUFBQSxDQUFBLEVBQU0sQ0FDSixvQkFESSxFQUVKLE9BRkksRUFHSixTQUhJLENBSk47T0FqQkY7TUEwQkEscUJBQUEsRUFDRTtRQUFBLFdBQUEsRUFBYSxtQ0FBYjtRQUNBLElBQUEsRUFBTSxTQUROO1FBRUEsQ0FBQSxPQUFBLENBQUEsRUFBUyxLQUZUO09BM0JGO01BOEJBLDJCQUFBLEVBQ0U7UUFBQSxXQUFBLEVBQWEsK0JBQWI7UUFDQSxJQUFBLEVBQU0sT0FETjtRQUVBLENBQUEsT0FBQSxDQUFBLEVBQVMsT0FGVDtPQS9CRjtNQWtDQSxrQkFBQSxFQUNFO1FBQUEsV0FBQSxFQUFhLDRDQUFiO1FBQ0EsSUFBQSxFQUFNLFNBRE47UUFFQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEtBRlQ7T0FuQ0Y7TUFzQ0EsZUFBQSxFQUNFO1FBQUEsV0FBQSxFQUFhLCtCQUFiO1FBQ0EsSUFBQSxFQUFNLFNBRE47UUFFQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEtBRlQ7T0F2Q0Y7TUEwQ0EsbUJBQUEsRUFDRTtRQUFBLFdBQUEsRUFBYSxpR0FBYjtRQUVBLElBQUEsRUFBTSxRQUZOO1FBR0EsQ0FBQSxPQUFBLENBQUEsRUFBUyw4Q0FIVDtPQTNDRjtNQStDQSxrQkFBQSxFQUNFO1FBQUEsV0FBQSxFQUFhLGlEQUFiO1FBQ0EsSUFBQSxFQUFNLFNBRE47UUFFQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEtBRlQ7T0FoREY7TUFtREEsZUFBQSxFQUNFO1FBQUEsV0FBQSxFQUFhLCtDQUFiO1FBQ0EsSUFBQSxFQUFNLFNBRE47UUFFQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEtBRlQ7T0FwREY7TUF1REEsV0FBQSxFQUNFO1FBQUEsV0FBQSxFQUFhLCtCQUFiO1FBQ0EsSUFBQSxFQUFNLFNBRE47UUFFQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEtBRlQ7T0F4REY7TUEyREEsU0FBQSxFQUNFO1FBQUEsV0FBQSxFQUFhLHNMQUFiO1FBQ0EsSUFBQSxFQUFNLFFBRE47UUFFQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLE1BRlQ7UUFHQSxDQUFBLElBQUEsQ0FBQSxFQUFNLENBQ0osTUFESSxFQUVKLFNBRkksQ0FITjtPQTVERjtLQURGO0lBc0VBLFFBQUEsRUFBVSxTQUFDLEtBQUQ7YUFFUixJQUFJLENBQUMsTUFBTSxDQUFDLHVCQUFaLENBQW9DLFNBQUE7QUFDbEMsWUFBQTtRQUFBLE1BQUEsR0FBUyxPQUFBLENBQVEsVUFBUjtlQUNULE1BQU0sQ0FBQyxLQUFQLENBQUE7TUFGa0MsQ0FBcEM7SUFGUSxDQXRFVjs7QUFGRiIsInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID1cblxuICBjb25maWc6XG4gICAgZm9udEZhbWlseTpcbiAgICAgIGRlc2NyaXB0aW9uOiAnVXNlIG9uZSBvZiB0aGUgZm9udHMgYXZhaWxhYmxlIGluIHRoaXMgcGFja2FnZS5cbiAgICAgICAgVmlldyB0aGUgUkVBRE1FIGZvciBkZXNjcmlwdGlvbnMgb2YgZWFjaC4nXG4gICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgZGVmYXVsdDogJ1N5c3RlbSBEZWZhdWx0J1xuICAgICAgZW51bTogW1xuICAgICAgICAnQ2FudGFyZWxsJyxcbiAgICAgICAgJ0NsZWFyIFNhbnMnLFxuICAgICAgICAnRmlyYSBTYW5zJyxcbiAgICAgICAgJ09wZW4gU2FucycsXG4gICAgICAgICdPeHlnZW4nLFxuICAgICAgICAnUm9ib3RvJyxcbiAgICAgICAgJ1NvdXJjZSBTYW5zIFBybycsXG4gICAgICAgICdVYnVudHUnLFxuICAgICAgICAnU3lzdGVtIERlZmF1bHQnXG4gICAgICBdXG4gICAgZm9udFdlaWdodDpcbiAgICAgIGRlc2NyaXB0aW9uOiAnTm90IGFsbCBmb250cyBjb21lIGluIGFsbCB3ZWlnaHRzOiBDYW50ZXJlbGwgYW5kIE94eWdlblxuICAgICAgICBvbmx5IGhhdmUgcmVndWxhciwgVWJ1bnR1IGFuZCBPcGVuIFNhbnMgZG9uXFwndCBoYXZlIHRoaW4uJ1xuICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgIGRlZmF1bHQ6ICdSZWd1bGFyJ1xuICAgICAgZW51bTogW1xuICAgICAgICAnRXh0cmEgbGlnaHQgLyBUaGluJyxcbiAgICAgICAgJ0xpZ2h0JyxcbiAgICAgICAgJ1JlZ3VsYXInXG4gICAgICBdXG4gICAgY3VzdG9tQmFja2dyb3VuZENvbG9yOlxuICAgICAgZGVzY3JpcHRpb246ICdDaG9vc2UgYSBjdXN0b20gYmFja2dyb3VuZCBjb2xvci4nXG4gICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgY3VzdG9tQmFja2dyb3VuZENvbG9yUGlja2VyOlxuICAgICAgZGVzY3JpcHRpb246ICdDaG9vc2UgeW91ciBiYWNrZ3JvdW5kIGNvbG9yLidcbiAgICAgIHR5cGU6ICdjb2xvcidcbiAgICAgIGRlZmF1bHQ6ICd3aGl0ZSdcbiAgICBiYWNrZ3JvdW5kR3JhZGllbnQ6XG4gICAgICBkZXNjcmlwdGlvbjogJ0FwcGx5IGEgc3VidGxlIGdyYWRpZW50IHRvIHRoZSBiYWNrZ3JvdW5kLidcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICBiYWNrZ3JvdW5kSW1hZ2U6XG4gICAgICBkZXNjcmlwdGlvbjogJ1VzZSBhbiBpbWFnZSBhcyBhIGJhY2tncm91bmQuJ1xuICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICBkZWZhdWx0OiBmYWxzZVxuICAgIGJhY2tncm91bmRJbWFnZVBhdGg6XG4gICAgICBkZXNjcmlwdGlvbjogJ1RoZSBwYXRoIHRvIGFuIGltYWdlIGZyb20geW91ciBjb21wdXRlciBvclxuICAgICAgIHRoZSBpbnRlcm5ldHMgKGUuZy4gaHViYmxlc2l0ZS5vcmcgb3IgdW5zcGxhc2guY29tKS4nXG4gICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgZGVmYXVsdDogJ2F0b206Ly9pc290b3BlLXVpL3Jlc291cmNlcy9pbWFnZXMvcmFrZXQuanBnJ1xuICAgIGxvd0NvbnRyYXN0VG9vbHRpcDpcbiAgICAgIGRlc2NyaXB0aW9uOiAnTWFrZSB0b29sdGlwcyBsb3cgY29udHJhc3QgYW5kIG5vdCBzbyBjb2xvcmZ1bC4nXG4gICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgbWF0Y2hFZGl0b3JGb250OlxuICAgICAgZGVzY3JpcHRpb246ICdNYXRjaCB0aGUgZm9udCBmYW1pbHkgeW91IHNldCBmb3IgdGhlIGVkaXRvci4nXG4gICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgbWluaW1hbE1vZGU6XG4gICAgICBkZXNjcmlwdGlvbjogJ01ha2UgdGhlIGxheW91dCBtb3JlIG1pbmltYWwuJ1xuICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICBkZWZhdWx0OiBmYWxzZVxuICAgIHRhYlNpemluZzpcbiAgICAgIGRlc2NyaXB0aW9uOiAnSW4gRXZlbiBtb2RlIGFsbCB0YWJzIHdpbGwgYmUgdGhlIHNhbWUgc2l6ZS4gR3JlYXQgZm9yIHF1aWNrbHkgY2xvc2luZyBtYW55IHRhYnMuIEluIE1pbmltdW0gbW9kZSB0aGUgdGFicyB3aWxsIG9ubHkgdGFrZSBhcyBsaXR0bGUgc3BhY2UgYXMgbmVlZGVkIGFuZCBhbHNvIHNob3cgbG9uZ2VyIGZpbGUgbmFtZXMuJ1xuICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgIGRlZmF1bHQ6ICdFdmVuJ1xuICAgICAgZW51bTogW1xuICAgICAgICAnRXZlbicsXG4gICAgICAgICdNaW5pbXVtJ1xuICAgICAgXVxuXG5cbiAgYWN0aXZhdGU6IChzdGF0ZSkgLT5cbiAgICAjIGNvZGUgaW4gc2VwYXJhdGUgZmlsZSBzbyBkZWZlcnJhbCBrZWVwcyBhY3RpdmF0aW9uIHRpbWUgZG93blxuICAgIGF0b20udGhlbWVzLm9uRGlkQ2hhbmdlQWN0aXZlVGhlbWVzIC0+XG4gICAgICBDb25maWcgPSByZXF1aXJlICcuL2NvbmZpZydcbiAgICAgIENvbmZpZy5hcHBseSgpXG4iXX0=
