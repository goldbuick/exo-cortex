define(function(require, exports, module) {
    'use strict';

    var terminal = require('app/terminal'),
        IconActions = require('app/iconactions');

    module.exports = Reflux.createStore({
        listenables: [ IconActions ],

        getInitialState: function () {
            if (!this.icons) {
                this.queue = [ ];
                this.icons = { };
                this.onNext();
            }
            return this.icons;
        },

        onNext: function () {
            var source;
            if (this.queue.length !== 0) {
                source = this.queue.shift();
                terminal.emit('request', {
                    route: 'ident/gen',
                    json: {
                        size: 64,
                        padding: 1,
                        stroke: 1,
                        source: source
                    }
                });
            } else {
                setTimeout(function () {
                    IconActions.next();                    
                }, 1000);
            }
        },

        onRequest: function (source) {
            if (this.icons[source] !== undefined) return;
            this.icons[source] = '';
            this.queue.push(source);
        },

        onResponse: function (source, svg) {
            if (this.icons[source]) return;
            this.icons[source] = svg;
            this.trigger(this.icons);
        }
    });

    terminal.on('response', function (response) {
        if (response.type !== 'ident/gen') return;
        IconActions.next();
        if (response.channel !== 'success') return;
        IconActions.response(response.meta.source, response.meta.svg);
    });

});