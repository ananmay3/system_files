Object.defineProperty(exports, '__esModule', {
	value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/** @babel */

var UrlReplace = (function () {
	function UrlReplace() {
		_classCallCheck(this, UrlReplace);

		var repo = this.getRepositoryForActiveItem() || this.getRepositoryForProject();
		this.repoInfo = this.parseUrl(repo ? repo.getOriginURL() : null);
		this.info = {
			'repo-name': this.repoInfo.name,
			'repo-owner': this.repoInfo.owner,
			'atom-version': atom.getVersion()
		};
	}

	_createClass(UrlReplace, [{
		key: 'replace',
		value: function replace(url) {
			var re = /({[^}]*})/;

			var m = re.exec(url);
			while (m) {
				var _m = m;

				var _m2 = _slicedToArray(_m, 1);

				var matchedText = _m2[0];

				// eslint-disable-next-line no-param-reassign
				url = url.replace(m[0], this.getInfo(matchedText));

				m = re.exec(url);
			}

			return url;
		}
	}, {
		key: 'getInfo',
		value: function getInfo(key) {
			// eslint-disable-next-line no-param-reassign
			key = key.replace(/{([^}]*)}/, '$1');
			if (key in this.info) {
				return this.info[key];
			}

			return key;
		}
	}, {
		key: 'getRepositoryForActiveItem',
		value: function getRepositoryForActiveItem() {
			var item = atom.workspace.getActivePaneItem();
			var path = item && item.getPath && item.getPath();
			if (!path) {
				return;
			}

			var _atom$project$relativizePath = atom.project.relativizePath(path);

			var _atom$project$relativizePath2 = _slicedToArray(_atom$project$relativizePath, 1);

			var rootDir = _atom$project$relativizePath2[0];

			var rootDirIndex = atom.project.getPaths().indexOf(rootDir);
			if (rootDirIndex >= 0) {
				return atom.project.getRepositories()[rootDirIndex];
			}
		}
	}, {
		key: 'getRepositoryForProject',
		value: function getRepositoryForProject() {
			for (var repo of atom.project.getRepositories()) {
				if (repo) {
					return repo;
				}
			}
		}
	}, {
		key: 'parseUrl',
		value: function parseUrl(url) {
			var repoInfo = {
				owner: '',
				name: ''
			};

			if (!url) {
				return repoInfo;
			}

			var re = undefined;
			if (url.indexOf('http' >= 0)) {
				re = /github\.com\/([^/]*)\/([^/]*)\.git/;
			}
			if (url.indexOf('git@') >= 0) {
				re = /:([^/]*)\/([^/]*)\.git/;
			}
			var m = re.exec(url);

			if (m) {
				return { owner: m[1], name: m[2] };
			}

			return repoInfo;
		}
	}]);

	return UrlReplace;
})();

exports['default'] = UrlReplace;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2FuYW5tYXkzLy5hdG9tL3BhY2thZ2VzL2ZsZXgtdG9vbC1iYXIvbGliL3VybC1yZXBsYWNlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztJQUVxQixVQUFVO0FBQ25CLFVBRFMsVUFBVSxHQUNoQjt3QkFETSxVQUFVOztBQUU3QixNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsMEJBQTBCLEVBQUUsSUFBSSxJQUFJLENBQUMsdUJBQXVCLEVBQUUsQ0FBQztBQUNqRixNQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxZQUFZLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztBQUNqRSxNQUFJLENBQUMsSUFBSSxHQUFHO0FBQ1gsY0FBVyxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSTtBQUMvQixlQUFZLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLO0FBQ2pDLGlCQUFjLEVBQUUsSUFBSSxDQUFDLFVBQVUsRUFBRTtHQUNqQyxDQUFDO0VBQ0Y7O2NBVG1CLFVBQVU7O1NBV3ZCLGlCQUFDLEdBQUcsRUFBRTtBQUNaLE9BQU0sRUFBRSxHQUFHLFdBQVcsQ0FBQzs7QUFFdkIsT0FBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNyQixVQUFPLENBQUMsRUFBRTthQUNhLENBQUM7Ozs7UUFBaEIsV0FBVzs7O0FBRWxCLE9BQUcsR0FBRyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7O0FBRW5ELEtBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ2pCOztBQUVELFVBQU8sR0FBRyxDQUFDO0dBQ1g7OztTQUVNLGlCQUFDLEdBQUcsRUFBRTs7QUFFWixNQUFHLEdBQUcsR0FBRyxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDckMsT0FBSSxHQUFHLElBQUksSUFBSSxDQUFDLElBQUksRUFBRTtBQUNyQixXQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDdEI7O0FBRUQsVUFBTyxHQUFHLENBQUM7R0FDWDs7O1NBRXlCLHNDQUFHO0FBQzVCLE9BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztBQUNoRCxPQUFNLElBQUksR0FBRyxJQUFJLElBQUksSUFBSSxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDcEQsT0FBSSxDQUFDLElBQUksRUFBRTtBQUNWLFdBQU87SUFDUDs7c0NBQ2lCLElBQUksQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQzs7OztPQUE1QyxPQUFPOztBQUNkLE9BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQzlELE9BQUksWUFBWSxJQUFJLENBQUMsRUFBRTtBQUN0QixXQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsZUFBZSxFQUFFLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDcEQ7R0FDRDs7O1NBRXNCLG1DQUFHO0FBQ3pCLFFBQUssSUFBTSxJQUFJLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxlQUFlLEVBQUUsRUFBRTtBQUNsRCxRQUFJLElBQUksRUFBRTtBQUNULFlBQU8sSUFBSSxDQUFDO0tBQ1o7SUFDRDtHQUNEOzs7U0FFTyxrQkFBQyxHQUFHLEVBQUU7QUFDYixPQUFNLFFBQVEsR0FBRztBQUNoQixTQUFLLEVBQUUsRUFBRTtBQUNULFFBQUksRUFBRSxFQUFFO0lBQ1IsQ0FBQzs7QUFFRixPQUFJLENBQUMsR0FBRyxFQUFFO0FBQ1QsV0FBTyxRQUFRLENBQUM7SUFDaEI7O0FBRUQsT0FBSSxFQUFFLFlBQUEsQ0FBQztBQUNQLE9BQUksR0FBRyxDQUFDLE9BQU8sQ0FBQyxNQUFNLElBQUksQ0FBQyxDQUFDLEVBQUU7QUFDN0IsTUFBRSxHQUFHLG9DQUFvQyxDQUFDO0lBQzFDO0FBQ0QsT0FBSSxHQUFHLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRTtBQUM3QixNQUFFLEdBQUcsd0JBQXdCLENBQUM7SUFDOUI7QUFDRCxPQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDOztBQUV2QixPQUFJLENBQUMsRUFBRTtBQUNOLFdBQU8sRUFBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQztJQUNqQzs7QUFFRCxVQUFPLFFBQVEsQ0FBQztHQUNoQjs7O1FBakZtQixVQUFVOzs7cUJBQVYsVUFBVSIsImZpbGUiOiIvaG9tZS9hbmFubWF5My8uYXRvbS9wYWNrYWdlcy9mbGV4LXRvb2wtYmFyL2xpYi91cmwtcmVwbGFjZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKiBAYmFiZWwgKi9cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVXJsUmVwbGFjZSB7XG5cdGNvbnN0cnVjdG9yKCkge1xuXHRcdGNvbnN0IHJlcG8gPSB0aGlzLmdldFJlcG9zaXRvcnlGb3JBY3RpdmVJdGVtKCkgfHwgdGhpcy5nZXRSZXBvc2l0b3J5Rm9yUHJvamVjdCgpO1xuXHRcdHRoaXMucmVwb0luZm8gPSB0aGlzLnBhcnNlVXJsKHJlcG8gPyByZXBvLmdldE9yaWdpblVSTCgpIDogbnVsbCk7XG5cdFx0dGhpcy5pbmZvID0ge1xuXHRcdFx0J3JlcG8tbmFtZSc6IHRoaXMucmVwb0luZm8ubmFtZSxcblx0XHRcdCdyZXBvLW93bmVyJzogdGhpcy5yZXBvSW5mby5vd25lcixcblx0XHRcdCdhdG9tLXZlcnNpb24nOiBhdG9tLmdldFZlcnNpb24oKSxcblx0XHR9O1xuXHR9XG5cblx0cmVwbGFjZSh1cmwpIHtcblx0XHRjb25zdCByZSA9IC8oe1tefV0qfSkvO1xuXG5cdFx0bGV0IG0gPSByZS5leGVjKHVybCk7XG5cdFx0d2hpbGUgKG0pIHtcblx0XHRcdGNvbnN0IFttYXRjaGVkVGV4dF0gPSBtO1xuXHRcdFx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXBhcmFtLXJlYXNzaWduXG5cdFx0XHR1cmwgPSB1cmwucmVwbGFjZShtWzBdLCB0aGlzLmdldEluZm8obWF0Y2hlZFRleHQpKTtcblxuXHRcdFx0bSA9IHJlLmV4ZWModXJsKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdXJsO1xuXHR9XG5cblx0Z2V0SW5mbyhrZXkpIHtcblx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXBhcmFtLXJlYXNzaWduXG5cdFx0a2V5ID0ga2V5LnJlcGxhY2UoL3soW159XSopfS8sICckMScpO1xuXHRcdGlmIChrZXkgaW4gdGhpcy5pbmZvKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5pbmZvW2tleV07XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGtleTtcblx0fVxuXG5cdGdldFJlcG9zaXRvcnlGb3JBY3RpdmVJdGVtKCkge1xuXHRcdGNvbnN0IGl0ZW0gPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVQYW5lSXRlbSgpO1xuXHRcdGNvbnN0IHBhdGggPSBpdGVtICYmIGl0ZW0uZ2V0UGF0aCAmJiBpdGVtLmdldFBhdGgoKTtcblx0XHRpZiAoIXBhdGgpIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0Y29uc3QgW3Jvb3REaXJdID0gYXRvbS5wcm9qZWN0LnJlbGF0aXZpemVQYXRoKHBhdGgpO1xuXHRcdGNvbnN0IHJvb3REaXJJbmRleCA9IGF0b20ucHJvamVjdC5nZXRQYXRocygpLmluZGV4T2Yocm9vdERpcik7XG5cdFx0aWYgKHJvb3REaXJJbmRleCA+PSAwKSB7XG5cdFx0XHRyZXR1cm4gYXRvbS5wcm9qZWN0LmdldFJlcG9zaXRvcmllcygpW3Jvb3REaXJJbmRleF07XG5cdFx0fVxuXHR9XG5cblx0Z2V0UmVwb3NpdG9yeUZvclByb2plY3QoKSB7XG5cdFx0Zm9yIChjb25zdCByZXBvIG9mIGF0b20ucHJvamVjdC5nZXRSZXBvc2l0b3JpZXMoKSkge1xuXHRcdFx0aWYgKHJlcG8pIHtcblx0XHRcdFx0cmV0dXJuIHJlcG87XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0cGFyc2VVcmwodXJsKSB7XG5cdFx0Y29uc3QgcmVwb0luZm8gPSB7XG5cdFx0XHRvd25lcjogJycsXG5cdFx0XHRuYW1lOiAnJyxcblx0XHR9O1xuXG5cdFx0aWYgKCF1cmwpIHtcblx0XHRcdHJldHVybiByZXBvSW5mbztcblx0XHR9XG5cblx0XHRsZXQgcmU7XG5cdFx0aWYgKHVybC5pbmRleE9mKCdodHRwJyA+PSAwKSkge1xuXHRcdFx0cmUgPSAvZ2l0aHViXFwuY29tXFwvKFteL10qKVxcLyhbXi9dKilcXC5naXQvO1xuXHRcdH1cblx0XHRpZiAodXJsLmluZGV4T2YoJ2dpdEAnKSA+PSAwKSB7XG5cdFx0XHRyZSA9IC86KFteL10qKVxcLyhbXi9dKilcXC5naXQvO1xuXHRcdH1cblx0XHRjb25zdCBtID0gcmUuZXhlYyh1cmwpO1xuXG5cdFx0aWYgKG0pIHtcblx0XHRcdHJldHVybiB7b3duZXI6IG1bMV0sIG5hbWU6IG1bMl19O1xuXHRcdH1cblxuXHRcdHJldHVybiByZXBvSW5mbztcblx0fVxufVxuIl19