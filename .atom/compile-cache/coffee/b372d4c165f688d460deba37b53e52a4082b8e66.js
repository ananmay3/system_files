(function() {
  var Point, scopeDictionary;

  Point = require('atom').Point;

  scopeDictionary = {
    'cpp': 'c++',
    'c': 'c',
    'source.cpp': 'c++',
    'source.c': 'c',
    'source.objc': 'objective-c',
    'source.objcpp': 'objective-c++',
    'source.c++': 'c++',
    'source.objc++': 'objective-c++'
  };

  module.exports = {
    getFirstScopes: function(editor) {
      return editor.getCursors()[0].getScopeDescriptor().scopes;
    },
    getScopeLang: function(scopes) {
      var i, len, scope;
      for (i = 0, len = scopes.length; i < len; i++) {
        scope = scopes[i];
        if (scope in scopeDictionary) {
          return scopeDictionary[scope];
        }
      }
    },
    prefixAtPosition: function(editor, bufferPosition) {
      var line, ref, regex;
      regex = /\w+$/;
      line = editor.getTextInRange([[bufferPosition.row, 0], bufferPosition]);
      return ((ref = line.match(regex)) != null ? ref[0] : void 0) || '';
    },
    nearestSymbolPosition: function(editor, bufferPosition) {
      var line, matches, regex, symbol, symbolColumn;
      regex = /(\W+)\w*$/;
      line = editor.getTextInRange([[bufferPosition.row, 0], bufferPosition]);
      matches = line.match(regex);
      if (matches) {
        symbol = matches[1];
        symbolColumn = matches[0].indexOf(symbol) + symbol.length + (line.length - matches[0].length);
        return [new Point(bufferPosition.row, symbolColumn), symbol.slice(-1)];
      } else {
        return [bufferPosition, ''];
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvYW5hbm1heTMvLmF0b20vcGFja2FnZXMvYXV0b2NvbXBsZXRlLWNsYW5nL2xpYi9jb21tb24tdXRpbC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFDLFFBQVMsT0FBQSxDQUFRLE1BQVI7O0VBRVYsZUFBQSxHQUFrQjtJQUNoQixLQUFBLEVBQWtCLEtBREY7SUFFaEIsR0FBQSxFQUFrQixHQUZGO0lBR2hCLFlBQUEsRUFBa0IsS0FIRjtJQUloQixVQUFBLEVBQWtCLEdBSkY7SUFLaEIsYUFBQSxFQUFrQixhQUxGO0lBTWhCLGVBQUEsRUFBa0IsZUFORjtJQVNoQixZQUFBLEVBQWtCLEtBVEY7SUFVaEIsZUFBQSxFQUFrQixlQVZGOzs7RUFhbEIsTUFBTSxDQUFDLE9BQVAsR0FDRTtJQUFBLGNBQUEsRUFBZ0IsU0FBQyxNQUFEO2FBQ2QsTUFBTSxDQUFDLFVBQVAsQ0FBQSxDQUFvQixDQUFBLENBQUEsQ0FBRSxDQUFDLGtCQUF2QixDQUFBLENBQTJDLENBQUM7SUFEOUIsQ0FBaEI7SUFHQSxZQUFBLEVBQWMsU0FBQyxNQUFEO0FBQ1osVUFBQTtBQUFBLFdBQUEsd0NBQUE7O1FBQ0UsSUFBaUMsS0FBQSxJQUFTLGVBQTFDO0FBQUEsaUJBQU8sZUFBZ0IsQ0FBQSxLQUFBLEVBQXZCOztBQURGO0lBRFksQ0FIZDtJQU9BLGdCQUFBLEVBQWtCLFNBQUMsTUFBRCxFQUFTLGNBQVQ7QUFDaEIsVUFBQTtNQUFBLEtBQUEsR0FBUTtNQUNSLElBQUEsR0FBTyxNQUFNLENBQUMsY0FBUCxDQUFzQixDQUFDLENBQUMsY0FBYyxDQUFDLEdBQWhCLEVBQXFCLENBQXJCLENBQUQsRUFBMEIsY0FBMUIsQ0FBdEI7cURBQ1ksQ0FBQSxDQUFBLFdBQW5CLElBQXlCO0lBSFQsQ0FQbEI7SUFZQSxxQkFBQSxFQUF1QixTQUFDLE1BQUQsRUFBUyxjQUFUO0FBQ3JCLFVBQUE7TUFBQSxLQUFBLEdBQVE7TUFDUixJQUFBLEdBQU8sTUFBTSxDQUFDLGNBQVAsQ0FBc0IsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxHQUFoQixFQUFxQixDQUFyQixDQUFELEVBQTBCLGNBQTFCLENBQXRCO01BQ1AsT0FBQSxHQUFVLElBQUksQ0FBQyxLQUFMLENBQVcsS0FBWDtNQUNWLElBQUcsT0FBSDtRQUNFLE1BQUEsR0FBUyxPQUFRLENBQUEsQ0FBQTtRQUNqQixZQUFBLEdBQWUsT0FBUSxDQUFBLENBQUEsQ0FBRSxDQUFDLE9BQVgsQ0FBbUIsTUFBbkIsQ0FBQSxHQUE2QixNQUFNLENBQUMsTUFBcEMsR0FBNkMsQ0FBQyxJQUFJLENBQUMsTUFBTCxHQUFjLE9BQVEsQ0FBQSxDQUFBLENBQUUsQ0FBQyxNQUExQjtlQUM1RCxDQUFDLElBQUksS0FBSixDQUFVLGNBQWMsQ0FBQyxHQUF6QixFQUE4QixZQUE5QixDQUFELEVBQTZDLE1BQU8sVUFBcEQsRUFIRjtPQUFBLE1BQUE7ZUFLRSxDQUFDLGNBQUQsRUFBZ0IsRUFBaEIsRUFMRjs7SUFKcUIsQ0FadkI7O0FBaEJGIiwic291cmNlc0NvbnRlbnQiOlsie1BvaW50fSA9IHJlcXVpcmUgJ2F0b20nXG5cbnNjb3BlRGljdGlvbmFyeSA9IHtcbiAgJ2NwcCcgICAgICAgICAgIDogJ2MrKydcbiAgJ2MnICAgICAgICAgICAgIDogJ2MnICxcbiAgJ3NvdXJjZS5jcHAnICAgIDogJ2MrKycgLFxuICAnc291cmNlLmMnICAgICAgOiAnYycgLFxuICAnc291cmNlLm9iamMnICAgOiAnb2JqZWN0aXZlLWMnICxcbiAgJ3NvdXJjZS5vYmpjcHAnIDogJ29iamVjdGl2ZS1jKysnICxcblxuICAjIEZvciBiYWNrd2FyZC1jb21wYXRpYmlsaXR5IHdpdGggdmVyc2lvbnMgb2YgQXRvbSA8IDAuMTY2XG4gICdzb3VyY2UuYysrJyAgICA6ICdjKysnICxcbiAgJ3NvdXJjZS5vYmpjKysnIDogJ29iamVjdGl2ZS1jKysnICxcbn1cblxubW9kdWxlLmV4cG9ydHMgPVxuICBnZXRGaXJzdFNjb3BlczogKGVkaXRvcikgLT5cbiAgICBlZGl0b3IuZ2V0Q3Vyc29ycygpWzBdLmdldFNjb3BlRGVzY3JpcHRvcigpLnNjb3Blc1xuXG4gIGdldFNjb3BlTGFuZzogKHNjb3BlcykgLT5cbiAgICBmb3Igc2NvcGUgaW4gc2NvcGVzXG4gICAgICByZXR1cm4gc2NvcGVEaWN0aW9uYXJ5W3Njb3BlXSBpZiBzY29wZSBvZiBzY29wZURpY3Rpb25hcnlcblxuICBwcmVmaXhBdFBvc2l0aW9uOiAoZWRpdG9yLCBidWZmZXJQb3NpdGlvbikgLT5cbiAgICByZWdleCA9IC9cXHcrJC9cbiAgICBsaW5lID0gZWRpdG9yLmdldFRleHRJblJhbmdlKFtbYnVmZmVyUG9zaXRpb24ucm93LCAwXSwgYnVmZmVyUG9zaXRpb25dKVxuICAgIGxpbmUubWF0Y2gocmVnZXgpP1swXSBvciAnJ1xuXG4gIG5lYXJlc3RTeW1ib2xQb3NpdGlvbjogKGVkaXRvciwgYnVmZmVyUG9zaXRpb24pIC0+XG4gICAgcmVnZXggPSAvKFxcVyspXFx3KiQvXG4gICAgbGluZSA9IGVkaXRvci5nZXRUZXh0SW5SYW5nZShbW2J1ZmZlclBvc2l0aW9uLnJvdywgMF0sIGJ1ZmZlclBvc2l0aW9uXSlcbiAgICBtYXRjaGVzID0gbGluZS5tYXRjaChyZWdleClcbiAgICBpZiBtYXRjaGVzXG4gICAgICBzeW1ib2wgPSBtYXRjaGVzWzFdXG4gICAgICBzeW1ib2xDb2x1bW4gPSBtYXRjaGVzWzBdLmluZGV4T2Yoc3ltYm9sKSArIHN5bWJvbC5sZW5ndGggKyAobGluZS5sZW5ndGggLSBtYXRjaGVzWzBdLmxlbmd0aClcbiAgICAgIFtuZXcgUG9pbnQoYnVmZmVyUG9zaXRpb24ucm93LCBzeW1ib2xDb2x1bW4pLHN5bWJvbFstMS4uXV1cbiAgICBlbHNlXG4gICAgICBbYnVmZmVyUG9zaXRpb24sJyddXG4iXX0=
