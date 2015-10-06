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
