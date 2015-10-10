var RenderProject = {

    plane: function (scale) {
        return function (x, y, z) {
            var _x = x * scale,
                _y = z * scale,
                _z = y * scale;
            return [ _x, _y, _z ];
        }
    },
    
    // assume x, y in radians, z is height
    sphere: function (radius, scale) {
        return function (x, y, z) {
            x = x * scale;
            y = y * scale;
            var xcos = Math.cos(x),
                xsin = Math.sin(x),
                ycos = Math.cos(y),
                ysin = Math.sin(y),
                height = z + radius,
                _x = -height * xcos * ycos,
                _y = height * xsin,
                _z = height * xcos * ysin;
            return [ _x, _y, _z ];
        };
    }

};

export default RenderProject;
