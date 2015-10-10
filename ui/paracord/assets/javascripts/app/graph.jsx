import Glyph from './glyph';

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

    drawLoop (x, y, z, sides, radius, skip) {
        var points = [ ],
            step = (Math.PI * 2) / sides;

        if (skip !== undefined) sides -= skip;

        var angle = 0;
        for (var i=0; i<=sides; ++i) {
            points.push({
                x: x + Math.cos(angle) * radius,
                y: y + Math.sin(angle) * radius,
                z: z
            });
            angle += step;
        }

        return this.drawLine(points);
    }

    drawShape (shape) {
        // given a THREE.shape destruct it into glyph addVert, addFills 
        var self = this,
            offset = self.glyph.count,
            geometry = shape.makeGeometry();

        geometry.vertices.forEach(vert => {
            self.glyph.addVert(vert.x, vert.y, vert.z);
        });

        geometry.faces.forEach(face => {
            self.glyph.addFill(offset + face.a, offset + face.b, offset + face.c);
        });
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

}
