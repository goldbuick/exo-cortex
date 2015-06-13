
// standard helper code to listen for incoming POST with json data

var http = require('http');

module.exports = function(fn) {

	function writeError(res, code, error) {
		console.log('toolkit/httpjson', error);
		res.writeHead(code, error, {'Content-Type': 'text/html'});
		res.end('');
	}

	function postHandler(req, res) {
		var requestBody = '';

		req.on('data', function(data) {
			requestBody += data;
			if (requestBody.length > 1e7) {
				writeError(res, 413, 'Request Entity Too Large');
			}
		});

		req.on('end', function() {
			try {
				console.log('toolkit/httpjson', requestBody);
				var json = JSON.parse(requestBody);

				try {
					// invoke callback
					var result = fn(req.url, json);
					if (result === undefined) {
						result = { success: true };
					}

					res.writeHead(200, {
						'Content-Type': 'application/json',
						'Access-Control-Allow-Origin': '*'
					});
					res.end(JSON.stringify(result));

				} catch (e) {
					writeError(res, 400, [ e.message, e.fileName, e.lineNumber, requestBody ].join('\n'));
				}

			} catch (e) {
				writeError(res, 400, 'Expected Valid JSON:\n' + requestBody);
			}
		});
	}

	function getHandler(req, res) {
		try {
			// invoke callback
			var format = fn(req.url, undefined);
			res.writeHead(200, {
				'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': '*'
			});
			res.end(JSON.stringify(format));

		} catch (e) {
			writeError(res, 400, e);

		}	
	}

	function handler(req, res) {
		if (req.method === 'POST') {
			postHandler(req, res);

		} else if (req.method === 'GET') {
			getHandler(req, res);

		} else {
			writeError(res, 405, 'Method Not Supported');

		}
	}

	return http.createServer(handler);
};
