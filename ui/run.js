#!/usr/local/bin/node

// spawn helper

var spawn = require('child_process').spawn;
function exec (cwd) {
    var ls = spawn('make', [ 'start' ], {
        cwd: __dirname + cwd
    });

    ls.stdout.on('data', function (data) {
        console.log(cwd, data.toString());
    });

    ls.stderr.on('data', function (data) {
        console.log(cwd, data.toString());
    });

    ls.on('exit', function (code) {
        console.log(cwd, 'exited with code ' + code);
    });
}

// start ui servers
var ui = [
    '/config',
    '/chat',
    '/paracord'
];

function next() {
    if (ui.length === 0) return;

    var path = ui.shift();
    console.log('running', path);
    exec(path);

    // trigger next
    setTimeout(next, 3000);
}

// start ui
next();
