define(function (require, exports, module) {
    'use strict';

    var UIStore = require('app/uistore'),
        ServerList = require('app/serverlist'),
        ChannelList = require('app/channellist');

    var Page = React.createClass({
        mixins: [
            Reflux.connect(UIStore, 'ui')
        ],
        
        render: function () {
            return (
                <div>
                    <header>
                        <nav className="top-nav blue-grey darken-4">
                            <div className="nav-wrapper valign-wrapper">
                                <a href="#" data-activates="chat-nav" className="button-collapse">
                                    <i className="mdi-navigation-menu"></i></a>
                                <h5 className="valign">&nbsp;{this.state.ui.channel}</h5>
                            </div>
                        </nav>
                        <div id="chat-nav">
                            <ChannelList />
                            <ServerList />
                        </div>
                    </header>
                    <main>
                        <p>hi</p>
                    </main>
                </div>
            );
        }
    });

    return Page;
});
