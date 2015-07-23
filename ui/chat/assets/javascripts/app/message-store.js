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

        onMessages: function (messages) {
            var added = messages.filter(function (message) {
                return this.checkMessage(message);
            }.bind(this));

            if (added.length) {
                this.db.add(added);
                this.trigger(this.messages);
            }
        }
    });

    // parse events from terminal server
    function onEvent (event) {
        switch (event.type) {
            default:
                console.log(event.type, event.meta);
                break;

            case 'error':
                // chatError (origin, server, text)
                console.log('error', event.meta);
                break;

            case 'listen':
                ChannelActions.listen(event.meta.origin, event.meta.server, event.meta.channels);
                break;
            case 'leave':
                ChannelActions.leave(event.meta.origin, event.meta.server, event.meta.channels);
                break;

            case 'info':
                ChannelActions.info(event.meta.origin, event.meta.server, event.meta.channels);
                break;

            case 'rosters':
                ChannelActions.usersJoin(event.meta.origin, event.meta.server, event.meta.channels);
                break;

            case 'state':
                console.log('state', event.meta);
                // chatState (origin, server, _channel, user, state, [info]) - user left / join / kicked etc..
                // switch (event.meta.state) {
                //     case 'join':
                //         ChannelActions.usersJoin(event.meta.origin, event.meta.server, event.meta.channel,
                //             [ event.meta.user ]);
                //         break;
                //     case 'part':
                //         ChannelActions.usersLeave(event.meta.origin, event.meta.server, event.meta.channel,
                //             [ event.meta.user ]);
                //         break;
                //     case 'name':
                //         ChannelActions.userName(event.meta.origin, event.meta.server, event.meta.channel,
                //             event.meta.user, event.meta.info);
                //         break;
                // }
                break;

            case 'message':
                MessageActions.message({
                    id: event.id,
                    when: event.when,
                    origin: event.meta.origin,
                    server: event.meta.server,
                    channel: event.meta.channel,
                    user: event.meta.user,
                    text: event.meta.text
                });
                break;
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
        onEvent(event);
    });
    terminal.on('response', function (response) {
        if (response.channel !== 'success' ||
            response.type !== 'chat/history') return;
        response.meta.forEach(onEvent);
    });

    module.exports.groupScale = groupScale;
    module.exports.toMinutes = toMinutes;
});
