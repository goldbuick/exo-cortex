import Glyph from './glyph';

export default class Graph {
    constructor () {
        this.glyph = new Glyph();
    }

    drawLine () {
        // list of points turned into a drawn line
    }

    drawCurve () {
        // draw a curve through the given list of points
    }

    drawShape (shape) {
        // given a THREE.shape destruct it into glyph addVert, addFills 
    }

    drawShapeLine (shape) {
        // given a THREE.shape destruct it into glyph addVert, addLines        
    }

    // need a collection of calls to generate THREE.shapes
    // start looking at the graphs c3js does

}
