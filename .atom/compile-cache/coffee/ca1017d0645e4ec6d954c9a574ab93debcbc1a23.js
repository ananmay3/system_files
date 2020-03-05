(function() {
  var buildEmitPchArgs, getFirstScopes, getScopeLang, path, ref, ref1, spawnClang;

  path = require('path');

  ref = require('./common-util'), getFirstScopes = ref.getFirstScopes, getScopeLang = ref.getScopeLang;

  ref1 = require('./clang-args-builder'), spawnClang = ref1.spawnClang, buildEmitPchArgs = ref1.buildEmitPchArgs;

  module.exports = {
    emitPch: function(editor) {
      var args, cwd, h, headers, headersInput, lang;
      lang = getScopeLang(getFirstScopes(editor));
      if (!lang) {
        atom.notifications.addError("autocomplete-clang:emit-pch\nError: Incompatible Language");
        return;
      }
      headers = atom.config.get("autocomplete-clang.preCompiledHeaders " + lang);
      headersInput = ((function() {
        var i, len, results;
        results = [];
        for (i = 0, len = headers.length; i < len; i++) {
          h = headers[i];
          results.push("#include <" + h + ">");
        }
        return results;
      })()).join("\n");
      cwd = path.dirname(editor.getPath());
      args = buildEmitPchArgs(editor, lang);
      return spawnClang(cwd, args, headersInput, (function(_this) {
        return function(code, outputs, errors, resolve) {
          console.log("-emit-pch out\n", outputs);
          console.log("-emit-pch err\n", errors);
          return resolve(_this.handleEmitPchResult(code));
        };
      })(this));
    },
    handleEmitPchResult: function(code) {
      if (!code) {
        atom.notifications.addSuccess("Emiting precompiled header has successfully finished");
        return;
      }
      return atom.notifications.addError(("Emiting precompiled header exit with " + code + "\n") + "See console for detailed error message");
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvYW5hbm1heTMvLmF0b20vcGFja2FnZXMvYXV0b2NvbXBsZXRlLWNsYW5nL2xpYi9wY2gtZW1pdHRlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFFUCxNQUFpQyxPQUFBLENBQVEsZUFBUixDQUFqQyxFQUFDLG1DQUFELEVBQWlCOztFQUNqQixPQUFrQyxPQUFBLENBQVEsc0JBQVIsQ0FBbEMsRUFBQyw0QkFBRCxFQUFhOztFQUViLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7SUFBQSxPQUFBLEVBQVMsU0FBQyxNQUFEO0FBQ1AsVUFBQTtNQUFBLElBQUEsR0FBTyxZQUFBLENBQWMsY0FBQSxDQUFlLE1BQWYsQ0FBZDtNQUNQLElBQUEsQ0FBTyxJQUFQO1FBQ0UsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFuQixDQUE0QiwyREFBNUI7QUFDQSxlQUZGOztNQUdBLE9BQUEsR0FBVSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0Isd0NBQUEsR0FBeUMsSUFBekQ7TUFDVixZQUFBLEdBQWU7O0FBQUM7YUFBQSx5Q0FBQTs7dUJBQUEsWUFBQSxHQUFhLENBQWIsR0FBZTtBQUFmOztVQUFELENBQW9DLENBQUMsSUFBckMsQ0FBMEMsSUFBMUM7TUFDZixHQUFBLEdBQU0sSUFBSSxDQUFDLE9BQUwsQ0FBYSxNQUFNLENBQUMsT0FBUCxDQUFBLENBQWI7TUFDTixJQUFBLEdBQU8sZ0JBQUEsQ0FBaUIsTUFBakIsRUFBeUIsSUFBekI7YUFDUCxVQUFBLENBQVcsR0FBWCxFQUFnQixJQUFoQixFQUFzQixZQUF0QixFQUFvQyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsSUFBRCxFQUFPLE9BQVAsRUFBZ0IsTUFBaEIsRUFBd0IsT0FBeEI7VUFDbEMsT0FBTyxDQUFDLEdBQVIsQ0FBWSxpQkFBWixFQUErQixPQUEvQjtVQUNBLE9BQU8sQ0FBQyxHQUFSLENBQVksaUJBQVosRUFBK0IsTUFBL0I7aUJBQ0EsT0FBQSxDQUFRLEtBQUMsQ0FBQSxtQkFBRCxDQUFxQixJQUFyQixDQUFSO1FBSGtDO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFwQztJQVRPLENBQVQ7SUFjQSxtQkFBQSxFQUFxQixTQUFDLElBQUQ7TUFDbkIsSUFBQSxDQUFPLElBQVA7UUFDRSxJQUFJLENBQUMsYUFBYSxDQUFDLFVBQW5CLENBQThCLHNEQUE5QjtBQUNBLGVBRkY7O2FBR0EsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFuQixDQUE0QixDQUFBLHVDQUFBLEdBQXdDLElBQXhDLEdBQTZDLElBQTdDLENBQUEsR0FDMUIsd0NBREY7SUFKbUIsQ0FkckI7O0FBTkYiLCJzb3VyY2VzQ29udGVudCI6WyJwYXRoID0gcmVxdWlyZSAncGF0aCdcblxue2dldEZpcnN0U2NvcGVzLCBnZXRTY29wZUxhbmd9ID0gcmVxdWlyZSAnLi9jb21tb24tdXRpbCdcbntzcGF3bkNsYW5nLCBidWlsZEVtaXRQY2hBcmdzfSAgPSByZXF1aXJlICcuL2NsYW5nLWFyZ3MtYnVpbGRlcidcblxubW9kdWxlLmV4cG9ydHMgPVxuICBlbWl0UGNoOiAoZWRpdG9yKS0+XG4gICAgbGFuZyA9IGdldFNjb3BlTGFuZyAoZ2V0Rmlyc3RTY29wZXMgZWRpdG9yKVxuICAgIHVubGVzcyBsYW5nXG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IgXCJhdXRvY29tcGxldGUtY2xhbmc6ZW1pdC1wY2hcXG5FcnJvcjogSW5jb21wYXRpYmxlIExhbmd1YWdlXCJcbiAgICAgIHJldHVyblxuICAgIGhlYWRlcnMgPSBhdG9tLmNvbmZpZy5nZXQgXCJhdXRvY29tcGxldGUtY2xhbmcucHJlQ29tcGlsZWRIZWFkZXJzICN7bGFuZ31cIlxuICAgIGhlYWRlcnNJbnB1dCA9IChcIiNpbmNsdWRlIDwje2h9PlwiIGZvciBoIGluIGhlYWRlcnMpLmpvaW4gXCJcXG5cIlxuICAgIGN3ZCA9IHBhdGguZGlybmFtZSBlZGl0b3IuZ2V0UGF0aCgpXG4gICAgYXJncyA9IGJ1aWxkRW1pdFBjaEFyZ3MgZWRpdG9yLCBsYW5nXG4gICAgc3Bhd25DbGFuZyBjd2QsIGFyZ3MsIGhlYWRlcnNJbnB1dCwgKGNvZGUsIG91dHB1dHMsIGVycm9ycywgcmVzb2x2ZSkgPT5cbiAgICAgIGNvbnNvbGUubG9nIFwiLWVtaXQtcGNoIG91dFxcblwiLCBvdXRwdXRzXG4gICAgICBjb25zb2xlLmxvZyBcIi1lbWl0LXBjaCBlcnJcXG5cIiwgZXJyb3JzXG4gICAgICByZXNvbHZlKEBoYW5kbGVFbWl0UGNoUmVzdWx0IGNvZGUpXG5cbiAgaGFuZGxlRW1pdFBjaFJlc3VsdDogKGNvZGUpLT5cbiAgICB1bmxlc3MgY29kZVxuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZFN1Y2Nlc3MgXCJFbWl0aW5nIHByZWNvbXBpbGVkIGhlYWRlciBoYXMgc3VjY2Vzc2Z1bGx5IGZpbmlzaGVkXCJcbiAgICAgIHJldHVyblxuICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvciBcIkVtaXRpbmcgcHJlY29tcGlsZWQgaGVhZGVyIGV4aXQgd2l0aCAje2NvZGV9XFxuXCIrXG4gICAgICBcIlNlZSBjb25zb2xlIGZvciBkZXRhaWxlZCBlcnJvciBtZXNzYWdlXCJcbiJdfQ==
