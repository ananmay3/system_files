var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _helperFormatJs = require('./../helper/format.js');

var _helperHelperJs = require('./../helper/helper.js');

var _helperSecureJs = require('./../helper/secure.js');

var _helperIssueJs = require('./../helper/issue.js');

'use babel';

var atom = global.atom;
var Path = require('path');
var FileSystem = require('fs-plus');

var server_config = require('./../config/server-schema.json');
var folder_config = require('./../config/folder-schema.json');

var Storage = (function () {
  function Storage() {
    _classCallCheck(this, Storage);

    var self = this;

    self.servers = [];
    self.folders = [];
    self.version = '';
    self.settings = {};
    self.password = null;
    self.loaded = false;
    self.tree = null;
  }

  _createClass(Storage, [{
    key: 'setPassword',
    value: function setPassword(password) {
      var self = this;

      self.password = password;
    }
  }, {
    key: 'getPassword',
    value: function getPassword() {
      var self = this;

      return self.password;
    }
  }, {
    key: 'hasPassword',
    value: function hasPassword() {
      var self = this;

      return self.password !== null;
    }
  }, {
    key: 'load',
    value: function load() {
      var reload = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

      var self = this;

      if (!self.loaded || reload) {
        var configText = atom.config.get('ftp-remote-edit.config');
        if (configText) {
          configText = (0, _helperSecureJs.decrypt)(self.password, configText);

          try {
            configArray = self.migrate(JSON.parse((0, _helperFormatJs.cleanJsonString)(configText)));
            self.loadServers(configArray.servers);
            self.loadFolders(configArray.folders);
            self.loadSettings(configArray.settings);
          } catch (e) {
            (0, _helperIssueJs.throwErrorIssue44)(e, self.password);
          }
        }
        self.loaded = true;
        self.tree = null;
        self.version = atom.packages.getActivePackage('ftp-remote-edit').metadata.version;
        self.settings = {};
      }

      return self.loaded;
    }
  }, {
    key: 'save',
    value: function save() {
      var self = this;

      atom.config.set('ftp-remote-edit.config', (0, _helperSecureJs.encrypt)(self.password, JSON.stringify({
        version: self.version,
        servers: self.servers,
        folders: self.folders,
        settings: self.settings
      })));
    }
  }, {
    key: 'loadServers',
    value: function loadServers(servers) {
      var self = this;

      servers = servers.map(function (item, index) {
        var cleanconfig = JSON.parse(JSON.stringify(server_config));

        cleanconfig.name = item.name ? item.name : cleanconfig.name + " " + (index + 1);
        cleanconfig.host = item.host ? item.host : cleanconfig.host;
        cleanconfig.port = item.port ? item.port : cleanconfig.port;
        cleanconfig.user = item.user ? item.user : cleanconfig.user;
        cleanconfig.parent = item.parent ? item.parent : cleanconfig.parent;
        cleanconfig.useAgent = item.useAgent ? item.useAgent : cleanconfig.useAgent;
        cleanconfig.password = item.password ? item.password : cleanconfig.password;
        cleanconfig.sftp = item.sftp ? item.sftp : cleanconfig.sftp;
        cleanconfig.privatekeyfile = item.privatekeyfile ? item.privatekeyfile : cleanconfig.privatekeyfile;
        cleanconfig.remote = item.remote ? item.remote : cleanconfig.remote;
        cleanconfig.temp = item.temp ? item.temp : cleanconfig.temp;

        if (cleanconfig.useAgent) {
          cleanconfig.logon = 'agent';
        } else if (item.privatekeyfile) {
          cleanconfig.logon = 'keyfile';
        } else {
          cleanconfig.logon = 'credentials';
        }

        return cleanconfig;
      });

      var sortServerProfilesByName = atom.config.get('ftp-remote-edit.tree.sortServerProfilesByName');
      servers.sort(function (a, b) {
        if (sortServerProfilesByName) {
          if (a.name.toLowerCase() < b.name.toLowerCase()) return -1;
          if (a.name.toLowerCase() > b.name.toLowerCase()) return 1;
        } else {
          if (a.host.toLowerCase() < b.host.toLowerCase()) return -1;
          if (a.host.toLowerCase() > b.host.toLowerCase()) return 1;
        }
        return 0;
      });

      self.servers = servers;

      return self.servers;
    }
  }, {
    key: 'getTree',
    value: function getTree() {
      var self = this;

      if (self.tree == null) {
        (function () {
          var map = {};
          var root = { name: 'root', children: [] };
          var tree_folders = [];

          self.folders.forEach(function (item, index) {
            map[item.id] = tree_folders.push({ name: item.name, parent: item.parent, children: [] }) - 1;
          });

          tree_folders.sort(function (a, b) {
            if (a.name.toLowerCase() < b.name.toLowerCase()) return -1;
            if (a.name.toLowerCase() > b.name.toLowerCase()) return 1;
            return 0;
          });

          tree_folders.forEach(function (item, index) {
            if (item.parent !== null && typeof map[item.parent] !== 'undefined' && tree_folders[map[item.parent]] !== 'undefined') {
              tree_folders[map[item.parent]].children.push(item);
            } else {
              root.children.push(item);
            }
          });

          self.getServers().forEach(function (item, index) {
            if (typeof item.parent != 'undefined' && item.parent !== null) {
              tree_folders[map[item.parent]].children.push(item);
            } else {
              root.children.push(item);
            }
          });

          self.tree = root;
        })();
      }

      return self.tree;
    }
  }, {
    key: 'getServers',
    value: function getServers() {
      var self = this;

      if (!self.loaded) {
        self.load();
      }

      return self.servers;
    }
  }, {
    key: 'addServer',
    value: function addServer(server) {
      var self = this;

      if (!self.loaded) {
        self.load();
      }

      self.servers.push(server);
      self.tree = null;
    }
  }, {
    key: 'deleteServer',
    value: function deleteServer(index) {
      var self = this;

      if (!self.loaded) {
        self.load();
      }

      self.servers.splice(index, 1);
      self.tree = null;
    }
  }, {
    key: 'getServerByName',
    value: function getServerByName(name) {
      var self = this;

      if (!self.loaded) {
        self.load();
      }

      return self.servers.find(function (element) {
        return element.name == name;
      });
    }
  }, {
    key: 'loadFolders',
    value: function loadFolders(folders) {
      var self = this;

      folders = folders.map(function (item, index) {
        var cleanconfig = JSON.parse(JSON.stringify(folder_config));

        cleanconfig.id = item.id ? item.id : index + 1;
        cleanconfig.name = item.name ? item.name : cleanconfig.name + " " + (index + 1);
        cleanconfig.parent = item.parent ? item.parent : cleanconfig.parent;

        return cleanconfig;
      });

      folders.sort(function (a, b) {
        if (a.name.toLowerCase() < b.name.toLowerCase()) return -1;
        if (a.name.toLowerCase() > b.name.toLowerCase()) return 1;
        return 0;
      });

      self.folders = folders;

      return self.folders;
    }
  }, {
    key: 'getFolders',
    value: function getFolders() {
      var self = this;

      if (!self.loaded) {
        self.load();
      }

      return self.folders;
    }
  }, {
    key: 'getFoldersStructuredByTree',
    value: function getFoldersStructuredByTree() {
      var self = this;
      var map = {};
      var root = { name: 'root', children: [] };
      var tree_folders = [];

      self.folders.forEach(function (item, index) {
        map[item.id] = tree_folders.push({ id: item.id, name: item.name, parent: item.parent, children: [] }) - 1;
      });

      tree_folders.sort(function (a, b) {
        if (a.name.toLowerCase() < b.name.toLowerCase()) return -1;
        if (a.name.toLowerCase() > b.name.toLowerCase()) return 1;
        return 0;
      });

      tree_folders.forEach(function (item, index) {
        if (item.parent !== null && typeof map[item.parent] !== 'undefined' && tree_folders[map[item.parent]] !== 'undefined') {
          tree_folders[map[item.parent]].children.push(item);
        } else {
          root.children.push(item);
        }
      });

      var getFoldersAsArray = function getFoldersAsArray(elements) {
        var level = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];
        var array = arguments.length <= 2 || arguments[2] === undefined ? [] : arguments[2];
        var parents_id = arguments.length <= 3 || arguments[3] === undefined ? [] : arguments[3];

        elements.forEach(function (item, index) {
          item.name = '-'.repeat(level) + ' ' + item.name;
          item.parents_id = parents_id;
          array.push(item);
          getFoldersAsArray(item.children, level + 1, array, parents_id.concat(item.id));
        });

        return array;
      };

      return getFoldersAsArray(root.children);
    }
  }, {
    key: 'getFolder',
    value: function getFolder(id) {
      var self = this;

      if (!self.loaded) {
        self.load();
      }

      return self.folders.find(function (element) {
        return element.id === parseInt(id);
      });
    }
  }, {
    key: 'getFolderByName',
    value: function getFolderByName(name) {
      var self = this;

      if (!self.loaded) {
        self.load();
      }

      return self.folders.find(function (element) {
        return element.name == name;
      });
    }
  }, {
    key: 'addFolder',
    value: function addFolder(folder) {
      var self = this;

      if (!self.loaded) {
        self.load();
      }

      folder.id = self.nextFolderId();
      self.folders.push(folder);
      self.tree = null;

      return folder;
    }
  }, {
    key: 'deleteFolder',
    value: function deleteFolder(id) {
      var self = this;

      if (!self.loaded) {
        self.load();
      }

      var selected_folder = self.getFolder(id);
      var new_parent = selected_folder.parent || null;

      self.folders.splice(self.folders.findIndex(function (element) {
        return element.id === parseInt(id);
      }), 1);

      self.folders.forEach(function (item, index) {
        if (item.parent == parseInt(id)) {
          item.parent = new_parent;
        }
      });

      self.servers.forEach(function (item, index) {
        if (item.parent == parseInt(id)) {
          item.parent = new_parent;
        }
      });

      self.tree = null;
    }
  }, {
    key: 'nextFolderId',
    value: function nextFolderId() {
      var self = this;

      if (self.folders.length > 0) {
        return parseInt(Math.max.apply(null, self.folders.map(function (folder) {
          return folder.id;
        })) + 1);
      } else {
        return 1;
      }
    }
  }, {
    key: 'loadSettings',
    value: function loadSettings(settings) {
      self.settings = settings || {};
    }
  }, {
    key: 'migrate',
    value: function migrate(configArray) {
      var self = this;

      // since 0.14.0
      if (typeof configArray.version === 'undefined') {
        // backup current config
        self.backup(atom.packages.getActivePackage('ftp-remote-edit').metadata.version);

        // migrate
        var newConfigArray = {};
        newConfigArray.servers = configArray;
        newConfigArray.servers.forEach(function (item, index) {
          item.parent = null;
        });
        newConfigArray.folders = [];
        configArray = newConfigArray;

        // Init first version
        configArray.version = '0.14.0';
      }

      // since 0.14.2
      if (configArray.version == '') {
        // Fix error storing empty version
        configArray.version = '0.14.2';
      }

      // since 0.15.0
      if ((0, _helperHelperJs.compareVersions)(configArray.version, '0.15.0') < 0) {
        // backup current config
        self.backup('0.15.0');

        // migrate
        configArray.settings = {};
      }

      return configArray;
    }
  }, {
    key: 'backup',
    value: function backup(version) {
      var src = atom.config.getUserConfigPath();
      var dest = Path.dirname(atom.config.getUserConfigPath()) + Path.sep + 'ftp-remote-edit-config.cson.' + version;

      try {
        FileSystem.copyFileSync(src, dest);
      } catch (e) {
        console.log('Backup failed: ' + src + '->' + dest);
      }
    }
  }]);

  return Storage;
})();

module.exports = new Storage();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2FuYW5tYXlqYWluLy5hdG9tL3BhY2thZ2VzL2Z0cC1yZW1vdGUtZWRpdC9saWIvaGVscGVyL3N0b3JhZ2UuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs4QkFFZ0MsdUJBQXVCOzs4QkFDdkIsdUJBQXVCOzs4QkFDdEIsdUJBQXVCOzs2QkFDdEIsc0JBQXNCOztBQUx4RCxXQUFXLENBQUM7O0FBT1osSUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQztBQUN6QixJQUFNLElBQUksR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDN0IsSUFBTSxVQUFVLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDOztBQUV0QyxJQUFNLGFBQWEsR0FBRyxPQUFPLENBQUMsZ0NBQWdDLENBQUMsQ0FBQztBQUNoRSxJQUFNLGFBQWEsR0FBRyxPQUFPLENBQUMsZ0NBQWdDLENBQUMsQ0FBQzs7SUFFMUQsT0FBTztBQUVBLFdBRlAsT0FBTyxHQUVHOzBCQUZWLE9BQU87O0FBR1QsUUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDOztBQUVsQixRQUFJLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztBQUNsQixRQUFJLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztBQUNsQixRQUFJLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztBQUNsQixRQUFJLENBQUMsUUFBUSxHQUFHLEVBQUUsQ0FBQztBQUNuQixRQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztBQUNyQixRQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztBQUNwQixRQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztHQUNsQjs7ZUFaRyxPQUFPOztXQWNBLHFCQUFDLFFBQVEsRUFBRTtBQUNwQixVQUFNLElBQUksR0FBRyxJQUFJLENBQUM7O0FBRWxCLFVBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO0tBQzFCOzs7V0FFVSx1QkFBRztBQUNaLFVBQU0sSUFBSSxH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QUFDIiwiZmlsZSI6Ii9ob21lL2FuYW5tYXlqYWluLy5hdG9tL3BhY2thZ2VzL2Z0cC1yZW1vdGUtZWRpdC9saWIvaGVscGVyL3N0b3JhZ2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcblxuaW1wb3J0IHsgY2xlYW5Kc29uU3RyaW5nIH0gZnJvbSAnLi8uLi9oZWxwZXIvZm9ybWF0LmpzJztcbmltcG9ydCB7IGNvbXBhcmVWZXJzaW9ucyB9IGZyb20gJy4vLi4vaGVscGVyL2hlbHBlci5qcyc7XG5pbXBvcnQgeyBkZWNyeXB0LCBlbmNyeXB0IH0gZnJvbSAnLi8uLi9oZWxwZXIvc2VjdXJlLmpzJztcbmltcG9ydCB7IHRocm93RXJyb3JJc3N1ZTQ0IH0gZnJvbSAnLi8uLi9oZWxwZXIvaXNzdWUuanMnO1xuXG5jb25zdCBhdG9tID0gZ2xvYmFsLmF0b207XG5jb25zdCBQYXRoID0gcmVxdWlyZSgncGF0aCcpO1xuY29uc3QgRmlsZVN5c3RlbSA9IHJlcXVpcmUoJ2ZzLXBsdXMnKTtcblxuY29uc3Qgc2VydmVyX2NvbmZpZyA9IHJlcXVpcmUoJy4vLi4vY29uZmlnL3NlcnZlci1zY2hlbWEuanNvbicpO1xuY29uc3QgZm9sZGVyX2NvbmZpZyA9IHJlcXVpcmUoJy4vLi4vY29uZmlnL2ZvbGRlci1zY2hlbWEuanNvbicpO1xuXG5jbGFzcyBTdG9yYWdlIHtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcblxuICAgIHNlbGYuc2VydmVycyA9IFtdO1xuICAgIHNlbGYuZm9sZGVycyA9IFtdO1xuICAgIHNlbGYudmVyc2lvbiA9ICcnO1xuICAgIHNlbGYuc2V0dGluZ3MgPSB7fTtcbiAgICBzZWxmLnBhc3N3b3JkID0gbnVsbDtcbiAgICBzZWxmLmxvYWRlZCA9IGZhbHNlO1xuICAgIHNlbGYudHJlZSA9IG51bGw7XG4gIH1cblxuICBzZXRQYXNzd29yZChwYXNzd29yZCkge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuXG4gICAgc2VsZi5wYXNzd29yZCA9IHBhc3N3b3JkO1xuICB9XG5cbiAgZ2V0UGFzc3dvcmQoKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG5cbiAgICByZXR1cm4gc2VsZi5wYXNzd29yZDtcbiAgfVxuXG4gIGhhc1Bhc3N3b3JkKCkge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuXG4gICAgcmV0dXJuIHNlbGYucGFzc3dvcmQgIT09IG51bGw7XG4gIH1cblxuICBsb2FkKHJlbG9hZCA9IGZhbHNlKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG5cbiAgICBpZiAoIXNlbGYubG9hZGVkIHx8IHJlbG9hZCkge1xuICAgICAgbGV0IGNvbmZpZ1RleHQgPSBhdG9tLmNvbmZpZy5nZXQoJ2Z0cC1yZW1vdGUtZWRpdC5jb25maWcnKTtcbiAgICAgIGlmIChjb25maWdUZXh0KSB7XG4gICAgICAgIGNvbmZpZ1RleHQgPSBkZWNyeXB0KHNlbGYucGFzc3dvcmQsIGNvbmZpZ1RleHQpO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgY29uZmlnQXJyYXkgPSBzZWxmLm1pZ3JhdGUoSlNPTi5wYXJzZShjbGVhbkpzb25TdHJpbmcoY29uZmlnVGV4dCkpKTtcbiAgICAgICAgICBzZWxmLmxvYWRTZXJ2ZXJzKGNvbmZpZ0FycmF5LnNlcnZlcnMpO1xuICAgICAgICAgIHNlbGYubG9hZEZvbGRlcnMoY29uZmlnQXJyYXkuZm9sZGVycyk7XG4gICAgICAgICAgc2VsZi5sb2FkU2V0dGluZ3MoY29uZmlnQXJyYXkuc2V0dGluZ3MpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgdGhyb3dFcnJvcklzc3VlNDQoZSwgc2VsZi5wYXNzd29yZCk7XG4gICAgICAgIH1cblxuICAgICAgfVxuICAgICAgc2VsZi5sb2FkZWQgPSB0cnVlO1xuICAgICAgc2VsZi50cmVlID0gbnVsbDtcbiAgICAgIHNlbGYudmVyc2lvbiA9IGF0b20ucGFja2FnZXMuZ2V0QWN0aXZlUGFja2FnZSgnZnRwLXJlbW90ZS1lZGl0JykubWV0YWRhdGEudmVyc2lvbjtcbiAgICAgIHNlbGYuc2V0dGluZ3MgPSB7fTtcbiAgICB9XG5cbiAgICByZXR1cm4gc2VsZi5sb2FkZWQ7XG4gIH1cblxuICBzYXZlKCkge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuXG4gICAgYXRvbS5jb25maWcuc2V0KCdmdHAtcmVtb3RlLWVkaXQuY29uZmlnJywgZW5jcnlwdChzZWxmLnBhc3N3b3JkLCBKU09OLnN0cmluZ2lmeSh7XG4gICAgICB2ZXJzaW9uOiBzZWxmLnZlcnNpb24sXG4gICAgICBzZXJ2ZXJzOiBzZWxmLnNlcnZlcnMsXG4gICAgICBmb2xkZXJzOiBzZWxmLmZvbGRlcnMsXG4gICAgICBzZXR0aW5nczogc2VsZi5zZXR0aW5nc1xuICAgIH0pKSk7XG4gIH1cblxuICBsb2FkU2VydmVycyhzZXJ2ZXJzKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG5cbiAgICBzZXJ2ZXJzID0gc2VydmVycy5tYXAoKGl0ZW0sIGluZGV4KSA9PiB7XG4gICAgICBsZXQgY2xlYW5jb25maWcgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHNlcnZlcl9jb25maWcpKTtcblxuICAgICAgY2xlYW5jb25maWcubmFtZSA9IChpdGVtLm5hbWUpID8gaXRlbS5uYW1lIDogY2xlYW5jb25maWcubmFtZSArIFwiIFwiICsgKGluZGV4ICsgMSk7XG4gICAgICBjbGVhbmNvbmZpZy5ob3N0ID0gKGl0ZW0uaG9zdCkgPyBpdGVtLmhvc3QgOiBjbGVhbmNvbmZpZy5ob3N0O1xuICAgICAgY2xlYW5jb25maWcucG9ydCA9IChpdGVtLnBvcnQpID8gaXRlbS5wb3J0IDogY2xlYW5jb25maWcucG9ydDtcbiAgICAgIGNsZWFuY29uZmlnLnVzZXIgPSAoaXRlbS51c2VyKSA/IGl0ZW0udXNlciA6IGNsZWFuY29uZmlnLnVzZXI7XG4gICAgICBjbGVhbmNvbmZpZy5wYXJlbnQgPSAoaXRlbS5wYXJlbnQpID8gaXRlbS5wYXJlbnQgOiBjbGVhbmNvbmZpZy5wYXJlbnQ7XG4gICAgICBjbGVhbmNvbmZpZy51c2VBZ2VudCA9IChpdGVtLnVzZUFnZW50KSA/IGl0ZW0udXNlQWdlbnQgOiBjbGVhbmNvbmZpZy51c2VBZ2VudDtcbiAgICAgIGNsZWFuY29uZmlnLnBhc3N3b3JkID0gKGl0ZW0ucGFzc3dvcmQpID8gaXRlbS5wYXNzd29yZCA6IGNsZWFuY29uZmlnLnBhc3N3b3JkO1xuICAgICAgY2xlYW5jb25maWcuc2Z0cCA9IChpdGVtLnNmdHApID8gaXRlbS5zZnRwIDogY2xlYW5jb25maWcuc2Z0cDtcbiAgICAgIGNsZWFuY29uZmlnLnByaXZhdGVrZXlmaWxlID0gKGl0ZW0ucHJpdmF0ZWtleWZpbGUpID8gaXRlbS5wcml2YXRla2V5ZmlsZSA6IGNsZWFuY29uZmlnLnByaXZhdGVrZXlmaWxlO1xuICAgICAgY2xlYW5jb25maWcucmVtb3RlID0gKGl0ZW0ucmVtb3RlKSA/IGl0ZW0ucmVtb3RlIDogY2xlYW5jb25maWcucmVtb3RlO1xuICAgICAgY2xlYW5jb25maWcudGVtcCA9IChpdGVtLnRlbXApID8gaXRlbS50ZW1wIDogY2xlYW5jb25maWcudGVtcDtcblxuICAgICAgaWYgKGNsZWFuY29uZmlnLnVzZUFnZW50KSB7XG4gICAgICAgIGNsZWFuY29uZmlnLmxvZ29uID0gJ2FnZW50JztcbiAgICAgIH0gZWxzZSBpZiAoaXRlbS5wcml2YXRla2V5ZmlsZSkge1xuICAgICAgICBjbGVhbmNvbmZpZy5sb2dvbiA9ICdrZXlmaWxlJztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNsZWFuY29uZmlnLmxvZ29uID0gJ2NyZWRlbnRpYWxzJztcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGNsZWFuY29uZmlnO1xuICAgIH0pO1xuXG4gICAgbGV0IHNvcnRTZXJ2ZXJQcm9maWxlc0J5TmFtZSA9IGF0b20uY29uZmlnLmdldCgnZnRwLXJlbW90ZS1lZGl0LnRyZWUuc29ydFNlcnZlclByb2ZpbGVzQnlOYW1lJyk7XG4gICAgc2VydmVycy5zb3J0KChhLCBiKSA9PiB7XG4gICAgICBpZiAoc29ydFNlcnZlclByb2ZpbGVzQnlOYW1lKSB7XG4gICAgICAgIGlmIChhLm5hbWUudG9Mb3dlckNhc2UoKSA8IGIubmFtZS50b0xvd2VyQ2FzZSgpKSByZXR1cm4gLTE7XG4gICAgICAgIGlmIChhLm5hbWUudG9Mb3dlckNhc2UoKSA+IGIubmFtZS50b0xvd2VyQ2FzZSgpKSByZXR1cm4gMTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChhLmhvc3QudG9Mb3dlckNhc2UoKSA8IGIuaG9zdC50b0xvd2VyQ2FzZSgpKSByZXR1cm4gLTE7XG4gICAgICAgIGlmIChhLmhvc3QudG9Mb3dlckNhc2UoKSA+IGIuaG9zdC50b0xvd2VyQ2FzZSgpKSByZXR1cm4gMTtcbiAgICAgIH1cbiAgICAgIHJldHVybiAwO1xuICAgIH0pO1xuXG4gICAgc2VsZi5zZXJ2ZXJzID0gc2VydmVycztcblxuICAgIHJldHVybiBzZWxmLnNlcnZlcnM7XG4gIH1cblxuICBnZXRUcmVlKCkge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuXG4gICAgaWYgKHNlbGYudHJlZSA9PSBudWxsKSB7XG4gICAgICBsZXQgbWFwID0ge307XG4gICAgICBsZXQgcm9vdCA9IHsgbmFtZTogJ3Jvb3QnLCBjaGlsZHJlbjogW10gfTtcbiAgICAgIGxldCB0cmVlX2ZvbGRlcnMgPSBbXTtcblxuICAgICAgc2VsZi5mb2xkZXJzLmZvckVhY2goKGl0ZW0sIGluZGV4KSA9PiB7XG4gICAgICAgIG1hcFtpdGVtLmlkXSA9IHRyZWVfZm9sZGVycy5wdXNoKHsgbmFtZTogaXRlbS5uYW1lLCBwYXJlbnQ6IGl0ZW0ucGFyZW50LCBjaGlsZHJlbjogW10gfSkgLSAxO1xuICAgICAgfSk7XG5cbiAgICAgIHRyZWVfZm9sZGVycy5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgICAgIGlmIChhLm5hbWUudG9Mb3dlckNhc2UoKSA8IGIubmFtZS50b0xvd2VyQ2FzZSgpKSByZXR1cm4gLTE7XG4gICAgICAgIGlmIChhLm5hbWUudG9Mb3dlckNhc2UoKSA+IGIubmFtZS50b0xvd2VyQ2FzZSgpKSByZXR1cm4gMTtcbiAgICAgICAgcmV0dXJuIDA7XG4gICAgICB9KTtcblxuICAgICAgdHJlZV9mb2xkZXJzLmZvckVhY2goKGl0ZW0sIGluZGV4KSA9PiB7XG4gICAgICAgIGlmIChpdGVtLnBhcmVudCAhPT0gbnVsbCAmJiB0eXBlb2YgbWFwW2l0ZW0ucGFyZW50XSAhPT0gJ3VuZGVmaW5lZCcgJiYgdHJlZV9mb2xkZXJzW21hcFtpdGVtLnBhcmVudF1dICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgIHRyZWVfZm9sZGVyc1ttYXBbaXRlbS5wYXJlbnRdXS5jaGlsZHJlbi5wdXNoKGl0ZW0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJvb3QuY2hpbGRyZW4ucHVzaChpdGVtKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIHNlbGYuZ2V0U2VydmVycygpLmZvckVhY2goKGl0ZW0sIGluZGV4KSA9PiB7XG4gICAgICAgIGlmICh0eXBlb2YgaXRlbS5wYXJlbnQgIT0gJ3VuZGVmaW5lZCcgJiYgaXRlbS5wYXJlbnQgIT09IG51bGwpIHtcbiAgICAgICAgICB0cmVlX2ZvbGRlcnNbbWFwW2l0ZW0ucGFyZW50XV0uY2hpbGRyZW4ucHVzaChpdGVtKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByb290LmNoaWxkcmVuLnB1c2goaXRlbSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICBzZWxmLnRyZWUgPSByb290O1xuICAgIH1cblxuICAgIHJldHVybiBzZWxmLnRyZWU7XG4gIH1cblxuICBnZXRTZXJ2ZXJzKCkge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuXG4gICAgaWYgKCFzZWxmLmxvYWRlZCkge1xuICAgICAgc2VsZi5sb2FkKCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHNlbGYuc2VydmVycztcbiAgfVxuXG4gIGFkZFNlcnZlcihzZXJ2ZXIpIHtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcblxuICAgIGlmICghc2VsZi5sb2FkZWQpIHtcbiAgICAgIHNlbGYubG9hZCgpO1xuICAgIH1cblxuICAgIHNlbGYuc2VydmVycy5wdXNoKHNlcnZlcik7XG4gICAgc2VsZi50cmVlID0gbnVsbDtcbiAgfVxuXG4gIGRlbGV0ZVNlcnZlcihpbmRleCkge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuXG4gICAgaWYgKCFzZWxmLmxvYWRlZCkge1xuICAgICAgc2VsZi5sb2FkKCk7XG4gICAgfVxuXG4gICAgc2VsZi5zZXJ2ZXJzLnNwbGljZShpbmRleCwgMSk7XG4gICAgc2VsZi50cmVlID0gbnVsbDtcbiAgfVxuXG4gIGdldFNlcnZlckJ5TmFtZShuYW1lKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG5cbiAgICBpZiAoIXNlbGYubG9hZGVkKSB7XG4gICAgICBzZWxmLmxvYWQoKTtcbiAgICB9XG5cbiAgICByZXR1cm4gc2VsZi5zZXJ2ZXJzLmZpbmQoKGVsZW1lbnQpID0+IHsgcmV0dXJuIGVsZW1lbnQubmFtZSA9PSBuYW1lOyB9KTtcbiAgfVxuXG4gIGxvYWRGb2xkZXJzKGZvbGRlcnMpIHtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcblxuICAgIGZvbGRlcnMgPSBmb2xkZXJzLm1hcCgoaXRlbSwgaW5kZXgpID0+IHtcbiAgICAgIGxldCBjbGVhbmNvbmZpZyA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoZm9sZGVyX2NvbmZpZykpO1xuXG4gICAgICBjbGVhbmNvbmZpZy5pZCA9IChpdGVtLmlkKSA/IGl0ZW0uaWQgOiAoaW5kZXggKyAxKTtcbiAgICAgIGNsZWFuY29uZmlnLm5hbWUgPSAoaXRlbS5uYW1lKSA/IGl0ZW0ubmFtZSA6IGNsZWFuY29uZmlnLm5hbWUgKyBcIiBcIiArIChpbmRleCArIDEpO1xuICAgICAgY2xlYW5jb25maWcucGFyZW50ID0gKGl0ZW0ucGFyZW50KSA/IGl0ZW0ucGFyZW50IDogY2xlYW5jb25maWcucGFyZW50O1xuXG4gICAgICByZXR1cm4gY2xlYW5jb25maWc7XG4gICAgfSk7XG5cbiAgICBmb2xkZXJzLnNvcnQoKGEsIGIpID0+IHtcbiAgICAgIGlmIChhLm5hbWUudG9Mb3dlckNhc2UoKSA8IGIubmFtZS50b0xvd2VyQ2FzZSgpKSByZXR1cm4gLTE7XG4gICAgICBpZiAoYS5uYW1lLnRvTG93ZXJDYXNlKCkgPiBiLm5hbWUudG9Mb3dlckNhc2UoKSkgcmV0dXJuIDE7XG4gICAgICByZXR1cm4gMDtcbiAgICB9KTtcblxuICAgIHNlbGYuZm9sZGVycyA9IGZvbGRlcnM7XG5cbiAgICByZXR1cm4gc2VsZi5mb2xkZXJzO1xuICB9XG5cbiAgZ2V0Rm9sZGVycygpIHtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcblxuICAgIGlmICghc2VsZi5sb2FkZWQpIHtcbiAgICAgIHNlbGYubG9hZCgpO1xuICAgIH1cblxuICAgIHJldHVybiBzZWxmLmZvbGRlcnM7XG4gIH1cblxuICBnZXRGb2xkZXJzU3RydWN0dXJlZEJ5VHJlZSgpIHtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcbiAgICBsZXQgbWFwID0ge307XG4gICAgbGV0IHJvb3QgPSB7IG5hbWU6ICdyb290JywgY2hpbGRyZW46IFtdIH07XG4gICAgbGV0IHRyZWVfZm9sZGVycyA9IFtdO1xuXG4gICAgc2VsZi5mb2xkZXJzLmZvckVhY2goKGl0ZW0sIGluZGV4KSA9PiB7XG4gICAgICBtYXBbaXRlbS5pZF0gPSB0cmVlX2ZvbGRlcnMucHVzaCh7IGlkOiBpdGVtLmlkLCBuYW1lOiBpdGVtLm5hbWUsIHBhcmVudDogaXRlbS5wYXJlbnQsIGNoaWxkcmVuOiBbXSB9KSAtIDE7XG4gICAgfSk7XG5cbiAgICB0cmVlX2ZvbGRlcnMuc29ydChmdW5jdGlvbiAoYSwgYikge1xuICAgICAgaWYgKGEubmFtZS50b0xvd2VyQ2FzZSgpIDwgYi5uYW1lLnRvTG93ZXJDYXNlKCkpIHJldHVybiAtMTtcbiAgICAgIGlmIChhLm5hbWUudG9Mb3dlckNhc2UoKSA+IGIubmFtZS50b0xvd2VyQ2FzZSgpKSByZXR1cm4gMTtcbiAgICAgIHJldHVybiAwO1xuICAgIH0pO1xuXG4gICAgdHJlZV9mb2xkZXJzLmZvckVhY2goKGl0ZW0sIGluZGV4KSA9PiB7XG4gICAgICBpZiAoaXRlbS5wYXJlbnQgIT09IG51bGwgJiYgdHlwZW9mIG1hcFtpdGVtLnBhcmVudF0gIT09ICd1bmRlZmluZWQnICYmIHRyZWVfZm9sZGVyc1ttYXBbaXRlbS5wYXJlbnRdXSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgdHJlZV9mb2xkZXJzW21hcFtpdGVtLnBhcmVudF1dLmNoaWxkcmVuLnB1c2goaXRlbSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByb290LmNoaWxkcmVuLnB1c2goaXRlbSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBsZXQgZ2V0Rm9sZGVyc0FzQXJyYXkgPSBmdW5jdGlvbiAoZWxlbWVudHMsIGxldmVsID0gMCwgYXJyYXkgPSBbXSwgcGFyZW50c19pZCA9IFtdKSB7XG4gICAgICBlbGVtZW50cy5mb3JFYWNoKChpdGVtLCBpbmRleCkgPT4ge1xuICAgICAgICBpdGVtLm5hbWUgPSAnLScucmVwZWF0KGxldmVsKSArICcgJyArIGl0ZW0ubmFtZTtcbiAgICAgICAgaXRlbS5wYXJlbnRzX2lkID0gcGFyZW50c19pZDtcbiAgICAgICAgYXJyYXkucHVzaChpdGVtKTtcbiAgICAgICAgZ2V0Rm9sZGVyc0FzQXJyYXkoaXRlbS5jaGlsZHJlbiwgbGV2ZWwgKyAxLCBhcnJheSwgcGFyZW50c19pZC5jb25jYXQoaXRlbS5pZCkpO1xuICAgICAgfSk7XG5cbiAgICAgIHJldHVybiBhcnJheTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIGdldEZvbGRlcnNBc0FycmF5KHJvb3QuY2hpbGRyZW4pO1xuICB9XG5cbiAgZ2V0Rm9sZGVyKGlkKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG5cbiAgICBpZiAoIXNlbGYubG9hZGVkKSB7XG4gICAgICBzZWxmLmxvYWQoKTtcbiAgICB9XG5cbiAgICByZXR1cm4gc2VsZi5mb2xkZXJzLmZpbmQoKGVsZW1lbnQpID0+IHsgcmV0dXJuIGVsZW1lbnQuaWQgPT09IHBhcnNlSW50KGlkKTsgfSk7XG4gIH1cblxuICBnZXRGb2xkZXJCeU5hbWUobmFtZSkge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuXG4gICAgaWYgKCFzZWxmLmxvYWRlZCkge1xuICAgICAgc2VsZi5sb2FkKCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHNlbGYuZm9sZGVycy5maW5kKChlbGVtZW50KSA9PiB7IHJldHVybiBlbGVtZW50Lm5hbWUgPT0gbmFtZTsgfSk7XG4gIH1cblxuICBhZGRGb2xkZXIoZm9sZGVyKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG5cbiAgICBpZiAoIXNlbGYubG9hZGVkKSB7XG4gICAgICBzZWxmLmxvYWQoKTtcbiAgICB9XG5cbiAgICBmb2xkZXIuaWQgPSBzZWxmLm5leHRGb2xkZXJJZCgpO1xuICAgIHNlbGYuZm9sZGVycy5wdXNoKGZvbGRlcik7XG4gICAgc2VsZi50cmVlID0gbnVsbDtcblxuICAgIHJldHVybiBmb2xkZXI7XG4gIH1cblxuICBkZWxldGVGb2xkZXIoaWQpIHtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcblxuICAgIGlmICghc2VsZi5sb2FkZWQpIHtcbiAgICAgIHNlbGYubG9hZCgpO1xuICAgIH1cblxuICAgIGxldCBzZWxlY3RlZF9mb2xkZXIgPSBzZWxmLmdldEZvbGRlcihpZCk7XG4gICAgbGV0IG5ld19wYXJlbnQgPSBzZWxlY3RlZF9mb2xkZXIucGFyZW50IHx8IG51bGw7XG5cbiAgICBzZWxmLmZvbGRlcnMuc3BsaWNlKHNlbGYuZm9sZGVycy5maW5kSW5kZXgoKGVsZW1lbnQpID0+IHsgcmV0dXJuIGVsZW1lbnQuaWQgPT09IHBhcnNlSW50KGlkKTsgfSksIDEpO1xuXG4gICAgc2VsZi5mb2xkZXJzLmZvckVhY2goKGl0ZW0sIGluZGV4KSA9PiB7XG4gICAgICBpZiAoaXRlbS5wYXJlbnQgPT0gcGFyc2VJbnQoaWQpKSB7XG4gICAgICAgIGl0ZW0ucGFyZW50ID0gbmV3X3BhcmVudDtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHNlbGYuc2VydmVycy5mb3JFYWNoKChpdGVtLCBpbmRleCkgPT4ge1xuICAgICAgaWYgKGl0ZW0ucGFyZW50ID09IHBhcnNlSW50KGlkKSkge1xuICAgICAgICBpdGVtLnBhcmVudCA9IG5ld19wYXJlbnQ7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBzZWxmLnRyZWUgPSBudWxsO1xuICB9XG5cbiAgbmV4dEZvbGRlcklkKCkge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuXG4gICAgaWYgKHNlbGYuZm9sZGVycy5sZW5ndGggPiAwKSB7XG4gICAgICByZXR1cm4gcGFyc2VJbnQoTWF0aC5tYXguYXBwbHkobnVsbCwgc2VsZi5mb2xkZXJzLm1hcCgoZm9sZGVyKSA9PiB7IHJldHVybiBmb2xkZXIuaWQ7IH0pKSArIDEpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gMTtcbiAgICB9XG4gIH1cblxuICBsb2FkU2V0dGluZ3Moc2V0dGluZ3MpIHtcbiAgICBzZWxmLnNldHRpbmdzID0gc2V0dGluZ3MgfHwge307XG4gIH1cblxuICBtaWdyYXRlKGNvbmZpZ0FycmF5KSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG5cbiAgICAvLyBzaW5jZSAwLjE0LjBcbiAgICBpZiAodHlwZW9mIGNvbmZpZ0FycmF5LnZlcnNpb24gPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAvLyBiYWNrdXAgY3VycmVudCBjb25maWdcbiAgICAgIHNlbGYuYmFja3VwKGF0b20ucGFja2FnZXMuZ2V0QWN0aXZlUGFja2FnZSgnZnRwLXJlbW90ZS1lZGl0JykubWV0YWRhdGEudmVyc2lvbik7XG5cbiAgICAgIC8vIG1pZ3JhdGVcbiAgICAgIGxldCBuZXdDb25maWdBcnJheSA9IHt9O1xuICAgICAgbmV3Q29uZmlnQXJyYXkuc2VydmVycyA9IGNvbmZpZ0FycmF5O1xuICAgICAgbmV3Q29uZmlnQXJyYXkuc2VydmVycy5mb3JFYWNoKChpdGVtLCBpbmRleCkgPT4ge1xuICAgICAgICBpdGVtLnBhcmVudCA9IG51bGw7XG4gICAgICB9KTtcbiAgICAgIG5ld0NvbmZpZ0FycmF5LmZvbGRlcnMgPSBbXTtcbiAgICAgIGNvbmZpZ0FycmF5ID0gbmV3Q29uZmlnQXJyYXk7XG5cbiAgICAgIC8vIEluaXQgZmlyc3QgdmVyc2lvblxuICAgICAgY29uZmlnQXJyYXkudmVyc2lvbiA9ICcwLjE0LjAnO1xuICAgIH1cblxuICAgIC8vIHNpbmNlIDAuMTQuMlxuICAgIGlmIChjb25maWdBcnJheS52ZXJzaW9uID09ICcnKSB7XG4gICAgICAvLyBGaXggZXJyb3Igc3RvcmluZyBlbXB0eSB2ZXJzaW9uXG4gICAgICBjb25maWdBcnJheS52ZXJzaW9uID0gJzAuMTQuMic7XG4gICAgfVxuICBcbiAgICAvLyBzaW5jZSAwLjE1LjBcbiAgICBpZiAoY29tcGFyZVZlcnNpb25zKGNvbmZpZ0FycmF5LnZlcnNpb24sICcwLjE1LjAnKSA8IDApIHtcbiAgICAgIC8vIGJhY2t1cCBjdXJyZW50IGNvbmZpZ1xuICAgICAgc2VsZi5iYWNrdXAoJzAuMTUuMCcpO1xuXG4gICAgICAvLyBtaWdyYXRlXG4gICAgICBjb25maWdBcnJheS5zZXR0aW5ncyA9IHt9O1xuICAgIH1cblxuICAgIHJldHVybiBjb25maWdBcnJheTtcbiAgfVxuXG4gIGJhY2t1cCh2ZXJzaW9uKSB7XG4gICAgY29uc3Qgc3JjID0gYXRvbS5jb25maWcuZ2V0VXNlckNvbmZpZ1BhdGgoKTtcbiAgICBjb25zdCBkZXN0ID0gUGF0aC5kaXJuYW1lKGF0b20uY29uZmlnLmdldFVzZXJDb25maWdQYXRoKCkpICsgUGF0aC5zZXAgKyAnZnRwLXJlbW90ZS1lZGl0LWNvbmZpZy5jc29uLicgKyB2ZXJzaW9uO1xuXG4gICAgdHJ5IHtcbiAgICAgIEZpbGVTeXN0ZW0uY29weUZpbGVTeW5jKHNyYywgZGVzdCk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgY29uc29sZS5sb2coJ0JhY2t1cCBmYWlsZWQ6ICcgKyBzcmMgKyAnLT4nICsgZGVzdCk7XG4gICAgfVxuICB9XG59XG5tb2R1bGUuZXhwb3J0cyA9IG5ldyBTdG9yYWdlO1xuIl19