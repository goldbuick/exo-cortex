
// LOG PASS

var r = require('rethinkdb'),
    toolkit = require('./toolkit/lib'),
    rethinkdb = require('./toolkit/rethinkdb');

// create server 
var server = toolkit.createServer('pass-log'),
    db = rethinkdb.create('exo', 'logs');

// create channel
var channel = server.createChannel('log');

channel.message('list', function (message, finish) {
    // discovery
    if (!message) {
        return finish({
            startDate: 'when to start the list',
            endDate: 'when to end the list'
        });
    }

    if (!db.conn) return finish([]);

    // query events
    var q = db.q().between(
        message.startDate,
        message.endDate,
        { index: 'when' }
    ).orderBy('when');

    db.run(q, function (err, cursor) {
        if (db.check(err)) return;

        var result = [ ];
        cursor.each(function (err, event) {
            if (db.check(err)) return;
            result.push(event);

        }, function() {
            // transmit result
            finish(result);
        });
    });
});

// catch all event handler
server.any(function (url, json) {
    if (url !== '/upstream' || !json || !db.conn) return;

    // only log qualified events
    if (json.meta && json.meta.keeplog !== true) return;

    // log all non-repeat events
    db.run(db.q().insert(json), function (err) {
        db.check(err);
    });
});

// write configuration validators
server.config('', function (type, value) {
    if (value.rethinkdb === undefined) {
        value.rethinkdb = {
            host: '',
            port: ''
        };
    }
});

server.config('/rethinkdb', function (type, value) {
    if (type !== 'object') return {
        host: '',
        port: ''
    };

}, function (value) {
    if (!value || !value.host || !value.port) return;

    console.log('connect to', value.host, value.port);
    db.ready(function () {
        db.run(db.q().indexCreate('when'), function (err) {
            if (db.check(err)) return;
            console.log('index created for when');
        });
    });
    db.connect(value.host, value.port);
});

// handle server start
server.created(function (http, port) {
    console.log('server started on', port);
});

// start server
server.start();
