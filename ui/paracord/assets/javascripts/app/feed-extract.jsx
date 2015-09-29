export default class FeedExtract {

    constructor (mapping, upstream) {
        this.mapping = mapping;
        this.upstream = upstream;
    }

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

    parse (records, capture, map, obj) {
        var self = this,
            finished = true,
            props = Object.keys(map);

        // need to fork
        if (Array.isArray(obj)) {
            obj.forEach(_obj => {
                self.parse(records, self.cloneCapture(capture), map, _obj);
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
                    self.parse(records, _capture, map[prop], obj[_prop]);
                });

            } else if (typeof map[prop] === 'string' && map[prop][0] === '$') {
                // value capture
                capture[map[prop]] = obj[prop];

            } else if (typeof map[prop] === 'object' && obj[prop] !== undefined) {
                // dive deeper 
                finished = false;
                self.parse(records, capture, map[prop], obj[prop]);
            }
        });

        if (finished) records.push(self.makeRecord(capture));
    }

    extract (obj) {
        var records = [ ];
        this.parse(records, { }, this.mapping, obj);
        return records;
    }

}
