define(function (require, exports, module) {
    'use strict';

    var UIActions = require('app/ui-actions'),
        IdentActions = require('app/ident-actions'),
        IdentStore = require('app/ident-store'),
        ChannelStore = require('app/channel-store'),
        MessageSparkline = require('app/message-sparkline');

    var ServerList = React.createClass({
        mixins: [
            Reflux.connect(IdentStore, 'ident'),
            Reflux.connect(ChannelStore, 'channels')
        ],

        viewChannel: function (channel, e) {
            e.preventDefault();
            UIActions.activeChannel(channel.origin, channel.server, channel.name);
        },

        serverIdent: function (origin, server) {
            var name = [origin, server].join(':');
            IdentActions.request(name);
            return this.state.ident[name];
        },

        render: function () {
            var first = true,
                lastServer = '';

            return <ul className="channel-nav">
                <li className="logo valign-wrapper">
                    <h5 className="valign">exo-cortex</h5>
                </li>
                {this.state.channels.all().map((channel) => {
                    var elements = [ ];
                    if (channel.server !== lastServer) {
                        lastServer = channel.server;
                        if (!first) {
                            elements.push(
                                <li key={'server-gap' + channel.server} className="gap"></li>
                            );
                        }
                        elements.push(
                            <li key={'server-' + channel.server} className="server">
                                <div className="ident" dangerouslySetInnerHTML={{
                                    __html: this.serverIdent(channel.origin, channel.server)
                                }}></div>
                                <MessageSparkline width="280"
                                    server={channel.server}/>
                                <div className="name">{channel.server}</div>
                            </li>
                        );
                        first = false;
                    }

                    var active = (channel.name === this.props.channel),
                        liTagClass = active ? 'active' : '';
                    elements.push(
                        <li key={'channel-' + channel.name} className={liTagClass}>
                            <div className="selected"></div>
                            <MessageSparkline width="280"
                                server={channel.server} channel={channel.name} />
                            <a href="#!"
                                onClick={this.viewChannel.bind(this, channel)}>{channel.name}</a>
                        </li>                        
                    );

                    return elements;
                })}
            </ul>;
        }
    });

    return ServerList;
});