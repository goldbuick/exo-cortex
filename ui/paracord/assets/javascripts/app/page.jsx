import Dashboard from 'app/dashboard';
import InputText from 'app/input-text';
import QueueStatus from 'app/queue-status';
import ResizeContainer from 'app/resize-container';

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
            <InputText />
            <QueueStatus />
        </div>;
    }
});

export default Page;
