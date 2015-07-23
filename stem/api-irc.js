
// IRC API

var irc = require('irc'),
    toolkit = require('./toolkit/lib');

// create server 
var server = toolkit.createServer('api-irc'),
    gnick = 'exo__',
    gclients = {};

// create channel
var channel = server.createChannel('irc');

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
        // channel.emit('disconnect', {
        //     server: host
        // });        
    });
    
    delete gclients[host];
}

function makeChannels (_channel, data) {
    var _channels = { };
    _channels[_channel] = data;
    return _channels;
}

function makeClient (host, nick, options) {
    var client = new irc.Client(host, nick, options);

    // chatError (origin, server, text)
    client.addListener('error', function (text) {
        channel.emit('error', {
            server: host,
            text: text
        });
    });

    // chatMessage (origin, server, _channel, user, text)
    function handleMessage (nick, _channel, text) {
        channel.emit('message', {
            server: host,
            channel: _channel,
            user: nick,
            text: text
        });
    }    

    client.addListener('selfMessage', function (to, text) {
        if (to[0] === '#') handleMessage(gnick, to, text);
    });

    client.addListener('message', handleMessage);

    // chatInfo (origin, server, _channels)
    client.addListener('topic', function (_channel, topic, nick) {
        channel.emit('info', {
            server: host,
            channels: makeChannels(_channel, {
                topic: topic,
                topicBy: nick
            })
        });
    });

    // chatState (origin, server, _channel, user, state)
    client.addListener('join', function (_channel, nick) {
        channel.emit('state', {
            server: host,
            channels: makeChannels(_channel, [{
                user: nick,
                state: 'join'
            }])
        });
    });
    client.addListener('part', function (_channel, nick, reason) {
        channel.emit('state', {
            server: host,
            channels: makeChannels(_channel, [{
                user: nick,
                state: 'part',
                info: reason
            }])
        });
    });
    client.addListener('kick', function (_channel, nick, by, reason) {
        channel.emit('state', {
            server: host,
            channels: makeChannels(_channel, [{
                user: nick,
                state: 'part',
                info: by + ' - ' + reason
            }])
        });
    });
    client.addListener('quit', function (nick, reason, channels) {
        var _channels = { };
        channels.forEach(function (_channel) {
            _channels[_channel] = [{
                user: nick,
                state: 'part',
                info: reason
            }];
        });
        channel.emit('state', {
            server: host,
            channels: _channels
        });
    });
    client.addListener('kill', function (nick, reason, channels) {
        var _channels = { };
        channels.forEach(function (_channel) {
            _channels[_channel] = [{
                user: nick,
                state: 'part',
                info: reason
            }];
        });
        channel.emit('state', {
            server: host,
            channels: _channels
        });
    });
    client.addListener('nick', function (oldnick, newnick, channels) {
        var _channels = { };
        channels.forEach(function (_channel) {
            _channels[_channel] = [{
                user: oldnick,
                state: 'name',
                info: newnick
            }];
        });
        channel.emit('state', {
            server: host,
            channels: _channels
        });
    });

    // chatRosters (origin, server, _channels)
    client.addListener('names', function (_channel, nicks) {
        channel.emit('rosters', {
            server: host,
            channels: makeChannels(_channel, Object.keys(nicks))
        });
    });

    return client;
}

channel.message('wake', function (message, finish) {
    // discovery
    if (!message) {
        return finish({});
    }

    // chatListen (origin, server, _channels)
    gclientEach(function (host, client) {
        channel.emit('listen', {
            server: host,
            channels: Object.keys(client.chans)
        });
    });

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

    // get channel
    var _channel = client.chans[message.channel];
    if (!_channel) return finish();

    channel.emit('rosters', {
        server: host,
        channels: makeChannels(message.channel, Object.keys(_channel.users))
    });

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

    client.say(message.channel, message.text);
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

    // get channel
    var _channel = client.chans[message.channel];
    if (!_channel) return finish();

    channel.emit('info', {
        server: message.server,
        channels: makeChannels(message.channel, {
            topic: _channel.topic,
            topicBy: _channel.topicBy
        })
    });

    return finish();
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
    gnick = value;
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
                realName: gnick,
                port: value.port,
                encoding: 'UTF-8',
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
        var leaving = [ ];
        if (before && before.channels && before.channels.length) {
            before.channels.forEach(function (chan) {
                if (value.channels.indexOf(chan) === -1) {
                    client.part(chan);
                    leaving.push(chan);
                }
            });
        }
        if (leaving.length) {
            // chatLeave (origin, server, _channels)
            channel.emit('leave', {
                server: value.host,
                channels: leaving
            });
        }

        // process joining channels
        var joining = [ ];
        value.channels.forEach(function (chan) {
            if (!before || !before.channels || before.channels.indexOf(chan) === -1) {
                client.join(chan);
                joining.push(chan);
            }
        });
        if (joining.length) {
            // chatListen (origin, server, _channels)
            channel.emit('listen', {
                server: value.host,
                channels: joining
            });
        }

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
