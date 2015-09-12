define(function (require, exports, module) {
    'use strict';

    var RenderTarget = require('./render-target'),
        Glyph = require('./glyph');

    // assume x, y in radians, z is height
    function sphereProject(ox, oy, radius, scale) {
        return function (x, y, z) {
            x = oy + x * scale;
            y = ox + y * scale;
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

    var RenderTest = React.createClass({
        mixins: [
            RenderTarget
        ],

        componentDidMount: function () {
            this.camera.position.z = 1024;

            var test = new Glyph();

            var size = 80,
                hwidth = size * 0.5,
                hheight = size * 0.5,
                xstep = size / 10,
                ystep = size / 10;

            for (var y=0; y < 10; ++y) {
                for (var x=0; x < 10; ++x) {
                    test.addVert(
                        x * xstep - hwidth,
                        y * ystep - hheight,
                        Math.random() * 5 - 10
                    );
                }
            }

            function rnd() {
                return Math.round(Math.random() * 99);
            }

            function index(x, y) {
                return x + y * 10;
            }

            for (var y=0; y < 9; ++y) {
                test.addLine(index(0, y), index(0, y+1));
                test.addLine(index(9, y), index(9, y+1));
                test.addLine(index(3, y), index(4, y+1));
            }

            for (var x=0; x < 9; ++x) {
                test.addLine(index(x, 0), index(x+1, 0));
                test.addLine(index(x, 9), index(x+1, 9));
            }

            test.addFill(index(2, 2), index(7, 2), index(7, 7));
            test.addFill(index(2, 2), index(7, 7), index(2, 7));

            var bump = Math.PI * 0.25;
            var groups = [
                test.build(sphereProject(0, 0, 512, 0.01)),
                test.build(sphereProject(Math.PI * 0.5, 0, 512, 0.01)),
                test.build(sphereProject(Math.PI, 0, 512, 0.01)),
                test.build(sphereProject(Math.PI * 1.5, 0, 512, 0.01)),
                test.build(sphereProject(bump, 0.6, 512, 0.01)),
                test.build(sphereProject(bump + Math.PI * 0.5, 0.6, 512, 0.01)),
                test.build(sphereProject(bump + Math.PI, 0.6, 512, 0.01)),
                test.build(sphereProject(bump + Math.PI * 1.5, 0.6, 512, 0.01)),
                test.build(sphereProject(bump, -0.6, 512, 0.01)),
                test.build(sphereProject(bump + Math.PI * 0.5, -0.6, 512, 0.01)),
                test.build(sphereProject(bump + Math.PI, -0.6, 512, 0.01)),
                test.build(sphereProject(bump + Math.PI * 1.5, -0.6, 512, 0.01)),
            ];

            var groups2 = [
                test.build(sphereProject(0, 0, 312, 0.01)),
                test.build(sphereProject(Math.PI * 0.5, 0, 312, 0.01)),
                test.build(sphereProject(Math.PI, 0, 312, 0.01)),
                test.build(sphereProject(Math.PI * 1.5, 0, 312, 0.01)),
                test.build(sphereProject(bump, 0.6, 312, 0.01)),
                test.build(sphereProject(bump + Math.PI * 0.5, 0.6, 312, 0.01)),
                test.build(sphereProject(bump + Math.PI, 0.6, 312, 0.01)),
                test.build(sphereProject(bump + Math.PI * 1.5, 0.6, 312, 0.01)),
                test.build(sphereProject(bump, -0.6, 312, 0.01)),
                test.build(sphereProject(bump + Math.PI * 0.5, -0.6, 312, 0.01)),
                test.build(sphereProject(bump + Math.PI, -0.6, 312, 0.01)),
                test.build(sphereProject(bump + Math.PI * 1.5, -0.6, 312, 0.01)),
            ];

            groups.forEach(function (group) {
                this.scene.add(group);
                setInterval(function () {
                    group.rotation.y += 0.001;
                }, 10);
            }.bind(this));

            groups2.forEach(function (group) {
                this.scene.add(group);
                setInterval(function () {
                    group.rotation.y -= 0.003;
                }, 10);
            }.bind(this));

        },

        render: function () {
            return <div className="render-target"></div>;
        }

    });

    return RenderTest;
});
