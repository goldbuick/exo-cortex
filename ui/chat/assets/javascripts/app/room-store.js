define(function(require, exports, module) {
    'use strict';

    var RoomActions = require('app/room-actions'),
        MessageActions = require('app/message-actions');

    function getUnique() {
        return Array.prototype.slice.call(arguments).join(':');
    }

    function Room (origin, server, name) {
        this.info = { };
        this.users = { };
        this.origin = origin;
        this.server = server;
        this.name = name;
        MessageActions.lookup(['room', this.unique()], {
            origin: this.origin,
            server: this.server,
            room: this.name
        });
    }

    Room.prototype = {
        constructor: Room,
        group: function () {
            return getUnique(this.origin, this.server).toLowerCase();
        },
        unique: function () {
            return getUnique(this.origin, this.server, this.name);
        },
        setInfo: function (key, value) {
            this.info[key] = value;
        },
        getUsers: function () {
            return Object.keys(this.users);
        },
        usersJoin: function (users) {
            var self = this;
            users.forEach(function (user) {
                self.users[user] = true;
            });
        }
    };

    function RoomSet () {
        this.list = [ ];
    }

    RoomSet.prototype = {
        constructor: RoomSet,
        all: function () {
            return this.list;
        },
        find: function (origin, server, room) {
            var id = getUnique(origin || '', server || '', room || '');
            return this.list.filter(function (_room) {
                return _room.unique() === id;
            })[0];
        },
        add: function (origin, server, room) {
            if (room === undefined || room.length === 0) return;
            var _room = new Room(origin, server, room);
            this.list.push(_room);
            this.list.sort(function (a, b) {
                var id1group = a.group(),
                    id2group = b.group(),
                    id1name = a.info.name ? a.info.name : a.name,
                    id2name = b.info.name ? b.info.name : b.name;

                if (id1group === id2group) {
                    if (id1name < id2name) return -1;
                    if (id1name > id2name) return 1;
                    return 0;
                }

                if (id1group < id2group) return -1;
                if (id1group > id2group) return 1;
                return 0;
            });
            return _room;
        }
    };

    module.exports = Reflux.createStore({

        listenables: [ RoomActions ],

        getInitialState: function () {
            if (!this.rooms) this.rooms = new RoomSet();
            return this.rooms; 
        },

        onJoins: function (joins) {
            var delta = false;
            joins.forEach(function (join) {
                var _room = this.rooms.find(join.origin, join.server, join.room);
                if (_room) return;
                this.rooms.add(join.origin, join.server, join.room);
                delta = true;
            }.bind(this));
            if (delta) this.trigger(this.rooms);
        },

        onInfos: function (infos) {
            infos.forEach(function (info) {
                var _room = this.rooms.find(info.origin, info.server, info.room);
                if (!_room) _room = this.rooms.add(info.origin, info.server, info.room);
                if (!_room) return;
                Object.keys(info.info).forEach(function (prop) {
                    _room.info[prop] = info.info[prop];
                });
            }.bind(this));
            this.trigger(this.rooms);
        },

        onUsers: function (users) {
            users.forEach(function (join) {
                var _room = this.rooms.find(join.origin, join.server, join.room);
                if (!_room) _room = this.rooms.add(join.origin, join.server, join.room);
                if (!_room) return;
                _room.usersJoin([ join.user ]);
            }.bind(this));
            this.trigger(this.rooms);
        }

    });
});
