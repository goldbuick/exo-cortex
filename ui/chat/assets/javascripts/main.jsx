require([
    'app/page',
    'app/chatapi'
], function (Page) {
    'use strict';
    
    React.initializeTouchEvents(true);

    React.render(
        <Page />,
        document.body
    );
});
