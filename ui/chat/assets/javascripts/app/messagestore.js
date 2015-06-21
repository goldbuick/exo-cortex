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
                this.messages = [ ];
            }
            return this.messages;
        },

        onActiveServer: function (server) {
            this.trigger(this.messages);
        },

        onActiveChannel: function (channel) {
            this.trigger(this.messages);
        },

        addMessage: function (message) {
            // check for dupes
            if (this.ids[message.id]) return false;
            this.ids[message.id] = true;
            this.messages.push(message);
            return true;
        },

        onBatchMessage: function (messages) {
            messages.forEach(this.addMessage.bind(this));
            this.trigger(this.messages);
        },

        onMessage: function (message) {
            if (!this.addMessage(message)) return;
            this.trigger(this.messages);                    
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
