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

            // query group
            var group = container.groups[graph.group];
            if (!group) return;

            // clear data
            graph.lastData = JSON.stringify(graph.params.data);
            graph.params.data = [ ];

            // process data
            if (graph.params.range) {
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

            graph.newData = JSON.stringify(graph.params.data);
            graph.params.changed = (graph.lastData !== graph.newData);
        });

        return updated;
    }

}

// a bar graph in terms of a ring
ConstructView.HALO = 'HALO';
// used to show the path of a graph from point a to b
ConstructView.TRACK = 'TRACK';
// a generated drawing based on a seed string
ConstructView.PICO = 'PICO';

export default ConstructView;