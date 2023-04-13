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
class IntegrationVerification extends React.Component {

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

    designVerificationMethods: [
      { "label": "Requirements-based test", "value": "Requirements-based test" },
      { "label": "Interface test", "value": "Interface test" },
      { "label": "Resource usage evaluation", "value": "Resource usage evaluation" },
      { "label": "Verification of the control flow and data flow", "value": "Verification of the control flow and data flow" },
      { "label": "Dynamic analysis", "value": "Dynamic analysis" },
      { "label": "Static analysis", "value": "Static analysis" },
    ],
    modelingandCodingguidelines: [
      { "label": "Use of language subsets", "value": "Use of language subsets" },
      { "label": "Enforcement of strong typing", "value": "Enforcement of strong typing" },
      { "label": "Use of defensive implementation techniques.", "value": "Use of defensive implementation techniques." },
      { "label": "Use of MISRA C:2012", "value": "Use of MISRA C:2012" },
      { "label": "CERT C ", "value": "CERT C " },
      { "label": "C", "value": "C" },
      { "label": "others", "value": "others" },
    ],
    testMethods: [
      { "label": "Functional testing", "value": "Functional testing" },
      { "label": "Vulnerability scanning", "value": "Vulnerability scanning" },
      { "label": "Fuzz testing", "value": "Fuzz testing" },
      { "label": "Penetration testing", "value": "Penetration testing" },
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

      if (!item['Integration-Verification'] || item['Integration-Verification'] === false) {
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

  // Download concept phase report
  phaseReport = (ev, type = "PDF") => {
    ev.preventDefault();

    let params = {
      'programUuid': this.state.programUuid,
      'selectedInput': this.state.selectedInput ? this.state.selectedInput : [],
      'page': 'integration_verification'
    };

    // Get report
    httpPost(apify(`app/programs/phase-report?programUuid=${this.state.programUuid}`), params).then(data => {
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

    let designSpacification = this.state.designSpacification

    let requiredParameters = ['Cybersecurity-Design-Specification-Name']


    validated = this.validate(requiredParameters, designSpacification)


    if (designSpacification['Integration-Verification-Data']['Have-all-Cybersecurity-requirements-been-verified-File'] && typeof (designSpacification['Integration-Verification-Data']['Have-all-Cybersecurity-requirements-been-verified-File']) !== 'string') {
      await httpFile(apify('app/upload-file'), designSpacification['Integration-Verification-Data']['Have-all-Cybersecurity-requirements-been-verified-File']).then((res) => {

        if (res['success']) {
          designSpacification['Integration-Verification-Data']['Have-all-Cybersecurity-requirements-been-verified-File'] = res['url']
        }
      });
    }

    if (designSpacification['Integration-Verification-Data']['Does-this-requirement-fulfil-Cybersecurity-Specification-File'] && typeof (designSpacification['Integration-Verification-Data']['Does-this-requirement-fulfil-Cybersecurity-Specification-File']) !== 'string') {
      await httpFile(apify('app/upload-file'), designSpacification['Integration-Verification-Data']['Does-this-requirement-fulfil-Cybersecurity-Specification-File']).then((res) => {

        if (res['success']) {
          designSpacification['Integration-Verification-Data']['Does-this-requirement-fulfil-Cybersecurity-Specification-File'] = res['url']
        }
      });
    }
    if (designSpacification['Integration-Verification-Data']['Plan-for-End-of-Cybersecurity-Support-File'] && typeof (designSpacification['Integration-Verification-Data']['Plan-for-End-of-Cybersecurity-Support-File']) !== 'string') {
      await httpFile(apify('app/upload-file'), designSpacification['Integration-Verification-Data']['Plan-for-End-of-Cybersecurity-Support-File']).then((res) => {

        if (res['success']) {
          designSpacification['Integration-Verification-Data']['Plan-for-End-of-Cybersecurity-Support-File'] = res['url']
        }
      });
    }
    if (designSpacification['Integration-Verification-Data']['Test-Method-for-the-identified-Vulnerabilities-Software-File'] && typeof (designSpacification['Integration-Verification-Data']['Test-Method-for-the-identified-Vulnerabilities-Software-File']) !== 'string') {

      await httpFile(apify('app/upload-file'), designSpacification['Integration-Verification-Data']['Test-Method-for-the-identified-Vulnerabilities-Software-File']).then((res) => {

        if (res['success']) {
          designSpacification['Integration-Verification-Data']['Test-Method-for-the-identified-Vulnerabilities-Software-File'] = res['url']
        }
      });
    }
    if (designSpacification['Integration-Verification-Data']['Test-Method-for-the-identified-Vulnerabilities-Hardware-File'] && typeof (designSpacification['Integration-Verification-Data']['Test-Method-for-the-identified-Vulnerabilities-Hardware-File']) !== 'string') {
      await httpFile(apify('app/upload-file'), designSpacification['Integration-Verification-Data']['Test-Method-for-the-identified-Vulnerabilities-Hardware-File']).then((res) => {

        if (res['success']) {
          designSpacification['Integration-Verification-Data']['Test-Method-for-the-identified-Vulnerabilities-Hardware-File'] = res['url']
        }
      });
    }
    if (designSpacification['Integration-Verification-Data']['Test-Method-for-the-identified-Vulnerabilities-Toolchain-File'] && typeof (designSpacification['Integration-Verification-Data']['Test-Method-for-the-identified-Vulnerabilities-Toolchain-File']) !== 'string') {
      await httpFile(apify('app/upload-file'), designSpacification['Integration-Verification-Data']['Test-Method-for-the-identified-Vulnerabilities-Toolchain-File']).then((res) => {

        if (res['success']) {
          designSpacification['Integration-Verification-Data']['Test-Method-for-the-identified-Vulnerabilities-Toolchain-File'] = res['url']
        }
      });
    }

    if (validated) {

      designSpacification['Uuid'] = designSpacification['Uuid'] ? designSpacification['Uuid'] : uuidV4()
      designSpacification['Integration-Verification'] = true

      if (designSpacification['Integration-Verification-Data']['Any-identified-Vulnerabilities-Software-Vulnerability']) {
        designSpacification['Integration-Verification-Data']['Any-identified-Vulnerabilities-Software-Vulnerability'] = {
          'label': designSpacification['Integration-Verification-Data']['Any-identified-Vulnerabilities-Software-Vulnerability']['label'],
          'value': designSpacification['Integration-Verification-Data']['Any-identified-Vulnerabilities-Software-Vulnerability']['value'],
        }
      }
      if (designSpacification['Integration-Verification-Data']['Any-identified-Vulnerabilities-Hardware-Vulnerability']) {
        designSpacification['Integration-Verification-Data']['Any-identified-Vulnerabilities-Hardware-Vulnerability'] = {
          'label': designSpacification['Integration-Verification-Data']['Any-identified-Vulnerabilities-Hardware-Vulnerability']['label'],
          'value': designSpacification['Integration-Verification-Data']['Any-identified-Vulnerabilities-Hardware-Vulnerability']['value'],
        }
      }
      if (designSpacification['Integration-Verification-Data']['Any-identified-Vulnerabilities-Toolchain-Vulnerability']) {
        designSpacification['Integration-Verification-Data']['Any-identified-Vulnerabilities-Toolchain-Vulnerability'] = {
          'label': designSpacification['Integration-Verification-Data']['Any-identified-Vulnerabilities-Toolchain-Vulnerability']['label'],
          'value': designSpacification['Integration-Verification-Data']['Any-identified-Vulnerabilities-Toolchain-Vulnerability']['value'],
        }
      }

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
          item['Integration-Verification'] = false

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
        'Integration-Verification-Data': {
          ...this.state.designSpacification['Integration-Verification-Data'],
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
      <h4><b>Integration and Verification Summary</b></h4>
      {this.state.currentDesignSpecificationView && <table className="table table-bordered" id="modal-tuggle">
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
            <td>{'Does-this-requirement-fulfil-Cybersecurity-Specification-Text'.replaceAll('-', ' ')}</td>
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
          'Integration-Verification-Data': {
            'Test-Case-Uuid': uuidProject(this.state.program['id'], 'TCU', this.state.uuidCounters['TCU'] ? this.state.uuidCounters['TCU'] + 1 : 1),
            'Post-Development-Requirement-Uuid': uuidProject(this.state.program['id'], 'PDR-IV', this.state.uuidCounters['PDR-IV'] ? this.state.uuidCounters['PDR-IV'] + 1 : 1),
          },

        },
        uuidCounters: {
          'PDR-IV': this.state.uuidCounters['PDR-IV'] ? this.state.uuidCounters['PDR-IV'] + 1 : 1,
          'TCU': this.state.uuidCounters['TCU'] ? this.state.uuidCounters['TCU'] + 1 : 1
        },
        threat: ev['threat']
      }, () => {
      })
    })
  }


  // Mouted
  async componentDidMount() {
    // Page title
    setTitle("Integration and Verification - Product Development Phase");

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
                              <h3>Integration and Verification - Product Development Phase</h3>
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
                                      CyberSecurity Specification Design Verification Method
                                    </div>
                                    <div className="col-7">
                                      <Select options={this.state.designVerificationMethods}
                                        name="Design-Verification-Method"
                                        value={this.state.designSpacification['Integration-Verification-Data'] && this.state.designSpacification['Integration-Verification-Data']['Design-Verification-Method']}
                                        onChange={(ev) => {
                                          this.setState({
                                            designSpacification: {
                                              ...this.state.designSpacification,
                                              'Integration-Verification-Data': {
                                                ...this.state.designSpacification['Integration-Verification-Data'],
                                                "Design-Verification-Method": ev,
                                              }
                                            },
                                          })
                                        }} />
                                      <span className="text-danger text-error d-none" data-validation-key="groupName">Please select Group.</span>
                                    </div>
                                  </div>
                                </div>
                                {this.state.designSpacification['Integration-Verification-Data'] && this.state.designSpacification['Integration-Verification-Data']['Design-Verification-Method'] && this.state.designSpacification['Integration-Verification-Data']['Design-Verification-Method']['value'] === 'Requirements-based test' && <div className="col-md-12">
                                  <div className="form-group row pt-1">
                                    <div className="col-5 text-muted">
                                      Specify Test Environment
                                    </div>
                                    <div className="col-7">
                                      <input type="text" className="form-control md-form-control mt-2"
                                        defaultValue={this.state.designSpacification['Integration-Verification-Data'] && this.state.designSpacification['Integration-Verification-Data']['Specify-the-Test-Environment']}
                                        name="Specify-the-Test-Environment"
                                        onChange={(ev) => this.onDataChange(ev)}
                                        placeholder="Specify Test Environment " />
                                    </div>

                                  </div>
                                </div>}
                                <div className="col-md-12">
                                  <div className="form-group row pt-1">
                                    <div className="col-5 text-muted">
                                      Create New Test case
                                    </div>
                                    <div className="col-4">
                                      <input type="text" className="form-control md-form-control mt-2"
                                        defaultValue={this.state.designSpacification['Integration-Verification-Data'] && this.state.designSpacification['Integration-Verification-Data']['Test-Case']}
                                        name="Test-Case"
                                        onChange={(ev) => this.onDataChange(ev)}
                                        placeholder="Create New Test case" />
                                    </div>
                                    <div className="col-3">
                                      <input type="text" className="form-control md-form-control mt-2"
                                        defaultValue={this.state.designSpacification['Integration-Verification-Data'] && this.state.designSpacification['Integration-Verification-Data']['Test-Case-Uuid']}
                                        name="Test-Case-Uuid"
                                        placeholder="Create New Test case"
                                        disabled readOnly
                                      />
                                    </div>

                                  </div>
                                </div>
                                <div className="col-md-12">
                                  <div className="form-group row pt-1">
                                    <div className="col-5 text-muted">
                                      Configuration Intended for Series Production
                                    </div>
                                    <div className="col-7">
                                      <Select options={this.state.yesNoSelects}
                                        name="Configuration-Intended-for-Series-Production"
                                        value={this.state.designSpacification['Integration-Verification-Data'] && this.state.designSpacification['Integration-Verification-Data']['Configuration-Intended-for-Series-Production'] ? { 'label': 'Yes', value: 'Yes' } : { 'label': 'No', value: 'No' }}
                                        onChange={(ev) => {
                                          this.setState({
                                            designSpacification: {
                                              ...this.state.designSpacification,
                                              'Integration-Verification-Data': {
                                                ...this.state.designSpacification['Integration-Verification-Data'],
                                                "Configuration-Intended-for-Series-Production": ev.value === 'Yes' ? true : false,
                                              }
                                            },
                                          })
                                        }} />
                                      <span className="text-danger text-error d-none" data-validation-key="groupName">Please select Group.</span>
                                    </div>
                                  </div>
                                </div>
                                {this.state.designSpacification['Integration-Verification-Data'] && this.state.designSpacification['Integration-Verification-Data']['Configuration-Intended-for-Series-Production'] && this.state.designSpacification['Integration-Verification-Data']['Configuration-Intended-for-Series-Production'] === true && <div className="col-md-12">
                                  <div className="form-group row pt-1">
                                    <div className="col-5 text-muted">
                                      Configuration Intended for Series Production Value
                                    </div>
                                    <div className="col-7">
                                      <input type="text" className="form-control md-form-control mt-2"
                                        defaultValue={this.state.designSpacification['Integration-Verification-Data'] && this.state.designSpacification['Integration-Verification-Data']['Configuration-Intended-for-Series-Production-Value']}
                                        name="Configuration-Intended-for-Series-Production-Value"
                                        onChange={(ev) => this.onDataChange(ev)}
                                        placeholder="Configuration Intended for Series Production Value" />
                                    </div>

                                  </div>
                                </div>}

                                <div className="col-md-12">
                                  <div className="form-group row pt-1">
                                    <div className="col-5 text-muted">
                                      Confirmity with Modeling and Coding guidelines
                                    </div>
                                    <div className="col-7">
                                      <Creatable options={this.state.modelingandCodingguidelines}
                                        name="Confirmity-with-Modeling-and-Coding-guidelines"
                                        value={this.state.designSpacification['Integration-Verification-Data'] && this.state.designSpacification['Integration-Verification-Data']['Confirmity-with-Modeling-and-Coding-guidelines']}
                                        onChange={(ev) => {
                                          this.setState({
                                            designSpacification: {
                                              ...this.state.designSpacification,
                                              'Integration-Verification-Data': {
                                                ...this.state.designSpacification['Integration-Verification-Data'],
                                                "Confirmity-with-Modeling-and-Coding-guidelines": ev,
                                              }
                                            },
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
                                        value={this.state.designSpacification['Integration-Verification-Data'] && this.state.designSpacification['Integration-Verification-Data']['Any-identified-Vulnerabilities-Software'] === true ? { 'label': 'Yes', value: 'Yes' } : { 'label': 'No', value: 'No' }}
                                        onChange={(ev) => {
                                          this.setState({
                                            designSpacification: {
                                              ...this.state.designSpacification,
                                              'Integration-Verification-Data': {
                                                ...this.state.designSpacification['Integration-Verification-Data'],
                                                "Any-identified-Vulnerabilities-Software": ev.value === 'Yes' ? true : false,
                                              }
                                            },
                                          })
                                        }} />
                                      <span className="text-danger text-error d-none" data-validation-key="groupName">Please select Group.</span>
                                    </div>
                                    {this.state.designSpacification['Integration-Verification-Data'] && this.state.designSpacification['Integration-Verification-Data']['Any-identified-Vulnerabilities-Software'] && this.state.designSpacification['Integration-Verification-Data']['Any-identified-Vulnerabilities-Software'] === true && <div className="col-3">
                                      <Select options={this.state.vulnerabilityList}
                                        value={this.state.designSpacification['Integration-Verification-Data'] && this.state.designSpacification['Integration-Verification-Data']['Any-identified-Vulnerabilities-Software-Vulnerabilit']}
                                        name="Any-identified-Vulnerabilities-Software-Vulnerability"
                                        onChange={(ev) => {
                                          this.setState({
                                            designSpacification: {
                                              ...this.state.designSpacification,
                                              'Integration-Verification-Data': {
                                                ...this.state.designSpacification['Integration-Verification-Data'],
                                                "Any-identified-Vulnerabilities-Software-Vulnerability": ev,
                                              }

                                            },
                                          })
                                        }} />
                                      <span className="text-danger text-error d-none" data-validation-key="groupName">Please select Group.</span>
                                    </div>}
                                    {this.state.designSpacification['Integration-Verification-Data'] && this.state.designSpacification['Integration-Verification-Data']['Any-identified-Vulnerabilities-Software'] && this.state.designSpacification['Integration-Verification-Data']['Any-identified-Vulnerabilities-Software'] === true &&
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
                                        value={this.state.designSpacification['Integration-Verification-Data'] && this.state.designSpacification['Integration-Verification-Data']['Test-Method-for-the-identified-Vulnerabilities-Software'] === true ? { 'label': 'Yes', value: 'Yes' } : { 'label': 'No', value: 'No' }}
                                        onChange={(ev) => {
                                          this.setState({
                                            designSpacification: {
                                              ...this.state.designSpacification,
                                              'Integration-Verification-Data': {
                                                ...this.state.designSpacification['Integration-Verification-Data'],
                                                "Test-Method-for-the-identified-Vulnerabilities-Software": ev.value === 'Yes' ? true : false,
                                              }
                                            },
                                          })
                                        }} />
                                      <span className="text-danger text-error d-none" data-validation-key="groupName">Please select Group.</span>
                                    </div>
                                    {this.state.designSpacification['Integration-Verification-Data'] && this.state.designSpacification['Integration-Verification-Data']['Test-Method-for-the-identified-Vulnerabilities-Software'] && this.state.designSpacification['Integration-Verification-Data']['Test-Method-for-the-identified-Vulnerabilities-Software'] === true && <div className="col-3">
                                      <Select options={this.state.testMethods}
                                        name="Test-Method-for-the-identified-Vulnerabilities-Software-Data"
                                        value={this.state.designSpacification['Integration-Verification-Data'] && this.state.designSpacification['Integration-Verification-Data']['Test-Method-for-the-identified-Vulnerabilities-Software-Data']}
                                        onChange={(ev) => {
                                          this.setState({
                                            designSpacification: {
                                              ...this.state.designSpacification,
                                              'Integration-Verification-Data': {
                                                ...this.state.designSpacification['Integration-Verification-Data'],
                                                "Test-Method-for-the-identified-Vulnerabilities-Software-Data": ev,
                                              }
                                            },
                                          })
                                        }} />
                                      <span className="text-danger text-error d-none" data-validation-key="groupName">Please select Group.</span>
                                    </div>}
                                    {this.state.designSpacification['Integration-Verification-Data'] && !this.state.designSpacification['Integration-Verification-Data']['Test-Method-for-the-identified-Vulnerabilities-Software'] && <div className="col-3">
                                      <input type="text" className="form-control md-form-control mt-2"
                                        defaultValue={this.state.designSpacification['Integration-Verification-Data'] && this.state.designSpacification['Integration-Verification-Data']['Configuration-Intended-for-Series-Production-Value']}
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
                                        value={this.state.designSpacification['Integration-Verification-Data'] && this.state.designSpacification['Integration-Verification-Data']['Any-identified-Vulnerabilities-Hardware'] === true ? { 'label': 'Yes', value: 'Yes' } : { 'label': 'No', value: 'No' }}
                                        onChange={(ev) => {
                                          this.setState({
                                            designSpacification: {
                                              ...this.state.designSpacification,
                                              'Integration-Verification-Data': {
                                                ...this.state.designSpacification['Integration-Verification-Data'],
                                                "Any-identified-Vulnerabilities-Hardware": ev.value === 'Yes' ? true : false,
                                              }
                                            },
                                          })
                                        }} />
                                      <span className="text-danger text-error d-none" data-validation-key="groupName">Please select Group.</span>
                                    </div>
                                    {this.state.designSpacification['Integration-Verification-Data'] && this.state.designSpacification['Integration-Verification-Data']['Any-identified-Vulnerabilities-Hardware'] && this.state.designSpacification['Integration-Verification-Data']['Any-identified-Vulnerabilities-Hardware'] === true && <div className="col-3">
                                      <Select options={this.state.vulnerabilityList}
                                        value={this.state.designSpacification['Integration-Verification-Data'] && this.state.designSpacification['Integration-Verification-Data']['Any-identified-Vulnerabilities-Hardware-Vulnerabilit']}
                                        name="Any-identified-Vulnerabilities-Hardware-Vulnerability"
                                        onChange={(ev) => {
                                          this.setState({
                                            designSpacification: {
                                              ...this.state.designSpacification,
                                              'Integration-Verification-Data': {
                                                ...this.state.designSpacification['Integration-Verification-Data'],
                                                "Any-identified-Vulnerabilities-Hardware-Vulnerability": ev,
                                              }

                                            },
                                          })
                                        }} />
                                      <span className="text-danger text-error d-none" data-validation-key="groupName">Please select Group.</span>
                                    </div>}
                                    {this.state.designSpacification['Integration-Verification-Data'] && this.state.designSpacification['Integration-Verification-Data']['Any-identified-Vulnerabilities-Hardware'] && this.state.designSpacification['Integration-Verification-Data']['Any-identified-Vulnerabilities-Hardware'] === true &&
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
                                        value={this.state.designSpacification['Integration-Verification-Data'] && this.state.designSpacification['Integration-Verification-Data']['Test-Method-for-the-identified-Vulnerabilities-Hardware'] === true ? { 'label': 'Yes', value: 'Yes' } : { 'label': 'No', value: 'No' }}
                                        onChange={(ev) => {
                                          this.setState({
                                            designSpacification: {
                                              ...this.state.designSpacification,
                                              'Integration-Verification-Data': {
                                                ...this.state.designSpacification['Integration-Verification-Data'],
                                                "Test-Method-for-the-identified-Vulnerabilities-Hardware": ev.value === 'Yes' ? true : false,
                                              }
                                            },
                                          })
                                        }} />
                                      <span className="text-danger text-error d-none" data-validation-key="groupName">Please select Group.</span>
                                    </div>
                                    {this.state.designSpacification['Integration-Verification-Data'] && this.state.designSpacification['Integration-Verification-Data']['Test-Method-for-the-identified-Vulnerabilities-Hardware'] && this.state.designSpacification['Integration-Verification-Data']['Test-Method-for-the-identified-Vulnerabilities-Hardware'] === true && <div className="col-3">
                                      <Select options={this.state.testMethods}
                                        name="Test-Method-for-the-identified-Vulnerabilities-Hardware-Data"
                                        value={this.state.designSpacification['Integration-Verification-Data'] && this.state.designSpacification['Integration-Verification-Data']['Test-Method-for-the-identified-Vulnerabilities-Hardware-Data']}
                                        onChange={(ev) => {
                                          this.setState({
                                            designSpacification: {
                                              ...this.state.designSpacification,
                                              'Integration-Verification-Data': {
                                                ...this.state.designSpacification['Integration-Verification-Data'],
                                                "Test-Method-for-the-identified-Vulnerabilities-Hardware-Data": ev,
                                              }
                                            },
                                          })
                                        }} />
                                      <span className="text-danger text-error d-none" data-validation-key="groupName">Please select Group.</span>
                                    </div>}
                                    {this.state.designSpacification['Integration-Verification-Data'] && !this.state.designSpacification['Integration-Verification-Data']['Test-Method-for-the-identified-Vulnerabilities-Hardware'] && <div className="col-3">
                                      <input type="text" className="form-control md-form-control mt-2"
                                        defaultValue={this.state.designSpacification['Integration-Verification-Data'] && this.state.designSpacification['Integration-Verification-Data']['Configuration-Intended-for-Series-Production-Value']}
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
                                        value={this.state.designSpacification['Integration-Verification-Data'] && this.state.designSpacification['Integration-Verification-Data']['Any-identified-Vulnerabilities-Toolchain'] === true ? { 'label': 'Yes', value: 'Yes' } : { 'label': 'No', value: 'No' }}
                                        onChange={(ev) => {
                                          this.setState({
                                            designSpacification: {
                                              ...this.state.designSpacification,
                                              'Integration-Verification-Data': {
                                                ...this.state.designSpacification['Integration-Verification-Data'],
                                                "Any-identified-Vulnerabilities-Toolchain": ev.value === 'Yes' ? true : false,
                                              }
                                            },
                                          })
                                        }} />
                                      <span className="text-danger text-error d-none" data-validation-key="groupName">Please select Group.</span>
                                    </div>
                                    {this.state.designSpacification['Integration-Verification-Data'] && this.state.designSpacification['Integration-Verification-Data']['Any-identified-Vulnerabilities-Toolchain'] && this.state.designSpacification['Integration-Verification-Data']['Any-identified-Vulnerabilities-Toolchain'] === true && <div className="col-3">
                                      <Select options={this.state.vulnerabilityList}
                                        value={this.state.designSpacification['Integration-Verification-Data'] && this.state.designSpacification['Integration-Verification-Data']['Any-identified-Vulnerabilities-Toolchain-Vulnerabilit']}
                                        name="Any-identified-Vulnerabilities-Toolchain-Vulnerability"
                                        onChange={(ev) => {
                                          this.setState({
                                            designSpacification: {
                                              ...this.state.designSpacification,
                                              'Integration-Verification-Data': {
                                                ...this.state.designSpacification['Integration-Verification-Data'],
                                                "Any-identified-Vulnerabilities-Toolchain-Vulnerability": ev,
                                              }

                                            },
                                          })
                                        }} />
                                      <span className="text-danger text-error d-none" data-validation-key="groupName">Please select Group.</span>
                                    </div>}
                                    {this.state.designSpacification['Integration-Verification-Data'] && this.state.designSpacification['Integration-Verification-Data']['Any-identified-Vulnerabilities-Toolchain'] && this.state.designSpacification['Integration-Verification-Data']['Any-identified-Vulnerabilities-Toolchain'] === true &&
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
                                        value={this.state.designSpacification['Integration-Verification-Data'] && this.state.designSpacification['Integration-Verification-Data']['Test-Method-for-the-identified-Vulnerabilities-Toolchain'] === true ? { 'label': 'Yes', value: 'Yes' } : { 'label': 'No', value: 'No' }}
                                        onChange={(ev) => {
                                          this.setState({
                                            designSpacification: {
                                              ...this.state.designSpacification,
                                              'Integration-Verification-Data': {
                                                ...this.state.designSpacification['Integration-Verification-Data'],
                                                "Test-Method-for-the-identified-Vulnerabilities-Toolchain": ev.value === 'Yes' ? true : false,
                                              }
                                            },
                                          })
                                        }} />
                                      <span className="text-danger text-error d-none" data-validation-key="groupName">Please select Group.</span>
                                    </div>
                                    {this.state.designSpacification['Integration-Verification-Data'] && this.state.designSpacification['Integration-Verification-Data']['Test-Method-for-the-identified-Vulnerabilities-Toolchain'] && this.state.designSpacification['Integration-Verification-Data']['Test-Method-for-the-identified-Vulnerabilities-Toolchain'] === true && <div className="col-3">
                                      <Select options={this.state.testMethods}
                                        name="Test-Method-for-the-identified-Vulnerabilities-Toolchain-Data"
                                        value={this.state.designSpacification['Integration-Verification-Data']['Test-Method-for-the-identified-Vulnerabilities-Toolchain-Data']}
                                        onChange={(ev) => {
                                          this.setState({
                                            designSpacification: {
                                              ...this.state.designSpacification,
                                              'Integration-Verification-Data': {
                                                ...this.state.designSpacification['Integration-Verification-Data'],
                                                "Test-Method-for-the-identified-Vulnerabilities-Toolchain-Data": ev,
                                              }
                                            },
                                          })
                                        }} />
                                      <span className="text-danger text-error d-none" data-validation-key="groupName">Please select Group.</span>
                                    </div>}
                                    {this.state.designSpacification['Integration-Verification-Data'] && !this.state.designSpacification['Integration-Verification-Data']['Test-Method-for-the-identified-Vulnerabilities-Toolchain'] && <div className="col-3">
                                      <input type="text" className="form-control md-form-control mt-2"
                                        defaultValue={this.state.designSpacification['Integration-Verification-Data'] && this.state.designSpacification['Integration-Verification-Data']['Configuration-Intended-for-Series-Production-Value']}
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
                                <div className="col-md-12">
                                  <div className="form-group row pt-1">
                                    <div className="col-5 text-muted">
                                      Have all Cybersecurity requirements been verified
                                    </div>
                                    <div className="col-4">
                                      <Select options={this.state.yesNoSelects}
                                        name="Have-all-Cybersecurity-requirements-been-verified"
                                        value={this.state.designSpacification['Integration-Verification-Data'] && this.state.designSpacification['Integration-Verification-Data']['Have-all-Cybersecurity-requirements-been-verified'] === true ? { 'label': 'Yes', value: 'Yes' } : { 'label': 'No', value: 'No' }}
                                        onChange={(ev) => {
                                          this.setState({
                                            designSpacification: {
                                              ...this.state.designSpacification,
                                              'Integration-Verification-Data': {
                                                ...this.state.designSpacification['Integration-Verification-Data'],
                                                "Have-all-Cybersecurity-requirements-been-verified": ev.value === 'Yes' ? true : false,
                                              }
                                            },
                                          })
                                        }} />
                                      <span className="text-danger text-error d-none" data-validation-key="groupName">Please select Group.</span>
                                    </div>
                                    <div className="col-3">
                                      <input type="file" className="form-control md-form-control mt-2"
                                        // defaultValue={this.state.designSpacification['Integration-Verification-Data'] && this.state.designSpacification['Integration-Verification-Data']['Have-all-Cybersecurity-requirements-been-verified-File']}
                                        name="Have-all-Cybersecurity-requirements-been-verified-File"
                                        onChange={(ev) => this.onDataChange(ev)}
                                        placeholder="Plan for End of CyberSecurity Support Data" />
                                    </div>
                                  </div>
                                </div>
                                <div className="col-md-12">
                                  <div className="form-group row pt-1">
                                    <div className="col-5 text-muted">
                                      Have all Integration and Verification Methods been assessed
                                    </div>
                                    <div className="col-4">
                                      <Select options={this.state.yesNoSelects}
                                        name="Have-all-Integration-and-Verification-Methods-been-assessed"
                                        value={this.state.designSpacification['Integration-Verification-Data'] && this.state.designSpacification['Integration-Verification-Data']['Have-all-Integration-and-Verification-Methods-been-assessed'] === true ? { 'label': 'Yes', value: 'Yes' } : { 'label': 'No', value: 'No' }}
                                        onChange={(ev) => {
                                          this.setState({
                                            designSpacification: {
                                              ...this.state.designSpacification,
                                              'Integration-Verification-Data': {
                                                ...this.state.designSpacification['Integration-Verification-Data'],
                                                "Have-all-Integration-and-Verification-Methods-been-assessed": ev.value === 'Yes' ? true : false,
                                              }
                                            },
                                          })
                                        }} />
                                      <span className="text-danger text-error d-none" data-validation-key="groupName">Please select Group.</span>
                                    </div>
                                    {this.state.designSpacification['Integration-Verification-Data'] && this.state.designSpacification['Integration-Verification-Data']['Have-all-Integration-and-Verification-Methods-been-assessed'] && <div className="col-3">
                                      <input type="text" className="form-control md-form-control mt-2"
                                        defaultValue={this.state.designSpacification['Integration-Verification-Data'] && this.state.designSpacification['Integration-Verification-Data']['Have-all-Integration-and-Verification-Methods-been-assessed-Comment']}
                                        name="Have-all-Integration-and-Verification-Methods-been-assessed-Comment"
                                        onChange={(ev) => this.onDataChange(ev)}
                                        placeholder="Add Comments" />
                                    </div>}
                                  </div>
                                </div>
                                <div className="col-md-12">
                                  <div className="form-group row pt-1">
                                    <div className="col-5 text-muted">
                                      Does this requirement fulfil Cybersecurity Specification
                                    </div>
                                    <div className="col-4">
                                      <Select options={this.state.yesNoSelects}
                                        name="Does-this-requirement-fulfil-Cybersecurity-Specification"
                                        value={this.state.designSpacification['Integration-Verification-Data'] && this.state.designSpacification['Integration-Verification-Data']['Does-this-requirement-fulfil-Cybersecurity-Specification'] === true ? { 'label': 'Yes', value: 'Yes' } : { 'label': 'No', value: 'No' }}
                                        onChange={(ev) => {
                                          this.setState({
                                            designSpacification: {
                                              ...this.state.designSpacification,
                                              'Integration-Verification-Data': {
                                                ...this.state.designSpacification['Integration-Verification-Data'],
                                                "Does-this-requirement-fulfil-Cybersecurity-Specification": ev.value === 'Yes' ? true : false,
                                              }
                                            },
                                          })
                                        }} />
                                      <span className="text-danger text-error d-none" data-validation-key="groupName">Please select Group.</span>
                                    </div>
                                    {this.state.designSpacification['Integration-Verification-Data'] && this.state.designSpacification['Integration-Verification-Data']['Does-this-requirement-fulfil-Cybersecurity-Specification'] === true && <div className="col-3">
                                      <input type="file" className="form-control md-form-control mt-2"
                                        // defaultValue={this.state.designSpacification['Integration-Verification-Data'] && this.state.designSpacification['Integration-Verification-Data']['Does-this-requirement-fulfil-Cybersecurity-Specification-File']}
                                        name="Does-this-requirement-fulfil-Cybersecurity-Specification-File"
                                        onChange={(ev) => this.onDataChange(ev)}
                                        placeholder="Plan for End of CyberSecurity Support Data" />
                                    </div>}
                                    {this.state.designSpacification['Integration-Verification-Data'] && this.state.designSpacification['Integration-Verification-Data']['Does-this-requirement-fulfil-Cybersecurity-Specification'] === false && <div className="col-3">
                                      <input type="text" className="form-control md-form-control mt-2"
                                        defaultValue={this.state.designSpacification['Integration-Verification-Data'] && this.state.designSpacification['Integration-Verification-Data']['Does-this-requirement-fulfil-Cybersecurity-Specification-Text']}
                                        name="Does-this-requirement-fulfil-Cybersecurity-Specification-Text"
                                        onChange={(ev) => this.onDataChange(ev)}
                                        placeholder="Rationale" />
                                    </div>}
                                  </div>
                                </div>
                                <div className="col-md-12">
                                  <div className="form-group row pt-1">
                                    <div className="col-5 text-muted">
                                      Plan for End Of Cybersecurity Support
                                    </div>
                                    <div className="col-7">
                                      <Select options={this.state.yesNoSelects}
                                        name="Plan-for-End-of-Cybersecurity-Support"
                                        value={this.state.designSpacification['Integration-Verification-Data'] && this.state.designSpacification['Integration-Verification-Data']['Plan-for-End-of-Cybersecurity-Support'] === true ? { 'label': 'Yes', value: 'Yes' } : { 'label': 'No', value: 'No' }}
                                        onChange={(ev) => {
                                          this.setState({
                                            designSpacification: {
                                              ...this.state.designSpacification,
                                              'Integration-Verification-Data': {
                                                ...this.state.designSpacification['Integration-Verification-Data'],
                                                "Plan-for-End-of-Cybersecurity-Support": ev.value === 'Yes' ? true : false,
                                              }
                                            },
                                          })
                                        }} />
                                      <span className="text-danger text-error d-none" data-validation-key="groupName">Please select Group.</span>
                                    </div>

                                  </div>
                                </div>
                                {this.state.designSpacification['Integration-Verification-Data'] && this.state.designSpacification['Integration-Verification-Data']['Plan-for-End-of-CyberSecurity-Support'] === true && <div className='col-md-12'>
                                  <div className="form-group row pt-1">
                                    <div className="col-5 text-muted">
                                      State reasons for end of cybersecurity support
                                    </div>
                                    <div className="col-4">
                                      <input type="text" className="form-control md-form-control mt-2"
                                        defaultValue={this.state.designSpacification['Integration-Verification-Data']['Plan-for-End-of-CyberSecurity-Support-Data']}
                                        name="Plan-for-End-of-CyberSecurity-Support-Data"
                                        onChange={(ev) => this.onDataChange(ev)}
                                        placeholder="State reasons for end of cybersecurity support" />
                                    </div>
                                    <div className="col-3">
                                      <input type="file" className="form-control md-form-control mt-2"
                                        // defaultValue={this.state.designSpacification['Integration-Verification-Data']['Plan-for-End-of-CyberSecurity-Support-File']}
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
                                        defaultValue={this.state.designSpacification['Integration-Verification-Data'] && this.state.designSpacification['Integration-Verification-Data']['Post-Development-Requirement']}
                                        name="Post-Development-Requirement"
                                        onChange={(ev) => this.onDataChange(ev)}
                                        placeholder="Post Development Requirement" />
                                    </div>
                                    <div className="col-3">
                                      <input type="text" className="form-control md-form-control mt-2"
                                        defaultValue={this.state.designSpacification['Integration-Verification-Data'] && this.state.designSpacification['Integration-Verification-Data']['Post-Development-Requirement-Uuid']}
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
                              <h3>List of Integration and Verification</h3>
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
                          </div>}{(this.state.program['status'] !== 'APPROVED' && this.state.program['status'] !== 'UNDER-REVIEW') && <h3>Summary of Integration and Verification</h3>}
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
                                if (designSpacification['Integration-Verification']) {
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
                        {false && <div className="has-checkbox mb-3">
                          <input type="checkbox" className="mr-2" onChange={(event) => {
                            this.setState({
                              saveAndContinue: event.currentTarget.checked
                            })
                          }} />
                          <label>You are about to make the final submission for the vulnerabilities.</label>
                        </div>}
                        <Link to={programLifecycleRoute('Design-Specification', this.state.program['uuid'])} className="btn btn-success text-white">
                          Back to <b>Design Specification</b>
                        </Link>
                        <button className="btn btn-success ml-3" onClick={() => this.saveAndContinue()}>
                          Continue
                          <i className="fa fa-chevron-right ml-2"></i>
                        </button>
                        <button className="btn btn-primary  px-3 float-right" onClick={this.changeModalStatus} disabled={this.state.program['status'] !== 'APPROVED' && this.state.program['status'] !== 'UNDER-REVIEW'}>
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
                            Integration and Verification
                          </h4>
                          <button type="button" className="close" data-dismiss="modal">
                            <span>&times;</span>
                          </button>
                        </div>
                        <div className="modal-body widget-modal-body">
                          <h4><b>Design Specification Summary</b></h4>
                          {this.state.currentDesignSpecificationView && <table className="table table-bordered">
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



                          {this.popupTitleBody()}

                          <div class="row">
                            <div class="col-6">
                            </div>
                          </div>


                        </div>
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
                            Integration and Verification
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
                                <td><input class="mx-2 selectValueCheckbox" type="checkbox" value={'Security-Objective'} onChange={e => this.checkboxChange(e, 'Security-Objective')} />
                                  <label class="mb-0">{'Security-Objective'.replaceAll('-', ' ')} </label></td>
                              </tr>
                              <tr>
                                <td><input class="mx-2 selectValueCheckbox" type="checkbox" value={'Design-Verification-Method'} onChange={e => this.checkboxChange(e, 'Design-Verification-Method')} />
                                  <label class="mb-0">{'Design-Verification-Method'.replaceAll('-', ' ')} </label></td>
                              </tr>
                              <tr>
                                <td><input class="mx-2 selectValueCheckbox" type="checkbox" value={'Design-Verification-Method'} onChange={e => this.checkboxChange(e, 'Design-Verification-Method')} />
                                  <label class="mb-0">{'Design-Verification-Method'.replaceAll('-', ' ')} </label></td>
                              </tr>
                              <tr>
                                <td><input class="mx-2 selectValueCheckbox" type="checkbox" value={'Specify-the-Test-Environment'} onChange={e => this.checkboxChange(e, 'Specify-the-Test-Environment')} />
                                  <label class="mb-0">{'Specify-the-Test-Environment'.replaceAll('-', ' ')} </label></td>
                              </tr>
                              <tr>
                                <td><input class="mx-2 selectValueCheckbox" type="checkbox" value={'Test-Case'} onChange={e => this.checkboxChange(e, 'Test-Case')} />
                                  <label class="mb-0">{'Test-Case'.replaceAll('-', ' ')} </label></td>
                              </tr>
                              <tr>
                                <td><input class="mx-2 selectValueCheckbox" type="checkbox" value={'Configuration-Intended-for-Series-Production'} onChange={e => this.checkboxChange(e, 'Configuration-Intended-for-Series-Production')} />
                                  <label class="mb-0">{'Configuration-Intended-for-Series-Production'.replaceAll('-', ' ')} </label></td>
                              </tr>

                              <tr>
                                <td><input class="mx-2 selectValueCheckbox" type="checkbox" value={'Confirmity-with-Modeling-and-Coding-guidelines'} onChange={e => this.checkboxChange(e, 'Confirmity-with-Modeling-and-Coding-guidelines')} />
                                  <label class="mb-0">{'Confirmity-with-Modeling-and-Coding-guidelines'.replaceAll('-', ' ')} </label></td>
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

                              <tr>
                                <td><input class="mx-2 selectValueCheckbox" type="checkbox" value={'Have-all-Cybersecurity-requirements-been-verified'} onChange={e => this.checkboxChange(e, 'Have-all-Cybersecurity-requirements-been-verified')} />
                                  <label class="mb-0">{'Have-all-Cybersecurity-requirements-been-verified'.replaceAll('-', ' ')} </label></td>
                              </tr>
                              <tr>
                                <td><input class="mx-2 selectValueCheckbox" type="checkbox" value={'Have-all-Integration-and-Verification-Methods-been-assessed'} onChange={e => this.checkboxChange(e, 'Have-all-Integration-and-Verification-Methods-been-assessed')} />
                                  <label class="mb-0">{'Have-all-Integration-and-Verification-Methods-been-assessed'.replaceAll('-', ' ')} </label></td>
                              </tr>
                              <tr>
                                <td><input class="mx-2 selectValueCheckbox" type="checkbox" value={'Does-this-requirement-fulfil-Cybersecurity-Specification'} onChange={e => this.checkboxChange(e, 'Does-this-requirement-fulfil-Cybersecurity-Specification')} />
                                  <label class="mb-0">{'Does-this-requirement-fulfil-Cybersecurity-Specification'.replaceAll('-', ' ')} </label></td>
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
                          <a href="#!" download id="download"> </a>

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
                </div>
              }
            </div>
          }
        </div>

      </DashboardLayout>
    )
  }

}

export default IntegrationVerification


