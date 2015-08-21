define(function(require, exports, module) {
    'use strict';

    var collect = require('app/lib/collected-actions');

    module.exports = Reflux.createActions([
        'joins',
        'infos'
    ]);
    
    collect(module.exports, 'join', 'joins', 100);
    collect(module.exports, 'info', 'infos', 100);

});