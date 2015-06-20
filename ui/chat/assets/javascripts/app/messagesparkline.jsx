define(function (require, exports, module) {
    'use strict';

    var MessageStore = require('app/messagestore');

    var MessageSparkline = React.createClass({
        mixins: [
            Reflux.connectFilter(MessageStore, 'messages', function (messages) {
                return messages.filter(function (message) {
                    if (this.props.channel) {
                        return message.server === this.props.server &&
                               message.channel === this.props.channel;
                    }
                    if (this.props.server) {
                        return message.server === this.props.server;
                    }
                    return true;
                }.bind(this));
            })
        ],

        messages: function () {
            var now = moment(),
                minutes = { };

            this.state.messages.forEach(function (message) {
                var ago = now.diff(message.when, 'minutes');
                ago = Math.floor(ago * 0.02);
                minutes[ago] = (minutes[ago] || 0) + 1;
            });

            var range = Object.keys(minutes).map(function (ago) {
                return parseFloat(ago);
            });
            if (!range.length) return [{ x: 0, y: 0 }, { x: 1, y: 0 }];

            range.sort(function (a, b) {
                return a - b;
            });

            var x = 0,
                data = [ ],
                start = 0,
                stop = range[range.length - 1];

            for (var ago=start; ago <= stop; ++ago) {
                data.push({
                    x: ++x,
                    y: minutes[ago] || 0
                });
            }

            if (data.length === 1) {
                data.push({
                    x: data[0].x + 1,
                    y: data[0].y
                });
            }

            return data;
        },

        sparkline: function () {
            var data = this.messages(),
                dom = this.getDOMNode(),
                color = this.props.color,
                width = this.props.width;
                
            nv.addGraph({
                generate: function() {
                    var chart = nv.models.sparkline()
                        .width(width)
                        .height(15);

                    d3.select(dom)
                        .datum(data)
                        .call(chart);

                    return chart;
                }
            });            
        },

        componentDidMount: function () {
            clearTimeout(this.trigger);
            this.trigger = setTimeout(this.sparkline, 500);
        },

        componentDidUpdate: function () {
            clearTimeout(this.trigger);
            this.trigger = setTimeout(this.sparkline, 500);
        },

        render: function () {
            return <svg className="sparkline"></svg>;
        }
    });

    return MessageSparkline;
});