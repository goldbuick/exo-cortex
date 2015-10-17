import ConstructView from 'app/construct-view';
import ConstructRenderHalo from 'app/construct-render-halo';
import ConstructRenderText from 'app/construct-render-text';

class ConstructRender {

    constructor () {
        this.renders = { };
        this.add(ConstructView.HALO, ConstructRenderHalo);
        this.add(ConstructView.TEXT, ConstructRenderText);
    }

    add (key, fn) {
        this.renders[key] = fn.bind(this);
    }

    build (project, graph) {
        var group;
        if (graph.viz && graph.viz.type) {
            let render = this.renders[graph.viz.type];
            if (render && graph.view.data) {
                let meta = graph.view.data[graph.view.data.length - 1] || { },
                    data = graph.view.data.length ? graph.view.data : [ ];
                group = render(project, graph.viz, meta, data);
            }
        }
        return group;
    }

    finish (project, args, graph) {
        graph.tessellate(10);
        return graph.build(project);    
    }

    keep (object) {
        object.keep = true;
        return object;
    }

    metaStr (meta, str) {
        if (meta === undefined) return str;
        return str.replace(/\$([a-zA-z0-9_]*)/, function(match, name, string) {
            return meta[name] || match;
        });
    }

}

export default new ConstructRender();
