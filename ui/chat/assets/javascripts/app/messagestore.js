define(function(require, exports, module) {
    'use strict';

    var terminal = require('app/terminal'),
        MessageActions = require('app/messageactions'),
        UIActions = require('app/uiactions');

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
});
