import Diver from 'app/diver';
import Dashboard from 'app/dashboard';
import ResizeContainer from 'app/resize-container';
import FeedStore from 'app/feed-store';

var Page = React.createClass({
    mixins: [
    ],

    render: function () {
        return <div>
            <ResizeContainer>
                <Dashboard />
            </ResizeContainer>
            <Diver />
        </div>;
    }
});

export default Page;
