var uid = 0;
class ConstructView {

    constructor (args) {
        var self = this;
        self.uid = ++uid;

        var gid = 0;
        self.graphs = args.map(graph => {
            graph.uid = ++gid;

            // compile graph dimension filters
            if (graph.dimensions) {
                Object.keys(graph.dimensions).forEach(prop => {
                    graph.dimensions[prop] = new Function('d', 'return ' + graph.dimensions[prop]);
                });
            }

            // compile data collectors
            if (graph.range) {
                Object.keys(graph.range).forEach(prop => {
                    graph.range[prop] = new Function(graph.range[prop]);
                });
            }
            if (graph.list) {
                graph.list = new Function('d', graph.list);
            }

            // setup values
            graph.view = { };

            // return config'd graph object
            return graph;
        });
    }

    updateData (feed) {
        var self = this;
        if (self.graphs === undefined) return false;

        let updated = false;
        self.graphs.forEach(graph => {
            // clear data
            graph.view.lastData = JSON.stringify(graph.view.data);
            graph.view.data = [ ];

            // select container
            let container = feed[graph.container];
            if (container) {
                // apply dimension filters
                container.reset();
                if (graph.dimensions) {
                    Object.keys(graph.dimensions).forEach(prop => {
                        let dimension = container.dimensions[prop];
                        if (dimension === undefined) return;
                        dimension.filterFunction(graph.dimensions[prop]);
                    });
                }

                // process data
                if (graph.range) {
                    // query group
                    let group = container.groups[graph.group];
                    if (group) {
                        let start = graph.range.start();
                        let end = graph.range.end();
                        let values = { };
                        group.all().forEach(record => {
                            if (record.key >= start && record.key <= end)
                                values[record.key - start] = record.value;
                        });
                        for (let i=0; i <= (end - start); ++i) {
                            graph.view.data.push(values[i] || 0);
                        }
                        updated = true;
                    }
                }

                if (graph.list) {
                    // query dimension
                    let dimension = container.dimensions[graph.dimension];
                    if (dimension) {
                        dimension.top(Infinity).forEach(record => {
                            graph.view.data.push(graph.list(record));
                            if (graph.meta === undefined) graph.meta = record;
                        });
                    }
                    updated = true;
                }
            }

            // track changes
            if (graph.view.lastData !== JSON.stringify(graph.view.data)) {
                graph.view.changed = Math.random() * 100000000;
            }
        });

        return updated;
    }

}

// display a centered string 
ConstructView.TEXT = 'text';
// a bar graph in terms of a ring
ConstructView.HALO = 'halo';
// used to show the path of a graph from point a to b
ConstructView.TRACK = 'track';
// a generated drawing based on a seed string
ConstructView.PICO = 'pico';

export default ConstructView;