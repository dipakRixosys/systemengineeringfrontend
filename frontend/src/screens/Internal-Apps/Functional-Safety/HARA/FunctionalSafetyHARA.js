import React from "react";
import { Link, withRouter } from "react-router-dom";
import { modal, programLifecycleRoute, setTitle } from "helpers/common";
import DashboardLayout from "screens/Layouts/DashboardLayout";
import ProgramLayout from "screens/Layouts/ProgramLayout";
import FunctionalSafetyProgramHeader from "../slots/FunctionalSafetyProgramHeader";
import PlaceholderLoader from "components/ui/placeholder-loader/placeholder-loader";
import { apify, httpGet } from "helpers/network";

// HARA
class FunctionalSafetyHARA extends React.Component {
  constructor(props) {
    super(props);
    let { programUuid } = props.match.params;
    this.state = {
      loading: true,
      programUuid: programUuid,
    };
  }

  async componentDidMount() {
    setTitle("Functional Safety HARA");
  }

  render() {
    return (
      <div>
        <DashboardLayout app="Criskle-Functional-Safety">
          <ProgramLayout 
            programUuid={this.state['programUuid']} 
            header={<FunctionalSafetyProgramHeader title="Hazard and Risk Analysis (HARA)" />}
            body={<FunctionalSafetyProgramBody />}
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
      loading: true,
      program: props['program'],
      hazopFunctions: [],
      events: [],
    };
  }

  fetchData = async () => {
    let programUuid = this.state["program"]["uuid"];
    httpGet(apify(`app/functional-safety/hazop?programUuid=${programUuid}`)).then((res) => {
      if (res["success"]) {
        let hazopFunctions = res["hazopObject"]["Hazop"]["Functions"];
        let events = [];
        hazopFunctions.forEach(functionObject => {
          let hazardObjects = functionObject['Hazards'];
          hazardObjects.forEach(hazardObject => {
            if (hazardObject['Hazard-Candidate'] && hazardObject['Create-Event']) {
              hazardObject['Function-Name'] = functionObject['Function'];
              events.push(hazardObject["Event"]);
            }
          });
        });

        let safetyGoalData = res["safetyGoals"]['goals'];
        let safetyGoalArray = [];

        safetyGoalData.forEach(goalObject => {
          safetyGoalArray.push({
            "Safety-Goal-Id": goalObject['Safety-Goal-Id'],
            "Safety-Goal-Uuid": goalObject['Safety-Goal-Uuid'],
            "Safety-Goal-Description": goalObject['Safety-Goal-Description'],
          });
        });

        this.setState({
          hazopFunctions: hazopFunctions,
          events: events,
          safetyGoalArray: safetyGoalArray,
          loading: false,
        });
      }
    });
  };


  showSafetyGoal = (ev, goalID) => {
    ev.preventDefault();
    modal("#showSafetyGoalDetails")
    let goalObject = this.state['safetyGoalArray'].filter((goal) => {
      return goal["Safety-Goal-Id"] === goalID;
    });
    this.setState({
      safetyGoalObject: goalObject[0],
    });
  }


  componentDidMount() {
    this.fetchData();
  }

  render() {
    return(
      <div>
        { this.state['loading'] && <PlaceholderLoader /> }
        {
          !this.state['loading'] && 
          <div>
            <div className="card-body">
              <table className="table table-bordered">
                <tbody>
                  {
                    (this.state['events'].length > 0) && 
                      this.state['events'].map((event) => {
                        return (
                          <tr key={event["Hazardous-Event-ID"]}>
                            <td><strong>Hazard ID</strong></td>
                            <td>{event["Hazard-ID"]}</td>
                            <td><strong>Hazard Name</strong></td>
                            <td>{event["Hazard-Name"]}</td>
                            <td><strong>Assigned Safety Goals</strong></td>
                            <td>{event["Safety-Goals"]?.map(goalID =>{
                              return (
                                <a key={goalID} href="#!" onClick={(ev) => this.showSafetyGoal(ev, goalID)} title="Click here to view Safety Goal">
                                  <span className="badge badge-primary mb-1 p-1">{goalID}</span> 
                                  <br />
                                </a> 
                              )
                              })}
                            </td>
                            <td className="text-center">
                              <span className="badge badge-v2 badge-success text-uppercase">Completed</span>
                            </td>
                            {
                            (this.state["program"]["fs_status"] !== "APPROVED" || this.state["program"]["fs_status"] !== "UNDER-REVIEW") &&
                            <td className="text-right">
                              <Link to={programLifecycleRoute('Functional-Safety-HARA-Edit-Event',this.state['program']['uuid'],{'hazardEventId': event['Hazardous-Event-ID']})} className="btn-link px-3">
                                  <i className="fa fa-gear mr-2"></i>
                                  Re-Configure
                                </Link>
                            </td>
                            }
                            
                        </tr>
                        );
                      })
                  }
                  {
                    (this.state['events'].length === 0) && 
                    <tr>
                      <td className="text-center">
                        No Hazardous Event found, 
                        <Link to={programLifecycleRoute('Functional-Safety-HARA-Create-Event', this.state['program']['uuid'])} className="ml-1">
                          click here to <b>Create new event</b>.
                        </Link>.
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>

            <div className="card-footer">
              <div className="row">
                <div className="col-12 col-md-6">
                {
                  (this.state["program"]["fs_status"] !== "APPROVED" || this.state["program"]["fs_status"] !== "UNDER-REVIEW") &&
                  <Link to={programLifecycleRoute('Functional-Safety-HARA-Create-Event', this.state['program']['uuid'])} className="btn btn-success px-3 text-white">
                    <i className="fa fa-plus mr-2"></i>
                    Create New Event
                  </Link>
                }
                 
                </div>

                <div className="col-12 col-md-6 text-right">
                  <Link to={programLifecycleRoute('Functional-Safety-Hazard-Description', this.state['program']['uuid'])} className="btn btn-info px-4 mr-2 text-white">
                    <i className="fa fa-arrow-left mr-2 "></i>
                    Back to <b>Hazard Summary</b>
                  </Link>

                  <Link to={programLifecycleRoute('Functional-Safety-FSG', this.state['program']['uuid'])} className="btn btn-success px-4 text-white">
                      View Safety Goals
                      <i className="fa fa-arrow-right ml-2"></i>
                  </Link>
                </div>

              </div>
            </div>
          </div>
        }

         {/* View Safety Goal Details Modal */}
         <div
              className="modal fade"
              id="showSafetyGoalDetails"
              tabIndex="-1"
              data-keyboard="false"
              data-backdrop="static"
            >
              <div className="modal-dialog modal-lg">
                <div className="modal-content">
                  <div className="modal-header">
                    <h4 className="modal-title text-primary">Hazard Details</h4>
                    <button
                      type="button"
                      className="close"
                      data-dismiss="modal"
                    >
                      <span>&times;</span>
                    </button>
                  </div>
                  <div className="modal-body">
                    <table className="table table-bordered">
                      <thead>
                        <tr>
                          <th className="text-left">Safety Goal ID</th>
                          <th className="text-left">Safety Goal Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                           <td>{this.state["safetyGoalObject"] && this.state["safetyGoalObject"]["Safety-Goal-Id"]}</td>
                           <td>{this.state["safetyGoalObject"] && this.state["safetyGoalObject"]["Safety-Goal-Description"]}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
      </div>
    )
  }
}

export default withRouter(FunctionalSafetyHARA);