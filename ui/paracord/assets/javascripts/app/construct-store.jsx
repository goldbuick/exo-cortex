import ConstructActions from 'app/construct-actions';
import ConstructView from 'app/construct-view';

function test (constructs) {

    // for (var i=0; i<5; ++i)
    constructs.push(new ConstructView('all.servers', [{
        viz: {
            type: ConstructView.TEXT,
            text: 'all.servers',
            scale: 0.5            
        }
    },{
        container: 'chat',
        group: 'byMinutes',
        range: {
            start: 'return Math.round(((new Date().valueOf() / 60000) - 1440) / 5)',
            end: 'return Math.round((new Date().valueOf() / 60000) / 5)'          
        },
        viz: {
            type: ConstructView.HALO,
            seed: 'all.servers',
            radius: 32,
            width: 20,
            tickMarks: 12
        }
    }]));

    constructs.push(new ConstructView('irc.freenode.net', [{
        viz: {
            type: ConstructView.TEXT,
            text: 'irc.freenode.net',
            scale: 0.5            
        }
    },{
        container: 'chat',
        dimensions: {
            server: 'd === "irc.freenode.net"'
        },
        group: 'byMinutes',
        range: {
            start: 'return Math.round(((new Date().valueOf() / 60000) - 1440) / 5)',
            end: 'return Math.round((new Date().valueOf() / 60000) / 5)'          
        },
        viz: {
            type: ConstructView.HALO,
            seed: 'irc.freenode.net',
            radius: 32,
            width: 20,
            tickMarks: 12
        }
    }]));

    constructs.push(new ConstructView('irc.afternet.org', [{
        viz: {
            type: ConstructView.TEXT,
            text: 'irc.afternet.org',
            scale: 0.5            
        }
    },{
        container: 'chat',
        dimensions: {
            server: 'd === "irc.afternet.org"'
        },
        group: 'byMinutes',
        range: {
            start: 'return Math.round(((new Date().valueOf() / 60000) - 1440) / 5)',
            end: 'return Math.round((new Date().valueOf() / 60000) / 5)'          
        },
        viz: {
            type: ConstructView.HALO,
            seed: 'irc.afternet.org',
            radius: 32,
            width: 20,
            tickMarks: 12
        }
    }]));

    // construct.push(new ConstructView({
    //     base: {
    //         x: Math.PI,
    //         y: 0.6,
    //         z: 0
    //     },
    //     graphs: [{
    //         container: 'travel',
    //         filter: { type: 'd === "gohome"' },
    //         dimension: 'minutes',
    //         base: { x: 0, y: 0, z: 10 },
    //         params: {
    //             type: ConstructView.TEXT,
    //             text: 'home in $text',
    //             scale: 0.5,
    //             list: 'return Math.round(d.duration / 60)'
    //         }
    //     },{
    //         container: 'travel',
    //         filter: { type: 'd === "gohome"' },
    //         dimension: 'minutes',
    //         base: { x: 0, y: 0, z: 0 },
    //         params: {
    //             type: ConstructView.HALO,
    //             seed: 'home in $text',
    //             radius: 32,
    //             width: 20,
    //             tickMarks: 144,
    //             list: 'return Math.round(d.duration / 60)'
    //         }
    //     }]
    // }));

    // construct.push(new ConstructView({
    //     base: {
    //         x: Math.PI * 1.5,
    //         y: -0.6,
    //         z: 0
    //     },
    //     graphs: [{
    //         container: 'travel',
    //         filter: { type: 'd === "gowork"' },
    //         dimension: 'minutes',
    //         base: { x: 0, y: 0, z: 10 },
    //         params: {
    //             type: ConstructView.TEXT,
    //             text: 'work in $text',
    //             scale: 0.5,
    //             list: 'return Math.round(d.duration / 60)'
    //         }
    //     },{
    //         container: 'travel',
    //         filter: { type: 'd === "gowork"' },
    //         dimension: 'minutes',
    //         base: { x: 0, y: 0, z: 0 },
    //         params: {
    //             type: ConstructView.HALO,
    //             seed: 'work in $text',
    //             radius: 32,
    //             width: 20,
    //             tickMarks: 144,
    //             list: 'return Math.round(d.duration / 60)'
    //         }
    //     }]
    // }));

}

export default Reflux.createStore({
    listenables: [
        ConstructActions
    ],
    
    init: function () {
        this.constructs = [ ];
        // test(this.constructs);
    },

    getInitialState: function () {
        return this.constructs;
    },

    onFeed: function (feed) {
        var update = false;

        this.constructs.forEach(construct => {
            if (construct.updateData(feed)) update = true;
        });

        if (update) this.trigger(this.constructs);
    }
});
