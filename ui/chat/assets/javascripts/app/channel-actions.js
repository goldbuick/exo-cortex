define(function(require, exports, module) {
    'use strict';

    module.exports = Reflux.createActions([
        'joinChannel',
        'leaveChannel',
        'topic',
        'users',
        'usersJoin',
        'usersPart'
    ]);

});