import collect from 'app/lib/collected-actions';

var actions = Reflux.createActions([
    'queue',
    'feedQueueStatus',
    'history',
    'messages',
    'matched',
    'extracted'
]);

collect(actions, 'message', 'messages');
collect(actions, 'match', 'matched');
collect(actions, 'extract', 'extracted');

export default actions;
