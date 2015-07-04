define(function (require, exports, module) {
    'use strict';

    var MessageStore = require('app/message-store');

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
            var ago = { },
                sinceEpoch = new Date().getTime(),
                minutesToday = Math.floor((24 * 60) / MessageStore.scale),
                now = Math.floor(Math.floor(sinceEpoch / MessageStore.scale),
            
            this.state.messages.forEach(function (d) {
                ago[now - d.key] = d.value;
            });

            var model = [ 'data1' ];
            while (start >= 0) {
                model.push(ago[start] || 0);
                --start;
            }

            return model;
        },

        sparkline: function (dom) {
            var model = this.volumeData();
            if (!this.chart) {
                this.chart = c3.generate({
                    bindto: dom,
                    size: {
                        width: this.props.width,
                        height: 20
                    },
                    data: {
                        columns: [ model ],
                        colors: { data1: '#fff' },
                        types: { data1: 'area' }
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

        chartDOM: function () {
            return $(this.getDOMNode()).find('.chart')[0];
        },

        componentDidMount: function () {
            this.sparkline(this.chartDOM());
        },

        componentDidUpdate: function (update) {
            this.sparkline(this.chartDOM());
        },

        render: function () {
            return <div className="sparkline"><div className="chart"></div></div>;
        }
    });

    return MessageSparkline;
});