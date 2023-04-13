import React from "react";
import { Link, withRouter } from "react-router-dom";
import DataTable from "react-data-table-component";
import { modal, nullIfEmpty, programLifecycleRoute, setTitle, swalConfirmationPopup, swalPopup, triggerSwalLoader } from "helpers/common";
import { apify, httpGet, httpPost } from "helpers/network";
import DashboardLayout from "screens/Layouts/DashboardLayout";
import ProgramLayout from "screens/Layouts/ProgramLayout";
import DatatableLoader from "components/ui/datatable-loader/datatable-loader";
import DatatableNoRows from "components/ui/datatable-no-rows/datatable-no-rows";
import FunctionalSafetyProgramHeader from "../slots/FunctionalSafetyProgramHeader";

const jQuery = window.jQuery;

// Safety Goals
class FunctionalSafetyGoals extends React.Component {
  constructor(props) {
    super(props);
    let { programUuid } = props.match.params;
    this.state = {
      loading: true,
      programUuid: programUuid,
    };
  }

  async componentDidMount() {
    setTitle("Functional Safety Goals");
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
    this.state = {
      program: props['program'],
      safetyGoalsColumns: [],
      safetyGoals: [],
      filterSafetyGoals: [],
      safetyGoalsLoading: true,
      safetyGoalsExportPDF: undefined,
      safetyGoalsExportJSON: undefined,
    };
  }

  handleDelete = (rowData) => {
    const safetyGoalUuid = rowData['Safety-Goal-Uuid'];
    const programUuid = rowData['programUuid'];

    const deleteSafetyGoal =  {
      "Safety-Goal-Uuid": safetyGoalUuid,
      "programUuid": programUuid,
    }

    swalConfirmationPopup({
      title: "Delete Safety Goal",
      icon : "warning",
      text: "This action will delete the safety goal and all its associated data. Are you sure you want to continue?",
      confirmButtonText: "Delete",
    }, () => {
      triggerSwalLoader();
      httpPost(apify('app/functional-safety/hazop/delete-safety-goals'), deleteSafetyGoal).then(data => {
        if (data['success']) { triggerSwalLoader('HIDE');
        swalPopup("Safety Goal Deleted!"); this.fetchSafetyGoals(); }
      });
    });
  }

  handleEdit = (rowData, modalID) => {
      modal(modalID);
      let safetyGoalId = rowData['Safety-Goal-Id'];
      let safetyGoalDescription = rowData['Safety-Goal-Description'];
      let propgramUuid = rowData['programUuid'];
      let safetyGoalUuid = rowData['Safety-Goal-Uuid'];
      this.setState({
        safetyGoalId: safetyGoalId,
        safetyGoalDescription: safetyGoalDescription,
        programUuid: propgramUuid,
        safetyGoalUuid: safetyGoalUuid,
      });
  }

  changeSafetyGoalDescription = (event, classKey) => {
    event.preventDefault();
    this.setState({
      safetyGoalDescription: event.target.value,
    });
  }
  
    
  handleModalSubmit = (ev, modalID) => {
    ev.preventDefault();
    let errorKeys = [];
    const safetyGoalUuid = this.state['safetyGoalUuid'];
    const programUuid = this.state['programUuid'];
    const description = this.state['safetyGoalDescription'];

    if (nullIfEmpty(this.state['safetyGoalDescription']) === null) {
      errorKeys.push("safetyGoalDescription");
    }

     // Errors
     jQuery(".text-error").addClass("d-none");
     errorKeys.forEach((key) => {
       jQuery(".text-error").each(function (idx, error) {
         if (jQuery(error).attr("data-validation-key") === key) {
           jQuery(error).removeClass("d-none");
         }
       });
     });

     // Validation Error
     let hasValidationError = errorKeys.length > 0;
     errorKeys = [];

     if(!hasValidationError){
      const updateSafetyGoal =  {
        "Safety-Goal-Uuid": safetyGoalUuid,
        "programUuid": programUuid,
        "Safety-Goal-Description": description,
      }
  
      httpPost(apify('app/functional-safety/hazop/update-safety-goals'), updateSafetyGoal).then(data => {
        if (data['success']) {
          triggerSwalLoader('HIDE');
          swalPopup({
            "title": "Updated!", 
            "html": "Safety Goal has been Updated."
          }, "success");
          this.fetchSafetyGoals();
        }
  
        jQuery(`${modalID} .close`).click();
        jQuery(".modal-backdrop").remove();
      });
     }
  }


  showHazardDetails = (rowData) => {
    modal("#hazardDetailView");
    this.setState({
      hazardDetails : rowData,
    });
  }

  fetchSafetyGoals = () => {
    let programUuid = this.state['program']['uuid'];
    let hideActionColumn = false;

    if(this.state["program"]["fs_status"] === "APPROVED" || this.state["program"]["fs_status"] === "UNDER-REVIEW"){
      hideActionColumn = true;
    }

    let safetyGoalsColumns = [
      {
        name: 'Safety Goal ID',
        selector: row => row['Safety-Goal-Id'],
        width: '150px',
        sortable: true,
      },
      {
        name: 'Safety Goal Description',
        selector: row => row['Safety-Goal-Description'],
      },
      {
        name: 'Associated Hazard IDs and their ASIL Ratings',
        selector: row => row['Associated-Hazard-Ids'],
        cell: (row) => {
          return (
            row['Associated-Hazards'].map(hazardObject => {
              return(
                <div className="border border-dark p-1 rounded m-1">
                  <span key={hazardObject["Hazard-Uuid"]} className="badge badge-v2 badge-light mr-1 btn" onClick={()=>this.showHazardDetails(hazardObject["Event"])}>{hazardObject["Hazard-ID"]}</span>
                  <span key={hazardObject["Hazard-ID"]}
                  style={{ backgroundColor: `${hazardObject["Event"]["ASIL-Rating-Bg-Color"]}`, color:`${hazardObject["Event"]["ASIL-Rating-Text-Color"]}`,}} className="badge p-2 ml-1">{hazardObject["Event"]["ASIL-Rating-Value"]}</span>
                </div>

              )
            })
          )
        }
      },
      {
        name: 'Actions',
        right: true,
        omit : hideActionColumn,
        cell: (row) => {
          return (
            <div className="btn-group"> 
              <button className="btn btn-primary btn-sm mr-2" onClick={()=> this.handleEdit(row, "#ModalEditSafetyGoal")}>
                <i className="fa fa-edit"></i> Edit 
              </button>
              <button className="btn btn-danger btn-sm ml-2" onClick={()=> this.handleDelete(row)}>
                <i className="fa fa-trash"></i> Remove
              </button>
            </div>
          )
        }
      },
    ];

    httpGet(apify(`app/functional-safety/hazop?programUuid=${programUuid}`)).then((res) => {
      if (res['success']) {
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

        let hazardMapping = [];
        let safetyGoals = res['safetyGoals']['goals'];

        safetyGoals.forEach(goalObject => {
          let possibleASILRatings = [];
          
          goalObject['Associated-Hazards'].forEach(hazardObject => {
            possibleASILRatings.push(hazardObject['Event']['ASIL-Rating-Value']);
          });
          
          hazardMapping.push({
            "Safety-Goal-Id": goalObject['Safety-Goal-Id'],
            "Possible-ASIL-Ratings": possibleASILRatings,
          });
        });

        this.setState({
          safetyGoals: safetyGoals,
          safetyGoalsExportPDF: res['safetyGoals']['goalsExportPDFPath'],
          safetyGoalsExportJSON: res['safetyGoals']['goalsExportJSONPath'],
          safetyGoalsColumns: safetyGoalsColumns,
          safetyGoalsLoading: false,
          events: events,
          hazardMapping: hazardMapping,
        }, () => {
          this.setFilterSafetyGoals();
        });
      }
    });
  }

  setFilterSafetyGoals = () => {
    let filterSafetyGoals = [];
    let query = jQuery('#GoalSearchQuery').val();
    
    if (query.length === 0) {
      filterSafetyGoals = this.state['safetyGoals'];
    }
    
    else {
      let hazardMapping = this.state['hazardMapping'];
      let hazardMappingQuery = [];

      query = String(query).toLowerCase();

      filterSafetyGoals = this.state['safetyGoals'].filter((goal) => {
        // ASIL=X
        let asilFilterQuery = query.split("asil=");
        if (asilFilterQuery[1] !== undefined) {
          
          let asilFilters = asilFilterQuery[1].split("|");
          asilFilters.forEach(f => {
            hazardMapping.forEach(m => {
              if (m['Possible-ASIL-Ratings'].includes(String(f).toUpperCase())) {
                hazardMappingQuery.push(m['Safety-Goal-Id']);
              }
            });
          });

          return hazardMappingQuery.includes(goal["Safety-Goal-Id"]);
        }

        // Sub-string
        return String(goal["Safety-Goal-Description"]).toLowerCase().includes(query);
      })
    }
    
    this.setState({
      filterSafetyGoals: filterSafetyGoals
    });
  }

  componentDidMount() {
    var vm = this;
    this.fetchSafetyGoals();

    jQuery("body").on("input", "#GoalSearchQuery", function() {
      vm.setFilterSafetyGoals();
    });
  }

  render() {
    return(
      <div>
        <div className="card-body p-0">
          <div className="form-group px-3 py-1">
            <input 
              id="GoalSearchQuery" 
              className="form-control" 
              placeholder="Search by goal ID, description, ASIL ratings (ASIL=A)..."
              autoFocus={true}
            />
          </div>

          <DataTable
            columns={this.state['safetyGoalsColumns']}
            data={this.state['filterSafetyGoals']}
            keyField="Safety-Goal-Uuid" 
            key="Safety-Goal-Uuid"
            progressPending={this.state['safetyGoalsLoading']}
            progressComponent={<DatatableLoader />}
            noDataComponent={<DatatableNoRows text="There are no goals in system." />}
            pagination
          />
        </div>
        
        <div className="card-footer">
          <div className="row">
            <div className="col-6 col-md-6 text-left">
                <Link to={programLifecycleRoute('Functional-Safety-Concept', this.state['program']['uuid'])} className="btn btn-success ml-2 text-white">
                  Next to <b>Functional Safety Concept</b>
                  <i className="fa fa-arrow-right ml-2"></i>
                </Link>
            </div>


            <div className="col-6 col-md-6 text-right">
              <Link to={programLifecycleRoute('Functional-Safety-FSG-Graph', this.state['program']['uuid'])} className="btn btn-dark px-3 text-white mr-2">
                <i className="fa fa-eye mr-2"></i>
                View as <b>Graph</b>
              </Link>

              <Link to={programLifecycleRoute('Functional-Safety-HARA', this.state['program']['uuid'])} className="btn btn-info px-3 text-white">
                <i className="fa fa-arrow-left mr-2"></i>
                Back to <b>HARA</b>
              </Link>
            </div>
          </div>

        </div>


        {/* Modal for update safety goal */}

        <div
          className="modal fade"
          id="ModalEditSafetyGoal"
          tabIndex="-1"
          data-keyboard="false"
          data-backdrop="static"
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h4 className="modal-title text-primary">
                  Update Safety Goal Description
                </h4>
                <button
                  type="button"
                  className="close"
                  data-dismiss="modal"
                >
                <span>&times;</span>
                  </button>
              </div>

              <div className="modal-body">
                <form>
                  <div className="row">
                    <div className="col-4 label">Goal ID</div>
                      <div className="col-6 label">
                        <input
                          type="text"
                          className="form-control md-form-control"
                          placeholder="System Generated"
                          defaultValue={this.state['safetyGoalId']}
                          readOnly={true}
                        />
                      </div>
                    </div>

                  <div className="row">
                     <div className="col-4 label">Description</div>
                        <div className="col-8">
                          <textarea
                            rows={5}
                            className="form-control md-form-control mt-3"
                            defaultValue={this.state['safetyGoalDescription']}
                            onChange={(ev) => this.changeSafetyGoalDescription(ev,"Safety-Goal-Description")}
                          />
                           <span className="text-danger text-error d-none" data-validation-key="safetyGoalDescription">
                            Please Enter Description
                            </span>
                        </div>
                      </div>
                    </form>
                  </div>

                  <div className="modal-footer">
                    <button className="btn btn-success btn-lg" onClick={(ev) => this.handleModalSubmit(ev, "#ModalEditSafetyGoal")}>Submit</button>
                  </div>
                </div>
              </div>
            </div>

             {/* View Hazard Details Modal */}
             <div
              className="modal fade"
              id="hazardDetailView"
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
                          <th className="text-left">Hazard ID</th>
                          <th className="text-left">Hazard Name</th>
                          <th className="text-left">ASIL Rating</th>
                          <th className="text-left">Hardware Safety Requirements</th>
                          <th className="text-left">Software Safety Requirements</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                           <td>{this.state["hazardDetails"] && this.state["hazardDetails"]["Hazard-ID"]}</td>
                           <td>{this.state["hazardDetails"] && this.state["hazardDetails"]["Hazard-Name"]}</td>
                           <td>{this.state["hazardDetails"] && this.state["hazardDetails"]["ASIL-Rating-Value"]}</td>
                           <td>{this.state["hazardDetails"] && this.state["hazardDetails"]["Hardware-Safety-Requirement"]}</td>
                           <td>{this.state["hazardDetails"] && this.state["hazardDetails"]["Software-Safety-Requirement"]}</td>
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

export default withRouter(FunctionalSafetyGoals);