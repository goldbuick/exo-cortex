export default class FeedContainer {

    constructor (args) {
        var self = this;

        self.queue = [ ];
        self.unique = { };
        self.match = args.match;
        self.extract = args.extract;
        
        self.db = crossfilter();
        self.format = { };
        Object.keys(args.format).forEach(prop => {
            self.format[prop] = new Function('d', 'return ' + args.format[prop]);
        });
        self.dimensions = { };
        Object.keys(args.dimensions).forEach(prop => {
            var func = new Function('d', 'return ' + args.dimensions[prop]);
            self.dimensions[prop] = self.db.dimension(func);
        });
        self.groups = { };
        Object.keys(args.groups).forEach(prop => {
            var from = args.groups[prop][0],
                func = new Function('d', 'return ' + args.groups[prop][1]);
            self.groups[prop] = self.dimensions[from].group(func);
        });
    }

    reset () {
        var self = this;
        Object.keys(self.dimensions).forEach(prop => {
            self.dimensions[prop].filterAll();
        });
    }

    add (pool) {
        var self = this,
            matches = this.matchRecords(pool);
        if (matches.length === 0) return false;

        var records = [ ];
        this.extractRecords(records, { }, this.extract, matches);
        if (records.length === 0) return false;

        // FORMAT

        var formatted = records.map(record => {
            var data = { };
            Object.keys(self.format).forEach(prop => {
                data[prop] = self.format[prop](record);
            });
            return data;
        });

        // DB
        
        self.db.add(formatted);
        return true;
    }

    // MATCH

    matchRecords (pool) {
        var self = this,
            matched = [ ];

        // match phase
        self.match.forEach(rule => {
            pool.reset();
            pool.id.filter(d => self.unique[d] === undefined);
            Object.keys(rule).forEach(prop => {
                pool[prop].filterExact(rule[prop]);
            });
            matched.push.apply(matched, pool.all());
        });

        matched.forEach(d => {
            self.unique[d.id] = true;
        });

        return matched;
    }

    // EXTRACT

    cloneCapture (obj) {
        var _obj = { };
        Object.keys(obj).forEach(prop => {
            _obj[prop] = obj[prop];
        });
        return _obj;
    }

    makeRecord (obj) {
        var _obj = { };
        Object.keys(obj).forEach(prop => {
            _obj[prop.substring(1)] = obj[prop];
        });
        return _obj;
    }

    extractRecords (records, capture, map, obj) {
        var self = this,
            finished = true,
            props = Object.keys(map);

        // need to fork
        if (Array.isArray(obj)) {
            obj.forEach(_obj => {
                self.extractRecords(records, self.cloneCapture(capture), map, _obj);
            });
            return;
        }

        props.forEach(prop => {
            if (prop[0] === '$') {
                // key capture, this will fork
                finished = false;
                Object.keys(obj).forEach(_prop => {
                    var _capture = self.cloneCapture(capture);
                    _capture[prop] = _prop;
                    self.extractRecords(records, _capture, map[prop], obj[_prop]);
                });

            } else if (typeof map[prop] === 'string' && map[prop][0] === '$') {
                // value capture
                capture[map[prop]] = obj[prop];

            } else if (typeof map[prop] === 'object' && obj[prop] !== undefined) {
                // dive deeper 
                finished = false;
                self.extractRecords(records, capture, map[prop], obj[prop]);
            }
        });

        if (finished) records.push(self.makeRecord(capture));
    }

}
