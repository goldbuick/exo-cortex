define(function(require, exports, module) {
    'use strict';

    var ChannelActions = require('app/channel-actions');

    function getUnique() {
        return Array.prototype.slice.call(arguments).join(':');
    }

    function Channel (origin, server, name) {
        this.info = { };
        this.users = { };
        this.origin = origin;
        this.server = server;
        this.name = name;
    }

    Channel.prototype = {
        constructor: Channel,
        unique: function () {
            return getUnique(this.origin, this.server, this.name);
        },
        setInfo: function (key, value) {
            this.info[key] = value;
        },
        getUsers: function () {
            return Object.keys(this.users);
        },
        usersJoin: function (users) {
            var self = this;
            users.forEach(function (user) {
                self.users[user] = true;
            });
        },
        usersLeave: function (users) {
            var self = this;
            users.forEach(function (user) {
                delete self.users[user];
            });
        }
    };

    function ChannelSet () {
        this.list = [ ];
    }

    ChannelSet.prototype = {
        constructor: ChannelSet,
        all: function () {
            return this.list;
        },
        find: function (origin, server, channel) {
            var id = getUnique(origin, server, channel);
            return this.list.filter(function (_channel) {
                return _channel.unique() === id;
            })[0];
        },
        add: function (origin, server, channel) {
            this.list.push(new Channel(origin, server, channel));
            this.list.sort(function (a, b) {
                var id1 = a.unique(),
                    id2 = b.unique();

                if (id1 < id2) {
                    return -1;
                }
                if (id1 > id2) {
                    return 1;
                }
                return 0;
            });
        },
        remove: function (origin, server, channel) {
            var id = getUnique(origin, server, channel);
            this.list = this.list.filter(function (_channel) {
                return _channel.unique() !== id;
            });
        }
    };

    module.exports = Reflux.createStore({

        listenables: [ ChannelActions ],

        getInitialState: function () {
            if (!this.channels) this.channels = new ChannelSet();
            return this.channels; 
        },

        onListen: function (origin, server, channel) {
            var _channel = this.channels.find(origin, server, channel);
            if (_channel) return;
            this.channels.add(origin, server, channel);
            this.trigger(this.channels);
        },

        onLeave: function (origin, server, channel) {
            var _channel = this.channels.find(origin, server, channel);
            if (!_channel) return;
            this.channels.remove(origin, server, channel);
            this.trigger(this.channels);
        },

        onInfo: function (origin, server, channel, key, value) {
            var _channel = this.channels.find(origin, server, channel);
            if (!_channel) return;
            _channel.setInfo(key, value);
            this.trigger(this.channels);
        },

        onUserName: function (origin, server, channel, user, name) {
            var _channel = this.channels.find(origin, server, channel);
            if (!_channel) return;
            _channel.usersJoin([name]);
            _channel.usersLeave([user]);
            this.trigger(this.channels);
        },

        onUsersJoin: function (origin, server, channel, users) {
            var _channel = this.channels.find(origin, server, channel);
            if (!_channel) return;
            _channel.usersJoin(users);
            this.trigger(this.channels);
        },

        onUsersLeave: function (origin, server, channel, users) {
            var _channel = this.channels.find(origin, server, channel);
            if (!_channel) return;
            _channel.usersLeave(users);
            this.trigger(this.channels);
        }
    });

});
