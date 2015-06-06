define(function (require, exports, module) {
    'use strict';

    var UIStore = require('app/uistore'),
        ConfigActions = require('app/configactions'),
        ConfigStore = require('app/configstore');

    var NodeConfig = React.createClass({
        mixins: [
            Reflux.connect(UIStore, 'ui'),
            Reflux.connect(ConfigStore, 'config')
        ],

        flatten: function(result, depth, path, name, cursor) {
            var self = this,
                type = typeof cursor;

            // READ ONLY PATHS
            if (depth === 2 && ['api', 'port', 'routes', 'upstream'].indexOf(name) !== -1)
                return;

            // extra check for array
            if (type === 'object' && Array.isArray(cursor)) {
                type = 'array';
            }

            var leaf = (type !== 'array' && type !== 'object');

            result.push({
                type: type,
                path: path,
                name: leaf ? path : name,
                depth: depth,
                value: cursor,
                leaf: leaf
            });

            if (type === 'array') {
                cursor.forEach(function (value, index) {
                    self.flatten(result, depth + 1, path + '/' + index, index, value);
                });
                result.push({
                    type: type,
                    path: path,
                    name: 'add to ' + path,
                    depth: depth + 1,
                    addTo: 'array'
                });

            } else if (type === 'object') {
                Object.keys(cursor).forEach(function (key) {
                    self.flatten(result, depth + 1, path + '/' + key, key, cursor[key]);
                });
                result.push({
                    type: type,
                    path: path,
                    name: 'add to ' + path,
                    depth: depth + 1,
                    addTo: 'object'
                });
            }
        },

        stateKey: function (path, name) {
            return name + '-' + path;
        },

        onChange: function(key, e) {
            e.preventDefault();
            this.state[key] = e.target.value;
            this.setState(this.state);
        },

        onValueChange: function(path, e) {
            var inputKey = this.stateKey(path, 'key'),
                value = this.state[inputKey];

            // most likely things will come accross as string
            ConfigActions.valueUpdate(path, value);
        },

        onValueDelete: function(path, e) {
            e.preventDefault();
            ConfigActions.valueDelete(path);
        },

        hasValue: function (prop) {
            if (prop === undefined) return false;
            
            var type = typeof prop;
            if (type === 'string' && prop.length === 0) return false;

            return true;
        },

        getValue: function (value) {
            var inputKey = this.stateKey(value.path, 'key'),
                inputMirror = this.stateKey(value.path, 'mirror');

            if (this.state[inputMirror] !== value.value) {
                this.state[inputKey] = value.value;
                this.state[inputMirror] = value.value;
            }

            return this.state[inputKey];            
        },

        valueEditor: function (value) {
            var inputID = 'input-' + value.path,
                inputKey = this.stateKey(value.path, 'key'),
                inputRef = this.stateKey(value.path, 'ref');

            var prop = this.getValue(value),
                labelClass = this.hasValue(prop) ? 'active' : '';

            return <div className="input-field flex-cols">
                <input id={inputID} type="text"
                    ref={inputRef}
                    value={prop}
                    onChange={this.onChange.bind(this, inputKey)}
                    onBlur={this.onValueChange.bind(this, value.path)} />
                <label htmlFor={inputID} className={labelClass}>{value.name}</label>

                <a onClick={this.onValueDelete.bind(this, value.path)}
                    className="waves-effect waves-light btn-floating blue-grey darken-4 flex-item"><i className="mdi-action-delete"></i></a>
            </div>;
        },

        onAddTo: function (path, type, addType, e) {
            e.preventDefault();
            var inputKey = this.stateKey(path, 'add-key'),
                name = String(this.state[inputKey] !== undefined ? this.state[inputKey] : '');

            // clear input
            this.state[inputKey] = '';
            this.setState(this.state);

            // can't add an empty
            if (name.length === 0) return;

            // prep value
            var value;
            switch (addType) {
                case 'array':
                    value = [ ];
                    break;

                case 'object':
                    value = { };
                    break;

                default:
                    value = (type === 'array') ? name : '';
                    break;
            }

            if (type === 'array') {
                // add to array
                ConfigActions.addValueToArray(path, value);

            } else if (type === 'object') {
                // add to object
                ConfigActions.addValueToObject(path, name, value);

            }
        },

        onAddToKeyDown: function (path, type, e) {
            if (e.which !== 13) return;
            this.onAddTo(path, type, 'value', e);
        },

        valueAddTo: function (value) {
            var inputType = value.addTo,
                inputID = 'input-add' + value.path,
                inputKey = this.stateKey(value.path, 'add-key'),
                inputRef = this.stateKey(value.path, 'add-ref');

            return <div className="input-field flex-cols">
                <input id={inputID} type="text"
                    ref={inputRef}
                    value={this.state[inputKey]}
                    onChange={this.onChange.bind(this, inputKey)}
                    onKeyDown={this.onAddToKeyDown.bind(this, value.path, inputType)}/>
                <label htmlFor={inputID}>{value.name}</label>

                <a onClick={this.onAddTo.bind(this, value.path, inputType, 'value')}
                    className="waves-effect waves-light btn-floating blue-grey darken-4 flex-item"><i className="mdi-content-add"></i></a>
                <a onClick={this.onAddTo.bind(this, value.path, inputType, 'array')}
                    className="waves-effect waves-light btn-floating blue-grey darken-4 flex-item"><i className="mdi-action-view-list"></i></a>
                <a onClick={this.onAddTo.bind(this, value.path, inputType, 'object')}
                    className="waves-effect waves-light btn-floating blue-grey darken-4 flex-item"><i className="mdi-action-view-quilt"></i></a>
            </div>;
        },

        render: function () {
            var path = this.state.ui.active,
                list = [];

            this.flatten(list, 1, path, path, this.state.config[path]);
            return (
                <div>
                    {list.map((value) => {
                        var classString = 'bg-hover edit-depth-' + value.depth;

                        var valueKey = value.path,
                            valueEditor = '';

                        if (value.addTo === 'array') {
                            valueKey += '-add-to-array';
                            valueEditor = this.valueAddTo(value);

                        } else if (value.addTo === 'object') {
                            valueKey += '-add-to-object';
                            valueEditor = this.valueAddTo(value);

                        } else if (value.leaf) {
                            valueEditor = this.valueEditor(value);

                        } else {
                            if (value.depth === 1) {
                                valueEditor = <h5>{value.name}</h5>;

                            } else {
                                valueEditor = <div className="input-field flex-cols">
                                    <h6 className="full-width">{value.name}</h6>
                                    <a onClick={this.onValueDelete.bind(this, value.path)}
                                        className="waves-effect waves-light btn-floating blue-grey darken-4 flex-item"><i className="mdi-action-delete"></i></a>
                                </div>;
                            }
                        }

                        return <div key={valueKey} className={classString}>
                            {valueEditor}
                        </div>;
                    })}             
                </div>
            );
        }
    });

    return NodeConfig;
});