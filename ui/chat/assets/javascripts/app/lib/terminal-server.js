define(function(require, exports, module) {
    'use strict';

    // socket connection to terminal
    var socket,
        handlers = { },
        TERMINAL_PORT = 26154;
        
    var url = {
        base: window.location.protocol + '//' + window.location.hostname +
              (window.docker ? '' : ':' + TERMINAL_PORT),
        path: (window.docker ? '/' + TERMINAL_PORT : '') + '/socket.io'
    };
    // console.log('socket info', url);

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