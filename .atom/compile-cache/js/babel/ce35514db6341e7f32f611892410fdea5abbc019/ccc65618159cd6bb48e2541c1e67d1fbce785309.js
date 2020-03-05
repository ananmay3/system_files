Object.defineProperty(exports, '__esModule', {
  value: true
});

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

// eslint-disable-next-line import/extensions, import/no-extraneous-dependencies

var _atom = require('atom');

var _path = require('path');

'use babel';

var helpers = null;
var clangFlags = null;

var regex = new RegExp(['^(<stdin>|.+):', // Path, usually <stdin>
'(\\d+):(\\d+):', // Base line and column
'(?:({.+}):)?', // Range position(s), if present
' ([\\w \\\\-]+):', // Message type
' ([^[\\n\\r]+)', // The message
'(?: \\[(.+)\\])?\\r?$', // -W flag, if any
'(?:\\r?\\n^ .+$)+', // The visual caret diagnostics, necessary to include in output for fix-its
'(?:\\r?\\n^fix-it:".+":', // Start of fix-it block
'{(\\d+):(\\d+)-(\\d+):(\\d+)}:', // fix-it range
'"(.+)"', // fix-it replacement text
'$)?']. // End of fix-it block
join(''), 'gm');

/**
 * Given a set of ranges in clangs format, determine the range encompasing all points
 * @param  {String} ranges The raw range string to parse
 * @return {Range}        An Atom Range object encompasing all given ranges
 */
var parseClangRanges = function parseClangRanges(ranges) {
  var rangeRE = /{(\d+):(\d+)-(\d+):(\d+)}/g;
  var lineStart = undefined;
  var colStart = undefined;
  var lineEnd = undefined;
  var colEnd = undefined;

  var match = rangeRE.exec(ranges);
  while (match !== null) {
    var rangeLineStart = Number.parseInt(match[1], 10) - 1;
    var rangeColStart = Number.parseInt(match[2], 10) - 1;
    var rangeLineEnd = Number.parseInt(match[3], 10) - 1;
    var rangeColEnd = Number.parseInt(match[4], 10) - 1;
    if (lineStart === undefined) {
      // First match
      lineStart = rangeLineStart;
      colStart = rangeColStart;
      lineEnd = rangeLineEnd;
      colEnd = rangeColEnd;
    } else {
      if (rangeLineStart > lineEnd) {
        // Higher starting line
        lineEnd = rangeLineStart;
        colEnd = rangeColStart;
      }
      if (rangeLineEnd > lineEnd) {
        // Higher ending line
        lineEnd = rangeLineEnd;
        colEnd = rangeColEnd;
      }
      if (rangeColEnd > colEnd) {
        // Higher ending column
        colEnd = rangeColEnd;
      }
    }
    match = rangeRE.exec(ranges);
  }
  return [[lineStart, colStart], [lineEnd, colEnd]];
};

/**
 * Determine if a given path is open in an existing TextEditor
 * @param  {String} filePath The file path to search for an editor of
 * @return {TextEditor | false}      The TextEditor or false if none found
 */
var findTextEditor = function findTextEditor(filePath) {
  var allEditors = atom.workspace.getTextEditors();
  var matchingEditor = allEditors.find(function (textEditor) {
    return textEditor.getPath() === filePath;
  });
  return matchingEditor || false;
};

exports['default'] = {
  activate: function activate() {
    var _this = this;

    require('atom-package-deps').install('linter-clang');

    // FIXME: Remove backwards compatibility in a future minor version
    var oldPath = atom.config.get('linter-clang.execPath');
    if (oldPath !== undefined) {
      atom.config.unset('linter-clang.execPath');
      if (oldPath !== 'clang') {
        // If the old config wasn't set to the default migrate it over
        atom.config.set('linter-clang.executablePath', oldPath);
      }
    }

    this.subscriptions = new _atom.CompositeDisposable();
    this.subscriptions.add(atom.config.observe('linter-clang.executablePath', function (value) {
      _this.executablePath = value;
    }));
    this.subscriptions.add(atom.config.observe('linter-clang.clangIncludePaths', function (value) {
      _this.clangIncludePaths = value;
    }));
    this.subscriptions.add(atom.config.observe('linter-clang.clangSuppressWarnings', function (value) {
      _this.clangSuppressWarnings = value;
    }));
    this.subscriptions.add(atom.config.observe('linter-clang.clangDefaultCFlags', function (value) {
      _this.clangDefaultCFlags = value;
    }));
    this.subscriptions.add(atom.config.observe('linter-clang.clangDefaultCppFlags', function (value) {
      _this.clangDefaultCppFlags = value;
    }));
    this.subscriptions.add(atom.config.observe('linter-clang.clangDefaultObjCFlags', function (value) {
      _this.clangDefaultObjCFlags = value;
    }));
    this.subscriptions.add(atom.config.observe('linter-clang.clangDefaultObjCppFlags', function (value) {
      _this.clangDefaultObjCppFlags = value;
    }));
    this.subscriptions.add(atom.config.observe('linter-clang.clangErrorLimit', function (value) {
      _this.clangErrorLimit = value;
    }));
  },

  deactivate: function deactivate() {
    this.subscriptions.dispose();
  },

  provideLinter: function provideLinter() {
    var _this2 = this;

    return {
      name: 'clang',
      scope: 'file',
      lintsOnChange: true,
      grammarScopes: ['source.c', 'source.cpp', 'source.objc', 'source.objcpp'],
      lint: _asyncToGenerator(function* (editor) {
        if (helpers === null) {
          helpers = require('atom-linter');
        }
        if (clangFlags === null) {
          clangFlags = require('clang-flags');
        }

        var filePath = editor.getPath();
        if (typeof filePath === 'undefined') {
          // The editor has no path, meaning it hasn't been saved. Although
          // clang could give us results for this, Linter needs a path
          return [];
        }
        var fileExt = (0, _path.extname)(filePath);
        var fileDir = (0, _path.dirname)(filePath);
        var fileText = editor.getText();
        var basePath = undefined;

        var args = ['-fsyntax-only', '-fno-color-diagnostics', '-fdiagnostics-parseable-fixits', '-fdiagnostics-print-source-range-info', '-fexceptions', '-ferror-limit=' + _this2.clangErrorLimit];

        // Non-Public API!
        var grammar = editor.getGrammar().name;

        switch (grammar) {
          case 'Objective-C':
            args.push('-xobjective-c');
            args.push.apply(args, _toConsumableArray(_this2.clangDefaultObjCFlags.split(/\s+/)));
            break;
          case 'Objective-C++':
            args.push('-xobjective-c++');
            args.push.apply(args, _toConsumableArray(_this2.clangDefaultObjCppFlags.split(/\s+/)));
            break;
          case 'C':
            args.push('-xc');
            args.push.apply(args, _toConsumableArray(_this2.clangDefaultCFlags.split(/\s+/)));
            break;
          default:
          case 'C++':
          case 'C++14':
            args.push('-xc++');
            args.push.apply(args, _toConsumableArray(_this2.clangDefaultCppFlags.split(/\s+/)));
            break;
        }

        if (fileExt === '.hpp' || fileExt === '.hh' || fileExt === '.h') {
          // Don't warn about #pragma once when linting header files
          args.push('-Wno-pragma-once-outside-header');
        }

        if (_this2.clangSuppressWarnings) {
          args.push('-w');
        }

        if (atom.inDevMode()) {
          args.push('--verbose');
        }

        _this2.clangIncludePaths.forEach(function (path) {
          return args.push('-I' + path);
        });

        var usingClangComplete = false;
        try {
          var flags = clangFlags.getClangFlags(filePath);
          flags.forEach(function (flag) {
            args.push(flag);
            usingClangComplete = true;
            var workingDir = /-working-directory=(.+)/.exec(flag);
            if (workingDir !== null) {
              basePath = workingDir[1];
            }
          });
        } catch (error) {
          if (atom.inDevMode()) {
            // eslint-disable-next-line no-console
            console.log(error);
          }
        }

        if (editor.isModified() && usingClangComplete) {
          // If the user has a .clang-complete file we can't lint current
          // TextEditor contents, return null so nothing gets modified
          return null;
        }

        var execOpts = {
          stream: 'stderr',
          allowEmptyStderr: true
        };

        if (usingClangComplete) {
          args.push(filePath);
        } else {
          args.push('-');
          execOpts.stdin = fileText;
          execOpts.cwd = fileDir;
          basePath = fileDir;
        }

        var output = yield helpers.exec(_this2.executablePath, args, execOpts);

        if (editor.getText() !== fileText) {
          // Editor contents have changed, tell Linter not to update results
          return null;
        }

        var toReturn = [];

        var match = regex.exec(output);
        while (match !== null) {
          var isCurrentFile = match[1] === '<stdin>';
          // If the "file" is stdin, override to the current editor's path
          var file = undefined;
          if (isCurrentFile) {
            file = filePath;
          } else if ((0, _path.isAbsolute)(match[1])) {
            file = match[1];
          } else {
            file = (0, _path.resolve)(basePath, match[1]);
          }
          var position = undefined;
          if (match[4]) {
            // Clang gave us a range, use that
            position = parseClangRanges(match[4]);
          } else {
            // Generate a range based on the single point
            var line = Number.parseInt(match[2], 10) - 1;
            var col = Number.parseInt(match[3], 10) - 1;
            if (!isCurrentFile) {
              var fileEditor = findTextEditor(file);
              if (fileEditor !== false) {
                // Found an open editor for the file
                position = helpers.generateRange(fileEditor, line, col);
              } else {
                // Generate a one character range in the file
                position = [[line, col], [line, col + 1]];
              }
            } else {
              position = helpers.generateRange(editor, line, col);
            }
          }
          var severity = /error/.test(match[5]) ? 'error' : 'warning';
          var excerpt = undefined;
          if (match[7]) {
            // There is a -Wflag specified, for now just re-insert that into the excerpt
            excerpt = match[6] + ' [' + match[7] + ']';
          } else {
            excerpt = match[6];
          }
          var message = {
            severity: severity,
            location: { file: file, position: position },
            excerpt: excerpt
          };
          if (match[8]) {
            // We have a suggested fix available
            var fixLineStart = Number.parseInt(match[8], 10) - 1;
            var fixColStart = Number.parseInt(match[9], 10) - 1;
            var fixLineEnd = Number.parseInt(match[10], 10) - 1;
            var fixColEnd = Number.parseInt(match[11], 10) - 1;
            message.solutions = [{
              position: [[fixLineStart, fixColStart], [fixLineEnd, fixColEnd]],
              replaceWith: match[12]
            }];
          }
          toReturn.push(message);
          match = regex.exec(output);
        }

        return toReturn;
      })
    };
  }
};
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2FuYW5tYXkzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci1jbGFuZy9saWIvbWFpbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O29CQUdvQyxNQUFNOztvQkFDWSxNQUFNOztBQUo1RCxXQUFXLENBQUM7O0FBTVosSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDO0FBQ25CLElBQUksVUFBVSxHQUFHLElBQUksQ0FBQzs7QUFFdEIsSUFBTSxLQUFLLEdBQUcsSUFBSSxNQUFNLENBQUMsQ0FDdkIsZ0JBQWdCO0FBQ2hCLGdCQUFnQjtBQUNoQixjQUFjO0FBQ2Qsa0JBQWtCO0FBQ2xCLGdCQUFnQjtBQUNoQix1QkFBdUI7QUFDdkIsbUJBQW1CO0FBQ25CLHlCQUF5QjtBQUN6QixnQ0FBZ0M7QUFDaEMsUUFBUTtBQUNSLEtBQUssQ0FDTjtBQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQzs7Ozs7OztBQU9sQixJQUFNLGdCQUFnQixHQUFHLFNBQW5CLGdCQUFnQixDQUFJLE1BQU0sRUFBSztBQUNuQyxNQUFNLE9BQU8sR0FBRyw0QkFBNEIsQ0FBQztBQUM3QyxNQUFJLFNBQVMsWUFBQSxDQUFDO0FBQ2QsTUFBSSxRQUFRLFlBQUEsQ0FBQztBQUNiLE1BQUksT0FBTyxZQUFBLENBQUM7QUFDWixNQUFJLE1BQU0sWUFBQSxDQUFDOztBQUVYLE1BQUksS0FBSyxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDakMsU0FBTyxLQUFLLEtBQUssSUFBSSxFQUFFO0FBQ3JCLFFBQU0sY0FBYyxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUN6RCxRQUFNLGFBQWEsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDeEQsUUFBTSxZQUFZLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3ZELFFBQU0sV0FBVyxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUN0RCxRQUFJLFNBQVMsS0FBSyxTQUFTLEVBQUU7O0FBRTNCLGVBQVMsR0FBRyxjQUFjLENBQUM7QUFDM0IsY0FBUSxHQUFHLGFBQWEsQ0FBQztBQUN6QixhQUFPLEdBQUcsWUFBWSxDQUFDO0FBQ3ZCLFlBQU0sR0FBRyxXQUFXLENBQUM7S0FDdEIsTUFBTTtBQUNMLFVBQUksY0FBYyxHQUFHLE9BQU8sRUFBRTs7QUFFNUIsZUFBTyxHQUFHLGNBQWMsQ0FBQztBQUN6QixjQUFNLEdBQUcsYUFBYSxDQUFDO09BQ3hCO0FBQ0QsVUFBSSxZQUFZLEdBQUcsT0FBTyxFQUFFOztBQUUxQixlQUFPLEdBQUcsWUFBWSxDQUFDO0FBQ3ZCLGNBQU0sR0FBRyxXQUFXLENBQUM7T0FDdEI7QUFDRCxVQUFJLFdBQVcsR0FBRyxNQUFNLEVBQUU7O0FBRXhCLGNBQU0sR0FBRyxXQUFXLENBQUM7T0FDdEI7S0FDRjtBQUNELFNBQUssR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0dBQzlCO0FBQ0QsU0FBTyxDQUFDLENBQUMsU0FBUyxFQUFFLFFBQVEsQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUM7Q0FDbkQsQ0FBQzs7Ozs7OztBQU9GLElBQU0sY0FBYyxHQUFHLFNBQWpCLGNBQWMsQ0FBSSxRQUFRLEVBQUs7QUFDbkMsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxjQUFjLEVBQUUsQ0FBQztBQUNuRCxNQUFNLGNBQWMsR0FBRyxVQUFVLENBQUMsSUFBSSxDQUNwQyxVQUFBLFVBQVU7V0FBSSxVQUFVLENBQUMsT0FBTyxFQUFFLEtBQUssUUFBUTtHQUFBLENBQUMsQ0FBQztBQUNuRCxTQUFPLGNBQWMsSUFBSSxLQUFLLENBQUM7Q0FDaEMsQ0FBQzs7cUJBRWE7QUFDYixVQUFRLEVBQUEsb0JBQUc7OztBQUNULFdBQU8sQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQzs7O0FBR3JELFFBQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLHVCQUF1QixDQUFDLENBQUM7QUFDekQsUUFBSSxPQUFPLEtBQUssU0FBUyxFQUFFO0FBQ3pCLFVBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLHVCQUF1QixDQUFDLENBQUM7QUFDM0MsVUFBSSxPQUFPLEtBQUssT0FBTyxFQUFFOztBQUV2QixZQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyw2QkFBNkIsRUFBRSxPQUFPLENBQUMsQ0FBQztPQUN6RDtLQUNGOztBQUVELFFBQUksQ0FBQyxhQUFhLEdBQUcsK0JBQXlCLENBQUM7QUFDL0MsUUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQ3BCLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLDZCQUE2QixFQUFFLFVBQUMsS0FBSyxFQUFLO0FBQzVELFlBQUssY0FBYyxHQUFHLEtBQUssQ0FBQztLQUM3QixDQUFDLENBQ0gsQ0FBQztBQUNGLFFBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUNwQixJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxnQ0FBZ0MsRUFBRSxVQUFDLEtBQUssRUFBSztBQUMvRCxZQUFLLGlCQUFpQixHQUFHLEtBQUssQ0FBQztLQUNoQyxDQUFDLENBQ0gsQ0FBQztBQUNGLFFBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUNwQixJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxvQ0FBb0MsRUFBRSxVQUFDLEtBQUssRUFBSztBQUNuRSxZQUFLLHFCQUFxQixHQUFHLEtBQUssQ0FBQztLQUNwQyxDQUFDLENBQ0gsQ0FBQztBQUNGLFFBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUNwQixJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxpQ0FBaUMsRUFBRSxVQUFDLEtBQUssRUFBSztBQUNoRSxZQUFLLGtCQUFrQixHQUFHLEtBQUssQ0FBQztLQUNqQyxDQUFDLENBQ0gsQ0FBQztBQUNGLFFBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUNwQixJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxtQ0FBbUMsRUFBRSxVQUFDLEtBQUssRUFBSztBQUNsRSxZQUFLLG9CQUFvQixHQUFHLEtBQUssQ0FBQztLQUNuQyxDQUFDLENBQ0gsQ0FBQztBQUNGLFFBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUNwQixJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxvQ0FBb0MsRUFBRSxVQUFDLEtBQUssRUFBSztBQUNuRSxZQUFLLHFCQUFxQixHQUFHLEtBQUssQ0FBQztLQUNwQyxDQUFDLENBQ0gsQ0FBQztBQUNGLFFBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUNwQixJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxzQ0FBc0MsRUFBRSxVQUFDLEtBQUssRUFBSztBQUNyRSxZQUFLLHVCQUF1QixHQUFHLEtBQUssQ0FBQztLQUN0QyxDQUFDLENBQ0gsQ0FBQztBQUNGLFFBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUNwQixJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyw4QkFBOEIsRUFBRSxVQUFDLEtBQUssRUFBSztBQUM3RCxZQUFLLGVBQWUsR0FBRyxLQUFLLENBQUM7S0FDOUIsQ0FBQyxDQUNILENBQUM7R0FDSDs7QUFFRCxZQUFVLEVBQUEsc0JBQUc7QUFDWCxRQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRSxDQUFDO0dBQzlCOztBQUVELGVBQWEsRUFBQSx5QkFBRzs7O0FBQ2QsV0FBTztBQUNMLFVBQUksRUFBRSxPQUFPO0FBQ2IsV0FBSyxFQUFFLE1BQU07QUFDYixtQkFBYSxFQUFFLElBQUk7QUFDbkIsbUJBQWEsRUFBRSxDQUFDLFVBQVUsRUFBRSxZQUFZLEVBQUUsYUFBYSxFQUFFLGVBQWUsQ0FBQztBQUN6RSxVQUFJLG9CQUFFLFdBQU8sTUFBTSxFQUFLO0FBQ3RCLFlBQUksT0FBTyxLQUFLLElBQUksRUFBRTtBQUNwQixpQkFBTyxHQUFHLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQztTQUNsQztBQUNELFlBQUksVUFBVSxLQUFLLElBQUksRUFBRTtBQUN2QixvQkFBVSxHQUFHLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQztTQUNyQzs7QUFFRCxZQUFNLFFBQVEsR0FBRyxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDbEMsWUFBSSxPQUFPLFFBQVEsS0FBSyxXQUFXLEVBQUU7OztBQUduQyxpQkFBTyxFQUFFLENBQUM7U0FDWDtBQUNELFlBQU0sT0FBTyxHQUFHLG1CQUFRLFFBQVEsQ0FBQyxDQUFDO0FBQ2xDLFlBQU0sT0FBTyxHQUFHLG1CQUFRLFFBQVEsQ0FBQyxDQUFDO0FBQ2xDLFlBQU0sUUFBUSxHQUFHLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUNsQyxZQUFJLFFBQVEsWUFBQSxDQUFDOztBQUViLFlBQU0sSUFBSSxHQUFHLENBQ1gsZUFBZSxFQUNmLHdCQUF3QixFQUN4QixnQ0FBZ0MsRUFDaEMsdUNBQXVDLEVBQ3ZDLGNBQWMscUJBQ0csT0FBSyxlQUFlLENBQ3RDLENBQUM7OztBQUdGLFlBQU0sT0FBTyxHQUFHLE1BQU0sQ0FBQyxVQUFVLEVBQUUsQ0FBQyxJQUFJLENBQUM7O0FBRXpDLGdCQUFRLE9BQU87QUFDYixlQUFLLGFBQWE7QUFDaEIsZ0JBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7QUFDM0IsZ0JBQUksQ0FBQyxJQUFJLE1BQUEsQ0FBVCxJQUFJLHFCQUFTLE9BQUsscUJBQXFCLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxFQUFDLENBQUM7QUFDdEQsa0JBQU07QUFBQSxBQUNSLGVBQUssZUFBZTtBQUNsQixnQkFBSSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0FBQzdCLGdCQUFJLENBQUMsSUFBSSxNQUFBLENBQVQsSUFBSSxxQkFBUyxPQUFLLHVCQUF1QixDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsRUFBQyxDQUFDO0FBQ3hELGtCQUFNO0FBQUEsQUFDUixlQUFLLEdBQUc7QUFDTixnQkFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUNqQixnQkFBSSxDQUFDLElBQUksTUFBQSxDQUFULElBQUkscUJBQVMsT0FBSyxrQkFBa0IsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEVBQUMsQ0FBQztBQUNuRCxrQkFBTTtBQUFBLEFBQ1Isa0JBQVE7QUFDUixlQUFLLEtBQUssQ0FBQztBQUNYLGVBQUssT0FBTztBQUNWLGdCQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ25CLGdCQUFJLENBQUMsSUFBSSxNQUFBLENBQVQsSUFBSSxxQkFBUyxPQUFLLG9CQUFvQixDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsRUFBQyxDQUFDO0FBQ3JELGtCQUFNO0FBQUEsU0FDVDs7QUFFRCxZQUFJLE9BQU8sS0FBSyxNQUFNLElBQUksT0FBTyxLQUFLLEtBQUssSUFBSSxPQUFPLEtBQUssSUFBSSxFQUFFOztBQUUvRCxjQUFJLENBQUMsSUFBSSxDQUFDLGlDQUFpQyxDQUFDLENBQUM7U0FDOUM7O0FBRUQsWUFBSSxPQUFLLHFCQUFxQixFQUFFO0FBQzlCLGNBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDakI7O0FBRUQsWUFBSSxJQUFJLENBQUMsU0FBUyxFQUFFLEVBQUU7QUFDcEIsY0FBSSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztTQUN4Qjs7QUFFRCxlQUFLLGlCQUFpQixDQUFDLE9BQU8sQ0FBQyxVQUFBLElBQUk7aUJBQ2pDLElBQUksQ0FBQyxJQUFJLFFBQU0sSUFBSSxDQUFHO1NBQUEsQ0FDdkIsQ0FBQzs7QUFFRixZQUFJLGtCQUFrQixHQUFHLEtBQUssQ0FBQztBQUMvQixZQUFJO0FBQ0YsY0FBTSxLQUFLLEdBQUcsVUFBVSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUNqRCxlQUFLLENBQUMsT0FBTyxDQUFDLFVBQUMsSUFBSSxFQUFLO0FBQ3RCLGdCQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ2hCLDhCQUFrQixHQUFHLElBQUksQ0FBQztBQUMxQixnQkFBTSxVQUFVLEdBQUcseUJBQXlCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3hELGdCQUFJLFVBQVUsS0FBSyxJQUFJLEVBQUU7QUFDdkIsc0JBQVEsR0FBRyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDMUI7V0FDRixDQUFDLENBQUM7U0FDSixDQUFDLE9BQU8sS0FBSyxFQUFFO0FBQ2QsY0FBSSxJQUFJLENBQUMsU0FBUyxFQUFFLEVBQUU7O0FBRXBCLG1CQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO1dBQ3BCO1NBQ0Y7O0FBRUQsWUFBSSxNQUFNLENBQUMsVUFBVSxFQUFFLElBQUksa0JBQWtCLEVBQUU7OztBQUc3QyxpQkFBTyxJQUFJLENBQUM7U0FDYjs7QUFFRCxZQUFNLFFBQVEsR0FBRztBQUNmLGdCQUFNLEVBQUUsUUFBUTtBQUNoQiwwQkFBZ0IsRUFBRSxJQUFJO1NBQ3ZCLENBQUM7O0FBRUYsWUFBSSxrQkFBa0IsRUFBRTtBQUN0QixjQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1NBQ3JCLE1BQU07QUFDTCxjQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ2Ysa0JBQVEsQ0FBQyxLQUFLLEdBQUcsUUFBUSxDQUFDO0FBQzFCLGtCQUFRLENBQUMsR0FBRyxHQUFHLE9BQU8sQ0FBQztBQUN2QixrQkFBUSxHQUFHLE9BQU8sQ0FBQztTQUNwQjs7QUFFRCxZQUFNLE1BQU0sR0FBRyxNQUFNLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBSyxjQUFjLEVBQUUsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFDOztBQUV2RSxZQUFJLE1BQU0sQ0FBQyxPQUFPLEVBQUUsS0FBSyxRQUFRLEVBQUU7O0FBRWpDLGlCQUFPLElBQUksQ0FBQztTQUNiOztBQUVELFlBQU0sUUFBUSxHQUFHLEVBQUUsQ0FBQzs7QUFFcEIsWUFBSSxLQUFLLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUMvQixlQUFPLEtBQUssS0FBSyxJQUFJLEVBQUU7QUFDckIsY0FBTSxhQUFhLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLFNBQVMsQ0FBQzs7QUFFN0MsY0FBSSxJQUFJLFlBQUEsQ0FBQztBQUNULGNBQUksYUFBYSxFQUFFO0FBQ2pCLGdCQUFJLEdBQUcsUUFBUSxDQUFDO1dBQ2pCLE1BQU0sSUFBSSxzQkFBVyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTtBQUMvQixnQkFBSSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztXQUNqQixNQUFNO0FBQ0wsZ0JBQUksR0FBRyxtQkFBUSxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7V0FDcEM7QUFDRCxjQUFJLFFBQVEsWUFBQSxDQUFDO0FBQ2IsY0FBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUU7O0FBRVosb0JBQVEsR0FBRyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztXQUN2QyxNQUFNOztBQUVMLGdCQUFNLElBQUksR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDL0MsZ0JBQU0sR0FBRyxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUM5QyxnQkFBSSxDQUFDLGFBQWEsRUFBRTtBQUNsQixrQkFBTSxVQUFVLEdBQUcsY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3hDLGtCQUFJLFVBQVUsS0FBSyxLQUFLLEVBQUU7O0FBRXhCLHdCQUFRLEdBQUcsT0FBTyxDQUFDLGFBQWEsQ0FBQyxVQUFVLEVBQUUsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO2VBQ3pELE1BQU07O0FBRUwsd0JBQVEsR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO2VBQzNDO2FBQ0YsTUFBTTtBQUNMLHNCQUFRLEdBQUcsT0FBTyxDQUFDLGFBQWEsQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO2FBQ3JEO1dBQ0Y7QUFDRCxjQUFNLFFBQVEsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sR0FBRyxTQUFTLENBQUM7QUFDOUQsY0FBSSxPQUFPLFlBQUEsQ0FBQztBQUNaLGNBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFOztBQUVaLG1CQUFPLEdBQU0sS0FBSyxDQUFDLENBQUMsQ0FBQyxVQUFLLEtBQUssQ0FBQyxDQUFDLENBQUMsTUFBRyxDQUFDO1dBQ3ZDLE1BQU07QUFDTCxtQkFBTyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztXQUNwQjtBQUNELGNBQU0sT0FBTyxHQUFHO0FBQ2Qsb0JBQVEsRUFBUixRQUFRO0FBQ1Isb0JBQVEsRUFBRSxFQUFFLElBQUksRUFBSixJQUFJLEVBQUUsUUFBUSxFQUFSLFFBQVEsRUFBRTtBQUM1QixtQkFBTyxFQUFQLE9BQU87V0FDUixDQUFDO0FBQ0YsY0FBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUU7O0FBRVosZ0JBQU0sWUFBWSxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUN2RCxnQkFBTSxXQUFXLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3RELGdCQUFNLFVBQVUsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDdEQsZ0JBQU0sU0FBUyxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNyRCxtQkFBTyxDQUFDLFNBQVMsR0FBRyxDQUFDO0FBQ25CLHNCQUFRLEVBQUUsQ0FBQyxDQUFDLFlBQVksRUFBRSxXQUFXLENBQUMsRUFBRSxDQUFDLFVBQVUsRUFBRSxTQUFTLENBQUMsQ0FBQztBQUNoRSx5QkFBVyxFQUFFLEtBQUssQ0FBQyxFQUFFLENBQUM7YUFDdkIsQ0FBQyxDQUFDO1dBQ0o7QUFDRCxrQkFBUSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUN2QixlQUFLLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztTQUM1Qjs7QUFFRCxlQUFPLFFBQVEsQ0FBQztPQUNqQixDQUFBO0tBQ0YsQ0FBQztHQUNIO0NBQ0YiLCJmaWxlIjoiL2hvbWUvYW5hbm1heTMvLmF0b20vcGFja2FnZXMvbGludGVyLWNsYW5nL2xpYi9tYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBpbXBvcnQvZXh0ZW5zaW9ucywgaW1wb3J0L25vLWV4dHJhbmVvdXMtZGVwZW5kZW5jaWVzXG5pbXBvcnQgeyBDb21wb3NpdGVEaXNwb3NhYmxlIH0gZnJvbSAnYXRvbSc7XG5pbXBvcnQgeyBkaXJuYW1lLCBleHRuYW1lLCByZXNvbHZlLCBpc0Fic29sdXRlIH0gZnJvbSAncGF0aCc7XG5cbmxldCBoZWxwZXJzID0gbnVsbDtcbmxldCBjbGFuZ0ZsYWdzID0gbnVsbDtcblxuY29uc3QgcmVnZXggPSBuZXcgUmVnRXhwKFtcbiAgJ14oPHN0ZGluPnwuKyk6JywgLy8gUGF0aCwgdXN1YWxseSA8c3RkaW4+XG4gICcoXFxcXGQrKTooXFxcXGQrKTonLCAvLyBCYXNlIGxpbmUgYW5kIGNvbHVtblxuICAnKD86KHsuK30pOik/JywgLy8gUmFuZ2UgcG9zaXRpb24ocyksIGlmIHByZXNlbnRcbiAgJyAoW1xcXFx3IFxcXFxcXFxcLV0rKTonLCAvLyBNZXNzYWdlIHR5cGVcbiAgJyAoW15bXFxcXG5cXFxccl0rKScsIC8vIFRoZSBtZXNzYWdlXG4gICcoPzogXFxcXFsoLispXFxcXF0pP1xcXFxyPyQnLCAvLyAtVyBmbGFnLCBpZiBhbnlcbiAgJyg/OlxcXFxyP1xcXFxuXiAuKyQpKycsIC8vIFRoZSB2aXN1YWwgY2FyZXQgZGlhZ25vc3RpY3MsIG5lY2Vzc2FyeSB0byBpbmNsdWRlIGluIG91dHB1dCBmb3IgZml4LWl0c1xuICAnKD86XFxcXHI/XFxcXG5eZml4LWl0OlwiLitcIjonLCAvLyBTdGFydCBvZiBmaXgtaXQgYmxvY2tcbiAgJ3soXFxcXGQrKTooXFxcXGQrKS0oXFxcXGQrKTooXFxcXGQrKX06JywgLy8gZml4LWl0IHJhbmdlXG4gICdcIiguKylcIicsIC8vIGZpeC1pdCByZXBsYWNlbWVudCB0ZXh0XG4gICckKT8nLCAvLyBFbmQgb2YgZml4LWl0IGJsb2NrXG5dLmpvaW4oJycpLCAnZ20nKTtcblxuLyoqXG4gKiBHaXZlbiBhIHNldCBvZiByYW5nZXMgaW4gY2xhbmdzIGZvcm1hdCwgZGV0ZXJtaW5lIHRoZSByYW5nZSBlbmNvbXBhc2luZyBhbGwgcG9pbnRzXG4gKiBAcGFyYW0gIHtTdHJpbmd9IHJhbmdlcyBUaGUgcmF3IHJhbmdlIHN0cmluZyB0byBwYXJzZVxuICogQHJldHVybiB7UmFuZ2V9ICAgICAgICBBbiBBdG9tIFJhbmdlIG9iamVjdCBlbmNvbXBhc2luZyBhbGwgZ2l2ZW4gcmFuZ2VzXG4gKi9cbmNvbnN0IHBhcnNlQ2xhbmdSYW5nZXMgPSAocmFuZ2VzKSA9PiB7XG4gIGNvbnN0IHJhbmdlUkUgPSAveyhcXGQrKTooXFxkKyktKFxcZCspOihcXGQrKX0vZztcbiAgbGV0IGxpbmVTdGFydDtcbiAgbGV0IGNvbFN0YXJ0O1xuICBsZXQgbGluZUVuZDtcbiAgbGV0IGNvbEVuZDtcblxuICBsZXQgbWF0Y2ggPSByYW5nZVJFLmV4ZWMocmFuZ2VzKTtcbiAgd2hpbGUgKG1hdGNoICE9PSBudWxsKSB7XG4gICAgY29uc3QgcmFuZ2VMaW5lU3RhcnQgPSBOdW1iZXIucGFyc2VJbnQobWF0Y2hbMV0sIDEwKSAtIDE7XG4gICAgY29uc3QgcmFuZ2VDb2xTdGFydCA9IE51bWJlci5wYXJzZUludChtYXRjaFsyXSwgMTApIC0gMTtcbiAgICBjb25zdCByYW5nZUxpbmVFbmQgPSBOdW1iZXIucGFyc2VJbnQobWF0Y2hbM10sIDEwKSAtIDE7XG4gICAgY29uc3QgcmFuZ2VDb2xFbmQgPSBOdW1iZXIucGFyc2VJbnQobWF0Y2hbNF0sIDEwKSAtIDE7XG4gICAgaWYgKGxpbmVTdGFydCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAvLyBGaXJzdCBtYXRjaFxuICAgICAgbGluZVN0YXJ0ID0gcmFuZ2VMaW5lU3RhcnQ7XG4gICAgICBjb2xTdGFydCA9IHJhbmdlQ29sU3RhcnQ7XG4gICAgICBsaW5lRW5kID0gcmFuZ2VMaW5lRW5kO1xuICAgICAgY29sRW5kID0gcmFuZ2VDb2xFbmQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChyYW5nZUxpbmVTdGFydCA+IGxpbmVFbmQpIHtcbiAgICAgICAgLy8gSGlnaGVyIHN0YXJ0aW5nIGxpbmVcbiAgICAgICAgbGluZUVuZCA9IHJhbmdlTGluZVN0YXJ0O1xuICAgICAgICBjb2xFbmQgPSByYW5nZUNvbFN0YXJ0O1xuICAgICAgfVxuICAgICAgaWYgKHJhbmdlTGluZUVuZCA+IGxpbmVFbmQpIHtcbiAgICAgICAgLy8gSGlnaGVyIGVuZGluZyBsaW5lXG4gICAgICAgIGxpbmVFbmQgPSByYW5nZUxpbmVFbmQ7XG4gICAgICAgIGNvbEVuZCA9IHJhbmdlQ29sRW5kO1xuICAgICAgfVxuICAgICAgaWYgKHJhbmdlQ29sRW5kID4gY29sRW5kKSB7XG4gICAgICAgIC8vIEhpZ2hlciBlbmRpbmcgY29sdW1uXG4gICAgICAgIGNvbEVuZCA9IHJhbmdlQ29sRW5kO1xuICAgICAgfVxuICAgIH1cbiAgICBtYXRjaCA9IHJhbmdlUkUuZXhlYyhyYW5nZXMpO1xuICB9XG4gIHJldHVybiBbW2xpbmVTdGFydCwgY29sU3RhcnRdLCBbbGluZUVuZCwgY29sRW5kXV07XG59O1xuXG4vKipcbiAqIERldGVybWluZSBpZiBhIGdpdmVuIHBhdGggaXMgb3BlbiBpbiBhbiBleGlzdGluZyBUZXh0RWRpdG9yXG4gKiBAcGFyYW0gIHtTdHJpbmd9IGZpbGVQYXRoIFRoZSBmaWxlIHBhdGggdG8gc2VhcmNoIGZvciBhbiBlZGl0b3Igb2ZcbiAqIEByZXR1cm4ge1RleHRFZGl0b3IgfCBmYWxzZX0gICAgICBUaGUgVGV4dEVkaXRvciBvciBmYWxzZSBpZiBub25lIGZvdW5kXG4gKi9cbmNvbnN0IGZpbmRUZXh0RWRpdG9yID0gKGZpbGVQYXRoKSA9PiB7XG4gIGNvbnN0IGFsbEVkaXRvcnMgPSBhdG9tLndvcmtzcGFjZS5nZXRUZXh0RWRpdG9ycygpO1xuICBjb25zdCBtYXRjaGluZ0VkaXRvciA9IGFsbEVkaXRvcnMuZmluZChcbiAgICB0ZXh0RWRpdG9yID0+IHRleHRFZGl0b3IuZ2V0UGF0aCgpID09PSBmaWxlUGF0aCk7XG4gIHJldHVybiBtYXRjaGluZ0VkaXRvciB8fCBmYWxzZTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgYWN0aXZhdGUoKSB7XG4gICAgcmVxdWlyZSgnYXRvbS1wYWNrYWdlLWRlcHMnKS5pbnN0YWxsKCdsaW50ZXItY2xhbmcnKTtcblxuICAgIC8vIEZJWE1FOiBSZW1vdmUgYmFja3dhcmRzIGNvbXBhdGliaWxpdHkgaW4gYSBmdXR1cmUgbWlub3IgdmVyc2lvblxuICAgIGNvbnN0IG9sZFBhdGggPSBhdG9tLmNvbmZpZy5nZXQoJ2xpbnRlci1jbGFuZy5leGVjUGF0aCcpO1xuICAgIGlmIChvbGRQYXRoICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGF0b20uY29uZmlnLnVuc2V0KCdsaW50ZXItY2xhbmcuZXhlY1BhdGgnKTtcbiAgICAgIGlmIChvbGRQYXRoICE9PSAnY2xhbmcnKSB7XG4gICAgICAgIC8vIElmIHRoZSBvbGQgY29uZmlnIHdhc24ndCBzZXQgdG8gdGhlIGRlZmF1bHQgbWlncmF0ZSBpdCBvdmVyXG4gICAgICAgIGF0b20uY29uZmlnLnNldCgnbGludGVyLWNsYW5nLmV4ZWN1dGFibGVQYXRoJywgb2xkUGF0aCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKFxuICAgICAgYXRvbS5jb25maWcub2JzZXJ2ZSgnbGludGVyLWNsYW5nLmV4ZWN1dGFibGVQYXRoJywgKHZhbHVlKSA9PiB7XG4gICAgICAgIHRoaXMuZXhlY3V0YWJsZVBhdGggPSB2YWx1ZTtcbiAgICAgIH0pLFxuICAgICk7XG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChcbiAgICAgIGF0b20uY29uZmlnLm9ic2VydmUoJ2xpbnRlci1jbGFuZy5jbGFuZ0luY2x1ZGVQYXRocycsICh2YWx1ZSkgPT4ge1xuICAgICAgICB0aGlzLmNsYW5nSW5jbHVkZVBhdGhzID0gdmFsdWU7XG4gICAgICB9KSxcbiAgICApO1xuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoXG4gICAgICBhdG9tLmNvbmZpZy5vYnNlcnZlKCdsaW50ZXItY2xhbmcuY2xhbmdTdXBwcmVzc1dhcm5pbmdzJywgKHZhbHVlKSA9PiB7XG4gICAgICAgIHRoaXMuY2xhbmdTdXBwcmVzc1dhcm5pbmdzID0gdmFsdWU7XG4gICAgICB9KSxcbiAgICApO1xuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoXG4gICAgICBhdG9tLmNvbmZpZy5vYnNlcnZlKCdsaW50ZXItY2xhbmcuY2xhbmdEZWZhdWx0Q0ZsYWdzJywgKHZhbHVlKSA9PiB7XG4gICAgICAgIHRoaXMuY2xhbmdEZWZhdWx0Q0ZsYWdzID0gdmFsdWU7XG4gICAgICB9KSxcbiAgICApO1xuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoXG4gICAgICBhdG9tLmNvbmZpZy5vYnNlcnZlKCdsaW50ZXItY2xhbmcuY2xhbmdEZWZhdWx0Q3BwRmxhZ3MnLCAodmFsdWUpID0+IHtcbiAgICAgICAgdGhpcy5jbGFuZ0RlZmF1bHRDcHBGbGFncyA9IHZhbHVlO1xuICAgICAgfSksXG4gICAgKTtcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKFxuICAgICAgYXRvbS5jb25maWcub2JzZXJ2ZSgnbGludGVyLWNsYW5nLmNsYW5nRGVmYXVsdE9iakNGbGFncycsICh2YWx1ZSkgPT4ge1xuICAgICAgICB0aGlzLmNsYW5nRGVmYXVsdE9iakNGbGFncyA9IHZhbHVlO1xuICAgICAgfSksXG4gICAgKTtcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKFxuICAgICAgYXRvbS5jb25maWcub2JzZXJ2ZSgnbGludGVyLWNsYW5nLmNsYW5nRGVmYXVsdE9iakNwcEZsYWdzJywgKHZhbHVlKSA9PiB7XG4gICAgICAgIHRoaXMuY2xhbmdEZWZhdWx0T2JqQ3BwRmxhZ3MgPSB2YWx1ZTtcbiAgICAgIH0pLFxuICAgICk7XG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChcbiAgICAgIGF0b20uY29uZmlnLm9ic2VydmUoJ2xpbnRlci1jbGFuZy5jbGFuZ0Vycm9yTGltaXQnLCAodmFsdWUpID0+IHtcbiAgICAgICAgdGhpcy5jbGFuZ0Vycm9yTGltaXQgPSB2YWx1ZTtcbiAgICAgIH0pLFxuICAgICk7XG4gIH0sXG5cbiAgZGVhY3RpdmF0ZSgpIHtcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpO1xuICB9LFxuXG4gIHByb3ZpZGVMaW50ZXIoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG5hbWU6ICdjbGFuZycsXG4gICAgICBzY29wZTogJ2ZpbGUnLFxuICAgICAgbGludHNPbkNoYW5nZTogdHJ1ZSxcbiAgICAgIGdyYW1tYXJTY29wZXM6IFsnc291cmNlLmMnLCAnc291cmNlLmNwcCcsICdzb3VyY2Uub2JqYycsICdzb3VyY2Uub2JqY3BwJ10sXG4gICAgICBsaW50OiBhc3luYyAoZWRpdG9yKSA9PiB7XG4gICAgICAgIGlmIChoZWxwZXJzID09PSBudWxsKSB7XG4gICAgICAgICAgaGVscGVycyA9IHJlcXVpcmUoJ2F0b20tbGludGVyJyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNsYW5nRmxhZ3MgPT09IG51bGwpIHtcbiAgICAgICAgICBjbGFuZ0ZsYWdzID0gcmVxdWlyZSgnY2xhbmctZmxhZ3MnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGZpbGVQYXRoID0gZWRpdG9yLmdldFBhdGgoKTtcbiAgICAgICAgaWYgKHR5cGVvZiBmaWxlUGF0aCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAvLyBUaGUgZWRpdG9yIGhhcyBubyBwYXRoLCBtZWFuaW5nIGl0IGhhc24ndCBiZWVuIHNhdmVkLiBBbHRob3VnaFxuICAgICAgICAgIC8vIGNsYW5nIGNvdWxkIGdpdmUgdXMgcmVzdWx0cyBmb3IgdGhpcywgTGludGVyIG5lZWRzIGEgcGF0aFxuICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBmaWxlRXh0ID0gZXh0bmFtZShmaWxlUGF0aCk7XG4gICAgICAgIGNvbnN0IGZpbGVEaXIgPSBkaXJuYW1lKGZpbGVQYXRoKTtcbiAgICAgICAgY29uc3QgZmlsZVRleHQgPSBlZGl0b3IuZ2V0VGV4dCgpO1xuICAgICAgICBsZXQgYmFzZVBhdGg7XG5cbiAgICAgICAgY29uc3QgYXJncyA9IFtcbiAgICAgICAgICAnLWZzeW50YXgtb25seScsXG4gICAgICAgICAgJy1mbm8tY29sb3ItZGlhZ25vc3RpY3MnLFxuICAgICAgICAgICctZmRpYWdub3N0aWNzLXBhcnNlYWJsZS1maXhpdHMnLFxuICAgICAgICAgICctZmRpYWdub3N0aWNzLXByaW50LXNvdXJjZS1yYW5nZS1pbmZvJyxcbiAgICAgICAgICAnLWZleGNlcHRpb25zJyxcbiAgICAgICAgICBgLWZlcnJvci1saW1pdD0ke3RoaXMuY2xhbmdFcnJvckxpbWl0fWAsXG4gICAgICAgIF07XG5cbiAgICAgICAgLy8gTm9uLVB1YmxpYyBBUEkhXG4gICAgICAgIGNvbnN0IGdyYW1tYXIgPSBlZGl0b3IuZ2V0R3JhbW1hcigpLm5hbWU7XG5cbiAgICAgICAgc3dpdGNoIChncmFtbWFyKSB7XG4gICAgICAgICAgY2FzZSAnT2JqZWN0aXZlLUMnOlxuICAgICAgICAgICAgYXJncy5wdXNoKCcteG9iamVjdGl2ZS1jJyk7XG4gICAgICAgICAgICBhcmdzLnB1c2goLi4udGhpcy5jbGFuZ0RlZmF1bHRPYmpDRmxhZ3Muc3BsaXQoL1xccysvKSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICdPYmplY3RpdmUtQysrJzpcbiAgICAgICAgICAgIGFyZ3MucHVzaCgnLXhvYmplY3RpdmUtYysrJyk7XG4gICAgICAgICAgICBhcmdzLnB1c2goLi4udGhpcy5jbGFuZ0RlZmF1bHRPYmpDcHBGbGFncy5zcGxpdCgvXFxzKy8pKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ0MnOlxuICAgICAgICAgICAgYXJncy5wdXNoKCcteGMnKTtcbiAgICAgICAgICAgIGFyZ3MucHVzaCguLi50aGlzLmNsYW5nRGVmYXVsdENGbGFncy5zcGxpdCgvXFxzKy8pKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgY2FzZSAnQysrJzpcbiAgICAgICAgICBjYXNlICdDKysxNCc6XG4gICAgICAgICAgICBhcmdzLnB1c2goJy14YysrJyk7XG4gICAgICAgICAgICBhcmdzLnB1c2goLi4udGhpcy5jbGFuZ0RlZmF1bHRDcHBGbGFncy5zcGxpdCgvXFxzKy8pKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGZpbGVFeHQgPT09ICcuaHBwJyB8fCBmaWxlRXh0ID09PSAnLmhoJyB8fCBmaWxlRXh0ID09PSAnLmgnKSB7XG4gICAgICAgICAgLy8gRG9uJ3Qgd2FybiBhYm91dCAjcHJhZ21hIG9uY2Ugd2hlbiBsaW50aW5nIGhlYWRlciBmaWxlc1xuICAgICAgICAgIGFyZ3MucHVzaCgnLVduby1wcmFnbWEtb25jZS1vdXRzaWRlLWhlYWRlcicpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuY2xhbmdTdXBwcmVzc1dhcm5pbmdzKSB7XG4gICAgICAgICAgYXJncy5wdXNoKCctdycpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGF0b20uaW5EZXZNb2RlKCkpIHtcbiAgICAgICAgICBhcmdzLnB1c2goJy0tdmVyYm9zZScpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5jbGFuZ0luY2x1ZGVQYXRocy5mb3JFYWNoKHBhdGggPT5cbiAgICAgICAgICBhcmdzLnB1c2goYC1JJHtwYXRofWApLFxuICAgICAgICApO1xuXG4gICAgICAgIGxldCB1c2luZ0NsYW5nQ29tcGxldGUgPSBmYWxzZTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBjb25zdCBmbGFncyA9IGNsYW5nRmxhZ3MuZ2V0Q2xhbmdGbGFncyhmaWxlUGF0aCk7XG4gICAgICAgICAgZmxhZ3MuZm9yRWFjaCgoZmxhZykgPT4ge1xuICAgICAgICAgICAgYXJncy5wdXNoKGZsYWcpO1xuICAgICAgICAgICAgdXNpbmdDbGFuZ0NvbXBsZXRlID0gdHJ1ZTtcbiAgICAgICAgICAgIGNvbnN0IHdvcmtpbmdEaXIgPSAvLXdvcmtpbmctZGlyZWN0b3J5PSguKykvLmV4ZWMoZmxhZyk7XG4gICAgICAgICAgICBpZiAod29ya2luZ0RpciAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICBiYXNlUGF0aCA9IHdvcmtpbmdEaXJbMV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgaWYgKGF0b20uaW5EZXZNb2RlKCkpIHtcbiAgICAgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25zb2xlXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvcik7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGVkaXRvci5pc01vZGlmaWVkKCkgJiYgdXNpbmdDbGFuZ0NvbXBsZXRlKSB7XG4gICAgICAgICAgLy8gSWYgdGhlIHVzZXIgaGFzIGEgLmNsYW5nLWNvbXBsZXRlIGZpbGUgd2UgY2FuJ3QgbGludCBjdXJyZW50XG4gICAgICAgICAgLy8gVGV4dEVkaXRvciBjb250ZW50cywgcmV0dXJuIG51bGwgc28gbm90aGluZyBnZXRzIG1vZGlmaWVkXG4gICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBleGVjT3B0cyA9IHtcbiAgICAgICAgICBzdHJlYW06ICdzdGRlcnInLFxuICAgICAgICAgIGFsbG93RW1wdHlTdGRlcnI6IHRydWUsXG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKHVzaW5nQ2xhbmdDb21wbGV0ZSkge1xuICAgICAgICAgIGFyZ3MucHVzaChmaWxlUGF0aCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgYXJncy5wdXNoKCctJyk7XG4gICAgICAgICAgZXhlY09wdHMuc3RkaW4gPSBmaWxlVGV4dDtcbiAgICAgICAgICBleGVjT3B0cy5jd2QgPSBmaWxlRGlyO1xuICAgICAgICAgIGJhc2VQYXRoID0gZmlsZURpcjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IG91dHB1dCA9IGF3YWl0IGhlbHBlcnMuZXhlYyh0aGlzLmV4ZWN1dGFibGVQYXRoLCBhcmdzLCBleGVjT3B0cyk7XG5cbiAgICAgICAgaWYgKGVkaXRvci5nZXRUZXh0KCkgIT09IGZpbGVUZXh0KSB7XG4gICAgICAgICAgLy8gRWRpdG9yIGNvbnRlbnRzIGhhdmUgY2hhbmdlZCwgdGVsbCBMaW50ZXIgbm90IHRvIHVwZGF0ZSByZXN1bHRzXG4gICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCB0b1JldHVybiA9IFtdO1xuXG4gICAgICAgIGxldCBtYXRjaCA9IHJlZ2V4LmV4ZWMob3V0cHV0KTtcbiAgICAgICAgd2hpbGUgKG1hdGNoICE9PSBudWxsKSB7XG4gICAgICAgICAgY29uc3QgaXNDdXJyZW50RmlsZSA9IG1hdGNoWzFdID09PSAnPHN0ZGluPic7XG4gICAgICAgICAgLy8gSWYgdGhlIFwiZmlsZVwiIGlzIHN0ZGluLCBvdmVycmlkZSB0byB0aGUgY3VycmVudCBlZGl0b3IncyBwYXRoXG4gICAgICAgICAgbGV0IGZpbGU7XG4gICAgICAgICAgaWYgKGlzQ3VycmVudEZpbGUpIHtcbiAgICAgICAgICAgIGZpbGUgPSBmaWxlUGF0aDtcbiAgICAgICAgICB9IGVsc2UgaWYgKGlzQWJzb2x1dGUobWF0Y2hbMV0pKSB7XG4gICAgICAgICAgICBmaWxlID0gbWF0Y2hbMV07XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGZpbGUgPSByZXNvbHZlKGJhc2VQYXRoLCBtYXRjaFsxXSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGxldCBwb3NpdGlvbjtcbiAgICAgICAgICBpZiAobWF0Y2hbNF0pIHtcbiAgICAgICAgICAgIC8vIENsYW5nIGdhdmUgdXMgYSByYW5nZSwgdXNlIHRoYXRcbiAgICAgICAgICAgIHBvc2l0aW9uID0gcGFyc2VDbGFuZ1JhbmdlcyhtYXRjaFs0XSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIEdlbmVyYXRlIGEgcmFuZ2UgYmFzZWQgb24gdGhlIHNpbmdsZSBwb2ludFxuICAgICAgICAgICAgY29uc3QgbGluZSA9IE51bWJlci5wYXJzZUludChtYXRjaFsyXSwgMTApIC0gMTtcbiAgICAgICAgICAgIGNvbnN0IGNvbCA9IE51bWJlci5wYXJzZUludChtYXRjaFszXSwgMTApIC0gMTtcbiAgICAgICAgICAgIGlmICghaXNDdXJyZW50RmlsZSkge1xuICAgICAgICAgICAgICBjb25zdCBmaWxlRWRpdG9yID0gZmluZFRleHRFZGl0b3IoZmlsZSk7XG4gICAgICAgICAgICAgIGlmIChmaWxlRWRpdG9yICE9PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIC8vIEZvdW5kIGFuIG9wZW4gZWRpdG9yIGZvciB0aGUgZmlsZVxuICAgICAgICAgICAgICAgIHBvc2l0aW9uID0gaGVscGVycy5nZW5lcmF0ZVJhbmdlKGZpbGVFZGl0b3IsIGxpbmUsIGNvbCk7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gR2VuZXJhdGUgYSBvbmUgY2hhcmFjdGVyIHJhbmdlIGluIHRoZSBmaWxlXG4gICAgICAgICAgICAgICAgcG9zaXRpb24gPSBbW2xpbmUsIGNvbF0sIFtsaW5lLCBjb2wgKyAxXV07XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHBvc2l0aW9uID0gaGVscGVycy5nZW5lcmF0ZVJhbmdlKGVkaXRvciwgbGluZSwgY29sKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgY29uc3Qgc2V2ZXJpdHkgPSAvZXJyb3IvLnRlc3QobWF0Y2hbNV0pID8gJ2Vycm9yJyA6ICd3YXJuaW5nJztcbiAgICAgICAgICBsZXQgZXhjZXJwdDtcbiAgICAgICAgICBpZiAobWF0Y2hbN10pIHtcbiAgICAgICAgICAgIC8vIFRoZXJlIGlzIGEgLVdmbGFnIHNwZWNpZmllZCwgZm9yIG5vdyBqdXN0IHJlLWluc2VydCB0aGF0IGludG8gdGhlIGV4Y2VycHRcbiAgICAgICAgICAgIGV4Y2VycHQgPSBgJHttYXRjaFs2XX0gWyR7bWF0Y2hbN119XWA7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGV4Y2VycHQgPSBtYXRjaFs2XTtcbiAgICAgICAgICB9XG4gICAgICAgICAgY29uc3QgbWVzc2FnZSA9IHtcbiAgICAgICAgICAgIHNldmVyaXR5LFxuICAgICAgICAgICAgbG9jYXRpb246IHsgZmlsZSwgcG9zaXRpb24gfSxcbiAgICAgICAgICAgIGV4Y2VycHQsXG4gICAgICAgICAgfTtcbiAgICAgICAgICBpZiAobWF0Y2hbOF0pIHtcbiAgICAgICAgICAgIC8vIFdlIGhhdmUgYSBzdWdnZXN0ZWQgZml4IGF2YWlsYWJsZVxuICAgICAgICAgICAgY29uc3QgZml4TGluZVN0YXJ0ID0gTnVtYmVyLnBhcnNlSW50KG1hdGNoWzhdLCAxMCkgLSAxO1xuICAgICAgICAgICAgY29uc3QgZml4Q29sU3RhcnQgPSBOdW1iZXIucGFyc2VJbnQobWF0Y2hbOV0sIDEwKSAtIDE7XG4gICAgICAgICAgICBjb25zdCBmaXhMaW5lRW5kID0gTnVtYmVyLnBhcnNlSW50KG1hdGNoWzEwXSwgMTApIC0gMTtcbiAgICAgICAgICAgIGNvbnN0IGZpeENvbEVuZCA9IE51bWJlci5wYXJzZUludChtYXRjaFsxMV0sIDEwKSAtIDE7XG4gICAgICAgICAgICBtZXNzYWdlLnNvbHV0aW9ucyA9IFt7XG4gICAgICAgICAgICAgIHBvc2l0aW9uOiBbW2ZpeExpbmVTdGFydCwgZml4Q29sU3RhcnRdLCBbZml4TGluZUVuZCwgZml4Q29sRW5kXV0sXG4gICAgICAgICAgICAgIHJlcGxhY2VXaXRoOiBtYXRjaFsxMl0sXG4gICAgICAgICAgICB9XTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdG9SZXR1cm4ucHVzaChtZXNzYWdlKTtcbiAgICAgICAgICBtYXRjaCA9IHJlZ2V4LmV4ZWMob3V0cHV0KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0b1JldHVybjtcbiAgICAgIH0sXG4gICAgfTtcbiAgfSxcbn07XG4iXX0=