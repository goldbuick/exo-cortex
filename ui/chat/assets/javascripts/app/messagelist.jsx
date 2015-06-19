define(function (require, exports, module) {
    'use strict';

    var UIStore = require('app/uistore'),
        UIActions = require('app/uiactions'),
        MessageStore = require('app/messagestore');

    var MessageList = React.createClass({
        mixins: [
            Reflux.connect(UIStore, 'ui'),
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
            return this.state.messages.map(function (message) {
                var when = moment(message.when);
                return {
                    avi: 'avi',
                    user: message.user,
                    text: message.text,
                    ago: when.fromNow(),
                    when: when.format('hh:mm A')
                };
            });
        },

        render: function () {
            var lastUser = '',
                lastTime = '';

            return <table className="message-list">
                <tbody>
                {this.messages().map((message) => {
                    return <tr key={message.id}>
                        <td className="avi"
                            dangerouslySetInnerHTML={{__html: message.avi}}></td>
                        <td className="content">
                            <div className="details">
                                <span className="name">{message.user}</span>
                                <span className="when">{message.when}</span>
                                <span className="ago">{message.ago}</span>
                            </div>
                            <div className="text">{message.text}</div>
                        </td>
                    </tr>;
                })}
                </tbody>
            </table>;
        }
    });

    return MessageList;
});