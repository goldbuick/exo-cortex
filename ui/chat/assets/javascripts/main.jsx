require([
    'app/page'
], function (Page) {
    'use strict';
    
    React.initializeTouchEvents(true);

    React.render(
        <Page />,
        document.body
    );
});
