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
        var state = getBaseState(dash),
            feeds = Object.keys(dash.state.feed);

        state.basePosition = state.basePosition || -100;
        state.basePositionMin = state.basePositionMin || -100;

        var feed = new Graph(),
            radius = 950,
            r = new alea('feed-loop');

        feed.drawLoopR(0, 0, 8, 128, radius - 12, r, 0.2);
        feed.drawSwipe(0, 0, 0, 128, radius - 12, 8);
        feed.drawLoopR(0, 0, -8, 128, radius, r, 0.2);
        state.texts = [ ];
        state.object = feed.build(Graph.projectPlane(1.0));
        // state.object = feed.build(Graph.projectColumn(radius * 0.5, 0.001));

        var angle = Math.PI * 0.5, tunnel = 5;
        for (var i=0; i<feeds.length * tunnel; ++i) {
            var mid = 2,
                slice = (i % tunnel),
                container = new Graph(),
                name = feeds[Math.floor(i / tunnel)],
                r2 = new alea(['feed-container', name, i].join('-'));

            var _radius = slice === mid ? 32 : 20,
                _front = Math.round(r2() * 30),
                _back = -10 + Math.round(r2() * 40);
            container.drawSwipe(radius, 0, 0, 64, _radius,
                2 + Math.round(r2() * 4), _front, _back);

            if (slice === mid) {
                container.drawLoopR(radius, 0, 0, 64, _radius + 32, r2, 0.4);
                if (r2() < 0.3) container.drawLoopR(radius, 0, 0, 64, _radius + 32 + 8, r2, 0.7);
            }

            var _project = Graph.projectAltPlane(1.0),
                _object = container.build(_project);

            if (slice === mid) {
                let _text = Graph.genText(_project(0, radius + 64, 0), name, 0.4);
                state.texts.push(_text);
                _object.add(_text);
                dash.addDetail(_object, _project(-64, radius, 0), {
                    mode: 'feed',
                    container: name
                });
            }

            _object.rotation.y = angle;
            state.object.add(_object);

            if (i > 0 && slice === 0) {
                angle += 0.6;
            } else {
                angle += 0.06;
            }
        }

        dash.addObject(state.object, state, Math.random());

        state.animTick = state.animTick || 0;
        state.animRotation = state.animRotation || 0;
        state.spin = state.spin || new THREE.Vector3();
        state.object.animIntro = function (value) {
            state.object.visible = Math.round(value * 100) % 4 === 0;
            state.texts.forEach(text => {
                text.material.uniforms.scramble.value = (1.0 - value);
            });
        };
    },

    update: function (dash, delta) {
        var state = getBaseState(dash);
        if (!state.object) return;

        var spinDelta = new THREE.Vector3();
        spinDelta.copy(state.spin);
        spinDelta.multiplyScalar(delta);

        state.animTick += delta;
        state.animRotation += (delta * -0.01) + spinDelta.y;
        state.object.rotation.y = state.animRotation;
        state.object.position.y =
            (Math.cos(state.animTick) * 3) + state.basePosition;

        spinDelta.multiplyScalar(4.5);
        state.spin.sub(spinDelta);
    }

};

export default DashboardFeed;
