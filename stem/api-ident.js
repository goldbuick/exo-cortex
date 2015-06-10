
// IDENTICON API

var crypto = require('crypto'),
    svg = require('./toolkit/svg');

function cube (x, y, size) {
    var left = x - size,
        top = y - size,
        right = x + size,
        bottom = y + size,
        upper = y - (size * 0.5),
        lower = y + (size * 0.5);

    var lattr = {
        'stroke': 'white',
        'stroke-width': 2
    };

    return svg._(

        // base
        svg.polygon([
            left, upper,
            x, top,
            right, upper,
            right, lower,
            x, bottom,
            left, lower
        ], {
            'fill': 'rgba(0, 0, 0, 1)',
            // 'stroke': 'none',
            // 'stroke-width': 0       
        }),

        svg.line(x, y, x, top, lattr),
        svg.line(x, y, left, upper, lattr),
        svg.line(x, y, right, upper, lattr),

        svg.line(x, y, x, bottom, lattr),
        // svg.line(x, y, left, lower, lattr),
        // svg.line(x, y, right, lower, lattr),

        ''
    );
}


var size = 256,
    padding = 10,
    step = (size - padding) * 0.25,
    radius = (step * 0.5) - 1,
    offset = (padding * 0.5) + (step * 0.5),
    xstagger = (step * 0.5),
    ystep = step * 0.75;

// draw cubes
var x, y = 0,
    cubes = [ ];

for (x=0; x < 3; ++x) cubes.push(cube(offset + step * x + xstagger, offset + ystep * y, radius));
++y;

for (x=0; x < 4; ++x) cubes.push(cube(offset + step * x, offset + ystep * y, radius));
++y;

for (x=0; x < 3; ++x) cubes.push(cube(offset + step * x + xstagger, offset + ystep * y, radius));
++y;

for (x=0; x < 4; ++x) cubes.push(cube(offset + step * x, offset + ystep * y, radius));
++y;

for (x=0; x < 3; ++x) cubes.push(cube(offset + step * x + xstagger, offset + ystep * y, radius));
++y;

var render = svg(size, size, svg._(cubes));

console.log(render);

