define(function(require, exports, module) {
    'use strict';

    var ChannelActions = require('app/channel-actions'),
        ServerActions = require('app/server-actions');

    module.exports = Reflux.createStore({

        listenables: [ ChannelActions, ServerActions ],

        getInitialState: function () {
            if (!this.servers) this.servers = { };
            return this.servers;
        },

        onServerDisconnect: function (server) {
            if (this.servers[server] === undefined) return;
            delete this.servers[server];
            this.trigger(this.servers);
        },

        onJoinChannel: function (server, channel) {
            if (this.servers[server] === undefined) {
                this.servers[server] = { };
            }

            if (this.servers[server][channel] !== undefined) return;
            this.servers[server][channel] = {
                users: [ ]
            };
            this.trigger(this.servers);
        },

        onLeaveChannel: function (server, channel) {
            if (this.servers[server] === undefined ||
                this.servers[server][channel] === undefined) return;

            delete this.servers[server][channel];
            this.trigger(this.servers);
        },

        onTopic: function (server, channel, user, topic) {
            if (this.servers[server] === undefined ||
                this.servers[server][channel] === undefined) return;

            this.servers[server][channel].topic = {
                user: user,
                text: topic
            };
            this.trigger(this.servers);
        },

        onUsers: function (server, channel, users) {
            if (this.servers[server] === undefined ||
                this.servers[server][channel] === undefined) return;

            this.servers[server][channel].users = users;
            this.trigger(this.servers);
        },

        onUsersJoin: function (server, channel, users) {
            if (this.servers[server] === undefined ||
                this.servers[server][channel] === undefined ||
                this.servers[server][channel].users === undefined) return;

            // add users to channel
            var group = { };
            this.servers[server][channel].users.forEach(function (user) {
                group[user] = true;
            });
            users.forEach(function (user) {
                group[user] = true;
            });
            this.servers[server][channel].users = Object.keys(group);
            this.trigger(this.servers);
        },

        onUsersPart: function (server, channel, users) {
            if (this.servers[server] === undefined ||
                this.servers[server][channel] === undefined ||
                this.servers[server][channel].users === undefined) return;

            // remove users from channel
            var group = { };
            this.servers[server][channel].users.forEach(function (user) {
                group[user] = true;
            });
            users.forEach(function (user) {
                delete group[user];
            });
            this.servers[server][channel].users = Object.keys(group);
            this.trigger(this.servers);
        }

    });

});
