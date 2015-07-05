define(function (require, exports, module) {
    'use strict';

    var UIStore = require('app/ui-store'),
        UIActions = require('app/ui-actions'),
        ServerList = require('app/server-list'),
        ChannelList = require('app/channel-list'),
        ChannelInfo = require('app/channel-info'),
        MessageList = require('app/message-list'),
        MessageReply = require('app/message-reply'),
        MessageSparkline = require('app/message-sparkline');

    var Page = React.createClass({
        mixins: [
            Reflux.connect(UIStore, 'ui')
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
        
        render: function () {
            var channelInfo = '';

            if (this.state.ui.channel) {
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
                                    <h5 className="valign">&nbsp;{this.state.ui.channel}&nbsp;</h5>
                                    {channelInfo}
                                </div>
                            </nav>
                        </div>
                        <div id="chat-nav" className="side-nav fixed">
                            <div className="overview">
                                <MessageSparkline width="295" />
                            </div>
                            <div className="flex-cols">
                                <ServerList />
                                <ChannelList />
                            </div>
                        </div>
                    </header>
                    <main>
                        <MessageList />
                        <MessageReply />
                        <ChannelInfo />
                    </main>
                </div>
            );
        }
    });

    return Page;
});
