import InputActions from 'app/input-actions';

export default Reflux.createStore({
    listenables: [
        InputActions
    ],

    init: function () {
        this.input = {
            rid: 0,
            open: false,
            value: ''
        };
    },

    getInitialState: function () {
        return this.input;
    },

    onDidRequest: function (rid, value) {
        this.input.rid = rid;
        this.input.open = true;
        this.input.value = value;
        this.trigger(this.input);
    },

    onChange: function (rid, value) {
        this.input.value = value;
        this.trigger(this.input);
    },

    onDone: function (rid, value) {
        this.input.open = false;
        this.trigger(this.input);
    }

});