import React from "react";
import { Link, withRouter } from "react-router-dom";
import Select from 'react-select'
import { programLifecycleRoute, setTitle, triggerSwalLoader, swalConfirmationPopup, nullIfEmpty } from "helpers/common";
import DashboardLayout from "screens/Layouts/DashboardLayout";
import ProgramLayout from "screens/Layouts/ProgramLayout";
import FunctionalSafetyProgramHeader from "../slots/FunctionalSafetyProgramHeader";
import PlaceholderLoader from "components/ui/placeholder-loader/placeholder-loader";
import { apify, httpGet, httpPost } from "helpers/network";

const jQuery = window.jQuery;

// HAZOP Configure Function
class FunctionalSafetyHazopConfigureFunction extends React.Component {
  constructor(props) {
    super(props);
    let { programUuid, functionUuid } = props.match.params;
    this.state = {
      loading: true,
      programUuid: programUuid,
      functionUuid: functionUuid,
    };
  }

  fetchData = async => {
    let formEdit = false;
    const hazardUuid = window.location.pathname.split("/")[6];
    if(hazardUuid) formEdit = true;
    this.setState({ formEdit });
  }

  async componentDidMount() {
    setTitle("Functional Safety HAZOP");
    await this.fetchData();
  }

  render() {
    return (
      <div>
        <DashboardLayout app="Criskle-Functional-Safety">
          <ProgramLayout 
            programUuid={this.state['programUuid']} 
            header={<FunctionalSafetyProgramHeader title={`${this.state?.formEdit ? `Update Hazard` : `Create New Hazard`}`} />}
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
      loading: true,
      program: props['program'],
      functionUuid: props['functionUuid'],
      hazopFunction: [],
      guideWords: [],
      hazardCandidateOptions: [],
      hazardCandidateValue: [],
      hazardReviewed : false,
      formObject: {
        'programUuid': props['program']['uuid'],
        'Function-Uuid': props['functionUuid'],
        'Guide-Words': [],
        'Hazard-Candidate': false,
      }
    };
  }

  fetchData = async() => {
    let programUuid = this.state['program']['uuid'];
    let hazardCandidateOptions = [
      {"label": "Yes", "value": "YES"},
      {"label": "No", "value": "NO"},
    ];

    let formEdit = false;
    let hazardCandidateValue = [];

    const hazardUuid = window.location.pathname.split("/")[6];

    if(hazardUuid) {
      formEdit = true;
    }

    httpGet(apify(`app/functional-safety/hazop?programUuid=${programUuid}`)).then(res => {
      if (res['success']) {
        let hazopFunctions = res['hazopObject']['Hazop']['Functions'];
        let hazopFunction = hazopFunctions.filter((f) => f['Uuid'] === this.state['functionUuid']);
        hazopFunction = hazopFunction ? hazopFunction[0] : null;
        hazopFunction["Hazards"]?.map((hazard) => {
          if(hazard["Hazard-Uuid"] === hazardUuid){

            let guideWordsData = hazard["Guide-Words"];
            let guideWordsValue = guideWordsData?.map((guideWord) => {
              return {
                "label": guideWord,
                "value": guideWord,
              };
            });
            
            if(hazard["Hazard-Candidate"]){
              hazardCandidateValue = {"label": "Yes", "value": "YES"};
            }
            
            hazard["programUuid"] = programUuid;
            this.setState({
              formObject: hazard, 
              hazardCandidateValue: hazardCandidateValue,
              hazardCandidateOptions: [{"label": hazard["Hazard-Candidate"], "value": hazard["Hazard-Candidate"]}],
              guideWordsValue: guideWordsValue,
            });

          }

          return hazard;
        });


        this.setState({
          loading: false,
          hazopFunction: hazopFunction,
          guideWords: res['hazopConfig']['Guide-Words'],
          hazardCandidateOptions: hazardCandidateOptions,
          // hazardCandidateValue: hazardCandidateOptions[1],
          formEdit : formEdit,
        }, () => {
          // this.onChangeHazardCandidateOptions(hazardCandidateOptions[1]);
        });
      }
    });
  }

  onChangeHazardCandidateOptions = (ev) => {
    let formObject = this.state['formObject'];
    formObject['Hazard-Candidate'] = (ev['value'] === 'YES');

    this.setState({
      hazardCandidateValue: ev,
      formObject: formObject,
    });
  }

  onChangeGuideWords = (ev) => {
    let formObject = this.state['formObject'];
    formObject['Guide-Words'] = ev.map((word) => word['value']);

    this.setState({
      guideWordsValue: ev,
      formObject: formObject,
    });
  }

  changeFormObject = (ev, formKey) => {
    let value = ev.target.value;
    let formObject = this.state['formObject'];
    formObject[formKey] = value;
    this.setState({
      formObject: formObject
    });
  }

  submitForm = (ev) => {
    let formObject = this.state['formObject'];

    var errorKeys = [];
    
    if (nullIfEmpty(this.state['guideWordsValue']) === null) {
      errorKeys.push("guideWords");
    }
    if (nullIfEmpty(this.state['formObject']['Output-Failure-Type']) === null) {
      errorKeys.push("Output-Failure-Type");
    }
    if (nullIfEmpty(this.state['formObject']['Malfunction-Behaviour']) === null) {
      errorKeys.push("Malfunction-Behaviour");
    }
    if (nullIfEmpty(this.state['hazardCandidateValue']) === null) {
      errorKeys.push("hazardCandidate");
    }
    if (nullIfEmpty(this.state['formObject']['Hazard-Name']) === null) {
      errorKeys.push("Hazard-Name");
    }
    if (nullIfEmpty(this.state['formObject']['Hazard-Description']) === null) {
      errorKeys.push("Hazard-Description");
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
      swalConfirmationPopup({
        title: `${this.state?.formEdit ? `Update Hazard` : `Add Hazard`}`,
        text: `${this.state?.formEdit ? `This action will update hazard for this function.` : `This action will add new hazard for this function.`}`,
        confirmButtonText: "Confirm",
      }, () => {
        triggerSwalLoader();

        if(!this.state?.formEdit){
          httpPost(apify('app/functional-safety/hazop/add-hazard'), formObject).then(data => {
            if (data['success']) {
              triggerSwalLoader('HIDE');
    
              let nextUrl = programLifecycleRoute('Functional-Safety-HAZOP-Hazards', this.state['program']['uuid'], {'functionUuid': this.state['functionUuid']});
              this.props.history.push(nextUrl);
    
            }
          });
        }
        else{
          httpPost(apify('app/functional-safety/hazop/update-hazard'), formObject).then(data => {
            if (data['success']) {
              triggerSwalLoader('HIDE');

              let nextUrl = programLifecycleRoute('Functional-Safety-HAZOP-Hazards', this.state['program']['uuid'], {'functionUuid': this.state['functionUuid']});
              this.props.history.push(nextUrl);
            }
          });
        }
     })
    }
  }

  handleChecked = (ev) => {
    let hazardReviewed = ev.target.checked;
    this.setState({
      hazardReviewed: hazardReviewed,
    });
  }


  componentDidMount () {
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
            <form className="app-form required">
              
              <div className="row">
                <div className="col-4 label required-label">
                  Function
                </div>
                <div className="col-8">
                  <input type="text" className="form-control md-form-control" defaultValue={this.state['hazopFunction']['Function']} readOnly={true} />
                </div>
              </div>

              <div className="row">
                <div className="col-4 label required-label">
                  Guide Words
                </div>
                <div className="col-8">
                <Select
                  options={this.state['guideWords']}
                  menuPortalTarget={document.body} styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                  isMulti={true}
                  value={this.state['guideWordsValue']}
                  onChange={this.onChangeGuideWords}
                />
                  <span className="text-danger text-error d-none" data-validation-key="guideWords">
                  Please Select at least one Guide Word.
                  </span>
                </div>
              </div>
              
              <div className="row">
                <div className="col-4 label required-label">
                  Output Failure Type
                </div>
                <div className="col-8">
                  <input 
                    type="text" 
                    className="form-control md-form-control" 
                    placeholder="Output Failure Type" 
                    defaultValue={this.state['formObject']['Output-Failure-Type']}
                    onChange={(ev) => this.changeFormObject(ev, 'Output-Failure-Type')}
                  />
                  <span className="text-danger text-error d-none" data-validation-key="Output-Failure-Type">
                  Please Enter Output Failure Type.
                  </span>
                </div>
              </div>

              <div className="row">
                <div className="col-4 label required-label">
                  Malfunction Behaviour
                </div>
                <div className="col-8">
                  <input 
                    type="text" 
                    className="form-control md-form-control" 
                    placeholder="Malfunction Behaviour" 
                    defaultValue={this.state['formObject']['Malfunction-Behaviour']}
                    onChange={(ev) => this.changeFormObject(ev, 'Malfunction-Behaviour')}
                  />
                    <span className="text-danger text-error d-none" data-validation-key="Malfunction-Behaviour">
                    Please Enter Malfunction Behaviour.
                    </span>
                </div>
              </div>

              <div className="row">
                <div className="col-4 label required-label">
                  Hazard Candidate
                </div>
                <div className="col-8">
                  <Select 
                    options={this.state['hazardCandidateOptions']}
                    value={this.state['hazardCandidateValue']}
                    onChange={this.onChangeHazardCandidateOptions}
                  />
                    <span className="text-danger text-error d-none" data-validation-key="hazardCandidate">
                    Please Select Hazard Candidate.
                    </span>
                </div>
              </div>

              {
                this.state['hazardCandidateValue']['value'] === 'YES' && 
                <>
                  <div className="row">
                    <div className="col-4 label required-label">
                      Hazard ID
                    </div>
                    <div className="col-8">
                      <input type="text" className="form-control md-form-control" placeholder="Hazard ID (Auto System Generated)" readOnly 
                      defaultValue={this.state['formObject']['Hazard-ID']}
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-4 label required-label">
                      Hazard Name
                    </div>
                    <div className="col-8">
                      <input 
                        type="text" 
                        className="form-control md-form-control" 
                        placeholder="Hazard Name" 
                        defaultValue={this.state['formObject']['Hazard-Name']}
                        onChange={(ev) => this.changeFormObject(ev, 'Hazard-Name')}
                      />
                      <span className="text-danger text-error d-none" data-validation-key="Hazard-Name">
                      Please Enter Hazard Name.
                      </span>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-4 label required-label">
                      Hazard Description
                    </div>
                    <div className="col-8">
                      <input 
                        type="text" 
                        className="form-control md-form-control" 
                        placeholder="Hazard Description" 
                        defaultValue={this.state['formObject']['Hazard-Description']}
                        onChange={(ev) => this.changeFormObject(ev, 'Hazard-Description')}
                      />
                      <span className="text-danger text-error d-none" data-validation-key="Hazard-Description">
                      Please Enter Hazard Description.
                      </span>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-4 label">
                      Remarks
                    </div>
                    <div className="col-8">
                      <input 
                        type="text" 
                        className="form-control md-form-control" 
                        placeholder="Remarks" 
                        defaultValue={this.state['formObject']['Hazard-Remarks']}
                        onChange={(ev) => this.changeFormObject(ev, 'Hazard-Remarks')}
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-12">
                      <div className="form-check">
                        <input className="form-check-input" type="checkbox" value="" id="flexCheckIndeterminate" onChange={(ev)=> this.handleChecked(ev)}/>
                        <label className="form-check-label" for="flexCheckIndeterminate">
                          Have you reviewed the Hazards from a Security perspective?
                        </label>
                      </div> 
                    </div>
                  </div>
                </>
              }
             
            </form>
          </div>
          
          <div className="card-footer">
            <div className="row">
              <div className="col-12 col-md-6">
                <button className="btn btn-success px-3 text-white"
                  disabled={Object.keys(this.state["formObject"]).length < 8 || !this.state.hazardReviewed} 
                  onClick={(ev) => this.submitForm()}
                >
                  {this.state?.formEdit ? <> Update and <b>Continue</b></> : <> Save and <b>Continue</b></>} 
                  <i className="fa fa-arrow-right ml-2"></i>
                </button>
              </div>

              <div className="col-12 col-md-6 text-right">
                <Link to={programLifecycleRoute('Functional-Safety-HAZOP-Hazards', this.state['program']['uuid'],{'functionUuid': this.state['functionUuid']})} className="btn btn-info px-3 text-white">
                  <i className="fa fa-arrow-left mr-2"></i>
                  Back to <b>Hazard List</b>
                </Link>
              </div>
            </div>
          </div>

        </div>
        }
        
      </div>
    )
  }
}

export default withRouter(FunctionalSafetyHazopConfigureFunction);