
/* eslint no-console:0 */
'use strict';

// Imports

function _classCallCheck(instance, Constructor) {
	if (!(instance instanceof Constructor)) {
		throw new TypeError("Cannot call a class as a function");
	}
}

function _possibleConstructorReturn(self, call) {
	if (!self) {
		throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
	}return call && (typeof call === "object" || typeof call === "function") ? call : self;
}

function _inherits(subClass, superClass) {
	if (typeof superClass !== "function" && superClass !== null) {
		throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
	}subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}

var pathUtil = require('path');

// Helper class to display nested error in a sensible way

var DetailedError = (function (_Error) {
	_inherits(DetailedError, _Error);

	function DetailedError(message, /* :string */details /* :Object */) {
		_classCallCheck(this, DetailedError);

		Object.keys(details).forEach(function (key) {
			var data = details[key];
			var value = require('util').inspect(data.stack || data.message || data);
			message += '\n' + key + ': ' + value;
		});
		return _possibleConstructorReturn(this, (DetailedError.__proto__ || Object.getPrototypeOf(DetailedError)).call(this, message));
	}

	return DetailedError;
})(Error);

// Environment fetching

var blacklist = process && process.env && process.env.EDITIONS_SYNTAX_BLACKLIST && process.env.EDITIONS_SYNTAX_BLACKLIST.split(',');

// Cache of which syntax combinations are supported or unsupported, hash of booleans
var syntaxFailedCombitions = {}; // sorted lowercase syntax combination => Error instance of failure
var syntaxBlacklist = {};
syntaxBlacklist["import"] = new Error('The import syntax is skipped as the module package.json field eliminates the need for autoloader support');
syntaxBlacklist.coffeescript = new Error('The coffeescript syntax is skipped as we want to use a precompiled edition rather than compiling at runtime');
syntaxBlacklist.typescript = new Error('The typescript syntax is skipped as we want to use a precompiled edition rather than compiling at runtime');

// Blacklist non-esnext node versions from esnext
if (process && process.versions && process.versions.node) {
	var EARLIEST_ESNEXT_NODE_VERSION = [0, 12];
	var NODE_VERSION = process.versions.node.split('.').map(function (n) {
		return parseInt(n, 10);
	});
	var ESNEXT_UNSUPPORTED = NODE_VERSION[0] < EARLIEST_ESNEXT_NODE_VERSION[0] || NODE_VERSION[0] === EARLIEST_ESNEXT_NODE_VERSION[0] && NODE_VERSION[1] < EARLIEST_ESNEXT_NODE_VERSION[1];
	if (ESNEXT_UNSUPPORTED) syntaxBlacklist.esnext = new Error('The esnext syntax is skipped on early node versions as attempting to use esnext features will output debugging information on these node versions');
}

// Check the environment configuration for a syntax blacklist
if (blacklist) {
	for (var i = 0; i < blacklist.length; ++i) {
		var syntax = blacklist[i].trim().toLowerCase();
		syntaxBlacklist[syntax] = new DetailedError('The EDITIONS_SYNTAX_BLACKLIST environment variable has blacklisted an edition syntax:', { syntax: syntax, blacklist: blacklist });
	}
}

/* ::
type edition = {
	name:number,
	description?:string,
	directory?:string,
	entry?:string,
	syntaxes?:Array<string>
};
type options = {
	cwd?:string,
	package?:string,
	entry?:string,
	require:function
};
*/

/**
 * Cycle through the editions and require the correct one
 * @protected internal function that is untested for public consumption
 * @param {edition} edition - the edition entry
 * @param {Object} opts - the following options
 * @param {string} opts.require - the require method of the calling module, used to ensure require paths remain correct
 * @param {string} [opts.cwd] - if provided, this will be the cwd for entries
 * @param {string} [opts.entry] - if provided, should be a relative or absolute path to the entry point of the edition
 * @param {string} [opts.package] - if provided, should be the name of the package that we are loading the editions for
 * @returns {*}
 */
function requireEdition(edition, /* :edition */opts /* :options */) /* :any */{
	// Prevent require from being included in debug logs
	Object.defineProperty(opts, 'require', { value: opts.require, enumerable: false });

	// Get the correct entry path
	// As older versions o
	var cwd = opts.cwd || '';
	var dir = edition.directory || '';
	var entry = opts.entry || edition.entry || '';
	if (dir && entry && entry.indexOf(dir + '/') === 0) entry = entry.substring(dir.length + 1);
	// ^ this should not be needed, but as previous versions of editions included the directory inside the entry
	// it unfortunately is, as such this is a stepping stone for the new format, the new format being
	// if entry is specified by itself, it is cwd => entry
	// if entry is specified with a directory, it is cwd => dir => entry
	// if entry is not specified but dir is, it is cwd => dir
	// if neither entry nor dir are specified, we have a problem
	if (!dir && !entry) {
		var editionFailure = new DetailedError('Skipped edition due to no entry or directory being specified:', { edition: edition, cwd: cwd, dir: dir, entry: entry });
		throw editionFailure;
	}
	var entryPath = pathUtil.resolve(cwd, dir, entry);

	// Check syntax support
	// Convert syntaxes into a sorted lowercase string
	var syntaxes = edition.syntaxes && edition.syntaxes.map(function (i) {
		return i.toLowerCase();
	}).sort();
	var syntaxCombination = syntaxes && syntaxes.join(', ');
	if (syntaxes && syntaxCombination) {
		// Check if any of the syntaxes are unsupported
		var unsupportedSyntaxes = syntaxes.filter(function (i) {
			return syntaxBlacklist[i.toLowerCase()];
		});
		if (unsupportedSyntaxes.length) {
			var _editionFailure = new DetailedError('Skipped edition due to it containing an unsupported syntax:', { edition: edition, unsupportedSyntaxes: unsupportedSyntaxes });
			throw _editionFailure;
		}
		// Is this syntax combination unsupported? If so skip it with a soft failure to try the next edition
		else if (syntaxFailedCombitions[syntaxCombination]) {
				var previousCombinationFailure = syntaxFailedCombitions[syntaxCombination];
				var _editionFailure2 = new DetailedError('Skipped edition due to its syntax combinatiom failing previously:', { edition: edition, previousCombinationFailure: previousCombinationFailure });
				throw _editionFailure2;
			}
	}

	// Try and load this syntax combination
	try {
		return opts.require(entryPath);
	} catch (error) {
		// Note the error with more details
		var _editionFailure3 = new DetailedError('Failed to load the edition due to a load error:', { edition: edition, error: error.stack });

		// Blacklist the combination, even if it may have worked before
		// Perhaps in the future note if that if it did work previously, then we should instruct module owners to be more specific with their syntaxes
		if (syntaxCombination) syntaxFailedCombitions[syntaxCombination] = _editionFailure3;

		// Continue to the next edition
		throw _editionFailure3;
	}
}

/**
 * Cycle through the editions and require the correct one
 * @protected internal function that is untested for public consumption
 * @param {Array<edition>} editions - an array of edition entries
 * @param {Object} opts - the following options
 * @param {string} opts.require - the require method of the calling module, used to ensure require paths remain correct
 * @param {string} [opts.cwd] - if provided, this will be the cwd for entries
 * @param {string} [opts.entry] - if provided, should be a relative path to the entry point of the edition
 * @param {string} [opts.package] - if provided, should be the name of the package that we are loading the editions for
 * @returns {*}
 */
function requireEditions(editions, /* :Array<edition> */opts /* :options */) /* :any */{
	// Extract
	if (opts["package"] == null) opts["package"] = 'custom runtime package';

	// Check
	if (!editions || editions.length === 0) {
		throw new DetailedError('No editions were specified:', { opts: opts });
	}

	// Note the last error message
	var editionFailures = [];

	// Cycle through the editions
	for (var _i = 0; _i < editions.length; ++_i) {
		var edition = editions[_i];
		try {
			return requireEdition(edition, opts);
		} catch (err) {
			editionFailures.push(err);
		}
	}

	// Through the error as no edition loaded
	throw new DetailedError('There are no suitable editions for this environment:', { opts: opts, editions: editions, failures: editionFailures });
}

/**
 * Cycle through the editions for a package and require the correct one
 * @param {string} cwd - the path of the package, used to load package.json:editions and handle relative edition entry points
 * @param {function} require - the require method of the calling module, used to ensure require paths remain correct
 * @param {string} [entry] - an optional override for the entry of an edition, requires the edition to specify a `directory` property
 * @returns {*}
 */
function requirePackage(cwd, /* :string */require, /* :function */entry /* :: ?:string */) /* :any */{
	// Load the package.json file to fetch `name` for debugging and `editions` for loading
	var packagePath = pathUtil.resolve(cwd, 'package.json');

	var _require = require(packagePath),
	    name = _require.name,
	    editions = _require.editions;

	var opts /* :options */ = { cwd: cwd, require: require };
	if (name) opts["package"] = name;
	if (entry) opts.entry = entry;
	return requireEditions(editions, opts);
}

// Exports
module.exports = { requireEdition: requireEdition, requireEditions: requireEditions, requirePackage: requirePackage };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2FuYW5tYXkzLy5hdG9tL3BhY2thZ2VzL2ZsZXgtdG9vbC1iYXIvbm9kZV9tb2R1bGVzL2VkaXRpb25zL2VzMjAxNS9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUVBLFlBQVksQ0FBQzs7OztBQUliLFNBQVMsZUFBZSxDQUFDLFFBQVEsRUFBRSxXQUFXLEVBQUU7QUFBRSxLQUFJLEVBQUUsUUFBUSxZQUFZLFdBQVcsQ0FBQSxBQUFDLEVBQUU7QUFBRSxRQUFNLElBQUksU0FBUyxDQUFDLG1DQUFtQyxDQUFDLENBQUM7RUFBRTtDQUFFOztBQUV6SixTQUFTLDBCQUEwQixDQUFDLElBQUksRUFBRSxJQUFJLEVBQUU7QUFBRSxLQUFJLENBQUMsSUFBSSxFQUFFO0FBQUUsUUFBTSxJQUFJLGNBQWMsQ0FBQywyREFBMkQsQ0FBQyxDQUFDO0VBQUUsQUFBQyxPQUFPLElBQUksS0FBSyxPQUFPLElBQUksS0FBSyxRQUFRLElBQUksT0FBTyxJQUFJLEtBQUssVUFBVSxDQUFBLEFBQUMsR0FBRyxJQUFJLEdBQUcsSUFBSSxDQUFDO0NBQUU7O0FBRWhQLFNBQVMsU0FBUyxDQUFDLFFBQVEsRUFBRSxVQUFVLEVBQUU7QUFBRSxLQUFJLE9BQU8sVUFBVSxLQUFLLFVBQVUsSUFBSSxVQUFVLEtBQUssSUFBSSxFQUFFO0FBQUUsUUFBTSxJQUFJLFNBQVMsQ0FBQywwREFBMEQsR0FBRyxPQUFPLFVBQVUsQ0FBQyxDQUFDO0VBQUUsQUFBQyxRQUFRLENBQUMsU0FBUyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsVUFBVSxJQUFJLFVBQVUsQ0FBQyxTQUFTLEVBQUUsRUFBRSxXQUFXLEVBQUUsRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxZQUFZLEVBQUUsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDLEFBQUMsSUFBSSxVQUFVLEVBQUUsTUFBTSxDQUFDLGNBQWMsR0FBRyxN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LElBQUksRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsZUFBZSxFQUFFLENBQUMsQ0FBQztDQUMvSTs7Ozs7Ozs7O0FBU0QsU0FBUyxjQUFjLENBQUMsR0FBRyxlQUFnQixPQUFPLGlCQUFrQixLQUFLLDhCQUE4Qjs7QUFFdEcsS0FBSSxXQUFXLEdBQUcsUUFBUSxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsY0FBYyxDQUFDLENBQUM7O0FBRXhELEtBQUksUUFBUSxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUM7S0FDL0IsSUFBSSxHQUFHLFFBQVEsQ0FBQyxJQUFJO0tBQ3BCLFFBQVEsR0FBRyxRQUFRLENBQUMsUUFBUSxDQUFDOztBQUVqQyxLQUFJLElBQUksa0JBQWtCLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLENBQUM7QUFDekQsS0FBSSxJQUFJLEVBQUUsSUFBSSxXQUFRLEdBQUcsSUFBSSxDQUFDO0FBQzlCLEtBQUksS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO0FBQzlCLFFBQU8sZUFBZSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQztDQUN2Qzs7O0FBR0QsTUFBTSxDQUFDLE9BQU8sR0FBRyxFQUFFLGNBQWMsRUFBRSxjQUFjLEVBQUUsZUFBZSxFQUFFLGVBQWUsRUFBRSxjQUFjLEVBQUUsY0FBYyxFQUFFLENBQUMiLCJmaWxlIjoiL2hvbWUvYW5hbm1heTMvLmF0b20vcGFja2FnZXMvZmxleC10b29sLWJhci9ub2RlX21vZHVsZXMvZWRpdGlvbnMvZXMyMDE1L2luZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogQGZsb3cgKi9cbi8qIGVzbGludCBuby1jb25zb2xlOjAgKi9cbid1c2Ugc3RyaWN0JztcblxuLy8gSW1wb3J0c1xuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG5mdW5jdGlvbiBfcG9zc2libGVDb25zdHJ1Y3RvclJldHVybihzZWxmLCBjYWxsKSB7IGlmICghc2VsZikgeyB0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoXCJ0aGlzIGhhc24ndCBiZWVuIGluaXRpYWxpc2VkIC0gc3VwZXIoKSBoYXNuJ3QgYmVlbiBjYWxsZWRcIik7IH0gcmV0dXJuIGNhbGwgJiYgKHR5cGVvZiBjYWxsID09PSBcIm9iamVjdFwiIHx8IHR5cGVvZiBjYWxsID09PSBcImZ1bmN0aW9uXCIpID8gY2FsbCA6IHNlbGY7IH1cblxuZnVuY3Rpb24gX2luaGVyaXRzKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7IGlmICh0eXBlb2Ygc3VwZXJDbGFzcyAhPT0gXCJmdW5jdGlvblwiICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uLCBub3QgXCIgKyB0eXBlb2Ygc3VwZXJDbGFzcyk7IH0gc3ViQ2xhc3MucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckNsYXNzICYmIHN1cGVyQ2xhc3MucHJvdG90eXBlLCB7IGNvbnN0cnVjdG9yOiB7IHZhbHVlOiBzdWJDbGFzcywgZW51bWVyYWJsZTogZmFsc2UsIHdyaXRhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUgfSB9KTsgaWYgKHN1cGVyQ2xhc3MpIE9iamVjdC5zZXRQcm90b3R5cGVPZiA/IE9iamVjdC5zZXRQcm90b3R5cGVPZihzdWJDbGFzcywgc3VwZXJDbGFzcykgOiBzdWJDbGFzcy5fX3Byb3RvX18gPSBzdXBlckNsYXNzOyB9XG5cbnZhciBwYXRoVXRpbCA9IHJlcXVpcmUoJ3BhdGgnKTtcblxuLy8gSGVscGVyIGNsYXNzIHRvIGRpc3BsYXkgbmVzdGVkIGVycm9yIGluIGEgc2Vuc2libGUgd2F5XG5cbnZhciBEZXRhaWxlZEVycm9yID0gZnVuY3Rpb24gKF9FcnJvcikge1xuXHRfaW5oZXJpdHMoRGV0YWlsZWRFcnJvciwgX0Vycm9yKTtcblxuXHRmdW5jdGlvbiBEZXRhaWxlZEVycm9yKG1lc3NhZ2UgLyogOnN0cmluZyAqLywgZGV0YWlscyAvKiA6T2JqZWN0ICovKSB7XG5cdFx0X2NsYXNzQ2FsbENoZWNrKHRoaXMsIERldGFpbGVkRXJyb3IpO1xuXG5cdFx0T2JqZWN0LmtleXMoZGV0YWlscykuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG5cdFx0XHR2YXIgZGF0YSA9IGRldGFpbHNba2V5XTtcblx0XHRcdHZhciB2YWx1ZSA9IHJlcXVpcmUoJ3V0aWwnKS5pbnNwZWN0KGRhdGEuc3RhY2sgfHwgZGF0YS5tZXNzYWdlIHx8IGRhdGEpO1xuXHRcdFx0bWVzc2FnZSArPSAnXFxuJyArIGtleSArICc6ICcgKyB2YWx1ZTtcblx0XHR9KTtcblx0XHRyZXR1cm4gX3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4odGhpcywgKERldGFpbGVkRXJyb3IuX19wcm90b19fIHx8IE9iamVjdC5nZXRQcm90b3R5cGVPZihEZXRhaWxlZEVycm9yKSkuY2FsbCh0aGlzLCBtZXNzYWdlKSk7XG5cdH1cblxuXHRyZXR1cm4gRGV0YWlsZWRFcnJvcjtcbn0oRXJyb3IpO1xuXG4vLyBFbnZpcm9ubWVudCBmZXRjaGluZ1xuXG5cbnZhciBibGFja2xpc3QgPSBwcm9jZXNzICYmIHByb2Nlc3MuZW52ICYmIHByb2Nlc3MuZW52LkVESVRJT05TX1NZTlRBWF9CTEFDS0xJU1QgJiYgcHJvY2Vzcy5lbnYuRURJVElPTlNfU1lOVEFYX0JMQUNLTElTVC5zcGxpdCgnLCcpO1xuXG4vLyBDYWNoZSBvZiB3aGljaCBzeW50YXggY29tYmluYXRpb25zIGFyZSBzdXBwb3J0ZWQgb3IgdW5zdXBwb3J0ZWQsIGhhc2ggb2YgYm9vbGVhbnNcbnZhciBzeW50YXhGYWlsZWRDb21iaXRpb25zID0ge307IC8vIHNvcnRlZCBsb3dlcmNhc2Ugc3ludGF4IGNvbWJpbmF0aW9uID0+IEVycm9yIGluc3RhbmNlIG9mIGZhaWx1cmVcbnZhciBzeW50YXhCbGFja2xpc3QgPSB7fTtcbnN5bnRheEJsYWNrbGlzdC5pbXBvcnQgPSBuZXcgRXJyb3IoJ1RoZSBpbXBvcnQgc3ludGF4IGlzIHNraXBwZWQgYXMgdGhlIG1vZHVsZSBwYWNrYWdlLmpzb24gZmllbGQgZWxpbWluYXRlcyB0aGUgbmVlZCBmb3IgYXV0b2xvYWRlciBzdXBwb3J0Jyk7XG5zeW50YXhCbGFja2xpc3QuY29mZmVlc2NyaXB0ID0gbmV3IEVycm9yKCdUaGUgY29mZmVlc2NyaXB0IHN5bnRheCBpcyBza2lwcGVkIGFzIHdlIHdhbnQgdG8gdXNlIGEgcHJlY29tcGlsZWQgZWRpdGlvbiByYXRoZXIgdGhhbiBjb21waWxpbmcgYXQgcnVudGltZScpO1xuc3ludGF4QmxhY2tsaXN0LnR5cGVzY3JpcHQgPSBuZXcgRXJyb3IoJ1RoZSB0eXBlc2NyaXB0IHN5bnRheCBpcyBza2lwcGVkIGFzIHdlIHdhbnQgdG8gdXNlIGEgcHJlY29tcGlsZWQgZWRpdGlvbiByYXRoZXIgdGhhbiBjb21waWxpbmcgYXQgcnVudGltZScpO1xuXG4vLyBCbGFja2xpc3Qgbm9uLWVzbmV4dCBub2RlIHZlcnNpb25zIGZyb20gZXNuZXh0XG5pZiAocHJvY2VzcyAmJiBwcm9jZXNzLnZlcnNpb25zICYmIHByb2Nlc3MudmVyc2lvbnMubm9kZSkge1xuXHR2YXIgRUFSTElFU1RfRVNORVhUX05PREVfVkVSU0lPTiA9IFswLCAxMl07XG5cdHZhciBOT0RFX1ZFUlNJT04gPSBwcm9jZXNzLnZlcnNpb25zLm5vZGUuc3BsaXQoJy4nKS5tYXAoZnVuY3Rpb24gKG4pIHtcblx0XHRyZXR1cm4gcGFyc2VJbnQobiwgMTApO1xuXHR9KTtcblx0dmFyIEVTTkVYVF9VTlNVUFBPUlRFRCA9IE5PREVfVkVSU0lPTlswXSA8IEVBUkxJRVNUX0VTTkVYVF9OT0RFX1ZFUlNJT05bMF0gfHwgTk9ERV9WRVJTSU9OWzBdID09PSBFQVJMSUVTVF9FU05FWFRfTk9ERV9WRVJTSU9OWzBdICYmIE5PREVfVkVSU0lPTlsxXSA8IEVBUkxJRVNUX0VTTkVYVF9OT0RFX1ZFUlNJT05bMV07XG5cdGlmIChFU05FWFRfVU5TVVBQT1JURUQpIHN5bnRheEJsYWNrbGlzdC5lc25leHQgPSBuZXcgRXJyb3IoJ1RoZSBlc25leHQgc3ludGF4IGlzIHNraXBwZWQgb24gZWFybHkgbm9kZSB2ZXJzaW9ucyBhcyBhdHRlbXB0aW5nIHRvIHVzZSBlc25leHQgZmVhdHVyZXMgd2lsbCBvdXRwdXQgZGVidWdnaW5nIGluZm9ybWF0aW9uIG9uIHRoZXNlIG5vZGUgdmVyc2lvbnMnKTtcbn1cblxuLy8gQ2hlY2sgdGhlIGVudmlyb25tZW50IGNvbmZpZ3VyYXRpb24gZm9yIGEgc3ludGF4IGJsYWNrbGlzdFxuaWYgKGJsYWNrbGlzdCkge1xuXHRmb3IgKHZhciBpID0gMDsgaSA8IGJsYWNrbGlzdC5sZW5ndGg7ICsraSkge1xuXHRcdHZhciBzeW50YXggPSBibGFja2xpc3RbaV0udHJpbSgpLnRvTG93ZXJDYXNlKCk7XG5cdFx0c3ludGF4QmxhY2tsaXN0W3N5bnRheF0gPSBuZXcgRGV0YWlsZWRFcnJvcignVGhlIEVESVRJT05TX1NZTlRBWF9CTEFDS0xJU1QgZW52aXJvbm1lbnQgdmFyaWFibGUgaGFzIGJsYWNrbGlzdGVkIGFuIGVkaXRpb24gc3ludGF4OicsIHsgc3ludGF4OiBzeW50YXgsIGJsYWNrbGlzdDogYmxhY2tsaXN0IH0pO1xuXHR9XG59XG5cbi8qIDo6XG50eXBlIGVkaXRpb24gPSB7XG5cdG5hbWU6bnVtYmVyLFxuXHRkZXNjcmlwdGlvbj86c3RyaW5nLFxuXHRkaXJlY3Rvcnk/OnN0cmluZyxcblx0ZW50cnk/OnN0cmluZyxcblx0c3ludGF4ZXM/OkFycmF5PHN0cmluZz5cbn07XG50eXBlIG9wdGlvbnMgPSB7XG5cdGN3ZD86c3RyaW5nLFxuXHRwYWNrYWdlPzpzdHJpbmcsXG5cdGVudHJ5PzpzdHJpbmcsXG5cdHJlcXVpcmU6ZnVuY3Rpb25cbn07XG4qL1xuXG4vKipcbiAqIEN5Y2xlIHRocm91Z2ggdGhlIGVkaXRpb25zIGFuZCByZXF1aXJlIHRoZSBjb3JyZWN0IG9uZVxuICogQHByb3RlY3RlZCBpbnRlcm5hbCBmdW5jdGlvbiB0aGF0IGlzIHVudGVzdGVkIGZvciBwdWJsaWMgY29uc3VtcHRpb25cbiAqIEBwYXJhbSB7ZWRpdGlvbn0gZWRpdGlvbiAtIHRoZSBlZGl0aW9uIGVudHJ5XG4gKiBAcGFyYW0ge09iamVjdH0gb3B0cyAtIHRoZSBmb2xsb3dpbmcgb3B0aW9uc1xuICogQHBhcmFtIHtzdHJpbmd9IG9wdHMucmVxdWlyZSAtIHRoZSByZXF1aXJlIG1ldGhvZCBvZiB0aGUgY2FsbGluZyBtb2R1bGUsIHVzZWQgdG8gZW5zdXJlIHJlcXVpcmUgcGF0aHMgcmVtYWluIGNvcnJlY3RcbiAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0cy5jd2RdIC0gaWYgcHJvdmlkZWQsIHRoaXMgd2lsbCBiZSB0aGUgY3dkIGZvciBlbnRyaWVzXG4gKiBAcGFyYW0ge3N0cmluZ30gW29wdHMuZW50cnldIC0gaWYgcHJvdmlkZWQsIHNob3VsZCBiZSBhIHJlbGF0aXZlIG9yIGFic29sdXRlIHBhdGggdG8gdGhlIGVudHJ5IHBvaW50IG9mIHRoZSBlZGl0aW9uXG4gKiBAcGFyYW0ge3N0cmluZ30gW29wdHMucGFja2FnZV0gLSBpZiBwcm92aWRlZCwgc2hvdWxkIGJlIHRoZSBuYW1lIG9mIHRoZSBwYWNrYWdlIHRoYXQgd2UgYXJlIGxvYWRpbmcgdGhlIGVkaXRpb25zIGZvclxuICogQHJldHVybnMgeyp9XG4gKi9cbmZ1bmN0aW9uIHJlcXVpcmVFZGl0aW9uKGVkaXRpb24gLyogOmVkaXRpb24gKi8sIG9wdHMgLyogOm9wdGlvbnMgKi8pIC8qIDphbnkgKi97XG5cdC8vIFByZXZlbnQgcmVxdWlyZSBmcm9tIGJlaW5nIGluY2x1ZGVkIGluIGRlYnVnIGxvZ3Ncblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KG9wdHMsICdyZXF1aXJlJywgeyB2YWx1ZTogb3B0cy5yZXF1aXJlLCBlbnVtZXJhYmxlOiBmYWxzZSB9KTtcblxuXHQvLyBHZXQgdGhlIGNvcnJlY3QgZW50cnkgcGF0aFxuXHQvLyBBcyBvbGRlciB2ZXJzaW9ucyBvXG5cdHZhciBjd2QgPSBvcHRzLmN3ZCB8fCAnJztcblx0dmFyIGRpciA9IGVkaXRpb24uZGlyZWN0b3J5IHx8ICcnO1xuXHR2YXIgZW50cnkgPSBvcHRzLmVudHJ5IHx8IGVkaXRpb24uZW50cnkgfHwgJyc7XG5cdGlmIChkaXIgJiYgZW50cnkgJiYgZW50cnkuaW5kZXhPZihkaXIgKyAnLycpID09PSAwKSBlbnRyeSA9IGVudHJ5LnN1YnN0cmluZyhkaXIubGVuZ3RoICsgMSk7XG5cdC8vIF4gdGhpcyBzaG91bGQgbm90IGJlIG5lZWRlZCwgYnV0IGFzIHByZXZpb3VzIHZlcnNpb25zIG9mIGVkaXRpb25zIGluY2x1ZGVkIHRoZSBkaXJlY3RvcnkgaW5zaWRlIHRoZSBlbnRyeVxuXHQvLyBpdCB1bmZvcnR1bmF0ZWx5IGlzLCBhcyBzdWNoIHRoaXMgaXMgYSBzdGVwcGluZyBzdG9uZSBmb3IgdGhlIG5ldyBmb3JtYXQsIHRoZSBuZXcgZm9ybWF0IGJlaW5nXG5cdC8vIGlmIGVudHJ5IGlzIHNwZWNpZmllZCBieSBpdHNlbGYsIGl0IGlzIGN3ZCA9PiBlbnRyeVxuXHQvLyBpZiBlbnRyeSBpcyBzcGVjaWZpZWQgd2l0aCBhIGRpcmVjdG9yeSwgaXQgaXMgY3dkID0+IGRpciA9PiBlbnRyeVxuXHQvLyBpZiBlbnRyeSBpcyBub3Qgc3BlY2lmaWVkIGJ1dCBkaXIgaXMsIGl0IGlzIGN3ZCA9PiBkaXJcblx0Ly8gaWYgbmVpdGhlciBlbnRyeSBub3IgZGlyIGFyZSBzcGVjaWZpZWQsIHdlIGhhdmUgYSBwcm9ibGVtXG5cdGlmICghZGlyICYmICFlbnRyeSkge1xuXHRcdHZhciBlZGl0aW9uRmFpbHVyZSA9IG5ldyBEZXRhaWxlZEVycm9yKCdTa2lwcGVkIGVkaXRpb24gZHVlIHRvIG5vIGVudHJ5IG9yIGRpcmVjdG9yeSBiZWluZyBzcGVjaWZpZWQ6JywgeyBlZGl0aW9uOiBlZGl0aW9uLCBjd2Q6IGN3ZCwgZGlyOiBkaXIsIGVudHJ5OiBlbnRyeSB9KTtcblx0XHR0aHJvdyBlZGl0aW9uRmFpbHVyZTtcblx0fVxuXHR2YXIgZW50cnlQYXRoID0gcGF0aFV0aWwucmVzb2x2ZShjd2QsIGRpciwgZW50cnkpO1xuXG5cdC8vIENoZWNrIHN5bnRheCBzdXBwb3J0XG5cdC8vIENvbnZlcnQgc3ludGF4ZXMgaW50byBhIHNvcnRlZCBsb3dlcmNhc2Ugc3RyaW5nXG5cdHZhciBzeW50YXhlcyA9IGVkaXRpb24uc3ludGF4ZXMgJiYgZWRpdGlvbi5zeW50YXhlcy5tYXAoZnVuY3Rpb24gKGkpIHtcblx0XHRyZXR1cm4gaS50b0xvd2VyQ2FzZSgpO1xuXHR9KS5zb3J0KCk7XG5cdHZhciBzeW50YXhDb21iaW5hdGlvbiA9IHN5bnRheGVzICYmIHN5bnRheGVzLmpvaW4oJywgJyk7XG5cdGlmIChzeW50YXhlcyAmJiBzeW50YXhDb21iaW5hdGlvbikge1xuXHRcdC8vIENoZWNrIGlmIGFueSBvZiB0aGUgc3ludGF4ZXMgYXJlIHVuc3VwcG9ydGVkXG5cdFx0dmFyIHVuc3VwcG9ydGVkU3ludGF4ZXMgPSBzeW50YXhlcy5maWx0ZXIoZnVuY3Rpb24gKGkpIHtcblx0XHRcdHJldHVybiBzeW50YXhCbGFja2xpc3RbaS50b0xvd2VyQ2FzZSgpXTtcblx0XHR9KTtcblx0XHRpZiAodW5zdXBwb3J0ZWRTeW50YXhlcy5sZW5ndGgpIHtcblx0XHRcdHZhciBfZWRpdGlvbkZhaWx1cmUgPSBuZXcgRGV0YWlsZWRFcnJvcignU2tpcHBlZCBlZGl0aW9uIGR1ZSB0byBpdCBjb250YWluaW5nIGFuIHVuc3VwcG9ydGVkIHN5bnRheDonLCB7IGVkaXRpb246IGVkaXRpb24sIHVuc3VwcG9ydGVkU3ludGF4ZXM6IHVuc3VwcG9ydGVkU3ludGF4ZXMgfSk7XG5cdFx0XHR0aHJvdyBfZWRpdGlvbkZhaWx1cmU7XG5cdFx0fVxuXHRcdC8vIElzIHRoaXMgc3ludGF4IGNvbWJpbmF0aW9uIHVuc3VwcG9ydGVkPyBJZiBzbyBza2lwIGl0IHdpdGggYSBzb2Z0IGZhaWx1cmUgdG8gdHJ5IHRoZSBuZXh0IGVkaXRpb25cblx0XHRlbHNlIGlmIChzeW50YXhGYWlsZWRDb21iaXRpb25zW3N5bnRheENvbWJpbmF0aW9uXSkge1xuXHRcdFx0XHR2YXIgcHJldmlvdXNDb21iaW5hdGlvbkZhaWx1cmUgPSBzeW50YXhGYWlsZWRDb21iaXRpb25zW3N5bnRheENvbWJpbmF0aW9uXTtcblx0XHRcdFx0dmFyIF9lZGl0aW9uRmFpbHVyZTIgPSBuZXcgRGV0YWlsZWRFcnJvcignU2tpcHBlZCBlZGl0aW9uIGR1ZSB0byBpdHMgc3ludGF4IGNvbWJpbmF0aW9tIGZhaWxpbmcgcHJldmlvdXNseTonLCB7IGVkaXRpb246IGVkaXRpb24sIHByZXZpb3VzQ29tYmluYXRpb25GYWlsdXJlOiBwcmV2aW91c0NvbWJpbmF0aW9uRmFpbHVyZSB9KTtcblx0XHRcdFx0dGhyb3cgX2VkaXRpb25GYWlsdXJlMjtcblx0XHRcdH1cblx0fVxuXG5cdC8vIFRyeSBhbmQgbG9hZCB0aGlzIHN5bnRheCBjb21iaW5hdGlvblxuXHR0cnkge1xuXHRcdHJldHVybiBvcHRzLnJlcXVpcmUoZW50cnlQYXRoKTtcblx0fSBjYXRjaCAoZXJyb3IpIHtcblx0XHQvLyBOb3RlIHRoZSBlcnJvciB3aXRoIG1vcmUgZGV0YWlsc1xuXHRcdHZhciBfZWRpdGlvbkZhaWx1cmUzID0gbmV3IERldGFpbGVkRXJyb3IoJ0ZhaWxlZCB0byBsb2FkIHRoZSBlZGl0aW9uIGR1ZSB0byBhIGxvYWQgZXJyb3I6JywgeyBlZGl0aW9uOiBlZGl0aW9uLCBlcnJvcjogZXJyb3Iuc3RhY2sgfSk7XG5cblx0XHQvLyBCbGFja2xpc3QgdGhlIGNvbWJpbmF0aW9uLCBldmVuIGlmIGl0IG1heSBoYXZlIHdvcmtlZCBiZWZvcmVcblx0XHQvLyBQZXJoYXBzIGluIHRoZSBmdXR1cmUgbm90ZSBpZiB0aGF0IGlmIGl0IGRpZCB3b3JrIHByZXZpb3VzbHksIHRoZW4gd2Ugc2hvdWxkIGluc3RydWN0IG1vZHVsZSBvd25lcnMgdG8gYmUgbW9yZSBzcGVjaWZpYyB3aXRoIHRoZWlyIHN5bnRheGVzXG5cdFx0aWYgKHN5bnRheENvbWJpbmF0aW9uKSBzeW50YXhGYWlsZWRDb21iaXRpb25zW3N5bnRheENvbWJpbmF0aW9uXSA9IF9lZGl0aW9uRmFpbHVyZTM7XG5cblx0XHQvLyBDb250aW51ZSB0byB0aGUgbmV4dCBlZGl0aW9uXG5cdFx0dGhyb3cgX2VkaXRpb25GYWlsdXJlMztcblx0fVxufVxuXG4vKipcbiAqIEN5Y2xlIHRocm91Z2ggdGhlIGVkaXRpb25zIGFuZCByZXF1aXJlIHRoZSBjb3JyZWN0IG9uZVxuICogQHByb3RlY3RlZCBpbnRlcm5hbCBmdW5jdGlvbiB0aGF0IGlzIHVudGVzdGVkIGZvciBwdWJsaWMgY29uc3VtcHRpb25cbiAqIEBwYXJhbSB7QXJyYXk8ZWRpdGlvbj59IGVkaXRpb25zIC0gYW4gYXJyYXkgb2YgZWRpdGlvbiBlbnRyaWVzXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0cyAtIHRoZSBmb2xsb3dpbmcgb3B0aW9uc1xuICogQHBhcmFtIHtzdHJpbmd9IG9wdHMucmVxdWlyZSAtIHRoZSByZXF1aXJlIG1ldGhvZCBvZiB0aGUgY2FsbGluZyBtb2R1bGUsIHVzZWQgdG8gZW5zdXJlIHJlcXVpcmUgcGF0aHMgcmVtYWluIGNvcnJlY3RcbiAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0cy5jd2RdIC0gaWYgcHJvdmlkZWQsIHRoaXMgd2lsbCBiZSB0aGUgY3dkIGZvciBlbnRyaWVzXG4gKiBAcGFyYW0ge3N0cmluZ30gW29wdHMuZW50cnldIC0gaWYgcHJvdmlkZWQsIHNob3VsZCBiZSBhIHJlbGF0aXZlIHBhdGggdG8gdGhlIGVudHJ5IHBvaW50IG9mIHRoZSBlZGl0aW9uXG4gKiBAcGFyYW0ge3N0cmluZ30gW29wdHMucGFja2FnZV0gLSBpZiBwcm92aWRlZCwgc2hvdWxkIGJlIHRoZSBuYW1lIG9mIHRoZSBwYWNrYWdlIHRoYXQgd2UgYXJlIGxvYWRpbmcgdGhlIGVkaXRpb25zIGZvclxuICogQHJldHVybnMgeyp9XG4gKi9cbmZ1bmN0aW9uIHJlcXVpcmVFZGl0aW9ucyhlZGl0aW9ucyAvKiA6QXJyYXk8ZWRpdGlvbj4gKi8sIG9wdHMgLyogOm9wdGlvbnMgKi8pIC8qIDphbnkgKi97XG5cdC8vIEV4dHJhY3Rcblx0aWYgKG9wdHMucGFja2FnZSA9PSBudWxsKSBvcHRzLnBhY2thZ2UgPSAnY3VzdG9tIHJ1bnRpbWUgcGFja2FnZSc7XG5cblx0Ly8gQ2hlY2tcblx0aWYgKCFlZGl0aW9ucyB8fCBlZGl0aW9ucy5sZW5ndGggPT09IDApIHtcblx0XHR0aHJvdyBuZXcgRGV0YWlsZWRFcnJvcignTm8gZWRpdGlvbnMgd2VyZSBzcGVjaWZpZWQ6JywgeyBvcHRzOiBvcHRzIH0pO1xuXHR9XG5cblx0Ly8gTm90ZSB0aGUgbGFzdCBlcnJvciBtZXNzYWdlXG5cdHZhciBlZGl0aW9uRmFpbHVyZXMgPSBbXTtcblxuXHQvLyBDeWNsZSB0aHJvdWdoIHRoZSBlZGl0aW9uc1xuXHRmb3IgKHZhciBfaSA9IDA7IF9pIDwgZWRpdGlvbnMubGVuZ3RoOyArK19pKSB7XG5cdFx0dmFyIGVkaXRpb24gPSBlZGl0aW9uc1tfaV07XG5cdFx0dHJ5IHtcblx0XHRcdHJldHVybiByZXF1aXJlRWRpdGlvbihlZGl0aW9uLCBvcHRzKTtcblx0XHR9IGNhdGNoIChlcnIpIHtcblx0XHRcdGVkaXRpb25GYWlsdXJlcy5wdXNoKGVycik7XG5cdFx0fVxuXHR9XG5cblx0Ly8gVGhyb3VnaCB0aGUgZXJyb3IgYXMgbm8gZWRpdGlvbiBsb2FkZWRcblx0dGhyb3cgbmV3IERldGFpbGVkRXJyb3IoJ1RoZXJlIGFyZSBubyBzdWl0YWJsZSBlZGl0aW9ucyBmb3IgdGhpcyBlbnZpcm9ubWVudDonLCB7IG9wdHM6IG9wdHMsIGVkaXRpb25zOiBlZGl0aW9ucywgZmFpbHVyZXM6IGVkaXRpb25GYWlsdXJlcyB9KTtcbn1cblxuLyoqXG4gKiBDeWNsZSB0aHJvdWdoIHRoZSBlZGl0aW9ucyBmb3IgYSBwYWNrYWdlIGFuZCByZXF1aXJlIHRoZSBjb3JyZWN0IG9uZVxuICogQHBhcmFtIHtzdHJpbmd9IGN3ZCAtIHRoZSBwYXRoIG9mIHRoZSBwYWNrYWdlLCB1c2VkIHRvIGxvYWQgcGFja2FnZS5qc29uOmVkaXRpb25zIGFuZCBoYW5kbGUgcmVsYXRpdmUgZWRpdGlvbiBlbnRyeSBwb2ludHNcbiAqIEBwYXJhbSB7ZnVuY3Rpb259IHJlcXVpcmUgLSB0aGUgcmVxdWlyZSBtZXRob2Qgb2YgdGhlIGNhbGxpbmcgbW9kdWxlLCB1c2VkIHRvIGVuc3VyZSByZXF1aXJlIHBhdGhzIHJlbWFpbiBjb3JyZWN0XG4gKiBAcGFyYW0ge3N0cmluZ30gW2VudHJ5XSAtIGFuIG9wdGlvbmFsIG92ZXJyaWRlIGZvciB0aGUgZW50cnkgb2YgYW4gZWRpdGlvbiwgcmVxdWlyZXMgdGhlIGVkaXRpb24gdG8gc3BlY2lmeSBhIGBkaXJlY3RvcnlgIHByb3BlcnR5XG4gKiBAcmV0dXJucyB7Kn1cbiAqL1xuZnVuY3Rpb24gcmVxdWlyZVBhY2thZ2UoY3dkIC8qIDpzdHJpbmcgKi8sIHJlcXVpcmUgLyogOmZ1bmN0aW9uICovLCBlbnRyeSAvKiA6OiA/OnN0cmluZyAqLykgLyogOmFueSAqL3tcblx0Ly8gTG9hZCB0aGUgcGFja2FnZS5qc29uIGZpbGUgdG8gZmV0Y2ggYG5hbWVgIGZvciBkZWJ1Z2dpbmcgYW5kIGBlZGl0aW9uc2AgZm9yIGxvYWRpbmdcblx0dmFyIHBhY2thZ2VQYXRoID0gcGF0aFV0aWwucmVzb2x2ZShjd2QsICdwYWNrYWdlLmpzb24nKTtcblxuXHR2YXIgX3JlcXVpcmUgPSByZXF1aXJlKHBhY2thZ2VQYXRoKSxcblx0ICAgIG5hbWUgPSBfcmVxdWlyZS5uYW1lLFxuXHQgICAgZWRpdGlvbnMgPSBfcmVxdWlyZS5lZGl0aW9ucztcblxuXHR2YXIgb3B0cyAvKiA6b3B0aW9ucyAqLyA9IHsgY3dkOiBjd2QsIHJlcXVpcmU6IHJlcXVpcmUgfTtcblx0aWYgKG5hbWUpIG9wdHMucGFja2FnZSA9IG5hbWU7XG5cdGlmIChlbnRyeSkgb3B0cy5lbnRyeSA9IGVudHJ5O1xuXHRyZXR1cm4gcmVxdWlyZUVkaXRpb25zKGVkaXRpb25zLCBvcHRzKTtcbn1cblxuLy8gRXhwb3J0c1xubW9kdWxlLmV4cG9ydHMgPSB7IHJlcXVpcmVFZGl0aW9uOiByZXF1aXJlRWRpdGlvbiwgcmVxdWlyZUVkaXRpb25zOiByZXF1aXJlRWRpdGlvbnMsIHJlcXVpcmVQYWNrYWdlOiByZXF1aXJlUGFja2FnZSB9OyJdfQ==