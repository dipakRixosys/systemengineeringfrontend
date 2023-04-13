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

// decomission Monitoring & Triage
class Decomission extends React.Component {

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
    internalSources: [],
    externalSources: [],
    triageTriggers: [],

  };


  validate = (requiredParameters, decomission) => {

    let index = 0
    let validated = false

    requiredParameters.map(parameter => {
      var referenceNode = document.getElementsByName(parameter)[0]

      if ((!decomission || !decomission[parameter] || decomission[parameter] === '')) {
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

  // Download concept phase report
  phaseReport = (ev, type = "PDF") => {
    ev.preventDefault();

    let params = {
      'programUuid': this.state.programUuid,
      'selectedInput': this.state.selectedInput ? this.state.selectedInput : [],
      'page': 'decomission'
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


  // On submit
  onSubmit = async (ev) => {


    let validated = false

    let decomission = this.state.decomission

    let requiredParameters = ['Cybersecurity-Decomission-Name']


    validated = this.validate(requiredParameters, decomission)


    if (decomission['Has-the-end-of-cybersecurity-support-been-communicated-File'] && typeof (decomission['Has-the-end-of-cybersecurity-support-been-communicated-File']) !== 'string') {
      await httpFile(apify('app/upload-file'), decomission['Has-the-end-of-cybersecurity-support-been-communicated-File']).then((res) => {

        if (res['success']) {
          decomission['Has-the-end-of-cybersecurity-support-been-communicated-File'] = res['url']
        }
      });
    }
    if (decomission['Plan-for-End-of-CyberSecurity-Support-File'] && typeof (decomission['Plan-for-End-of-CyberSecurity-Support-File']) !== 'string') {
      await httpFile(apify('app/upload-file'), decomission['Plan-for-End-of-CyberSecurity-Support-File']).then((res) => {

        if (res['success']) {
          decomission['Plan-for-End-of-CyberSecurity-Support-File'] = res['url']
        }
      });
    }




    if (validated) {

      if (decomission['Asset-Uuid']) {
        decomission['Asset-Uuid'] = {
          'label': decomission['Asset-Uuid']['label'],
          'value': decomission['Asset-Uuid']['value'],
        }
      }
      if (decomission['Threat-Uuid']) {
        decomission['Threat-Uuid'] = {
          'label': decomission['Threat-Uuid']['label'],
          'value': decomission['Threat-Uuid']['value'],
        }
      }



      decomission['Uuid'] = decomission['Uuid'] ? decomission['Uuid'] : uuidV4()

      var vm = this;
      httpPost(apify('app/program/decomission/update'), {
        programUuid: vm.state.programUuid,
        decomissionData: vm.state.decomission,
        uuidCounters: vm.state.uuidCounters,
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
      cycle: 'Decomission-Phase'
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
            if (this.state.decomissions && this.state.decomissions['Items']) {
              existed = this.state.decomissions['Items'].filter(designItem => designItem['Threat-Uuid']['value'] === item['Threats'][threat]['RefId'])
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

  // Change asset option
  onChangeThreatOption = (ev, reconfig) => {

    this.setState({
      decomission: this.state.reconfigureState ? this.state.decomission : undefined,
      property: this.state.reconfigureState ? this.state.property : undefined,
    }, () => {

      this.setState({
        property: ev['property'],
        threatSelected: ev,
        decomission: reconfig ? this.state.decomission : {
          ...this.state.decomission,
          "Component-Uuid": this.state.componentName,
          "Asset-Uuid": this.state.assetSelected,
          "Threat-Uuid": ev,
          "Cybersecurity-Decomission-Name": `${this.state.program['name']}-Decomissioning`,
          "Uuid": uuidV4(),
          "Post-Development-Requirement-Uuid": uuidProject(this.state.program['id'], 'PDRD', this.state.uuidCounters['PDRD'] ? this.state.uuidCounters['PDRD'] + 1 : 1),
        },
        uuidCounters: {
          'PDRD': this.state.uuidCounters['PDRD'] ? this.state.uuidCounters['PDRD'] + 1 : 1,
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

              if (currentDesignSpecification['Plan-for-End-of-Cybersecurity-Support']) {
                cyberSecuritySupportDatas.push({
                  label: currentDesignSpecification['Plan-for-End-of-CyberSecurity-Support-Data'],
                  value: currentDesignSpecification['Plan-for-End-of-CyberSecurity-Support-Data'],
                })
              }
              if (currentDesignSpecification['Integration-Verification-Data'] && currentDesignSpecification['Integration-Verification-Data']['Plan-for-End-of-Cybersecurity-Support']) {
                cyberSecuritySupportDatas.push({
                  label: currentDesignSpecification['Integration-Verification-Data']['Plan-for-End-of-CyberSecurity-Support-Data'],
                  value: currentDesignSpecification['Integration-Verification-Data']['Plan-for-End-of-CyberSecurity-Support-Data'],
                })
              }
              if (currentDesignSpecification['Cyber-Security-Validation-Data'] && currentDesignSpecification['Cyber-Security-Validation-Data']['Plan-for-End-of-Cybersecurity-Support']) {
                cyberSecuritySupportDatas.push({
                  label: currentDesignSpecification['Cyber-Security-Validation-Data']['Plan-for-End-of-CyberSecurity-Support-Data'],
                  value: currentDesignSpecification['Cyber-Security-Validation-Data']['Plan-for-End-of-CyberSecurity-Support-Data'],
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
          decomission: reconfig ? this.state.decomission : {
            ...this.state.decomission,
            "Post-Development-Requirement-Uuid-Compact": postDevelopmentRequirementUuid,
          }
        })
      });

    })

  }


  //
  reConfigure(decomission) {
    //
    var vm = this;


    //
    swalConfirmationPopup({
      title: null,
      text: "This action will reset the decommission data",
      confirmButtonText: "Re-configure",
    }, () => {

      let decomissions = this.state.decomissions

      decomissions['Items'] = this.state.program['decomissions']['Items'].filter(item => item['Uuid'] !== decomission['Uuid'])

      vm.setState({
        loading: true,
        reconfigureState: true,
        decomissions: decomissions
      }, () => {
        let assets = this.prepareAssetOptions(this.state['program']['assets'])
        this.setState({
          decomission: undefined,
          assets: assets
        }, () => {




          let ev = {}
          this.state.assets.map(asset => {
            if (asset['value'] === decomission['Asset-Uuid']['value']) {
              ev = asset
              this.onChangeAssetOption(ev)
              asset['threats'].map(threat => {
                if (threat['value'] === decomission['Threat-Uuid']['value']) {

                  this.setState({
                    loading: false,
                    property: threat['property'],
                    assetSelected: ev,
                    threatSelected: threat,
                    decomission: decomission,
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
      decomission: {
        ...this.state.decomission,
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
  viewDecomission(item, forView = true) {

    let fetched = false;

    if (!fetched) {

      this.setState({
        currentDecomissionView: item,
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
  popupTitleBody = (decomission) => {

    decomission = this.state.currentDecomissionView
    let html = <div className="modal-body widget-modal-body" id="modal-body">
      {
        decomission && <table className="table table-bordered" >
          <tbody>

            <tr>
              <td>Asset</td>
              <td>{decomission['Asset-Uuid'] && decomission['Asset-Uuid']['label']}</td>
            </tr>
            <tr>
              <td>Threat</td>
              <td>{decomission['Threat-Uuid'] && decomission['Threat-Uuid']['label']}</td>
            </tr>
            <tr>
              <td>Name</td>
              <td>{decomission['Cybersecurity-Decomission-Name']}</td>
            </tr>
            <tr>
              <td>{'Has-the-end-of-cybersecurity-support-been-communicated'.replaceAll('-', ' ')}</td>
              <td>{decomission['Has-the-end-of-cybersecurity-support-been-communicated'] ? 'True' : 'False'}</td>
            </tr>
            {decomission['Has-the-end-of-cybersecurity-support-been-communicated'] && <tr>
              <td>{'Has-the-end-of-cybersecurity-support-been-communicated-Data'.replaceAll('-', ' ')}</td>
              <td>{decomission['Has-the-end-of-cybersecurity-support-been-communicated-Data']}</td>
            </tr>}
            {!decomission['Has-the-end-of-cybersecurity-support-been-communicated'] && <tr>
              <td>{'Has-the-end-of-cybersecurity-support-been-communicated-Text'.replaceAll('-', ' ')}</td>
              <td>{decomission['Has-the-end-of-cybersecurity-support-been-communicated-Text']}</td>
            </tr>}
            <tr>
              <td>{'Plan-for-End-of-CyberSecurity-Support'.replaceAll('-', ' ')}</td>
              <td>{decomission['Plan-for-End-of-CyberSecurity-Support'] ? 'True' : 'False'}</td>
            </tr>
            {decomission['Plan-for-End-of-CyberSecurity-Support'] && <tr>
              <td>{'Plan-for-End-of-CyberSecurity-Support-Data'.replaceAll('-', ' ')}</td>
              <td>{decomission['Plan-for-End-of-CyberSecurity-Support-Data'] && decomission['Plan-for-End-of-CyberSecurity-Support-Data']['label']}</td>
            </tr>}
            {!decomission['Plan-for-End-of-CyberSecurity-Support'] && <tr>
              <td>{'Plan-for-End-of-CyberSecurity-Support-Text'.replaceAll('-', ' ')}</td>
              <td>{decomission['Plan-for-End-of-CyberSecurity-Support-Text']}</td>
            </tr>}
            {<tr>
              <td>{'Post-Development-Requirement'.replaceAll('-', ' ')}</td>
              <td>{decomission['Post-Development-Requirement'] && decomission['Post-Development-Requirement']['label']}</td>
            </tr>}
            {<tr>
              <td>{'Post-Development-Requirement-Uuid'.replaceAll('-', ' ')}</td>
              <td>{decomission['Post-Development-Requirement-Uuid']}</td>
            </tr>}

          </tbody>
        </table>
      }
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
      assetSelected: null,
      
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
    setTitle("Decommission - Post Development Phase");

    var vm = this;
    let { programUuid } = this.props['match']['params'];

    //
    this.setState({
      programUuid: programUuid
    }, () => {

      // program fetch
      httpGet(apify(`app/program/threats?programUuid=${programUuid}`)).then(res => {
        let threats = res['program']['threats'];
        let decomissions = res['program']['decomissions'];
        let vulnerabilityList = this.prepareVulnerabilityOptions(res['program']['vulnerabilities']);


        vm.setState({
          loading: false,
          program: res['program'],
          threats: threats,
          configuration: res['configuration'],
          decomissions: decomissions,
          uuidCounters: decomissions['uuidCounters'] ? decomissions['uuidCounters'] : {},
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
                              <h3>Decommission - Product Development Phase</h3>
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
                            (this.state.decomission !== undefined) && (this.state.currentDesignSpecification) &&
                            <div>
                              <div className="row mt-2">

                                <div className="col-md-12">
                                  <div className="form-group row pt-1">
                                    <div className="col-5 text-muted">
                                      Cyber Security Design Specification Name
                                    </div>
                                    <div className="col-7">
                                      <input type="text" className="form-control md-form-control mt-2"
                                        defaultValue={this.state.currentDesignSpecification && this.state.currentDesignSpecification['Cybersecurity-Design-Specification-Name'] ? this.state.currentDesignSpecification['Cybersecurity-Design-Specification-Name'] : `${this.state.program['name']}-Design-Specification`}
                                        name="Cybersecurity-Design-Specification-Name"
                                        placeholder="Cyber Security Design Specification Name" disabled readOnly />
                                    </div>
                                  </div>
                                </div>

                                <div className="col-md-12">
                                  <div className="form-group row pt-1">
                                    <div className="col-5 text-muted">
                                      Has the end of Cyber Security support been communicated
                                    </div>
                                    <div className="col-2">
                                      <Select options={this.state.yesNoSelects}
                                        name="Has-the-end-of-cybersecurity-support-been-communicated"
                                        value={this.state.decomission && this.state.decomission['Has-the-end-of-cybersecurity-support-been-communicated'] === true ? { 'label': 'Yes', value: 'Yes' } : { 'label': 'No', value: 'No' }}
                                        onChange={(ev) => {
                                          this.setState({
                                            decomission: {
                                              ...this.state.decomission,
                                              "Has-the-end-of-cybersecurity-support-been-communicated": ev.value === 'Yes' ? true : false,
                                            },
                                          })
                                        }} />
                                      <span className="text-danger text-error d-none" data-validation-key="groupName">Please select Group.</span>
                                    </div>

                                    {this.state.decomission && this.state.decomission['Has-the-end-of-cybersecurity-support-been-communicated'] && <div className="col-3">
                                      <input type="text" className="form-control md-form-control mt-2"
                                        defaultValue={this.state.decomission && this.state.decomission['Has-the-end-of-cybersecurity-support-been-communicated-Data']}
                                        name="Has-the-end-of-cybersecurity-support-been-communicated-Data"
                                        onChange={(ev) => this.onDataChange(ev)}
                                        placeholder="End of Cybersecurity" />
                                    </div>}
                                    {this.state.decomission && !this.state.decomission['Has-the-end-of-cybersecurity-support-been-communicated'] && <div className="col-5">
                                      <input type="text" className="form-control md-form-control mt-2"
                                        defaultValue={this.state.decomission && this.state.decomission['Has-the-end-of-cybersecurity-support-been-communicated-Text']}
                                        name="Has-the-end-of-cybersecurity-support-been-communicated-Text"
                                        onChange={(ev) => this.onDataChange(ev)}
                                        placeholder="Rationale for No test" />
                                    </div>}
                                    {this.state.decomission && this.state.decomission['Has-the-end-of-cybersecurity-support-been-communicated'] && <div className="col-2 text-right">
                                      <input type="file" className="form-control md-form-control mt-2"
                                        name="Has-the-end-of-cybersecurity-support-been-communicated-File"
                                        onChange={(ev) => this.onDataChange(ev)}
                                        placeholder="Rationale for No test" />
                                    </div>}
                                  </div>
                                </div>

                                <div className="col-md-12">
                                  <div className="form-group row pt-1">
                                    <div className="col-5 text-muted">
                                      Plan for End of Cyber Security Support
                                    </div>
                                    <div className="col-7">
                                      <Select options={this.state.yesNoSelects}
                                        value={this.state.decomission['Plan-for-End-of-CyberSecurity-Support'] === true ? { 'label': 'Yes', value: 'Yes' } : { 'label': 'No', value: 'No' }}
                                        name="Plan-for-End-of-CyberSecurity-Support"
                                        onChange={(ev) => {
                                          this.setState({
                                            decomission: {
                                              ...this.state.decomission,
                                              "Plan-for-End-of-CyberSecurity-Support": ev.value === 'Yes' ? true : false,

                                            },
                                            planforEndofCyberSecuritySupport: ev
                                          })
                                        }} />
                                      <span className="text-danger text-error d-none" data-validation-key="groupName">Please select Group.</span>
                                    </div>
                                  </div>
                                </div>
                                {this.state.decomission['Plan-for-End-of-CyberSecurity-Support'] === true && <div className='col-md-12'>
                                  <div className="form-group row pt-1">
                                    <div className="col-5 text-muted">
                                      Plan for End of Cyber Security Support Data
                                    </div>
                                    <div className="col-4">
                                      <Select options={this.state.cyberSecuritySupportDatas}
                                        name="Plan-for-End-of-CyberSecurity-Support-Data"
                                        value={this.state.decomission && this.state.decomission['Plan-for-End-of-CyberSecurity-Support-Data']}
                                        onChange={(ev) => {
                                          this.setState({
                                            decomission: {
                                              ...this.state.decomission,
                                              "Plan-for-End-of-CyberSecurity-Support-Data": ev,
                                            },
                                          })
                                        }} />
                                    </div>
                                    <div className="col-3">
                                      <input type="file" className="form-control md-form-control mt-2"
                                        // defaultValue={this.state.decomission['Plan-for-End-of-CyberSecurity-Support-File']}
                                        name="Plan-for-End-of-CyberSecurity-Support-File"
                                        onChange={(ev) => this.onDataChange(ev)}
                                        placeholder="Plan for End of CyberSecurity Support Data" />
                                    </div>
                                  </div>
                                </div>}
                                {!this.state.decomission['Plan-for-End-of-CyberSecurity-Support'] && <div className='col-md-12'>
                                  <div className="form-group row pt-1">
                                    <div className="col-5 text-muted">
                                      State reasons for end of Cyber Security support
                                    </div>

                                    <div className="col-7">
                                      <input type="text" className="form-control md-form-control mt-2"
                                        defaultValue={this.state.decomission['Plan-for-End-of-CyberSecurity-Support-Text']}
                                        name="Plan-for-End-of-CyberSecurity-Support-Text"
                                        onChange={(ev) => this.onDataChange(ev)}
                                        placeholder="State reasons for end of Cyber Security support" />
                                    </div>
                                  </div>
                                </div>}

                                <div className='col-md-12'>
                                  <div className="form-group row pt-1">
                                    <div className="col-5 text-muted">
                                      Post Development Requirement
                                    </div>
                                    <div className="col-4">
                                      <Select options={this.state.postDevelopmentRequirements}
                                        name="Post-Development-Requirement"
                                        value={this.state.decomission && this.state.decomission['Post-Development-Requirement']}
                                        onChange={(ev) => {
                                          this.setState({
                                            decomission: {
                                              ...this.state.decomission,
                                              "Post-Development-Requirement": ev,
                                            },
                                          })
                                        }} />
                                    </div>
                                    <div className="col-3">
                                      <input type="text" className="form-control md-form-control mt-2"
                                        defaultValue={this.state.decomission['Post-Development-Requirement-Uuid']}
                                        name="Post-Development-Requirement-Uuid"
                                        placeholder="Post Development Requirement" readOnly disabled />
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
                              <h3>List of Decommissions</h3>
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
                          </div>}{(this.state.program['status'] !== 'APPROVED' && this.state.program['status'] !== 'UNDER-REVIEW') && <h3>List of Decommissions</h3>}
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
                              this.state.decomissions && this.state.decomissions['Items'].length === 0
                              &&
                              <tr>
                                <td colSpan="4">
                                  No decommission yet.
                                </td>
                              </tr>
                            }

                            {/* decomissions */}
                            {
                              this.state.decomissions && this.state.decomissions['Items'].map(decomission => {
                                return (
                                  <tr key={decomission['RefId']}>

                                    {/* <td>{decomission['Component-Uuid'] && decomission['Component-Uuid']['label']}</td> */}
                                    <td>{decomission['Asset-Uuid'] && decomission['Asset-Uuid']['label']}</td>
                                    <td>{decomission['Threat-Uuid'] && decomission['Threat-Uuid']['label']}</td>
                                    <td><span data-toggle="popover" title={this.popupTitleHtml(decomission['Cybersecurity-Decomission-Name'])} data-html="true" onMouseOver={() => this.viewDecomission(decomission, false)}>{decomission['Cybersecurity-Decomission-Name']}</span></td>

                                    <td className="text-right">
                                      {(this.state.program['status'] !== 'APPROVED' && this.state.program['status'] !== 'UNDER-REVIEW') && <a href="#!" className="identified-decomission-configure-button" data-ref-id={decomission['Uuid']} onClick={() => this.reConfigure(decomission)}>
                                        <i className="fa fa-gear mr-1"></i>
                                        Re-Configure
                                      </a>}
                                      <a href="#!" onClick={() => this.viewDecomission(decomission)}>
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
                            Decommission
                          </h4>
                          <button type="button" className="close" data-dismiss="modal">
                            <span>&times;</span>
                          </button>
                        </div>
                        <div id="modal-tuggle"  >
                          {this.popupTitleBody(this.state.currentDecomissionView)}

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
            {this.popupTitleBody(this.state.currentDecomissionView)}
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
                  Cyber Security Incident Response
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
                      <td><input class="mx-2 selectValueCheckbox" type="checkbox" value={'Cybersecurity-Design-Specification-Name'} onChange={e => this.checkboxChange(e, 'Cybersecurity-Design-Specification-Name')} />
                        <label class="mb-0">{'Cybersecurity-Design-Specification-Name'.replaceAll('-', ' ')} </label></td>
                    </tr>
                    <tr>
                      <td><input class="mx-2 selectValueCheckbox" type="checkbox" value={'Has-the-end-of-cybersecurity-support-been-communicated'} onChange={e => this.checkboxChange(e, 'Has-the-end-of-cybersecurity-support-been-communicated')} />
                        <label class="mb-0">{'Has-the-end-of-cybersecurity-support-been-communicated'.replaceAll('-', ' ')} </label></td>
                    </tr>
                    <tr>
                      <td><input class="mx-2 selectValueCheckbox" type="checkbox" value={'Has-the-end-of-cybersecurity-support-been-communicated'} onChange={e => this.checkboxChange(e, 'Has-the-end-of-cybersecurity-support-been-communicated')} />
                        <label class="mb-0">{'Has-the-end-of-cybersecurity-support-been-communicated'.replaceAll('-', ' ')} </label></td>
                    </tr>
                    <tr>
                      <td><input class="mx-2 selectValueCheckbox" type="checkbox" value={'Plan-for-End-of-CyberSecurity-Support'} onChange={e => this.checkboxChange(e, 'Plan-for-End-of-CyberSecurity-Support')} />
                        <label class="mb-0">{'Plan-for-End-of-CyberSecurity-Support'.replaceAll('-', ' ')} </label></td>
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

export default Decomission


