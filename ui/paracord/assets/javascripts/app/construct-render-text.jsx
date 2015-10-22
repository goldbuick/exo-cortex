import Graph from 'app/graph';

export default function (project, args, meta, data) {
    if (data === undefined) return;

    // ARGS
    // text - string
    // scale - resize text
    var object = Graph.genText(project(0, 0, 0), this.metaStr(meta, args.text), args.scale);

    if (object) {
        object.animIntro = function (value) {
            object.material.uniforms.scramble.value = (1.0 - value);
        };
    }

    return this.keep(object);
}
