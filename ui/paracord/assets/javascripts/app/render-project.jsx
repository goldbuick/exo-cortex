var RenderProject = {
    
    // assume x, y in radians, z is height
    sphereProject: function (radius, scale) {
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
