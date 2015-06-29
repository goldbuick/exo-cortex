define(function(require, exports, module) {
    'use strict';

    var socket,
        handlers = { },
        CONFIG_PORT = 7154,
        CONFIG_UPDATE_EVENT = '/config/update';

    var url = {
        base: window.location.protocol + '//' + window.location.hostname +
              (window.docker ? '' : ':' + CONFIG_PORT),
        path: (window.docker ? '/' + CONFIG_PORT : '') + '/socket.io'
    };
    console.log('socket info', url);

    require([ url.base + url.path + '/socket.io.js'], function (io) {
        socket = io(url.base, { path: url.path });

        // wire up cached handlers
        Object.keys(handlers).forEach(function (event) {
            handlers[event].forEach(function (handler) {
                socket.on(event, handler);
            });
        });

        handlers = { };
    });

    module.exports = {
        CONFIG_UPDATE_EVENT: CONFIG_UPDATE_EVENT,

        on: function (event, handler) {
            if (socket) {
                socket.on(event, handler);
                return;
            }

            if (!handlers[event]) {
                handlers[event] = [];
            }

            handlers[event].push(handler);
        },

        emit: function (event, data) {
            if (socket) {
                socket.emit(event, data);
            }
        }
    };
});