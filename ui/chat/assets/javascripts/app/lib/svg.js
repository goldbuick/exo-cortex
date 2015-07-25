define(function(require, exports, module) {
    'use strict';

    // helper functions to generate svg documents in node
    // because everything else is crap, I wasted a morning looking for something

    function $$ (obj, attr) {
        var clone = JSON.parse(JSON.stringify(obj));
        if (attr) {
            Object.keys(attr).forEach(function (key) {
                clone[key] = attr[key];
            });
        }
        return clone;
    }

    function _ () {
        if (Array.isArray(arguments[0]))
            return arguments[0].join('');
        
        return Array.prototype.slice.call(arguments).join('');
    }

    function __ () {
        if (Array.isArray(arguments[0]))
            return arguments[0].join(' ');
        
        return Array.prototype.slice.call(arguments).join(' ');
    }

    function _points (points) {
        var i = 0,
            set = [ ],
            sets = [ ];

        points.forEach(function (pt) {
            set.push(pt);
            ++i;
            if (i === 2) {
                sets.push(set);
                set = [ ];
                i = 0;
            }
        });

        return sets.map(function (set) {
            return set.join(',');
        }).join(' ');
    }

    function el (name, attr, inner) {
        var attrs = Object.keys(attr).map(function (key) {
            return _(key, '="', attr[key], '"');
        }).join(' ');

        return _('<', name, ' ', attrs, '>', inner || '', '</', name, '>');
    }

    // fadeIn
    function svg (width, height, inner, attr) {
        attr = $$(attr || { });
        attr.width = width;
        attr.height = height;
        attr.viewBox = __(0, 0, width, height);
        return el('svg', attr, inner);
    }

    svg._ = _;
    svg.__ = __;
    svg.$$ = $$;

    svg.flatten = function (array) {
        var result = [ ];
        array.forEach(function (item) {
            if (Array.isArray(item)) {
                svg.flatten(item).forEach(function (_item) {
                    result.push(_item);
                });
            } else {
                result.push(item);
            }
        });
        return result;
    };

    svg.line = function (x1, y1, x2, y2, attr) {
        attr = $$(attr || { });
        attr.x1 = x1;
        attr.y1 = y1;
        attr.x2 = x2;
        attr.y2 = y2;
        return el('line', attr);
    };

    svg.path = function (d, attr) {
        attr = $$(attr || { });
        attr.d = svg.flatten(d).join(' ');
        return el('path', attr);
    };

    svg.rect = function (x, y, w, h, attr) {
        if (w < 1 || h < 1) return '';
        attr = $$(attr || { });
        attr.x = x;
        attr.y = y;
        attr.width = w;
        attr.height = h;
        return el('rect', attr);
    };

    svg.circle = function (x, y, r, attr) {
        if (r < 1) return '';
        attr = $$(attr || { });
        attr.cx = x;
        attr.cy = y;
        attr.r = r;
        return el('circle', attr);
    };

    svg.polyline = function (points, attr) {
        attr = $$(attr || { });
        attr.points = _points(points);
        return el('polyline', attr);
    };

    svg.polygon = function (points, attr) {
        attr = $$(attr || { });
        attr.points = _points(points);
        return el('polygon', attr);
    };

    module.exports = svg;
});