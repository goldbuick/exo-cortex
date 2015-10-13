import collect from 'app/lib/collected-actions';

var actions = Reflux.createActions([
    'pool',
    'queue',
    'feedQueueStatus',
]);

// collect(actions, 'message', 'messages');
// collect(actions, 'match', 'matched');
// collect(actions, 'extract', 'extracted');

export default actions;
