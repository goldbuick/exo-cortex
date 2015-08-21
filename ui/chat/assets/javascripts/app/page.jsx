define(function (require, exports, module) {
    'use strict';

    var UIStore = require('app/ui-store'),
        UIActions = require('app/ui-actions'),
        RoomStore = require('app/room-store'),
        RoomList = require('app/room-list'),
        RoomInfo = require('app/room-info'),
        MessageList = require('app/message-list'),
        MessageReply = require('app/message-reply'),
        MessageSparkline = require('app/message-sparkline');

    var Page = React.createClass({
        mixins: [
            Reflux.connect(UIStore, 'ui'),
            Reflux.connect(RoomStore, 'rooms')
        ],

        updateBkg: function () {
            clearTimeout(this.bkgTimer);
            this.bkgTimer = setTimeout(function () {
                var list = $(this.getDOMNode()).find('.room-nav'),
                    listHeight = list.height() + 'px',
                    listWidth = '310px';

                var bkg = $(this.getDOMNode()).find('.bkg');

                bkg.html('');
                bkg = d3.select(bkg[0])
                    .append('svg')
                    .attr('width', listWidth)
                    .attr('height', listHeight);

                var t = textures.lines()
                    .orientation('vertical', 'horizontal')
                    .size(4)
                    .strokeWidth(1)
                    .shapeRendering('crispEdges');

                bkg.call(t);
                bkg.append('rect')
                    .attr('width', listWidth)
                    .attr('height', listHeight)
                    .style('fill', t.url());
            }.bind(this), 256);
        },

        componentDidMount: function () {
            $(this.getDOMNode()).find('.button-collapse').sideNav({
                edge: 'left',
                menuWidth: 310
            });
            this.updateBkg();
        },

        componentDidUpdate: function () {
            this.updateBkg();
        },

        onShowInfo: function (e) {
            e.preventDefault();
            UIActions.showRoomInfo();
        },

        currentRoom: function () {
            if (!this.state.rooms ||
                !this.state.rooms.all().length) return {
                origin: '',
                server: '',
                name: '',
                info: { }
            };

            var _room = this.state.rooms.find(
                this.state.ui.origin, this.state.ui.server, this.state.ui.room);
            if (_room) return _room;

            return this.state.rooms.all()[0];
        },

        render: function () {
            var currentName = '',
                currentInfo = '',
                current = this.currentRoom();

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
                            <div className="overview">
                                <MessageSparkline width="280" height="16" /></div>
                            <RoomList room={current.name} />
                        </div>
                    </header>
                    <main>
                        <MessageList
                            origin={current.origin}
                            server={current.server}
                            room={current.name} />
                        <MessageReply
                            origin={current.origin}
                            server={current.server}
                            room={current.name} />
                    </main>
                </div>
            );
        }
    });
                        // <RoomInfo
                        //     origin={current.origin}
                        //     server={current.server}
                        //     room={current.name} />

    return Page;
});
