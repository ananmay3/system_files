(function() {
  var ClangProvider, CompositeDisposable, Range, buildCodeCompletionArgs, getScopeLang, nearestSymbolPosition, path, prefixAtPosition, ref, ref1, ref2, spawnClang;

  ref = require('atom'), Range = ref.Range, CompositeDisposable = ref.CompositeDisposable;

  path = require('path');

  ref1 = require('./clang-args-builder'), spawnClang = ref1.spawnClang, buildCodeCompletionArgs = ref1.buildCodeCompletionArgs;

  ref2 = require('./common-util'), getScopeLang = ref2.getScopeLang, prefixAtPosition = ref2.prefixAtPosition, nearestSymbolPosition = ref2.nearestSymbolPosition;

  module.exports = ClangProvider = (function() {
    function ClangProvider() {}

    ClangProvider.prototype.selector = 'c, cpp, .source.cpp, .source.c, .source.objc, .source.objcpp';

    ClangProvider.prototype.inclusionPriority = 1;

    ClangProvider.prototype.getSuggestions = function(arg1) {
      var bufferPosition, editor, language, lastSymbol, line, minimumWordLength, prefix, ref3, regex, scopeDescriptor, symbolPosition;
      editor = arg1.editor, scopeDescriptor = arg1.scopeDescriptor, bufferPosition = arg1.bufferPosition;
      language = getScopeLang(scopeDescriptor.getScopesArray());
      prefix = prefixAtPosition(editor, bufferPosition);
      ref3 = nearestSymbolPosition(editor, bufferPosition), symbolPosition = ref3[0], lastSymbol = ref3[1];
      minimumWordLength = atom.config.get('autocomplete-plus.minimumWordLength');
      if ((minimumWordLength != null) && prefix.length < minimumWordLength) {
        regex = /(?:\.|->|::)\s*\w*$/;
        line = editor.getTextInRange([[bufferPosition.row, 0], bufferPosition]);
        if (!regex.test(line)) {
          return;
        }
      }
      if (language != null) {
        return this.codeCompletionAt(editor, symbolPosition.row, symbolPosition.column, language, prefix);
      }
    };

    ClangProvider.prototype.codeCompletionAt = function(editor, row, column, language, prefix) {
      var args, cwd;
      cwd = path.dirname(editor.getPath());
      args = buildCodeCompletionArgs(editor, row, column, language);
      return spawnClang(cwd, args, editor.getText(), (function(_this) {
        return function(code, outputs, errors, resolve) {
          console.log(errors);
          return resolve(_this.handleCompletionResult(outputs, code, prefix));
        };
      })(this));
    };

    ClangProvider.prototype.convertCompletionLine = function(line, prefix) {
      var argumentsRe, basicInfo, basicInfoRe, comment, commentRe, completion, completionAndComment, constMemFuncRe, content, contentRe, index, infoTagsRe, isConstMemFunc, match, optionalArgumentsStart, ref3, ref4, ref5, returnType, returnTypeRe, suggestion;
      contentRe = /^COMPLETION: (.*)/;
      ref3 = line.match(contentRe), line = ref3[0], content = ref3[1];
      basicInfoRe = /^(.*?) : (.*)/;
      match = content.match(basicInfoRe);
      if (match == null) {
        return {
          text: content
        };
      }
      content = match[0], basicInfo = match[1], completionAndComment = match[2];
      commentRe = /(?: : (.*))?$/;
      ref4 = completionAndComment.split(commentRe), completion = ref4[0], comment = ref4[1];
      returnTypeRe = /^\[#(.*?)#\]/;
      returnType = (ref5 = completion.match(returnTypeRe)) != null ? ref5[1] : void 0;
      constMemFuncRe = /\[# const#\]$/;
      isConstMemFunc = constMemFuncRe.test(completion);
      infoTagsRe = /\[#(.*?)#\]/g;
      completion = completion.replace(infoTagsRe, '');
      argumentsRe = /<#(.*?)#>/g;
      optionalArgumentsStart = completion.indexOf('{#');
      completion = completion.replace(/\{#/g, '');
      completion = completion.replace(/#\}/g, '');
      index = 0;
      completion = completion.replace(argumentsRe, function(match, arg, offset) {
        index++;
        if (optionalArgumentsStart > 0 && offset > optionalArgumentsStart) {
          return "${" + index + ":optional " + arg + "}";
        } else {
          return "${" + index + ":" + arg + "}";
        }
      });
      suggestion = {};
      if (returnType != null) {
        suggestion.leftLabel = returnType;
      }
      if (index > 0) {
        suggestion.snippet = completion;
      } else {
        suggestion.text = completion;
      }
      if (isConstMemFunc) {
        suggestion.displayText = completion + ' const';
      }
      if (comment != null) {
        suggestion.description = comment;
      }
      suggestion.replacementPrefix = prefix;
      return suggestion;
    };

    ClangProvider.prototype.handleCompletionResult = function(result, returnCode, prefix) {
      var completionsRe, line, outputLines;
      if (returnCode === !0) {
        if (!atom.config.get("autocomplete-clang.ignoreClangErrors")) {
          return;
        }
      }
      completionsRe = new RegExp("^COMPLETION: (" + prefix + ".*)$", "mg");
      outputLines = result.match(completionsRe);
      if (outputLines != null) {
        return (function() {
          var i, len, results;
          results = [];
          for (i = 0, len = outputLines.length; i < len; i++) {
            line = outputLines[i];
            results.push(this.convertCompletionLine(line, prefix));
          }
          return results;
        }).call(this);
      } else {
        return [];
      }
    };

    return ClangProvider;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvYW5hbm1heTMvLmF0b20vcGFja2FnZXMvYXV0b2NvbXBsZXRlLWNsYW5nL2xpYi9jbGFuZy1wcm92aWRlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBSUE7QUFBQSxNQUFBOztFQUFBLE1BQStCLE9BQUEsQ0FBUSxNQUFSLENBQS9CLEVBQUMsaUJBQUQsRUFBUTs7RUFDUixJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVI7O0VBQ1AsT0FBd0MsT0FBQSxDQUFRLHNCQUFSLENBQXhDLEVBQUMsNEJBQUQsRUFBYTs7RUFDYixPQUEwRCxPQUFBLENBQVEsZUFBUixDQUExRCxFQUFDLGdDQUFELEVBQWUsd0NBQWYsRUFBaUM7O0VBRWpDLE1BQU0sQ0FBQyxPQUFQLEdBQ007Ozs0QkFDSixRQUFBLEdBQVU7OzRCQUNWLGlCQUFBLEdBQW1COzs0QkFFbkIsY0FBQSxHQUFnQixTQUFDLElBQUQ7QUFDZCxVQUFBO01BRGdCLHNCQUFRLHdDQUFpQjtNQUN6QyxRQUFBLEdBQVcsWUFBQSxDQUFhLGVBQWUsQ0FBQyxjQUFoQixDQUFBLENBQWI7TUFDWCxNQUFBLEdBQVMsZ0JBQUEsQ0FBaUIsTUFBakIsRUFBeUIsY0FBekI7TUFDVCxPQUE4QixxQkFBQSxDQUFzQixNQUF0QixFQUE4QixjQUE5QixDQUE5QixFQUFDLHdCQUFELEVBQWdCO01BQ2hCLGlCQUFBLEdBQW9CLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixxQ0FBaEI7TUFFcEIsSUFBRywyQkFBQSxJQUF1QixNQUFNLENBQUMsTUFBUCxHQUFnQixpQkFBMUM7UUFDRSxLQUFBLEdBQVE7UUFDUixJQUFBLEdBQU8sTUFBTSxDQUFDLGNBQVAsQ0FBc0IsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxHQUFoQixFQUFxQixDQUFyQixDQUFELEVBQTBCLGNBQTFCLENBQXRCO1FBQ1AsSUFBQSxDQUFjLEtBQUssQ0FBQyxJQUFOLENBQVcsSUFBWCxD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UUFDRSxVQUFVLENBQUMsV0FBWCxHQUF5QixVQUFBLEdBQWEsU0FEeEM7O01BRUEsSUFBb0MsZUFBcEM7UUFBQSxVQUFVLENBQUMsV0FBWCxHQUF5QixRQUF6Qjs7TUFDQSxVQUFVLENBQUMsaUJBQVgsR0FBK0I7YUFDL0I7SUF0Q3FCOzs0QkF3Q3ZCLHNCQUFBLEdBQXdCLFNBQUMsTUFBRCxFQUFTLFVBQVQsRUFBcUIsTUFBckI7QUFDdEIsVUFBQTtNQUFBLElBQUcsVUFBQSxLQUFjLENBQUksQ0FBckI7UUFDRSxJQUFBLENBQWMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHNDQUFoQixDQUFkO0FBQUEsaUJBQUE7U0FERjs7TUFJQSxhQUFBLEdBQWdCLElBQUksTUFBSixDQUFXLGdCQUFBLEdBQW1CLE1BQW5CLEdBQTRCLE1BQXZDLEVBQStDLElBQS9DO01BQ2hCLFdBQUEsR0FBYyxNQUFNLENBQUMsS0FBUCxDQUFhLGFBQWI7TUFFZCxJQUFHLG1CQUFIO0FBQ0U7O0FBQVE7ZUFBQSw2Q0FBQTs7eUJBQUEsSUFBQyxDQUFBLHFCQUFELENBQXVCLElBQXZCLEVBQTZCLE1BQTdCO0FBQUE7O3NCQURWO09BQUEsTUFBQTtBQUdFLGVBQU8sR0FIVDs7SUFSc0I7Ozs7O0FBdkUxQiIsInNvdXJjZXNDb250ZW50IjpbIiMgYXV0b2NvbXBsZXRlLXBsdXMgcHJvdmlkZXIgY29kZSBmcm9tIGh0dHBzOi8vZ2l0aHViLmNvbS9iZW5vZ2xlL2F1dG9jb21wbGV0ZS1jbGFuZ1xuIyBDb3B5cmlnaHQgKGMpIDIwMTUgQmVuIE9nbGUgdW5kZXIgTUlUIGxpY2Vuc2VcbiMgQ2xhbmcgcmVsYXRlZCBjb2RlIGZyb20gaHR0cHM6Ly9naXRodWIuY29tL3lhc3V5dWt5L2F1dG9jb21wbGV0ZS1jbGFuZ1xuXG57UmFuZ2UsIENvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSAnYXRvbSdcbnBhdGggPSByZXF1aXJlICdwYXRoJ1xue3NwYXduQ2xhbmcsIGJ1aWxkQ29kZUNvbXBsZXRpb25BcmdzfSA9IHJlcXVpcmUgJy4vY2xhbmctYXJncy1idWlsZGVyJ1xue2dldFNjb3BlTGFuZywgcHJlZml4QXRQb3NpdGlvbiwgbmVhcmVzdFN5bWJvbFBvc2l0aW9ufSA9IHJlcXVpcmUgJy4vY29tbW9uLXV0aWwnXG5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIENsYW5nUHJvdmlkZXJcbiAgc2VsZWN0b3I6ICdjLCBjcHAsIC5zb3VyY2UuY3BwLCAuc291cmNlLmMsIC5zb3VyY2Uub2JqYywgLnNvdXJjZS5vYmpjcHAnXG4gIGluY2x1c2lvblByaW9yaXR5OiAxXG5cbiAgZ2V0U3VnZ2VzdGlvbnM6ICh7ZWRpdG9yLCBzY29wZURlc2NyaXB0b3IsIGJ1ZmZlclBvc2l0aW9ufSkgLT5cbiAgICBsYW5ndWFnZSA9IGdldFNjb3BlTGFuZyBzY29wZURlc2NyaXB0b3IuZ2V0U2NvcGVzQXJyYXkoKVxuICAgIHByZWZpeCA9IHByZWZpeEF0UG9zaXRpb24oZWRpdG9yLCBidWZmZXJQb3NpdGlvbilcbiAgICBbc3ltYm9sUG9zaXRpb24sbGFzdFN5bWJvbF0gPSBuZWFyZXN0U3ltYm9sUG9zaXRpb24oZWRpdG9yLCBidWZmZXJQb3NpdGlvbilcbiAgICBtaW5pbXVtV29yZExlbmd0aCA9IGF0b20uY29uZmlnLmdldCgnYXV0b2NvbXBsZXRlLXBsdXMubWluaW11bVdvcmRMZW5ndGgnKVxuXG4gICAgaWYgbWluaW11bVdvcmRMZW5ndGg/IGFuZCBwcmVmaXgubGVuZ3RoIDwgbWluaW11bVdvcmRMZW5ndGhcbiAgICAgIHJlZ2V4ID0gLyg/OlxcLnwtPnw6OilcXHMqXFx3KiQvXG4gICAgICBsaW5lID0gZWRpdG9yLmdldFRleHRJblJhbmdlKFtbYnVmZmVyUG9zaXRpb24ucm93LCAwXSwgYnVmZmVyUG9zaXRpb25dKVxuICAgICAgcmV0dXJuIHVubGVzcyByZWdleC50ZXN0KGxpbmUpXG5cbiAgICBpZiBsYW5ndWFnZT9cbiAgICAgIEBjb2RlQ29tcGxldGlvbkF0KGVkaXRvciwgc3ltYm9sUG9zaXRpb24ucm93LCBzeW1ib2xQb3NpdGlvbi5jb2x1bW4sIGxhbmd1YWdlLCBwcmVmaXgpXG5cbiAgY29kZUNvbXBsZXRpb25BdDogKGVkaXRvciwgcm93LCBjb2x1bW4sIGxhbmd1YWdlLCBwcmVmaXgpIC0+XG4gICAgY3dkID0gcGF0aC5kaXJuYW1lIGVkaXRvci5nZXRQYXRoKClcbiAgICBhcmdzID0gYnVpbGRDb2RlQ29tcGxldGlvbkFyZ3MgZWRpdG9yLCByb3csIGNvbHVtbiwgbGFuZ3VhZ2VcbiAgICBzcGF3bkNsYW5nIGN3ZCwgYXJncywgZWRpdG9yLmdldFRleHQoKSwgKGNvZGUsIG91dHB1dHMsIGVycm9ycywgcmVzb2x2ZSkgPT5cbiAgICAgIGNvbnNvbGUubG9nIGVycm9yc1xuICAgICAgcmVzb2x2ZShAaGFuZGxlQ29tcGxldGlvblJlc3VsdChvdXRwdXRzLCBjb2RlLCBwcmVmaXgpKVxuXG4gIGNvbnZlcnRDb21wbGV0aW9uTGluZTogKGxpbmUsIHByZWZpeCkgLT5cbiAgICBjb250ZW50UmUgPSAvXkNPTVBMRVRJT046ICguKikvXG4gICAgW2xpbmUsIGNvbnRlbnRdID0gbGluZS5tYXRjaCBjb250ZW50UmVcbiAgICBiYXNpY0luZm9SZSA9IC9eKC4qPykgOiAoLiopL1xuICAgIG1hdGNoID0gY29udGVudC5tYXRjaCBiYXNpY0luZm9SZVxuICAgIHJldHVybiB7dGV4dDogY29udGVudH0gdW5sZXNzIG1hdGNoP1xuXG4gICAgW2NvbnRlbnQsIGJhc2ljSW5mbywgY29tcGxldGlvbkFuZENvbW1lbnRdID0gbWF0Y2hcbiAgICBjb21tZW50UmUgPSAvKD86IDogKC4qKSk/JC9cbiAgICBbY29tcGxldGlvbiwgY29tbWVudF0gPSBjb21wbGV0aW9uQW5kQ29tbWVudC5zcGxpdCBjb21tZW50UmVcbiAgICByZXR1cm5UeXBlUmUgPSAvXlxcWyMoLio/KSNcXF0vXG4gICAgcmV0dXJuVHlwZSA9IGNvbXBsZXRpb24ubWF0Y2gocmV0dXJuVHlwZVJlKT9bMV1cbiAgICBjb25zdE1lbUZ1bmNSZSA9IC9cXFsjIGNvbnN0I1xcXSQvXG4gICAgaXNDb25zdE1lbUZ1bmMgPSBjb25zdE1lbUZ1bmNSZS50ZXN0IGNvbXBsZXRpb25cbiAgICBpbmZvVGFnc1JlID0gL1xcWyMoLio/KSNcXF0vZ1xuICAgIGNvbXBsZXRpb24gPSBjb21wbGV0aW9uLnJlcGxhY2UgaW5mb1RhZ3NSZSwgJydcbiAgICBhcmd1bWVudHNSZSA9IC88IyguKj8pIz4vZ1xuICAgIG9wdGlvbmFsQXJndW1lbnRzU3RhcnQgPSBjb21wbGV0aW9uLmluZGV4T2YgJ3sjJ1xuICAgIGNvbXBsZXRpb24gPSBjb21wbGV0aW9uLnJlcGxhY2UgL1xceyMvZywgJydcbiAgICBjb21wbGV0aW9uID0gY29tcGxldGlvbi5yZXBsYWNlIC8jXFx9L2csICcnXG4gICAgaW5kZXggPSAwXG4gICAgY29tcGxldGlvbiA9IGNvbXBsZXRpb24ucmVwbGFjZSBhcmd1bWVudHNSZSwgKG1hdGNoLCBhcmcsIG9mZnNldCkgLT5cbiAgICAgIGluZGV4KytcbiAgICAgIGlmIG9wdGlvbmFsQXJndW1lbnRzU3RhcnQgPiAwIGFuZCBvZmZzZXQgPiBvcHRpb25hbEFyZ3VtZW50c1N0YXJ0XG4gICAgICAgIHJldHVybiBcIiR7I3tpbmRleH06b3B0aW9uYWwgI3thcmd9fVwiXG4gICAgICBlbHNlXG4gICAgICAgIHJldHVybiBcIiR7I3tpbmRleH06I3thcmd9fVwiXG5cbiAgICBzdWdnZXN0aW9uID0ge31cbiAgICBzdWdnZXN0aW9uLmxlZnRMYWJlbCA9IHJldHVyblR5cGUgaWYgcmV0dXJuVHlwZT9cbiAgICBpZiBpbmRleCA+IDBcbiAgICAgIHN1Z2dlc3Rpb24uc25pcHBldCA9IGNvbXBsZXRpb25cbiAgICBlbHNlXG4gICAgICBzdWdnZXN0aW9uLnRleHQgPSBjb21wbGV0aW9uXG4gICAgaWYgaXNDb25zdE1lbUZ1bmNcbiAgICAgIHN1Z2dlc3Rpb24uZGlzcGxheVRleHQgPSBjb21wbGV0aW9uICsgJyBjb25zdCdcbiAgICBzdWdnZXN0aW9uLmRlc2NyaXB0aW9uID0gY29tbWVudCBpZiBjb21tZW50P1xuICAgIHN1Z2dlc3Rpb24ucmVwbGFjZW1lbnRQcmVmaXggPSBwcmVmaXhcbiAgICBzdWdnZXN0aW9uXG5cbiAgaGFuZGxlQ29tcGxldGlvblJlc3VsdDogKHJlc3VsdCwgcmV0dXJuQ29kZSwgcHJlZml4KSAtPlxuICAgIGlmIHJldHVybkNvZGUgaXMgbm90IDBcbiAgICAgIHJldHVybiB1bmxlc3MgYXRvbS5jb25maWcuZ2V0IFwiYXV0b2NvbXBsZXRlLWNsYW5nLmlnbm9yZUNsYW5nRXJyb3JzXCJcbiAgICAjIEZpbmQgYWxsIGNvbXBsZXRpb25zIHRoYXQgbWF0Y2ggb3VyIHByZWZpeCBpbiBPTkUgcmVnZXhcbiAgICAjIGZvciBwZXJmb3JtYW5jZSByZWFzb25zLlxuICAgIGNvbXBsZXRpb25zUmUgPSBuZXcgUmVnRXhwKFwiXkNPTVBMRVRJT046IChcIiArIHByZWZpeCArIFwiLiopJFwiLCBcIm1nXCIpXG4gICAgb3V0cHV0TGluZXMgPSByZXN1bHQubWF0Y2goY29tcGxldGlvbnNSZSlcblxuICAgIGlmIG91dHB1dExpbmVzP1xuICAgICAgcmV0dXJuIChAY29udmVydENvbXBsZXRpb25MaW5lKGxpbmUsIHByZWZpeCkgZm9yIGxpbmUgaW4gb3V0cHV0TGluZXMpXG4gICAgZWxzZVxuICAgICAgcmV0dXJuIFtdXG4iXX0=
