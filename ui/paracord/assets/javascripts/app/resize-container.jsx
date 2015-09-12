define(function (require, exports, module) {
    'use strict';

    var ResizeContainer = React.createClass({
        getInitialState: function () {
            return {
                width: this.props.width || window.innerWidth,
                height: this.props.height || window.innerHeight
            };
        },

        componentDidMount: function () {
            window.addEventListener('resize', this.handleResize);
        },

        componentWillUnmount: function () {
            window.removeEventListener('resize', this.handleResize);
        },

        handleResize: function () {
            this.setState(this.getInitialState());
        },

        render: function () {
            var style = {
                width: this.state.width + 'px',
                height: this.state.height + 'px'
            };
            return <div className="resize-container" style={style}>
                {this.props.children}
            </div>;
        }
    });

    return ResizeContainer;
});
