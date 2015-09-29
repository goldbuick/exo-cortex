import ConstructActions from 'app/construct-actions';

export default Reflux.createStore({
    listenables: [ ConstructActions ],
    
    init: function () {
        this.construct = [ ];
    },

    getInitialState: function () {
        return this.construct;
    }
});
