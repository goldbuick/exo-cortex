
// IRC API

var irc = require('irc'),
    spec = require('./spec-chat');

// create server
var chat = spec.createServer('irc');

// globals
var gclients = { };

// irc helpers
function gclientclose (host) {
    if (!gclients[host]) return;

    gclients[host].disconnect('exo-cortex recycle', function() {
        delete gclients[host];        
    });
}

function gclientopen (host, port, nick, channels) {
    if (gclients[host]) return;

    var client = new irc.Client(host, nick, {
        port: port,
        userName: nick,
        realName: nick,
        encoding: 'UTF-8',
        channels: channels
    });
    gclients[host] = client;

    // EVENTS

    client.addListener('error', function (text) {
        chat.error(host, text);
    });

    function handleMessage (nick, _channel, text) {
        chat.message(host, _channel, nick, text);
    }    

    client.addListener('selfMessage', function (to, text) {
        if (to[0] === '#') handleMessage(nick, to, text);
    });

    client.addListener('message', handleMessage);    
}

// MESSAGES

chat.info(function (message, finish) {
    // discovery
    if (!message) {
        return finish({
            server: 'which server',
            rooms: 'list of which rooms (optional)',
            users: 'list of which users (optional)'
        });
    }

    // get client
    var client = gclients[message.server];
    if (!client) return finish();

    if (message.rooms !== undefined && message.rooms.forEach) {
        message.rooms.forEach(function (room) {
            var _channel = client.chans[room],
                _info = {
                    name: room
                };
            
            if (_channel) {
                _info.topic = _channel.topic;
                _info.topicBy = _channel.topicBy.split('!')[0];
            }
            
            chat.room(message.server, room, _info);
        });
    }

    if (message.users !== undefined && message.users.forEach) {
        message.users.forEach(function (user) {
            chat.user(message.server, user, {
                name: user
            });
        });
    }

    return finish();
});

chat.say(function (message, finish) {
    // discovery
    if (!message) {
        return finish({
            server: 'which server',
            room: 'room to message',
            text: 'the message to send to the room'
        });
    }

    // get client
    var client = gclients[message.server];
    if (!client) return finish();

    client.say(message.room, message.text);
    return finish();
});

// CONFIG

chat.server.config('', function (type, value) {
    if (value.servers === undefined) value.servers = [ ];
});

chat.server.config('/servers', function (type, value) {
    // no-op    
}, function (value) {
    if (!value || !value.length) return;

    // list of hosts we care about
    var hosts = value.map(function (o) { return o.host; });

    // list of current hosts
    var chosts = Object.keys(gclients);

    // disconnect hosts we no longer care about
    chosts.forEach(function (current) {
        if (hosts.indexOf(current) == -1) {
            gclientclose(current);
        }
    });
});

chat.server.config('/servers/[0-9]+', function (type, value) {
    if (type !== 'object') {
        return {
            nick: '',
            host: '',
            port: '',
            channels: ''
        };
    }

}, function (value, before) {
    if (!value || !value.host) return;

    // get client
    var client = gclients[value.host];

    if (client === undefined) {
        console.log('starting', value.nick, value.host, value.port);

        if (value.channels.length) {
            gclientopen(value.host, value.port, value.nick, value.channels);
        }

    } else if (value.port !== before.port) {
        console.log('changing port', value.host, value.port);
        
        gclientclose(value.host);
        if (value.channels.length) {
            gclientopen(value.host, value.port, value.nick, value.channels);
        }

    } else {
        if (value.nick !== before.nick) {
            console.log('changing nick', value.host, value.port);            
            client.send('NICK', value.nick);
        }

        if (value.channels && value.channels.length) {
            console.log('updating channels', value.channels, before.channels);

            // process leaving channels
            if (before && before.channels && before.channels.length) {
                before.channels.forEach(function (chan) {
                    if (value.channels.indexOf(chan) === -1) {
                        client.part(chan);
                    }
                });
            }

            // process joining channels
            value.channels.forEach(function (chan) {
                if (!before || !before.channels || before.channels.indexOf(chan) === -1) {
                    client.join(chan);
                }
            });
        }
    }
});

chat.server.config('/servers/[0-9]+/nick', function (type, value) {
    if (type !== 'value' || value.length === 0)
        return 'exo__';
});

chat.server.config('/servers/[0-9]+/host', function (type, value) {
    if (type !== 'value')
        return '';

    // get client
    var name = 'irc.freenode.net',
        client = gclients[name];

    if (!client && value.length === 0)
        return 'irc.freenode.net';
});

chat.server.config('/servers/[0-9]+/port', function (type, value) {
    if (type !== 'value' || value.length === 0)
        return 6667;
});

chat.server.config('/servers/[0-9]+/channels', function (type, value) {
    if (type !== 'array') return [ ];
});

chat.server.config('/servers/[0-9]+/channels/[0-9]+', function (type, value) {
    console.log('validate channel name', type, value);
    if (type === 'value' && value[0] !== '#')
        return '#' + value;
});

// START

chat.server.created(function (http, port) {
    console.log('server started on', port);
});

chat.server.start();
