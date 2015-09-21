import RenderTarget from './render-target';
import RenderProject from './render-project';
import Graph from './graph';
import t1 from './three/shaders/CopyShader';
import t2 from './three/shaders/ConvolutionShader';
import t3 from './three/postprocessing/MaskPass';
import t4 from './three/postprocessing/BloomPass';
import t5 from './three/postprocessing/ShaderPass';

function sphereTwist(ox, oy, group) {
    group.rotation.y += ox;
    group.rotation.z += oy;
    return group;
}

function roundedRect( ctx, x, y, width, height, radius ) {
    ctx.moveTo( x, y + radius );
    ctx.lineTo( x, y + height - radius );
    ctx.quadraticCurveTo( x, y + height, x + radius, y + height );
    ctx.lineTo( x + width - radius, y + height) ;
    ctx.quadraticCurveTo( x + width, y + height, x + width, y + height - radius );
    ctx.lineTo( x + width, y + radius );
    ctx.quadraticCurveTo( x + width, y, x + width - radius, y );
    ctx.lineTo( x + radius, y );
    ctx.quadraticCurveTo( x, y, x, y + radius );
    return ctx;
}

var RenderTest = React.createClass({
    mixins: [
        RenderTarget
    ],

    componentDidMount: function () {
        var size;
        this.camera.position.z = 1040;
        var effectBloom = new THREE.BloomPass(2);
        var effectCopy = new THREE.ShaderPass(THREE.CopyShader);
        this.composer.addPass(effectBloom);
        this.composer.addPass(effectCopy);
        effectCopy.renderToScreen = true;

        size = 20;
        var triangleShape = new THREE.Shape();
        triangleShape.moveTo(0, -size);
        triangleShape.lineTo(size, size);
        triangleShape.lineTo(-size, size);
        triangleShape.lineTo(0, -size);

        var triangleShape2 = new THREE.Shape();
        triangleShape2.moveTo(0, size);
        triangleShape2.lineTo(size, -size);
        triangleShape2.lineTo(-size, -size);
        triangleShape2.lineTo(0, size);

        size = 30;
        var rectShape = roundedRect(new THREE.Shape(), -size, -size, size * 2, size * 2, size * 0.25);
        // var holePath = new THREE.Path();
        // holePath.absarc(0, 0, size * 0.5, 0, Math.PI*2, true);
        // rectShape.holes.push( holePath );        

        size = 25;
        var rectShape2 = roundedRect(new THREE.Shape(), -size, -size, size * 2, size * 2, size * 0.25);

        var bump = Math.PI * 0.25,
            cursor = 0,
            groups = [ ],
            groups2 = [ ];
        
        [
            triangleShape,
            rectShape,
            triangleShape2,
            rectShape2,
            triangleShape,
            rectShape,
            triangleShape2,
            rectShape2,
        ].forEach(shape => {
            var test = new Graph();
            test.drawShape(shape);
            test.drawShapeLine(shape);
            test.tessellate(10);
            groups.push(sphereTwist(cursor, 0, test.build(RenderProject.sphereProject(512, 0.01))));
            // groups.push(sphereTwist(cursor, Math.PI * 0.5, test.build(RenderProject.sphereProject(512, 0.01))));
            // groups.push(sphereTwist(cursor, Math.PI * -0.5, test.build(RenderProject.sphereProject(512, 0.01))));
            groups.push(sphereTwist(cursor, Math.PI * 0.25, test.build(RenderProject.sphereProject(512, 0.01))));
            groups.push(sphereTwist(cursor, Math.PI * -0.25, test.build(RenderProject.sphereProject(512, 0.01))));

            groups2.push(sphereTwist(cursor + bump, 0, test.build(RenderProject.sphereProject(312, 0.01))));
            // groups2.push(sphereTwist(cursor + bump, Math.PI * 0.5, test.build(RenderProject.sphereProject(312, 0.01))));
            // groups2.push(sphereTwist(cursor + bump, Math.PI * -0.5, test.build(RenderProject.sphereProject(312, 0.01))));
            groups2.push(sphereTwist(cursor + bump, Math.PI * 0.25, test.build(RenderProject.sphereProject(312, 0.01))));
            groups2.push(sphereTwist(cursor + bump, Math.PI * -0.25, test.build(RenderProject.sphereProject(312, 0.01))));
            cursor += bump;
        });

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
                group.rotation.y -= 0.01;
            }, 10);
        }.bind(this));

    },

    render: function () {
        return <div className="render-target"></div>;
    }

});

export default RenderTest;
