
// standard helper code to POST json data to a given url

var http = require('http');

module.exports = function(host, port, path, data, success, fail) {
	function writeError() {
		var error = Array.prototype.slice.call(arguments).join(' ');
		console.log('toolkit/httppost', error);
	}

	// convert to string
	var dataString = JSON.stringify(data);

	// request headers
	var headers = {
		'Content-Type': 'application/json',
		'Content-Length': dataString.length
	};

	// request config
	var options = {
		host: host || 'localhost',
		port: port || 80,
		path: path || '/',
		method: 'POST',
		headers: headers
	};

	// setup request
	var req = http.request(options, function (res) {
		var responseBody = '';

		function callbackError (message) {
			if (fail) fail(message);
		}

		res.on('data', function (chunk) {
			responseBody += chunk;
		});

		res.on('end', function() {
			try {
				var json = JSON.parse(responseBody);

				try {
					// invoke callback
					if (success) success(json);

				} catch (e) {
					callbackError([ e.message, e.fileName, e.lineNumber ].join('\n'));
				}

			} catch (e) {
				callbackError(['Invalid JSON', responseBody].join('\n'));
			}
		});
	});

	req.on('error', function (error) {
		writeError(JSON.stringify(options, null, '\t'), error, 'for data', JSON.stringify(data, null, '\t'));
	});

	// emit request
	req.write(dataString);
	req.end();
};