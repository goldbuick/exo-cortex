define(function(require, exports, module) {
    'use strict';

    var collect = require('app/collected-actions');

    module.exports = Reflux.createActions([
        'batchRequest',
        'response',
        'next'
    ]);

    collect(module.exports, 'request', 'batchRequest', 256);

});