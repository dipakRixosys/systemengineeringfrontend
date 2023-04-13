import React from "react";
const jQuery = window.jQuery;

class SeCLRatinOptions extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      threatLevelWarning: false,
    }
  }

  checkForThreatLevel = (ev) => {
    let threatLevel = jQuery('#Modal-Input-Threat-Level').val();
    let threatLevelWarning = (threatLevel === 'Damange-of-Goods') || (threatLevel === 'Life-Threatening-Possible');
    this.setState({
      threatLevelWarning: threatLevelWarning
    });
  }
  
  render() {
    return (
      <div className="form-group row">
        <div className="col-12 mb-2 text-uppercase text-muted">
          Security Level (SeCL) Ratings
        </div>

        <div className="col-4">
          <label>Required Resources</label>
          <select className="form-control md-form-control select my-2 input-security-level-ratings" name="Required-Resources" id="Modal-Input-Attack-Required-Resources" required defaultValue={this.props.getDefaultSelectValue('Attack-Step-Required-Resources')}>
            <option value="No-Tools-Required">No Tools Required</option>
            <option value="Standard-Tools">Standard Tools</option>
            <option value="Non-Standard-Tools">Non-Standard Tools</option>
            <option value="Advance-Tools">Advance Tools</option>
          </select>
        </div>

        <div className="col-4">
          <label>Required Knowhow</label>
          <select className="form-control md-form-control select my-2 input-security-level-ratings" name="Required-Knowhow" id="Modal-Input-Attack-Required-Knowhow" required defaultValue={this.props.getDefaultSelectValue('Attack-Step-Required-Knowhow')}>
            <option value="Average-Driver">Average Driver (Unknown Internals)</option>
            <option value="Basic-Internals-Understanding">Basic Internals Understanding</option>
            <option value="Focused-Interests">Internals Disclose, Focused Interests</option>
          </select>
        </div>

        <div className="col-4">
          <label>Threat Level (T) {this.props.getDefaultSelectValue('Attack-Step-Threat-Level')}</label>
          <select className="form-control md-form-control select my-2 input-security-level-ratings" name="Threat-Level" id="Modal-Input-Threat-Level" required defaultValue={this.props.getDefaultSelectValue('Attack-Step-Threat-Level')} onChange={(ev) => this.checkForThreatLevel(ev)}>
            <option value="No-Impact">No Impact</option>
            <option value="Annoying-Partial-Reduced-Service">Annoying Partial Reduced Service</option>
            <option value="Damange-of-Goods">Damange of Goods</option>
            <option value="Life-Threatening-Possible">Life Threatening Possible</option>
          </select>
        </div>

        {
          this.state['threatLevelWarning'] && 
          <div className="col-12 mt-2">
            <div className="alert alert-warning text-dark p-3">
              <h4 className="text-dark">
                <i className="fa fa-warning mr-2"></i> 
                Alert
              </h4>
              <p>
                Security Threat on Asset is deemed a Higher Threat which impacts Safety and needs to be probed in the Functional Safety domain. 
                <br />
                <i>Kindly re-assess and come back here!</i>
              </p>
            </div>

          </div>
        }
      </div>
    );
  }
}
export default SeCLRatinOptions;