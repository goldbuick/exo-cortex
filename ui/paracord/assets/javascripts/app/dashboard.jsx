import Graph from 'app/graph';
import RenderTarget from 'app/render-target';
import PoolStore from 'app/pool-store';
import FeedStore from 'app/feed-store';
import ConstructStore from 'app/construct-store';
import DashBoardPool from 'app/dashboard-pool';
import DashBoardCategories from 'app/dashboard-categories';
import DashBoardFeed from 'app/dashboard-feed';
import DashBoardConstruct from 'app/dashboard-construct';
import AudioStore from 'app/audio-store';
import AudioActions from 'app/audio-actions';

function getBaseState (dash) {
    return dash.getGraphState('base', 'state');
}

var detailMinGeometry = new THREE.OctahedronGeometry(16, 0),
    detailMaxGeometry = new THREE.OctahedronGeometry(16, 0),
    detailMinMaterial = new THREE.MeshBasicMaterial({
        wireframe: true,
        color: Graph.baseColor
    });

var DashBoard = React.createClass({
    mixins: [
        RenderTarget,
        Reflux.connect(PoolStore, 'pool'),
        Reflux.connect(FeedStore, 'feed'),
        Reflux.connect(ConstructStore, 'constructs'),
    ],

    componentDidMount: function () {
        this.details = [ ];
        this.camera.position.z = 1440;
    },

    addObject: function (object, state, value) {
        object.keep = true;
        this.scene.add(object);
        this.applyGraphStatus(state, object, value);
    },

    addSubObject: function (object, state, value) {
        object.keep = true;
        this.applyGraphStatus(state, object, value);
    },

    addDetail: function (object, pos, meta) {
        var material = new THREE.MeshBasicMaterial({
                wireframe: true, color: Graph.baseColor
            }),
            detail = new THREE.Mesh(detailMinGeometry, material);

        detail.meta = meta;
        detail.visible = true;
        detail.position.set(pos[0], pos[1], pos[2]);
        object.add(detail);

        this.details.push(detail);
    },

    getGraphState: function (key, name) {
        var prop = 'graph-' + key + '-' + name,
            data = this[prop];
        if (data === undefined) this[prop] = data = { };
        return data;
    },

    applyGraphStatus: function (state, object, value) {
        this.applyGraphIntro(state, object, 512);
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
            _state = DashBoardConstruct.base(this);
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
                _state = DashBoardFeed.base(this);
                _state.basePosition = _state.basePositionMin + (ratio * middle);
            } else {
                ratio = ratio - 1;
                _state = DashBoardFeed.base(this);
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
            _state = DashBoardCategories.base(this);
            _state.basePosition = _state.basePositionMin + (ratio * bottom);

            // place pool       
            ratio = ((state.mode - 100) / 100);
            if (ratio < -1) {
                ++ratio;
            } else {
                ratio = 0;
            }
            _state = DashBoardPool.base(this);
            _state.basePosition = _state.basePositionMin + (ratio * bottom);
        });
        state.scrolling.onComplete(() => {
            state.scrolling = undefined;
        });

        state.scrolling.easing(TWEEN.Easing.Exponential.InOut);
        state.scrolling.start();
    },

    handleMouseDown: function (e) {
        e.preventDefault();
        var state = getBaseState(this);
        state.dragStart = { x: e.clientX, y: e.clientY };
        state.dragLast = { x: e.clientX, y: e.clientY };
    },

    handleMouseMove: function (e) {
        e.preventDefault();
        var state = getBaseState(this);
        if (!state.dragLast) return;

        var dx = e.clientX - state.dragLast.x,
            dy = e.clientY - state.dragLast.y,
            speed = 0.04;

        state.dragLast.x = e.clientX;
        state.dragLast.y = e.clientY;

        var _state;
        switch (Math.round((state.mode || 0) / 100)) {
            default: _state = DashBoardConstruct.base(this); break;
            case 1: _state = DashBoardFeed.base(this); break;
            case 2: _state = DashBoardCategories.base(this); break;
        }

        if (_state && _state.spin) {
            _state.spin.x += dy * speed;
            _state.spin.y += dx * speed;
        }
    },

    handleMouseUp: function (e) {
        e.preventDefault();
        var state = getBaseState(this);
        if (!state.dragLast) return;
        var dx = e.clientX - state.dragStart.x,
            dy = e.clientY - state.dragStart.y;

        if (Math.abs(dx) + Math.abs(dy) < 2) {
            if (this.details) {
                this.details.forEach(detail => {
                    if (detail.visible &&
                        detail.material.wireframe === false) {
                        console.log(detail.meta);
                    }
                });
            }
        }

        delete state.dragLast;
    },

    render: function () {
        this.details = [ ];
        this.genScene(() => {
            DashBoardPool.gen(this);
            DashBoardCategories.gen(this);
            DashBoardFeed.gen(this);
            DashBoardConstruct.gen(this);
        });
        return <div className="render-target"
            onWheel={this.handleWheel}
            onMouseDown={this.handleMouseDown}
            onMouseMove={this.handleMouseMove}
            onMouseUp={this.handleMouseUp}></div>;
    },

    getSelectMode: function () {
        var state = getBaseState(this),
            mode = 'construct';

        if (state.mode !== undefined) {
            switch (Math.floor(state.mode / 100)) {
                case 1: mode = 'feed'; break;
                case 2: mode = 'category'; break;
            }
        }

        return mode;
    },

    update: function (delta) {
        TWEEN.update();
        DashBoardPool.update(this, delta);
        DashBoardCategories.update(this, delta);
        DashBoardFeed.update(this, delta);
        DashBoardConstruct.update(this, delta);
        if (this.details) {
            let mode = this.getSelectMode(),
                global = new THREE.Vector3(),
                scale = 0.8 + Math.cos(this.detailPulse) * 0.2;

            this.details.forEach(detail => {
                if (detail.meta.mode === mode) {
                    global.setFromMatrixPosition(detail.matrixWorld);
                    detail.material.wireframe = (global.z < 200);
                } else {
                    detail.material.wireframe = true;
                }
            });
        }
    }

});

export default DashBoard;
