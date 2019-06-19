(function() {
  var $, $$, AutocompleteView, CompositeDisposable, Range, SelectListView, _, ref, ref1,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  _ = require('underscore-plus');

  ref = require('atom'), Range = ref.Range, CompositeDisposable = ref.CompositeDisposable;

  ref1 = require('atom-space-pen-views'), $ = ref1.$, $$ = ref1.$$, SelectListView = ref1.SelectListView;

  module.exports = AutocompleteView = (function(superClass) {
    extend(AutocompleteView, superClass);

    function AutocompleteView() {
      return AutocompleteView.__super__.constructor.apply(this, arguments);
    }

    AutocompleteView.prototype.currentBuffer = null;

    AutocompleteView.prototype.checkpoint = null;

    AutocompleteView.prototype.wordList = null;

    AutocompleteView.prototype.wordRegex = /\w+/g;

    AutocompleteView.prototype.originalSelectionBufferRanges = null;

    AutocompleteView.prototype.originalCursorPosition = null;

    AutocompleteView.prototype.aboveCursor = false;

    AutocompleteView.prototype.initialize = function(editor) {
      this.editor = editor;
      AutocompleteView.__super__.initialize.apply(this, arguments);
      this.addClass('autocomplete popover-list');
      this.handleEvents();
      return this.setCurrentBuffer(this.editor.getBuffer());
    };

    AutocompleteView.prototype.getFilterKey = function() {
      return 'word';
    };

    AutocompleteView.prototype.viewForItem = function(arg) {
      var word;
      word = arg.word;
      return $$(function() {
        return this.li((function(_this) {
          return function() {
            return _this.span(word);
          };
        })(this));
      });
    };

    AutocompleteView.prototype.handleEvents = function() {
      this.list.on('mousewheel', function(event) {
        return event.stopPropagation();
      });
      this.editor.onDidChangePath((function(_this) {
        return function() {
          return _this.setCurrentBuffer(_this.editor.getBuffer());
        };
      })(this));
      this.subscriptions = new CompositeDisposable;
      this.subscriptions.add(this.editor.onDidDestroy((function(_this) {
        return function() {
          return _this.subscriptions.dispose();
        };
      })(this)));
      return this.filterEditorView.getModel().onWillInsertText((function(_this) {
        return function(arg) {
          var cancel, text;
          cancel = arg.cancel, text = arg.text;
          if (!text.match(_this.wordRegex)) {
            _this.confirmSelection();
            _this.editor.insertText(text);
            return cancel();
          }
        };
      })(this));
    };

    AutocompleteView.prototype.setCurrentBuffer = function(currentBuffer) {
      this.currentBuffer = currentBuffer;
    };

    AutocompleteView.prototype.selectItemView = function(item) {
      var match;
      AutocompleteView.__super__.selectItemView.apply(this, arguments);
      if (match = this.getSelectedItem()) {
        return this.replaceSelectedTextWithMatch(match);
      }
    };

    AutocompleteView.prototype.selectNextItemView = function() {
      AutocompleteView.__super__.selectNextItemView.apply(this, arguments);
      return false;
    };

    AutocompleteView.prototype.selectPreviousItemView = function() {
      AutocompleteView.__super__.selectPreviousItemView.apply(this, arguments);
      return false;
    };

    AutocompleteView.prototype.getCompletionsForCursorScope = function() {
      var completions, scope;
      scope = this.editor.scopeDescriptorForBufferPosition(this.editor.getCursorBufferPosition());
      completions = atom.config.getAll('editor.completions', {
        scope: scope
      });
      return _.uniq(_.flatten(_.pluck(completions, 'value')));
    };

    AutocompleteView.prototype.buildWordList = function() {
      var buffer, buffers, j, k, l, len, len1, len2, matches, ref2, ref3, word, wordHash;
      wordHash = {};
      if (atom.config.get('autocomplete.includeCompletionsFromAllBuffers')) {
        buffers = atom.project.getBuffers();
      } else {
        buffers = [this.currentBuffer];
      }
      matches = [];
      for (j = 0, len = buffers.length; j < len; j++) {
        buffer = buffers[j];
        matches.push(buffer.getText().match(this.wordRegex));
      }
      ref2 = _.flatten(matches);
      for (k = 0, len1 = ref2.length; k < len1; k++) {
        word = ref2[k];
        if (word) {
          if (wordHash[word] == null) {
            wordHash[word] = true;
          }
        }
      }
      ref3 = this.getCompletionsForCursorScope();
      for (l = 0, len2 = ref3.length; l < len2; l++) {
        word = ref3[l];
        if (word) {
          if (wordHash[word] == null) {
            wordHash[word] = true;
          }
        }
      }
      return this.wordList = Object.keys(wordHash).sort(function(word1, word2) {
        return word1.toLowerCase().localeCompare(word2.toLowerCase());
      });
    };

    AutocompleteView.prototype.confirmed = function(match) {
      this.editor.getSelections().forEach(function(selection) {
        return selection.clear();
      });
      this.cancel();
      if (!match) {
        return;
      }
      this.replaceSelectedTextWithMatch(match);
      return this.editor.getCursors().forEach(function(cursor) {
        var position;
        position = cursor.getBufferPosition();
        return cursor.setBufferPosition([position.row, position.column + match.suffix.length]);
      });
    };

    AutocompleteView.prototype.cancelled = function() {
      var ref2;
      if ((ref2 = this.overlayDecoration) != null) {
        ref2.destroy();
      }
      if (!this.editor.isDestroyed()) {
        this.editor.revertToCheckpoint(this.checkpoint);
        this.editor.setSelectedBufferRanges(this.originalSelectionBufferRanges);
        return atom.workspace.getActivePane().activate();
      }
    };

    AutocompleteView.prototype.attach = function() {
      var cursorMarker, matches;
      this.checkpoint = this.editor.createCheckpoint();
      this.aboveCursor = false;
      this.originalSelectionBufferRanges = this.editor.getSelections().map(function(selection) {
        return selection.getBufferRange();
      });
      this.originalCursorPosition = this.editor.getCursorScreenPosition();
      if (!this.allPrefixAndSuffixOfSelectionsMatch()) {
        return this.cancel();
      }
      this.buildWordList();
      matches = this.findMatchesForCurrentSelection();
      this.setItems(matches);
      if (matches.length === 1) {
        return this.confirmSelection();
      } else {
        cursorMarker = this.editor.getLastCursor().getMarker();
        return this.overlayDecoration = this.editor.decorateMarker(cursorMarker, {
          type: 'overlay',
          position: 'tail',
          item: this
        });
      }
    };

    AutocompleteView.prototype.destroy = function() {
      var ref2;
      return (ref2 = this.overlayDecoration) != null ? ref2.destroy() : void 0;
    };

    AutocompleteView.prototype.toggle = function() {
      if (this.isVisible()) {
        return this.cancel();
      } else {
        return this.attach();
      }
    };

    AutocompleteView.prototype.findMatchesForCurrentSelection = function() {
      var currentWord, j, k, len, len1, prefix, ref2, ref3, ref4, regex, results, results1, selection, suffix, word;
      selection = this.editor.getLastSelection();
      ref2 = this.prefixAndSuffixOfSelection(selection), prefix = ref2.prefix, suffix = ref2.suffix;
      if ((prefix.length + suffix.length) > 0) {
        regex = new RegExp("^" + prefix + ".+" + suffix + "$", "i");
        currentWord = prefix + this.editor.getSelectedText() + suffix;
        ref3 = this.wordList;
        results = [];
        for (j = 0, len = ref3.length; j < len; j++) {
          word = ref3[j];
          if (regex.test(word) && word !== currentWord) {
            results.push({
              prefix: prefix,
              suffix: suffix,
              word: word
            });
          }
        }
        return results;
      } else {
        ref4 = this.wordList;
        results1 = [];
        for (k = 0, len1 = ref4.length; k < len1; k++) {
          word = ref4[k];
          results1.push({
            word: word,
            prefix: prefix,
            suffix: suffix
          });
        }
        return results1;
      }
    };

    AutocompleteView.prototype.replaceSelectedTextWithMatch = function(match) {
      var newSelectedBufferRanges;
      newSelectedBufferRanges = [];
      return this.editor.transact((function(_this) {
        return function() {
          var selections;
          selections = _this.editor.getSelections();
          selections.forEach(function(selection, i) {
            var buffer, cursorPosition, infixLength, startPosition;
            startPosition = selection.getBufferRange().start;
            buffer = _this.editor.getBuffer();
            selection.deleteSelectedText();
            cursorPosition = _this.editor.getCursors()[i].getBufferPosition();
            buffer["delete"](Range.fromPointWithDelta(cursorPosition, 0, match.suffix.length));
            buffer["delete"](Range.fromPointWithDelta(cursorPosition, 0, -match.prefix.length));
            infixLength = match.word.length - match.prefix.length - match.suffix.length;
            return newSelectedBufferRanges.push([startPosition, [startPosition.row, startPosition.column + infixLength]]);
          });
          _this.editor.insertText(match.word);
          return _this.editor.setSelectedBufferRanges(newSelectedBufferRanges);
        };
      })(this));
    };

    AutocompleteView.prototype.prefixAndSuffixOfSelection = function(selection) {
      var lineRange, prefix, ref2, selectionRange, suffix;
      selectionRange = selection.getBufferRange();
      lineRange = [[selectionRange.start.row, 0], [selectionRange.end.row, this.editor.lineTextForBufferRow(selectionRange.end.row).length]];
      ref2 = ["", ""], prefix = ref2[0], suffix = ref2[1];
      this.currentBuffer.scanInRange(this.wordRegex, lineRange, function(arg) {
        var match, prefixOffset, range, stop, suffixOffset;
        match = arg.match, range = arg.range, stop = arg.stop;
        if (range.start.isGreaterThan(selectionRange.end)) {
          stop();
        }
        if (range.intersectsWith(selectionRange)) {
          prefixOffset = selectionRange.start.column - range.start.column;
          suffixOffset = selectionRange.end.column - range.end.column;
          if (range.start.isLessThan(selectionRange.start)) {
            prefix = match[0].slice(0, prefixOffset);
          }
          if (range.end.isGreaterThan(selectionRange.end)) {
            return suffix = match[0].slice(suffixOffset);
          }
        }
      });
      return {
        prefix: prefix,
        suffix: suffix
      };
    };

    AutocompleteView.prototype.allPrefixAndSuffixOfSelectionsMatch = function() {
      var prefix, ref2, suffix;
      ref2 = {}, prefix = ref2.prefix, suffix = ref2.suffix;
      return this.editor.getSelections().every((function(_this) {
        return function(selection) {
          var previousPrefix, previousSuffix, ref3, ref4;
          ref3 = [prefix, suffix], previousPrefix = ref3[0], previousSuffix = ref3[1];
          ref4 = _this.prefixAndSuffixOfSelection(selection), prefix = ref4.prefix, suffix = ref4.suffix;
          if (!((previousPrefix != null) && (previousSuffix != null))) {
            return true;
          }
          return prefix === previousPrefix && suffix === previousSuffix;
        };
      })(this));
    };

    AutocompleteView.prototype.attached = function() {
      var widestCompletion;
      this.focusFilterEditor();
      widestCompletion = parseInt(this.css('min-width')) || 0;
      this.list.find('span').each(function() {
        return widestCompletion = Math.max(widestCompletion, $(this).outerWidth());
      });
      this.list.width(widestCompletion);
      return this.width(this.list.outerWidth());
    };

    AutocompleteView.prototype.detached = function() {};

    AutocompleteView.prototype.populateList = function() {
      return AutocompleteView.__super__.populateList.apply(this, arguments);
    };

    return AutocompleteView;

  })(SelectListView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvYW5hbm1heWphaW4vLmF0b20vcGFja2FnZXMvYXV0b2NvbXBsZXRlL2xpYi9hdXRvY29tcGxldGUtdmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLGlGQUFBO0lBQUE7OztFQUFBLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVI7O0VBQ0osTUFBZ0MsT0FBQSxDQUFRLE1BQVIsQ0FBaEMsRUFBQyxpQkFBRCxFQUFROztFQUNSLE9BQTJCLE9BQUEsQ0FBUSxzQkFBUixDQUEzQixFQUFDLFVBQUQsRUFBSSxZQUFKLEVBQVE7O0VBRVIsTUFBTSxDQUFDLE9BQVAsR0FDTTs7Ozs7OzsrQkFDSixhQUFBLEdBQWU7OytCQUNmLFVBQUEsR0FBWTs7K0JBQ1osUUFBQSxHQUFVOzsrQkFDVixTQUFBLEdBQVc7OytCQUNYLDZCQUFBLEdBQStCOzsrQkFDL0Isc0JBQUEsR0FBd0I7OytCQUN4QixXQUFBLEdBQWE7OytCQUViLFVBQUEsR0FBWSxTQUFDLE1BQUQ7TUFBQyxJQUFDLENBQUEsU0FBRDtNQUNYLGtEQUFBLFNBQUE7TUFDQSxJQUFDLENBQUEsUUFBRCxDQUFVLDJCQUFWO01BQ0EsSUFBQyxDQUFBLFlBQUQsQ0FBQTthQUNBLElBQUMsQ0FBQSxnQkFBRCxDQUFrQixJQUFDLENBQUEsTUFBTSxDQUFDLFNBQVIsQ0FBQSxDQUFsQjtJQUpVOzsrQkFNWixZQUFBLEdBQWMsU0FBQTthQUNaO0lBRFk7OytCQUdkLFdBQUEsR0FBYSxTQUFDLEdBQUQ7QUFDWCxVQUFBO01BRGEsT0FBRDthQUNaLEVBQUEsQ0FBRyxTQUFBO2VBQ0QsSUFBQyxDQUFBLEVBQUQsQ0FBSSxDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFBO21CQUNGLEtBQUMsQ0FBQSxJQUFELENBQU0sSUFBTjtVQURFO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFKO01BREMsQ0FBSDtJQURXOzsrQkFLYixZ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QUFBO0lBRFk7Ozs7S0E3TGU7QUFML0IiLCJzb3VyY2VzQ29udGVudCI6WyJfID0gcmVxdWlyZSAndW5kZXJzY29yZS1wbHVzJ1xue1JhbmdlLCBDb21wb3NpdGVEaXNwb3NhYmxlfSAgPSByZXF1aXJlICdhdG9tJ1xueyQsICQkLCBTZWxlY3RMaXN0Vmlld30gID0gcmVxdWlyZSAnYXRvbS1zcGFjZS1wZW4tdmlld3MnXG5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIEF1dG9jb21wbGV0ZVZpZXcgZXh0ZW5kcyBTZWxlY3RMaXN0Vmlld1xuICBjdXJyZW50QnVmZmVyOiBudWxsXG4gIGNoZWNrcG9pbnQ6IG51bGxcbiAgd29yZExpc3Q6IG51bGxcbiAgd29yZFJlZ2V4OiAvXFx3Ky9nXG4gIG9yaWdpbmFsU2VsZWN0aW9uQnVmZmVyUmFuZ2VzOiBudWxsXG4gIG9yaWdpbmFsQ3Vyc29yUG9zaXRpb246IG51bGxcbiAgYWJvdmVDdXJzb3I6IGZhbHNlXG5cbiAgaW5pdGlhbGl6ZTogKEBlZGl0b3IpIC0+XG4gICAgc3VwZXJcbiAgICBAYWRkQ2xhc3MoJ2F1dG9jb21wbGV0ZSBwb3BvdmVyLWxpc3QnKVxuICAgIEBoYW5kbGVFdmVudHMoKVxuICAgIEBzZXRDdXJyZW50QnVmZmVyKEBlZGl0b3IuZ2V0QnVmZmVyKCkpXG5cbiAgZ2V0RmlsdGVyS2V5OiAtPlxuICAgICd3b3JkJ1xuXG4gIHZpZXdGb3JJdGVtOiAoe3dvcmR9KSAtPlxuICAgICQkIC0+XG4gICAgICBAbGkgPT5cbiAgICAgICAgQHNwYW4gd29yZFxuXG4gIGhhbmRsZUV2ZW50czogLT5cbiAgICBAbGlzdC5vbiAnbW91c2V3aGVlbCcsIChldmVudCkgLT4gZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcblxuICAgIEBlZGl0b3Iub25EaWRDaGFuZ2VQYXRoID0+IEBzZXRDdXJyZW50QnVmZmVyKEBlZGl0b3IuZ2V0QnVmZmVyKCkpXG5cbiAgICBAc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIEBlZGl0b3Iub25EaWREZXN0cm95ID0+IEBzdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuXG4gICAgQGZpbHRlckVkaXRvclZpZXcuZ2V0TW9kZWwoKS5vbldpbGxJbnNlcnRUZXh0ICh7Y2FuY2VsLCB0ZXh0fSkgPT5cbiAgICAgIHVubGVzcyB0ZXh0Lm1hdGNoKEB3b3JkUmVnZXgpXG4gICAgICAgIEBjb25maXJtU2VsZWN0aW9uKClcbiAgICAgICAgQGVkaXRvci5pbnNlcnRUZXh0KHRleHQpXG4gICAgICAgIGNhbmNlbCgpXG5cbiAgc2V0Q3VycmVudEJ1ZmZlcjogKEBjdXJyZW50QnVmZmVyKSAtPlxuXG4gIHNlbGVjdEl0ZW1WaWV3OiAoaXRlbSkgLT5cbiAgICBzdXBlclxuICAgIGlmIG1hdGNoID0gQGdldFNlbGVjdGVkSXRlbSgpXG4gICAgICBAcmVwbGFjZVNlbGVjdGVkVGV4dFdpdGhNYXRjaChtYXRjaClcblxuICBzZWxlY3ROZXh0SXRlbVZpZXc6IC0+XG4gICAgc3VwZXJcbiAgICBmYWxzZVxuXG4gIHNlbGVjdFByZXZpb3VzSXRlbVZpZXc6IC0+XG4gICAgc3VwZXJcbiAgICBmYWxzZVxuXG4gIGdldENvbXBsZXRpb25zRm9yQ3Vyc29yU2NvcGU6IC0+XG4gICAgc2NvcGUgPSBAZWRpdG9yLnNjb3BlRGVzY3JpcHRvckZvckJ1ZmZlclBvc2l0aW9uKEBlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKSlcbiAgICBjb21wbGV0aW9ucyA9IGF0b20uY29uZmlnLmdldEFsbCgnZWRpdG9yLmNvbXBsZXRpb25zJywge3Njb3BlfSlcbiAgICBfLnVuaXEoXy5mbGF0dGVuKF8ucGx1Y2soY29tcGxldGlvbnMsICd2YWx1ZScpKSlcblxuICBidWlsZFdvcmRMaXN0OiAtPlxuICAgIHdvcmRIYXNoID0ge31cbiAgICBpZiBhdG9tLmNvbmZpZy5nZXQoJ2F1dG9jb21wbGV0ZS5pbmNsdWRlQ29tcGxldGlvbnNGcm9tQWxsQnVmZmVycycpXG4gICAgICBidWZmZXJzID0gYXRvbS5wcm9qZWN0LmdldEJ1ZmZlcnMoKVxuICAgIGVsc2VcbiAgICAgIGJ1ZmZlcnMgPSBbQGN1cnJlbnRCdWZmZXJdXG4gICAgbWF0Y2hlcyA9IFtdXG4gICAgbWF0Y2hlcy5wdXNoKGJ1ZmZlci5nZXRUZXh0KCkubWF0Y2goQHdvcmRSZWdleCkpIGZvciBidWZmZXIgaW4gYnVmZmVyc1xuICAgIHdvcmRIYXNoW3dvcmRdID89IHRydWUgZm9yIHdvcmQgaW4gXy5mbGF0dGVuKG1hdGNoZXMpIHdoZW4gd29yZFxuICAgIHdvcmRIYXNoW3dvcmRdID89IHRydWUgZm9yIHdvcmQgaW4gQGdldENvbXBsZXRpb25zRm9yQ3Vyc29yU2NvcGUoKSB3aGVuIHdvcmRcblxuICAgIEB3b3JkTGlzdCA9IE9iamVjdC5rZXlzKHdvcmRIYXNoKS5zb3J0ICh3b3JkMSwgd29yZDIpIC0+XG4gICAgICB3b3JkMS50b0xvd2VyQ2FzZSgpLmxvY2FsZUNvbXBhcmUod29yZDIudG9Mb3dlckNhc2UoKSlcblxuICBjb25maXJtZWQ6IChtYXRjaCkgLT5cbiAgICBAZWRpdG9yLmdldFNlbGVjdGlvbnMoKS5mb3JFYWNoIChzZWxlY3Rpb24pIC0+IHNlbGVjdGlvbi5jbGVhcigpXG4gICAgQGNhbmNlbCgpXG4gICAgcmV0dXJuIHVubGVzcyBtYXRjaFxuICAgIEByZXBsYWNlU2VsZWN0ZWRUZXh0V2l0aE1hdGNoKG1hdGNoKVxuICAgIEBlZGl0b3IuZ2V0Q3Vyc29ycygpLmZvckVhY2ggKGN1cnNvcikgLT5cbiAgICAgIHBvc2l0aW9uID0gY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKClcbiAgICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihbcG9zaXRpb24ucm93LCBwb3NpdGlvbi5jb2x1bW4gKyBtYXRjaC5zdWZmaXgubGVuZ3RoXSlcblxuICBjYW5jZWxsZWQ6IC0+XG4gICAgQG92ZXJsYXlEZWNvcmF0aW9uPy5kZXN0cm95KClcblxuICAgIHVubGVzcyBAZWRpdG9yLmlzRGVzdHJveWVkKClcbiAgICAgIEBlZGl0b3IucmV2ZXJ0VG9DaGVja3BvaW50KEBjaGVja3BvaW50KVxuXG4gICAgICBAZWRpdG9yLnNldFNlbGVjdGVkQnVmZmVyUmFuZ2VzKEBvcmlnaW5hbFNlbGVjdGlvbkJ1ZmZlclJhbmdlcylcblxuICAgICAgYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZSgpLmFjdGl2YXRlKClcblxuICBhdHRhY2g6IC0+XG4gICAgQGNoZWNrcG9pbnQgPSBAZWRpdG9yLmNyZWF0ZUNoZWNrcG9pbnQoKVxuXG4gICAgQGFib3ZlQ3Vyc29yID0gZmFsc2VcbiAgICBAb3JpZ2luYWxTZWxlY3Rpb25CdWZmZXJSYW5nZXMgPSBAZWRpdG9yLmdldFNlbGVjdGlvbnMoKS5tYXAgKHNlbGVjdGlvbikgLT4gc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKClcbiAgICBAb3JpZ2luYWxDdXJzb3JQb3NpdGlvbiA9IEBlZGl0b3IuZ2V0Q3Vyc29yU2NyZWVuUG9zaXRpb24oKVxuXG4gICAgcmV0dXJuIEBjYW5jZWwoKSB1bmxlc3MgQGFsbFByZWZpeEFuZFN1ZmZpeE9mU2VsZWN0aW9uc01hdGNoKClcblxuICAgIEBidWlsZFdvcmRMaXN0KClcbiAgICBtYXRjaGVzID0gQGZpbmRNYXRjaGVzRm9yQ3VycmVudFNlbGVjdGlvbigpXG4gICAgQHNldEl0ZW1zKG1hdGNoZXMpXG5cbiAgICBpZiBtYXRjaGVzLmxlbmd0aCBpcyAxXG4gICAgICBAY29uZmlybVNlbGVjdGlvbigpXG4gICAgZWxzZVxuICAgICAgY3Vyc29yTWFya2VyID0gQGVkaXRvci5nZXRMYXN0Q3Vyc29yKCkuZ2V0TWFya2VyKClcbiAgICAgIEBvdmVybGF5RGVjb3JhdGlvbiA9IEBlZGl0b3IuZGVjb3JhdGVNYXJrZXIoY3Vyc29yTWFya2VyLCB0eXBlOiAnb3ZlcmxheScsIHBvc2l0aW9uOiAndGFpbCcsIGl0ZW06IHRoaXMpXG5cbiAgZGVzdHJveTogLT5cbiAgICBAb3ZlcmxheURlY29yYXRpb24/LmRlc3Ryb3koKVxuXG4gIHRvZ2dsZTogLT5cbiAgICBpZiBAaXNWaXNpYmxlKClcbiAgICAgIEBjYW5jZWwoKVxuICAgIGVsc2VcbiAgICAgIEBhdHRhY2goKVxuXG4gIGZpbmRNYXRjaGVzRm9yQ3VycmVudFNlbGVjdGlvbjogLT5cbiAgICBzZWxlY3Rpb24gPSBAZWRpdG9yLmdldExhc3RTZWxlY3Rpb24oKVxuICAgIHtwcmVmaXgsIHN1ZmZpeH0gPSBAcHJlZml4QW5kU3VmZml4T2ZTZWxlY3Rpb24oc2VsZWN0aW9uKVxuXG4gICAgaWYgKHByZWZpeC5sZW5ndGggKyBzdWZmaXgubGVuZ3RoKSA+IDBcbiAgICAgIHJlZ2V4ID0gbmV3IFJlZ0V4cChcIl4je3ByZWZpeH0uKyN7c3VmZml4fSRcIiwgXCJpXCIpXG4gICAgICBjdXJyZW50V29yZCA9IHByZWZpeCArIEBlZGl0b3IuZ2V0U2VsZWN0ZWRUZXh0KCkgKyBzdWZmaXhcbiAgICAgIGZvciB3b3JkIGluIEB3b3JkTGlzdCB3aGVuIHJlZ2V4LnRlc3Qod29yZCkgYW5kIHdvcmQgIT0gY3VycmVudFdvcmRcbiAgICAgICAge3ByZWZpeCwgc3VmZml4LCB3b3JkfVxuICAgIGVsc2VcbiAgICAgIHt3b3JkLCBwcmVmaXgsIHN1ZmZpeH0gZm9yIHdvcmQgaW4gQHdvcmRMaXN0XG5cbiAgcmVwbGFjZVNlbGVjdGVkVGV4dFdpdGhNYXRjaDogKG1hdGNoKSAtPlxuICAgIG5ld1NlbGVjdGVkQnVmZmVyUmFuZ2VzID0gW11cbiAgICBAZWRpdG9yLnRyYW5zYWN0ID0+XG4gICAgICBzZWxlY3Rpb25zID0gQGVkaXRvci5nZXRTZWxlY3Rpb25zKClcbiAgICAgIHNlbGVjdGlvbnMuZm9yRWFjaCAoc2VsZWN0aW9uLCBpKSA9PlxuICAgICAgICBzdGFydFBvc2l0aW9uID0gc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKCkuc3RhcnRcbiAgICAgICAgYnVmZmVyID0gQGVkaXRvci5nZXRCdWZmZXIoKVxuXG4gICAgICAgIHNlbGVjdGlvbi5kZWxldGVTZWxlY3RlZFRleHQoKVxuICAgICAgICBjdXJzb3JQb3NpdGlvbiA9IEBlZGl0b3IuZ2V0Q3Vyc29ycygpW2ldLmdldEJ1ZmZlclBvc2l0aW9uKClcbiAgICAgICAgYnVmZmVyLmRlbGV0ZShSYW5nZS5mcm9tUG9pbnRXaXRoRGVsdGEoY3Vyc29yUG9zaXRpb24sIDAsIG1hdGNoLnN1ZmZpeC5sZW5ndGgpKVxuICAgICAgICBidWZmZXIuZGVsZXRlKFJhbmdlLmZyb21Qb2ludFdpdGhEZWx0YShjdXJzb3JQb3NpdGlvbiwgMCwgLW1hdGNoLnByZWZpeC5sZW5ndGgpKVxuXG4gICAgICAgIGluZml4TGVuZ3RoID0gbWF0Y2gud29yZC5sZW5ndGggLSBtYXRjaC5wcmVmaXgubGVuZ3RoIC0gbWF0Y2guc3VmZml4Lmxlbmd0aFxuXG4gICAgICAgIG5ld1NlbGVjdGVkQnVmZmVyUmFuZ2VzLnB1c2goW3N0YXJ0UG9zaXRpb24sIFtzdGFydFBvc2l0aW9uLnJvdywgc3RhcnRQb3NpdGlvbi5jb2x1bW4gKyBpbmZpeExlbmd0aF1dKVxuXG4gICAgICBAZWRpdG9yLmluc2VydFRleHQobWF0Y2gud29yZClcbiAgICAgIEBlZGl0b3Iuc2V0U2VsZWN0ZWRCdWZmZXJSYW5nZXMobmV3U2VsZWN0ZWRCdWZmZXJSYW5nZXMpXG5cbiAgcHJlZml4QW5kU3VmZml4T2ZTZWxlY3Rpb246IChzZWxlY3Rpb24pIC0+XG4gICAgc2VsZWN0aW9uUmFuZ2UgPSBzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKVxuICAgIGxpbmVSYW5nZSA9IFtbc2VsZWN0aW9uUmFuZ2Uuc3RhcnQucm93LCAwXSwgW3NlbGVjdGlvblJhbmdlLmVuZC5yb3csIEBlZGl0b3IubGluZVRleHRGb3JCdWZmZXJSb3coc2VsZWN0aW9uUmFuZ2UuZW5kLnJvdykubGVuZ3RoXV1cbiAgICBbcHJlZml4LCBzdWZmaXhdID0gW1wiXCIsIFwiXCJdXG5cbiAgICBAY3VycmVudEJ1ZmZlci5zY2FuSW5SYW5nZSBAd29yZFJlZ2V4LCBsaW5lUmFuZ2UsICh7bWF0Y2gsIHJhbmdlLCBzdG9wfSkgLT5cbiAgICAgIHN0b3AoKSBpZiByYW5nZS5zdGFydC5pc0dyZWF0ZXJUaGFuKHNlbGVjdGlvblJhbmdlLmVuZClcblxuICAgICAgaWYgcmFuZ2UuaW50ZXJzZWN0c1dpdGgoc2VsZWN0aW9uUmFuZ2UpXG4gICAgICAgIHByZWZpeE9mZnNldCA9IHNlbGVjdGlvblJhbmdlLnN0YXJ0LmNvbHVtbiAtIHJhbmdlLnN0YXJ0LmNvbHVtblxuICAgICAgICBzdWZmaXhPZmZzZXQgPSBzZWxlY3Rpb25SYW5nZS5lbmQuY29sdW1uIC0gcmFuZ2UuZW5kLmNvbHVtblxuXG4gICAgICAgIHByZWZpeCA9IG1hdGNoWzBdWzAuLi5wcmVmaXhPZmZzZXRdIGlmIHJhbmdlLnN0YXJ0LmlzTGVzc1RoYW4oc2VsZWN0aW9uUmFuZ2Uuc3RhcnQpXG4gICAgICAgIHN1ZmZpeCA9IG1hdGNoWzBdW3N1ZmZpeE9mZnNldC4uXSBpZiByYW5nZS5lbmQuaXNHcmVhdGVyVGhhbihzZWxlY3Rpb25SYW5nZS5lbmQpXG5cbiAgICB7cHJlZml4LCBzdWZmaXh9XG5cbiAgYWxsUHJlZml4QW5kU3VmZml4T2ZTZWxlY3Rpb25zTWF0Y2g6IC0+XG4gICAge3ByZWZpeCwgc3VmZml4fSA9IHt9XG5cbiAgICBAZWRpdG9yLmdldFNlbGVjdGlvbnMoKS5ldmVyeSAoc2VsZWN0aW9uKSA9PlxuICAgICAgW3ByZXZpb3VzUHJlZml4LCBwcmV2aW91c1N1ZmZpeF0gPSBbcHJlZml4LCBzdWZmaXhdXG5cbiAgICAgIHtwcmVmaXgsIHN1ZmZpeH0gPSBAcHJlZml4QW5kU3VmZml4T2ZTZWxlY3Rpb24oc2VsZWN0aW9uKVxuXG4gICAgICByZXR1cm4gdHJ1ZSB1bmxlc3MgcHJldmlvdXNQcmVmaXg/IGFuZCBwcmV2aW91c1N1ZmZpeD9cbiAgICAgIHByZWZpeCBpcyBwcmV2aW91c1ByZWZpeCBhbmQgc3VmZml4IGlzIHByZXZpb3VzU3VmZml4XG5cbiAgYXR0YWNoZWQ6IC0+XG4gICAgQGZvY3VzRmlsdGVyRWRpdG9yKClcblxuICAgIHdpZGVzdENvbXBsZXRpb24gPSBwYXJzZUludChAY3NzKCdtaW4td2lkdGgnKSkgb3IgMFxuICAgIEBsaXN0LmZpbmQoJ3NwYW4nKS5lYWNoIC0+XG4gICAgICB3aWRlc3RDb21wbGV0aW9uID0gTWF0aC5tYXgod2lkZXN0Q29tcGxldGlvbiwgJCh0aGlzKS5vdXRlcldpZHRoKCkpXG4gICAgQGxpc3Qud2lkdGgod2lkZXN0Q29tcGxldGlvbilcbiAgICBAd2lkdGgoQGxpc3Qub3V0ZXJXaWR0aCgpKVxuXG4gIGRldGFjaGVkOiAtPlxuXG4gIHBvcHVsYXRlTGlzdDogLT5cbiAgICBzdXBlclxuIl19
