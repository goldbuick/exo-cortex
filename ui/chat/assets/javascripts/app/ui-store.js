define(function(require, exports, module) {
    'use strict';

    var UIActions = require('app/ui-actions');

    module.exports = Reflux.createStore({
        listenables: [ UIActions ],

        getInitialState: function() {
            if (!this.ui) {
                this.ui = {
                    server: '',
                    channel: '',
                    channelInfo: false
                };
            }
            return this.ui;
        },

        onActiveServer: function (server) {
            if (this.ui.server === server) return;
            this.ui.server = server;
            this.ui.channel = '';
            this.trigger(this.ui);
        },

        onActiveChannel: function (channel) {
            if (this.ui.channel === channel) return;
            this.ui.channel = channel;
            this.trigger(this.ui);
        },

        onChannelInfoToggle: function () {
            this.ui.channelInfo = !this.ui.channelInfo;
            this.trigger(this.ui);
        }
    });
});
