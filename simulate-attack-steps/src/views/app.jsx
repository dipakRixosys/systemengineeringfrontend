import Canvas from "./canvas";
import SidebarContainer from "./sidebar_container";

var React = require("react"),
    TreeActions = require("../actions/tree_actions"),
    IpcActions = require("../actions/ipc_actions");


export default React.createClass({
    render: function () {
        return (
            <div>
                <SidebarContainer onGenerateButtonPressed={this._changeTree} />
                <Canvas ref="canvas" />
            </div>
        );
    },

    componentDidMount: function () {
        IpcActions.initBindings();
    },

    _changeTree: function (tree) {
        TreeActions.changeTree(tree);
    },

    _onChange: function () {
        // this.setState(getStateFromStore());
    }
});