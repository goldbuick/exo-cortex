import Graph from 'app/graph';

export default function (project, args, meta, data) {
    if (data === undefined) return;

    // ARGS
    // seed - string
    // data - list of data samples
    // radius - when does the inner edge start
    // width - how thick is the halo
    // tickMarks - every x data samples

    var self = this,
        r = new alea(self.metaStr(meta, args.seed)),
        graph = new Graph(),
        angle = 0,
        a = new THREE.Vector3(0, 0, 0),
        b = new THREE.Vector3(0, 0, 0),
        step = Math.PI * 2 / data.length,
        range = Math.max.apply(Math, data);

    var w, peak, middle = Math.round(data.length * 0.5);
    var tick,
        tick1 = args.width * 0.8,
        tick2 = args.width * 0.4;
    for (var i=0; i < data.length; ++i) {
        a.x = Math.cos(angle) * args.radius;
        a.y = Math.sin(angle) * args.radius;
        w = (data[i] / range) * args.width;
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
                b.x = a.x + Math.cos(angle + Math.PI * -0.5) * tick * 0.57;
                b.y = a.y + Math.sin(angle + Math.PI * -0.5) * tick * 0.57;
                graph.drawLine([ a, b ]);                    
            }

            graph.drawSwipe (b.x, b.y, 0, 6, 2, 1);

        } else if (i % args.tickMarks === 0) {
            a.x = Math.cos(angle) * (args.radius - 4);
            a.y = Math.sin(angle) * (args.radius - 4);
            b.x = Math.cos(angle) * (args.radius - tick);
            b.y = Math.sin(angle) * (args.radius - tick);
            graph.drawLine([ a, b ]);
            if (r() < 0.2) {
                a.x = Math.cos(angle) * (args.radius - tick - 4);
                a.y = Math.sin(angle) * (args.radius - tick - 4);
                graph.drawFill (a.x, a.y, 0, 6, 1);
            }
            if (r() < 0.1) {
                a.x = Math.cos(angle) * (args.radius - tick - 7);
                a.y = Math.sin(angle) * (args.radius - tick - 7);
                graph.drawFill (a.x, a.y, 0, 6, 1);
            }
        }
        angle += step;
    }

    graph.drawSwipe (0, 0, 0, 64, args.radius - 2, 1);
    
    if (r() < 0.5) {
        graph.drawLoop (0, 0, 0, 64, args.radius - 3);
    }

    var object = self.finish(project, args, graph);

    if (object) {
        object.animIntro = function (value) {
            object.visible = Math.round(value * 100) % 4 === 0;
        };
    }

    return self.keep(object);    
}
