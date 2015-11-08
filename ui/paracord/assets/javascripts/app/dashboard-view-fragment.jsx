import Graph from 'app/graph';
import AudioActions from 'app/audio-actions';
import FragmentStore from 'app/fragment-store';

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
        AudioActions.swish();
        var state = this.getBaseState(dash);
        state.open = true;
    }

    close (dash) {
        AudioActions.swish();
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
            .to({ value: 1 }, 128)
            .easing(TWEEN.Easing.Exponential.InOut);

        var close = new TWEEN.Tween(anim)
            .delay(1024)
            .onUpdate(update(false))
            .to({ value: 0 }, 256)
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
            width = dash.renderer.context.canvas.width * screenRatio,
            height = dash.renderer.context.canvas.height * screenRatio,
            geometry = new THREE.PlaneGeometry(width, height);

        state.backdrop = new THREE.Mesh(geometry, material);
        state.backdrop.keep = true;
        state.backdrop.position.z = dash.camera.position.z - state.screenCameraZ;
        dash.scene.add(state.backdrop);

        state.backdrop.width = width;
        state.backdrop.height = height;
        state.backdrop.left = new THREE.Group();
        state.backdrop.left.position.z = 16;
        state.backdrop.add(state.backdrop.left);

        var start = 0;
        state.fragments = Object.keys(dash.state.fragments).map(id => {
            var _state = self.getState(dash, id),
                _fragment = dash.state.fragments[id];

            var symbol = new Graph();
            switch (_fragment.type) {
                case FragmentStore.Message:
                    break;
            }

            symbol.drawSwipe(0, 0, 0, 6, 32, 16, 1);

            _state.object = symbol.build(Graph.projectFacePlane(1.0));
            _state.object.position.y = start;

            var text = Graph.genTextFlat([0, 0, 0], _fragment.name, 0.5);
            text.position.x = 64;
            _state.object.add(text);

            start -= 128;
            state.backdrop.left.add(_state.object);
            dash.addSubObject(_state.object, _state, id);
            return _state;
        });        
    }

    update (dash, delta) {
        var state = this.getBaseState(dash),
            screenRatio = dash.getBaseState().screenRatio,
            screenNear = dash.getBaseState().screenCameraZ,
            screenFar = screenNear + 768;

        dash.zoomCamera(delta, state.open ? screenFar : screenNear);

        if (!isNaN(screenRatio)) {
            let state = this.getBaseState(dash);
            if (state.backdrop) {
                let border = 32 * screenRatio,
                    right = dash.camera.position.x + state.backdrop.width;
                state.backdrop.position.z = dash.camera.position.z - screenNear;
                state.backdrop.position.x = right - (state.edge || 0) * screenRatio;
                state.backdrop.left.position.x = (state.backdrop.width * -0.5) + border;
                state.backdrop.left.position.y = (state.backdrop.height * 0.5) - border;
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
