
// IDENTICON API

var Alea = require('alea'),
    crypto = require('crypto'),
    svg = require('./toolkit/svg'),
    toolkit = require('./toolkit/lib');

// create server 
var server = toolkit.createServer('api-ident');

// create channel
var channel = server.createChannel('ident');

// rendering code
function line (x1, y1, x2, y2) {
    return [
        svg.__('M', x1, y1),
        svg.__('L', x2, y2)
    ];
}

function pipe (x1, y1, x2, y2, curve) {
    var xdelta = x2 - x1,
        ydelta = y2 - y1;

    var xedge = xdelta > 0 ? curve : -curve,
        yedge = ydelta > 0 ? curve : -curve;

    var sweep;
    if (xdelta > 0) {                    
        sweep = ydelta > 0 ? 1 : 0;
    } else {
        sweep = ydelta > 0 ? 0 : 1;
    }

    return [
        svg.__('M', x1, y1),
        svg.__('L', x2 - xedge, y1),
        svg.__('A', curve, curve, 0, 0, sweep, x2, y1 + yedge),
        svg.__('L', x2, y2)
    ];
}

function column (rnd, first, last, top, bottom, x1, y1, x2, y2, curve, attr) {
    var mode = Math.round(rnd() * 4),
        xm = x1 + (x2 - x1) * 0.5,
        ym = y1 + (y2 - y1) * 0.5,
        ydelta = (y2 - y1),
        _attr = svg.$$(attr);

    switch (Math.round(rnd() * 4)) {
        case 0:
            _attr['stroke-dasharray'] = svg._(curve, ',', 1); break;
        case 1:
            _attr['stroke-dasharray'] = svg._(1, ',', 1); break;
    }

    switch (mode) {
        case 0:
            // horizontal bands
            var count = 2 + Math.round(rnd() * 3),
                step = (y2 - y1) / count,
                path = [];

            for (var i=1; i < count; ++i) {
                path.push(line(x1, y1 + i * step, x2, y1 + i * step));                    
            }
            return svg.path(path, _attr);
        case 1:
            // pipe
            if (ydelta < curve * 4) return '';
            if (first && !last) {
                if (top) {
                    return svg.path(pipe(x1, y2 - curve, x2 - curve, y1, curve), _attr);
                }
                return svg.path(pipe(x1, y1 + curve, x2 - curve, y2, curve), _attr);
            }
            if (last && !first) {
                if (top) {
                    return svg.path(pipe(x2, y2 - curve, x1 + curve, y1, curve), _attr);
                }
                return svg.path(pipe(x2, y1 + curve, x1 + curve, y2, curve), _attr);
            }
            if (top) {
                return svg.path(line(xm, y1 + curve, xm, y2, curve), _attr);
            }
            return svg.path(line(xm, y1, xm, y2 - curve, curve), _attr);
        case 2:
            // pipe with circle
            if (ydelta < curve * 4) return '';
            if (top) {
                return svg._(
                    svg.path(line(xm, y1, xm, y2 - (curve * 4), curve), _attr),
                    svg.circle(xm, y2 - (curve * 2), curve * 0.5, attr)
                );
            }
            return svg._(
                svg.path(line(xm, y1 + (curve * 4), xm, y2, curve), _attr),
                svg.circle(xm, y1 + (curve * 2), curve * 0.5, attr)
            );
        case 3:
            // pipe with dot
            if (ydelta < curve * 4) return '';
            if (top) {
                return svg._(
                    svg.path(line(xm, y1, xm, y2 - (curve * 4), curve), _attr),
                    svg.circle(xm, y2 - (curve * 2), 1, attr)
                );
            }
            return svg._(
                svg.path(line(xm, y1 + (curve * 4), xm, y2, curve), _attr),
                svg.circle(xm, y1 + (curve * 2), 1, attr)
            );
        case 4:
            // looped pipe
            if (ydelta < curve * 4) {
                return svg.circle(xm, ym, 1, attr);
            }
            if (first && !last) {
                return svg._(
                    svg.path(pipe(x1, y1 + curve, xm, ym, curve), _attr),
                    svg.path(pipe(x1, y2 - curve, xm, ym, curve), _attr)
                );
            }
            if (last && !first) {
                return svg._(
                    svg.path(pipe(x2, y1 + curve, xm, ym, curve), _attr),
                    svg.path(pipe(x2, y2 - curve, xm, ym, curve), _attr)
                );
            }
            return svg._(
                svg.circle(xm, y1 + (curve * 2), rnd() * curve * 0.5, attr),
                svg.circle(xm, ym, rnd() * curve * 0.5, attr),
                svg.circle(xm, y2 - (curve * 2), rnd() * curve * 0.5, attr)
            );
    }
}

function box (rnd, x1, y1, x2, y2, top, right, bottom, left, curve, attr) {
    var shapes = [ ],
        xm = x1 + (x2 - x1) * 0.5,
        ym = y1 + (y2 - y1) * 0.5,
        ydeco = ((y2 - y1) - (curve * 4)) * 0.5,
        outline = [ ];

    var ldeco = Math.round(rnd() * 100) < 40,
        rdeco = Math.round(rnd() * 100) < 30;

    // make gap for deco
    var lym1 = ldeco ? ym - ydeco : ym,
        lym2 = ldeco ? ym + ydeco : ym,
        rym1 = rdeco ? ym - ydeco : ym,
        rym2 = rdeco ? ym + ydeco : ym;

    // corners
    if (top && left) {
        outline.push(pipe(xm, y1, x1, lym1, curve));
    } else if (top) {
        outline.push(line(x1, y1, xm, y1));
    } else if (left) {
        outline.push(line(x1, y1, x1, lym1));
    }
    if (top && right) {
        outline.push(pipe(xm, y1, x2, rym1, curve));
    } else if (top) {
        outline.push(line(xm, y1, x2, y1));
    } else if (right) {
        outline.push(line(x2, y1, x2, rym1));
    }
    if (bottom && left) {
        outline.push(pipe(xm, y2, x1, lym2, curve));
    } else if (bottom) {
        outline.push(line(x1, y2, xm, y2));
    } else if (left) {
        outline.push(line(x1, lym2, x1, y2));
    }
    if (bottom && right) {
        outline.push(pipe(xm, y2, x2, rym2, curve));
    } else if (bottom) {
        outline.push(line(xm, y2, x2, y2));
    } else if (right) {
        outline.push(line(x2, rym2, x2, y2));
    }

    var decoAttr = svg.$$(attr, { 'rx': curve, 'ry': curve });
    switch (Math.round(rnd() * 5)) {
        default: delete decoAttr['stroke-dasharray']; break;
        case 0: decoAttr['stroke-dasharray'] = svg._(curve, ',', 1); break;
        case 1: decoAttr['stroke-dasharray'] = svg._(1, ',', 1); break;
    }
    if (ldeco) {
        shapes.push(svg.rect(x1 - curve, ym - ydeco, curve * 2, ydeco * 2, decoAttr));
    }
    switch (Math.round(rnd() * 5)) {
        default: delete decoAttr['stroke-dasharray']; break;
        case 0: decoAttr['stroke-dasharray'] = svg._(curve, ',', 1); break;
        case 1: decoAttr['stroke-dasharray'] = svg._(1, ',', 1); break;
    }
    if (rdeco) {
        shapes.push(svg.rect(x2 - curve, ym - ydeco, curve * 2, ydeco * 2, decoAttr));
    }

    if (ldeco && rdeco) {
        shapes.push(column(rnd, true, true, top, bottom, x1 + curve, y1, x2 - curve, y2, curve, attr));

    } else {
        var left,
            right,
            maxcols = (!ldeco && !rdeco) ? 3 : 2;

        if (ldeco) {
            left = x1 + curve;
            right = x2;
        } else if (rdeco) {
            left = x1;
            right = x2 - curve;
        } else {
            left = x1;
            right = x2;
        }

        var cols = maxcols > 2 ? maxcols : 
                1 + Math.round(rnd() * (maxcols - 1)),
            step = (right - left) / cols;

        var x = left,
            last = cols - 1;
        for (var i=0; i < cols; ++i) {
            shapes.push(column(rnd,
                !ldeco && i === 0, !rdeco && i === last,
                top, bottom,
                x, y1, x + step, y2, curve, attr));
            x += step;
        }
    }

    // box outline
    shapes.push(svg.path(outline, attr));

    // complete set
    return svg._(shapes);
}

function glyph (rnd, cols, rows, width, height, border, curve, attr) {
    var rw = (width - (border * 2)) / cols,
        rh = (height - (border * 2)) / rows,
        rr = [ ];

    var flip = Math.round(rnd() * 100) <= 50,
        gapped = Math.round(rnd() * 100) <= 50,
        ysplit = Math.floor(rnd() * rows);

    function _x (rcol) { return border + rcol * rw; }
    function _y (rrow) { return border + rrow * rh; }

    if (ysplit) {
        if (flip) ysplit = rows - ysplit;
        if (gapped) {
            if (ysplit >= rows - 1) {
                ysplit = rows - 2;
            }
            rr.push(box(rnd, _x(0), _y(0), _x(cols), _y(ysplit), 1, 1, 1, 1, curve, attr));
            rr.push(box(rnd, _x(0), _y(ysplit + 1), _x(cols), _y(rows), 1, 1, 1, 1, curve, attr));
        } else {
            rr.push(box(rnd, _x(0), _y(0), _x(cols), _y(ysplit), 1, 1, 0, 1, curve, attr));
            rr.push(box(rnd, _x(0), _y(ysplit), _x(cols), _y(rows), 0, 1, 1, 1, curve, attr));
        }
    } else {
        rr.push(box(rnd, _x(0), _y(0), _x(cols), _y(rows), 1, 1, 1, 1, curve, attr));
    }

    return svg(width, height, svg._(rr));
}

channel.message('gen', function (message, finish) {
    // discovery
    if (!message) {
        return finish({
            size: 'base size for svg icon',
            padding: 'whitespace around edge of svg',
            curve: 'curve of corners in glyphs',
            stroke: 'stroke size of the lines in glyphs',
            source: 'source string to base the ident off of'
        });
    }

    // hash based random numbers
    var hash = crypto.createHash('sha1').update(message.source).digest('hex');
        rnd = Alea(hash);

    // golden ratio
    var gr = 1.61803398875,
        igr = 1 / gr;

    // config
    var h = message.size,
        w = Math.floor(h * igr),
        attr = {
            'stroke': '#fff',
            'stroke-width': message.stroke + 'px',
            'fill': 'transparent'
        };

    var svg = glyph(rnd, 3, 6, w, h, message.padding, message.curve, attr);
    finish({
        svg: svg,
        source: message.source
    });
});

// handle server start
server.created(function (http, port) {
    console.log('server started on', port);
});

// start server
server.start();
