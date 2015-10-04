import Diver from 'app/diver';
import Dashboard from 'app/dashboard';
import ResizeContainer from 'app/resize-container';
import FeedStore from 'app/feed-store';
import QueueStatus from 'app/queue-status';

var Page = React.createClass({
    mixins: [
    ],

    render: function () {
        return <div>
            <div className="page-dashboard">
                <QueueStatus />
                <div className="top" />
                <div className="bottom" />
                <ResizeContainer><Dashboard /></ResizeContainer>
            </div>
            <div className="page-layout">
                <div className="page-left">
                    <Diver />
                </div>
                <div className="page-right closed">
                    <div>Testing... </div>
                </div>
            </div>
        </div>;
    }
});

export default Page;
