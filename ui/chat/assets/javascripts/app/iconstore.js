define(function(require, exports, module) {
    'use strict';

    var terminal = require('app/terminal'),
        IconActions = require('app/iconactions');

    module.exports = Reflux.createStore({
        listenables: [ IconActions ],

        getInitialState: function () {
            if (!this.icons) this.icons = { };
            return this.icons;
        },

        onRequest: function (source) {
            if (this.icons[source] !== undefined) return;
            
            this.icons[source] = '';
            terminal.emit('request', {
                route: 'ident/gen',
                json: {
                    size: 64,
                    padding: 1,
                    stroke: 1,
                    source: source
                }
            });
        },

        onResponse: function (source, svg) {
            if (this.icons[source]) return;
            this.icons[source] = svg;
            this.trigger(this.icons);
        }
    });

    terminal.on('response', function (response) {
        if (response.channel !== 'success' ||
            response.type !== 'ident/gen') return;
        IconActions.response(response.meta.source, response.meta.svg);
    });

});