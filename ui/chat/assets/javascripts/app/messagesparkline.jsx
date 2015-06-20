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

            // 24 hours in minutes
            var scale = 0.05,
                range = 1440;

            this.state.messages.forEach(function (message) {
                var ago = now.diff(message.when, 'minutes');
                ago = Math.floor(ago * scale);
                minutes[ago] = (minutes[ago] || 0) + 1;
            });

            var x = 0,
                start = 0,
                data = [ ],
                stop = Math.floor(range * scale);

            for (var ago=stop; ago >= start; --ago) {
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

        model: function () {
            var color = this.props.color,
                width = this.props.width;
            if (!this.chartModel) {
                this.chartModel = nv.models.sparkline()
                    .width(width)
                    .height(15);
            }
            return this.chartModel;
        },

        vis: function () {
            var dom = this.getDOMNode();
            if (!this.chartVis) {
                this.chartVis = d3.select(dom);
            }
            return this.chartVis;
        },

        sparkline: function (update) {
            var vis = this.vis(),
                model = this.model(),
                data = this.messages();

            vis.datum(data)
                .call(model);
        },

        componentDidMount: function () {
            clearTimeout(this.trigger);
            this.trigger = setTimeout(this.sparkline, 100);
        },

        componentDidUpdate: function (update) {
            clearTimeout(this.trigger);
            this.trigger = setTimeout(this.sparkline, 100);
        },

        render: function () {
            return <svg className="sparkline"></svg>;
        }
    });

    return MessageSparkline;
});