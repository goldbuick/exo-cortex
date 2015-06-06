define(function (require, exports, module) {
	'use strict';

	var UIStore = require('app/uistore'),
		NodeList = require('app/nodelist'),
		NodeGraph = require('app/nodegraph'),
		NodeConfig = require('app/nodeconfig');

	var Page = React.createClass({
		mixins: [
			Reflux.connect(UIStore, 'ui'),
		],
		render: function () {
			var UI;

			if (this.state.ui.active === 'upstream-path') {
				UI = <NodeGraph />;
			} else {
				UI = <NodeConfig />;
			}

			return (
				<div>
					<header>
						<nav className="top-nav blue-grey darken-4">
							<div className="nav-wrapper valign-wrapper">
								<a href="#" data-activates="slide-out" className="button-collapse">
									<i className="mdi-navigation-menu"></i></a>
								<h5 className="valign">STEM-CONFIG</h5>
							</div>
						</nav>
						<NodeList />
  					</header>
  					<main>
  						{UI}
  					</main>
				</div>
			);
		}
	});

	return Page;
});
