
// XMPP API --- xmpp.oscar.aol.com 

var ltx = require('ltx'),
    Client = require('node-xmpp-client'),
    toolkit = require('./toolkit/lib');

// create server 
var server = toolkit.createServer('api-xmpp'),
    gclients = {},
    gconnect = {};

// create channel
var channel = server.createChannel('xmpp');

// helper functions for xmpp clients
function gclientkey (host, jid) {
    return [host, jid].join('-');
}

function gclient (host, jid) {
    return gclients[gclientkey(host, jid)];
}

function gclientclose (key) {
    if (!gclients[key]) return;

    gclients[key].end();
    channel.emit('disconnect', {
        client: key
    });

    delete gclients[key];
}

function gclientopen (options) {
    var key = gclientkey(options.host, options.jid);
    gclientclose(key);

    var _options = JSON.parse(JSON.stringify(options));

    _options.credentials = true;
    var client = gclients[key] = new Client(_options);
    
// chatError (origin, server, text)
// chatMessage (origin, server, _channel, user, text)
// chatInfo (origin, server, _channel, info) - extra meta data about a channel
// chatRoster (origin, server, _channel, users) - users in a particular channel
// chatState (origin, server, _channel, user, state, [info]) - user left / join / kicked etc..
// chatUsername (origin, server, oldUser, newUser) - user changed name
// chatListen (origin, server, _channels) - which channels are you in
// chatLeave (origin, server, _channels) - you have left these channels
// chatList (origin, server, _channels) - potential channels to join
    
    client.on('stanza', function(stanza) {
        console.log('stanza', stanza.toString());
    });

    client.on('online', function() {
        console.log('online');

        // signal ready
        client.send(new ltx.Element('presence'));

        // request roster
        var roster;
        if (options.host.indexOf('google') !== -1) {

            roster = new ltx.Element('iq', {
                'type': 'get',
                'id': 'google-roster-1'
            }).c('query', {
                'xmlns': 'jabber:iq:roster',
                'xmlns:gr': 'google:roster',
                'gr:ext': 2,
            }).up();

        } else {
            roster = new ltx.Element('iq', {
                type: 'get'
            }).c('query', 'jabber:iq:roster').up();
        }

        client.send(roster);
        // reply.c('body').t(isNaN(i) ? 'i can count!' : ('' + (i + 1)))
        // setTimeout(function () {
        //     client.send(reply)
    });

    client.on('offline', function() {
        console.log('offline');
    });

    client.on('connect', function() {
        console.log('connect');
    });

    client.on('reconnect', function() {
        console.log('reconnect');
    });

    client.on('disconnect', function() {
        console.log('disconnect');
    });

    client.on('error', function(e) {
        console.log('error', e);
    });

    client.on('exit', function() {
        console.log('exit');
    });
}

// wake ()
// roster (server, _channel)
// say (server, _channel, text)
// info (server, _channel)
// list (server)

// write configuration validators
server.config('', function (type, value) {
    if (value.accounts === undefined) {
        value.accounts = [ ];
    }
});

server.config('/accounts', function (type, value) {
    // no-op    
}, function (value) {
    if (!value || !value.length) return;

    // list of clients we care about
    var clients = value.map(function (o) { return gclientkey(o.host, o.jid); });
    
    // list of current clients
    var cclients = Object.keys(gclients);

    // disconnect clients we no longer care about
    cclients.forEach(function (key) {
        if (clients.indexOf(key) == -1) {
            gclientclose(key);
        }
    });
});

server.config('/accounts/[0-9]+', function (type, value) {
    if (type !== 'object') {
        return {
            host: '',
            jid: '',
            password: ''
        };
    }

}, function (value, before) {
    if (!value.host || !value.jid) return;

    // may need to throttle this?
    var key = gclientkey(value.host, value.jid);
    clearTimeout(gconnect[key]);
    gconnect[key] = setTimeout(function () {
        gclientopen(value);
    }, 1000);
});

// handle server start
server.created(function (http, port) {
    console.log('server started on', port);
});

// start server
server.start();
