import QueueStore from 'app/queue-store';

var Page = React.createClass({
    mixins: [
        Reflux.connect(QueueStore, 'queue'),
    ],

    render: function () {
        if (this.state.queue) {
            return <div className="queue">{this.state.queue}</div>;
        }
        return <div className="queue"></div>;
    }
});

export default Page;
