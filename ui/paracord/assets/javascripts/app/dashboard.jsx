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
        this.controls.dampingFactor = 0.15;
        this.controls.minDistance = this.camera.position.z * 0.7;
        this.controls.maxDistance = this.camera.position.z;
    },

    update: function (delta) {
        if (this.controls) this.controls.update();
    },

    render: function () {
        var self = this;

        self.pruneBegin();
        self.state.constructs.forEach(construct => {
            construct.graphs.forEach(graph => {
                if (graph.params.data) {
                    graph.params.project = RenderProject.sphereProject(512, 0.01);
                    var group = ConstructRender.build(graph.params);
                    if (group) {
                        group.rotation.y = construct.base.x;
                        group.rotation.z = construct.base.y;
                        self.scene.add(group);
                    }
                }
            });
        });
        self.pruneEnd();

        return <div className="render-target"></div>;
    }

});

export default DashBoard;
