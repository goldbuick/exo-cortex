define(function (require, exports, module) {
    'use strict';

    var UIStore = require('app/ui-store'),
        UIActions = require('app/ui-actions'),
        ChannelStore = require('app/channel-store'),
        ChannelActions = require('app/channel-actions');

    var ChannelInfo = React.createClass({
        mixins: [
            Reflux.connect(UIStore, 'ui'),
            Reflux.connect(ChannelStore, 'channel'),
            Reflux.listenTo(UIActions.showChannelInfo, 'onShowChannelInfo')
        ],

        onShowChannelInfo: function () {
            $(this.getDOMNode()).openModal();
        },

        onUserDM: function (user, e) {
            e.preventDefault();
            $(this.getDOMNode()).closeModal();
            ChannelActions.joinChannel(this.state.ui.server, user);
            UIActions.activeChannel(user);
        },

        render: function () {
            var topic = '',
                users = '';

            if (this.state.ui.server &&
                this.state.ui.channel &&
                this.state.channel[this.state.ui.server][this.state.ui.channel]) {

                if (this.state.channel[this.state.ui.server][this.state.ui.channel].topic) {
                    topic = this.state.channel[this.state.ui.server][this.state.ui.channel].topic;
                    topic = <div key="topic">
                        <p>{topic.text}</p>
                        <p>Set by <strong>{topic.user}</strong></p>
                    </div>;
                }

                if (this.state.channel[this.state.ui.server][this.state.ui.channel].users) {
                    users = this.state.channel[this.state.ui.server][this.state.ui.channel].users;
                    users = <ul key="users">
                        {users.map((user) => {
                            return <li key={user}>
                                <a href="#" onClick={this.onUserDM.bind(this, user)}>{user}</a></li>;
                        })}
                    </ul>;
                }
            }

            return <div className="modal channel-info">
                <div className="modal-content">
                    {topic}
                    {users}
                </div>
            </div>;
        }
    });

    return ChannelInfo;
});