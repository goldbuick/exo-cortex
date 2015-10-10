import RenderTarget from 'app/render-target';
import RenderProject from 'app/render-project';
import PoolStore from 'app/pool-store';
import DashBoardPool from 'app/dashboard-pool';
import DashBoardCategories from 'app/dashboard-categories';
// import 'app/three/controls/OrbitControls';

var DashBoard = React.createClass({
    mixins: [
        RenderTarget,
        Reflux.connect(PoolStore, 'pool'),
    ],

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

    componentDidMount: function () {
        this.camera.position.z = 1440;
    },
    
    render: function () {
        this.genScene(() => {
            DashBoardPool.gen(this);
            DashBoardCategories.gen(this);
        });
        return <div className="render-target"></div>;
    },

    update: function (delta) {
        TWEEN.update();
        DashBoardPool.update(this, delta);
        DashBoardCategories.update(this, delta);
    }

    // update: function (delta) {
    //     var self = this;
    //     TWEEN.update();
    //     if (self.controls) self.controls.update();
    //     self.state.constructs.forEach(construct => {
    //         if (!construct.objectCount) return;
    //         construct.anim.tick += delta;
    //         construct.graphs.forEach(graph => {
    //             if (!graph.object) return;
    //             graph.object.rotation.y = construct.base.x + graph.base.x;
    //             graph.object.rotation.z = construct.base.y + graph.base.y;
    //             graph.object.rotation.y += Math.cos(construct.anim.tick) * 0.01;
    //             graph.object.rotation.z += Math.sin(Math.PI + construct.anim.tick) * 0.01;
    //         });
    //     });
    // },

    // render: function () {
    //     var self = this;

    //     self.pruneBegin();
    //     self.state.constructs.forEach(construct => {
    //         construct.anim = construct.anim || { };
    //         construct.anim.tick = construct.anim.tick ||
    //             (Math.random() * 1000);

    //         let objectCount = 0;
    //         construct.graphs.forEach(graph => {
    //             if (graph.params.data) {
    //                 graph.params.project =
    //                     RenderProject.sphereProject(512 + construct.base.z, 0.01);
    //                 graph.object = ConstructRender.build(graph);
    //                 if (graph.object) {
    //                     ++objectCount;
    //                     graph.object.rotation.y = construct.base.x + graph.base.x;
    //                     graph.object.rotation.z = construct.base.y + graph.base.y;
    //                     self.scene.add(graph.object);
    //                 }
    //             }
    //         });

    //         if (objectCount) {
    //             var intro = { value: 0 };
    //             var target = { value: 1 };
    //             if (construct.anim.intro === undefined) {
    //                 construct.anim.intro = new TWEEN.Tween(intro)
    //                     .to(target, 256 + Math.random() * 256);

    //                 construct.anim.intro.onUpdate(() => {
    //                     construct.graphs.forEach(graph => {
    //                         if (graph.object && graph.object.animIntro)
    //                             graph.object.animIntro(intro.value);
    //                     });
    //                 });

    //                 construct.anim.intro.easing(TWEEN.Easing.Back.InOut);
    //                 construct.anim.intro.start();
                    
    //                 construct.graphs.forEach(graph => {
    //                     if (graph.object && graph.object.animIntro)
    //                         graph.object.animIntro(intro.value);
    //                 });

    //             } else if (construct.anim.changed === undefined) {
    //                 construct.anim.changed = new TWEEN.Tween(intro)
    //                     .to(target, 128 + Math.random() * 128);

    //                 construct.anim.changed.onUpdate(() => {
    //                     construct.graphs.forEach(graph => {
    //                         if (graph.object.animChanged) graph.object.animChanged(intro.value);
    //                     });
    //                 });
    //                 construct.anim.changed.onComplete(() => {
    //                     construct.anim.changed = undefined;
    //                 });

    //                 construct.anim.changed.easing(TWEEN.Easing.Back.InOut);
    //                 construct.anim.changed.start();
                    
    //                 construct.graphs.forEach(graph => {
    //                     if (graph.object.animChanged) graph.object.animChanged(intro.value);
    //                 });
    //             }
    //         }

    //         construct.objectCount = objectCount;
    //     });
    //     self.pruneEnd();

    //     return <div className="render-target"></div>;
    // }

});

export default DashBoard;
