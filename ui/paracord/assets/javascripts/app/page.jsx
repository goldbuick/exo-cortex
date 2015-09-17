import RenderTest from './render-test';
import ResizeContainer from './resize-container';

export Page React.createClass({
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
