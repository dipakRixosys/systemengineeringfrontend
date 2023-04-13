import React, { useEffect, useState, useCallback } from "react";
import { Link, useHistory } from "react-router-dom";
import DashboardLayout from "screens/Layouts/DashboardLayout";
import PlaceholderLoader from "components/ui/placeholder-loader/placeholder-loader";
import { setTitle, swalPopup, programLifecycleRoute, modal, swalConfirmationPopup, triggerSwalLoader, isInDemoMode } from "helpers/common";
import { httpGet, apify, httpPost, apiBaseUrl } from "helpers/network";
import ProgramSwitchApp from "components/program/ProgramSwitchApp";
const Swal = window.Swal;

// Program
function Program(props) {
  // Page Title
  setTitle("Program");

  // History context
  const history = useHistory();

  // Data
  // Program UUID
  const { programUuid } = props.match.params;
  // Program
  const [program, setProgram] = useState();
  // Program
  const [selectedInput, setselectedInput] = useState();
  // View Program system conf. table
  const [viewSystemConf, setViewSystemConf] = useState(false);

  // Based on viewSystemConf show/hide modal
  useEffect(() => {
    if (viewSystemConf) {
      modal("#ModalProgramSysConf");
    }
  }, [viewSystemConf]);

  // Fetch program
  useEffect(() => {
    // let mounted = true;

    // Fetch from server
    httpGet(apify(`app/program?programUuid=${programUuid}`)).then((res) => {
      if (res["success"]) {
        setProgram(res["program"]);
        setTitle(`${res["program"]["name"]} | Program`);
      }
    });

    // return () => mounted = false;
  }, [programUuid]);

  // Remove Program
  const removeProgram = useCallback(() => {
    //
    Swal.fire({
      html: `
        Do you want to remove this program? <br />
        <small>(Action cannot be undone)</smll>
      `,
      confirmButtonText: "Yes",
      showCloseButton: true,
    }).then(async (result) => {
      //
      if (result.isConfirmed) {
        let params = {
          programUuid: programUuid,
        };

        // Delete on server
        httpPost(apify("app/programs/delete"), params)
          .then((data) => {
            swalPopup("Program removed from system.", "success");
            history.push("/dashboard/programs");
          })
          .catch(() => {
            swalPopup("Something went wrong.");
          });
      }
    });
  }, [history, programUuid]);

  // Remove Program
  const moveProgramNextPhase = useCallback(() => {
    //
    Swal.fire({
      html: `
        Do you want to move this program to next phase? <br />
        <small>(Action cannot be undone)</smll>
      `,
      confirmButtonText: "Yes",
      showCloseButton: true,
    }).then(async (result) => {
      //
      if (result.isConfirmed) {
        let params = {
          programUuid: programUuid,
        };

        // move to next phase on server
        httpPost(apify("app/programs/move-to-next-phase"), params)
          .then((data) => {
            if (data["success"]) {
              swalPopup("Program moved.", "success");
              history.push(programLifecycleRoute("View", data["programUuid"]));
            }
          })
          .catch(() => {
            swalPopup("Something went wrong.");
          });
      }
    });
  }, [history, programUuid]);

  // Show system config. modal
  const showSystemConf = (ev) => {
    ev.preventDefault();
    setViewSystemConf(true);
  };

  // Download concept phase report
  const conceptPhaseReport = (ev, type = "PDF") => {
    ev.preventDefault();

    let params = {
      programUuid: programUuid,
      selectedInput: selectedInput ? selectedInput : [],
    };

    // Get report
    httpPost(
      apify(`app/programs/concept-phase-report?programUuid=${programUuid}`),
      params
    )
      .then((data) => {
        // window.location.href = apiBaseUrl(data.path);
        if (type === "PDF") {
          var link = document.getElementById("download");
          link.href = apiBaseUrl(data.path);
          link.setAttribute("target", "_blank");
          link.click();
        } else if (type === "JSON") {
          var dataStr =
            "data:text/json;charset=utf-8," +
            encodeURIComponent(JSON.stringify(data.jsonData));
          var downloadAnchorNode = document.createElement("a");
          downloadAnchorNode.setAttribute("href", dataStr);
          downloadAnchorNode.setAttribute("download", "report.json");
          document.body.appendChild(downloadAnchorNode); // required for firefox
          downloadAnchorNode.click();
          downloadAnchorNode.remove();
        }
      })
      .catch(() => {
        swalPopup("Something went wrong while downloading report.");
      });
  };

  const changeModalStatus = (ev, data) => {
    modal("#Modal-Report", {
      show: true,
    });
  };
  
  const checkboxChange = (ev, data) => {
    let selectedInputData = selectedInput ? selectedInput : [];
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

    setselectedInput(selectedInputData);
  };

  const statusBadgeClass = (status) => {
    let className = "badge-primary";
    
    switch (String(status).toUpperCase()) {
      
      case 'REJECTED':
        className = "badge-danger";
        break;

      case 'IN-PROCESS':
        className = "badge-info";
        break;

      case 'APPROVED':
        className = "badge-success";
        break;

      case 'UNDER-REVIEW':
        className = "badge-warning";
        break;
    
      default:
        break;
    }
    
    return className;
  }

  const syncProjectToJira = () => {
    swalConfirmationPopup({
      title: "Sync to JIRA",
      text: "This action will sync currect program metadata as a JIRA project. Any previous data would be overriden.",
      confirmButtonText: "Confirm",
    }, () => {
      triggerSwalLoader();

      let params = {
        'programUuid': programUuid,
      };

      httpPost(apify('app/integrations/jira/sync-program'), params).then(res => {
        if (res['success']) {
          swalPopup("Sync completed.", 'success');
        }
      });

    });
  }

  // UI
  return (
    <div>
      <DashboardLayout allowDemoMode={true}>
        <div className="container-fluid">
          <div className="row">
            <div className="col-12 col-lg-12">
              {program && (
                <div className="card">
                  <div className="card-header text-white">
                    <div className="row">
                      <div className="col-8">
                        {props.title ? <h4 >{props.title}</h4> : null }
                        <small className="text-muted text-uppercase">Program</small> <br />
                        <Link to={programLifecycleRoute('View', program['uuid'])}>
                          { program["name"]}
                        </Link>
                      </div>
                      <div className="col-4 text-right mt-3">
                        <h4 className={`badge badge-v2 px-4 py-2 ${statusBadgeClass(program["status"])}`}>
                          {program["status"] === "REJECTED"
                            ? "Rejected and Re-Opened "
                            : program["status"].replace("-", " ")}
                        </h4>
                      </div>
                    </div>
                  </div>

                  <div className="card-body">
                    <h6 className="text-muted text-uppercase">Property</h6>
                    <table className="table table-bordered">
                      <thead>
                        <tr>
                          <th className="text-left">Group</th>
                          <th className="text-left">OEM</th>
                          <th className="text-left">Vehicle</th>
                          <th className="text-left">Model year</th>
                          <th className="text-left">System</th>
                          <th className="text-left">Phase</th>
                          {program["is_system_configured"] && (
                            <th className="text-left">System Configuration</th>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>{program["vehicle_program"]["group"]["name"]}</td>
                          <td>{program["vehicle_program"]["oem"]["name"]}</td>
                          <td>{program["vehicle_program"]["program"]}</td>
                          <td>{program["vehicle_program"]["year"]}</td>
                          <td>{program["system"]["name"]}</td>
                          <td>{program["phase"]}</td>
                          {program["is_system_configured"] && (
                            <td>
                              <a href="#!" onClick={(ev) => showSystemConf(ev)}>
                                View
                              </a>

                              {program["status"] !== "APPROVED" &&
                                program["status"] !== "UNDER-REVIEW" &&
                                program["phase"] === "Concept" && (
                                  <Link
                                    key="Link-System-Config"
                                    to={`/dashboard/system-configuration/${program["uuid"]}`}
                                    className="ml-3"
                                  >
                                    Update Configuration
                                  </Link>
                                )}
                            </td>
                          )}
                        </tr>
                      </tbody>
                    </table>

                    {!program["is_system_configured"] && (
                      <div>
                        <Link
                          key="Link-System-Config"
                          to={`/dashboard/system-configuration/${program["uuid"]}`}
                          className="btn btn-primary text-white"
                        >
                          System Configuration
                        </Link>
                      </div>
                    )}

                    <div className="row">
                      <div className="col-4">
                        {program["is_system_configured"] && (
                          <div>
                            <h6 className="text-muted text-uppercase">
                              {program["phase"]} Phase
                            </h6>
                            <ul className="list-unstyled">

                              {program["lifecycle"].map((lifecycle) => {
                                return (
                                  <React.Fragment key={lifecycle["uuid"]}>
                                    {Boolean(lifecycle["is_ui_visible"]) && (
                                      <li key={lifecycle["uuid"]} className="list-item">
                                        {
                                          Boolean(lifecycle["is_configurable"]) &&
                                          <Link key={lifecycle["lifecycle_key"]} to={programLifecycleRoute(lifecycle["lifecycle_key"], program["uuid"])}>
                                            {lifecycle["name"]}
                                          </Link>
                                        }

                                        { 
                                          !Boolean(lifecycle["is_configurable"]) &&
                                          <a key={lifecycle["lifecycle_key"]} href="#!" className="link-disabled">
                                            {lifecycle["name"]}
                                            <span className="ml-2 badge badge-warning text-uppercase">
                                              Can't process
                                            </span>
                                          </a>
                                        }
                                      </li>
                                    )}
                                  </React.Fragment>
                                );
                              })}

                             {
                              false && (
                                program["phase"] === "Concept" && (
                                <li>
                                  <Link
                                    to={programLifecycleRoute(
                                      "Attack-Tree-Simulation",
                                      program["uuid"]
                                    )}
                                  >
                                    Attack Tree Simulation
                                  </Link>
                                </li>
                              )
                              )
                             }
                            </ul>

                            {program["phase"] === "Concept" && (
                              <button
                                className="btn btn-primary btn-sm px-3"
                                onClick={changeModalStatus}
                                disabled={
                                  program["status"] !== "APPROVED" &&
                                  program["status"] !== "UNDER-REVIEW"
                                }
                              >
                                <i className="fa fa-download mr-2"></i>
                                Download <b>Concept Phase Report</b>
                              </button>
                            )}

                            <a href="#!" download id="download">
                              {" "}
                            </a>
                          </div>
                        )}
                      </div>

                      <div className="col-4">
                        {program["is_system_configured"] &&
                          program["is_vulnerability_assessment_allowed"] && (
                            <div>
                              <h6 className="text-muted text-uppercase">
                                Vulnerability Assessment
                              </h6>
                              <ul className="list-unstyled">
                                <li
                                  key="vulnerability-monitoring-and-triage"
                                  className="list-item"
                                >
                                  <Link
                                    to={`/dashboard/cybersecurity/vulnerability-monitoring-and-triage/${program["uuid"]}`}
                                  >
                                    Vulnerability Monitoring and Triage
                                  </Link>
                                </li>
                                <li
                                  key="cybersecurity-event-evaluation"
                                  className="list-item"
                                >
                                  <Link
                                    to={`/dashboard/cybersecurity/cybersecurity-event-evaluation/${program["uuid"]}`}
                                  >
                                    Cybersecurity Event Evaluation
                                  </Link>
                                </li>
                                <li
                                  key="vulnerability-analysis"
                                  className="list-item"
                                >
                                  <Link
                                    to={`/dashboard/cybersecurity/vulnerability-analysis/${program["uuid"]}`}
                                  >
                                    Cybersecurity Vulnerability Analysis
                                  </Link>
                                </li>
                                <li
                                  key="vulnerability-management"
                                  className="list-item"
                                >
                                  <Link
                                    to={`/dashboard/cybersecurity/vulnerability-management/${program["uuid"]}`}
                                  >
                                    Vulnerability Management
                                  </Link>
                                </li>
                              </ul>
                            </div>
                          )}
                      </div>

                      <div className="col-4">
                        {program["rejected_remark"] &&
                          program["status"] === "REJECTED" && (
                            <div>
                              <div className="border text-center  my-3">
                                <p className="my-3">
                                  {program["rejected_remark"]}
                                </p>
                              </div>

                              <h6 className="text-muted text-uppercase">
                                Links
                              </h6>
                              <ul className="list-unstyled">
                                <li
                                  key="sbom-management-link"
                                  className="list-item"
                                >
                                  <Link
                                    to={programLifecycleRoute(
                                      "SBoM-Management",
                                      program["uuid"]
                                    )}
                                    title="S-BoM Management"
                                  >
                                    S-BoM
                                  </Link>
                                </li>
                                <li key="digital-link" className="list-item">
                                  <Link
                                    to={programLifecycleRoute(
                                      "Digital-Twin",
                                      program["uuid"]
                                    )}
                                    title="Digital Twin"
                                  >
                                    Digital Twin
                                  </Link>
                                </li>
                              </ul>
                            </div>
                          )}
                      </div>
                    </div>

                    {false && (
                      <div className="mt-3">
                        <Link
                          to={programLifecycleRoute(
                            "Generate-Attack-Tree",
                            program["uuid"]
                          )}
                        >
                          Show Attack Tree
                        </Link>
                      </div>
                    )}
                  </div>

                  <div className="card-footer">
                    <div className="row">
                      <div className="col-6">
                        {
                          program['is_next_phase_allowed'] && program['phase'] !== 'Decomissioning' &&
                          <button className="btn btn-info" onClick={moveProgramNextPhase}>
                            Move Program to Next Phase
                          </button>
                        }
                        
                        {
                          !isInDemoMode() && 
                          <React.Fragment>
                            <div className="d-inline ml-2">
                              <ProgramSwitchApp program={program} currentApp="Criskle-Lifecycle-App" />
                            </div>

                            <div className="d-inline ml-2">
                              <button className="btn btn-primary" onClick={ev => syncProjectToJira(ev)}>
                                Sync to <b>JIRA</b>
                              </button>
                            </div>
                          </React.Fragment>
                        }

                      </div>
                      <div className="col-6 text-right">
                        <button
                          className="btn btn-danger"
                          onClick={removeProgram}
                        >
                          Remove Program
                        </button>
                      </div>
                      <div className="col-6"></div>
                    </div>
                  </div>
                </div>
              )}

              {!program && (
                <div className="card">
                  <div className="card-header">
                    <h4>Program is loading...</h4>
                  </div>
                  <div className="card-body">
                    <PlaceholderLoader />
                  </div>
                  <div className="card-footer">
                    <div className="row">
                      <div className="col-12">
                        <Link
                          to="/dashboard/programs"
                          className="btn btn-primary text-white"
                        >
                          <i className="fa fa-arrow-left mr-2"></i>
                          Back to Programs
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {program && program["is_system_configured"] && viewSystemConf && (
                <div>
                  <div
                    className="modal fade"
                    id="ModalProgramSysConf"
                    tabIndex="-1"
                    data-keyboard="false"
                    data-backdrop="static"
                  >
                    <div className="modal-dialog modal-lg">
                      <div className="modal-content">
                        <div className="modal-header">
                          <h4 className="modal-title text-primary">
                            View <b>System Configuration</b>
                          </h4>
                          <button
                            type="button"
                            className="close"
                            data-dismiss="modal"
                            onClick={(ev) => setViewSystemConf(false)}
                          >
                            <span>&times;</span>
                          </button>
                        </div>
                        <div className="modal-body">
                          <table className="table table-bordered">
                            <thead>
                              <tr>
                                <th>Function</th>
                                <th>Component</th>
                              </tr>
                            </thead>
                            <tbody>
                              {Object.keys(program["system_configuration"]).map((row) => {
                                  return (
                                    <tr key={program["system_configuration"][row]["uuid"]}>
                                      <td>
                                        {program["system_configuration"][row]["name"]}
                                      </td>
                                      <td>
                                        {program["system_configuration"][row]["components"].map((component) => {
                                          return (
                                            <span key={component["component_uuid"]} className="badge badge-primary p-2 mr-2">
                                              {component["component_name"]}
                                            </span>
                                          );
                                        })}
                                      </td>
                                    </tr>
                                  );
                                }
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

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
                        Concept Phase
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
                          <h5>Assets</h5>
                          <table className="table">
                            <tbody>
                              <tr>
                                <td>
                                  <input
                                    className="mx-2 selectValueCheckbox"
                                    type="checkbox"
                                    value={"All"}
                                    onChange={(e) => checkboxChange(e, "All")}
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
                                    value={"Name"}
                                    onChange={(e) => checkboxChange(e, "Name")}
                                  />
                                  <label className="mb-0">
                                    {"Name".replaceAll("-", " ")}{" "}
                                  </label>
                                </td>
                              </tr>
                              <tr>
                                <td>
                                  <input
                                    className="mx-2 selectValueCheckbox"
                                    type="checkbox"
                                    value={"Security-Objective"}
                                    onChange={(e) =>
                                      checkboxChange(e, "Security-Objective")
                                    }
                                  />
                                  <label className="mb-0">
                                    {"Security-Objective".replaceAll("-", " ")}{" "}
                                  </label>
                                </td>
                              </tr>
                            </tbody>
                          </table>

                          <h5>Threat and Risk Assessment on confirmed Asset</h5>
                          <table className="table">
                            <tbody>
                              <tr>
                                <td>
                                  <input
                                    className="mx-2 selectValueCheckbox"
                                    type="checkbox"
                                    value={"Name"}
                                    onChange={(e) => checkboxChange(e, "Name")}
                                  />
                                  <label className="mb-0">
                                    {"Name".replaceAll("-", " ")}{" "}
                                  </label>
                                </td>
                              </tr>
                              <tr>
                                <td>
                                  <input
                                    className="mx-2 selectValueCheckbox"
                                    type="checkbox"
                                    value={"Cyber-Security-Properties"}
                                    onChange={(e) =>
                                      checkboxChange(
                                        e,
                                        "Cyber-Security-Properties"
                                      )
                                    }
                                  />
                                  <label className="mb-0">
                                    {"Cyber-Security-Properties".replaceAll(
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
                                    value={"Cyber-Security-Functional-Safety"}
                                    onChange={(e) =>
                                      checkboxChange(
                                        e,
                                        "Cyber-Security-Functional-Safety"
                                      )
                                    }
                                  />
                                  <label className="mb-0">
                                    {"Is this Asset Safety Related".replaceAll(
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
                                    value={"Security-Objective"}
                                    onChange={(e) =>
                                      this.checkboxChange(
                                        e,
                                        "Security-Objective"
                                      )
                                    }
                                  />
                                  <label className="mb-0">
                                    {"Security-Objective".replaceAll("-", " ")}{" "}
                                  </label>
                                </td>
                              </tr>
                              <tr>
                                <td>
                                  <input
                                    className="mx-2 selectValueCheckbox"
                                    type="checkbox"
                                    value={"Cyber-Security-Functional-Security"}
                                    onChange={(e) =>
                                      checkboxChange(
                                        e,
                                        "Cyber-Security-Functional-Security"
                                      )
                                    }
                                  />
                                  <label className="mb-0">
                                    {"Is this a Security only Asset".replaceAll(
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
                                    value={"Damage-Scenario"}
                                    onChange={(e) =>
                                      checkboxChange(e, "Damage-Scenario")
                                    }
                                  />
                                  <label className="mb-0">
                                    {"Damage-Scenario".replaceAll("-", " ")}{" "}
                                  </label>
                                </td>
                              </tr>
                              <tr>
                                <td>
                                  <input
                                    className="mx-2 selectValueCheckbox"
                                    type="checkbox"
                                    value={"Damage-Scenario-Comments"}
                                    onChange={(e) =>
                                      checkboxChange(
                                        e,
                                        "Damage-Scenario-Comments"
                                      )
                                    }
                                  />
                                  <label className="mb-0">
                                    {"Damage-Scenario-Comments".replaceAll(
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
                                    value={"Type-WP24-Annex-5"}
                                    onChange={(e) =>
                                      checkboxChange(e, "Type-WP24-Annex-5")
                                    }
                                  />
                                  <label className="mb-0">
                                    {"Type-WP24-Annex-5".replaceAll("-", " ").replaceAll("24", "29")}{" "}
                                  </label>
                                </td>
                              </tr>
                              <tr>
                                <td>
                                  <input
                                    className="mx-2 selectValueCheckbox"
                                    type="checkbox"
                                    value={"Threat-Type"}
                                    onChange={(e) =>
                                      checkboxChange(e, "Threat-Type")
                                    }
                                  />
                                  <label className="mb-0">
                                    {"Threat-Type".replaceAll("-", " ")}{" "}
                                  </label>
                                </td>
                              </tr>
                              <tr>
                                <td>
                                  <input
                                    className="mx-2 selectValueCheckbox"
                                    type="checkbox"
                                    value={"Threat-Sub-Scenario"}
                                    onChange={(e) =>
                                      checkboxChange(e, "Threat-Sub-Scenario")
                                    }
                                  />
                                  <label className="mb-0">
                                    {"Threat Scenario Definition".replaceAll(
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
                                    value={"Attack-Steps"}
                                    onChange={(e) =>
                                      checkboxChange(e, "Attack-Steps")
                                    }
                                  />
                                  <label className="mb-0">
                                    {"Attack-Steps".replaceAll("-", " ")}{" "}
                                  </label>
                                </td>
                              </tr>
                              <tr>
                                <td>
                                  <input
                                    className="mx-2 selectValueCheckbox"
                                    type="checkbox"
                                    value={"Impact-Rating-Value"}
                                    onChange={(e) =>
                                      checkboxChange(e, "Impact-Rating-Value")
                                    }
                                  />
                                  <label className="mb-0">
                                    {"Impact-Rating".replaceAll("-", " ")}{" "}
                                  </label>
                                </td>
                              </tr>
                              <tr>
                                <td>
                                  <input
                                    className="mx-2 selectValueCheckbox"
                                    type="checkbox"
                                    value={"Attack-Risk-Value"}
                                    onChange={(e) =>
                                      checkboxChange(e, "Attack-Risk-Value")
                                    }
                                  />
                                  <label className="mb-0">
                                    {"Attack-Risk-Value".replaceAll("-", " ")}{" "}
                                  </label>
                                </td>
                              </tr>
                              <tr>
                                <td>
                                  <input
                                    className="mx-2 selectValueCheckbox"
                                    type="checkbox"
                                    value={"Attack-CAL"}
                                    onChange={(e) =>
                                      checkboxChange(e, "Attack-CAL")
                                    }
                                  />
                                  <label className="mb-0">
                                    {"Final-CAL".replaceAll("-", " ")}{" "}
                                  </label>
                                </td>
                              </tr>
                              <tr>
                                <td>
                                  <input
                                    className="mx-2 selectValueCheckbox"
                                    type="checkbox"
                                    value={"Acceptance-Criteria"}
                                    onChange={(e) =>
                                      checkboxChange(e, "Acceptance-Criteria")
                                    }
                                  />
                                  <label className="mb-0">
                                    {"Acceptance-Criteria".replaceAll("-", " ")}{" "}
                                  </label>
                                </td>
                              </tr>
                              <tr>
                                <td>
                                  <input
                                    className="mx-2 selectValueCheckbox"
                                    type="checkbox"
                                    value={"Cyber-Security-Goal"}
                                    onChange={(e) =>
                                      checkboxChange(e, "Cyber-Security-Goal")
                                    }
                                  />
                                  <label className="mb-0">
                                    {"Cyber-Security-Goal".replaceAll("-", " ")}{" "}
                                  </label>
                                </td>
                              </tr>
                              <tr>
                                <td>
                                  <input
                                    className="mx-2 selectValueCheckbox"
                                    type="checkbox"
                                    value={"Cyber-Security-Requirements"}
                                    onChange={(e) =>
                                      checkboxChange(
                                        e,
                                        "Cyber-Security-Requirements"
                                      )
                                    }
                                  />
                                  <label className="mb-0">
                                    {"Cyber-Security-Requirements".replaceAll(
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
                                    value={"Security-Controls"}
                                    onChange={(e) =>
                                      checkboxChange(e, "Security-Controls")
                                    }
                                  />
                                  <label className="mb-0">
                                    {"Security-Controls".replaceAll("-", " ")}{" "}
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
                      {(!selectedInput || selectedInput.length <= 0) && (
                        <h5 className="text-danger">
                          User has to select atleast 1 to download a report
                        </h5>
                      )}
                      {selectedInput && selectedInput.length > 0 && (
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
                              onClick={(ev) => conceptPhaseReport(ev)}
                            >
                              Download As PDF
                            </a>

                            <a
                              href="#!"
                              className="dropdown-item"
                              onClick={(ev) => conceptPhaseReport(ev, "JSON")}
                            >
                              Download As JSON
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </div>
  );
}

export default Program;