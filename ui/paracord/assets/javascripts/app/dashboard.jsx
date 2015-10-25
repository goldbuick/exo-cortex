import Graph from 'app/graph';
import RenderTarget from 'app/render-target';
import PoolStore from 'app/pool-store';
import FeedStore from 'app/feed-store';
import ConstructStore from 'app/construct-store';
import AudioStore from 'app/audio-store';
import AudioActions from 'app/audio-actions';
import DashBoardViewMain from 'app/dashboard-view-main';
import DashBoardViewDetail from 'app/dashboard-view-detail';
import DashBoardPool from 'app/dashboard-pool';
import DashBoardCategories from 'app/dashboard-categories';
import DashBoardCategoriesDetail from 'app/dashboard-categories-detail';
import DashBoardFeed from 'app/dashboard-feed';
import DashBoardConstruct from 'app/dashboard-construct';

var DashBoard = React.createClass({
    mixins: [
        RenderTarget,
        Reflux.connect(PoolStore, 'pool'),
        Reflux.connect(FeedStore, 'feed'),
        Reflux.connect(ConstructStore, 'constructs'),
    ],

    getCurrentView: function () {
        return this.state.view || 'main';
    },

    setCurrentView: function (view, items) {
        // reset
        DashBoardCategoriesDetail.base(this).items = [ ];

        // set
        items = items || [ ];
        switch (this.getSelectMode()) {
            default: break;
            case 'feed': break;
            case 'category': DashBoardCategoriesDetail.base(this).items = items; break;
        }

        var state = this.getBaseState('detail');
        state.items = items;

        this.setState({ view: view });
    },

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
        var detail = new THREE.Group();
        detail.keep = true;
        detail.meta = meta;
        detail.visible = false;
        detail.anchor = new THREE.Object3D();
        detail.anchor.position.set(pos[0], pos[1], pos[2]);

        var rad = 6,
            width = 3,
            step = rad * 0.5 + width,
            icon = new Graph();
        icon.drawSwipe(0, 0, 0, 6, rad, width);
        icon.drawSwipe(-step, 0, 0, 6, rad, width, 2, 2);
        icon.drawSwipe(-(step * 2), 0, 0, 6, rad, width, 2, 2);
        icon = icon.build(Graph.projectFacePlane(1.0));
        icon.rotation.z = Math.PI * 0.5;
        detail.add(icon);

        object.add(detail.anchor);
        this.scene.add(detail);
        this.details.push(detail);
    },

    getGraphState: function (key, name) {
        var prop = 'graph-' + key + '-' + name,
            data = this[prop];
        if (data === undefined) this[prop] = data = { };
        return data;
    },

    getBaseState: function (view) {
        view = view || '';
        return this.getGraphState('base', ['state', view].join('-'));
    },

    getSelectMode: function () {
        var state = this.getBaseState(),
            mode = 'construct';

        if (state.mode !== undefined) {
            switch (Math.floor(state.mode / 100)) {
                case 1: mode = 'feed'; break;
                case 2: mode = 'category'; break;
            }
        }

        return mode;
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
        var args = { dy: e.deltaY };
        switch (this.getCurrentView()) {
            case 'main': DashBoardViewMain.handleWheel(this, args); break;
            case 'detail': DashBoardViewDetail.handleWheel(this, args); break;
        }
    },

    handleMouseDown: function (e) {
        e.preventDefault();
        var state = this.getBaseState();
        state.dragStart = { x: e.clientX, y: e.clientY };
        state.dragLast = { x: e.clientX, y: e.clientY };
    },

    handleMouseMove: function (e) {
        e.preventDefault();
        var state = this.getBaseState();
        if (!state.dragLast) return;

        var speed = 0.04,
            dx = (e.clientX - state.dragLast.x) * speed,
            dy = (e.clientY - state.dragLast.y) * speed;

        state.dragLast.x = e.clientX;
        state.dragLast.y = e.clientY;

        var args = { dx: dx, dy: dy };
        switch (this.getCurrentView()) {
            case 'main': DashBoardViewMain.handleDrag(this, args); break;
            case 'detail': DashBoardViewDetail.handleDrag(this, args); break;
        }
    },

    handleMouseUp: function (e) {
        e.preventDefault();
        var state = this.getBaseState();
        if (!state.dragLast) return;
        var dx = e.clientX - state.dragStart.x,
            dy = e.clientY - state.dragStart.y;

        if (Math.abs(dx) + Math.abs(dy) < 2) {
            let args = { x: e.clientX, y: e.clientY };
            switch (this.getCurrentView()) {
                case 'main': DashBoardViewMain.handleClick(this, args); break;
                case 'detail': DashBoardViewDetail.handleClick(this, args); break;
            }
        }

        delete state.dragLast;
    },

    render: function () {
        if (this.details) {
            this.details.forEach(detail => { delete detail.keep; });
            this.details = [ ];
        }

        this.genScene(() => {
            switch (this.getCurrentView()) {
                case 'main': DashBoardViewMain.gen(this); break;
                case 'detail': DashBoardViewDetail.gen(this); break;
            }

            DashBoardPool.gen(this);
            DashBoardCategories.gen(this);
            DashBoardFeed.gen(this);
            DashBoardConstruct.gen(this);
            DashBoardCategoriesDetail.gen(this);
        });

        return <div className="render-target"
            onWheel={this.handleWheel}
            onMouseDown={this.handleMouseDown}
            onMouseMove={this.handleMouseMove}
            onMouseUp={this.handleMouseUp}></div>;
    },

    centerCamera: function (delta, targetX) {
        this.camera.position.x += (targetX - this.camera.position.x) * delta * 10;
    },

    update: function (delta) {
        TWEEN.update();

        // measure screen ratio
        var len = 100,
            state = this.getBaseState(),
            hwidth = 0.5 * this.renderer.context.canvas.width,
            left = new THREE.Vector3(len, 0, 1).project(this.camera),
            center = new THREE.Vector3(0, 0, 1).project(this.camera);

        left = (left.x * hwidth) + hwidth;
        center = (center.x * hwidth) + hwidth;
        state.screenRatio = len / (left - center);

        switch (this.getCurrentView()) {
            case 'main': DashBoardViewMain.update(this, delta); break;
            case 'detail': DashBoardViewDetail.update(this, delta); break;
        }

        DashBoardPool.update(this, delta);
        DashBoardCategories.update(this, delta);
        DashBoardFeed.update(this, delta);
        DashBoardConstruct.update(this, delta);
        DashBoardCategoriesDetail.update(this, delta);
    }

});

export default DashBoard;
