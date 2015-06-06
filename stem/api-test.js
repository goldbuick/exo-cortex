
// TEST API

var toolkit = require('./toolkit/lib');

// create server 
var server = toolkit.createServer('api-test');

// create channel
var channel = server.channel('test');

channel.message('world', function (message) {
	// discovery
	if (!message) {
		return {
			text: 'simple test text'
		};
	}

	console.log('world', message.text);
});

// handle server start
server.created(function (http, port) {
	console.log('server started on', port);
});

// start server
server.start();
