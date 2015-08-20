define(function(require, exports, module) {
    'use strict';

    function Collected () {
        this.isarray = true;
        this.queue = undefined;
    }

    Collected.prototype = {
        constructor: Collected,

        push: function () {
            if (this.queue === undefined) {
                if (arguments.length === 1) {
                    this.isarray = true;
                    this.queue = [ ];
                } else {
                    this.isarray = false;
                    this.queue = { };
                }
            }
            if (this.isarray) {
                this.queue.push(arguments[0]);
            } else {
                this.queue[arguments[0]] = arguments[1];
            }
        },

        reset: function () {
            if (this.isarray) {
                this.queue = [ ];
            } else {
                this.queue = { };
            }
        },

        length: function () {
            if (this.isarray) return this.queue.length;
            return Object.keys(this.queue).length;
        },

        values: function () {
            if (this.isarray) return this.queue;
            return Object.keys(this.queue).map(function (prop) {
                return this.queue[prop];
            }.bind(this));
        }
    };

    var unique = 1;
    module.exports = function (obj, name, target, delay, cap) {        
        ++unique;
        var queueName = 'collected-' + unique;

        obj[queueName] = new Collected();
        obj[name] = function () {
            // add to queue
            if (arguments.length === 1) {
                obj[queueName].push(arguments[0]);
            } else {
                obj[queueName].push(arguments[0], arguments[1]);
            }

            // get queue length
            var length = obj[queueName].length();

            // do we have a cap ?
            if (cap && length >= cap) {
                // send action now
                obj[target].call(obj, obj[queueName].values());
                obj[queueName].reset();

            } else {
                // kick off completion timer
                clearTimeout(obj[queueName].timer);
                obj[queueName].timer = setTimeout(function() {
                    obj[target].call(obj, obj[queueName].values());
                    obj[queueName].reset();
                }, delay);
            }
        };
    };

});