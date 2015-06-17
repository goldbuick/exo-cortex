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

        servers: function () {
            return Object.keys(this.state.server);
        },

        serverIcon: function (name) {
            return this.state.server[name];
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

                        return <li key={'server-' + server} className={liTagClass}>
                            <a href="#!"
                                dangerouslySetInnerHTML={{__html: this.serverIcon(server)}}
                                onClick={this.viewServer.bind(this, server)}></a></li>;
                    })}
                </ul>
            );
        }
    });

    return ServerList;
});