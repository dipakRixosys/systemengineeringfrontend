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
import { setTitle, uuidV4, programLifecycleRoute, swalConfirmationPopup, modal } from "helpers/common";
// Network Helpers
import { httpGet, apify, httpPost, httpFile } from 'helpers/network';
// Program
import Program from 'models/Program';
// jQuery
const jQuery = window.jQuery;


// Residual Risk
class ResidualRisk extends React.Component {
  //
  state = {
    loading: true,
    programUuid: undefined,
    program: undefined,
    components: [],
    softwares: [],
    threats: undefined,
    threat: undefined,
    riskAcceptance: {},
    riskAcceptanceOptions: [],
    securityControls: [],
    allowRiskMarking: false,

  };

  //
  onChangeThreatOption = (ev) => {
    this.setState({
      threat: ev['threat'],
      threatSelect: ev,
    }, () => {
      jQuery('.select').selectpicker('refresh');


    });
  }

  //
  prepareThreatOptions = (threatObject = []) => {
    //
    let threatOptions = [];

    //
    threatObject['Identification']['Threats'].forEach(threat => {
      if (threat['Threat-Identified']) {
        if (threat['Threat-Reduced'] === undefined || !threat['Threat-Reduced']) {
          threatOptions.push({
            label: `${threat['Parent-Asset']} (${threat['Parent-Cyber-Security']})`,
            value: threat['RefId'],
            threat: threat,
          });
        }
      }
    });

    //
    return threatOptions;
  }

  //
  threatViewFromIdentificationArray(item) {

    this.setState({
      currentThreatView: item,
    }, () => {
      modal('#Modal-Show-Details', {
        show: true,
      })
    })


  }

  //
  async componentDidMount() {
    //
    setTitle("Residual Risk");

    //
    jQuery('.select').selectpicker('refresh');

    //
    let { programUuid } = this.props['match']['params'];

    //
    this.setState({
      programUuid: programUuid,
    });

    var vm = this;


    //
    window.ProgramObject = new Program({ 'programUuid': programUuid });

    httpGet(apify(`app/program/threats?programUuid=${programUuid}`)).then(res => {
      let threats = res['program']['threats'];
      let threatOptions = vm.prepareThreatOptions(threats);

      let components = []
      let softwares = []

      res['program']['assets']['Components'].map(component => {
        components.push({
          label: component['Name'],
          value: component['RefId']
        })

        softwares.push({
          label: component['Asset-Items']['Software']['Name'],
          value: component['Asset-Items']['Software']['RefId']
        })

        return true
      })


      vm.setState({
        loading: false,
        program: res['program'],
        threats: threats,
        components: components,
        softwares: softwares,
        threatOptions: threatOptions,
        canGotoNextPhase: threats['Identification']['Total-Threats'] > threats['Identification']['Reduced-Threats'] ? false : true,
      }, () => {

      });
    }).catch(err => {
      vm.setState({
        loading: false,
        program: null,
      }, () => {
        console.error(err);
      });
    });

    //
    let riskAcceptanceOptions = [
      { label: "Avoiding the Risk", value: "AVOID", },
      { label: "Reducing the Risk", value: "REDUCE", },
      { label: "Sharing the Risk", value: "SHARE", },
      { label: "Retaining the Risk", value: "RETAIN", },
    ];

    //
    let securityControls = [
      'SC.JTAG_LOCKED',
      'SC.FW_AUTH',
      'SC.ROBUSTNESS',
      'SC.SECOC',
      'SC.Software Signature',
      'SC.Digital Certificate',
      'SC.Hashing ',
      'SC.Encryption',
      'SC.Decryption',
      'SC.Keys',
      'SC.PKI',
      'SC.Secure Diagnostics (UDS 27h)',
      'SC.Uni-directional Authentication (UDS 29h)',
      'SC.Bi-directional Authentication (UDS 29h)',
      'SC.Firewall',
      'SC.IDS',
      'SC.TLS',
      'SC.HTTPS',
      'ADD More (SC.Type)',
    ];

    //
    var securityControlOptions = [];
    securityControls.forEach(sc => {
      securityControlOptions.push({ label: sc, value: sc });
    });

    //
    vm.setState({
      riskAcceptanceOptions: riskAcceptanceOptions,
      securityControlOptions: securityControlOptions,
    });

    // Configure existing asset
    jQuery('body').on('click', '.identified-residusal-risk-button', function (ev) {
      ev.preventDefault();

      let refId = jQuery(this).attr('data-ref-id');
      vm.residusalRiskFromIdentificationArray(refId);


    });
    if ((this.state.riskData && this.state.riskData['Risk-Acceptance'] && this.state.riskData['Risk-Acceptance']['Reduced-Risk-Feasibility-Rating'])) {
      //
      vm.calculateFeasibilityRating();

      //
    } else {
      jQuery('.input-attack-step-feasibility-ratings').trigger('change');
    }


    //
    jQuery('body').on('change', '.input-attack-step-feasibility-ratings', function () {
      vm.calculateFeasibilityRating();
    });
  }

  //
  residusalRiskFromIdentificationArray(internalRefId) {
    //
    var vm = this;
    //
    swalConfirmationPopup({
      title: null,
      text: "This action will reset the asset metadata.",
      confirmButtonText: "Re-configure",
    }, () => {

      vm.setState({
        loading: true
      }, () => {
        //
        let params = {
          programUuid: vm.state.programUuid,
          internalRefId: internalRefId,
          action: 'Remove-From-Identification-Array',
        };

        //
        httpPost(apify('app/program/risk-remove-from-identification'), params).then((res) => {
          //
          // window.location.reload();

          let threats = res['program']['threats'];
          let threatOptions = vm.prepareThreatOptions(threats);
          let threatSelect = null;

          threatOptions.map(threat => {
            if (threat['value'] === res['riskData']['RefId']) {
              threatSelect = threat
            }
            return null
          })

          vm.setState({
            loading: false,
            program: res['program'],
            riskData: res['riskData'],
            threat: threatSelect['threat'],
            riskAcceptance: res['riskData']['Risk-Acceptance']['Type'],
            securityControls: res['riskData']['Risk-Acceptance']['Security-Controls'],
            threats: threats,
            threatOptions: threatOptions,
            threatSelect: threatSelect,
            canGotoNextPhase: threats['Identification']['Total-Threats'] > threats['Identification']['Reduced-Threats'] ? false : true,
          }, () => {
            this.onChangeThreatOption(threatSelect)
            this.onChangeRiskAcceptanceOptions(res['riskData']['Risk-Acceptance']['Type'])
            this.onChangeSecurityControlOptions(res['riskData']['Risk-Acceptance']['Security-Controls'])

            if (res['riskData']['Risk-Acceptance']) {
              this.setState({
                ComponentHardware: res['riskData']['Risk-Acceptance']['Cyber-Security-Requirements-Linked-To-Component-Hardware'],
                ComponentSoftware: res['riskData']['Risk-Acceptance']['Cyber-Security-Requirements-Linked-To-Component-Software']
              })

            }
          });

        });

      });

    });
  }

  //
  updateThreatProperty = (key, object) => {
  }

  //
  onChangeRiskAcceptanceOptions = (ev) => {
    let threat = this.state.threat;
    threat['Risk-Acceptance']['Type'] = ev;

    let allowRiskMarking = (ev['value'] !== 'REDUCE' || (this.state.securityControls && this.state.securityControls.length > 0));

    this.setState({
      threat: threat,
      riskAcceptance: ev,
      allowRiskMarking: allowRiskMarking,
    }, async () => {
      jQuery('.select').selectpicker('refresh');
      this.calculateFeasibilityRating();

      let attackStepFeasibility = await window.ProgramObject.attackStepFeasibilityRatingMappingColor(threat['Attack-Feasibility-Rating']);
      jQuery(`#Modal-Input-Attack-Feasibility-Rating-privious`).css({
        'background': attackStepFeasibility,
      });

      let impactrating = await window.ProgramObject.impactRatingsColor(threat['Impact-Rating-Value']);
      jQuery(`#Modal-Input-Impact-Rating-privious`).css({
        'background': impactrating,
      });
      let riskMaping = await window.ProgramObject.riskMappingColor(threat['Attack-Risk-Value'] && threat['Attack-Risk-Value']['Value']);
      jQuery(`#Modal-Input-Risk-Rating-privious`).css({
        'background': riskMaping,
      });


    });
  }

  //
  onChangeSecurityControlOptions = (ev) => {
    let threat = this.state.threat;
    threat['Risk-Acceptance']['Security-Controls'] = ev;

    this.setState({
      threat: threat,
      securityControls: ev,
      allowRiskMarking: true,
    });
  }

  //
  markRisk = (ev) => {
    let threat = this.state.threat;

    threat['Risk-Acceptance']['Reduced-Risk-Cyber-Security-Claim'] = jQuery('#Input-Cyber-Security-Claim').val();
    threat['Risk-Acceptance']['Reduced-Risk-Cyber-Security-Requirement'] = jQuery('#Input-New-Cyber-Security-Requirement').val();
    threat['Risk-Acceptance']['Reduced-Risk-Cyber-Security-Requirement-RefId'] = jQuery('#Input-New-Cyber-Security-Requirement-RefId').text();
    threat['Risk-Acceptance']['Cyber-Security-Requirements-Linked-To-Component-Hardware'] = this.state.ComponentHardware;
    threat['Risk-Acceptance']['Cyber-Security-Requirements-Linked-To-Component-Software'] = this.state.ComponentSoftware;
    threat['Risk-Acceptance']['Cyber-Security-Requirements-Linked-To-Component-Software-Sub-Group'] = jQuery('#Modal-Input-Component-Software-Sub-Group').val();
    threat['Risk-Acceptance']['Cyber-Security-Requirements-Linked-To-Component-Hardware-Sub-Group'] = jQuery('#Modal-Input-Component-Hardware-Sub-Group').val();


    threat['Risk-Acceptance']['Reduced-Risk-Feasibility-Rating'] = {
      'Specialist-Expertise': jQuery('#Modal-Input-Attack-Specialist-Expertise').val(),
      'Window-of-Opportunity': jQuery('#Modal-Input-Attack-Window-of-Opportunity').val(),
      'Attack-Equipment': jQuery('#Modal-Input-Attack-Equipment').val(),
      'Attack-Elapsed-Time': jQuery('#Modal-Input-Attack-Elapsed-Time').val(),
      'Knowledge-of-Item': jQuery('#Modal-Input-Attack-Knowledge-of-Item').val(),
      'Attack-Feasibility-Rating': jQuery('#Modal-Input-Attack-Feasibility-Rating').text(),
      'Impact-Rating': jQuery('#Modal-Input-Impact-Rating').text(),
      'Risk-Rating': jQuery('#Modal-Input-Risk-Rating').text(),
    }

    // var input = document.getElementById('fileinput');
    let files = jQuery('#Input-Cyber-Security-Claim-File').prop('files')


    if (files && files.length > 0) {
      // threat['Risk-Acceptance']['Reduced-Risk-Cyber-Security-Claim-Document'] = files[0];

      httpFile(apify('app/upload-file'), files[0]).then((res) => {

        if (res['success']) {
          threat['Risk-Acceptance']['Reduced-Risk-Cyber-Security-Claim-Document'] = res['url']


          let params = {
            'programUuid': this.state.programUuid,
            'threat': threat,
          };

          httpPost(apify('app/program/threats/mark-reduced-risk'), params, true).then((res) => {
            if (res['success']) {
              window.location.reload();
            }
          });
        }

        //

      });
    } else {
      //
      let params = {
        'programUuid': this.state.programUuid,
        'threat': threat,
      };

      httpPost(apify('app/program/threats/mark-reduced-risk'), params, true).then((res) => {
        if (res['success']) {
          window.location.reload();
        }
      });
    }

  }

  //
  moveSetupSecurityConceptPhase = (ev) => {
    let phaseRoute = programLifecycleRoute('Security-Concept', this.state.programUuid);
    this.props.history.push({
      pathname: phaseRoute,
    });
  }

  // Calculate Attack Step Feasibility Rating
  calculateFeasibilityRating = async () => {
    //
    let params = {};

    //
    jQuery('.input-attack-step-feasibility-ratings').each(function (idx, self) {
      let selectName = jQuery(this).attr('name');
      let optionValue = jQuery(this).val();
      let inputKey = `${selectName}-${optionValue}`;

      if ((selectName !== undefined) && (optionValue !== undefined) && inputKey) {
        params[inputKey] = optionValue;
      }

    });

    //
    let impactRating = this.state.threat['Impact-Rating-Value'];
    let attackStepFeasibility = await window.ProgramObject.calculateAttackStepFeasibilityRating(params, impactRating);

    //
    jQuery('#Modal-Input-Attack-Feasibility-Rating').text(attackStepFeasibility['Impact']);
    jQuery('#Modal-Input-Attack-Feasibility-Rating').closest('.alert').css({
      'background': attackStepFeasibility['Color'],
    });

    //
    jQuery('#Modal-Input-Impact-Rating').text(attackStepFeasibility['Impact-Rating']['Value']);
    jQuery('#Modal-Input-Impact-Rating').closest('.alert').css({
      'background': attackStepFeasibility['Impact-Rating']['Color'],
    });

    //
    jQuery('#Modal-Input-Risk-Rating').text(attackStepFeasibility['Risk-Value']['Value']);
    jQuery('#Modal-Input-Risk-Rating').closest('.alert').css({
      'background': attackStepFeasibility['Risk-Value']['Color'],
    });

  }

  //
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
                            <h3>Residual Risk</h3>
                            <small>Program Name</small> <br />
                            <Link to={programLifecycleRoute('VIEW', this.state.program['uuid'])}>
                              {this.state.program['name']}
                            </Link>
                          </div>
                          <div className="card-body">

                            <div className="row">
                              <div className="col-4">
                                Threats
                              </div>
                              <div className="col-6">
                                <Select
                                  options={this.state.threatOptions}
                                  onChange={(ev) => this.onChangeThreatOption(ev)}
                                  menuPortalTarget={document.body} styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                  value={this.state.threatSelect}
                                />
                              </div>
                            </div>

                            {
                              (this.state.threat !== undefined) &&
                              <div>

                                <div className="row my-3">
                                  <div className="col-4">
                                    Security Objective
                                  </div>
                                  <div className="col-6">
                                    <span className="input-readonly">{this.state.threat['Security-Objective']['Value']}</span>
                                  </div>
                                </div>

                                <div className="row my-3">
                                  <div className="col-4">
                                    Cyber Security Requirement
                                  </div>
                                  <div className="col-6">
                                    <span className="input-readonly">{this.state.threat['Cyber-Security-Requirements']}</span>
                                  </div>
                                </div>

                                <div className="row my-3">
                                  <div className="col-12">
                                    <hr />
                                  </div>
                                </div>

                                <div className="row my-3">
                                  <div className="col-3">
                                    <b className="highlight-label">
                                      Risk Acceptance
                                    </b>
                                  </div>
                                  <div className="col-7">
                                    <Select
                                      options={this.state.riskAcceptanceOptions}
                                      onChange={(ev) => this.onChangeRiskAcceptanceOptions(ev)}
                                      menuPortalTarget={document.body} styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                      value={this.state.riskAcceptance}
                                    />
                                  </div>
                                </div>

                                {
                                  this.state.riskAcceptance &&
                                  this.state.riskAcceptance['value'] === 'REDUCE' &&
                                  <div>
                                    <div className="row my-3">
                                      <div className="col-3">
                                        <b className="highlight-label">
                                          Security Controls
                                        </b>
                                      </div>
                                      <div className="col-7">
                                        <Select
                                          options={this.state.securityControlOptions}
                                          onChange={(ev) => this.onChangeSecurityControlOptions(ev)}
                                          menuPortalTarget={document.body} styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                          isMulti
                                          value={this.state.securityControls}
                                        />
                                      </div>
                                    </div>

                                    <div className="row my-3">

                                      <div className="col-12 mb-2 text-uppercase text-muted">
                                        Attack Step Feasibility Ratings
                                      </div>

                                      <div className="col-2">
                                        <label>Specialist Expertise</label>
                                        <select className="form-control md-form-control select my-2 input-attack-step-feasibility-ratings" name="Specialist-Expertise" id="Modal-Input-Attack-Specialist-Expertise" required>
                                          <option selected={this.state.riskData && this.state.riskData['Risk-Acceptance'] && this.state.riskData['Risk-Acceptance'] && this.state.riskData['Risk-Acceptance']['Reduced-Risk-Feasibility-Rating'] && this.state.riskData['Risk-Acceptance']['Reduced-Risk-Feasibility-Rating']['Specialist-Expertise'] === 'Layman'} value="Layman">Layman</option>
                                          <option selected={this.state.riskData && this.state.riskData['Risk-Acceptance'] && this.state.riskData['Risk-Acceptance'] && this.state.riskData['Risk-Acceptance']['Reduced-Risk-Feasibility-Rating'] && this.state.riskData['Risk-Acceptance']['Reduced-Risk-Feasibility-Rating']['Specialist-Expertise'] === 'Proficient'} value="Proficient">Proficient</option>
                                          <option selected={this.state.riskData && this.state.riskData['Risk-Acceptance'] && this.state.riskData['Risk-Acceptance'] && this.state.riskData['Risk-Acceptance']['Reduced-Risk-Feasibility-Rating'] && this.state.riskData['Risk-Acceptance']['Reduced-Risk-Feasibility-Rating']['Specialist-Expertise'] === 'Expert'} value="Expert">Expert</option>
                                          <option selected={this.state.riskData && this.state.riskData['Risk-Acceptance'] && this.state.riskData['Risk-Acceptance'] && this.state.riskData['Risk-Acceptance']['Reduced-Risk-Feasibility-Rating'] && this.state.riskData['Risk-Acceptance']['Reduced-Risk-Feasibility-Rating']['Specialist-Expertise'] === 'Multiple Experts'} value="Multiple">Multiple Experts</option>
                                        </select>
                                      </div>

                                      <div className="col-2">
                                        <label>Window of Opportunity</label>
                                        <select className="form-control md-form-control select my-2 input-attack-step-feasibility-ratings" name="Window-Of-Opportunity" id="Modal-Input-Attack-Window-of-Opportunity" required>
                                          <option selected={this.state.riskData && this.state.riskData['Risk-Acceptance'] && this.state.riskData['Risk-Acceptance'] && this.state.riskData['Risk-Acceptance']['Reduced-Risk-Feasibility-Rating'] && this.state.riskData['Risk-Acceptance']['Reduced-Risk-Feasibility-Rating']['Window-of-Opportunity'] === 'Unlimited'} value="Unlimited">Unlimited</option>
                                          <option selected={this.state.riskData && this.state.riskData['Risk-Acceptance'] && this.state.riskData['Risk-Acceptance'] && this.state.riskData['Risk-Acceptance']['Reduced-Risk-Feasibility-Rating'] && this.state.riskData['Risk-Acceptance']['Reduced-Risk-Feasibility-Rating']['Window-of-Opportunity'] === 'Easy'} value="Easy">Easy</option>
                                          <option selected={this.state.riskData && this.state.riskData['Risk-Acceptance'] && this.state.riskData['Risk-Acceptance'] && this.state.riskData['Risk-Acceptance']['Reduced-Risk-Feasibility-Rating'] && this.state.riskData['Risk-Acceptance']['Reduced-Risk-Feasibility-Rating']['Window-of-Opportunity'] === 'Moderate'} value="Moderate">Moderate</option>
                                          <option selected={this.state.riskData && this.state.riskData['Risk-Acceptance'] && this.state.riskData['Risk-Acceptance'] && this.state.riskData['Risk-Acceptance']['Reduced-Risk-Feasibility-Rating'] && this.state.riskData['Risk-Acceptance']['Reduced-Risk-Feasibility-Rating']['Window-of-Opportunity'] === 'Difficult/None'} value="Difficult/None">Difficult/None</option>
                                        </select>
                                      </div>

                                      <div className="col-2">
                                        <label>Equipment/Effort</label>
                                        <select className="form-control md-form-control select my-2 input-attack-step-feasibility-ratings" name="Equipment-Effort" id="Modal-Input-Attack-Equipment" required>
                                          <option selected={this.state.riskData && this.state.riskData['Risk-Acceptance'] && this.state.riskData['Risk-Acceptance'] && this.state.riskData['Risk-Acceptance']['Reduced-Risk-Feasibility-Rating'] && this.state.riskData['Risk-Acceptance']['Reduced-Risk-Feasibility-Rating']['Attack-Equipment'] === 'Standard'} value="Standard">Standard</option>
                                          <option selected={this.state.riskData && this.state.riskData['Risk-Acceptance'] && this.state.riskData['Risk-Acceptance'] && this.state.riskData['Risk-Acceptance']['Reduced-Risk-Feasibility-Rating'] && this.state.riskData['Risk-Acceptance']['Reduced-Risk-Feasibility-Rating']['Attack-Equipment'] === 'Specialiced'} value="Specialiced">Specialiced</option>
                                          <option selected={this.state.riskData && this.state.riskData['Risk-Acceptance'] && this.state.riskData['Risk-Acceptance'] && this.state.riskData['Risk-Acceptance']['Reduced-Risk-Feasibility-Rating'] && this.state.riskData['Risk-Acceptance']['Reduced-Risk-Feasibility-Rating']['Attack-Equipment'] === 'Bespoke'} value="Bespoke">Bespoke</option>
                                          <option selected={this.state.riskData && this.state.riskData['Risk-Acceptance'] && this.state.riskData['Risk-Acceptance'] && this.state.riskData['Risk-Acceptance']['Reduced-Risk-Feasibility-Rating'] && this.state.riskData['Risk-Acceptance']['Reduced-Risk-Feasibility-Rating']['Attack-Equipment'] === 'Multiple Bespoke'} value="Multiple Bespoke">Multiple Bespoke</option>
                                        </select>
                                      </div>

                                      <div className="col-3">
                                        <label>Elapsed Time</label>
                                        <select className="form-control md-form-control select my-2 input-attack-step-feasibility-ratings" name="Elapsed-Time" id="Modal-Input-Attack-Elapsed-Time" required>
                                          <option selected={this.state.riskData && this.state.riskData['Risk-Acceptance'] && this.state.riskData['Risk-Acceptance'] && this.state.riskData['Risk-Acceptance']['Reduced-Risk-Feasibility-Rating'] && this.state.riskData['Risk-Acceptance']['Reduced-Risk-Feasibility-Rating']['Attack-Elapsed-Time'] === 'Less-than 1 week'} value="Less-than 1 week">Less-than 1 week</option>
                                          <option selected={this.state.riskData && this.state.riskData['Risk-Acceptance'] && this.state.riskData['Risk-Acceptance'] && this.state.riskData['Risk-Acceptance']['Reduced-Risk-Feasibility-Rating'] && this.state.riskData['Risk-Acceptance']['Reduced-Risk-Feasibility-Rating']['Attack-Elapsed-Time'] === 'Less-than 1 month'} value="Less-than 1 month">Less-than 1 month</option>
                                          <option selected={this.state.riskData && this.state.riskData['Risk-Acceptance'] && this.state.riskData['Risk-Acceptance'] && this.state.riskData['Risk-Acceptance']['Reduced-Risk-Feasibility-Rating'] && this.state.riskData['Risk-Acceptance']['Reduced-Risk-Feasibility-Rating']['Attack-Elapsed-Time'] === 'Less-than 6 months'} value="Less-than 6 months">Less-than 6 months</option>
                                          <option selected={this.state.riskData && this.state.riskData['Risk-Acceptance'] && this.state.riskData['Risk-Acceptance'] && this.state.riskData['Risk-Acceptance']['Reduced-Risk-Feasibility-Rating'] && this.state.riskData['Risk-Acceptance']['Reduced-Risk-Feasibility-Rating']['Attack-Elapsed-Time'] === 'Less-than 3 years'} value="Less-than 3 years">Less-than 3 years</option>
                                          <option selected={this.state.riskData && this.state.riskData['Risk-Acceptance'] && this.state.riskData['Risk-Acceptance'] && this.state.riskData['Risk-Acceptance']['Reduced-Risk-Feasibility-Rating'] && this.state.riskData['Risk-Acceptance']['Reduced-Risk-Feasibility-Rating']['Attack-Elapsed-Time'] === 'More-than 3 years'} value="More-than 3 years">More-than 3 years</option>
                                        </select>
                                      </div>

                                      <div className="col-3">
                                        <label>Knowledge of Item</label>
                                        <select className="form-control md-form-control select my-2 input-attack-step-feasibility-ratings" name="Knowledge-Of-Item" id="Modal-Input-Attack-Knowledge-of-Item" required>
                                          <option selected={this.state.riskData && this.state.riskData['Risk-Acceptance'] && this.state.riskData['Risk-Acceptance'] && this.state.riskData['Risk-Acceptance']['Reduced-Risk-Feasibility-Rating'] && this.state.riskData['Risk-Acceptance']['Reduced-Risk-Feasibility-Rating']['Knowledge-of-Item'] === 'Negligible'} value="Negligible">Negligible</option>
                                          <option selected={this.state.riskData && this.state.riskData['Risk-Acceptance'] && this.state.riskData['Risk-Acceptance'] && this.state.riskData['Risk-Acceptance']['Reduced-Risk-Feasibility-Rating'] && this.state.riskData['Risk-Acceptance']['Reduced-Risk-Feasibility-Rating']['Knowledge-of-Item'] === 'Moderate'} value="Moderate">Moderate</option>
                                          <option selected={this.state.riskData && this.state.riskData['Risk-Acceptance'] && this.state.riskData['Risk-Acceptance'] && this.state.riskData['Risk-Acceptance']['Reduced-Risk-Feasibility-Rating'] && this.state.riskData['Risk-Acceptance']['Reduced-Risk-Feasibility-Rating']['Knowledge-of-Item'] === 'Major'} value="Major">Major</option>
                                          <option selected={this.state.riskData && this.state.riskData['Risk-Acceptance'] && this.state.riskData['Risk-Acceptance'] && this.state.riskData['Risk-Acceptance']['Reduced-Risk-Feasibility-Rating'] && this.state.riskData['Risk-Acceptance']['Reduced-Risk-Feasibility-Rating']['Knowledge-of-Item'] === 'Severe'} value="Severe">Severe</option>
                                        </select>
                                      </div>

                                    </div>

                                    {this.state.threat && this.state.threat['Attack-CAL'] && this.state.threat['Attack-CAL']['Value'] && <div className="row my-3">
                                      <div className="col-12 mb-2 text-uppercase text-muted">
                                        Previous Ratings
                                      </div>

                                      <div className="col-4">
                                        <div className="alert alert-primary" id="Modal-Input-Attack-Feasibility-Rating-privious">
                                          <span className="alert-attack-type">Previous Attack Feasibility Rating</span> <br />
                                          <span  className="alert-attack-value">{this.state.threat && this.state.threat['Attack-Feasibility-Rating']}</span>
                                        </div>
                                      </div>

                                      <div className="col-4">
                                        <div className="alert alert-primary" id="Modal-Input-Impact-Rating-privious">
                                          <span className="alert-attack-type">Previous Impact Rating</span> <br />
                                          <span  className="alert-attack-value">{this.state.threat && this.state.threat['Impact-Rating-Value']}</span>
                                        </div>
                                      </div>

                                      <div className="col-4">
                                        <div className="alert alert-warning" id="Modal-Input-Risk-Rating-privious">
                                          <span className="alert-attack-type">Previous Risk Rating</span> <br />
                                          <span  className="alert-attack-value">{this.state.threat && this.state.threat['Attack-Risk-Value'] && this.state.threat['Attack-Risk-Value']['Value']}</span>
                                        </div>
                                      </div>
                                    </div>}
                                    <div className="row my-3">
                                      <div className="col-12 mb-2 text-uppercase text-muted">
                                        Ratings
                                      </div>

                                      <div className="col-4">
                                        <div className="alert alert-primary">
                                          <span className="alert-attack-type">Attack Feasibility Rating</span> <br />
                                          <span id="Modal-Input-Attack-Feasibility-Rating" className="alert-attack-value">{(this.state.riskData && this.state.riskData['Risk-Acceptance'] && this.state.riskData['Risk-Acceptance']['Reduced-Risk-Feasibility-Rating']) ? this.state.riskData['Risk-Acceptance']['Reduced-Risk-Feasibility-Rating']['Attack-Feasibility-Rating'] : ''}</span>
                                        </div>
                                      </div>

                                      <div className="col-4">
                                        <div className="alert alert-primary">
                                          <span className="alert-attack-type">Impact Rating</span> <br />
                                          <span id="Modal-Input-Impact-Rating" className="alert-attack-value">{(this.state.riskData && this.state.riskData['Risk-Acceptance'] && this.state.riskData['Risk-Acceptance']['Reduced-Risk-Feasibility-Rating']) ? this.state.riskData['Risk-Acceptance']['Reduced-Risk-Feasibility-Rating']['Impact-Rating'] : ''}</span>
                                        </div>
                                      </div>

                                      <div className="col-4">
                                        <div className="alert alert-warning">
                                          <span className="alert-attack-type">Risk Rating</span> <br />
                                          <span id="Modal-Input-Risk-Rating" className="alert-attack-value">{(this.state.riskData && this.state.riskData['Risk-Acceptance'] && this.state.riskData['Risk-Acceptance']['Reduced-Risk-Feasibility-Rating']) ? this.state.riskData['Risk-Acceptance']['Reduced-Risk-Feasibility-Rating']['Risk-Rating'] : ''}</span>
                                        </div>
                                      </div>
                                    </div>

                                    <div className="row my-3">
                                      <div className="col-3">
                                        <small>New Cyber Security Requirement</small>  <br />
                                        After Residual Risk
                                      </div>
                                      <div className="col-6">
                                        <input id="Input-New-Cyber-Security-Requirement" defaultValue={this.state.riskData && this.state.riskData['Risk-Acceptance'] && this.state.riskData['Risk-Acceptance']['Reduced-Risk-Cyber-Security-Requirement']} className="form-control md-form-control" placeholder="New Cyber Security Requirement" />
                                      </div>
                                      <div className="col-3">
                                        <span id="Input-New-Cyber-Security-Requirement-RefId" className="input-readonly">{uuidV4()}</span>
                                      </div>
                                    </div>

                                    <div className="row my-3">
                                      <div className="col-12">
                                        <hr />
                                      </div>
                                    </div>

                                    <div className="row my-3">
                                      <div className="col-3">
                                        Cyber Security Claim
                                      </div>
                                      <div className="col-6">
                                        <input id="Input-Cyber-Security-Claim" defaultValue={this.state.riskData && this.state.riskData['Risk-Acceptance'] && this.state.riskData['Risk-Acceptance']['Reduced-Risk-Cyber-Security-Claim']} className="form-control md-form-control" placeholder="Cyber Security Claim" />
                                      </div>

                                      <div className="col-3 mt-n4">
                                        <input id="Input-Cyber-Security-Claim-File" type="file" name="csv" className="form-control" placeholder="Cyber Security Claim" />
                                      </div>
                                    </div>

                                    <div className="row my-3">
                                      <div className="col-3">
                                        Cybersecurity Requirement Linked to Component Hardware
                                      </div>
                                      <div className="col-6">
                                        <Select
                                          options={this.state.components}
                                          onChange={(ev) => {
                                            this.setState({
                                              ComponentHardware: ev
                                            })
                                          }}
                                          value={this.state.ComponentHardware}
                                        />
                                      </div>
                                    </div>
                                    <div className="row my-3">
                                      <div className="col-3">
                                        Cybersecurity Requirement Linked to Component Hardware Sub Group
                                      </div>
                                      <div className="col-6">
                                        <select className="form-control md-form-control select my-2 " id="Modal-Input-Component-Hardware-Sub-Group">
                                          <option value="None" selected={this.state.riskData && this.state.riskData['Risk-Acceptance'] && this.state.riskData['Risk-Acceptance']['Component-Hardware-Sub-Group'] === 'None'}>None</option>
                                          <option value="Sensors" selected={this.state.riskData && this.state.riskData['Risk-Acceptance'] && this.state.riskData['Risk-Acceptance']['Component-Hardware-Sub-Group'] === 'Sensors'}>Sensors</option>
                                          <option value="OBD Port" selected={this.state.riskData && this.state.riskData['Risk-Acceptance'] && this.state.riskData['Risk-Acceptance']['Component-Hardware-Sub-Group'] === 'OBD Port'}>OBD Port</option>
                                          <option value="Immobiliser" selected={this.state.riskData && this.state.riskData['Risk-Acceptance'] && this.state.riskData['Risk-Acceptance']['Component-Hardware-Sub-Group'] === 'Immobiliser'}>Immobiliser</option>
                                          <option value="Mobile Phone" selected={this.state.riskData && this.state.riskData['Risk-Acceptance'] && this.state.riskData['Risk-Acceptance']['Component-Hardware-Sub-Group'] === 'Mobile Phone'}>Mobile Phone</option>
                                          <option value="Radio Antenna" selected={this.state.riskData && this.state.riskData['Risk-Acceptance'] && this.state.riskData['Risk-Acceptance']['Component-Hardware-Sub-Group'] === 'Radio Antenna'}>Radio Antenna</option>
                                          <option value="Radar Sensor" selected={this.state.riskData && this.state.riskData['Risk-Acceptance'] && this.state.riskData['Risk-Acceptance']['Component-Hardware-Sub-Group'] === 'Radar Sensor'}>Radar Sensor</option>
                                          <option value="Camera Sensor" selected={this.state.riskData && this.state.riskData['Risk-Acceptance'] && this.state.riskData['Risk-Acceptance']['Component-Hardware-Sub-Group'] === 'Camera Sensor'}>Camera Sensor</option>
                                          <option value="Lidar Sensor" selected={this.state.riskData && this.state.riskData['Risk-Acceptance'] && this.state.riskData['Risk-Acceptance']['Component-Hardware-Sub-Group'] === 'Lidar Sensor'}>Lidar Sensor</option>
                                          <option value="External Server" selected={this.state.riskData && this.state.riskData['Risk-Acceptance'] && this.state.riskData['Risk-Acceptance']['Component-Hardware-Sub-Group'] === 'External Server'}>External Server</option>
                                          <option value="External Application or Service" selected={this.state.riskData && this.state.riskData['Risk-Acceptance'] && this.state.riskData['Risk-Acceptance']['Component-Hardware-Sub-Group'] === 'External Application or Service'}>External Application or Service</option>
                                          <option value="Cloud Storage" selected={this.state.riskData && this.state.riskData['Risk-Acceptance'] && this.state.riskData['Risk-Acceptance']['Component-Hardware-Sub-Group'] === 'Cloud Storage'}>Cloud Storage</option>
                                          <option value="Database System" selected={this.state.riskData && this.state.riskData['Risk-Acceptance'] && this.state.riskData['Risk-Acceptance']['Component-Hardware-Sub-Group'] === 'Database System'}>Database System</option>
                                          <option value="File System" selected={this.state.riskData && this.state.riskData['Risk-Acceptance'] && this.state.riskData['Risk-Acceptance']['Component-Hardware-Sub-Group'] === 'File System'}>File System</option>
                                          <option value="Configuration File" selected={this.state.riskData && this.state.riskData['Risk-Acceptance'] && this.state.riskData['Risk-Acceptance']['Component-Hardware-Sub-Group'] === 'Configuration File'}>Configuration File</option>
                                          <option value="Device Local Storage" selected={this.state.riskData && this.state.riskData['Risk-Acceptance'] && this.state.riskData['Risk-Acceptance']['Component-Hardware-Sub-Group'] === 'Device Local Storage'}>Device Local Storage</option>
                                          <option value="Removable Storage" selected={this.state.riskData && this.state.riskData['Risk-Acceptance'] && this.state.riskData['Risk-Acceptance']['Component-Hardware-Sub-Group'] === 'Removable Storage'}>Removable Storage</option>
                                          <option value="PKI" selected={this.state.riskData && this.state.riskData['Risk-Acceptance'] && this.state.riskData['Risk-Acceptance']['Component-Hardware-Sub-Group'] === 'PKI'}>PKI</option>
                                          <option value="Industry Grade HSM" selected={this.state.riskData && this.state.riskData['Risk-Acceptance'] && this.state.riskData['Risk-Acceptance']['Component-Hardware-Sub-Group'] === 'Industry Grade HSM'}>Industry Grade HSM</option>
                                          <option value="Others" selected={this.state.riskData && this.state.riskData['Risk-Acceptance'] && this.state.riskData['Risk-Acceptance']['Component-Hardware-Sub-Group'] === 'Others'}>Others</option>
                                        </select>
                                      </div>
                                    </div>
                                    <div className="row my-3">
                                      <div className="col-3">
                                        Cybersecurity Requirement Linked to Component Software
                                      </div>
                                      <div className="col-6">
                                        <Select
                                          options={this.state.softwares}
                                          onChange={(ev) => {
                                            this.setState({
                                              ComponentSoftware: ev
                                            })
                                          }}
                                          value={this.state.ComponentSoftware}
                                        />
                                      </div>
                                    </div>
                                    <div className="row my-3">
                                      <div className="col-3">
                                        Cybersecurity Requirement Linked to Component Software Sub Group
                                      </div>
                                      <div className="col-6">
                                        <select className="form-control md-form-control select my-2 " id="Modal-Input-Component-Software-Sub-Group">
                                          <option value="None" selected={this.state.riskData && this.state.riskData['Risk-Acceptance'] && this.state.riskData['Risk-Acceptance']['Component-Software-Sub-Group'] === 'None'}>None</option>
                                          <option value="Bootloader" selected={this.state.riskData && this.state.riskData['Risk-Acceptance'] && this.state.riskData['Risk-Acceptance']['Component-Software-Sub-Group'] === 'Bootloader'}>Bootloader</option>
                                          <option value="Aplication Software" selected={this.state.riskData && this.state.riskData['Risk-Acceptance'] && this.state.riskData['Risk-Acceptance']['Component-Software-Sub-Group'] === 'Aplication Software'}>Aplication Software</option>
                                          <option value="Diagnostics" selected={this.state.riskData && this.state.riskData['Risk-Acceptance'] && this.state.riskData['Risk-Acceptance']['Component-Software-Sub-Group'] === 'Diagnostics'}>Diagnostics</option>
                                          <option value="Others" selected={this.state.riskData && this.state.riskData['Risk-Acceptance'] && this.state.riskData['Risk-Acceptance']['Component-Software-Sub-Group'] === 'Others'}>Others</option>
                                        </select>
                                      </div>
                                    </div>


                                  </div>
                                }

                              </div>
                            }

                          </div>
                          <div className="card-footer">
                            <button type="button" className="btn btn-success btn-lg" onClick={(ev) => this.markRisk(ev)} disabled={!this.state.allowRiskMarking}>
                              Mark <b>Risk</b>
                            </button>
                          </div>
                        </div>
                      }

                      {
                        (this.state.canGotoNextPhase) &&
                        <div className="card">
                          <div className="card-header">
                            <h3>Residual Risk</h3>
                            <small>Program</small> <br />
                            <Link to={programLifecycleRoute('VIEW', this.state.program['uuid'])}>
                              {this.state.program['name']}
                            </Link>
                          </div>
                          <div className="card-body">
                            <div className="row">
                              <div className="col-12">
                                All Risks have been Residused, you may
                                proceed to <b>Security Concept Phase.</b>
                              </div>
                            </div>
                          </div>
                          <div className="card-footer">
                          <Link to={programLifecycleRoute('Threat-Analysis', this.state.program['uuid'])} className="btn btn-success text-white">
                              Back to <b>Threat Analysis</b>
                            </Link>
                            <Link to={programLifecycleRoute('Security-Concept', this.state.program['uuid'])} className="btn btn-success text-white float-right">
                              <b>Generate Cybersecurity Concept</b>
                            </Link>
                          </div>
                        </div>
                      }
                    </div>

                    {
                      this.state.program &&
                      <div className="col-12 col-md-12 my-5">
                        <div className="card">
                          <div className="card-header">
                            <h3>Reduced Risks</h3>
                          </div>
                          <div className="card-body p-0">
                            <table className="table table-bordered">
                              <thead>
                                <tr>
                                  <th>Threat</th>
                                  <th>Security</th>
                                  <th>Acceptance</th>
                                  <th></th>
                                </tr>
                              </thead>
                              <tbody>
                                {
                                  this.state.threats['Identification']['Threats'].map(threat => {
                                    if (threat['Threat-Reduced'] !== undefined && threat['Threat-Reduced']) {
                                      return <tr key={threat['RefId']}>
                                        <td>{threat['Parent-Asset']}</td>
                                        <td>{threat['Parent-Cyber-Security']}</td>
                                        <td>{threat['Risk-Acceptance']['Type']['value']}</td>
                                        {/* <td className="text-right">
                                        <a href="#!">
                                          <i className="fa fa-gear mr-1"></i>
                                          Re-Configure
                                        </a>
                                      </td> */}
                                        <td className="text-right">
                                          {(this.state.program['status'] !== 'APPROVED' && this.state.program['status'] !== 'UNDER-REVIEW') && <a href="#!" className="identified-residusal-risk-button" data-ref-id={threat['RefId']}>
                                            <i className="fa fa-gear mr-1"></i>
                                            Re-Configure
                                          </a>}
                                          {(this.state.program['status'] === 'APPROVED' || this.state.program['status'] === 'UNDER-REVIEW') && <a href="#!" onClick={() => this.threatViewFromIdentificationArray(threat)}>
                                            <i className="fa fa-eye mr-1"></i>
                                            View
                                          </a>}
                                        </td>
                                      </tr>
                                    } else {
                                      return null
                                    }
                                  })
                                }
                              </tbody>
                            </table>

                            {(this.state.program['status'] !== 'APPROVED' && this.state.program['status'] !== 'UNDER-REVIEW') && <div className="alert alert-info m-2">
                              <h5>Alert</h5>
                              {this.state.threats['Identification']['Reduced-Threats']} of {this.state.threats['Identification']['Identified-Threats']} threat risks are evaluated.
                            </div>}

                          </div>

                          <div className="card-footer" >
                           
                            <button className="btn btn-success btn-lg" disabled={!this.state.canGotoNextPhase} onClick={(ev) => this.moveSetupSecurityConceptPhase(ev)}>
                              <b>Generate Cybersecurity Concept</b>
                            </button>
                          </div>

                        </div>
                        <div className="modal fade" id="Modal-Show-Details" tabIndex="-1" data-backdrop="static">
                          <div className="modal-dialog modal-full-width">

                            <div className="modal-content">
                              <div className="modal-header">
                                <h4 className="modal-title text-primary">
                                  Threat & Risk Assesment (TARA)
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
                                        <td>Threat</td>
                                        <td>{this.state.currentThreatView['Parent-Asset']} ({this.state.currentThreatView['Parent-Cyber-Security']})</td>
                                      </tr>
                                      <tr>
                                        <td>Cyber Security Concept</td>
                                        <td>{this.state.currentThreatView['Parent-Cyber-Security']}</td>
                                      </tr>
                                      <tr>
                                        <td>Security Objective</td>
                                        <td>{this.state.currentThreatView['Security-Objective'] && this.state.currentThreatView['Security-Objective']['Value'] && this.state.currentThreatView['Security-Objective']['Value']}</td>
                                      </tr>
                                      <tr>
                                        <td>Cyber Security Requirements</td>
                                        <td>{this.state.currentThreatView['Cyber-Security-Requirements']}</td>
                                      </tr>
                                      <tr>
                                        <td>Risk Acceptance</td>
                                        <td>{this.state.currentThreatView['Risk-Acceptance'] && this.state.currentThreatView['Risk-Acceptance']['Type'] && this.state.currentThreatView['Risk-Acceptance']['Type']['label']}</td>
                                      </tr>
                                      <tr>
                                        <td>Security Controls</td>
                                        <td>{this.state.currentThreatView['Risk-Acceptance'] && this.state.currentThreatView['Risk-Acceptance']['Security-Controls'] &&
                                          this.state.currentThreatView['Risk-Acceptance']['Security-Controls'].map((type, key) => {
                                            return <span>{key !== 0 && ', '} {type['label']} </span>
                                          })
                                        }</td>
                                      </tr>
                                      <tr>
                                        <td>Reduced Risk Feasibility Rating</td>
                                        <td>
                                          <table className="table table-bordered">
                                            <thead>
                                              <tr>
                                                <th>Specialist Expertise</th>
                                                <th>Window of Opportunity</th>
                                                <th>Attack Equipment</th>
                                                <th>Attack Elapsed Time</th>
                                                <th>Knowledge of Item</th>
                                              </tr>
                                            </thead>
                                            <tbody>
                                              <tr>
                                                <td>{this.state.currentThreatView['Risk-Acceptance'] && this.state.currentThreatView['Risk-Acceptance']['Reduced-Risk-Feasibility-Rating'] && this.state.currentThreatView['Risk-Acceptance']['Reduced-Risk-Feasibility-Rating']['Specialist-Expertise']}</td>
                                                <td>{this.state.currentThreatView['Risk-Acceptance'] && this.state.currentThreatView['Risk-Acceptance']['Reduced-Risk-Feasibility-Rating'] && this.state.currentThreatView['Risk-Acceptance']['Reduced-Risk-Feasibility-Rating']['Window-of-Opportunity']}</td>
                                                <td>{this.state.currentThreatView['Risk-Acceptance'] && this.state.currentThreatView['Risk-Acceptance']['Reduced-Risk-Feasibility-Rating'] && this.state.currentThreatView['Risk-Acceptance']['Reduced-Risk-Feasibility-Rating']['Attack-Equipment']}</td>
                                                <td>{this.state.currentThreatView['Risk-Acceptance'] && this.state.currentThreatView['Risk-Acceptance']['Reduced-Risk-Feasibility-Rating'] && this.state.currentThreatView['Risk-Acceptance']['Reduced-Risk-Feasibility-Rating']['Attack-Elapsed-Time']}</td>
                                                <td>{this.state.currentThreatView['Risk-Acceptance'] && this.state.currentThreatView['Risk-Acceptance']['Reduced-Risk-Feasibility-Rating'] && this.state.currentThreatView['Risk-Acceptance']['Reduced-Risk-Feasibility-Rating']['Knowledge-of-Item']}</td>
                                              </tr>
                                            </tbody>
                                          </table>
                                        </td>
                                      </tr>

                                      <tr>
                                        <td>Attack Feasibility Rating</td>
                                        <td>{this.state.currentThreatView['Risk-Acceptance'] && this.state.currentThreatView['Risk-Acceptance']['Reduced-Risk-Feasibility-Rating'] && this.state.currentThreatView['Risk-Acceptance']['Reduced-Risk-Feasibility-Rating']['Attack-Feasibility-Rating']}</td>
                                      </tr>
                                      <tr>
                                        <td>Impact Rating</td>
                                        <td>{this.state.currentThreatView['Risk-Acceptance'] && this.state.currentThreatView['Risk-Acceptance']['Reduced-Risk-Feasibility-Rating'] && this.state.currentThreatView['Risk-Acceptance']['Reduced-Risk-Feasibility-Rating']['Impact-Rating']}</td>
                                      </tr>
                                      <tr>
                                        <td>Risk Rating</td>
                                        <td>{this.state.currentThreatView['Risk-Acceptance'] && this.state.currentThreatView['Risk-Acceptance']['Reduced-Risk-Feasibility-Rating'] && this.state.currentThreatView['Risk-Acceptance']['Reduced-Risk-Feasibility-Rating']['Risk-Rating']}</td>

                                      </tr>
                                      <tr>
                                        <td>Reduced Risk Cyber Security Requirement</td>
                                        <td>{this.state.currentThreatView['Risk-Acceptance'] && this.state.currentThreatView['Risk-Acceptance']['Reduced-Risk-Cyber-Security-Requirement']}</td>
                                      </tr>
                                      <tr>
                                        <td>Reduced Risk Cyber Security Claim</td>
                                        <td>{this.state.currentThreatView['Risk-Acceptance'] && this.state.currentThreatView['Risk-Acceptance']['Reduced-Risk-Cyber-Security-Claim']}</td>
                                      </tr>
                                      <tr>
                                        <td>Cyber Security Requirements Linked To Component Hardware</td>
                                        <td>{this.state.currentThreatView['Risk-Acceptance'] && this.state.currentThreatView['Risk-Acceptance']['Cyber-Security-Requirements-Linked-To-Component-Hardware'] && this.state.currentThreatView['Risk-Acceptance']['Cyber-Security-Requirements-Linked-To-Component-Hardware'] && this.state.currentThreatView['Risk-Acceptance']['Cyber-Security-Requirements-Linked-To-Component-Hardware']['label']}</td>
                                      </tr>
                                      <tr>
                                        <td>Cyber Security Requirements Linked To Component Software</td>
                                        <td>{this.state.currentThreatView['Risk-Acceptance'] && this.state.currentThreatView['Risk-Acceptance']['Cyber-Security-Requirements-Linked-To-Component-Software'] && this.state.currentThreatView['Risk-Acceptance']['Cyber-Security-Requirements-Linked-To-Component-Software'] && this.state.currentThreatView['Risk-Acceptance']['Cyber-Security-Requirements-Linked-To-Component-Software']['label']}</td>
                                      </tr>
                                      <tr>
                                        <td>Cyber Security Requirements Linked To Component Software Sub Group</td>
                                        <td>{this.state.currentThreatView['Risk-Acceptance'] && this.state.currentThreatView['Risk-Acceptance']['Cyber-Security-Requirements-Linked-To-Component-Software-Sub-Group']}</td>
                                      </tr>
                                      <tr>
                                        <td>Cyber Security Requirements Linked To Component Hardware Sub Group</td>
                                        <td>{this.state.currentThreatView['Risk-Acceptance'] && this.state.currentThreatView['Risk-Acceptance']['Cyber-Security-Requirements-Linked-To-Component-Hardware-Sub-Group']}</td>
                                      </tr>

                                    </tbody>
                                  </table>
                                }
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
            }
          </div>

        </DashboardLayout>
      </div>
    );
  }
}

// Residual Risk
export default withRouter(ResidualRisk);