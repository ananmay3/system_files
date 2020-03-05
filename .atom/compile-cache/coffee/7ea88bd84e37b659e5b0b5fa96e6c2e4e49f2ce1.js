(function() {
  var File, SelectList, buildAstDumpArgs, getFirstScopes, getScopeLang, path, ref, ref1, spawnClang;

  File = require('atom').File;

  path = require('path');

  SelectList = require('atom-select-list');

  ref = require('./common-util'), getFirstScopes = ref.getFirstScopes, getScopeLang = ref.getScopeLang;

  ref1 = require('./clang-args-builder'), spawnClang = ref1.spawnClang, buildAstDumpArgs = ref1.buildAstDumpArgs;

  module.exports = {
    goDeclaration: function(editor, e) {
      var args, cwd, lang, term;
      lang = getScopeLang(getFirstScopes(editor));
      if (!lang) {
        e.abortKeyBinding();
        return;
      }
      editor.selectWordsContainingCursors();
      term = editor.getSelectedText();
      cwd = path.dirname(editor.getPath());
      args = buildAstDumpArgs(editor, lang, term);
      return spawnClang(cwd, args, editor.getText(), (function(_this) {
        return function(code, outputs, errors, resolve) {
          console.log("GoDecl err\n", errors);
          return resolve(_this.handleAstDumpResult(editor, {
            output: outputs,
            term: term
          }, code));
        };
      })(this));
    },
    handleAstDumpResult: function(editor, result, returnCode) {
      var declList, places;
      if (returnCode === !0) {
        if (!atom.config.get("autocomplete-clang.ignoreClangErrors")) {
          return;
        }
      }
      places = this.parseAstDump(result.output, result.term);
      if (places.length === 1) {
        return this.jumpToLocation(editor, places.pop());
      } else if (places.length > 1) {
        declList = this.createDeclList(places);
        this.lastFocusedElement = document.activeElement;
        this.panel = atom.workspace.addModalPanel({
          item: declList
        });
        return declList.focus();
      }
    },
    createDeclList: function(places) {
      return new SelectList({
        items: places,
        elementForItem: function(item) {
          var element, f;
          element = document.createElement('li');
          if (item[0] === '<stdin>') {
            element.innerHTML = item[1] + ":" + item[2];
          } else {
            f = path.join(item[0]);
            element.innerHTML(f + "  " + item[1] + ":" + item[2]);
          }
          return element;
        },
        filterKeyForItem: function(item) {
          return item.label;
        },
        didConfirmSelection: (function(_this) {
          return function(item) {
            _this.hideDeclList();
            return _this.jumpToLocation(editor, item);
          };
        })(this),
        didCancelSelection: (function(_this) {
          return function() {
            return _this.hideDeclList();
          };
        })(this)
      });
    },
    hideDeclList: function() {
      if (this.panel && this.panel.destroy) {
        this.panel.destroy();
      }
      if (this.lastFocusedElement) {
        this.lastFocusedElement.focus();
        return this.lastFocusedElement = null;
      }
    },
    jumpToLocation: function(editor, arg) {
      var col, f, file, line;
      file = arg[0], line = arg[1], col = arg[2];
      if (file === '<stdin>') {
        return editor.setCursorBufferPosition([line - 1, col - 1]);
      }
      if (file.startsWith(".")) {
        file = path.join(editor.getDirectoryPath(), file);
      }
      f = new File(file);
      return f.exists().then(function(result) {
        if (result) {
          return atom.workspace.open(file, {
            initialLine: line - 1,
            initialColumn: col - 1
          });
        }
      });
    },
    parseAstDump: function(aststring, term) {
      var _, candidate, candidates, col, declRangeStr, declTerms, file, i, len, line, lines, match, places, posStr, positions, ref2, ref3;
      candidates = aststring.split('\n\n');
      places = [];
      for (i = 0, len = candidates.length; i < len; i++) {
        candidate = candidates[i];
        match = candidate.match(RegExp("^Dumping\\s(?:[A-Za-z_]*::)*?" + term + ":"));
        if (match !== null) {
          lines = candidate.split('\n');
          if (lines.length < 2) {
            continue;
          }
          declTerms = lines[1].split(' ');
          _ = declTerms[0], _ = declTerms[1], declRangeStr = declTerms[2], _ = declTerms[3], posStr = declTerms[4];
          while (!declRangeStr.match(/<(.*):([0-9]+):([0-9]+),/)) {
            if (declTerms.length < 5) {
              break;
            }
            declTerms = declTerms.slice(2);
            _ = declTerms[0], _ = declTerms[1], declRangeStr = declTerms[2], _ = declTerms[3], posStr = declTerms[4];
          }
          if (declRangeStr.match(/<(.*):([0-9]+):([0-9]+),/)) {
            ref2 = declRangeStr.match(/<(.*):([0-9]+):([0-9]+),/), _ = ref2[0], file = ref2[1], line = ref2[2], col = ref2[3];
            positions = posStr.match(/(line|col):([0-9]+)(?::([0-9]+))?/);
            if (positions) {
              if (positions[1] === 'line') {
                ref3 = [positions[2], positions[3]], line = ref3[0], col = ref3[1];
              } else {
                col = positions[2];
              }
              places.push([file, Number(line), Number(col)]);
            }
          }
        }
      }
      return places;
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvYW5hbm1heTMvLmF0b20vcGFja2FnZXMvYXV0b2NvbXBsZXRlLWNsYW5nL2xpYi9qdW1wZXIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQyxPQUFRLE9BQUEsQ0FBUSxNQUFSOztFQUNULElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFDUCxVQUFBLEdBQWEsT0FBQSxDQUFRLGtCQUFSOztFQUViLE1BQWlDLE9BQUEsQ0FBUSxlQUFSLENBQWpDLEVBQUMsbUNBQUQsRUFBaUI7O0VBQ2pCLE9BQWlDLE9BQUEsQ0FBUSxzQkFBUixDQUFqQyxFQUFDLDRCQUFELEVBQWE7O0VBR2IsTUFBTSxDQUFDLE9BQVAsR0FDRTtJQUFBLGFBQUEsRUFBZSxTQUFDLE1BQUQsRUFBUSxDQUFSO0FBQ2IsVUFBQTtNQUFBLElBQUEsR0FBTyxZQUFBLENBQWMsY0FBQSxDQUFlLE1BQWYsQ0FBZDtNQUNQLElBQUEsQ0FBTyxJQUFQO1FBQ0UsQ0FBQyxDQUFDLGVBQUYsQ0FBQTtBQUNBLGVBRkY7O01BR0EsTUFBTSxDQUFDLDRCQUFQLENBQUE7TUFDQSxJQUFBLEdBQU8sTUFBTSxDQUFDLGVBQVAsQ0FBQTtNQUNQLEdBQUEsR0FBTSxJQUFJLENBQUMsT0FBTCxDQUFhLE1BQU0sQ0FBQyxPQUFQLENBQUEsQ0FBYjtNQUNOLElBQUEsR0FBTyxnQkFBQSxDQUFpQixNQUFqQixFQUF5QixJQUF6QixFQUErQixJQUEvQjthQUNQLFVBQUEsQ0FBVyxHQUFYLEVBQWdCLElBQWhCLEVBQXNCLE1BQU0sQ0FBQyxPQUFQLENBQUEsQ0FBdEIsRUFBd0MsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLElBQUQsRUFBTyxPQUFQLEVBQWdCLE1BQWhCLEVBQXdCLE9BQXhCO1VBQ3RDLE9BQU8sQ0FBQyxHQUFSLENBQVksY0FBWixFQUE0QixNQUE1QjtpQkFDQSxPQUFBLENBQVEsS0FBQyxDQUFB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QUwsRUFBa0IsZ0JBQWxCLEVBQW9CO0FBQ3BCLGlCQUFNLENBQUksWUFBWSxDQUFDLEtBQWIsQ0FBbUIsMEJBQW5CLENBQVY7WUFDRSxJQUFTLFNBQVMsQ0FBQyxNQUFWLEdBQW1CLENBQTVCO0FBQUEsb0JBQUE7O1lBQ0EsU0FBQSxHQUFZLFNBQVU7WUFDckIsZ0JBQUQsRUFBRyxnQkFBSCxFQUFLLDJCQUFMLEVBQWtCLGdCQUFsQixFQUFvQjtVQUh0QjtVQUlBLElBQUcsWUFBWSxDQUFDLEtBQWIsQ0FBbUIsMEJBQW5CLENBQUg7WUFDRSxPQUFvQixZQUFZLENBQUMsS0FBYixDQUFtQiwwQkFBbkIsQ0FBcEIsRUFBQyxXQUFELEVBQUcsY0FBSCxFQUFRLGNBQVIsRUFBYTtZQUNiLFNBQUEsR0FBWSxNQUFNLENBQUMsS0FBUCxDQUFhLG1DQUFiO1lBQ1osSUFBRyxTQUFIO2NBQ0UsSUFBRyxTQUFVLENBQUEsQ0FBQSxDQUFWLEtBQWdCLE1BQW5CO2dCQUNFLE9BQWEsQ0FBQyxTQUFVLENBQUEsQ0FBQSxDQUFYLEVBQWUsU0FBVSxDQUFBLENBQUEsQ0FBekIsQ0FBYixFQUFDLGNBQUQsRUFBTSxjQURSO2VBQUEsTUFBQTtnQkFHRSxHQUFBLEdBQU0sU0FBVSxDQUFBLENBQUEsRUFIbEI7O2NBSUEsTUFBTSxDQUFDLElBQVAsQ0FBWSxDQUFDLElBQUQsRUFBTyxNQUFBLENBQU8sSUFBUCxDQUFQLEVBQXFCLE1BQUEsQ0FBTyxHQUFQLENBQXJCLENBQVosRUFMRjthQUhGO1dBVEY7O0FBRkY7QUFvQkEsYUFBTztJQXZCSyxDQTFEZDs7QUFURiIsInNvdXJjZXNDb250ZW50IjpbIntGaWxlfSA9IHJlcXVpcmUgJ2F0b20nXG5wYXRoID0gcmVxdWlyZSAncGF0aCdcblNlbGVjdExpc3QgPSByZXF1aXJlICdhdG9tLXNlbGVjdC1saXN0J1xuXG57Z2V0Rmlyc3RTY29wZXMsIGdldFNjb3BlTGFuZ30gPSByZXF1aXJlICcuL2NvbW1vbi11dGlsJ1xue3NwYXduQ2xhbmcsIGJ1aWxkQXN0RHVtcEFyZ3N9ID0gcmVxdWlyZSAnLi9jbGFuZy1hcmdzLWJ1aWxkZXInXG5cblxubW9kdWxlLmV4cG9ydHMgPVxuICBnb0RlY2xhcmF0aW9uOiAoZWRpdG9yLGUpLT5cbiAgICBsYW5nID0gZ2V0U2NvcGVMYW5nIChnZXRGaXJzdFNjb3BlcyBlZGl0b3IpXG4gICAgdW5sZXNzIGxhbmdcbiAgICAgIGUuYWJvcnRLZXlCaW5kaW5nKClcbiAgICAgIHJldHVyblxuICAgIGVkaXRvci5zZWxlY3RXb3Jkc0NvbnRhaW5pbmdDdXJzb3JzKClcbiAgICB0ZXJtID0gZWRpdG9yLmdldFNlbGVjdGVkVGV4dCgpXG4gICAgY3dkID0gcGF0aC5kaXJuYW1lIGVkaXRvci5nZXRQYXRoKClcbiAgICBhcmdzID0gYnVpbGRBc3REdW1wQXJncyBlZGl0b3IsIGxhbmcsIHRlcm1cbiAgICBzcGF3bkNsYW5nIGN3ZCwgYXJncywgZWRpdG9yLmdldFRleHQoKSwgKGNvZGUsIG91dHB1dHMsIGVycm9ycywgcmVzb2x2ZSkgPT5cbiAgICAgIGNvbnNvbGUubG9nIFwiR29EZWNsIGVyclxcblwiLCBlcnJvcnNcbiAgICAgIHJlc29sdmUoQGhhbmRsZUFzdER1bXBSZXN1bHQgZWRpdG9yLCB7b3V0cHV0Om91dHB1dHMsIHRlcm06dGVybX0sIGNvZGUpXG5cbiAgaGFuZGxlQXN0RHVtcFJlc3VsdDogKGVkaXRvciwgcmVzdWx0LCByZXR1cm5Db2RlKS0+XG4gICAgaWYgcmV0dXJuQ29kZSBpcyBub3QgMFxuICAgICAgcmV0dXJuIHVubGVzcyBhdG9tLmNvbmZpZy5nZXQgXCJhdXRvY29tcGxldGUtY2xhbmcuaWdub3JlQ2xhbmdFcnJvcnNcIlxuICAgIHBsYWNlcyA9IEBwYXJzZUFzdER1bXAgcmVzdWx0Lm91dHB1dCwgcmVzdWx0LnRlcm1cbiAgICBpZiBwbGFjZXMubGVuZ3RoIGlzIDFcbiAgICAgIEBqdW1wVG9Mb2NhdGlvbiBlZGl0b3IsIHBsYWNlcy5wb3AoKVxuICAgIGVsc2UgaWYgcGxhY2VzLmxlbmd0aCA+IDFcbiAgICAgIGRlY2xMaXN0ID0gQGNyZWF0ZURlY2xMaXN0IHBsYWNlc1xuICAgICAgQGxhc3RGb2N1c2VkRWxlbWVudCA9IGRvY3VtZW50LmFjdGl2ZUVsZW1lbnRcbiAgICAgIEBwYW5lbCA9IGF0b20ud29ya3NwYWNlLmFkZE1vZGFsUGFuZWwgaXRlbTogZGVjbExpc3RcbiAgICAgIGRlY2xMaXN0LmZvY3VzKClcblxuICBjcmVhdGVEZWNsTGlzdDogKHBsYWNlcykgLT5cbiAgICBuZXcgU2VsZWN0TGlzdFxuICAgICAgaXRlbXM6IHBsYWNlc1xuICAgICAgZWxlbWVudEZvckl0ZW06IChpdGVtKSAtPlxuICAgICAgICBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGknKVxuICAgICAgICBpZiBpdGVtWzBdIGlzICc8c3RkaW4+J1xuICAgICAgICAgIGVsZW1lbnQuaW5uZXJIVE1MID0gXCIje2l0ZW1bMV19OiN7aXRlbVsyXX1cIlxuICAgICAgICBlbHNlXG4gICAgICAgICAgZiA9IHBhdGguam9pbihpdGVtWzBdKVxuICAgICAgICAgIGVsZW1lbnQuaW5uZXJIVE1MIFwiI3tmfSAgI3tpdGVtWzFdfToje2l0ZW1bMl19XCJcbiAgICAgICAgZWxlbWVudFxuICAgICAgZmlsdGVyS2V5Rm9ySXRlbTogKGl0ZW0pIC0+IGl0ZW0ubGFiZWwsXG4gICAgICBkaWRDb25maXJtU2VsZWN0aW9uOiAoaXRlbSkgPT5cbiAgICAgICAgQGhpZGVEZWNsTGlzdCgpXG4gICAgICAgIEBqdW1wVG9Mb2NhdGlvbiBlZGl0b3IsIGl0ZW1cbiAgICAgIGRpZENhbmNlbFNlbGVjdGlvbjogKCkgPT5cbiAgICAgICAgQGhpZGVEZWNsTGlzdCgpXG5cbiAgaGlkZURlY2xMaXN0OiAoKS0+XG4gICAgaWYgQHBhbmVsIGFuZCBAcGFuZWwuZGVzdHJveVxuICAgICAgQHBhbmVsLmRlc3Ryb3koKVxuICAgIGlmIEBsYXN0Rm9jdXNlZEVsZW1lbnRcbiAgICAgIEBsYXN0Rm9jdXNlZEVsZW1lbnQuZm9jdXMoKVxuICAgICAgQGxhc3RGb2N1c2VkRWxlbWVudCA9IG51bGxcblxuICBqdW1wVG9Mb2NhdGlvbjogKGVkaXRvciwgW2ZpbGUsbGluZSxjb2xdKSAtPlxuICAgIGlmIGZpbGUgaXMgJzxzdGRpbj4nXG4gICAgICByZXR1cm4gZWRpdG9yLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uIFtsaW5lLTEsY29sLTFdXG4gICAgZmlsZSA9IHBhdGguam9pbiBlZGl0b3IuZ2V0RGlyZWN0b3J5UGF0aCgpLCBmaWxlIGlmIGZpbGUuc3RhcnRzV2l0aChcIi5cIilcbiAgICBmID0gbmV3IEZpbGUgZmlsZVxuICAgIGYuZXhpc3RzKCkudGhlbiAocmVzdWx0KSAtPlxuICAgICAgYXRvbS53b3Jrc3BhY2Uub3BlbiBmaWxlLCB7aW5pdGlhbExpbmU6bGluZS0xLCBpbml0aWFsQ29sdW1uOmNvbC0xfSBpZiByZXN1bHRcblxuICBwYXJzZUFzdER1bXA6IChhc3RzdHJpbmcsIHRlcm0pLT5cbiAgICBjYW5kaWRhdGVzID0gYXN0c3RyaW5nLnNwbGl0ICdcXG5cXG4nXG4gICAgcGxhY2VzID0gW11cbiAgICBmb3IgY2FuZGlkYXRlIGluIGNhbmRpZGF0ZXNcbiAgICAgIG1hdGNoID0gY2FuZGlkYXRlLm1hdGNoIC8vL15EdW1waW5nXFxzKD86W0EtWmEtel9dKjo6KSo/I3t0ZXJtfTovLy9cbiAgICAgIGlmIG1hdGNoIGlzbnQgbnVsbFxuICAgICAgICBsaW5lcyA9IGNhbmRpZGF0ZS5zcGxpdCAnXFxuJ1xuICAgICAgICBjb250aW51ZSBpZiBsaW5lcy5sZW5ndGggPCAyXG4gICAgICAgIGRlY2xUZXJtcyA9IGxpbmVzWzFdLnNwbGl0ICcgJ1xuICAgICAgICBbXyxfLGRlY2xSYW5nZVN0cixfLHBvc1N0ciwuLi5dID0gZGVjbFRlcm1zXG4gICAgICAgIHdoaWxlIG5vdCBkZWNsUmFuZ2VTdHIubWF0Y2ggLzwoLiopOihbMC05XSspOihbMC05XSspLC9cbiAgICAgICAgICBicmVhayBpZiBkZWNsVGVybXMubGVuZ3RoIDwgNVxuICAgICAgICAgIGRlY2xUZXJtcyA9IGRlY2xUZXJtc1syLi5dXG4gICAgICAgICAgW18sXyxkZWNsUmFuZ2VTdHIsXyxwb3NTdHIsLi4uXSA9IGRlY2xUZXJtc1xuICAgICAgICBpZiBkZWNsUmFuZ2VTdHIubWF0Y2ggLzwoLiopOihbMC05XSspOihbMC05XSspLC9cbiAgICAgICAgICBbXyxmaWxlLGxpbmUsY29sXSA9IGRlY2xSYW5nZVN0ci5tYXRjaCAvPCguKik6KFswLTldKyk6KFswLTldKyksL1xuICAgICAgICAgIHBvc2l0aW9ucyA9IHBvc1N0ci5tYXRjaCAvKGxpbmV8Y29sKTooWzAtOV0rKSg/OjooWzAtOV0rKSk/L1xuICAgICAgICAgIGlmIHBvc2l0aW9uc1xuICAgICAgICAgICAgaWYgcG9zaXRpb25zWzFdIGlzICdsaW5lJ1xuICAgICAgICAgICAgICBbbGluZSxjb2xdID0gW3Bvc2l0aW9uc1syXSwgcG9zaXRpb25zWzNdXVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICBjb2wgPSBwb3NpdGlvbnNbMl1cbiAgICAgICAgICAgIHBsYWNlcy5wdXNoIFtmaWxlLChOdW1iZXIgbGluZSksKE51bWJlciBjb2wpXVxuICAgIHJldHVybiBwbGFjZXNcbiJdfQ==
