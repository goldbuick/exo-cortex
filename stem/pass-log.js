
// LOG PASS

var r = require('rethinkdb'),
    toolkit = require('./toolkit/lib');

// create server 
var server = toolkit.createServer('pass-log');

// start server
server.start();
