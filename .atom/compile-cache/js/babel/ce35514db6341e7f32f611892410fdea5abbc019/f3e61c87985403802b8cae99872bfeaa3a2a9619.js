'use babel';

Object.defineProperty(exports, '__esModule', {
  value: true
});
var cleanJsonString = function cleanJsonString(jsonstring) {
  // http://stackoverflow.com/questions/14432165/uncaught-syntaxerror-unexpected-token-with-json-parse

  if (jsonstring === null) return '';

  // preserve newlines, etc - use valid JSON
  jsonstring = jsonstring.replace(/\\n/g, "\\n").replace(/\\'/g, "\\'").replace(/\\"/g, '\\"').replace(/\\&/g, "\\&").replace(/\\r/g, "\\r").replace(/\\t/g, "\\t").replace(/\\b/g, "\\b").replace(/\\f/g, "\\f");
  // remove non-printable and other non-valid JSON chars
  jsonstring = jsonstring.replace(/[\u0000-\u001F]+/g, '');

  return jsonstring;
};

exports.cleanJsonString = cleanJsonString;
var basename = function basename(path) {
  var sep = arguments.length <= 1 || arguments[1] === undefined ? '/' : arguments[1];

  return trailingslashit(path, sep).split(sep).pop();
};

exports.basename = basename;
var dirname = function dirname(path) {
  var sep = arguments.length <= 1 || arguments[1] === undefined ? '/' : arguments[1];

  var arrPath = trailingslashit(path, sep).split(sep);
  arrPath.pop();
  return untrailingslashit(arrPath.join(sep), sep);
};

exports.dirname = dirname;
var trailingslashit = function trailingslashit(path) {
  var sep = arguments.length <= 1 || arguments[1] === undefined ? '/' : arguments[1];

  if (sep == '/') {
    if (path == '/') return path;
    return path.replace(/\/$/, '');
  } else {
    if (path == '\\') return path;
    return path.replace(/\\$/, '');
  }
};

exports.trailingslashit = trailingslashit;
var untrailingslashit = function untrailingslashit(path) {
  var sep = arguments.length <= 1 || arguments[1] === undefined ? '/' : arguments[1];

  path = trailingslashit(path, sep);
  return path + sep;
};

exports.untrailingslashit = untrailingslashit;
var leadingslashit = function leadingslashit(path) {
  var sep = arguments.length <= 1 || arguments[1] === undefined ? '/' : arguments[1];

  if (sep == '/') {
    if (path == '/') return path;
    return path.replace(/^\/+/, '');
  } else {
    if (path == '\\') return path;
    return path.replace(/^\\/, '');
  }
};

exports.leadingslashit = leadingslashit;
var unleadingslashit = function unleadingslashit(path) {
  var sep = arguments.length <= 1 || arguments[1] === undefined ? '/' : arguments[1];

  path = leadingslashit(path, sep);
  return sep + path;
};

exports.unleadingslashit = unleadingslashit;
var normalize = function normalize(path) {
  var sep = arguments.length <= 1 || arguments[1] === undefined ? '/' : arguments[1];

  if (!path) return '';
  path = path.trim();

  if (sep == '/') {
    if (path == '/') return path;
    return path.replace(/\\+/g, "/").replace(/\/+/g, "/").split('/').map(function (item) {
      return item.trim();
    }).join('/');
  } else {
    if (path == '\\') return path;
    return path.replace(/\/+/g, "\\").replace(/\\+/g, "\\").split('\\').map(function (item) {
      return item.trim();
    }).join('\\');
  }
};

exports.normalize = normalize;
var formatNumber = function formatNumber(num) {
  return String(num).replace(/(.)(?=(\d{3})+$)/g, '$1.');
};
exports.formatNumber = formatNumber;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2FuYW5tYXlqYWluLy5hdG9tL3BhY2thZ2VzL2Z0cC1yZW1vdGUtZWRpdC9saWIvaGVscGVyL2Zvcm1hdC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxXQUFXLENBQUM7Ozs7O0FBRUwsSUFBTSxlQUFlLEdBQUcsU0FBbEIsZUFBZSxDQUFJLFVBQVUsRUFBSzs7O0FBRzdDLE1BQUksVUFBVSxLQUFLLElBQUksRUFBRSxPQUFPLEVBQUUsQ0FBQzs7O0FBR25DLFlBQVUsR0FBRyxVQUFVLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsQ0FDM0MsT0FBTyxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsQ0FDdEIsT0FBTyxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsQ0FDdEIsT0FBTyxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsQ0FDdEIsT0FBTyxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsQ0FDdEIsT0FBTyxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsQ0FDdEIsT0FBTyxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsQ0FDdEIsT0FBTyxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsQ0FBQzs7QUFFMUIsWUFBVSxHQUFHLFVBQVUsQ0FBQyxPQUFPLENBQUMsbUJBQW1CLEVBQUUsRUFBRSxDQUFDLENBQUM7O0FBRXpELFNBQU8sVUFBVSxDQUFDO0NBQ25CLENBQUE7OztBQUVNLElBQU0sUUFBUSxHQUFHLFNBQVgsUUFBUSxDQUFJLElBQUksRUFBZ0I7TUFBZCxHQUFHLHlEQUFHLEdBQUc7O0FBQ3RDLFNBQU8sZUFBZSxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUM7Q0FDcEQsQ0FBQTs7O0FBRU0sSUFBTSxPQUFPLEdBQUcsU0FBVixPQUFPLENBQUksSUFBSSxFQUFnQjtNQUFkLEdBQUcseURBQUcsR0FBRzs7QUFDckMsTUFBSSxPQUFPLEdB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QUMsVUFBQyxJQUFJLEVBQUs7QUFDaEYsYUFBTyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7S0FDcEIsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztHQUNmO0NBQ0YsQ0FBQTs7O0FBRU0sSUFBTSxZQUFZLEdBQUcsU0FBZixZQUFZLENBQUksR0FBRyxFQUFLO0FBQ25DLFNBQU8sTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxtQkFBbUIsRUFBRSxLQUFLLENBQUMsQ0FBQztDQUN4RCxDQUFBIiwiZmlsZSI6Ii9ob21lL2FuYW5tYXlqYWluLy5hdG9tL3BhY2thZ2VzL2Z0cC1yZW1vdGUtZWRpdC9saWIvaGVscGVyL2Zvcm1hdC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG5leHBvcnQgY29uc3QgY2xlYW5Kc29uU3RyaW5nID0gKGpzb25zdHJpbmcpID0+IHtcbiAgLy8gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8xNDQzMjE2NS91bmNhdWdodC1zeW50YXhlcnJvci11bmV4cGVjdGVkLXRva2VuLXdpdGgtanNvbi1wYXJzZVxuXG4gIGlmIChqc29uc3RyaW5nID09PSBudWxsKSByZXR1cm4gJyc7XG5cbiAgLy8gcHJlc2VydmUgbmV3bGluZXMsIGV0YyAtIHVzZSB2YWxpZCBKU09OXG4gIGpzb25zdHJpbmcgPSBqc29uc3RyaW5nLnJlcGxhY2UoL1xcXFxuL2csIFwiXFxcXG5cIilcbiAgICAucmVwbGFjZSgvXFxcXCcvZywgXCJcXFxcJ1wiKVxuICAgIC5yZXBsYWNlKC9cXFxcXCIvZywgJ1xcXFxcIicpXG4gICAgLnJlcGxhY2UoL1xcXFwmL2csIFwiXFxcXCZcIilcbiAgICAucmVwbGFjZSgvXFxcXHIvZywgXCJcXFxcclwiKVxuICAgIC5yZXBsYWNlKC9cXFxcdC9nLCBcIlxcXFx0XCIpXG4gICAgLnJlcGxhY2UoL1xcXFxiL2csIFwiXFxcXGJcIilcbiAgICAucmVwbGFjZSgvXFxcXGYvZywgXCJcXFxcZlwiKTtcbiAgLy8gcmVtb3ZlIG5vbi1wcmludGFibGUgYW5kIG90aGVyIG5vbi12YWxpZCBKU09OIGNoYXJzXG4gIGpzb25zdHJpbmcgPSBqc29uc3RyaW5nLnJlcGxhY2UoL1tcXHUwMDAwLVxcdTAwMUZdKy9nLCAnJyk7XG5cbiAgcmV0dXJuIGpzb25zdHJpbmc7XG59XG5cbmV4cG9ydCBjb25zdCBiYXNlbmFtZSA9IChwYXRoLCBzZXAgPSAnLycpID0+IHtcbiAgcmV0dXJuIHRyYWlsaW5nc2xhc2hpdChwYXRoLCBzZXApLnNwbGl0KHNlcCkucG9wKCk7XG59XG5cbmV4cG9ydCBjb25zdCBkaXJuYW1lID0gKHBhdGgsIHNlcCA9ICcvJykgPT4ge1xuICBsZXQgYXJyUGF0aCA9IHRyYWlsaW5nc2xhc2hpdChwYXRoLCBzZXApLnNwbGl0KHNlcCk7XG4gIGFyclBhdGgucG9wKCk7XG4gIHJldHVybiB1bnRyYWlsaW5nc2xhc2hpdChhcnJQYXRoLmpvaW4oc2VwKSwgc2VwKTtcbn1cblxuZXhwb3J0IGNvbnN0IHRyYWlsaW5nc2xhc2hpdCA9IChwYXRoLCBzZXAgPSAnLycpID0+IHtcbiAgaWYgKHNlcCA9PSAnLycpIHtcbiAgICBpZiAocGF0aCA9PSAnLycpIHJldHVybiBwYXRoO1xuICAgIHJldHVybiBwYXRoLnJlcGxhY2UoL1xcLyQvLCAnJyk7XG4gIH0gZWxzZSB7XG4gICAgaWYgKHBhdGggPT0gJ1xcXFwnKSByZXR1cm4gcGF0aDtcbiAgICByZXR1cm4gcGF0aC5yZXBsYWNlKC9cXFxcJC8sICcnKTtcbiAgfVxufVxuXG5leHBvcnQgY29uc3QgdW50cmFpbGluZ3NsYXNoaXQgPSAocGF0aCwgc2VwID0gJy8nKSA9PiB7XG4gIHBhdGggPSB0cmFpbGluZ3NsYXNoaXQocGF0aCwgc2VwKTtcbiAgcmV0dXJuIHBhdGggKyBzZXA7XG59XG5cbmV4cG9ydCBjb25zdCBsZWFkaW5nc2xhc2hpdCA9IChwYXRoLCBzZXAgPSAnLycpID0+IHtcbiAgaWYgKHNlcCA9PSAnLycpIHtcbiAgICBpZiAocGF0aCA9PSAnLycpIHJldHVybiBwYXRoO1xuICAgIHJldHVybiBwYXRoLnJlcGxhY2UoL15cXC8rLywgJycpO1xuICB9IGVsc2Uge1xuICAgIGlmIChwYXRoID09ICdcXFxcJykgcmV0dXJuIHBhdGg7XG4gICAgcmV0dXJuIHBhdGgucmVwbGFjZSgvXlxcXFwvLCAnJyk7XG4gIH1cbn1cblxuZXhwb3J0IGNvbnN0IHVubGVhZGluZ3NsYXNoaXQgPSAocGF0aCwgc2VwID0gJy8nKSA9PiB7XG4gIHBhdGggPSBsZWFkaW5nc2xhc2hpdChwYXRoLCBzZXApO1xuICByZXR1cm4gc2VwICsgcGF0aDtcbn1cblxuZXhwb3J0IGNvbnN0IG5vcm1hbGl6ZSA9IChwYXRoLCBzZXAgPSAnLycpID0+IHtcbiAgaWYgKCFwYXRoKSByZXR1cm4gJyc7XG4gIHBhdGggPSBwYXRoLnRyaW0oKTtcbiAgXG4gIGlmIChzZXAgPT0gJy8nKSB7XG4gICAgaWYgKHBhdGggPT0gJy8nKSByZXR1cm4gcGF0aDtcbiAgICByZXR1cm4gcGF0aC5yZXBsYWNlKC9cXFxcKy9nLCBcIi9cIikucmVwbGFjZSgvXFwvKy9nLCBcIi9cIikuc3BsaXQoJy8nKS5tYXAoKGl0ZW0pID0+IHtcbiAgICAgIHJldHVybiBpdGVtLnRyaW0oKTtcbiAgICB9KS5qb2luKCcvJylcbiAgfSBlbHNlIHtcbiAgICBpZiAocGF0aCA9PSAnXFxcXCcpIHJldHVybiBwYXRoO1xuICAgIHJldHVybiBwYXRoLnJlcGxhY2UoL1xcLysvZywgXCJcXFxcXCIpLnJlcGxhY2UoL1xcXFwrL2csIFwiXFxcXFwiKS5zcGxpdCgnXFxcXCcpLm1hcCgoaXRlbSkgPT4ge1xuICAgICAgcmV0dXJuIGl0ZW0udHJpbSgpO1xuICAgIH0pLmpvaW4oJ1xcXFwnKTtcbiAgfVxufVxuXG5leHBvcnQgY29uc3QgZm9ybWF0TnVtYmVyID0gKG51bSkgPT4ge1xuICByZXR1cm4gU3RyaW5nKG51bSkucmVwbGFjZSgvKC4pKD89KFxcZHszfSkrJCkvZywgJyQxLicpO1xufVxuIl19