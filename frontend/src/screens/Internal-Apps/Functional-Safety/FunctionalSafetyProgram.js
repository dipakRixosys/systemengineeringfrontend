import React from "react";
import { Link, withRouter } from "react-router-dom";
import { modal, programLifecycleRoute, renderTime, setTitle, swalConfirmationPopup, swalPopup, triggerSwalLoader } from "helpers/common";
import DashboardLayout from "screens/Layouts/DashboardLayout";
import ProgramLayout from "screens/Layouts/ProgramLayout";
import ProgramPropertyBar from "components/program/ProgramPropertyBar";
import FunctionalSafetyProgramHeader from "./slots/FunctionalSafetyProgramHeader";
import { apiBaseUrl, apify, httpPost } from "helpers/network";
import ProgramSwitchApp from "components/program/ProgramSwitchApp";


// Functional Safety Program
class FunctionalSafetyProgram extends React.Component {
  constructor(props) {
    super(props);
    let { programUuid } = props.match.params;
    this.state = {
      loading: true,
      programUuid: programUuid,
    };
  }

  async componentDidMount() {
    setTitle("Functional Safety");
  }
  
  render() {
    return (
      <div>
        <DashboardLayout app="Criskle-Functional-Safety">
          <ProgramLayout 
            programUuid={this.state['programUuid']} 
            header={<FunctionalSafetyProgramHeader />}
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
    
    let systemConfiguration = props['program']['system_configuration'];
    let programUuid = props['program']['uuid'];

    this.state = {
      program: props['program'],
      programUuid : programUuid,
      systemConfiguration: systemConfiguration,
      selectedInputData : [],
      isReportLoading: false,
      allowFSInitilization: (Object.keys(systemConfiguration).length > 0),
    };
  }

  handleResetParameter = () => {
    let programUuid = this.state["program"]["uuid"];
    let resetProgram  = {
      "programUuid": programUuid,
    }

    swalConfirmationPopup({
      title: null,
      text: "This action will reset the safety parameter.",
      confirmButtonText: "Reset",
    }, () => {
      
      triggerSwalLoader();

      httpPost(apify('app/functional-safety/hazop/reset-hazard'), resetProgram).then(res => {
        if (res['success']) {
          triggerSwalLoader('HIDE');
          this.setState({
            programs: res['programs'],
            programsProgressPending: false,
            loading: false,
          });
        }
      });
    });
  }


  conceptPhaseReport = (ev, type = "PDF") => {
    ev.preventDefault();
    let params = {
      'programUuid': this.state.programUuid,
      'selectedInput': this.state["selectedInputData"] ? this.state["selectedInputData"] : [],
      'page': 'Functional-Safety-Program',
      'app' : 'Criskle-Functional-Safety',
    };

    // Get report
    httpPost(apify(`app/programs/phase-report?programUuid=${this.state.programUuid}`), params).then(data => {
      if (type === 'PDF') {
        let pdfPath = apiBaseUrl(data.path);
        modal("#pdfViewer")
        document.getElementById("pdfViewerIframe").setAttribute("src", pdfPath);
        this.setState({
          isReportLoading: false,
        });
      }
      else if (type === 'JSON') {
        var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data.jsonData));
        var downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "report.json");
        document.body.appendChild(downloadAnchorNode); // required for firefox
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
        this.setState({
          isReportLoading: false,
        });
      }
    }).catch(() => {
      swalPopup("Something went wrong while downloading report.");
      this.setState({
        isReportLoading: false,
      });
    });

  }

  changeModalStatus = (ev, data) => {
    modal("#Modal-Report", {
      show: true,
    });
  };


  checkboxChange = (ev, data) => {
    let selectedInputData = this.state["selectedInputData"] ? this.state["selectedInputData"] : [];
    if (data === "All") {
      var ele = document.getElementsByClassName("selectValueCheckbox");
      for (var i = 0; i < ele.length; i++) {
        if (ev.currentTarget.checked) {
          if (ele[i].type === "checkbox" && ele[i].value !== "All") {
            ele[i].checked = true;
            selectedInputData.push(ele[i].value);
          }
        } else {
          ele[i].checked = false;
          selectedInputData = selectedInputData.filter(
            // eslint-disable-next-line
            (input) => input !== ele[i].value
          );
        }
      }
    } else {
      if (ev.currentTarget.checked) {
        selectedInputData.push(data);
      } else if (selectedInputData.includes(data)) {
        selectedInputData = selectedInputData.filter((input) => input !== data);
      }
    }

    this.setState({
      selectedInputData: selectedInputData,
    });
  };

  
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
            <div className="row">
              <div className="col-12 col-md-6 text-left">
                <h6 className="text-muted text-uppercase">Functional Safety</h6>
                <ul className="list-unstyled">
                  <li className="list-item">
                    <Link to={programLifecycleRoute('Functional-Safety-HAZOP', this.state['program']['uuid'])}>Hazard and Operational Scenarios (HAZOP)</Link>
                  </li>
                  <li className="list-item">
                    <Link to={programLifecycleRoute('Functional-Safety-Hazard-Description', this.state['program']['uuid'])}>Hazard Summary</Link>
                  </li>
                  <li className="list-item">
                    <Link to={programLifecycleRoute('Functional-Safety-HARA', this.state['program']['uuid'])}>Hazard and Risk Analysis (HARA)</Link>
                  </li>
                  <li className="list-item">
                    <Link to={programLifecycleRoute('Functional-Safety-FSG', this.state['program']['uuid'])}>Mapping of Hazards to Functional Safety Goals</Link>
                  </li>
                  <li className="list-item">
                    <Link to={programLifecycleRoute('Functional-Safety-Concept', this.state['program']['uuid'])}>Functional Safety Concept</Link>
                  </li>
                </ul>   
              </div>

              {
              this.state.program["fs_status"] === "REJECTED" && 
              <div className="col-12 col-md-6 text-right">
                <h5>Program Rejected Reason</h5>
                <div className="text-right">
                  <span>Reject Remark : {this.state["program"]["rejected_remark"]} </span>
                  <br />
                  <span>Rejected At : {renderTime(this.state["program"]["rejected_at"])}</span>
                </div>
              </div>
              }
            </div>
          }
        </div>

        <div className="card-footer">
          <div className="row">
            <div className="col-12 col-md-8">
              <button className="btn btn-primary px-3" disabled={!this.state['allowFSInitilization'] || !this.state['program']['fs_status'] !== 'APPROVED'} onClick={()=> this.changeModalStatus()}>
                <i className="fa fa-download mr-2"></i>
                Download <b>Report</b>
              </button>

              <div className="d-inline ml-2">
                <ProgramSwitchApp program={this.state['program']} currentApp="Criskle-Functional-Safety" />
              </div>
            </div>

            <div className="col-12 col-md-4 text-right">
              <button className="btn btn-danger px-3" disabled={!this.state['allowFSInitilization']} onClick={this.handleResetParameter}>
                <i className="fa fa-refresh mr-2"></i>
                Reset <b>Safety Parameters</b>
              </button>
            </div>
          </div>
        </div>

        {/* Modal report  */}
        <div
          className="modal fade"
          id="Modal-Report"
          tabIndex="-1"
          data-backdrop="static"
        >
          <div className="modal-dialog modal-full-width">
            <div className="modal-content">
              <div className="modal-header">
                <h4 className="modal-title text-primary">
                  Functional Safety Report
                </h4>
                <button
                  type="button"
                  className="close"
                  data-dismiss="modal"
                >
                  <span>&times;</span>
                </button>
              </div>
              <div className="modal-body widget-modal-body">
                {
                  <div>
                    {/* <h5>Assets</h5> */}
                    <table className="table">
                      <tbody>
                        <tr>
                          <td>
                            <input
                              className="mx-2 selectValueCheckbox"
                              type="checkbox"
                              value={"All"}
                              onChange={(e) => this.checkboxChange(e, "All")}
                            />
                            <label className="mb-0">
                              {"Select All".replaceAll("-", " ")}{" "}
                            </label>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <input
                              className="mx-2 selectValueCheckbox"
                              type="checkbox"
                              value={"Function-Name"}
                              onChange={(e) => this.checkboxChange(e, "Function-Name")}
                            />
                            <label className="mb-0">
                              {"Function-Name".replaceAll("-", " ")}{" "}
                            </label>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <input
                              className="mx-2 selectValueCheckbox"
                              type="checkbox"
                              value={"Hazard-Name"}
                              onChange={(e) =>
                                this.checkboxChange(e, "Hazard-Name")
                              }
                            />
                            <label className="mb-0">
                              {"Hazard-Name".replaceAll("-", " ")}{" "}
                            </label>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <input
                              className="mx-2 selectValueCheckbox"
                              type="checkbox"
                              value={"Hazard-Description"}
                              onChange={(e) => this.checkboxChange(e, "Hazard-Description")}
                            />
                            <label className="mb-0">
                              {"Hazard-Description".replaceAll("-", " ")}{" "}
                            </label>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <input
                              className="mx-2 selectValueCheckbox"
                              type="checkbox"
                              value={"Hazard-ID"}
                              onChange={(e) =>
                                this.checkboxChange(
                                  e,
                                  "Hazard-ID"
                                )
                              }
                            />
                            <label className="mb-0">
                              {"Hazard-ID".replaceAll(
                                "-",
                                " "
                              )}{" "}
                            </label>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <input
                              className="mx-2 selectValueCheckbox"
                              type="checkbox"
                              value={"Malfunction"}
                              onChange={(e) =>
                                this.checkboxChange(
                                  e,
                                  "Malfunction"
                                )
                              }
                            />
                            <label className="mb-0">
                              {"Malfunction".replaceAll(
                                "-",
                                " "
                              )}{" "}
                            </label>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <input
                              className="mx-2 selectValueCheckbox"
                              type="checkbox"
                              value={"Behaviour"}
                              onChange={(e) =>
                                this.this.checkboxChange(
                                  e,
                                  "Behaviour"
                                )
                              }
                            />
                            <label className="mb-0">
                              {"Behaviour".replaceAll("-", " ")}{" "}
                            </label>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <input
                              className="mx-2 selectValueCheckbox"
                              type="checkbox"
                              value={"Output-Failure"}
                              onChange={(e) =>
                                this.checkboxChange(
                                  e,
                                  "Output-Failure"
                                )
                              }
                            />
                            <label className="mb-0">
                              {"Output-Failure".replaceAll(
                                "-",
                                " "
                              )}{" "}
                            </label>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <input
                              className="mx-2 selectValueCheckbox"
                              type="checkbox"
                              value={"Type"}
                              onChange={(e) =>
                                this.checkboxChange(e, "Type")
                              }
                            />
                            <label className="mb-0">
                              {"Type".replaceAll("-", " ")}{" "}
                            </label>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <input
                              className="mx-2 selectValueCheckbox"
                              type="checkbox"
                              value={"Hazardous-Event-ID"}
                              onChange={(e) =>
                                this.checkboxChange(
                                  e,
                                  "Hazardous-Event-ID"
                                )
                              }
                            />
                            <label className="mb-0">
                              {"Hazardous-Event-ID".replaceAll(
                                "-",
                                " "
                              )}{" "}
                            </label>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <input
                              className="mx-2 selectValueCheckbox"
                              type="checkbox"
                              value={"Operational"}
                              onChange={(e) =>
                                this.checkboxChange(e, "Operational")
                              }
                            />
                            <label className="mb-0">
                              {"Operational".replaceAll("-", " ")}{" "}
                            </label>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <input
                              className="mx-2 selectValueCheckbox"
                              type="checkbox"
                              value={"Situation"}
                              onChange={(e) =>
                                this.checkboxChange(e, "Situation")
                              }
                            />
                            <label className="mb-0">
                              {"Situation".replaceAll("-", " ")}{" "}
                            </label>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <input
                              className="mx-2 selectValueCheckbox"
                              type="checkbox"
                              value={"Hazardous-Event-and-Accident"}
                              onChange={(e) =>
                                this.checkboxChange(e, "Hazardous-Event-and-Accident")
                              }
                            />
                            <label className="mb-0">
                              {"Hazardous-Event-and-Accident".replaceAll(
                                "-",
                                " "
                              )}{" "}
                            </label>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <input
                              className="mx-2 selectValueCheckbox"
                              type="checkbox"
                              value={"Exposure-Type"}
                              onChange={(e) =>
                                this.checkboxChange(e, "Exposure-Type")
                              }
                            />
                            <label className="mb-0">
                              {"Exposure-Type".replaceAll("-", " ")}{" "}
                            </label>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <input
                              className="mx-2 selectValueCheckbox"
                              type="checkbox"
                              value={"Frequency"}
                              onChange={(e) =>
                                this.checkboxChange(e, "Frequency")
                              }
                            />
                            <label className="mb-0">
                              {"Frequency".replaceAll("-", " ")}{" "}
                            </label>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <input
                              className="mx-2 selectValueCheckbox"
                              type="checkbox"
                              value={"S-Class-Rating"}
                              onChange={(e) =>
                                this.checkboxChange(e, "S-Class-Rating")
                              }
                            />
                            <label className="mb-0">
                              {"S-Class-Rating".replaceAll("-", " ")}{" "}
                            </label>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <input
                              className="mx-2 selectValueCheckbox"
                              type="checkbox"
                              value={"E-Class-Rating"}
                              onChange={(e) =>
                                this.checkboxChange(e, "E-Class-Rating")
                              }
                            />
                            <label className="mb-0">
                              {"E-Class-Rating".replaceAll("-", " ")}{" "}
                            </label>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <input
                              className="mx-2 selectValueCheckbox"
                              type="checkbox"
                              value={"C-Class-Rating"}
                              onChange={(e) =>
                                this.checkboxChange(e, "C-Class-Rating")
                              }
                            />
                            <label className="mb-0">
                              {"C-Class-Rating".replaceAll("-", " ")}{" "}
                            </label>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <input
                              className="mx-2 selectValueCheckbox"
                              type="checkbox"
                              value={"ASIL-Rating-Value"}
                              onChange={(e) =>
                                this.checkboxChange(e, "ASIL-Rating-Value")
                              }
                            />
                            <label className="mb-0">
                              {"ASIL-Rating-Value".replaceAll("-", " ")}{" "}
                            </label>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <input
                              className="mx-2 selectValueCheckbox"
                              type="checkbox"
                              value={"Safety-Goals"}
                              onChange={(e) =>
                                this.checkboxChange(
                                  e,
                                  "Safety-Goals"
                                )
                              }
                            />
                            <label className="mb-0">
                              {"Safety-Goals".replaceAll(
                                "-",
                                " "
                              )}{" "}
                            </label>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <input
                              className="mx-2 selectValueCheckbox"
                              type="checkbox"
                              value={"Safety-Goal-ID"}
                              onChange={(e) =>
                                this.checkboxChange(e, "Safety-Goal-ID")
                              }
                            />
                            <label className="mb-0">
                              {"Safety-Goal-ID".replaceAll("-", " ")}{" "}
                            </label>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <input
                              className="mx-2 selectValueCheckbox"
                              type="checkbox"
                              value={"Associated-Hazard-IDs"}
                              onChange={(e) =>
                                this.checkboxChange(e, "Associated-Hazard-IDs")
                              }
                            />
                            <label className="mb-0">
                              {"Associated-Hazard-IDs".replaceAll("-", " ")}{" "}
                            </label>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <input
                              className="mx-2 selectValueCheckbox"
                              type="checkbox"
                              value={"Technical-Safety-Requirement"}
                              onChange={(e) =>
                                this.checkboxChange(e, "Technical-Safety-Requirement")
                              }
                            />
                            <label className="mb-0">
                              {"Technical-Safety-Requirement".replaceAll("-", " ")}{" "}
                            </label>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <input
                              className="mx-2 selectValueCheckbox"
                              type="checkbox"
                              value={"TSR-Linked"}
                              onChange={(e) =>
                                this.checkboxChange(e, "TSR-Linked")
                              }
                            />
                            <label className="mb-0">
                              {"Is-this-TSR-linked-to-Hardware-OR-Software".replaceAll("-", " ")}{" "}
                            </label>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <input
                              className="mx-2 selectValueCheckbox"
                              type="checkbox"
                              value={"Hardware-Safety-Requirement"}
                              onChange={(e) =>
                                this.checkboxChange(e, "Hardware-Safety-Requirement")
                              }
                            />
                            <label className="mb-0">
                              {"Hardware-Safety-Requirement".replaceAll("-", " ")}{" "}
                            </label>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <input
                              className="mx-2 selectValueCheckbox"
                              type="checkbox"
                              value={"Software-Safety-Requirement"}
                              onChange={(e) =>
                                this.checkboxChange(e, "Software-Safety-Requirement")
                              }
                            />
                            <label className="mb-0">
                              {"Software-Safety-Requirement".replaceAll("-", " ")}{" "}
                            </label>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                }

                <div className="row">
                  <div className="col-6"></div>
                </div>
              </div>
              <div className="modal-footer">
                {(!this.state["selectedInputData"] || this.state["selectedInputData"].length <= 0) && (
                  <h5 className="text-danger">
                    User has to select atleast 1 to download a report
                  </h5>
                )}
                {this.state["selectedInputData"] && this.state["selectedInputData"].length > 0 && (
                  <>
                  {
                    !this.state["isReportLoading"] ? (
                    <div className="dropdown">
                      <button
                        className="btn btn-secondary dropdown-toggle"
                        type="button"
                        id="dropdownMenuButton"
                        data-toggle="dropdown"
                        aria-haspopup="true"
                        aria-expanded="false"
                      >
                        Download <i className="fa fa-download ml-2"></i>
                      </button>
                      <div
                        className="dropdown-menu"
                        aria-labelledby="dropdownMenuButton"
                      >
                        <a
                          href="#!"
                          className="dropdown-item"
                          onClick={(ev) => this.conceptPhaseReport(ev)}
                        >
                          Download As PDF
                        </a>

                        <a
                          href="#!"
                          className="dropdown-item"
                          onClick={(ev) => this.conceptPhaseReport(ev, "JSON")}
                        >
                          Download As JSON
                        </a>
                      </div>
                    </div> ) : 
                    ( <div className="spinner-border text-primary" role="status">

                        <span className="sr-only">Loading...</span>
                      </div>)
                    }
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* PDF Viewer Modal  */}
        <div className="modal fade" id="pdfViewer" tabIndex="-1" data-keyboard="false" data-backdrop="static">
          <div className="modal-dialog modal-full-width">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">View Functional Safety Report</h5>
                <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>

              <div className="modal-body">
                <iframe src="" title="pdfViewer" id="pdfViewerIframe" style={{width: 1000,height: 700,}}> </iframe>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default withRouter(FunctionalSafetyProgram);