require([
	'app/page'
], function (Page) {
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
	
	React.initializeTouchEvents(true);

	React.render(
		<Page />,
		document.body
	);
});
