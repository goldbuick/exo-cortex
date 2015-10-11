import RenderProject from 'app/render-project';
import Graph from 'app/graph';

function getBaseState (dash) {
    return dash.getGraphState('base', 'category');
}

function getState (dash, channel) {
    return dash.getGraphState('category', channel);
}

var DashboardCategories = {

    base: function (dash) {
        return getBaseState(dash);
    },
    
    gen: function (dash) {
        var state = getBaseState(dash),
            pool = dash.state.pool;

        pool.reset();
        var channels = pool.groupByChannels.all().map(item => { return item.key; });

        var r = new alea('category-system');
        var offset = 0, radius = 600, step = 48, start = Math.PI * 0.25;
        state.basePosition = state.basePosition || -470;
        state.basePositionMin = state.basePositionMin || -470;
        state.channels = channels.map(channel => {
            var _state = getState(dash, channel);

            pool.reset();
            pool.channel.filterExact(channel);
            var types = pool.groupByTypes.all().filter(item => {
                return item.value > 0;
            }).map(item => {
                return item.key;
            });

            var innerRadius = radius - 64,
                outerRadius = radius + 64,
                category = new Graph();
            category.drawLoop(0, 0, 0, 64, radius);
            if (r() < 0.3) category.drawLoop(0, 0, 6, 64, radius - 8);
            _state.object = category.build(RenderProject.plane(1.0));

            var angle = 0;
            for (var i=0; i<types.length; ++i) {
                var type = new Graph(),
                    rCount = 2,
                    bRad = 8 + r() * 8,
                    rSides = Math.round(4 + r() * 2);

                for (var t=0; t<rCount; ++t) {
                    bRad += 8;
                    type.drawLoop(-radius, 0, 0, rSides, bRad);
                }

                var stroke1 = 32 + r() * 128,
                    stroke2 = 32 + r() * 128;
                type.drawLine([
                    { x: -radius, y: 0, z: 0 },
                    { x: -radius, y: bRad + stroke1, z: 0 },
                    { x: -radius - stroke2, y: bRad + stroke1, z: 0 },
                ]);
                type.drawLoop(-radius - stroke2, bRad + stroke1, 0,
                    Math.round(3 + r() * 3), 6 + r() * 2);
                
                var _object = type.build(RenderProject.altPlane(1.0));
                _object.rotation.y = angle;
                _state.object.add(_object);
                angle += 0.2;
            }

            _state.basePosition = offset;
            _state.animDelta = _state.animDelta || (0.01 + 0.01 * r());
            _state.animRotation = _state.animRotation || start;
            _state.object.animIntro = function (value) {
                _state.object.visible = Math.round(value * 100) % 4 === 0;
            };

            radius += step;
            offset += step;
            start += Math.PI * 0.7;
            dash.addObject(_state.object, _state, types.length);
            return _state;
        });

    },

    update: function (dash, delta) {
        var state = getBaseState(dash);
        if (!state.channels) return;

        state.channels.forEach((channel => {
            channel.animRotation += channel.animDelta * delta;
            channel.object.rotation.y = channel.animRotation;
            channel.object.position.y = state.basePosition + channel.basePosition;
        }));
    }

};

export default DashboardCategories;
