
// helper functions for rethinkdb

var r = require('rethinkdb');

function check (err) {
    if (!err) return false;

    console.log('rethinkdb error', err);
    return true;
}

function Wrapper (db, table) {
    this.db = db;
    this.table = table;
    this.conn = undefined;
}

Wrapper.prototype = {
    constructor: Wrapper,

    q: function () {
        return r.table(this.table);
    },

    run: function (qobj, callback) {
        qobj.run(this.conn, callback);
    },

    ready: function (callback) {
        this.onReady = callback;
    },

    check: function (err) {
        return check(err);
    },

    connect: function (host, port) {
        var self = this;
        this.conn = undefined;

        function createdb (next) {
            r.dbCreate(self.db).run(self.conn, function (err) {
                next();
            });
        }

        function createtable (next) {
            r.tableCreate(self.table).run(self.conn, function (err) {
                next();
            });
        }

        r.connect({
            host: host,
            port: port,
            db: this.db            
        }, function (err, conn) {
            if (check(err)) return;

            self.conn = conn;
            createdb(function () {
                createtable(function () {
                    console.log('rethinkdb connected', self.db, self.table);
                    if (self.onReady) self.onReady();
                });
            });
        });
    }
};

module.exports = {
    create: function (db, table) {
        return new Wrapper(db, table);
    }
};
