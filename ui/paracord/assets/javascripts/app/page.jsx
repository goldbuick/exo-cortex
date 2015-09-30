import Diver from 'app/diver';
import RenderTest from 'app/render-test';
import ResizeContainer from 'app/resize-container';
import FeedStore from 'app/feed-store';

var Page = React.createClass({
    mixins: [
    ],

    render: function () {
        return <div>
            <ResizeContainer>
                <RenderTest />
            </ResizeContainer>
            <Diver />
        </div>;
    }
});

export default Page;
