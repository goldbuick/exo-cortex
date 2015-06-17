define(function(require, exports, module) {
    'use strict';

    var ServerActions = require('app/serveractions');

    module.exports = Reflux.createStore({

        listenables: [ ServerActions ],

        getInitialState: function () {
            if (!this.servers) this.servers = { };
            return this.servers;
        },

        onServerConnect: function (server) {
            if (this.servers[server] !== undefined) return;
            ServerActions.requestServerIcon(server);
            this.servers[server] = '';
            this.trigger(this.servers);
        },

        onServerDisconnect: function (server) {
            if (this.servers[server] === undefined) return;
            delete this.servers[server];
            this.trigger(this.servers);
        },

        onServerIcon: function (server, svg) {
            if (this.servers[server] === undefined) return;
            this.servers[server] = svg;            
            this.trigger(this.servers);
        }
    });
});
