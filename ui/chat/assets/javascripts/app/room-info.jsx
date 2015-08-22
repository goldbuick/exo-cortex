define(function (require, exports, module) {
    'use strict';

    var UIActions = require('app/ui-actions'),
        UserStore = require('app/user-store'),
        RoomStore = require('app/room-store'),
        RoomActions = require('app/room-actions');

    var RoomInfo = React.createClass({
        mixins: [
            Reflux.connect(UserStore, 'users'),
            Reflux.connect(RoomStore, 'rooms'),
            Reflux.listenTo(UIActions.showRoomInfo, 'onShowRoomInfo')
        ],

        onShowRoomInfo: function () {
            $(this.getDOMNode()).openModal();
        },

        onUserDM: function (room, e) {
            e.preventDefault();
            $(this.getDOMNode()).closeModal();
            RoomActions.join([this.props.origin, this.props.server, room], {
                origin: this.props.origin,
                server: this.props.server,
                room: room
            });
            UIActions.activeRoom(this.props.origin, this.props.server, room);
        },

        render: function () {
            var info = [{
                    prop: 'id',
                    value: JSON.stringify(this.props.room)
                }],
                users = [ ];

            var current;
            if (this.props.origin &&
                this.props.server &&
                this.props.room) {
                current = this.state.rooms.find(this.props.origin, this.props.server, this.props.room);
            }

            if (current) {
                Object.keys(current.info).forEach(function (prop) {
                    if (prop === 'users') return;
                    info.push({
                        prop: prop,
                        value: JSON.stringify(current.info[prop])
                    });
                });
                current.getUsers().forEach(function (user) {
                    var _user = this.state.users.find(this.props.origin, this.props.server, user);
                    if (_user) {
                        users.push({
                            room: _user.name,
                            name: _user.info.name || _user.name
                        });
                    } else {
                        users.push({
                            room: user,
                            name: user
                        });
                    }
                }.bind(this));
            }

            return <div className="modal room-info">
                <div className="modal-content">
                    <table className="striped">
                        <tbody>
                        {info.map((data) => {
                            return <tr key={data.prop}><td>{data.prop}</td><td>{data.value}</td></tr>;
                        })}
                        </tbody>
                    </table>
                    <ul>
                        {users.map((user) => {
                            return <li key={user.room}>
                                <a href="#" onClick={this.onUserDM.bind(this, user.room)}>{user.name}</a>
                            </li>;
                        })}
                    </ul>
                </div>
            </div>;
        }
    });

    return RoomInfo;
});