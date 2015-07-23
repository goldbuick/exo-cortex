define(function(require, exports, module) {
    'use strict';

    var unique = 1;
    module.exports = function (obj, name, target, delay) {        
        ++unique;
        var timerName = 'collected-' + unique,
            queueName = 'collected-data-' + unique;

        obj[name] = function () {
            // make queue as needed            
            if (!obj[queueName]) obj[queueName] = [ ];

            // add data to queue, only support a single arg
            obj[queueName].push(arguments[0]);

            // kick off completion timer
            clearTimeout(obj[timerName]);
            obj[timerName] = setTimeout(function() {
                obj[target].call(obj, obj[queueName]);
                obj[queueName] = [ ];
            }, delay);
        };
    };

});