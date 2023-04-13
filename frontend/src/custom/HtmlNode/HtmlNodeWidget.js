import * as _ from 'lodash';

// HTML 
function HtmlNodeWidget(props) {

  //
  function generatePort() {
    return "Port";
  }

  // Widget UI
  return(
    <div
      className="custom-html-node-widget"
      data-default-node-name={props.model.getOptions().name}
      selected={props.model.isSelected()}
      background={props.model.getOptions().color}>
      <div>
        <div>{props.model.getOptions().name}</div>
      </div>
      <div className="ports">
        <div>{_.map(props.model.getInPorts(), generatePort)}</div>
        <div>{_.map(props.model.getOutPorts(), generatePort)}</div>
      </div>
    </div>
  )
}

//
export default HtmlNodeWidget;