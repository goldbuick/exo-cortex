import RenderTarget from 'app/render-target';
import RenderProject from 'app/render-project';
import PoolStore from 'app/pool-store';
import FeedStore from 'app/feed-store';
import DashBoardPool from 'app/dashboard-pool';
import DashBoardCategories from 'app/dashboard-categories';
import DashBoardFeed from 'app/dashboard-feed';
import DashBoardConstruct from 'app/dashboard-construct';
// import 'app/three/controls/OrbitControls';

function getBaseState (dash) {
    return dash.getGraphState('base', 'state');
}

var DashBoard = React.createClass({
    mixins: [
        RenderTarget,
        Reflux.connect(PoolStore, 'pool'),
        Reflux.connect(FeedStore, 'feed')
    ],

    componentDidMount: function () {
        this.camera.position.z = 1440;
    },

    addObject: function (object, state, value) {
        object.keep = true;
        this.scene.add(object);
        this.applyGraphStatus(state, object, value);
    },

    getGraphState: function (key, name) {
        var prop = 'graph-' + key + '-' + name,
            data = this[prop];
        if (data === undefined) this[prop] = data = { };
        return data;
    },

    applyGraphStatus: function (state, object, value) {
        this.applyGraphIntro(state, object);
        var strValue = JSON.stringify(value);
        if (state.lastValue !== strValue) {
            state.lastValue = strValue;
            this.applyGraphChanged(state, object);
        }
    },

    applyGraphChanged: function (state, object) {
        this.applyGraphIntro(state, object, 128, true);
    },

    applyGraphIntro: function (state, object, range, force) {
        var self = this,
            intro = { value: 0 },
            target = { value: 1 };

        range = range || 256;
        if (force || state.intro === undefined) {
            state.intro = new TWEEN.Tween(intro)
                .to(target, range + Math.random() * range);

            state.intro.onUpdate(() => {
                if (object.animIntro) object.animIntro(intro.value);
            });

            state.intro.easing(TWEEN.Easing.Back.InOut);
            state.intro.start();
        }
    },

    handleWheel: function (e) {
        e.preventDefault();

        var state = getBaseState(this);
        if (state.scrolling || Math.abs(e.deltaY) < 20) return;

        state.mode = state.mode || 0;
        var delta = e.deltaY > 0 ? 1 : -1,
            modeTarget = Math.round(state.mode / 100) + delta;

        modeTarget = Math.min(Math.max(0, modeTarget), 2) * 100;
        var scroll = { value: state.mode },
            target = { value: modeTarget };

        state.scrolling = new TWEEN.Tween(scroll).to(target, 512);
        state.scrolling.onUpdate(() => {
            state.mode = scroll.value;
            var _state, ratio;
    
            // place constructs
            ratio = (state.mode / 100);
            if (ratio > 1) ratio = 1;
            _state = DashBoardConstruct.base(this);
            _state.basePosition = _state.basePositionMin + (ratio * 1000);

            // place feed containers
            ratio = (state.mode / 100);
            if (ratio <= 1) {
                _state = DashBoardFeed.base(this);
                _state.basePosition = _state.basePositionMin + (ratio * 90);
            } else {
                ratio = ratio - 1;
                _state = DashBoardFeed.base(this);
                _state.basePosition = _state.basePositionMin + 90 + (ratio * 800);
            }

            // place categories
            ratio = ((state.mode - 100) / 100);
            if (ratio < 0) ratio = 0;
            _state = DashBoardCategories.base(this);
            _state.basePosition = _state.basePositionMin + (ratio * 360);        
        });
        state.scrolling.onComplete(() => {
            state.scrolling = undefined;
            console.log('complete', state.mode);
        });

        state.scrolling.easing(TWEEN.Easing.Exponential.InOut);
        state.scrolling.start();
    },

    render: function () {
        this.genScene(() => {
            DashBoardPool.gen(this);
            DashBoardCategories.gen(this);
            DashBoardFeed.gen(this);
            DashBoardConstruct.gen(this);
        });
        return <div className="render-target" onWheel={this.handleWheel}></div>;
    },

    update: function (delta) {
        TWEEN.update();
        DashBoardPool.update(this, delta);
        DashBoardCategories.update(this, delta);
        DashBoardFeed.update(this, delta);
        DashBoardConstruct.update(this, delta);
    }

});

export default DashBoard;
