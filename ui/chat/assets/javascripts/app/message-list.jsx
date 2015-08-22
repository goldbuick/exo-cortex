define(function (require, exports, module) {
    'use strict';

    var UIActions = require('app/ui-actions'),
        IdentStore = require('app/lib/ident-store'),
        IdentActions = require('app/lib/ident-actions'),
        MessageStore = require('app/message-store'),
        RoomActions = require('app/room-actions'),
        RoomStore = require('app/room-store'),
        UserStore = require('app/user-store');

    var MessageList = React.createClass({
        mixins: [
            Reflux.connect(UserStore, 'users'),
            Reflux.connect(RoomStore, 'rooms'),
            Reflux.connect(IdentStore, 'ident'),
            Reflux.connect(MessageStore, 'messages')
        ],

        componentWillUpdate: function () {
            var node = document.body,
                height = node.offsetHeight,
                offset = height - node.scrollTop;
            this.shouldScrollBottom = (offset === window.innerHeight || height < window.innerHeight);
        },

        componentDidUpdate: function () {
            var node = document.body;
            if (this.shouldScrollBottom ||
                this.lastServer !== this.props.server ||
                this.lastRoom !== this.props.room) {
                this.lastServer = this.props.server;
                this.lastRoom = this.props.room;
                node.scrollTop = node.scrollHeight;
            }
        },

        messages: function () {
            var now = moment(),
                list = this.state.messages;

            list.reset();
            list.server.filterExact(this.props.server);
            list.room.filterExact(this.props.room);
            return list.minutes.top(256).sort(function (a, b) {
                return a.minutes - b.minutes;

            }).map(function (message) {
                var when = moment(message.when),
                    user = this.state.users.find(message.origin, message.server, message.user);

                return {
                    origin: message.origin,
                    server: message.server,
                    id: message.id,
                    avi: this.state.ident[message.user],
                    user: message.user,
                    name: (user && user.info.name) ? user.info.name : message.user,
                    text: message.text,
                    ago: when.fromNow(),
                    when: when.format('hh:mm A'),
                    gap: now.diff(when, 'minutes')
                };

            }.bind(this));
        },

        onUserDM: function (user, e) {
            e.preventDefault();
            RoomActions.join([this.props.origin, this.props.server, user], {
                origin: this.props.origin,
                server: this.props.server,
                room: user
            });
            UIActions.activeRoom(this.props.origin, this.props.server, user);
        },

        render: function () {
            var lastGap = 0,
                lastUser = '';

            var result = <table className="message-list">
                <tbody>
                {this.messages().map((message) => {
                    var first = false,
                        gap = Math.abs(message.gap - lastGap);

                    if (lastUser !== message.user) {
                        first = true;
                        lastUser = message.user;
                    }
                    if (gap > 30) {
                        first = true;
                        lastGap = message.gap;
                    }

                    var lookup = [ message.origin, message.server, message.user ].join(':');
                    IdentActions.request(lookup, message.user);

                    if (first) {
                        return <tr key={message.id}>
                            <td className="avi first"
                                dangerouslySetInnerHTML={{__html: message.avi}}></td>
                            <td className="content first">
                                <div className="details">
                                    <a className="name" href="#!"
                                        onClick={this.onUserDM.bind(this, message.user)}>{message.name}</a>
                                    <span className="when">{message.when}</span>
                                    <span className="ago">{message.ago}</span>
                                </div>
                                <p className="text">{message.text}</p>
                            </td>
                        </tr>;
                    }

                    return <tr key={message.id}>
                        <td className="avi"></td>
                        <td className="content">
                            <p className="text">{message.text}</p>
                        </td>
                    </tr>;
                })}
                <tr key="input" className="input">
                    <td></td><td></td>
                </tr>
                </tbody>
            </table>;

            return result;
        }
    });

    return MessageList;
});