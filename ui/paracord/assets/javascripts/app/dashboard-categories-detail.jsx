import Graph from 'app/graph';
import FragmentStore from 'app/fragment-store';
import DashBoardViewDetail from 'app/dashboard-view-detail';

class DashBoardCategoriesDetail {

    getBaseState (dash) {
        return dash.getGraphState('detail-base', 'category');
    }

    getState (dash, channel, type) {
        return dash.getGraphState('detail-category', [channel, type].join('-'));
    }

    setItems (dash, items) {
        this.getBaseState(dash).items = items;
    }

    gen (dash) {
        var self = this,
            state = self.getBaseState(dash),
            items = state.items || [ ];
        if (items.length === 0) return;

        var index = 0;
        state.pages = items.map(item => {
            var r = new alea(['detail-category', item.channel, item.type].join('-')),
                _state = self.getState(dash, item.channel, item.type);

            var data = new Graph();

            dash.state.pool.reset();
            dash.state.pool.type.filterExact(item.type);            
            dash.state.pool.channel.filterExact(item.channel);

            var arc = 32,
                inner = 32,
                records = dash.state.pool.all(),
                ratio = records.length / dash.state.pool.size(),
                sub = Math.floor(arc * ratio);

            sub = arc - Math.max(1, sub);
            data.drawSwipe(0, 0, 0, arc, inner, 8, sub);

            var count = 1 + Math.round(r() * 3);
            for (var i=1; i<=count; ++i) {
                data.drawLoopR(0, 0, 0, arc, (inner + 8) + (i * 8), r, 0.5 + (i * 0.1));
            }

            _state.index = index++;
            _state.object = data.build(Graph.projectFacePlane(1.0));

            var content = JSON.stringify(records[0], undefined, 1);
            var text = Graph.genTextEx({
                pos: [128, 0, 0],
                text: content,
                ax: 0,
                ay: 0.5,
                scale: 0.6,
                mode: 'pre'
            });
            _state.object.add(text);

            dash.addFragment(_state.object, [0, 128, 0], {
                type: FragmentStore.Message,
                name: item.channel + ' <= ' + item.type,
                details: {
                    type: item.type,
                    channel: item.channel
                }
            });
            dash.addObject(_state.object, _state, Math.random());
            return _state;
        });
    }

    update (dash, delta) {
        var state = this.getBaseState(dash);
        if (!state.pages || state.pages.length === 0) return;

        var index = DashBoardViewDetail.getMenuIndex(dash),
            left = (DashBoardViewDetail.getBaseState(dash).leftEdge || 0) + 300;

        state.pages.forEach(page => {
            var diff = (page.index - index);
            if (Math.abs(diff) >= 1) {
                page.object.visible = false;
            } else {
                page.object.visible = true;
            }
            page.object.position.x = left;
            page.object.position.y = (page.index - index) * -1024;
            page.object.rotation.x = (page.index - index) * Math.PI * 0.3;
        });
    }

}

export default new DashBoardCategoriesDetail();
