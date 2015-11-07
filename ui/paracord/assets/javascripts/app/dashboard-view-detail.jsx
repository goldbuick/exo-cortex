import Graph from 'app/graph';
import AudioActions from 'app/audio-actions';

class DashboardViewDetail {

    getBaseState (dash) {
        return dash.getBaseState('detail');
    }

    getMenuIndex (dash) {
        var state = this.getBaseState(dash),
            index = state.menuIndex;
        return Math.min(Math.max(0, index), state.items.length - 1);
    }
    
    handleWheel (dash, e) {
        var state = this.getBaseState(dash);
        if (state.scrolling) return;
        if (e.dx < -30) {
            AudioActions.swish();
            dash.setCurrentView('main');
            return;
        }
        if (Math.abs(e.dy) < 20) return;
        
        var indexTarget = state.menuIndex + (e.dy > 0 ? 1 : -1);
        indexTarget = Math.min(Math.max(0, indexTarget), state.items.length - 1);
        if (indexTarget !== state.menuIndex) AudioActions.swish();

        var scroll = { value: state.menuIndex },
            target = { value: indexTarget };

        state.scrolling = new TWEEN.Tween(scroll).to(target, 512);
        state.scrolling.onUpdate(() => {
            state.menuIndex = scroll.value;
        });
        state.scrolling.onComplete(() => {
            state.scrolling = undefined;
        });

        state.scrolling.easing(TWEEN.Easing.Exponential.InOut);
        state.scrolling.start();
    }

    handleDrag (dash, e) {
    }

    handleClick (dash, e) {
        if (e.x < 100) dash.setCurrentView('main');
        var items = dash.fragments
            .filter(fragment => fragment.visible);
        dash.captureFragments(items);
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

        state.menuTwist = 0.1;
        state.menuIndex = state.menuIndex || 0;
        state.menu = menu.build(Graph.projectFacePlane(1.0));
        state.menu.keep = true;
        state.menu.left = 280 - rad;
        dash.scene.add(state.menu);

        var pivot, text, anchor;
        for (var i=0; i<state.items.length; ++i) {
            text = Graph.genTextFlat([0, 0, 0], state.items[i].name, 0.5);
            text.position.x = rad + 64;

            anchor = new Graph();
            anchor.drawSwipe(-8, 0, 0, 6, 36, 8, 2, 2);
            anchor = anchor.build(Graph.projectFacePlane(1.0));
            anchor.position.x = rad;
            anchor.rotation.z += Math.PI * 0.5;

            pivot = new THREE.Object3D();
            pivot.rotation.z = i * -state.menuTwist;
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

        state.leftEdge = left + 600;
        dash.centerCamera(delta, cameraX);

        if (state.goback) {
            state.goback.position.x = left + state.goback.left;
        }

        if (state.menu) {
            state.menu.rotation.z = state.menuIndex * state.menuTwist;
            state.menu.position.x = left + state.menu.left;
        }
    }

}

export default new DashboardViewDetail();
