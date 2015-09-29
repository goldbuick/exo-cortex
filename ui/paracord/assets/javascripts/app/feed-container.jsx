export default class FeedContainer {

    constructor (format, capture, dimensions, groups) {
        var self = this;

        // result data
        self.meta = { };
        self.db = crossfilter();
        
        // transform incoming records
        self.format = { };
        Object.keys(format).forEach(prop => {
            self.format[prop] = new Function('d', 'return ' + format[prop]);
        });

        // capture transformed record into meta-data
        self.capture = { };
        Object.keys(capture).forEach(prop => {
            self.capture[prop] = new Function('d', 'return ' + capture[prop]);
        });

        // be able to filter data
        self.dimensions = { };
        Object.keys(dimensions).forEach(prop => {
            var func = new Function('d', 'return ' + dimensions[prop]);
            self.dimensions[prop] = self.db.dimension(func);
        });

        // be able to group data
        self.groups = { };
        Object.keys(groups).forEach(prop => {
            var from = groups[prop][0],
                func = new Function('d', 'return ' + groups[prop][1]);
            self.groups[prop] = self.dimensions[from].group(func);
        });
    }

    map (record) {
        var self = this;
        
        // apply format
        var data = { };
        Object.keys(self.format).forEach(prop => {
            data[prop] = self.format[prop](record);
        });

        // execute capture to meta
        Object.keys(self.capture).forEach(prop => {
            self.meta[prop] = self.capture[prop](data);
        });

        // add to cross filter
        self.db.add([ data ]);
    }

}
