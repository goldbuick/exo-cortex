import Graph from 'app/graph';

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

function finish(args, graph) {
    graph.tessellate(10);
    return graph.build(args.project);    
}

var ConstructRender = {

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
                // if (r() < 0.2) {
                //     a.x = Math.cos(angle) * (args.radius - tick - 3);
                //     a.y = Math.sin(angle) * (args.radius - tick - 3);
                //     circleShape = new THREE.Shape();
                //     circleShape.absarc(a.x, a.y, 1, 0, Math.PI * 2, false);
                //     graph.drawShapeLine(circleShape);
                // }
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

        return finish(args, graph);
    }

};

export default ConstructRender;