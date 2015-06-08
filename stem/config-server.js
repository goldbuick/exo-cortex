#!/usr/local/bin/node

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
var gts = 'terminal-server',
    gvalues = { },
    ghandlers = { },
    gupstream = { };

function on (route, handler) {
    ghandlers[route] = function (data) {
        console.log('on', route, data);
        return handler(data);
    };
}

// signal ui / node of state change
function postConfig (name, ui) {
    var node = gvalues[name],
        send = gnodes[name];
    if (!node || !send) return;

    // signal node of updated config
    var path = (send.path || '') + config.CONFIG_UPDATE_URL;
    httppost(send.host, send.port, path, node);

    // signal web ui of updated config
    if (ui) io.emit(config.CONFIG_UPDATE_URL, gvalues);
}

// get the composite route based api
function genRoutes() {
    var node = gvalues[gts];
    if (!node) return;

    node.api = { };

    Object.keys(gnodes).filter(function (name) {
        return name !== gts;

    }).forEach(function (name) {
        var _node = gvalues[name],
            _send = gnodes[name];

        if (!_node.routes || !_node.routes.length) return;

        _node.routes.forEach(function (route) {
            node.api[route] = {
                host: _send.host,
                port: _send.port,
                path: _send.path
            };
        });
    });

    // push config state
    postConfig(gts, true);    
}

// update upstream configs
function genUpstream() {
    Object.keys(gvalues).filter(function (name) {
        return name !== gts && gvalues[name].upstream !== undefined;

    }).forEach(function (name) {
        var _name = gvalues[name].upstream.name,
            _send = gnodes[_name];
        if (!_name || !_send) return;

        // update upstream values
        gvalues[name].upstream.host = _send.host;
        gvalues[name].upstream.port = _send.port;
        gvalues[name].upstream.path = _send.path;
        var _upstream = JSON.stringify(gvalues[name].upstream);

        // only post when values have changed
        if (_upstream !== gupstream[name]) {
            gupstream[name] = _upstream;

            // push config state
            postConfig(name, false);
        }
    });
}

// update generated portions of config
var gc;
function genConfig () {
    clearTimeout(gc);
    gc = setTimeout(function() {

        // gen route api for terminal-server
        genRoutes();

        // update upstream configs for nodes
        genUpstream();

    }, 1000);
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

    // push config state
    postConfig(first, true);

    // kickoff generated config
    genConfig();
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
