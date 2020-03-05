Object.defineProperty(exports, '__esModule', {
	value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

/** @babel */

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _util = require('util');

var _util2 = _interopRequireDefault(_util);

var _fsPlus = require('fs-plus');

var _fsPlus2 = _interopRequireDefault(_fsPlus);

var _globToRegexp = require('glob-to-regexp');

var _globToRegexp2 = _interopRequireDefault(_globToRegexp);

var _atom = require('atom');

var _changeCase = require('change-case');

var _changeCase2 = _interopRequireDefault(_changeCase);

var VALID_EXTENSIONS = ['.cson', '.coffee', '.json5', '.json', '.js'];

exports['default'] = {
	toolBar: null,
	configFilePath: null,
	activeItem: null,
	buttonTypes: [],
	configWatcher: null,
	projectConfigwatcher: null,
	functionConditions: [],
	functionPoll: null,
	conditionTypes: {},

	config: {
		persistentProjectToolBar: {
			description: 'Project tool bar will stay when focus is moved away from a project file',
			type: 'boolean',
			'default': false
		},
		pollFunctionConditionsToReloadWhenChanged: {
			type: 'integer',
			description: 'set to 0 to stop polling',
			'default': 300,
			minimum: 0
		},
		reloadToolBarNotification: {
			type: 'boolean',
			'default': true
		},
		reloadToolBarWhenEditConfigFile: {
			type: 'boolean',
			'default': true
		},
		toolBarConfigurationFilePath: {
			type: 'string',
			'default': atom.getConfigDirPath()
		},
		toolBarProjectConfigurationFilePath: {
			type: 'string',
			'default': '.'
		},
		useBrowserPlusWhenItIsActive: {
			type: 'boolean',
			'default': false
		}
	},

	activate: function activate() {
		this.subscriptions = new _atom.CompositeDisposable();
		this.changeTextEditorSubscriptions = new _atom.CompositeDisposable();

		require('atom-package-deps').install('flex-tool-bar');

		this.activeItem = this.getActiveItem();
		this.registerTypes();
		this.registerCommands();
		this.registerEvents();
		this.observeConfig();

		this.resolveConfigPath();
		this.registerWatch();

		this.resolveProjectConfigPath();
		this.registerProjectWatch();

		this.reloadToolbar();
	},

	pollFunctions: function pollFunctions() {
		var _this = this;

		if (!this.conditionTypes['function']) {
			return;
		}
		var pollTimeout = atom.config.get('flex-tool-bar.pollFunctionConditionsToReloadWhenChanged');
		if (this.functionConditions.length === 0 && pollTimeout === 0) {
			return;
		}

		this.functionPoll = setTimeout(function () {

			if (!_this.activeItem) {
				return;
			}

			var reload = false;

			for (var condition of _this.functionConditions) {
				try {
					if (condition.value !== !!condition.func(_this.activeItem.item)) {
						reload = true;
						break;
					}
				} catch (err) {
					var buttons = [{
						text: 'Edit Config',
						onDidClick: function onDidClick() {
							return atom.workspace.open(_this.configFilePath);
						}
					}];
					if (_this.projectConfigFilePath) {
						buttons.push([{
							text: 'Edit Project Config',
							onDidClick: function onDidClick() {
								return atom.workspace.open(_this.projectConfigFilePath);
							}
						}]);
					}
					atom.notifications.addError('Invalid toolbar config', {
						detail: err.stack ? err.stack : err.toString(),
						dismissable: true,
						buttons: buttons
					});
					return;
				}
			}

			if (reload) {
				_this.reloadToolbar();
			} else {
				_this.pollFunctions();
			}
		}, pollTimeout);
	},

	observeConfig: function observeConfig() {
		var _this2 = this;

		this.subscriptions.add(atom.config.onDidChange('flex-tool-bar.persistentProjectToolBar', function (_ref) {
			var newValue = _ref.newValue;

			_this2.unregisterProjectWatch();
			if (_this2.resolveProjectConfigPath(null, newValue)) {
				_this2.registerProjectWatch();
			}
			_this2.reloadToolbar();
		}));

		this.subscriptions.add(atom.config.onDidChange('flex-tool-bar.pollFunctionConditionsToReloadWhenChanged', function (_ref2) {
			var newValue = _ref2.newValue;

			clearTimeout(_this2.functionPoll);
			if (newValue !== 0) {
				_this2.pollFunctions();
			}
		}));

		this.subscriptions.add(atom.config.onDidChange('flex-tool-bar.reloadToolBarWhenEditConfigFile', function (_ref3) {
			var newValue = _ref3.newValue;

			_this2.unregisterWatch();
			_this2.unregisterProjectWatch();
			if (newValue) {
				_this2.registerWatch(true);
				_this2.registerProjectWatch(true);
			}
		}));

		this.subscriptions.add(atom.config.onDidChange('flex-tool-bar.toolBarConfigurationFilePath', function (_ref4) {
			var newValue = _ref4.newValue;

			_this2.unregisterWatch();
			if (_this2.resolveConfigPath(newValue, false)) {
				_this2.registerWatch();
			}
			_this2.reloadToolbar();
		}));

		this.subscriptions.add(atom.config.onDidChange('flex-tool-bar.toolBarProjectConfigurationFilePath', function (_ref5) {
			var newValue = _ref5.newValue;

			_this2.unregisterProjectWatch();
			if (_this2.resolveProjectConfigPath(newValue)) {
				_this2.registerProjectWatch();
			}
			_this2.reloadToolbar();
		}));
	},

	resolveConfigPath: function resolveConfigPath(configFilePath, createIfNotFound) {
		if (configFilePath == null) {
			configFilePath = atom.config.get('flex-tool-bar.toolBarConfigurationFilePath');
		}
		if (createIfNotFound == null) {
			createIfNotFound = true;
		}
		var configPath = configFilePath;
		if (!_fsPlus2['default'].isFileSync(configPath)) {
			configPath = _fsPlus2['default'].resolve(configPath, 'toolbar', VALID_EXTENSIONS);
		}

		if (configPath) {
			this.configFilePath = configPath;
			return true;
		} else if (createIfNotFound) {
			configPath = configFilePath;
			var exists = _fsPlus2['default'].existsSync(configPath);
			if (exists && _fsPlus2['default'].isDirectorySync(configPath) || !exists && !VALID_EXTENSIONS.includes(_path2['default'].extname(configPath))) {
				configPath = _path2['default'].resolve(configPath, 'toolbar.cson');
			}
			if (this.createConfig(configPath)) {
				this.configFilePath = configPath;
				return true;
			}
		}

		return false;
	},

	createConfig: function createConfig(configPath) {
		var _this3 = this;

		try {
			var ext = _path2['default'].extname(configPath);
			if (!VALID_EXTENSIONS.includes(ext)) {
				throw new Error('\'' + ext + '\' is not a valid extension. Please us one of [\'' + VALID_EXTENSIONS.join('\',\'') + '\']');
			}
			var content = _fsPlus2['default'].readFileSync(_path2['default'].resolve(__dirname, './defaults/toolbar' + ext));
			_fsPlus2['default'].writeFileSync(configPath, content);
			atom.notifications.addInfo('We created a Tool Bar config file for you...', {
				detail: configPath,
				dismissable: true,
				buttons: [{
					text: 'Edit Config',
					onDidClick: function onDidClick() {
						atom.workspace.open(configPath);
					}
				}]
			});
			return true;
		} catch (err) {
			var notification = atom.notifications.addError('Something went wrong creating the Tool Bar config file!', {
				detail: configPath + '\n\n' + (err.stack ? err.stack : err.toString()),
				dismissable: true,
				buttons: [{
					text: 'Reload Toolbar',
					onDidClick: function onDidClick() {
						notification.dismiss();
						_this3.resolveConfigPath();
						_this3.registerWatch();
						_this3.reloadToolbar();
					}
				}]
			});
			// eslint-disable-next-line no-console
			console.error(err);
			return false;
		}
	},

	resolveProjectConfigPath: function resolveProjectConfigPath(configFilePath, persistent) {
		if (configFilePath == null) {
			configFilePath = atom.config.get('flex-tool-bar.toolBarProjectConfigurationFilePath');
		}
		if (persistent == null) {
			persistent = atom.config.get('flex-tool-bar.persistentProjectToolBar');
		}
		if (!persistent || !_fsPlus2['default'].isFileSync(this.projectConfigFilePath)) {
			this.projectConfigFilePath = null;
		}

		if (this.activeItem && this.activeItem.project) {
			var projectPath = _path2['default'].join(this.activeItem.project, configFilePath);
			if (_fsPlus2['default'].isFileSync(projectPath)) {
				this.projectConfigFilePath = projectPath;
			} else {
				var found = _fsPlus2['default'].resolve(projectPath, 'toolbar', VALID_EXTENSIONS);
				if (found) {
					this.projectConfigFilePath = found;
				}
			}
		}

		if (this.projectConfigFilePath === this.configFilePath) {
			this.projectConfigFilePath = null;
		}

		return !!this.projectConfigFilePath;
	},

	registerCommands: function registerCommands() {
		var _this4 = this;

		this.subscriptions.add(atom.commands.add('atom-workspace', {
			'flex-tool-bar:edit-config-file': function flexToolBarEditConfigFile() {
				if (_this4.configFilePath) {
					atom.workspace.open(_this4.configFilePath);
				}
			}
		}));

		this.subscriptions.add(atom.commands.add('atom-workspace', {
			'flex-tool-bar:edit-project-config-file': function flexToolBarEditProjectConfigFile() {
				if (_this4.projectConfigFilePath) {
					atom.workspace.open(_this4.projectConfigFilePath);
				}
			}
		}));
	},

	registerEvents: function registerEvents() {
		var _this5 = this;

		this.subscriptions.add(atom.packages.onDidActivateInitialPackages(function () {
			if (_this5.conditionTypes['package']) {
				_this5.reloadToolbar();
			}

			_this5.subscriptions.add(atom.packages.onDidActivatePackage(function () {
				if (_this5.conditionTypes['package']) {
					_this5.reloadToolbar();
				}
			}));

			_this5.subscriptions.add(atom.packages.onDidDeactivatePackage(function () {
				if (_this5.conditionTypes['package']) {
					_this5.reloadToolbar();
				}
			}));
		}));

		this.subscriptions.add(atom.config.onDidChange(function () {
			if (_this5.conditionTypes.setting) {
				_this5.reloadToolbar();
			}
		}));

		this.subscriptions.add(atom.workspace.onDidChangeActiveTextEditor(this.onDidChangeItem.bind(this)));

		this.subscriptions.add(atom.workspace.onDidChangeActivePaneItem(this.onDidChangeItem.bind(this)));
	},

	onDidChangeItem: function onDidChangeItem() {
		var _this6 = this;

		var active = this.getActiveItem();

		if (!this.activeItem || this.activeItem.item === active.item) {
			return;
		}

		this.activeItem.item = active.item;
		this.activeItem.file = active.file;
		this.activeItem.grammar = active.grammar;

		this.changeTextEditorSubscriptions.dispose();
		this.changeTextEditorSubscriptions.clear();
		if (this.activeItem.item) {
			if (this.activeItem.item.onDidChangeGrammar) {
				this.changeTextEditorSubscriptions.add(this.activeItem.item.onDidChangeGrammar(function () {
					if (_this6.activeItem) {
						_this6.activeItem.grammar = _this6.getActiveItem().grammar;
						_this6.reloadToolbar();
					}
				}));
			}

			if (this.activeItem.item.onDidChangePath) {
				this.changeTextEditorSubscriptions.add(this.activeItem.item.onDidChangePath(function () {
					if (_this6.activeItem) {
						_this6.activeItem.file = _this6.getActiveItem().file;
						_this6.reloadToolbar();
					}
				}));
			}
		}

		var oldProject = this.activeItem.project;
		this.activeItem.project = active.project;
		if (oldProject !== this.activeItem.project) {
			this.unregisterProjectWatch();
			this.resolveProjectConfigPath();
			this.registerProjectWatch();
		}
		this.activeItem.grammar = active.grammar;
		this.reloadToolbar();
	},

	unregisterWatch: function unregisterWatch() {
		if (this.configWatcher) {
			this.configWatcher.dispose();
		}
		this.configWatcher = null;
	},

	registerWatch: _asyncToGenerator(function* (shouldWatch) {
		var _this7 = this;

		if (shouldWatch == null) {
			shouldWatch = atom.config.get('flex-tool-bar.reloadToolBarWhenEditConfigFile');
		}
		if (!shouldWatch || !this.configFilePath) {
			return;
		}

		if (this.configWatcher) {
			this.configWatcher.dispose();
		}
		this.configWatcher = yield (0, _atom.watchPath)(this.configFilePath, {}, function () {
			_this7.reloadToolbar(atom.config.get('flex-tool-bar.reloadToolBarNotification'));
		});
	}),

	unregisterProjectWatch: function unregisterProjectWatch() {
		if (this.projectConfigWatcher) {
			this.projectConfigWatcher.dispose();
		}
		this.projectConfigWatcher = null;
	},

	registerProjectWatch: _asyncToGenerator(function* (shouldWatch) {
		var _this8 = this;

		if (shouldWatch == null) {
			shouldWatch = atom.config.get('flex-tool-bar.reloadToolBarWhenEditConfigFile');
		}
		if (!shouldWatch || !this.projectConfigFilePath) {
			return;
		}

		if (this.projectConfigWatcher) {
			this.projectConfigWatcher.dispose();
		}
		this.projectConfigWatcher = yield (0, _atom.watchPath)(this.projectConfigFilePath, {}, function () {
			_this8.reloadToolbar(atom.config.get('flex-tool-bar.reloadToolBarNotification'));
		});
	}),

	registerTypes: function registerTypes() {
		var _this9 = this;

		var typeFiles = _fsPlus2['default'].listSync(_path2['default'].join(__dirname, './types'));
		typeFiles.forEach(function (typeFile) {
			var typeName = _path2['default'].basename(typeFile, '.js');
			_this9.buttonTypes[typeName] = require(typeFile);
		});
	},

	consumeToolBar: function consumeToolBar(toolBar) {
		this.toolBar = toolBar('flex-toolBar');
		this.reloadToolbar();
	},

	getToolbarView: function getToolbarView() {
		// This is an undocumented API that moved in tool-bar@1.1.0
		return this.toolBar.toolBarView || this.toolBar.toolBar;
	},

	reloadToolbar: function reloadToolbar(withNotification) {
		this.conditionTypes = {};
		clearTimeout(this.functionPoll);
		if (!this.toolBar) {
			return;
		}
		try {
			this.fixToolBarHeight();
			var toolBarButtons = this.loadConfig();
			this.removeButtons();
			this.addButtons(toolBarButtons);
			if (withNotification) {
				atom.notifications.addSuccess('The tool-bar was successfully updated.');
			}
			this.unfixToolBarHeight();
		} catch (error) {
			this.unfixToolBarHeight();
			atom.notifications.addError('Could not load your toolbar from `' + _fsPlus2['default'].tildify(this.configFilePath) + '`', { dismissable: true });
			throw error;
		}
	},

	fixToolBarHeight: function fixToolBarHeight() {
		var toolBarView = this.getToolbarView();
		if (!toolBarView || !toolBarView.element) {
			return;
		}
		toolBarView.element.style.height = this.getToolbarView().element.offsetHeight + 'px';
	},

	unfixToolBarHeight: function unfixToolBarHeight() {
		var toolBarView = this.getToolbarView();
		if (!toolBarView || !toolBarView.element) {
			return;
		}
		toolBarView.element.style.height = '';
	},

	addButtons: function addButtons(toolBarButtons) {
		var _this10 = this;

		var buttons = [];

		if (!toolBarButtons) {
			return buttons;
		}

		if (!Array.isArray(toolBarButtons)) {
			console.error('Invalid Toolbar Config', toolBarButtons);
			throw new Error('Invalid Toolbar Config');
		}

		var devMode = atom.inDevMode();
		this.functionConditions = [];
		var btnErrors = [];

		for (var btn of toolBarButtons) {

			var button, disable, hide;
			try {
				hide = btn.hide && this.checkConditions(btn.hide) || btn.show && !this.checkConditions(btn.show);
				disable = btn.disable && this.checkConditions(btn.disable) || btn.enable && !this.checkConditions(btn.enable);
			} catch (err) {
				btnErrors.push((err.message || err.toString()) + '\n' + _util2['default'].inspect(btn, { depth: 4 }));
				continue;
			}

			if (hide) {
				continue;
			}
			if (btn.mode && btn.mode === 'dev' && !devMode) {
				continue;
			}

			if (this.buttonTypes[btn.type]) {
				button = this.buttonTypes[btn.type](this.toolBar, btn, this.getActiveItem);
			}

			if (button && button.element) {
				if (btn.mode) {
					button.element.classList.add('tool-bar-mode-' + btn.mode);
				}

				if (btn.style) {
					for (var propName in btn.style) {
						var style = btn.style[propName];
						button.element.style[_changeCase2['default'].camelCase(propName)] = style;
					}
				}

				if (btn.hover && !disable) {
					button.element.addEventListener('mouseenter', this.onMouseEnter(btn), { passive: true });
					button.element.addEventListener('mouseleave', this.onMouseLeave(btn), { passive: true });
				}

				if (btn.className) {
					var ary = btn.className.split(',');
					for (var val of ary) {
						button.element.classList.add(val.trim());
					}
				}

				if (disable) {
					button.setEnabled(false);
				}
			}

			buttons.push(button);
		}

		if (btnErrors.length > 0) {
			var notificationButtons = [{
				text: 'Edit Config',
				onDidClick: function onDidClick() {
					return atom.workspace.open(_this10.configFilePath);
				}
			}];
			if (this.projectConfigFilePath) {
				notificationButtons.push([{
					text: 'Edit Project Config',
					onDidClick: function onDidClick() {
						return atom.workspace.open(_this10.projectConfigFilePath);
					}
				}]);
			}
			atom.notifications.addError('Invalid toolbar config', {
				detail: btnErrors.join('\n\n'),
				dismissable: true,
				buttons: notificationButtons
			});
		}

		this.pollFunctions();

		return buttons;
	},

	onMouseEnter: function onMouseEnter(btn) {
		return function () {
			// Map to hold the values as they were before the hover modifications.
			btn['preHoverVal'] = new Object();

			for (var propName in btn.hover) {
				var camelPropName = _changeCase2['default'].camelCase(propName);
				btn.preHoverVal[camelPropName] = this.style[camelPropName];
				this.style[camelPropName] = btn.hover[propName];
			}
		};
	},

	onMouseLeave: function onMouseLeave(btn) {
		return function () {
			for (var propName in btn.preHoverVal) {
				var style = btn.preHoverVal[propName];
				this.style[propName] = style;
			}
		};
	},

	removeCache: function removeCache(filePath) {
		delete require.cache[filePath];

		try {
			var relativeFilePath = _path2['default'].relative(_path2['default'].join(atom.getLoadSettings().resourcePath, 'static'), filePath);
			if (process.platform === 'win32') {
				relativeFilePath = relativeFilePath.replace(/\\/g, '/');
			}
			delete snapshotResult.customRequire.cache[relativeFilePath];
		} catch (err) {
			// most likely snapshotResult does not exist
		}
	},

	loadConfig: function loadConfig() {
		var _this11 = this;

		var CSON = undefined,
		    ext = undefined;
		var config = [{
			type: 'function',
			icon: 'tools',
			callback: function callback() {
				_this11.resolveConfigPath();
				_this11.registerWatch();
				_this11.reloadToolbar();
			},
			tooltip: 'Create Global Tool Bar Config'
		}];

		if (this.configFilePath) {
			var globalConfig = undefined;
			ext = _path2['default'].extname(this.configFilePath);
			this.removeCache(this.configFilePath);

			switch (ext) {
				case '.js':
				case '.json':
				case '.coffee':
					globalConfig = require(this.configFilePath);
					break;

				case '.json5':
					require('json5/lib/register');
					globalConfig = require(this.configFilePath);
					break;

				case '.cson':
					CSON = require('cson');
					globalConfig = CSON.requireCSONFile(this.configFilePath);
					break;

				default:
				// do nothing
			}

			if (globalConfig) {
				if (!Array.isArray(globalConfig)) {
					globalConfig = [globalConfig];
				}
				config = globalConfig;
			}
		}

		if (this.projectConfigFilePath) {
			var projConfig = [];
			ext = _path2['default'].extname(this.projectConfigFilePath);
			this.removeCache(this.projectConfigFilePath);

			switch (ext) {
				case '.js':
				case '.json':
				case '.coffee':
					projConfig = require(this.projectConfigFilePath);
					break;

				case '.json5':
					require('json5/lib/register');
					projConfig = require(this.projectConfigFilePath);
					break;

				case '.cson':
					CSON = require('cson');
					projConfig = CSON.requireCSONFile(this.projectConfigFilePath);
					break;

				default:
				// do nothing
			}

			config = config.concat(projConfig);
		}

		return config;
	},

	loopThrough: function loopThrough(items, func) {
		if (!Array.isArray(items)) {
			items = [items];
		}
		var ret = false;
		for (var item of items) {
			ret = func(item) || ret;
		}

		return !!ret;
	},

	checkConditions: function checkConditions(conditions) {
		var _this12 = this;

		return this.loopThrough(conditions, function (condition) {
			var ret = condition === true;

			if (typeof condition === 'string') {
				if (/^[^/]+\.(.*?)$/.test(condition)) {
					ret = _this12.patternCondition(condition) || ret;
				} else {
					ret = _this12.grammarCondition(condition) || ret;
				}
			} else if (typeof condition === 'function') {
				ret = _this12.functionCondition(condition) || ret;
			} else {

				if (condition['function']) {
					ret = _this12.loopThrough(condition['function'], _this12.functionCondition.bind(_this12)) || ret;
				}

				if (condition.grammar) {
					ret = _this12.loopThrough(condition.grammar, _this12.grammarCondition.bind(_this12)) || ret;
				}

				if (condition.pattern) {
					ret = _this12.loopThrough(condition.pattern, _this12.patternCondition.bind(_this12)) || ret;
				}

				if (condition['package']) {
					ret = _this12.loopThrough(condition['package'], _this12.packageCondition.bind(_this12)) || ret;
				}

				if (condition.setting) {
					ret = _this12.loopThrough(condition.setting, _this12.settingCondition.bind(_this12)) || ret;
				}
			}

			return ret;
		});
	},

	functionCondition: function functionCondition(condition) {
		this.conditionTypes['function'] = true;
		var value = !!condition(this.activeItem ? this.activeItem.item : null);

		this.functionConditions.push({
			func: condition,
			value: value
		});

		return value;
	},

	getActiveItem: function getActiveItem() {
		var active = {
			item: null,
			grammar: null,
			file: null,
			project: null
		};

		var editor = atom.workspace.getActiveTextEditor();
		if (editor) {
			var grammar = editor.getGrammar();
			active.item = editor;
			active.grammar = grammar && grammar.name.toLowerCase() || null;
			active.file = editor && editor.buffer && editor.buffer.file && editor.buffer.file.getPath() || null;
		} else {
			var item = atom.workspace.getCenter().getActivePaneItem();
			if (item && item.file) {
				active.item = item;
				active.file = item.file.getPath();
			}
		}

		if (active.file) {
			var _atom$project$relativizePath = atom.project.relativizePath(active.file);

			var _atom$project$relativizePath2 = _slicedToArray(_atom$project$relativizePath, 1);

			var project = _atom$project$relativizePath2[0];

			if (project) {
				active.project = project;
			}
		}

		return active;
	},

	grammarCondition: function grammarCondition(condition) {
		var _this13 = this;

		this.conditionTypes.grammar = true;
		return this.reversableStringCondition(condition, function (c) {
			return _this13.activeItem && _this13.activeItem.grammar && _this13.activeItem.grammar.includes(c.toLowerCase());
		});
	},

	patternCondition: function patternCondition(condition) {
		var _this14 = this;

		this.conditionTypes.pattern = true;
		return this.reversableStringCondition(condition, function (c) {
			return _this14.activeItem && _this14.activeItem.file && (0, _globToRegexp2['default'])(c, { extended: true }).test(_this14.activeItem.file);
		});
	},

	packageCondition: function packageCondition(condition) {
		this.conditionTypes['package'] = true;
		return this.reversableStringCondition(condition, function (c) {
			return atom.packages.isPackageLoaded(c) && !atom.packages.isPackageDisabled(c);
		});
	},

	settingCondition: function settingCondition(condition) {
		this.conditionTypes.setting = true;
		return this.reversableStringCondition(condition, function (c) {
			return atom.config.get(c);
		});
	},

	reversableStringCondition: function reversableStringCondition(condition, matches) {
		var result = false;
		var reverse = false;
		if (/^!/.test(condition)) {
			condition = condition.replace('!', '');
			reverse = true;
		}

		result = matches(condition);

		if (reverse) {
			result = !result;
		}
		return result;
	},

	removeButtons: function removeButtons() {
		if (this.toolBar && this.toolBar.removeItems) {
			this.toolBar.removeItems();
		}
	},

	deactivate: function deactivate() {
		this.unregisterWatch();
		this.unregisterProjectWatch();
		this.subscriptions.dispose();
		this.subscriptions = null;
		this.changeTextEditorSubscriptions.dispose();
		this.changeTextEditorSubscriptions = null;
		this.removeButtons();
		this.toolBar = null;
		clearTimeout(this.functionPoll);
		this.functionPoll = null;
		this.activeItem = null;
	},

	serialize: function serialize() {}
};
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2FuYW5tYXkzLy5hdG9tL3BhY2thZ2VzL2ZsZXgtdG9vbC1iYXIvbGliL2ZsZXgtdG9vbC1iYXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O29CQUVpQixNQUFNOzs7O29CQUNOLE1BQU07Ozs7c0JBQ1IsU0FBUzs7Ozs0QkFDQyxnQkFBZ0I7Ozs7b0JBQ00sTUFBTTs7MEJBQzlCLGFBQWE7Ozs7QUFFcEMsSUFBTSxnQkFBZ0IsR0FBRyxDQUN4QixPQUFPLEVBQ1AsU0FBUyxFQUNULFFBQVEsRUFDUixPQUFPLEVBQ1AsS0FBSyxDQUNMLENBQUM7O3FCQUVhO0FBQ2QsUUFBTyxFQUFFLElBQUk7QUFDYixlQUFjLEVBQUUsSUFBSTtBQUNwQixXQUFVLEVBQUUsSUFBSTtBQUNoQixZQUFXLEVBQUUsRUFBRTtBQUNmLGNBQWEsRUFBRSxJQUFJO0FBQ25CLHFCQUFvQixFQUFFLElBQUk7QUFDMUIsbUJBQWtCLEVBQUUsRUFBRTtBQUN0QixhQUFZLEVBQUUsSUFBSTtBQUNsQixlQUFjLEVBQUUsRUFBRTs7QUFFbEIsT0FBTSxFQUFFO0FBQ1AsMEJBQXdCLEVBQUU7QUFDekIsY0FBVyxFQUFFLHlFQUF5RTtBQUN0RixPQUFJLEVBQUUsU0FBUztBQUNmLGNBQVMsS0FBSztHQUNkO0FBQ0QsMkNBQXlDLEVBQUU7QUFDMUMsT0FBSSxFQUFFLFNBQVM7QUFDZixjQUFXLEVBQUUsMEJBQTBCO0FBQ3ZDLGNBQVMsR0FBRztBQUNaLFVBQU8sRUFBRSxDQUFDO0dBQ1Y7QUFDRCwyQkFBeUIsRUFBRTtBQUMxQixPQUFJLEVBQUUsU0FBUztBQUNmLGNBQVMsSUFBSTtHQUNiO0FBQ0QsaUNBQStCLEVBQUU7QUFDaEMsT0FBSSxFQUFFLFNBQVM7QUFDZixjQUFTLElBQUk7R0FDYjtBQUNELDhCQUE0QixFQUFFO0FBQzdCLE9BQUksRUFBRSxRQUFRO0FBQ2QsY0FBUyxJQUFJLENBQUMsZ0JBQWdCLEVBQUU7R0FDaEM7QUFDRCxxQ0FBbUMsRUFB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QUE2QixDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQzdDLE1BQUksQ0FBQyw2QkFBNkIsR0FBRyxJQUFJLENBQUM7QUFDMUMsTUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO0FBQ3JCLE1BQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO0FBQ3BCLGNBQVksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDaEMsTUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUM7QUFDekIsTUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7RUFDdkI7O0FBRUQsVUFBUyxFQUFBLHFCQUFHLEVBQUU7Q0FDZCIsImZpbGUiOiIvaG9tZS9hbmFubWF5My8uYXRvbS9wYWNrYWdlcy9mbGV4LXRvb2wtYmFyL2xpYi9mbGV4LXRvb2wtYmFyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqIEBiYWJlbCAqL1xuXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB1dGlsIGZyb20gJ3V0aWwnO1xuaW1wb3J0IGZzIGZyb20gJ2ZzLXBsdXMnO1xuaW1wb3J0IGdsb2JUb1JlZ2V4cCBmcm9tICdnbG9iLXRvLXJlZ2V4cCc7XG5pbXBvcnQgeyBDb21wb3NpdGVEaXNwb3NhYmxlLCB3YXRjaFBhdGggfSBmcm9tICdhdG9tJztcbmltcG9ydCBjaGFuZ2VDYXNlIGZyb20gJ2NoYW5nZS1jYXNlJztcblxuY29uc3QgVkFMSURfRVhURU5TSU9OUyA9IFtcblx0Jy5jc29uJyxcblx0Jy5jb2ZmZWUnLFxuXHQnLmpzb241Jyxcblx0Jy5qc29uJyxcblx0Jy5qcydcbl07XG5cbmV4cG9ydCBkZWZhdWx0IHtcblx0dG9vbEJhcjogbnVsbCxcblx0Y29uZmlnRmlsZVBhdGg6IG51bGwsXG5cdGFjdGl2ZUl0ZW06IG51bGwsXG5cdGJ1dHRvblR5cGVzOiBbXSxcblx0Y29uZmlnV2F0Y2hlcjogbnVsbCxcblx0cHJvamVjdENvbmZpZ3dhdGNoZXI6IG51bGwsXG5cdGZ1bmN0aW9uQ29uZGl0aW9uczogW10sXG5cdGZ1bmN0aW9uUG9sbDogbnVsbCxcblx0Y29uZGl0aW9uVHlwZXM6IHt9LFxuXG5cdGNvbmZpZzoge1xuXHRcdHBlcnNpc3RlbnRQcm9qZWN0VG9vbEJhcjoge1xuXHRcdFx0ZGVzY3JpcHRpb246ICdQcm9qZWN0IHRvb2wgYmFyIHdpbGwgc3RheSB3aGVuIGZvY3VzIGlzIG1vdmVkIGF3YXkgZnJvbSBhIHByb2plY3QgZmlsZScsXG5cdFx0XHR0eXBlOiAnYm9vbGVhbicsXG5cdFx0XHRkZWZhdWx0OiBmYWxzZSxcblx0XHR9LFxuXHRcdHBvbGxGdW5jdGlvbkNvbmRpdGlvbnNUb1JlbG9hZFdoZW5DaGFuZ2VkOiB7XG5cdFx0XHR0eXBlOiAnaW50ZWdlcicsXG5cdFx0XHRkZXNjcmlwdGlvbjogJ3NldCB0byAwIHRvIHN0b3AgcG9sbGluZycsXG5cdFx0XHRkZWZhdWx0OiAzMDAsXG5cdFx0XHRtaW5pbXVtOiAwLFxuXHRcdH0sXG5cdFx0cmVsb2FkVG9vbEJhck5vdGlmaWNhdGlvbjoge1xuXHRcdFx0dHlwZTogJ2Jvb2xlYW4nLFxuXHRcdFx0ZGVmYXVsdDogdHJ1ZSxcblx0XHR9LFxuXHRcdHJlbG9hZFRvb2xCYXJXaGVuRWRpdENvbmZpZ0ZpbGU6IHtcblx0XHRcdHR5cGU6ICdib29sZWFuJyxcblx0XHRcdGRlZmF1bHQ6IHRydWUsXG5cdFx0fSxcblx0XHR0b29sQmFyQ29uZmlndXJhdGlvbkZpbGVQYXRoOiB7XG5cdFx0XHR0eXBlOiAnc3RyaW5nJyxcblx0XHRcdGRlZmF1bHQ6IGF0b20uZ2V0Q29uZmlnRGlyUGF0aCgpLFxuXHRcdH0sXG5cdFx0dG9vbEJhclByb2plY3RDb25maWd1cmF0aW9uRmlsZVBhdGg6IHtcblx0XHRcdHR5cGU6ICdzdHJpbmcnLFxuXHRcdFx0ZGVmYXVsdDogJy4nLFxuXHRcdH0sXG5cdFx0dXNlQnJvd3NlclBsdXNXaGVuSXRJc0FjdGl2ZToge1xuXHRcdFx0dHlwZTogJ2Jvb2xlYW4nLFxuXHRcdFx0ZGVmYXVsdDogZmFsc2UsXG5cdFx0fSxcblx0fSxcblxuXHRhY3RpdmF0ZSgpIHtcblx0XHR0aGlzLnN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuXHRcdHRoaXMuY2hhbmdlVGV4dEVkaXRvclN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuXG5cdFx0cmVxdWlyZSgnYXRvbS1wYWNrYWdlLWRlcHMnKS5pbnN0YWxsKCdmbGV4LXRvb2wtYmFyJyk7XG5cblx0XHR0aGlzLmFjdGl2ZUl0ZW0gPSB0aGlzLmdldEFjdGl2ZUl0ZW0oKTtcblx0XHR0aGlzLnJlZ2lzdGVyVHlwZXMoKTtcblx0XHR0aGlzLnJlZ2lzdGVyQ29tbWFuZHMoKTtcblx0XHR0aGlzLnJlZ2lzdGVyRXZlbnRzKCk7XG5cdFx0dGhpcy5vYnNlcnZlQ29uZmlnKCk7XG5cblx0XHR0aGlzLnJlc29sdmVDb25maWdQYXRoKCk7XG5cdFx0dGhpcy5yZWdpc3RlcldhdGNoKCk7XG5cblx0XHR0aGlzLnJlc29sdmVQcm9qZWN0Q29uZmlnUGF0aCgpO1xuXHRcdHRoaXMucmVnaXN0ZXJQcm9qZWN0V2F0Y2goKTtcblxuXHRcdHRoaXMucmVsb2FkVG9vbGJhcigpO1xuXHR9LFxuXG5cdHBvbGxGdW5jdGlvbnMoKSB7XG5cdFx0aWYgKCF0aGlzLmNvbmRpdGlvblR5cGVzLmZ1bmN0aW9uKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdGNvbnN0IHBvbGxUaW1lb3V0ID0gYXRvbS5jb25maWcuZ2V0KCdmbGV4LXRvb2wtYmFyLnBvbGxGdW5jdGlvbkNvbmRpdGlvbnNUb1JlbG9hZFdoZW5DaGFuZ2VkJyk7XG5cdFx0aWYgKHRoaXMuZnVuY3Rpb25Db25kaXRpb25zLmxlbmd0aCA9PT0gMCAmJiBwb2xsVGltZW91dCA9PT0gMCkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdHRoaXMuZnVuY3Rpb25Qb2xsID0gc2V0VGltZW91dCgoKSA9PiB7XG5cblx0XHRcdGlmICghdGhpcy5hY3RpdmVJdGVtKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdFx0bGV0IHJlbG9hZCA9IGZhbHNlO1xuXG5cdFx0XHRmb3IgKGNvbnN0IGNvbmRpdGlvbiBvZiB0aGlzLmZ1bmN0aW9uQ29uZGl0aW9ucykge1xuXHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdGlmIChjb25kaXRpb24udmFsdWUgIT09ICEhY29uZGl0aW9uLmZ1bmModGhpcy5hY3RpdmVJdGVtLml0ZW0pKSB7XG5cdFx0XHRcdFx0XHRyZWxvYWQgPSB0cnVlO1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGNhdGNoIChlcnIpIHtcblx0XHRcdFx0XHRjb25zdCBidXR0b25zID0gW3tcblx0XHRcdFx0XHRcdHRleHQ6ICdFZGl0IENvbmZpZycsXG5cdFx0XHRcdFx0XHRvbkRpZENsaWNrOiAoKSA9PiBhdG9tLndvcmtzcGFjZS5vcGVuKHRoaXMuY29uZmlnRmlsZVBhdGgpXG5cdFx0XHRcdFx0fV07XG5cdFx0XHRcdFx0aWYgKHRoaXMucHJvamVjdENvbmZpZ0ZpbGVQYXRoKSB7XG5cdFx0XHRcdFx0XHRidXR0b25zLnB1c2goW3tcblx0XHRcdFx0XHRcdFx0dGV4dDogJ0VkaXQgUHJvamVjdCBDb25maWcnLFxuXHRcdFx0XHRcdFx0XHRvbkRpZENsaWNrOiAoKSA9PiBhdG9tLndvcmtzcGFjZS5vcGVuKHRoaXMucHJvamVjdENvbmZpZ0ZpbGVQYXRoKVxuXHRcdFx0XHRcdFx0fV0pO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoJ0ludmFsaWQgdG9vbGJhciBjb25maWcnLCB7XG5cdFx0XHRcdFx0XHRkZXRhaWw6IGVyci5zdGFjayA/IGVyci5zdGFjayA6IGVyci50b1N0cmluZygpLFxuXHRcdFx0XHRcdFx0ZGlzbWlzc2FibGU6IHRydWUsXG5cdFx0XHRcdFx0XHRidXR0b25zLFxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRpZiAocmVsb2FkKSB7XG5cdFx0XHRcdCB0aGlzLnJlbG9hZFRvb2xiYXIoKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRoaXMucG9sbEZ1bmN0aW9ucygpO1xuXHRcdFx0fVxuXHRcdH0sIHBvbGxUaW1lb3V0KTtcblx0fSxcblxuXHRvYnNlcnZlQ29uZmlnKCkge1xuXHRcdHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb25maWcub25EaWRDaGFuZ2UoJ2ZsZXgtdG9vbC1iYXIucGVyc2lzdGVudFByb2plY3RUb29sQmFyJywgKHtuZXdWYWx1ZX0pID0+IHtcblx0XHRcdHRoaXMudW5yZWdpc3RlclByb2plY3RXYXRjaCgpO1xuXHRcdFx0aWYgKHRoaXMucmVzb2x2ZVByb2plY3RDb25maWdQYXRoKG51bGwsIG5ld1ZhbHVlKSkge1xuXHRcdFx0XHR0aGlzLnJlZ2lzdGVyUHJvamVjdFdhdGNoKCk7XG5cdFx0XHR9XG5cdFx0XHR0aGlzLnJlbG9hZFRvb2xiYXIoKTtcblx0XHR9KSk7XG5cblx0XHR0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29uZmlnLm9uRGlkQ2hhbmdlKCdmbGV4LXRvb2wtYmFyLnBvbGxGdW5jdGlvbkNvbmRpdGlvbnNUb1JlbG9hZFdoZW5DaGFuZ2VkJywgKHtuZXdWYWx1ZX0pID0+IHtcblx0XHRcdGNsZWFyVGltZW91dCh0aGlzLmZ1bmN0aW9uUG9sbCk7XG5cdFx0XHRpZiAobmV3VmFsdWUgIT09IDApIHtcblx0XHRcdFx0dGhpcy5wb2xsRnVuY3Rpb25zKCk7XG5cdFx0XHR9XG5cdFx0fSkpO1xuXG5cdFx0dGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbmZpZy5vbkRpZENoYW5nZSgnZmxleC10b29sLWJhci5yZWxvYWRUb29sQmFyV2hlbkVkaXRDb25maWdGaWxlJywgKHtuZXdWYWx1ZX0pID0+IHtcblx0XHRcdHRoaXMudW5yZWdpc3RlcldhdGNoKCk7XG5cdFx0XHR0aGlzLnVucmVnaXN0ZXJQcm9qZWN0V2F0Y2goKTtcblx0XHRcdGlmIChuZXdWYWx1ZSkge1xuXHRcdFx0XHR0aGlzLnJlZ2lzdGVyV2F0Y2godHJ1ZSk7XG5cdFx0XHRcdHRoaXMucmVnaXN0ZXJQcm9qZWN0V2F0Y2godHJ1ZSk7XG5cdFx0XHR9XG5cdFx0fSkpO1xuXG5cdFx0dGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbmZpZy5vbkRpZENoYW5nZSgnZmxleC10b29sLWJhci50b29sQmFyQ29uZmlndXJhdGlvbkZpbGVQYXRoJywgKHtuZXdWYWx1ZX0pID0+IHtcblx0XHRcdHRoaXMudW5yZWdpc3RlcldhdGNoKCk7XG5cdFx0XHRpZiAodGhpcy5yZXNvbHZlQ29uZmlnUGF0aChuZXdWYWx1ZSwgZmFsc2UpKSB7XG5cdFx0XHRcdHRoaXMucmVnaXN0ZXJXYXRjaCgpO1xuXHRcdFx0fVxuXHRcdFx0dGhpcy5yZWxvYWRUb29sYmFyKCk7XG5cdFx0fSkpO1xuXG5cdFx0dGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbmZpZy5vbkRpZENoYW5nZSgnZmxleC10b29sLWJhci50b29sQmFyUHJvamVjdENvbmZpZ3VyYXRpb25GaWxlUGF0aCcsICh7bmV3VmFsdWV9KSA9PiB7XG5cdFx0XHR0aGlzLnVucmVnaXN0ZXJQcm9qZWN0V2F0Y2goKTtcblx0XHRcdGlmICh0aGlzLnJlc29sdmVQcm9qZWN0Q29uZmlnUGF0aChuZXdWYWx1ZSkpIHtcblx0XHRcdFx0dGhpcy5yZWdpc3RlclByb2plY3RXYXRjaCgpO1xuXHRcdFx0fVxuXHRcdFx0dGhpcy5yZWxvYWRUb29sYmFyKCk7XG5cdFx0fSkpO1xuXHR9LFxuXG5cdHJlc29sdmVDb25maWdQYXRoKGNvbmZpZ0ZpbGVQYXRoLCBjcmVhdGVJZk5vdEZvdW5kKSB7XG5cdFx0aWYgKGNvbmZpZ0ZpbGVQYXRoID09IG51bGwpIHtcblx0XHRcdGNvbmZpZ0ZpbGVQYXRoID0gYXRvbS5jb25maWcuZ2V0KCdmbGV4LXRvb2wtYmFyLnRvb2xCYXJDb25maWd1cmF0aW9uRmlsZVBhdGgnKTtcblx0XHR9XG5cdFx0aWYgKGNyZWF0ZUlmTm90Rm91bmQgPT0gbnVsbCkge1xuXHRcdFx0Y3JlYXRlSWZOb3RGb3VuZCA9IHRydWU7XG5cdFx0fVxuXHRcdGxldCBjb25maWdQYXRoID0gY29uZmlnRmlsZVBhdGg7XG5cdFx0aWYgKCFmcy5pc0ZpbGVTeW5jKGNvbmZpZ1BhdGgpKSB7XG5cdFx0XHRjb25maWdQYXRoID0gZnMucmVzb2x2ZShjb25maWdQYXRoLCAndG9vbGJhcicsIFZBTElEX0VYVEVOU0lPTlMpO1xuXHRcdH1cblxuXHRcdGlmIChjb25maWdQYXRoKSB7XG5cdFx0XHR0aGlzLmNvbmZpZ0ZpbGVQYXRoID0gY29uZmlnUGF0aDtcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH0gZWxzZSBpZiAoY3JlYXRlSWZOb3RGb3VuZCkge1xuXHRcdFx0Y29uZmlnUGF0aCA9IGNvbmZpZ0ZpbGVQYXRoO1xuXHRcdFx0Y29uc3QgZXhpc3RzID0gZnMuZXhpc3RzU3luYyhjb25maWdQYXRoKTtcblx0XHRcdGlmICgoZXhpc3RzICYmIGZzLmlzRGlyZWN0b3J5U3luYyhjb25maWdQYXRoKSkgfHwgKCFleGlzdHMgJiYgIVZBTElEX0VYVEVOU0lPTlMuaW5jbHVkZXMocGF0aC5leHRuYW1lKGNvbmZpZ1BhdGgpKSkpIHtcblx0XHRcdFx0Y29uZmlnUGF0aCA9IHBhdGgucmVzb2x2ZShjb25maWdQYXRoLCAndG9vbGJhci5jc29uJyk7XG5cdFx0XHR9XG5cdFx0XHRpZiAodGhpcy5jcmVhdGVDb25maWcoY29uZmlnUGF0aCkpIHtcblx0XHRcdFx0dGhpcy5jb25maWdGaWxlUGF0aCA9IGNvbmZpZ1BhdGg7XG5cdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiBmYWxzZTtcblx0fSxcblxuXHRjcmVhdGVDb25maWcoY29uZmlnUGF0aCkge1xuXHRcdHRyeSB7XG5cdFx0XHRjb25zdCBleHQgPSBwYXRoLmV4dG5hbWUoY29uZmlnUGF0aCk7XG5cdFx0XHRpZiAoIVZBTElEX0VYVEVOU0lPTlMuaW5jbHVkZXMoZXh0KSkge1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoYCcke2V4dH0nIGlzIG5vdCBhIHZhbGlkIGV4dGVuc2lvbi4gUGxlYXNlIHVzIG9uZSBvZiBbJyR7VkFMSURfRVhURU5TSU9OUy5qb2luKCdcXCcsXFwnJyl9J11gKTtcblx0XHRcdH1cblx0XHRcdGNvbnN0IGNvbnRlbnQgPSBmcy5yZWFkRmlsZVN5bmMocGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgYC4vZGVmYXVsdHMvdG9vbGJhciR7ZXh0fWApKTtcblx0XHRcdGZzLndyaXRlRmlsZVN5bmMoY29uZmlnUGF0aCwgY29udGVudCk7XG5cdFx0XHRhdG9tLm5vdGlmaWNhdGlvbnMuYWRkSW5mbygnV2UgY3JlYXRlZCBhIFRvb2wgQmFyIGNvbmZpZyBmaWxlIGZvciB5b3UuLi4nLCB7XG5cdFx0XHRcdGRldGFpbDogY29uZmlnUGF0aCxcblx0XHRcdFx0ZGlzbWlzc2FibGU6IHRydWUsXG5cdFx0XHRcdGJ1dHRvbnM6IFt7XG5cdFx0XHRcdFx0dGV4dDogJ0VkaXQgQ29uZmlnJyxcblx0XHRcdFx0XHRvbkRpZENsaWNrKCkge1xuXHRcdFx0XHRcdFx0YXRvbS53b3Jrc3BhY2Uub3Blbihjb25maWdQYXRoKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1dXG5cdFx0XHR9KTtcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH0gY2F0Y2ggKGVycikge1xuXHRcdFx0dmFyIG5vdGlmaWNhdGlvbiA9IGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcignU29tZXRoaW5nIHdlbnQgd3JvbmcgY3JlYXRpbmcgdGhlIFRvb2wgQmFyIGNvbmZpZyBmaWxlIScsIHtcblx0XHRcdFx0ZGV0YWlsOiBgJHtjb25maWdQYXRofVxcblxcbiR7ZXJyLnN0YWNrID8gZXJyLnN0YWNrIDogZXJyLnRvU3RyaW5nKCl9YCxcblx0XHRcdFx0ZGlzbWlzc2FibGU6IHRydWUsXG5cdFx0XHRcdGJ1dHRvbnM6IFt7XG5cdFx0XHRcdFx0dGV4dDogJ1JlbG9hZCBUb29sYmFyJyxcblx0XHRcdFx0XHRvbkRpZENsaWNrOiAoKSA9PiB7XG5cdFx0XHRcdFx0XHRub3RpZmljYXRpb24uZGlzbWlzcygpO1xuXHRcdFx0XHRcdFx0dGhpcy5yZXNvbHZlQ29uZmlnUGF0aCgpO1xuXHRcdFx0XHRcdFx0dGhpcy5yZWdpc3RlcldhdGNoKCk7XG5cdFx0XHRcdFx0XHR0aGlzLnJlbG9hZFRvb2xiYXIoKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1dXG5cdFx0XHR9KTtcblx0XHRcdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25zb2xlXG5cdFx0XHRjb25zb2xlLmVycm9yKGVycik7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXHR9LFxuXG5cdHJlc29sdmVQcm9qZWN0Q29uZmlnUGF0aChjb25maWdGaWxlUGF0aCwgcGVyc2lzdGVudCkge1xuXHRcdGlmIChjb25maWdGaWxlUGF0aCA9PSBudWxsKSB7XG5cdFx0XHRjb25maWdGaWxlUGF0aCA9IGF0b20uY29uZmlnLmdldCgnZmxleC10b29sLWJhci50b29sQmFyUHJvamVjdENvbmZpZ3VyYXRpb25GaWxlUGF0aCcpO1xuXHRcdH1cblx0XHRpZiAocGVyc2lzdGVudCA9PSBudWxsKSB7XG5cdFx0XHRwZXJzaXN0ZW50ID0gYXRvbS5jb25maWcuZ2V0KCdmbGV4LXRvb2wtYmFyLnBlcnNpc3RlbnRQcm9qZWN0VG9vbEJhcicpO1xuXHRcdH1cblx0XHRpZiAoIXBlcnNpc3RlbnQgfHwgIWZzLmlzRmlsZVN5bmModGhpcy5wcm9qZWN0Q29uZmlnRmlsZVBhdGgpKSB7XG5cdFx0XHR0aGlzLnByb2plY3RDb25maWdGaWxlUGF0aCA9IG51bGw7XG5cdFx0fVxuXG5cdFx0aWYgKHRoaXMuYWN0aXZlSXRlbSAmJiB0aGlzLmFjdGl2ZUl0ZW0ucHJvamVjdCkge1xuXHRcdFx0Y29uc3QgcHJvamVjdFBhdGggPSBwYXRoLmpvaW4odGhpcy5hY3RpdmVJdGVtLnByb2plY3QsIGNvbmZpZ0ZpbGVQYXRoKTtcblx0XHRcdGlmIChmcy5pc0ZpbGVTeW5jKHByb2plY3RQYXRoKSkge1xuXHRcdFx0XHR0aGlzLnByb2plY3RDb25maWdGaWxlUGF0aCA9IHByb2plY3RQYXRoO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Y29uc3QgZm91bmQgPSBmcy5yZXNvbHZlKHByb2plY3RQYXRoLCAndG9vbGJhcicsIFZBTElEX0VYVEVOU0lPTlMpO1xuXHRcdFx0XHRpZiAoZm91bmQpIHtcblx0XHRcdFx0XHR0aGlzLnByb2plY3RDb25maWdGaWxlUGF0aCA9IGZvdW5kO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0aWYgKHRoaXMucHJvamVjdENvbmZpZ0ZpbGVQYXRoID09PSB0aGlzLmNvbmZpZ0ZpbGVQYXRoKSB7XG5cdFx0XHR0aGlzLnByb2plY3RDb25maWdGaWxlUGF0aCA9IG51bGw7XG5cdFx0fVxuXG5cdFx0cmV0dXJuICEhdGhpcy5wcm9qZWN0Q29uZmlnRmlsZVBhdGg7XG5cdH0sXG5cblx0cmVnaXN0ZXJDb21tYW5kcygpIHtcblx0XHR0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXdvcmtzcGFjZScsIHtcblx0XHRcdCdmbGV4LXRvb2wtYmFyOmVkaXQtY29uZmlnLWZpbGUnOiAoKSA9PiB7XG5cdFx0XHRcdGlmICh0aGlzLmNvbmZpZ0ZpbGVQYXRoKSB7XG5cdFx0XHRcdFx0YXRvbS53b3Jrc3BhY2Uub3Blbih0aGlzLmNvbmZpZ0ZpbGVQYXRoKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pKTtcblxuXHRcdHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20td29ya3NwYWNlJywge1xuXHRcdFx0J2ZsZXgtdG9vbC1iYXI6ZWRpdC1wcm9qZWN0LWNvbmZpZy1maWxlJzogKCkgPT4ge1xuXHRcdFx0XHRpZiAodGhpcy5wcm9qZWN0Q29uZmlnRmlsZVBhdGgpIHtcblx0XHRcdFx0XHRhdG9tLndvcmtzcGFjZS5vcGVuKHRoaXMucHJvamVjdENvbmZpZ0ZpbGVQYXRoKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pKTtcblx0fSxcblxuXHRyZWdpc3RlckV2ZW50cygpIHtcblx0XHR0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20ucGFja2FnZXMub25EaWRBY3RpdmF0ZUluaXRpYWxQYWNrYWdlcygoKSA9PiB7XG5cdFx0XHRpZiAodGhpcy5jb25kaXRpb25UeXBlcy5wYWNrYWdlKSB7XG5cdFx0XHRcdHRoaXMucmVsb2FkVG9vbGJhcigpO1xuXHRcdFx0fVxuXG5cdFx0XHR0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20ucGFja2FnZXMub25EaWRBY3RpdmF0ZVBhY2thZ2UoKCkgPT4ge1xuXHRcdFx0XHRpZiAodGhpcy5jb25kaXRpb25UeXBlcy5wYWNrYWdlKSB7XG5cdFx0XHRcdFx0dGhpcy5yZWxvYWRUb29sYmFyKCk7XG5cdFx0XHRcdH1cblx0XHRcdH0pKTtcblxuXHRcdFx0dGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLnBhY2thZ2VzLm9uRGlkRGVhY3RpdmF0ZVBhY2thZ2UoKCkgPT4ge1xuXHRcdFx0XHRpZiAodGhpcy5jb25kaXRpb25UeXBlcy5wYWNrYWdlKSB7XG5cdFx0XHRcdFx0dGhpcy5yZWxvYWRUb29sYmFyKCk7XG5cdFx0XHRcdH1cblx0XHRcdH0pXG5cdFx0XHQpO1xuXHRcdH0pKTtcblxuXHRcdHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb25maWcub25EaWRDaGFuZ2UoKCkgPT4ge1xuXHRcdFx0aWYgKHRoaXMuY29uZGl0aW9uVHlwZXMuc2V0dGluZykge1xuXHRcdFx0XHR0aGlzLnJlbG9hZFRvb2xiYXIoKTtcblx0XHRcdH1cblx0XHR9KSk7XG5cblx0XHR0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20ud29ya3NwYWNlLm9uRGlkQ2hhbmdlQWN0aXZlVGV4dEVkaXRvcih0aGlzLm9uRGlkQ2hhbmdlSXRlbS5iaW5kKHRoaXMpKSk7XG5cblx0XHR0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20ud29ya3NwYWNlLm9uRGlkQ2hhbmdlQWN0aXZlUGFuZUl0ZW0odGhpcy5vbkRpZENoYW5nZUl0ZW0uYmluZCh0aGlzKSkpO1xuXHR9LFxuXG5cdG9uRGlkQ2hhbmdlSXRlbSgpIHtcblx0XHRjb25zdCBhY3RpdmUgPSB0aGlzLmdldEFjdGl2ZUl0ZW0oKTtcblxuXHRcdGlmICghdGhpcy5hY3RpdmVJdGVtIHx8IHRoaXMuYWN0aXZlSXRlbS5pdGVtID09PSBhY3RpdmUuaXRlbSkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdHRoaXMuYWN0aXZlSXRlbS5pdGVtID0gYWN0aXZlLml0ZW07XG5cdFx0dGhpcy5hY3RpdmVJdGVtLmZpbGUgPSBhY3RpdmUuZmlsZTtcblx0XHR0aGlzLmFjdGl2ZUl0ZW0uZ3JhbW1hciA9IGFjdGl2ZS5ncmFtbWFyO1xuXG5cdFx0dGhpcy5jaGFuZ2VUZXh0RWRpdG9yU3Vic2NyaXB0aW9ucy5kaXNwb3NlKCk7XG5cdFx0dGhpcy5jaGFuZ2VUZXh0RWRpdG9yU3Vic2NyaXB0aW9ucy5jbGVhcigpO1xuXHRcdGlmICh0aGlzLmFjdGl2ZUl0ZW0uaXRlbSkge1xuXHRcdFx0aWYgKHRoaXMuYWN0aXZlSXRlbS5pdGVtLm9uRGlkQ2hhbmdlR3JhbW1hcikge1xuXHRcdFx0XHR0aGlzLmNoYW5nZVRleHRFZGl0b3JTdWJzY3JpcHRpb25zLmFkZCh0aGlzLmFjdGl2ZUl0ZW0uaXRlbS5vbkRpZENoYW5nZUdyYW1tYXIoKCkgPT4ge1xuXHRcdFx0XHRcdGlmICh0aGlzLmFjdGl2ZUl0ZW0pIHtcblx0XHRcdFx0XHRcdHRoaXMuYWN0aXZlSXRlbS5ncmFtbWFyID0gdGhpcy5nZXRBY3RpdmVJdGVtKCkuZ3JhbW1hcjtcblx0XHRcdFx0XHRcdHRoaXMucmVsb2FkVG9vbGJhcigpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSkpO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAodGhpcy5hY3RpdmVJdGVtLml0ZW0ub25EaWRDaGFuZ2VQYXRoKSB7XG5cdFx0XHRcdHRoaXMuY2hhbmdlVGV4dEVkaXRvclN1YnNjcmlwdGlvbnMuYWRkKHRoaXMuYWN0aXZlSXRlbS5pdGVtLm9uRGlkQ2hhbmdlUGF0aCgoKSA9PiB7XG5cdFx0XHRcdFx0aWYgKHRoaXMuYWN0aXZlSXRlbSkge1xuXHRcdFx0XHRcdFx0dGhpcy5hY3RpdmVJdGVtLmZpbGUgPSB0aGlzLmdldEFjdGl2ZUl0ZW0oKS5maWxlO1xuXHRcdFx0XHRcdFx0dGhpcy5yZWxvYWRUb29sYmFyKCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KSk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Y29uc3Qgb2xkUHJvamVjdCA9IHRoaXMuYWN0aXZlSXRlbS5wcm9qZWN0O1xuXHRcdHRoaXMuYWN0aXZlSXRlbS5wcm9qZWN0ID0gYWN0aXZlLnByb2plY3Q7XG5cdFx0aWYgKG9sZFByb2plY3QgIT09IHRoaXMuYWN0aXZlSXRlbS5wcm9qZWN0KSB7XG5cdFx0XHR0aGlzLnVucmVnaXN0ZXJQcm9qZWN0V2F0Y2goKTtcblx0XHRcdHRoaXMucmVzb2x2ZVByb2plY3RDb25maWdQYXRoKCk7XG5cdFx0XHR0aGlzLnJlZ2lzdGVyUHJvamVjdFdhdGNoKCk7XG5cdFx0fVxuXHRcdHRoaXMuYWN0aXZlSXRlbS5ncmFtbWFyID0gYWN0aXZlLmdyYW1tYXI7XG5cdFx0dGhpcy5yZWxvYWRUb29sYmFyKCk7XG5cdH0sXG5cblx0dW5yZWdpc3RlcldhdGNoKCkge1xuXHRcdGlmICh0aGlzLmNvbmZpZ1dhdGNoZXIpIHtcblx0XHRcdHRoaXMuY29uZmlnV2F0Y2hlci5kaXNwb3NlKCk7XG5cdFx0fVxuXHRcdHRoaXMuY29uZmlnV2F0Y2hlciA9IG51bGw7XG5cdH0sXG5cblx0YXN5bmMgcmVnaXN0ZXJXYXRjaChzaG91bGRXYXRjaCkge1xuXHRcdGlmIChzaG91bGRXYXRjaCA9PSBudWxsKSB7XG5cdFx0XHRzaG91bGRXYXRjaCA9IGF0b20uY29uZmlnLmdldCgnZmxleC10b29sLWJhci5yZWxvYWRUb29sQmFyV2hlbkVkaXRDb25maWdGaWxlJyk7XG5cdFx0fVxuXHRcdGlmICghc2hvdWxkV2F0Y2ggfHwgIXRoaXMuY29uZmlnRmlsZVBhdGgpIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRpZiAodGhpcy5jb25maWdXYXRjaGVyKSB7XG5cdFx0XHR0aGlzLmNvbmZpZ1dhdGNoZXIuZGlzcG9zZSgpO1xuXHRcdH1cblx0XHR0aGlzLmNvbmZpZ1dhdGNoZXIgPSBhd2FpdCB3YXRjaFBhdGgodGhpcy5jb25maWdGaWxlUGF0aCwge30sICgpID0+IHtcblx0XHRcdHRoaXMucmVsb2FkVG9vbGJhcihhdG9tLmNvbmZpZy5nZXQoJ2ZsZXgtdG9vbC1iYXIucmVsb2FkVG9vbEJhck5vdGlmaWNhdGlvbicpKTtcblx0XHR9KTtcblx0fSxcblxuXHR1bnJlZ2lzdGVyUHJvamVjdFdhdGNoKCkge1xuXHRcdGlmICh0aGlzLnByb2plY3RDb25maWdXYXRjaGVyKSB7XG5cdFx0XHR0aGlzLnByb2plY3RDb25maWdXYXRjaGVyLmRpc3Bvc2UoKTtcblx0XHR9XG5cdFx0dGhpcy5wcm9qZWN0Q29uZmlnV2F0Y2hlciA9IG51bGw7XG5cdH0sXG5cblx0YXN5bmMgcmVnaXN0ZXJQcm9qZWN0V2F0Y2goc2hvdWxkV2F0Y2gpIHtcblx0XHRpZiAoc2hvdWxkV2F0Y2ggPT0gbnVsbCkge1xuXHRcdFx0c2hvdWxkV2F0Y2ggPSBhdG9tLmNvbmZpZy5nZXQoJ2ZsZXgtdG9vbC1iYXIucmVsb2FkVG9vbEJhcldoZW5FZGl0Q29uZmlnRmlsZScpO1xuXHRcdH1cblx0XHRpZiAoIXNob3VsZFdhdGNoIHx8ICF0aGlzLnByb2plY3RDb25maWdGaWxlUGF0aCkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdGlmICh0aGlzLnByb2plY3RDb25maWdXYXRjaGVyKSB7XG5cdFx0XHR0aGlzLnByb2plY3RDb25maWdXYXRjaGVyLmRpc3Bvc2UoKTtcblx0XHR9XG5cdFx0dGhpcy5wcm9qZWN0Q29uZmlnV2F0Y2hlciA9IGF3YWl0IHdhdGNoUGF0aCh0aGlzLnByb2plY3RDb25maWdGaWxlUGF0aCwge30sICgpID0+IHtcblx0XHRcdHRoaXMucmVsb2FkVG9vbGJhcihhdG9tLmNvbmZpZy5nZXQoJ2ZsZXgtdG9vbC1iYXIucmVsb2FkVG9vbEJhck5vdGlmaWNhdGlvbicpKTtcblx0XHR9KTtcblx0fSxcblxuXHRyZWdpc3RlclR5cGVzKCkge1xuXHRcdGNvbnN0IHR5cGVGaWxlcyA9IGZzLmxpc3RTeW5jKHBhdGguam9pbihfX2Rpcm5hbWUsICcuL3R5cGVzJykpO1xuXHRcdHR5cGVGaWxlcy5mb3JFYWNoKHR5cGVGaWxlID0+IHtcblx0XHRcdGNvbnN0IHR5cGVOYW1lID0gcGF0aC5iYXNlbmFtZSh0eXBlRmlsZSwgJy5qcycpO1xuXHRcdFx0dGhpcy5idXR0b25UeXBlc1t0eXBlTmFtZV0gPSByZXF1aXJlKHR5cGVGaWxlKTtcblx0XHR9KTtcblx0fSxcblxuXHRjb25zdW1lVG9vbEJhcih0b29sQmFyKSB7XG5cdFx0dGhpcy50b29sQmFyID0gdG9vbEJhcignZmxleC10b29sQmFyJyk7XG5cdFx0dGhpcy5yZWxvYWRUb29sYmFyKCk7XG5cdH0sXG5cblx0Z2V0VG9vbGJhclZpZXcoKSB7XG5cdFx0Ly8gVGhpcyBpcyBhbiB1bmRvY3VtZW50ZWQgQVBJIHRoYXQgbW92ZWQgaW4gdG9vbC1iYXJAMS4xLjBcblx0XHRyZXR1cm4gdGhpcy50b29sQmFyLnRvb2xCYXJWaWV3IHx8IHRoaXMudG9vbEJhci50b29sQmFyO1xuXHR9LFxuXG5cdHJlbG9hZFRvb2xiYXIod2l0aE5vdGlmaWNhdGlvbikge1xuXHRcdHRoaXMuY29uZGl0aW9uVHlwZXMgPSB7fTtcblx0XHRjbGVhclRpbWVvdXQodGhpcy5mdW5jdGlvblBvbGwpO1xuXHRcdGlmICghdGhpcy50b29sQmFyKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdHRyeSB7XG5cdFx0XHR0aGlzLmZpeFRvb2xCYXJIZWlnaHQoKTtcblx0XHRcdGNvbnN0IHRvb2xCYXJCdXR0b25zID0gdGhpcy5sb2FkQ29uZmlnKCk7XG5cdFx0XHR0aGlzLnJlbW92ZUJ1dHRvbnMoKTtcblx0XHRcdHRoaXMuYWRkQnV0dG9ucyh0b29sQmFyQnV0dG9ucyk7XG5cdFx0XHRpZiAod2l0aE5vdGlmaWNhdGlvbikge1xuXHRcdFx0XHRhdG9tLm5vdGlmaWNhdGlvbnMuYWRkU3VjY2VzcygnVGhlIHRvb2wtYmFyIHdhcyBzdWNjZXNzZnVsbHkgdXBkYXRlZC4nKTtcblx0XHRcdH1cblx0XHRcdHRoaXMudW5maXhUb29sQmFySGVpZ2h0KCk7XG5cdFx0fSBjYXRjaCAoZXJyb3IpIHtcblx0XHRcdHRoaXMudW5maXhUb29sQmFySGVpZ2h0KCk7XG5cdFx0XHRhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoYENvdWxkIG5vdCBsb2FkIHlvdXIgdG9vbGJhciBmcm9tIFxcYCR7ZnMudGlsZGlmeSh0aGlzLmNvbmZpZ0ZpbGVQYXRoKX1cXGBgLCB7ZGlzbWlzc2FibGU6IHRydWV9KTtcblx0XHRcdHRocm93IGVycm9yO1xuXHRcdH1cblx0fSxcblxuXHRmaXhUb29sQmFySGVpZ2h0KCkge1xuXHRcdGNvbnN0IHRvb2xCYXJWaWV3ID0gdGhpcy5nZXRUb29sYmFyVmlldygpO1xuXHRcdGlmICghdG9vbEJhclZpZXcgfHwgIXRvb2xCYXJWaWV3LmVsZW1lbnQpIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0dG9vbEJhclZpZXcuZWxlbWVudC5zdHlsZS5oZWlnaHQgPSBgJHt0aGlzLmdldFRvb2xiYXJWaWV3KCkuZWxlbWVudC5vZmZzZXRIZWlnaHR9cHhgO1xuXHR9LFxuXG5cdHVuZml4VG9vbEJhckhlaWdodCgpIHtcblx0XHRjb25zdCB0b29sQmFyVmlldyA9IHRoaXMuZ2V0VG9vbGJhclZpZXcoKTtcblx0XHRpZiAoIXRvb2xCYXJWaWV3IHx8ICF0b29sQmFyVmlldy5lbGVtZW50KSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdHRvb2xCYXJWaWV3LmVsZW1lbnQuc3R5bGUuaGVpZ2h0ID0gJyc7XG5cdH0sXG5cblx0YWRkQnV0dG9ucyh0b29sQmFyQnV0dG9ucykge1xuXHRcdGNvbnN0IGJ1dHRvbnMgPSBbXTtcblxuXHRcdGlmICghdG9vbEJhckJ1dHRvbnMpIHtcblx0XHRcdHJldHVybiBidXR0b25zO1xuXHRcdH1cblxuXHRcdGlmICghQXJyYXkuaXNBcnJheSh0b29sQmFyQnV0dG9ucykpIHtcblx0XHRcdGNvbnNvbGUuZXJyb3IoJ0ludmFsaWQgVG9vbGJhciBDb25maWcnLCB0b29sQmFyQnV0dG9ucyk7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgVG9vbGJhciBDb25maWcnKTtcblx0XHR9XG5cblx0XHRjb25zdCBkZXZNb2RlID0gYXRvbS5pbkRldk1vZGUoKTtcblx0XHR0aGlzLmZ1bmN0aW9uQ29uZGl0aW9ucyA9IFtdO1xuXHRcdGNvbnN0IGJ0bkVycm9ycyA9IFtdO1xuXG5cdFx0Zm9yIChjb25zdCBidG4gb2YgdG9vbEJhckJ1dHRvbnMpIHtcblxuXHRcdFx0dmFyIGJ1dHRvbiwgZGlzYWJsZSwgaGlkZTtcblx0XHRcdHRyeSB7XG5cdFx0XHRcdGhpZGUgPSAoYnRuLmhpZGUgJiYgdGhpcy5jaGVja0NvbmRpdGlvbnMoYnRuLmhpZGUpKSB8fCAoYnRuLnNob3cgJiYgIXRoaXMuY2hlY2tDb25kaXRpb25zKGJ0bi5zaG93KSk7XG5cdFx0XHRcdGRpc2FibGUgPSAoYnRuLmRpc2FibGUgJiYgdGhpcy5jaGVja0NvbmRpdGlvbnMoYnRuLmRpc2FibGUpKSB8fCAoYnRuLmVuYWJsZSAmJiAhdGhpcy5jaGVja0NvbmRpdGlvbnMoYnRuLmVuYWJsZSkpO1xuXHRcdFx0fSBjYXRjaCAoZXJyKSB7XG5cdFx0XHRcdGJ0bkVycm9ycy5wdXNoKGAke2Vyci5tZXNzYWdlIHx8IGVyci50b1N0cmluZygpfVxcbiR7dXRpbC5pbnNwZWN0KGJ0biwge2RlcHRoOiA0fSl9YCk7XG5cdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoaGlkZSkge1xuXHRcdFx0XHRjb250aW51ZTtcblx0XHRcdH1cblx0XHRcdGlmIChidG4ubW9kZSAmJiBidG4ubW9kZSA9PT0gJ2RldicgJiYgIWRldk1vZGUpIHtcblx0XHRcdFx0Y29udGludWU7XG5cdFx0XHR9XG5cblx0XHRcdGlmICh0aGlzLmJ1dHRvblR5cGVzW2J0bi50eXBlXSkge1xuXHRcdFx0XHRidXR0b24gPSB0aGlzLmJ1dHRvblR5cGVzW2J0bi50eXBlXSh0aGlzLnRvb2xCYXIsIGJ0biwgdGhpcy5nZXRBY3RpdmVJdGVtKTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKGJ1dHRvbiAmJiBidXR0b24uZWxlbWVudCkge1xuXHRcdFx0XHRpZiAoYnRuLm1vZGUpIHtcblx0XHRcdFx0XHRidXR0b24uZWxlbWVudC5jbGFzc0xpc3QuYWRkKGB0b29sLWJhci1tb2RlLSR7YnRuLm1vZGV9YCk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAoYnRuLnN0eWxlKSB7XG5cdFx0XHRcdFx0Zm9yIChjb25zdCBwcm9wTmFtZSBpbiBidG4uc3R5bGUpIHtcblx0XHRcdFx0XHRcdGNvbnN0IHN0eWxlID0gYnRuLnN0eWxlW3Byb3BOYW1lXTtcblx0XHRcdFx0XHRcdGJ1dHRvbi5lbGVtZW50LnN0eWxlW2NoYW5nZUNhc2UuY2FtZWxDYXNlKHByb3BOYW1lKV0gPSBzdHlsZTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAoYnRuLmhvdmVyICYmICFkaXNhYmxlKSB7XG5cdFx0XHRcdFx0YnV0dG9uLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VlbnRlcicsIHRoaXMub25Nb3VzZUVudGVyKGJ0biksIHtwYXNzaXZlOiB0cnVlfSk7XG5cdFx0XHRcdFx0YnV0dG9uLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VsZWF2ZScsIHRoaXMub25Nb3VzZUxlYXZlKGJ0biksIHtwYXNzaXZlOiB0cnVlfSk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAoYnRuLmNsYXNzTmFtZSkge1xuXHRcdFx0XHRcdGNvbnN0IGFyeSA9IGJ0bi5jbGFzc05hbWUuc3BsaXQoJywnKTtcblx0XHRcdFx0XHRmb3IgKGNvbnN0IHZhbCBvZiBhcnkpIHtcblx0XHRcdFx0XHRcdGJ1dHRvbi5lbGVtZW50LmNsYXNzTGlzdC5hZGQodmFsLnRyaW0oKSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKGRpc2FibGUpIHtcblx0XHRcdFx0XHRidXR0b24uc2V0RW5hYmxlZChmYWxzZSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0YnV0dG9ucy5wdXNoKGJ1dHRvbik7XG5cdFx0fVxuXG5cdFx0aWYgKGJ0bkVycm9ycy5sZW5ndGggPiAwKSB7XG5cdFx0XHRjb25zdCBub3RpZmljYXRpb25CdXR0b25zID0gW3tcblx0XHRcdFx0dGV4dDogJ0VkaXQgQ29uZmlnJyxcblx0XHRcdFx0b25EaWRDbGljazogKCkgPT4gYXRvbS53b3Jrc3BhY2Uub3Blbih0aGlzLmNvbmZpZ0ZpbGVQYXRoKVxuXHRcdFx0fV07XG5cdFx0XHRpZiAodGhpcy5wcm9qZWN0Q29uZmlnRmlsZVBhdGgpIHtcblx0XHRcdFx0bm90aWZpY2F0aW9uQnV0dG9ucy5wdXNoKFt7XG5cdFx0XHRcdFx0dGV4dDogJ0VkaXQgUHJvamVjdCBDb25maWcnLFxuXHRcdFx0XHRcdG9uRGlkQ2xpY2s6ICgpID0+IGF0b20ud29ya3NwYWNlLm9wZW4odGhpcy5wcm9qZWN0Q29uZmlnRmlsZVBhdGgpXG5cdFx0XHRcdH1dKTtcblx0XHRcdH1cblx0XHRcdGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcignSW52YWxpZCB0b29sYmFyIGNvbmZpZycsIHtcblx0XHRcdFx0ZGV0YWlsOiBidG5FcnJvcnMuam9pbignXFxuXFxuJyksXG5cdFx0XHRcdGRpc21pc3NhYmxlOiB0cnVlLFxuXHRcdFx0XHRidXR0b25zOiBub3RpZmljYXRpb25CdXR0b25zLFxuXHRcdFx0fSk7XG5cdFx0fVxuXG5cdFx0dGhpcy5wb2xsRnVuY3Rpb25zKCk7XG5cblx0XHRyZXR1cm4gYnV0dG9ucztcblx0fSxcblxuXHRvbk1vdXNlRW50ZXIoYnRuKSB7XG5cdFx0cmV0dXJuIGZ1bmN0aW9uICgpIHtcblx0XHRcdC8vIE1hcCB0byBob2xkIHRoZSB2YWx1ZXMgYXMgdGhleSB3ZXJlIGJlZm9yZSB0aGUgaG92ZXIgbW9kaWZpY2F0aW9ucy5cblx0XHRcdGJ0blsncHJlSG92ZXJWYWwnXSA9IG5ldyBPYmplY3QoKTtcblxuXHRcdFx0Zm9yIChjb25zdCBwcm9wTmFtZSBpbiBidG4uaG92ZXIpIHtcblx0XHRcdFx0Y29uc3QgY2FtZWxQcm9wTmFtZSA9IGNoYW5nZUNhc2UuY2FtZWxDYXNlKHByb3BOYW1lKTtcblx0XHRcdFx0YnRuLnByZUhvdmVyVmFsW2NhbWVsUHJvcE5hbWVdID0gdGhpcy5zdHlsZVtjYW1lbFByb3BOYW1lXTtcblx0XHRcdFx0dGhpcy5zdHlsZVtjYW1lbFByb3BOYW1lXSA9IGJ0bi5ob3Zlcltwcm9wTmFtZV07XG5cdFx0XHR9XG5cdFx0fTtcblx0fSxcblxuXHRvbk1vdXNlTGVhdmUoYnRuKSB7XG5cdFx0cmV0dXJuIGZ1bmN0aW9uICgpIHtcblx0XHRcdGZvciAoY29uc3QgcHJvcE5hbWUgaW4gYnRuLnByZUhvdmVyVmFsKSB7XG5cdFx0XHRcdGNvbnN0IHN0eWxlID0gYnRuLnByZUhvdmVyVmFsW3Byb3BOYW1lXTtcblx0XHRcdFx0dGhpcy5zdHlsZVtwcm9wTmFtZV0gPSBzdHlsZTtcblx0XHRcdH1cblx0XHR9O1xuXHR9LFxuXG5cdHJlbW92ZUNhY2hlKGZpbGVQYXRoKSB7XG5cdFx0ZGVsZXRlIHJlcXVpcmUuY2FjaGVbZmlsZVBhdGhdO1xuXG5cdFx0dHJ5IHtcblx0XHRcdGxldCByZWxhdGl2ZUZpbGVQYXRoID0gcGF0aC5yZWxhdGl2ZShwYXRoLmpvaW4oYXRvbS5nZXRMb2FkU2V0dGluZ3MoKS5yZXNvdXJjZVBhdGgsICdzdGF0aWMnKSwgZmlsZVBhdGgpO1xuXHRcdFx0aWYgKHByb2Nlc3MucGxhdGZvcm0gPT09ICd3aW4zMicpIHtcblx0XHRcdFx0cmVsYXRpdmVGaWxlUGF0aCA9IHJlbGF0aXZlRmlsZVBhdGgucmVwbGFjZSgvXFxcXC9nLCAnLycpO1xuXHRcdFx0fVxuXHRcdFx0ZGVsZXRlIHNuYXBzaG90UmVzdWx0LmN1c3RvbVJlcXVpcmUuY2FjaGVbcmVsYXRpdmVGaWxlUGF0aF07XG5cdFx0fSBjYXRjaCAoZXJyKSB7XG5cdFx0XHQvLyBtb3N0IGxpa2VseSBzbmFwc2hvdFJlc3VsdCBkb2VzIG5vdCBleGlzdFxuXHRcdH1cblx0fSxcblxuXHRsb2FkQ29uZmlnKCkge1xuXHRcdGxldCBDU09OLCBleHQ7XG5cdFx0bGV0IGNvbmZpZyA9IFt7XG5cdFx0XHR0eXBlOiAnZnVuY3Rpb24nLFxuXHRcdFx0aWNvbjogJ3Rvb2xzJyxcblx0XHRcdGNhbGxiYWNrOiAoKSA9PiB7XG5cdFx0XHRcdHRoaXMucmVzb2x2ZUNvbmZpZ1BhdGgoKTtcblx0XHRcdFx0dGhpcy5yZWdpc3RlcldhdGNoKCk7XG5cdFx0XHRcdHRoaXMucmVsb2FkVG9vbGJhcigpO1xuXHRcdFx0fSxcblx0XHRcdHRvb2x0aXA6ICdDcmVhdGUgR2xvYmFsIFRvb2wgQmFyIENvbmZpZycsXG5cdFx0fV07XG5cblx0XHRpZiAodGhpcy5jb25maWdGaWxlUGF0aCkge1xuXHRcdFx0bGV0IGdsb2JhbENvbmZpZztcblx0XHRcdGV4dCA9IHBhdGguZXh0bmFtZSh0aGlzLmNvbmZpZ0ZpbGVQYXRoKTtcblx0XHRcdHRoaXMucmVtb3ZlQ2FjaGUodGhpcy5jb25maWdGaWxlUGF0aCk7XG5cblx0XHRcdHN3aXRjaCAoZXh0KSB7XG5cdFx0XHRcdGNhc2UgJy5qcyc6XG5cdFx0XHRcdGNhc2UgJy5qc29uJzpcblx0XHRcdFx0Y2FzZSAnLmNvZmZlZSc6XG5cdFx0XHRcdFx0Z2xvYmFsQ29uZmlnID0gcmVxdWlyZSh0aGlzLmNvbmZpZ0ZpbGVQYXRoKTtcblx0XHRcdFx0XHRicmVhaztcblxuXHRcdFx0XHRjYXNlICcuanNvbjUnOlxuXHRcdFx0XHRcdHJlcXVpcmUoJ2pzb241L2xpYi9yZWdpc3RlcicpO1xuXHRcdFx0XHRcdGdsb2JhbENvbmZpZyA9IHJlcXVpcmUodGhpcy5jb25maWdGaWxlUGF0aCk7XG5cdFx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdFx0Y2FzZSAnLmNzb24nOlxuXHRcdFx0XHRcdENTT04gPSByZXF1aXJlKCdjc29uJyk7XG5cdFx0XHRcdFx0Z2xvYmFsQ29uZmlnID0gQ1NPTi5yZXF1aXJlQ1NPTkZpbGUodGhpcy5jb25maWdGaWxlUGF0aCk7XG5cdFx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHQvLyBkbyBub3RoaW5nXG5cdFx0XHR9XG5cblx0XHRcdGlmIChnbG9iYWxDb25maWcpIHtcblx0XHRcdFx0aWYgKCFBcnJheS5pc0FycmF5KGdsb2JhbENvbmZpZykpIHtcblx0XHRcdFx0XHRnbG9iYWxDb25maWcgPSBbZ2xvYmFsQ29uZmlnXTtcblx0XHRcdFx0fVxuXHRcdFx0XHRjb25maWcgPSBnbG9iYWxDb25maWc7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0aWYgKHRoaXMucHJvamVjdENvbmZpZ0ZpbGVQYXRoKSB7XG5cdFx0XHRsZXQgcHJvakNvbmZpZyA9IFtdO1xuXHRcdFx0ZXh0ID0gcGF0aC5leHRuYW1lKHRoaXMucHJvamVjdENvbmZpZ0ZpbGVQYXRoKTtcblx0XHRcdHRoaXMucmVtb3ZlQ2FjaGUodGhpcy5wcm9qZWN0Q29uZmlnRmlsZVBhdGgpO1xuXG5cdFx0XHRzd2l0Y2ggKGV4dCkge1xuXHRcdFx0XHRjYXNlICcuanMnOlxuXHRcdFx0XHRjYXNlICcuanNvbic6XG5cdFx0XHRcdGNhc2UgJy5jb2ZmZWUnOlxuXHRcdFx0XHRcdHByb2pDb25maWcgPSByZXF1aXJlKHRoaXMucHJvamVjdENvbmZpZ0ZpbGVQYXRoKTtcblx0XHRcdFx0XHRicmVhaztcblxuXHRcdFx0XHRjYXNlICcuanNvbjUnOlxuXHRcdFx0XHRcdHJlcXVpcmUoJ2pzb241L2xpYi9yZWdpc3RlcicpO1xuXHRcdFx0XHRcdHByb2pDb25maWcgPSByZXF1aXJlKHRoaXMucHJvamVjdENvbmZpZ0ZpbGVQYXRoKTtcblx0XHRcdFx0XHRicmVhaztcblxuXHRcdFx0XHRjYXNlICcuY3Nvbic6XG5cdFx0XHRcdFx0Q1NPTiA9IHJlcXVpcmUoJ2Nzb24nKTtcblx0XHRcdFx0XHRwcm9qQ29uZmlnID0gQ1NPTi5yZXF1aXJlQ1NPTkZpbGUodGhpcy5wcm9qZWN0Q29uZmlnRmlsZVBhdGgpO1xuXHRcdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0Ly8gZG8gbm90aGluZ1xuXHRcdFx0fVxuXG5cdFx0XHRjb25maWcgPSBjb25maWcuY29uY2F0KHByb2pDb25maWcpO1xuXHRcdH1cblxuXHRcdHJldHVybiBjb25maWc7XG5cdH0sXG5cblx0bG9vcFRocm91Z2goaXRlbXMsIGZ1bmMpIHtcblx0XHRpZiAoIUFycmF5LmlzQXJyYXkoaXRlbXMpKSB7XG5cdFx0XHRpdGVtcyA9IFtpdGVtc107XG5cdFx0fVxuXHRcdGxldCByZXQgPSBmYWxzZTtcblx0XHRmb3IgKGNvbnN0IGl0ZW0gb2YgaXRlbXMpIHtcblx0XHRcdHJldCA9IGZ1bmMoaXRlbSkgfHwgcmV0O1xuXHRcdH1cblxuXHRcdHJldHVybiAhIXJldDtcblx0fSxcblxuXHRjaGVja0NvbmRpdGlvbnMoY29uZGl0aW9ucykge1xuXHRcdHJldHVybiB0aGlzLmxvb3BUaHJvdWdoKGNvbmRpdGlvbnMsIGNvbmRpdGlvbiA9PiB7XG5cdFx0XHRsZXQgcmV0ID0gY29uZGl0aW9uID09PSB0cnVlO1xuXG5cdFx0XHRpZiAodHlwZW9mIGNvbmRpdGlvbiA9PT0gJ3N0cmluZycpIHtcblx0XHRcdFx0aWYgKC9eW14vXStcXC4oLio/KSQvLnRlc3QoY29uZGl0aW9uKSkge1xuXHRcdFx0XHRcdHJldCA9IHRoaXMucGF0dGVybkNvbmRpdGlvbihjb25kaXRpb24pIHx8IHJldDtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRyZXQgPSB0aGlzLmdyYW1tYXJDb25kaXRpb24oY29uZGl0aW9uKSB8fCByZXQ7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSBpZiAodHlwZW9mIGNvbmRpdGlvbiA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0XHRyZXQgPSB0aGlzLmZ1bmN0aW9uQ29uZGl0aW9uKGNvbmRpdGlvbikgfHwgcmV0O1xuXHRcdFx0fSBlbHNlIHtcblxuXHRcdFx0XHRpZiAoY29uZGl0aW9uLmZ1bmN0aW9uKSB7XG5cdFx0XHRcdFx0cmV0ID0gdGhpcy5sb29wVGhyb3VnaChjb25kaXRpb24uZnVuY3Rpb24sIHRoaXMuZnVuY3Rpb25Db25kaXRpb24uYmluZCh0aGlzKSkgfHwgcmV0O1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKGNvbmRpdGlvbi5ncmFtbWFyKSB7XG5cdFx0XHRcdFx0cmV0ID0gdGhpcy5sb29wVGhyb3VnaChjb25kaXRpb24uZ3JhbW1hciwgdGhpcy5ncmFtbWFyQ29uZGl0aW9uLmJpbmQodGhpcykpIHx8IHJldDtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmIChjb25kaXRpb24ucGF0dGVybikge1xuXHRcdFx0XHRcdHJldCA9IHRoaXMubG9vcFRocm91Z2goY29uZGl0aW9uLnBhdHRlcm4sIHRoaXMucGF0dGVybkNvbmRpdGlvbi5iaW5kKHRoaXMpKSB8fCByZXQ7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAoY29uZGl0aW9uLnBhY2thZ2UpIHtcblx0XHRcdFx0XHRyZXQgPSB0aGlzLmxvb3BUaHJvdWdoKGNvbmRpdGlvbi5wYWNrYWdlLCB0aGlzLnBhY2thZ2VDb25kaXRpb24uYmluZCh0aGlzKSkgfHwgcmV0O1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKGNvbmRpdGlvbi5zZXR0aW5nKSB7XG5cdFx0XHRcdFx0cmV0ID0gdGhpcy5sb29wVGhyb3VnaChjb25kaXRpb24uc2V0dGluZywgdGhpcy5zZXR0aW5nQ29uZGl0aW9uLmJpbmQodGhpcykpIHx8IHJldDtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gcmV0O1xuXHRcdH0pO1xuXHR9LFxuXG5cdGZ1bmN0aW9uQ29uZGl0aW9uKGNvbmRpdGlvbikge1xuXHRcdHRoaXMuY29uZGl0aW9uVHlwZXMuZnVuY3Rpb24gPSB0cnVlO1xuXHRcdGNvbnN0IHZhbHVlID0gISFjb25kaXRpb24odGhpcy5hY3RpdmVJdGVtID8gdGhpcy5hY3RpdmVJdGVtLml0ZW0gOiBudWxsKTtcblxuXHRcdHRoaXMuZnVuY3Rpb25Db25kaXRpb25zLnB1c2goe1xuXHRcdFx0ZnVuYzogY29uZGl0aW9uLFxuXHRcdFx0dmFsdWVcblx0XHR9KTtcblxuXHRcdHJldHVybiB2YWx1ZTtcblx0fSxcblxuXHRnZXRBY3RpdmVJdGVtKCkge1xuXHRcdGNvbnN0IGFjdGl2ZSA9IHtcblx0XHRcdGl0ZW06IG51bGwsXG5cdFx0XHRncmFtbWFyOiBudWxsLFxuXHRcdFx0ZmlsZTogbnVsbCxcblx0XHRcdHByb2plY3Q6IG51bGwsXG5cdFx0fTtcblxuXHRcdGNvbnN0IGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKTtcblx0XHRpZiAoZWRpdG9yKSB7XG5cdFx0XHRjb25zdCBncmFtbWFyID0gZWRpdG9yLmdldEdyYW1tYXIoKTtcblx0XHRcdGFjdGl2ZS5pdGVtID0gZWRpdG9yO1xuXHRcdFx0YWN0aXZlLmdyYW1tYXIgPSAoZ3JhbW1hciAmJiBncmFtbWFyLm5hbWUudG9Mb3dlckNhc2UoKSkgfHwgbnVsbDtcblx0XHRcdGFjdGl2ZS5maWxlID0gKGVkaXRvciAmJiBlZGl0b3IuYnVmZmVyICYmIGVkaXRvci5idWZmZXIuZmlsZSAmJiBlZGl0b3IuYnVmZmVyLmZpbGUuZ2V0UGF0aCgpKSB8fCBudWxsO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRjb25zdCBpdGVtID0gYXRvbS53b3Jrc3BhY2UuZ2V0Q2VudGVyKCkuZ2V0QWN0aXZlUGFuZUl0ZW0oKTtcblx0XHRcdGlmIChpdGVtICYmIGl0ZW0uZmlsZSkge1xuXHRcdFx0XHRhY3RpdmUuaXRlbSA9IGl0ZW07XG5cdFx0XHRcdGFjdGl2ZS5maWxlID0gaXRlbS5maWxlLmdldFBhdGgoKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRpZiAoYWN0aXZlLmZpbGUpIHtcblx0XHRcdGNvbnN0IFtwcm9qZWN0XSA9IGF0b20ucHJvamVjdC5yZWxhdGl2aXplUGF0aChhY3RpdmUuZmlsZSk7XG5cdFx0XHRpZiAocHJvamVjdCkge1xuXHRcdFx0XHRhY3RpdmUucHJvamVjdCA9IHByb2plY3Q7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGFjdGl2ZTtcblx0fSxcblxuXHRncmFtbWFyQ29uZGl0aW9uKGNvbmRpdGlvbikge1xuXHRcdHRoaXMuY29uZGl0aW9uVHlwZXMuZ3JhbW1hciA9IHRydWU7XG5cdFx0cmV0dXJuIHRoaXMucmV2ZXJzYWJsZVN0cmluZ0NvbmRpdGlvbihjb25kaXRpb24sIChjKSA9PiB7XG5cdFx0XHRyZXR1cm4gdGhpcy5hY3RpdmVJdGVtICYmIHRoaXMuYWN0aXZlSXRlbS5ncmFtbWFyICYmIHRoaXMuYWN0aXZlSXRlbS5ncmFtbWFyLmluY2x1ZGVzKGMudG9Mb3dlckNhc2UoKSk7XG5cdFx0fSk7XG5cdH0sXG5cblx0cGF0dGVybkNvbmRpdGlvbihjb25kaXRpb24pIHtcblx0XHR0aGlzLmNvbmRpdGlvblR5cGVzLnBhdHRlcm4gPSB0cnVlO1xuXHRcdHJldHVybiB0aGlzLnJldmVyc2FibGVTdHJpbmdDb25kaXRpb24oY29uZGl0aW9uLCAoYykgPT4ge1xuXHRcdFx0cmV0dXJuIHRoaXMuYWN0aXZlSXRlbSAmJiB0aGlzLmFjdGl2ZUl0ZW0uZmlsZSAmJiBnbG9iVG9SZWdleHAoYywge2V4dGVuZGVkOiB0cnVlfSkudGVzdCh0aGlzLmFjdGl2ZUl0ZW0uZmlsZSk7XG5cdFx0fSk7XG5cdH0sXG5cblx0cGFja2FnZUNvbmRpdGlvbihjb25kaXRpb24pIHtcblx0XHR0aGlzLmNvbmRpdGlvblR5cGVzLnBhY2thZ2UgPSB0cnVlO1xuXHRcdHJldHVybiB0aGlzLnJldmVyc2FibGVTdHJpbmdDb25kaXRpb24oY29uZGl0aW9uLCAoYykgPT4gKGF0b20ucGFja2FnZXMuaXNQYWNrYWdlTG9hZGVkKGMpICYmICFhdG9tLnBhY2thZ2VzLmlzUGFja2FnZURpc2FibGVkKGMpKSk7XG5cdH0sXG5cblx0c2V0dGluZ0NvbmRpdGlvbihjb25kaXRpb24pIHtcblx0XHR0aGlzLmNvbmRpdGlvblR5cGVzLnNldHRpbmcgPSB0cnVlO1xuXHRcdHJldHVybiB0aGlzLnJldmVyc2FibGVTdHJpbmdDb25kaXRpb24oY29uZGl0aW9uLCAoYykgPT4gYXRvbS5jb25maWcuZ2V0KGMpKTtcblx0fSxcblxuXHRyZXZlcnNhYmxlU3RyaW5nQ29uZGl0aW9uKGNvbmRpdGlvbiwgbWF0Y2hlcykge1xuXHRcdGxldCByZXN1bHQgPSBmYWxzZTtcblx0XHRsZXQgcmV2ZXJzZSA9IGZhbHNlO1xuXHRcdGlmICgvXiEvLnRlc3QoY29uZGl0aW9uKSkge1xuXHRcdFx0Y29uZGl0aW9uID0gY29uZGl0aW9uLnJlcGxhY2UoJyEnLCAnJyk7XG5cdFx0XHRyZXZlcnNlID0gdHJ1ZTtcblx0XHR9XG5cblx0XHRyZXN1bHQgPSBtYXRjaGVzKGNvbmRpdGlvbik7XG5cblx0XHRpZiAocmV2ZXJzZSkge1xuXHRcdFx0cmVzdWx0ID0gIXJlc3VsdDtcblx0XHR9XG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0fSxcblxuXHRyZW1vdmVCdXR0b25zKCkge1xuXHRcdGlmICh0aGlzLnRvb2xCYXIgJiYgdGhpcy50b29sQmFyLnJlbW92ZUl0ZW1zKSB7XG5cdFx0XHR0aGlzLnRvb2xCYXIucmVtb3ZlSXRlbXMoKTtcblx0XHR9XG5cdH0sXG5cblx0ZGVhY3RpdmF0ZSgpIHtcblx0XHR0aGlzLnVucmVnaXN0ZXJXYXRjaCgpO1xuXHRcdHRoaXMudW5yZWdpc3RlclByb2plY3RXYXRjaCgpO1xuXHRcdHRoaXMuc3Vic2NyaXB0aW9ucy5kaXNwb3NlKCk7XG5cdFx0dGhpcy5zdWJzY3JpcHRpb25zID0gbnVsbDtcblx0XHR0aGlzLmNoYW5nZVRleHRFZGl0b3JTdWJzY3JpcHRpb25zLmRpc3Bvc2UoKTtcblx0XHR0aGlzLmNoYW5nZVRleHRFZGl0b3JTdWJzY3JpcHRpb25zID0gbnVsbDtcblx0XHR0aGlzLnJlbW92ZUJ1dHRvbnMoKTtcblx0XHR0aGlzLnRvb2xCYXIgPSBudWxsO1xuXHRcdGNsZWFyVGltZW91dCh0aGlzLmZ1bmN0aW9uUG9sbCk7XG5cdFx0dGhpcy5mdW5jdGlvblBvbGwgPSBudWxsO1xuXHRcdHRoaXMuYWN0aXZlSXRlbSA9IG51bGw7XG5cdH0sXG5cblx0c2VyaWFsaXplKCkge31cbn07XG4iXX0=