import React from "react";
import { Link, withRouter } from "react-router-dom";
import Select from "react-select";
import { modal, programLifecycleRoute, setTitle, swalConfirmationPopup, triggerSwalLoader } from "helpers/common";
import {  nullIfEmpty } from "helpers/common";
import { apify, httpGet, httpPost } from "helpers/network";
import DashboardLayout from "screens/Layouts/DashboardLayout";
import ProgramLayout from "screens/Layouts/ProgramLayout";
import FunctionalSafetyProgramHeader from "../slots/FunctionalSafetyProgramHeader";
import PlaceholderLoader from "components/ui/placeholder-loader/placeholder-loader";
import ShowThreatsFromLifecycle from "components/slots/IntegrationData/Hara/ShowThreatsFromLifecycle";

// jQuery
const jQuery = window.jQuery;

// HARA Create Event
class FunctionalSafetyHARACreateEvent extends React.Component {
  constructor(props) {
    super(props);
    let { programUuid } = props.match.params;
    this.state = {
      loading: true,
      programUuid: programUuid,
      formEdit :false,
    };
  }

  async componentDidMount() {
    setTitle("Functional Safety HARA (Create Event)");

    // [EDIT] Must use params, rather than reading pathName
    const hazardEventId = window.location.pathname.split("/")[6];
    if(hazardEventId){
      this.setState({
        formEdit: true,
      })
    }
  }
  
  render() {
    return (
      <div>
        <DashboardLayout app="Criskle-Functional-Safety">
          <ProgramLayout
            programUuid={this.state["programUuid"]}
            header={
              <FunctionalSafetyProgramHeader title={`${this.state?.formEdit ? `Edit Event : Hazard and Risk Analysis (HARA)` : `Create Event : Hazard and Risk Analysis (HARA)`}` }/>
            }
            body={<FunctionalSafetyProgramBody  {...this.props}/>}
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
      hazards: [],
      safetyGoals: [],
      exposureTypeOptions: [],
      createNewEventOptions: [],
      createNewEventValue: [],
      safetyGoalsValue: [],
      listOfGoals : [],
      showListOfGoals : false,
      tsrLinkedValue: [],
      sClassRatingOptions : [],
      eClassRatingOptions : [],
      cClassRatingOptions : [],
      editableEvent : {},
      newEvent :[],
      editTsrLinked : [],
      editTsrLinkedValue : [],
      editExposureType : [],
      editSafetyGoals : [],
      modalFormObject: {
        "S-Class-Rating": {},
        "E-Class-Rating": {},
        "C-Class-Rating": {},
      },
      asilCurrentRating :"",
      asilBgColor:"",
      asilBgColors : [],
      asilRatings : [],
      operationalSituationObject: {},
      formObject: {
        "programUuid": props["program"]["uuid"],
        "Is-New-Event": false,
        "Hazard-Name": "",
        "Operational-Situation": {},
        "S-Class-Rating": {},
        "E-Class-Rating": {},
        "C-Class-Rating": {},
        "Safety-Goals" : [],
      },
    };
  }

  fetchDataPoints = () => {
    let createNewEventOptions = [
      { label: "Yes", value: "YES" },
      { label: "No", value: "NO" },
    ];
    let exposureTypeOptions = [
      { label: "Duration", value: "Duration" },
      { label: "Frequency", value: "Frequency" },
    ];

    let tsrlinked = [
      { label: "Hardware", value: "Hardware" },
      { label: "Software", value: "Software" },
    ];

    this.setState(
      {
        loading: false,
        exposureTypeOptions: exposureTypeOptions,
        tsrlinked: tsrlinked,
        createNewEventOptions: createNewEventOptions,
        createNewEventValue: createNewEventOptions[0],
      },
      () => {
        this.onChangeCreateNewEventOptions(createNewEventOptions[1]);
      }
    );
  };

  safetyGoalData = async () => {
    let programUuid = this.state["program"]["uuid"];
    let safetyGoals = [];

    httpGet(apify(`app/functional-safety/hazop?programUuid=${programUuid}`)).then((res) => {
     if (res["success"]) {
      let safetyGoalOptions = res["safetyGoals"]["goals"];
      let safetyGoalData = res["safetyGoals"]["goals"];
      safetyGoalOptions?.map(safetyGoalOption => safetyGoals.push({
      label : safetyGoalOption["Safety-Goal-Id"],
      value : safetyGoalOption["Safety-Goal-Id"],
      description : safetyGoalOption["Safety-Goal-Description"],
    }))
      this.setState({
      safetyGoals : safetyGoals,
      safetyGoalData : safetyGoalData,
      loading: false,
    },() => this.handleAssignGoals());
      }
    })
  }

  fetchData = async () => {
    let programUuid = this.state["program"]["uuid"];
    let hazardData = [];
    let sClassRatingOptions = [];
    let eClassRatingOptions = [];
    let cClassRatingOptions = [];
    let asilRatings = [];
    let asilBgColors = [];
    let asilTextColors = [];
    let editableEvent = {
        "Operational-Situation": {},
        "S-Class-Rating": {},
        "E-Class-Rating": {},
        "C-Class-Rating": {},
        "Safety-Goals" : [],
    };
    let editHazardId = [];
    let newEvent = [];
    let editTsrLinked = [];
    let editTsrLinkedValue = [];
    let editExposureType = [];
    let editSafetyGoals = [];
    let formEdit = false;

    const hazardEventId = window.location.pathname.split("/")[6];

    if(hazardEventId) {
      formEdit = true;
    }

    httpGet(
      apify(`app/functional-safety/hazop?programUuid=${programUuid}`)
      ).then((res) => {
        if (res["success"]) {
        let hazopFunctions = res["hazopObject"]["Hazop"]["Functions"];
        hazopFunctions?.map(hazards =>
          hazards["Hazards"]?.map(hazard => {
            hazardData.push({ 
              label: hazard["Hazard-ID"], 
              value: hazard["Hazard-ID"],
              name: hazard["Hazardous-Name"],
              uuid: hazard["Hazard-Uuid"],
            })
          })
        );

        hazopFunctions?.map(hazard => {
          hazard["Hazards"]?.forEach(event => {
            if(event["Event"]["Hazardous-Event-ID"] === hazardEventId)
            {
              editableEvent = event["Event"]
              editHazardId.push({
                "value": editableEvent["Hazard-ID"],
                "label": editableEvent["Hazard-ID"],
                "name": event["Hazardous-Name"],
                "uuid": event["Hazard-Uuid"],
              })

              if(editableEvent["Is-New-Event"]){
                newEvent = true;
              }

              if(editableEvent["TSR-Linked"]?.includes("Hardware")){
                editTsrLinked.push("Hardware")
                editTsrLinkedValue.push({
                  "value" : "Hardware",
                  "label" : "Hardware",
                })
              }

              if (editableEvent["TSR-Linked"]?.includes("Software")){
                editTsrLinked.push("Software")
                editTsrLinkedValue.push({
                  "value" : "Software",
                  "label" : "Software",
                })
              }

              if(editableEvent["Safety-Goals"]){
                editableEvent["Safety-Goals"]?.map(goal => {
                  editSafetyGoals.push({
                    "value" : goal,
                    "label" : goal,
                  })

                  return null
                })
              }
            }
          })

          return null
        })
 
        let sClassConfig = res["hazopConfig"]["S-Class-Options"]["Types"];
        sClassConfig?.map(config => sClassRatingOptions.push({
          label : config["Label"],
          value : config["Label"],
        }))

        let cClassConfig = res["hazopConfig"]["C-Class-Options"]["Types"];
        cClassConfig?.map(config => cClassRatingOptions.push({
          label : config["Label"],
          value : config["Label"],
        }))

        let eClassConfig = res["hazopConfig"]["E-Class-Options"]["Types"];
        eClassConfig?.map(config => eClassRatingOptions.push({
          label : config["Label"],
          value : config["Label"],
        }))

        let asilData = res["hazopConfig"];
        for (const rate in asilData["ASIL-Ratings"]){
          asilRatings.push({
            code : rate,
            value : asilData["ASIL-Ratings"][rate]
          })
        }

        for (const color in asilData["ASIL-Background-Colors"]){
          asilBgColors.push({
            code : color,
            value : asilData["ASIL-Background-Colors"][color]
          })
        }

        for (const color in asilData["ASIL-Text-Colors"]){
          asilTextColors.push({
            code : color,
            value : asilData["ASIL-Text-Colors"][color]
          })
        }

        editableEvent["programUuid"] = this.props["program"]["uuid"]
        this.setState({
          hazopFunctions: hazopFunctions,
          hazards : hazardData,
          sClassRatingOptions : sClassRatingOptions,
          cClassRatingOptions : cClassRatingOptions,
          eClassRatingOptions : eClassRatingOptions,
          asilRatings : asilRatings,
          asilBgColors : asilBgColors,
          asilTextColors : asilTextColors,
          editableEvent : editableEvent,
          editHazardId : editHazardId,
          newEvent : newEvent,
          editTsrLinked : editTsrLinked,
          editTsrLinkedValue : editTsrLinkedValue,
          editExposureType : editExposureType,
          safetyGoalsValue : editSafetyGoals,
          formObject : editableEvent,
          formEdit : formEdit,
          loading: false,
        });
      }
    });
  };

  handleHazards = (ev) => {
    let formObject = this.state["formObject"];
    formObject["Hazard-Name"] = ev["name"];
    formObject["Hazard-ID"] = ev["value"];
    let currentHazardId = ev;
    this.setState({
      formObject: formObject,
      currentHazardId : currentHazardId,
    })
  }

  openModalForRating = (_modalType) => {
    modal(_modalType);
  };

  onChangeCreateNewEventOptions = (ev) => {
    let formObject = this.state["formObject"];
    formObject["Is-New-Event"] = ev["value"] === "YES";
    this.setState({
      createNewEventValue: ev,
      formObject: formObject,
    });
  };

  onChangeExposerTypeOptions = (ev) => {
    let formObject = this.state["formObject"];
    formObject["Exposure-Type"] = ev["value"];
    let editExposureType = ev;
    this.setState({
      formObject: formObject,
      editExposureType : editExposureType,
    });
  };

  onChangeSafetyGoalOptions = (ev) => {
    let formObject = this.state["formObject"];
    formObject["Safety-Goals"] = ev.map((goal) => goal["value"]);
    this.setState({
      safetyGoalsValue: ev,
      editSafetyGoals : ev,
      formObject: formObject,
    }, ()=> this.handleAssignGoals());
  };

  handleAssignGoals = async() => {
    let listOfGoals = []
    let formObject =  this.state["formObject"];
    let selectedGoals = formObject["Safety-Goals"]
    selectedGoals?.map(s => {
      this.state["safetyGoalData"]?.map(goal => {
        if(goal["Safety-Goal-Id"].includes(s)){
          listOfGoals.push(goal);
        }
        return goal;
      });
      return s;
    })

    this.setState({
      listOfGoals: listOfGoals,
    });
  }

  handleListOfGoals = () => {
    this.setState({
      showListOfGoals : !this.state?.showListOfGoals,
    })
  }

  onChangeTSRLinkedOptions = (ev) => {
    let formObject = this.state["formObject"];
    formObject["TSR-Linked"] = ev.map((tsr) => tsr["value"]);
    this.setState({
      tsrLinkedValue: ev,
      editTsrLinkedValue : ev,
      formObject: formObject,
    });
  };

  changeFormOperationalSituationObject = (ev, formKey) => {
    let value = ev.target.value;
    let operationalSituationObject = this.state["operationalSituationObject"];
    operationalSituationObject[formKey] = value;
    this.setState({
      operationalSituationObject: operationalSituationObject,
    });
  };

  handleOperationalSituationModalSubmit = () => {
    const jQuery = window.jQuery;
    jQuery(`#ModalOperationalSituation .close`).click();
    jQuery(".modal-backdrop").remove();

    let formObject = this.state["formObject"];
    formObject["Operational-Situation"] =
      this.state["operationalSituationObject"];
    this.setState({
      formObject: formObject,
    });
  };

  changeFormClassObject = (ev, classKey) => {
    let value = ev.value;
      let modalFormObject = this.state["modalFormObject"];
      modalFormObject[classKey]["Type"] = value;

      let asilCurrentRating = `${modalFormObject["S-Class-Rating"]["Type"]}${modalFormObject["E-Class-Rating"]["Type"]}${modalFormObject["C-Class-Rating"]["Type"]}`

      this.setState({
        modalFormObject: modalFormObject,
        asilCurrentRating : asilCurrentRating,
      });
  };

  addSafetyGoal = (ev, classKey) => {
    let value = ev.target.value;
    let programUuid = this.state["program"]["uuid"];
    let modalFormObject = this.state["modalFormObject"];
    let newGoal = {
      "programUuid" : programUuid,
      "Safety-Goal-Description" : value
    }
    modalFormObject[classKey] = newGoal;
    this.setState({
      modalFormObject: modalFormObject,
    });
  };

  submitSafetyGoalModal = (ev, classKey) => {
    let newGoal = this.state["modalFormObject"]["Safety-Goals"]
    httpPost(apify('app/functional-safety/hazop/add-safety-goals'), newGoal).then(data => {
      if (data['success']) {
        this.safetyGoalData();

        jQuery(`#ModalNewGoal .close`).click();
        jQuery(".modal-backdrop").remove();
      }
    }) 
  }

  changeFormClassDescriptionObject = (ev, classKey) => {
    let value = ev.target.value;
    let modalFormObject = this.state["modalFormObject"];
    modalFormObject[classKey]["Description"] = value;
    this.setState({
      modalFormObject: modalFormObject,
    });
  };

  handleRatingModalSubmit = (classKey, modalID) => {
    jQuery(`${modalID} .close`).click();
    jQuery(".modal-backdrop").remove();

    let formObject = this.state["formObject"];

    formObject[classKey] = this.state["modalFormObject"][classKey];

    const asilCurrentRating = `${formObject["S-Class-Rating"]["Type"]}${formObject["E-Class-Rating"]["Type"]}${formObject["C-Class-Rating"]["Type"]}`

    let asilBgColor = "";
    let asilTextColor = "";
    let asilRatingValue = "";

    if(!asilCurrentRating.includes("undefined")) {
      const asilCurrentRatingValue  = this.state["asilRatings"].find(rate => rate.code === asilCurrentRating )
      
      asilBgColor = this.state["asilBgColors"].find(color => color.code === asilCurrentRatingValue["value"])

      asilTextColor = this.state["asilTextColors"].find(color => color.code === asilCurrentRatingValue["value"])
      
      asilRatingValue = asilCurrentRatingValue["value"];
      asilBgColor = asilBgColor["value"];
      asilTextColor = asilTextColor["value"];    

      formObject["ASIL-Rating-Bg-Color"] = asilBgColor
      formObject["ASIL-Rating-Text-Color"] = asilTextColor
      formObject["ASIL-Rating-Value"] = asilCurrentRatingValue["value"]
    }


    this.setState({
      formObject: formObject,
      asilCurrentRating : asilCurrentRating,
      asilBgColor : asilBgColor,
      asilTextColor : asilTextColor,
      asilRatingValue : asilRatingValue,
    });
  };

  changeFormObject = (ev, formKey) => {
    let value = ev.target.value;
    let formObject = this.state["formObject"];
    formObject[formKey] = value;
    this.setState({
      formObject: formObject,
    });
  };

  handleFormSubmit = () => {
    // Error keys
    var errorKeys = [];
    
    if (nullIfEmpty(this.state["formObject"]["Hazard-ID"]) === null) {
      errorKeys.push("Hazard-ID");
    }
    if (nullIfEmpty(this.state["formObject"]["Hazardous-Event-and-Accident"]) === null) {
      errorKeys.push("Hazardous-Event-and-Accident");
    }
    if (nullIfEmpty(this.state["formObject"]["Exposure-Type"]) === null) {
      errorKeys.push("Exposure-Type");
    }
    if (nullIfEmpty(this.state["formObject"]["S-Class-Rating"]["Description"]) === null) {
      errorKeys.push("S-Class-Rating");
    }
    if (nullIfEmpty(this.state["formObject"]["E-Class-Rating"]["Description"]) === null) {
      errorKeys.push("E-Class-Rating");
    }
    if (nullIfEmpty(this.state["formObject"]["C-Class-Rating"]["Description"]) === null) {
      errorKeys.push("C-Class-Rating");
    }
    if (nullIfEmpty(this.state["safetyGoalsValue"]) === null) {
      errorKeys.push("safetyGoals");
    }
    if (nullIfEmpty(this.state["formObject"]["Technical-Safety-Requirement"]) === null
    ) {
      errorKeys.push("Technical-Safety-Requirement");
    }
    if (nullIfEmpty(this.state["formObject"]["Hardware-Safety-Requirement"]) === null && this.state["formObject"]["TSR-Linked"]?.includes("Hardware")) {
      errorKeys.push("Hardware-Safety-Requirement");
    }
    if (nullIfEmpty(this.state["formObject"]["Software-Safety-Requirement"]) === null && this.state["formObject"]["TSR-Linked"]?.includes("Software")) {
      errorKeys.push("Software-Safety-Requirement");
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

    if (!hasValidationError) {
     let formObject = this.state['formObject'];
      swalConfirmationPopup({
        title: `${this.state?.formEdit ? `Update Event` : `Add Event`}`,
        text: `${this.state?.formEdit ? `This action will update this event` : `This action will add new new event`}`,
        confirmButtonText: "Confirm",
      }, () => {
  
        triggerSwalLoader();
  
        httpPost(apify('app/functional-safety/hazop/add-event'), formObject).then(data => {
          if (data['success']) {
            triggerSwalLoader('HIDE');
  
            let nextUrl = programLifecycleRoute("Functional-Safety-HARA",this.state["program"]["uuid"]);
            this.props.history.push(nextUrl);
          }
        });
  
      });
    }
  };

  componentDidMount() {
    this.fetchDataPoints();
    this.fetchData();
    this.safetyGoalData();
  }
  
  render() {
    return (
      <div>
        {this.state["loading"] && <PlaceholderLoader />}
        {!this.state["loading"] && (
          <div>
            <div className="card-body">
              <form className="app-form required">
                <div className="row">
                  <div className="col-4 label required-label">Hazard ID</div>
                  <div className="col-8">
                    <Select
                      options={this.state["hazards"]}
                      onChange={(ev)=> this.handleHazards(ev)}
                      value={this.state["currentHazardId"] ? this.state["currentHazardId"] : this.state["editHazardId"]}
                      menuPortalTarget={document.body}
                      styles={{menuPortal: (base) => ({ ...base, zIndex: 9999 })}}
                    />
                      <span className="text-danger text-error d-none" data-validation-key="Hazard-ID">
                        Please Select Harzard ID
                      </span>
                  </div>
                </div>

                <div className="row">
                  <div className="col-4 label required-label">Hazard Name</div>
                  <div className="col-8">
                    <input
                      type="text"
                      className="form-control md-form-control"
                      placeholder="Hazard Name (Auto Fill by Hazard Id)"
                      defaultValue={this.state["formObject"]["Hazard-Name"] && this.state["formObject"]["Hazard-Name"]}
                      readOnly={true}
                    />
                  </div>
                </div>
                
                <ShowThreatsFromLifecycle
                  program={this.props["program"]}
                  hazardId={this.state["currentHazardId"] ? this.state["currentHazardId"] : this.state["editHazardId"]}
                />

                {
                this.state["currentHazardId"] &&
                <div className="row">
                  <div className="col-4 label required-label">Create A New Event</div>
                  <div className="col-8">
                    <Select
                      options={this.state["createNewEventOptions"]}
                      onChange={this.onChangeCreateNewEventOptions}
                      value={this.state["formObject"]["Is-New-Event"] ? {
                        value : "YES",
                        label : "Yes"
                      } : this.state["createNewEventValue"]}
                      menuPortalTarget={document.body}
                      styles={{menuPortal: (base) => ({ ...base, zIndex: 9999 })}}
                    />
                  </div>
                </div>
               }

                {(this.state["createNewEventValue"]["value"] === "YES" || this.state["formObject"]["Is-New-Event"] === true )&& (
                  <>
                    <div className="row">
                      <div className="col-4 label required-label">Hazard Event ID</div>
                      <div className="col-8">
                        <input
                          type="text"
                          className="form-control md-form-control"
                          defaultValue={this.state["formObject"]["Hazardous-Event-ID"] && this.state["formObject"]["Hazardous-Event-ID"]}
                          placeholder="Hazard Event ID (System Generated)"
                          readOnly={true}
                        />
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-4 label required-label">Operational Situation</div>
                      <div className="col-6">
                        <button
                          type="button"
                          className="btn btn-success btn-sm mr-2"
                          onClick={(ev) => this.openModalForRating("#ModalOperationalSituation")}>
                          <i className="fa fa-plus mr-2"></i>
                          {Object.keys(this.state["formObject"]["Operational-Situation"]).length  > 0 ? "Update Operational Situation" : "Add Operational Situation"}
                        </button>
                        <button
                          type="button"
                          className="btn btn-success btn-sm ml-2"
                          onClick={(ev) => this.openModalForRating("#ModalOperationalSituationView")}>
                          <i className="fa fa-eye mr-2"></i>
                          View
                        </button>
                      </div>

                    </div>

                    <div className="row">
                      <div className="col-4 label required-label">
                        Hazard Event and Accident
                      </div>
                      <div className="col-8">
                        <input
                          type="text"
                          className="form-control md-form-control"
                          placeholder="Hazard Event and Accident"
                          defaultValue={this.state["formObject"]["Hazardous-Event-and-Accident"] && this.state["formObject"]["Hazardous-Event-and-Accident"]}
                          onChange={(ev) => this.changeFormObject(ev,"Hazardous-Event-and-Accident")}
                        />
                        <span
                          className="text-danger text-error d-none"
                          data-validation-key="Hazardous-Event-and-Accident"
                        >
                          Please Enter Hazardous Event and Accident
                        </span>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-4 label required-label">Exposure Type</div>
                      <div className="col-8">
                        <Select
                          options={this.state["exposureTypeOptions"]}
                          onChange={this.onChangeExposerTypeOptions}
                          value={this.state?.formObject["Exposure-Type"] && {
                            label : this.state?.formObject["Exposure-Type"],
                            value : this.state?.formObject["Exposure-Type"]
                          }}
                          // menuPortalTarget={document.body}
                          styles={{menuPortal: (base) => ({ ...base, zIndex: 9999 })}}
                          placeholder="Select Exposure Type"
                        />
                        <span className="text-danger text-error d-none" data-validation-key="Exposure-Type">
                        Please Select Exposure Type
                        </span>
                      </div>
                    </div>
                    
                    {
                      this.state?.formObject["Exposure-Type"] &&
                      <>
                    <div className="row">
                      <div className="col-4 label required-label">S Rating</div>
                      <div className="col-5">
                        <input
                          type="text"
                          className="form-control md-form-control"
                          placeholder="S Rating"
                          defaultValue={this.state?.formObject["S-Class-Rating"]["Description"] && this.state["formObject"]["S-Class-Rating"]["Type"]}
                          readOnly={true}
                        />
                        <span
                          className="text-danger text-error d-none"
                          data-validation-key="S-Class-Rating"
                        >
                          Please Enter S-Class Rating
                        </span>
                      </div>
                      <div className="col-3">
                        <button
                          type="button"
                          className="btn btn-success btn-sm mt-n2"
                          onClick={(ev) => this.openModalForRating("#ModalSClassRating")}>
                          {
                            this.state["formObject"]["S-Class-Rating"]["Description"] ?
                            (<><i className="fa fa-refresh mr-2"></i>Update Rating</>) :
                            (<><i className="fa fa-plus mr-2"></i>Provide Rating</>)
                          }
                        </button>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-4 label required-label">E Rating</div>
                      <div className="col-5 ">
                        <input
                          type="text"
                          className="form-control md-form-control"
                          placeholder="E Rating"
                          defaultValue={this.state?.formObject["E-Class-Rating"]["Description"] && this.state["formObject"]["E-Class-Rating"]["Type"]}
                          readOnly={true}
                        />
                        <span
                          className="text-danger text-error d-none" data-validation-key="E-Class-Rating">
                          Please Enter E-Class Rating
                        </span>
                      </div>
                      <div className="col-3">
                        <button
                          type="button"
                          className="btn btn-success btn-sm mt-n2"
                          onClick={(ev) => this.openModalForRating("#ModalEClassRating")}>
                          {
                            this.state["formObject"]["E-Class-Rating"]["Description"] ?
                            (<><i className="fa fa-refresh mr-2"></i>Update Rating</>) :
                            (<><i className="fa fa-plus mr-2"></i>Provide Rating</>)
                          }
                        </button>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-4 label required-label">C Rating</div>
                      <div className="col-5">
                        <input
                          type="text"
                          className="form-control md-form-control"
                          placeholder="C Rating"
                          defaultValue={this.state?.formObject["C-Class-Rating"]["Description"] && this.state["formObject"]["C-Class-Rating"]["Type"]}
                          readOnly={true}
                        />
                        <span className="text-danger text-error d-none" data-validation-key="C-Class-Rating">
                          Please Enter C-Class Rating
                        </span>
                      </div>
                      <div className="col-3">
                        <button
                          type="button"
                          className="btn btn-success btn-sm mt-n2"
                          onClick={(ev) => this.openModalForRating("#ModalCClassRating")}>
                          {
                            this.state["formObject"]["C-Class-Rating"]["Description"] ?
                            (<><i className="fa fa-refresh mr-2"></i>Update Rating</>) :
                            (<><i className="fa fa-plus mr-2"></i>Provide Rating</>)
                          }
                        </button>
                      </div>
                    </div>

                    {
                    this.state["formObject"]["ASIL-Rating-Value"] &&
                    <>
                    <div className="row">
                      <div className="col-4 label required-label">ASIL Rating</div>
                      <div className="col-4" >
                      <span 
                        className="badge py-2 px-5 ml-2 font-weight-bold h4" 
                        style={{
                          backgroundColor: this.state?.formObject["ASIL-Rating-Bg-Color"] ? this.state?.formObject["ASIL-Rating-Bg-Color"] : this.state["asilBgColor"],
                          color: this.state?.formObject["ASIL-Rating-Text-Color"] ? this.state?.formObject["ASIL-Rating-Text-Color"] : this.state["asilTextColor"],
                        }}>
                          {this.state?.formObject["ASIL-Rating-Value"]}
                      </span> 
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-4 label required-label">Assign Safety Goals</div>
                      <div className="col-8">
                        <Select
                          options={this.state["safetyGoals"]}
                          onChange={this.onChangeSafetyGoalOptions}
                          value={this.state["safetyGoalsValue"]}
                          menuPortalTarget={document.body}
                          styles={{menuPortal: (base) => ({ ...base, zIndex: 9999 })}}
                          isMulti={true}
                        />
                        <span className="text-danger text-error d-none" data-validation-key="safetyGoals">
                          Please Select a Safety Goal
                        </span>
                      </div>
                    </div>

                    <div className="row">
                    <div className="col-4 label"></div>
                      <div className="col-8">
                        <button
                          type="button"
                          className="btn btn-success btn-sm"
                          onClick={(ev) => this.openModalForRating("#ModalNewGoal")}>
                          <i className="fa fa-plus mr-2"></i>
                          Add New Goal
                        </button>
                        <button
                          type="button"
                          className="btn btn-success btn-sm ml-2"
                          onClick={(ev) => this.openModalForRating("#ModalViewGoals")}>
                          <i className="fa fa-eye mr-2"></i>
                          View Goals
                        </button>
                        <button
                          type="button"
                          className="btn btn-info btn-sm ml-2"
                          onClick={(ev) => this.handleListOfGoals()}>
                          <i className="fa fa-eye mr-2"></i>
                          Show Assigned Goal List
                        </button>
                      </div>
                    </div>

                    <div className={`${this.state?.showListOfGoals ? "row" : "d-none"}`}>
                      <div className="col-4 label ">List of Safety Goals</div>
                      <div className="col-8">
                        <table className="table table-striped ">
                          <thead>
                            <tr>
                              <th>Goal ID</th>
                              <th>Description</th>
                              <th>Assigned Hazards</th>
                            </tr>
                          </thead>
                          <tbody>
                           {
                            this.state["listOfGoals"].length > 0 ?
                            this.state?.listOfGoals?.map((assignedGoal)=>{
                              return (
                              <tr key={assignedGoal["Safety-Goal-Uuid"]}>
                                <td>{assignedGoal["Safety-Goal-Id"]} </td>
                                <td>{assignedGoal["Safety-Goal-Description"]} </td>
                                {
                                  assignedGoal["Associated-Hazard-Ids"].length > 0 ?
                                  <td>{assignedGoal["Associated-Hazard-Ids"]?.map(hId => {
                                  return(
                                    <span key={hId} className="badge badge-v2"> {hId}  </span>
                                  )
                                })}
                                </td>
                                :
                                <td>
                                    <span className="badge badge-v2"> {this.state["currentHazardId"] ? this.state["currentHazardId"]["label"] : this.state?.editHazardId && this.state?.editHazardId[0]["label"]} </span>
                                </td>
                                }
                              </tr>
                              )
                            })
                            : 
                            <tr>
                              <td colSpan={3} className="text-center"><strong>Assign at least one safety goal</strong></td>
                            </tr>
                           }
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-4 label required-label">
                        Technical Safety Requirement (TSR)
                      </div>
                      <div className="col-8">
                        <input
                          type="text"
                          className="form-control md-form-control"
                          defaultValue={this.state?.formObject["Technical-Safety-Requirement"] && this.state["formObject"]["Technical-Safety-Requirement"]}
                          onChange={(ev) => this.changeFormObject(ev,"Technical-Safety-Requirement")}
                          placeholder="Technical Safety Requirement  (TSR)"
                        />
                        <span
                          className="text-danger text-error d-none"
                          data-validation-key="Technical-Safety-Requirement"
                        >
                          Please Enter Technical Safety Requirement
                        </span>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-4 label required-label">Is this TSR linked to</div>
                      <div className="col-5">
                        <Select
                          options={this.state["tsrlinked"]}
                          onChange={this.onChangeTSRLinkedOptions}
                          value={this.state["editTsrLinkedValue"] ? this.state["editTsrLinkedValue"] : this.state["tsrLinkedValue"]}
                          menuPortalTarget={document.body}
                          styles={{menuPortal: (base) => ({ ...base, zIndex: 9999 }),}}
                          isMulti={true}
                        />
                      </div>
                    </div>

                    {(this.state["formObject"]["TSR-Linked"]?.includes("Hardware") || 
                    this.state["editTsrLinkedValue"]?.includes("Hardware")) && (
                      <div className="row">
                        <div className="col-4 label required-label">
                          Hardware Safety Requirement
                        </div>
                        <div className="col-8">
                          <input
                            type="text"
                            className="form-control md-form-control"
                            defaultValue={this.state?.formObject["Hardware-Safety-Requirement"] && this.state["formObject"]["Hardware-Safety-Requirement"]}
                            onChange={(ev) =>this.changeFormObject(ev, "Hardware-Safety-Requirement")}
                            placeholder="Define Hardware Safety requirement"
                          />
                          <span
                            className="text-danger text-error d-none"
                            data-validation-key="Hardware-Safety-Requirement"
                          >
                            Please Enter Hardware Safety Requirement
                          </span>
                        </div>
                      </div>
                    )}

                    {(this.state["formObject"]["TSR-Linked"]?.includes("Software") || 
                    this.state["editTsrLinkedValue"]?.includes("Software")) && (
                      <div className="row">
                        <div className="col-4 label required-label">
                          Software Safety Requirement
                        </div>
                        <div className="col-8">
                          <input
                            type="text"
                            className="form-control md-form-control"
                            defaultValue={this.state?.formObject["Software-Safety-Requirement"] && this.state["formObject"]["Software-Safety-Requirement"]}
                            onChange={(ev) =>this.changeFormObject(ev,"Software-Safety-Requirement")}
                            placeholder="Define Software Safety requirement"
                          />
                          <span
                            className="text-danger text-error d-none"
                            data-validation-key="Software-Safety-Requirement"
                          >
                            Please Enter Software Safety Requirement
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="row">
                      <div className="col-4 label">Safe State</div>
                      <div className="col-8">
                        <input
                          type="text"
                          className="form-control md-form-control"
                          placeholder="Safe State"
                          defaultValue={this.state?.formObject["Safe-State"] && this.state["formObject"]["Safe-State"]}
                          onChange={(ev) => this.changeFormObject(ev, "Safe-State")}
                        />
                        <span
                          className="text-danger text-error d-none"
                          data-validation-key="Safe-State"
                        >
                          Please Enter Safe-State
                        </span>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-4 label">
                        Fault Tolerant Time Interval (FTTI)
                      </div>
                      <div className="col-8">
                        <input
                          type="text"
                          className="form-control md-form-control"
                          placeholder="Fault Tolerant Time Interval (FTTI)"
                          defaultValue={this.state?.formObject["Fault-Tolerant-Time-Interval"] && this.state["formObject"]["Fault-Tolerant-Time-Interval"] }
                          onChange={(ev) => this.changeFormObject(ev,"Fault-Tolerant-Time-Interval")}
                        />
                        <span
                          className="text-danger text-error d-none"
                          data-validation-key="Fault-Tolerant-Time-Interval"
                        >
                          Please Enter Fault Tolerant Time Interval
                        </span>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-4 label">Rationale for FTTI</div>
                      <div className="col-8">
                        <input
                          type="text"
                          className="form-control md-form-control"
                          placeholder="Rationale for FTTI"
                          defaultValue={this.state?.formObject["Rationale-for-FTTI"] && this.state["formObject"]["Rationale-for-FTTI"]}
                          onChange={(ev) =>this.changeFormObject(ev, "Rationale-for-FTTI")}
                        />
                        <span
                          className="text-danger text-error d-none"
                          data-validation-key="Rationale-for-FTTI"
                        >
                          Please Enter Rationale for FTTI
                        </span>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-4 label">Critical Limits</div>
                      <div className="col-8">
                        <input
                          type="text"
                          className="form-control md-form-control"
                          placeholder="Critical Limits"
                          defaultValue={this.state?.formObject["Critical-Limits"] && this.state["formObject"]["Critical-Limits"] }
                          onChange={(ev) =>
                            this.changeFormObject(ev, "Critical-Limits")
                          }
                        />
                        <span
                          className="text-danger text-error d-none"
                          data-validation-key="Critical-Limits"
                        >
                          Please Enter Critical-Limits
                        </span>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-4 label">
                        Rationale for Critical Limits
                      </div>
                      <div className="col-8">
                        <input
                          type="text"
                          className="form-control md-form-control"
                          placeholder="Rationale for Critical Limits"
                          defaultValue={this.state?.formObject["Rationale-for-Critical-Limits"] && this.state["formObject"]["Rationale-for-Critical-Limits"]}
                          onChange={(ev) => this.changeFormObject(ev,"Rationale-for-Critical-Limits")}
                        />
                        <span
                          className="text-danger text-error d-none"
                          data-validation-key="Rationale-for-Critical-Limits"
                        >
                          Please Enter Rationale for Critical Limits
                        </span>
                      </div>
                    </div>
                    </>
                    }

                    </>
                    }  
                  </>
                )}
              </form>
            </div>

            <div className="card-footer">
              <div className="row">
                <div className="col-12 col-md-6">
                  <button 
                   disabled={Object.keys(this.state["formObject"]).length < 17 }
                   className="btn btn-primary" onClick={this.handleFormSubmit}>
                   {this.state?.formEdit ? "Update Event" : "Save Event"} 
                  </button>
                </div>

                <div className="col-12 col-md-6 text-right">
                  <Link
                    to={programLifecycleRoute(
                      "Functional-Safety-HARA",
                      this.state["program"]["uuid"]
                    )}
                    className="btn btn-info px-3 text-white"
                  >
                    <i className="fa fa-arrow-left mr-2"></i>
                    Back to <b>HARA</b>
                  </Link>
                </div>
              </div>
            </div>

            {/* Modal S Class  */}
            <div
              className="modal fade"
              id="ModalSClassRating"
              tabIndex="-1"
              data-keyboard="false"
              data-backdrop="static"
            >
              <div className="modal-dialog modal-lg">
                <div className="modal-content">
                  <div className="modal-header">
                    <h4 className="modal-title text-primary">
                      Enter data for Severity (S) Rating
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
                    <form className="app-form">
                      <div className="row">
                        <div className="col-4 label required-label">Select S-Class</div>
                        <div className="col-8">
                          <Select
                          options={this.state["sClassRatingOptions"]}
                          menuPortalTarget={document.body}
                          styles={{
                            menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                          }}
                          onChange={(ev) =>
                            this.changeFormClassObject(ev,"S-Class-Rating")}
                        />
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-12 label required-label">
                          Rational for Severity (S)
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-12">
                          <textarea
                            rows={5}
                            className="form-control md-form-control"
                            defaultValue={this.state?.formObject["S-Class-Rating"]["Description"] && this.state["formObject"]["S-Class-Rating"]["Description"]}
                            onChange={(ev) =>
                              this.changeFormClassDescriptionObject(
                                ev,
                                "S-Class-Rating"
                              )
                            }
                          ></textarea>
                        </div>
                      </div>
                    </form>
                  </div>

                  <div className="modal-footer">
                    <button
                      disabled={Object.keys(this.state["modalFormObject"]["S-Class-Rating"]).length < 2}
                      className="btn btn-success btn-lg"
                      onClick={() =>
                        this.handleRatingModalSubmit(
                          "S-Class-Rating",
                          "#ModalSClassRating"
                        )
                      }
                    >
                      Submit
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal E Class  */}
            <div
              className="modal fade"
              id="ModalEClassRating"
              tabIndex="-1"
              data-keyboard="false"
              data-backdrop="static"
            >
              <div className="modal-dialog modal-lg">
                <div className="modal-content">
                  <div className="modal-header">
                    <h4 className="modal-title text-primary">
                      Enter data for Exposure (E) Rating
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
                    <form className="app-form">
                      <div className="row">
                        <div className="col-4 label required-label">Select E-Class</div>
                        <div className="col-8">
                          <Select
                          options={this.state["eClassRatingOptions"]}
                          menuPortalTarget={document.body}
                          styles={{
                            menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                          }}
                          onChange={(ev) =>
                            this.changeFormClassObject(ev,"E-Class-Rating")}
                        />
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-12 label required-label">
                          Rational for Exposure (E)
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-12">
                          <textarea
                            rows={5}
                            className="form-control md-form-control"
                            defaultValue={this.state?.formObject["E-Class-Rating"]["Description"] && this.state["formObject"]["E-Class-Rating"]["Description"]}
                            onChange={(ev) =>
                              this.changeFormClassDescriptionObject(
                                ev,
                                "E-Class-Rating"
                              )
                            }
                          ></textarea>
                        </div>
                      </div>
                    </form>
                  </div>

                  <div className="modal-footer">
                    <button
                      disabled={Object.keys(this.state["modalFormObject"]["E-Class-Rating"]).length < 2}
                      className="btn btn-success btn-lg"
                      onClick={() =>
                        this.handleRatingModalSubmit(
                          "E-Class-Rating",
                          "#ModalEClassRating"
                        )
                      }
                    >
                      Submit
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal C Class  */}
            <div
              className="modal fade"
              id="ModalCClassRating"
              tabIndex="-1"
              data-keyboard="false"
              data-backdrop="static"
            >
              <div className="modal-dialog modal-lg">
                <div className="modal-content">
                  <div className="modal-header">
                    <h4 className="modal-title text-primary">
                      Enter data for Controllability (C) Rating
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
                    <form className="app-form">
                      <div className="row">
                        <div className="col-4 label required-label">Select C-Class</div>
                        <div className="col-8">
                          <Select
                          options={this.state["cClassRatingOptions"]}
                          menuPortalTarget={document.body}
                          styles={{
                            menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                          }}
                          onChange={(ev) =>
                            this.changeFormClassObject(ev,"C-Class-Rating")}
                        />
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-12 label required-label">
                          Rational for Controlablity (C)
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-12">
                          <textarea
                            rows={5}
                            className="form-control md-form-control"
                            defaultValue={this.state?.formObject["C-Class-Rating"]["Description"] && this.state["formObject"]["C-Class-Rating"]["Description"]}
                            onChange={(ev) => this.changeFormClassDescriptionObject(ev,"C-Class-Rating")}
                          ></textarea>
                        </div>
                      </div>
                    </form>
                  </div>

                  <div className="modal-footer">
                    <button
                      disabled={Object.keys(this.state["modalFormObject"]["C-Class-Rating"]).length < 2}
                      className="btn btn-success btn-lg"
                      onClick={() => this.handleRatingModalSubmit("C-Class-Rating","#ModalCClassRating")}
                    >
                      Submit
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* New Goad Modal */}
            <div
              className="modal fade"
              id="ModalNewGoal"
              tabIndex="-1"
              data-keyboard="false"
              data-backdrop="static"
            >
              <div className="modal-dialog modal-lg">
                <div className="modal-content">
                  <div className="modal-header">
                    <h4 className="modal-title text-primary">
                      Provide Safety Goal
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
                        <div className="col-4 label required-label">Goal ID</div>
                        <div className="col-6 label">
                          <input
                            type="text"
                            className="form-control md-form-control"
                            placeholder="System Generated"
                            readOnly={true}
                          />
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-4 label required-label">Description</div>
                        <div className="col-8">
                          <textarea
                            rows={5}
                            className="form-control md-form-control mt-3"
                            onChange={(ev) => this.addSafetyGoal(ev,"Safety-Goals")}
                          ></textarea>
                        </div>
                      </div>
                    </form>
                  </div>

                  <div className="modal-footer">
                    <button className="btn btn-success btn-lg" onClick={this.submitSafetyGoalModal}>Submit</button>
                  </div>
                </div>
              </div>
            </div>

            {/* View Goals Modal */}
            <div
              className="modal fade"
              id="ModalViewGoals"
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
                        {
                          this.state["safetyGoals"]?.map((goal,idx) => {
                            return (
                              <tr key={idx}>
                                <td>{goal["label"]}</td>
                                <td>{goal["description"]}</td>
                              </tr>
                            )})
                        }
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            {/* Operational Situation Modal */}
            <div
              className="modal fade"
              id="ModalOperationalSituation"
              tabIndex="-1"
              data-keyboard="false"
              data-backdrop="static"
            >
              <div className="modal-dialog modal-lg">
                <div className="modal-content">
                  <div className="modal-header">
                    <h4 className="modal-title text-primary">
                      Provide Operational Situaion
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
                    <table className="table table-bordered">
                      <thead>
                        <tr>
                          <th className="text-left">Vehicle Speed</th>
                          <td className="text-left align-middle h-100 p-0 m-0 ">
                            <input
                              type="text"
                              className="border-0 border-white form-control md-form-control"
                              placeholder="Enter Vehicle Speed"
                              defaultValue={this.state?.formObject["Operational-Situation"]["Vehicle-Speed"] && this.state["formObject"]["Operational-Situation"]["Vehicle-Speed"]}
                              onChange={(ev) => this.changeFormOperationalSituationObject(ev,"Vehicle-Speed")}
                            />
                          </td>
                        </tr>
                        <tr>
                          <th className="text-left">Location</th>
                          <td className="text-left align-middle h-100 p-0 m-0">
                            <input
                              type="text"
                              className="border-0 border-white form-control md-form-control"
                              placeholder="Enter Location"
                              defaultValue={this.state?.formObject["Operational-Situation"]["Location"] && this.state["formObject"]["Operational-Situation"]["Location"]}
                              onChange={(ev) => this.changeFormOperationalSituationObject(ev,"Location")}
                            />
                          </td>
                        </tr>
                        <tr>
                          <th className="text-left">Road Condition</th>
                          <td className="text-left align-middle h-100 p-0 m-0">
                            <input
                              type="text"
                              className="border-0 border-white form-control md-form-control"
                              placeholder="Enter Road Condtion"
                              defaultValue={this.state?.formObject["Operational-Situation"]["Road-Condition"] && this.state["formObject"]["Operational-Situation"]["Road-Condition"]}
                              onChange={(ev) => this.changeFormOperationalSituationObject(ev,"Road-Condition")}
                            />
                          </td>
                        </tr>
                        <tr>
                          <th className="text-left">Traffic & People</th>
                          <td className="text-left align-middle h-100 p-0 m-0">
                            <input
                              type="text"
                              className="border-0 border-white form-control md-form-control"
                              placeholder="Enter Traffic & People"
                              defaultValue={this.state?.formObject["Operational-Situation"]["Traffic-People"] && this.state["formObject"]["Operational-Situation"]["Traffic-People"]}
                              onChange={(ev) => this.changeFormOperationalSituationObject(ev, "Traffic-People")}
                            />
                          </td>
                        </tr>
                        <tr>
                          <th className="text-left">Item Usage</th>
                          <td className="text-left align-middle h-100 p-0 m-0">
                            <input
                              type="text"
                              className="border-0 border-white form-control md-form-control"
                              placeholder="Enter Item Usage"
                              defaultValue={this.state?.formObject["Operational-Situation"]["Vehicle-Speed"] && this.state["formObject"]["Operational-Situation"]["Vehicle-Speed"]}
                              onChange={(ev) => this.changeFormOperationalSituationObject(ev,"Item-Usage")}
                            />
                          </td>
                        </tr>
                      </thead>
                    </table>
                  </div>

                  <div className="modal-footer">
                    <button
                      disabled={Object.keys(this.state["operationalSituationObject"]).length < 5}
                      className="btn btn-success btn-lg"
                      onClick={this.handleOperationalSituationModalSubmit}
                    >
                      Submit
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* View Operational Situation */}
            <div
              className="modal fade"
              id="ModalOperationalSituationView"
              tabIndex="-1"
              data-keyboard="false"
              data-backdrop="static"
            >
              <div className="modal-dialog modal-lg">
                <div className="modal-content">
                  <div className="modal-header">
                    <h4 className="modal-title text-primary">
                      View Operational Situaion
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
                    <table className="table table-bordered">
                      <thead>
                        <tr>
                          <th className="text-left">Vehicle Speed</th>
                          <td className="text-left align-middle h-100 p-0 m-0 ">
                            <input
                              type="text"
                              className="border-0 border-white form-control md-form-control"
                              defaultValue={this.state?.formObject["Operational-Situation"]["Vehicle-Speed"] && this.state["formObject"]["Operational-Situation"]["Vehicle-Speed"]}
                              onChange={(ev) => this.changeFormOperationalSituationObject(ev,"Vehicle-Speed")}
                              readOnly={true}
                            />
                          </td>
                        </tr>
                        <tr>
                          <th className="text-left">Location</th>
                          <td className="text-left align-middle h-100 p-0 m-0">
                            <input
                              type="text"
                              className="border-0 border-white form-control md-form-control"
                              defaultValue={this.state?.formObject["Operational-Situation"]["Location"] && this.state["formObject"]["Operational-Situation"]["Location"]}
                              onChange={(ev) => this.changeFormOperationalSituationObject(ev,"Location")}
                              readOnly={true}
                            />
                          </td>
                        </tr>
                        <tr>
                          <th className="text-left">Road Condition</th>
                          <td className="text-left align-middle h-100 p-0 m-0">
                            <input
                              type="text"
                              className="border-0 border-white form-control md-form-control"
                              defaultValue={this.state?.formObject["Operational-Situation"]["Road-Condition"] && this.state["formObject"]["Operational-Situation"]["Road-Condition"]}
                              onChange={(ev) => this.changeFormOperationalSituationObject(ev,"Road-Condition")}
                              readOnly={true}
                            />
                          </td>
                        </tr>
                        <tr>
                          <th className="text-left">Traffic & People</th>
                          <td className="text-left align-middle h-100 p-0 m-0">
                            <input
                              type="text"
                              className="border-0 border-white form-control md-form-control"
                              defaultValue={this.state?.formObject["Operational-Situation"]["Traffic-People"] && this.state["formObject"]["Operational-Situation"]["Traffic-People"]}
                              onChange={(ev) => this.changeFormOperationalSituationObject(ev, "Traffic-People")}
                              readOnly={true}
                            />
                          </td>
                        </tr>
                        <tr>
                          <th className="text-left">Item Usage</th>
                          <td className="text-left align-middle h-100 p-0 m-0">
                            <input
                              type="text"
                              className="border-0 border-white form-control md-form-control"
                              defaultValue={this.state?.formObject["Operational-Situation"]["Vehicle-Speed"] && this.state["formObject"]["Operational-Situation"]["Vehicle-Speed"]}
                              onChange={(ev) => this.changeFormOperationalSituationObject(ev,"Item-Usage")}
                              readOnly={true}
                            />
                          </td>
                        </tr>
                      </thead>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default withRouter(FunctionalSafetyHARACreateEvent);
