define(function (require, exports, module) {
    'use strict';

    var UIActions = require('app/ui-actions'),
        ChannelStore = require('app/channel-store'),
        MessageSparkline = require('app/message-sparkline');

    var ServerList = React.createClass({
        mixins: [
            Reflux.connect(ChannelStore, 'channels')
        ],

        viewChannel: function (channel, e) {
            e.preventDefault();
            UIActions.activeChannel(channel);
        },

        channels: function () {
            var _channels = this.state.channels[this.props.server];
            if (_channels === undefined) return [ ];
            return Object.keys(_channels);
        },

        render: function () {
            return <ul className="channel-nav flex-item">
                <li className="server valign-wrapper">
                    <h5 className="valign">{this.props.server}</h5></li>

                {this.channels().map((channel) => {
                    var active = (channel === this.props.channel),
                        liTagClass = active ? 'active' : '';

                    return <li key={'channel-' + channel} className={liTagClass}>
                        <MessageSparkline width="220"
                            server={this.props.server} channel={channel} />
                        <div className="selected"></div>
                        <a href="#!"
                            onClick={this.viewChannel.bind(this, channel)}>{channel}</a>
                    </li>;
                })}
            </ul>;
        }
    });

    return ServerList;
});