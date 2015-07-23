define(function (require, exports, module) {
    'use strict';

    var MessageStore = require('app/message-store');

    // we build an update queue system to roll out sparkline updates
    // since it's a heavy operation

    var Spark = {
        sparkid: 1,
        queue: [ ],
        pending: { },

        start: function (spark) {
            spark.sparkid = ++this.sparkid;
        },

        update: function (spark) {
            // already pending
            if (this.pending[spark.sparkid]) return;
            // not pending
            this.queue.push(spark);
            this.pending[spark.sparkid] = true;
            // trigger processing
            this.next();
        },

        stop: function (spark) {
            // not pending
            if (!this.pending[spark.sparkid]) return;
            // filter queue
            this.queue = this.queue.filter(function (_spark) {
                return _spark.sparkid !== spark.sparkid;
            });
            // no longer pending
            delete this.pending[spark.sparkid];
        },

        next: function () {
            // timeout pending, no work to do
            if (this.timer || this.queue.length === 0) return;
            // process next spark
            this.timer = setTimeout(function () {
                // get target
                var spark = this.queue.shift();
                // longer pending
                delete this.timer;
                delete this.pending[spark.sparkid];
                // generate graph
                spark.sparkline(!spark.chart);
                // process next graph
                this.next();
            }.bind(this), 100);
        },
    };

    function getStyleRuleValue(selector, style) {
        var sheets = document.styleSheets;
        for (var i = 0, l = sheets.length; i < l; i++) {
            var sheet = sheets[i];
            if (!sheet.cssRules) continue;

            for (var j = 0, k = sheet.cssRules.length; j < k; j++) {
                var rule = sheet.cssRules[j];
                if (rule.selectorText && rule.selectorText.split(',').indexOf(selector) !== -1) {
                    return rule.style[style];
                }
            }
        }
        return null;
    }

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

        chartDOM: function () {
            return $(this.getDOMNode()).find('.chart')[0];
        },

        volumeData: function () {
            var ago = { },
                sinceEpoch = Math.floor(new Date().getTime() / MessageStore.toMinutes),
                now = Math.floor(sinceEpoch / MessageStore.groupScale),
                start = Math.floor((24 * 60) / MessageStore.groupScale);
            
            this.state.messages.forEach(function (d) {
                var delta = now - d.key;
                ago[delta] = d.value;
            });

            var model = [ 'data1' ];
            while (start >= 0) {
                model.push(ago[start] || 0);
                --start;
            }

            return model;
        },

        sparkline: function (empty) {
            var dom = this.chartDOM(),
                model = empty ? [ 'data1', 0, 0 ] : this.volumeData(),
                rule = getStyleRuleValue('.fg-color', 'color');

            if (!this.chart) {
                this.chart = c3.generate({
                    bindto: dom,
                    size: {
                        width: this.props.width,
                        height: 20
                    },
                    data: {
                        columns: [ model ],
                        colors: { data1: rule || '#000' },
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

        componentDidMount: function () {
            // prep for updates
            Spark.start(this);
            // add to update queue
            Spark.update(this);
        },

        componentDidUpdate: function () {
            // add to update queue
            Spark.update(this);
        },

        componentWillUnmount: function () {
            // make to clear if pending update
            Spark.stop(this);
            // remove chart class & dom
            if (this.chart) {
                this.chart.destroy();
                this.chart = undefined;
            }
        },

        render: function () {
            return <div className="sparkline"><div className="chart"></div></div>;
        }
    });

    return MessageSparkline;
});