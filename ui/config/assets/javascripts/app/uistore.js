define(function(require, exports, module) {
    'use strict';

    var UIActions = require('app/uiactions');

    module.exports = Reflux.createStore({

        listenables: [ UIActions ],

        getInitialState: function() {
            if (!this.ui) {
                this.ui = {
                    active: 'upstream-path'
                };
            }
            return this.ui;
        },

        onActiveNode: function (node) {
            this.ui.active = node;
            this.trigger(this.ui);
        }

    });
});
