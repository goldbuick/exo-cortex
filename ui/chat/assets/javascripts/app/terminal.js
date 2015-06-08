define(function(require, exports, module) {
    'use strict';

    $.postJSON = function(url, data, callback) {
        return jQuery.ajax({
            type: 'POST',
            url: url,
            data: JSON.stringify(data),
            dataType: 'json',
            success: callback
        });
    };  

    // config server port
    var CONFIG_PORT = 7154,
        configUrl = '//' + window.location.hostname + ':' + CONFIG_PORT;

    // socket connection to terminal
    var socket,
        handlers = { };

    // discover terminal-server connection info
    $.postJSON(configUrl + '/terminal', {}, function(res) {
        if (!res.port) return;

        var socketURL = '//' + window.location.hostname + ':' + res.port;
        require([ socketURL + '/socket.io/socket.io.js'], function (io) {
            socket = io(socketURL);

            // wire up cached handlers
            Object.keys(handlers).forEach(function (event) {
                handlers[event].forEach(function (handler) {
                    socket.on(event, handler);
                });
            });

            handlers = { };
        });
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