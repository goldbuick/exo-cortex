define(function (require, exports, module) {
    'use strict';

    var UIStore = require('app/ui-store'),
        UIActions = require('app/ui-actions'),
        IdentStore = require('app/ident-store'),
        IdentActions = require('app/ident-actions'),
        MessageStore = require('app/message-store'),
        ChannelActions = require('app/channel-actions'),
        ChannelStore = require('app/channel-store');

    var MessageList = React.createClass({
        mixins: [
            Reflux.connect(UIStore, 'ui'),
            Reflux.connect(IdentStore, 'ident'),
            Reflux.connect(ChannelStore, 'channel'),
            Reflux.connectFilter(MessageStore, 'messages', function (messages) {
                if (this.state) {
                    messages.reset();
                    messages.server.filterExact(this.state.ui.server);
                    messages.channel.filterExact(this.state.ui.channel);
                    return messages.minutes.top(256).sort(function (a, b) {
                        return a.minutes - b.minutes;
                    });
                }
                return [];
            })
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
                this.lastServer !== this.state.ui.server ||
                this.lastChannel !== this.state.ui.channel) {
                this.lastServer = this.state.ui.server;
                this.lastChannel = this.state.ui.channel;
                node.scrollTop = node.scrollHeight;
            }
        },

        messages: function () {
            var now = moment();
            return this.state.messages.map(function (message) {
                var when = moment(message.when);
                return {
                    id: message.id,
                    avi: this.state.ident[message.user],
                    user: message.user,
                    text: message.text,
                    ago: when.fromNow(),
                    when: when.format('hh:mm A'),
                    gap: now.diff(when, 'minutes')
                };
            }.bind(this));
        },

        onTopicToggle: function (e) {
            e.preventDefault();
            UIActions.channelInfoToggle();
        },

        topic: function () {
            if (!this.state.ui.server ||
                !this.state.ui.channel ||
                !this.state.channel[this.state.ui.server][this.state.ui.channel] ||
                !this.state.channel[this.state.ui.server][this.state.ui.channel].topic)
                return <tr key="topic">
                    <td className="avi"><div className="avi-wrapper">&nbsp;</div></td>
                    <td className="content"></td>
                </tr>;

            var topic = this.state.channel[this.state.ui.server][this.state.ui.channel].topic,
                topicClass = this.state.ui.channelInfo ? 'mdi-action-info small' :
                    'mdi-action-info-outline small';

            return <tr key="topic">
                <td className="avi first">
                    <div className="avi-wrapper">
                        <a href="#" onClick={this.onTopicToggle}>
                            <i className={topicClass}></i></a>
                    </div>
                </td>
                <td className="content first">
                    <div className="details">
                        <span className="name">Channel Topic</span>
                        <span className="when">set by {topic.user}</span>
                    </div>
                    <p className="text">{topic.text}</p>
                </td>
            </tr>;
        },

        onUserDM: function (user, e) {
            e.preventDefault();
            ChannelActions.joinChannel(this.state.ui.server, user);
        },

        users: function () {
            if (!this.state.ui.server ||
                !this.state.ui.channel ||
                !this.state.ui.channelInfo ||
                !this.state.channel[this.state.ui.server][this.state.ui.channel] ||
                !this.state.channel[this.state.ui.server][this.state.ui.channel].users)
                return <tr key="users">
                    <td className="avi"><div className="avi-wrapper">&nbsp;</div></td>
                    <td className="content"></td>
                </tr>;

            var users = this.state.channel[this.state.ui.server][this.state.ui.channel].users;
            return <tr key="users">
                <td className="avi"><div className="avi-wrapper">&nbsp;</div></td>
                <td className="content">
                    <ul>
                        {users.map((user) => {
                            return <li key={user}>
                                <a href="#" onClick={this.onUserDM.bind(this, user)}>{user}</a></li>;
                        })}
                    </ul>
                </td>
            </tr>;
        },

        render: function () {
            var lastUser = '',
                lastGap = 0;

            return <table className="message-list">
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

                    IdentActions.request(message.user);

                    if (first) {
                        return <tr key={message.id}>
                            <td className="avi first">
                                <div className="avi-wrapper"
                                    dangerouslySetInnerHTML={{__html: message.avi}}></div>
                            </td>
                            <td className="content first">
                                <div className="details">
                                    <span className="name">{message.user}</span>
                                    <span className="when">{message.when}</span>
                                    <span className="ago">{message.ago}</span>
                                </div>
                                <p className="text">{message.text}</p>
                            </td>
                        </tr>;
                    }

                    return <tr key={message.id}>
                        <td className="avi">
                            <div className="avi-wrapper">&nbsp;</div>
                        </td>
                        <td className="content">
                            <p className="text">{message.text}</p>
                        </td>
                    </tr>;
                })}
                {this.topic()}
                {this.users()}
                <tr key="input" className="input">
                    <td></td><td></td>
                </tr>
                </tbody>
            </table>;
        }
    });

    return MessageList;
});