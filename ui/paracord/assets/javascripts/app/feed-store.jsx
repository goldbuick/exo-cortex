import FeedActions from 'app/feed-actions';
import FeedContainer from 'app/feed-container';
import ConstructActions from 'app/construct-actions';

function test (feed) {

    feed.chat = new FeedContainer({
        match: [
            { channel: 'irc', type: 'message' },
            { channel: 'xmpp', type: 'message' },
        ],
        extract: {
            id: '$id',
            when: '$when',
            channel: '$channel',
            meta: {
                servers: {
                    '$server': {
                        '$room': {
                            text: '$text',
                            user: '$user'
                        }
                    }
                }
            }
        },
        format: {
            id: 'd.id',
            origin: 'd.channel',
            server: 'd.server',
            when: 'd.when',
            room: 'd.room',
            text: 'd.text',
            user: 'd.user'
        },
        dimensions: {
            server: 'd.server',
            minutes: 'Math.round(d.when.valueOf() / 60000)',            
        },
        groups: {
            server: [ 'server', 'd' ],
            byMinutes: [ 'minutes', 'Math.round(d / 5)' ]        
        }
    });
}

export default Reflux.createStore({
    listenables: [ FeedActions ],

    init: function () {
        this.feed = { };
        test(this.feed);
    },

    getInitialState: function () {
        return this.feed;
    },

    onPool: function (pool) {
        var self = this,
            updated = false;

        Object.keys(self.feed).forEach(name => {
            if (self.feed[name].add(pool)) updated = true;
        });

        if (updated) ConstructActions.feed(self.feed);
    }

});
