import collect from 'app/lib/collected-actions';

var actions = Reflux.createActions([
    'history',
    'messages',
    'queue',
    'poolQueueStatus'
]);

collect(actions, 'message', 'messages');

export default actions;
