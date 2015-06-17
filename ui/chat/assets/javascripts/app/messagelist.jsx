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

        messages: function () {
            return this.state.messages;
        },

        render: function () {
            return <ul className="collection">
                {this.messages().map((message) => {

                    return <li key={message.id} className="collection-item">{message.user}: {message.text}</li>
                })}
            </ul>;
        }
    });

    return MessageList;
});