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
import { setTitle, programLifecycleRoute, uuidV4, swalConfirmationPopup, modal, swalPopup } from "helpers/common";

// operation Monitoring & Triage
class Operation extends React.Component {

  // State
  state = {
    loading: true,
    reconfigState: false,
    reconfigureState: false,
    totalCount: 0,
    yesNoSelects: [
      { label: 'Yes', value: "Yes" },
      { label: 'No', value: "No" },
    ],
    incidentResponseCommunicationPlans: [
      { label: "Internal interested parties - marketing", value: "Internal interested parties - marketing" },
      { label: "Internal interested parties - public relations", value: "Internal interested parties - public relations" },
      { label: "Product development teams", value: "Product development teams" },
      { label: "Legal", value: "Legal" },
      { label: "Customer relations", value: "Customer relations" },
      { label: "Quality management", value: "Quality management" },
      { label: "Purchasing", value: "Purchasing" },
      { label: "Internal communication partners", value: "Internal communication partners" },
      { label: "External communication partners", value: "External communication partners" },
      { label: "Others", value: "Others" },
    ],

  };


  validate = (requiredParameters, operation) => {

    let index = 0
    let validated = false

    requiredParameters.map(parameter => {
      var referenceNode = document.getElementsByName(parameter)[0]

      if ((!operation || !operation[parameter] || operation[parameter] === '')) {
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


  // On submit
  onSubmit = async (ev) => {


    let validated = false

    let operation = this.state.operation

    let requiredParameters = ['Cybersecurity-Incident-Response-Plan-Name']


    validated = this.validate(requiredParameters, operation)


    if (operation['Procedure-for-recording-new-cybersecurity-information-File'] && typeof (operation['Procedure-for-recording-new-cybersecurity-information-File']) !== 'string') {
      await httpFile(apify('app/upload-file'), operation['Procedure-for-recording-new-cybersecurity-information-File']).then((res) => {

        if (res['success']) {
          operation['Procedure-for-recording-new-cybersecurity-information-File'] = res['url']
        }
      });
    }
    if (operation['Cybersecurity-Incident-response-Implementation-File'] && typeof (operation['Cybersecurity-Incident-response-Implementation-File']) !== 'string') {
      await httpFile(apify('app/upload-file'), operation['Cybersecurity-Incident-response-Implementation-File']).then((res) => {

        if (res['success']) {
          operation['Cybersecurity-Incident-response-Implementation-File'] = res['url']
        }
      });
    }
    if (operation['Cybersecurity-Incident-response-Plan-File'] && typeof (operation['Cybersecurity-Incident-response-Plan-File']) !== 'string') {
      await httpFile(apify('app/upload-file'), operation['Cybersecurity-Incident-response-Plan-File']).then((res) => {

        if (res['success']) {
          operation['Cybersecurity-Incident-response-Plan-File'] = res['url']
        }
      });
    }




    if (validated) {

      if (operation['Asset-Uuid']) {
        operation['Asset-Uuid'] = {
          'label': operation['Asset-Uuid']['label'],
          'value': operation['Asset-Uuid']['value'],
        }
      }
      if (operation['Threat-Uuid']) {
        operation['Threat-Uuid'] = {
          'label': operation['Threat-Uuid']['label'],
          'value': operation['Threat-Uuid']['value'],
        }
      }



      operation['Uuid'] = operation['Uuid'] ? operation['Uuid'] : uuidV4()

      var vm = this;
      httpPost(apify('app/program/operation/update'), {
        programUuid: vm.state.programUuid,
        operationData: vm.state.operation,
      }).then(res => {
        if (res['success']) {
          window.location.reload(false);
        }
      });
    }
  }

  //
  onConfirmation = (ev) => {
    //
    ev.preventDefault();
    //
    modal('#ModalConfirmation', 'hide');

    let params = {
      programUuid: this.state.programUuid,
      cycle: 'Operation-Phase'
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
    var channelArray = [];
    var PreDifineValues = [];

    let totalCount = 0;


    if (this.state.componentName && this.state.componentName['label']) {

      if (assets && assets['Components']) {
        assets['Components'].forEach(comp => {
          if (comp['Name'] === this.state.componentName['label']) {
            PreDifineValues.push(comp['RefId'])
          }
          return true
        })
      }

      if (assets && assets['Channels']) {
        assets['Channels'].forEach(channel => {
          channelArray.push({
            label: channel['Name'],
            value: channel['RefId'],
          });
          return true
        })
      }
    }

    this.setState({
      channelArray: channelArray
    })

    if (this.state.threats && this.state.threats['Items']) {
      this.state.threats['Items'].forEach(item => {

        if (item['Identified'] && (!this.state.componentName || PreDifineValues.includes(item['Parent-Ref-Id']))) {

          //
          var securityPropertyOptions = [];
          var threats = [];
          item['Cyber-Security-Properties'].forEach(securityProperty => {
            securityPropertyOptions.push({
              label: securityProperty,
              value: securityProperty,
            });
          });
          item['Cyber-Security-Properties-Options'] = securityPropertyOptions;

          Object.keys(item['Threats']).map(threat => {

            let existed = false
            if (this.state.operations && this.state.operations['Items']) {
              existed = this.state.operations['Items'].filter(designItem => designItem['Threat-Uuid']['value'] === item['Threats'][threat]['RefId'])
              existed = existed.length > 0
            }

            if (!existed) {
              threats.push({
                value: item['Threats'][threat]['RefId'],
                label: `${item['Name']} (${threat})`,
                property: item['Threats'][threat]
              });
              totalCount++;
            }
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

    this.setState({
      totalCount: totalCount
    })

    return assetArray;
  }

  // Change asset option
  onChangeAssetOption = (ev) => {

    this.setState({
      property: ev['property'],
      assetSelected: ev,
      currentDesignSpecification: null,
      threatSelected: null,
      cyberSecuritySupportDatas: [],
      postDevelopmentRequirements: [],
    });


  }

  // Download concept phase report
  phaseReport = (ev, type = "PDF") => {
    ev.preventDefault();

    let params = {
      'programUuid': this.state.programUuid,
      'selectedInput': this.state.selectedInput ? this.state.selectedInput : [],
      'page': 'operation'
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

  // Change asset option
  onChangeThreatOption = (ev, reconfig) => {

    this.setState({
      operation: this.state.reconfigureState ? this.state.operation : undefined,
      property: this.state.reconfigureState ? this.state.property : undefined,
    }, () => {

      this.setState({
        property: ev['property'],
        threatSelected: ev,
        operation: reconfig ? this.state.operation : {
          ...this.state.operation,
          "Component-Uuid": this.state.componentName,
          "Asset-Uuid": this.state.assetSelected,
          "Threat-Uuid": ev,
          "Cybersecurity-Incident-Response-Plan-Name": `${this.state.program['name']}-Incident Response Plan`,
          "Uuid": uuidV4(),
        },
      }, () => {
        let designSpecification = this.state.program['designSpacifications']
        let currentDesignSpecification = {}
        let cyberSecuritySupportDatas = []
        let postDevelopmentRequirements = []
        let postDevelopmentRequirementUuid = ''

        if (designSpecification && designSpecification['Items'].length > 0) {
          designSpecification['Items'].forEach(specification => {

            if (specification['Threat-Uuid'] && specification['Threat-Uuid']['value'] && (specification['Threat-Uuid']['value'] === ev['value'])) {
              currentDesignSpecification = specification;

              postDevelopmentRequirementUuid = currentDesignSpecification['Post-Development-Requirement-Uuid']

              if (currentDesignSpecification['Cybersecurity-Incident-response-Implementation']) {
                cyberSecuritySupportDatas.push({
                  label: currentDesignSpecification['Cybersecurity-Incident-response-Implementation-Data'],
                  value: currentDesignSpecification['Cybersecurity-Incident-response-Implementation-Data'],
                })
              }
              if (currentDesignSpecification['Integration-Verification-Data'] && currentDesignSpecification['Integration-Verification-Data']['Cybersecurity-Incident-response-Implementation']) {
                cyberSecuritySupportDatas.push({
                  label: currentDesignSpecification['Integration-Verification-Data']['Cybersecurity-Incident-response-Implementation-Data'],
                  value: currentDesignSpecification['Integration-Verification-Data']['Cybersecurity-Incident-response-Implementation-Data'],
                })
              }
              if (currentDesignSpecification['Cyber-Security-Validation-Data'] && currentDesignSpecification['Cyber-Security-Validation-Data']['Cybersecurity-Incident-response-Implementation']) {
                cyberSecuritySupportDatas.push({
                  label: currentDesignSpecification['Cyber-Security-Validation-Data']['Cybersecurity-Incident-response-Implementation-Data'],
                  value: currentDesignSpecification['Cyber-Security-Validation-Data']['Cybersecurity-Incident-response-Implementation-Data'],
                })
              }
              if (currentDesignSpecification['Post-Development-Requirement']) {
                postDevelopmentRequirements.push({
                  label: currentDesignSpecification['Post-Development-Requirement'],
                  value: currentDesignSpecification['Post-Development-Requirement'],
                })
              }
              if (currentDesignSpecification['Integration-Verification-Data'] && currentDesignSpecification['Integration-Verification-Data']['Post-Development-Requirement']) {
                postDevelopmentRequirements.push({
                  label: currentDesignSpecification['Integration-Verification-Data']['Post-Development-Requirement'],
                  value: currentDesignSpecification['Integration-Verification-Data']['Post-Development-Requirement'],
                })
              }
              if (currentDesignSpecification['Cyber-Security-Validation-Data'] && currentDesignSpecification['Cyber-Security-Validation-Data']['Post-Development-Requirement']) {
                postDevelopmentRequirements.push({
                  label: currentDesignSpecification['Cyber-Security-Validation-Data']['Post-Development-Requirement'],
                  value: currentDesignSpecification['Cyber-Security-Validation-Data']['Post-Development-Requirement'],
                })
              }
              if (currentDesignSpecification['Integration-Verification-Data']) {
                postDevelopmentRequirementUuid = `${postDevelopmentRequirementUuid}-${currentDesignSpecification['Integration-Verification-Data']['Post-Development-Requirement-Uuid']}`
              }
              if (currentDesignSpecification['Cyber-Security-Validation-Data']) {
                postDevelopmentRequirementUuid = `${postDevelopmentRequirementUuid}-${currentDesignSpecification['Cyber-Security-Validation-Data']['Post-Development-Requirement-Uuid']}`
              }

            }

          })
        }


        this.setState({
          currentDesignSpecification: currentDesignSpecification,
          cyberSecuritySupportDatas: cyberSecuritySupportDatas,
          postDevelopmentRequirements: postDevelopmentRequirements,
          operation: reconfig ? this.state.operation : {
            ...this.state.operation,
            "Post-Development-Requirement-Uuid-Compact": postDevelopmentRequirementUuid,
          }
        })
      });

    })

  }


  //
  reConfigure(operation) {
    //
    var vm = this;

    //
    swalConfirmationPopup({
      title: null,
      text: "This action will reset the operation data",
      confirmButtonText: "Re-configure",
    }, () => {

      let operations = this.state.operations

      operations['Items'] = this.state.program['operations']['Items'].filter(item => item['Uuid'] !== operation['Uuid'])

      vm.setState({
        loading: true,
        reconfigureState: true,
        operations: operations
      }, () => {
        let assets = this.prepareAssetOptions(this.state['program']['assets'])
        this.setState({
          operation: undefined,
          assets: assets
        }, () => {




          let ev = {}
          this.state.assets.map(asset => {
            if (asset['value'] === operation['Asset-Uuid']['value']) {
              ev = asset
              this.onChangeAssetOption(ev)
              asset['threats'].map(threat => {
                if (threat['value'] === operation['Threat-Uuid']['value']) {

                  this.setState({
                    loading: false,
                    property: threat['property'],
                    assetSelected: ev,
                    threatSelected: threat,
                    operation: operation,
                  }, () => {
                    this.onChangeThreatOption(threat, true)
                  });
                }
                return null
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
      operation: {
        ...this.state.operation,
        [`${event.target.name}`]: event.target.type === 'file' ? (event.target.files && event.target.files.length > 0 ? event.target.files[0] : null) : event.target.value,
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
  viewOperation(item, forView = true) {

    let fetched = false;

    if (!fetched) {

      this.setState({
        currentOperationView: item,
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

  //
  popupTitleBody = () => {

    let html = <div className="modal-body widget-modal-body" id="modal-body">
      {this.state.currentOperationView && <table className="table table-bordered" id="modal-tuggle">

        <tbody>
          {/* <tr>
          <td>Component</td>
          <td>{this.state.currentOperationView['Component-Uuid'] && this.state.currentOperationView['Component-Uuid']['label']}</td>
        </tr> */}
          <tr>
            <td>Asset</td>
            <td>{this.state.currentOperationView['Asset-Uuid'] && this.state.currentOperationView['Asset-Uuid']['label']}</td>
          </tr>
          <tr>
            <td>Threat</td>
            <td>{this.state.currentOperationView['Threat-Uuid'] && this.state.currentOperationView['Threat-Uuid']['label']}</td>
          </tr>
          <tr>
            <td>Name</td>
            <td>{this.state.currentOperationView['Cybersecurity-Incident-Response-Plan-Name']}</td>
          </tr>
          <tr>
            <td>{'Incident-Response-Communication-Plan'.replaceAll('-', ' ')}</td>
            <td>{this.state.currentOperationView['Incident-Response-Communication-Plan'] && this.state.currentOperationView['Incident-Response-Communication-Plan']['label']}</td>
          </tr>
          <tr>
            <td>{'Cybersecurity-Incident-response-Plan'.replaceAll('-', ' ')}</td>
            <td>{this.state.currentOperationView['Cybersecurity-Incident-response-Plan']}</td>
          </tr>
          <tr>
            <td>{'Assigned-Responsibility'.replaceAll('-', ' ')}</td>
            <td>{this.state.currentOperationView['Assigned-Responsibility']}</td>
          </tr>
          <tr>
            <td>{'Procedure-for-recording-new-cybersecurity-information'.replaceAll('-', ' ')}</td>
            <td>{this.state.currentOperationView['Procedure-for-recording-new-cybersecurity-information']}</td>
          </tr>
          <tr>
            <td>{'Incident-response-Progress'.replaceAll('-', ' ')}</td>
            <td>{this.state.currentOperationView['Incident-response-Progress']}</td>
          </tr>
          <tr>
            <td>{'Cybersecurity-Incident-response-Implementation'.replaceAll('-', ' ')}</td>
            <td>{this.state.currentOperationView['Cybersecurity-Incident-response-Implementation'] ? 'True' : 'False'}</td>
          </tr>

          {this.state.currentOperationView['Cybersecurity-Incident-response-Implementation'] && <tr>
            <td>{'Cybersecurity-Incident-response-Implementation-Data'.replaceAll('-', ' ')}</td>
            <td>{this.state.currentOperationView['Cybersecurity-Incident-response-Implementation-Data'] && this.state.currentOperationView['Cybersecurity-Incident-response-Implementation-Data']['label']}</td>
          </tr>}
          {!this.state.currentOperationView['Cybersecurity-Incident-response-Implementation'] && <tr>
            <td>{'Cybersecurity-Incident-response-Implementation-Text'.replaceAll('-', ' ')}</td>
            <td>{this.state.currentOperationView['Cybersecurity-Incident-response-Implementation-Text']}</td>
          </tr>}
          <tr>
            <td>{'Criteria-for-Closure-if-the-Incident-response'.replaceAll('-', ' ')}</td>
            <td>{this.state.currentOperationView['Criteria-for-Closure-if-the-Incident-response']}</td>
          </tr>
          <tr>
            <td>{'Actions-for-the-Closure'.replaceAll('-', ' ')}</td>
            <td>{this.state.currentOperationView['Actions-for-the-Closure']}</td>
          </tr>

        </tbody>
      </table>}
      <div class="row">
        <div class="col-6">
        </div>
      </div>

    </div>;

    return html;
  }

  onChangeComponent = (ev) => {
    this.setState({
      assets: [],
      componentName: ev,
      assetSelected: null
    }, () => {
      let assets = this.prepareAssetOptions(this.state['program']['assets']);
      this.setState({
        assets: assets,
      }, () => {

      })
    })
  }


  // Mouted
  async componentDidMount() {
    // Page title
    setTitle("Cybersecurity Incident Response - Post Development Phase");

    var vm = this;
    let { programUuid } = this.props['match']['params'];

    //
    this.setState({
      programUuid: programUuid
    }, () => {

      // program fetch
      httpGet(apify(`app/program/threats?programUuid=${programUuid}`)).then(res => {
        let threats = res['program']['threats'];
        let operations = res['program']['operations'];
        let vulnerabilityList = this.prepareVulnerabilityOptions(res['program']['vulnerabilities']);


        vm.setState({
          loading: false,
          program: res['program'],
          threats: threats,
          configuration: res['configuration'],
          operations: operations,
          vulnerabilitiesAll: res['program']['vulnerabilities'],
          vulnerabilityList: vulnerabilityList,
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
                              <h3>Cybersecurity Incident Response - Post Development Phase</h3>
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
                          {false && <div className="row">
                            <div className="col-md-12">
                              <div className="form-group row">
                                <div className="col-5 text-muted">
                                  Components
                                </div>
                                <div className="col-7">
                                  <Select options={this.state.componentArray}
                                    value={this.state.componentName}
                                    onChange={(ev) => this.onChangeComponent(ev)} />
                                </div>
                              </div>
                            </div>
                          </div>}

                          <div className="row">
                            <div className="col-5">
                              Assets
                            </div>
                            <div className="col-7">
                              <Select
                                options={this.state.assets}
                                onChange={(ev) => this.onChangeAssetOption(ev)}
                                menuPortalTarget={document.body} styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                value={this.state.assetSelected}
                              />
                            </div>
                          </div>

                          {this.state.assetSelected &&
                            <div className="row mt-3">
                              <div className="col-5">
                                Threats
                              </div>
                              <div className="col-7">
                                <Select
                                  options={this.state.assetSelected['threats']}
                                  onChange={(ev) => this.onChangeThreatOption(ev)}
                                  menuPortalTarget={document.body} styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                  value={this.state.threatSelected}
                                />
                              </div>
                            </div>
                          }

                          {
                            (this.state.operation !== undefined) && (this.state.currentDesignSpecification) &&
                            <div>
                              <div className="row mt-2">

                                <div className="col-md-12">
                                  <div className="form-group row pt-1">
                                    <div className="col-5 text-muted">
                                      Cybersecurity Design Specification Name
                                    </div>
                                    <div className="col-7">
                                      <input type="text" className="form-control md-form-control mt-2"
                                        defaultValue={this.state.currentDesignSpecification && this.state.currentDesignSpecification['Cybersecurity-Design-Specification-Name'] ? this.state.currentDesignSpecification['Cybersecurity-Design-Specification-Name'] : `${this.state.program['name']}-Design-Specification`}
                                        name="Cybersecurity-Design-Specification-Name"
                                        placeholder="Cybersecurity Design Specification Name" disabled readOnly />
                                    </div>
                                  </div>
                                </div>
                                <div className="col-md-12">
                                  <div className="form-group row pt-1">
                                    <div className="col-5 text-muted">
                                      Cybersecurity Incident Response Plan Name
                                    </div>
                                    <div className="col-7">
                                      <input type="text" className="form-control md-form-control mt-2"
                                        defaultValue={this.state.currentDesignSpecification && this.state.currentDesignSpecification['Cybersecurity-Incident-Response-Plan-Name'] ? this.state.currentDesignSpecification['Cybersecurity-Incident-Response-Plan-Name'] : `${this.state.program['name']}-Design-Specification`}
                                        name="Cybersecurity-Incident-Response-Plan-Name"
                                        placeholder="Cyber Security Incident Response Plan Name " disabled readOnly />
                                    </div>
                                  </div>
                                </div>
                                <div className='col-md-12'>
                                  <div className="form-group row pt-1">
                                    <div className="col-5 text-muted">
                                      Incident Response Communication Plan
                                    </div>
                                    <div className="col-7">
                                      <Select options={this.state.incidentResponseCommunicationPlans}
                                        name="Incident-Response-Communication-Plan"
                                        value={this.state.operation && this.state.operation['Incident-Response-Communication-Plan']}
                                        onChange={(ev) => {
                                          this.setState({
                                            operation: {
                                              ...this.state.operation,
                                              "Incident-Response-Communication-Plan": ev,
                                            },
                                          })
                                        }} />
                                    </div>
                                  </div>
                                </div>


                                <div className='col-md-12'>
                                  <div className="form-group row pt-1">
                                    <div className="col-5 text-muted">
                                      Cyber Security Incident response Plan
                                    </div>
                                    <div className="col-4">
                                      <input type="text" className="form-control md-form-control mt-2"
                                        defaultValue={this.state.operation['Cybersecurity-Incident-response-Plan']}
                                        name="Cybersecurity-Incident-response-Plan"
                                        onChange={(ev) => this.onDataChange(ev)}
                                        placeholder="Cyber Security Incident response Plan " />
                                    </div>
                                    <div className="col-3">
                                      <input type="file" className="form-control md-form-control mt-2"
                                        // defaultValue={this.state.operation['Cybersecurity-Incident-response-Plan-File']}
                                        name="Cybersecurity-Incident-response-Plan-File"
                                        onChange={(ev) => this.onDataChange(ev)}
                                        placeholder="Cyber Security Incident response Implementation Data" />
                                    </div>
                                  </div>
                                </div>

                                <div className='col-md-12'>
                                  <div className="form-group row pt-1">
                                    <div className="col-5 text-muted">
                                      Assigned Responsibility
                                    </div>

                                    <div className="col-7">
                                      <input type="text" className="form-control md-form-control mt-2"
                                        defaultValue={this.state.operation['Assigned-Responsibility']}
                                        name="Assigned-Responsibility"
                                        onChange={(ev) => this.onDataChange(ev)}
                                        placeholder="Assigned Responsibility" />
                                    </div>
                                  </div>
                                </div>
                                <div className='col-md-12'>
                                  <div className="form-group row pt-1">
                                    <div className="col-5 text-muted">
                                      Procedure for recording new Cyber Security information
                                    </div>
                                    <div className="col-4">
                                      <input type="text" className="form-control md-form-control mt-2"
                                        defaultValue={this.state.operation['Procedure-for-recording-new-cybersecurity-information']}
                                        name="Procedure-for-recording-new-cybersecurity-information"
                                        onChange={(ev) => this.onDataChange(ev)}
                                        placeholder="Procedure for recording new Cyber Security information" />
                                    </div>
                                    <div className="col-3">
                                      <input type="file" className="form-control md-form-control mt-2"
                                        // defaultValue={this.state.operation['Procedure-for-recording-new-cybersecurity-information-File']}
                                        name="Procedure-for-recording-new-cybersecurity-information-File"
                                        onChange={(ev) => this.onDataChange(ev)}
                                        placeholder="Cyber Security Incident response Implementation Data" />
                                    </div>
                                  </div>
                                </div>

                                <div className='col-md-12'>
                                  <div className="form-group row pt-1">
                                    <div className="col-5 text-muted">
                                      Incident response Progress
                                    </div>

                                    <div className="col-7">
                                      <input type="text" className="form-control md-form-control mt-2"
                                        defaultValue={this.state.operation['Incident-response-Progress']}
                                        name="Incident-response-Progress"
                                        onChange={(ev) => this.onDataChange(ev)}
                                        placeholder="Incident response Progress" />
                                    </div>
                                  </div>
                                </div>

                                <div className="col-md-12">
                                  <div className="form-group row pt-1">
                                    <div className="col-5 text-muted">
                                      Cyber Security Incident Response Implementation
                                    </div>
                                    <div className="col-7">
                                      <Select options={this.state.yesNoSelects}
                                        value={this.state.operation['Cybersecurity-Incident-response-Implementation'] === true ? { 'label': 'Yes', value: 'Yes' } : { 'label': 'No', value: 'No' }}
                                        name="Cybersecurity-Incident-response-Implementation"
                                        onChange={(ev) => {
                                          this.setState({
                                            operation: {
                                              ...this.state.operation,
                                              "Cybersecurity-Incident-response-Implementation": ev.value === 'Yes' ? true : false,
                                            },
                                            planforEndofCyberSecuritySupport: ev
                                          })
                                        }} />
                                      <span className="text-danger text-error d-none" data-validation-key="groupName">Please select Group.</span>
                                    </div>
                                  </div>
                                </div>
                                {this.state.operation['Cybersecurity-Incident-response-Implementation'] === true && <div className='col-md-12'>
                                  <div className="form-group row pt-1">
                                    <div className="col-5 text-muted">
                                      Cyber Security Incident response Implementation Data
                                    </div>
                                    <div className="col-4">
                                      <input type="text" className="form-control md-form-control mt-2"
                                        defaultValue={this.state.operation['Cybersecurity-Incident-response-Implementation-Data']}
                                        name="Cybersecurity-Incident-response-Implementation-Data"
                                        onChange={(ev) => this.onDataChange(ev)}
                                        placeholder="Cyber Security Incident response Implementation Data" />
                                    </div>
                                    <div className="col-3">
                                      <input type="file" className="form-control md-form-control mt-2"
                                        // defaultValue={this.state.operation['Cybersecurity-Incident-response-Implementation-File']}
                                        name="Cybersecurity-Incident-response-Implementation-File"
                                        onChange={(ev) => this.onDataChange(ev)}
                                        placeholder="Cyber Security Incident response Implementation Data" />
                                    </div>
                                  </div>
                                </div>}
                                {!this.state.operation['Cybersecurity-Incident-response-Implementation'] && <div className='col-md-12'>
                                  <div className="form-group row pt-1">
                                    <div className="col-5 text-muted">
                                      State reasons for end of Cyber Security support
                                    </div>

                                    <div className="col-7">
                                      <input type="text" className="form-control md-form-control mt-2"
                                        defaultValue={this.state.operation['Cybersecurity-Incident-response-Implementation-Text']}
                                        name="Cybersecurity-Incident-response-Implementation-Text"
                                        onChange={(ev) => this.onDataChange(ev)}
                                        placeholder="Rationale for No Incident response Implementation" />
                                    </div>
                                  </div>
                                </div>}
                                <div className='col-md-12'>
                                  <div className="form-group row pt-1">
                                    <div className="col-5 text-muted">
                                      Criteria for Closure if the Incident response
                                    </div>

                                    <div className="col-7">
                                      <input type="text" className="form-control md-form-control mt-2"
                                        defaultValue={this.state.operation['Criteria-for-Closure-if-the-Incident-response']}
                                        name="Criteria-for-Closure-if-the-Incident-response"
                                        onChange={(ev) => this.onDataChange(ev)}
                                        placeholder="Criteria for Closure if the Incident response" />
                                    </div>
                                  </div>
                                </div>
                                <div className='col-md-12'>
                                  <div className="form-group row pt-1">
                                    <div className="col-5 text-muted">
                                      Actions for the Closure
                                    </div>

                                    <div className="col-7">
                                      <input type="text" className="form-control md-form-control mt-2"
                                        defaultValue={this.state.operation['Actions-for-the-Closure']}
                                        name="Actions-for-the-Closure"
                                        onChange={(ev) => this.onDataChange(ev)}
                                        placeholder="Actions for the Closure" />
                                    </div>
                                  </div>
                                </div>

                                {/*  */}

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
                              <h3>List of Cyber Security Incident Responses</h3>
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
                          </div>}{(this.state.program['status'] !== 'APPROVED' && this.state.program['status'] !== 'UNDER-REVIEW') && <h3>List of Cyber Security Incident Responses</h3>}
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
                              this.state.operations && this.state.operations['Items'] && this.state.operations['Items'].length === 0
                              &&
                              <tr>
                                <td colSpan="4">
                                  No operation yet.
                                </td>
                              </tr>
                            }

                            {/* operations */}
                            {
                              this.state.operations && this.state.operations['Items'] && this.state.operations['Items'].map(operation => {
                                return (
                                  <tr key={operation['RefId']}>

                                    {/* <td>{operation['Component-Uuid'] && operation['Component-Uuid']['label']}</td> */}
                                    <td>{operation['Asset-Uuid'] && operation['Asset-Uuid']['label']}</td>
                                    <td>{operation['Threat-Uuid'] && operation['Threat-Uuid']['label']}</td>
                                    <td><span data-toggle="popover" title={this.popupTitleHtml(operation['Cybersecurity-Incident-Response-Plan-Name'])} data-html="true" onMouseOver={() => this.viewOperation(operation, false)}>{operation['Cybersecurity-Incident-Response-Plan-Name']}</span></td>

                                    <td className="text-right">
                                      {(this.state.program['status'] !== 'APPROVED' && this.state.program['status'] !== 'UNDER-REVIEW') && <a href="#!" className="identified-operation-configure-button" data-ref-id={operation['Uuid']} onClick={() => this.reConfigure(operation)}>
                                        <i className="fa fa-gear mr-1"></i>
                                        Re-Configure
                                      </a>}
                                      <a href="#!" onClick={() => this.viewOperation(operation)}>
                                        <i className="fa fa-eye ml-3"></i>
                                        View
                                      </a>
                                    </td>

                                  </tr>
                                )
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
                            Cyber Security Incident Response
                          </h4>
                          <button type="button" className="close" data-dismiss="modal">
                            <span>&times;</span>
                          </button>
                        </div>
                        {this.popupTitleBody()}
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
                      <p>You are about to make the final submission of the {this.state.program && this.state.program['phase']} phase.</p>
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
                  Operation
                </h4>
                <button type="button" className="close" data-dismiss="modal">
                  <span>&times;</span>
                </button>
              </div>
              <div className="modal-body widget-modal-body">

                {
                  <table className="table">
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
                        <td><input class="mx-2 selectValueCheckbox" type="checkbox" value={'Cybersecurity-Design-Specification-Name'} onChange={e => this.checkboxChange(e, 'Cybersecurity-Design-Specification-Name')} />
                          <label class="mb-0">{'Cybersecurity-Design-Specification-Name'.replaceAll('-', ' ')} </label></td>
                      </tr>
                      <tr>
                        <td><input class="mx-2 selectValueCheckbox" type="checkbox" value={'Cybersecurity-Incident-Response-Plan-Name'} onChange={e => this.checkboxChange(e, 'Cybersecurity-Incident-Response-Plan-Name')} />
                          <label class="mb-0">{'Cybersecurity-Incident-Response-Plan-Name'.replaceAll('-', ' ')} </label></td>
                      </tr>
                      <tr>
                        <td><input class="mx-2 selectValueCheckbox" type="checkbox" value={'Incident-Response-Communication-Plan'} onChange={e => this.checkboxChange(e, 'Incident-Response-Communication-Plan')} />
                          <label class="mb-0">{'Incident-Response-Communication-Plan'.replaceAll('-', ' ')} </label></td>
                      </tr>
                      <tr>
                        <td><input class="mx-2 selectValueCheckbox" type="checkbox" value={'Cybersecurity-Incident-response-Plan'} onChange={e => this.checkboxChange(e, 'Cybersecurity-Incident-response-Plan')} />
                          <label class="mb-0">{'Cybersecurity-Incident-response-Plan'.replaceAll('-', ' ')} </label></td>
                      </tr>
                      <tr>
                        <td><input class="mx-2 selectValueCheckbox" type="checkbox" value={'Assigned-Responsibility'} onChange={e => this.checkboxChange(e, 'Assigned-Responsibility')} />
                          <label class="mb-0">{'Assigned-Responsibility'.replaceAll('-', ' ')} </label></td>
                      </tr>
                      <tr>
                        <td><input class="mx-2 selectValueCheckbox" type="checkbox" value={'Procedure-for-recording-new-cybersecurity-information'} onChange={e => this.checkboxChange(e, 'Procedure-for-recording-new-cybersecurity-information')} />
                          <label class="mb-0">{'Procedure-for-recording-new-cybersecurity-information'.replaceAll('-', ' ')} </label></td>
                      </tr>
                      <tr>
                        <td><input class="mx-2 selectValueCheckbox" type="checkbox" value={'Incident-response-Progress'} onChange={e => this.checkboxChange(e, 'Incident-response-Progress')} />
                          <label class="mb-0">{'Incident-response-Progress'.replaceAll('-', ' ')} </label></td>
                      </tr>
                      <tr>
                        <td><input class="mx-2 selectValueCheckbox" type="checkbox" value={'Cybersecurity-Incident-response-Implementation'} onChange={e => this.checkboxChange(e, 'Cybersecurity-Incident-response-Implementation')} />
                          <label class="mb-0">{'Cybersecurity-Incident-response-Implementation'.replaceAll('-', ' ')} </label></td>
                      </tr>
                      <tr>
                        <td><input class="mx-2 selectValueCheckbox" type="checkbox" value={'Criteria-for-Closure-if-the-Incident-response'} onChange={e => this.checkboxChange(e, 'Criteria-for-Closure-if-the-Incident-response')} />
                          <label class="mb-0">{'Criteria-for-Closure-if-the-Incident-response'.replaceAll('-', ' ')} </label></td>
                      </tr>
                      <tr>
                        <td><input class="mx-2 selectValueCheckbox" type="checkbox" value={'Actions-for-the-Closure'} onChange={e => this.checkboxChange(e, 'Actions-for-the-Closure')} />
                          <label class="mb-0">{'Actions-for-the-Closure'.replaceAll('-', ' ')} </label></td>
                      </tr>
                    </tbody>
                  </table>
                }

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

export default Operation


