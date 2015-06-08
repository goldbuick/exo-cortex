require([
    'app/page',
    'app/chatevents'
], function (Page) {
    'use strict';
    
    React.initializeTouchEvents(true);

    React.render(
        <Page />,
        document.body
    );
});
