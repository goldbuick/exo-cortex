import Graph from 'app/graph';

class DashBoardCategoriesDetail {

    base (dash) {
        return dash.getGraphState('detail-base', 'category');
    }

    getState (dash, channel, type) {
        return dash.getGraphState('detail-category', [channel, type].join('-'));
    }

    gen (dash) {
        var items = this.base(dash).items || [ ];
        if (items.length === 0) return;
        
        console.log('gen detail', items);
    }

    update (dash, delta) {

    }

}

export default new DashBoardCategoriesDetail();
