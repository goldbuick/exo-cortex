define(function(require, exports, module) {
    'use strict';

    var terminal = require('app/terminal-server'),
        IdentActions = require('app/ident-actions');

    var trigger;
    function triggerNext () {
        clearTimeout(trigger);
        trigger = setTimeout(function () {
            IdentActions.next();
        }, 1000);        
    }

    module.exports = Reflux.createStore({
        listenables: [ IdentActions ],

        getInitialState: function () {
            if (!this.idents) {
                this.queue = [ ];
                this.idents = { };
                this.onNext();
            }
            return this.idents;
        },

        onNext: function () {
            var source;
            if (this.queue.length !== 0) {
                source = this.queue.shift();
                terminal.emit('request', {
                    route: 'ident/gen',
                    json: {
                        size: 64,
                        curve: 3,
                        stroke: 1,
                        padding: 1,
                        source: source
                    }
                });
            } else {
                triggerNext();
            }
        },

        onRequest: function (source) {
            if (this.idents[source] !== undefined) return;
            this.idents[source] = '';
            this.queue.push(source);
        },

        onResponse: function (source, svg) {
            if (this.idents[source]) return;
            this.idents[source] = svg;
            this.trigger(this.idents);
        }
    });

    terminal.on('response', function (response) {
        if (response.type !== 'ident/gen') return;
        if (response.channel !== 'success') {
            triggerNext();
            return;
        }
        IdentActions.response(response.meta.source, response.meta.svg);
        IdentActions.next();
    });

});