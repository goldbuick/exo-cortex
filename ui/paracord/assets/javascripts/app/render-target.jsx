import css from 'app/lib/css';
import t1 from './three/postprocessing/EffectComposer';
import t2 from './three/postprocessing/RenderPass';

var RenderTarget = {

    handleResize: function () {
        setTimeout(function () {
            var element = $(this.getDOMNode());
            this.renderer.setSize(element.width(), element.height());
            this.camera.aspect = element.width() / element.height();
            this.camera.updateProjectionMatrix();
            this.composer.reset();
        }.bind(this), 100);
    },

    componentDidMount: function () {
        var element = $(this.getDOMNode());

        // core rendering objects
        this.scene = new THREE.Scene();
        this.renderer = new THREE.WebGLRenderer({
            alpha: true,
            preserveDrawingBuffer: true
        });
        this.camera = new THREE.PerspectiveCamera(60, 4 / 3, 0.1, 10000);
        
        // default scene setup
        this.scene.add(this.camera);
        this.renderer.setSize(800, 600);
        this.renderer.autoClear = false;
        this.composer = new THREE.EffectComposer(this.renderer);
        this.renderPass = new THREE.RenderPass(this.scene, this.camera);
        this.composer.addPass(this.renderPass);

        // handle window size changing
        window.addEventListener('resize', this.handleResize);

        // attach to dom
        element.append(this.renderer.domElement);

        // start rendering
        this.handleResize();
        this.draw();
    },

    componentWillUnmount: function () {
        window.cancelAnimationFrame(this.renderTimer);
        window.removeEventListener('resize', this.handleResize);
    },

    draw: function () {
        this.renderer.clear();
        this.composer.render(1.0 / 60.0);
        // this.renderer.render(this.scene, this.camera);
        this.renderTimer = window.requestAnimationFrame(this.draw);
    }

};

export default RenderTarget;
