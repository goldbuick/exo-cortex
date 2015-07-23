
// CHAT ADAPTER

var toolkit = require('./toolkit/lib');

// create server 
var server = toolkit.createServer('pass-chat');

// create channel
var channel = server.createChannel('chat');

// chat spec

// chatError (origin, server, text)
// chatMessage (origin, server, _channel, user, text)
// chatInfo (origin, server, _channels) - key => info - extra meta data about a channel
// chatState (origin, server, _channels) - key => [user, state, [info]] - user left / join / kicked etc..
// chatRosters (origin, server, _channels) - which users are in these channels
// chatListen (origin, server, _channels) - which channels are you in
// chatLeave (origin, server, _channels) - you have left these channels

// history (startDate, endDate)
// wake ()
// roster (server, _channel)
// say (server, _channel, text)
// info (server, _channel)

// generic chat api 

var gapis = [ ];

channel.message('wake', function (message, finish) {
    // discovery
    if (!message) {
        return finish({});
    }

    // signal that a ui client has connected
    gapis.forEach(function (api) {
        server.request({ route: api + '/wake', json: { }});
    });
    return finish();
});

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

channel.message('roster', function (message, finish) {
    // discovery
    if (!message) {
        return finish({
            origin: 'which api',
            server: 'which server',
            channel: 'channel to get roster of'
        });
    }

    server.request({
        route: genRoute(message.origin, 'roster'),
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
            channel: 'channel to message',
            text: 'the message to send to the channel'
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

channel.message('info', function (message, finish) {
    // discovery
    if (!message) {
        return finish({
            origin: 'which api',
            server: 'which server',
            channel: 'channel to get info on'
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
