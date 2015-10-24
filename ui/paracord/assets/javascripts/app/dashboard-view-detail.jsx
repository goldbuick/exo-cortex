import Graph from 'app/graph';
import AudioActions from 'app/audio-actions';
import DashBoardPool from 'app/dashboard-pool';
import DashBoardCategories from 'app/dashboard-categories';
import DashBoardCategoriesDetail from 'app/dashboard-categories-detail';
import DashBoardFeed from 'app/dashboard-feed';
import DashBoardConstruct from 'app/dashboard-construct';

class DashboardViewDetail {
    
    handleWheel (dash, e) {
    }

    handleDrag (dash, e) {
    }

    handleClick (dash, e) {
        if (e.x < 100) {
            dash.setCurrentView('main');
        }
    }

    gen (dash) {
        var state = dash.getBaseState('detail');

        var rad = 32,
            width = 8,
            step = rad * 0.5 + width,
            goback = new Graph();
        goback.drawSwipe(0, 0, 0, 6, rad, width);
        goback.drawSwipe(-step, 0, 0, 6, rad, width, 2, 2);
        goback.drawSwipe(-(step * 2), 0, 0, 6, rad, width, 2, 2);

        state.goback = goback.build(Graph.projectFacePlane(1.0));
        state.goback.keep = true;
        state.goback.rotation.z = Math.PI * -0.5;
        dash.scene.add(state.goback);
    }

    update (dash, delta) {
        var screenRatio = dash.getBaseState().screenRatio;
        if (isNaN(screenRatio)) return;

        var state = dash.getBaseState('detail'),
            hwidth = dash.renderer.context.canvas.width * 0.5 * screenRatio,
            cameraX = 950 + hwidth;

        dash.centerCamera(delta, cameraX);
        if (state.goback) state.goback.position.x = cameraX - hwidth + 100;
    }

}

export default new DashboardViewDetail();
