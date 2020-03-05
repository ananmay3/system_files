(function() {
  var BufferedProcess, ClangFlags, addClangFlags, addCommonArgs, addDocumentationArgs, fs, getCommons, makeFileBasedArgs, os, path, uuidv4;

  BufferedProcess = require('atom').BufferedProcess;

  path = require('path');

  fs = require('fs');

  os = require('os');

  uuidv4 = require('uuid/v4');

  ClangFlags = require('clang-flags');

  module.exports = {
    spawnClang: function(cwd, args, input, callback) {
      return new Promise(function(resolve) {
        var argsCountThreshold, bufferedProcess, command, errors, exit, filePath, options, outputs, ref, ref1, stderr, stdout;
        command = atom.config.get("autocomplete-clang.clangCommand");
        options = {
          cwd: cwd
        };
        ref = [[], []], outputs = ref[0], errors = ref[1];
        stdout = function(data) {
          return outputs.push(data);
        };
        stderr = function(data) {
          return errors.push(data);
        };
        argsCountThreshold = atom.config.get("autocomplete-clang.argsCountThreshold");
        if ((args.join(" ")).length > (argsCountThreshold || 7000)) {
          ref1 = makeFileBasedArgs(args), args = ref1[0], filePath = ref1[1];
          exit = function(code) {
            fs.unlinkSync(filePath);
            return callback(code, outputs.join('\n'), errors.join('\n'), resolve);
          };
        } else {
          exit = function(code) {
            return callback(code, outputs.join('\n'), errors.join('\n'), resolve);
          };
        }
        bufferedProcess = new BufferedProcess({
          command: command,
          args: args,
          options: options,
          stdout: stdout,
          stderr: stderr,
          exit: exit
        });
        bufferedProcess.process.stdin.setEncoding = 'utf-8';
        bufferedProcess.process.stdin.write(input);
        return bufferedProcess.process.stdin.end();
      });
    },
    buildCodeCompletionArgs: function(editor, row, column, language) {
      var args, currentDir, filePath, pchPath, ref, std;
      ref = getCommons(editor, language), std = ref.std, filePath = ref.filePath, currentDir = ref.currentDir, pchPath = ref.pchPath;
      args = [];
      args.push("-fsyntax-only");
      args.push("-x" + language);
      args.push("-Xclang", "-code-completion-macros");
      args.push("-Xclang", "-code-completion-at=-:" + (row + 1) + ":" + (column + 1));
      if (fs.existsSync(pchPath)) {
        args.push("-include-pch", pchPath);
      }
      return addCommonArgs(args, std, currentDir, pchPath, filePath);
    },
    buildAstDumpArgs: function(editor, language, term) {
      var args, currentDir, filePath, pchPath, ref, std;
      ref = getCommons(editor, language), std = ref.std, filePath = ref.filePath, currentDir = ref.currentDir, pchPath = ref.pchPath;
      args = [];
      args.push("-fsyntax-only");
      args.push("-x" + language);
      args.push("-Xclang", "-ast-dump");
      args.push("-Xclang", "-ast-dump-filter");
      args.push("-Xclang", "" + term);
      if (fs.existsSync(pchPath)) {
        args.push("-include-pch", pchPath);
      }
      return addCommonArgs(args, std, currentDir, pchPath, filePath);
    },
    buildEmitPchArgs: function(editor, language) {
      var args, currentDir, filePath, pchPath, ref, std;
      ref = getCommons(editor, language), std = ref.std, filePath = ref.filePath, currentDir = ref.currentDir, pchPath = ref.pchPath;
      args = [];
      args.push("-x" + language + "-header");
      args.push("-Xclang", "-emit-pch", "-o", pchPath);
      return addCommonArgs(args, std, currentDir, pchPath, filePath);
    }
  };

  getCommons = function(editor, language) {
    var currentDir, filePath, pchFile, pchFilePrefix;
    pchFilePrefix = atom.config.get("autocomplete-clang.pchFilePrefix");
    pchFile = [pchFilePrefix, language, "pch"].join('.');
    filePath = editor.getPath();
    currentDir = path.dirname(filePath);
    return {
      std: atom.config.get("autocomplete-clang.std " + language),
      filePath: filePath,
      currentDir: currentDir,
      pchPath: path.join(currentDir, pchFile)
    };
  };

  addCommonArgs = function(args, std, currentDir, pchPath, filePath) {
    var i, j, len, ref;
    if (std) {
      args.push("-std=" + std);
    }
    ref = atom.config.get("autocomplete-clang.includePaths");
    for (j = 0, len = ref.length; j < len; j++) {
      i = ref[j];
      args.push("-I" + i);
    }
    args.push("-I" + currentDir);
    args = addDocumentationArgs(args);
    args = addClangFlags(args, filePath);
    args.push("-");
    return args;
  };

  addClangFlags = function(args, filePath) {
    var clangflags, error;
    try {
      clangflags = ClangFlags.getClangFlags(filePath);
      if (clangflags) {
        args = args.concat(clangflags);
      }
    } catch (error1) {
      error = error1;
      console.log("clang-flags error:", error);
    }
    return args;
  };

  addDocumentationArgs = function(args) {
    if (atom.config.get("autocomplete-clang.includeDocumentation")) {
      args.push("-Xclang", "-code-completion-brief-comments");
      if (atom.config.get("autocomplete-clang.includeNonDoxygenCommentsAsDocumentation")) {
        args.push("-fparse-all-comments");
      }
      if (atom.config.get("autocomplete-clang.includeSystemHeadersDocumentation")) {
        args.push("-fretain-comments-from-system-headers");
      }
    }
    return args;
  };

  makeFileBasedArgs = function(args) {
    var filePath;
    args = args.join('\n');
    args = args.replace(/\\/g, "\\\\");
    args = args.replace(/\ /g, "\\\ ");
    filePath = path.join(os.tmpdir(), "acargs-" + uuidv4());
    fs.writeFileSync(filePath, args);
    args = ['@' + filePath];
    return [args, filePath];
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvYW5hbm1heTMvLmF0b20vcGFja2FnZXMvYXV0b2NvbXBsZXRlLWNsYW5nL2xpYi9jbGFuZy1hcmdzLWJ1aWxkZXIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQyxrQkFBbUIsT0FBQSxDQUFRLE1BQVI7O0VBQ3BCLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFDUCxFQUFBLEdBQUssT0FBQSxDQUFRLElBQVI7O0VBQ0wsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSOztFQUNMLE1BQUEsR0FBUyxPQUFBLENBQVEsU0FBUjs7RUFDVCxVQUFBLEdBQWEsT0FBQSxDQUFRLGFBQVI7O0VBRWIsTUFBTSxDQUFDLE9BQVAsR0FFRTtJQUFBLFVBQUEsRUFBWSxTQUFDLEdBQUQsRUFBTSxJQUFOLEVBQVksS0FBWixFQUFtQixRQUFuQjthQUNWLElBQUksT0FBSixDQUFZLFNBQUMsT0FBRDtBQUNWLFlBQUE7UUFBQSxPQUFBLEdBQVUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLGlDQUFoQjtRQUNWLE9BQUEsR0FBVTtVQUFBLEdBQUEsRUFBSyxHQUFMOztRQUNWLE1BQW9CLENBQUMsRUFBRCxFQUFLLEVBQUwsQ0FBcEIsRUFBQyxnQkFBRCxFQUFVO1FBQ1YsTUFBQSxHQUFTLFNBQUMsSUFBRDtpQkFBUyxPQUFPLENBQUMsSUFBUixDQUFhLElBQWI7UUFBVDtRQUNULE1BQUEsR0FBUyxTQUFDLElBQUQ7aUJBQVMsTUFBTSxDQUFDLElBQVAsQ0FBWSxJQUFaO1FBQVQ7UUFDVCxrQkFBQSxHQUFxQixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsdUNBQWhCO1FBQ3JCLElBQUcsQ0FBQyxJQUFJLENBQUMsSUFBTCxDQUFVLEdBQVYsQ0FBRCxDQUFnQixDQUFDLE1BQWpCLEdBQTBCLENBQUMsa0JBQUEsSUFBc0IsSUFBdkIsQ0FBN0I7VUFDRSxP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LENBQWEsS0FBYixFQUFvQixNQUFwQjtJQUNQLElBQUEsR0FBTyxJQUFJLENBQUMsT0FBTCxDQUFhLEtBQWIsRUFBb0IsTUFBcEI7SUFDUCxRQUFBLEdBQVcsSUFBSSxDQUFDLElBQUwsQ0FBVSxFQUFFLENBQUMsTUFBSCxDQUFBLENBQVYsRUFBdUIsU0FBQSxHQUFVLE1BQUEsQ0FBQSxDQUFqQztJQUNYLEVBQUUsQ0FBQyxhQUFILENBQWlCLFFBQWpCLEVBQTJCLElBQTNCO0lBQ0EsSUFBQSxHQUFPLENBQUMsR0FBQSxHQUFNLFFBQVA7V0FDUCxDQUFDLElBQUQsRUFBTyxRQUFQO0VBUGtCO0FBL0ZwQiIsInNvdXJjZXNDb250ZW50IjpbIntCdWZmZXJlZFByb2Nlc3N9ID0gcmVxdWlyZSAnYXRvbSdcbnBhdGggPSByZXF1aXJlICdwYXRoJ1xuZnMgPSByZXF1aXJlICdmcydcbm9zID0gcmVxdWlyZSAnb3MnXG51dWlkdjQgPSByZXF1aXJlICd1dWlkL3Y0J1xuQ2xhbmdGbGFncyA9IHJlcXVpcmUgJ2NsYW5nLWZsYWdzJ1xuXG5tb2R1bGUuZXhwb3J0cyA9XG5cbiAgc3Bhd25DbGFuZzogKGN3ZCwgYXJncywgaW5wdXQsIGNhbGxiYWNrKS0+XG4gICAgbmV3IFByb21pc2UgKHJlc29sdmUpIC0+XG4gICAgICBjb21tYW5kID0gYXRvbS5jb25maWcuZ2V0IFwiYXV0b2NvbXBsZXRlLWNsYW5nLmNsYW5nQ29tbWFuZFwiXG4gICAgICBvcHRpb25zID0gY3dkOiBjd2RcbiAgICAgIFtvdXRwdXRzLCBlcnJvcnNdID0gW1tdLCBbXV1cbiAgICAgIHN0ZG91dCA9IChkYXRhKS0+IG91dHB1dHMucHVzaCBkYXRhXG4gICAgICBzdGRlcnIgPSAoZGF0YSktPiBlcnJvcnMucHVzaCBkYXRhXG4gICAgICBhcmdzQ291bnRUaHJlc2hvbGQgPSBhdG9tLmNvbmZpZy5nZXQoXCJhdXRvY29tcGxldGUtY2xhbmcuYXJnc0NvdW50VGhyZXNob2xkXCIpXG4gICAgICBpZiAoYXJncy5qb2luKFwiIFwiKSkubGVuZ3RoID4gKGFyZ3NDb3VudFRocmVzaG9sZCBvciA3MDAwKVxuICAgICAgICBbYXJncywgZmlsZVBhdGhdID0gbWFrZUZpbGVCYXNlZEFyZ3MgYXJnc1xuICAgICAgICBleGl0ID0gKGNvZGUpLT5cbiAgICAgICAgICBmcy51bmxpbmtTeW5jIGZpbGVQYXRoXG4gICAgICAgICAgY2FsbGJhY2sgY29kZSwgKG91dHB1dHMuam9pbiAnXFxuJyksIChlcnJvcnMuam9pbiAnXFxuJyksIHJlc29sdmVcbiAgICAgIGVsc2VcbiAgICAgICAgZXhpdCA9IChjb2RlKS0+IGNhbGxiYWNrIGNvZGUsIChvdXRwdXRzLmpvaW4gJ1xcbicpLCAoZXJyb3JzLmpvaW4gJ1xcbicpLCByZXNvbHZlXG4gICAgICBidWZmZXJlZFByb2Nlc3MgPSBuZXcgQnVmZmVyZWRQcm9jZXNzKHtjb21tYW5kLCBhcmdzLCBvcHRpb25zLCBzdGRvdXQsIHN0ZGVyciwgZXhpdH0pXG4gICAgICBidWZmZXJlZFByb2Nlc3MucHJvY2Vzcy5zdGRpbi5zZXRFbmNvZGluZyA9ICd1dGYtOCdcbiAgICAgIGJ1ZmZlcmVkUHJvY2Vzcy5wcm9jZXNzLnN0ZGluLndyaXRlIGlucHV0XG4gICAgICBidWZmZXJlZFByb2Nlc3MucHJvY2Vzcy5zdGRpbi5lbmQoKVxuXG4gIGJ1aWxkQ29kZUNvbXBsZXRpb25BcmdzOiAoZWRpdG9yLCByb3csIGNvbHVtbiwgbGFuZ3VhZ2UpIC0+XG4gICAge3N0ZCwgZmlsZVBhdGgsIGN1cnJlbnREaXIsIHBjaFBhdGh9ID0gZ2V0Q29tbW9ucyBlZGl0b3IsbGFuZ3VhZ2VcbiAgICBhcmdzID0gW11cbiAgICBhcmdzLnB1c2ggXCItZnN5bnRheC1vbmx5XCJcbiAgICBhcmdzLnB1c2ggXCIteCN7bGFuZ3VhZ2V9XCJcbiAgICBhcmdzLnB1c2ggXCItWGNsYW5nXCIsIFwiLWNvZGUtY29tcGxldGlvbi1tYWNyb3NcIlxuICAgIGFyZ3MucHVzaCBcIi1YY2xhbmdcIiwgXCItY29kZS1jb21wbGV0aW9uLWF0PS06I3tyb3cgKyAxfToje2NvbHVtbiArIDF9XCJcbiAgICBhcmdzLnB1c2goXCItaW5jbHVkZS1wY2hcIiwgcGNoUGF0aCkgaWYgZnMuZXhpc3RzU3luYyhwY2hQYXRoKVxuICAgIGFkZENvbW1vbkFyZ3MgYXJncywgc3RkLCBjdXJyZW50RGlyLCBwY2hQYXRoLCBmaWxlUGF0aFxuXG4gIGJ1aWxkQXN0RHVtcEFyZ3M6IChlZGl0b3IsIGxhbmd1YWdlLCB0ZXJtKS0+XG4gICAge3N0ZCwgZmlsZVBhdGgsIGN1cnJlbnREaXIsIHBjaFBhdGh9ID0gZ2V0Q29tbW9ucyBlZGl0b3IsbGFuZ3VhZ2VcbiAgICBhcmdzID0gW11cbiAgICBhcmdzLnB1c2ggXCItZnN5bnRheC1vbmx5XCJcbiAgICBhcmdzLnB1c2ggXCIteCN7bGFuZ3VhZ2V9XCJcbiAgICBhcmdzLnB1c2ggXCItWGNsYW5nXCIsIFwiLWFzdC1kdW1wXCJcbiAgICBhcmdzLnB1c2ggXCItWGNsYW5nXCIsIFwiLWFzdC1kdW1wLWZpbHRlclwiXG4gICAgYXJncy5wdXNoIFwiLVhjbGFuZ1wiLCBcIiN7dGVybX1cIlxuICAgIGFyZ3MucHVzaChcIi1pbmNsdWRlLXBjaFwiLCBwY2hQYXRoKSBpZiBmcy5leGlzdHNTeW5jKHBjaFBhdGgpXG4gICAgYWRkQ29tbW9uQXJncyBhcmdzLCBzdGQsIGN1cnJlbnREaXIsIHBjaFBhdGgsIGZpbGVQYXRoXG5cbiAgYnVpbGRFbWl0UGNoQXJnczogKGVkaXRvciwgbGFuZ3VhZ2UpLT5cbiAgICB7c3RkLCBmaWxlUGF0aCwgY3VycmVudERpciwgcGNoUGF0aH0gPSBnZXRDb21tb25zIGVkaXRvcixsYW5ndWFnZVxuICAgIGFyZ3MgPSBbXVxuICAgIGFyZ3MucHVzaCBcIi14I3tsYW5ndWFnZX0taGVhZGVyXCJcbiAgICBhcmdzLnB1c2ggXCItWGNsYW5nXCIsIFwiLWVtaXQtcGNoXCIsIFwiLW9cIiwgcGNoUGF0aFxuICAgIGFkZENvbW1vbkFyZ3MgYXJncywgc3RkLCBjdXJyZW50RGlyLCBwY2hQYXRoLCBmaWxlUGF0aFxuXG5nZXRDb21tb25zID0gKGVkaXRvciwgbGFuZ3VhZ2UpLT5cbiAgcGNoRmlsZVByZWZpeCA9IGF0b20uY29uZmlnLmdldCBcImF1dG9jb21wbGV0ZS1jbGFuZy5wY2hGaWxlUHJlZml4XCJcbiAgcGNoRmlsZSA9IFtwY2hGaWxlUHJlZml4LCBsYW5ndWFnZSwgXCJwY2hcIl0uam9pbiAnLidcbiAgZmlsZVBhdGggPSBlZGl0b3IuZ2V0UGF0aCgpXG4gIGN1cnJlbnREaXIgPSBwYXRoLmRpcm5hbWUgZmlsZVBhdGhcbiAge1xuICAgIHN0ZDogKGF0b20uY29uZmlnLmdldCBcImF1dG9jb21wbGV0ZS1jbGFuZy5zdGQgI3tsYW5ndWFnZX1cIiksXG4gICAgZmlsZVBhdGg6IGZpbGVQYXRoLFxuICAgIGN1cnJlbnREaXI6IGN1cnJlbnREaXIsXG4gICAgcGNoUGF0aDogKHBhdGguam9pbiBjdXJyZW50RGlyLCBwY2hGaWxlKVxuICB9XG5cbmFkZENvbW1vbkFyZ3MgPSAoYXJncywgc3RkLCBjdXJyZW50RGlyLCBwY2hQYXRoLCBmaWxlUGF0aCktPlxuICBhcmdzLnB1c2ggXCItc3RkPSN7c3RkfVwiIGlmIHN0ZFxuICBhcmdzLnB1c2ggXCItSSN7aX1cIiBmb3IgaSBpbiBhdG9tLmNvbmZpZy5nZXQgXCJhdXRvY29tcGxldGUtY2xhbmcuaW5jbHVkZVBhdGhzXCJcbiAgYXJncy5wdXNoIFwiLUkje2N1cnJlbnREaXJ9XCJcbiAgYXJncyA9IGFkZERvY3VtZW50YXRpb25BcmdzIGFyZ3NcbiAgYXJncyA9IGFkZENsYW5nRmxhZ3MgYXJncywgZmlsZVBhdGhcbiAgYXJncy5wdXNoIFwiLVwiXG4gIGFyZ3NcblxuYWRkQ2xhbmdGbGFncyA9IChhcmdzLCBmaWxlUGF0aCktPlxuICB0cnlcbiAgICBjbGFuZ2ZsYWdzID0gQ2xhbmdGbGFncy5nZXRDbGFuZ0ZsYWdzKGZpbGVQYXRoKVxuICAgIGFyZ3MgPSBhcmdzLmNvbmNhdCBjbGFuZ2ZsYWdzIGlmIGNsYW5nZmxhZ3NcbiAgY2F0Y2ggZXJyb3JcbiAgICBjb25zb2xlLmxvZyBcImNsYW5nLWZsYWdzIGVycm9yOlwiLCBlcnJvclxuICBhcmdzXG5cbmFkZERvY3VtZW50YXRpb25BcmdzID0gKGFyZ3MpLT5cbiAgaWYgYXRvbS5jb25maWcuZ2V0IFwiYXV0b2NvbXBsZXRlLWNsYW5nLmluY2x1ZGVEb2N1bWVudGF0aW9uXCJcbiAgICBhcmdzLnB1c2ggXCItWGNsYW5nXCIsIFwiLWNvZGUtY29tcGxldGlvbi1icmllZi1jb21tZW50c1wiXG4gICAgaWYgYXRvbS5jb25maWcuZ2V0IFwiYXV0b2NvbXBsZXRlLWNsYW5nLmluY2x1ZGVOb25Eb3h5Z2VuQ29tbWVudHNBc0RvY3VtZW50YXRpb25cIlxuICAgICAgYXJncy5wdXNoIFwiLWZwYXJzZS1hbGwtY29tbWVudHNcIlxuICAgIGlmIGF0b20uY29uZmlnLmdldCBcImF1dG9jb21wbGV0ZS1jbGFuZy5pbmNsdWRlU3lzdGVtSGVhZGVyc0RvY3VtZW50YXRpb25cIlxuICAgICAgYXJncy5wdXNoIFwiLWZyZXRhaW4tY29tbWVudHMtZnJvbS1zeXN0ZW0taGVhZGVyc1wiXG4gIGFyZ3NcblxubWFrZUZpbGVCYXNlZEFyZ3MgPSAoYXJncyktPlxuICBhcmdzID0gYXJncy5qb2luKCdcXG4nKVxuICBhcmdzID0gYXJncy5yZXBsYWNlIC9cXFxcL2csIFwiXFxcXFxcXFxcIlxuICBhcmdzID0gYXJncy5yZXBsYWNlIC9cXCAvZywgXCJcXFxcXFwgXCJcbiAgZmlsZVBhdGggPSBwYXRoLmpvaW4ob3MudG1wZGlyKCksIFwiYWNhcmdzLVwiK3V1aWR2NCgpKVxuICBmcy53cml0ZUZpbGVTeW5jIGZpbGVQYXRoLCBhcmdzXG4gIGFyZ3MgPSBbJ0AnICsgZmlsZVBhdGhdXG4gIFthcmdzLCBmaWxlUGF0aF1cbiJdfQ==
