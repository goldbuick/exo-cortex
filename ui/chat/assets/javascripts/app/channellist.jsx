define(function (require, exports, module) {
    'use strict';

    var UIStore = require('app/uistore'),
        UIActions = require('app/uiactions'),
        ChannelStore = require('app/channelstore');

    var ServerList = React.createClass({
        mixins: [
            Reflux.connect(UIStore, 'ui'),
            Reflux.connect(ChannelStore, 'channel')
        ],

        channels: function () {
            var _channels = this.state.channel[this.state.ui.server];
            if (_channels === undefined) return [ ];
            return Object.keys(_channels);
        },

        viewChannel: function (channel, e) {
            e.preventDefault();
            UIActions.activeChannel(channel);
        },

        render: function () {
            return <ul className="channel-nav flex-item">
                <li className="server">{this.state.ui.server}</li>
                {this.channels().map((channel) => {
                    var active = (channel === this.state.ui.channel),
                        liTagClass = active ? 'active' : '';

                    return <li key={'channel-' + channel} className={liTagClass}><a href="#!"
                        onClick={this.viewChannel.bind(this, channel)}>{channel}</a></li>;
                })}
            </ul>;
        }
    });

    return ServerList;
});