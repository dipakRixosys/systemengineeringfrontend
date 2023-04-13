import React from "react";
import { Link, withRouter } from "react-router-dom";
import { modal, programLifecycleRoute, setTitle } from "helpers/common";
import DashboardLayout from "screens/Layouts/DashboardLayout";
import ProgramLayout from "screens/Layouts/ProgramLayout";
import PlaceholderLoader from "components/ui/placeholder-loader/placeholder-loader";
import FunctionalSafetyProgramHeader from "../slots/FunctionalSafetyProgramHeader";
import { apify, httpGet } from "helpers/network";

// Hazard Description
class FunctionalSafetyHazardDescription extends React.Component {
  constructor(props) {
    super(props);
    let { programUuid } = props.match.params;
    this.state = {
      loading: true,
      programUuid: programUuid,
    };
  }

  async componentDidMount() {
    setTitle("Functional Safety Hazard Description");
  }

  render() {
    return (
      <div>
        <DashboardLayout app="Criskle-Functional-Safety">
          <ProgramLayout
            programUuid={this.state["programUuid"]}
            header={
              <FunctionalSafetyProgramHeader title="Hazard Summary" />
            }
            body={<FunctionalSafetyProgramBody />}
            footer={<FunctionalSafetyProgramFooter />}
          ></ProgramLayout>
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
      loading: true,
      program: props["program"],
      hazopFunctions: [],
      hazards: [],
      focusHazardObject: undefined,
    };
  }

  fetchData = async () => {
    let programUuid = this.state["program"]["uuid"];
    httpGet(apify(`app/functional-safety/hazop?programUuid=${programUuid}`)).then((res) => {
      if (res["success"]) {
        let hazopFunctions = res["hazopObject"]["Hazop"]["Functions"];
        let hazards = [];

        // Get hazards from Hazard Function array
        hazopFunctions.forEach(functionObject => {
          let hazardObjects = functionObject['Hazards'];
          hazardObjects.forEach(hazardObject => {
            if (hazardObject['Hazard-Candidate']) {
              hazardObject['Function-Name'] = functionObject['Function'];
              hazards.push(hazardObject);
            }
          });
        });

        this.setState({
          hazopFunctions: hazopFunctions,
          hazards: hazards,
          loading: false,
        });
      }
    });
  };

  viewHazard(ev, hazardObject) {
    ev.preventDefault();
    this.setState({
      focusHazardObject: hazardObject,
    }, () => {
      modal('#ModalHazardInfo');
    });
  }

  componentDidMount() {
    this.fetchData();
  }

  render() {
    return (
      <div className="card-body">
        {this.state["loading"] && <PlaceholderLoader />}

        {
          !this.state["loading"] && 
          <div>
            <h5 className="text-muted text-uppercase">Summary</h5>
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th className="text-left">Function Name</th>
                  <th className="text-left">Hazard ID</th>
                  <th className="text-left">Hazard Name</th>
                  <th className="text-left">Description</th>
                  <th className="text-right"></th>
                </tr>
              </thead>
              <tbody>
                {
                  this.state['hazards'].map(row => {
                    return(
                      <tr key={row['Hazard-Uuid']}>
                        <td>{row['Function-Name']}</td>
                        <td>{row['Hazard-ID']}</td>
                        <td>{row['Hazardous-Name']}</td>
                        <td>{row['Hazard-Description']}</td>
                        <td className="text-right">
                          <button className="btn btn-primary btn-sm" onClick={(ev) => this.viewHazard(ev, row)}>
                            <i className="fa fa-eye mr-2"></i>
                            View
                          </button>
                        </td>
                      </tr>
                    )
                  })
                }
              </tbody>
            </table>

            <div className="modal fade" id="ModalHazardInfo" tabIndex="-1" data-keyboard="true" data-backdrop="static">
              <div className="modal-dialog modal-lg">
                <div className="modal-content">
                  <div className="modal-header">
                    <h4 className="modal-title text-primary">
                      View Hazard Info
                    </h4>
                    <button type="button" className="close" data-dismiss="modal">
                      <span>&times;</span>
                    </button>
                  </div>

                  <div className="modal-body p-0">
                    {
                      this.state['focusHazardObject'] &&
                      <table className="table table-striped table-bordered">
                        <tbody>
                          <tr>
                            <td className="font-weight-bold">Function Name</td>
                            <td>{this.state['focusHazardObject']['Function-Name']}</td>
                          </tr>
                          <tr>
                            <td className="font-weight-bold">Hazard ID</td>
                            <td>{this.state['focusHazardObject']['Hazard-ID']}</td>
                          </tr>
                          <tr>
                            <td className="font-weight-bold">Hazard Name</td>
                            <td>{this.state['focusHazardObject']['Hazardous-Name']}</td>
                          </tr>
                          <tr>
                            <td className="font-weight-bold">Hazard Description</td>
                            <td>{this.state['focusHazardObject']['Hazard-Description']}</td>
                          </tr>
                          <tr>
                            <td className="font-weight-bold">Hazard Remarks</td>
                            <td>{this.state['focusHazardObject']['Hazard-Remarks']}</td>
                          </tr>
                          <tr>
                            <td className="font-weight-bold">Guide Words</td>
                            <td>
                              <ul>
                              {
                                this.state['focusHazardObject']['Guide-Words'].map((w) => {
                                  return(<li key={w}>{w}</li>)
                                })
                              }
                              </ul>
                            </td>
                          </tr>
                          <tr>
                            <td className="font-weight-bold">Malfunction Behaviour</td>
                            <td>{this.state['focusHazardObject']['Malfunction-Behaviour']}</td>
                          </tr>
                          <tr>
                            <td className="font-weight-bold">Output Failure Type</td>
                            <td>{this.state['focusHazardObject']['Output-Failure-Type']}</td>
                          </tr>
                        </tbody>
                      </table>
                    }
                  </div>

                </div>
              </div>
            </div>

          </div>
        }
      </div>
    );
  }
}

// Footer
class FunctionalSafetyProgramFooter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      program: props["program"],
    };
  }

  render() {
    return (
      <div className="row">
        <div className="col-12 col-md-6">
          <Link to={programLifecycleRoute("Functional-Safety-HARA", this.state["program"]["uuid"])} className="btn btn-success px-3 text-white">
            Save and <b>Continue</b>
            <i className="fa fa-arrow-right ml-2"></i>
          </Link>
        </div>

        <div className="col-12 col-md-6 text-right">
          <Link to={programLifecycleRoute("Functional-Safety-HAZOP", this.state["program"]["uuid"])} className="btn btn-info px-3 text-white">
            <i className="fa fa-arrow-left mr-2"></i>
            Back to <b>Hazop</b>
          </Link>
        </div>
      </div>
    );
  }
}

export default withRouter(FunctionalSafetyHazardDescription);
