import RenderTarget from 'app/render-target';
import RenderProject from 'app/render-project';
import PoolStore from 'app/pool-store';
import Graph from 'app/graph';
// import ConstructRender from 'app/construct-render';
// import ConstructStore from 'app/construct-store';
// import 'app/three/controls/OrbitControls';

function keep (graph) {
    graph.keep = true;
    return graph;
}

var DashBoard = React.createClass({
    mixins: [
        RenderTarget,
        Reflux.connect(PoolStore, 'pool'),
        // Reflux.connect(ConstructStore, 'constructs'),
    ],

    getInitialState: function () {
        return {
            init: true
        };
    },

    componentDidMount: function () {
        this.camera.position.z = 1440;
        // this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        // this.controls.enablePan = false;
        // this.controls.enableDamping = true;
        // this.controls.rotateSpeed = 0.3;
        // this.controls.dampingFactor = 0.10;
        // this.controls.minDistance = this.camera.position.z * 0.7;
        // this.controls.maxDistance = this.camera.position.z;
    },

    genPool: function () {
        var pool = new Graph(),
            radius = 64,
            count = Math.round(this.state.pool.size() / 512);
        
        for (var i=0; i<count; ++i) {
            pool.drawLoop(6, radius, Math.sin(i / 0.001) * 16);
            radius += 16;
        }
        pool.tessellate(10);

        var object = pool.build(RenderProject.plane(1.0));
        this.scene.add(keep(object)); 
        object.position.y = -512;

        object.animIntro = function (value) {
            object.visible = Math.round(value * 100) % 4 === 0;
        };

        this.applyStatus('pool', 'base', object, count);
        this.poolBase = object;
        this.poolBase.tick = 0;
    },

    genCategories: function () {
        var self = this,
            pool = self.state.pool;

        pool.reset();
        var channels = pool.groupByChannels.all().map(item => { return item.key; });

        var offset = 0, start = Math.PI * 0.5;
        self.categories = channels.map(channel => {
            pool.reset();
            pool.channel.filterExact(channel);
            var types = pool.groupByTypes.all().filter(item => {
                return item.value > 0;
            }).map(item => {
                return item.key;
            });

            var radius = 768,
                innerRadius = radius - 64,
                outerRadius = radius + 256,
                category = new Graph();
            category.drawLoop(32, radius, 0);

            var circleShape, angle = start;
            for (var i=0; i<types.length; ++i) {
                category.drawLine([
                    { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius, z: 0 },
                    { x: Math.cos(angle) * innerRadius, y: Math.sin(angle) * innerRadius, z: 0 }
                ]);

                circleShape = new THREE.Shape();
                circleShape.absarc(Math.cos(angle) * innerRadius, Math.sin(angle) * innerRadius,
                    32, 0, Math.PI * 2, false);
                category.drawShape(circleShape);

                angle += 0.2;

                circleShape = new THREE.Shape();
                circleShape.absarc(Math.cos(angle) * outerRadius, Math.sin(angle) * outerRadius,
                    16, 0, Math.PI * 2, false);
                category.drawShape(circleShape);
            }
            start += 0.5;

            var object = category.build(RenderProject.plane(1.0));
            self.scene.add(keep(object)); 
            object.position.y = -512 + offset;
            object.rotation.x = 0.03;
            offset += 48;

            object.animIntro = function (value) {
                object.visible = Math.round(value * 100) % 4 === 0;
            };

            self.applyStatus('category', channel, object, types);
            return object;
        });
    },

    render: function () {
        if (this.pruneBegin()) {
            this.genPool();
            this.genCategories();
            this.pruneEnd();
        }
        return <div className="render-target"></div>;
    },

    applyStatus: function (key, name, object, value) {
        this.applyIntro(key, name, object);
        var prop = 'status-' + key + '-' + name,
            strValue = JSON.stringify(value);
        if (this[prop] !== strValue) {
            this[prop] = strValue;
            this.applyChanged(key, name, object);
        }
    },

    applyChanged: function (key, name, object) {
        this.applyIntro(key, name, object, 128, true);
    },

    applyIntro: function (key, name, object, range, force) {
        var self = this,
            intro = { value: 0 },
            target = { value: 1 },
            prop = 'intro-' + key + '-' + name;

        range = range || 256;
        if (force || self[prop] === undefined) {
            self[prop] = new TWEEN.Tween(intro)
                .to(target, range + Math.random() * range);

            self[prop].onUpdate(() => {
                if (object.animIntro) object.animIntro(intro.value);
            });

            self[prop].easing(TWEEN.Easing.Back.InOut);
            self[prop].start();
        }
    },

    update: function (delta) {
        TWEEN.update();
        var self = this;

        if (this.poolBase) {
            this.poolBase.tick += delta;
            this.poolBase.position.y = -512 + Math.cos(this.poolBase.tick) * 4;
        }

        if (self.categories)
            self.categories.forEach(category => {
                var velocity = Math.cos(category.position.y);
                category.rotation.y += (delta + velocity) * 0.001;
            });
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
