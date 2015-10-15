import FeedActions from 'app/feed-actions';
import FeedContainer from 'app/feed-container';

function test (feed) {

    feed.push(new FeedContainer({
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
        this.feed.forEach(container => {
            container.add(pool);
        });
    }

});
