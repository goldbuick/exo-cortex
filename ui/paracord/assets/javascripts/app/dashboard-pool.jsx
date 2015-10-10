import RenderProject from 'app/render-project';
import Graph from 'app/graph';

function getState (dash) {
    return dash.getGraphState('pool', 'base');
}

var DashboardPool = {

    gen: function (dash) {
        var state = getState(dash),
            pool = new Graph(),
            radius = 0,
            count = Math.round(dash.state.pool.size() / 1000);
        
        var y = 0, arch = (Math.PI * 2) / 20;
        for (var i=0; i<count; ++i) {
            if (i % 10 === 0) {
                y += 80;
                radius += 300;                
            } else {
                radius += 12;
            }
            pool.drawLoop(0, 0, y + Math.cos(i * arch) * 32, 64, radius, 16);
        }

        state.object = pool.build(RenderProject.plane(1.0));
        dash.addObject(state.object, state, count);

        state.object.position.y = -720;
        state.object.rotation.y = Math.PI * 0.75;
        state.animTick = state.animTick || 0;
        state.object.animIntro = function (value) {
            state.object.visible = Math.round(value * 100) % 4 === 0;
        };
    },

    update: function (dash, delta) {
        var state = getState(dash);
        if (!state.object) return;

        // state.object.position.y = -512 + Math.cos(state.animTick) * 8;
        // state.animTick += delta;
    }

};

export default DashboardPool;
