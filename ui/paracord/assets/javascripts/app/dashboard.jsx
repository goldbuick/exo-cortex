import RenderTarget from 'app/render-target';
import RenderProject from 'app/render-project';
import ConstructRender from 'app/construct-render';
import ConstructStore from 'app/construct-store';
import t1 from 'app/three/controls/OrbitControls';

var DashBoard = React.createClass({
    mixins: [
        RenderTarget,
        Reflux.connect(ConstructStore, 'constructs'),
    ],

    componentDidMount: function () {
        this.camera.position.z = 1024;
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enablePan = false;
        this.controls.enableDamping = true;
        this.controls.rotateSpeed = 0.3;
        this.controls.dampingFactor = 0.10;
        this.controls.minDistance = this.camera.position.z * 0.7;
        this.controls.maxDistance = this.camera.position.z;
    },

    update: function (delta) {
        var self = this;
        if (self.controls) self.controls.update();
        self.state.constructs.forEach(construct => {
            if (!construct.objectCount) return;
            construct.anim.tick += delta;
            construct.graphs.forEach(graph => {
                if (!graph.object) return;
                graph.object.rotation.y = construct.base.x + graph.base.x;
                graph.object.rotation.z = construct.base.y + graph.base.y;
                graph.object.rotation.y += Math.cos(construct.anim.tick) * 0.01;
                graph.object.rotation.z += Math.sin(Math.PI + construct.anim.tick) * 0.01;
            });
        });
        TWEEN.update();
    },

    render: function () {
        var self = this;

        self.pruneBegin();
        self.state.constructs.forEach(construct => {
            construct.anim = construct.anim || { };
            construct.anim.tick = construct.anim.tick ||
                (Math.random() * 1000);

            construct.anim.offset = construct.anim.offset ||
                (4000 + Math.random() * 1000);

            let objectCount = 0;
            construct.graphs.forEach(graph => {
                if (graph.params.data) {
                    graph.params.project =
                        RenderProject.sphereProject(512 + construct.base.z, 0.01);
                    graph.object = ConstructRender.build(graph.params);
                    if (graph.object) {
                        ++objectCount;
                        graph.object.rotation.y = construct.base.x + graph.base.x;
                        graph.object.rotation.z = construct.base.y + graph.base.y;
                        self.scene.add(graph.object);
                    }
                }
            });

            if (objectCount) {
                if (construct.anim.intro === undefined) {
                    var position = { y: 2048 };
                    var target = { y: 0 };
                    construct.anim.intro = new TWEEN.Tween(position)
                        .to(target, 1000 + Math.random() * 1000);
                    construct.anim.intro.onUpdate(() => {
                        construct.graphs.forEach(graph => {
                            graph.object.position.y = position.y;
                        });
                    });
                    construct.anim.intro.easing(TWEEN.Easing.Elastic.Out);
                    construct.anim.intro.start();
                    construct.graphs.forEach(graph => {
                        graph.object.position.y = 10000;
                    });
                }
            }

            construct.objectCount = objectCount;
        });
        self.pruneEnd();

        return <div className="render-target"></div>;
    }

});

export default DashBoard;
