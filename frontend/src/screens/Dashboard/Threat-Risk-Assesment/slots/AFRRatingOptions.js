import React from "react";

class AFRRatinOptions extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="form-group row">
        <div className="col-12 mb-2 text-uppercase text-muted">
          Attack Step Feasibility Ratings
        </div>

        <div className="col-2">
          <label>Specialist Expertise</label>
          <select className="form-control md-form-control select my-2 input-attack-step-feasibility-ratings" name="Specialist-Expertise" id="Modal-Input-Attack-Specialist-Expertise" required defaultValue={this.props.getDefaultSelectValue('Attack-Step-Specialist-Expertise')}>
            <option value="Layman">Layman</option>
            <option value="Proficient">Proficient</option>
            <option value="Expert">Expert</option>
            <option value="Multiple">Multiple Experts</option>
          </select>
        </div>

        <div className="col-2">
          <label>Window of Opportunity</label>
          <select className="form-control md-form-control select my-2 input-attack-step-feasibility-ratings" name="Window-Of-Opportunity" id="Modal-Input-Attack-Window-of-Opportunity" required defaultValue={this.props.getDefaultSelectValue('Attack-Step-Window-of-Opportunity')}>
            <option value="Unlimited">Unlimited</option>
            <option value="Easy">Easy</option>
            <option value="Moderate">Moderate</option>
            <option value="Difficult">Difficult/None</option>
          </select>
        </div>

        <div className="col-2">
          <label>Equipment/Effort</label>
          <select className="form-control md-form-control select my-2 input-attack-step-feasibility-ratings" name="Equipment-Effort" id="Modal-Input-Attack-Equipment" required defaultValue={this.props.getDefaultSelectValue('Attack-Step-Attack-Equipment')}>
            <option value="Standard">Standard</option>
            <option value="Specialiced">Specialiced</option>
            <option value="Bespoke">Bespoke</option>
            <option value="Multiple-Bespoke">Multiple Bespoke</option>
          </select>
        </div>

        <div className="col-3">
          <label>Elapsed Time</label>
          <select className="form-control md-form-control select my-2 input-attack-step-feasibility-ratings" name="Elapsed-Time" id="Modal-Input-Attack-Elapsed-Time" required defaultValue={this.props.getDefaultSelectValue('Attack-Step-Attack-Elapsed-Time')}>
            <option value="Less-Than-1-Week">Less-than 1 week</option>
            <option value="Less-Than-1-Month">Less-than 1 month</option>
            <option value="Less-Than-6-Months">Less-than 6 months</option>
            <option value="Less-Than-3-Years">Less-than 3 years</option>
            <option value="More-Than-3-Years">More-than 3 years</option>
          </select>
        </div>

        <div className="col-3">
          <label>Knowledge of Item</label>
          <select className="form-control md-form-control select my-2 input-attack-step-feasibility-ratings" name="Knowledge-Of-Item" id="Modal-Input-Attack-Knowledge-of-Item" required defaultValue={this.props.getDefaultSelectValue('Attack-Step-Knowledge-of-Item')}>
            <option value="Negligible">Negligible</option>
            <option value="Moderate">Moderate</option>
            <option value="Major">Major</option>
            <option value="Severe">Severe</option>
          </select>
        </div>
      </div>
    );
  }
}
export default AFRRatinOptions;