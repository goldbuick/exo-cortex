import Graph from 'app/graph';
import AudioActions from 'app/audio-actions';

var material = new THREE.MeshBasicMaterial({
    opacity: 0.96,
    transparent: true,
    color: Graph.deepColor,
    side: THREE.DoubleSide
});

class DashboardViewFragment {

    getBaseState (dash) {
        return dash.getBaseState('fragments');
    }

    getState (dash, id) {
        return dash.getGraphState('fragments', id);
    }

    open (dash) {
        var state = this.getBaseState(dash);
        state.open = true;
    }

    close (dash) {
        var state = this.getBaseState(dash);
        state.open = false;
    }

    handleWheel (dash, e) {
    }    

    handleDrag (dash, e) {
    }

    handleClick (dash, e) {
    }

    add (dash) {
        var state = this.getBaseState(dash),
            anim = { value: 0 };

        function update(open) {
            return function() {
                state.open = open;
                state.edge = anim.value * 512;
            }
        }

        state.slide = new TWEEN.Tween(anim)
            .onUpdate(update(true))
            .to({ value: 1 }, 256)
            .easing(TWEEN.Easing.Exponential.InOut);

        var close = new TWEEN.Tween(anim)
            .delay(512)
            .onUpdate(update(false))
            .to({ value: 0 }, 512)
            .easing(TWEEN.Easing.Exponential.InOut)
            .onComplete(() => { state.slide = undefined; });

        state.slide.chain(close);
        state.slide.start();
    }

    gen (dash) {
        var screenRatio = dash.getBaseState().screenRatio;
        if (isNaN(screenRatio)) return;

        var self = this,
            state = self.getBaseState(dash),
            geometry = new THREE.PlaneGeometry(
                dash.renderer.context.canvas.width * screenRatio,
                dash.renderer.context.canvas.height * screenRatio);

        state.backdrop = new THREE.Mesh(geometry, material);
        state.backdrop.keep = true;
        state.backdrop.position.z = dash.camera.position.z - state.screenCameraZ;
        dash.scene.add(state.backdrop);

        state.fragments = Object.keys(dash.state.fragments).map(id => {
            var _state = self.getState(dash, id),
                _fragment = dash.state.fragments[id];

            // dash.addObject(_state.object, _state, types.length);
            console.log(_fragment);
            return _state;
        });        

        console.log();
    }

    update (dash, delta) {
        var state = this.getBaseState(dash),
            screenRatio = dash.getBaseState().screenRatio,
            screenNear = dash.getBaseState().screenCameraZ,
            screenFar = screenNear + 768;

        dash.zoomCamera(delta, state.open ? screenFar : screenNear);

        if (!isNaN(screenRatio)) {
            let state = this.getBaseState(dash),
                width = dash.renderer.context.canvas.width * screenRatio,
                right = dash.camera.position.x + width;

            if (state.backdrop) {
                state.backdrop.position.z = dash.camera.position.z - screenNear;
                state.backdrop.position.x = right - (state.edge || 0) * screenRatio;
            }
        }

        if (dash.fragments) {
            dash.fragments.forEach(fragment => {
                fragment.visible = fragment.track.visible;
                fragment.position.setFromMatrixPosition(fragment.anchor.matrixWorld);
                fragment.lookAt(dash.camera.position);
            });
        }

        // state.fragments
    }

}

export default new DashboardViewFragment();
