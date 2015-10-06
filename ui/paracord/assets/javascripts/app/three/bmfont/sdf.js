define(function(require, exports, module) {
  'use strict';
var xtend = require('./xtend')

module.exports = function(opt) {
  opt = opt||{}
  var scramble = typeof opt.scramble === 'number' ? opt.scramble : 0;
  var opacity = typeof opt.opacity === 'number' ? opt.opacity : 1;
  var alphaTest = typeof opt.alphaTest === 'number' ? opt.alphaTest : 0.06;
  var smooth = typeof opt.smooth === 'number' ? opt.smooth : 1/16;
  return {
    side: THREE.DoubleSide,
    uniforms: {
      scramble: { type: 'f', value: scramble },
      opacity: { type: 'f', value: opacity },
      smooth: { type: 'f', value: smooth },
      map: { type: 't', value: opt.map || new THREE.Texture() },
      color: { type: 'c', value: new THREE.Color(opt.color) }
    },
    vertexShader: [
      "attribute float page;",
      "varying vec2 vUv;",
      "void main() {",
        "vUv = uv;",
        "gl_Position = projectionMatrix * modelViewMatrix * vec4( position.xyz, 1.0 );",
      "}"
    ].join("\n"),
    fragmentShader: [   
      "uniform float scramble;",
      "uniform float opacity;",
      "uniform vec3 color;",
      "uniform sampler2D map;",
      "uniform float smooth;",
      "varying vec2 vUv;",
      "float rand(vec2 co) { return fract(sin(dot(co.xy, vec2(12.9898,78.233))) * 43758.5453); }",
      "void main() {",
        "float r = rand(vec2(vUv.x, vUv.y + scramble));",
        "float u = vUv.x + (-0.5 + r) * scramble;",
        "float v = vUv.y;",
        "vec4 texColor = texture2D(map, vec2(u, v));",
        "float alpha = smoothstep(0.5 - smooth, 0.5 + smooth, texColor.a);",
        "gl_FragColor = vec4(color, opacity * alpha);",
        "#ifdef ALPHATEST",
          "if ( gl_FragColor.a < ALPHATEST ) discard;",
        "#endif",
      "}"
    ].join("\n"),
    defines: {
      "ALPHATEST": Number(alphaTest || 0).toFixed(1)
    }
  };
}
});