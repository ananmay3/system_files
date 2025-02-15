Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.provider = provider;
exports.suggestionsList = suggestionsList;
exports.suggestionsShow = suggestionsShow;

function provider(entry) {
  var message = undefined;
  if (!entry || typeof entry !== 'object') {
    message = 'Invalid provider provided';
  } else if (!Array.isArray(entry.grammarScopes)) {
    message = 'Invalid or no grammarScopes found on provider';
  } else if (typeof entry.getIntentions !== 'function') {
    message = 'Invalid or no getIntentions found on provider';
  }
  if (message) {
    console.log('[Intentions] Invalid provider', entry);
    throw new Error(message);
  }
}

function suggestionsList(suggestions) {
  if (Array.isArray(suggestions)) {
    var suggestionsLength = suggestions.length;
    for (var i = 0; i < suggestionsLength; ++i) {
      var suggestion = suggestions[i];
      var message = undefined;
      if (typeof suggestion.title !== 'string') {
        message = 'Invalid or no title found on intention';
      } else if (typeof suggestion.selected !== 'function') {
        message = 'Invalid or no selected found on intention';
      }
      if (message) {
        console.log('[Intentions] Invalid suggestion of type list', suggestion);
        throw new Error(message);
      }
    }
  }
  return suggestions;
}

function suggestionsShow(suggestions) {
  if (Array.isArray(suggestions)) {
    var suggestionsLength = suggestions.length;
    for (var i = 0; i < suggestionsLength; ++i) {
      var suggestion = suggestions[i];
      var message = undefined;
      if (typeof suggestion.range !== 'object' || !suggestion.range) {
        message = 'Invalid or no range found on intention';
      } else if (suggestion['class'] && typeof suggestion['class'] !== 'string') {
        message = 'Invalid class found on intention';
      } else if (typeof suggestion.created !== 'function') {
        message = 'Invalid or no created found on intention';
      }
      if (message) {
        console.log('[Intentions] Invalid suggestion of type show', suggestion);
        throw new Error(message);
      }
    }
  }
  return suggestions;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2FuYW5tYXkzLy5hdG9tL3BhY2thZ2VzL2ludGVudGlvbnMvbGliL3ZhbGlkYXRlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFJTyxTQUFTLFFBQVEsQ0FBQyxLQUF1QyxFQUFFO0FBQ2hFLE1BQUksT0FBTyxZQUFBLENBQUE7QUFDWCxNQUFJLENBQUMsS0FBSyxJQUFJLE9BQU8sS0FBSyxLQUFLLFFBQVEsRUFBRTtBQUN2QyxXQUFPLEdBQUcsMkJBQTJCLENBQUE7R0FDdEMsTUFBTSxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLEVBQUU7QUFDOUMsV0FBTyxHQUFHLCtDQUErQyxDQUFBO0dBQzFELE1BQU0sSUFBSSxPQUFPLEtBQUssQ0FBQyxhQUFhLEtBQUssVUFBVSxFQUFFO0FBQ3BELFdBQU8sR0FBRywrQ0FBK0MsQ0FBQTtHQUMxRDtBQUNELE1BQUksT0FBTyxFQUFFO0FBQ1gsV0FBTyxDQUFDLEdBQUcsQ0FBQywrQkFBK0IsRUFBRSxLQUFLLENBQUMsQ0FBQTtBQUNuRCxVQUFNLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFBO0dBQ3pCO0NBQ0Y7O0FBRU0sU0FBUyxlQUFlLENBQUMsV0FBNEIsRUFBbUI7QUFDN0UsTUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxFQUFFO0FBQzlCLFFBQU0saUJBQWlCLEdBQUcsV0FBVyxDQUFDLE1BQU0sQ0FBQTtBQUM1QyxTQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsaUJBQWlCLEVBQUUsRUFBRSxDQUFDLEVBQUU7QUFDMUMsVUFBTSxVQUFVLEdBQUcsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFBO0FBQ2pDLFVBQUksT0FBTyxZQUFBLENBQUE7QUFDWCxVQUFJLE9BQU8sVUFBVSxDQUFDLEtBQUssS0FBSyxRQUFRLEVBQUU7QUFDeEMsZUFBTyxHQUFHLHdDQUF3QyxDQUFBO09BQ25ELE1BQU0sSUFBSSxPQUFPLFVBQVUsQ0FBQyxRQUFRLEtBQUssVUFBVSxFQUFFO0FBQ3BELGVBQU8sR0FBRywyQ0FBMkMsQ0FBQTtPQUN0RDtBQUNELFVBQUksT0FBTyxFQUFFO0FBQ1gsZUFBTyxDQUFDLEdBQUcsQ0FBQyw4Q0FBOEMsRUFBRSxVQUFVLENBQUMsQ0FBQTtBQUN2RSxjQUFNLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFBO09BQ3pCO0tBQ0Y7R0FDRjtBQUNELFNBQU8sV0FBVyxDQUFBO0NBQ25COztBQUVNLFNBQVMsZUFBZSxDQUFDLFdBQWlDLEVBQXdCO0FBQ3ZGLE1BQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsRUFBRTtBQUM5QixRQUFNLGlCQUFpQixHQUFHLFdBQVcsQ0FBQyxNQUFNLENBQUE7QUFDNUMsU0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLGlCQUFpQixFQUFFLEVBQUUsQ0FBQyxFQUFFO0FBQzFDLFVBQU0sVUFBVSxHQUFHLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQTtBQUNqQyxVQUFJLE9BQU8sWUFBQSxDQUFBO0FBQ1gsVUFBSSxPQUFPLFVBQVUsQ0FBQyxLQUFLLEtBQUssUUFBUSxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRTtBQUM3RCxlQUFPLEdBQUcsd0NBQXdDLENBQUE7T0FDbkQsTUFBTSxJQUFJLFVBQVUsU0FBTSxJQUFJLE9BQU8sVUFBVSxTQUFNLEtBQUssUUFBUSxFQUFFO0FBQ25FLGVBQU8sR0FBRyxrQ0FBa0MsQ0FBQTtPQUM3QyxNQUFNLElBQUksT0FBTyxVQUFVLENBQUMsT0FBTyxLQUFLLFVBQVUsRUFBRTtBQUNuRCxlQUFPLEdBQUcsMENBQTBDLENBQUE7T0FDckQ7QUFDRCxVQUFJLE9BQU8sRUFBRTtBQUNYLGVBQU8sQ0FBQyxHQUFHLENBQUMsOENBQThDLEVBQUUsVUFBVSxDQUFDLENBQUE7QUFDdkUsY0FBTSxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQTtPQUN6QjtLQUNGO0dBQ0Y7QUFDRCxTQUFPLFdBQVcsQ0FBQTtDQUNuQiIsImZpbGUiOiIvaG9tZS9hbmFubWF5My8uYXRvbS9wYWNrYWdlcy9pbnRlbnRpb25zL2xpYi92YWxpZGF0ZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIEBmbG93ICovXG5cbmltcG9ydCB0eXBlIHsgTGlzdFByb3ZpZGVyLCBMaXN0SXRlbSwgSGlnaGxpZ2h0UHJvdmlkZXIsIEhpZ2hsaWdodEl0ZW0gfSBmcm9tICcuL3R5cGVzJ1xuXG5leHBvcnQgZnVuY3Rpb24gcHJvdmlkZXIoZW50cnk6IExpc3RQcm92aWRlciB8IEhpZ2hsaWdodFByb3ZpZGVyKSB7XG4gIGxldCBtZXNzYWdlXG4gIGlmICghZW50cnkgfHwgdHlwZW9mIGVudHJ5ICE9PSAnb2JqZWN0Jykge1xuICAgIG1lc3NhZ2UgPSAnSW52YWxpZCBwcm92aWRlciBwcm92aWRlZCdcbiAgfSBlbHNlIGlmICghQXJyYXkuaXNBcnJheShlbnRyeS5ncmFtbWFyU2NvcGVzKSkge1xuICAgIG1lc3NhZ2UgPSAnSW52YWxpZCBvciBubyBncmFtbWFyU2NvcGVzIGZvdW5kIG9uIHByb3ZpZGVyJ1xuICB9IGVsc2UgaWYgKHR5cGVvZiBlbnRyeS5nZXRJbnRlbnRpb25zICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgbWVzc2FnZSA9ICdJbnZhbGlkIG9yIG5vIGdldEludGVudGlvbnMgZm91bmQgb24gcHJvdmlkZXInXG4gIH1cbiAgaWYgKG1lc3NhZ2UpIHtcbiAgICBjb25zb2xlLmxvZygnW0ludGVudGlvbnNdIEludmFsaWQgcHJvdmlkZXInLCBlbnRyeSlcbiAgICB0aHJvdyBuZXcgRXJyb3IobWVzc2FnZSlcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc3VnZ2VzdGlvbnNMaXN0KHN1Z2dlc3Rpb25zOiBBcnJheTxMaXN0SXRlbT4pOiBBcnJheTxMaXN0SXRlbT4ge1xuICBpZiAoQXJyYXkuaXNBcnJheShzdWdnZXN0aW9ucykpIHtcbiAgICBjb25zdCBzdWdnZXN0aW9uc0xlbmd0aCA9IHN1Z2dlc3Rpb25zLmxlbmd0aFxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc3VnZ2VzdGlvbnNMZW5ndGg7ICsraSkge1xuICAgICAgY29uc3Qgc3VnZ2VzdGlvbiA9IHN1Z2dlc3Rpb25zW2ldXG4gICAgICBsZXQgbWVzc2FnZVxuICAgICAgaWYgKHR5cGVvZiBzdWdnZXN0aW9uLnRpdGxlICE9PSAnc3RyaW5nJykge1xuICAgICAgICBtZXNzYWdlID0gJ0ludmFsaWQgb3Igbm8gdGl0bGUgZm91bmQgb24gaW50ZW50aW9uJ1xuICAgICAgfSBlbHNlIGlmICh0eXBlb2Ygc3VnZ2VzdGlvbi5zZWxlY3RlZCAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBtZXNzYWdlID0gJ0ludmFsaWQgb3Igbm8gc2VsZWN0ZWQgZm91bmQgb24gaW50ZW50aW9uJ1xuICAgICAgfVxuICAgICAgaWYgKG1lc3NhZ2UpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ1tJbnRlbnRpb25zXSBJbnZhbGlkIHN1Z2dlc3Rpb24gb2YgdHlwZSBsaXN0Jywgc3VnZ2VzdGlvbilcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKG1lc3NhZ2UpXG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiBzdWdnZXN0aW9uc1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc3VnZ2VzdGlvbnNTaG93KHN1Z2dlc3Rpb25zOiBBcnJheTxIaWdobGlnaHRJdGVtPik6IEFycmF5PEhpZ2hsaWdodEl0ZW0+IHtcbiAgaWYgKEFycmF5LmlzQXJyYXkoc3VnZ2VzdGlvbnMpKSB7XG4gICAgY29uc3Qgc3VnZ2VzdGlvbnNMZW5ndGggPSBzdWdnZXN0aW9ucy5sZW5ndGhcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHN1Z2dlc3Rpb25zTGVuZ3RoOyArK2kpIHtcbiAgICAgIGNvbnN0IHN1Z2dlc3Rpb24gPSBzdWdnZXN0aW9uc1tpXVxuICAgICAgbGV0IG1lc3NhZ2VcbiAgICAgIGlmICh0eXBlb2Ygc3VnZ2VzdGlvbi5yYW5nZSAhPT0gJ29iamVjdCcgfHwgIXN1Z2dlc3Rpb24ucmFuZ2UpIHtcbiAgICAgICAgbWVzc2FnZSA9ICdJbnZhbGlkIG9yIG5vIHJhbmdlIGZvdW5kIG9uIGludGVudGlvbidcbiAgICAgIH0gZWxzZSBpZiAoc3VnZ2VzdGlvbi5jbGFzcyAmJiB0eXBlb2Ygc3VnZ2VzdGlvbi5jbGFzcyAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgbWVzc2FnZSA9ICdJbnZhbGlkIGNsYXNzIGZvdW5kIG9uIGludGVudGlvbidcbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHN1Z2dlc3Rpb24uY3JlYXRlZCAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBtZXNzYWdlID0gJ0ludmFsaWQgb3Igbm8gY3JlYXRlZCBmb3VuZCBvbiBpbnRlbnRpb24nXG4gICAgICB9XG4gICAgICBpZiAobWVzc2FnZSkge1xuICAgICAgICBjb25zb2xlLmxvZygnW0ludGVudGlvbnNdIEludmFsaWQgc3VnZ2VzdGlvbiBvZiB0eXBlIHNob3cnLCBzdWdnZXN0aW9uKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IobWVzc2FnZSlcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIHN1Z2dlc3Rpb25zXG59XG4iXX0=