define(function (require, exports, module) {
    'use strict';

    var UIStore = require('app/ui-store'),
        UIActions = require('app/ui-actions'),
        ServerStore = require('app/server-store'),
        ChannelStore = require('app/channel-store'),
        ServerList = require('app/server-list'),
        ChannelList = require('app/channel-list'),
        ChannelInfo = require('app/channel-info'),
        MessageList = require('app/message-list'),
        MessageReply = require('app/message-reply'),
        MessageSparkline = require('app/message-sparkline');

    module.exports.current = function (state, current) {
        if (state.channels) return current || state.channels[0];
        return '';
    }

    module.exports.current = function (state, current) {
        if (state.servers) return current || Object.keys(state.servers)[0];
        return '';
    }

    var Page = React.createClass({
        mixins: [
            Reflux.connect(UIStore, 'ui'),
            Reflux.connect(ServerStore, 'servers'),
            Reflux.connect(ChannelStore, 'channels')
        ],

        componentDidMount: function () {
            $(this.getDOMNode()).find('.button-collapse').sideNav({
                edge: 'left',
                menuWidth: 310
            });
        },

        onShowChannelInfo: function (e) {
            e.preventDefault();
            UIActions.showChannelInfo();
        },

        currentServer: function () {
            if (this.state.ui.server) return this.state.ui.server;

            if (this.state.servers) {
                return Object.keys(this.state.servers)[0];
            }
            
            return '';
        },

        currentChannel: function () {
            if (this.state.ui.channel) return this.state.ui.channel;

            var server = this.currentServer();
            if (this.state.channels &&
                this.state.channels[server]) {
                return Object.keys(this.state.channels[server])[0];
            }

            return '';
        },

        render: function () {
            var currentServer = this.currentServer(),
                currentChannel = this.currentChannel(),
                channelInfo = '';

            if (currentChannel) {
                channelInfo = <a href="#">
                    <i onClick={this.onShowChannelInfo}
                        className="mdi-action-info-outline"></i></a>;
            }

            return (
                <div className="page">
                    <header>
                        <div className="navbar-fixed">
                            <nav className="top-nav">
                                <div className="nav-wrapper valign-wrapper">
                                    <a href="#" data-activates="chat-nav" className="button-collapse">
                                        <i className="mdi-navigation-menu"></i></a>
                                    <h5 className="valign">&nbsp;{currentChannel}&nbsp;</h5>
                                    {channelInfo}
                                </div>
                            </nav>
                        </div>
                        <div id="chat-nav" className="side-nav fixed">
                            <div className="overview">
                                <MessageSparkline width="295" />
                            </div>
                            <div className="flex-cols">
                                <ServerList 
                                    server={currentServer} />
                                <ChannelList
                                    server={currentServer}
                                    channel={currentChannel} />
                            </div>
                        </div>
                    </header>
                    <main>
                        <MessageList
                            server={currentServer}
                            channel={currentChannel} />
                        <MessageReply
                            server={currentServer}
                            channel={currentChannel} />
                        <ChannelInfo
                            server={currentServer}
                            channel={currentChannel} />
                    </main>
                </div>
            );
        }
    });

    return Page;
});
