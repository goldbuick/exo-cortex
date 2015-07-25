define(function (require, exports, module) {
    'use strict';

    var MessageStore = require('app/message-store'),
        Sparkline = require('app/lib/sparkline');

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

        process: function () {
            // get target
            var spark = this.queue.shift();
            // longer pending
            delete this.timer;
            delete this.pending[spark.sparkid];
            // generate graph
            spark.sparkline();
            // process next graph
            this.next();
        },

        delay: function () {
            // pause between processing 
            this.timer = setTimeout(this.process.bind(this), 100);
        },

        next: function () {
            // timeout pending, no work to do
            if (this.timer || this.queue.length === 0) return;
            // process next spark only when tab is in focus
            this.timer = window.requestAnimationFrame(this.delay.bind(this));
        },
    };

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
            return $(this.getDOMNode());
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

            var model = [ ];
            while (start >= 0) {
                model.push(ago[start] || 0);
                --start;
            }

            return model;
        },

        sparkline: function () {
            var dom = this.chartDOM(),
                model = this.volumeData();
            dom.html(Sparkline(this.props.width, this.props.height, 4, model, !this.drawn));
            this.drawn = true;
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
        },

        render: function () {
            return <div className="sparkline"></div>;
        }
    });

    return MessageSparkline;
});