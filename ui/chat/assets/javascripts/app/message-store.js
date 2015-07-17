define(function(require, exports, module) {
    'use strict';

    var terminal = require('app/terminal-server'),
        ChannelActions = require('app/channel-actions'),
        MessageActions = require('app/message-actions');

    var groupScale = 20,
        toMinutes = 60000;

    module.exports = Reflux.createStore({
        listenables: [ MessageActions ],

        getInitialState: function () {
            if (!this.messages) {
                this.unique = { };
                this.db = crossfilter();
                this.messages = {
                    reset: function () {
                        this.origin.filterAll();
                        this.server.filterAll();
                        this.channel.filterAll();
                        this.minutes.filterAll();
                        this.user.filterAll();
                    },
                    origin: this.db.dimension(function (d) {
                        return d.origin;
                    }),
                    server: this.db.dimension(function (d) {
                        return d.server;
                    }),
                    channel: this.db.dimension(function (d) {
                        return d.channel;
                    }),
                    minutes: this.db.dimension(function (d) {
                        return d.minutes;
                    }),
                    user: this.db.dimension(function (d) {
                        return d.user;
                    })
                };
                this.messages.groupByMinutes = this.messages.minutes.group(function (d) {
                    return Math.floor(d / groupScale);
                });
            }
            return this.messages;
        },

        onSay: function (origin, server, channel, text) {
            terminal.emit('request', {
                route: 'chat/say',
                json: {
                    origin: origin,
                    server: server,
                    channel: channel,
                    text: text
                }
            });
        },

        onInfo: function (origin, server, channel) {
            terminal.emit('request', {
                route: 'chat/info',
                json: {
                    origin: origin,
                    server: server,
                    target: channel
                }
            });
        },

        onList: function (origin, server) {
            terminal.emit('request', {
                route: 'chat/list',
                json: {
                    origin: origin,
                    server: server
                }
            });
        },

        onWake: function () {
            terminal.emit('request', {
                route: 'chat/wake',
                json: { }
            });
        },

        onRoster: function (origin, server, channel) {
            terminal.emit('request', {
                route: 'chat/roster',
                json: {
                    origin: origin,
                    server: server,
                    target: channel                    
                }
            });
        },

        onHistory: function () {
            var end = new Date(),
                start = new Date();
            start.setDate(start.getDate() - 1);

            terminal.emit('request', {
                route: 'chat/history',
                json: {
                    startDate: start.toISOString(),
                    endDate: end.toISOString()
                }
            });
        },

        checkMessage: function (message) {
            // check for dupes
            if (this.unique[message.id]) return false;
            this.unique[message.id] = true;
            // turn when into a date object
            message.when = new Date(message.when);
            // minutes since epoch
            message.minutes = message.when.getTime() / toMinutes;
            // return that this is a unique record
            return true;
        },

        onBatchMessage: function (messages) {
            var added = messages.filter(function (message) {
                return this.checkMessage(message);
            }.bind(this));

            if (added.length) {
                this.db.add(added);
                this.trigger(this.messages);
            }
        },

        onMessage: function (message) {
            if (this.checkMessage(message)) {
                this.db.add([message]);
                this.trigger(this.messages);
            }
        }
    });

    // parse events from terminal server
    function into (obj, key) {
        if (obj[key] === undefined) {
            obj[key] = { };
        }
        return obj[key];
    }

    function parseEvent (messages, event) {
        switch (event.type) {
            case 'error':
                // chatError (origin, server, text)
                console.log('error', event.meta);
                break;
            case 'message':
                // chatMessage (origin, server, _channel, user, text)
                messages.push({
                    id: event.id,
                    when: event.when,
                    origin: event.meta.origin,
                    server: event.meta.server,
                    channel: event.meta.channel,
                    user: event.meta.user,
                    text: event.meta.text
                });
                break;
            case 'info':
                // chatInfo (origin, server, _channel, info) - extra meta data about a channel
                break;
            case 'roster':
                // chatRoster (origin, server, _channel, users) - users in a particular channel
                ChannelActions.usersJoin(event.meta.origin, event.meta.server, event.meta.channel,
                    event.meta.users);
                break;

            case 'state':
                // chatState (origin, server, _channel, user, state, [info]) - user left / join / kicked etc..
                switch (event.meta.state) {
                    case 'join':
                        ChannelActions.usersJoin(event.meta.origin, event.meta.server, event.meta.channel,
                            [ event.meta.user ]);
                        break;
                    case 'part':
                        ChannelActions.usersLeave(event.meta.origin, event.meta.server, event.meta.channel,
                            [ event.meta.user ]);
                        break;
                    case 'name':
                        ChannelActions.userName(event.meta.origin, event.meta.server, event.meta.channel,
                            event.meta.user, event.meta.info);
                        break;
                }
                break;

            case 'listen':
                // chatListen (origin, server, _channels) - which channels are you in
                event.meta.channels.forEach(function (name) {
                    ChannelActions.listen(event.meta.origin, event.meta.server, name);
                });
                break;
            case 'leave':
                // chatLeave (origin, server, _channels) - you have left these channels
                event.meta.channels.forEach(function (name) {
                    ChannelActions.leave(event.meta.origin, event.meta.server, name);
                });
                break;
        }
    }

    function onEvent (events) {
        var messages = [ ];

        events.forEach(function (event) {
            parseEvent(messages, event);
        });

        if (messages.length === 1) {
            MessageActions.message(messages[0]);

        } else if (messages.length) {
            MessageActions.batchMessage(messages);
        }
    }

    // event handlers from terminal server    
    terminal.on('api', function (api) {
        if (api.indexOf('chat/wake') !== -1) {
            MessageActions.wake();
        }
        if (api.indexOf('chat/history') !== -1) {
            MessageActions.history();
        }
    });
    terminal.on('chat', function (event) {
        onEvent([ event ]);
    });
    terminal.on('response', function (response) {
        if (response.channel !== 'success' ||
            response.type !== 'chat/history') return;
        onEvent(response.meta);
    });

    module.exports.groupScale = groupScale;
    module.exports.toMinutes = toMinutes;
});
