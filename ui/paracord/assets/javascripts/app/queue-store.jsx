import FeedActions from 'app/feed-actions';

export default Reflux.createStore({
    listenables: [ FeedActions ],

    init: function () {
        this.count = 0;
    },

    getInitialState: function () {
        return this.count;
    },

    onQueueStatus: function (count) {
        this.count = count;
        this.trigger(this.count);
    }

});