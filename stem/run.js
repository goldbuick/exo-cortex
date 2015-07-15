#!/usr/local/bin/node

// spawn helper

var spawn = require('child_process').spawn;
function exec (cmd, args) {
    var ls = spawn(cmd, args);

    ls.stdout.on('data', function (data) {
        console.log(args[0], data.toString());
    });

    ls.stderr.on('data', function (data) {
        console.log(args[0], data.toString());
    });

    ls.on('exit', function (code) {
        console.log(args[0], 'exited with code ' + code);
    });
}

// tell nodes where to find the config-server
function node (run) {
    return [ run, '--control', 'localhost:7154' ];
}

// start stem node servers
var stem = [
    [ './config-server', '--rethinkdb', '192.168.59.103:28015' ],
    node('./terminal-server'),
    node('./pass-log'),
    node('./pass-chat'),
    node('./api-irc'),
    node('./api-ident'),
];

function next() {
    if (stem.length === 0) return;

    var args = stem.shift();
    console.log('running', args);
    exec('node', args);

    // trigger next
    setTimeout(next, 3000);
}

// start stem
next();
