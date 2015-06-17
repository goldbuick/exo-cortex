define(function (require, exports, module) {
    'use strict';

    var UIStore = require('app/uistore'),
        ServerList = require('app/serverlist'),
        ChannelList = require('app/channellist'),
        MessageList = require('app/messagelist');

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
                        <div id="chat-nav" className="side-nav fixed flex-cols">
                            <ServerList />
                            <ChannelList />
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
