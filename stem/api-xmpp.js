
// XMPP API --- xmpp.oscar.aol.com 

var ltx = require('ltx'),
    Client = require('node-xmpp-client'),
    toolkit = require('./toolkit/lib');

// create server 
var server = toolkit.createServer('api-xmpp'),
    gusers = {},
    gclients = {},
    gconnect = {},
    glisten = [ ],
    glistenTimer;

// create channel
var channel = server.createChannel('xmpp');

// helper functions for xmpp clients
function gjid (full) {
    return full.split('/')[0];
}

function gclient (host) {
    return gclients[host];
}

function gclientEach (fn) {
    Object.keys(gclients).forEach(function (host) {
        fn(host, gclients[host]);
    });
}

function gclientclose (host) {
    if (!gclients[host]) return;

    gclients[host].end();
    channel.emit('disconnect', {
        client: host
    });

    delete gclients[host];
}

function gclientroster (host) {
    var client = gclient(host);
    if (!client) return;

    // request roster
    var roster;
    if (host.indexOf('google') !== -1) {
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
}

function gclientopen (options) {
    var host = options.host,
        nick = gjid(options.jid);
    gclientclose(host);

    var _options = JSON.parse(JSON.stringify(options));
    _options.credentials = true;
    var client = gclients[host] = new Client(_options);

    // chatError (origin, server, text)
    client.on('error', function(e) {
        console.log('error', e);
        channel.emit('error', {
            server: host,
            text: JSON.stringify(e)
        });
    });
    
    client.on('stanza', function(stanza) {
        if (stanza.is('message')) {
            // chatMessage (origin, server, _channel, user, text)
            console.log('message', stanza.toString());

        } else if (stanza.is('presence')) {
            var user = gjid(stanza.attrs.from);
            if (stanza.getChildText('show')) {
                switch (stanza.attrs.type) {
                    default:
                        glisten.push({ user: user, listen: true });
                        break;
                    case 'unavailable':
                        glisten.push({ user: user, leave: true });
                        break;
                }

                clearTimeout(glistenTimer);
                glistenTimer = setTimeout(function () {
                    var listen = [ ],
                        leave = [ ];

                    glisten.forEach(function (item) {
                        if (item.listen) listen.push(item.user);
                        if (item.leave) leave.push(item.user);                        
                    });
                    glisten = [ ];

                    // chatListen (origin, server, _channels)
                    channel.emit('listen', {
                        server: host,
                        channels: listen
                    });
                    // chatLeave (origin, server, _channels)                
                    channel.emit('leave', {
                        server: host,
                        channels: leave
                    });

                }, 1000);
            }
            if (stanza.getChildText('status')) {
                channel.emit('info', {
                    server: host,
                    channel: user,
                    info: { status: stanza.getChildText('status') }
                });
            }

        } else if (stanza.is('iq')) {
            // create lookup table for jid -> nice name
            stanza.getChild('query').getChildren('item').forEach(function (user) {
                gusers[user.attrs.jid] = user.attrs.name || user.attrs.jid;
            });
            var _channels = Object.keys(gusers);

            // chatInfo (origin, server, _channel, info) - extra meta data about a channel
            _channels.forEach(function (user) {
                channel.emit('info', {
                    server: host,
                    channel: user,
                    info: { name: gusers[user] }
                });
            });

            // chatRoster (origin, server, _channel, users) - users in a particular channel
            var _rosters = { };
            _channels.forEach(function (_channel) {
                _rosters[_channel] = [ _channel, nick ];
            });
            channel.emit('rosters', {
                server: host,
                channels: _rosters
            });
        }
    });

    client.on('online', function() {
        // signal ready
        client.send(new ltx.Element('presence'));
        // ask for roster
        gclientroster(host);
        // keep alive
        client.connection.socket.setTimeout(0);
        client.connection.socket.setKeepAlive(true, 10000);
    });
}

channel.message('wake', function (message, finish) {
    // discovery
    if (!message) {
        return finish({});
    }

    // chatListen (origin, server, _channels)
    // gclientEach(function (host, client) {
    //     channel.emit('listen', {
    //         server: host,
    //         channels: Object.keys(client.chans)
    //     });
    // });

    return finish();
});

channel.message('roster', function (message, finish) {
    // discovery
    if (!message) {
        return finish({
            server: 'which server',
            channel: 'channel to get roster of'
        });
    }

    // get client
    var client = gclient(message.server);
    if (!client) return finish();

    // // get channel
    // var _channel = client.chans[message.channel];
    // if (!_channel) return finish();

    // channel.emit('roster', {
    //     server: message.server,
    //     channel: message.channel,
    //     users: Object.keys(_channel.users)
    // });

    return finish();  
});

channel.message('say', function (message, finish) {
    // discovery
    if (!message) {
        return finish({
            server: 'which server',
            channel: 'channel to message',
            text: 'the message to send to the channel'
        });
    }

    // get client
    var client = gclient(message.server);
    if (!client) return finish();

    // client.say(message.channel, message.text);
    finish();
});

channel.message('info', function (message, finish) {
    // discovery
    if (!message) {
        return finish({
            server: 'which server',
            channel: 'channel to get info on'
        });
    }

    // get client
    var client = gclient(message.server);
    if (!client) return finish();

    // // get channel
    // var _channel = client.chans[message.channel];
    // if (!_channel) return finish();

    // channel.emit('info', {
    //     server: message.server,
    //     channel: message.channel,
    //     info: {
    //         topic: _channel.topic,
    //         topicBy: _channel.topicBy
    //     }
    // });

    return finish();
});

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
    var clients = value.map(function (o) { return o.host; });
    
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
    var key = value.host;
    clearTimeout(gconnect[key]);
    gconnect[key] = setTimeout(function () {
        gclientopen(value);
    }, 1000);
});

server.config('/accounts/[0-9]+/jid', function (type, value) {
    if (type === 'value') return [
        value.split('/')[0], 'exo'
    ].join('/');
});

// handle server start
server.created(function (http, port) {
    console.log('server started on', port);
});

// start server
server.start();
