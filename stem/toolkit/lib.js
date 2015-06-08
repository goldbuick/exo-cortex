
// toolkit api

var config = require('./config'),
	httpjson = require('./httpjson'),
	httppost = require('./httppost'),
	uuid = require('node-uuid'),
	gupstream = undefined;

function Message (channel, type, data) {
	return {
		id: uuid.v4(),
		when: new Date().toISOString(),
		channel: channel,
		type: type,
		meta: data
	};
}

function Channel (server, name) {
	this.name = name;
	this.server = server;
	this.handlers = { };
}

Channel.prototype = {
	constructor: Channel,

	message: function (type, handler) {
		this.handlers[type] = handler;
	},

	emit: function (type, data) {
		// generate event
		var message = Message(this.name, type, data);

		// transmit upstream
		this.server.emit(message);
	}
};

function Server (name) {
	var self = this;

	this.name = name;

	// these map to routes /hello/world etc...
	this.channels = { };

	// generic http post handler
	function httpPost (url, json) {
		// invoke config handler
		var result = self.configAPI.handler(url, json);
		if (result) return;

		// invoke generic handler
		if (self.any) {
			self.any(json);
		}

		// lookup specific handlers
		var channel,
			handler,
			route = url.split('/');

		route.shift();
		var _channel = route[0],
			_type = route[1];

		if (json) {
			// validate channel
			if (_channel) {
				channel = self.channels[_channel];
			}

			// validate type
			if (channel && _type) {
				handler = channel.handlers[_type];
			}

			// invoke handler
			if (handler) {
				// invoke handler
				return handler(json);

			} else {
				self.emit(json);

			}

		} else {
			// validate channel
			if (_channel) {
				channel = self.channels[_channel];
			}

			// validate type
			if (_type) {
				handler = channel.handlers[_type];
			}

			if (!channel) {
				// list channels
				return {
					channels: Object.keys(self.channels)
				};

			} else if (!handler) {
				// list handlers
				return {
					handlers: Object.keys(channel.handlers)
				};

			} else {
				// describe handler
				return handler();

			}
		}
	}

	// track current httpPort & http server instance
	this.httpPort = -1;
	this.http = undefined;	

	// create standard config api
	this.configAPI = config.createConfig(name);

	// handle config changes
	this.configAPI.updated(function (json) {
		// manage upstream state
		if (json.upstream !== undefined) {
			gupstream = json.upstream;
		}

		// manage http server state
		if (json.port !== undefined && json.port !== self.httpPort) {
			// kill existing server
			var restarted = false;
			if (self.http) {
				restarted = true;
				self.http.close();
			}

			// create http server
			self.http = httpjson(httpPost);

			// ready to start listening
			self.httpPort = json.port;
			self.http.listen(json.port);

			// signal creation of http object
			if (self.onCreated) {
				self.onCreated(self.http, self.httpPort);
			}

			if (restarted) {
				// signal config-server to track new connection info
				self.config.start();

			} else {
				// signal state of routes handled to
				self.register();
			}
		}
	});
}

Server.prototype = {
	constructor: Server,

	channel: function (name) {
		this.channels[name] = new Channel(this, name);
		return this.channels[name];
	},

	created: function (handler) {
		this.onCreated = handler;
	},

	start: function () {
		// request config state
		this.configAPI.start();
	},

	message: function (handler) {
		this.any = handler;
	},

	post: function (host, port, path, route, json) {
		httppost(host, port, path + route, json);
	},

	emit: function (json) {
		if (!gupstream) {
			console.log('emit', json);

		} else {
		    var path = (gupstream.path || '') + '/upstream';
			httppost(gupstream.host, gupstream.port, path, json);
		}
	},

	register: function () {
		var channels = this.channels,
			routes = [];

		// build a list of routes handled
		Object.keys(channels).forEach(function (_channel) {
			var channel = channels[_channel];
			Object.keys(channel.handlers).forEach(function (_handler) {
				routes.push([_channel, _handler].join('/'));
			});
		});
		
		this.configAPI.change('/routes', routes);
	},

	config: function (path, rule, trigger) {
		this.configAPI.validate(path, rule, trigger);
	}
};

module.exports = {
	createServer: function (name) {
		return new Server(name);
	}
};




