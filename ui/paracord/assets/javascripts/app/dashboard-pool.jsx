import RenderProject from 'app/render-project';
import Graph from 'app/graph';

function getState (dash) {
    return dash.getGraphState('pool', 'base');
}

var DashboardPool = {

    base: function (dash) {
        return getState(dash);
    },

    gen: function (dash) {
        var state = getState(dash),
            pool = new Graph(),
            radius = 0,
            count = Math.round(dash.state.pool.size() / 1000);
        
        var y = 0,
            sides = 128,
            gap, turn, twist,
            inc = (Math.PI * 2) / 10,
            arch = (Math.PI * 2) / 20;

        for (var i=0; i<count; ++i) {
            gap = Math.floor(sides * 0.25);
            turn = gap + Math.floor(gap * 0.5);
            twist = Math.floor(Math.cos((i % 10) * inc) * 2);
            turn -= twist; gap += twist * 2;
            if (i % 10 === 0) {
                y += 80;
                radius += 200;
            } else {
                radius += 12;
            }
            pool.drawLoop(0, 0, y + Math.cos(i * arch) * 32, sides, radius, -turn, turn + gap);
        }

        state.object = pool.build(RenderProject.plane(1.0));
        dash.addObject(state.object, state, count);

        state.animTick = state.animTick || 0;
        state.basePosition = state.basePosition || -720;
        state.basePositionMin = state.basePositionMin || -720;
        state.object.animIntro = function (value) {
            state.object.visible = Math.round(value * 100) % 4 === 0;
        };
    },

    update: function (dash, delta) {
        var state = getState(dash);
        if (!state.object) return;
        state.animTick += delta;
        state.object.position.y = state.basePosition + (Math.cos(state.animTick) * 2);
    }

};

export default DashboardPool;
