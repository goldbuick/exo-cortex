
// helper functions to generate svg documents in node
// because everything else is crap, I wasted a morning looking for something

function _ () {
    if (Array.isArray(arguments[0]))
        return arguments[0].join('');
    
    return Array.prototype.slice.call(arguments).join('');
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

function svg (width, height, inner) {
    return el('svg', {
        width: width,
        height: height
    }, inner);
}

svg._ = _;

svg.line = function (x1, y1, x2, y2, attr) {
    attr = attr || { };
    attr.x1 = x1;
    attr.y1 = y1;
    attr.x2 = x2;
    attr.y2 = y2;
    return el('line', attr);
};

svg.polyline = function (points, attr) {
    attr = attr || { };
    attr.points = _points(points);
    return el('polyline', attr);
};

svg.polygon = function (points, attr) {
    attr = attr || { };
    attr.points = _points(points);
    return el('polygon', attr);
};

module.exports = svg;
