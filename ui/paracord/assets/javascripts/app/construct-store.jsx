import ConstructActions from 'app/construct-actions';
import ConstructView from 'app/construct-view';

function test (construct) {

    // construct.push(new ConstructView({
    //     // base params?
    //     x: 0,
    //     y: 0,
    //     z: 128
    // },[{
    //     type: ConstructView.HALO,
    //     filter: {
    //         server: 'd === "irc.freenode.net"'
    //     },
    //     group: 'halfHour',
    //     params: {
    //         x: 0,
    //         y: 0,
    //         z: 0,

    //     }
    // },{

    // }]));

    /*
'chat', {
        // filters
        server: 'd === "irc.freenode.net"'
    }, {
        // records
        group: 'halfHour'
        // transform ?
    }, {
        // params
        type: ConstructView.HALO
        x, y, z coords


    })
    */
}

export default Reflux.createStore({
    listenables: [ ConstructActions ],
    
    init: function () {
        this.construct = [ ];
    },

    getInitialState: function () {
        return this.construct;
    }
});
