import css from 'app/lib/css';
import Glyph from 'app/glyph';
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

export default class Graph {
    constructor () {
        this.glyph = new Glyph();
    }

    tessellate (step) {
        return this.glyph.tessellate(step);
    }

    build (transform) {
        return this.glyph.build(transform);
    }

    drawLine (points) {
        // list of points turned into a drawn line
        var self = this,
            offset = self.glyph.count;

        points.forEach(vert => {
            self.glyph.addVert(vert.x, vert.y, vert.z);
        });

        for (var i=0; i < points.length-1; ++i) {
            self.glyph.addLine(offset + i, offset + i + 1);
        }
    }

    drawCurve (curve, divisions) {
        // draw a Three.Curve
        this.drawLine(curve.getSpacedPoints(divisions));
    }

    drawLoop (x, y, z, sides, radius, front, back, drift) {
        this.drawLine(this.genArc(x, y, z, sides, radius, front, back, drift));
    }

    drawLoopDash (x, y, z, sides, radius, skip) {
        skip = skip || 1;
        var points = [ ],
            step = (Math.PI * 2) / sides;

        var angle = 0;
        for (var i=0; i<=sides; ++i) {
            points.push({
                x: x + Math.cos(angle) * radius,
                y: y + Math.sin(angle) * radius,
                z: z
            });
            angle += step;

            if (points.length > 1) {
                this.drawLine(points);
                if (i % skip === 0) {
                    points = [ ];
                } else {
                    points.shift();
                }
            }
        }
    }

    drawLoopR (x, y, z, sides, radius, r, threshold) {
        var points = [ ],
            step = (Math.PI * 2) / sides;

        var angle = 0;
        for (var i=0; i<=sides; ++i) {
            points.push({
                x: x + Math.cos(angle) * radius,
                y: y + Math.sin(angle) * radius,
                z: z
            });
            angle += step;

            if (points.length > 1) {
                this.drawLine(points);
                if (r() < threshold) {
                    points = [ ];
                } else {
                    points.shift();
                }
            }
        }
    }

    drawSwipe (x, y, z, sides, radius, width, front, back, drift) {
        var self = this,
            offset = this.glyph.count,
            innerRadius = radius,
            outerRadius = radius + width,
            ipoints = self.genArc(x, y, z, sides, innerRadius, front, back, drift),
            opoints = self.genArc(x, y, z, sides, outerRadius, front, back, drift);

        ipoints.forEach(vert => { self.glyph.addVert(vert.x , vert.y, vert.z); });
        opoints.forEach(vert => { self.glyph.addVert(vert.x , vert.y, vert.z); });

        var base, len = ipoints.length;
        for (var i=0; i<len-1; ++i) {
            base = offset + i;
            this.glyph.addFill(base, base + 1, base + len);
            this.glyph.addFill(base + len, base + len + 1, base + 1);
        }
    }

    drawSwipeLine (x, y, z, sides, radius, width, front, back, drift) {
        var self = this,
            innerRadius = radius,
            outerRadius = radius + width,
            ipoints = self.genArc(x, y, z, sides, innerRadius, front, back, drift),
            opoints = self.genArc(x, y, z, sides, outerRadius, front, back, drift);

        this.drawLine(ipoints);
        this.drawLine(opoints);
    }

    drawGeometry (geometry) {
        var self = this,
            offset = self.glyph.count;

        geometry.vertices.forEach(vert => {
            self.glyph.addVert(vert.x, vert.y, vert.z);
        });

        geometry.faces.forEach(face => {
            self.glyph.addFill(offset + face.a, offset + face.b, offset + face.c);
        });
    }

    drawGeometryLine (geometry) {
        var self = this,
            offset = self.glyph.count;

        geometry.vertices.forEach(vert => {
            self.glyph.addVert(vert.x, vert.y, vert.z);
        });

        geometry.faces.forEach(face => {
            self.glyph.addLine(offset + face.a, offset + face.b);
            self.glyph.addLine(offset + face.b, offset + face.c);
        });
    }

    drawShape (shape) {
        // given a THREE.shape destruct it into glyph addVert, addFills 
        this.drawGeometry(shape.makeGeometry());
    }

    drawShapeLine (shape) {
        // given a THREE.shape destruct it into glyph addVert, addLines
        var self = this,
            offset = self.glyph.count,
            geometry = shape.createPointsGeometry();

        geometry.vertices.forEach(vert => {
            self.glyph.addVert(vert.x, vert.y, vert.z);
        });

        for (var i=0; i < geometry.vertices.length-1; ++i) {
            self.glyph.addLine(offset + i, offset + i + 1);
        }
    }

    genArc (x, y, z, sides, radius, front, back, drift) {
        var points = [ ],
            step = (Math.PI * 2) / sides;

        front = front || 0;
        back = back || 0;
        drift = drift || 0;

        sides -= front + back;

        var angle = front * step;
        for (var i=0; i <= sides; ++i) {
            points.push({
                x: x + Math.cos(angle) * radius,
                y: y + Math.sin(angle) * radius,
                z: z
            });
            angle += step;
            radius += drift;
        }

        return points;
    }

    genText (pos, text, scale) {
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

}
