import RenderProject from 'app/render-project';
import Graph from 'app/graph';

function getBaseState (dash) {
    return dash.getGraphState('base', 'feed');
}

function getState (dash, container) {
    return dash.getGraphState('feed', container);
}

var DashboardFeed = {

    base: function (dash) {
        return getBaseState(dash);
    },

    gen: function (dash) {
        var state = getBaseState(dash);
        state.basePosition = state.basePosition || -100;
        state.basePositionMin = state.basePositionMin || -100;

        var feed = new Graph(),
            radius = 950,
            r = new alea('feed-loop');

        feed.drawLoop(0, 0, 8, 128, radius - 12);
        feed.drawLoopR(0, 0, 0, 128, radius - 6, r, 0.2);
        feed.drawLoopR(0, 0, -8, 128, radius, r, 0.2);
        state.object = feed.build(RenderProject.plane(1.0));
        dash.addObject(state.object, state, 1);

        state.animRotation = state.animRotation || 0;
        state.object.animIntro = function (value) {
            state.object.visible = Math.round(value * 100) % 4 === 0;
        };
    },

    update: function (dash, delta) {
        var state = getBaseState(dash);

        if (!state.object) return;
        state.animRotation -= delta * 0.01;
        state.object.rotation.y = state.animRotation;
        state.object.position.y = state.basePosition;

        if (!state.containers) return;
    }

};

export default DashboardFeed;
