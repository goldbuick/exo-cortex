
// toolkit config api

var LISTEN_PORT = 7154,
    CONFIG_UPDATE_URL = '/config/update',
    url = require('url'),
    argv = require('yargs').argv,
    httppost = require('./httppost');

function Config(name) {
    // lookup key in root config
    this.name = name;

    // validation rules
    this.rules = { };

    // on change triggers
    this.triggers = { };

    // track previous flattened state
    this.before = { };
}

Config.prototype = {
    constructor: Config,

    updated: function (handler) {
        this.onUpdated = handler;
    },

    post: function (path, data, success, fail) {
        if (!this.control) {
            this.control = url.parse('http://' + argv.control);
        }
        httppost(this.control.hostname, this.control.port, this.control.path + path, data, success, fail);
    },

    handler: function (url, json) {
        if (url !== CONFIG_UPDATE_URL) return false;

        var changed = this.checkJson(json);

        if (this.onUpdated) {
            this.onUpdated(json);
        }

        if (changed) {
            this.change('', json);
        }

        return true;
    },

    start: function () {
        var self = this;
        this.post('start', {
            name: this.name
        }, function (json) {
            self.handler(CONFIG_UPDATE_URL, json);
        });
    },

    change: function (path, value) {
        this.post('set', {
            path: this.name + path,
            value: value
        });
    },

    typeOf: function (value) {
        var type = typeof value;

        // extra check for array
        if (type === 'object') {
            if (Array.isArray(value)) type = 'array';

        } else if (type !== 'undefined') {
            type = 'value';

        }

        return type;
    },

    flatten: function (result, parent, key, path, cursor) {
        var self = this,
            type = this.typeOf(cursor);

        result[path] = {
            parent: parent,
            key: key,
            value: cursor
        };

        if (type === 'array') {
            cursor.forEach(function (value, index) {
                self.flatten(result, cursor, index, path + '/' + index, value);
            });

        } else if (type === 'object') {
            Object.keys(cursor).forEach(function (key) {
                self.flatten(result, cursor, key, path + '/' + key, cursor[key]);
            });
        }
    },

    checkPatterns: function (lookup, fn) {
        var patterns = Object.keys(this.rules);

        Object.keys(lookup).forEach(function (path) {
            patterns.forEach(function (pattern) {
                var result = path.match(pattern);
                if (result && result[0].length === path.length) {
                    fn(path, pattern);
                }
            });
        });
    },

    checkJson: function (json) {
        var self = this,
            changed = false;

        var lookup = [];
        this.flatten(lookup, undefined, '', '', json);
        this.checkPatterns(lookup, function (path, pattern) {
            try {
                if (self.checkMatch(lookup[path], self.rules[pattern])) {
                    changed = true;
                }

            } catch (e) {
                console.log('config rule', pattern, e);
            }
        });

        lookup = [];
        this.flatten(lookup, undefined, '', '', json);
        this.checkPatterns(lookup, function (path, pattern) {
            var before;

            if (self.triggers[pattern] !== undefined) {
                try {
                    if (self.before[path] === undefined) {
                        self.triggers[pattern](lookup[path].value, undefined);

                    } else if (self.before[path] !== JSON.stringify(lookup[path].value)) {
                        self.triggers[pattern](lookup[path].value, JSON.parse(self.before[path]));

                    }

                } catch (e) {
                    console.log('config trigger', pattern, e);
                }
            }
        });

        this.before = { };
        Object.keys(lookup).forEach(function (path) {
            self.before[path] = JSON.stringify(lookup[path].value);
        });

        return changed;
    },

    checkMatch: function (value, rule) {
        var type = this.typeOf(value.value),
            start = JSON.stringify(value.value);

        var changed = false,
            result = rule(type, value.value);

        if (type === 'value') {
            if (result !== undefined) {
                changed = true;
                value.parent[value.key] = result;
            }

        } else {
            if (result !== undefined) {
                changed = true;
                value.parent[value.key] = result;

            } else {
                changed = start !== JSON.stringify(value.value);
            }

        }

        return changed;
    },

    validate: function (pathRegex, rule, trigger) {
        this.rules[pathRegex] = rule;
        this.triggers[pathRegex] = trigger;
    }
};

module.exports = {
    LISTEN_PORT: LISTEN_PORT,
    CONFIG_UPDATE_URL: CONFIG_UPDATE_URL,

    createConfig: function (name) {
        return new Config(name);
    }
};
