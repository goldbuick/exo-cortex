define(function (require, exports, module) {
    'use strict';

    var RenderTarget = require('./render-target'),
        Glyph = require('./glyph');

    // assume x, y in radians, z is height
    function sphereProject(radius, scale) {
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

    function sphereTwist(ox, oy, group) {
        group.rotation.y += ox;
        group.rotation.z += oy;
        return group;
    }

    var RenderTest = React.createClass({
        mixins: [
            RenderTarget
        ],

        componentDidMount: function () {
            this.camera.position.z = 1024;

            var test = new Glyph();

            var size = 32;
            function rnd() { return Math.random() * size - (size - 2); }

            var count = 128, twist = 0.05, step = 0.6;
            for (var i=0; i < count; ++i) {
                test.addVert(
                    Math.cos(i * twist) * (i * step),
                    Math.sin(i * twist) * (i * step),
                    0);
                step += Math.random() * 0.003 - 0.0015;
                twist += Math.random() * 0.003 - 0.0015;
            }

            function idx() { return Math.round(Math.random() * (count - 1)); }
            for (i=0; i < count - 1; ++i) {
                test.addLine(i, i+1);
            }

            test.tessellate(20);

            var test2 = new Glyph();

            test2.addVert(0, 0, 0);

            count = 64;
            step = (Math.PI * 2) / count;
            var ring = [ ];
            for (i=0; i < count; ++i) {
                twist = Math.random() * 5 + 10;
                test2.addVert(
                    Math.cos(i * step) * twist,
                    Math.sin(i * step) * twist,
                    0);
                twist = Math.random() * 25 + twist;
                test2.addVert(
                    Math.cos(i * step) * twist,
                    Math.sin(i * step) * twist,
                    0);
                test2.addLine(1 + i * 2, 2 + i * 2);
                ring.push(1 + i * 2);
            }
            for (i=0; i < ring.length - 1; ++i) {
                test2.addFill(0, ring[i], ring[i+1]);
            }
            test2.addFill(0, ring[0], ring[ring.length - 1]);

            test2.tessellate(20);

            var bump = Math.PI * 0.25;
            var groups = [
                sphereTwist(0, Math.PI * -0.5, test.build(sphereProject(512, 0.01))),
                sphereTwist(0, Math.PI * 0.5, test.build(sphereProject(512, 0.01))),
                sphereTwist(0, 0, test.build(sphereProject(512, 0.01))),
                sphereTwist(Math.PI * 0.5, 0, test.build(sphereProject(512, 0.01))),
                sphereTwist(Math.PI, 0, test.build(sphereProject(512, 0.01))),
                sphereTwist(Math.PI * 1.5, 0, test.build(sphereProject(512, 0.01))),
                sphereTwist(bump, 0.6, test.build(sphereProject(512, 0.01))),
                sphereTwist(bump + Math.PI * 0.5, 0.6, test.build(sphereProject(512, 0.01))),
                sphereTwist(bump + Math.PI, 0.6, test.build(sphereProject(512, 0.01))),
                sphereTwist(bump + Math.PI * 1.5, 0.6, test.build(sphereProject(512, 0.01))),
                sphereTwist(bump, -0.6, test.build(sphereProject(512, 0.01))),
                sphereTwist(bump + Math.PI * 0.5, -0.6, test.build(sphereProject(512, 0.01))),
                sphereTwist(bump + Math.PI, -0.6, test.build(sphereProject(512, 0.01))),
                sphereTwist(bump + Math.PI * 1.5, -0.6, test.build(sphereProject(512, 0.01))),
            ];

            var groups2 = [
                sphereTwist(0, Math.PI * -0.5, test2.build(sphereProject(312, 0.01))),
                sphereTwist(0, Math.PI * 0.5, test2.build(sphereProject(312, 0.01))),
                sphereTwist(0, 0, test2.build(sphereProject(312, 0.01))),
                sphereTwist(Math.PI * 0.5, 0, test2.build(sphereProject(312, 0.01))),
                sphereTwist(Math.PI, 0, test2.build(sphereProject(312, 0.01))),
                sphereTwist(Math.PI * 1.5, 0, test2.build(sphereProject(312, 0.01))),
                sphereTwist(bump, 0.6, test2.build(sphereProject(312, 0.01))),
                sphereTwist(bump + Math.PI * 0.5, 0.6, test2.build(sphereProject(312, 0.01))),
                sphereTwist(bump + Math.PI, 0.6, test2.build(sphereProject(312, 0.01))),
                sphereTwist(bump + Math.PI * 1.5, 0.6, test2.build(sphereProject(312, 0.01))),
                sphereTwist(bump, -0.6, test2.build(sphereProject(312, 0.01))),
                sphereTwist(bump + Math.PI * 0.5, -0.6, test2.build(sphereProject(312, 0.01))),
                sphereTwist(bump + Math.PI, -0.6, test2.build(sphereProject(312, 0.01))),
                sphereTwist(bump + Math.PI * 1.5, -0.6, test2.build(sphereProject(312, 0.01))),
            ];

            groups.forEach(function (group) {
                this.scene.add(group);
                // change to this =>
                // http://projects.defmech.com/ThreeJSObjectRotationWithQuaternion/
                setInterval(function () {
                    group.rotation.y += 0.001;
                }, 10);
            }.bind(this));

            groups2.forEach(function (group) {
                // group.rotation.x += Math.PI * 0.25;
                this.scene.add(group);
                setInterval(function () {
                    group.rotation.y += 0.001;
                }, 10);
            }.bind(this));

        },

        render: function () {
            return <div className="render-target"></div>;
        }

    });

    return RenderTest;
});
