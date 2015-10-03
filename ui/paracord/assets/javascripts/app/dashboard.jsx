import RenderTarget from 'app/render-target';
import RenderProject from 'app/render-project';
import ConstructRender from 'app/construct-render';

var DashBoard = React.createClass({
    mixins: [
        RenderTarget
    ],

    componentDidMount: function () {
        this.camera.position.z = 1100;

        var self = this,
            plot = function (group, ox, oy) {
                group.rotation.y += ox;
                group.rotation.z += oy;
                return group;                
            },
            project = RenderProject.sphereProject(512, 0.01);

        var gen = function () {
            var data = [ ];
            for (var i=0; i < 16; ++i) data.push(Math.round(Math.random() * 32));
            data.map(v => { return v + Math.random() * 64; }).forEach(v => { data.push(v); });
            data.map(v => { return Math.abs(v - Math.random() * 64); }).forEach(v => { data.push(v); });
            data.map(v => { return v + Math.random() * 64; }).forEach(v => { data.push(v); });
            data.map(v => { return Math.abs(v - Math.random() * 64); }).forEach(v => { data.push(v); });
            return data;
        };

        var halo = function (i) {
            return plot(ConstructRender.HALO({
                project: RenderProject.sphereProject(512 - Math.round(Math.random() * 256), 0.01),
                seed: 'irc.freenode.net' + i,
                data: gen(),
                radius: 32 + Math.round(Math.random() * 5),
                width: 16,
                tickMarks: 16
            }), Math.random() * Math.PI * 2, Math.random() * Math.PI * 2);
        };

        var graphs = [ ]
        for (var i=0; i<8; ++i) graphs.push(halo(i));

        graphs.forEach(function (group) {
            self.scene.add(group);
            setInterval(function () {
                group.rotation.y += 0.004;
            }, 10);
        });
    },

    render: function () {
        // this.pruneBegin();
        // this.pruneEnd();
        return <div className="render-target"></div>;
    }

});

export default DashBoard;
