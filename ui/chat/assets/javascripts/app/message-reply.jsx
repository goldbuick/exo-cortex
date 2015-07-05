define(function (require, exports, module) {
    'use strict';

    var MessageActions = require('app/message-actions');

    var MessageReply = React.createClass({
        getInitialState: function () {
            return { };
        },
        
        getKey: function () {
            return this.props.server + ':' + this.props.channel;
        },

        getValue: function () {
            var key = this.getKey();
            return this.state[key] || '';
        },

        onChange: function (e) {
            var key = this.getKey();
            e.preventDefault();
            this.state[key] = e.target.value;
            this.setState(this.state);
        },

        onKeyDown: function (e) {
            var key = this.getKey();
            if (e.which !== 13) return;
            MessageActions.reply(this.props.server, this.props.channel, this.state[key]);
            this.state[key] = '';
            this.setState(this.state);
        },

        render: function () {
            // ref={inputRef}
            return <div className="message-reply">
                <div className="input-field">
                    <input type="text"
                        ref="reply"
                        value={this.getValue()}
                        onChange={this.onChange}
                        onKeyDown={this.onKeyDown} />
                </div>            
            </div>;
        }
    });

    return MessageReply;    
});