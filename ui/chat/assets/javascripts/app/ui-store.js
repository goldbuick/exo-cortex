define(function(require, exports, module) {
    'use strict';

    var UIActions = require('app/ui-actions'),
        MessageActions = require('app/message-actions');

    module.exports = Reflux.createStore({
        listenables: [ UIActions ],

        getInitialState: function() {
            if (!this.ui) {
                this.ui = {
                    origin: '',
                    server: '',
                    channel: ''
                };
            }
            return this.ui;
        },

        onActiveChannel: function (origin, server, channel) {
            if (this.ui.origin === origin &&
                this.ui.server === server &&
                this.ui.channel === channel) return;
            this.ui.origin = origin;
            this.ui.server = server;
            this.ui.channel = channel;
            this.trigger(this.ui);
        }
    });
});
