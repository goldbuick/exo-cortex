define(function (require, exports, module) {
    'use strict';

    var UIStore = require('app/uistore'),
        UIActions = require('app/uiactions'),
        IconStore = require('app/iconstore'),
        IconActions = require('app/iconactions'),
        MessageStore = require('app/messagestore');

    var MessageList = React.createClass({
        mixins: [
            Reflux.connect(UIStore, 'ui'),
            Reflux.connect(IconStore, 'icon'),
            Reflux.connectFilter(MessageStore, 'messages', function (messages) {
                return messages.filter(function (message) {
                    return message.server === this.state.ui.server &&
                           message.channel === this.state.ui.channel;
                }.bind(this));
            })
        ],

        // componentDidMount: function () {
        //     var node = this.getDOMNode();
        //     node.scrollTop = node.scrollHeight
        // },

        componentWillUpdate: function () {
            var node = document.body;
            this.shouldScrollBottom = node.scrollTop + node.offsetHeight === node.scrollHeight;
        },

        componentDidUpdate: function () {
            // if (this.shouldScrollBottom) {
                var node = document.body;
                node.scrollTop = node.scrollHeight;
            // }
        },

        messages: function () {
            var now = moment();
            return this.state.messages.map(function (message) {
                var when = moment(message.when);
                return {
                    id: message.id,
                    avi: this.state.icon[message.user],
                    user: message.user,
                    text: message.text,
                    ago: when.fromNow(),
                    when: when.format('hh:mm A'),
                    gap: now.diff(when, 'minutes')
                };
            }.bind(this));
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

                    IconActions.request(message.user);

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
                </tbody>
            </table>;
        }
    });

    return MessageList;
});