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
        group: function () {
            return getUnique(this.origin, this.server).toLowerCase();
        },
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
                var id1group = a.group(),
                    id2group = b.group(),
                    id1name = a.info.name ? a.info.name : a.name,
                    id2name = b.info.name ? b.info.name : b.name;

                if (id1group === id2group) {
                    if (id1name < id2name) return -1;
                    if (id1name > id2name) return 1;
                    return 0;
                }

                if (id1group < id2group) return -1;
                if (id1group > id2group) return 1;
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
            var delta = false;
            channels.forEach(function (channel) {
                var _channel = this.channels.find(origin, server, channel);
                if (!_channel) {
                    _channel = this.channels.add(true, origin, server, channel);

                } else if (_channel.active) {
                    return;
                }

                _channel.active = true;
                delta = true;
            }.bind(this));
            if (delta) this.trigger(this.channels);
        },

        onLeave: function (origin, server, channels) {
            var delta = false;
            channels.forEach(function (channel) {
                var _channel = this.channels.find(origin, server, channel);
                if (!_channel || !_channel.active) return;
                _channel.active = false;
                delta = true;
            }.bind(this));
            if (delta) this.trigger(this.channels);
        },

        onInfo: function (origin, server, channels) {
            var delta = false;
            Object.keys(channels).forEach(function (channel) {
                var _channel = this.channels.find(origin, server, channel);
                if (!_channel) _channel = this.channels.add(false, origin, server, channel);
                Object.keys(channels[channel]).forEach(function (key) {
                    _channel.setInfo(key, channels[channel][key]);
                });
                delta = true;
            }.bind(this));
            if (delta) this.trigger(this.channels);
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
            var delta = false;
            Object.keys(channels).forEach(function (channel) {
                var _channel = this.channels.find(origin, server, channel);
                if (!_channel) _channel = this.channels.add(false, origin, server, channel);
                _channel.usersJoin(channels[channel]);
                delta = true;
            }.bind(this));
            if (delta) this.trigger(this.channels);
        },

        onUsersLeave: function (origin, server, channels) {
            var delta = false;
            Object.keys(channels).forEach(function (channel) {
                var _channel = this.channels.find(origin, server, channel);
                if (!_channel) _channel = this.channels.add(false, origin, server, channel);
                _channel.usersLeave(channels[channel]);
                delta = true;
            }.bind(this));
            if (delta) this.trigger(this.channels);
        }
    });

});
