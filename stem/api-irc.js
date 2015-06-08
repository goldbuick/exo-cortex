
// IRC API

var irc = require('irc'),
    toolkit = require('./toolkit/lib');

// create server 
var server = toolkit.createServer('api-irc'),
    gnick = 'exo__',
    gclients = {};

// create channel
var channel = server.channel('irc');

// irc client helpers functions
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

    gclients[host].disconnect('leaving', function() {
        channel.emit('disconnect', {
            server: host
        });        
    });
    delete host[current];
}

function makeClient (url, nick, options) {
    var client = new irc.Client(url, nick, options);

    client.addListener('error', function (text) {
        channel.emit('error', {
            message: text
        });
    });

    client.addListener('registered', function () {
        channel.emit('connect', {
            server: url
        });
    });

    client.addListener('message', function (from, to, text) {
        if (to[0] === '#') {
            channel.emit('public', {
                server: url,
                user: from,
                channel: to,
                text: text
            });
        } else {
            channel.emit('private', {
                server: url,
                user: from,
                text: text
            });
        }       
    });

    client.addListener('names', function (_channel, nicks) {
        channel.emit('names', {
            server: url,
            channel: _channel,
            nicks: nicks
        });
    });

    client.addListener('nick', function (oldnick, newnick) {
        channel.emit('nick', {
            server: url,
            oldnick: oldnick,
            newnick: newnick
        });
    });

    client.addListener('topic', function (_channel, topic, nick) {
        channel.emit('topic', {
            server: url,
            channel: _channel,
            topic: topic,
            nick: nick
        });
    });

    client.addListener('join', function (_channel, nick) {
        channel.emit('join', {
            server: url,
            channel: _channel,
            nick: nick
        });
    });

    client.addListener('part', function (_channel, nick, reason) {
        channel.emit('part', {
            server: url,
            channel: _channel,
            nick: nick,
            reason: reason
        });
    });

    client.addListener('quit', function (nick, reason, channels) {
        channel.emit('quit', {
            server: url,
            nick: nick,
            reason: reason,
            channels: channels
        });
    });

    // kick - channel, nick, by, reason
    // kill - nick, reason, channels
    // notice - nick, to, text

    return client;
}

channel.message('say', function (message) {
    // discovery
    if (!message) {
        return {
            server: 'which server',
            target: 'user or channel to message',
            text: 'the message to send to the target'
        };
    }

    // get client
    var client = gclient(message.server);
    if (!client) return;

    client.say(message.target, message.text);
});

// write configuration validators
server.config('', function (type, value) {
    if (value.nick === undefined) {
        value.nick = gnick;
    } else {
        gnick = value.nick;
    }
    if (value.servers === undefined) value.servers = [ ];
});

server.config('/nick', function (type, value) {
    if (type !== 'value' || value.length === 0)
        return gnick;

}, function (value) {
    nick = value;
    gclientEach(function (host, client) {
        client.send('NICK', nick);
    });
});

server.config('/servers', function (type, value) {
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

server.config('/servers/[0-9]+', function (type, value) {
    if (type !== 'object') {
        return {
            host: '',
            port: '',
            channels: ''
        };
    }

}, function (value, before) {
    if (!value.host) return;

    // get client
    var client = gclient(value.host);

    if (client === undefined) {
        console.log('starting ', value.host, value.port);

        if (value.channels.length) {
            gclients[value.host] = makeClient(value.host, gnick, {
                port: value.port,
                channels: value.channels
            });
        }

    } else if (value.port !== before.port) {
        console.log('changing port ', value.host, value.port);
        
        gclientclose(value.host);
        if (value.channels.length) {
            gclients[value.host] = makeClient(value.host, gnick, {
                port: value.port,
                channels: value.channels
            });
        }

    } else if (value.channels && value.channels.length) {
        console.log('updating channels ', value.channels, before.channels);

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
});

server.config('/servers/[0-9]+/host', function (type, value) {
    if (type !== 'value')
        return '';

    // get client
    var name = 'irc.freenode.net',
        client = gclient(name);

    if (!client && value.length === 0)
        return 'irc.freenode.net';
});

server.config('/servers/[0-9]+/port', function (type, value) {
    if (type !== 'value' || value.length === 0)
        return 6667;
});

server.config('/servers/[0-9]+/channels', function (type, value) {
    if (type !== 'array') return [ ];
});

server.config('/servers/[0-9]+/channels/[0-9]+', function (type, value) {
    console.log('validate channel name', type, value);
    if (type === 'value' && value[0] !== '#')
        return '#' + value;
});

// handle server start
server.created(function (http, port) {
    console.log('server started on', port);
});

// start server
server.start();
