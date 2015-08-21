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
                    room: ''
                };
            }
            return this.ui;
        },

        onActiveRoom: function (origin, server, room) {
            if (this.ui.origin === origin &&
                this.ui.server === server &&
                this.ui.room === room) return;
            this.ui.origin = origin;
            this.ui.server = server;
            this.ui.room = room;
            this.trigger(this.ui);
        }
    });
});
