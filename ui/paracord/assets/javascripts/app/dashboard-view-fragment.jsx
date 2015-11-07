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

    add (dash, fragments) {
        var state = this.getBaseState(dash),
            anim = { value: 0 };

        function update(open) { return function() {
            state.open = open;
            state.edge = anim.value * 200;
        } }

        state.slide = new TWEEN.Tween(anim)
            .onUpdate(update(true))
            .to({ value: 1 }, 512)
            .easing(TWEEN.Easing.Exponential.InOut);

        var close = new TWEEN.Tween(anim)
            .delay(256)
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

        var state = this.getBaseState(dash),
            geometry = new THREE.PlaneGeometry(
                dash.renderer.context.canvas.width * screenRatio,
                dash.renderer.context.canvas.height * screenRatio);

        state.backdrop = new THREE.Mesh(geometry, material);
        state.backdrop.keep = true;
        state.backdrop.position.z = dash.camera.position.z - state.screenCameraZ;
        dash.scene.add(state.backdrop);
    }

    update (dash, delta) {
        var state = this.getBaseState(dash),
            screenRatio = dash.getBaseState().screenRatio,
            screenCameraZ = dash.getBaseState().screenCameraZ;

        dash.zoomCamera(delta, state.open ?
            (screenCameraZ * 2) : screenCameraZ);

        if (!isNaN(screenRatio)) {
            let state = this.getBaseState(dash),
                width = dash.renderer.context.canvas.width * screenRatio,
                right = dash.camera.position.x + width;

            if (state.backdrop) {
                state.backdrop.position.z = dash.camera.position.z - screenCameraZ;
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
    }

}

export default new DashboardViewFragment();
