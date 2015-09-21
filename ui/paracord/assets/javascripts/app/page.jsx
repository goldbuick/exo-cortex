import RenderTest from './render-test';
import ResizeContainer from './resize-container';

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

export default Page;
