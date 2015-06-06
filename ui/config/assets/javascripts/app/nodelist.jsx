define(function (require, exports, module) {
    'use strict';

    var UIStore = require('app/uistore'),
        UIActions = require('app/uiactions'),
        ConfigStore = require('app/configstore');

    var NodeList = React.createClass({
        mixins: [
            Reflux.connect(UIStore, 'ui'),
            Reflux.connect(ConfigStore, 'config')
        ],

        nodes: function () {
            var list = Object.keys(this.state.config);
            list.unshift('upstream-path');
            return list;
        },

        viewNode: function (node, e) {
            e.preventDefault();
            UIActions.activeNode(node);
        },

        render: function () {
            return (
                <ul id="slide-out" className="side-nav fixed">
                    <li className="logo blue-grey darken-4 white-text center-align">
                        <i className="medium mdi-action-dashboard"></i>
                    </li>
                    {this.nodes().map((node) => {
                        var active = (node === this.state.ui.active),
                            liTagClass = active ? 'active blue-grey darken-4' : '',
                            aTagClass = active ? 'white-text' : 'blue-grey-text darken-4';

                        return <li key={'node-' + node} className={liTagClass}><a href="#!" className={aTagClass}
                            onClick={this.viewNode.bind(this, node)}>{node}</a></li>;
                    })}
                </ul>
            );
        }
    });

    return NodeList;
});