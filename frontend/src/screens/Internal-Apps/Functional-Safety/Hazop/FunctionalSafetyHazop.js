import React from "react";
import { Link, withRouter } from "react-router-dom";
import { programLifecycleRoute, setTitle, triggerSwalLoader } from "helpers/common";
import DashboardLayout from "screens/Layouts/DashboardLayout";
import ProgramLayout from "screens/Layouts/ProgramLayout";
import FunctionalSafetyProgramHeader from "../slots/FunctionalSafetyProgramHeader";
import PlaceholderLoader from "components/ui/placeholder-loader/placeholder-loader";
import { apify, httpGet, httpPost } from "helpers/network";

// HAZOP
class FunctionalSafetyHazop extends React.Component {
  constructor(props) {
    super(props);
    let { programUuid } = props.match.params;
    this.state = {
      loading: true,
      programUuid: programUuid,
    };
  }

  async componentDidMount() {
    setTitle("Functional Safety HAZOP");
  }

  render() {
    return (
      <div>
        <DashboardLayout app="Criskle-Functional-Safety">
          <ProgramLayout 
            programUuid={this.state['programUuid']} 
            header={<FunctionalSafetyProgramHeader title="Hazard and Operational Scenarios (HAZOP)" />}
            body={<FunctionalSafetyProgramBody />}
            footer={<FunctionalSafetyProgramFooter />}
          >
            
          </ProgramLayout>
        </DashboardLayout>
      </div>
    );
  }
}

// Body
class FunctionalSafetyProgramBody extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      program: props['program'],
      hazopFunctions: [],
      loading: true,
    };
  }

  fetchData = async() => {
    let programUuid = this.state['program']['uuid'];
    httpGet(apify(`app/functional-safety/hazop?programUuid=${programUuid}`)).then(res => {
      if (res['success']) {
        let hazopFunctions = res['hazopObject']['Hazop']['Functions'];
        this.setState({
          programUuid : programUuid,
          hazopFunctions: hazopFunctions,
          loading: false,
        },() => this.handleFSStatus());
      }
    })
  }

  handleFSStatus = () => {
    let programUuid = this.state['programUuid'];

    if(this.state['program']['fs_status'] === 'CREATED') {
      let params = {
        'programUuid': programUuid,
        'state': 'IN-PROCESS',
        'app': 'Criskle-Functional-Safety',
      };

      triggerSwalLoader();
      httpPost(apify(`app/programs/state-change`), params).then(res => {
       if(res['success']) {
        triggerSwalLoader('HIDE');
        window.location.reload();
       }
      });
    }

  }

  componentDidMount() {
    this.fetchData();
  }

  render() {
    return(
      <div className="card-body">
        <table className="table table-bordered">
          <thead>
            <tr>
              <th className="text-left">Functions</th>
              <th className="text-left">Status</th>
              <th className="text-left">Is a Hazop Candidate</th>
              {
                (this.state["program"]["fs_status"] !== "APPROVED" || this.state["program"]["fs_status"] !== "UNDER-REVIEW") &&
                <th className="text-center">Action</th>
              }
              
            </tr>
          </thead>
          <tbody>
            {
              this.state['loading'] && 
              <tr>
                <td colSpan="4">
                  <PlaceholderLoader />
                </td>
              </tr>
            }

            {
              !this.state['loading'] && 
              this.state['hazopFunctions'].map((hazopFunction) => {
                return (
                  <tr key={hazopFunction['Uuid']}>
                    <td>{hazopFunction['Function']}</td>
                    <td>
                      {!hazopFunction['Is-Configured'] && <span className="badge badge-v2 badge-dark">Not Completed</span>}
                      { hazopFunction['Is-Configured'] && <span className="badge badge-v2 badge-success">Completed</span>}
                    </td>
                    <td>
                      {!hazopFunction['Has-Hazop-Candidate'] && <span className="badge badge-v2 badge-dark">No</span>}
                      { hazopFunction['Has-Hazop-Candidate'] && <span className="badge badge-v2 badge-success">Yes</span>}
                    </td>
                    {
                      (this.state["program"]["fs_status"] !== "APPROVED" || this.state["program"]["fs_status"] !== "UNDER-REVIEW") &&
                        <td className="text-center">
                        <Link to={programLifecycleRoute('Functional-Safety-HAZOP-Hazards', this.state['program']['uuid'], {'functionUuid': hazopFunction['Uuid']})}>
                          <i className="fa fa-gear mr-1"></i>
                          Configure Hazards
                        </Link>
                      </td>
                    }
                  </tr>
                )
              })
            }
          </tbody>
        </table>
      </div>
    )
  }
}

// Footer
class FunctionalSafetyProgramFooter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      program: props['program'],
    };
  }

  handleSync = () => {
    let programUuid = this.state['program']['uuid'];
    console.log(programUuid);
    triggerSwalLoader();
    triggerSwalLoader('HIDE');
  }

  render() {
    return(
      <div className="row">
        <div className="col-6 col-md-6 text-left">
          <Link to={programLifecycleRoute('Functional-Safety-Hazard-Description', this.state['program']['uuid'])} className="btn btn-success px-3 text-white">
            Next to <b>Hazard Summary</b>
            <i className="fa fa-arrow-right ml-2"></i>
          </Link>
            <button className="btn btn-primary px-3 text-white ml-2" onClick={() => {this.handleSync()}} disabled={(this.state["program"]["fs_status"] === "APPROVED" || this.state["program"]["fs_status"] === "UNDER-REVIEW")}>
              Sync System Configuration
              <i className="fa fa-refresh ml-2"></i>  
            </button>
        </div>

        <div className="col-6 col-md-6 text-right">
          <Link to={programLifecycleRoute('Functional-Safety-View', this.state['program']['uuid'])} className="btn btn-info px-3 text-white">
            <i className="fa fa-arrow-left mr-2"></i>
            Back to <b>Program</b>
          </Link>
        </div>
      </div>
    )
  }
}

export default withRouter(FunctionalSafetyHazop);