define(function(require, exports, module) {
	'use strict';

	var socket,
		handlers = { },
		LISTEN_PORT = 7154,
		CONFIG_UPDATE_EVENT = '/config/update',
		socketURL = window.location.protocol + '//' + window.location.hostname + ':' + LISTEN_PORT;

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

	module.exports = {
		CONFIG_UPDATE_EVENT: CONFIG_UPDATE_EVENT,
		
		url: socketURL,

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