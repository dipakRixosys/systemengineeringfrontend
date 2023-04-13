// React
import React from 'react';
// Router
import { Link } from 'react-router-dom';
// React Select
import Select from 'react-select'
// Layout
import DashboardLayout from 'screens/Layouts/DashboardLayout';
// Network Helpers
import { httpGet, apify, httpPost, httpFile, apiBaseUrl } from 'helpers/network';
// Helpers
import { setTitle, programLifecycleRoute, uuidV4, swalConfirmationPopup, modal, swalPopup, uuidProject } from "helpers/common";

// designSpacification Monitoring & Triage
class TestValidation extends React.Component {

  // State
  state = {
    loading: true,
    reconfigState: false,
    reconfigureState: false,
    yesNoSelects: [
      { label: 'Yes', value: "Yes" },
      { label: 'No', value: "No" },
    ],
    internalSources: [],
    externalSources: [],
    triageTriggers: [],

    goalsValidation: [
      { "label": "Penentration test", "value": "Penentration test" },
      { "label": "Others", "value": "Others" },
    ],
  };


  validate = (requiredParameters, designSpacification) => {

    let index = 0
    let validated = false

    requiredParameters.map(parameter => {
      var referenceNode = document.getElementsByName(parameter)[0]

      if ((!designSpacification || !designSpacification[parameter] || designSpacification[parameter] === '')) {
        let span = document.getElementById(`${parameter}-Alert-Error`)

        // Create a new element
        var newNode = document.createElement('span');
        newNode.innerHTML = `${parameter.replaceAll('-', ' ')} are Required`
        newNode.id = `${parameter}-Alert-Error`
        newNode.className = `text-sm text-danger`

        if (!span) {
          referenceNode.classList.add('border-danger')
          referenceNode.after(newNode);
        }

      } else {
        let span = document.getElementById(`${parameter}-Alert-Error`)
        if (span) {
          span.remove()
          referenceNode.classList.remove('border-danger')
        }
        index++;

      }
      return null
    })

    if (requiredParameters.length === index) {
      validated = true
    }

    return validated
  }

  // Asset options
  prepareVulnerabilityOptions = (vulnerability) => {
    var vulnerabilityArray = [];

    vulnerability['Items'].forEach(item => {
      //
      vulnerabilityArray.push({
        value: item['Uuid'],
        label: item['Name'],
        property: item,
      });
    });

    return vulnerabilityArray;
  }
  // Asset options
  prepareDesignSpacificationOptions = (designSpacification, threats) => {
    var designSpacificationArray = [];

    designSpacification['Items'].forEach(item => {
      // if (!item['Cyber-Security-Validation'] && item['Integration-Verification']) {
      if (!item['Cyber-Security-Validation']) {
        let threat = {}
        threats['Items'].forEach(threatdata => {
          Object.keys(threatdata['Threats']).map(threatMap => {
            if (threatdata['Threats'][threatMap]['RefId'] === item['Threat-Uuid']['value']) {
              threat = threatdata['Threats'][threatMap]
            }
            return true
          })

        })

        //
        designSpacificationArray.push({
          value: item['Uuid'],
          label: item['Cybersecurity-Design-Specification-Name'],
          property: item,
          threat: threat
        });
      }
    });

    return designSpacificationArray;
  }


  // On submit
  onSubmit = async (ev) => {


    let validated = false

    let designSpacification = this.state.designSpacification

    let requiredParameters = ['Cybersecurity-Design-Specification-Name']


    validated = this.validate(requiredParameters, designSpacification)
    if (designSpacification['Cyber-Security-Validation-Data']['Plan-for-End-of-Cybersecurity-Support-File'] && typeof (designSpacification['Cyber-Security-Validation-Data']['Plan-for-End-of-Cybersecurity-Support-File']) !== 'string') {
      await httpFile(apify('app/upload-file'), designSpacification['Cyber-Security-Validation-Data']['Plan-for-End-of-Cybersecurity-Support-File']).then((res) => {

        if (res['success']) {
          designSpacification['Cyber-Security-Validation-Data']['Plan-for-End-of-Cybersecurity-Support-File'] = res['url']
        }
      });
    }

    if (validated) {

      designSpacification['Uuid'] = designSpacification['Uuid'] ? designSpacification['Uuid'] : uuidV4()
      designSpacification['Cyber-Security-Validation'] = true

      var vm = this;
      httpPost(apify('app/program/design-spacification/update'), {
        programUuid: vm.state.programUuid,
        designSpacification: vm.state.designSpacification,
        uuidCounters: vm.state.uuidCounters,
      }).then(res => {
        if (res['success']) {
          window.location.reload(false);
        }
      });
    }
  }

  // On submit
  saveAndContinue = (ev) => {
    let params = {
      programUuid: this.state.programUuid,
      cycle: 'Integration-and-Verification'
    }

    httpPost(apify('app/program/submit-cycle-status'), params).then(data => {
      let phaseRoute = `/dashboard/product-development-phase/test-validation/${this.state.programUuid}`;
      this.props.history.push(phaseRoute);
    }).catch(() => {
      swalPopup("Something went wrong.");
    });


  }

  // Download concept phase report
  phaseReport = (ev, type = "PDF") => {
    ev.preventDefault();

    let params = {
      'programUuid': this.state.programUuid,
      'selectedInput': this.state.selectedInput ? this.state.selectedInput : [],
      'page': 'test_validation'
    };

    // Get report
    httpPost(apify(`app/programs/phase-report?programUuid=${this.state.programUuid}`), params).then(data => {
      // window.location.href = apiBaseUrl(data.path);
      if (type === 'PDF') {
        var link = document.getElementById("download");
        link.href = apiBaseUrl(data.path);
        link.setAttribute('target', "_blank");
        link.click();
      }
      else if (type === 'JSON') {
        var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data.jsonData));
        var downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "report.json");
        document.body.appendChild(downloadAnchorNode); // required for firefox
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
      }


    }).catch(() => {
      swalPopup("Something went wrong while downloading report.");
    });
  }

  checkboxChange = (ev, data) => {

    let selectedInput = this.state.selectedInput ? this.state.selectedInput : [];
    if (data === 'All') {
      var ele = document.getElementsByClassName('selectValueCheckbox');
      for (var i = 0; i < ele.length; i++) {
        if (ev.currentTarget.checked) {
          if (ele[i].type === 'checkbox' && ele[i].value !== 'All') {
            ele[i].checked = true;
            selectedInput.push(ele[i].value)
          }
        }
        else {
          ele[i].checked = false;
          // eslint-disable-next-line
          selectedInput = selectedInput.filter((input) => input !== ele[i].value)
        }
      }
    } else {

      if (ev.currentTarget.checked) {
        selectedInput.push(data)
      } else if (selectedInput.includes(data)) {
        selectedInput = selectedInput.filter((input) => input !== data)
      }
    }

    this.setState({
      selectedInput: selectedInput
    })

  }

  changeModalStatus = (ev, data) => {

    modal('#Modal-Report', {
      show: true,
    })
  }


  //
  onConfirmation = (ev) => {
    //
    ev.preventDefault();
    //
    modal('#ModalConfirmation', 'hide');

    let params = {
      programUuid: this.state.programUuid,
      cycle: 'Integration-and-Verification'
    }

    httpPost(apify('app/program/submit-cycle-status'), params).then(data => {
      let { programUuid } = this.props['match']['params'];
      let params = {
        'programUuid': programUuid,
        'state': 'UNDER_REVIEW',
      };
      httpPost(apify(`app/programs/state-change`), params).then(res => {
        let phaseRoute = programLifecycleRoute('VIEW', this.state.programUuid);
        this.props.history.push({
          pathname: phaseRoute,
        });
      })
    }).catch(() => {
      swalPopup("Something went wrong.");
    });
    //
  }

  //
  onSubmitFinalSubmit = (ev) => {
    ev.preventDefault();
    modal('#ModalConfirmation');
  }

  // Asset options
  prepareAssetOptions = (assets) => {

    var assetArray = [];
    var PreDifineValues = [];

    if (this.state.program['threats'] && this.state.program['threats']['Items']) {
      this.state.program['threats']['Items'].forEach(item => {

        if (item['Identified'] && (!this.state.componentName || PreDifineValues.includes(item['Parent-Ref-Id']))) {

          //
          var threats = [];
          Object.keys(item['Threats']).map(threat => {


            threats.push({
              value: item['Threats'][threat]['RefId'],
              label: `${item['Name']} (${threat})`,
              property: item['Threats'][threat]
            });
            return null
          })

          if (threats.length > 0) { //
            assetArray.push({
              value: item['RefId'],
              label: item['Name'],
              threats: threats,
              property: item,
            });
          }

        }
      });
    }

    return assetArray;
  }

  // Change asset option
  onChangeAssetOption = (ev) => {

    this.setState({
      property: ev['property'],
      assetSelected: ev,
    });


  }



  //
  reConfigure(designSpacification) {
    //
    var vm = this;


    //
    swalConfirmationPopup({
      title: null,
      text: "This action will reset the designSpacification data",
      confirmButtonText: "Re-configure",
    }, () => {

      let designSpacifications = this.state.designSpacifications
      let designSpacificationList = this.state.designSpacificationLists

      designSpacifications['Items'].forEach(item => {
        if (item['Uuid'] === designSpacification['Uuid']) {
          item['Cyber-Security-Validation'] = false

          designSpacificationList = this.prepareDesignSpacificationOptions(designSpacifications, this.state.program['threats'])
        }
      })


      vm.setState({
        loading: true,
        designSpacifications: designSpacifications,
        designSpacificationLists: designSpacificationList,
      }, () => {
        this.setState({
          designSpacification: {},
        }, () => {


          this.state.designSpacificationLists.map(specification => {

            if (specification['value'] === designSpacification['Uuid']) {
              this.setState({
                loading: false,
                currentDesignSpacification: specification,
                designSpacification: specification['property'],
                threat: specification['threat']
              })
            }
            return null
          })

        })
      });

    });
  }


  // On submit
  onDataChange = (event) => {

    this.setState({
      designSpacification: {
        ...this.state.designSpacification,
        'Cyber-Security-Validation-Data': {
          ...this.state.designSpacification['Cyber-Security-Validation-Data'],
          [`${event.target.name}`]: event.target.type === 'file' ? (event.target.files && event.target.files.length > 0 ? event.target.files[0] : null) : event.target.value,
        }
      },
    })


  }


  // Fetch system configuration at initial load
  fetchSysConf = (_initialConf = undefined) => {
    let initialConf = _initialConf ?? this.state['program']['system_configuration'];
    let functions = [];
    let componentArray = [];

    for (const [key, systemFunction] of Object.entries(initialConf)) {
      systemFunction['components'].forEach(componentObject => {
        componentArray.push({
          'parentKey': key,
          'label': componentObject['component_name'],
          'value': componentObject['component_uuid'],
        });

      });

    }

    this.setState({
      componentArray: componentArray,
      functions: functions,
      loading: false,
    }, () => {
      let assets = this.prepareAssetOptions(this.state['program']['assets']);
      this.setState({
        assets: assets,
      })
    });
  }

  //
  viewDesignSpecification(item, forView = true) {

    let fetched = false;

    if (!fetched) {
      let assets = this.prepareAssetOptions(this.state['program']['assets']);
      assets.map(asset => {
        if (asset['value'] === item['Asset-Uuid']['value']) {
          asset['threats'].map(threat => {
            if (threat['value'] === item['Threat-Uuid']['value']) {
              this.setState({
                propertyView: threat['property'],
              });
            }
            return null
          })

        }
        return null
      })


      this.setState({
        currentDesignSpecificationView: item,
      }, () => {
        if (forView) {
          modal('#Modal-Show-Details', {
            show: true,
          })
        } else {
          const jQuery = window.jQuery;
          jQuery(document).ready(function () {
            jQuery('[data-toggle="popover"]').popover({
              html: true,
              container: 'body',
              placement: 'left',
              trigger: 'click',
              content: jQuery('#popover-body')
            });
          });

          jQuery('body').on('click', '.close-popup', function (ev) {
            jQuery('[data-toggle="popover"]').popover('hide');
          });

        }
      })


    }
  }

   //
   popupTitleBody = () => {

    let html = <div id="modal-body">
    <h4><b>Cyber Security Validation</b></h4>
    {this.state.currentDesignSpecificationView && <table className="table table-bordered" id="modal-tuggle">
      <thead>
        <tr>
          <th>Label</th>
          <th>Value</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Asset</td>
          <td>{this.state.currentDesignSpecificationView['Asset-Uuid'] && this.state.currentDesignSpecificationView['Asset-Uuid']['label']}</td>
        </tr>
        <tr>
          <td>Threat</td>
          <td>{this.state.currentDesignSpecificationView['Threat-Uuid'] && this.state.currentDesignSpecificationView['Threat-Uuid']['label']}</td>
        </tr>
        <tr>
          <td>Name</td>
          <td>{this.state.currentDesignSpecificationView['Cybersecurity-Design-Specification-Name']} ({this.state.currentDesignSpecificationView['Uuid']})</td>
        </tr>
        <tr>
          <td>{'Methods-of-Cybersecurity-Goals-Validation'.replaceAll('-', ' ')}</td>
          <td>{this.state.currentDesignSpecificationView['Cyber-Security-Validation-Data']['Methods-of-Cybersecurity-Goals-Validation'] && this.state.currentDesignSpecificationView['Cyber-Security-Validation-Data']['Methods-of-Cybersecurity-Goals-Validation']['label']}</td>
        </tr>
        <tr>
          <td>{'Methods-of-Cybersecurity-Goals-Validation-Other'.replaceAll('-', ' ')}</td>
          <td>{this.state.currentDesignSpecificationView['Cyber-Security-Validation-Data']['Methods-of-Cybersecurity-Goals-Validation-Other']}</td>
        </tr>
        <tr>
          <td>{'Were-the-Cybersecurity-Requirement-Validated-at-Vehicle-level'.replaceAll('-', ' ')}</td>
          <td>{this.state.currentDesignSpecificationView['Cyber-Security-Validation-Data']['Were-the-Cybersecurity-Requirement-Validated-at-Vehicle-level'] ? 'True' : 'False'}</td>
        </tr>
        <tr>
          <td>{'Were-the-Cybersecurity-Requirement-Validated-at-Vehicle-level-Provide-Validation-Rationale'.replaceAll('-', ' ')}</td>
          <td>{this.state.currentDesignSpecificationView['Cyber-Security-Validation-Data']['Were-the-Cybersecurity-Requirement-Validated-at-Vehicle-level-Provide-Validation-Rationale']}</td>
        </tr>
        <tr>
          <td>{'Were-the-Cybersecurity-Goal-Validated-at-Vehicle-level'.replaceAll('-', ' ')}</td>
          <td>{this.state.currentDesignSpecificationView['Cyber-Security-Validation-Data']['Were-the-Cybersecurity-Goal-Validated-at-Vehicle-level'] ? 'True' : 'False'}</td>
        </tr>
        <tr>
          <td>{'Were-the-Cybersecurity-Goal-Validated-at-Vehicle-level-Provide-Validation-Rationale'.replaceAll('-', ' ')}</td>
          <td>{this.state.currentDesignSpecificationView['Cyber-Security-Validation-Data']['Were-the-Cybersecurity-Goal-Validated-at-Vehicle-level-Provide-Validation-Rationale']}</td>
        </tr>
        <tr>
          <td>{'Are-all-Cybersecurity-Claims-Validated'.replaceAll('-', ' ')}</td>
          <td>{this.state.currentDesignSpecificationView['Cyber-Security-Validation-Data']['Are-all-Cybersecurity-Claims-Validated'] ? 'True' : 'False'}</td>
        </tr>
        <tr>
          <td>{'Are-all-Cybersecurity-Claims-Validated-Provide-Claim-Rationale'.replaceAll('-', ' ')}</td>
          <td>{this.state.currentDesignSpecificationView['Cyber-Security-Validation-Data']['Are-all-Cybersecurity-Claims-Validated-Provide-Claim-Rationale']}</td>
        </tr>
        <tr>
          <td>{'Confirm-that-No-unreasobale-Risk-remain'.replaceAll('-', ' ')}</td>
          <td>{this.state.currentDesignSpecificationView['Cyber-Security-Validation-Data']['Confirm-that-No-unreasobale-Risk-remain'] ? 'True' : 'False'}</td>
        </tr>
        <tr>
          <td>{'Provide-Risk-Rationale'.replaceAll('-', ' ')}</td>
          <td>{this.state.currentDesignSpecificationView['Cyber-Security-Validation-Data']['Provide-Risk-Rationale']}</td>
        </tr>
        <tr>
          <td>{'Plan-for-End-of-Cybersecurity-Support'.replaceAll('-', ' ')}</td>
          <td>{this.state.currentDesignSpecificationView['Cyber-Security-Validation-Data']['Plan-for-End-of-Cybersecurity-Support'] ? 'True' : 'False'}</td>
        </tr>
        <tr>
          <td>{'Post-Development-Requirement'.replaceAll('-', ' ')}</td>
          <td>{this.state.currentDesignSpecificationView['Cyber-Security-Validation-Data']['Post-Development-Requirement']}</td>
        </tr>
      </tbody>
    </table>}
  </div>;

    return html;
  }

    //
    popupTitleHtml = (data) => {
      let html = `
        <div class="row">
          <div class="col-8">
            <h3 class="text-primary">
              ${data}
            </h3>
          </div>
          <div class="col-4 text-right">
            <span class="close-popup">Close</span>
          </div>
        </div>
      `;
      return html;
    }

  onChangeDesignSpacification = (ev) => {
    this.setState({
      currentDesignSpacification: null,
      designSpacification: {},
      threat: {}
    }, () => {
      this.setState({
        currentDesignSpacification: ev,
        designSpacification: {
          ...ev['property'],
          'Cyber-Security-Validation-Data': {
            'Test-Case-Uuid': uuidProject(this.state.program['id'], 'TCU-CSV', this.state.uuidCounters['TCU-CSV'] ? this.state.uuidCounters['TCU-CSV'] + 1 : 1),
            'Post-Development-Requirement-Uuid': uuidProject(this.state.program['id'], 'PDR-CSV', this.state.uuidCounters['PDR-CSV'] ? this.state.uuidCounters['PDR-CSV'] + 1 : 1),
          }
        },
        uuidCounters: {
          'PDR-CSV': this.state.uuidCounters['PDR-CSV'] ? this.state.uuidCounters['PDR-CSV'] + 1 : 1,
          'TCU-CSV': this.state.uuidCounters['TCU-CSV'] ? this.state.uuidCounters['TCU-CSV'] + 1 : 1
        },
        threat: ev['threat']
      }, () => {
      })
    })
  }


  // Mouted
  async componentDidMount() {
    // Page title
    setTitle("Cyber Security Validation - Product Development Phase");

    var vm = this;
    let { programUuid } = this.props['match']['params'];

    //
    this.setState({
      programUuid: programUuid
    }, () => {

      // program fetch
      httpGet(apify(`app/program/threats?programUuid=${programUuid}`)).then(res => {
        let threats = res['program']['threats'];
        let designSpacifications = res['program']['designSpacifications'];
        let vulnerabilityList = this.prepareVulnerabilityOptions(res['program']['vulnerabilities']);
        let designSpacificationList = this.prepareDesignSpacificationOptions(res['program']['designSpacifications'], threats);


        vm.setState({
          loading: false,
          program: res['program'],
          threats: threats,
          configuration: res['configuration'],
          designSpacifications: designSpacifications,
          uuidCounters: designSpacifications['uuidCounters'] ? designSpacifications['uuidCounters'] : {},
          vulnerabilitiesAll: res['program']['vulnerabilities'],
          vulnerabilityList: vulnerabilityList,
          designSpacificationLists: designSpacificationList,
          canGotoNextPhase: false,
        }, () => {
          this.fetchSysConf()
        });
      }).catch(err => {
        vm.setState({
          loading: false,
          program: null,
        }, () => {
          console.error(err);
        });
      });

    });
  }


  render() {
    return (
      <DashboardLayout>
        <div className="container-fluid">

          {
            !this.state.loading &&
            <div>
              {
                this.state.program &&
                <div className="row">
                  <div className="col-12 col-md-12">
                    {
                      (this.state.program['status'] !== 'APPROVED' && this.state.program['status'] !== 'UNDER-REVIEW') &&
                      <div className="card">

                        <div className="card-header">

                          <div className="row">
                            <div className="col-8">
                              <h3>Cyber Security Validation - Product Development Phase</h3>
                              <small>Program</small> <br />
                              <Link to={programLifecycleRoute('VIEW', this.state.program['uuid'])}>
                                {this.state.program['name']}
                              </Link>
                            </div>
                            <div className="col-4 text-right mt-3">
                              <h4 class="badge badge-primary">
                                {this.state.program['status'] === 'REJECTED' ? 'Rejected and Re-Opened ' : this.state.program['status'].replace('-', ' ')}
                              </h4>
                            </div>
                          </div>
                        </div>
                        <div className="card-body">
                          {<div className="row">
                            <div className="col-md-12">
                              <div className="form-group row">
                                <div className="col-5 text-muted">
                                  Cybersecurity Design Specification Name
                                </div>
                                <div className="col-7">
                                  <Select options={this.state.designSpacificationLists}
                                    value={this.state.currentDesignSpacification}
                                    onChange={(ev) => this.onChangeDesignSpacification(ev)} />

                                </div>
                              </div>
                            </div>
                          </div>}

                          {
                            (this.state.designSpacification !== undefined) &&
                            <div>
                              <div className="row mt-2">

                                <div className="col-md-12">
                                  <div className="form-group row pt-1">
                                    <div className="col-5 text-muted">
                                      Security Objective
                                    </div>
                                    <div className="col-7">
                                      <input type="text" name="Security-Objective" className="form-control md-form-control mt-2" defaultValue={this.state.threat['Security-Objective'] && this.state.threat['Security-Objective']['Value']}
                                        placeholder="Security Objective" readOnly />
                                    </div>
                                  </div>
                                </div>
                                <div className="col-md-12">
                                  <div className="form-group row pt-1">
                                    <div className="col-5 text-muted">
                                      New Cyber Security Requirement after Residual Risk
                                    </div>
                                    <div className="col-7">
                                      <input type="text" name="Security-Objective" className="form-control md-form-control mt-2" defaultValue={this.state.threat['Risk-Acceptance'] && this.state.threat['Risk-Acceptance']['Reduced-Risk-Cyber-Security-Requirement']}
                                        placeholder="New Cyber Security Requirement after Residual Risk" readOnly />
                                    </div>
                                  </div>
                                </div>
                                <div className="col-md-12">
                                  <div className="form-group row pt-1">
                                    <div className="col-5 text-muted">
                                      Security Controls
                                    </div>
                                    <div className="col-7">
                                      <Select
                                        options={this.state.threat['Risk-Acceptance'] && this.state.threat['Risk-Acceptance']['Security-Controls'] ? this.state.threat['Risk-Acceptance']['Security-Controls'] : []}
                                        menuPortalTarget={document.body} styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                        value={this.state.threat['Risk-Acceptance'] && this.state.threat['Risk-Acceptance']['Security-Controls'] ? this.state.threat['Risk-Acceptance']['Security-Controls'] : []}
                                        disabled={true}
                                        isMulti={true}
                                      />
                                    </div>
                                  </div>
                                </div>





                                <div className="col-md-12">
                                  <div className="form-group row pt-1">
                                    <div className="col-5 text-muted">
                                      Methods fo Cybersecurity Goals Validation
                                    </div>
                                    <div className="col-7">
                                      <Select options={this.state.goalsValidation}
                                        name="Methods-of-Cybersecurity-Goals-Validation"
                                        value={this.state.designSpacification['Cyber-Security-Validation-Data'] && this.state.designSpacification['Cyber-Security-Validation-Data']['Methods-of-Cybersecurity-Goals-Validation']}
                                        onChange={(ev) => {
                                          this.setState({
                                            designSpacification: {
                                              ...this.state.designSpacification,
                                              'Cyber-Security-Validation-Data': {
                                                ...this.state.designSpacification['Cyber-Security-Validation-Data'],
                                                "Methods-of-Cybersecurity-Goals-Validation": ev,
                                              }
                                            },
                                          })
                                        }} />
                                      <span className="text-danger text-error d-none" data-validation-key="groupName">Please select Group.</span>
                                    </div>
                                  </div>
                                </div>
                                {this.state.designSpacification['Cyber-Security-Validation-Data'] && this.state.designSpacification['Cyber-Security-Validation-Data']['Methods-of-Cybersecurity-Goals-Validation'] && this.state.designSpacification['Cyber-Security-Validation-Data']['Methods-of-Cybersecurity-Goals-Validation']['value'] === 'Others' && <div className="col-md-12">
                                  <div className="form-group row pt-1">
                                    <div className="col-5 text-muted">
                                      Methods fo Cybersecurity Goals Validation
                                    </div>
                                    <div className="col-7">
                                      <input type="text" className="form-control md-form-control mt-2"
                                        defaultValue={this.state.designSpacification['Cyber-Security-Validation-Data'] && this.state.designSpacification['Cyber-Security-Validation-Data']['Methods-of-Cybersecurity-Goals-Validation-Other']}
                                        name="Methods-of-Cybersecurity-Goals-Validation-Other"
                                        onChange={(ev) => this.onDataChange(ev)}
                                        placeholder="Methods fo Cybersecurity Goals Validation" />
                                    </div>
                                  </div>
                                </div>}

                                <div className="col-md-12">
                                  <div className="form-group row pt-1">
                                    <div className="col-5 text-muted">
                                      Were the Cybersecurity Requirement Validated at Vehicle level
                                    </div>
                                    <div className="col-4">
                                      <Select options={this.state.yesNoSelects}
                                        name="Were-the-Cybersecurity-Requirement-Validated-at-Vehicle-level"
                                        value={this.state.designSpacification['Cyber-Security-Validation-Data'] && this.state.designSpacification['Cyber-Security-Validation-Data']['Were-the-Cybersecurity-Requirement-Validated-at-Vehicle-level'] === true ? { 'label': 'Yes', value: 'Yes' } : { 'label': 'No', value: 'No' }}
                                        onChange={(ev) => {
                                          this.setState({
                                            designSpacification: {
                                              ...this.state.designSpacification,
                                              'Cyber-Security-Validation-Data': {
                                                ...this.state.designSpacification['Cyber-Security-Validation-Data'],
                                                "Were-the-Cybersecurity-Requirement-Validated-at-Vehicle-level": ev.value === 'Yes' ? true : false,
                                              }
                                            },
                                          })
                                        }} />
                                      <span className="text-danger text-error d-none" data-validation-key="groupName">Please select Group.</span>
                                    </div>
                                    {<div className="col-3">
                                      <input type="text" className="form-control md-form-control mt-2"
                                        defaultValue={this.state.designSpacification['Cyber-Security-Validation-Data'] && this.state.designSpacification['Cyber-Security-Validation-Data']['Were-the-Cybersecurity-Requirement-Validated-at-Vehicle-level-Provide-Validation-Rationale']}
                                        name="Were-the-Cybersecurity-Requirement-Validated-at-Vehicle-level-Provide-Validation-Rationale"
                                        onChange={(ev) => this.onDataChange(ev)}
                                        placeholder="Provide Validation Rationale" />
                                    </div>}
                                  </div>
                                </div>
                                <div className="col-md-12">
                                  <div className="form-group row pt-1">
                                    <div className="col-5 text-muted">
                                      Were the Cybersecurity Goal Validated at Vehicle level
                                    </div>
                                    <div className="col-4">
                                      <Select options={this.state.yesNoSelects}
                                        name="Were-the-Cybersecurity-Goal-Validated-at-Vehicle-level"
                                        value={this.state.designSpacification['Cyber-Security-Validation-Data'] && this.state.designSpacification['Cyber-Security-Validation-Data']['Were-the-Cybersecurity-Goal-Validated-at-Vehicle-level'] === true ? { 'label': 'Yes', value: 'Yes' } : { 'label': 'No', value: 'No' }}
                                        onChange={(ev) => {
                                          this.setState({
                                            designSpacification: {
                                              ...this.state.designSpacification,
                                              'Cyber-Security-Validation-Data': {
                                                ...this.state.designSpacification['Cyber-Security-Validation-Data'],
                                                "Were-the-Cybersecurity-Goal-Validated-at-Vehicle-level": ev.value === 'Yes' ? true : false,
                                              }
                                            },
                                          })
                                        }} />
                                      <span className="text-danger text-error d-none" data-validation-key="groupName">Please select Group.</span>
                                    </div>
                                    {<div className="col-3">
                                      <input type="text" className="form-control md-form-control mt-2"
                                        defaultValue={this.state.designSpacification['Cyber-Security-Validation-Data'] && this.state.designSpacification['Cyber-Security-Validation-Data']['Were-the-Cybersecurity-Goal-Validated-at-Vehicle-level-Provide-Validation-Rationale']}
                                        name="Were-the-Cybersecurity-Goal-Validated-at-Vehicle-level-Provide-Validation-Rationale"
                                        onChange={(ev) => this.onDataChange(ev)}
                                        placeholder="Provide Validation Rationale" />
                                    </div>}
                                  </div>
                                </div>
                                <div className="col-md-12">
                                  <div className="form-group row pt-1">
                                    <div className="col-5 text-muted">
                                      Are all Cybersecurity Claims Validated
                                    </div>
                                    <div className="col-4">
                                      <Select options={this.state.yesNoSelects}
                                        name="Are-all-Cybersecurity-Claims-Validated"
                                        value={this.state.designSpacification['Cyber-Security-Validation-Data'] && this.state.designSpacification['Cyber-Security-Validation-Data']['Are-all-Cybersecurity-Claims-Validated'] === true ? { 'label': 'Yes', value: 'Yes' } : { 'label': 'No', value: 'No' }}
                                        onChange={(ev) => {
                                          this.setState({
                                            designSpacification: {
                                              ...this.state.designSpacification,
                                              'Cyber-Security-Validation-Data': {
                                                ...this.state.designSpacification['Cyber-Security-Validation-Data'],
                                                "Are-all-Cybersecurity-Claims-Validated": ev.value === 'Yes' ? true : false,
                                              }
                                            },
                                          })
                                        }} />
                                      <span className="text-danger text-error d-none" data-validation-key="groupName">Please select Group.</span>
                                    </div>
                                    {<div className="col-3">
                                      <input type="text" className="form-control md-form-control mt-2"
                                        defaultValue={this.state.designSpacification['Cyber-Security-Validation-Data'] && this.state.designSpacification['Cyber-Security-Validation-Data']['Are-all-Cybersecurity-Claims-Validated-Provide-Claim-Rationale']}
                                        name="Are-all-Cybersecurity-Claims-Validated-Provide-Claim-Rationale"
                                        onChange={(ev) => this.onDataChange(ev)}
                                        placeholder="Provide Claim Rationale" />
                                    </div>}
                                  </div>
                                </div>


                                <div className="col-md-12">
                                  <div className="form-group row pt-1">
                                    <div className="col-5 text-muted">
                                      Confirm that No unreasobale Risk remain
                                    </div>
                                    <div className="col-4">
                                      <Select options={this.state.yesNoSelects}
                                        name="Confirm-that-No-unreasobale-Risk-remain"
                                        value={this.state.designSpacification['Cyber-Security-Validation-Data'] && this.state.designSpacification['Cyber-Security-Validation-Data']['Confirm-that-No-unreasobale-Risk-remain'] === true ? { 'label': 'Yes', value: 'Yes' } : { 'label': 'No', value: 'No' }}
                                        onChange={(ev) => {
                                          this.setState({
                                            designSpacification: {
                                              ...this.state.designSpacification,
                                              'Cyber-Security-Validation-Data': {
                                                ...this.state.designSpacification['Cyber-Security-Validation-Data'],
                                                "Confirm-that-No-unreasobale-Risk-remain": ev.value === 'Yes' ? true : false,
                                              }
                                            },
                                          })
                                        }} />
                                      <span className="text-danger text-error d-none" data-validation-key="groupName">Please select Group.</span>
                                    </div>
                                    {this.state.designSpacification['Cyber-Security-Validation-Data'] && this.state.designSpacification['Cyber-Security-Validation-Data']['Confirm-that-No-unreasobale-Risk-remain'] === false && <div className="col-3">
                                      <input type="text" className="form-control md-form-control mt-2"
                                        defaultValue={this.state.designSpacification['Cyber-Security-Validation-Data'] && this.state.designSpacification['Cyber-Security-Validation-Data']['Provide-Risk-Rationale']}
                                        name="Provide-Risk-Rationale"
                                        onChange={(ev) => this.onDataChange(ev)}
                                        placeholder="Provide Risk Rationale" />
                                    </div>}
                                  </div>
                                </div>
                                <div className="col-md-12">
                                  <div className="form-group row pt-1">
                                    <div className="col-5 text-muted">
                                      Plan for End of Cybersecurity Support
                                    </div>
                                    <div className="col-4">
                                      <Select options={this.state.yesNoSelects}
                                        name="Plan-for-End-of-Cybersecurity-Support"
                                        value={this.state.designSpacification['Cyber-Security-Validation-Data'] && this.state.designSpacification['Cyber-Security-Validation-Data']['Plan-for-End-of-Cybersecurity-Support'] === true ? { 'label': 'Yes', value: 'Yes' } : { 'label': 'No', value: 'No' }}
                                        onChange={(ev) => {
                                          this.setState({
                                            designSpacification: {
                                              ...this.state.designSpacification,
                                              'Cyber-Security-Validation-Data': {
                                                ...this.state.designSpacification['Cyber-Security-Validation-Data'],
                                                "Plan-for-End-of-Cybersecurity-Support": ev.value === 'Yes' ? true : false,
                                              }
                                            },
                                          })
                                        }} />
                                      <span className="text-danger text-error d-none" data-validation-key="groupName">Please select Group.</span>
                                    </div>

                                  </div>
                                </div>
                                {this.state.designSpacification['Cyber-Security-Validation-Data'] && this.state.designSpacification['Cyber-Security-Validation-Data']['Plan-for-End-of-CyberSecurity-Support'] === true && <div className='col-md-12'>
                                  <div className="form-group row pt-1">
                                    <div className="col-5 text-muted">
                                      State reasons for end of cybersecurity support
                                    </div>
                                    <div className="col-4">
                                      <input type="text" className="form-control md-form-control mt-2"
                                        defaultValue={this.state.designSpacification['Cyber-Security-Validation-Data']['Plan-for-End-of-CyberSecurity-Support-Data']}
                                        name="Plan-for-End-of-CyberSecurity-Support-Data"
                                        onChange={(ev) => this.onDataChange(ev)}
                                        placeholder="State reasons for end of cybersecurity support" />
                                    </div>
                                    <div className="col-3">
                                      <input type="file" className="form-control md-form-control mt-2"
                                        // defaultValue={this.state.designSpacification['Cyber-Security-Validation-Data']['Plan-for-End-of-CyberSecurity-Support-File']}
                                        name="Plan-for-End-of-CyberSecurity-Support-File"
                                        onChange={(ev) => this.onDataChange(ev)}
                                        placeholder="State reasons for end of cybersecurity support" />
                                    </div>
                                  </div>
                                </div>}
                                <div className='col-md-12'>
                                  <div className="form-group row pt-1">
                                    <div className="col-5 text-muted">
                                      Post Development Requirement
                                    </div>
                                    <div className="col-4">
                                      <input type="text" className="form-control md-form-control mt-2"
                                        defaultValue={this.state.designSpacification['Cyber-Security-Validation-Data'] && this.state.designSpacification['Cyber-Security-Validation-Data']['Post-Development-Requirement']}
                                        name="Post-Development-Requirement"
                                        onChange={(ev) => this.onDataChange(ev)}
                                        placeholder="Post Development Requirement" />
                                    </div>
                                    <div className="col-3">
                                      <input type="text" className="form-control md-form-control mt-2"
                                        defaultValue={this.state.designSpacification['Cyber-Security-Validation-Data'] && this.state.designSpacification['Cyber-Security-Validation-Data']['Post-Development-Requirement-Uuid']}
                                        name="Post-Development-Requirement-Uuid"
                                        placeholder="Post Development Requirement" readOnly disabled />
                                    </div>
                                  </div>
                                </div>

                              </div>
                            </div>
                          }

                        </div>
                        <div className="card-footer">
                          <button type="button" className="btn btn-success btn-lg" onClick={() => this.onSubmit()}>
                            Mark as <b>Completed</b>
                          </button>
                        </div>

                      </div>
                    }


                  </div>

                  <div className="col-12 col-md-12 mt-5">
                    <div className="card">
                      <div className="card-header">
                        {(this.state.program['status'] === 'APPROVED' || this.state.program['status'] === 'UNDER-REVIEW') &&
                          <div className="row">
                            <div className="col-8">
                              <h3>List of Cyber Security Validation</h3>
                              <small>Program</small> <br />
                              <Link to={programLifecycleRoute('VIEW', this.state.program['uuid'])}>
                                {this.state.program['name']}
                              </Link>
                            </div>
                            <div className="col-4 text-right mt-3">
                              <h4 class="badge badge-primary">
                                {this.state.program['status'] === 'REJECTED' ? 'Rejected and Re-Opened ' : this.state.program['status'].replace('-', ' ')}
                              </h4>
                            </div>
                          </div>}{(this.state.program['status'] !== 'APPROVED' && this.state.program['status'] !== 'UNDER-REVIEW') && <h3>List of Cyber Security Validation</h3>}
                      </div>
                      <div className="card-body p-0">
                        <table className="table table-bordered">
                          <thead>
                            <tr>
                              <th>Asset</th>
                              <th>Threat</th>
                              <th>Name</th>
                              <th></th>
                            </tr>
                          </thead>
                          <tbody>
                            {/* No Threats */}
                            {
                              this.state.designSpacifications && this.state.designSpacifications['Items'].length === 0
                              &&
                              <tr>
                                <td colSpan="4">
                                  No designSpacification yet.
                                </td>
                              </tr>
                            }

                            {/* designSpacifications */}
                            {
                              this.state.designSpacifications && this.state.designSpacifications['Items'].map(designSpacification => {
                                if (designSpacification['Cyber-Security-Validation']) {
                                  return (
                                    <tr key={designSpacification['RefId']}>

                                      <td>{designSpacification['Asset-Uuid'] && designSpacification['Asset-Uuid']['label']}</td>
                                      <td>{designSpacification['Threat-Uuid'] && designSpacification['Threat-Uuid']['label']}</td>
                                      <td><span data-toggle="popover" title={this.popupTitleHtml(designSpacification['Cybersecurity-Design-Specification-Name'])} data-html="true" onMouseOver={() => this.viewDesignSpecification(designSpacification, false)}>{designSpacification['Cybersecurity-Design-Specification-Name']}</span></td>
                                      <td className="text-right">
                                        {(this.state.program['status'] !== 'APPROVED' && this.state.program['status'] !== 'UNDER-REVIEW') && <a href="#!" className="identified-designSpacification-configure-button" data-ref-id={designSpacification['Uuid']} onClick={() => this.reConfigure(designSpacification)}>
                                          <i className="fa fa-gear mr-1"></i>
                                          Re-Configure
                                        </a>}
                                        <a href="#!" onClick={() => this.viewDesignSpecification(designSpacification)}>
                                          <i className="fa fa-eye ml-3"></i>
                                          View
                                        </a>
                                      </td>

                                    </tr>
                                  )
                                }

                                return null

                              })
                            }
                          </tbody>
                        </table>
                      </div>

                      <div className="card-footer">

                        <button className="btn btn-primary px-3 float-right" onClick={this.changeModalStatus} disabled={this.state.program['status'] !== 'APPROVED' && this.state.program['status'] !== 'UNDER-REVIEW'}>
                          <i className="fa fa-download mr-2"></i>
                          <b> Report</b>
                        </button>
                      </div>



                    </div>
                    {(this.state.program['status'] !== 'APPROVED' && this.state.program['status'] !== 'UNDER-REVIEW') && <div className="card mt-3">
                      <div className="card-header">
                        <h3>Are You Ready to Review The Program?</h3>
                      </div>
                      <div className="card-body">
                        <div className="col-12 has-checkbox">
                          <input type="checkbox" id="submitReview" className='mr-2' value={``} onChange={(event) => {
                            if (event.currentTarget.checked) {
                              this.setState({
                                submitReview: true
                              })
                            } else {
                              this.setState({
                                submitReview: false
                              })
                            }
                          }} />
                          <label>
                            You are about to make the final submission of the {this.state.program['phase']} phase</label>
                        </div>


                      </div>
                      <div className="card-footer">
                        <button type="button" className="btn btn-success btn-lg" disabled={!this.state.submitReview} onClick={(ev) => this.onSubmitFinalSubmit(ev)}>
                          Submit for <b>Review</b>
                        </button>
                      </div>
                    </div>}
                  </div>


                  <div className="modal fade" id="Modal-Show-Details" tabIndex="-1" data-backdrop="static">
                    <div className="modal-dialog modal-full-width">

                      <div className="modal-content">
                        <div className="modal-header">
                          <h4 className="modal-title text-primary">
                            Cyber Security Validation
                          </h4>
                          <button type="button" className="close" data-dismiss="modal">
                            <span>&times;</span>
                          </button>
                        </div>
                        <div className="modal-body widget-modal-body">
                          <h4><b>Design Specification Summary</b></h4>
                          {this.state.currentDesignSpecificationView && <table className="table table-bordered" >
                            <thead>
                              <tr>
                                <th>Label</th>
                                <th>Value</th>
                              </tr>
                            </thead>
                            <tbody>
                              {/* <tr>
                                <td>Component</td>
                                <td>{this.state.currentDesignSpecificationView['Component-Uuid'] && this.state.currentDesignSpecificationView['Component-Uuid']['label']}</td>
                              </tr> */}
                              <tr>
                                <td>Asset</td>
                                <td>{this.state.currentDesignSpecificationView['Asset-Uuid'] && this.state.currentDesignSpecificationView['Asset-Uuid']['label']}</td>
                              </tr>
                              <tr>
                                <td>Threat</td>
                                <td>{this.state.currentDesignSpecificationView['Threat-Uuid'] && this.state.currentDesignSpecificationView['Threat-Uuid']['label']}</td>
                              </tr>
                              <tr>
                                <td>Name</td>
                                <td>{this.state.currentDesignSpecificationView['Cybersecurity-Design-Specification-Name']}</td>
                              </tr>
                              <tr>
                                <td>New Cyber Security Requirement after Residual Risk</td>
                                <td>{this.state.propertyView && this.state.propertyView['Risk-Acceptance'] && this.state.propertyView['Risk-Acceptance']['Reduced-Risk-Cyber-Security-Requirement']}</td>
                              </tr>
                              <tr>
                                <td>Security Objective</td>
                                <td>{this.state.propertyView && this.state.propertyView['Security-Objective'] && this.state.propertyView['Security-Objective']['Value']}</td>
                              </tr>
                              <tr>
                                <td>Cybersecurity Requirement Linked to Component Hardware</td>
                                <td>{this.state.propertyView && this.state.propertyView['Risk-Acceptance'] && this.state.propertyView['Risk-Acceptance']['Cyber-Security-Requirements-Linked-To-Component-Hardware'] && this.state.propertyView['Risk-Acceptance']['Cyber-Security-Requirements-Linked-To-Component-Hardware']['label']}</td>
                              </tr>
                              <tr>
                                <td>Cybersecurity Requirement Linked to Component Software</td>
                                <td>{this.state.propertyView && this.state.propertyView['Risk-Acceptance'] && this.state.propertyView['Risk-Acceptance']['Cyber-Security-Requirements-Linked-To-Component-Software'] && this.state.propertyView['Risk-Acceptance']['Cyber-Security-Requirements-Linked-To-Component-Software']['label']}</td>
                              </tr>
                              <tr>
                                <td>Security Controls</td>
                                <td>{this.state.propertyView && this.state.propertyView['Risk-Acceptance'] && this.state.propertyView['Risk-Acceptance']['Security-Controls'] && this.state.propertyView['Risk-Acceptance']['Security-Controls'].map((data, i) => {
                                  return `${i !== 0 ? ', ' : ' '} ${data['label']}`
                                })}</td>
                              </tr>
                              <tr>
                                <td>Cybersecurity Specifications From Higher Level Architecture</td>
                                <td>{this.state.currentDesignSpecificationView['Cybersecurity-Specifications-From-Higher-Level-Architecture']}</td>
                              </tr>
                              <tr>
                                <td>Cybersecurity Requirements From Higher Level Architecture</td>
                                <td>{this.state.currentDesignSpecificationView['Cybersecurity-Requirements-From-Higher-Level-Architecture']}</td>
                              </tr>
                              <tr>
                                <td>{'High-Level-Cybersecurity-Requirement-Vehicle-Level'.replaceAll('-', ' ')}</td>
                                <td>{this.state.currentDesignSpecificationView['High-Level-Cybersecurity-Requirement-Vehicle-Level']}</td>
                              </tr>
                              <tr>
                                <td>{'High-Level-Cybersecurity-Goal-Vehicle-Level'.replaceAll('-', ' ')}</td>
                                <td>{this.state.currentDesignSpecificationView['High-Level-Cybersecurity-Goal-Vehicle-Level']}</td>
                              </tr>
                              <tr>
                                <td>{'Interface-Between-Components'.replaceAll('-', ' ')}</td>
                                <td>{this.state.currentDesignSpecificationView['Interface-Between-Components'] && this.state.currentDesignSpecificationView['Interface-Between-Components']['label']}</td>
                              </tr>

                              <tr>
                                <td>{'Specification-of-interfaces-between-components'.replaceAll('-', ' ')}</td>
                                <td>{this.state.currentDesignSpecificationView['Specification-of-interfaces-between-components']}</td>
                              </tr>
                              <tr>
                                <td>Select appropriate Design, modelling or programming languages</td>
                                <td>{this.state.currentDesignSpecificationView['Modelling-Languages'] && this.state.currentDesignSpecificationView['Modelling-Languages']['label']}</td>
                              </tr>
                              <tr>
                                <td>Criteria for design modeling & coding</td>
                                <td>{this.state.currentDesignSpecificationView['Criteria-For-Design-Modeling'] && this.state.currentDesignSpecificationView['Criteria-For-Design-Modeling']['label']}</td>
                              </tr>
                              <tr>
                                <td>Criteria for Programming Notations & Languages</td>
                                <td>{this.state.currentDesignSpecificationView['Criteria-For-Programming-Notations'] && this.state.currentDesignSpecificationView['Criteria-For-Programming-Notations']['label']}</td>
                              </tr>
                              <tr>
                                <td>{'CDS-Configuration'.replaceAll('-', ' ')}</td>
                                <td>{this.state.currentDesignSpecificationView['CDS-Configuration']} ({this.state.currentDesignSpecificationView['CDS-Calibration-Uuid']})</td>
                              </tr>

                              <tr>
                                <td>{'CDS-Calibration'.replaceAll('-', ' ')}</td>
                                <td>{this.state.currentDesignSpecificationView['CDS-Calibration']} ({this.state.currentDesignSpecificationView['CDS-Calibration-Uuid']})</td>
                              </tr>
                              <tr>
                                <td>{'CyberSecurity-implications-of-Post-Development-Phase'.replaceAll('-', ' ')}</td>
                                <td>{this.state.currentDesignSpecificationView['CyberSecurity-implications-of-Post-Development-Phase'] && this.state.currentDesignSpecificationView['CyberSecurity-implications-of-Post-Development-Phase']['label']}</td>
                              </tr>
                              <tr>
                                <td>{'Vulnerability-Sync'.replaceAll('-', ' ')}</td>
                                <td>{this.state.currentDesignSpecificationView['Vulnerability-Sync'] ? 'True' : 'False'}  </td>
                              </tr>
                              <tr>
                                <td>{'Vulnerability'.replaceAll('-', ' ')}</td>
                                <td>{this.state.currentDesignSpecificationView['Vulnerability'] && this.state.currentDesignSpecificationView['Vulnerability']['label']}</td>
                              </tr>
                              <tr>
                                <td>{'CyberSecurity-Design-Specification-Verification-Method'.replaceAll('-', ' ')}</td>
                                <td>{this.state.currentDesignSpecificationView['CyberSecurity-Design-Specification-Verification-Method'] && this.state.currentDesignSpecificationView['CyberSecurity-Design-Specification-Verification-Method']['label']}</td>
                              </tr>

                              <tr>
                                <td>{'Plan-for-End-of-CyberSecurity-Support'.replaceAll('-', ' ')}</td>
                                <td>{this.state.currentDesignSpecificationView['Plan-for-End-of-CyberSecurity-Support-Data']}</td>
                              </tr>
                              <tr>
                                <td>{'Post-Development-Requirement'.replaceAll('-', ' ')}</td>
                                <td>{this.state.currentDesignSpecificationView['Post-Development-Requirement']}</td>
                              </tr>
                            </tbody>
                          </table>}

                          <h4><b>Integration and Verification Summary</b></h4>
                          {this.state.currentDesignSpecificationView && this.state.currentDesignSpecificationView['Integration-Verification-Data'] && <table className="table table-bordered">
                            <thead>
                              <tr>
                                <th>Label</th>
                                <th>Value</th>
                              </tr>
                            </thead>
                            <tbody>

                              <tr>
                                <td>{'Design-Verification-Method'.replaceAll('-', ' ')}</td>
                                <td>{this.state.currentDesignSpecificationView['Integration-Verification-Data']['Design-Verification-Method'] && this.state.currentDesignSpecificationView['Integration-Verification-Data']['Design-Verification-Method']['label']}</td>
                              </tr>
                              <tr>
                                <td>{'Specify-the-Test-Environment'.replaceAll('-', ' ')}</td>
                                <td>{this.state.currentDesignSpecificationView['Integration-Verification-Data']['Specify-the-Test-Environment']}</td>
                              </tr>
                              <tr>
                                <td>{'Test-Case'.replaceAll('-', ' ')}</td>
                                <td>{this.state.currentDesignSpecificationView['Integration-Verification-Data']['Test-Case']} ({this.state.currentDesignSpecificationView['Integration-Verification-Data']['Test-Case-Uuid']})</td>
                              </tr>
                              <tr>
                                <td>{'Configuration-Intended-for-Series-Production'.replaceAll('-', ' ')}</td>
                                <td>{this.state.currentDesignSpecificationView['Integration-Verification-Data']['Configuration-Intended-for-Series-Production'] ? 'True' : 'False'}</td>
                              </tr>
                              <tr>
                                <td>{'Configuration-Intended-for-Series-Production-Value'.replaceAll('-', ' ')}</td>
                                <td>{this.state.currentDesignSpecificationView['Integration-Verification-Data']['Configuration-Intended-for-Series-Production-Value']}</td>
                              </tr>

                              <tr>
                                <td>{'Confirmity-with-Modeling-and-Coding-guidelines'.replaceAll('-', ' ')}</td>
                                <td>{this.state.currentDesignSpecificationView['Integration-Verification-Data']['Confirmity-with-Modeling-and-Coding-guidelines'] && this.state.currentDesignSpecificationView['Integration-Verification-Data']['Confirmity-with-Modeling-and-Coding-guidelines']['label']}</td>
                              </tr>
                              <tr>
                                <td>{'Any-identified-Vulnerabilities-Software'.replaceAll('-', ' ')}</td>
                                <td>{this.state.currentDesignSpecificationView['Integration-Verification-Data']['Any-identified-Vulnerabilities-Software'] ? 'True' : 'False'}</td>
                              </tr>
                              <tr>
                                <td>{'Any-identified-Vulnerabilities-Software-Vulnerability'.replaceAll('-', ' ')}</td>
                                <td>{this.state.currentDesignSpecificationView['Integration-Verification-Data']['Any-identified-Vulnerabilities-Software-Vulnerability'] && this.state.currentDesignSpecificationView['Integration-Verification-Data']['Any-identified-Vulnerabilities-Software-Vulnerability']['label']}</td>
                              </tr>
                              <tr>
                                <td>{'Test-Method-for-the-identified-Vulnerabilities-Software'.replaceAll('-', ' ')}</td>
                                <td>{this.state.currentDesignSpecificationView['Integration-Verification-Data']['Test-Method-for-the-identified-Vulnerabilities-Software'] ? 'True' : 'False'}</td>
                              </tr>
                              {this.state.currentDesignSpecificationView['Integration-Verification-Data']['Test-Method-for-the-identified-Vulnerabilities-Software'] && <tr>
                                <td>{'Test-Method-for-the-identified-Vulnerabilities-Software-Data'.replaceAll('-', ' ')}</td>
                                <td>{this.state.currentDesignSpecificationView['Integration-Verification-Data']['Test-Method-for-the-identified-Vulnerabilities-Software-Data'] && this.state.currentDesignSpecificationView['Integration-Verification-Data']['Test-Method-for-the-identified-Vulnerabilities-Software-Data']['label']}</td>
                              </tr>}
                              {!this.state.currentDesignSpecificationView['Integration-Verification-Data']['Test-Method-for-the-identified-Vulnerabilities-Software'] && <tr>
                                <td>{'Test-Method-for-the-identified-Vulnerabilities-Software-Text'.replaceAll('-', ' ')}</td>
                                <td>{this.state.currentDesignSpecificationView['Integration-Verification-Data']['Test-Method-for-the-identified-Vulnerabilities-Software-Text']}</td>
                              </tr>}
                              <tr>
                                <td>{'Any-identified-Vulnerabilities-Hardware'.replaceAll('-', ' ')}</td>
                                <td>{this.state.currentDesignSpecificationView['Integration-Verification-Data']['Any-identified-Vulnerabilities-Hardware'] ? 'True' : 'False'}</td>
                              </tr>
                              <tr>
                                <td>{'Any-identified-Vulnerabilities-Hardware-Vulnerability'.replaceAll('-', ' ')}</td>
                                <td>{this.state.currentDesignSpecificationView['Integration-Verification-Data']['Any-identified-Vulnerabilities-Hardware-Vulnerability'] && this.state.currentDesignSpecificationView['Integration-Verification-Data']['Any-identified-Vulnerabilities-Hardware-Vulnerability']['label']}</td>
                              </tr>
                              <tr>
                                <td>{'Test-Method-for-the-identified-Vulnerabilities-Hardware'.replaceAll('-', ' ')}</td>
                                <td>{this.state.currentDesignSpecificationView['Integration-Verification-Data']['Test-Method-for-the-identified-Vulnerabilities-Hardware'] ? 'True' : 'False'}</td>
                              </tr>
                              {this.state.currentDesignSpecificationView['Integration-Verification-Data']['Test-Method-for-the-identified-Vulnerabilities-Hardware'] && <tr>
                                <td>{'Test-Method-for-the-identified-Vulnerabilities-Hardware-Data'.replaceAll('-', ' ')}</td>
                                <td>{this.state.currentDesignSpecificationView['Integration-Verification-Data']['Test-Method-for-the-identified-Vulnerabilities-Hardware-Data'] && this.state.currentDesignSpecificationView['Integration-Verification-Data']['Test-Method-for-the-identified-Vulnerabilities-Hardware-Data']['label']}</td>
                              </tr>}
                              {!this.state.currentDesignSpecificationView['Integration-Verification-Data']['Test-Method-for-the-identified-Vulnerabilities-Hardware'] && <tr>
                                <td>{'Test-Method-for-the-identified-Vulnerabilities-Hardware-Text'.replaceAll('-', ' ')}</td>
                                <td>{this.state.currentDesignSpecificationView['Integration-Verification-Data']['Test-Method-for-the-identified-Vulnerabilities-Hardware-Text']}</td>
                              </tr>}
                              <tr>
                                <td>{'Any-identified-Vulnerabilities-Toolchain'.replaceAll('-', ' ')}</td>
                                <td>{this.state.currentDesignSpecificationView['Integration-Verification-Data']['Any-identified-Vulnerabilities-Toolchain'] ? 'True' : 'False'}</td>
                              </tr>
                              <tr>
                                <td>{'Any-identified-Vulnerabilities-Toolchain-Vulnerability'.replaceAll('-', ' ')}</td>
                                <td>{this.state.currentDesignSpecificationView['Integration-Verification-Data']['Any-identified-Vulnerabilities-Toolchain-Vulnerability'] && this.state.currentDesignSpecificationView['Integration-Verification-Data']['Any-identified-Vulnerabilities-Toolchain-Vulnerability']['label']}</td>
                              </tr>
                              <tr>
                                <td>{'Test-Method-for-the-identified-Vulnerabilities-Toolchain'.replaceAll('-', ' ')}</td>
                                <td>{this.state.currentDesignSpecificationView['Integration-Verification-Data']['Test-Method-for-the-identified-Vulnerabilities-Toolchain'] ? 'True' : 'False'}</td>
                              </tr>
                              {this.state.currentDesignSpecificationView['Integration-Verification-Data']['Test-Method-for-the-identified-Vulnerabilities-Toolchain'] && <tr>
                                <td>{'Test-Method-for-the-identified-Vulnerabilities-Toolchain-Data'.replaceAll('-', ' ')}</td>
                                <td>{this.state.currentDesignSpecificationView['Integration-Verification-Data']['Test-Method-for-the-identified-Vulnerabilities-Toolchain-Data'] && this.state.currentDesignSpecificationView['Integration-Verification-Data']['Test-Method-for-the-identified-Vulnerabilities-Toolchain-Data']['label']}</td>
                              </tr>}
                              {!this.state.currentDesignSpecificationView['Integration-Verification-Data']['Test-Method-for-the-identified-Vulnerabilities-Toolchain'] && <tr>
                                <td>{'Test-Method-for-the-identified-Vulnerabilities-Toolchain-Text'.replaceAll('-', ' ')}</td>
                                <td>{this.state.currentDesignSpecificationView['Integration-Verification-Data']['Test-Method-for-the-identified-Vulnerabilities-Toolchain-Text']}</td>
                              </tr>}
                              <tr>
                                <td>{'Have-all-Cybersecurity-requirements-been-verified'.replaceAll('-', ' ')}</td>
                                <td>{this.state.currentDesignSpecificationView['Integration-Verification-Data']['Have-all-Cybersecurity-requirements-been-verified'] ? 'True' : 'False'}</td>
                              </tr>
                              <tr>
                                <td>{'Have-all-Integration-and-Verification-Methods-been-assessed'.replaceAll('-', ' ')}</td>
                                <td>{this.state.currentDesignSpecificationView['Integration-Verification-Data']['Have-all-Integration-and-Verification-Methods-been-assessed'] ? 'True' : 'False'}</td>
                              </tr>
                              <tr>
                                <td>{'Have-all-Integration-and-Verification-Methods-been-assessed-Comment'.replaceAll('-', ' ')}</td>
                                <td>{this.state.currentDesignSpecificationView['Integration-Verification-Data']['Have-all-Integration-and-Verification-Methods-been-assessed-Comment']}</td>
                              </tr>
                              <tr>
                                <td>{'Does-this-requirement-fulfil-Cybersecurity-Specification'.replaceAll('-', ' ')}</td>
                                <td>{this.state.currentDesignSpecificationView['Integration-Verification-Data']['Does-this-requirement-fulfil-Cybersecurity-Specification'] ? 'True' : 'False'}</td>
                              </tr>
                              <tr>
                                <td>{'Does-this-requirement-fulfil-Cybersecurity-Specification-Rationale'.replaceAll('-', ' ')}</td>
                                <td>{this.state.currentDesignSpecificationView['Integration-Verification-Data']['Does-this-requirement-fulfil-Cybersecurity-Specification-Text'] ? 'True' : 'False'}</td>
                              </tr>
                              <tr>
                                <td>{'Plan-for-End-of-Cybersecurity-Support'.replaceAll('-', ' ')}</td>
                                <td>{this.state.currentDesignSpecificationView['Integration-Verification-Data']['Plan-for-End-of-Cybersecurity-Support'] ? 'True' : 'False'}</td>
                              </tr>
                              <tr>
                                <td>{'Post-Development-Requirement'.replaceAll('-', ' ')}</td>
                                <td>{this.state.currentDesignSpecificationView['Integration-Verification-Data']['Post-Development-Requirement']}({this.state.currentDesignSpecificationView['Integration-Verification-Data']['Post-Development-Requirement-Uuid']})</td>
                              </tr>
                            </tbody>
                          </table>}
                          
                          {this.popupTitleBody()}
                          <div class="row">
                            <div class="col-6">
                            </div>
                          </div>

                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              }
            </div>
          }
        </div>

        <div id="" hidden>
          <div id="popover-body" >
            {this.popupTitleBody()}
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
                      <p>You are about to make the final submission of the {this.state.progra && this.state.program['phase']} phase.</p>
                      <p>Please review the change before submission.</p>
                      <p>Any further changes will required you manager/team leader approval.</p>
                      <p><small>(Email notification will be sent to manager once submitted.)</small></p>
                    </div>

                  </div>
                </div>
                <div className="modal-footer">
                  <div className="row w-100">
                    <div className="col-12 text-right">
                      <button type="submit" className="btn btn-success btn-lg" >
                        Confirm &amp; <b>Proceed</b>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </form>

          </div>
        </div>

        <div className="modal fade" id="Modal-Report" tabIndex="-1" data-backdrop="static">
          <div className="modal-dialog modal-full-width">

            <div className="modal-content">
              <div className="modal-header">
                <h4 className="modal-title text-primary">
                  Test validation
                </h4>
                <button type="button" className="close" data-dismiss="modal">
                  <span>&times;</span>
                </button>
              </div>
              <div className="modal-body widget-modal-body">

                {<table className="table">
                  <tbody>
                    <tr>
                      <td><input class="mx-2 selectValueCheckbox" type="checkbox" value={'All'} onChange={e => this.checkboxChange(e, 'All')} />
                        <label class="mb-0">{'Select All'.replaceAll('-', ' ')} </label></td>
                    </tr>
                    <tr>
                      <td><input class="mx-2 selectValueCheckbox" type="checkbox" value={'Asset-Uuid'} onChange={e => this.checkboxChange(e, 'Asset-Uuid')} />
                        <label class="mb-0">{'Asset'.replaceAll('-', ' ')} </label></td>
                    </tr>
                    <tr>
                      <td><input class="mx-2 selectValueCheckbox" type="checkbox" value={'Threat-Uuid'} onChange={e => this.checkboxChange(e, 'Threat-Uuid')} />
                        <label class="mb-0">{'Threat'.replaceAll('-', ' ')} </label></td>
                    </tr>
                    <tr>
                      <td><input class="mx-2 selectValueCheckbox" type="checkbox" value={'New-Cyber-Security-Requirement-after-Residual-Risk'} onChange={e => this.checkboxChange(e, 'New-Cyber-Security-Requirement-after-Residual-Risk')} />
                        <label class="mb-0">{'New-Cyber-Security-Requirement-after-Residual-Risk'.replaceAll('-', ' ')} </label></td>
                    </tr>
                    <tr>
                      <td><input class="mx-2 selectValueCheckbox" type="checkbox" value={'Cyber-Security-Requirements-Linked-To-Component-Hardware'} onChange={e => this.checkboxChange(e, 'Cyber-Security-Requirements-Linked-To-Component-Hardware')} />
                        <label class="mb-0">{'Cyber-Security-Requirements-Linked-To-Component-Hardware'.replaceAll('-', ' ')} </label></td>
                    </tr>
                    <tr>
                      <td><input class="mx-2 selectValueCheckbox" type="checkbox" value={'Cyber-Security-Requirements-Linked-To-Component-Software'} onChange={e => this.checkboxChange(e, 'Cyber-Security-Requirements-Linked-To-Component-Software')} />
                        <label class="mb-0">{'Cyber-Security-Requirements-Linked-To-Component-Software'.replaceAll('-', ' ')} </label></td>
                    </tr>
                    <tr>
                      <td><input class="mx-2 selectValueCheckbox" type="checkbox" value={'Security-Controls'} onChange={e => this.checkboxChange(e, 'Security-Controls')} />
                        <label class="mb-0">{'Security-Controls'.replaceAll('-', ' ')} </label></td>
                    </tr>
                    <tr>
                      <td><input class="mx-2 selectValueCheckbox" type="checkbox" value={'Cybersecurity-Design-Specification-Name'} onChange={e => this.checkboxChange(e, 'Cybersecurity-Design-Specification-Name')} />
                        <label class="mb-0">{'Cybersecurity-Design-Specification-Name'.replaceAll('-', ' ')} </label></td>
                    </tr>
                    <tr>
                      <td><input class="mx-2 selectValueCheckbox" type="checkbox" value={'Methods-of-Cybersecurity-Goals-Validation'} onChange={e => this.checkboxChange(e, 'Methods-of-Cybersecurity-Goals-Validation')} />
                        <label class="mb-0">{'Methods-of-Cybersecurity-Goals-Validation'.replaceAll('-', ' ')} </label></td>
                    </tr>
                    <tr>
                      <td><input class="mx-2 selectValueCheckbox" type="checkbox" value={'Were-the-Cybersecurity-Requirement-Validated-at-Vehicle-level'} onChange={e => this.checkboxChange(e, 'Were-the-Cybersecurity-Requirement-Validated-at-Vehicle-level')} />
                        <label class="mb-0">{'Were-the-Cybersecurity-Requirement-Validated-at-Vehicle-level'.replaceAll('-', ' ')} </label></td>
                    </tr>
                    <tr>
                      <td><input class="mx-2 selectValueCheckbox" type="checkbox" value={'Were-the-Cybersecurity-Goal-Validated-at-Vehicle-level'} onChange={e => this.checkboxChange(e, 'Were-the-Cybersecurity-Goal-Validated-at-Vehicle-level')} />
                        <label class="mb-0">{'Were-the-Cybersecurity-Goal-Validated-at-Vehicle-level'.replaceAll('-', ' ')} </label></td>
                    </tr>
                    <tr>
                      <td><input class="mx-2 selectValueCheckbox" type="checkbox" value={'Are-all-Cybersecurity-Claims-Validated'} onChange={e => this.checkboxChange(e, 'Are-all-Cybersecurity-Claims-Validated')} />
                        <label class="mb-0">{'Are-all-Cybersecurity-Claims-Validated'.replaceAll('-', ' ')} </label></td>
                    </tr>
                    <tr>
                      <td><input class="mx-2 selectValueCheckbox" type="checkbox" value={'Confirm-that-No-unreasobale-Risk-remain'} onChange={e => this.checkboxChange(e, 'Confirm-that-No-unreasobale-Risk-remain')} />
                        <label class="mb-0">{'Confirm-that-No-unreasobale-Risk-remain'.replaceAll('-', ' ')} </label></td>
                    </tr>
                    <tr>
                      <td><input class="mx-2 selectValueCheckbox" type="checkbox" value={'Plan-for-End-of-Cybersecurity-Support'} onChange={e => this.checkboxChange(e, 'Plan-for-End-of-Cybersecurity-Support')} />
                        <label class="mb-0">{'Plan-for-End-of-Cybersecurity-Support'.replaceAll('-', ' ')} </label></td>
                    </tr>
                    <tr>
                      <td><input class="mx-2 selectValueCheckbox" type="checkbox" value={'Post-Development-Requirement'} onChange={e => this.checkboxChange(e, 'Post-Development-Requirement')} />
                        <label class="mb-0">{'Post-Development-Requirement'.replaceAll('-', ' ')} </label></td>
                    </tr>

                  </tbody>
                </table>}

                <div class="row">
                  <div class="col-6">
                  </div>
                </div>

              </div>
              <div className="modal-footer">
                {(!this.state.selectedInput || this.state.selectedInput.length <= 0) && <h5 class="text-danger">User has to select atleast 1 to download a report</h5>}
                {(this.state.selectedInput && this.state.selectedInput.length > 0) && <div className="dropdown">
                  <button className="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    Download  <i className="fa fa-download ml-2"></i>
                  </button>
                  <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                    <a
                      href="#!"
                      className="dropdown-item"
                      onClick={(ev) => this.phaseReport(ev)}
                    >
                      Download As PDF
                    </a>

                    <a
                      href="#!"
                      className="dropdown-item"
                      onClick={(ev) => this.phaseReport(ev, 'JSON')}
                    >
                      Download As JSON
                    </a>
                  </div>
                </div>}
              </div>
            </div>
          </div>
        </div>
        <a href="#!" download id="download"> </a>

      </DashboardLayout>
    )
  }

}

export default TestValidation


