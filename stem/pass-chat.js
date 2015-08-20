
// CHAT ADAPTER

var toolkit = require('./toolkit/lib');

// create server 
var server = toolkit.createServer('pass-chat');

// create channel
var channel = server.createChannel('chat');

// globals
var gapis = [ ];

channel.message('history', function (message, finish) {
    // discovery
    if (!message) {
        return finish({
            startDate: 'when to start the list',
            endDate: 'when to end the list'
        });
    }

    // need to figure out how best to translate ?
    server.request({
        route: 'log/list',
        json: {
            startDate: message.startDate,
            endDate: message.endDate
        }
    }, function (response) {
        finish(response.meta.map(function (json) {
            json.meta.origin = json.channel;
            json.channel = 'chat';
            return json;
        }));
        finish();

    }, function (response) {
        console.log(response);
        finish();

    });
});

function genRoute (origin, type) {
    return (origin || 'invalid') + '/' + type;
}

channel.message('info', function (message, finish) {
    // discovery
    if (!message) {
        return finish({
            origin: 'which api',
            server: 'which server',
            rooms: 'list of which rooms (optional)',
            users: 'list of which users (optional)'
        });
    }

    server.request({
        route: genRoute(message.origin, 'info'),
        json: message
    }, finish, function (response) {
        console.log(response);
        finish();
    });
});

channel.message('say', function (message, finish) {
    // discovery
    if (!message) {
        return finish({
            origin: 'which api',
            server: 'which server',
            room: 'room to message',
            text: 'the message to send to the room'
        });
    }

    server.request({
        route: genRoute(message.origin, 'say'),
        json: message
    }, finish, function (response) {
        console.log(response);
        finish();
    });
});

// catch all event handler
server.any(function (url, json) {
    if (url !== '/upstream' || !json) return;

    // only consume certain apis
    if (gapis.indexOf(json.channel) === -1) return;

    // patch on origin
    json.meta.origin = json.channel;

    // transmit event
    channel.emit(json.type, json.meta);
});

// write configuration validators
server.config('', function (type, value) {
    if (value.apis === undefined) {
        value.apis = gapis;
    } else {
        gapis = value.apis;
    }
});

server.config('/apis', function (type, value) {
    // no-op
}, function (value) {
    gapis = value;
    console.log('now adapting apis:', gapis);
});

// handle server start
server.created(function (http, port) {
    console.log('server started on', port);
});

// start server
server.start();
