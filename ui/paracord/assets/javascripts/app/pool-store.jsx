import terminal from 'app/lib/terminal-server';
import PoolActions from 'app/pool-actions';
import FeedActions from 'app/feed-actions';

export default Reflux.createStore({
    listenables: [ PoolActions ],

    init: function () {
        var self = this;
        self.queue = [ ];
        self.unique = { };
        self.db = crossfilter();
        self.db.byTime = self.db.dimension(d => { return d.when.valueOf(); });
        self.startSize = 0;
        self.pool = {
            size: function () {
                return self.db.size();
            },
            all: function () {
                return self.db.byTime.top(Infinity);
            },
            reset: function () {
                self.pool.id.filterAll();
                self.pool.when.filterAll();
                self.pool.type.filterAll();
                self.pool.channel.filterAll();
            },
            id: self.db.dimension(d => { return d.id; }),
            when: self.db.dimension(d => { return d.when; }),
            type: self.db.dimension(d => { return d.type; }),
            channel: self.db.dimension(d => { return d.channel; }),
        };
        self.pool.groupByTypes = self.pool.type.group(d => { return d; });
        self.pool.groupByChannels = self.pool.channel.group(d => { return d; });
    },

    getInitialState: function () {
        return this.pool;
    },

    onHistory: function () {
        // get two weeks worth of data
        var start = moment().subtract(14, 'days').toDate(),
            end = new Date();

        terminal.emit('request', {
            route: 'log/list',
            json: {
                startDate: start.toISOString(),
                endDate: end.toISOString()
            }
        });
    },

    checkMessage: function (message) { 
        // check for dupes
        if (this.unique[message.id]) return false;
        // return that this is a unique record
        this.unique[message.id] = true;
        return true;
    },

    onMessages: function (messages) {
        var self = this,
            added = messages.filter(message => { return self.checkMessage(message); });

        self.queue = self.queue.concat(added);
        PoolActions.queue();
    },

    onQueue: function () {
        var self = this,
            added = [ ];

        if (self.queueTimer) return;
        PoolActions.poolQueueStatus(self.queue.length);

        if (self.queue.length) {
            for (let i=0; i<1000 && i<self.queue.length; ++i) {
                added.push(self.queue.shift());
            }

        } else {
            self.trigger(self.pool);
            FeedActions.pool(self.pool);
        }

        if (added.length) {
            added.forEach(message => { message.when = moment(message.when); });
            self.db.add(added);
            self.queueTimer = setTimeout(() => {
                delete self.queueTimer;
                PoolActions.queue();
            }, 100);
        }
    }
});

function onUpstream (message) {
    PoolActions.message(message);
}

terminal.on('api', api => {
    if (api.indexOf('log/list') !== -1) {
        PoolActions.history();
    }
});

terminal.on('response', function (response) {
    if (response.channel !== 'success' ||
        response.type !== 'log/list') return;
    response.meta.forEach(onUpstream);
});

terminal.on('upstream', onUpstream);