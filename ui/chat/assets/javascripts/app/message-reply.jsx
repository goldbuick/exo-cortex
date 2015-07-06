define(function (require, exports, module) {
    'use strict';

    var ChannelStore = require('app/channel-store'),
        MessageActions = require('app/message-actions');
        
    var MessageReply = React.createClass({
        mixins: [
            Reflux.connect(ChannelStore, 'channel')
        ],

        userList: function () {
            if (this.props.server &&
                this.props.channel &&
                this.state.channel[this.props.server][this.props.channel] &&
                this.state.channel[this.props.server][this.props.channel].users) {

                return this.state.channel[this.props.server][this.props.channel].users;
            }
            return [ ];
        },
        
        stateKey: function (op) {
            return this.props.server + ':' + this.props.channel + ':' + op;
        },

        stateValue: function (op, value) {
            var key = this.stateKey(op);
            return this.state[key] || value;
        },

        wordsKey: function () {
            return this.stateKey('words');
        },

        inputKey: function () {
            return this.stateKey('input');
        },

        currentWord: function () {
            var front,
                input = this.refs.reply.getDOMNode(),
                index = input.selectionStart,
                words = input.value.split(' ');
            
            while (index > 0 && words.length) {
                front = words.shift();
                index -= front.length + 1;
            }

            return front;
        },

        replaceCurrentWord: function (value) {
            var input = this.refs.reply.getDOMNode(),
                index = input.selectionStart,
                words = input.value.split(' ');

            for (var i=0; i < words.length; ++i) {
                index -= (words[i].length + 1);
                if (index <= 0) {
                    words[i] = value + (i === 0 ? ': ' : '');
                    break;
                }
            }

            return words.join(' ');
        },

        wordList: function (word) {
            return this.userList().filter(function (user) {
                return user.toLowerCase().indexOf(word.toLowerCase()) !== -1;
            });
        },

        onChange: function (e) {
            var key = this.inputKey();
            e.preventDefault();
            this.state[key] = e.target.value;
            this.setState(this.state);
        },

        onKeyDown: function (e) {
            var inputKey = this.inputKey(),
                wordsKey = this.wordsKey(),
                input = this.state[inputKey],
                words = this.state[wordsKey];

            switch (e.which) {
                case 38: // up key
                    e.preventDefault();
                    if (words) {
                        if (words.index > 0) {
                            --words.index;
                            this.setState(this.state);
                        }
                    }
                    break;

                case 40: // down key
                    e.preventDefault();
                    if (words) {
                        if (words.index < words.list.length - 1) {
                            ++words.index;
                            this.setState(this.state);
                        }
                    }
                    break;

                case 37: // left key
                case 39: // right key
                    delete this.state[wordsKey];
                    this.setState(this.state);
                    break;

                case 13: // enter key
                    if (words) {
                        this.state[inputKey] = this.replaceCurrentWord(words.list[words.index]);
                        delete this.state[wordsKey];
                        this.setState(this.state);
                    } else {
                        MessageActions.reply(this.props.server, this.props.channel, input);
                        this.state[inputKey] = '';
                        this.setState(this.state);
                    }
                    break;
            }
        },

        onKeyUp: function (e) {
            var wordsKey = this.wordsKey(),
                words = this.state[wordsKey],
                word = this.currentWord();

            if (words) {
                if (word) {
                    words.word = word.substr(1);
                    words.list = this.wordList(words.word);

                } else {
                    delete this.state[wordsKey];

                }
                this.setState(this.state); 

            } else if (word && e.which === 50) {
                if (word[0] === '@') {
                    word = word.substr(1);
                    this.state[wordsKey] = {
                        word: word,
                        index: 0,
                        list: this.wordList(word)
                    };
                } else {
                    delete this.state[wordsKey];

                }
                this.setState(this.state); 
            }
        },

        onComplete: function (value, e) {
            var inputKey = this.inputKey(),
                wordsKey = this.wordsKey(),
                input = this.state[inputKey],
                words = this.state[wordsKey];

            e.preventDefault();
            if (words) {
                this.state[inputKey] = this.replaceCurrentWord(value);
                delete this.state[wordsKey];
                this.setState(this.state);
            }
        },

        render: function () {
            var wordsKey = this.wordsKey(),
                words = this.state[wordsKey],
                wordsUI = '';

            if (words &&
                words.list &&
                words.list.length) {
                wordsUI = <ul className="complete-list">
                    {words.list.map((user, index) => {
                        var style = (index === words.index) ?
                            'active' : 'collection-item';
                        return <li key={user} className={style}>
                            <a href="#!" onClick={this.onComplete.bind(this, user)}>{user}</a></li>;
                    })}
                </ul>;
            }

            return <div className="message-reply">
                {wordsUI}
                <div className="input-field">
                    <input type="text"
                        ref="reply"
                        value={this.stateValue('input', '')}
                        onChange={this.onChange}
                        onKeyDown={this.onKeyDown}
                        onKeyUp={this.onKeyUp} />
                </div>            
            </div>;
        }
    });

    return MessageReply;    
});