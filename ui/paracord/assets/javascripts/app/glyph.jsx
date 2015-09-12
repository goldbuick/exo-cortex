define(function (require, exports, module) {
    'use strict';

    // a series of 3d points with instructions on how to connect them
    function Glyph () {
        this.colors = [ ];
        this.positions = [ ];
        this.points = [ ];
        this.lines = [ ];
        this.fills = [ ];
    }

    Glyph.prototype = {
        constructor: Glyph,

        addVert: function (x, y, z, color) {
            color = color || [ 1, 1, 1 ];
            this.colors.push(color[0], color[1], color[2]);
            this.positions.push(x, y, z);
        },

        addPoint: function (v1) {
            this.points.push(v1);
        },

        addLine: function (v1, v2) {
            this.lines.push(v1, v2);
        },

        addFill: function (v1, v2, v3) {
            this.fills.push(v1, v2, v3);
        },

        build: function (transform) {
            var group = group = new THREE.Group();

            var positions = [ ];
            for (var i=0; i<this.positions.length; i+=3) {
                var result = transform(
                    this.positions[i],
                    this.positions[i+1],
                    this.positions[i+2]
                );
                positions.push(result[0], result[1], result[2]);
            }

            var lineGeometry = new THREE.BufferGeometry();
            lineGeometry.addAttribute('index', new THREE.BufferAttribute(new Uint16Array(this.lines), 1));
            lineGeometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
            lineGeometry.addAttribute('color', new THREE.BufferAttribute(new Float32Array(this.colors), 3));
            lineGeometry.computeBoundingSphere();

            var lineMaterial = new THREE.LineBasicMaterial({ vertexColors: THREE.VertexColors }),
                lineMesh = new THREE.Line(lineGeometry, lineMaterial, THREE.LinePieces);
            group.add(lineMesh);

            var fillGeometry = new THREE.BufferGeometry();
            fillGeometry.addAttribute('index', new THREE.BufferAttribute(new Uint16Array(this.fills), 1));
            fillGeometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
            fillGeometry.addAttribute('color', new THREE.BufferAttribute(new Float32Array(this.colors.map(function (value) {
                return value * 0.5;
            })), 3));
            fillGeometry.computeBoundingSphere();

            var fillMaterial = new THREE.MeshBasicMaterial({
                    opacity: 0.9,
                    transparent: true,
                    side: THREE.DoubleSide,
                    vertexColors: THREE.VertexColors
                }),
                fillMesh = new THREE.Mesh(fillGeometry, fillMaterial);
            group.add(fillMesh);

            return group;
        },

        update: function (geometry) {

        }
    };

    return Glyph;
});