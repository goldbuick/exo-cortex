define(function(require, exports, module) {
    'use strict';

    var terminal = require('app/lib/terminal-server'),
        UserActions = require('app/user-actions'),
        RoomActions = require('app/room-actions'),
        MessageActions = require('app/message-actions');

    var groupScale = 20,
        toMinutes = 60000;

    module.exports = Reflux.createStore({
        listenables: [ MessageActions ],

        getInitialState: function () {
            if (!this.messages) {
                this.unique = { };
                this.db = crossfilter();
                this.messages = {
                    reset: function () {
                        this.origin.filterAll();
                        this.server.filterAll();
                        this.room.filterAll();
                        this.minutes.filterAll();
                        this.user.filterAll();
                    },
                    origin: this.db.dimension(function (d) {
                        return d.origin;
                    }),
                    server: this.db.dimension(function (d) {
                        return d.server;
                    }),
                    room: this.db.dimension(function (d) {
                        return d.room;
                    }),
                    minutes: this.db.dimension(function (d) {
                        return d.minutes;
                    }),
                    user: this.db.dimension(function (d) {
                        return d.user;
                    })
                };
                this.messages.groupByMinutes = this.messages.minutes.group(function (d) {
                    return Math.floor(d / groupScale);
                });
            }
            return this.messages;
        },

        onLookups: function (lookups) {
            var batch = { };
            lookups.forEach(function (lookup) {
                if (batch[lookup.origin] === undefined) {
                    batch[lookup.origin] = { };
                }
                if (batch[lookup.origin][lookup.server] === undefined) {
                    batch[lookup.origin][lookup.server] = {
                        rooms: [ ],
                        users: [ ]
                    };
                }
                if (lookup.room) batch[lookup.origin][lookup.server].rooms.push(lookup.room);
                if (lookup.user) batch[lookup.origin][lookup.server].users.push(lookup.user);
            });

            Object.keys(batch).forEach(function (origin) {
                Object.keys(batch[origin]).forEach(function (server) {
                    var lookup = batch[origin][server];
                    terminal.emit('request', {
                        route: 'chat/info',
                        json: {
                            origin: origin,
                            server: server,
                            rooms: lookup.rooms,
                            users: lookup.users
                        }
                    });
                });
            });
        },

        onSay: function (origin, server, room, text) {
            terminal.emit('request', {
                route: 'chat/say',
                json: {
                    origin: origin,
                    server: server,
                    room: room,
                    text: text
                }
            });
        },

        onHistory: function () {
            var end = new Date(),
                start = new Date();
            start.setDate(start.getDate() - 1);

            terminal.emit('request', {
                route: 'chat/history',
                json: {
                    startDate: start.toISOString(),
                    endDate: end.toISOString()
                }
            });
        },

        checkMessage: function (message) {
            // check for dupes
            if (this.unique[message.id]) return false;
            this.unique[message.id] = true;
            // turn when into a date object
            message.when = new Date(message.when);
            // minutes since epoch
            message.minutes = message.when.getTime() / toMinutes;
            // return that this is a unique record
            return true;
        },

        onMessages: function (messages) {
            var added = messages.filter(function (message) {
                return this.checkMessage(message);
            }.bind(this));

            if (added.length) {
                this.db.add(added);
                this.trigger(this.messages);
            }
        }
    });

    // parse events from terminal server
    function onEvent (event) {
        switch (event.type) {
            default:
                console.log(event.type, event.meta);
                break;

            case 'error':
                // chatError (origin, server, text)
                console.log('error', event.meta);
                break;

            case 'info':
                Object.keys(event.meta.servers).forEach(function (server) {
                    event.meta.servers[server].forEach(function (info) {
                        if (info.room) {
                            RoomActions.info([event.meta.origin, server, info.room], {
                                origin: event.meta.origin,
                                server: server,
                                room: info.room,
                                info: info.info
                            });
                        }
                        if (info.user) {
                            UserActions.info([event.meta.origin, server, info.user], {
                                origin: event.meta.origin,
                                server: server,
                                user: info.user,
                                info: info.info
                            });
                        }
                    });
                });
                break;

            case 'message':
                Object.keys(event.meta.servers).forEach(function (server) {
                    Object.keys(event.meta.servers[server]).forEach(function (room) {
                        event.meta.servers[server][room].forEach(function (message) {
                            MessageActions.message({
                                id: event.id,
                                when: event.when,
                                origin: event.meta.origin,
                                server: server,
                                room: room,
                                user: message.user,
                                text: message.text
                            });
                            RoomActions.join([event.meta.origin, server, room], {
                                origin: event.meta.origin,
                                server: server,
                                room: room
                            });
                            RoomActions.user([event.meta.origin, server, room, message.user], {
                                origin: event.meta.origin,
                                server: server,
                                room: room,
                                user: message.user
                            });
                            UserActions.lookup([event.meta.origin, server, message.user], {
                                origin: event.meta.origin,
                                server: server,
                                user: message.user
                            });
                        });
                    });
                });
                break;
        }
    }

    // event handlers from terminal server    
    terminal.on('api', function (api) {
        if (api.indexOf('chat/history') !== -1) {
            MessageActions.history();
        }
    });
    terminal.on('chat', function (event) {
        onEvent(event);
    });
    terminal.on('response', function (response) {
        if (response.channel !== 'success' ||
            response.type !== 'chat/history') return;
        response.meta.forEach(onEvent);
    });

    module.exports.groupScale = groupScale;
    module.exports.toMinutes = toMinutes;
});
