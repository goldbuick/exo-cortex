import Graph from 'app/graph';
import AudioActions from 'app/audio-actions';
import DashBoardPool from 'app/dashboard-pool';
import DashBoardCategories from 'app/dashboard-categories';
import DashBoardCategoriesDetail from 'app/dashboard-categories-detail';
import DashBoardFeed from 'app/dashboard-feed';
import DashBoardConstruct from 'app/dashboard-construct';

class DashboardViewDetail {

    getBaseState (dash) {
        return dash.getBaseState('detail');
    }
    
    handleWheel (dash, e) {
        var state = this.getBaseState(dash);
        state.menuRotation -= e.dy * 0.003;
    }

    handleDrag (dash, e) {
    }

    handleClick (dash, e) {
        if (e.x < 100) dash.setCurrentView('main');
    }

    gen (dash) {
        var state = this.getBaseState(dash);

        var rad = 32,
            width = 8,
            step = rad * 0.5 + width,
            r = new alea('view-detail');

        var goback = new Graph();
        goback.drawSwipe(0, 0, 0, 6, rad, width);
        goback.drawSwipe(-step, 0, 0, 6, rad, width, 2, 2);
        goback.drawSwipe(-(step * 2), 0, 0, 6, rad, width, 2, 2);

        state.goback = goback.build(Graph.projectFacePlane(1.0));
        state.goback.keep = true;
        state.goback.left = 100;
        state.goback.rotation.z = Math.PI * -0.5;
        dash.scene.add(state.goback);

        rad = 2000;
        var menu = new Graph();
        menu.drawLoopR(0, 0, 0, 256, rad + 16, r, 0.3);
        menu.drawSwipe(0, 0, 0, 128, rad - 2, 8);
        menu.drawLoopR(0, 0, 0, 256, rad - 16, r, 0.7);

        state.menuRotation = state.menuRotation || 0;
        state.menu = menu.build(Graph.projectFacePlane(1.0));
        state.menu.keep = true;
        state.menu.left = 280 - rad;
        dash.scene.add(state.menu);

        var pivot, text, anchor;
        for (var i=0; i<state.items.length; ++i) {
            text = Graph.genTextFlat([0, 0, 0], state.items[i].name, 0.5);
            text.position.x = rad + 64;

            anchor = new Graph();
            anchor.drawCircle(0, 0, 0, 6, 16);
            anchor.drawSwipe(0, 0, 0, 6, 36, 8);
            anchor = anchor.build(Graph.projectFacePlane(1.0));
            anchor.position.x = rad;

            pivot = new THREE.Object3D();
            pivot.rotation.z = i * -0.1;
            pivot.add(text);
            pivot.add(anchor);
            state.menu.add(pivot);
        }
    }

    update (dash, delta) {
        var screenRatio = dash.getBaseState().screenRatio;
        if (isNaN(screenRatio)) return;

        var state = this.getBaseState(dash),
            hwidth = dash.renderer.context.canvas.width * 0.5 * screenRatio,
            cameraX = 1400 + hwidth,
            left = cameraX - hwidth;

        dash.centerCamera(delta, cameraX);
        if (state.goback) state.goback.position.x = left + state.goback.left;
        if (state.menu) {
            state.menu.rotation.z = state.menuRotation;
            state.menu.position.x = left + state.menu.left;
        }
    }

}

export default new DashboardViewDetail();
