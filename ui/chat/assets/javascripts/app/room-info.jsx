define(function (require, exports, module) {
    'use strict';

    var UIActions = require('app/ui-actions'),
        RoomStore = require('app/room-store'),
        RoomActions = require('app/room-actions');

    var RoomInfo = React.createClass({
        mixins: [
            Reflux.connect(RoomStore, 'rooms'),
            Reflux.listenTo(UIActions.showRoomInfo, 'onShowRoomInfo')
        ],

        onShowRoomInfoInfo: function () {
            $(this.getDOMNode()).openModal();
        },

        // onUserDM: function (user, e) {
        //     e.preventDefault();
        //     $(this.getDOMNode()).closeModal();
        //     ChannelActions.joinChannel(this.props.server, user);
        //     UIActions.activeChannel(user);
        // },

        render: function () {
            var topic = '',
                users = '';

            // if (this.props.server &&
            //     this.props.channel &&
            //     this.state.channel[this.props.server][this.props.channel]) {

            //     if (this.state.channel[this.props.server][this.props.channel].topic) {
            //         topic = this.state.channel[this.props.server][this.props.channel].topic;
            //         topic = <div key="topic">
            //             <p>{topic.text}</p>
            //             <p>Set by <strong>{topic.user}</strong></p>
            //         </div>;
            //     }

            //     if (this.state.channel[this.props.server][this.props.channel].users) {
            //         users = this.state.channel[this.props.server][this.props.channel].users;
            //         users = <ul key="users">
            //             {users.map((user) => {
            //                 return <li key={user}>
            //                     <a href="#" onClick={this.onUserDM.bind(this, user)}>{user}</a></li>;
            //             })}
            //         </ul>;
            //     }
            // }

            return <div className="modal channel-info">
                <div className="modal-content">
                    {topic}
                    {users}
                </div>
            </div>;
        }
    });

    return RoomInfo;
});