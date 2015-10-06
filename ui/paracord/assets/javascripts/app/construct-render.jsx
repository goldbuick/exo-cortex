import css from 'app/lib/css';
import Graph from 'app/graph';
import BmFontText from 'app/three/bmfont/text';
import BmFontShader from 'app/three/bmfont/sdf';
import BmFontLoad from 'app/three/bmfont/load';

var fontColor, fontConfig, fontTexture;
BmFontLoad({
    font: '/media/OCRA.fnt',
    image: '/media/OCRA.png'
}, (font, texture) => {
    fontColor = css.getStyleRuleValue('.fg-color', 'color');
    fontConfig = font;
    fontTexture = texture;
    fontTexture.needsUpdate = true;
    fontTexture.minFilter = THREE.LinearMipMapLinearFilter;
    fontTexture.magFilter = THREE.LinearFilter;
    fontTexture.generateMipmaps = true;
    fontTexture.anisotropy = window.maxAni;
});

function genText (pos, text) {
    if (!fontConfig) return;
    var geometry = BmFontText({
            text: text,
            font: fontConfig
        }),
        material = new THREE.ShaderMaterial(BmFontShader({
            map: fontTexture,
            smooth: 1 / 16,//2048,
            transparent: true,
            side: THREE.DoubleSide,
            color: fontColor,
            scramble: 0
        })),
        mesh = new THREE.Mesh(geometry, material);

    mesh.scale.multiplyScalar(0.5);
    mesh.position.set(pos[0], pos[1], pos[2] - (geometry.layout.width / 4));
    mesh.rotation.y = Math.PI * 0.5;
    mesh.rotation.z = Math.PI;
    return mesh;
}

function roundedRect ( ctx, x, y, width, height, radius ) {
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

function finish(args, graph) {
    graph.tessellate(10);
    return graph.build(args.project);    
}

var ConstructRender = {

    build: function (args) {
        var group;

        if (args.type) {
            group = ConstructRender[args.type](args);
            group.keep = true;
            // if (args.changed) {
            //     group.flicker = 32;
            //     group.animFunc = function (delta) {
            //         if (this.flicker > 0) {
            //             this.visible = this.flicker % 5 !== 0;
            //             --this.flicker;
            //             if (this.flicker <= 0) {
            //                 this.visible = true;
            //                 delete this.animFunc;
            //             }
            //         }
            //     };
            // }
        }

        return group;
    },

    HALO: function (args) {
        // project - projectection function
        // seed string
        // data - list of data samples
        // radius - when does the inner edge start
        // width - how thick is the halo
        // tickMarks - every x data samples

        var r = new alea(args.seed),
            graph = new Graph(),
            angle = 0,
            a = new THREE.Vector3(0, 0, 0),
            b = new THREE.Vector3(0, 0, 0),
            step = Math.PI * 2 / args.data.length,
            range = Math.max.apply(Math, args.data);

        var w, peak, middle = Math.round(args.data.length * 0.5);
        var tick,
            tick1 = args.width * 0.8,
            tick2 = args.width * 0.4;
        for (var i=0; i < args.data.length; ++i) {
            a.x = Math.cos(angle) * args.radius;
            a.y = Math.sin(angle) * args.radius;
            w = (args.data[i] / range) * args.width;
            b.x = Math.cos(angle) * (args.radius + w);
            b.y = Math.sin(angle) * (args.radius + w);
            graph.drawLine([ a, b ]);
            peak = (i === 0 || i === middle);
            tick = (peak ? tick1 : tick2);

            if (peak) {
                a.x = Math.cos(angle) * (args.radius - tick2);
                a.y = Math.sin(angle) * (args.radius - tick2);
                b.x = Math.cos(angle) * (args.radius + args.width);
                b.y = Math.sin(angle) * (args.radius + args.width);
                graph.drawLine([ a, b ]);

                if (i === 0) {
                    a.x = Math.cos(angle) * (args.radius + args.width);
                    a.y = Math.sin(angle) * (args.radius + args.width);
                    b.x = a.x + Math.cos(angle + Math.PI * 0.5) * tick * 0.57;
                    b.y = a.y + Math.sin(angle + Math.PI * 0.5) * tick * 0.57;
                    graph.drawLine([ a, b ]);                    
                }

                let bibbly = new THREE.Shape();
                roundedRect(bibbly, b.x - 2, b.y - 2, 4, 4, 0.5);
                graph.drawShape(bibbly);
                graph.drawShapeLine(bibbly);

            } else if (i % args.tickMarks === 0) {
                a.x = Math.cos(angle) * (args.radius - 3);
                a.y = Math.sin(angle) * (args.radius - 3);
                b.x = Math.cos(angle) * (args.radius - tick);
                b.y = Math.sin(angle) * (args.radius - tick);
                graph.drawLine([ a, b ]);
                if (r() < 0.2) {
                    a.x = Math.cos(angle) * (args.radius - tick - 3);
                    a.y = Math.sin(angle) * (args.radius - tick - 3);
                    circleShape = new THREE.Shape();
                    circleShape.absarc(a.x, a.y, 1, 0, Math.PI * 2, false);
                    graph.drawShape(circleShape);
                }
                if (r() < 0.1) {
                    a.x = Math.cos(angle) * (args.radius - tick - 7);
                    a.y = Math.sin(angle) * (args.radius - tick - 7);
                    circleShape = new THREE.Shape();
                    circleShape.absarc(a.x, a.y, 1, 0, Math.PI * 2, false);
                    graph.drawShape(circleShape);
                }
            }
            angle += step;
        }

        var circleShape = new THREE.Shape();
        circleShape.absarc(0, 0, args.radius - 1, 0, Math.PI * 2, false);
        graph.drawShapeLine(circleShape);
        
        if (r() < 0.5) {
            circleShape = new THREE.Shape();
            circleShape.absarc(0, 0, args.radius - r() * 4, 0, Math.PI * 2, false);
            graph.drawShapeLine(circleShape);
        }

        var object = finish(args, graph),
            group = new THREE.Group();

        group.add(object);

        if (fontConfig) {
            var text = genText(args.project(0, 0, 10), args.seed);
            if (text) group.add(text);
        }

        group.intro = function (value) {
            object.visible = Math.round(value * 100) % 100 === 0;
            text.material.uniforms.scramble.value = (1.0 - value) * 2.0;
        };

        return group;
    }

};

export default ConstructRender;