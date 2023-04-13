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

// production Monitoring & Triage
class Production extends React.Component {

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

    cybersecurityControls: [
      { "label": "Enterprise Grade HSM ", "value": "Enterprise Grade HSM " },
      { "label": "Secure TLS Connection", "value": "Secure TLS Connection" },
      { "label": "Access Control", "value": "Access Control" },
      { "label": "Endpoint Security", "value": "Endpoint Security" },
      { "label": "Firewall", "value": "Firewall" },
      { "label": "Intrusion Detection and Prevention System", "value": "Intrusion Detection and Prevention System" },
      { "label": "SNMP Trap", "value": "SNMP Trap" },
      { "label": "Others", "value": "Others" },
    ],
    methodsCybersecurityRequirements: [
      { "label": "Inspection Check", "value": "Inspection Check" },
      { "label": "Calibration Check ", "value": "Calibration Check " },
      { "label": "Configuration Check", "value": "Configuration Check" },

    ],
    testMethods: [
      { "label": "Functional testing", "value": "Functional testing" },
      { "label": "Vulnerability scanning", "value": "Vulnerability scanning" },
      { "label": "Fuzz testing", "value": "Fuzz testing" },
      { "label": "Penetration testing", "value": "Penetration testing" },
    ],
  };


  validate = (requiredParameters, production) => {

    let index = 0
    let validated = false

    requiredParameters.map(parameter => {
      var referenceNode = document.getElementsByName(parameter)[0]

      if ((!production || !production[parameter] || production[parameter] === '')) {
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

    let production = this.state.production

    let requiredParameters = ['Cybersecurity-Production-Name']


    validated = this.validate(requiredParameters, production)


    if (production['Production-Control-Plan-File'] && typeof (production['Production-Control-Plan-File']) !== 'string') {
      await httpFile(apify('app/upload-file'), production['Production-Control-Plan-File']).then((res) => {

        if (res['success']) {
          production['Production-Control-Plan-File'] = res['url']
        }
      });
    }
    if (production['Test-Method-for-the-identified-Vulnerabilities-Software-File'] && typeof (production['Test-Method-for-the-identified-Vulnerabilities-Software-File']) !== 'string') {
      await httpFile(apify('app/upload-file'), production['Test-Method-for-the-identified-Vulnerabilities-Software-File']).then((res) => {

        if (res['success']) {
          production['Test-Method-for-the-identified-Vulnerabilities-Software-File'] = res['url']
        }
      });
    }
    if (production['Test-Method-for-the-identified-Vulnerabilities-Hardware-File'] && typeof (production['Test-Method-for-the-identified-Vulnerabilities-Hardware-File']) !== 'string') {
      await httpFile(apify('app/upload-file'), production['Test-Method-for-the-identified-Vulnerabilities-Hardware-File']).then((res) => {

        if (res['success']) {
          production['Test-Method-for-the-identified-Vulnerabilities-Hardware-File'] = res['url']
        }
      });
    }
    if (production['Test-Method-for-the-identified-Vulnerabilities-Toolchain-File'] && typeof (production['Test-Method-for-the-identified-Vulnerabilities-Toolchain-File']) !== 'string') {
      await httpFile(apify('app/upload-file'), production['Test-Method-for-the-identified-Vulnerabilities-Toolchain-File']).then((res) => {

        if (res['success']) {
          production['Test-Method-for-the-identified-Vulnerabilities-Toolchain-File'] = res['url']
        }
      });
    }




    if (validated) {

      if (production['Asset-Uuid']) {
        production['Asset-Uuid'] = {
          'label': production['Asset-Uuid']['label'],
          'value': production['Asset-Uuid']['value'],
        }
      }
      if (production['Threat-Uuid']) {
        production['Threat-Uuid'] = {
          'label': production['Threat-Uuid']['label'],
          'value': production['Threat-Uuid']['value'],
        }
      }
      if (production['Vulnerability']) {
        production['Vulnerability'] = {
          'label': production['Vulnerability']['label'],
          'value': production['Vulnerability']['value'],
        }
      }
      if (production['Any-identified-Vulnerabilities-Software-Vulnerability']) {
        production['Any-identified-Vulnerabilities-Software-Vulnerability'] = {
          'label': production['Any-identified-Vulnerabilities-Software-Vulnerability']['label'],
          'value': production['Any-identified-Vulnerabilities-Software-Vulnerability']['value'],
        }
      }
      if (production['Any-identified-Vulnerabilities-Hardware-Vulnerability']) {
        production['Any-identified-Vulnerabilities-Hardware-Vulnerability'] = {
          'label': production['Any-identified-Vulnerabilities-Hardware-Vulnerability']['label'],
          'value': production['Any-identified-Vulnerabilities-Hardware-Vulnerability']['value'],
        }
      }
      if (production['Any-identified-Vulnerabilities-Toolchain-Vulnerability']) {
        production['Any-identified-Vulnerabilities-Toolchain-Vulnerability'] = {
          'label': production['Any-identified-Vulnerabilities-Toolchain-Vulnerability']['label'],
          'value': production['Any-identified-Vulnerabilities-Toolchain-Vulnerability']['value'],
        }
      }


      production['Uuid'] = production['Uuid'] ? production['Uuid'] : uuidV4()

      var vm = this;
      httpPost(apify('app/program/production/update'), {
        programUuid: vm.state.programUuid,
        productionData: vm.state.production,
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
      cycle: 'Production-Phase'
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
            if (this.state.productions && this.state.productions['Items']) {
              existed = this.state.productions['Items'].filter(designItem => designItem['Threat-Uuid']['value'] === item['Threats'][threat]['RefId'])
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

  // Download concept phase report
  phaseReport = (ev, type = "PDF") => {
    ev.preventDefault();

    let params = {
      'programUuid': this.state.programUuid,
      'selectedInput': this.state.selectedInput ? this.state.selectedInput : [],
      'page': 'production'
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
  onChangeThreatOption = (ev) => {

    this.setState({
      production: this.state.reconfigureState ? this.state.production : undefined,
      property: this.state.reconfigureState ? this.state.property : undefined,
    }, () => {

      this.setState({
        property: ev['property'],
        threatSelected: ev,
        production: {
          ...this.state.production,
          "Component-Uuid": this.state.componentName,
          "Asset-Uuid": this.state.assetSelected,
          "Threat-Uuid": ev,
          "Cybersecurity-Production-Name": `${this.state.program['name']}-Production`,
          "Uuid": uuidV4(),
        },
      });

    })

  }


  //
  reConfigure(production) {
    //
    var vm = this;


    //
    swalConfirmationPopup({
      title: null,
      text: "This action will reset the production data",
      confirmButtonText: "Re-configure",
    }, () => {

      let productions = this.state.productions

      productions['Items'] = this.state.program['productions']['Items'].filter(item => item['Uuid'] !== production['Uuid'])



      vm.setState({
        loading: true,
        reconfigureState: true,
        productions: productions
      }, () => {
        let assets = this.prepareAssetOptions(this.state['program']['assets'])
        this.setState({
          production: undefined,
          assets: assets
        }, () => {


          if (production['Component-Uuid']) {
            this.state.componentArray.map(component => {
              if (component['value'] === production['Component-Uuid']['value']) {
                ev = component
                this.onChangeComponent(ev)
              }
              return null
            })
          }



          let ev = {}
          this.state.assets.map(asset => {
            if (asset['value'] === production['Asset-Uuid']['value']) {
              ev = asset
              this.onChangeAssetOption(ev)
              asset['threats'].map(threat => {
                if (threat['value'] === production['Threat-Uuid']['value']) {
                  this.setState({
                    loading: false,
                    property: threat['property'],
                    assetSelected: ev,
                    threatSelected: threat,
                    production: production,
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
      production: {
        ...this.state.production,
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
  viewProduction(item, forView = true) {

    let fetched = false;


    if (!fetched) {

      this.setState({
        currentProductionView: item,
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
      {this.state.currentProductionView && <table className="table table-bordered" id="modal-tuggle">
        <tbody>
          {/* <tr>
          <td>Component</td>
          <td>{this.state.currentProductionView['Component-Uuid'] && this.state.currentProductionView['Component-Uuid']['label']}</td>
        </tr> */}
          <tr>
            <td>Asset</td>
            <td>{this.state.currentProductionView['Asset-Uuid'] && this.state.currentProductionView['Asset-Uuid']['label']}</td>
          </tr>
          <tr>
            <td>Threat</td>
            <td>{this.state.currentProductionView['Threat-Uuid'] && this.state.currentProductionView['Threat-Uuid']['label']}</td>
          </tr>
          <tr>
            <td>Name</td>
            <td>{this.state.currentProductionView['Cybersecurity-Production-Name']}</td>
          </tr>
          <tr>
            <td>{'Is-there-a-Production-Control-Plan'.replaceAll('-', ' ')}</td>
            <td>{this.state.currentProductionView['Is-there-a-Production-Control-Plan'] ? 'True' : 'False'}</td>
          </tr>
          <tr>
            <td>{'Production-Control-Plan'.replaceAll('-', ' ')}</td>
            <td>{this.state.currentProductionView['Production-Control-Plan']}</td>
          </tr>
          <tr>
            <td>{'Rationale-for-No-Production-Control-Plan'.replaceAll('-', ' ')}</td>
            <td>{this.state.currentProductionView['Rationale-for-No-Production-Control-Plan']}</td>
          </tr>

          <tr>
            <td>{'Has-the-production-control-plan-been-implemented'.replaceAll('-', ' ')}</td>
            <td>{this.state.currentProductionView['Has-the-production-control-plan-been-implemented'] ? 'True' : 'False'}</td>
          </tr>
          <tr>
            <td>{'Production-Tools'.replaceAll('-', ' ')}</td>
            <td>{this.state.currentProductionView['Production-Tools']}</td>
          </tr>
          <tr>
            <td>{'Cybersecurity-controls-for-production'.replaceAll('-', ' ')}</td>
            <td>{this.state.currentProductionView['Cybersecurity-controls-for-production'] && this.state.currentProductionView['Cybersecurity-controls-for-production']['label']}</td>
          </tr>
          <tr>
            <td>{'Cybersecurity-controls-for-production-Other'.replaceAll('-', ' ')}</td>
            <td>{this.state.currentProductionView['Cybersecurity-controls-for-production-Other']}</td>
          </tr>
          <tr>
            <td>{'Methods-to-confirm-cybersecurity-requirements-post-development-are-met'.replaceAll('-', ' ')}</td>
            <td>{this.state.currentProductionView['Methods-to-confirm-cybersecurity-requirements-post-development-are-met'] && this.state.currentProductionView['Methods-to-confirm-cybersecurity-requirements-post-development-are-met']['label']}</td>
          </tr>
          <tr>
            <td>{'Any-identified-Vulnerabilities-Software'.replaceAll('-', ' ')}</td>
            <td>{this.state.currentProductionView['Any-identified-Vulnerabilities-Software'] ? 'True' : 'False'}</td>
          </tr>
          <tr>
            <td>{'Any-identified-Vulnerabilities-Software-Vulnerability'.replaceAll('-', ' ')}</td>
            <td>{this.state.currentProductionView['Any-identified-Vulnerabilities-Software-Vulnerability'] && this.state.currentProductionView['Any-identified-Vulnerabilities-Software-Vulnerability']['label']}</td>
          </tr>
          <tr>
            <td>{'Test-Method-for-the-identified-Vulnerabilities-Software'.replaceAll('-', ' ')}</td>
            <td>{this.state.currentProductionView['Test-Method-for-the-identified-Vulnerabilities-Software'] ? 'True' : 'False'}</td>
          </tr>
          {this.state.currentProductionView['Test-Method-for-the-identified-Vulnerabilities-Software'] && <tr>
            <td>{'Test-Method-for-the-identified-Vulnerabilities-Software-Data'.replaceAll('-', ' ')}</td>
            <td>{this.state.currentProductionView['Test-Method-for-the-identified-Vulnerabilities-Software-Data'] && this.state.currentProductionView['Test-Method-for-the-identified-Vulnerabilities-Software-Data']['label']}</td>
          </tr>}
          {!this.state.currentProductionView['Test-Method-for-the-identified-Vulnerabilities-Software'] && <tr>
            <td>{'Test-Method-for-the-identified-Vulnerabilities-Software-Text'.replaceAll('-', ' ')}</td>
            <td>{this.state.currentProductionView['Test-Method-for-the-identified-Vulnerabilities-Software-Text']}</td>
          </tr>}
          <tr>
            <td>{'Any-identified-Vulnerabilities-Hardware'.replaceAll('-', ' ')}</td>
            <td>{this.state.currentProductionView['Any-identified-Vulnerabilities-Hardware'] ? 'True' : 'False'}</td>
          </tr>
          <tr>
            <td>{'Any-identified-Vulnerabilities-Hardware-Vulnerability'.replaceAll('-', ' ')}</td>
            <td>{this.state.currentProductionView['Any-identified-Vulnerabilities-Hardware-Vulnerability'] && this.state.currentProductionView['Any-identified-Vulnerabilities-Hardware-Vulnerability']['label']}</td>
          </tr>
          <tr>
            <td>{'Test-Method-for-the-identified-Vulnerabilities-Hardware'.replaceAll('-', ' ')}</td>
            <td>{this.state.currentProductionView['Test-Method-for-the-identified-Vulnerabilities-Hardware'] ? 'True' : 'False'}</td>
          </tr>
          {this.state.currentProductionView['Test-Method-for-the-identified-Vulnerabilities-Hardware'] && <tr>
            <td>{'Test-Method-for-the-identified-Vulnerabilities-Hardware-Data'.replaceAll('-', ' ')}</td>
            <td>{this.state.currentProductionView['Test-Method-for-the-identified-Vulnerabilities-Hardware-Data'] && this.state.currentProductionView['Test-Method-for-the-identified-Vulnerabilities-Hardware-Data']['label']}</td>
          </tr>}
          {!this.state.currentProductionView['Test-Method-for-the-identified-Vulnerabilities-Hardware'] && <tr>
            <td>{'Test-Method-for-the-identified-Vulnerabilities-Hardware-Text'.replaceAll('-', ' ')}</td>
            <td>{this.state.currentProductionView['Test-Method-for-the-identified-Vulnerabilities-Hardware-Text']}</td>
          </tr>}
          <tr>
            <td>{'Any-identified-Vulnerabilities-Toolchain'.replaceAll('-', ' ')}</td>
            <td>{this.state.currentProductionView['Any-identified-Vulnerabilities-Toolchain'] ? 'True' : 'False'}</td>
          </tr>
          <tr>
            <td>{'Any-identified-Vulnerabilities-Toolchain-Vulnerability'.replaceAll('-', ' ')}</td>
            <td>{this.state.currentProductionView['Any-identified-Vulnerabilities-Toolchain-Vulnerability'] && this.state.currentProductionView['Any-identified-Vulnerabilities-Toolchain-Vulnerability']['label']}</td>
          </tr>
          <tr>
            <td>{'Test-Method-for-the-identified-Vulnerabilities-Toolchain'.replaceAll('-', ' ')}</td>
            <td>{this.state.currentProductionView['Test-Method-for-the-identified-Vulnerabilities-Toolchain'] ? 'True' : 'False'}</td>
          </tr>
          {this.state.currentProductionView['Test-Method-for-the-identified-Vulnerabilities-Toolchain'] && <tr>
            <td>{'Test-Method-for-the-identified-Vulnerabilities-Toolchain-Data'.replaceAll('-', ' ')}</td>
            <td>{this.state.currentProductionView['Test-Method-for-the-identified-Vulnerabilities-Toolchain-Data'] && this.state.currentProductionView['Test-Method-for-the-identified-Vulnerabilities-Toolchain-Data']['label']}</td>
          </tr>}
          {!this.state.currentProductionView['Test-Method-for-the-identified-Vulnerabilities-Toolchain'] && <tr>
            <td>{'Test-Method-for-the-identified-Vulnerabilities-Toolchain-Text'.replaceAll('-', ' ')}</td>
            <td>{this.state.currentProductionView['Test-Method-for-the-identified-Vulnerabilities-Toolchain-Text']}</td>
          </tr>}
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
    setTitle("Production - Post Development Phase");

    var vm = this;
    let { programUuid } = this.props['match']['params'];

    //
    this.setState({
      programUuid: programUuid
    }, () => {

      // program fetch
      httpGet(apify(`app/program/threats?programUuid=${programUuid}`)).then(res => {
        let threats = res['program']['threats'];
        let productions = res['program']['productions'];
        let vulnerabilityList = this.prepareVulnerabilityOptions(res['program']['vulnerabilities']);


        vm.setState({
          loading: false,
          program: res['program'],
          threats: threats,
          configuration: res['configuration'],
          productions: productions,
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
                              <h3>Production - Post Development Phase</h3>
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
                            (this.state.production !== undefined) && (this.state.property !== undefined) &&
                            <div>
                              <div className="row mt-2">


                                <div className="col-md-12">
                                  <div className="form-group row pt-1">
                                    <div className="col-5 text-muted">
                                      Security Objective
                                    </div>
                                    <div className="col-7">
                                      <input type="text" name="Security-Objective" className="form-control md-form-control mt-1" defaultValue={this.state.property['Security-Objective'] && this.state.property['Security-Objective']['Value']}
                                        placeholder="Security Objective" readOnly />
                                    </div>
                                  </div>
                                </div>
                                <div className="col-md-12">
                                  <div className="form-group row pt-1">
                                    <div className="col-5 text-muted">
                                      Cyber Security Claims
                                    </div>
                                    <div className="col-7">
                                      <input type="text" name="Security-Objective" className="form-control md-form-control mt-1" defaultValue={this.state.property['Risk-Acceptance'] && this.state.property['Risk-Acceptance']['Reduced-Risk-Cyber-Security-Claim']}
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
                                      Is there a Production Control Plan
                                    </div>
                                    <div className="col-7">
                                      <Select options={this.state.yesNoSelects}
                                        value={this.state.production['Is-there-a-Production-Control-Plan'] === true ? { 'label': 'Yes', value: 'Yes' } : { 'label': 'No', value: 'No' }}
                                        name="Is-there-a-Production-Control-Plan"
                                        onChange={(ev) => {
                                          this.setState({
                                            production: {
                                              ...this.state.production,
                                              "Is-there-a-Production-Control-Plan": ev.value === 'Yes' ? true : false,

                                            },
                                            configurationparametersrequirement: ev
                                          })
                                        }} />
                                      <span className="text-danger text-error d-none" data-validation-key="groupName">Please select Group.</span>
                                    </div>
                                  </div>
                                </div>

                                {
                                  this.state.production['Is-there-a-Production-Control-Plan'] === true &&
                                  <div className="col-md-12">
                                    <div className="form-group row pt-1">
                                      <div className="col-5 text-muted">
                                        Production Control Plan
                                      </div>
                                      <div className="col-4">
                                        <input type="text" className="form-control md-form-control mt-1"
                                          defaultValue={this.state.production['Production-Control-Plan']}
                                          name="Production-Control-Plan"
                                          onChange={(ev) => this.onDataChange(ev)}
                                          placeholder="Production Control Plan" />
                                      </div>
                                      <div className="col-3">
                                        <input type="file" className="form-control md-form-control mt-1"
                                          // defaultValue={this.state.production['Production-Control-Plan-File']}
                                          name="Production-Control-Plan-File"
                                          onChange={(ev) => this.onDataChange(ev)}
                                          placeholder="Production Control Plan" />
                                      </div>

                                    </div>
                                  </div>
                                }
                                {
                                  this.state.production['Is-there-a-Production-Control-Plan'] === false &&
                                  <div className="col-md-12">
                                    <div className="form-group row pt-1">
                                      <div className="col-5 text-muted">
                                        Rationale for No production Control Plan
                                      </div>
                                      <div className="col-7">
                                        <input type="text" className="form-control md-form-control mt-1"
                                          defaultValue={this.state.production['Rationale-for-No-Production-Control-Plan']}
                                          name="Rationale-for-No-Production-Control-Plan"
                                          onChange={(ev) => this.onDataChange(ev)}
                                          placeholder="Rationale for No production Control Plan" />
                                      </div>

                                    </div>
                                  </div>
                                }

                                <div className="col-md-12">
                                  <div className="form-group row pt-1">
                                    <div className="col-5 text-muted">
                                      Has the production control plan been implemented
                                    </div>
                                    <div className="col-7">
                                      <Select options={this.state.yesNoSelects}
                                        value={this.state.production['Has-the-production-control-plan-been-implemented'] === true ? { 'label': 'Yes', value: 'Yes' } : { 'label': 'No', value: 'No' }}
                                        name="Has-the-production-control-plan-been-implemented"
                                        onChange={(ev) => {
                                          this.setState({
                                            production: {
                                              ...this.state.production,
                                              "Has-the-production-control-plan-been-implemented": ev.value === 'Yes' ? true : false,

                                            },
                                            configurationparametersrequirement: ev
                                          })
                                        }} />
                                      <span className="text-danger text-error d-none" data-validation-key="groupName">Please select Group.</span>
                                    </div>
                                  </div>
                                </div>

                                <div className="col-md-12">
                                  <div className="form-group row pt-1">
                                    <div className="col-5 text-muted">
                                      Please State any Production tools and equipment
                                    </div>
                                    <div className="col-7">
                                      <input type="text" className="form-control md-form-control mt-1"
                                        defaultValue={this.state.production['Production-Tools']}
                                        name="Production-Tools"
                                        onChange={(ev) => this.onDataChange(ev)}
                                        placeholder="Please State any Production tools and equipment" />
                                    </div>

                                  </div>
                                </div>

                                <div className="col-md-12">
                                  <div className="form-group row pt-1">
                                    <div className="col-5 text-muted">
                                      Please State any Cyber Security controls for production
                                    </div>
                                    <div className="col-7">
                                      <Select options={this.state.cybersecurityControls}
                                        name="Cybersecurity-controls-for-production"
                                        value={this.state.production && this.state.production['Cybersecurity-controls-for-production']}
                                        onChange={(ev) => {
                                          this.setState({
                                            production: {
                                              ...this.state.production,
                                              "Cybersecurity-controls-for-production": ev,
                                            },
                                            InterfaceBetweenComponents: ev
                                          })
                                        }} />
                                      <span className="text-danger text-error d-none" data-validation-key="groupName">Please select Group.</span>
                                    </div>
                                  </div>
                                </div>
                                {this.state.production['Cybersecurity-controls-for-production'] && this.state.production['Cybersecurity-controls-for-production']['value'] === 'Others' &&
                                  <div className="col-md-12">
                                    <div className="form-group row pt-1">
                                      <div className="col-5 text-muted">
                                        Please State any Cyber Security controls for production(Other)
                                      </div>
                                      <div className="col-7">
                                        <input type="text" className="form-control md-form-control mt-1"
                                          defaultValue={this.state.production['Cybersecurity-controls-for-production-Other']}
                                          name="Cybersecurity-controls-for-production-Other"
                                          onChange={(ev) => this.onDataChange(ev)}
                                          placeholder="Please State any Cyber Security controls for production(Other)" />
                                      </div>

                                    </div>
                                  </div>
                                }
                                <div className="col-md-12">
                                  <div className="form-group row pt-1">
                                    <div className="col-5 text-muted">
                                      Methods to confirm Cyber Security requirements for post-development are met
                                    </div>
                                    <div className="col-7">
                                      <Select options={this.state.methodsCybersecurityRequirements}
                                        name="Methods-to-confirm-cybersecurity-requirements-post-development-are-met"
                                        value={this.state.production && this.state.production['Methods-to-confirm-cybersecurity-requirements-post-development-are-met']}
                                        onChange={(ev) => {
                                          this.setState({
                                            production: {
                                              ...this.state.production,
                                              "Methods-to-confirm-cybersecurity-requirements-post-development-are-met": ev,
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
                                      Are there any identified Vulnerabilities/Weakness in the Software
                                    </div>
                                    <div className="col-2">
                                      <Select options={this.state.yesNoSelects}
                                        name="Any-identified-Vulnerabilities-Software"
                                        value={this.state.production && this.state.production['Any-identified-Vulnerabilities-Software'] === true ? { 'label': 'Yes', value: 'Yes' } : { 'label': 'No', value: 'No' }}
                                        onChange={(ev) => {
                                          this.setState({
                                            production: {
                                              ...this.state.production,
                                              "Any-identified-Vulnerabilities-Software": ev.value === 'Yes' ? true : false,
                                            },
                                          })
                                        }} />
                                      <span className="text-danger text-error d-none" data-validation-key="groupName">Please select Group.</span>
                                    </div>
                                    {this.state.production && this.state.production['Any-identified-Vulnerabilities-Software'] && this.state.production['Any-identified-Vulnerabilities-Software'] === true && <div className="col-3">
                                      <Select options={this.state.vulnerabilityList}
                                        value={this.state.production && this.state.production['Any-identified-Vulnerabilities-Software-Vulnerabilit']}
                                        name="Any-identified-Vulnerabilities-Software-Vulnerability"
                                        onChange={(ev) => {
                                          this.setState({
                                            production: {
                                              ...this.state.production,
                                              "Any-identified-Vulnerabilities-Software-Vulnerability": ev,

                                            },
                                          })
                                        }} />
                                      <span className="text-danger text-error d-none" data-validation-key="groupName">Please select Group.</span>
                                    </div>}
                                    {this.state.production && this.state.production['Any-identified-Vulnerabilities-Software'] && this.state.production['Any-identified-Vulnerabilities-Software'] === true &&
                                      <div className="col-2 text-right">
                                        <a target="_blank" rel="noreferrer" href={`/dashboard/cybersecurity/vulnerability-monitoring-and-triage/${this.state.program['uuid']}`}>Link to Vulnerability Monit.</a>

                                      </div>}
                                  </div>
                                </div>
                                <div className="col-md-12">
                                  <div className="form-group row pt-1">
                                    <div className="col-5 text-muted">
                                      Test Method for the identified Vulnerabilities/Weakness
                                    </div>
                                    <div className="col-2">
                                      <Select options={this.state.yesNoSelects}
                                        name="Test-Method-for-the-identified-Vulnerabilities-Software"
                                        value={this.state.production && this.state.production['Test-Method-for-the-identified-Vulnerabilities-Software'] === true ? { 'label': 'Yes', value: 'Yes' } : { 'label': 'No', value: 'No' }}
                                        onChange={(ev) => {
                                          this.setState({
                                            production: {
                                              ...this.state.production,
                                              "Test-Method-for-the-identified-Vulnerabilities-Software": ev.value === 'Yes' ? true : false,
                                            },
                                          })
                                        }} />
                                      <span className="text-danger text-error d-none" data-validation-key="groupName">Please select Group.</span>
                                    </div>
                                    {this.state.production && this.state.production['Test-Method-for-the-identified-Vulnerabilities-Software'] && this.state.production['Test-Method-for-the-identified-Vulnerabilities-Software'] === true && <div className="col-3">
                                      <Select options={this.state.testMethods}
                                        name="Test-Method-for-the-identified-Vulnerabilities-Software-Data"
                                        value={this.state.production && this.state.production['Test-Method-for-the-identified-Vulnerabilities-Software-Data']}
                                        onChange={(ev) => {
                                          this.setState({
                                            production: {
                                              ...this.state.production,
                                              "Test-Method-for-the-identified-Vulnerabilities-Software-Data": ev,
                                            },
                                          })
                                        }} />
                                      <span className="text-danger text-error d-none" data-validation-key="groupName">Please select Group.</span>
                                    </div>}
                                    {this.state.production && !this.state.production['Test-Method-for-the-identified-Vulnerabilities-Software'] && <div className="col-3">
                                      <input type="text" className="form-control md-form-control mt-1"
                                        defaultValue={this.state.production && this.state.production['Test-Method-for-the-identified-Vulnerabilities-Software-Text']}
                                        name="Test-Method-for-the-identified-Vulnerabilities-Software-Text"
                                        onChange={(ev) => this.onDataChange(ev)}
                                        placeholder="Rationale for No test" />
                                    </div>}
                                    <div className="col-2 text-right">
                                      <input type="file" className="form-control md-form-control mt-2"
                                        name="Test-Method-for-the-identified-Vulnerabilities-Software-File"
                                        onChange={(ev) => this.onDataChange(ev)}
                                        placeholder="Rationale for No test" />
                                    </div>
                                  </div>
                                </div>
                                <div className="col-md-12">
                                  <div className="form-group row pt-1">
                                    <div className="col-5 text-muted">
                                      Are there any identified Vulnerabilities/Weakness in the Hardware
                                    </div>
                                    <div className="col-2">
                                      <Select options={this.state.yesNoSelects}
                                        name="Any-identified-Vulnerabilities-Hardware"
                                        value={this.state.production && this.state.production['Any-identified-Vulnerabilities-Hardware'] === true ? { 'label': 'Yes', value: 'Yes' } : { 'label': 'No', value: 'No' }}
                                        onChange={(ev) => {
                                          this.setState({
                                            production: {
                                              ...this.state.production,
                                              "Any-identified-Vulnerabilities-Hardware": ev.value === 'Yes' ? true : false,
                                            },
                                          })
                                        }} />
                                      <span className="text-danger text-error d-none" data-validation-key="groupName">Please select Group.</span>
                                    </div>
                                    {this.state.production && this.state.production['Any-identified-Vulnerabilities-Hardware'] && this.state.production['Any-identified-Vulnerabilities-Hardware'] === true && <div className="col-3">
                                      <Select options={this.state.vulnerabilityList}
                                        value={this.state.production && this.state.production['Any-identified-Vulnerabilities-Hardware-Vulnerabilit']}
                                        name="Any-identified-Vulnerabilities-Hardware-Vulnerability"
                                        onChange={(ev) => {
                                          this.setState({
                                            production: {
                                              ...this.state.production,
                                              "Any-identified-Vulnerabilities-Hardware-Vulnerability": ev,

                                            },
                                          })
                                        }} />
                                      <span className="text-danger text-error d-none" data-validation-key="groupName">Please select Group.</span>
                                    </div>}
                                    {this.state.production && this.state.production['Any-identified-Vulnerabilities-Hardware'] && this.state.production['Any-identified-Vulnerabilities-Hardware'] === true &&
                                      <div className="col-2 text-right">
                                        <a target="_blank" rel="noreferrer" href={`/dashboard/cybersecurity/vulnerability-monitoring-and-triage/${this.state.program['uuid']}`}>Link to Vulnerability Monit.</a>
                                      </div>}
                                  </div>
                                </div>
                                <div className="col-md-12">
                                  <div className="form-group row pt-1">
                                    <div className="col-5 text-muted">
                                      Test Method for the identified Vulnerabilities/Weakness
                                    </div>
                                    <div className="col-2">
                                      <Select options={this.state.yesNoSelects}
                                        name="Test-Method-for-the-identified-Vulnerabilities-Hardware"
                                        value={this.state.production && this.state.production['Test-Method-for-the-identified-Vulnerabilities-Hardware'] === true ? { 'label': 'Yes', value: 'Yes' } : { 'label': 'No', value: 'No' }}
                                        onChange={(ev) => {
                                          this.setState({
                                            production: {
                                              ...this.state.production,
                                              "Test-Method-for-the-identified-Vulnerabilities-Hardware": ev.value === 'Yes' ? true : false,
                                            },
                                          })
                                        }} />
                                      <span className="text-danger text-error d-none" data-validation-key="groupName">Please select Group.</span>
                                    </div>
                                    {this.state.production && this.state.production['Test-Method-for-the-identified-Vulnerabilities-Hardware'] && this.state.production['Test-Method-for-the-identified-Vulnerabilities-Hardware'] === true && <div className="col-3">
                                      <Select options={this.state.testMethods}
                                        name="Test-Method-for-the-identified-Vulnerabilities-Hardware-Data"
                                        value={this.state.production && this.state.production['Test-Method-for-the-identified-Vulnerabilities-Hardware-Data']}
                                        onChange={(ev) => {
                                          this.setState({
                                            production: {
                                              ...this.state.production,
                                              "Test-Method-for-the-identified-Vulnerabilities-Hardware-Data": ev,
                                            },
                                          })
                                        }} />
                                      <span className="text-danger text-error d-none" data-validation-key="groupName">Please select Group.</span>
                                    </div>}
                                    {this.state.production && !this.state.production['Test-Method-for-the-identified-Vulnerabilities-Hardware'] && <div className="col-3">
                                      <input type="text" className="form-control md-form-control mt-1"
                                        defaultValue={this.state.production && this.state.production['Test-Method-for-the-identified-Vulnerabilities-Hardware-Text']}
                                        name="Test-Method-for-the-identified-Vulnerabilities-Hardware-Text"
                                        onChange={(ev) => this.onDataChange(ev)}
                                        placeholder="Rationale for No test" />
                                    </div>}
                                    <div className="col-2 text-right">
                                      <input type="file" className="form-control md-form-control mt-2"
                                        name="Test-Method-for-the-identified-Vulnerabilities-Hardware-File"
                                        onChange={(ev) => this.onDataChange(ev)}
                                        placeholder="Rationale for No test" />
                                    </div>
                                  </div>
                                </div>
                                <div className="col-md-12">
                                  <div className="form-group row pt-1">
                                    <div className="col-5 text-muted">
                                      Are there any identified Vulnerabilities/Weakness in the Toolchain
                                    </div>
                                    <div className="col-2">
                                      <Select options={this.state.yesNoSelects}
                                        name="Any-identified-Vulnerabilities-Toolchain"
                                        value={this.state.production && this.state.production['Any-identified-Vulnerabilities-Toolchain'] === true ? { 'label': 'Yes', value: 'Yes' } : { 'label': 'No', value: 'No' }}
                                        onChange={(ev) => {
                                          this.setState({
                                            production: {
                                              ...this.state.production,
                                              "Any-identified-Vulnerabilities-Toolchain": ev.value === 'Yes' ? true : false,
                                            },
                                          })
                                        }} />
                                      <span className="text-danger text-error d-none" data-validation-key="groupName">Please select Group.</span>
                                    </div>
                                    {this.state.production && this.state.production['Any-identified-Vulnerabilities-Toolchain'] && this.state.production['Any-identified-Vulnerabilities-Toolchain'] === true && <div className="col-3">
                                      <Select options={this.state.vulnerabilityList}
                                        value={this.state.production && this.state.production['Any-identified-Vulnerabilities-Toolchain-Vulnerabilit']}
                                        name="Any-identified-Vulnerabilities-Toolchain-Vulnerability"
                                        onChange={(ev) => {
                                          this.setState({
                                            production: {
                                              ...this.state.production,
                                              "Any-identified-Vulnerabilities-Toolchain-Vulnerability": ev,

                                            },
                                          })
                                        }} />
                                      <span className="text-danger text-error d-none" data-validation-key="groupName">Please select Group.</span>
                                    </div>}
                                    {this.state.production && this.state.production['Any-identified-Vulnerabilities-Toolchain'] && this.state.production['Any-identified-Vulnerabilities-Toolchain'] === true &&
                                      <div className="col-2 text-right">
                                        <a target="_blank" rel="noreferrer" href={`/dashboard/cybersecurity/vulnerability-monitoring-and-triage/${this.state.program['uuid']}`}>Link to Vulnerability Monit.</a>
                                      </div>}
                                  </div>
                                </div>
                                <div className="col-md-12">
                                  <div className="form-group row pt-1">
                                    <div className="col-5 text-muted">
                                      Test Method for the identified Vulnerabilities/Weakness
                                    </div>
                                    <div className="col-2">
                                      <Select options={this.state.yesNoSelects}
                                        name="Test-Method-for-the-identified-Vulnerabilities-Toolchain"
                                        value={this.state.production && this.state.production['Test-Method-for-the-identified-Vulnerabilities-Toolchain'] === true ? { 'label': 'Yes', value: 'Yes' } : { 'label': 'No', value: 'No' }}
                                        onChange={(ev) => {
                                          this.setState({
                                            production: {
                                              ...this.state.production,
                                              "Test-Method-for-the-identified-Vulnerabilities-Toolchain": ev.value === 'Yes' ? true : false,
                                            },
                                          })
                                        }} />
                                      <span className="text-danger text-error d-none" data-validation-key="groupName">Please select Group.</span>
                                    </div>
                                    {this.state.production && this.state.production['Test-Method-for-the-identified-Vulnerabilities-Toolchain'] && this.state.production['Test-Method-for-the-identified-Vulnerabilities-Toolchain'] === true && <div className="col-3">
                                      <Select options={this.state.testMethods}
                                        name="Test-Method-for-the-identified-Vulnerabilities-Toolchain-Data"
                                        value={this.state.production && this.state.production['Test-Method-for-the-identified-Vulnerabilities-Toolchain-Data']}
                                        onChange={(ev) => {
                                          this.setState({
                                            production: {
                                              ...this.state.production,
                                              "Test-Method-for-the-identified-Vulnerabilities-Toolchain-Data": ev,
                                            },
                                          })
                                        }} />
                                      <span className="text-danger text-error d-none" data-validation-key="groupName">Please select Group.</span>
                                    </div>}
                                    {this.state.production && !this.state.production['Test-Method-for-the-identified-Vulnerabilities-Toolchain'] && <div className="col-3">
                                      <input type="text" className="form-control md-form-control mt-1"
                                        defaultValue={this.state.production && this.state.production['Test-Method-for-the-identified-Vulnerabilities-Toolchain-Text']}
                                        name="Test-Method-for-the-identified-Vulnerabilities-Toolchain-Text"
                                        onChange={(ev) => this.onDataChange(ev)}
                                        placeholder="Rationale for No test" />
                                    </div>}
                                    <div className="col-2 text-right">
                                      <input type="file" className="form-control md-form-control mt-2"
                                        name="Test-Method-for-the-identified-Vulnerabilities-Toolchain-File"
                                        onChange={(ev) => this.onDataChange(ev)}
                                        placeholder="Rationale for No test" />
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
                              <h3>List of Productions</h3>
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
                          </div>}{(this.state.program['status'] !== 'APPROVED' && this.state.program['status'] !== 'UNDER-REVIEW') && <h3>List of Productions</h3>}
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
                              this.state.productions && this.state.productions['Items'].length === 0
                              &&
                              <tr>
                                <td colSpan="4">
                                  No production yet.
                                </td>
                              </tr>
                            }

                            {/* productions */}
                            {
                              this.state.productions && this.state.productions['Items'].map(production => {
                                return (
                                  <tr key={production['RefId']}>

                                    {/* <td>{production['Component-Uuid'] && production['Component-Uuid']['label']}</td> */}
                                    <td>{production['Asset-Uuid'] && production['Asset-Uuid']['label']}</td>
                                    <td>{production['Threat-Uuid'] && production['Threat-Uuid']['label']}</td>
                                    <td><span data-toggle="popover" title={this.popupTitleHtml(production['Cybersecurity-Production-Name'])} data-html="true" onMouseOver={() => this.viewProduction(production, false)}>{production['Cybersecurity-Production-Name']}</span></td>
                                    <td className="text-right">
                                      {(this.state.program['status'] !== 'APPROVED' && this.state.program['status'] !== 'UNDER-REVIEW') && <a href="#!" className="identified-production-configure-button" data-ref-id={production['Uuid']} onClick={() => this.reConfigure(production)}>
                                        <i className="fa fa-gear mr-1"></i>
                                        Re-Configure
                                      </a>}
                                      <a href="#!" onClick={() => this.viewProduction(production)}>
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
                            Production
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
                  Production
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
                        <td><input class="mx-2 selectValueCheckbox" type="checkbox" value={'Is-there-a-Production-Control-Plan'} onChange={e => this.checkboxChange(e, 'Is-there-a-Production-Control-Plan')} />
                          <label class="mb-0">{'Is-there-a-Production-Control-Plan'.replaceAll('-', ' ')} </label></td>
                      </tr>
                      <tr>
                        <td><input class="mx-2 selectValueCheckbox" type="checkbox" value={'Has-the-production-control-plan-been-implemented'} onChange={e => this.checkboxChange(e, 'Has-the-production-control-plan-been-implemented')} />
                          <label class="mb-0">{'Has-the-production-control-plan-been-implemented'.replaceAll('-', ' ')} </label></td>
                      </tr>
                      <tr>
                        <td><input class="mx-2 selectValueCheckbox" type="checkbox" value={'Production-Tools'} onChange={e => this.checkboxChange(e, 'Production-Tools')} />
                          <label class="mb-0">{'Production-Tools'.replaceAll('-', ' ')} </label></td>
                      </tr>
                      <tr>
                        <td><input class="mx-2 selectValueCheckbox" type="checkbox" value={'Cybersecurity-controls-for-production'} onChange={e => this.checkboxChange(e, 'Cybersecurity-controls-for-production')} />
                          <label class="mb-0">{'Cybersecurity-controls-for-production'.replaceAll('-', ' ')} </label></td>
                      </tr>
                      <tr>
                        <td><input class="mx-2 selectValueCheckbox" type="checkbox" value={'Methods-to-confirm-cybersecurity-requirements-post-development-are-met'} onChange={e => this.checkboxChange(e, 'Methods-to-confirm-cybersecurity-requirements-post-development-are-met')} />
                          <label class="mb-0">{'Methods-to-confirm-cybersecurity-requirements-post-development-are-met'.replaceAll('-', ' ')} </label></td>
                      </tr>
                      <tr>
                        <td><input class="mx-2 selectValueCheckbox" type="checkbox" value={'Any-identified-Vulnerabilities-Software'} onChange={e => this.checkboxChange(e, 'Any-identified-Vulnerabilities-Software')} />
                          <label class="mb-0">{'Any-identified-Vulnerabilities-Software'.replaceAll('-', ' ')} </label></td>
                      </tr>
                      <tr>
                        <td><input class="mx-2 selectValueCheckbox" type="checkbox" value={'Test-Method-for-the-identified-Vulnerabilities-Software'} onChange={e => this.checkboxChange(e, 'Test-Method-for-the-identified-Vulnerabilities-Software')} />
                          <label class="mb-0">{'Test-Method-for-the-identified-Vulnerabilities-Software'.replaceAll('-', ' ')} </label></td>
                      </tr>
                      <tr>
                        <td><input class="mx-2 selectValueCheckbox" type="checkbox" value={'Any-identified-Vulnerabilities-Hardware'} onChange={e => this.checkboxChange(e, 'Any-identified-Vulnerabilities-Hardware')} />
                          <label class="mb-0">{'Any-identified-Vulnerabilities-Hardware'.replaceAll('-', ' ')} </label></td>
                      </tr>
                      <tr>
                        <td><input class="mx-2 selectValueCheckbox" type="checkbox" value={'Test-Method-for-the-identified-Vulnerabilities-Hardware'} onChange={e => this.checkboxChange(e, 'Test-Method-for-the-identified-Vulnerabilities-Hardware')} />
                          <label class="mb-0">{'Test-Method-for-the-identified-Vulnerabilities-Hardware'.replaceAll('-', ' ')} </label></td>
                      </tr>
                      <tr>
                        <td><input class="mx-2 selectValueCheckbox" type="checkbox" value={'Any-identified-Vulnerabilities-Toolchain'} onChange={e => this.checkboxChange(e, 'Any-identified-Vulnerabilities-Toolchain')} />
                          <label class="mb-0">{'Any-identified-Vulnerabilities-Toolchain'.replaceAll('-', ' ')} </label></td>
                      </tr>
                      <tr>
                        <td><input class="mx-2 selectValueCheckbox" type="checkbox" value={'Test-Method-for-the-identified-Vulnerabilities-Toolchain'} onChange={e => this.checkboxChange(e, 'Test-Method-for-the-identified-Vulnerabilities-Toolchain')} />
                          <label class="mb-0">{'Test-Method-for-the-identified-Vulnerabilities-Toolchain'.replaceAll('-', ' ')} </label></td>
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

export default Production


