import React from "react";
import { Link, withRouter } from "react-router-dom";
import { programLifecycleRoute, setTitle } from "helpers/common";
import DashboardLayout from "screens/Layouts/DashboardLayout";
import ProgramLayout from "screens/Layouts/ProgramLayout";
import ProgramPropertyBar from "components/program/ProgramPropertyBar";
import InterfaceAgreementProgramHeader from "./slots/InterfaceAgreementProgramHeader";

// Interface Agreement Program
class InterfaceAgreementProgram extends React.Component {
  constructor(props) {
    super(props);
    let { programUuid } = props.match.params;
    this.state = {
      loading: true,
      programUuid: programUuid,
    };
  }

  async componentDidMount() {
    setTitle("Interface Agreement");
  }
  
  render() {
    return (
      <div>
        <DashboardLayout app="Criskle-Interface-Agreement">
          <ProgramLayout 
            programUuid={this.state['programUuid']} 
            header={<InterfaceAgreementProgramHeader />}
            body={<InterfaceAgreementProgramBody />}
          >
            
          </ProgramLayout>
        </DashboardLayout>
      </div>
    );
  }
}

// Body
class InterfaceAgreementProgramBody extends React.Component {
  constructor(props) {
    super(props);
    
    let systemConfiguration = props['program']['system_configuration'];

    this.state = {
      program: props['program'],
      systemConfiguration: systemConfiguration,
      allowFSInitilization: (Object.keys(systemConfiguration).length > 0),
    };
  }

  componentDidMount() {
    
  }

  render() {
    return(
      <div> 
        <div className="card-body">
          <ProgramPropertyBar program={this.state['program']} />

          {
            ! this.state['allowFSInitilization'] && 
            <div className="alert alert-light text-center">
              <strong>Minimum one function must be configured in the program.</strong>
              <br /><br />
              <Link to={programLifecycleRoute('System-Configuration', this.state['program']['uuid'])} className="btn btn-sm" target="_blank">
                Click to configure the program.
                <i className="fa fa-arrow-right"></i>
              </Link>
            </div>
          }

          {
            this.state['allowFSInitilization'] && 
            <div>
              <h6 className="text-muted text-uppercase">Interface Agreement</h6>
              <ul className="list-unstyled">
                <li className="list-item">
                  <Link to={programLifecycleRoute('Functional-Safety-HAZOP', this.state['program']['uuid'])}>Interface Agreement Item #1</Link>
                </li>
              </ul>   
            </div>
          }
        </div>

        <div className="card-footer">
          <div className="row">
            <div className="col-12 col-md-6">
              <button className="btn btn-primary px-3" disabled={!this.state['allowFSInitilization']}>
                <i className="fa fa-download mr-2"></i>
                Download <b>Report</b>
              </button>
            </div>

            <div className="col-12 col-md-6 text-right">
              <button className="btn btn-danger px-3" disabled={!this.state['allowFSInitilization']}>
                <i className="fa fa-refresh mr-2"></i>
                Reset <b>Agreement</b>
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default withRouter(InterfaceAgreementProgram);