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

function genText (pos, text, scale) {
    if (!fontConfig) return;
    var geometry = BmFontText({
            text: text,
            font: fontConfig
        }),
        material = new THREE.ShaderMaterial(BmFontShader({
            map: fontTexture,
            smooth: 1 / 16,
            transparent: true,
            side: THREE.DoubleSide,
            color: fontColor,
            scramble: 0
        })),
        mesh = new THREE.Mesh(geometry, material);

    var _width = geometry.layout.width * (scale * 0.5),
        _height = geometry.layout.height * (scale * 0.25);
    mesh.scale.multiplyScalar(scale);
    mesh.position.set(pos[0], pos[1] - _height, pos[2] - _width);
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

function finish (args, graph) {
    graph.tessellate(10);
    return graph.build(args.project);    
}

function keep (graph) {
    graph.keep = true;
    return graph;
}

function metaStr (meta, str) {
    return str.replace(/\$([a-zA-z0-9_]*)/, function(match, name, string) {
        return meta[name] || match;
    });
}

var ConstructRender = {

    build: function (graph) {
        var group;
        if (graph.params && graph.params.type) {
            group = ConstructRender[graph.params.type](graph.meta, graph.params);
        }
        return group;
    },

    TEXT: function (meta, args) {
        // project - projectection function
        // text - string
        var object = new THREE.Group();

        if (fontConfig) {
            var pos = args.project(0, 0, 0),
                text = genText(pos, metaStr(meta, args.text), args.scale);
            if (text) object.add(text);
        }

        object.animIntro = function (value) {
            text.material.uniforms.scramble.value = (1.0 - value);
        };

        if (args.changed) {
            object.animChanged = function (value) {
                text.material.uniforms.scramble.value = (1.0 - value);
            };
        }

        return keep(object);
    },

    HALO: function (meta, args) {
        // project - projectection function
        // seed - string
        // data - list of data samples
        // radius - when does the inner edge start
        // width - how thick is the halo
        // tickMarks - every x data samples

        var r = new alea(metaStr(meta, args.seed)),
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

        var object = finish(args, graph);

        object.animIntro = function (value) {
            object.visible = Math.round(value * 100) % 4 === 0;
        };

        if (args.changed) {
            object.animChanged = function (value) {
                object.visible = Math.round(value * 100) % 4 === 0;
            };
        }

        return keep(object);
    }

};

export default ConstructRender;