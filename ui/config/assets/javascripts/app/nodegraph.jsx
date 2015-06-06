define(function (require, exports, module) {
	'use strict';

	var ConfigActions = require('app/configactions'),
		ConfigStore = require('app/configstore');

	var NodeGraph = React.createClass({
		mixins: [
			Reflux.connect(ConfigStore, 'config')
		],

		nodes: function (self) {
			var lookup = { },
				values = this.state.config,
				list = Object.keys(values);

			list.filter(function (name) { 
				return name !== self;

			}).forEach(function (name) {
				var upstream = values[name].upstream;
				lookup[name] = {
					name: name,
					upstream: upstream ? upstream.name : undefined
				};
			});

			return lookup;
		},

		nodelist: function (self) {
			return Object.keys(this.state.config).filter(function (name) {
				return name !== self;
			});
		},

		componentDidMount: function () {
			this.renderGraph();
		},

		componentDidUpdate: function () {
			this.renderGraph();
		},

		renderGraph: function () {
			var el = this.getDOMNode(),
				svg = d3.select(el),
			    inner = svg.select('g'),
			    d3render = new dagreD3.render(),
				g = new dagreD3.graphlib.Graph().setGraph({});

			var lookup = this.nodes(),
				list = Object.keys(lookup).map(function (name) {
					return lookup[name];
				});

			// build nodes
			list.forEach(function (node) {
				g.setNode(node.name, { label: node.name });
			});

			// build edges
			list.forEach(function (node) {
				if (node.upstream) g.setEdge(node.name, node.upstream, { arrowhead: 'normal', label: '' });
			});

			d3render(inner, g);

			var select = $(el).find('select');
			select.material_select();
			select.on('change', function() {
				var el = $(this),
					value = el.val(),
					name = el.attr('data-name');

				ConfigActions.valueUpdate(name + '/upstream/name', value);
			});
		},
			
		render: function () {
			var lookup = this.nodes();

			return <div className="flex-cols edit-depth-1">
				<div>
					{this.nodelist('terminal-server').map((name) => {
						var selected = lookup[name].upstream;

						return <div key={name} className="input-field upstream-row">
							<select data-name={name} value={selected}>
								<option value="">no upstream</option>
								{this.nodelist(name).map((name) => {
									var node = lookup[name];
									return <option key={node.name} value={node.name}>{node.name}</option>;
								})}
							</select>
							<label>{name}</label>
						</div>;
					})}
				</div>
				<div className="flex-item">
					<svg className="upstream"><g/></svg>
				</div>
			</div>;
		}
	});

	return NodeGraph;
});