
var actions = Reflux.createActions([
    'didRequest',
    'change',
    'done'
]);

var rid = 0;
actions.request = function (value) {
    ++rid:
    actions.didRequest(rid, value);
    return rid;
}

export default actions;