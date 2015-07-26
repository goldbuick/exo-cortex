define(function (require, exports, module) {
    'use strict';

    var svg = require('app/lib/svg');
    
    // the expectation is start -> end is an integer range
    // with incremental steps of 1
    module.exports = function (width, height, padding, data, animated) {
        var i, min, max, minIndex, maxIndex;

        width -= padding * 2;
        height -= padding * 2;

        var attr = {
            'stroke': '#fff',
            'stroke-width': '1px',
            'fill': 'transparent'
        };

        // first pass get min / max
        for (i=0; i < data.length; ++i) {
            if (min === undefined || min > data[i]) min = data[i];
            if (max === undefined || max < data[i]) max = data[i];
            if (data[i] === min && minIndex === undefined) minIndex = i;
            if (data[i] === max) maxIndex = i;
        }
        var scale = max - min,
            range = data.length - 1;

        if (scale <= 0) scale = 1;
        if (range <= 0) range = 1;

        // second pass render points
        var px, py, lx, ly, hx, hy, points = [ ];
        for (i=0; i < data.length; ++i) {
            px = i / range;
            py = (data[i] - min) / scale;
            px = Math.round(px * width) + padding;
            py = Math.round((1.0 - py) * height) + padding;
            if (i === 0) {
                points.push(svg.__('M', px, py));
            } else {
                points.push(svg.__('L', px, py));
            }
            if (i === minIndex) {
                lx = px;
                ly = py;
            }
            if (i === maxIndex) {
                hx = px;
                hy = py;
            }
        }

        // gen svg
        width += padding * 2;
        height += padding * 2;
        return svg(width, height, svg._(
            svg.path(points, attr),
            svg.line(lx, ly, lx, height, attr),
            svg.line(hx, 0, hx, hy, attr),
            svg.circle(lx, height - 2, 1, attr),
            svg.circle(hx, 2, 1, attr)
        ), {
            'class': animated ? 'animated zoomInUp' : ''
        });
    };

});