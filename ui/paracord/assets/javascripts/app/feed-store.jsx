import terminal from 'app/lib/terminal-server';
import FeedActions from 'app/feed-actions';
import FeedMatch from 'app/feed-match';
import FeedExtract from 'app/feed-extract';
import FeedContainer from 'app/feed-container';

function test (feed) {
    feed.matches.push(new FeedMatch([{
        type: 'message',
        channel: 'irc'
    },{
        type: 'message',
        channel: 'xmpp'
    }], [ 'chat' ]));

    feed.extractors.chat = new FeedExtract({
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
    }, [ 'chat' ]);

    feed.containers.chat = new FeedContainer({
        // format
        id: 'd.id',
        origin: 'd.channel',
        server: 'd.server',
        when: 'moment(d.when)',
        room: 'd.room',
        text: 'd.text',
        user: 'd.user'
    },{
        // meta data capture
        // when: 'd.when.format("dddd, MMMM Do YYYY, h:mm:ss a")'
    }, {
        // crossfilter dimensions
        server: 'd.server',
        minutes: 'd.when.valueOf() / 60000',
    }, {
        // dimension groups
        server: [ 'server', 'd' ],
        halfHour: [ 'minutes', 'Math.floor(d / 30)' ]
    });
}

export default Reflux.createStore({
    listenables: [ FeedActions ],

    init: function () {
        this.unique = { };
        this.feed = {
            matches: [ ],
            extractors: { },
            containers: { }
        };
        test(this.feed);
    },

    getInitialState: function () {
        return this.feed;
    },

    onHistory: function () {
        var end = new Date(),
            start = new Date();
        start.setDate(start.getDate() - 7);

        terminal.emit('request', {
            route: 'log/list',
            json: {
                startDate: start.toISOString(),
                endDate: end.toISOString()
            }
        });
    },

    mapRecord: function (upstream, record) {
        var self = this,
            container = self.feed.containers[upstream];
        if (!container) return;

        container.map(record);
    },

    extractRecord: function (upstream, message) {
        var self = this,
            mapping = self.feed.extractors[upstream];
        if (!mapping) return;

        mapping.extract(message).forEach(record => {
            mapping.upstream.forEach(name => {
                self.mapRecord(name, record);
            });
        });
    },

    matchMessage: function (message) {
        var self = this;
        self.feed.matches.forEach(rule => {
            if (rule.match(message)) {
                rule.upstream.forEach(name => {
                    self.extractRecord(name, message);
                });
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
            added = messages.filter(message => {
                return self.checkMessage(message);
            });

        added.forEach(message => {
            self.matchMessage(message);
        });

        if (added.length) self.trigger(self.feed);
    }
});

function onUpstream (message) {
    FeedActions.message(message);
}

terminal.on('api', api => {
    if (api.indexOf('log/list') !== -1) {
        FeedActions.history();
    }
});

terminal.on('response', function (response) {
    if (response.channel !== 'success' ||
        response.type !== 'log/list') return;
    response.meta.forEach(onUpstream);
});

terminal.on('upstream', onUpstream);
