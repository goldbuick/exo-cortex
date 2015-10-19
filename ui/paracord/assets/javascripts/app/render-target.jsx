import 'app/three/shaders/FilmShader';
import 'app/three/shaders/CopyShader';
import 'app/three/shaders/DigitalGlitch';
import 'app/three/shaders/ConvolutionShader';
import 'app/three/postprocessing/EffectComposer';
import 'app/three/postprocessing/MaskPass';
import 'app/three/postprocessing/FilmPass';
import 'app/three/postprocessing/BloomPass';
import 'app/three/postprocessing/ShaderPass';
import 'app/three/postprocessing/GlitchPass';
import 'app/three/postprocessing/RenderPass';

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
        this.camera.alwaysKeep = true;
        
        // default scene setup
        this.scene.add(this.camera);
        this.renderer.setSize(800, 600);
        this.renderer.autoClear = false;
        window.maxAni = this.renderer.getMaxAnisotropy();

        this.composer = new THREE.EffectComposer(this.renderer);
        var renderPass = new THREE.RenderPass(this.scene, this.camera);
        var effectBloom = new THREE.BloomPass(2);
        var effectCopy = new THREE.ShaderPass(THREE.CopyShader);
        var effectFilm = new THREE.FilmPass(2.0, 0.5, window.innerHeight * 2, false);
        var effectGlitch = new THREE.GlitchPass(64);

        var passes = [
            renderPass,
            effectBloom,
            effectCopy,
            effectFilm,
            // effectGlitch,
        ];
        for (var i=0; i<passes.length; ++i) {
            this.composer.addPass(passes[i]);
        }
        var lastPass = passes.pop();
        lastPass.renderToScreen = true;

        // handle window size changing
        window.addEventListener('resize', this.handleResize);

        // attach to dom
        element.append(this.renderer.domElement);

        // start rendering
        this.keep = 0;
        this.handleResize();
        this.draw();
    },

    componentWillUnmount: function () {
        window.cancelAnimationFrame(this.renderTimer);
        window.removeEventListener('resize', this.handleResize);
    },

    draw: function () {
        var delta = (1.0 / 60.0);
        if (this.update) this.update(delta);
        this.renderer.clear();
        this.composer.render(delta);
        this.renderTimer = window.requestAnimationFrame(this.draw);
    },

    genScene: function (fn) {
        var self = this;
        if (!self.scene) return;

        self.scene.children.forEach(child => { child.keep = false; });
        fn.apply(self);

        var remove = [ ];
        self.scene.children.forEach(child => {
            if (!child.keep && !child.alwaysKeep) remove.push(child);
        });

        remove.forEach(child => { self.scene.remove(child); });
    }

};

export default RenderTarget;
