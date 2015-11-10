import QueueStore from 'app/queue-store';

var QueueStatus = React.createClass({
    mixins: [
        Reflux.connect(QueueStore, 'queue'),
    ],

    render: function () {
        var total = this.state.queue.pool + this.state.queue.feed,
            status = {
                width: Math.round(total / 32) + 'px'
            };

        var anim;
        if (this.state.queue.pool === -1) {
            anim = 'queue hidden';
        } else {
            anim = (total > 10) ? 'queue animated fadeIn' : 'queue animated fadeOut';
        }

        return <div className={anim}>
            <div className="logo"><img src="/media/exo-paracord.png" /></div>
            <div className="bar" style={status}></div>
        </div>
    }

});

export default QueueStatus;
