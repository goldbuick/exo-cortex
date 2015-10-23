import Graph from 'app/graph';
import ConstructRender from 'app/construct-render';

function getBaseState (dash) {
    return dash.getGraphState('base', 'construct');
}

function getState (dash, construct, graph) {
    var name = [ construct.uid, graph.uid ].join('-');
    return dash.getGraphState('construct', name);
}

var DashboardConstruct = {

    base: function (dash) {
        return getBaseState(dash);
    },

    gen: function (dash) {
        var state = getBaseState(dash);
        state.basePosition = state.basePosition || 0;
        state.basePositionMin = state.basePositionMin || 0;

        state.object = new THREE.Group();
        state.scale = state.scale || 1;
        state.spin = state.spin || new THREE.Vector3();
        state.orientation = state.orientation || new THREE.Vector3();
        dash.addObject(state.object, state, 1);

        // render graphs
        var radius = 650,
            _project = Graph.projectSphere(radius, 0.01);

        state.animTick = state.animTick || 0;
        state.graphs = dash.state.constructs.map(construct => {
            var group = new THREE.Group();

            construct.graphs.forEach(graph => {
                var _state = getState(dash, construct, graph);
                _state.object = ConstructRender.build(_project, graph);
                if (_state.object) {
                    group.add(_state.object);
                    dash.addSubObject(_state.object, _state, graph.view.changed);
                }
            });

            dash.addDetail(group, _project(8, 0, 0), {
                mode: 'construct',
                construct: construct.uid
            });
            return group;
        });
    },

    update: function (dash, delta) {
        var state = getBaseState(dash);

        if (!state.object) return;
        var spinDelta = new THREE.Vector3();
        spinDelta.copy(state.spin);
        spinDelta.multiplyScalar(delta);
        state.orientation.add(spinDelta);

        spinDelta.multiplyScalar(4.5);
        state.spin.sub(spinDelta);

        state.object.rotation.x = state.orientation.x;
        state.object.rotation.y = state.orientation.y;
        state.object.rotation.z = state.orientation.z;
        state.object.position.y = state.basePosition;
        state.object.scale.set(state.scale, state.scale, state.scale);

        if (!state.graphs) return;

        // plot graphs
        state.animTick += delta;
        var range = 0.004,
            angle = Math.PI * 0.25,
            step = (Math.PI * 2) / 10;
        for (var i=0; i<state.graphs.length; ++i) {
            // add & look
            state.graphs[i].rotation.y =
                (Math.cos(state.animTick + i) * range) + angle;
            state.graphs[i].rotation.z =
                (Math.sin(state.animTick + i) * range) + (i % 2 === 0 ? -0.4 : 0.4);
            state.object.add(state.graphs[i]);
            angle += step;
        }
    }

};

export default DashboardConstruct;
