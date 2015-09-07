
// collected event / message data api

function inject (collection, server, room, data) {
    if (collection[server] === undefined) {
        collection[server] = { };
    }
    if (collection[server][room] === undefined) {
        collection[server][room] = [ ];
    }
    collection[server][room].push(data);
}

function Collected (delay) {
    this.data = { };
    this.delay = delay || 100;
    this.timer = undefined;
    this.finish = this.finish.bind(this);
}

Collected.prototype = {
    constructor: Collected,

    push: function () {
        var key,
            cursor = this.data,
            list = arguments[arguments.length - 2],
            value = arguments[arguments.length - 1];

        for (var i=0; i < arguments.length - 2; ++i) {
            key = arguments[i];
            if (cursor[key] === undefined) {
                cursor[key] = { };
            }
            cursor = cursor[key];
        }
        if (cursor[list] === undefined) {
            cursor[list] = [ ];
        }
        cursor[list].push(value);

        clearTimeout(this.timer);
        this.timer = setTimeout(this.finish, this.delay);
    },

    finish: function () {
        if (this._on) {
            this._on(this.data);
        }
        this.data = { };
    },

    on: function (fn) {
        this._on = fn;
    }
};

module.exports = {
    create: function (delay) {
        return new Collected(delay);
    }
};
