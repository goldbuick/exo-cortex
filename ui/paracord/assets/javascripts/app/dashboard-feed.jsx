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
            radius = 800;
        feed.drawLoop(0, 0, 0, 64, radius);
        // feed.drawLoop(0, 0, -16, 64, radius);
        state.object = feed.build(RenderProject.plane(1.0));
        dash.addObject(state.object, state, 1);

        state.object.animIntro = function (value) {
            state.object.visible = Math.round(value * 100) % 4 === 0;
        };
    },

    update: function (dash, delta) {
        var state = getBaseState(dash);

        if (!state.object) return;
        state.object.position.y = state.basePosition;

        if (!state.containers) return;
    }

};

export default DashboardFeed;
