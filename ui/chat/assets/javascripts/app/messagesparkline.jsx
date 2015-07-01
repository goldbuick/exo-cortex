define(function (require, exports, module) {
    'use strict';

    var MessageStore = require('app/messagestore');

    var MessageSparkline = React.createClass({
        mixins: [
            Reflux.connectFilter(MessageStore, 'messages', function (messages) {
                messages.reset();
                if (this.props.server) {
                    messages.server.filterExact(this.props.server);
                }
                if (this.props.channel) {
                    messages.channel.filterExact(this.props.channel);
                }
                return messages.groupByMinutes.all().map(function (d) {
                    return {
                        key: d.key,
                        value: d.value
                    };
                });
            })
        ],

        volumeData: function () {
            var scale = 30,
                now = Math.floor(Math.floor(moment().unix() / 60) / scale),
                ago = { };
            
            this.state.messages.forEach(function (d) {
                ago[now - d.key] = d.value;
            });

            var model = [ 'data1' ],
                start = Math.floor(1440 / scale);
            while (start >= 0) {
                model.push(ago[start] || 0);
                --start;
            }

            return model;
        },

        sparkline: function (update) {
            var model = this.volumeData();
            if (!this.chart) {
                this.chart = c3.generate({
                    bindto: $(this.getDOMNode()).find('.chart')[0],
                    size: {
                        width: this.props.width,
                        height: 20
                    },
                    data: {
                        columns: [ model ],
                        colors: { data1: '#fff' },
                        types: { data1: 'area-step' }
                    },
                    axis: {
                        x: { show: false },
                        y: { show: false }
                    },
                    point: { show: false },
                    tooltip: { show: false },
                    legend: { show: false }
                });

            } else {
                this.chart.load({
                    columns: [ model ]
                });
            }
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
            return <div className="sparkline"><div className="chart"></div></div>;
        }
    });

    return MessageSparkline;
});