import Diver from 'app/diver';
import Dashboard from 'app/dashboard';
import ResizeContainer from 'app/resize-container';
import FeedStore from 'app/feed-store';

var Page = React.createClass({
    mixins: [
    ],

    render: function () {
        return <div>
            <div className="page-dashboard">
                <div className="top" />
                <div className="bottom" />
                <ResizeContainer>
                    <Dashboard />
                </ResizeContainer>
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
