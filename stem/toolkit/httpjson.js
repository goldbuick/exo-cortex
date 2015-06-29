
// standard helper code to listen for incoming POST with json data

var http = require('http');

module.exports = function(fn) {

    function writeError(res, code, error) {
        console.log('toolkit/httpjson', error);
        res.writeHead(code, error, {
            'Content-Type': 'text/html',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': 'true',
            'Access-Control-Allow-Methods': 'GET, POST'
        });
        res.end('');
    }

    function writeResponse(req, res, json) {
        console.log('writeResponse 1', req.url, json);
        // invoke callback
        fn(req, json, function (result) {
            console.log('writeResponse 2');
            if (result === undefined) {
                result = { success: true };
            }

            res.writeHead(200, {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': 'true',
                'Access-Control-Allow-Methods': 'GET, POST'
            });
            
            console.log('writeResponse 3', JSON.stringify(result));
            res.end(JSON.stringify(result));
        });
    }

    function postHandler(req, res) {
        console.log('postHandler', req.url);
        var requestBody = '';

        req.on('data', function(data) {
            console.log('postHandler data', data);
            requestBody += data;
            if (requestBody.length > 1e7) {
                writeError(res, 413, 'Request Entity Too Large');
            }
        });

        req.on('end', function() {
            console.log('toolkit/httpjson', requestBody);
            try {
                var json = JSON.parse(requestBody);

                try {
                    // invoke callback
                    writeResponse(req, res, json);

                } catch (e) {
                    writeError(res, 400, [ e.message, e.fileName, e.lineNumber, requestBody ].join('\n'));
                }

            } catch (e) {
                writeError(res, 400, 'Expected Valid JSON:\n' + requestBody);
            }
        });
    }

    function getHandler(req, res) {
        console.log('getHandler', req.url);
        try {
            // invoke callback
            writeResponse(req, res, undefined);

        } catch (e) {
            writeError(res, 400, e);

        }   
    }

    function handler(req, res) {
        console.log('handler', req.method, req.url);
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
