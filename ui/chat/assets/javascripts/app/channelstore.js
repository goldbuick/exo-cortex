define(function(require, exports, module) {
    'use strict';

    var ChannelActions = require('app/channelactions'),
        ServerActions = require('app/serveractions');

    module.exports = Reflux.createStore({

        listenables: [ ChannelActions, ServerActions ],

        getInitialState: function () {
            this.servers = { };
            return this.servers;
        },

        onServerDisconnect: function (server) {
            if (this.servers[server] === undefined) return;
            delete this.servers[server];
            this.trigger(this.servers);
        },

        onJoinChannel: function (server, channel) {
            if (this.servers[server] === undefined) {
                this.servers[server] = { }
            }

            if (this.servers[server][channel] !== undefined) return;
            this.servers[server][channel] = true;
            this.trigger(this.servers);
        },

        onLeaveChannel: function (server, channel) {
            if (this.servers[server] === undefined || this.servers[server][channel] === undefined) return;
            delete this.servers[server][channel];
            this.trigger(this.servers);
        },

    });
});
