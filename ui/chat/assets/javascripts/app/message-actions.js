define(function(require, exports, module) {
    'use strict';

    var collect = require('app/lib/collected-actions');

    module.exports = Reflux.createActions([
        'say',
        'lookups',
        'history',
        'messages'
    ]);

    collect(module.exports, 'lookup', 'lookups', 100);
    collect(module.exports, 'message', 'messages', 100);

});