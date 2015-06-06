
// CONFIG API

var io,
	config = require('./toolkit/config'),
	httpjson = require('./toolkit/httpjson'),
	httppost = require('./toolkit/httppost');

// define default config values
var gbasePort = config.LISTEN_PORT + 1;
function createConfig () {
	++gbasePort;
	return {
		port: gbasePort
	};
}

// cached connection info
var gnodes = { };

// define config-server api
var gvalues = { },
	ghandlers = { };

function on (route, handler) {
	ghandlers[route] = handler;
}

// signal a node has come online
on('/start', function (data) {
	if (!data.name) return;

	// create stub config if needed
	if (!gvalues[data.name]) {
		gvalues[data.name] = createConfig();
	}

	// signal web ui of updated config
	io.emit(config.CONFIG_UPDATE_URL, gvalues);

	// initial config
	var result = gvalues[data.name];

	// cache conneciton info for node
	gnodes[data.name] = {
		host: result.host,
		port: result.port,
		path: result.path
	};

	console.log('/start', gnodes);

	// signal node of initial config
	return result;
});

// set values config data
on('/set', function (data) {
	var cursor = gvalues,
		path = data.path.split('/'),
		last = path.pop(),
		first = path[0] || last;
	
	// search value tree
	path.forEach(function (key) {
		if (!cursor[key]) {
			cursor[key] = { };
		}
		cursor = cursor[key];
	});

	// update values
	cursor[last] = data.value;

	// push routing api
	pushRoutes();

	// validate node exists
	var node = gvalues[first],
		send = gnodes[first];
	if (!node || !send) return;

	// signal node of updated config
	var path = (send.path || '') + config.CONFIG_UPDATE_URL;
	httppost(send.host, send.port, path, node);

	// signal web ui of updated config
	io.emit(config.CONFIG_UPDATE_URL, gvalues);
});

// get values config data
on('/get', function (data) {
	var cursor = gvalues,
		path = data.path.split('/');
	
	// search value tree
	path.forEach(function (key) {
		if (!cursor[key]) {
			cursor[key] = { };
		}
		cursor = cursor[key];
	});

	// return value
	return cursor;
});

// get the composite route based api
function pushRoutes() {
	var name = 'terminal-server',
		node = gvalues[name],
		send = gnodes[name];
	if (!node || !send) return;

	node.api = { };

	Object.keys(gnodes).forEach(function (_name) {
		if (_name === name) return;

		var _node = gvalues[_name]
			_send = gnodes[_name];
		if (!_node.routes || !_node.routes.length) return;

		_node.routes.forEach(function (route) {
			node.api[route] = {
				host: _send.host,
				port: _send.port,
				path: _send.path
			};
		});
	});

	// signal node of updated config
	var path = (send.path || '') + config.CONFIG_UPDATE_URL;
	httppost(send.host, send.port, path, node);	
}

// create http post API
var http = httpjson(function (url, json) {
	var handler = ghandlers[url];
	if (!handler) return;

	return handler(json);
});

// start server
http.listen(config.LISTEN_PORT);

// create websocket API
io = require('socket.io')(http);

// listen for new clients
io.on('connection', function(socket) {
	var events = Object.keys(ghandlers);

	// write up handlers
	events.forEach(function (event) {
		socket.on(event, ghandlers[event]);
	});

	// signal web ui state of config
	io.emit(config.CONFIG_UPDATE_URL, gvalues);
});
