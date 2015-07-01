define(function(require, exports, module) {
    'use strict';

    var terminal = require('app/terminal'),
        UIActions = require('app/uiactions'),
        ServerActions = require('app/serveractions'),
        ChannelActions = require('app/channelactions'),
        MessageActions = require('app/messageactions');

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
                        var t = moment(d.when.getTime()),
                            v = Math.floor(t.unix() / 60);
                        return v;
                    }),
                    user: this.db.dimension(function (d) {
                        return d.user;
                    })
                };

                this.messages.groupByMinutes = this.messages.minutes.group(function (d) {
                    return Math.floor(d / 30);
                });
            }
            return this.messages;
        },

        onActiveServer: function (server) {
            this.trigger(this.messages);
        },

        onActiveChannel: function (channel) {
            this.trigger(this.messages);
        },

        checkMessage: function (message) {
            // check for dupes
            if (this.ids[message.id]) return false;
            this.ids[message.id] = true;
            // turn when into a date object
            message.when = new Date(message.when);
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
        },

        onReply: function (server, channel, text) {
            terminal.emit('request', {
                route: 'irc/say',
                json: {
                    server: server,
                    target: channel,
                    text: text
                }
            });
        }
    });

    // parse events from terminal server
    function parseEvent (result, event) {
        if (event.channel !== 'irc') return;
        
        if (event.meta.server) {
            if (event.type !== 'disconnect') {
                result.serverConnect[event.meta.server] = true;

            } else {
                result.serverDisconnect[event.meta.server] = true;
            }

            if (event.meta.channel) {
                if (result.joinChannel[event.meta.server] === undefined)
                    result.joinChannel[event.meta.server] = { };

                result.joinChannel[event.meta.server][event.meta.channel] = true;
            }
        }

        switch (event.type) {
            case 'public':
            case 'private':
                result.messages.push({
                    id: event.id,
                    when: event.when,
                    server: event.meta.server,
                    channel: event.meta.channel,
                    user: event.meta.user,
                    text: event.meta.text
                });
                break;
        }
    }

    function onEvent (events) {
        var result = {
            serverConnect: [ ],
            serverDisconnect: [ ],
            joinChannel: [ ],
            messages: [ ]
        };
        events.forEach(function (event) {
            parseEvent(result, event);
        });
        Object.keys(result.serverConnect).forEach(function (server) {
            ServerActions.serverConnect(server);
        });
        Object.keys(result.serverDisconnect).forEach(function (server) {
            ServerActions.serverDisconnect(server);
        });
        Object.keys(result.joinChannel).forEach(function (server) {
            Object.keys(result.joinChannel[server]).forEach(function (channel) {
                ChannelActions.joinChannel(server, channel);
            });
        });
        if (result.messages.length) {
            MessageActions.batchMessage(result.messages);
        }
    }

    // request history from pass-log
    function getHistory () {
        var end = new Date(),
            start = new Date();
        start.setDate(start.getDate() - 1);

        terminal.emit('request', {
            route: 'log/list',
            json: {
                startDate: start.toISOString(),
                endDate: end.toISOString()
            }
        });
    }

    // event handlers from terminal server    
    terminal.on('api', function (api) {
        if (api.indexOf('log/list') !== -1) getHistory();
    });
    terminal.on('event', function (event) {
        onEvent([ event ]);
    });
    terminal.on('response', function (response) {
        if (response.channel !== 'success' ||
            response.type !== 'log/list') return;
            
        onEvent(response.meta);
    });
});
