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

        feed.drawLoop(0, 0, 8, 128, radius - 12);
        feed.drawLoopR(0, 0, 0, 128, radius - 6, r, 0.2);
        feed.drawLoopR(0, 0, -8, 128, radius, r, 0.2);
        state.object = feed.build(RenderProject.plane(1.0));

        var angle = Math.PI * 0.5, tunnel = 3;
        for (var i=0; i<feeds.length * tunnel; ++i) {
            var container = new Graph(),
                r2 = new alea('feed-container' + feeds[Math.floor(i / tunnel)]);

            container.drawLoop(radius, 0, 0, Math.round(3 + r2() * 3), 45);
            if (i % tunnel === 1) {
                // TODO: add more deco
                var stroke1 = 32 + r2() * 128,
                    stroke2 = 32 + r2() * 128,
                    stroke3 = 32 + r2() * 128;
                container.drawLine([
                    { x: radius, y: 0, z: 0 },
                    { x: radius + stroke1, y: stroke1, z: 0 }
                ]);
                container.drawLoop(radius + stroke1, stroke1, 0,
                    Math.round(3 + r2() * 3), 6 + r2() * 2);
                container.drawLine([
                    { x: radius, y: 0, z: 0 },
                    { x: radius + stroke2, y: -stroke2, z: 0 }
                ]);
                container.drawLoop(radius + stroke2, -stroke2, 0,
                    Math.round(3 + r2() * 3), 6 + r2() * 2);
                container.drawLine([
                    { x: radius, y: 0, z: 0 },
                    { x: radius - stroke3, y: 0, z: 0 }
                ]);
                container.drawLoop(radius - stroke3, 0, 0,
                    Math.round(3 + r2() * 3), 6 + r2() * 2);
            }

            var _object = container.build(RenderProject.altPlane(1.0));
            _object.rotation.y = angle;
            state.object.add(_object);
            if (i > 0 && i % tunnel === 0) {
                angle += 0.6;
            } else {
                angle += 0.03;
            }
        }

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
