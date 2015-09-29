import RenderTest from 'app/render-test';
import ResizeContainer from 'app/resize-container';
import FeedStore from 'app/feed-store';

var Page = React.createClass({
    mixins: [
    ],
                // <RenderTest />

    render: function () {
        return <div>
            <ResizeContainer>
            </ResizeContainer>
        </div>;
    }
});

export default Page;
