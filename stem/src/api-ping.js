
// PING API

var toolkit = require('./toolkit/lib');

// create server 
var server = toolkit.createServer('api-ping');

// create channel
var channel = server.createChannel('ping');

// handle server start
server.created(function (http, port) {
    console.log('server started on', port);
});

// start server
server.start();
