define(function (require, exports, module) {
    'use strict';

    var ChannelStore = require('app/channel-store'),
        MessageActions = require('app/message-actions');

    var MessageReply = React.createClass({
        mixins: [
            Reflux.connect(ChannelStore, 'channel')
        ],
        
        getKey: function (op) {
            return this.props.server + ':' + this.props.channel + ':' + op;
        },

        getValue: function (op) {
            var key = this.getKey(op);
            return this.state[key] || '';
        },

        getCurrentWord: function (e) {
            var front,
                index = e.target.selectionStart,
                words = e.target.value.split(' ');
            
            while (index > 0 && words.length) {
                front = words.shift();
                index -= front.length + 1;
            }

            return front;
        },

        getTabList: function (word) {
            if (word &&
                this.props.server &&
                this.props.channel &&
                this.state.channel[this.props.server][this.props.channel] &&
                this.state.channel[this.props.server][this.props.channel].users) {

                var users = this.state.channel[this.props.server][this.props.channel].users;
                return users.filter(function (user) {
                    return user.toLowerCase().indexOf(word.toLowerCase()) === 0;
                });
            }

            return [ ];
        },

        onChange: function (e) {
            var key = this.getKey('input');
            e.preventDefault();
            this.state[key] = e.target.value;
            this.setState(this.state);
        },

        onKeyDown: function (e) {
            var inputKey = this.getKey('input'),
                tabKey = this.getKey('tab');

            switch (e.which) {
                case 38: // up key
                    e.preventDefault();
                    if (this.state[tabKey]) {
                        if (this.state[tabKey].index > 0) {
                            --this.state[tabKey].index;
                            this.setState(this.state);
                        }
                    }
                    break;

                case 40: // down key
                    e.preventDefault();
                    if (this.state[tabKey]) {
                        if (this.state[tabKey].index < this.state[tabKey].list.length - 1) {
                            ++this.state[tabKey].index;
                            this.setState(this.state);
                        }
                    }
                    break;

                case 37: // left key
                case 39: // right key
                    // e.preventDefault();
                    delete this.state[tabKey];
                    this.setState(this.state);
                    break;

                case 9: // tab key
                    e.preventDefault();
                    this.state[tabKey] = {
                        word: this.getCurrentWord(e),
                        index: 0,
                        list: [ ]
                    };
                    this.setState(this.state);
                    break;

                case 13: // enter key
                    MessageActions.reply(this.props.server, this.props.channel, this.state[inputKey]);
                    this.state[inputKey] = '';
                    this.setState(this.state);
                    break;
            }
        },

        onKeyUp: function (e) {
            var tabKey = this.getKey('tab');
            if (this.state[tabKey]) {
                this.state[tabKey].word = this.getCurrentWord(e);
                this.state[tabKey].list = this.getTabList(this.state[tabKey].word);
                this.setState(this.state); 
            }
        },

        render: function () {
            var tabKey = this.getKey('tab'),
                tabUI = '';

            if (this.state[tabKey] &&
                this.state[tabKey].list &&
                this.state[tabKey].list.length) {
                tabUI = <ul className="collection">
                    {this.state[tabKey].list.map((user, index) => {
                        var style = (index === this.state[tabKey].index) ?
                            'collection-item active' : 'collection-item';
                        return <li key={user} className={style}>{user}</li>;
                    })}
                </ul>;
            }

            console.log(this.state);

            // ref={inputRef}
            return <div className="message-reply">
                {tabUI}
                <div className="input-field">
                    <input type="text"
                        ref="reply"
                        value={this.getValue('input')}
                        onChange={this.onChange}
                        onKeyDown={this.onKeyDown}
                        onKeyUp={this.onKeyUp} />
                </div>            
            </div>;
        }
    });

    return MessageReply;    
});