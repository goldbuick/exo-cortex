
// PING API

var toolkit = require('./toolkit/lib');

// create server 
var server = toolkit.createServer('api-ping');

// create channel
var channel = server.createChannel('ping');

// globals
var gurls = { };

function gstart (args) {
    var url = args.url,
        value = gurls[url];
    
    if (value) {
        gurls[url].data = args.data;
        gurls[url].interval = args.interval;

    } else {
        gurls[url] = {
            type: args.type,
            post: server.parseUrl(url),
            timer: undefined,
            data: args.data || { },
            interval: args.interval
        };
        gping(url);
    }
}

function gstop (url) {
    var value = gurls[url];
    if (!value) return;

    clearTimeout(value.timer);
    delete gurls[url];
}

function gping (url) {
    var value = gurls[url];
    if (!value) return;

    server.post(value.post.host, value.post.port, value.post.path, value.data, function (response) {
        response.keeplog = true;
        console.log(value.type, url);
        channel.emit(value.type, response);
        gpingNext(url, value.interval);
    }, function (message) {
        console.log('fail', message);
        gpingNext(url, value.interval);
    });
}

function gpingNext (url, interval) {
    var value = gurls[url];
    if (!value) return;

    value.timer = setTimeout(function () {
        gping(url);
    }, interval * 60000);
}

// MESSAGES

// CONFIG

server.config('', function (type, value) {
    if (value.pings === undefined) value.pings = [ ];
});

server.config('/pings', function (type, value) {
    // no-op    
}, function (value) {
    if (!value || !value.length) return;

    // list of urls we care about
    var urls = value.map(function (o) { return o.url; });

    // list of current hosts
    var curls = Object.keys(gurls);

    // disconnect hosts we no longer care about
    curls.forEach(function (current) {
        if (urls.indexOf(current) == -1) gstop(current);
    });
});

server.config('/pings/[0-9]+', function (type, value) {
    if (type !== 'object') {
        return {
            type: '',
            url: '',
            interval: '',
            data: { }
        };
    }

}, function (value, before) {
    if (!value || !value.url || !value.interval) return;
    gstart(value);
});

// START

server.created(function (http, port) {
    console.log('server started on', port);
});

server.start();
