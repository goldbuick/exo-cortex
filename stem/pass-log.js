
// LOG PASS

var r = require('rethinkdb'),
    toolkit = require('./toolkit/lib');

// create server 
var server = toolkit.createServer('pass-log');

// handle server start
server.created(function (http, port) {
    console.log('server started on', port);
});

// start server
server.start();
