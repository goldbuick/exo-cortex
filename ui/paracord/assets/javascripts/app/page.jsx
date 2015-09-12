define(function (require, exports, module) {
    'use strict';

    var RenderTest = require('./render-test'),
        ResizeContainer = require('./resize-container');

    var Page = React.createClass({
        mixins: [
        ],

        render: function () {
            return <div>
                <ResizeContainer>
                    <RenderTest />
                </ResizeContainer>
            </div>;
        }
    });

    return Page;
});
