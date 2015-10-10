class ConstructView {

    constructor (args) {
        var self = this;
        Object.keys(args).forEach(prop => {
            self[prop] = args[prop];
        });

        self.graphs.forEach(graph => {
            // compile graph filters
            Object.keys(graph.filter).forEach(prop => {
                graph.filter[prop] = new Function('d', 'return ' + graph.filter[prop]);
            });

            // compile params
            if (graph.params.range) {
                Object.keys(graph.params.range).forEach(prop => {
                    graph.params.range[prop] = new Function(graph.params.range[prop]);
                });
            }
            if (graph.params.list) {
                graph.params.list = new Function('d', graph.params.list);
            }
        });
    }

    update (feed) {
        var updated = false;

        this.graphs.forEach(graph => {
            var container = feed.containers[graph.container];
            if (!container || !graph.params) return;
            
            // apply filters
            container.resetFilters();
            Object.keys(graph.filter).forEach(prop => {
                var dimension = container.dimensions[prop];
                if (dimension) {
                    dimension.filterFunction(graph.filter[prop]);
                }
            });

            // clear data
            graph.lastData = JSON.stringify(graph.params.data);
            graph.meta = undefined;
            graph.params.data = [ ];

            // process data
            if (graph.params.range) {
                // query group
                let group = container.groups[graph.group];
                if (group) {
                    let start = graph.params.range.start();
                    let end = graph.params.range.end();
                    let values = { };
                    group.all().forEach(record => {
                        values[record.key - start] = record.value;
                    });
                    for (let i=0; i <= (end - start); ++i) {
                        graph.params.data.push(values[i] || 0);
                    }
                    updated = true;
                }
            }

            if (graph.params.list) {
                // query dimension
                let dimension = container.dimensions[graph.dimension];
                if (dimension) {
                    dimension.top(Infinity).forEach(record => {
                        graph.params.data.push(graph.params.list(record));
                        if (graph.meta === undefined) graph.meta = record;
                    });
                }
                updated = true;
            }

            if (graph.meta === undefined) {
                graph.meta = { };
            }

            graph.newData = JSON.stringify(graph.params.data);
            graph.params.changed = (graph.lastData !== graph.newData);
        });

        return updated;
    }

}

// display a centered string 
ConstructView.TEXT = 'TEXT';
// a bar graph in terms of a ring
ConstructView.HALO = 'HALO';
// used to show the path of a graph from point a to b
ConstructView.TRACK = 'TRACK';
// a generated drawing based on a seed string
ConstructView.PICO = 'PICO';

export default ConstructView;