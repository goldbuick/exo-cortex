define(function(require, exports, module) {
    'use strict';

    var ChannelActions = require('app/channel-actions');

    function getUnique() {
        return Array.prototype.slice.call(arguments).join(':');
    }

    function Channel (active, origin, server, name) {
        this.active = active;
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
            return this.list.filter(function (channel) {
                return channel.active;
            });
        },
        find: function (origin, server, channel) {
            var id = getUnique(origin || '', server || '', channel || '');
            return this.list.filter(function (_channel) {
                return _channel.unique() === id;
            })[0];
        },
        add: function (active, origin, server, channel) {
            var _channel = new Channel(active, origin, server, channel);
            this.list.push(_channel);
            this.list.sort(function (a, b) {
                var id1 = a.unique().toLowerCase(),
                    id2 = b.unique().toLowerCase();

                if (id1 < id2) {
                    return -1;
                }
                if (id1 > id2) {
                    return 1;
                }
                return 0;
            });
            return _channel;
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

        onListen: function (origin, server, channels) {
            channels.forEach(function (channel) {
                var _channel = this.channels.find(origin, server, channel);
                if (!_channel) {
                    _channel = this.channels.add(true, origin, server, channel);

                } else if (_channel.active) {
                    return;
                }

                _channel.active = true;
                this.trigger(this.channels);
            }.bind(this));
        },

        onLeave: function (origin, server, channels) {
            channels.forEach(function (channel) {
                var _channel = this.channels.find(origin, server, channel);
                if (!_channel || !_channel.active) return;
                _channel.active = false;
                this.trigger(this.channels);
            }.bind(this));
        },

        onInfo: function (origin, server, channels) {
            Object.keys(channels).forEach(function (channel) {
                var _channel = this.channels.find(origin, server, channel);
                if (!_channel) _channel = this.channels.add(false, origin, server, channel);
                Object.keys(channels[channel]).forEach(function (key) {
                    _channel.setInfo(key, channels[channel][key]);
                });
                this.trigger(this.channels);
            }.bind(this));
        },

        onUserName: function (origin, server, channels) {
            console.log('onUserName', channels);
            // var _channel = this.channels.find(origin, server, channel);
            // if (!_channel) _channel = this.channels.add(false, origin, server, channel);
            // _channel.usersJoin([name]);
            // _channel.usersLeave([user]);
            // this.trigger(this.channels);
        },

        onUsersJoin: function (origin, server, channels) {
            Object.keys(channels).forEach(function (channel) {
                var _channel = this.channels.find(origin, server, channel);
                if (!_channel) _channel = this.channels.add(false, origin, server, channel);
                _channel.usersJoin(channels[channel]);
                this.trigger(this.channels);
            }.bind(this));
        },

        onUsersLeave: function (origin, server, channels) {
            Object.keys(channels).forEach(function (channel) {
                var _channel = this.channels.find(origin, server, channel);
                if (!_channel) _channel = this.channels.add(false, origin, server, channel);
                _channel.usersLeave(channels[channel]);
                this.trigger(this.channels);
            }.bind(this));
        }
    });

});
