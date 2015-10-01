import terminal from 'app/lib/terminal-server';
import FeedStore from 'app/feed-store';

var term;
terminal.on('upstream', message => {
    if (!term) return;
    term.echo(Object.keys(message).filter(prop => {
        return prop !== 'meta';
    }).map(prop => {
        return prop + ' => ' + JSON.stringify(message[prop]);
    }).join(', '));
});

var Diver = React.createClass({
    mixins: [
        Reflux.connect(FeedStore, 'feed'),
    ],

    componentDidMount: function () {
        var element = $(this.getDOMNode());

        term = element.terminal({
            help: function () {
            },
            // add: function(a, b) {
            //     this.echo(a + b);
            // },
            // foo: 'foo.php',
            // bar: {
            //     sub: function(a, b) {
            //         this.echo(a - b);
            //     }
            // }
        }, {
            greetings: false,
            height: 300,
            width: '100%',
            prompt: 'exo-paracord (>ಠ_ಠ)> ',
            keypress: function(e) {
                if (e.which == 96) {
                    return false;
                }
            }
        });
                
        var focus = false;
        term.addClass('closed');
        $(document.documentElement).keypress(function(e) {
            if (e.which == 96) {
                term.toggleClass('closed');
                term.focus(focus = !focus);
                term.attr({ scrollTop: term.attr('scrollHeight') });
                e.preventDefault();
            }
        });
    },

    componentWillUnmount: function () {
        if (term) {
            term.destroy();
            term = undefined;
        }
    },

    render: function () {
        return <div className="diver"></div>;
    }
});

export default Diver;
