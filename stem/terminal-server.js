
// TERMINAL SERVER

var toolkit = require('./toolkit/lib');

// create server 
var io,
    groutes = { },
    server = toolkit.createServer('terminal-server');

// create channel 
var channel = server.createChannel('terminal-server');

channel.message('request', function (message, finish) {
    // discovery
    if (!message) {
        return finish({
            route: 'which api to call',
            json: 'data to send to api call'
        });
    }

    // validate data
    if (!message.route || !message.json) return finish();

    // validate route
    var external = groutes[message.route];
    if (!external) return finish();

    // post json to route
    var path = (external.path || '/') + message.route;
    server.post(external.host, external.port, path, message.json, function(json) {
        var _message = server.createMessage('success', message.route, json);
        finish(_message);

    }, function (json) {
        var _message = server.createMessage('fail', message.route, json);
        finish(_message);

    });
});

// listen for any message type
server.any(function (url, json) {
    if (url !== '/upstream' || !json || !io) return;
    io.emit(json.channel, json);
});

// listen for routing info changes
server.config('/api', function (type, value) {
    // no-op
}, function (value) {
    groutes = value;
    if (io) io.emit('api', Object.keys(groutes));

    // TODO, will eventually dump this to config-server logging
    console.log('api updated', Object.keys(groutes));
});

// called when the server is started
server.created(function (http, port) {
    console.log('server started on', port);

    // start up websocket interface
    io = require('socket.io')(http);

    // listen for new clients
    io.on('connection', function(socket) {

        // tell client list of api routes
        socket.emit('api', Object.keys(groutes));

        // listen for api calls from clients
        socket.on('request', function (data) {
            // validate data
            if (!data.route || !data.json) return;

            // validate route
            var external = groutes[data.route];
            if (!external) return;

            // post json to route
            var path = (external.path || '/') + data.route;
            server.post(external.host, external.port, path, data.json, function(json) {
                var message = server.createMessage('success', data.route, json);
                socket.emit('response', message);

            }, function (json) {
                var message = server.createMessage('fail', data.route, json);
                socket.emit('response', message);

            });
        });
    });
});

// start server
server.start();
