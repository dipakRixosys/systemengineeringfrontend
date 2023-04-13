import React from "react";
import ProgramHeader from "components/program/ProgramHeader";

// Header
class FunctionalSafetyProgramHeader extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      program: props['program'],
    };
  }
  render() {
    return(
      <ProgramHeader program={this.state['program']} {...this.props} />
    )
  }
}
export default FunctionalSafetyProgramHeader;