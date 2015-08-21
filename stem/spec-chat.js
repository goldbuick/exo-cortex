
// CHAT SPEC

var toolkit = require('./toolkit/lib'),
    collected = require('./toolkit/collected');

function ChatSpec (name) {
    this.server = toolkit.createServer('api-' + name);
    this.channel = this.server.createChannel(name);

    this.channel.message('info', function (message, finish) {
        if (this._info) return this._info.call(this, message, finish);
        return finish();
    }.bind(this));

    this.channel.message('say', function (message, finish) {
        if (this._say) return this._say.call(this, message, finish);
        return finish();
    }.bind(this));

    function debug (msg, data) {
        console.log(msg, JSON.stringify(data, null, 2));
    }
    
    this.dataError = collected.create();
    this.dataError.on(function (data) {
        debug('error', data);
        this.channel.emit('error', {
            servers: data
        });
    }.bind(this));
    
    this.dataInfo = collected.create();
    this.dataInfo.on(function (data) {
        debug('info', data);
        this.channel.emit('info', {
            servers: data
        });
    }.bind(this));

    this.dataMessage = collected.create();
    this.dataMessage.on(function (data) {
        debug('message', data);
        this.channel.emit('message', {
            keeplog: true,
            servers: data
        });
    }.bind(this));
}

ChatSpec.prototype = {
    constructor: ChatSpec,

    // EVENTS

    error: function (server, text) {
        this.dataError.push(server, {
            text: text
        });
    },

    user: function (server, user, info) {
        this.dataInfo.push(server, {
            user: user,
            info: info
        });
    },

    room: function (server, room, info) {
        this.dataInfo.push(server, {
            room: room,
            info: info
        });
    },

    message: function (server, room, user, text) {
        this.dataMessage.push(server, room, {
            user: user,
            text: text
        });
    },

    // MESSAGES

    info: function (fn) {
        this._info = fn;
    },

    say: function (fn) {
        this._say = fn;
    }

};

module.exports = {
    createServer: function (name) {
        return new ChatSpec(name);
    }
};


