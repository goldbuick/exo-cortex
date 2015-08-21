define(function(require, exports, module) {
    'use strict';

    var collect = require('app/lib/collected-actions');

    module.exports = Reflux.createActions([
        'infos',
        'lookups'
    ]);

    collect(module.exports, 'info', 'infos', 100);
    collect(module.exports, 'lookup', 'lookups', 100);

});