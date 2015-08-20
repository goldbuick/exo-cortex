
// XMPP API --- xmpp.oscar.aol.com 

var ltx = require('ltx'),
    Client = require('node-xmpp-client'),
    spec = require('./spec-chat');

// user tracking class
function Users (self, coms) {
    this.self = self;
    this.coms = coms;
    this.names = { };
    this.resources = { };
}

Users.prototype = {
    constructor: Users,

    user: function (id) {
        return {
            name: this.names[id] || '',
            resource: this.resources[id] || ''
        };
    },

    name: function (id, name) {
        this.names[id] = name;
    },

    resource: function (id, resource) {
        function pick (str) {
            return str.indexOf('/Messaging') !== -1 || str.indexOf('/messaging') !== -1;
        }
        var old = this.resources[id] || '',
            oldvalid = pick(old),
            newvalid = pick(resource);

        // ignore if existing is valid, and new is not
        if (oldvalid && !newvalid) {
            return;
        }

        this.resources[id] = resource;
    }
};

// create server
var chat = spec.createServer('xmpp');

// globals
var gclients = { },
    gconnect = { };

// xmpp helpers
function gclientid (full) {
    return full.split('/')[0];
}

function gclientroster (host) {
    var client = gclients[host];
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

    client.coms.send(roster);
}

function gclientclose (host) {
    if (!gclients[host]) return;

    gclients[host].coms.end();
    delete gclients[host];        
}

function gclientopen (options) {
    options = JSON.parse(JSON.stringify(options));
    if (gclients[options.host]) return;

    // proper gtalk support
    options.credentials = true;
    console.log('gclientopen', options);

    var client = new Users(gclientid(options.jid), new Client(options));
    gclients[options.host] = client;

    // EVENTS

    client.coms.on('online', function () {
        // signal ready
        client.coms.send(new ltx.Element('presence'));
        // ask for roster
        gclientroster(options.host);
        // keep alive
        client.coms.connection.socket.setTimeout(0);
        client.coms.connection.socket.setKeepAlive(true, 10000);
    });

    client.coms.on('error', function(e) {
        chat.error(options.host, JSON.stringify(e));
    });

    client.coms.on('stanza', function(stanza) {
        if (stanza.is('message')) {
            if (stanza.getChildText('body')) {
                var user = gclientid(stanza.attrs.from);
                chat.message(options.host, user, user, stanza.getChildText('body'));
            }

        } else if (stanza.is('presence')) {
            var user = gclientid(stanza.attrs.from);
            client.resource(user, stanza.attrs.from);

        } else if (stanza.is('iq')) {
            stanza.getChild('query').getChildren('item').forEach(function (user) {
                client.name(user.attrs.jid, user.attrs.name || user.attrs.jid);
            });
        }
    });
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

    if (message.users !== undefined && message.users.forEach) {
        message.users.forEach(function (user) {
            var info = client.user(user);
            chat.user(message.server, user, {
                name: info.name
            });
        });
    }

    if (message.rooms !== undefined && message.rooms.forEach) {
        message.rooms.forEach(function (room) {
            var info = client.user(room);
            chat.room(message.server, room, {
                name: info.name
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

    // send reply
    var info = client.user(message.room);
    if (info) {
        var reply = new ltx.Element('message', {
            to: info.resource,
            type: 'chat'
        });
        reply.c('body').t(message.text);
        client.coms.send(reply);

        // self message
        chat.message(message.server, message.room, client.self, message.text);
    }
    return finish();
});

// CONFIG

chat.server.config('', function (type, value) {
    if (value.accounts === undefined) {
        value.accounts = [ ];
    }
});

chat.server.config('/accounts', function (type, value) {
    // no-op    
}, function (value) {
    if (!value || !value.length) return;

    // list of clients we care about
    var clients = value.map(function (o) { return o.host; });
    
    // list of current clients
    var cclients = Object.keys(gclients);

    // disconnect clients we no longer care about
    cclients.forEach(function (host) {
        if (clients.indexOf(host) == -1) {
            gclientclose(host);
        }
    });
});

chat.server.config('/accounts/[0-9]+', function (type, value) {
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

chat.server.config('/accounts/[0-9]+/jid', function (type, value) {
    // return 'whitlark@gmail.com/exo';
    if (type === 'value') {
        var parts = value.split('/');
        if (parts[1] !== 'exo') {
            return parts[0] + '/exo';
        }
    } else {
        return 'username@domain.com/exo';
    }
});

// START

chat.server.created(function (http, port) {
    console.log('server started on', port);
});

chat.server.start();
