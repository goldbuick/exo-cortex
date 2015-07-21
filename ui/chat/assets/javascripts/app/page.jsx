define(function (require, exports, module) {
    'use strict';

    var UIStore = require('app/ui-store'),
        UIActions = require('app/ui-actions'),
        ChannelStore = require('app/channel-store'),
        ChannelList = require('app/channel-list'),
        ChannelInfo = require('app/channel-info'),
        MessageList = require('app/message-list'),
        MessageReply = require('app/message-reply'),
        MessageSparkline = require('app/message-sparkline');

    var Page = React.createClass({
        mixins: [
            Reflux.connect(UIStore, 'ui'),
            Reflux.connect(ChannelStore, 'channels')
        ],

        componentDidMount: function () {
            $(this.getDOMNode()).find('.button-collapse').sideNav({
                edge: 'left',
                menuWidth: 310
            });

            var bkg = d3.select($(this.getDOMNode()).find('.bkg')[0])
                .append('svg');

            var t = textures.lines()
                .orientation('vertical', 'horizontal')
                .size(6)
                .strokeWidth(1)
                .shapeRendering('crispEdges');

            bkg.call(t);
            bkg.append('rect')
                .style('fill', t.url());
        },

        onShowInfo: function (e) {
            e.preventDefault();
            UIActions.showChannelInfo();
        },

        currentChannel: function () {
            if (!this.state.channels ||
                !this.state.channels.all().length) return {
                origin: '',
                server: '',
                name: '',
                info: { }
            };

            var _channel = this.state.channels.find(
                this.state.ui.origin, this.state.ui.server, this.state.ui.channel);
            if (_channel) return _channel;

            return this.state.channels.all()[0];
        },

        render: function () {
            var currentName = '',
                currentInfo = '',
                current = this.currentChannel();

            if (current) {
                currentName = current.info.name ? current.info.name : current.name;
                currentInfo = <a href="#!">
                    <i onClick={this.onShowInfo}
                        className="material-icons">info_outline</i></a>;
            }

            return (
                <div className="page">
                    <header>
                        <div className="navbar-fixed">
                            <nav className="top-nav">
                                <div className="nav-wrapper valign-wrapper">
                                    <a href="#" data-activates="chat-nav" className="button-collapse">
                                        <i className="mdi-navigation-menu"></i>
                                    </a>
                                    <h5 className="valign">&nbsp;{currentName}&nbsp;</h5>
                                    {currentInfo}
                                </div>
                            </nav>
                        </div>
                        <div id="chat-nav" className="side-nav fixed">
                            <div className="bkg"></div>
                            <div className="overview"><MessageSparkline width="280" /></div>
                            <ChannelList channel={current.name} />
                        </div>
                    </header>
                    <main>
                        <MessageList
                            origin={current.origin}
                            server={current.server}
                            channel={current.name} />
                        <MessageReply
                            origin={current.origin}
                            server={current.server}
                            channel={current.name} />
                    </main>
                </div>
            );
        }
    });
                        // <ChannelInfo
                        //     origin={current.origin}
                        //     server={current.server}
                        //     channel={current.name} />

    return Page;
});
