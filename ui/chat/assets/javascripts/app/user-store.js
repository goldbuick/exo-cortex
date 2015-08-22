define(function(require, exports, module) {
    'use strict';

    var UserActions = require('app/user-actions'),
        MessageActions = require('app/message-actions');

    function getUnique() {
        return Array.prototype.slice.call(arguments).join(':');
    }

    function User(origin, server, name) {
        this.info = { };
        this.origin = origin;
        this.server = server;
        this.name = name;
        MessageActions.lookup(['user', this.unique()], {
            origin: this.origin,
            server: this.server,
            user: this.name
        });        
    }

    User.prototype = {
        constructor: User,
        unique: function () {
            return getUnique(this.origin, this.server, this.name);
        },
        group: function () {
            return getUnique(this.origin, this.server).toLowerCase();
        }
    };

    function UserSet () {
        this.list = [ ];
    }

    UserSet.prototype = {
        constructor: UserSet,
        all: function () {
            return this.list;
        },
        find: function (origin, server, user) {
            var id = getUnique(origin || '', server || '', user || '');
            return this.list.filter(function (_user) {
                return _user.unique() === id;
            })[0];
        },
        add: function (origin, server, user) {
            var _user = new User(origin, server, user);
            this.list.push(_user);
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
            return _user;
        }
    };

    module.exports = Reflux.createStore({

        listenables: [ UserActions ],

        getInitialState: function () {
            if (!this.users) this.users = new UserSet();
            return this.users; 
        },

        onInfos: function (infos) {
            infos.forEach(function (info) {
                var _user = this.users.find(info.origin, info.server, info.user);
                if (!_user) _user = this.users.add(info.origin, info.server, info.user);
                Object.keys(info.info).forEach(function (prop) {
                    _user.info[prop] = info.info[prop];
                });
            }.bind(this));
            this.trigger(this.users);
        },

        onLookups: function (lookups) {
            var delta = false;
            lookups.forEach(function (lookup) {
                var _user = this.users.find(lookup.origin, lookup.server, lookup.user);
                if (_user) return;
                this.users.add(lookup.origin, lookup.server, lookup.user);
                delta = true;
            }.bind(this));
            if (delta) this.trigger(this.users);
        }
    });

});