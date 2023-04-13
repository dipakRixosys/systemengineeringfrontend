import React from "react";
import { Link, withRouter } from "react-router-dom";
import { modal, programLifecycleRoute, setTitle, triggerSwalLoader } from "helpers/common";
import DashboardLayout from "screens/Layouts/DashboardLayout";
import ProgramLayout from "screens/Layouts/ProgramLayout";
import PlaceholderLoader from "components/ui/placeholder-loader/placeholder-loader";
import FunctionalSafetyProgramHeader from "../slots/FunctionalSafetyProgramHeader";
import { apify, httpGet, httpPost } from "helpers/network";


// Hazard Description
class FunctionalSafetyConcept extends React.Component {
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
            programUuid={this.state['programUuid']} 
            body={<FunctionalSafetyProgramBody {...this.props} />}
            header={<FunctionalSafetyProgramHeader title="Functional Safety Concept" />}
            footer={<FunctionalSafetyProgramFooter {...this.props} />}
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
    };
  }

  fetchData = async () => {
    let programUuid = this.state["program"]["uuid"];
    httpGet(apify(`app/functional-safety/hazop?programUuid=${programUuid}`)).then((res) => {
      if (res["success"]) {
        let hazopFunctions = res["hazopObject"]["Hazop"]["Functions"];
        let safetyGoalsData = res["safetyGoals"]["goals"];
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

        this.setState({
          hazopFunctions: hazopFunctions,
          safetyGoalsData: safetyGoalsData,
          events: events,
          loading: false,
        });
      }
    });
  };

  showGoalDetails = (goalId) => {
    let { safetyGoalsData } = this.state;
    safetyGoalsData.map((goal, index) => {
      if(goal["Safety-Goal-Id"] === goalId) {
        this.setState({
          goalDetails: goal,
        });
      }
      return goal;
    });
    modal("#safetyGoalDetailViewModal");
  }

  
  componentDidMount () {
    this.fetchData();
  }

  render() {
    return(
      <div className="card-body">
        { this.state['loading'] && <PlaceholderLoader /> }
        {
          !this.state['loading'] && 
          <div>
            <h5 className="text-muted text-uppercase">Summary</h5>
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th className="text-left">Hazard ID</th>
                  <th className="text-center">Hazard Name</th>
                  <th className="text-center">ASIL Rating</th>
                  <th className="text-center">Safety Goal</th>
                  <th className="text-center">Technical Safety Requirement</th>
                  <th className="text-center">Hardware Safety Requirement</th>
                  <th className="text-center">Software Safety Requirement</th>
                </tr>
              </thead>
              <tbody>
                {
                  this.state['events']?.map(event => {
                    return(
                      <tr key={event['Hazardous-Event-ID']}>
                        <td className="text-left">{event['Hazard-ID']}</td>
                        <td className="text-center">{event['Hazard-Name']}</td>
                        <td className="text-center">
                          <span className="badge p-2" style={{backgroundColor: `${event["ASIL-Rating-Bg-Color"]}`, color:`${event["ASIL-Rating-Text-Color"]}`}}>
                            { event['ASIL-Rating-Value'] }
                          </span>
                        </td>
                        <td className="text-center">{event['Safety-Goals']?.map((goal, idx) => {
                          return (
                            <div key={idx} className="btn btn-sm">
                              <span onClick={()=> this.showGoalDetails(goal)}>{goal}</span>
                            </div>
                          )
                        })}</td>
                        <td className="text-center">{event['Technical-Safety-Requirement']}</td>
                        <td className="text-center">{event['Hardware-Safety-Requirement']}</td>
                        <td className="text-center">{event['Software-Safety-Requirement']}</td>
                      </tr>
                    )
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
        }

        {/* View Goals Modal */}
            <div
              className="modal fade"
              id="safetyGoalDetailViewModal"
              tabIndex="-1"
              data-keyboard="false"
              data-backdrop="static"
            >
              <div className="modal-dialog modal-lg">
                <div className="modal-content">
                  <div className="modal-header">
                    <h4 className="modal-title text-primary">Safety Goals</h4>
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
                          <th className="text-left">Goal ID</th>
                          <th className="text-left">Goal Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>{this.state["goalDetails"] && this.state["goalDetails"]["Safety-Goal-Id"]}</td>
                          <td>{this.state["goalDetails"] && this.state["goalDetails"]["Safety-Goal-Description"]}</td>
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

// Footer
class FunctionalSafetyProgramFooter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      program: props['program'],
      programUuid: props['program']['uuid'],
    };
  }

  submitProgram = (ev) => {
    ev.preventDefault();
    modal('#ModalConfirmation');
  }


  onConfirmation = (ev) => {
    ev.preventDefault();
    let programUuid = this.state['programUuid'];
    modal('#ModalConfirmation', 'hide');

    let params = {
      'programUuid': programUuid,
      'state': 'UNDER_REVIEW',
      'app': 'Criskle-Functional-Safety',
    };

    triggerSwalLoader();
    httpPost(apify(`app/programs/state-change`), params).then(res => {
      triggerSwalLoader('HIDE');
      let phaseRoute = programLifecycleRoute('Functional-Safety-View', programUuid);
      // document.location.href = phaseRoute;
      this.props.history.push(phaseRoute);
    });

  }

  render() {
    return(
      <div>
        <div className="row">
          <div className="col-12 col-md-6">
            <Link to={programLifecycleRoute('Functional-Safety-FSG', this.state['program']['uuid'])} className="btn btn-info px-4 mr-3 text-white">
              <span className='text-white'>
                <i className="fa fa-arrow-left mr-2"></i> 
                Back to <b>Safety Goals</b>
              </span>
            </Link>
          </div>

          <div className="col-12 col-md-6 text-right">
            {
              this.state['program']['fs_status'] === 'IN-PROCESS' && 
              <button type="button" className="btn btn-primary px-4 text-white" onClick={(ev) => this.submitProgram(ev)}>
                Submit &amp; <b>Send for Review</b>         
                <i className="fa fa-check ml-2"></i> 
              </button> 
            }         
          </div>
        </div>

        <div className="modal fade" id="ModalConfirmation" tabIndex="-1" data-keyboard="false" data-backdrop="static">
          <div className="modal-dialog modal-full-width">
            <form id="Form-Modal-Confirmation" onSubmit={(ev) => this.onConfirmation(ev)}>
              <div className="modal-content">
                <div className="modal-header">
                  <h4 className="modal-title text-primary">
                    Information
                  </h4>
                  <button type="button" className="close" data-dismiss="modal">
                    <span>&times;</span>
                  </button>
                </div>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-4 full-fa-icon">
                      <i className="fa fa-exclamation-circle"></i>
                    </div>

                    <div className="col-8">
                      <p>You are about to make the final submission for the Concept Phase.</p>
                      <p>Please review the change before submission.</p>
                      <p>Any further changes will require your manager/team leaders approval.</p>
                      <p><small>(An Email notification will be sent to manager once submitted.)</small></p>
                    </div>

                  </div>
                </div>
                <div className="modal-footer">
                  <div className="row w-100">
                    <div className="col-12 text-right">
                      <button type="submit" className="btn btn-success btn-lg btn-block" >
                        Confirm &amp; <b>Proceed</b>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    )
  }
}

export default withRouter(FunctionalSafetyConcept);