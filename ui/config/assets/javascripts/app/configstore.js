define(function(require, exports, module) {
	'use strict';

	var ConfigActions = require('app/configactions'),
		socket = require('app/socket');

	socket.on(socket.CONFIG_UPDATE_EVENT, function (json) {
		ConfigActions.updateAll(json);
	});

	module.exports = Reflux.createStore({

		listenables: [ ConfigActions ],

		getInitialState: function () {
			if (!this.config) this.config = {};
			return this.config;
		},

		pushState: function (path, value) {
			socket.emit('/set', {
				path: path,
				value: value
			});
			this.trigger(this.config);
		},

		onUpdateAll: function (config) {
			this.config = config;
			this.trigger(this.config);
		},

		onValueUpdate: function (path, value) {
			var ppath = this.getParentPath(path),
				obj = this.getByPath(ppath.parent);
			if (!obj) return;

			obj[ppath.self] = value;
			this.pushState(path, value);
		},

		onValueDelete: function (path) {
			var ppath = this.getParentPath(path),
				obj = this.getByPath(ppath.parent);
			if (!obj) return;

			var type = typeof obj;
			if (type === 'object' && Array.isArray(obj))
				type = 'array';

			if (type === 'array') {
				var index = +ppath.self;
				if (index > -1) {
					obj.splice(index, 1);
					this.pushState(ppath.parent, obj);
				}

			} else if (type === 'object') {
				delete obj[ppath.self];
				this.pushState(ppath.parent, obj);
			}
		},

		onAddValueToArray: function (path, value) {
			var obj = this.getByPath(path);
			if (!obj) return;

			obj.push(value);
			this.pushState(path, obj);
		},

		onAddValueToObject: function (path, key, value) {
			var obj = this.getByPath(path);
			if (!obj) return;

			obj[key] = value;
			this.pushState(path, obj);
		},

		getParentPath: function (path) {
			var list = path.split('/'),
				last = list.pop();

			return {
				parent: list.join('/'),
				self: last
			};
		},

		getByPath: function (path) {
			var cursor = this.config,
				list = path.split('/'),
				last = list.pop();

			list.forEach(function (key) {
				if (cursor[key] === undefined)
					cursor[key] = {};

				cursor = cursor[key];
			});

			if (cursor[last] === undefined)
				cursor[last] = {};

			return cursor[last];
		}

	});
});
