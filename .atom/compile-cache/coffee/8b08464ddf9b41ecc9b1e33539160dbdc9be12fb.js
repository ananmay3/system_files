(function() {
  var Command, CommandError, Ex, ExViewModel, Find;

  ExViewModel = require('./ex-view-model');

  Ex = require('./ex');

  Find = require('./find');

  CommandError = require('./command-error');

  Command = (function() {
    function Command(editor, exState) {
      this.editor = editor;
      this.exState = exState;
      this.selections = this.exState.getSelections();
      this.viewModel = new ExViewModel(this, Object.keys(this.selections).length > 0);
    }

    Command.prototype.parseAddr = function(str, cursor) {
      var addr, buffer, mark, ref, ref1, row;
      row = cursor.getBufferRow();
      if (str === '.') {
        addr = row;
      } else if (str === '$') {
        buffer = this.editor.getBuffer();
        addr = ((ref = typeof buffer.getLineCount === "function" ? buffer.getLineCount() : void 0) != null ? ref : buffer.lines.length) - 1;
      } else if ((ref1 = str[0]) === "+" || ref1 === "-") {
        addr = row + this.parseOffset(str);
      } else if (!isNaN(str)) {
        addr = parseInt(str) - 1;
      } else if (str[0] === "'") {
        if (this.vimState == null) {
          throw new CommandError("Couldn't get access to vim-mode.");
        }
        mark = this.vimState.mark.marks[str[1]];
        if (mark == null) {
          throw new CommandError("Mark " + str + " not set.");
        }
        addr = mark.getEndBufferPosition().row;
      } else if (str[0] === "/") {
        str = str.slice(1);
        if (str[str.length - 1] === "/") {
          str = str.slice(0, -1);
        }
        addr = Find.scanEditor(str, this.editor, cursor.getCurrentLineBufferRange().end)[0];
        if (addr == null) {
          throw new CommandError("Pattern not found: " + str);
        }
        addr = addr.start.row;
      } else if (str[0] === "?") {
        str = str.slice(1);
        if (str[str.length - 1] === "?") {
          str = str.slice(0, -1);
        }
        addr = Find.scanEditor(str, this.editor, cursor.getCurrentLineBufferRange().start, true)[0];
        if (addr == null) {
          throw new CommandError("Pattern not found: " + str.slice(1, -1));
        }
        addr = addr.start.row;
      }
      return addr;
    };

    Command.prototype.parseOffset = function(str) {
      var o;
      if (str.length === 0) {
        return 0;
      }
      if (str.length === 1) {
        o = 1;
      } else {
        o = parseInt(str.slice(1));
      }
      if (str[0] === '+') {
        return o;
      } else {
        return -o;
      }
    };

    Command.prototype.execute = function(input) {
      var addr1, addr2, addrPattern, address1, address2, args, buffer, bufferRange, cl, command, cursor, func, id, lastLine, m, match, matching, name, off1, off2, range, ref, ref1, ref2, ref3, ref4, results, runOverSelections, selection, val;
      this.vimState = (ref = this.exState.globalExState.vim) != null ? ref.getEditorState(this.editor) : void 0;
      cl = input.characters;
      cl = cl.replace(/^(:|\s)*/, '');
      if (!(cl.length > 0)) {
        return;
      }
      if (cl[0] === '"') {
        return;
      }
      buffer = this.editor.getBuffer();
      lastLine = ((ref1 = typeof buffer.getLineCount === "function" ? buffer.getLineCount() : void 0) != null ? ref1 : buffer.lines.length) - 1;
      if (cl[0] === '%') {
        range = [0, lastLine];
        cl = cl.slice(1);
      } else {
        addrPattern = /^(?:(\.|\$|\d+|'[\[\]<>'`"^.(){}a-zA-Z]|\/.*?(?:[^\\]\/|$)|\?.*?(?:[^\\]\?|$)|[+-]\d*)((?:\s*[+-]\d*)*))?(?:,(\.|\$|\d+|'[\[\]<>'`"^.(){}a-zA-Z]|\/.*?[^\\]\/|\?.*?[^\\]\?|[+-]\d*)((?:\s*[+-]\d*)*))?/;
        ref2 = cl.match(addrPattern), match = ref2[0], addr1 = ref2[1], off1 = ref2[2], addr2 = ref2[3], off2 = ref2[4];
        cursor = this.editor.getLastCursor();
        if (addr1 === "'<" && addr2 === "'>") {
          runOverSelections = true;
        } else {
          runOverSelections = false;
          if (addr1 != null) {
            address1 = this.parseAddr(addr1, cursor);
          } else {
            address1 = cursor.getBufferRow();
          }
          if (off1 != null) {
            address1 += this.parseOffset(off1);
          }
          if (address1 === -1) {
            address1 = 0;
          }
          if (address1 > lastLine) {
            address1 = lastLine;
          }
          if (address1 < 0) {
            throw new CommandError('Invalid range');
          }
          if (addr2 != null) {
            address2 = this.parseAddr(addr2, cursor);
          }
          if (off2 != null) {
            address2 += this.parseOffset(off2);
          }
          if (address2 === -1) {
            address2 = 0;
          }
          if (address2 > lastLine) {
            address2 = lastLine;
          }
          if (address2 < 0) {
            throw new CommandError('Invalid range');
          }
          if (address2 < address1) {
            throw new CommandError('Backwards range given');
          }
        }
        range = [address1, address2 != null ? address2 : address1];
      }
      cl = cl.slice(match != null ? match.length : void 0);
      cl = cl.trimLeft();
      if (cl.length === 0) {
        this.editor.setCursorBufferPosition([range[1], 0]);
        return;
      }
      if (cl.length === 2 && cl[0] === 'k' && /[a-z]/i.test(cl[1])) {
        command = 'mark';
        args = cl[1];
      } else if (!/[a-z]/i.test(cl[0])) {
        command = cl[0];
        args = cl.slice(1);
      } else {
        ref3 = cl.match(/^(\w+)(.*)/), m = ref3[0], command = ref3[1], args = ref3[2];
      }
      if ((func = Ex.singleton()[command]) == null) {
        matching = (function() {
          var ref4, results;
          ref4 = Ex.singleton();
          results = [];
          for (name in ref4) {
            val = ref4[name];
            if (name.indexOf(command) === 0) {
              results.push(name);
            }
          }
          return results;
        })();
        matching.sort();
        command = matching[0];
        func = Ex.singleton()[command];
      }
      if (func != null) {
        if (runOverSelections) {
          ref4 = this.selections;
          results = [];
          for (id in ref4) {
            selection = ref4[id];
            bufferRange = selection.getBufferRange();
            range = [bufferRange.start.row, bufferRange.end.row];
            results.push(func({
              range: range,
              args: args,
              vimState: this.vimState,
              exState: this.exState,
              editor: this.editor
            }));
          }
          return results;
        } else {
          return func({
            range: range,
            args: args,
            vimState: this.vimState,
            exState: this.exState,
            editor: this.editor
          });
        }
      } else {
        throw new CommandError("Not an editor command: " + input.characters);
      }
    };

    return Command;

  })();

  module.exports = Command;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvYW5hbm1heWphaW4vLmF0b20vcGFja2FnZXMvZXgtbW9kZS9saWIvY29tbWFuZC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLFdBQUEsR0FBYyxPQUFBLENBQVEsaUJBQVI7O0VBQ2QsRUFBQSxHQUFLLE9BQUEsQ0FBUSxNQUFSOztFQUNMLElBQUEsR0FBTyxPQUFBLENBQVEsUUFBUjs7RUFDUCxZQUFBLEdBQWUsT0FBQSxDQUFRLGlCQUFSOztFQUVUO0lBQ1MsaUJBQUMsTUFBRCxFQUFVLE9BQVY7TUFBQyxJQUFDLENBQUEsU0FBRDtNQUFTLElBQUMsQ0FBQSxVQUFEO01BQ3JCLElBQUMsQ0FBQSxVQUFELEdBQWMsSUFBQyxDQUFBLE9BQU8sQ0FBQyxhQUFULENBQUE7TUFDZCxJQUFDLENBQUEsU0FBRCxHQUFhLElBQUksV0FBSixDQUFnQixJQUFoQixFQUFtQixNQUFNLENBQUMsSUFBUCxDQUFZLElBQUMsQ0FBQSxVQUFiLENBQXdCLENBQUMsTUFBekIsR0FBa0MsQ0FBckQ7SUFGRjs7c0JBSWIsU0FBQSxHQUFXLFNBQUMsR0FBRCxFQUFNLE1BQU47QUFDVCxVQUFBO01BQUEsR0FBQSxHQUFNLE1BQU0sQ0FBQyxZQUFQLENBQUE7TUFDTixJQUFHLEdBQUEsS0FBTyxHQUFWO1FBQ0UsSUFBQSxHQUFPLElBRFQ7T0FBQSxNQUVLLElBQUcsR0FBQSxLQUFPLEdBQVY7UUFLSCxNQUFBLEdBQVMsSUFBQyxDQUFBLE1BQU0sQ0FBQyxTQUFSLENBQUE7UUFDVCxJQUFBLEdBQU8sb0dBQTBCLE1BQU0sQ0FBQyxLQUFLLENBQUMsTUFBdkMsQ0FBQSxHQUFpRCxFQU5yRDtPQUFBLE1BT0EsWUFBRyxHQUFJLENBQUEsQ0FBQSxFQUFKLEtBQVcsR0FBWCxJQUFBLElBQUEsS0FBZ0IsR0FBbkI7UUFDSCxJQUFBLEdBQU8sR0FBQSxHQUFNLElBQUMsQ0FBQSxXQUFE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TCxJQUFPLHdDQUFQO1FBRUUsUUFBQTs7QUFBWTtBQUFBO2VBQUEsWUFBQTs7Z0JBQ1YsSUFBSSxDQUFDLE9BQUwsQ0FBYSxPQUFiLENBQUEsS0FBeUI7MkJBRGY7O0FBQUE7OztRQUdaLFFBQVEsQ0FBQyxJQUFULENBQUE7UUFFQSxPQUFBLEdBQVUsUUFBUyxDQUFBLENBQUE7UUFFbkIsSUFBQSxHQUFPLEVBQUUsQ0FBQyxTQUFILENBQUEsQ0FBZSxDQUFBLE9BQUEsRUFUeEI7O01BV0EsSUFBRyxZQUFIO1FBQ0UsSUFBRyxpQkFBSDtBQUNFO0FBQUE7ZUFBQSxVQUFBOztZQUNFLFdBQUEsR0FBYyxTQUFTLENBQUMsY0FBVixDQUFBO1lBQ2QsS0FBQSxHQUFRLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxHQUFuQixFQUF3QixXQUFXLENBQUMsR0FBRyxDQUFDLEdBQXhDO3lCQUNSLElBQUEsQ0FBSztjQUFFLE9BQUEsS0FBRjtjQUFTLE1BQUEsSUFBVDtjQUFnQixVQUFELElBQUMsQ0FBQSxRQUFoQjtjQUEyQixTQUFELElBQUMsQ0FBQSxPQUEzQjtjQUFxQyxRQUFELElBQUMsQ0FBQSxNQUFyQzthQUFMO0FBSEY7eUJBREY7U0FBQSxNQUFBO2lCQU1FLElBQUEsQ0FBSztZQUFFLE9BQUEsS0FBRjtZQUFTLE1BQUEsSUFBVDtZQUFnQixVQUFELElBQUMsQ0FBQSxRQUFoQjtZQUEyQixTQUFELElBQUMsQ0FBQSxPQUEzQjtZQUFxQyxRQUFELElBQUMsQ0FBQSxNQUFyQztXQUFMLEVBTkY7U0FERjtPQUFBLE1BQUE7QUFTRSxjQUFNLElBQUksWUFBSixDQUFpQix5QkFBQSxHQUEwQixLQUFLLENBQUMsVUFBakQsRUFUUjs7SUE5SE87Ozs7OztFQXlJWCxNQUFNLENBQUMsT0FBUCxHQUFpQjtBQXhNakIiLCJzb3VyY2VzQ29udGVudCI6WyJFeFZpZXdNb2RlbCA9IHJlcXVpcmUgJy4vZXgtdmlldy1tb2RlbCdcbkV4ID0gcmVxdWlyZSAnLi9leCdcbkZpbmQgPSByZXF1aXJlICcuL2ZpbmQnXG5Db21tYW5kRXJyb3IgPSByZXF1aXJlICcuL2NvbW1hbmQtZXJyb3InXG5cbmNsYXNzIENvbW1hbmRcbiAgY29uc3RydWN0b3I6IChAZWRpdG9yLCBAZXhTdGF0ZSkgLT5cbiAgICBAc2VsZWN0aW9ucyA9IEBleFN0YXRlLmdldFNlbGVjdGlvbnMoKVxuICAgIEB2aWV3TW9kZWwgPSBuZXcgRXhWaWV3TW9kZWwoQCwgT2JqZWN0LmtleXMoQHNlbGVjdGlvbnMpLmxlbmd0aCA+IDApXG5cbiAgcGFyc2VBZGRyOiAoc3RyLCBjdXJzb3IpIC0+XG4gICAgcm93ID0gY3Vyc29yLmdldEJ1ZmZlclJvdygpXG4gICAgaWYgc3RyIGlzICcuJ1xuICAgICAgYWRkciA9IHJvd1xuICAgIGVsc2UgaWYgc3RyIGlzICckJ1xuICAgICAgIyBMaW5lcyBhcmUgMC1pbmRleGVkIGluIEF0b20sIGJ1dCAxLWluZGV4ZWQgaW4gdmltLlxuICAgICAgIyBUaGUgdHdvIHdheXMgb2YgZ2V0dGluZyBsZW5ndGggbGV0IHVzIHN1cHBvcnQgQXRvbSAxLjE5J3MgbmV3IGJ1ZmZlclxuICAgICAgIyBpbXBsZW1lbnRhdGlvbiAoaHR0cHM6Ly9naXRodWIuY29tL2F0b20vYXRvbS9wdWxsLzE0NDM1KSBhbmQgc3RpbGxcbiAgICAgICMgc3VwcG9ydCAxLjE4IGFuZCBiZWxvd1xuICAgICAgYnVmZmVyID0gQGVkaXRvci5nZXRCdWZmZXIoKVxuICAgICAgYWRkciA9IChidWZmZXIuZ2V0TGluZUNvdW50PygpID8gYnVmZmVyLmxpbmVzLmxlbmd0aCkgLSAxXG4gICAgZWxzZSBpZiBzdHJbMF0gaW4gW1wiK1wiLCBcIi1cIl1cbiAgICAgIGFkZHIgPSByb3cgKyBAcGFyc2VPZmZzZXQoc3RyKVxuICAgIGVsc2UgaWYgbm90IGlzTmFOKHN0cilcbiAgICAgIGFkZHIgPSBwYXJzZUludChzdHIpIC0gMVxuICAgIGVsc2UgaWYgc3RyWzBdIGlzIFwiJ1wiICMgUGFyc2UgTWFyay4uLlxuICAgICAgdW5sZXNzIEB2aW1TdGF0ZT9cbiAgICAgICAgdGhyb3cgbmV3IENvbW1hbmRFcnJvcihcIkNvdWxkbid0IGdldCBhY2Nlc3MgdG8gdmltLW1vZGUuXCIpXG4gICAgICBtYXJrID0gQHZpbVN0YXRlLm1hcmsubWFya3Nbc3RyWzFdXVxuICAgICAgdW5sZXNzIG1hcms/XG4gICAgICAgIHRocm93IG5ldyBDb21tYW5kRXJyb3IoXCJNYXJrICN7c3RyfSBub3Qgc2V0LlwiKVxuICAgICAgYWRkciA9IG1hcmsuZ2V0RW5kQnVmZmVyUG9zaXRpb24oKS5yb3dcbiAgICBlbHNlIGlmIHN0clswXSBpcyBcIi9cIlxuICAgICAgc3RyID0gc3RyWzEuLi5dXG4gICAgICBpZiBzdHJbc3RyLmxlbmd0aC0xXSBpcyBcIi9cIlxuICAgICAgICBzdHIgPSBzdHJbLi4uLTFdXG4gICAgICBhZGRyID0gRmluZC5zY2FuRWRpdG9yKHN0ciwgQGVkaXRvciwgY3Vyc29yLmdldEN1cnJlbnRMaW5lQnVmZmVyUmFuZ2UoKS5lbmQpWzBdXG4gICAgICB1bmxlc3MgYWRkcj9cbiAgICAgICAgdGhyb3cgbmV3IENvbW1hbmRFcnJvcihcIlBhdHRlcm4gbm90IGZvdW5kOiAje3N0cn1cIilcbiAgICAgIGFkZHIgPSBhZGRyLnN0YXJ0LnJvd1xuICAgIGVsc2UgaWYgc3RyWzBdIGlzIFwiP1wiXG4gICAgICBzdHIgPSBzdHJbMS4uLl1cbiAgICAgIGlmIHN0cltzdHIubGVuZ3RoLTFdIGlzIFwiP1wiXG4gICAgICAgIHN0ciA9IHN0clsuLi4tMV1cbiAgICAgIGFkZHIgPSBGaW5kLnNjYW5FZGl0b3Ioc3RyLCBAZWRpdG9yLCBjdXJzb3IuZ2V0Q3VycmVudExpbmVCdWZmZXJSYW5nZSgpLnN0YXJ0LCB0cnVlKVswXVxuICAgICAgdW5sZXNzIGFkZHI/XG4gICAgICAgIHRocm93IG5ldyBDb21tYW5kRXJyb3IoXCJQYXR0ZXJuIG5vdCBmb3VuZDogI3tzdHJbMS4uLi0xXX1cIilcbiAgICAgIGFkZHIgPSBhZGRyLnN0YXJ0LnJvd1xuXG4gICAgcmV0dXJuIGFkZHJcblxuICBwYXJzZU9mZnNldDogKHN0cikgLT5cbiAgICBpZiBzdHIubGVuZ3RoIGlzIDBcbiAgICAgIHJldHVybiAwXG4gICAgaWYgc3RyLmxlbmd0aCBpcyAxXG4gICAgICBvID0gMVxuICAgIGVsc2VcbiAgICAgIG8gPSBwYXJzZUludChzdHJbMS4uXSlcbiAgICBpZiBzdHJbMF0gaXMgJysnXG4gICAgICByZXR1cm4gb1xuICAgIGVsc2VcbiAgICAgIHJldHVybiAtb1xuXG4gIGV4ZWN1dGU6IChpbnB1dCkgLT5cbiAgICBAdmltU3RhdGUgPSBAZXhTdGF0ZS5nbG9iYWxFeFN0YXRlLnZpbT8uZ2V0RWRpdG9yU3RhdGUoQGVkaXRvcilcbiAgICAjIENvbW1hbmQgbGluZSBwYXJzaW5nIChtb3N0bHkpIGZvbGxvd2luZyB0aGUgcnVsZXMgYXRcbiAgICAjIGh0dHA6Ly9wdWJzLm9wZW5ncm91cC5vcmcvb25saW5lcHVicy85Njk5OTE5Nzk5L3V0aWxpdGllc1xuICAgICMgL2V4Lmh0bWwjdGFnXzIwXzQwXzEzXzAzXG5cbiAgICAjIFN0ZXBzIDEvMjogTGVhZGluZyBibGFua3MgYW5kIGNvbG9ucyBhcmUgaWdub3JlZC5cbiAgICBjbCA9IGlucHV0LmNoYXJhY3RlcnNcbiAgICBjbCA9IGNsLnJlcGxhY2UoL14oOnxcXHMpKi8sICcnKVxuICAgIHJldHVybiB1bmxlc3MgY2wubGVuZ3RoID4gMFxuXG4gICAgIyBTdGVwIDM6IElmIHRoZSBmaXJzdCBjaGFyYWN0ZXIgaXMgYSBcIiwgaWdub3JlIHRoZSByZXN0IG9mIHRoZSBsaW5lXG4gICAgaWYgY2xbMF0gaXMgJ1wiJ1xuICAgICAgcmV0dXJuXG5cbiAgICAjIFN0ZXAgNDogQWRkcmVzcyBwYXJzaW5nXG4gICAgIyBzZWUgY29tbWVudCBpbiBwYXJzZUFkZHIgYWJvdXQgbGluZSBsZW5ndGhcbiAgICBidWZmZXIgPSBAZWRpdG9yLmdldEJ1ZmZlcigpXG4gICAgbGFzdExpbmUgPSAoYnVmZmVyLmdldExpbmVDb3VudD8oKSA/IGJ1ZmZlci5saW5lcy5sZW5ndGgpIC0gMVxuICAgIGlmIGNsWzBdIGlzICclJ1xuICAgICAgcmFuZ2UgPSBbMCwgbGFzdExpbmVdXG4gICAgICBjbCA9IGNsWzEuLl1cbiAgICBlbHNlXG4gICAgICBhZGRyUGF0dGVybiA9IC8vL15cbiAgICAgICAgKD86ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICMgRmlyc3QgYWRkcmVzc1xuICAgICAgICAoXG4gICAgICAgIFxcLnwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIyBDdXJyZW50IGxpbmVcbiAgICAgICAgXFwkfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAjIExhc3QgbGluZVxuICAgICAgICBcXGQrfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICMgbi10aCBsaW5lXG4gICAgICAgICdbXFxbXFxdPD4nYFwiXi4oKXt9YS16QS1aXXwgICAgICAgICAjIE1hcmtzXG4gICAgICAgIC8uKj8oPzpbXlxcXFxdL3wkKXwgICAgICAgICAgICAgICAgICMgUmVnZXhcbiAgICAgICAgXFw/Lio/KD86W15cXFxcXVxcP3wkKXwgICAgICAgICAgICAgICAjIEJhY2t3YXJkcyBzZWFyY2hcbiAgICAgICAgWystXVxcZCogICAgICAgICAgICAgICAgICAgICAgICAgICAjIEN1cnJlbnQgbGluZSArLy0gYSBudW1iZXIgb2YgbGluZXNcbiAgICAgICAgKSgoPzpcXHMqWystXVxcZCopKikgICAgICAgICAgICAgICAgIyBMaW5lIG9mZnNldFxuICAgICAgICApP1xuICAgICAgICAoPzosICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIyBTZWNvbmQgYWRkcmVzc1xuICAgICAgICAoICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIyBTYW1lIGFzIGZpcnN0IGFkZHJlc3NcbiAgICAgICAgXFwufFxuICAgICAgICBcXCR8XG4gICAgICAgIFxcZCt8XG4gICAgICAgICdbXFxbXFxdPD4nYFwiXi4oKXt9YS16QS1aXXxcbiAgICAgICAgLy4qP1teXFxcXF0vfFxuICAgICAgICBcXD8uKj9bXlxcXFxdXFw/fFxuICAgICAgICBbKy1dXFxkKlxuICAgICAgICApKCg/OlxccypbKy1dXFxkKikqKVxuICAgICAgICApP1xuICAgICAgLy8vXG5cbiAgICAgIFttYXRjaCwgYWRkcjEsIG9mZjEsIGFkZHIyLCBvZmYyXSA9IGNsLm1hdGNoKGFkZHJQYXR0ZXJuKVxuXG4gICAgICBjdXJzb3IgPSBAZWRpdG9yLmdldExhc3RDdXJzb3IoKVxuXG4gICAgICAjIFNwZWNpYWwgY2FzZTogcnVuIGNvbW1hbmQgb24gc2VsZWN0aW9uLiBUaGlzIGNhbid0IGJlIGhhbmRsZWQgYnkgc2ltcGx5XG4gICAgICAjIHBhcnNpbmcgdGhlIG1hcmsgc2luY2UgdmltLW1vZGUgZG9lc24ndCBzZXQgaXQgKGFuZCBpdCB3b3VsZCBiZSBmYWlybHlcbiAgICAgICMgdXNlbGVzcyB3aXRoIG11bHRpcGxlIHNlbGVjdGlvbnMpXG4gICAgICBpZiBhZGRyMSBpcyBcIic8XCIgYW5kIGFkZHIyIGlzIFwiJz5cIlxuICAgICAgICBydW5PdmVyU2VsZWN0aW9ucyA9IHRydWVcbiAgICAgIGVsc2VcbiAgICAgICAgcnVuT3ZlclNlbGVjdGlvbnMgPSBmYWxzZVxuICAgICAgICBpZiBhZGRyMT9cbiAgICAgICAgICBhZGRyZXNzMSA9IEBwYXJzZUFkZHIoYWRkcjEsIGN1cnNvcilcbiAgICAgICAgZWxzZVxuICAgICAgICAgICMgSWYgbm8gYWRkcjEgaXMgZ2l2ZW4gKCwrMyksIGFzc3VtZSBpdCBpcyAnLidcbiAgICAgICAgICBhZGRyZXNzMSA9IGN1cnNvci5nZXRCdWZmZXJSb3coKVxuICAgICAgICBpZiBvZmYxP1xuICAgICAgICAgIGFkZHJlc3MxICs9IEBwYXJzZU9mZnNldChvZmYxKVxuXG4gICAgICAgIGFkZHJlc3MxID0gMCBpZiBhZGRyZXNzMSBpcyAtMVxuICAgICAgICBhZGRyZXNzMSA9IGxhc3RMaW5lIGlmIGFkZHJlc3MxID4gbGFzdExpbmVcblxuICAgICAgICBpZiBhZGRyZXNzMSA8IDBcbiAgICAgICAgICB0aHJvdyBuZXcgQ29tbWFuZEVycm9yKCdJbnZhbGlkIHJhbmdlJylcblxuICAgICAgICBpZiBhZGRyMj9cbiAgICAgICAgICBhZGRyZXNzMiA9IEBwYXJzZUFkZHIoYWRkcjIsIGN1cnNvcilcbiAgICAgICAgaWYgb2ZmMj9cbiAgICAgICAgICBhZGRyZXNzMiArPSBAcGFyc2VPZmZzZXQob2ZmMilcblxuICAgICAgICBhZGRyZXNzMiA9IDAgaWYgYWRkcmVzczIgaXMgLTFcbiAgICAgICAgYWRkcmVzczIgPSBsYXN0TGluZSBpZiBhZGRyZXNzMiA+IGxhc3RMaW5lXG5cbiAgICAgICAgaWYgYWRkcmVzczIgPCAwXG4gICAgICAgICAgdGhyb3cgbmV3IENvbW1hbmRFcnJvcignSW52YWxpZCByYW5nZScpXG5cbiAgICAgICAgaWYgYWRkcmVzczIgPCBhZGRyZXNzMVxuICAgICAgICAgIHRocm93IG5ldyBDb21tYW5kRXJyb3IoJ0JhY2t3YXJkcyByYW5nZSBnaXZlbicpXG5cbiAgICAgIHJhbmdlID0gW2FkZHJlc3MxLCBpZiBhZGRyZXNzMj8gdGhlbiBhZGRyZXNzMiBlbHNlIGFkZHJlc3MxXVxuICAgIGNsID0gY2xbbWF0Y2g/Lmxlbmd0aC4uXVxuXG4gICAgIyBTdGVwIDU6IExlYWRpbmcgYmxhbmtzIGFyZSBpZ25vcmVkXG4gICAgY2wgPSBjbC50cmltTGVmdCgpXG5cbiAgICAjIFN0ZXAgNmE6IElmIG5vIGNvbW1hbmQgaXMgc3BlY2lmaWVkLCBnbyB0byB0aGUgbGFzdCBzcGVjaWZpZWQgYWRkcmVzc1xuICAgIGlmIGNsLmxlbmd0aCBpcyAwXG4gICAgICBAZWRpdG9yLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uKFtyYW5nZVsxXSwgMF0pXG4gICAgICByZXR1cm5cblxuICAgICMgSWdub3JlIHN0ZXBzIDZiIGFuZCA2YyBzaW5jZSB0aGV5IG9ubHkgbWFrZSBzZW5zZSBmb3IgcHJpbnQgY29tbWFuZHMgYW5kXG4gICAgIyBwcmludCBkb2Vzbid0IG1ha2Ugc2Vuc2VcblxuICAgICMgSWdub3JlIHN0ZXAgN2Egc2luY2UgZmxhZ3MgYXJlIG9ubHkgdXNlZnVsIGZvciBwcmludFxuXG4gICAgIyBTdGVwIDdiOiA6azx2YWxpZCBtYXJrPiBpcyBlcXVhbCB0byA6bWFyayA8dmFsaWQgbWFyaz4gLSBvbmx5IGEtekEtWiBpc1xuICAgICMgaW4gdmltLW1vZGUgZm9yIG5vd1xuICAgIGlmIGNsLmxlbmd0aCBpcyAyIGFuZCBjbFswXSBpcyAnaycgYW5kIC9bYS16XS9pLnRlc3QoY2xbMV0pXG4gICAgICBjb21tYW5kID0gJ21hcmsnXG4gICAgICBhcmdzID0gY2xbMV1cbiAgICBlbHNlIGlmIG5vdCAvW2Etel0vaS50ZXN0KGNsWzBdKVxuICAgICAgY29tbWFuZCA9IGNsWzBdXG4gICAgICBhcmdzID0gY2xbMS4uXVxuICAgIGVsc2VcbiAgICAgIFttLCBjb21tYW5kLCBhcmdzXSA9IGNsLm1hdGNoKC9eKFxcdyspKC4qKS8pXG5cbiAgICAjIElmIHRoZSBjb21tYW5kIG1hdGNoZXMgYW4gZXhpc3Rpbmcgb25lIGV4YWN0bHksIGV4ZWN1dGUgdGhhdCBvbmVcbiAgICB1bmxlc3MgKGZ1bmMgPSBFeC5zaW5nbGV0b24oKVtjb21tYW5kXSk/XG4gICAgICAjIFN0ZXAgODogTWF0Y2ggY29tbWFuZCBhZ2FpbnN0IGV4aXN0aW5nIGNvbW1hbmRzXG4gICAgICBtYXRjaGluZyA9IChuYW1lIGZvciBuYW1lLCB2YWwgb2YgRXguc2luZ2xldG9uKCkgd2hlbiBcXFxuICAgICAgICBuYW1lLmluZGV4T2YoY29tbWFuZCkgaXMgMClcblxuICAgICAgbWF0Y2hpbmcuc29ydCgpXG5cbiAgICAgIGNvbW1hbmQgPSBtYXRjaGluZ1swXVxuXG4gICAgICBmdW5jID0gRXguc2luZ2xldG9uKClbY29tbWFuZF1cblxuICAgIGlmIGZ1bmM/XG4gICAgICBpZiBydW5PdmVyU2VsZWN0aW9uc1xuICAgICAgICBmb3IgaWQsIHNlbGVjdGlvbiBvZiBAc2VsZWN0aW9uc1xuICAgICAgICAgIGJ1ZmZlclJhbmdlID0gc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKClcbiAgICAgICAgICByYW5nZSA9IFtidWZmZXJSYW5nZS5zdGFydC5yb3csIGJ1ZmZlclJhbmdlLmVuZC5yb3ddXG4gICAgICAgICAgZnVuYyh7IHJhbmdlLCBhcmdzLCBAdmltU3RhdGUsIEBleFN0YXRlLCBAZWRpdG9yIH0pXG4gICAgICBlbHNlXG4gICAgICAgIGZ1bmMoeyByYW5nZSwgYXJncywgQHZpbVN0YXRlLCBAZXhTdGF0ZSwgQGVkaXRvciB9KVxuICAgIGVsc2VcbiAgICAgIHRocm93IG5ldyBDb21tYW5kRXJyb3IoXCJOb3QgYW4gZWRpdG9yIGNvbW1hbmQ6ICN7aW5wdXQuY2hhcmFjdGVyc31cIilcblxubW9kdWxlLmV4cG9ydHMgPSBDb21tYW5kXG4iXX0=
