(function() {
  module.exports = {
    apply: function() {
      var applyBackgroundColor, applyBackgroundGradient, applyBackgroundImage, applyEditorFont, applyFont, applyFontWeight, applyMinimalMode, applyTabSizing, applyTooltipContrast, body;
      body = document.querySelector('body');
      applyFont = function(font) {
        return body.setAttribute('data-isotope-ui-font', font);
      };
      applyFontWeight = function(weight) {
        return body.setAttribute('data-isotope-ui-fontweight', weight);
      };
      applyBackgroundColor = function() {
        if (atom.config.get('isotope-ui.customBackgroundColor')) {
          atom.config.set('isotope-ui.backgroundImage', 'false');
          atom.config.set('isotope-ui.backgroundGradient', 'false');
          body.setAttribute('data-isotope-ui-bg-color', 'true');
          return body.style.backgroundColor = atom.config.get('isotope-ui.customBackgroundColorPicker').toHexString();
        } else {
          body.setAttribute('data-isotope-ui-bg-color', 'false');
          return body.style.backgroundColor = '';
        }
      };
      applyBackgroundGradient = function() {
        if (atom.config.get('isotope-ui.backgroundGradient')) {
          atom.config.set('isotope-ui.backgroundImage', 'false');
          atom.config.set('isotope-ui.customBackgroundColor', 'false');
          return body.setAttribute('data-isotope-ui-bg-gradient', 'true');
        } else {
          return body.setAttribute('data-isotope-ui-bg-gradient', 'false');
        }
      };
      applyBackgroundImage = function() {
        if (atom.config.get('isotope-ui.backgroundImage')) {
          atom.config.set('isotope-ui.customBackgroundColor', 'false');
          atom.config.set('isotope-ui.customBackgroundColor', 'false');
          atom.config.set('isotope-ui.backgroundGradient', 'false');
          body.setAttribute('data-isotope-ui-bg-image', 'true');
          return body.style.backgroundImage = 'url(' + atom.config.get('isotope-ui.backgroundImagePath') + ')';
        } else {
          body.setAttribute('data-isotope-ui-bg-image', 'false');
          return body.style.backgroundImage = '';
        }
      };
      applyTooltipContrast = function() {
        if (atom.config.get('isotope-ui.lowContrastTooltip')) {
          return body.setAttribute('data-isotope-ui-tooltip-lowcontrast', 'true');
        } else {
          return body.setAttribute('data-isotope-ui-tooltip-lowcontrast', 'false');
        }
      };
      applyEditorFont = function() {
        if (atom.config.get('isotope-ui.matchEditorFont')) {
          if (atom.config.get('editor.fontFamily') === '') {
            return body.style.fontFamily = 'Inconsolata, Monaco, Consolas, "Courier New", Courier';
          } else {
            return body.style.fontFamily = atom.config.get('editor.fontFamily');
          }
        } else {
          return body.style.fontFamily = '';
        }
      };
      applyMinimalMode = function() {
        if (atom.config.get('isotope-ui.minimalMode')) {
          return body.setAttribute('data-isotope-ui-minimal', 'true');
        } else {
          return body.setAttribute('data-isotope-ui-minimal', 'false');
        }
      };
      applyTabSizing = function() {
        return body.setAttribute('data-isotope-ui-tabsizing', atom.config.get('isotope-ui.tabSizing').toLowerCase());
      };
      applyFont(atom.config.get('isotope-ui.fontFamily'));
      applyFontWeight(atom.config.get('isotope-ui.fontWeight'));
      applyBackgroundGradient();
      applyBackgroundImage();
      applyBackgroundColor();
      applyTooltipContrast();
      applyEditorFont();
      applyMinimalMode();
      applyTabSizing();
      atom.config.onDidChange('isotope-ui.fontFamily', function() {
        return applyFont(atom.config.get('isotope-ui.fontFamily'));
      });
      atom.config.onDidChange('isotope-ui.fontWeight', function() {
        return applyFontWeight(atom.config.get('isotope-ui.fontWeight'));
      });
      atom.config.onDidChange('isotope-ui.customBackgroundColor', function() {
        return applyBackgroundColor();
      });
      atom.config.onDidChange('isotope-ui.customBackgroundColorPicker', function() {
        return applyBackgroundColor();
      });
      atom.config.onDidChange('isotope-ui.backgroundGradient', function() {
        return applyBackgroundGradient();
      });
      atom.config.onDidChange('isotope-ui.backgroundImage', function() {
        return applyBackgroundImage();
      });
      atom.config.onDidChange('isotope-ui.backgroundImagePath', function() {
        return applyBackgroundImage();
      });
      atom.config.onDidChange('isotope-ui.lowContrastTooltip', function() {
        return applyTooltipContrast();
      });
      atom.config.onDidChange('isotope-ui.matchEditorFont', function() {
        return applyEditorFont();
      });
      atom.config.onDidChange('isotope-ui.minimalMode', function() {
        return applyMinimalMode();
      });
      atom.config.onDidChange('editor.fontFamily', function() {
        return applyEditorFont();
      });
      return atom.config.onDidChange('isotope-ui.tabSizing', function() {
        return applyTabSizing();
      });
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvYW5hbm1heTMvLmF0b20vcGFja2FnZXMvaXNvdG9wZS11aS9saWIvY29uZmlnLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtFQUFBLE1BQU0sQ0FBQyxPQUFQLEdBRUU7SUFBQSxLQUFBLEVBQU8sU0FBQTtBQUVMLFVBQUE7TUFBQSxJQUFBLEdBQU8sUUFBUSxDQUFDLGFBQVQsQ0FBdUIsTUFBdkI7TUFLUCxTQUFBLEdBQVksU0FBQyxJQUFEO2VBQ1YsSUFBSSxDQUFDLFlBQUwsQ0FBa0Isc0JBQWxCLEVBQTBDLElBQTFDO01BRFU7TUFHWixlQUFBLEdBQWtCLFNBQUMsTUFBRDtlQUNoQixJQUFJLENBQUMsWUFBTCxDQUFrQiw0QkFBbEIsRUFBZ0QsTUFBaEQ7TUFEZ0I7TUFHbEIsb0JBQUEsR0FBdUIsU0FBQTtRQUNyQixJQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixrQ0FBaEIsQ0FBSDtVQUNFLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQiw0QkFBaEIsRUFBOEMsT0FBOUM7VUFDQSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsK0JBQWhCLEVBQWlELE9BQWpEO1VBQ0EsSUFBSSxDQUFDLFlBQUwsQ0FBa0IsMEJBQWxCLEVBQThDLE1BQTlDO2lCQUNBLElBQUksQ0FBQyxLQUFLLENBQUMsZUFBWCxHQUE2QixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0Isd0NBQWhCLENBQXlELENBQUMsV0FBMUQsQ0FBQSxFQUovQjtTQUFBLE1BQUE7VUFNRSxJQUFJLENBQUMsWUFBTCxDQUFrQiwwQkFBbEIsRUFBOEMsT0FBOUM7aUJBQ0EsSUFBSSxDQUFDLEtBQUssQ0FBQyxlQUFYLEdBQTZCLEdBUC9COztNQURxQjtNQVV2Qix1QkFBQSxHQUEwQixTQUFBO1FBQ3hCLElBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLCtCQUFo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QWtELFNBQUE7ZUFDaEQsZ0JBQUEsQ0FBQTtNQURnRCxDQUFsRDtNQUdBLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBWixDQUF3QixtQkFBeEIsRUFBNkMsU0FBQTtlQUMzQyxlQUFBLENBQUE7TUFEMkMsQ0FBN0M7YUFHQSxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVosQ0FBd0Isc0JBQXhCLEVBQWdELFNBQUE7ZUFDOUMsY0FBQSxDQUFBO01BRDhDLENBQWhEO0lBcEhLLENBQVA7O0FBRkYiLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUuZXhwb3J0cyA9XG5cbiAgYXBwbHk6ICgpIC0+XG5cbiAgICBib2R5ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYm9keScpXG5cblxuICAgICMgZnVuY3Rpb25zXG5cbiAgICBhcHBseUZvbnQgPSAoZm9udCkgLT5cbiAgICAgIGJvZHkuc2V0QXR0cmlidXRlKCdkYXRhLWlzb3RvcGUtdWktZm9udCcsIGZvbnQpXG5cbiAgICBhcHBseUZvbnRXZWlnaHQgPSAod2VpZ2h0KSAtPlxuICAgICAgYm9keS5zZXRBdHRyaWJ1dGUoJ2RhdGEtaXNvdG9wZS11aS1mb250d2VpZ2h0Jywgd2VpZ2h0KVxuXG4gICAgYXBwbHlCYWNrZ3JvdW5kQ29sb3IgPSAoKSAtPlxuICAgICAgaWYgYXRvbS5jb25maWcuZ2V0KCdpc290b3BlLXVpLmN1c3RvbUJhY2tncm91bmRDb2xvcicpXG4gICAgICAgIGF0b20uY29uZmlnLnNldCgnaXNvdG9wZS11aS5iYWNrZ3JvdW5kSW1hZ2UnLCAnZmFsc2UnKVxuICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ2lzb3RvcGUtdWkuYmFja2dyb3VuZEdyYWRpZW50JywgJ2ZhbHNlJylcbiAgICAgICAgYm9keS5zZXRBdHRyaWJ1dGUoJ2RhdGEtaXNvdG9wZS11aS1iZy1jb2xvcicsICd0cnVlJylcbiAgICAgICAgYm9keS5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSBhdG9tLmNvbmZpZy5nZXQoJ2lzb3RvcGUtdWkuY3VzdG9tQmFja2dyb3VuZENvbG9yUGlja2VyJykudG9IZXhTdHJpbmcoKVxuICAgICAgZWxzZVxuICAgICAgICBib2R5LnNldEF0dHJpYnV0ZSgnZGF0YS1pc290b3BlLXVpLWJnLWNvbG9yJywgJ2ZhbHNlJylcbiAgICAgICAgYm9keS5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSAnJ1xuXG4gICAgYXBwbHlCYWNrZ3JvdW5kR3JhZGllbnQgPSAoKSAtPlxuICAgICAgaWYgYXRvbS5jb25maWcuZ2V0KCdpc290b3BlLXVpLmJhY2tncm91bmRHcmFkaWVudCcpXG4gICAgICAgIGF0b20uY29uZmlnLnNldCgnaXNvdG9wZS11aS5iYWNrZ3JvdW5kSW1hZ2UnLCAnZmFsc2UnKVxuICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ2lzb3RvcGUtdWkuY3VzdG9tQmFja2dyb3VuZENvbG9yJywgJ2ZhbHNlJylcbiAgICAgICAgYm9keS5zZXRBdHRyaWJ1dGUoJ2RhdGEtaXNvdG9wZS11aS1iZy1ncmFkaWVudCcsICd0cnVlJylcbiAgICAgIGVsc2VcbiAgICAgICAgYm9keS5zZXRBdHRyaWJ1dGUoJ2RhdGEtaXNvdG9wZS11aS1iZy1ncmFkaWVudCcsICdmYWxzZScpXG5cbiAgICBhcHBseUJhY2tncm91bmRJbWFnZSA9ICgpIC0+XG4gICAgICBpZiBhdG9tLmNvbmZpZy5nZXQoJ2lzb3RvcGUtdWkuYmFja2dyb3VuZEltYWdlJylcbiAgICAgICAgYXRvbS5jb25maWcuc2V0KCdpc290b3BlLXVpLmN1c3RvbUJhY2tncm91bmRDb2xvcicsICdmYWxzZScpXG4gICAgICAgIGF0b20uY29uZmlnLnNldCgnaXNvdG9wZS11aS5jdXN0b21CYWNrZ3JvdW5kQ29sb3InLCAnZmFsc2UnKVxuICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ2lzb3RvcGUtdWkuYmFja2dyb3VuZEdyYWRpZW50JywgJ2ZhbHNlJylcbiAgICAgICAgYm9keS5zZXRBdHRyaWJ1dGUoJ2RhdGEtaXNvdG9wZS11aS1iZy1pbWFnZScsICd0cnVlJylcbiAgICAgICAgYm9keS5zdHlsZS5iYWNrZ3JvdW5kSW1hZ2UgPVxuICAgICAgICAgICd1cmwoJyArIGF0b20uY29uZmlnLmdldCgnaXNvdG9wZS11aS5iYWNrZ3JvdW5kSW1hZ2VQYXRoJykgKyAnKSdcbiAgICAgIGVsc2VcbiAgICAgICAgYm9keS5zZXRBdHRyaWJ1dGUoJ2RhdGEtaXNvdG9wZS11aS1iZy1pbWFnZScsICdmYWxzZScpXG4gICAgICAgIGJvZHkuc3R5bGUuYmFja2dyb3VuZEltYWdlID0gJydcblxuICAgIGFwcGx5VG9vbHRpcENvbnRyYXN0ID0gKCkgLT5cbiAgICAgIGlmIGF0b20uY29uZmlnLmdldCgnaXNvdG9wZS11aS5sb3dDb250cmFzdFRvb2x0aXAnKVxuICAgICAgICBib2R5LnNldEF0dHJpYnV0ZSgnZGF0YS1pc290b3BlLXVpLXRvb2x0aXAtbG93Y29udHJhc3QnLCAndHJ1ZScpXG4gICAgICBlbHNlXG4gICAgICAgIGJvZHkuc2V0QXR0cmlidXRlKCdkYXRhLWlzb3RvcGUtdWktdG9vbHRpcC1sb3djb250cmFzdCcsICdmYWxzZScpXG5cbiAgICBhcHBseUVkaXRvckZvbnQgPSAoKSAtPlxuICAgICAgaWYgYXRvbS5jb25maWcuZ2V0KCdpc290b3BlLXVpLm1hdGNoRWRpdG9yRm9udCcpXG4gICAgICAgIGlmIGF0b20uY29uZmlnLmdldCgnZWRpdG9yLmZvbnRGYW1pbHknKSBpcyAnJ1xuICAgICAgICAgIGJvZHkuc3R5bGUuZm9udEZhbWlseSA9ICdJbmNvbnNvbGF0YSwgTW9uYWNvLCBDb25zb2xhcywgXCJDb3VyaWVyIE5ld1wiLCBDb3VyaWVyJ1xuICAgICAgICBlbHNlXG4gICAgICAgICAgYm9keS5zdHlsZS5mb250RmFtaWx5ID0gYXRvbS5jb25maWcuZ2V0KCdlZGl0b3IuZm9udEZhbWlseScpXG4gICAgICBlbHNlXG4gICAgICAgIGJvZHkuc3R5bGUuZm9udEZhbWlseSA9ICcnXG5cbiAgICBhcHBseU1pbmltYWxNb2RlID0gKCkgLT5cbiAgICAgIGlmIGF0b20uY29uZmlnLmdldCgnaXNvdG9wZS11aS5taW5pbWFsTW9kZScpXG4gICAgICAgIGJvZHkuc2V0QXR0cmlidXRlKCdkYXRhLWlzb3RvcGUtdWktbWluaW1hbCcsICd0cnVlJylcbiAgICAgIGVsc2VcbiAgICAgICAgYm9keS5zZXRBdHRyaWJ1dGUoJ2RhdGEtaXNvdG9wZS11aS1taW5pbWFsJywgJ2ZhbHNlJylcblxuICAgIGFwcGx5VGFiU2l6aW5nID0gKCkgLT5cbiAgICAgIGJvZHkuc2V0QXR0cmlidXRlKCdkYXRhLWlzb3RvcGUtdWktdGFic2l6aW5nJywgYXRvbS5jb25maWcuZ2V0KCdpc290b3BlLXVpLnRhYlNpemluZycpLnRvTG93ZXJDYXNlKCkpXG5cblxuICAgICMgcnVuIHdoZW4gYXRvbSBpcyByZWFkeVxuXG4gICAgYXBwbHlGb250KGF0b20uY29uZmlnLmdldCgnaXNvdG9wZS11aS5mb250RmFtaWx5JykpXG4gICAgYXBwbHlGb250V2VpZ2h0KGF0b20uY29uZmlnLmdldCgnaXNvdG9wZS11aS5mb250V2VpZ2h0JykpXG4gICAgYXBwbHlCYWNrZ3JvdW5kR3JhZGllbnQoKVxuICAgIGFwcGx5QmFja2dyb3VuZEltYWdlKClcbiAgICBhcHBseUJhY2tncm91bmRDb2xvcigpXG4gICAgYXBwbHlUb29sdGlwQ29udHJhc3QoKVxuICAgIGFwcGx5RWRpdG9yRm9udCgpXG4gICAgYXBwbHlNaW5pbWFsTW9kZSgpXG4gICAgYXBwbHlUYWJTaXppbmcoKVxuXG5cbiAgICAjIHJ1biB3aGVuIGNvbmZpZ3MgY2hhbmdlXG5cbiAgICBhdG9tLmNvbmZpZy5vbkRpZENoYW5nZSAnaXNvdG9wZS11aS5mb250RmFtaWx5JywgLT5cbiAgICAgIGFwcGx5Rm9udChhdG9tLmNvbmZpZy5nZXQoJ2lzb3RvcGUtdWkuZm9udEZhbWlseScpKVxuXG4gICAgYXRvbS5jb25maWcub25EaWRDaGFuZ2UgJ2lzb3RvcGUtdWkuZm9udFdlaWdodCcsIC0+XG4gICAgICBhcHBseUZvbnRXZWlnaHQoYXRvbS5jb25maWcuZ2V0KCdpc290b3BlLXVpLmZvbnRXZWlnaHQnKSlcblxuICAgIGF0b20uY29uZmlnLm9uRGlkQ2hhbmdlICdpc290b3BlLXVpLmN1c3RvbUJhY2tncm91bmRDb2xvcicsIC0+XG4gICAgICBhcHBseUJhY2tncm91bmRDb2xvcigpXG5cbiAgICBhdG9tLmNvbmZpZy5vbkRpZENoYW5nZSAnaXNvdG9wZS11aS5jdXN0b21CYWNrZ3JvdW5kQ29sb3JQaWNrZXInLCAtPlxuICAgICAgYXBwbHlCYWNrZ3JvdW5kQ29sb3IoKVxuXG4gICAgYXRvbS5jb25maWcub25EaWRDaGFuZ2UgJ2lzb3RvcGUtdWkuYmFja2dyb3VuZEdyYWRpZW50JywgLT5cbiAgICAgIGFwcGx5QmFja2dyb3VuZEdyYWRpZW50KClcblxuICAgIGF0b20uY29uZmlnLm9uRGlkQ2hhbmdlICdpc290b3BlLXVpLmJhY2tncm91bmRJbWFnZScsIC0+XG4gICAgICBhcHBseUJhY2tncm91bmRJbWFnZSgpXG5cbiAgICBhdG9tLmNvbmZpZy5vbkRpZENoYW5nZSAnaXNvdG9wZS11aS5iYWNrZ3JvdW5kSW1hZ2VQYXRoJywgLT5cbiAgICAgIGFwcGx5QmFja2dyb3VuZEltYWdlKClcblxuICAgIGF0b20uY29uZmlnLm9uRGlkQ2hhbmdlICdpc290b3BlLXVpLmxvd0NvbnRyYXN0VG9vbHRpcCcsIC0+XG4gICAgICBhcHBseVRvb2x0aXBDb250cmFzdCgpXG5cbiAgICBhdG9tLmNvbmZpZy5vbkRpZENoYW5nZSAnaXNvdG9wZS11aS5tYXRjaEVkaXRvckZvbnQnLCAtPlxuICAgICAgYXBwbHlFZGl0b3JGb250KClcblxuICAgIGF0b20uY29uZmlnLm9uRGlkQ2hhbmdlICdpc290b3BlLXVpLm1pbmltYWxNb2RlJywgLT5cbiAgICAgIGFwcGx5TWluaW1hbE1vZGUoKVxuXG4gICAgYXRvbS5jb25maWcub25EaWRDaGFuZ2UgJ2VkaXRvci5mb250RmFtaWx5JywgLT5cbiAgICAgIGFwcGx5RWRpdG9yRm9udCgpXG5cbiAgICBhdG9tLmNvbmZpZy5vbkRpZENoYW5nZSAnaXNvdG9wZS11aS50YWJTaXppbmcnLCAtPlxuICAgICAgYXBwbHlUYWJTaXppbmcoKVxuIl19
