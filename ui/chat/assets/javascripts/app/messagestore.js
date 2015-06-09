define(function(require, exports, module) {
    'use strict';

    var MessageActions = require('app/messageactions'),
        UIActions = require('app/uiactions');

    module.exports = Reflux.createStore({

        listenables: [ MessageActions, UIActions ],

        getInitialState: function () {
            if (!this.messages) this.messages = [ ];
            return this.messages;
        },

        onActiveServer: function (server) {
            this.trigger(this.messages);
        },

        onActiveChannel: function (channel) {
            this.trigger(this.messages);
        },

        onMessage: function (message) {
            this.messages.push(message);
            this.trigger(this.messages);                    
        }

    });
});
