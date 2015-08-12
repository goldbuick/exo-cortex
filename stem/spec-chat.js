
// CHAT SPEC

var toolkit = require('./toolkit/lib');

function inject (collection, server, room, data) {
    if (collection[server] === undefined) {
        collection[server] = { };
    }
    if (collection[server][room] === undefined) {
        collection[server][room] = [ ];
    }
    collection[server][room].push(data);
}

function ChatSpec (name) {
    this.server = toolkit.createServer('api-' + name);
    this.channel = server.createChannel(name);
    this.channel.message('wake', this.onWake.bind(this));
    this.channel.message('say', this.onSay.bind(this));
}

ChatSpec.prototype = {
    constructor: ChatSpec,

    emitError: function (connection, error) {
        this.channel.emit('error', {
            connection: connection,
            error: error
        });
    },

    user: function (collection, server, room, user, info) {
        inject(collection, server, room, {
            user: user,
            info: info
        });
    },

    room: function (collection, server, room, info) {
        inject(collection, server, room, {
            info: info
        });
    },

    emitInfo: function (collection) {
        this.channel.emit('info', {
            list: collection
        });
    },

    message: function (collection, server, room, user, text) {
        inject(collection, server, room, {
            type: 'message',
            user: user,
            text: text
        });
    },

    join: function (collection, server, room, user) {
        inject(collection, server, room, {
            type: 'join',
            user: user
        });
    },

    leave: function (collection, server, room, user, text) {
        inject(collection, server, room, {
            type: 'leave',
            user: user,
            text: text || ''
        });
    },

    emitEvent: function (collection) {
        this.channel.emit('event', {
            keeplog: true,
            list: collection
        });
    },

    wake: function (handler) {
        this._wake = handler;
    },

    say: function (handler) {
        this._say = handler;
    },

    onWake: function (message, finish) {
        if (this._wake) return this._wake.call(this, message, finish);
        return finish();
    },

    onSay: function (message, finish) {
        if (this._say) return this._say.call(this, message, finish);
        return finish();
    }

};

module.exports = {
    createServer: function (name) {
        return new ChatSpec(name);
    }
};


