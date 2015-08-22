define(function (require, exports, module) {
    'use strict';

    var UIActions = require('app/ui-actions'),
        IdentActions = require('app/lib/ident-actions'),
        IdentStore = require('app/lib/ident-store'),
        RoomStore = require('app/room-store'),
        MessageSparkline = require('app/message-sparkline');

    var ServerList = React.createClass({
        mixins: [
            Reflux.connect(IdentStore, 'ident'),
            Reflux.connect(RoomStore, 'rooms')
        ],

        viewRoom: function (room, e) {
            e.preventDefault();
            UIActions.activeRoom(room.origin, room.server, room.name);
        },

        serverIdent: function (origin, server) {
            var name = [origin, server].join(':');
            IdentActions.request(name, name);
            return this.state.ident[name];
        },

        render: function () {
            var first = true,
                lastServer = '';

            return <ul className="room-nav">
                <li className="logo valign-wrapper">
                    <h5 className="valign">exo-chat</h5>
                </li>
                {this.state.rooms.all().map((room) => {
                    var elements = [ ];
                    if (room.server !== lastServer) {
                        lastServer = room.server;
                        if (!first) {
                            elements.push(
                                <li key={'server-gap' + room.server} className="gap"></li>
                            );
                        }

                        elements.push(
                            <li key={'server-' + room.server} className="server">
                                <div className="ident" dangerouslySetInnerHTML={{
                                    __html: this.serverIdent(room.origin, room.server)
                                }}></div>
                                <MessageSparkline width="280" height="16"
                                    server={room.server}/>
                                <div className="name">{room.server}</div>
                            </li>
                        );
                        first = false;
                    }

                    var name = room.info.name ? room.info.name : room.name,
                        active = (room.name === this.props.room),
                        liTagClass = active ? 'active' : '';

                    elements.push(
                        <li key={'room-' + room.name} className={liTagClass}>
                            <div className="selected"></div>
                            <MessageSparkline width="280" height="16"
                                server={room.server} room={room.name} />
                            <a href="#!"
                                onClick={this.viewRoom.bind(this, room)}>{name}</a>
                        </li>                        
                    );

                    return elements;
                })}
            </ul>;
        }
    });

    return ServerList;
});