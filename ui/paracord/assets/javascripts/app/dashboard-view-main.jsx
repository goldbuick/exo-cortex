import AudioActions from 'app/audio-actions';
import DashBoardPool from 'app/dashboard-pool';
import DashBoardCategories from 'app/dashboard-categories';
import DashBoardCategoriesDetail from 'app/dashboard-categories-detail';
import DashBoardFeed from 'app/dashboard-feed';
import DashBoardConstruct from 'app/dashboard-construct';

class DashboardViewMain {

    handleWheel (dash, e) {
        var state = dash.getBaseState();
        if (state.scrolling || Math.abs(e.dy) < 20) return;

        state.mode = state.mode || 0;
        var delta = e.dy > 0 ? 1 : -1,
            modeTarget = Math.round(state.mode / 100) + delta;

        if (modeTarget >= -1 && modeTarget <= 2) AudioActions.swish();
        modeTarget = Math.min(Math.max(-1, modeTarget), 2) * 100;
        var scroll = { value: state.mode },
            target = { value: modeTarget };

        state.scrolling = new TWEEN.Tween(scroll).to(target, 512);
        state.scrolling.onUpdate(() => {
            state.mode = scroll.value;
            var _state, ratio;
    
            // place constructs
            ratio = (state.mode / 100);
            var top = 700;
            if (ratio > 2) ratio = 2;
            _state = DashBoardConstruct.base(dash);
            if (ratio < 0) {
                _state.scale = 1 + Math.abs(ratio) * 0.25;
                ratio = 0;
            } else {
                _state.scale = 1;
            }
            _state.basePosition = _state.basePositionMin + (ratio * top);

            // place feed containers
            ratio = (state.mode / 100);
            var middle = 128;
            if (ratio <= 1) {
                if (ratio < 0) ratio *= 1.5;
                _state = DashBoardFeed.base(dash);
                _state.basePosition = _state.basePositionMin + (ratio * middle);
            } else {
                ratio = ratio - 1;
                _state = DashBoardFeed.base(dash);
                _state.basePosition = _state.basePositionMin + middle + (ratio * top);
            }

            // place categories
            ratio = ((state.mode - 100) / 100);
            var bottom = 360;
            if (ratio < -1) {
                ++ratio;
            } else if (ratio < 0) {
                ratio = 0;
            }
            _state = DashBoardCategories.base(dash);
            _state.basePosition = _state.basePositionMin + (ratio * bottom);

            // place pool       
            ratio = ((state.mode - 100) / 100);
            if (ratio < -1) {
                ++ratio;
            } else {
                ratio = 0;
            }
            _state = DashBoardPool.base(dash);
            _state.basePosition = _state.basePositionMin + (ratio * bottom);
        });
        state.scrolling.onComplete(() => {
            state.scrolling = undefined;
        });

        state.scrolling.easing(TWEEN.Easing.Exponential.InOut);
        state.scrolling.start();
    }

    handleDrag (dash, e) {
        var _state;
        switch (dash.getSelectMode()) {
            default: _state = DashBoardConstruct.base(dash); break;
            case 'feed': _state = DashBoardFeed.base(dash); break;
            case 'category': _state = DashBoardCategories.base(dash); break;
        }

        if (_state && _state.spin) {
            _state.spin.x += e.dy;
            _state.spin.y += e.dx;
        }
    }

    handleClick (dash) {
        if (!dash.details) return;

        var items = dash.details
            .filter(detail => detail.forward)
            .map(detail => detail.meta);

        dash.setCurrentView('detail', items);
    }

    gen (dash) {
        
    }

    update (dash, delta) {
        dash.centerCamera(delta, 0);
        if (!dash.details) return;

        var target,
            angleStart = 0.1,
            angleEnd = Math.PI - angleStart,
            mode = dash.getSelectMode();

        dash.details.forEach(detail => {
            detail.position.setFromMatrixPosition(detail.anchor.matrixWorld);
            detail.lookAt(dash.camera.position);
            var facing = Math.atan2(detail.position.z, detail.position.x);
            if (detail.meta.mode === mode && facing >= angleStart && facing <= angleEnd) {
                detail.visible = true;
                detail.forward = true;
            } else {
                detail.visible = false;
                detail.forward = false;
            }
        });
    }

}

export default new DashboardViewMain();
