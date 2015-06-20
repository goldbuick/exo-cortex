define(function (require, exports, module) {
    'use strict';

    var UIStore = require('app/uistore'),
        UIActions = require('app/uiactions'),
        IconStore = require('app/iconstore'),
        IconActions = require('app/iconactions'),
        ServerStore = require('app/serverstore'),
        MessageSparkline = require('app/messagesparkline');

    var ServerList = React.createClass({
        mixins: [
            Reflux.connect(UIStore, 'ui'),
            Reflux.connect(IconStore, 'icon'),
            Reflux.connect(ServerStore, 'server')
        ],

        servers: function () {
            return Object.keys(this.state.server);
        },

        serverIcon: function (name) {
            return this.state.icon[name];
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

                        IconActions.request(server);
                        return <li key={'server-' + server} className={liTagClass}>
                            <MessageSparkline width="60"
                                server={server}/>
                            <div className="selected"></div>
                            <a href="#!"
                                dangerouslySetInnerHTML={{__html: this.serverIcon(server)}}
                                onClick={this.viewServer.bind(this, server)}></a>
                        </li>;
                    })}
                </ul>
            );
        }
    });

    return ServerList;
});