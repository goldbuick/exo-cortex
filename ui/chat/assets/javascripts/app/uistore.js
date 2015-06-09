define(function(require, exports, module) {
    'use strict';

    var UIActions = require('app/uiactions'),
        ServerActions = require('app/serveractions');

    module.exports = Reflux.createStore({

        listenables: [ UIActions, ServerActions ],

        getInitialState: function() {
            if (!this.ui) {
                this.ui = {
                    server: '',
                    channel: ''
                };
            }
            return this.ui;
        },

        onActiveServer: function (server) {
            console.log('onActiveServer');
            this.ui.server = server;
            this.trigger(this.ui);
        },

        onActiveChannel: function (channel) {
            console.log('onActiveChannel');
            this.ui.channel = channel;
            this.trigger(this.ui);
        },

        onServerConnect: function (server) {
            if (this.ui.server) return;
            this.onActiveServer(server);
        },

    });
});
