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
        state.object = feed.build(RenderProject.plane(1.0));

        var angle = Math.PI * 0.5, tunnel = 3;
        for (var i=0; i<feeds.length * tunnel; ++i) {
            var slice = (i % tunnel),
                container = new Graph(),
                name = feeds[Math.floor(i / tunnel)],
                r2 = new alea(['feed-container', name, i].join('-'));

            var _radius = slice === 1 ? 32 : 24;
            container.drawSwipe(radius, 0, 0, 64, _radius,
                6 + Math.round(r2() * 8), Math.round(r2() * 30), Math.round(r2() * 30));
            if (slice === 1) {
                container.drawLoopR(radius, 0, 0, 64, _radius + 32, r2, 0.4);
                if (r2() < 0.3) container.drawLoopR(radius, 0, 0, 64, _radius + 32 + 8, r2, 0.7);
            }

            var _project = RenderProject.altPlane(1.0),
                _object = container.build(_project);

            if (slice === 1) {
                let _text = container.genText(_project(0, radius + 64, 0), name, 0.4);
                state.texts.push(_text);
                _object.add(_text);
            }

            _object.rotation.y = angle;
            state.object.add(_object);

            if (i > 0 && slice === 0) {
                angle += 0.6;
            } else {
                angle += 0.06;
            }
        }

        dash.addObject(state.object, state, 1);

        state.animTick = state.animTick || 0;
        state.animRotation = state.animRotation || 0;
        state.object.animIntro = function (value) {
            // state.object.visible = Math.round(value * 100) % 2 === 0;
            state.texts.forEach(text => {
                text.material.uniforms.scramble.value = (1.0 - value);
            });
        };
    },

    update: function (dash, delta) {
        var state = getBaseState(dash);

        if (!state.object) return;
        state.animTick += delta;
        state.animRotation -= delta * 0.01;
        state.object.rotation.y = state.animRotation;
        state.object.position.y =
            (Math.cos(state.animTick) * 3) + state.basePosition;

        if (!state.containers) return;
    }

};

export default DashboardFeed;
