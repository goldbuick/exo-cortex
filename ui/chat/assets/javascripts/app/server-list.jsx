define(function (require, exports, module) {
    'use strict';

    var UIActions = require('app/ui-actions'),
        ServerStore = require('app/server-store'),
        MessageSparkline = require('app/message-sparkline'),
        IdentActions = require('app/ident-actions'),
        IdentStore = require('app/ident-store');

    var ServerList = React.createClass({
        mixins: [
            Reflux.connect(ServerStore, 'servers'),
            Reflux.connect(IdentStore, 'ident')
        ],

        servers: function () {
            return Object.keys(this.state.servers);
        },

        serverIdent: function (name) {
            return this.state.ident[name];
        },

        viewServer: function (server, e) {
            e.preventDefault();
            UIActions.activeServer(server);
        },

        render: function () {
            return (
                <ul className="server-nav flex-item">
                    {this.servers().map((server) => {
                        var active = (server === this.props.server),
                            liTagClass = active ? 'active' : '';

                        IdentActions.request(server);
                        return <li key={'server-' + server} className={liTagClass}>
                            <MessageSparkline width="60"
                                server={server}/>
                            <div className="selected"></div>
                            <a href="#!"
                                dangerouslySetInnerHTML={{__html: this.serverIdent(server)}}
                                onClick={this.viewServer.bind(this, server)}></a>
                        </li>;
                    })}
                </ul>
            );
        }
    });

    return ServerList;
});