
/* eslint quote-props:0 */
'use strict';

// Prepare
var isClassRegex = /^class\s|^function\s+[A-Z]/;
var isConventionalClassRegex = /^function\s+[A-Z]/;
var isNativeClassRegex = /^class\s/;

// -----------------------------------
// Values

/**
 * Get the object type string
 * @param {*} value
 * @returns {string}
 */
function getObjectType(value) {
  return Object.prototype.toString.call(value);
}

/**
 * Checks to see if a value is an object
 * @param {*} value
 * @returns {boolean}
 */
function isObject(value) {
  // null is object, hence the extra check
  return value !== null && typeof value === 'object';
}

/**
 * Checks to see if a value is an object and only an object
 * @param {*} value
 * @returns {boolean}
 */
function isPlainObject(value) {
  /* eslint no-proto:0 */
  return isObject(value) && value.__proto__ === Object.prototype;
}

/**
 * Checks to see if a value is empty
 * @param {*} value
 * @returns {boolean}
 */
function isEmpty(value) {
  return value == null;
}

/**
 * Is empty object
 * @param {*} value
 * @returns {boolean}
 */
function isEmptyObject(value /* :Object */) {
  // We could use Object.keys, but this is more effecient
  for (var key in value) {
    if (value.hasOwnProperty(key)) {
      return false;
    }
  }
  return true;
}

/**
 * Is ES6+ class
 * @param {*} value
 * @returns {boolean}
 */
function isNativeClass(value) {
  // NOTE TO DEVELOPER: If any of this changes, isClass must also be updated
  return typeof value === 'function' && isNativeClassRegex.test(value.toString());
}

/**
 * Is Conventional Class
 * Looks for function with capital first letter MyClass
 * First letter is the 9th character
 * If changed, isClass must also be updated
 * @param {*} value
 * @returns {boolean}
 */
function isConventionalClass(value) {
  return typeof value === 'function' && isConventionalClassRegex.test(value.toString());
}

// There use to be code here that checked for CoffeeScript's "function _Class" at index 0 (which was sound)
// But it would also check for Babel's __classCallCheck anywhere in the function, which wasn't sound
// as somewhere in the function, another class could be defined, which would provide a false positive
// So instead, proxied classes are ignored, as we can't guarantee their accuracy, would also be an ever growing set

// -----------------------------------
// Types

/**
 * Is Class
 * @param {*} value
 * @returns {boolean}
 */
function isClass(value) {
  return typeof value === 'function' && isClassRegex.test(value.toString());
}

/**
 * Checks to see if a value is an error
 * @param {*} value
 * @returns {boolean}
 */
function isError(value) {
  return value instanceof Error;
}

/**
 * Checks to see if a value is a date
 * @param {*} value
 * @returns {boolean}
 */
function isDate(value) {
  return getObjectType(value) === '[object Date]';
}

/**
 * Checks to see if a value is an arguments object
 * @param {*} value
 * @returns {boolean}
 */
function isArguments(value) {
  return getObjectType(value) === '[object Arguments]';
}

/**
 * Checks to see if a value is a function but not an asynchronous function
 * @param {*} value
 * @returns {boolean}
 */
function isSyncFunction(value) {
  return getObjectType(value) === '[object Function]';
}

/**
 * Checks to see if a value is an asynchronous function
 * @param {*} value
 * @returns {boolean}
 */
function isAsyncFunction(value) {
  return getObjectType(value) === '[object AsyncFunction]';
}

/**
 * Checks to see if a value is a function
 * @param {*} value
 * @returns {boolean}
 */
function isFunction(value) {
  return isSyncFunction(value) || isAsyncFunction(value);
}

/**
 * Checks to see if a value is an regex
 * @param {*} value
 * @returns {boolean}
 */
function isRegExp(value) {
  return getObjectType(value) === '[object RegExp]';
}

/**
 * Checks to see if a value is an array
 * @param {*} value
 * @returns {boolean}
 */
function isArray(value) {
  return typeof Array.isArray === 'function' && Array.isArray(value) || getObjectType(value) === '[object Array]';
}

/**
 * Checks to see if a valule is a number
 * @param {*} value
 * @returns {boolean}
 */
function isNumber(value) {
  return typeof value === 'number' || getObjectType(value) === '[object Number]';
}

/**
 * Checks to see if a value is a string
 * @param {*} value
 * @returns {boolean}
 */
function isString(value) {
  return typeof value === 'string' || getObjectType(value) === '[object String]';
}

/**
 * Checks to see if a valule is a boolean
 * @param {*} value
 * @returns {boolean}
 */
function isBoolean(value) {
  return value === true || value === false || getObjectType(value) === '[object Boolean]';
}

/**
 * Checks to see if a value is null
 * @param {*} value
 * @returns {boolean}
 */
function isNull(value) {
  return value === null;
}

/**
 * Checks to see if a value is undefined
 * @param {*} value
 * @returns {boolean}
 */
function isUndefined(value) {
  return typeof value === 'undefined';
}

/**
 * Checks to see if a value is a Map
 * @param {*} value
 * @returns {boolean}
 */
function isMap(value) {
  return getObjectType(value) === '[object Map]';
}

/**
 * Checks to see if a value is a WeakMap
 * @param {*} value
 * @returns {boolean}
 */
function isWeakMap(value) {
  return getObjectType(value) === '[object WeakMap]';
}

// -----------------------------------
// General

/**
 * The interface for methods that test for a particular type.
 * @typedef {function} TypeTester
 * @param {*} value the value that will have its type tested
 * @returns {boolean} `true` if the value matches the type that the function tests against
 */

/**
 * The interface for a type mapping (key => function) to use for {@link getType}.
 * The key represents the name of the type. The function represents the {@link TypeTester test method}.
 * The map should be ordered by testing preference, with more specific tests first.
 * If a test returns true, it is selected, and the key is returned as the type.
 * @typedef {Object<string, TypeTester>} TypeMap
 */

/**
 * The default {@link TypeMap} for {@link getType}.
 * AsyncFunction and SyncFunction are missing, as they are more specific types that people can detect afterwards.
 * @readonly
 * @type {TypeMap}
 */
var typeMap = Object.freeze({
  array: isArray,
  boolean: isBoolean,
  date: isDate,
  error: isError,
  'class': isClass,
  'function': isFunction,
  'null': isNull,
  number: isNumber,
  regexp: isRegExp,
  string: isString,
  undefined: isUndefined,
  map: isMap,
  weakmap: isWeakMap,
  object: isObject
});

/**
 * Cycle through the passed {@link TypeMap} testing the value, returning the first type that passes, otherwise `null`.
 * @param {*} value the value to test
 * @param {TypeMap} [customTypeMap] defaults to {@link typeMap}
 * @returns {string|null}
 */
function getType(value) {
  var customTypeMap = arguments.length <= 1 || arguments[1] === undefined ? typeMap : arguments[1];

  // Cycle through our type map
  for (var key in customTypeMap) {
    if (customTypeMap.hasOwnProperty(key)) {
      if (customTypeMap[key](value)) {
        return key;
      }
    }
  }

  // No type was successful
  return null;
}

// Export
module.exports = {
  getObjectType: getObjectType,
  isObject: isObject,
  isPlainObject: isPlainObject,
  isEmpty: isEmpty,
  isEmptyObject: isEmptyObject,
  isNativeClass: isNativeClass,
  isConventionalClass: isConventionalClass,
  isClass: isClass,
  isError: isError,
  isDate: isDate,
  isArguments: isArguments,
  isSyncFunction: isSyncFunction,
  isAsyncFunction: isAsyncFunction,
  isFunction: isFunction,
  isRegExp: isRegExp,
  isArray: isArray,
  isNumber: isNumber,
  isString: isString,
  isBoolean: isBoolean,
  isNull: isNull,
  isUndefined: isUndefined,
  isMap: isMap,
  isWeakMap: isWeakMap,
  typeMap: typeMap,
  getType: getType
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2FuYW5tYXkzLy5hdG9tL3BhY2thZ2VzL2ZsZXgtdG9vbC1iYXIvbm9kZV9tb2R1bGVzL3R5cGVjaGVja2VyL3NvdXJjZS9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUVBLFlBQVksQ0FBQTs7O0FBR1osSUFBTSxZQUFZLEdBQUcsNEJBQTRCLENBQUE7QUFDakQsSUFBTSx3QkFBd0IsR0FBRyxtQkFBbUIsQ0FBQTtBQUNwRCxJQUFNLGtCQUFrQixHQUFHLFVBQVUsQ0FBQTs7Ozs7Ozs7OztBQVVyQyxTQUFTLGFBQWEsQ0FBQyxLQUFLLEVBQUU7QUFDN0IsU0FBTyxNQUFNLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUE7Q0FDNUM7Ozs7Ozs7QUFPRCxTQUFTLFFBQVEsQ0FBQyxLQUFLLEVBQUU7O0FBRXhCLFNBQU8sS0FBSyxLQUFLLElBQUksSUFBSSxPQUFPLEtBQUssS0FBSyxRQUFRLENBQUE7Q0FDbEQ7Ozs7Ozs7QUFPRCxTQUFTLGFBQWEsQ0FBQyxLQUFLLEVBQUU7O0FBRTdCLFNBQU8sUUFBUSxDQUFDLEtBQUssQ0FBQyxJQUFJLEtBQUssQ0FBQyxTQUFTLEtBQUssTUFBTSxDQUFDLFNBQVMsQ0FBQTtDQUM5RDs7Ozs7OztBQU9ELFNBQVMsT0FBTyxDQUFDLEtBQUssRUFBRTtBQUN2QixTQUFPLEtBQUssSUFBSSxJQUFJLENBQUE7Q0FDcEI7Ozs7Ozs7QUFPRCxTQUFTLGFBQWEsQ0FBQyxLQUFLLGdCQUFnQjs7QUFFM0MsT0FBSyxJQUFNLEdBQUcsSUFBSSxLQUFLLEVBQUU7QUFDeEIsUUFBSSxLQUFLLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxFQUFFO0FBQzlCLGFBQU8sS0FBSyxDQUFBO0tBQ1o7R0FDRDtBQUNELFNBQU8sSUFBSSxDQUFBO0NBQ1g7Ozs7Ozs7QUFPRCxTQUFTLGFBQWEsQ0FBQyxLQUFLLEVBQUU7O0FBRTdCLFNBQ0MsT0FBTyxLQUFLLEtBQUssVUFB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QUFjO0FBQ2QsaUJBQWUsRUFBZixlQUFlO0FBQ2YsWUFBVSxFQUFWLFVBQVU7QUFDVixVQUFRLEVBQVIsUUFBUTtBQUNSLFNBQU8sRUFBUCxPQUFPO0FBQ1AsVUFBUSxFQUFSLFFBQVE7QUFDUixVQUFRLEVBQVIsUUFBUTtBQUNSLFdBQVMsRUFBVCxTQUFTO0FBQ1QsUUFBTSxFQUFOLE1BQU07QUFDTixhQUFXLEVBQVgsV0FBVztBQUNYLE9BQUssRUFBTCxLQUFLO0FBQ0wsV0FBUyxFQUFULFNBQVM7QUFDVCxTQUFPLEVBQVAsT0FBTztBQUNQLFNBQU8sRUFBUCxPQUFPO0NBQ1AsQ0FBQSIsImZpbGUiOiIvaG9tZS9hbmFubWF5My8uYXRvbS9wYWNrYWdlcy9mbGV4LXRvb2wtYmFyL25vZGVfbW9kdWxlcy90eXBlY2hlY2tlci9zb3VyY2UvaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBAZmxvdyAqL1xuLyogZXNsaW50IHF1b3RlLXByb3BzOjAgKi9cbid1c2Ugc3RyaWN0J1xuXG4vLyBQcmVwYXJlXG5jb25zdCBpc0NsYXNzUmVnZXggPSAvXmNsYXNzXFxzfF5mdW5jdGlvblxccytbQS1aXS9cbmNvbnN0IGlzQ29udmVudGlvbmFsQ2xhc3NSZWdleCA9IC9eZnVuY3Rpb25cXHMrW0EtWl0vXG5jb25zdCBpc05hdGl2ZUNsYXNzUmVnZXggPSAvXmNsYXNzXFxzL1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gVmFsdWVzXG5cbi8qKlxuICogR2V0IHRoZSBvYmplY3QgdHlwZSBzdHJpbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWVcbiAqIEByZXR1cm5zIHtzdHJpbmd9XG4gKi9cbmZ1bmN0aW9uIGdldE9iamVjdFR5cGUodmFsdWUpIHtcblx0cmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSlcbn1cblxuLyoqXG4gKiBDaGVja3MgdG8gc2VlIGlmIGEgdmFsdWUgaXMgYW4gb2JqZWN0XG4gKiBAcGFyYW0geyp9IHZhbHVlXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAqL1xuZnVuY3Rpb24gaXNPYmplY3QodmFsdWUpIHtcblx0Ly8gbnVsbCBpcyBvYmplY3QsIGhlbmNlIHRoZSBleHRyYSBjaGVja1xuXHRyZXR1cm4gdmFsdWUgIT09IG51bGwgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0J1xufVxuXG4vKipcbiAqIENoZWNrcyB0byBzZWUgaWYgYSB2YWx1ZSBpcyBhbiBvYmplY3QgYW5kIG9ubHkgYW4gb2JqZWN0XG4gKiBAcGFyYW0geyp9IHZhbHVlXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAqL1xuZnVuY3Rpb24gaXNQbGFpbk9iamVjdCh2YWx1ZSkge1xuXHQvKiBlc2xpbnQgbm8tcHJvdG86MCAqL1xuXHRyZXR1cm4gaXNPYmplY3QodmFsdWUpICYmIHZhbHVlLl9fcHJvdG9fXyA9PT0gT2JqZWN0LnByb3RvdHlwZVxufVxuXG4vKipcbiAqIENoZWNrcyB0byBzZWUgaWYgYSB2YWx1ZSBpcyBlbXB0eVxuICogQHBhcmFtIHsqfSB2YWx1ZVxuICogQHJldHVybnMge2Jvb2xlYW59XG4gKi9cbmZ1bmN0aW9uIGlzRW1wdHkodmFsdWUpIHtcblx0cmV0dXJuIHZhbHVlID09IG51bGxcbn1cblxuLyoqXG4gKiBJcyBlbXB0eSBvYmplY3RcbiAqIEBwYXJhbSB7Kn0gdmFsdWVcbiAqIEByZXR1cm5zIHtib29sZWFufVxuICovXG5mdW5jdGlvbiBpc0VtcHR5T2JqZWN0KHZhbHVlIC8qIDpPYmplY3QgKi8pIHtcblx0Ly8gV2UgY291bGQgdXNlIE9iamVjdC5rZXlzLCBidXQgdGhpcyBpcyBtb3JlIGVmZmVjaWVudFxuXHRmb3IgKGNvbnN0IGtleSBpbiB2YWx1ZSkge1xuXHRcdGlmICh2YWx1ZS5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2Vcblx0XHR9XG5cdH1cblx0cmV0dXJuIHRydWVcbn1cblxuLyoqXG4gKiBJcyBFUzYrIGNsYXNzXG4gKiBAcGFyYW0geyp9IHZhbHVlXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAqL1xuZnVuY3Rpb24gaXNOYXRpdmVDbGFzcyh2YWx1ZSkge1xuXHQvLyBOT1RFIFRPIERFVkVMT1BFUjogSWYgYW55IG9mIHRoaXMgY2hhbmdlcywgaXNDbGFzcyBtdXN0IGFsc28gYmUgdXBkYXRlZFxuXHRyZXR1cm4gKFxuXHRcdHR5cGVvZiB2YWx1ZSA9PT0gJ2Z1bmN0aW9uJyAmJiBpc05hdGl2ZUNsYXNzUmVnZXgudGVzdCh2YWx1ZS50b1N0cmluZygpKVxuXHQpXG59XG5cbi8qKlxuICogSXMgQ29udmVudGlvbmFsIENsYXNzXG4gKiBMb29rcyBmb3IgZnVuY3Rpb24gd2l0aCBjYXBpdGFsIGZpcnN0IGxldHRlciBNeUNsYXNzXG4gKiBGaXJzdCBsZXR0ZXIgaXMgdGhlIDl0aCBjaGFyYWN0ZXJcbiAqIElmIGNoYW5nZWQsIGlzQ2xhc3MgbXVzdCBhbHNvIGJlIHVwZGF0ZWRcbiAqIEBwYXJhbSB7Kn0gdmFsdWVcbiAqIEByZXR1cm5zIHtib29sZWFufVxuICovXG5mdW5jdGlvbiBpc0NvbnZlbnRpb25hbENsYXNzKHZhbHVlKSB7XG5cdHJldHVybiAoXG5cdFx0dHlwZW9mIHZhbHVlID09PSAnZnVuY3Rpb24nICYmXG5cdFx0aXNDb252ZW50aW9uYWxDbGFzc1JlZ2V4LnRlc3QodmFsdWUudG9TdHJpbmcoKSlcblx0KVxufVxuXG4vLyBUaGVyZSB1c2UgdG8gYmUgY29kZSBoZXJlIHRoYXQgY2hlY2tlZCBmb3IgQ29mZmVlU2NyaXB0J3MgXCJmdW5jdGlvbiBfQ2xhc3NcIiBhdCBpbmRleCAwICh3aGljaCB3YXMgc291bmQpXG4vLyBCdXQgaXQgd291bGQgYWxzbyBjaGVjayBmb3IgQmFiZWwncyBfX2NsYXNzQ2FsbENoZWNrIGFueXdoZXJlIGluIHRoZSBmdW5jdGlvbiwgd2hpY2ggd2Fzbid0IHNvdW5kXG4vLyBhcyBzb21ld2hlcmUgaW4gdGhlIGZ1bmN0aW9uLCBhbm90aGVyIGNsYXNzIGNvdWxkIGJlIGRlZmluZWQsIHdoaWNoIHdvdWxkIHByb3ZpZGUgYSBmYWxzZSBwb3NpdGl2ZVxuLy8gU28gaW5zdGVhZCwgcHJveGllZCBjbGFzc2VzIGFyZSBpZ25vcmVkLCBhcyB3ZSBjYW4ndCBndWFyYW50ZWUgdGhlaXIgYWNjdXJhY3ksIHdvdWxkIGFsc28gYmUgYW4gZXZlciBncm93aW5nIHNldFxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gVHlwZXNcblxuLyoqXG4gKiBJcyBDbGFzc1xuICogQHBhcmFtIHsqfSB2YWx1ZVxuICogQHJldHVybnMge2Jvb2xlYW59XG4gKi9cbmZ1bmN0aW9uIGlzQ2xhc3ModmFsdWUpIHtcblx0cmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ2Z1bmN0aW9uJyAmJiBpc0NsYXNzUmVnZXgudGVzdCh2YWx1ZS50b1N0cmluZygpKVxufVxuXG4vKipcbiAqIENoZWNrcyB0byBzZWUgaWYgYSB2YWx1ZSBpcyBhbiBlcnJvclxuICogQHBhcmFtIHsqfSB2YWx1ZVxuICogQHJldHVybnMge2Jvb2xlYW59XG4gKi9cbmZ1bmN0aW9uIGlzRXJyb3IodmFsdWUpIHtcblx0cmV0dXJuIHZhbHVlIGluc3RhbmNlb2YgRXJyb3Jcbn1cblxuLyoqXG4gKiBDaGVja3MgdG8gc2VlIGlmIGEgdmFsdWUgaXMgYSBkYXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAqL1xuZnVuY3Rpb24gaXNEYXRlKHZhbHVlKSB7XG5cdHJldHVybiBnZXRPYmplY3RUeXBlKHZhbHVlKSA9PT0gJ1tvYmplY3QgRGF0ZV0nXG59XG5cbi8qKlxuICogQ2hlY2tzIHRvIHNlZSBpZiBhIHZhbHVlIGlzIGFuIGFyZ3VtZW50cyBvYmplY3RcbiAqIEBwYXJhbSB7Kn0gdmFsdWVcbiAqIEByZXR1cm5zIHtib29sZWFufVxuICovXG5mdW5jdGlvbiBpc0FyZ3VtZW50cyh2YWx1ZSkge1xuXHRyZXR1cm4gZ2V0T2JqZWN0VHlwZSh2YWx1ZSkgPT09ICdbb2JqZWN0IEFyZ3VtZW50c10nXG59XG5cbi8qKlxuICogQ2hlY2tzIHRvIHNlZSBpZiBhIHZhbHVlIGlzIGEgZnVuY3Rpb24gYnV0IG5vdCBhbiBhc3luY2hyb25vdXMgZnVuY3Rpb25cbiAqIEBwYXJhbSB7Kn0gdmFsdWVcbiAqIEByZXR1cm5zIHtib29sZWFufVxuICovXG5mdW5jdGlvbiBpc1N5bmNGdW5jdGlvbih2YWx1ZSkge1xuXHRyZXR1cm4gZ2V0T2JqZWN0VHlwZSh2YWx1ZSkgPT09ICdbb2JqZWN0IEZ1bmN0aW9uXSdcbn1cblxuLyoqXG4gKiBDaGVja3MgdG8gc2VlIGlmIGEgdmFsdWUgaXMgYW4gYXN5bmNocm9ub3VzIGZ1bmN0aW9uXG4gKiBAcGFyYW0geyp9IHZhbHVlXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAqL1xuZnVuY3Rpb24gaXNBc3luY0Z1bmN0aW9uKHZhbHVlKSB7XG5cdHJldHVybiBnZXRPYmplY3RUeXBlKHZhbHVlKSA9PT0gJ1tvYmplY3QgQXN5bmNGdW5jdGlvbl0nXG59XG5cbi8qKlxuICogQ2hlY2tzIHRvIHNlZSBpZiBhIHZhbHVlIGlzIGEgZnVuY3Rpb25cbiAqIEBwYXJhbSB7Kn0gdmFsdWVcbiAqIEByZXR1cm5zIHtib29sZWFufVxuICovXG5mdW5jdGlvbiBpc0Z1bmN0aW9uKHZhbHVlKSB7XG5cdHJldHVybiBpc1N5bmNGdW5jdGlvbih2YWx1ZSkgfHwgaXNBc3luY0Z1bmN0aW9uKHZhbHVlKVxufVxuXG4vKipcbiAqIENoZWNrcyB0byBzZWUgaWYgYSB2YWx1ZSBpcyBhbiByZWdleFxuICogQHBhcmFtIHsqfSB2YWx1ZVxuICogQHJldHVybnMge2Jvb2xlYW59XG4gKi9cbmZ1bmN0aW9uIGlzUmVnRXhwKHZhbHVlKSB7XG5cdHJldHVybiBnZXRPYmplY3RUeXBlKHZhbHVlKSA9PT0gJ1tvYmplY3QgUmVnRXhwXSdcbn1cblxuLyoqXG4gKiBDaGVja3MgdG8gc2VlIGlmIGEgdmFsdWUgaXMgYW4gYXJyYXlcbiAqIEBwYXJhbSB7Kn0gdmFsdWVcbiAqIEByZXR1cm5zIHtib29sZWFufVxuICovXG5mdW5jdGlvbiBpc0FycmF5KHZhbHVlKSB7XG5cdHJldHVybiAoXG5cdFx0KHR5cGVvZiBBcnJheS5pc0FycmF5ID09PSAnZnVuY3Rpb24nICYmIEFycmF5LmlzQXJyYXkodmFsdWUpKSB8fFxuXHRcdGdldE9iamVjdFR5cGUodmFsdWUpID09PSAnW29iamVjdCBBcnJheV0nXG5cdClcbn1cblxuLyoqXG4gKiBDaGVja3MgdG8gc2VlIGlmIGEgdmFsdWxlIGlzIGEgbnVtYmVyXG4gKiBAcGFyYW0geyp9IHZhbHVlXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAqL1xuZnVuY3Rpb24gaXNOdW1iZXIodmFsdWUpIHtcblx0cmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicgfHwgZ2V0T2JqZWN0VHlwZSh2YWx1ZSkgPT09ICdbb2JqZWN0IE51bWJlcl0nXG59XG5cbi8qKlxuICogQ2hlY2tzIHRvIHNlZSBpZiBhIHZhbHVlIGlzIGEgc3RyaW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAqL1xuZnVuY3Rpb24gaXNTdHJpbmcodmFsdWUpIHtcblx0cmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgfHwgZ2V0T2JqZWN0VHlwZSh2YWx1ZSkgPT09ICdbb2JqZWN0IFN0cmluZ10nXG59XG5cbi8qKlxuICogQ2hlY2tzIHRvIHNlZSBpZiBhIHZhbHVsZSBpcyBhIGJvb2xlYW5cbiAqIEBwYXJhbSB7Kn0gdmFsdWVcbiAqIEByZXR1cm5zIHtib29sZWFufVxuICovXG5mdW5jdGlvbiBpc0Jvb2xlYW4odmFsdWUpIHtcblx0cmV0dXJuIChcblx0XHR2YWx1ZSA9PT0gdHJ1ZSB8fFxuXHRcdHZhbHVlID09PSBmYWxzZSB8fFxuXHRcdGdldE9iamVjdFR5cGUodmFsdWUpID09PSAnW29iamVjdCBCb29sZWFuXSdcblx0KVxufVxuXG4vKipcbiAqIENoZWNrcyB0byBzZWUgaWYgYSB2YWx1ZSBpcyBudWxsXG4gKiBAcGFyYW0geyp9IHZhbHVlXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAqL1xuZnVuY3Rpb24gaXNOdWxsKHZhbHVlKSB7XG5cdHJldHVybiB2YWx1ZSA9PT0gbnVsbFxufVxuXG4vKipcbiAqIENoZWNrcyB0byBzZWUgaWYgYSB2YWx1ZSBpcyB1bmRlZmluZWRcbiAqIEBwYXJhbSB7Kn0gdmFsdWVcbiAqIEByZXR1cm5zIHtib29sZWFufVxuICovXG5mdW5jdGlvbiBpc1VuZGVmaW5lZCh2YWx1ZSkge1xuXHRyZXR1cm4gdHlwZW9mIHZhbHVlID09PSAndW5kZWZpbmVkJ1xufVxuXG4vKipcbiAqIENoZWNrcyB0byBzZWUgaWYgYSB2YWx1ZSBpcyBhIE1hcFxuICogQHBhcmFtIHsqfSB2YWx1ZVxuICogQHJldHVybnMge2Jvb2xlYW59XG4gKi9cbmZ1bmN0aW9uIGlzTWFwKHZhbHVlKSB7XG5cdHJldHVybiBnZXRPYmplY3RUeXBlKHZhbHVlKSA9PT0gJ1tvYmplY3QgTWFwXSdcbn1cblxuLyoqXG4gKiBDaGVja3MgdG8gc2VlIGlmIGEgdmFsdWUgaXMgYSBXZWFrTWFwXG4gKiBAcGFyYW0geyp9IHZhbHVlXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAqL1xuZnVuY3Rpb24gaXNXZWFrTWFwKHZhbHVlKSB7XG5cdHJldHVybiBnZXRPYmplY3RUeXBlKHZhbHVlKSA9PT0gJ1tvYmplY3QgV2Vha01hcF0nXG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBHZW5lcmFsXG5cbi8qKlxuICogVGhlIGludGVyZmFjZSBmb3IgbWV0aG9kcyB0aGF0IHRlc3QgZm9yIGEgcGFydGljdWxhciB0eXBlLlxuICogQHR5cGVkZWYge2Z1bmN0aW9ufSBUeXBlVGVzdGVyXG4gKiBAcGFyYW0geyp9IHZhbHVlIHRoZSB2YWx1ZSB0aGF0IHdpbGwgaGF2ZSBpdHMgdHlwZSB0ZXN0ZWRcbiAqIEByZXR1cm5zIHtib29sZWFufSBgdHJ1ZWAgaWYgdGhlIHZhbHVlIG1hdGNoZXMgdGhlIHR5cGUgdGhhdCB0aGUgZnVuY3Rpb24gdGVzdHMgYWdhaW5zdFxuICovXG5cbi8qKlxuICogVGhlIGludGVyZmFjZSBmb3IgYSB0eXBlIG1hcHBpbmcgKGtleSA9PiBmdW5jdGlvbikgdG8gdXNlIGZvciB7QGxpbmsgZ2V0VHlwZX0uXG4gKiBUaGUga2V5IHJlcHJlc2VudHMgdGhlIG5hbWUgb2YgdGhlIHR5cGUuIFRoZSBmdW5jdGlvbiByZXByZXNlbnRzIHRoZSB7QGxpbmsgVHlwZVRlc3RlciB0ZXN0IG1ldGhvZH0uXG4gKiBUaGUgbWFwIHNob3VsZCBiZSBvcmRlcmVkIGJ5IHRlc3RpbmcgcHJlZmVyZW5jZSwgd2l0aCBtb3JlIHNwZWNpZmljIHRlc3RzIGZpcnN0LlxuICogSWYgYSB0ZXN0IHJldHVybnMgdHJ1ZSwgaXQgaXMgc2VsZWN0ZWQsIGFuZCB0aGUga2V5IGlzIHJldHVybmVkIGFzIHRoZSB0eXBlLlxuICogQHR5cGVkZWYge09iamVjdDxzdHJpbmcsIFR5cGVUZXN0ZXI+fSBUeXBlTWFwXG4gKi9cblxuLyoqXG4gKiBUaGUgZGVmYXVsdCB7QGxpbmsgVHlwZU1hcH0gZm9yIHtAbGluayBnZXRUeXBlfS5cbiAqIEFzeW5jRnVuY3Rpb24gYW5kIFN5bmNGdW5jdGlvbiBhcmUgbWlzc2luZywgYXMgdGhleSBhcmUgbW9yZSBzcGVjaWZpYyB0eXBlcyB0aGF0IHBlb3BsZSBjYW4gZGV0ZWN0IGFmdGVyd2FyZHMuXG4gKiBAcmVhZG9ubHlcbiAqIEB0eXBlIHtUeXBlTWFwfVxuICovXG5jb25zdCB0eXBlTWFwID0gT2JqZWN0LmZyZWV6ZSh7XG5cdGFycmF5OiBpc0FycmF5LFxuXHRib29sZWFuOiBpc0Jvb2xlYW4sXG5cdGRhdGU6IGlzRGF0ZSxcblx0ZXJyb3I6IGlzRXJyb3IsXG5cdGNsYXNzOiBpc0NsYXNzLFxuXHRmdW5jdGlvbjogaXNGdW5jdGlvbixcblx0bnVsbDogaXNOdWxsLFxuXHRudW1iZXI6IGlzTnVtYmVyLFxuXHRyZWdleHA6IGlzUmVnRXhwLFxuXHRzdHJpbmc6IGlzU3RyaW5nLFxuXHR1bmRlZmluZWQ6IGlzVW5kZWZpbmVkLFxuXHRtYXA6IGlzTWFwLFxuXHR3ZWFrbWFwOiBpc1dlYWtNYXAsXG5cdG9iamVjdDogaXNPYmplY3Rcbn0pXG5cbi8qKlxuICogQ3ljbGUgdGhyb3VnaCB0aGUgcGFzc2VkIHtAbGluayBUeXBlTWFwfSB0ZXN0aW5nIHRoZSB2YWx1ZSwgcmV0dXJuaW5nIHRoZSBmaXJzdCB0eXBlIHRoYXQgcGFzc2VzLCBvdGhlcndpc2UgYG51bGxgLlxuICogQHBhcmFtIHsqfSB2YWx1ZSB0aGUgdmFsdWUgdG8gdGVzdFxuICogQHBhcmFtIHtUeXBlTWFwfSBbY3VzdG9tVHlwZU1hcF0gZGVmYXVsdHMgdG8ge0BsaW5rIHR5cGVNYXB9XG4gKiBAcmV0dXJucyB7c3RyaW5nfG51bGx9XG4gKi9cbmZ1bmN0aW9uIGdldFR5cGUodmFsdWUsIGN1c3RvbVR5cGVNYXAgPSB0eXBlTWFwKSB7XG5cdC8vIEN5Y2xlIHRocm91Z2ggb3VyIHR5cGUgbWFwXG5cdGZvciAoY29uc3Qga2V5IGluIGN1c3RvbVR5cGVNYXApIHtcblx0XHRpZiAoY3VzdG9tVHlwZU1hcC5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG5cdFx0XHRpZiAoY3VzdG9tVHlwZU1hcFtrZXldKHZhbHVlKSkge1xuXHRcdFx0XHRyZXR1cm4ga2V5XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0Ly8gTm8gdHlwZSB3YXMgc3VjY2Vzc2Z1bFxuXHRyZXR1cm4gbnVsbFxufVxuXG4vLyBFeHBvcnRcbm1vZHVsZS5leHBvcnRzID0ge1xuXHRnZXRPYmplY3RUeXBlLFxuXHRpc09iamVjdCxcblx0aXNQbGFpbk9iamVjdCxcblx0aXNFbXB0eSxcblx0aXNFbXB0eU9iamVjdCxcblx0aXNOYXRpdmVDbGFzcyxcblx0aXNDb252ZW50aW9uYWxDbGFzcyxcblx0aXNDbGFzcyxcblx0aXNFcnJvcixcblx0aXNEYXRlLFxuXHRpc0FyZ3VtZW50cyxcblx0aXNTeW5jRnVuY3Rpb24sXG5cdGlzQXN5bmNGdW5jdGlvbixcblx0aXNGdW5jdGlvbixcblx0aXNSZWdFeHAsXG5cdGlzQXJyYXksXG5cdGlzTnVtYmVyLFxuXHRpc1N0cmluZyxcblx0aXNCb29sZWFuLFxuXHRpc051bGwsXG5cdGlzVW5kZWZpbmVkLFxuXHRpc01hcCxcblx0aXNXZWFrTWFwLFxuXHR0eXBlTWFwLFxuXHRnZXRUeXBlXG59XG4iXX0=