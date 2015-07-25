define(function(require, exports, module) {
    'use strict';

    var collect = require('app/lib/collected-actions');

    module.exports = Reflux.createActions([
        'listen',
        'leave',
        'info',
        'userName',
        'usersJoin',
        'usersLeave'
    ]);

});