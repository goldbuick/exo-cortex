define(function(require, exports, module) {
    'use strict';

    var terminal = require('app/terminal'),
        ServerActions = require('app/serveractions'),
        ChannelActions = require('app/channelactions'),
        MessageActions = require('app/messageactions');

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

    terminal.on('event', function (event) {
        onEvent([ event ]);
    });
    terminal.on('api', function (api) {
        console.log('api', api);
        // is log list up?
        if (api.indexOf('log/list') !== -1) {
            getHistory();
        }
    });
    terminal.on('response', function (response) {
        if (response.channel !== 'success' ||
            response.type !== 'log/list') return;
            
        onEvent(response.meta);
    });

});