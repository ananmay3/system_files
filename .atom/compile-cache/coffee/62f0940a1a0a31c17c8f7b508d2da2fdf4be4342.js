(function() {
  var defaultPrecompiled;

  defaultPrecompiled = require('./default-precompiled');

  module.exports = {
    clangCommand: {
      type: 'string',
      "default": 'clang'
    },
    includePaths: {
      type: 'array',
      "default": ['.'],
      items: {
        type: 'string'
      }
    },
    pchFilePrefix: {
      type: 'string',
      "default": '.stdafx'
    },
    ignoreClangErrors: {
      type: 'boolean',
      "default": true
    },
    includeDocumentation: {
      type: 'boolean',
      "default": true
    },
    includeSystemHeadersDocumentation: {
      type: 'boolean',
      "default": false,
      description: "**WARNING**: if there are any PCHs compiled without this option," + "you will have to delete them and generate them again"
    },
    includeNonDoxygenCommentsAsDocumentation: {
      type: 'boolean',
      "default": false
    },
    "std c++": {
      type: 'string',
      "default": "c++14"
    },
    "std c": {
      type: 'string',
      "default": "c99"
    },
    "preCompiledHeaders c++": {
      type: 'array',
      "default": defaultPrecompiled.cpp,
      item: {
        type: 'string'
      }
    },
    "preCompiledHeaders c": {
      type: 'array',
      "default": defaultPrecompiled.c,
      items: {
        type: 'string'
      }
    },
    "preCompiledHeaders objective-c": {
      type: 'array',
      "default": defaultPrecompiled.objc,
      items: {
        type: 'string'
      }
    },
    "preCompiledHeaders objective-c++": {
      type: 'array',
      "default": defaultPrecompiled.objcpp,
      items: {
        type: 'string'
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvYW5hbm1heTMvLmF0b20vcGFja2FnZXMvYXV0b2NvbXBsZXRlLWNsYW5nL2xpYi9jb25maWd1cmF0aW9ucy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLGtCQUFBLEdBQXFCLE9BQUEsQ0FBUSx1QkFBUjs7RUFFckIsTUFBTSxDQUFDLE9BQVAsR0FDRTtJQUFBLFlBQUEsRUFDRTtNQUFBLElBQUEsRUFBTSxRQUFOO01BQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxPQURUO0tBREY7SUFHQSxZQUFBLEVBQ0U7TUFBQSxJQUFBLEVBQU0sT0FBTjtNQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsQ0FBQyxHQUFELENBRFQ7TUFFQSxLQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sUUFBTjtPQUhGO0tBSkY7SUFRQSxhQUFBLEVBQ0U7TUFBQSxJQUFBLEVBQU0sUUFBTjtNQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsU0FEVDtLQVRGO0lBV0EsaUJBQUEsRUFDRTtNQUFBLElBQUEsRUFBTSxTQUFOO01BQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxJQURUO0tBWkY7SUFjQSxvQkFBQSxFQUNFO01BQUEsSUFBQSxFQUFNLFNBQU47TUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLElBRFQ7S0FmRjtJQWlCQSxpQ0FBQSxFQUNFO01BQUEsSUFBQSxFQUFNLFNBQU47TUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEtBRFQ7TUFFQSxXQUFBLEVBQ0Usa0VBQUEsR0FDQSxzREFKRjtLQWxCRjtJQXVCQSx3Q0FBQSxFQUNFO01BQUEsSUFBQSxFQUFNLFNBQU47TUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEtBRFQ7S0F4QkY7SUEwQkEsU0FBQSxFQUNFO01BQUEsSUFBQSxFQUFNLFFBQU47TUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLE9BRFQ7S0EzQkY7SUE2QkEsT0FBQSxFQUNFO01BQUEsSUFBQSxFQUFNLFFBQU47TUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEtBRFQ7S0E5QkY7SUFnQ0Esd0JBQUEsRUFDRTtNQUFBLElBQUEsRUFBTSxPQUFOO01BQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxrQkFBa0IsQ0FBQyxHQUQ1QjtNQUVBLElBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxRQUFOO09BSEY7S0FqQ0Y7SUFxQ0Esc0JBQUEsRUFDRTtNQUFBLElBQUEsRUFBTSxPQUFOO01BQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxrQkFBa0IsQ0FBQyxDQUQ1QjtNQUVBLEtBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxRQUFOO09BSEY7S0F0Q0Y7SUEwQ0EsZ0NBQUEsRUFDRTtNQUFBLElBQUEsRUFBTSxPQUFOO01BQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxrQkFBa0IsQ0FBQyxJQUQ1QjtNQUVBLEtBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxRQUFOO09BSEY7S0EzQ0Y7SUErQ0Esa0NBQUEsRUFDRTtNQUFBLElBQUEsRUFBTSxPQUFOO01BQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxrQkFBa0IsQ0FBQyxNQUQ1QjtNQUVBLEtBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxRQUFOO09BSEY7S0FoREY7O0FBSEYiLCJzb3VyY2VzQ29udGVudCI6WyJkZWZhdWx0UHJlY29tcGlsZWQgPSByZXF1aXJlICcuL2RlZmF1bHQtcHJlY29tcGlsZWQnXG5cbm1vZHVsZS5leHBvcnRzID1cbiAgY2xhbmdDb21tYW5kOlxuICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgZGVmYXVsdDogJ2NsYW5nJ1xuICBpbmNsdWRlUGF0aHM6XG4gICAgdHlwZTogJ2FycmF5J1xuICAgIGRlZmF1bHQ6IFsnLiddXG4gICAgaXRlbXM6XG4gICAgICB0eXBlOiAnc3RyaW5nJ1xuICBwY2hGaWxlUHJlZml4OlxuICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgZGVmYXVsdDogJy5zdGRhZngnXG4gIGlnbm9yZUNsYW5nRXJyb3JzOlxuICAgIHR5cGU6ICdib29sZWFuJ1xuICAgIGRlZmF1bHQ6IHRydWVcbiAgaW5jbHVkZURvY3VtZW50YXRpb246XG4gICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgZGVmYXVsdDogdHJ1ZVxuICBpbmNsdWRlU3lzdGVtSGVhZGVyc0RvY3VtZW50YXRpb246XG4gICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgZGVmYXVsdDogZmFsc2VcbiAgICBkZXNjcmlwdGlvbjpcbiAgICAgIFwiKipXQVJOSU5HKio6IGlmIHRoZXJlIGFyZSBhbnkgUENIcyBjb21waWxlZCB3aXRob3V0IHRoaXMgb3B0aW9uLFwiK1xuICAgICAgXCJ5b3Ugd2lsbCBoYXZlIHRvIGRlbGV0ZSB0aGVtIGFuZCBnZW5lcmF0ZSB0aGVtIGFnYWluXCJcbiAgaW5jbHVkZU5vbkRveHlnZW5Db21tZW50c0FzRG9jdW1lbnRhdGlvbjpcbiAgICB0eXBlOiAnYm9vbGVhbidcbiAgICBkZWZhdWx0OiBmYWxzZVxuICBcInN0ZCBjKytcIjpcbiAgICB0eXBlOiAnc3RyaW5nJ1xuICAgIGRlZmF1bHQ6IFwiYysrMTRcIlxuICBcInN0ZCBjXCI6XG4gICAgdHlwZTogJ3N0cmluZydcbiAgICBkZWZhdWx0OiBcImM5OVwiXG4gIFwicHJlQ29tcGlsZWRIZWFkZXJzIGMrK1wiOlxuICAgIHR5cGU6ICdhcnJheSdcbiAgICBkZWZhdWx0OiBkZWZhdWx0UHJlY29tcGlsZWQuY3BwXG4gICAgaXRlbTpcbiAgICAgIHR5cGU6ICdzdHJpbmcnXG4gIFwicHJlQ29tcGlsZWRIZWFkZXJzIGNcIjpcbiAgICB0eXBlOiAnYXJyYXknXG4gICAgZGVmYXVsdDogZGVmYXVsdFByZWNvbXBpbGVkLmNcbiAgICBpdGVtczpcbiAgICAgIHR5cGU6ICdzdHJpbmcnXG4gIFwicHJlQ29tcGlsZWRIZWFkZXJzIG9iamVjdGl2ZS1jXCI6XG4gICAgdHlwZTogJ2FycmF5J1xuICAgIGRlZmF1bHQ6IGRlZmF1bHRQcmVjb21waWxlZC5vYmpjXG4gICAgaXRlbXM6XG4gICAgICB0eXBlOiAnc3RyaW5nJ1xuICBcInByZUNvbXBpbGVkSGVhZGVycyBvYmplY3RpdmUtYysrXCI6XG4gICAgdHlwZTogJ2FycmF5J1xuICAgIGRlZmF1bHQ6IGRlZmF1bHRQcmVjb21waWxlZC5vYmpjcHBcbiAgICBpdGVtczpcbiAgICAgIHR5cGU6ICdzdHJpbmcnXG4iXX0=
