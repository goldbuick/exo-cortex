import Graph from 'app/graph';
import RenderTarget from 'app/render-target';
import PoolStore from 'app/pool-store';
import FeedStore from 'app/feed-store';
import ConstructStore from 'app/construct-store';
import FragmentStore from 'app/fragment-store';
import FragmentActions from 'app/fragment-actions';
import AudioStore from 'app/audio-store';
import AudioActions from 'app/audio-actions';
import DashBoardViewMain from 'app/dashboard-view-main';
import DashBoardViewDetail from 'app/dashboard-view-detail';
import DashBoardViewFragment from 'app/dashboard-view-fragment';
import DashBoardPool from 'app/dashboard-pool';
import DashBoardCategories from 'app/dashboard-categories';
import DashBoardCategoriesDetail from 'app/dashboard-categories-detail';
import DashBoardFeed from 'app/dashboard-feed';
import DashBoardFeedDetail from 'app/dashboard-feed-detail';
import DashBoardConstruct from 'app/dashboard-construct';

var DashBoard = React.createClass({
    mixins: [
        RenderTarget,
        Reflux.connect(PoolStore, 'pool'),
        Reflux.connect(FeedStore, 'feed'),
        Reflux.connect(ConstructStore, 'constructs'),
        Reflux.connect(FragmentStore, 'fragments'),
        Reflux.listenTo(FragmentActions.capture, 'captureFragments')
    ],

    getViewDetail: function() {
        return DashBoardViewDetail;
    },

    getCurrentView: function () {
        return this.state.view || 'main';
    },

    setCurrentView: function (view, items) {
        // reset
        DashBoardCategoriesDetail.setItems(this, []);
        DashBoardFeedDetail.setItems(this, []);
        // DashBoardConstructDetail.setItems(this, []);

        // set
        items = items || [ ];
        switch (DashBoardViewMain.getSelectMode(this)) {
            default: break;
            case 'category':
                DashBoardCategoriesDetail.setItems(this, items);
                break;

            case 'feed':
                items.push({ create: true, name: 'create new container' });
                DashBoardFeedDetail.setItems(this, items);
                break;

            case 'construct':
                items.push({ create: true, name: 'create new construct' });
                // DashBoardConstructDetail.setItems(this, items);
                break;
        }

        // reset detail view always
        var state = DashBoardViewDetail.getBaseState(this);
        state.items = items;
        state.menuIndex = 0;

        this.setState({ view: view });
    },

    componentDidMount: function () {
        var state = this.getBaseState();
        this.details = [ ];
        this.fragments = [ ];
        state.screenCameraZ = 1440;
        this.camera.position.z = state.screenCameraZ;
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

    addFragment: function (object, pos, meta) {
        var fragment = new THREE.Group();
        fragment.keep = true;
        fragment.meta = meta;
        fragment.track = object;
        fragment.visible = false;
        fragment.anchor = new THREE.Object3D();
        fragment.anchor.position.set(pos[0], pos[1], pos[2]);

        var rad = 12,
            width = 6,
            height = 20,
            edge = rad + width * 0.5,
            step = rad + width * 2 + height * 0.5,
            icon = new Graph();

        icon.drawSwipe(0, 0, 0, 6, rad, width);
        icon.drawRect(0, -step, width, height, 0);
        icon.drawRect(edge, -step + width, width, height, 0);
        icon.drawRect(-edge, -step + width, width, height, 0);
        icon = icon.build(Graph.projectFacePlane(1.0));
        icon.rotation.z = Math.PI * 0.5;
        fragment.add(icon);

        object.add(fragment.anchor);
        this.scene.add(fragment);
        this.fragments.push(fragment);
    },

    captureFragments: function () {
        DashBoardViewFragment.add(this);
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
        var args = { dx: e.deltaX, dy: e.deltaY };
        switch (this.getCurrentView()) {
            case 'main': DashBoardViewMain.handleWheel(this, args); break;
            case 'detail': DashBoardViewDetail.handleWheel(this, args); break;
            case 'fragment': DashBoardViewFragment.handleWheel(this, args); break;
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
            case 'fragment': DashBoardViewFragment.handleDrag(this, args); break;
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
                case 'fragment': DashBoardViewFragment.handleClick(this, args); break;
            }
        }

        delete state.dragLast;
    },

    render: function () {
        if (this.details) {
            this.details.forEach(detail => { delete detail.keep; });
            this.details = [ ];
        }
        if (this.fragments) {
            this.fragments.forEach(fragment => { delete fragment.keep; });
            this.fragments = [ ];
        }

        this.genScene(() => {
            switch (this.getCurrentView()) {
                case 'main': DashBoardViewMain.gen(this); break;
                case 'detail': DashBoardViewDetail.gen(this); break;
            }

            DashBoardPool.gen(this);
            DashBoardCategories.gen(this);
            DashBoardFeed.gen(this);
            DashBoardFeedDetail.gen(this);
            DashBoardConstruct.gen(this);
            DashBoardCategoriesDetail.gen(this);
            DashBoardViewFragment.gen(this);
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

    zoomCamera: function (delta, targetZ) {
        this.camera.position.z += (targetZ - this.camera.position.z) * delta * 10;
    },

    resize: function() {
        var state = this.getBaseState();
        delete state.screenRatio;
    },

    update: function (delta) {
        TWEEN.update();

        // measure screen ratio
        var state = this.getBaseState();
        if (state.screenRatio === undefined) {
            let len = 100,
                hwidth = 0.5 * this.renderer.context.canvas.width,
                left = new THREE.Vector3(len, 0, 1).project(this.camera),
                center = new THREE.Vector3(0, 0, 1).project(this.camera);

            // scene ratio
            left = (left.x * hwidth) + hwidth;
            center = (center.x * hwidth) + hwidth;
            state.screenRatio = len / (left - center);
            if (isNaN(state.screenRatio)) delete state.screenRatio;
        }

        switch (this.getCurrentView()) {
            case 'main': DashBoardViewMain.update(this, delta); break;
            case 'detail': DashBoardViewDetail.update(this, delta); break;
        }

        DashBoardPool.update(this, delta);
        DashBoardCategories.update(this, delta);
        DashBoardFeed.update(this, delta);
        DashBoardFeedDetail.update(this, delta);
        DashBoardConstruct.update(this, delta);
        DashBoardCategoriesDetail.update(this, delta);
        DashBoardViewFragment.update(this, delta);
    }

});

export default DashBoard;
