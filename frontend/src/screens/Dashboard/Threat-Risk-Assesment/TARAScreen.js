// React
import React from 'react';
// Router
import { withRouter, Link } from 'react-router-dom';
// React Select
import Select from 'react-select'
// Layout
import DashboardLayout from "screens/Layouts/DashboardLayout";
// Loader
import PlaceholderLoader from 'components/ui/placeholder-loader/placeholder-loader';
// Helpers
import { setTitle, modal, uuidV4, nullIfEmpty, programLifecycleRoute, swalConfirmationPopup, triggerSwalLoader, swalPopup, getRandomBits } from "helpers/common";
// Network Helpers
import { httpGet, apify, httpPost } from 'helpers/network';
// Program
import Program from 'models/Program';
// Integration (HARA)
import IntegrationShowHazards from 'components/slots/IntegrationData/Hara/ShowHazards';
import SeCLRatinOptions from './slots/SeCLRatingOptions';
import AFRRatinOptions from './slots/AFRRatingOptions';
// jQuery
const jQuery = window.jQuery;

// Threat Analysis & Assesment Screen (TARA)
class TARAScreen extends React.Component {
  state = {
    loading: true,
    programUuid: undefined,
    program: undefined,
    configuration: undefined,
    threats: undefined,
    assets: undefined,
    property: undefined,

    securityPropertyOption: undefined,
    cyberSecurityImpactRatings: {},

    activeThreat: undefined,

    wp24Annex5Options: [],
    wp24Annex5Scenarios: [],

    threatTypes: [],

    attackTypes: [],
    defaultAttackType: {},

    currentConfigureStep: {},
    stepAssignmentSteps: {
      all: [],
      andSteps: [],
      orSteps: [],
    },
    stepAssignmentStepsValue: {
      "name": null,
      "is_target": false,
      "and_with": [],
      "or_with": [],
      "type": null
    },
    attackAltData: {},
    hazopFunctions: [],

    showUseSeclRatingPrompt: false,
    optionsShowUseSeclRatingPrompt: [
      {"label": "Use SeCL", "value": true},
      {"label": "Use AFR", "value": false},
    ],
    useSeclRatingOption: {
      "label": "Use AFR", "value": false
    },
    useSeclRating: false,
    modalCtx: false,

    haraHazopObject: undefined,
  };

  // Threat types Option array
  prepareThreatTypes = (types) => {
    let threatTypes = [];
    types.forEach(type => {
      threatTypes.push({
        label: type,
        value: type,
      });
    });
    return threatTypes;
  }

  // WP 24 Annex5Options
  prepareWp24Annex5Options = (conf) => {
    var types = conf['Types'];
    var options = [];

    types.forEach(type => {
      options.push({
        label: type['Title'],
        value: type['Title'],
        scenarios: type['Internal-Types'],
      })
    });

    return options;
  }

  // Add Attack Step
  // [UPDATE] Add `ctx` to re-render the React sub-components
  addAttackStep = () => {
    this.setState({
      currentConfigureStep: null,
      modalCtx: true,
    }, () => {
      setTimeout(() => {
        modal('#ModalAddAttackStep', {
          show: true,
        });
      }, 1000);
    })
  }

  // stepAssignment
  stepAssignment = (ev, Prevstep = false) => {
    ev.preventDefault();
    var steps = []
    var andsteps = []
    var orsteps = []
    var attackAltData = this.state.attackAltData ? this.state.attackAltData : {}

    if (attackAltData[this.state.activeThreat['RefId']] && Object.values(attackAltData[this.state.activeThreat['RefId']]).length > 0) {
      let andAll = [];

      Object.values(attackAltData[this.state.activeThreat['RefId']]).map(step => {
        step['uuid'] = uuidV4();
        step['and_with'].map((and, key) => {
          andAll.push(and)
          return null;
        })
        step['or_with'].map((or, key) => {
          andAll.push(or)
          return null;
        })
        return null;
      });

      this.state.activeThreat['Attack-Steps'].map(attack => {
        if (!attackAltData[this.state.activeThreat['RefId']][attack['Attack-Step']]) {
          steps.push({ label: attack['Attack-Step'], value: attack['Attack-Step'] })
        }
        if (!andAll[attack['Attack-Step']]) {
          if (!andAll.includes(attack['Attack-Step'])) {
            andsteps.push({ label: attack['Attack-Step'], value: attack['Attack-Step'] })
          }
        }
        if (!andAll[attack['Attack-Step']]) {
          if (!andAll.includes(attack['Attack-Step'])) {
            orsteps.push({ label: attack['Attack-Step'], value: attack['Attack-Step'] })
          }
        }
        return null;
      });
    }
    
    else {
      this.state.activeThreat['Attack-Steps'].map(step => {
        steps.push({ label: step['Attack-Step'], value: step['Attack-Step'] })
        andsteps.push({ label: step['Attack-Step'], value: step['Attack-Step'] })
        orsteps.push({ label: step['Attack-Step'], value: step['Attack-Step'] })
        return null;
      });
    }

    if (Prevstep) {
      let andPrev = []
      let orPrev = []
      Prevstep['and_with'] && Prevstep['and_with'].map(and => {
        andsteps.push({ label: and, value: and });
        andPrev.push({ label: and, value: and });
        return;
      });

      Prevstep['or_with'] && Prevstep['or_with'].map(or => {
        orsteps.push({ label: or, value: or });
        orPrev.push({ label: or, value: or });
        return;
      });

      this.setState({
        stepAssignmentStepsValue: Prevstep,
        nameAssignmentvalue: { label: Prevstep['name'], value: Prevstep['name'] },
        andAssignValue: this.removeAllDuplicateSteps(andPrev),
        orAssignValue: orPrev,
      });
    }

    this.setState({
      stepAssignmentSteps: {
        all: steps,
        andSteps: this.removeAllDuplicateSteps(andsteps),
        orSteps: this.removeAllDuplicateSteps(orsteps),
      }
    }, () => {
      modal('#ModalStepAssignment', {
        show: true,
      });
    });
  }

  // removeAllDuplicateSteps
  removeAllDuplicateSteps = (stepArray) => {
    console.log("removeAllDuplicateSteps@x", stepArray);
    return stepArray;
  }

  // removeDuplicateItemsFromArray
  removeAllDuplicateSteps = (arr) => {
    return arr.filter((item,
      index) => arr.indexOf(item) === index);
  }

  // resetStepAssignment
  resetStepAssignment = (ev, step) => {
    ev.preventDefault();
    let existingSteps = this.state.attackAltData[this.state.activeThreat['RefId']];
    delete existingSteps[step['name']];
    let attackAltData = this.state.attackAltData;
    let key = this.state.activeThreat['RefId'];
    attackAltData[key] = existingSteps;

    this.setState({
      attackAltData: attackAltData,
    });
  }

  // Get associated HazopUuids and set in Threat
  onUpdateHaraHazopUuids = (haraHazopObject) => {
    this.setState({
      haraHazopObject: haraHazopObject
    });
  }

  // onChnageStep
  onChnageStep = (step) => {
    let andSteps = this.state.stepAssignmentSteps.andSteps.filter(stepdata => stepdata.value !== step.value)
    let orSteps = this.state.stepAssignmentSteps.orSteps.filter(stepdata => stepdata.value !== step.value)
    this.setState({
      stepAssignmentSteps: {
        ...this.state.stepAssignmentSteps,
        andSteps: andSteps,
        orSteps: orSteps,
      },
      stepAssignmentStepsValue: {
        ...this.state.stepAssignmentStepsValue,
        name: step.value,
      },
      nameAssignmentvalue: step
    })
  }
  
  // onChangeUseSeclRatingPrompt
  onChangeUseSeclRatingPrompt = (option) => {
    this.setState({
      useSeclRatingOption: option,
      useSeclRating: option['value'],
    });
  }

  // onChnageAndStep
  onChnageAndStep = (step) => {
    let andSteps = this.state.stepAssignmentStepsValue['and_with'] ? this.state.stepAssignmentStepsValue['and_with'] : [];
    step.map(st => {
      andSteps.push(st.value)
      return null
    });

    let orSteps = this.state.stepAssignmentSteps.orSteps.filter(stepdata => !andSteps.includes(stepdata.value));

    this.setState({
      stepAssignmentSteps: {
        ...this.state.stepAssignmentSteps,
        orSteps: orSteps,
      },
      andAssignValue: step
    })
  }

  onChnageOrStep = (step) => {


    let orSteps = this.state.stepAssignmentStepsValue['or_with'] ? this.state.stepAssignmentStepsValue['or_with'] : []


    step.map(st => {
      orSteps.push(st.value)
      return null
    })

    let andSteps = this.state.stepAssignmentSteps.andSteps.filter(stepdata => !orSteps.includes(stepdata.value))
    this.setState({
      stepAssignmentSteps: {
        ...this.state.stepAssignmentSteps,
        andSteps: andSteps,
      },
      stepAssignmentStepsValue: {
        ...this.state.stepAssignmentStepsValue,
        or_with: orSteps,
      },
      orAssignValue: step
    })
  }

  onChangeSecurityObjectiveGate = (ev) => {
    ev.preventDefault();
    triggerSwalLoader();

    httpPost(apify('app/program/stable-attack-tree'), {
      programUuid: this.state.programUuid,
      threatUuid: this.state.activeThreat['RefId'],
      securityObjective: this.state.property['Security-Objective']['Value'],
      attackSteps: this.state.activeThreat['Attack-Steps'],
      inputAttacks: jQuery('#Assignment-Form-Input-Attacks').val(),
      logic: jQuery('#Assignment-Form-Gate-Value').val(),
    }).then(data => {
      if (data['success']) {
        swalPopup("Attack tree updated.", 'success');
      }
    });
  }

  onSubmitAssignment = (ev) => {
    ev.preventDefault();
    let vm = this
    let attackAltData = this.state.attackAltData;

    if (!attackAltData[this.state.activeThreat['RefId']]) {
      attackAltData[this.state.activeThreat['RefId']] = [];
    }
    attackAltData[this.state.activeThreat['RefId']][this.state.stepAssignmentStepsValue['name']] = this.state.stepAssignmentStepsValue;

    httpPost(apify('app/program/add-step-assignment'), {
      programUuid: vm.state.programUuid,
      threatID: vm.state.activeThreat['RefId'],
      attackAltData: this.state.stepAssignmentStepsValue,
    }).then(res => {
      this.setState({
        attackAltData: attackAltData,
        stepAssignmentSteps: {
          all: [],
          andSteps: [],
          orSteps: [],
        },
        stepAssignmentStepsValue: {
          "name": null,
          "is_target": false,
          "and_with": [],
          "or_with": [],
          "type": null
        },
        nameAssignmentvalue: null,
        orAssignValue: null,
        andAssignValue: null,
      })
      modal('#ModalStepAssignment', 'hide');
    });

  }

  // onChangeWp24Annex5Options
  onChangeWp24Annex5Options = (ev) => {
    var scenarios = ev['scenarios'];
    var wp24Annex5Scenarios = [];

    scenarios.forEach(scenario => {
      wp24Annex5Scenarios.push({
        label: scenario,
        value: scenario,
      })
    });

    var activeThreat = this.state.activeThreat;
    activeThreat['Type-WP24-Annex-5'] = ev['value'];

    this.setState({
      activeThreat: activeThreat,
      wp24Annex5Scenarios: wp24Annex5Scenarios
    }, () => {


    });
  }

  // onChangeWp24Annex5Scenarios
  onChangeWp24Annex5Scenarios = (ev) => {
    var activeThreat = this.state.activeThreat;
    activeThreat['Threat-Sub-Scenario'] = ev['value'];
    this.setState({
      activeThreat: activeThreat
    });
  }

  // onChangeThreatType
  onChangeThreatType = (ev) => {
    var activeThreat = this.state.activeThreat;
    activeThreat['Threat-Type'] = ev;
    this.setState({
      activeThreat: activeThreat,
      attackAltData: {}
    });
  }

  // onChangeAttackType
  onChangeAttackType = (ev) => {
    this.setState({
      defaultAttackType: ev
    }, () => {
      // this.onChangeSecurityPropertyOption(this.state.securityPropertyOption)
    });
  }

  // updateThreat
  updateThreat = (key, updateObject) => {
  }

  // prepareAssetOptions
  prepareAssetOptions = (threats) => {
    var assetArray = [];
    threats['Items'].forEach(item => {
      if (item['Identified']) {

        //
        var securityPropertyOptions = [];
        var allowedSecurityProperties = [];
        item['Cyber-Security-Properties'].forEach(securityProperty => {
          securityPropertyOptions.push({
            label: securityProperty,
            value: securityProperty,
          });

          if (!item['Threats'][securityProperty]['Threat-Identified']) {
            allowedSecurityProperties.push({
              label: securityProperty,
              value: securityProperty,
            });
          }
        });
        item['Cyber-Security-Properties-Options'] = securityPropertyOptions;

        if (allowedSecurityProperties.length > 0) {
          assetArray.push({
            value: item['RefId'],
            label: item['Name'],
            property: item,
          });
        }
      }
    });
    return assetArray;
  }

  // allowedCyberSecurityProperties
  allowedCyberSecurityProperties = () => {
    let allowedSecurityProperties = [];
    let securityProperties = this.state.property['Cyber-Security-Properties'];
    let threats = this.state.property['Threats'];

    securityProperties.forEach(property => {
      if (!threats[property]['Threat-Identified']) {
        allowedSecurityProperties.push({
          label: property,
          value: property,
        });
      }
    });

    return allowedSecurityProperties;
  }

  // Assets changed
  onChangeAssetOption = (ev) => {
    let functionAssets = this.state['program']['assets']['Functions'];
    let functionAssetsNames = functionAssets.map((f) => {
      return f['Name'];
    });
    let currentSelectAsset = ev['label'];
    let showUseSeclRatingPrompt = functionAssetsNames.includes(currentSelectAsset) ?? false;
    let idx = showUseSeclRatingPrompt ? 0 : 1;

    // Make SeCL prompt open if required 
    this.setState({
      property: ev['property'],
      assetSelected: ev,
      showUseSeclRatingPrompt: showUseSeclRatingPrompt,
      useSeclRatingOption: this.state.optionsShowUseSeclRatingPrompt[idx],
      useSeclRating: showUseSeclRatingPrompt,
    });
  }

  // onChangeSecurityPropertyOption
  onChangeSecurityPropertyOption = (ev) => {
    let property = this.state.property;
    let activeThreat = property['Threats'][ev['value']];

    if (this.state.defaultAttackType && this.state.defaultAttackType['value'] && this.state.defaultAttackType['value'] === 'Vulnerability') {
      activeThreat = property['Additional-Vulnerability-Attacks'] && property['Additional-Vulnerability-Attacks'][ev['value']] && property['Additional-Vulnerability-Attacks'][ev['value']].length > 0 ? property['Additional-Vulnerability-Attacks'][ev['value']][0] : null
    }

    let vm = this;
    this.setState({ activeThreat: null, securityPropertyOption: null }, () => {
      this.setState({
        securityPropertyOption: ev,
        activeThreat: activeThreat,
      }, () => {

        if (activeThreat) {
          this.state.wp24Annex5Options.map(data => {

            if (data.label === activeThreat['Type-WP24-Annex-5']) {

              var scenarios = data['scenarios'];
              var wp24Annex5Scenarios = [];

              scenarios.forEach(scenario => {
                wp24Annex5Scenarios.push({
                  label: scenario,
                  value: scenario,
                })
              });

              vm.setState({
                wp24Annex5Scenarios: wp24Annex5Scenarios
              }, () => {
                // (Take reference from memory for previous entries)
                let impactRatingMaster = ["Safety", "Finanical", "Operational", "Privacy"];
                impactRatingMaster.forEach(masterName => {
                  var ele = document.getElementsByName(masterName);
                  for (var i = 0; i < ele.length; i++) {
                    if (ele[i].value === activeThreat['Impact-Ratings'][masterName]) {
                      ele[i].checked = true;
                    } else {
                      ele[i].checked = false;
                    }
                  }
                });
              });
            }
            return true;
          })

          this.calculateThreatImpactRating();

          activeThreat['Attack-Steps'].map(async (step, i) => {
            let attackStepFeasibility = await window.ProgramObject.attackStepFeasibilityRatingMappingColor(step['Attack-Step-Attack-Feasibility-Rating']);
            jQuery(`#Attack-Step-Attack-Feasibility-Rating-${i}`).css({
              'background': attackStepFeasibility,
            });

            let impactrating = await window.ProgramObject.impactRatingsColor(step['Attack-Step-Impact-Rating']);
            jQuery(`#Attack-Step-Impact-Rating-${i}`).css({
              'background': impactrating,
            });
            let riskMaping = await window.ProgramObject.riskMappingColor(step['Attack-Step-Risk-Rating']);
            jQuery(`#Attack-Step-Risk-Rating-${i}`).css({
              'background': riskMaping,
            });
            return null;
          })
        }
      });
    })
  }

  // onChangeImpactRatingRadio
  onChangeImpactRatingRadio = (ev) => {
    let { name, value } = ev.target;
    var cyberSecurityImpactRatings = this.state.cyberSecurityImpactRatings;
    var activeThreat = this.state.activeThreat;

    cyberSecurityImpactRatings.forEach((rating, idx) => {
      if (rating['type'] === name) {
        rating['value'] = value;
        cyberSecurityImpactRatings[idx] = rating;
        activeThreat['Impact-Ratings'][name] = value;
      }
    });

    this.setState({
      cyberSecurityImpactRatings: cyberSecurityImpactRatings,
      activeThreat: activeThreat
    }, () => {
      this.calculateThreatImpactRating();
    });
  }

  // Calculate Impact Rating (TR)
  calculateThreatImpactRating = async () => {
    var canHaveImpactRating = true;
    var activeThreat = this.state.activeThreat;

    // Type= [Safety, Finanical, Operational, Privacy]
    for (let type in activeThreat['Impact-Ratings']) {
      if (activeThreat['Impact-Ratings'][type] === null) {
        canHaveImpactRating = false;
      }
    }

    // If values are defined for Asset Impact Ratings Options
    if (canHaveImpactRating) {
      let impactRating = await window.ProgramObject.calculateImpactRating(activeThreat['Impact-Ratings']);
      activeThreat['Impact-Rating-Value'] = impactRating['Impact'];

      for (let i = 0; i < activeThreat['Attack-Steps'].length; i++) {
        let step = activeThreat['Attack-Steps'][i]
        activeThreat['Attack-Steps'][i]['Attack-Step-Impact-Rating'] = impactRating['Impact']

        let params = {
          [`Elapsed-Time-${step['Attack-Step-Elapsed-Time']}`]: step['Attack-Step-Elapsed-Time'],
          [`Equipment-Effort-${step['Attack-Step-Equipment-Effort']}`]: step['Attack-Step-Equipment-Effort'],
          [`Knowledge-Of-Item-${step['Attack-Step-Knowledge-Of-Item']}`]: step['Attack-Step-Knowledge-Of-Item'],
          [`Specialist-Expertise-${step['Attack-Step-Specialist-Expertise']}`]: step['Attack-Step-Specialist-Expertise'],
          [`Window-Of-Opportunity-${step['Attack-Step-Window-Of-Opportunity']}`]: step['Attack-Step-Window-Of-Opportunity']
        }
        
        let attackStepFeasibility = await window.ProgramObject.calculateAttackStepFeasibilityRating(params, impactRating['Impact']);
        activeThreat['Attack-Steps'][i]['Attack-Step-Risk-Rating'] = attackStepFeasibility['Risk-Value']['Value']

        // Update CAL 
        let calLevel = await window.ProgramObject.calculateCalLevel(activeThreat);
        activeThreat['Attack-CAL'] = calLevel;
        activeThreat['Attack-Feasibility-Rating'] = await window.ProgramObject.calculateFeasibilityRating(activeThreat);
        activeThreat['Attack-Risk-Value'] = await window.ProgramObject.calculateRiskvalue(activeThreat);
        jQuery('#Cyber-Security-Assurance-Level-Rating').text(calLevel['Value']);
        
        let calColor = await window.ProgramObject.calValueMappingColor(calLevel['Value']);
        jQuery(`#Cyber-Security-Assurance-Level-Rating-Parent`).css({
          'background': calColor,
        });
      }

      // After rating calculation for Attack
      // Update every attack step's attribute
      this.setState({
        activeThreat: activeThreat
      }, () => {
        jQuery('.Impact-Rating-Color').css({
          'backgroundColor': impactRating['Color'],
        });

        activeThreat['Attack-Steps'].map(async (step, i) => {
          let attackStepFeasibility = await window.ProgramObject.attackStepFeasibilityRatingMappingColor(step['Attack-Step-Attack-Feasibility-Rating']);
          jQuery(`#Attack-Step-Attack-Feasibility-Rating-${i}`).css({
            'background': attackStepFeasibility,
          });

          let impactrating = await window.ProgramObject.impactRatingsColor(step['Attack-Step-Impact-Rating']);
          jQuery(`#Attack-Step-Impact-Rating-${i}`).css({
            'background': impactrating,
          });

          let riskMaping = await window.ProgramObject.riskMappingColor(step['Attack-Step-Risk-Rating']);
          jQuery(`#Attack-Step-Risk-Rating-${i}`).css({
            'background': riskMaping,
          });

          return null;
        })
      });
    }
  }

  // impactRatingRadioValue
  impactRatingRadioValue = (type, value) => {
    var hasValue = false;
    var cyberSecurityImpactRatings = this.state.cyberSecurityImpactRatings;
    cyberSecurityImpactRatings.forEach(rating => {
      if (!hasValue && rating['type'] === type && rating['value'] === value) {
        hasValue = true;
      }
    });
    return hasValue;
  }

  // configureAttackStep
  configureAttackStep = (ev, attackStepRefId, step) => {
    ev.preventDefault();
    this.setState({
      currentConfigureStep: step,
      modalCtx: true,
    }, () => {
      setTimeout(() => {
        modal('#ModalAddAttackStep', {
          show: true,
        });
      }, 1000);
    });
  }

  // deleteAttackStep
  deleteAttackStep = (ev, attackStepRefId, step) => {
    ev.preventDefault();
    
    var vm = this;
    swalConfirmationPopup({
      title: null,
      text: "This action will remove the step in threat.",
      confirmButtonText: "Remove",
    }, () => {
      let activeThreat = vm.state.activeThreat
      activeThreat['Attack-Steps'] = activeThreat['Attack-Steps'].filter((attackstep, key) => step['Attack-Step-RefId'] !== attackstep['Attack-Step-RefId'])
      vm.setState({
        activeThreat: activeThreat
      }, () => {

      })
    });
  }

  // UI tasks / Dialog
  registerUiTasks = () => {
    var vm = this;

    // When `Attack Step` dialog is open
    jQuery('#ModalAddAttackStep').on('shown.bs.modal', function () {
      jQuery('.select').selectpicker('refresh');
      jQuery('#Modal-Input-Attack-Step').trigger('focus')
      jQuery('.alert-attack-value').text('');

      if (vm.state.activeThreat['Attack-Steps'].length > 0) {
        jQuery('#Modal-Input-Attack-Logic-Container').show();
      } else {
        jQuery('#Modal-Input-Attack-Logic-Container').hide();
      }

      if (!vm.state.currentConfigureStep || !vm.state.currentConfigureStep['Attack-Step-RefId']) {
        jQuery('#Form-Modal-Add-Attack-Step').trigger('reset');
        
        if (vm.state.useSeclRating) {
          jQuery('.input-security-level-ratings').trigger('change');
        } else {
          jQuery('.input-attack-step-feasibility-ratings').trigger('change');
        }

      } else {
        vm.calculateAttackStepFeasibilityRating();
      }
    });

    // On dialog hidden reset Current Attack Step context
    jQuery('#ModalAddAttackStep').on('hidden.bs.modal', function () {
      vm.setState({
        currentConfigureStep: null,
        modalCtx: false,
      });
    });

    // Fire events to calculate ratings when Option changes for matrix in dialog
    jQuery('body').on('change', '.input-attack-step-feasibility-ratings', function () {
      vm.calculateAttackStepFeasibilityRating();
    });
    jQuery('body').on('change', '.input-security-level-ratings', function () {
      vm.calculateAttackStepFeasibilityRating();
    });
  }

  // Calculate Attack Step Feasibility Rating
  calculateAttackStepFeasibilityRating = async () => {
    if (!this.state.activeThreat['Impact-Rating-Value']) {
      alert("Please re-load application, Impact Rating fetching failed.");
      return;
    }

    let params = {};

    // Prepare params matrix (AFR)
    jQuery('.input-attack-step-feasibility-ratings').each(function (idx, self) {
      let selectName = jQuery(this).attr('name');
      let optionValue = jQuery(this).val();
      let inputKey = `${selectName}-${optionValue}`;
      if ((selectName !== undefined) && (optionValue !== undefined) && inputKey) {
        params[inputKey] = optionValue;
      }
    });
    
    // Prepare params matrix (SeCL)
    jQuery('.input-security-level-ratings').each(function (idx, self) {
      let selectName = jQuery(this).attr('name');
      let optionValue = jQuery(this).val();
      if ((selectName !== undefined) && (optionValue !== undefined)) {
        params[selectName] = optionValue;
      }
    });

    // Get impact rating
    let impactRating = this.state.activeThreat['Impact-Rating-Value'];
    // Get AFR based on IR + Param Matrix 
    // Update: SeCL rating added
    let attackStepFeasibility = await window.ProgramObject.calculateAttackStepFeasibilityRating(params, impactRating, this.state['useSeclRating']);

    // AFR (Value + Color) in dialog
    jQuery('#Modal-Input-Attack-Feasibility-Rating').text(attackStepFeasibility['Impact']);
    jQuery('#Modal-Input-Attack-Feasibility-Rating').closest('.alert').css({
      'background': attackStepFeasibility['Color'],
    });

    // SeCL
    jQuery('#Modal-Input-Security-Level-Rating').text(attackStepFeasibility['SeCL']['Value']);
    jQuery('#Modal-Input-Security-Level-Rating').closest('.alert').css({
      'background': attackStepFeasibility['SeCL']['Color'],
    });

    // IR (Value + Color) in dialog
    jQuery('#Modal-Input-Impact-Rating').text(attackStepFeasibility['Impact-Rating']['Value']);
    jQuery('#Modal-Input-Impact-Rating').closest('.alert').css({
      'background': attackStepFeasibility['Impact-Rating']['Color'],
    });

    // RR (Value + Color) in dialog
    jQuery('#Modal-Input-Risk-Rating').text(attackStepFeasibility['Risk-Value']['Value']);
    jQuery('#Modal-Input-Risk-Rating').closest('.alert').css({
      'background': attackStepFeasibility['Risk-Value']['Color'],
    });
  }

  // onSubmitAddAttackStep
  onSubmitAddAttackStep = async (ev) => {
    ev.preventDefault();
    var vm = this;

    let attackStepLogic = (this.state.activeThreat['Attack-Steps'].length > 0) ? jQuery('#Modal-Input-Attack-Logic').val() : null;

    let attackStep = {
      'Attack-Step': jQuery('#Modal-Input-Attack-Step').val(),
      'Attack-Step-RefId': uuidV4(),
      'Attack-Step-Logic': attackStepLogic,
      'Attack-Step-Description': jQuery('#Modal-Input-Attack-Description').val(),
      'Attack-Step-Specialist-Expertise': jQuery('#Modal-Input-Attack-Specialist-Expertise').val(),
      'Attack-Step-Window-of-Opportunity': jQuery('#Modal-Input-Attack-Window-of-Opportunity').val(),
      'Attack-Step-Attack-Equipment': jQuery('#Modal-Input-Attack-Equipment').val(),
      'Attack-Step-Attack-Elapsed-Time': jQuery('#Modal-Input-Attack-Elapsed-Time').val(),
      'Attack-Step-Knowledge-of-Item': jQuery('#Modal-Input-Attack-Knowledge-of-Item').val(),
      'Attack-Step-Attack-Feasibility-Rating': jQuery('#Modal-Input-Attack-Feasibility-Rating').text(),
      'Attack-Step-Impact-Rating': jQuery('#Modal-Input-Impact-Rating').text(),
      'Attack-Step-Risk-Rating': jQuery('#Modal-Input-Risk-Rating').text(),
      'Attack-Step-Required-Resources': jQuery('#Modal-Input-Attack-Required-Resources').val(),
      'Attack-Step-Required-Knowhow': jQuery('#Modal-Input-Attack-Required-Knowhow').val(),
      'Attack-Step-Threat-Level': jQuery('#Modal-Input-Threat-Level').val(),
      'Attack-Step-Security-Leval-Rating': jQuery('#Modal-Input-Security-Level-Rating').text(),
      'Attack-Step-Security-Leval-Rating-Color': jQuery('#Modal-Input-Security-Level-Rating').parent().css('backgroundColor'),
      'Attack-Step-SeCL-Pref': vm.state['useSeclRating'],
    };

    // Either update/add (UPSERT) steps into Attack Step pool
    var activeThreat = this.state.activeThreat;
    if (this.state.currentConfigureStep && this.state.currentConfigureStep['Attack-Step-RefId']) {
      activeThreat['Attack-Steps'].map((step, key) => {
        if (step['Attack-Step-RefId'] === this.state.currentConfigureStep['Attack-Step-RefId']) {
          attackStep['Attack-Step-RefId'] = this.state.currentConfigureStep['Attack-Step-RefId'];
          activeThreat['Attack-Steps'][key] = attackStep;
        }
        // `array-callback-return`, remove below `return` if something is broken. 
        return true;
      });
    } 

    else {
      activeThreat['Attack-Steps'].push(attackStep);
    }

    // Update Threat-level property
    activeThreat['Prefer-SeCL-Ratings'] = vm.state['useSeclRating'];
    activeThreat['Hazop-Object-Data'] = vm.state['haraHazopObject'];
    
    // On attack-level 
    // CAL
    let calLevel = await window.ProgramObject.calculateCalLevel(activeThreat);
    activeThreat['Attack-CAL'] = calLevel;

    activeThreat['Attack-Feasibility-Rating'] = await window.ProgramObject.calculateFeasibilityRating(activeThreat);
    activeThreat['Attack-Risk-Value'] = await window.ProgramObject.calculateRiskvalue(activeThreat);
    
    vm.setState({
      activeThreat: activeThreat,
      currentConfigureStep: null,
      modalCtx: false,
    }, async () => {
      modal('#ModalAddAttackStep', 'hide');
      
      // Update color for CAL
      jQuery('#Cyber-Security-Assurance-Level-Rating').text(calLevel['Value']);
      let calColor = await window.ProgramObject.calValueMappingColor(calLevel['Value']);
      jQuery(`#Cyber-Security-Assurance-Level-Rating-Parent`).css({
        'background': calColor,
      });

      // Update colors in Attack Steps table (for each step)
      this.state.activeThreat['Attack-Steps'].map(async (step, i) => {
        let attackStepFeasibilityColor = await window.ProgramObject.attackStepFeasibilityRatingMappingColor(step['Attack-Step-Attack-Feasibility-Rating']);
        jQuery(`#Attack-Step-Attack-Feasibility-Rating-${i}`).css({
          'background': attackStepFeasibilityColor,
        });

        jQuery(`#Attack-Step-Security-Leval-Rating-${i}`).css({
          'background': step['Attack-Step-Security-Leval-Rating-Color'],
        });

        let impactRatingColor = await window.ProgramObject.impactRatingsColor(step['Attack-Step-Impact-Rating']);
        jQuery(`#Attack-Step-Impact-Rating-${i}`).css({
          'background': impactRatingColor,
        });

        let riskMapingColor = await window.ProgramObject.riskMappingColor(step['Attack-Step-Risk-Rating']);
        jQuery(`#Attack-Step-Risk-Rating-${i}`).css({
          'background': riskMapingColor,
        });

        return null;
      });
    });
  }

  // canDefineAttackSteps
  canDefineAttackSteps = () => {
    var activeThreat = this.state.activeThreat;
    return (
      (activeThreat['Threat-Sub-Scenario'] !== null) &&
      (activeThreat['Threat-Type'] !== null)
    );
  }

  // Identify Threat & send it to server
  identifyThreat = () => {
    var vm = this;
    let activeThreat = vm.state.activeThreat;

    activeThreat['Attack-Effect'] = jQuery('#Input-Effect-of-Attack').val();
    activeThreat['Cyber-Security-Goal'] = jQuery('#Input-Security-Objective').val();
    activeThreat['Cyber-Security-Requirements'] = jQuery('#Input-Cyber-Security-Requirements').val();

    vm.setState({
      activeThreat: activeThreat
    }, async () => {
      await vm.postThreatAtServer();
    })
  }

  // Ajax-call to store threat
  postThreatAtServer = async () => {
    var vm = this;
    httpPost(apify('app/program/threats/add'), {
      programUuid: vm.state.programUuid,
      threat: vm.state.activeThreat,
    }).then(res => {
      if (res['success']) {
        window.location.reload(false);
      }
    });
  }

  // Pre-simulate Attack Step model
  preSimulateAttackSteps = (ev) => {
    ev.preventDefault();
    modal('#ModalPresimulateAttackSteps', {
      show: true,
    });
  }

  // Threat remove
  threatRemoveFromIdentificationArray = (refId) => {
    var vm = this;
    swalConfirmationPopup({
      title: null,
      text: "This action will reset the threat metadata.",
      confirmButtonText: "Re-configure",
    }, () => {

      vm.setState({
        loading: true
      }, () => {
        let params = {
          programUuid: vm.state.programUuid,
          threatUuid: refId,
          action: 'Remove-From-Identification-Array',
        };

        // Ajax-call
        httpPost(apify('app/program/threats/remove-from-identification'), params).then((res) => {
          let threats = res['program']['threats'];
          let assets = vm.prepareAssetOptions(threats);
          let property = undefined
          let assetSelected = undefined
          let securityPropertyOption = {
            label: res['threat']['Parent-Cyber-Security'],
            value: res['threat']['Parent-Cyber-Security'],
          }

          assets.map(asset => {
            if (asset['value'] === res['threat']['parentRefId']) {
              property = asset['property'];
              assetSelected = asset;
            }
            return null;
          })

          vm.setState({
            loading: false,
            program: res['program'],
            assets: assets,
            threats: threats,
            activeThreat: res['threat'],
            property: property,
            assetSelected: assetSelected,
            canGotoNextPhase: threats['Identification']['Can-Promote-Risk-P2-Analysis'] ?? false,
          }, () => {
            this.onChangeSecurityPropertyOption(securityPropertyOption)
          })
        });

      });

    });
  }

  // threatViewFromIdentificationArray
  threatViewFromIdentificationArray(item) {
    this.setState({
      currentThreatView: item,
    }, () => {
      modal('#Modal-Show-Details', {
        show: true,
      })
    });
  }

  // Handle JIRA Sync
  handleJiraSync = (ev, threatObject) => {
    if (!this.state['program']['jira_project_id']) {
      swalPopup({
        title: "It appears no such project is mapped to JIRA yet!",
        text: "Please Sync the Project to facilitate JIRA Issue Syncing.",
      });
      return;
    }
    
    swalConfirmationPopup({
      title: "Sync to JIRA",
      text: "This action will sync currect threat metadata as a JIRA issue. Any previous data would be overriden.",
      confirmButtonText: "Confirm",
    }, () => {
      triggerSwalLoader();

      let params = {
        'programUuid': this.state['programUuid'],
        'threatObject': threatObject,
      };

      httpPost(apify('app/integrations/jira/sync-issue'), params).then(res => {
        if (res['success']) {
          swalPopup("Sync completed.", 'success');
        }
      });
    });
  }

  // Function to get Hazop Functions from FS App
  setupHazopFunctions = () => {
    let vm = this;
    httpGet(apify(`app/functional-safety/hazop?programUuid=${vm.state['programUuid']}`)).then((res) => {
      if (res["success"]) {
        try {
          const hazopFunctions = res['hazopObject']['Hazop']['Functions']; 
          vm.setState({
            hazopFunctions: hazopFunctions
          });
        } 
        catch (error) {
          
        }
      }
    });
  }

  // Get default select value 
  getDefaultSelectValue = (attributeKey) => {
    return (this.state.currentConfigureStep && this.state.currentConfigureStep[attributeKey]) ? this.state.currentConfigureStep[attributeKey] : null;
  }

  // getRandomTz
  getRandomTz = () => {
    return new Date().getTime().toString();
  }

  // formModalAddAttackStepTitle
  formModalAddAttackStepTitle = () => {
    let title = `Add`;
    if (this.state.currentConfigureStep) title = `Update`;
    return title;
  }
  
  async componentDidMount() {
    setTitle("Threat & Risk Assesment (TARA)");
    
    jQuery('.select').selectpicker('refresh');
    
    let { programUuid } = this.props['match']['params'];
    this.setState({
      programUuid: programUuid
    });

    var vm = this;

    httpGet(apify(`app/program/threats?programUuid=${programUuid}`)).then(res => {
      let threats = res['program']['threats'];
      let assets = vm.prepareAssetOptions(threats);
      let wp24Annex5Options = vm.prepareWp24Annex5Options(res['configuration']['WP24-Annex-5-Options']);
      let threatTypes = vm.prepareThreatTypes(res['configuration']['Threat-Types']);

      let attackTypes = [
        { label: "Attack", value: "Attack" },
        { label: "Vulnerability", value: "Vulnerability" },
      ];
      let defaultAttackType = attackTypes[0];

      vm.setState({
        loading: false,
        program: res['program'],
        threats: threats,
        configuration: res['configuration'],
        assets: assets,
        wp24Annex5Options: wp24Annex5Options,
        threatTypes: threatTypes,
        attackTypes: attackTypes,
        defaultAttackType: defaultAttackType,
        canGotoNextPhase: threats['Identification']['Can-Promote-Risk-P2-Analysis'] ?? false,
        attackAltData: threats['attackAltData']
      }, () => {
        vm.setupHazopFunctions();
      });

    }).catch(err => {
      vm.setState({
        loading: false,
        program: null,
      }, () => {
        console.error(err);
      });
    });

    let cyberSecurityImpactRatingValues = [
      'Negligible',
      'Moderate',
      'Major',
      'Severe',
    ];

    let cyberSecurityImpactRatings = [
      {
        type: 'Safety',
        title: 'Safety',
        types: cyberSecurityImpactRatingValues,
        weight: {
          'Negligible': 0,
          'Moderate': 10,
          'Major': 100,
          'Severe': 1000,
        },
        value: null,
      },
      {
        type: 'Finanical',
        title: 'Finanical',
        types: cyberSecurityImpactRatingValues,
        weight: {
          'Negligible': 0,
          'Moderate': 10,
          'Major': 100,
          'Severe': 1000,
        },
        value: null,
      },
      {
        type: 'Operational',
        title: 'Operational',
        types: cyberSecurityImpactRatingValues,
        weight: {
          'Negligible': 0,
          'Moderate': 1,
          'Major': 10,
          'Severe': 100,
        },
        value: null,
      },
      {
        type: 'Privacy',
        title: 'Privacy & Legislation',
        types: cyberSecurityImpactRatingValues,
        weight: {
          'Negligible': 0,
          'Moderate': 1,
          'Major': 10,
          'Severe': 100,
        },
        value: null,
      },
    ];

    // Cyber Security Impact Ratings
    vm.setState({
      cyberSecurityImpactRatings: cyberSecurityImpactRatings
    }, () => {
      vm.registerUiTasks();
    });

    window.ProgramObject = new Program({ 'programUuid': programUuid });

    // vm.addAttackStep();

    // Configure existing threat
    jQuery('body').on('click', '.identified-threat-configure-button', function (ev) {
      ev.preventDefault();
      let refId = jQuery(this).attr('data-ref-id');
      vm.threatRemoveFromIdentificationArray(refId);
    });
  }

  // UI
  render() {
    return (
      <div>
        <DashboardLayout>
          <div className="container-fluid">
            <div className="row">
              <div className="col-12">
                {
                  this.state.loading &&
                  <PlaceholderLoader />
                }

                {
                  !this.state.loading &&
                  <div>
                    {
                      !this.state.program &&
                      <div className="alert alert-warning text-white p-3">
                        <h3>Alert!</h3>
                        No such program in our system.
                      </div>
                    }
                  </div>
                }
              </div>
            </div>

            {
              !this.state.loading &&
              <div>
                {
                  this.state.program &&
                  <div className="row">
                    <div className="col-12 col-md-12">
                      {
                        (!this.state.canGotoNextPhase) &&
                        <div className="card">
                          <div className="card-header">
                            <h3>Threat &amp; Risk Assesment (TARA)</h3>
                            <small>Program</small> <br />
                            <Link to={programLifecycleRoute('VIEW', this.state.program['uuid'])}>
                              {this.state.program['name']}
                            </Link>
                          </div>

                          <div className="card-body">

                            <div className="row">
                              <div className="col-4">
                                Asset ID
                              </div>
                              <div className="col-6">
                                <Select
                                  options={this.state.assets}
                                  onChange={(ev) => this.onChangeAssetOption(ev)}
                                  menuPortalTarget={document.body} styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                  value={this.state.assetSelected}
                                />
                              </div>
                            </div>

                            {
                              (this.state.property !== undefined) &&
                              <div>

                                <div className="row my-3">
                                  <div className="col-4">
                                    Security Objective
                                  </div>
                                  <div className="col-6">
                                    <span className="input-readonly">{this.state.property['Security-Objective']['Value']}</span>
                                  </div>
                                </div>

                                <div className="row my-3">
                                  <div className="col-4">
                                    Description of Damage Scenario
                                  </div>
                                  <div className="col-6">
                                    <span className="input-readonly">{this.state.property['Damage-Scenario']['Value']}</span>
                                  </div>
                                </div>

                                <div className="row my-3">
                                  <div className="col-4">
                                    Attack Type 
                                  </div>
                                  <div className="col-6">
                                    <Select
                                      options={this.state.attackTypes}
                                      onChange={(ev) => this.onChangeAttackType(ev)}
                                      menuPortalTarget={document.body} styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                      value={this.state.defaultAttackType}
                                    />
                                  </div>

                                  {
                                    this.state.defaultAttackType['value'] === 'Vulnerability' && 
                                    <React.Fragment>
                                    <div className="col-2"></div>
                                    <div className="col-4"></div>
                                    <div className="col-4 mt-2">
                                      <a className="btn btn-primary text-white" target="_blank" rel="noreferrer" href={`/dashboard/cybersecurity/vulnerability-monitoring-and-triage/${this.state.program['uuid']}`}>
                                        Proceed to <b>Vulnerability Risk Assesment</b>
                                      </a>
                                    </div>
                                    </React.Fragment>
                                  }
                                  
                                </div>

                                <div className="row mt-5 my-3 d-none">
                                  <div className="col-12">
                                    <div className="line"></div>
                                  </div>
                                </div>

                                {
                                  this.state.hazopFunctions.length > 0 &&
                                  this.state.assetSelected &&
                                  this.state.defaultAttackType['value'] === 'Attack' && 
                                  <IntegrationShowHazards
                                    programUuid={this.state.programUuid}
                                    hazopFunctions={this.state.hazopFunctions}
                                    targetFunctionName={this.state.assetSelected['property']['Name']}
                                    onUpdateHaraHazopUuids={this.onUpdateHaraHazopUuids}
                                  />
                                }

                                {
                                  this.state.defaultAttackType['value'] === 'Attack' && 
                                  <div>
                                    <fieldset disabled={this.state.defaultAttackType && this.state.defaultAttackType['value'] && this.state.defaultAttackType['value'] === 'Vulnerability'}>
                                      <div className="row my-3">
                                        <div className="col-3">
                                          <b className="highlight-label">Cyber Security Violated</b>
                                        </div>
                                        <div className="col-3">
                                          <Select
                                            options={this.allowedCyberSecurityProperties()}
                                            onChange={(ev) => this.onChangeSecurityPropertyOption(ev)}
                                            menuPortalTarget={document.body} styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                            value={this.state.securityPropertyOption}
                                          />
                                        </div>


                                        <div className="col-3"></div>
                                        {
                                          this.state.securityPropertyOption &&
                                          <div className="col-3 mt-n3">
                                            <h5 className="text-danger">Impact Rating</h5>

                                            {
                                              (!this.state.activeThreat || this.state.activeThreat['Impact-Rating-Value'] === null) &&
                                              <span className="badge badge-dark px-4 py-2 text-uppercase">N/A</span>
                                            }
                                            
                                            {
                                              this.state.activeThreat &&
                                              this.state.activeThreat['Impact-Rating-Value'] !== null &&
                                              <span className="badge px-4 py-2 text-uppercase Impact-Rating-Color">{this.state.activeThreat['Impact-Rating-Value']}</span>
                                            }
                                          </div>
                                        }
                                      </div>
                                    </fieldset>

                                    <fieldset disabled={this.state.defaultAttackType && this.state.defaultAttackType['value'] && this.state.defaultAttackType['value'] === 'Vulnerability'}>
                                      {
                                        this.state.securityPropertyOption &&
                                        <div>
                                          <div className="row my-3">
                                            <div className="col-12 mb-2">
                                              <b className="highlight-label">Asset Impact Ratings</b>
                                            </div>

                                            {
                                              this.state.cyberSecurityImpactRatings.map(impactRating => {
                                                return (
                                                  <div key={impactRating['title']} className="col-3">
                                                    <b className="text-muted text-uppercase">{impactRating['title']}</b>
                                                    <div className="form-group">
                                                      <ul className="list-unstyled">
                                                        {
                                                          impactRating['types'].map(type => {
                                                            return (
                                                              <li key={type} className="impact-rating-radio">
                                                                <input type="radio" name={impactRating['type']} value={type} defaultChecked={this.impactRatingRadioValue(impactRating['type'], type)} onChange={(ev) => this.onChangeImpactRatingRadio(ev)} />
                                                                <label className="ml-2">{type}</label>
                                                              </li>

                                                            );
                                                          })
                                                        }
                                                      </ul>
                                                    </div>
                                                  </div>
                                                );
                                              })
                                            }

                                          </div>
                                          {
                                            this.state.securityPropertyOption && this.state.activeThreat &&
                                            this.state.activeThreat['Impact-Rating-Value'] !== null &&
                                            <div>

                                              <div className="row my-3">
                                                <div className="col-12">
                                                  <hr />
                                                </div>
                                              </div>

                                              <div className="row my-3">
                                                <div className="col-4">
                                                  Threat ID
                                                </div>
                                                <div className="col-8">
                                                  <span className="input-readonly">{this.state.activeThreat['RefId']}</span>
                                                </div>
                                              </div>

                                              <div className="row my-3">
                                                <div className="col-4">
                                                  Is threat type part of WP29 Annex. 5?
                                                </div>
                                                <div className="col-8">
                                                  <Select
                                                    options={this.state.wp24Annex5Options}
                                                    onChange={(ev) => this.onChangeWp24Annex5Options(ev)}
                                                    menuPortalTarget={document.body} styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                                    value={this.state.activeThreat['Type-WP24-Annex-5'] && {
                                                      label: this.state.activeThreat['Type-WP24-Annex-5'],
                                                      value: this.state.activeThreat['Type-WP24-Annex-5'],
                                                    }}
                                                  />
                                                </div>
                                              </div>

                                              <div className="row my-3">
                                                <div className="col-4">
                                                  Define Threat Sub-scenario
                                                </div>
                                                <div className="col-8">
                                                  <Select
                                                    options={this.state.wp24Annex5Scenarios}
                                                    onChange={(ev) => this.onChangeWp24Annex5Scenarios(ev)}
                                                    menuPortalTarget={document.body} styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                                    value={this.state.activeThreat['Threat-Sub-Scenario'] && {
                                                      label: this.state.activeThreat['Threat-Sub-Scenario'],
                                                      value: this.state.activeThreat['Threat-Sub-Scenario'],
                                                    }}
                                                  />
                                                </div>
                                              </div>

                                              <div className="row my-3">
                                                <div className="col-4">
                                                  Threat Type
                                                </div>
                                                <div className="col-8">
                                                  <Select
                                                    options={this.state.threatTypes}
                                                    onChange={(ev) => this.onChangeThreatType(ev)}
                                                    isMulti={true}
                                                    menuPortalTarget={document.body} styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                                    value={this.state.activeThreat['Threat-Type']}
                                                  />
                                                </div>
                                              </div>

                                              {
                                                this.state['showUseSeclRatingPrompt'] && 
                                                <div className="row my-3">
                                                  <div className="col-4">
                                                    Use SeCL over AFR
                                                  </div>
                                                  <div className="col-8">
                                                    <Select
                                                      options={this.state.optionsShowUseSeclRatingPrompt}
                                                      onChange={(ev) => this.onChangeUseSeclRatingPrompt(ev)}
                                                      menuPortalTarget={document.body} styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                                      value={this.state.useSeclRatingOption}
                                                    />
                                                  </div>
                                                </div>
                                              }

                                              {/* Attack Definition Starts */}

                                              {
                                                this.canDefineAttackSteps() &&
                                                <div>
                                                  <div className="row my-3">
                                                    <div className="col-12">
                                                      <hr />
                                                    </div>
                                                  </div>

                                                  <div className="row my-3">
                                                    <div className="col-3">
                                                      Attack ID
                                                    </div>
                                                    <div className="col-9">
                                                      <span className="input-readonly">{this.state.activeThreat['Attack-RefId']}</span>
                                                    </div>
                                                  </div>

                                                  {/* List of Attack Steps */}
                                                  <div className="row my-3">
                                                    <div className="col-3">
                                                      Attack Steps
                                                      <br />
                                                      <a href="#!" className="link" onClick={this.preSimulateAttackSteps}>
                                                        <small>Simulate Pre-steps</small>
                                                      </a>
                                                    </div>

                                                    <div className="col-9">
                                                      {
                                                        (this.state.activeThreat['Attack-Steps'].length === 0) &&
                                                        <div>
                                                          <button className="btn btn-dark btn-sm text-white mt-2" onClick={this.addAttackStep}>
                                                            <i className="fa fa-plus mr-3"></i>
                                                            Add Your First Step
                                                          </button>
                                                        </div>
                                                      }

                                                      {
                                                        (this.state.activeThreat['Attack-Steps'].length > 0) &&
                                                        <div className="row">
                                                          <div className="col-12">
                                                            <table className="table table-bordered">
                                                              <thead>
                                                                <tr>
                                                                  <th className="text-left" style={{width: '30%'}}>Attack</th>
                                                                  <th className="text-left" style={{width: '50%'}}>Ratings</th>
                                                                  <th className="text-left" style={{width: '20%'}}></th>
                                                                </tr>
                                                              </thead>
                                                              <tbody>
                                                                {
                                                                  this.state.activeThreat['Attack-Steps'].map((step, i) => {
                                                                    return (
                                                                      <tr key={step['Attack-Step-RefId']}>
                                                                        <td title={step['Attack-Step-Description']}>
                                                                          <p className="text-muted">{step['Attack-Step']}
                                                                            <br /> <small>{step['Attack-Step-Description']}</small></p>
                                                                        </td>
                                                                        <td>
                                                                          {
                                                                            !step['Attack-Step-SeCL-Pref'] && 
                                                                            <span 
                                                                              className="badge badge-info py-2 px-3 ml-2" 
                                                                              id={`Attack-Step-Attack-Feasibility-Rating-${i}`} 
                                                                              title="Attack Feasibility Rating">
                                                                              AFR : {step['Attack-Step-Attack-Feasibility-Rating']}
                                                                            </span>
                                                                          }

                                                                          {
                                                                            step['Attack-Step-SeCL-Pref'] && 
                                                                            <span 
                                                                              className="badge badge-info py-2 px-3 ml-2" 
                                                                              id={`Attack-Step-Security-Leval-Rating-${i}`} 
                                                                              title="Security Leval Rating">
                                                                              SeCL : {step['Attack-Step-Security-Leval-Rating']}
                                                                            </span>
                                                                          }
                                                                          
                                                                          <span 
                                                                            className="badge badge-success text-dark py-2 px-3 ml-2" 
                                                                            id={`Attack-Step-Impact-Rating-${i}`} 
                                                                            title="Impact Rating">
                                                                            IR : {step['Attack-Step-Impact-Rating']}
                                                                          </span>
                                                                          
                                                                          <span 
                                                                            className="badge badge-danger text-dark py-2 px-3 ml-2" 
                                                                            id={`Attack-Step-Risk-Rating-${i}`} 
                                                                            title="Risk Value">
                                                                            RV : {step['Attack-Step-Risk-Rating']}
                                                                          </span>
                                                                        </td>

                                                                        <td>
                                                                          <a href="#!" className="link-sm float-right" onClick={(ev) => this.configureAttackStep(ev, step['Attack-Step-RefId'], step)}>
                                                                            <i className="fa fa-gear"></i> 
                                                                            Configure
                                                                          </a>

                                                                          <a href="#!" className="link-sm float-right mr-3 text-danger" onClick={(ev) => this.deleteAttackStep(ev, step['Attack-Step-RefId'], step)}>
                                                                            <i className="fa fa-trash"></i> Remove
                                                                          </a>
                                                                        </td>
                                                                      </tr>
                                                                    );
                                                                  })
                                                                }
                                                              </tbody>
                                                            </table>
                                                          </div>

                                                          <div className="col-12 my-3">
                                                            <button className="btn btn-dark btn-sm text-white" onClick={this.addAttackStep}>
                                                              <i className="fa fa-plus mr-3"></i>
                                                              Add More Step
                                                            </button>
                                                          </div>

                                                        </div>
                                                      }
                                                    </div>

                                                  </div>

                                                  {/* List of Attack Steps */}
                                                  <div className="row my-3">
                                                    {
                                                      (this.state.activeThreat['Attack-Steps'].length > 0) && 
                                                      <div className="col-3">
                                                        Attack Steps Assignment
                                                      </div>
                                                    }
                                                    
                                                    <div className="col-9">
                                                      {
                                                        (Object.values(this.state.attackAltData).length > 0) && 
                                                        this.state.attackAltData[this.state.activeThreat['RefId']] &&
                                                        <div className="row">
                                                          <div className="col-12">
                                                            <table className="table table-bordered">
                                                              <thead>
                                                                <tr>
                                                                  <th className="text-left">Attack</th>
                                                                  <th className="text-left">AND With </th>
                                                                  <th className="text-left">OR With </th>
                                                                  <th className="text-left">Is Target</th>
                                                                  <th></th>
                                                                </tr>
                                                              </thead>
                                                              <tbody>
                                                                {
                                                                  Object.values(this.state.attackAltData[this.state.activeThreat['RefId']]).map((step, i) => {
                                                                    step['and_with'] = this.removeAllDuplicateSteps(step['and_with']);
                                                                    step['or_with'] = this.removeAllDuplicateSteps(step['or_with']);
                                                                    return (
                                                                      <tr key={i}>
                                                                        <td>
                                                                          <span className="text-muted">{step['name']}</span>
                                                                        </td>
                                                                        <td>
                                                                          {
                                                                            step['and_with'] && step['and_with'].map(and => {
                                                                              return (
                                                                                <React.Fragment key={`${i}-${and}-${uuidV4()}`}>
                                                                                  <span className="badge badge-primary py-2 px-3 mb-2">
                                                                                    {and}
                                                                                  </span><br />
                                                                                </React.Fragment>
                                                                              ) 
                                                                            })
                                                                          }
                                                                        </td>
                                                                        <td>
                                                                          {
                                                                            step['or_with'] && step['or_with'].map(or => {
                                                                              return (
                                                                                <React.Fragment key={`${i}-${or}-${uuidV4()}`}>
                                                                                  <span className="badge badge-primary py-2 px-3 mb-2">
                                                                                    {or}
                                                                                  </span> <br />
                                                                                </React.Fragment>
                                                                              )
                                                                            })
                                                                          }
                                                                        </td>
                                                                        <td>
                                                                          <span className="text-muted">{step['is_target'] ? 'True' : 'False'}</span>
                                                                        </td>
                                                                        <td>
                                                                          <a href="#!" className="link-sm float-right" onClick={(ev) => this.stepAssignment(ev, step)}>
                                                                            <i className="fa fa-gear"></i> Configure
                                                                          </a>
                                                                          <a href="#!" className="link-sm float-right mr-3 text-danger" onClick={(ev) => this.resetStepAssignment(ev, step)}>
                                                                            <i className="fa fa-trash"></i> Reset Assignment
                                                                          </a>
                                                                        </td>
                                                                      </tr>
                                                                    );
                                                                  })
                                                                }
                                                              </tbody>
                                                            </table>
                                                          </div>
                                                        </div>
                                                      }

                                                      {
                                                        (this.state.activeThreat['Attack-Steps'].length > 0) &&
                                                        <React.Fragment>
                                                        <div>
                                                          <button className="btn btn-warning btn-lg btn-block text-white" onClick={(ev) => this.stepAssignment(ev, false)}>
                                                            Assign Attack Steps
                                                          </button>
                                                        </div>

                                                        <div className="my-3">
                                                          <div className="form-group">
                                                            <label>Can the Security Objective be achieved by?</label>
                                                            
                                                            <div className="row">
                                                              <div className="col-4">
                                                                <select className="form-control md-form-control" id="Assignment-Form-Input-Attacks" multiple={true}>
                                                                  {
                                                                    this.state.activeThreat['Attack-Steps'].map(attackStep => {
                                                                      return (
                                                                        <option key={attackStep['Attack-Step-RefId']}>{attackStep['Attack-Step']}</option>
                                                                      )
                                                                    })
                                                                  }
                                                                </select> 
                                                              </div>
                                                              <div className="col-4">
                                                                <select className="form-control md-form-control" id="Assignment-Form-Gate-Value" defaultValue="AND">
                                                                  <option value="AND">AND</option>
                                                                  <option value="OR">OR</option>
                                                                </select> 
                                                              </div>
                                                              <div className="col-4">
                                                                <button className="btn btn-dark btn-sm btn-block mt-n2" onClick={(ev) => this.onChangeSecurityObjectiveGate(ev)}>
                                                                  Update
                                                                </button> 
                                                              </div>
                                                            </div>

                                                          </div>

                                                        </div>
                                                        </React.Fragment>
                                                      }
                                                    </div>

                                                  </div>

                                                  {/* Effect of Attack */}
                                                  {
                                                    (this.state.activeThreat['Attack-Steps'].length > 0) &&
                                                    <div>
                                                      <div className="row">
                                                        <div className="col-12">
                                                          <hr />
                                                        </div>
                                                      </div>

                                                      <div className="row my-3">
                                                        <div className="col-3">
                                                          Effect of Attack
                                                        </div>
                                                        <div className="col-8">
                                                          <input className="form-control md-form-control" placeholder="Effect of Attack" id="Input-Effect-of-Attack" defaultValue={this.state.activeThreat['Attack-Effect']} />
                                                        </div>
                                                      </div>

                                                      <div className="row my-3">
                                                        <div className="col-3">
                                                          {/* Attack Step <br /> */}
                                                          Cyber Security Assurance Level (CAL)
                                                        </div>
                                                        <div className="col-5">
                                                          <div className="badge badge-info text-dark py-2 px-3 ml-2" id="Cyber-Security-Assurance-Level-Rating-Parent">
                                                            {/* <span className="alert-attack-type">Cyber Security Assurance Level</span> <br /> */}
                                                            <span id="Cyber-Security-Assurance-Level-Rating" style={{ 'fontSize': '1.3em' }} className="text-dark">{this.state.activeThreat && this.state.activeThreat['Attack-CAL'] && this.state.activeThreat['Attack-CAL']['Value']}</span>
                                                          </div>
                                                        </div>
                                                      </div>

                                                      <div className="row my-3">
                                                        <div className="col-3">
                                                          Cyber Security Goal
                                                        </div>
                                                        <div className="col-8">
                                                          <input className="form-control md-form-control" defaultValue={this.state.activeThreat['Cyber-Security-Goal'] && this.state.activeThreat['Cyber-Security-Goal'] !== '' ? this.state.activeThreat['Cyber-Security-Goal'] : this.state.property['Security-Objective']['Value']} placeholder="Security Objective" id="Input-Security-Objective" />
                                                        </div>
                                                      </div>

                                                      <div className="row my-3">
                                                        <div className="col-3">
                                                          Create Cyber Security Requirements
                                                        </div>
                                                        <div className="col-8">
                                                          <input className="form-control md-form-control" defaultValue={this.state.activeThreat['Cyber-Security-Requirements']} placeholder="Cyber Security Requirements" id="Input-Cyber-Security-Requirements" />
                                                        </div>
                                                      </div>

                                                    </div>
                                                  }
                                                </div>
                                              }

                                              {/* Attack Definition ENDS */}

                                            </div>
                                          }
                                        </div>
                                      }
                                    </fieldset>
                                  </div>
                                }
                              </div>
                            }

                          </div>

                          <div className="card-footer">
                            <button type="button" className="btn btn-success btn-lg" onClick={(ev) => this.identifyThreat(ev)} disabled={(!this.state.activeThreat || this.state.activeThreat['Attack-Steps'].length <= 0) || (this.state.defaultAttackType && this.state.defaultAttackType['value'] && this.state.defaultAttackType['value'] === 'Vulnerability')}>
                              Mark Threat
                            </button>
                          </div>
                        </div>
                      }

                      {
                        (this.state.canGotoNextPhase) &&
                        <div className="card">
                          <div className="card-header">
                            <h3>Threat &amp; Risk Assesment (TARA)</h3>
                            <small>Program</small> <br />
                            <Link to={programLifecycleRoute('VIEW', this.state.program['uuid'])}>
                              {this.state.program['name']}
                            </Link>
                          </div>
                          <div className="card-body">
                            <div className="row">
                              <div className="col-12">
                                All threats have been identified, you may
                                proceed to <b>Residual Risk phase.</b>
                              </div>
                            </div>
                          </div>
                          <div className="card-footer">

                            <Link to={programLifecycleRoute('Asset-Identification', this.state.program['uuid'])} className="btn btn-success text-white">
                              Back to <b>Asset Identification</b>
                            </Link>
                            <Link to={programLifecycleRoute('Residual-Risk', this.state.program['uuid'])} className="btn btn-success text-white float-right">
                              Goto <b>Residual Risk phase</b>
                            </Link>
                          </div>
                        </div>
                      }

                    </div>

                    {/* Right sidebar */}
                    <div className="col-12 col-md-12 mt-5">
                      <div className="card">
                        <div className="card-header">
                          <h3>Identified Threats</h3>
                        </div>
                        <div className="card-body p-0">
                          <table className="table table-bordered">
                            <thead>
                              <tr>
                                <th className="text-left">Threat</th>
                                <th className="text-left">Sync to JIRA</th>
                                <th></th>
                              </tr>
                            </thead>
                            <tbody>
                              {/* No Threats */}
                              {
                                this.state.threats['Identification']['Threats'].length === 0
                                &&
                                <tr>
                                  <td colSpan="2">
                                    No threats yet identified.
                                  </td>
                                </tr>
                              }

                              {/* Threats */}
                              {
                                this.state.threats['Identification']['Threats'].map(threat => {
                                  return (
                                    <tr key={threat['RefId']}>
                                      <td>
                                        {threat['Parent-Asset']} <br />
                                        <small>{threat['Parent-Cyber-Security']}</small>
                                      </td>
                                      <td>
                                        <button className='btn btn-sm btn-outline-primary' onClick={(ev) => this.handleJiraSync(ev, threat)}>
                                          <i className="fa fa-refresh"></i> Sync to JIRA
                                        </button>
                                      </td>
                                      <td className="text-right">
                                        {
                                          (this.state.program['status'] !== 'APPROVED' && this.state.program['status'] !== 'UNDER-REVIEW') &&
                                          <a href="#!" className="identified-threat-configure-button" data-ref-id={threat['RefId']}>
                                            <i className="fa fa-gear mr-1"></i>
                                            Re-Configure
                                          </a>
                                        }

                                        {
                                          (this.state.program['status'] === 'APPROVED' || this.state.program['status'] === 'UNDER-REVIEW') &&
                                          <a href="#!" onClick={() => this.threatViewFromIdentificationArray(threat)}>
                                            <i className="fa fa-eye mr-1"></i>
                                            View
                                          </a>
                                        }
                                      </td>
                                    </tr>
                                  )
                                })
                              }
                            </tbody>
                          </table>

                          {(this.state.program['status'] !== 'APPROVED' && this.state.program['status'] !== 'UNDER-REVIEW') && <div className="alert alert-info m-2">
                            <h5>Alert</h5>
                            {this.state.threats['Identification']['Remaining-Threats']} of {this.state.threats['Identification']['Total-Threats']} threats remaining.
                          </div>}

                          <div className="m-2">
                          </div>
                        </div>
                        {this.state.canGotoNextPhase &&
                          <div className="card-footer">
                            <Link to={programLifecycleRoute('Residual-Risk', this.state.program['uuid'])} className="btn btn-success text-white">
                              Goto <b>Residual Risk phase</b>
                            </Link>
                          </div>
                        }
                      </div>
                    </div>

                    <div className="modal fade" id="Modal-Show-Details" tabIndex="-1" data-backdrop="static">
                      <div className="modal-dialog modal-full-width">

                        <div className="modal-content">
                          <div className="modal-header">
                            <h4 className="modal-title text-primary">
                              Threat &amp; Risk Assesment (TARA)
                            </h4>
                            <button type="button" className="close" data-dismiss="modal">
                              <span>&times;</span>
                            </button>
                          </div>
                          <div className="modal-body widget-modal-body">
                            {this.state.currentThreatView &&
                              <table className="table table-bordered">
                                <tbody>
                                  <tr>
                                    <td>RefId</td>
                                    <td>{this.state.currentThreatView['RefId']}</td>
                                  </tr>
                                  <tr>
                                    <td>Asset</td>
                                    <td>{this.state.currentThreatView['Parent-Asset']}</td>
                                  </tr>
                                  <tr>
                                    <td>Cyber Security Concept</td>
                                    <td>{this.state.currentThreatView['Parent-Cyber-Security']}</td>
                                  </tr>
                                  <tr>
                                    <td>Security Objective</td>
                                    <td>{this.state.currentThreatView['Security-Objective'] && this.state.currentThreatView['Security-Objective']['Value']}</td>
                                  </tr>
                                  <tr>
                                    <td>Impact Ratings</td>
                                    <td>
                                      <table className="table table-bordered">
                                        <thead>
                                          <tr>
                                            <th>Safety</th>
                                            <th>Finanical</th>
                                            <th>Operational</th>
                                            <th>Privacy</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          <tr>
                                            <td>{this.state.currentThreatView['Impact-Ratings'] && this.state.currentThreatView['Impact-Ratings']['Safety']}</td>
                                            <td>{this.state.currentThreatView['Impact-Ratings'] && this.state.currentThreatView['Impact-Ratings']['Finanical']}</td>
                                            <td>{this.state.currentThreatView['Impact-Ratings'] && this.state.currentThreatView['Impact-Ratings']['Operational']}</td>
                                            <td>{this.state.currentThreatView['Impact-Ratings'] && this.state.currentThreatView['Impact-Ratings']['Privacy']}</td>
                                          </tr>
                                        </tbody>
                                      </table>
                                    </td>
                                  </tr>
                                  <tr>
                                    <td>Impact Rating Value</td>
                                    <td>{this.state.currentThreatView['Impact-Rating-Value']}</td>
                                  </tr>
                                  <tr>
                                    <td>Type WP29-Annex-5</td>
                                    <td>{this.state.currentThreatView['Type-WP24-Annex-5']}</td>
                                  </tr>
                                  <tr>
                                    <td>Threat Sub-Scenario</td>
                                    <td>{this.state.currentThreatView['Threat-Sub-Scenario']}</td>
                                  </tr>
                                  <tr>
                                    <td>Threat Type</td>
                                    <td>{typeof this.state.currentThreatView['Threat-Type'] === 'string' ? this.state.currentThreatView['Threat-Type'] : this.state.currentThreatView['Threat-Type'].map((type, key) => {
                                      return <span>{key !== 0 && ', '} {type['label']} </span>
                                    })}</td>
                                  </tr>
                                  <tr>
                                    <td>Attack Type</td>
                                    <td>{this.state.currentThreatView['Attack-Type']} ({this.state.currentThreatView['Attack-RefId']})</td>
                                  </tr>
                                  <tr>
                                    <td>Attack Steps</td>
                                    <td>
                                      <table className="table table-bordered">
                                        <thead>
                                          <tr>
                                            <th>Attack</th>
                                            <th>Ratings</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {
                                            this.state.currentThreatView['Attack-Steps'].map(step => {
                                              return (
                                                <tr key={step['Attack-Step-RefId']}>
                                                  <td title={step['Attack-Step-Description']}>
                                                    {
                                                      (nullIfEmpty(step['Attack-Step-Logic']) !== null) &&
                                                      <small className="d-inline mr-1 text-primary">{step['Attack-Step-Logic']}</small>
                                                    }
                                                    <span className="text-muted">{step['Attack-Step']}</span>
                                                  </td>
                                                  <td>
                                                    <span className="badge badge-info py-2 px-3 ml-2 " title="Attack Feasibility Rating">AFR : {step['Attack-Step-Attack-Feasibility-Rating']}</span><br />
                                                    <span className="badge badge-success py-2 px-3 ml-2 mt-2" title="Impact Rating">IR : {step['Attack-Step-Impact-Rating']}</span><br />
                                                    <span className="badge badge-danger py-2 px-3 ml-2 mt-2" title="Risk Value">RV : {step['Attack-Step-Risk-Rating']}</span>
                                                  </td>
                                                </tr>
                                              );
                                            })
                                          }
                                        </tbody>
                                      </table>
                                    </td>
                                  </tr>
                                  <tr>
                                    <td>Attack Effect</td>
                                    <td>{this.state.currentThreatView['Attack-Effect']}</td>
                                  </tr>
                                  <tr>
                                    <td>Attack CAL</td>
                                    <td>{this.state.currentThreatView['Attack-CAL']['Value']}</td>
                                  </tr>
                                  <tr>
                                    <td>Cyber Security Goal</td>
                                    <td>{this.state.currentThreatView['Cyber-Security-Goal']}</td>
                                  </tr>
                                  <tr>
                                    <td>Cyber Security Requirements</td>
                                    <td>{this.state.currentThreatView['Cyber-Security-Requirements']}</td>
                                  </tr>
                                </tbody>
                              </table>
                            }
                            <div className="row">
                              <div className="col-6">
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

          {/* Pre-simulate Attack Steps Modal */}
          <div className="modal fade" id="ModalPresimulateAttackSteps" tabIndex="-1" data-keyboard="false" data-backdrop="static">
            <div className="modal-dialog modal-full-width">

              <div className="modal-content">
                <div className="modal-header">
                  <h4 className="modal-title text-primary">
                    Pre-simulate Attack Steps
                  </h4>
                  <button type="button" className="close" data-dismiss="modal">
                    <span>&times;</span>
                  </button>
                </div>
                <div className="modal-body">
                  <iframe
                    title="Embed Pre-simulate Attack Steps"
                    src="https://api.secureelements.io/simulate-attack-steps/index.html"
                    className="embed-simulate-attack-steps">
                  </iframe>
                </div>
              </div>

            </div>
          </div>
          {/* Pre-simulate Attack Steps Modal ENDS */}

          {/* Add Attack Step Modal */}
          <div className="modal fade" id="ModalAddAttackStep" tabIndex="-1" data-keyboard="false" data-backdrop="static">
            {
              this.state.modalCtx &&
              <div className="modal-dialog modal-full-width">

                <form id="Form-Modal-Add-Attack-Step" onSubmit={(ev) => this.onSubmitAddAttackStep(ev)}>
                  <div className="modal-content">
                    <div className="modal-header">
                      <h4 className="modal-title text-primary">
                        {this.formModalAddAttackStepTitle()} <b>Attack Step</b>
                      </h4>
                      <button type="button" className="close" data-dismiss="modal">
                        <span>&times;</span>
                      </button>
                    </div>
                    <div className="modal-body">
                      <div className="form-group row">
                        <div className="col-12 mb-2 text-uppercase text-muted">
                          Step
                        </div>
                        <div className="col-12">
                          <input type="text" className="form-control md-form-control" placeholder="Describe your attack step" id="Modal-Input-Attack-Step" defaultValue={this.state.currentConfigureStep && this.state.currentConfigureStep['Attack-Step']} required />
                        </div>
                      </div>

                      <div className="form-group row">
                        <div className="col-12 mb-2 text-uppercase text-muted">
                          Description
                        </div>
                        <div className="col-12">
                          <input type="text" className="form-control md-form-control" defaultValue={this.state.currentConfigureStep && this.state.currentConfigureStep['Attack-Step-Description']} placeholder="Description (Optional)" id="Modal-Input-Attack-Description" />
                        </div>
                      </div>
                      {
                        !this.state.useSeclRating && 
                        <div key={`AFRRatinOptions-${this.getRandomTz()}`}>
                          <AFRRatinOptions
                            currentConfigureStep={this.state.currentConfigureStep}
                            getDefaultSelectValue={this.getDefaultSelectValue}
                          />
                        </div>
                      }

                      {
                        this.state.useSeclRating && 
                        <div key={`SeCLRatinOptions-${this.getRandomTz()}`}>
                          <SeCLRatinOptions
                            currentConfigureStep={this.state.currentConfigureStep}
                            getDefaultSelectValue={this.getDefaultSelectValue}
                          />
                        </div>
                      }

                      <div className="form-group row">
                        <div className="col-12 mb-2 text-uppercase text-muted">
                          Ratings
                        </div>
                        {
                          !this.state.useSeclRating && 
                          <div className="col-4">
                            <div className="alert alert-primary">
                              <span className="alert-attack-type">Attack Feasibility Rating</span> <br />
                              <span id="Modal-Input-Attack-Feasibility-Rating" className="alert-attack-value">{this.state.currentConfigureStep && this.state.currentConfigureStep['Attack-Step-Attack-Feasibility-Rating']}</span>
                            </div>
                          </div>
                        }
                        
                        {
                          this.state.useSeclRating && 
                          <div className="col-4">
                            <div className="alert alert-primary">
                              <span className="alert-attack-type">Security Level Rating</span> <br />
                              <span id="Modal-Input-Security-Level-Rating" className="alert-attack-value">{this.state.currentConfigureStep && this.state.currentConfigureStep['Attack-Step-Security-Leval-Rating']}</span>
                            </div>
                          </div>
                        }

                        <div className="col-4">
                          <div className="alert alert-primary">
                            <span className="alert-attack-type">Impact Rating</span> <br />
                            <span id="Modal-Input-Impact-Rating" className="alert-attack-value">{this.state.currentConfigureStep && this.state.currentConfigureStep['Attack-Step-Impact-Rating']}</span>
                          </div>
                        </div>

                        <div className="col-4">
                          <div className="alert alert-primary">
                            <span className="alert-attack-type">Risk Value</span> <br />
                            <span id="Modal-Input-Risk-Rating" className="alert-attack-value">{this.state.currentConfigureStep && this.state.currentConfigureStep['Attack-Step-Risk-Rating']}</span>
                          </div>
                        </div>
                      </div>

                    </div>
                    <div className="modal-footer">
                      <div className="row w-100">
                        <div className="col-12 text-right">
                          <button type="submit" className="btn btn-primary">
                          {this.formModalAddAttackStepTitle()} Step
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </form>

              </div>
            }
          </div>
          {/* Add Attack Step Modal ENDS */}

          {/* Step Assignment Modal */}
          <div className="modal fade" id="ModalStepAssignment" tabIndex="-1" data-keyboard="false" data-backdrop="static">
            <div className="modal-dialog modal-full-width">

              <div className="modal-content">
                <div className="modal-header">
                  <h4 className="modal-title text-primary">
                    Assign <b>Attack Step</b>
                  </h4>
                  <button type="button" className="close" data-dismiss="modal">
                    <span>&times;</span>
                  </button>
                </div>

                <div className="modal-body">
                  <div className="row my-3">
                    <div className="col-12 mb-3">
                      <div className='row'>
                        <div className="col-4">
                          Select Step
                        </div>
                        <div className="col-8">
                          <Select
                            options={this.state.stepAssignmentSteps['all']}
                            onChange={(ev) => this.onChnageStep(ev)}
                            menuPortalTarget={document.body} styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                            value={this.state.nameAssignmentvalue}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="col-12 mb-3">
                      <div className='row'>
                        <div className="col-4">
                          ANDs With
                        </div>
                        <div className="col-8">
                          <Select
                            options={this.state.stepAssignmentSteps['andSteps']}
                            onChange={(ev) => this.onChnageAndStep(ev)}
                            menuPortalTarget={document.body} styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                            value={this.state.andAssignValue}
                            isMulti={true}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="col-12 mb-3">
                      <div className='row'>
                        <div className="col-4">
                          ORs With
                        </div>
                        <div className="col-8">
                          <Select
                            options={this.state.stepAssignmentSteps['orSteps']}
                            onChange={(ev) => this.onChnageOrStep(ev)}
                            menuPortalTarget={document.body} styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                            value={this.state.orAssignValue}
                            isMulti={true}
                          />
                        </div>
                      </div>
                    </div>

                    {
                      false && 
                      <div className="col-12 mb-3">
                        <div className='row'>
                          <div className="col-4">
                            Is Target Step?
                          </div>
                          <div className="col-8">
                            <input type="checkbox" className="mr-2" onChange={(event) => {
                              this.setState({
                                stepAssignmentStepsValue: {
                                  ...this.state.stepAssignmentStepsValue,
                                  is_target: event.currentTarget.checked,
                                  type: 'input'
                                }
                              })
                            }} />
                          </div>
                        </div>
                      </div>
                    }
                  </div>
                </div>

                <div className="modal-footer">
                  <div className="row w-100">
                    <div className="col-12 text-right">
                      <button type="submit" className="btn btn-primary" onClick={(ev) => this.onSubmitAssignment(ev)}>
                        Assign
                      </button>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
          {/* Step Assignment Modal ENDS */}

        </DashboardLayout>
      </div>
    );
  }
}

// TARA Screen
export default withRouter(TARAScreen);