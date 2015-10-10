import PoolActions from 'app/pool-actions';
// import FeedActions from 'app/feed-actions';

export default Reflux.createStore({
    listenables: [
        // FeedActions,
        PoolActions
    ],

    init: function () {
        this.count = {
            pool: -1,
            feed: 0
        };
    },

    getInitialState: function () {
        return this.count;
    },

    onPoolQueueStatus: function (count) {
        this.count.pool = count;
        this.trigger(this.count);
    },

    onFeedQueueStatus: function (count) {
        this.count.feed = count;
        this.trigger(this.count);
    }

});