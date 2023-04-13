import React from "react";
import { Link, withRouter } from "react-router-dom";
import { modal, programLifecycleRoute, setTitle, swalConfirmationPopup, triggerSwalLoader } from "helpers/common";
import DashboardLayout from "screens/Layouts/DashboardLayout";
import ProgramLayout from "screens/Layouts/ProgramLayout";
import FunctionalSafetyProgramHeader from "../slots/FunctionalSafetyProgramHeader";
import PlaceholderLoader from "components/ui/placeholder-loader/placeholder-loader";
import { apify, httpGet, httpPost } from "helpers/network";

// HAZOP : List of hazards
class FunctionalSafetyHazopHazards extends React.Component {
  constructor(props) {
    super(props);
    let { programUuid, functionUuid } = props.match.params;
    this.state = {
      loading: true,
      programUuid: programUuid,
      functionUuid: functionUuid,
    };
  }

  async componentDidMount() {
    setTitle("Functional Safety HAZOP Hazards");
  }

  render() {
    return (
      <div>
        <DashboardLayout app="Criskle-Functional-Safety">
          <ProgramLayout 
            programUuid={this.state['programUuid']} 
            header={<FunctionalSafetyProgramHeader title="Hazard Description" />}
            body={<FunctionalSafetyProgramBody {...this.props} functionUuid={this.state['functionUuid']} />}
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
      functionUuid: props['functionUuid'],
      hazopFunction: [],
      loading: true,
    };
  }

  fetchData = async() => {
    let programUuid = this.state['program']['uuid'];
    httpGet(apify(`app/functional-safety/hazop?programUuid=${programUuid}`)).then(res => {
      if (res['success']) {
        let hazopFunctions = res['hazopObject']['Hazop']['Functions'];
        let hazopFunction = hazopFunctions.filter((f) => f['Uuid'] === this.state['functionUuid']);
        hazopFunction = hazopFunction ? hazopFunction[0] : null;
        
        this.setState({
          loading: false,
          hazopFunction: hazopFunction,
        });

      }
    })
  }

  viewHazardInfo = (ev, hazardObject) => {
    ev.preventDefault();
    this.setState({
      focusHazardObject: hazardObject,
    }, () => {
      modal('#ModalHazardInfo');
    });
  }

  removeHazard = (ev, hazardUuid) => {
    swalConfirmationPopup({
      title: "Remove Hazard",
      text: "This action would remove this hazard from system.",
      confirmButtonText: "Remove",
    }, () => {
      
      triggerSwalLoader();

      let params = {
        programUuid: this.state['program']['uuid'],
        functionUuid: this.state['functionUuid'],
        hazardUuid: hazardUuid,
      };

      httpPost(apify('app/functional-safety/hazop/delete-hazard'), params).then(data => {
        if (data['success']) {
          triggerSwalLoader('HIDE');
          this.fetchData();
        }
      });

    });
  }

  componentDidMount() {
    this.fetchData();
  }

  render() {
    return(
      <div>
        <div className="card-body">
          { this.state['loading'] && <PlaceholderLoader /> }

          {
            !this.state['loading'] && 
            <>
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th className="text-left">Function Name</th>
                  <th colSpan={3} className="text-left">
                    <strong className="text-primary">
                      {this.state['hazopFunction']['Function']}
                    </strong>
                  </th>
                </tr>
                <tr>
                  <th className="text-left">Hazard ID </th>
                  <th className="text-left">Name</th>
                  {
                    (this.state["program"]["fs_status"] !== "APPROVED" || this.state["program"]["fs_status"] !== "UNDER-REVIEW") &&
                  <th className="text-center" colSpan={2}>Actions</th>
                  }
                </tr>
              </thead>
              <tbody>
                {
                 this.state['hazopFunction']['Hazards'].map((hazardObject) => {
                  return(
                    <tr key={hazardObject['Hazard-Uuid']}>
                      <td>{hazardObject['Hazard-Candidate'] ? hazardObject['Hazard-ID'] : 'N/A' }</td>
                      <td>{hazardObject['Hazard-Candidate'] ? hazardObject['Hazard-Name'] || hazardObject['Hazardous-Name'] : 'N/A' }
                        <button className="btn btn-outline-primary btn-sm ml-4" onClick={ev => this.viewHazardInfo(ev, hazardObject)}>
                          <i className="fa fa-eye mr-2"></i>
                          View Info 
                        </button>
                      </td>
                      {
                      (this.state["program"]["fs_status"] !== "APPROVED" || this.state["program"]["fs_status"] !== "UNDER-REVIEW") &&
                      <>
                        <td className="text-right">
                          <Link to={programLifecycleRoute('Functional-Safety-Edit-Configure-Hazop-Function',this.state['program']['uuid'],{'functionUuid': this.state['functionUuid']},{'hazardUuid': hazardObject['Hazard-Uuid']})} className="btn-link px-3">
                            <i className="fa fa-gear mr-2"></i>
                            Re-Configure
                          </Link>
                        </td>
                        <td className="text-right" >
                          <button className="btn btn-danger btn-sm" onClick={ev => this.removeHazard(ev, hazardObject['Hazard-Uuid'])}>
                            <i className="fa fa-trash mr-2"></i>
                            Remove Hazard 
                          </button>
                        </td>
                      </>
                      }
                    </tr>
                  )
                 }) 
                }

                {
                  (this.state['hazopFunction']['Hazards'].length === 0) && 
                  <tr className="text-center">
                    <td colSpan={4}>
                      No hazards found, please <b>Configure Hazard</b> for this function.
                    </td>
                  </tr>
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
                            <td>{this.state['hazopFunction']['Function']}</td>
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
            </>

            
          }
        </div>

        <div className="card-footer">
          <div className="row">
            <div className="col-12 col-md-6">
            {
              (this.state["program"]["fs_status"] !== "APPROVED" || this.state["program"]["fs_status"] !== "UNDER-REVIEW") &&
              <Link to={programLifecycleRoute('Functional-Safety-Configure-Hazop-Function', this.state['program']['uuid'], {'functionUuid': this.state['functionUuid']})} className="btn btn-primary px-3 text-white">
                <i className="fa fa-plus mr-2"></i>
                Configure <b>Hazard</b>
              </Link>
            }
              
            </div>

            <div className="col-12 col-md-6 text-right">
              <Link to={programLifecycleRoute('Functional-Safety-HAZOP', this.state['program']['uuid'])} className="btn btn-info px-3 text-white">
                <i className="fa fa-arrow-left mr-2"></i>
                Back to <b>HAZOP</b>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default withRouter(FunctionalSafetyHazopHazards);