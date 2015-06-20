define(function (require, exports, module) {
    'use strict';

    var UIStore = require('app/uistore'),
        ServerList = require('app/serverlist'),
        ChannelList = require('app/channellist'),
        MessageList = require('app/messagelist'),
        MessageSparkline = require('app/messagesparkline');

    var Page = React.createClass({
        mixins: [
            Reflux.connect(UIStore, 'ui')
        ],

        componentDidMount: function() {
            $(this.getDOMNode()).find('.button-collapse').sideNav({
                edge: 'left',
                menuWidth: 310
            });
        },
        
        render: function () {
            return (
                <div>
                    <header>
                        <div className="navbar-fixed">
                            <nav className="top-nav">
                                <div className="nav-wrapper valign-wrapper">
                                    <a href="#" data-activates="chat-nav" className="button-collapse">
                                        <i className="mdi-navigation-menu"></i></a>
                                    <h5 className="valign">&nbsp;{this.state.ui.channel}</h5>
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
                    </main>
                </div>
            );
        }
    });

    return Page;
});
