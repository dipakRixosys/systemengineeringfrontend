// React
import React from 'react';
// Router
import { Link } from 'react-router-dom';
// React Select
import Select from 'react-select'
// React Select Creatable
import Creatable from 'react-select/creatable';
// Layout
import DashboardLayout from 'screens/Layouts/DashboardLayout';
// Network Helpers
import { httpGet, apify, httpPost, httpFile, apiBaseUrl } from 'helpers/network';
// Helpers
import { setTitle, programLifecycleRoute, uuidV4, swalConfirmationPopup, modal, swalPopup, uuidProject } from "helpers/common";

// designSpacification Monitoring & Triage
class DesignSpecification extends React.Component {

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

    modellingLanguages: [
      { "label": "An unambiguous and comprehensible definition in both syntax and semantics", "value": "An unambiguous and comprehensible definition in both syntax and semantics" },
      { "label": "Support for achievement of modularity, abstraction and encapsulation", "value": "Support for achievement of modularity, abstraction and encapsulation" },
      { "label": "Support for the use of structured constructs", "value": "Support for the use of structured constructs" },
      { "label": "Support for the use of secure design and implementation techniques", "value": "Support for the use of secure design and implementation techniques" },
      { "label": "Ability to integrate already existing components", "value": "Ability to integrate already existing components" },
      { "label": "Resilience of the language against vulnerabilities due to its improper use", "value": "Resilience of the language against vulnerabilities due to its improper use" },
    ],
    criteriaForDesignModeling: [
      { "label": "Use of language subsets", "values": "Use of language subsets" },
      { "label": "Enforcement of strong typing", "values": "Enforcement of strong typing" },
      { "label": "Use of defensive implementation techniques.", "values": "Use of defensive implementation techniques." },
      { "label": "Use of MISRA C:2012", "values": "Use of MISRA C:2012" },
      { "label": "CERT C ", "values": "CERT C " },
      { "label": "C", "values": "C" },
      { "label": "Others", "values": "Others" },
    ],
    criteriaForProgrammingNotations: [
      { "label": "Use of MISRA C:2012", "values": "Use of MISRA C:2012" },
      { "label": "CERT C", "values": "CERT C" },
      { "label": "C", "values": "C" },
      { "label": "Others", "values": "Others" },
    ],
    implicationsOptions: [
      { "label": "Secure Management of the Key Store", "value": "Secure Management of the Key Store" },
      { "label": "Deactivation of debug interfaces", "value": "Deactivation of debug interfaces" },
      { "label": "Deletion of PII data", "value": "Deletion of PII data" },
      { "label": "Add More Procedures (Others)", "value": "Add More Procedures (Others)" },
    ],
    verificationMethods: [
      { "label": "Review", "value": "Review" },
      { "label": "Analysis", "value": "Analysis" },
      { "label": "Simulation", "value": "Simulation" },
      { "label": "Prototyping", "value": "Prototyping" },
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


  // On submit
  onSubmit = async (ev) => {


    let validated = false

    let designSpacification = this.state.designSpacification

    let requiredParameters = ['Cybersecurity-Design-Specification-Name']


    validated = this.validate(requiredParameters, designSpacification)


    if (designSpacification['Cybersecurity-Specifications-From-Higher-Level-Architecture-File']) {
      await httpFile(apify('app/upload-file'), designSpacification['Cybersecurity-Specifications-From-Higher-Level-Architecture-File']).then((res) => {

        if (res['success']) {
          designSpacification['Cybersecurity-Specifications-From-Higher-Level-Architecture-File'] = res['url']
        }
      });
    }

    if (designSpacification['Cybersecurity-Requirements-From-Higher-Level-Architecture-File']) {
      await httpFile(apify('app/upload-file'), designSpacification['Cybersecurity-Requirements-From-Higher-Level-Architecture-File']).then((res) => {

        if (res['success']) {
          designSpacification['Cybersecurity-Requirements-From-Higher-Level-Architecture-File'] = res['url']
        }
      });
    }
    if (designSpacification['Specification-of-interfaces-between-components-File']) {
      await httpFile(apify('app/upload-file'), designSpacification['Specification-of-interfaces-between-components-File']).then((res) => {

        if (res['success']) {
          designSpacification['Specification-of-interfaces-between-components-File'] = res['url']
        }
      });
    }
    if (designSpacification['Plan-for-End-of-CyberSecurity-Support-File']) {
      await httpFile(apify('app/upload-file'), designSpacification['Plan-for-End-of-CyberSecurity-Support-File']).then((res) => {

        if (res['success']) {
          designSpacification['Plan-for-End-of-CyberSecurity-Support-File'] = res['url']
        }
      });
    }




    if (validated) {

      if (designSpacification['Component-Uuid']) {
        designSpacification['Component-Uuid'] = {
          'label': designSpacification['Component-Uuid']['label'],
          'value': designSpacification['Component-Uuid']['value'],
        }
      }
      if (designSpacification['Asset-Uuid']) {
        designSpacification['Asset-Uuid'] = {
          'label': designSpacification['Asset-Uuid']['label'],
          'value': designSpacification['Asset-Uuid']['value'],
        }
      }
      if (designSpacification['Threat-Uuid']) {
        designSpacification['Threat-Uuid'] = {
          'label': designSpacification['Threat-Uuid']['label'],
          'value': designSpacification['Threat-Uuid']['value'],
        }
      }
      if (designSpacification['Vulnerability']) {
        designSpacification['Vulnerability'] = {
          'label': designSpacification['Vulnerability']['label'],
          'value': designSpacification['Vulnerability']['value'],
        }
      }


      designSpacification['Uuid'] = designSpacification['Uuid'] ? designSpacification['Uuid'] : uuidV4()

      var vm = this;
      httpPost(apify('app/program/design-spacification/update'), {
        programUuid: vm.state.programUuid,
        designSpacification: vm.state.designSpacification,
        uuidCounters: vm.state.uuidCounters
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
      cycle: 'Design-Specification'
    }

    httpPost(apify('app/program/submit-cycle-status'), params).then(data => {
      let phaseRoute = `/dashboard/product-development-phase/integration-verification/${this.state.programUuid}`;
      this.props.history.push(phaseRoute);
    }).catch(() => {
      swalPopup("Something went wrong.");
    });


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
            if (this.state.designSpacifications && this.state.designSpacifications['Items']) {
              existed = this.state.designSpacifications['Items'].filter(designItem => (designItem['Threat-Uuid']['value'] === item['Threats'][threat]['RefId'] && designItem['Identified']))
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
    });


  }

  // Change asset option
  onChangeThreatOption = (ev) => {

    this.setState({
      designSpacification: this.state.reconfigureState ? this.state.designSpacification : undefined,
      property: this.state.reconfigureState ? this.state.property : undefined,
    }, () => {

      this.setState({
        property: ev['property'],
        threatSelected: ev,
        designSpacification: {
          ...this.state.designSpacification,
          "Component-Uuid": this.state.componentName,
          "Asset-Uuid": this.state.assetSelected,
          "Threat-Uuid": ev,
          "Cybersecurity-Design-Specification-Name": `${this.state.program['name']}-Design-Specification`,
          "Uuid": uuidV4(),
          "Post-Development-Requirement-Uuid": uuidProject(this.state.program['id'], 'PDR', this.state.uuidCounters['PDR'] ? this.state.uuidCounters['PDR'] + 1 : 1),
          "CDS-Calibration-Uuid": uuidProject(this.state.program['id'], 'CDU', this.state.uuidCounters['CDU'] ? this.state.uuidCounters['CDU'] + 1 : 1),
          "CDS-Configuration-Uuid": uuidProject(this.state.program['id'], 'CCU', this.state.uuidCounters['CCU'] ? this.state.uuidCounters['CCU'] + 1 : 1),
        },
        uuidCounters: {
          'PDR': this.state.uuidCounters['PDR'] ? this.state.uuidCounters['PDR'] + 1 : 1,
          'CDU': this.state.uuidCounters['CDU'] ? this.state.uuidCounters['CDU'] + 1 : 1,
          'CCU': this.state.uuidCounters['CCU'] ? this.state.uuidCounters['CCU'] + 1 : 1
        }
      });

    })

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

      designSpacifications['Items'] = this.state.program['designSpacifications']['Items'].filter(item => item['Uuid'] !== designSpacification['Uuid'])



      vm.setState({
        loading: true,
        reconfigureState: true,
        designSpacifications: designSpacifications
      }, () => {
        let assets = this.prepareAssetOptions(this.state['program']['assets'])
        this.setState({
          designSpacification: undefined,
          assets: assets
        }, () => {


          let ev = {}
          // if (designSpacification['Component-Uuid']) {
          //   this.state.componentArray.map(component => {
          //     if (component['value'] === designSpacification['Component-Uuid']['value']) {
          //       ev = component
          //       this.onChangeComponent(ev)
          //     }
          //     return null
          //   })
          // }


          this.state.assets.map(asset => {
            if (asset['value'] === designSpacification['Asset-Uuid']['value']) {
              ev = asset
              this.onChangeAssetOption(ev)
              asset['threats'].map(threat => {
                if (threat['value'] === designSpacification['Threat-Uuid']['value']) {
                  this.setState({
                    loading: false,
                    property: threat['property'],
                    assetSelected: ev,
                    threatSelected: threat,
                    designSpacification: designSpacification,
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
      designSpacification: {
        ...this.state.designSpacification,
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
      }, () => {
        // jQuery

      })
    });
  }

  //
  viewDesignSpecification(item, forView = true) {

    let fetched = false;


    if (!fetched && this.state.assets) {
      this.state.assets.map(asset => {
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

    let html = <div className="modal-body widget-modal-body" id="modal-body" >

      {this.state.currentDesignSpecificationView && <table className="table table-bordered" id="modal-tuggle">


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
            <td>Cyber Security Requirement Linked to Component Hardware</td>
            <td>{this.state.propertyView && this.state.propertyView['Risk-Acceptance'] && this.state.propertyView['Risk-Acceptance']['Cyber-Security-Requirements-Linked-To-Component-Hardware'] && this.state.propertyView['Risk-Acceptance']['Cyber-Security-Requirements-Linked-To-Component-Hardware']['label']}</td>
          </tr>
          <tr>
            <td>Cyber Security Requirement Linked to Component Software</td>
            <td>{this.state.propertyView && this.state.propertyView['Risk-Acceptance'] && this.state.propertyView['Risk-Acceptance']['Cyber-Security-Requirements-Linked-To-Component-Software'] && this.state.propertyView['Risk-Acceptance']['Cyber-Security-Requirements-Linked-To-Component-Software']['label']}</td>
          </tr>
          <tr>
            <td>Security Controls</td>
            <td>{this.state.propertyView && this.state.propertyView['Risk-Acceptance'] && this.state.propertyView['Risk-Acceptance']['Security-Controls'] && this.state.propertyView['Risk-Acceptance']['Security-Controls'].map((data, i) => {
              return `${i !== 0 ? ', ' : ' '} ${data['label']}`
            })}</td>
          </tr>
          <tr>
            <td>Cyber Security Specifications From Higher Level Architecture</td>
            <td>{this.state.currentDesignSpecificationView['Cybersecurity-Specifications-From-Higher-Level-Architecture']}</td>
          </tr>
          <tr>
            <td>Cyber Security Requirements From Higher Level Architecture</td>
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
            <td>Criteria for design modeling &amp; coding</td>
            <td>{this.state.currentDesignSpecificationView['Criteria-For-Design-Modeling'] && this.state.currentDesignSpecificationView['Criteria-For-Design-Modeling']['label']}</td>
          </tr>
          <tr>
            <td>Criteria for Programming Notations &amp; Languages</td>
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

  // Download concept phase report
  phaseReport = (ev, type = "PDF") => {
    ev.preventDefault();

    let params = {
      'programUuid': this.state.programUuid,
      'selectedInput': this.state.selectedInput ? this.state.selectedInput : [],
      'page': 'design_specification'
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


  // Mouted
  async componentDidMount() {
    // Page title
    setTitle("Design Specification - Product Development Phase");

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


        vm.setState({
          loading: false,
          program: res['program'],
          threats: threats,
          configuration: res['configuration'],
          designSpacifications: designSpacifications,
          uuidCounters: designSpacifications['uuidCounters'] ? designSpacifications['uuidCounters'] : {},
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
                              <h3>Design Specification - Product Development Phase</h3>
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
                                menuPortalTarget={document.body}
                                styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
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
                            (this.state.designSpacification !== undefined) && (this.state.property !== undefined) &&
                            <div>
                              <div className="row mt-2">

                                <div className="col-md-12">
                                  <div className="form-group row pt-1">
                                    <div className="col-5 text-muted">
                                      New Cyber Security Requirement after Residual Risk
                                    </div>
                                    <div className="col-7">
                                      <input type="text" name="Security-Objective" className="form-control md-form-control mt-2" defaultValue={this.state.property['Risk-Acceptance'] && this.state.property['Risk-Acceptance']['Reduced-Risk-Cyber-Security-Requirement']}
                                        placeholder="New Cyber Security Requirement after Residual Risk" readOnly />
                                    </div>
                                  </div>
                                </div>
                                <div className="col-md-12">
                                  <div className="form-group row pt-1">
                                    <div className="col-5 text-muted">
                                      Cyber Security Requirement Linked to Component Hardware
                                    </div>
                                    <div className="col-7">
                                      <input type="text" name="Security-Objective" className="form-control md-form-control mt-2" defaultValue={this.state.property['Risk-Acceptance'] && this.state.property['Risk-Acceptance']['Cyber-Security-Requirements-Linked-To-Component-Hardware'] && this.state.property['Risk-Acceptance']['Cyber-Security-Requirements-Linked-To-Component-Hardware']['value']}
                                        placeholder="New Cyber Security Requirement after Residual Risk" readOnly />
                                    </div>
                                  </div>
                                </div>
                                <div className="col-md-12">
                                  <div className="form-group row pt-1">
                                    <div className="col-5 text-muted">
                                      Cyber Security Requirement Linked to Component Software
                                    </div>
                                    <div className="col-7">
                                      <input type="text" name="Security-Objective" className="form-control md-form-control mt-2" defaultValue={this.state.property['Risk-Acceptance'] && this.state.property['Risk-Acceptance']['Cyber-Security-Requirements-Linked-To-Component-Software'] && this.state.property['Risk-Acceptance']['Cyber-Security-Requirements-Linked-To-Component-Software']['value']}
                                        placeholder="New Cyber Security Requirement after Residual Risk" readOnly />
                                    </div>
                                  </div>
                                </div>
                                <div className="col-md-12">
                                  <div className="form-group row pt-1">
                                    <div className="col-5 text-muted">
                                      Security Objective
                                    </div>
                                    <div className="col-7">
                                      <input type="text" name="Security-Objective" className="form-control md-form-control mt-2" defaultValue={this.state.property['Security-Objective'] && this.state.property['Security-Objective']['Value']}
                                        placeholder="Security Objective" readOnly />
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
                                        options={this.state.property['Risk-Acceptance'] && this.state.property['Risk-Acceptance']['Security-Controls'] ? this.state.property['Risk-Acceptance']['Security-Controls'] : []}
                                        menuPortalTarget={document.body} styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                        value={this.state.property['Risk-Acceptance'] && this.state.property['Risk-Acceptance']['Security-Controls'] ? this.state.property['Risk-Acceptance']['Security-Controls'] : []}
                                        disabled={true}
                                        isMulti={true}
                                      />
                                    </div>
                                  </div>
                                </div>
                                <div className="col-md-12">
                                  <div className="form-group row pt-1">
                                    <div className="col-5 text-muted">
                                      Cyber Security Design Specification Name
                                    </div>
                                    <div className="col-7">
                                      <input type="text" className="form-control md-form-control mt-2"
                                        defaultValue={this.state.designSpacification['Cybersecurity-Design-Specification-Name'] ? this.state.designSpacification['Cybersecurity-Design-Specification-Name'] : `${this.state.program['name']}-Design-Specification`}
                                        name="Cybersecurity-Design-Specification-Name"
                                        onChange={(ev) => this.onDataChange(ev)}
                                        placeholder="Cyber Security Design Specification Name" />
                                    </div>
                                  </div>
                                </div>
                                <div className="col-md-12">
                                  <div className="form-group row pt-1">
                                    <div className="col-5 text-muted">
                                      Cyber Security <b>Specifications</b> From Higher Level Architecture
                                    </div>
                                    <div className="col-4">
                                      <input type="text" className="form-control md-form-control mt-2"
                                        defaultValue={this.state.designSpacification['Cybersecurity-Specifications-From-Higher-Level-Architecture']}
                                        name="Cybersecurity-Specifications-From-Higher-Level-Architecture"
                                        onChange={(ev) => this.onDataChange(ev)}
                                        placeholder="Cyber Security Specifications From Higher Level Architecture" />
                                    </div>
                                    <div className="col-3">
                                      <input type="file" className="form-control md-form-control mt-2"
                                        // defaultValue={this.state.designSpacification['Cybersecurity-Specifications-From-Higher-Level-Architecture-File']}
                                        name="Cybersecurity-Specifications-From-Higher-Level-Architecture-File"
                                        onChange={(ev) => this.onDataChange(ev)}
                                        placeholder="Cyber Security Specifications From Higher Level Architecture" />
                                    </div>

                                  </div>
                                </div>
                                <div className="col-md-12">
                                  <div className="form-group row pt-1">
                                    <div className="col-5 text-muted">
                                      Cyber Security <b>Requirements</b> From Higher Level Architecture
                                    </div>
                                    <div className="col-4">
                                      <input type="text" className="form-control md-form-control mt-2"
                                        defaultValue={this.state.designSpacification['Cybersecurity-Requirements-From-Higher-Level-Architecture']}
                                        name="Cybersecurity-Requirements-From-Higher-Level-Architecture"
                                        onChange={(ev) => this.onDataChange(ev)}
                                        placeholder="Cyber Security Requirements From Higher Level Architecture" />
                                    </div>
                                    <div className="col-3">
                                      <input type="file" className="form-control md-form-control mt-2"
                                        // defaultValue={this.state.designSpacification['Cybersecurity-Requirements-From-Higher-Level-Architecture-File']}
                                        name="Cybersecurity-Requirements-From-Higher-Level-Architecture-File"
                                        onChange={(ev) => this.onDataChange(ev)}
                                        placeholder="Cyber Security Requirements From Higher Level Architecture" />
                                    </div>

                                  </div>
                                </div>
                                <div className="col-md-12">
                                  <div className="form-group row pt-1">
                                    <div className="col-5 text-muted">
                                      High Level Cyber Security Requirement (Vehicle Level)
                                    </div>
                                    <div className="col-7">
                                      <input type="text" className="form-control md-form-control mt-2"
                                        defaultValue={this.state.designSpacification['High-Level-Cybersecurity-Requirement-Vehicle-Level']}
                                        name="High-Level-Cybersecurity-Requirement-Vehicle-Level"
                                        onChange={(ev) => this.onDataChange(ev)}
                                        placeholder="High Level Cyber Security Requirement (Vehicle Level)" />
                                    </div>
                                  </div>
                                </div>
                                <div className="col-md-12">
                                  <div className="form-group row pt-1">
                                    <div className="col-5 text-muted">
                                      High Level Cyber Security Goal (Vehicle Level)
                                    </div>
                                    <div className="col-7">
                                      <input type="text" className="form-control md-form-control mt-2"
                                        defaultValue={this.state.designSpacification['High-Level-Cybersecurity-Goal-Vehicle-Level']}
                                        name="High-Level-Cybersecurity-Goal-Vehicle-Level"
                                        onChange={(ev) => this.onDataChange(ev)}
                                        placeholder="High Level Cyber Security Goal (Vehicle Level)" />
                                    </div>
                                  </div>
                                </div>
                                <div className="col-md-12">
                                  <div className="form-group row pt-1">
                                    <div className="col-5 text-muted">
                                      Interface Between Components
                                    </div>
                                    <div className="col-7">
                                      <Select options={this.state.channelArray}
                                        name="Interface-Between-Components"
                                        value={this.state.designSpacification && this.state.designSpacification['Interface-Between-Components']}
                                        onChange={(ev) => {
                                          this.setState({
                                            designSpacification: {
                                              ...this.state.designSpacification,
                                              "Interface-Between-Components": ev,
                                            },
                                            InterfaceBetweenComponents: ev
                                          })
                                        }} />
                                      <span className="text-danger text-error d-none" data-validation-key="groupName">Please select Group.</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="col-md-12">
                                  <div className="form-group row pt-1">
                                    <div className="col-5 text-muted">
                                      Specification of interfaces between components
                                    </div>
                                    <div className="col-4">
                                      <input type="text" className="form-control md-form-control mt-2"
                                        defaultValue={this.state.designSpacification['Specification-of-interfaces-between-components']}
                                        name="Specification-of-interfaces-between-components"
                                        onChange={(ev) => this.onDataChange(ev)}
                                        placeholder="Specification of interfaces between components" />
                                    </div>
                                    <div className="col-3">
                                      <input type="file" className="form-control md-form-control mt-2"
                                        // defaultValue={this.state.designSpacification['Specification-of-interfaces-between-components-File']}
                                        name="Specification-of-interfaces-between-components-File"
                                        onChange={(ev) => this.onDataChange(ev)}
                                        placeholder="Specification of interfaces between components" />
                                    </div>

                                  </div>
                                </div>
                                <div className="col-md-12">
                                  <div className="form-group row pt-1">
                                    <div className="col-5 text-muted">
                                      Select appropriate Design, modelling or programming languages
                                    </div>
                                    <div className="col-7">
                                      <Select options={this.state.modellingLanguages}
                                        name="Modelling-Languages"
                                        value={this.state.designSpacification && this.state.designSpacification['Modelling-Languages']} onChange={(ev) => {
                                          this.setState({
                                            designSpacification: {
                                              ...this.state.designSpacification,
                                              "Modelling-Languages": ev,
                                            },
                                            modellingLanguage: ev
                                          })
                                        }} />
                                      <span className="text-danger text-error d-none" data-validation-key="groupName">Please select Group.</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="col-md-12">
                                  <div className="form-group row pt-1">
                                    <div className="col-5 text-muted">
                                      Criteria for design modeling &amp; coding
                                    </div>
                                    <div className="col-7">
                                      <Select options={this.state.criteriaForDesignModeling}
                                        name="Criteria-For-Design-Modeling"
                                        value={this.state.designSpacification && this.state.designSpacification['Criteria-For-Design-Modeling']}
                                        onChange={(ev) => {
                                          this.setState({
                                            designSpacification: {
                                              ...this.state.designSpacification,
                                              "Criteria-For-Design-Modeling": ev,
                                            },
                                            criteriaDesignModeling: ev
                                          })
                                        }} />
                                      <span className="text-danger text-error d-none" data-validation-key="groupName">Please select Group.</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="col-md-12">
                                  <div className="form-group row pt-1">
                                    <div className="col-5 text-muted">
                                      Criteria for Programming Notations &amp; Languages
                                    </div>
                                    <div className="col-7">
                                      <Select options={this.state.criteriaForProgrammingNotations}
                                        name="Criteria-For-Programming-Notations"
                                        value={this.state.designSpacification && this.state.designSpacification['Criteria-For-Programming-Notations']}
                                        onChange={(ev) => {
                                          this.setState({
                                            designSpacification: {
                                              ...this.state.designSpacification,
                                              "Criteria-For-Programming-Notations": ev,
                                            },
                                            criteriaForProgrammingNotation: ev
                                          })
                                        }} />
                                      <span className="text-danger text-error d-none" data-validation-key="groupName">Please select Group.</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="col-md-12">
                                  <div className="form-group row pt-1">
                                    <div className="col-5 text-muted">
                                      Configuration parameters for this requirement
                                    </div>
                                    <div className="col-7">
                                      <Select options={this.state.yesNoSelects}
                                        value={this.state.designSpacification['Configuration-Parameters-For-This-Requirement'] === true ? { 'label': 'Yes', value: 'Yes' } : { 'label': 'No', value: 'No' }}
                                        name="Configuration-Parameters-For-This-Requirement"
                                        onChange={(ev) => {
                                          this.setState({
                                            designSpacification: {
                                              ...this.state.designSpacification,
                                              "Configuration-Parameters-For-This-Requirement": ev.value === 'Yes' ? true : false,

                                            },
                                            configurationparametersrequirement: ev
                                          })
                                        }} />
                                      <span className="text-danger text-error d-none" data-validation-key="groupName">Please select Group.</span>
                                    </div>
                                  </div>
                                </div>
                                {this.state.designSpacification['Configuration-Parameters-For-This-Requirement'] === true && <div className='col-md-12'>
                                  <div className="form-group row pt-1">
                                    <div className="col-5 text-muted">
                                      CDS Configuration
                                    </div>
                                    <div className="col-4">
                                      <input type="text" className="form-control md-form-control mt-2" defaultValue={this.state.designSpacification['CDS-Configuration']}
                                        name="CDS-Configuration"
                                        onChange={(ev) => this.onDataChange(ev)} placeholder="CDS Configuration" />
                                    </div>
                                    <div className="col-3">
                                      <input type="text" className="form-control md-form-control mt-2" defaultValue={this.state.designSpacification['CDS-Configuration-Uuid']}
                                        name="CDS-Configuration-Uuid"
                                        readOnly disabled />
                                    </div>
                                  </div>
                                </div>}
                                <div className="col-md-12">
                                  <div className="form-group row pt-1">
                                    <div className="col-5 text-muted">
                                      Calibration parameters for this requirement
                                    </div>
                                    <div className="col-7">
                                      <Select options={this.state.yesNoSelects}
                                        value={this.state.designSpacification['Calibration-Parameters-For-This-Requirement'] === true ? { 'label': 'Yes', value: 'Yes' } : { 'label': 'No', value: 'No' }}
                                        name="Calibration-Parameters-For-This-Requirement"
                                        onChange={(ev) => {
                                          this.setState({
                                            designSpacification: {
                                              ...this.state.designSpacification,
                                              "Calibration-Parameters-For-This-Requirement": ev.value === 'Yes' ? true : false,

                                            },
                                            calibrationparametersrequirement: ev
                                          })
                                        }} />
                                      <span className="text-danger text-error d-none" data-validation-key="groupName">Please select Group.</span>
                                    </div>
                                  </div>
                                </div>
                                {this.state.designSpacification['Calibration-Parameters-For-This-Requirement'] === true && <div className='col-md-12'>
                                  <div className="form-group row pt-1">
                                    <div className="col-5 text-muted">
                                      CDS Calibration
                                    </div>
                                    <div className="col-4">
                                      <input type="text" className="form-control md-form-control mt-2" defaultValue={this.state.designSpacification['CDS-Calibration']}
                                        name="CDS-Calibration"
                                        onChange={(ev) => this.onDataChange(ev)} placeholder="CDS Calibration" />
                                    </div>
                                    <div className="col-3">
                                      <input type="text" className="form-control md-form-control mt-2" defaultValue={this.state.designSpacification['CDS-Calibration-Uuid']}
                                        name="CDS-Calibration-Uuid"
                                        readOnly disabled />
                                    </div>
                                  </div>
                                </div>}
                                <div className="col-md-12">
                                  <div className="form-group row pt-1">
                                    <div className="col-5 text-muted">
                                      Cyber Security implications of Post Development Phase
                                    </div>
                                    <div className="col-7">
                                      <Creatable options={this.state.implicationsOptions}
                                        value={this.state.designSpacification['CyberSecurity-implications-of-Post-Development-Phase']}
                                        name="CyberSecurity-implications-of-Post-Development-Phase"
                                        onChange={(ev) => {
                                          this.setState({
                                            designSpacification: {
                                              ...this.state.designSpacification,
                                              "CyberSecurity-implications-of-Post-Development-Phase": ev,

                                            },
                                            implicationsOption: ev
                                          })
                                        }} />
                                      <span className="text-danger text-error d-none" data-validation-key="groupName">Please select Group.</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="col-md-12">
                                  <div className="form-group row pt-1">
                                    <div className="col-5 text-muted">
                                      Vulnerability
                                    </div>
                                    <div className="col-2">
                                      <Select options={this.state.yesNoSelects}
                                        value={this.state.designSpacification['Vulnerability-Sync'] === true ? { 'label': 'Yes', value: 'Yes' } : { 'label': 'No', value: 'No' }}
                                        name="Vulnerability-Sync"
                                        onChange={(ev) => {
                                          this.setState({
                                            designSpacification: {
                                              ...this.state.designSpacification,
                                              "Vulnerability-Sync": ev.value === 'Yes' ? true : false,

                                            },
                                            vulnerabilitySync: ev
                                          })
                                        }} />
                                      <span className="text-danger text-error d-none" data-validation-key="groupName">Please select Group.</span>
                                    </div>
                                    {this.state.designSpacification['Vulnerability-Sync'] && <div className="col-3">
                                      <Select options={this.state.vulnerabilityList}
                                        value={this.state.designSpacification['Vulnerability']}
                                        name="Vulnerability"
                                        onChange={(ev) => {
                                          this.setState({
                                            designSpacification: {
                                              ...this.state.designSpacification,
                                              "Vulnerability": ev,

                                            },
                                            vulnerability: ev
                                          })
                                        }} />
                                      <span className="text-danger text-error d-none" data-validation-key="groupName">Please select Group.</span>
                                    </div>}
                                    {this.state.designSpacification['Vulnerability-Sync'] && <div className="col-2 text-right">
                                      <a target="_blank" rel="noreferrer" href={`/dashboard/cybersecurity/vulnerability-monitoring-and-triage/${this.state.program['uuid']}`}>Link to Vulnerability Monit.</a>
                                    </div>}
                                  </div>
                                </div>
                                <div className="col-md-12">
                                  <div className="form-group row pt-1">
                                    <div className="col-5 text-muted">
                                      Cyber Security Design Specification Verification Method
                                    </div>
                                    <div className="col-7">
                                      <Creatable options={this.state.verificationMethods}
                                        value={this.state.designSpacification['CyberSecurity-Design-Specification-Verification-Method']}
                                        name="CyberSecurity-Design-Specification-Verification-Method"
                                        onChange={(ev) => {
                                          this.setState({
                                            designSpacification: {
                                              ...this.state.designSpacification,
                                              "CyberSecurity-Design-Specification-Verification-Method": ev,

                                            },
                                            verificationMethod: ev
                                          })
                                        }} />
                                      <span className="text-danger text-error d-none" data-validation-key="groupName">Please select Group.</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="col-md-12">
                                  <div className="form-group row pt-1">
                                    <div className="col-5 text-muted">
                                      Plan for End of Cyber Security Support
                                    </div>
                                    <div className="col-7">
                                      <Select options={this.state.yesNoSelects}
                                        value={this.state.designSpacification['Plan-for-End-of-CyberSecurity-Support'] === true ? { 'label': 'Yes', value: 'Yes' } : { 'label': 'No', value: 'No' }}
                                        name="Plan-for-End-of-CyberSecurity-Support"
                                        onChange={(ev) => {
                                          this.setState({
                                            designSpacification: {
                                              ...this.state.designSpacification,
                                              "Plan-for-End-of-CyberSecurity-Support": ev.value === 'Yes' ? true : false,

                                            },
                                            planforEndofCyberSecuritySupport: ev
                                          })
                                        }} />
                                      <span className="text-danger text-error d-none" data-validation-key="groupName">Please select Group.</span>
                                    </div>
                                  </div>
                                </div>
                                {this.state.designSpacification['Plan-for-End-of-CyberSecurity-Support'] === true && <div className='col-md-12'>
                                  <div className="form-group row pt-1">
                                    <div className="col-5 text-muted">
                                      Plan for End of Cyber Security Support Data
                                    </div>
                                    <div className="col-4">
                                      <input type="text" className="form-control md-form-control mt-2"
                                        defaultValue={this.state.designSpacification['Plan-for-End-of-CyberSecurity-Support-Data']}
                                        name="Plan-for-End-of-CyberSecurity-Support-Data"
                                        onChange={(ev) => this.onDataChange(ev)}
                                        placeholder="Plan for End of Cyber Security Support Data" />
                                    </div>
                                    <div className="col-3">
                                      <input type="file" className="form-control md-form-control mt-2"
                                        // defaultValue={this.state.designSpacification['Plan-for-End-of-CyberSecurity-Support-File']}
                                        name="Plan-for-End-of-CyberSecurity-Support-File"
                                        onChange={(ev) => this.onDataChange(ev)}
                                        placeholder="Plan for End of Cyber Security Support Data" />
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
                                        defaultValue={this.state.designSpacification['Post-Development-Requirement']}
                                        name="Post-Development-Requirement"
                                        onChange={(ev) => this.onDataChange(ev)}
                                        placeholder="Post Development Requirement" />
                                    </div>
                                    <div className="col-3">
                                      <input type="text" className="form-control md-form-control mt-2"
                                        defaultValue={this.state.designSpacification['Post-Development-Requirement-Uuid']}
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
                              <h3>List of Design Spacifications</h3>
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
                          </div>}{(this.state.program['status'] !== 'APPROVED' && this.state.program['status'] !== 'UNDER-REVIEW') && <h3>List of Design Spacifications</h3>
                        }
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
                                return (
                                  <tr key={designSpacification['RefId']}>

                                    {/* <td>{designSpacification['Component-Uuid'] && designSpacification['Component-Uuid']['label']}</td> */}
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
                              })
                            }
                          </tbody>

                        </table>
                      </div>

                      <div className="card-footer">

                        {false && <div className="has-checkbox mb-3">
                          <input type="checkbox" className="mr-2" onChange={(event) => {
                            this.setState({
                              saveAndContinue: event.currentTarget.checked
                            })
                          }} />
                          <label>You are about to make the final submission for the vulnerabilities.</label>
                        </div>}

                        <Link to={programLifecycleRoute('Requirements-Summary', this.state.program['uuid'])} className="btn btn-success text-white">
                          Back to <b>Requirements Summary</b>
                        </Link>

                        <button className="btn btn-success ml-3" onClick={() => this.saveAndContinue()}>
                          Continue
                          <i className="fa fa-chevron-right ml-2"></i>
                        </button>
                        <button className="btn btn-primary px-3 float-right" onClick={this.changeModalStatus} disabled={this.state.program['status'] !== 'APPROVED' && this.state.program['status'] !== 'UNDER-REVIEW'}>
                          <i className="fa fa-download mr-2"></i>
                          <b> Report</b>
                        </button>
                      </div>

                    </div>
                  </div>

                  <div className="modal fade" id="Modal-Show-Details" tabIndex="-1" data-backdrop="static">
                    <div className="modal-dialog modal-full-width">

                      <div className="modal-content">
                        <div className="modal-header">
                          <h4 className="modal-title text-primary">
                            Design Specification
                          </h4>
                          <button type="button" className="close" data-dismiss="modal">
                            <span>&times;</span>
                          </button>
                        </div>


                        {this.popupTitleBody()}
                      </div>
                    </div>
                  </div>

                  <div id="" hidden>
                    <div id="popover-body" >
                      {this.popupTitleBody()}
                    </div>
                  </div>

                  <div className="modal fade" id="Modal-Report" tabIndex="-1" data-backdrop="static">
                    <div className="modal-dialog modal-full-width">

                      <div className="modal-content">
                        <div className="modal-header">
                          <h4 className="modal-title text-primary">
                            Design Specification
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
                                <td><input class="mx-2 selectValueCheckbox" type="checkbox" value={'Cybersecurity-Specifications-From-Higher-Level-Architecture'} onChange={e => this.checkboxChange(e, 'Cybersecurity-Specifications-From-Higher-Level-Architecture')} />
                                  <label class="mb-0">{'Cybersecurity-Specifications-From-Higher-Level-Architecture'.replaceAll('-', ' ')} </label></td>
                              </tr>
                              <tr>
                                <td><input class="mx-2 selectValueCheckbox" type="checkbox" value={'Cybersecurity-Specifications-From-Higher-Level-Architecture'} onChange={e => this.checkboxChange(e, 'Cybersecurity-Specifications-From-Higher-Level-Architecture')} />
                                  <label class="mb-0">{'Cybersecurity-Specifications-From-Higher-Level-Architecture'.replaceAll('-', ' ')} </label></td>
                              </tr>
                              <tr>
                                <td><input class="mx-2 selectValueCheckbox" type="checkbox" value={'Cybersecurity-Requirements-From-Higher-Level-Architecture'} onChange={e => this.checkboxChange(e, 'Cybersecurity-Requirements-From-Higher-Level-Architecture')} />
                                  <label class="mb-0">{'Cybersecurity-Requirements-From-Higher-Level-Architecture'.replaceAll('-', ' ')} </label></td>
                              </tr>
                              <tr>
                                <td><input class="mx-2 selectValueCheckbox" type="checkbox" value={'High-Level-Cybersecurity-Requirement-Vehicle-Level'} onChange={e => this.checkboxChange(e, 'High-Level-Cybersecurity-Requirement-Vehicle-Level')} />
                                  <label class="mb-0">{'High-Level-Cybersecurity-Requirement-Vehicle-Level'.replaceAll('-', ' ')} </label></td>
                              </tr>
                              <tr>
                                <td><input class="mx-2 selectValueCheckbox" type="checkbox" value={'High-Level-Cybersecurity-Goal-Vehicle-Level'} onChange={e => this.checkboxChange(e, 'High-Level-Cybersecurity-Goal-Vehicle-Level')} />
                                  <label class="mb-0">{'High-Level-Cybersecurity-Goal-Vehicle-Level'.replaceAll('-', ' ')} </label></td>
                              </tr>
                              <tr>
                                <td><input class="mx-2 selectValueCheckbox" type="checkbox" value={'Interface-Between-Components'} onChange={e => this.checkboxChange(e, 'Interface-Between-Components')} />
                                  <label class="mb-0">{'Interface-Between-Components'.replaceAll('-', ' ')} </label></td>
                              </tr>
                              <tr>
                                <td><input class="mx-2 selectValueCheckbox" type="checkbox" value={'Specification-of-interfaces-between-components'} onChange={e => this.checkboxChange(e, 'Specification-of-interfaces-between-components')} />
                                  <label class="mb-0">{'Specification-of-interfaces-between-components'.replaceAll('-', ' ')} </label></td>
                              </tr>
                              <tr>
                                <td><input class="mx-2 selectValueCheckbox" type="checkbox" value={'Modelling-Languages'} onChange={e => this.checkboxChange(e, 'Modelling-Languages')} />
                                  <label class="mb-0">{'Modelling-Languages'.replaceAll('-', ' ')} </label></td>
                              </tr>
                              <tr>
                                <td><input class="mx-2 selectValueCheckbox" type="checkbox" value={'Criteria-For-Design-Modeling'} onChange={e => this.checkboxChange(e, 'Criteria-For-Design-Modeling')} />
                                  <label class="mb-0">{'Criteria-For-Design-Modeling'.replaceAll('-', ' ')} </label></td>
                              </tr>
                              <tr>
                                <td><input class="mx-2 selectValueCheckbox" type="checkbox" value={'Criteria-For-Programming-Notations'} onChange={e => this.checkboxChange(e, 'Criteria-For-Programming-Notations')} />
                                  <label class="mb-0">{'Criteria-For-Programming-Notations'.replaceAll('-', ' ')} </label></td>
                              </tr>
                              <tr>
                                <td><input class="mx-2 selectValueCheckbox" type="checkbox" value={'CDS-Configuration'} onChange={e => this.checkboxChange(e, 'CDS-Configuration')} />
                                  <label class="mb-0">{'CDS-Configuration'.replaceAll('-', ' ')} </label></td>
                              </tr>
                              <tr>
                                <td><input class="mx-2 selectValueCheckbox" type="checkbox" value={'CDS-Calibration'} onChange={e => this.checkboxChange(e, 'CDS-Calibration')} />
                                  <label class="mb-0">{'CDS-Calibration'.replaceAll('-', ' ')} </label></td>
                              </tr>
                              <tr>
                                <td><input class="mx-2 selectValueCheckbox" type="checkbox" value={'CyberSecurity-implications-of-Post-Development-Phase'} onChange={e => this.checkboxChange(e, 'CyberSecurity-implications-of-Post-Development-Phase')} />
                                  <label class="mb-0">{'CyberSecurity-implications-of-Post-Development-Phase'.replaceAll('-', ' ')} </label></td>
                              </tr>
                              <tr>
                                <td><input class="mx-2 selectValueCheckbox" type="checkbox" value={'Vulnerability-Sync'} onChange={e => this.checkboxChange(e, 'Vulnerability-Sync')} />
                                  <label class="mb-0">{'Vulnerability-Sync'.replaceAll('-', ' ')} </label></td>
                              </tr>
                              <tr>
                                <td><input class="mx-2 selectValueCheckbox" type="checkbox" value={'Vulnerability'} onChange={e => this.checkboxChange(e, 'Vulnerability')} />
                                  <label class="mb-0">{'Vulnerability'.replaceAll('-', ' ')} </label></td>
                              </tr>
                              <tr>
                                <td><input class="mx-2 selectValueCheckbox" type="checkbox" value={'CyberSecurity-Design-Specification-Verification-Method'} onChange={e => this.checkboxChange(e, 'CyberSecurity-Design-Specification-Verification-Method')} />
                                  <label class="mb-0">{'CyberSecurity-Design-Specification-Verification-Method'.replaceAll('-', ' ')} </label></td>
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
                </div>
              }
            </div>
          }
        </div>

      </DashboardLayout >
    )
  }

}

export default DesignSpecification


