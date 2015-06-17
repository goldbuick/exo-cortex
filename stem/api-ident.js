
// IDENTICON API

var Alea = require('alea'),
    crypto = require('crypto'),
    svg = require('./toolkit/svg'),
    toolkit = require('./toolkit/lib');

// create server 
var server = toolkit.createServer('api-ident');

// create channel
var channel = server.createChannel('ident');

function cube (rnd, x, y, side, stroke) {
    var left = x - side,
        top = y - side,
        right = x + side,
        bottom = y + side,
        upper = y - (side * 0.5),
        lower = y + (side * 0.5);

    var color = Math.floor(256 * rnd());

    var lattr = {
        'stroke': 'white',
        'stroke-width': stroke
    };

    var parts = [ ];

    // base
    parts.push(svg.polygon([
        left, upper,
        x, top,
        right, upper,
        right, lower,
        x, bottom,
        left, lower
    ], {
        'fill': svg._('rgba(',color,',',color,',',color,',1)')
    }));

    var threshold = 0.35;
    if (rnd() > threshold) parts.push(svg.line(x, y, left, upper, lattr));
    if (rnd() > threshold) parts.push(svg.line(x, y, right, upper, lattr));
    if (rnd() > threshold) parts.push(svg.line(x, y, x, bottom, lattr));

    return svg._(parts);
}

function cuberow (rnd, x, y, xstep, side, stroke, cubes) {
    return svg._(cubes.map(function (on, i) {
        return on ? cube(rnd, x + xstep * i, y, side, stroke) : '';
    }));
}

function cubepattern(rnd, count) {
    var on = [ ];
    for (var i=0; i < count; ++i) {
        on.push(rnd() > 0.3 ? 1 : 0);
    }
    return on;
}

function cubeglyph (size, padding, stroke, str) {
    // glyph measurements
    var xstep = (size - padding) / 4,
        ystep = (xstep * 0.75),
        side = (xstep * 0.5) - (stroke * 0.5),
        inset = (padding * 0.5) + (xstep * 0.5),
        stagger = (xstep * 0.5);

    // hash based random numbers
    var hash = crypto.createHash('sha1').update(str).digest('hex');
        rnd = Alea(hash);

    // generate glyph
    var y = 0,
        rows = [ ];

    rows.push(cuberow(rnd, inset + stagger, inset + ystep * y, xstep, side, stroke, cubepattern(rnd, 3)));
    
    ++y;
    rows.push(cuberow(rnd, inset, inset + ystep * y, xstep, side, stroke, cubepattern(rnd, 4)));
    
    ++y;
    rows.push(cuberow(rnd, inset + stagger, inset + ystep * y, xstep, side, stroke, cubepattern(rnd, 3)));
    
    ++y;
    rows.push(cuberow(rnd, inset, inset + ystep * y, xstep, side, stroke, cubepattern(rnd, 4)));
    
    ++y;
    rows.push(cuberow(rnd, inset + stagger, inset + ystep * y, xstep, side, stroke, cubepattern(rnd, 3)));
    
    return svg(size, size, svg._(rows));
}

channel.message('gen', function (message, finish) {
    // discovery
    if (!message) {
        return finish({
            size: 'base size for svg icon',
            padding: 'whitespace around edge of svg',
            stroke: 'stroke size of the inner cube glyphs',
            source: 'source string to base the ident off of'
        });
    }

    var glyph = cubeglyph(message.size, message.padding, message.stroke, message.source);
    finish({
        svg: glyph,
        source: message.source
    });
});

// handle server start
server.created(function (http, port) {
    console.log('server started on', port);
});

// start server
server.start();
