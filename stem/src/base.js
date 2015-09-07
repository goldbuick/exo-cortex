
// run two base nodes

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

// start base stem node servers
var stem = [
    [ './src/config-server', '--rethinkdb', 'rethinkdb:28015' ],
    [ './src/terminal-server', '--control', 'localhost:7154' ]
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
