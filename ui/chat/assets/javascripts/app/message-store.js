define(function(require, exports, module) {
    'use strict';

    var terminal = require('app/terminal-server'),
        UIActions = require('app/ui-actions'),
        ServerActions = require('app/server-actions'),
        ChannelActions = require('app/channel-actions'),
        MessageActions = require('app/message-actions');

    var groupScale = 20,
        toMinutes = 60000;

    module.exports = Reflux.createStore({
        listenables: [ MessageActions, UIActions ],

        getInitialState: function () {
            if (!this.messages) {
                this.ids = { };
                this.db = crossfilter();
                this.messages = {
                    reset: function () {
                        this.server.filterAll();
                        this.channel.filterAll();
                        this.minutes.filterAll();
                        this.user.filterAll();
                    },
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

        onActiveServer: function () {
            this.trigger(this.messages);
        },

        onActiveChannel: function () {
            this.trigger(this.messages);
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
            if (this.ids[message.id]) return false;
            this.ids[message.id] = true;
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

    function parseEvent (result, event) {
        console.log(event.type);
        // if (event.channel !== 'irc') return;
        
        // if (event.meta.server) {
        //     if (event.type !== 'disconnect') {
        //         result.serverConnect[event.meta.server] = true;

        //     } else {
        //         result.serverDisconnect[event.meta.server] = true;
        //     }

        //     if (event.meta.channel) {
        //         into(result.joinChannel,
        //             event.meta.server)[event.meta.channel] = true;
        //     }
        // }

        // switch (event.type) {
        //     case 'topic':
        //         into(result.channelTopic,
        //             event.meta.server)[event.meta.channel] = {
        //             nick: event.meta.nick,
        //             topic: event.meta.topic
        //         };
        //         break;
        //     case 'names':
        //         into(result.channelUsers,
        //             event.meta.server)[event.meta.channel] = Object.keys(event.meta.nicks);
        //         break;
        //     case 'join':
        //         into(into(result.usersJoin,
        //             event.meta.server),
        //             event.meta.channel)[event.meta.nick] = true;
        //         break;
        //     case 'part':
        //         into(into(result.usersPart,
        //             event.meta.server),
        //             event.meta.channel)[event.meta.nick] = true;
        //         break;
        //     case 'public':
        //     case 'private':
        //         result.messages.push({
        //             id: event.id,
        //             when: event.when,
        //             server: event.meta.server,
        //             channel: event.meta.channel,
        //             user: event.meta.user,
        //             text: event.meta.text
        //         });
        //         break;
        // }
    }

    function onEvent (events) {
        var result = {
            serverConnect: { },
            serverDisconnect: { },
            joinChannel: { },
            channelTopic: { },
            channelUsers: { },
            usersJoin: { },
            usersPart: { },
            messages: [ ]
        };
        events.forEach(function (event) {
            parseEvent(result, event);
        });
        // Object.keys(result.serverConnect).forEach(function (server) {
        //     ServerActions.serverConnect(server);
        // });
        // Object.keys(result.serverDisconnect).forEach(function (server) {
        //     ServerActions.serverDisconnect(server);
        // });
        // Object.keys(result.joinChannel).forEach(function (server) {
        //     Object.keys(result.joinChannel[server]).forEach(function (channel) {
        //         ChannelActions.joinChannel(server, channel);
        //     });
        // });
        // Object.keys(result.channelTopic).forEach(function (server) {
        //     Object.keys(result.channelTopic[server]).forEach(function (channel) {
        //         var meta = result.channelTopic[server][channel];
        //         ChannelActions.topic(server, channel, meta.nick, meta.topic);
        //     });
        // });
        // Object.keys(result.channelUsers).forEach(function (server) {
        //     Object.keys(result.channelUsers[server]).forEach(function (channel) {
        //         ChannelActions.users(server, channel, result.channelUsers[server][channel]);
        //     });
        // });
        // Object.keys(result.usersJoin).forEach(function (server) {
        //     Object.keys(result.usersJoin[server]).forEach(function (channel) {
        //         var meta = result.usersJoin[server][channel];
        //         ChannelActions.usersJoin(server, channel, Object.keys(meta))
        //     });
        // });
        // Object.keys(result.usersPart).forEach(function (server) {
        //     Object.keys(result.usersPart[server]).forEach(function (channel) {
        //         var meta = result.usersPart[server][channel];
        //         ChannelActions.usersPart(server, channel, Object.keys(meta))
        //     });
        // });

        // if (result.messages.length === 1) {
        //     MessageActions.message(result.messages[0]);

        // } else if (result.messages.length) {
        //     MessageActions.batchMessage(result.messages);

        // }
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
        console.log('chat!', event);
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
