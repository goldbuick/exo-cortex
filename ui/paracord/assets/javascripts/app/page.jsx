// import Diver from 'app/diver';
import Dashboard from 'app/dashboard';
import ResizeContainer from 'app/resize-container';
// import FeedStore from 'app/feed-store';
import PoolStore from 'app/pool-store';
import QueueStatus from 'app/queue-status';

var Page = React.createClass({
    mixins: [
    ],
 
    render: function () {
        return <div>
            <div className="page-dashboard">
                <div className="top" />
                <div className="bottom" />
                <ResizeContainer><Dashboard /></ResizeContainer>
            </div>
            <QueueStatus />
        </div>;
    }
});

export default Page;
