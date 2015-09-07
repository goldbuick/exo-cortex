
// toolkit api

var config = require('./config'),
    httpjson = require('./httpjson'),
    httppost = require('./httppost'),
    uuid = require('node-uuid'),
    gupstream = undefined;

// standard event model

function Message (channel, type, data) {
    return {
        id: uuid.v4(),
        when: new Date().toISOString(),
        channel: channel,
        type: type,
        meta: data
    };
}

// shortcut to sending an event to a channel

function Channel (server, name) {
    this.name = name;
    this.server = server;
    this.handlers = { };
}

Channel.prototype = {
    constructor: Channel,

    message: function (type, handler) {
        this.handlers[type] = handler;
    },

    emit: function (type, data) {
        this.server.emit(this.name, type, data);
    }
};

// main helper class to handle api calls + emit events upstream

function Server (name) {
    var self = this;

    this.name = name;

    // these map to routes /hello/world etc...
    this.channels = { };

    // generic http post handler
    function jsonrequest (req, json, finish) {
        var url = req.url;
        
        // invoke config handler
        var result = self.configAPI.handler(url, json);
        if (result) return finish();

        // invoke generic handler
        if (self.onAny) {
            self.onAny(url, json);
        }

        // lookup specific handlers
        var channel,
            handler,
            route = url.split('/');

        route.shift();
        var _channel = route[0],
            _type = route[1];

        if (json) {
            // validate channel
            if (_channel) {
                channel = self.channels[_channel];
            }

            // validate type
            if (channel && _type) {
                handler = channel.handlers[_type];
            }

            // invoke handler
            if (handler) {
                // invoke handler
                return handler(json, finish);

            } else {
                self.upstream(json);

            }

        } else {
            // validate channel
            if (_channel) {
                channel = self.channels[_channel];
            }

            // validate type
            if (_type) {
                handler = channel.handlers[_type];
            }

            if (!channel) {
                // list channels
                return finish({
                    channels: Object.keys(self.channels)
                });

            } else if (!handler) {
                // list handlers
                return finish({
                    handlers: Object.keys(channel.handlers)
                });

            } else {
                // describe handler
                return handler(undefined, finish);

            }
        }

        finish();
    }

    // track current httpPort & http server instance
    this.httpPort = -1;
    this.http = undefined;  

    // create standard config api
    this.configAPI = config.createConfig(name);

    // handle config changes
    this.configAPI.updated(function (json) {
        // manage upstream state
        if (json.upstream !== undefined) {
            gupstream = json.upstream;
        }

        // manage http server state
        if (json.port !== undefined && json.port !== self.httpPort) {
            // kill existing server
            var restarted = false;
            if (self.http) {
                restarted = true;
                self.http.close();
            }

            // create http server
            self.http = httpjson(jsonrequest);

            // ready to start listening
            self.httpPort = json.port;
            // nodes only listen to localhost
            self.http.listen(json.port);

            // signal creation of http object
            if (self.onCreated) {
                self.onCreated(self.http, self.httpPort);
            }

            if (restarted) {
                // signal config-server to track new connection info
                self.config.start();

            } else {
                // signal state of routes handled to
                self.register();
            }
        }
    });
}

Server.prototype = {
    constructor: Server,

    // create a shortcut to send emit an event on a channel
    createChannel: function (name) {
        this.channels[name] = new Channel(this, name);
        return this.channels[name];
    },

    // create a standard json message
    createMessage: function (name, type, data) {
        // generate event
        return Message(name, type, data);
    },

    // called whenever the http server is created,
    // this will be called when the port is changed in config-server
    created: function (handler) {
        this.onCreated = handler;
    },

    // start the server, will first fetch config from config-server
    start: function () {
        // request config state
        this.configAPI.start();
    },

    // this is a catch-all handler for api / events
    any: function (handler) {
        this.onAny = handler;
    },

    // send an event upstream
    emit: function (name, type, data) {
        // generate event
        var json = this.createMessage(name, type, data);

        // transmit upstream
        this.upstream(json);        
    },

    // send json upstream
    upstream: function (json) {
        if (gupstream) {
            var path = (gupstream.path || '') + '/upstream';
            httppost(gupstream.host, gupstream.port, path, json);
        }
    },

    // node invoke a request off the terminal server
    request: function (json, success, failure) {
        if (gupstream) {
            var path = (gupstream.path || '') + '/terminal-server/request';
            httppost(gupstream.host, gupstream.port, path, json, success, failure);
        }
    },

    // generic http post
    post: function (host, port, path, json, success, failure) {
        httppost(host, port, path, json, success, failure);
    },

    // register handled api routes to config-server
    register: function () {
        var channels = this.channels,
            routes = [];

        // build a list of routes handled
        Object.keys(channels).forEach(function (_channel) {
            var channel = channels[_channel];
            Object.keys(channel.handlers).forEach(function (_handler) {
                routes.push([_channel, _handler].join('/'));
            });
        });
        
        this.configAPI.change('/routes', routes);
    },

    // used to validate & handle config changes
    config: function (path, rule, trigger) {
        this.configAPI.validate(path, rule, trigger);
    }
};

module.exports = {
    createServer: function (name) {
        return new Server(name);
    }
};




