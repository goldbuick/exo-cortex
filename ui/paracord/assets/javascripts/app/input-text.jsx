import InputStore from 'app/input-store';
import InputActions from 'app/input-actions';

var InputText = React.createClass({
    mixins: [
        Reflux.connect(InputStore, 'input'),
    ],

    handleChange: function (event) {
        InputActions.change(this.state.input.rid, event.target.value);
    },

    handleKeyDown: function (event) {
        if (event.keyCode !== 13) return;
        InputActions.done(this.state.input.rid, this.state.input.value);
    },

    render: function () {
        if (!this.state.input.open) return <div></div>;

        return <div className="input-text">
            <input type="text"
                value={this.state.input.value}
                onChange={this.handleChange}
                onKeyDown={this.handleKeyDown} />
        </div>;
    }

});

export default InputText;
