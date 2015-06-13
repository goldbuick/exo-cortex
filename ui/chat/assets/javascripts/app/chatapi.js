define(function(require, exports, module) {
    'use strict';

    var terminal = require('app/terminal'),
        ServerActions = require('app/serveractions'),
        ChannelActions = require('app/channelactions'),
        MessageActions = require('app/messageactions');

    function genIdent (source) {
        terminal.emit('request', {
            route: 'ident/gen',
            json: {
                size: 64,
                padding: 1,
                stroke: 1,
                source: source
            }
        });
    }

    terminal.on('api', function(json) {
        console.log('api', json);
    });

    terminal.on('event', function (message) {
        if (message.channel !== 'irc') return;
        
        if (message.meta.server) {
            if (message.type !== 'disconnect') {
                genIdent(message.meta.server);
                ServerActions.serverConnect(message.meta.server);

            } else {
                ServerActions.serverDisconnect(message.meta.server);
            }

            if (message.meta.channel) {
                ChannelActions.joinChannel(message.meta.server, message.meta.channel);
            }
        }

        switch (message.type) {
            case 'public':
            case 'private':
                MessageActions.message({
                    id: message.id,
                    when: message.when,
                    server: message.meta.server,
                    channel: message.meta.channel,
                    user: message.meta.user,
                    text: message.meta.text
                });
                break;
        }
    });

    terminal.on('response', function (message) {
        if (message.channel !== 'success') return;

        if (message.type === 'ident/gen') {
            ServerActions.serverIcon(message.meta.source, message.meta.svg);
        }
    });

});