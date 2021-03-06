import FragmentActions from 'app/fragment-actions';

function uid (fragment) {
    return JSON.stringify(fragment);
}

var store = Reflux.createStore({
    listenables: [ FragmentActions ],

    init: function () {
        this.fragments = { };
    },

    getInitialState: function () {
        return this.fragments;
    },

    onAdd: function (items) {
        var self = this,
            fragments = items.filter(item => item.visible).map(item => item.meta);
        if (fragments.length === 0) return;

        fragments.forEach(fragment => {
            var id = uid(fragment);
            self.fragments[id] = fragment;
        });

        FragmentActions.capture();
        this.trigger(this.fragments);
    }

});

store.Message = 'Message';
store.Container = 'Container';

export default store;
