import css from 'app/lib/css';
import RenderProject from 'app/render-project';
import Graph from 'app/graph';

function getBaseState (dash) {
    return dash.getGraphState('base', 'construct');
}

function getState (dash, construct) {
    return dash.getGraphState('construct', construct);
}

var DashboardConstruct = {

    base: function (dash) {
        return getBaseState(dash);
    },

    gen: function (dash) {
        var state = getBaseState(dash);
        state.basePosition = state.basePosition || 100;
        state.basePositionMin = state.basePositionMin || 100;

        var feed = new Graph(),
            innerRadius = 400,
            outerRadius = 800,
            core = new THREE.IcosahedronGeometry(innerRadius + 1, 0);

        feed.drawGeometryLine(core);
        state.object = feed.build(RenderProject.plane(1.0));

        core = new THREE.IcosahedronGeometry(innerRadius, 0);
        var material = new THREE.MeshBasicMaterial({
                color: css.getStyleRuleValue('.deep-color', 'color')
            }),
            mesh = new THREE.Mesh(core, material);
        state.object.add(mesh);

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

export default DashboardConstruct;
