define(function (require, exports, module) {
    'use strict';

    var RenderTargetMixin = {
        handleResize: function () {
            setTimeout(function () {
                var element = $(this.getDOMNode());
                this.renderer.setSize(element.width(), element.height());
                this.camera.aspect = element.width() / element.height();
                this.camera.updateProjectionMatrix();
            }.bind(this), 100);
        },

        componentDidMount: function () {
            var element = $(this.getDOMNode());

            // core rendering objects
            this.scene = new THREE.Scene();
            this.renderer = new THREE.WebGLRenderer();
            this.camera = new THREE.PerspectiveCamera(60, 4 / 3, 0.1, 10000);
            
            // default scene setup
            this.scene.add(this.camera);
            this.renderer.setPixelRatio(window.devicePixelRatio);

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
            this.renderer.render(this.scene, this.camera);
            this.renderTimer = window.requestAnimationFrame(this.draw);
        }
    };

    return RenderTargetMixin;
});
