
// CONFIG API

var io,
    url = require('url'),
    argv = require('yargs').argv,
    config = require('./toolkit/config'),
    httpjson = require('./toolkit/httpjson'),
    httppost = require('./toolkit/httppost'),
    rethinkdb = require('./toolkit/rethinkdb');

// define default config values
var gbaseport = config.LISTEN_PORT + 1;
function getPort (name) {
    // terminal server alwasy has the same port
    if (name === gts) return config.TERMINAL_PORT;
    // when running in a container
    if (argv.docker) return config.DOCKER_MODE_PORT;
    // when running locally on your machine
    return ++gbaseport;
}

function createConfig (name) {
    return {
        port: getPort(name)
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
    ghandlers[route] = function (data, req) {
        console.log('on', route, data);
        return handler(data, req);
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

        // flush config changes
        writeConfig();

    }, 1000);
}

// signal a node has come online
on('/start', function (data, req) {
    if (!data.name) return;

    // console.log('$$$$ data.name', req.socket.remoteAddress);
    // console.log('$$$$ data.name', req.socket.remotePort);

    // create stub config if needed
    if (!gvalues[data.name]) {
        gvalues[data.name] = createConfig(data.name);
    }

    // signal web ui of updated config
    io.emit(config.CONFIG_UPDATE_URL, gvalues);

    // initial config
    var result = gvalues[data.name];

    // auto-gen host
    // result.host = req.socket.remoteAddress;

    // cache conneciton info for node
    gnodes[data.name] = {
        host: result.host,
        port: result.port,
        path: result.path
    };

    // flush config changes
    writeConfig();

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

// get the connection info for the terminal server
on('/terminal', function () {
    var terminal = gnodes[gts];
    return terminal;
});

// create http post API
var http = httpjson(function (req, json, finish) {
    console.log('httpjson', req.url, json);
    var handler = ghandlers[req.url];
    if (handler) {
        console.log('found handler for', req.url);        
        return finish(handler(json, req));
    }
    finish();
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

// get config state from rethinkdb
var conn = url.parse('http://' + argv.rethinkdb),
    db = rethinkdb.create('exo', 'config'),
    writeQueue = [];

function writeConfig () {
    Object.keys(gvalues).forEach(function (name) {
        if (writeQueue.indexOf(name) === -1)
            writeQueue.push(name);
    });
}

function checkQueue () {
    var name, json;
    
    if (writeQueue.length && db.conn) {
        name = writeQueue.shift();
        json = {
            id: name,
            config: gvalues[name]
        };

        // clean json, I don't know what I am doing!?
        json = JSON.parse(JSON.stringify(json));
        db.run(db.q().insert(
            json,
            { conflict: 'replace' }
        ), function (err) {
            setTimeout(checkQueue, 500);
            if (db.check(err)) return;

            console.log('wrote config', JSON.stringify(json));
        });

    } else {
        setTimeout(checkQueue, 5000);
    }
}

// gvalues
db.ready(function () {
    // query for config values
    db.run(db.q(), function (err, cursor) {
        if (db.check(err)) return;

        cursor.each(function (err, node) {
            if (db.check(err)) return;

            // validate data
            if (!node.config) return;

            // overwrite port always
            node.config.port = getPort(node.id);

            // read in config for node
            gvalues[node.id] = node.config;

            // post changes
            postConfig(node.id, true);
            console.log('read config', node.id);

        }, function () {
            console.log('finished reading config');
            checkQueue();
        });
    });  
});

db.connect(conn.hostname, conn.port);
