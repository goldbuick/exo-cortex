define(function (require, exports, module) {
    'use strict';

    var UIStore = require('app/uistore'),
        UIActions = require('app/uiactions'),
        ServerStore = require('app/serverstore');

    var ServerList = React.createClass({
        mixins: [
            Reflux.connect(UIStore, 'ui'),
            Reflux.connect(ServerStore, 'server')
        ],

        shortName: function (server) {
            var hash = server.split("").reduce(function (a, b) {
                a = ((a << 5) - a) + b.charCodeAt(0);
                return a & a;
            }, 0);

            return hash.toString(16).substring(0, 5);
        },

        servers: function () {
            return Object.keys(this.state.server);
        },

        viewServer: function (server, e) {
            e.preventDefault();
            UIActions.activeServer(server);
        },

        render: function () {
            return (
                <ul className="server-nav flex-item">
                    {this.servers().map((server) => {
                        var active = (server === this.state.ui.server),
                            liTagClass = active ? 'active' : '';

                        return <li key={'server-' + server} className={liTagClass}><a href="#!"
                            onClick={this.viewServer.bind(this, server)}>{this.shortName(server)}</a></li>;
                    })}
                </ul>
            );
        }
    });

    return ServerList;
});