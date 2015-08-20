define(function(require, exports, module) {
    'use strict';

    var collect = require('app/lib/collected-actions');

    module.exports = Reflux.createActions([
        'say',
        'info',
        // 'list',
        // 'wake',
        // 'roster',
        'history',
        'messages'
    ]);

    collect(module.exports, 'message', 'messages', 100);

});