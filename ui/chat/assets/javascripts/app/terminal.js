define(function(require, exports, module) {
    'use strict';

    // terminal server port
    var TERMINAL_PORT = 26154,
        terminalUrl = '//' + window.location.hostname;
    terminalUrl += (window.docker ? '/' : ':') + TERMINAL_PORT;

    // socket connection to terminal
    var socket,
        handlers = { };

    require([ terminalUrl + '/socket.io/socket.io.js'], function (io) {
        socket = io(terminalUrl);

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