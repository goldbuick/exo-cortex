import FeedActions from 'app/feed-actions';
import FeedContainer from 'app/feed-container';

function test (feed) {
    feed.push(new FeedContainer({
        // this can now be in terms of crossfilter settings ...
        match: [{
            channel: 'irc',
            type: 'message'
        },{
            channel: 'xmpp',
            type: 'message'
        }]
    }));
}

export default Reflux.createStore({
    listenables: [ FeedActions ],

    init: function () {
        this.feed = [ ];
        test(this.feed);
    },

    getInitialState: function () {
        return this.feed;
    },

    onPool: function (pool) {
        console.log('onPool', pool.size());
    }

});
