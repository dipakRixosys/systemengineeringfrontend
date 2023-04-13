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
import { setTitle, modal, uuidV4, programLifecycleRoute } from "helpers/common";
// Network Helpers
import { httpGet, apify } from 'helpers/network';
// jQuery
const jQuery = window.jQuery;

// Security Concept
class SecurityConcept extends React.Component {
  //
  state = {
    loading: true,
    programUuid: undefined,
    program: undefined,
    threats: undefined,
    assets: undefined,
    securityControls: [],
  };

  //
  prepareAssetOptions = (threats) => {
    var assetArray = [];
    threats['Items'].forEach(item => {
      if (item['Identified']) {

        //
        var securityPropertyOptions = [];
        item['Cyber-Security-Properties'].forEach(securityProperty => {
          securityPropertyOptions.push({
            label: securityProperty,
            value: securityProperty,
          });

        });
        item['Cyber-Security-Properties-Options'] = securityPropertyOptions;

        //
        assetArray.push({
          value: item['RefId'],
          label: item['Name'],
          property: item,
        });

      }
    });
    return assetArray;
  }

  //
  onChangeAssetOption = (ev) => {



    this.setState({
      property: ev['property'],
      label: ev['label'],
    }, () => {
      jQuery('.select').selectpicker('refresh');
    });
  }

  //
  onChangeSecurityControlOptions = (ev) => {
    this.setState({
      securityControls: ev,
    });
  }

  //
  onConfirmation = (ev) => {
    //
    ev.preventDefault();
    //
    modal('#ModalConfirmation', 'hide');
    //

    let { programUuid } = this.props['match']['params'];
    httpGet(apify(`app/program/program-submit-review?programUuid=${programUuid}`)).then(res => {
      let phaseRoute = programLifecycleRoute('VIEW', this.state.programUuid);
      this.props.history.push({
        pathname: phaseRoute,
      });
    })
  }

  //
  onSubmitSecurityConcept = (ev) => {
    ev.preventDefault();
    modal('#ModalConfirmation');
  }


  //
  async componentDidMount() {
    //
    setTitle("Security Concept");

    //
    jQuery('.select').selectpicker('refresh');

    //
    let { programUuid } = this.props['match']['params'];

    //
    this.setState({
      programUuid: programUuid
    });

    var vm = this;

    httpGet(apify(`app/program/?programUuid=${programUuid}`)).then(res => {
      let threats = res['program']['threats'];
      let assets = vm.prepareAssetOptions(threats);

      vm.setState({
        loading: false,
        program: res['program'],
        threats: threats,
        assets: assets,
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
                    <div className="col-12">

                      {
                        (true) &&
                        <div className="card">
                          <div className="card-header">
                            <h3>Security Concept</h3>
                            <small>Program Name</small> <br />
                            <Link to={programLifecycleRoute('VIEW', this.state.program['uuid'])}>
                              {this.state.program['name']}
                            </Link>
                          </div>
                          <div className="card-body">

                            {false && <div className="row">
                              <div className="col-4">
                                Asset ID
                              </div>
                              <div className="col-6">
                                <Select
                                  options={this.state.assets}
                                  onChange={(ev) => this.onChangeAssetOption(ev)}
                                  menuPortalTarget={document.body} styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                />
                              </div>
                            </div>}

                            {
                              <>
                                <table className='table  w-100 table-responsive '>
                                  <thead>
                                    <tr>
                                      <th>Asset Name</th>
                                      <th>Threat</th>
                                      <th>Risk Acceptance Type</th>
                                      <th>Impact Rating</th>
                                      <th>Attack feasiblity Rating</th>
                                      <th>Risk Value</th>
                                      <th>CAL Level</th>
                                      <th>Security Controls</th>
                                      <th>Cybersecurity Goal</th>
                                      <th>Cybersecurity Requirement</th>
                                      <th>After Residual Risk</th>
                                      <th>Cybersecurity Claim</th>
                                      <th>Cyber Security Requirements Linked To Component Software</th>
                                      <th>Cyber Security Requirements Linked To Component Hardware</th>
                                      {/* <th>Cybersecurity Document</th> */}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {
                                      this.state.assets && this.state.assets.map((asset) => {
                                        return <>
                                          {
                                            Object.keys(asset['property']['Threats']).map((key) => {

                                              let threat = asset['property']['Threats'][key]
                                              return <tr>
                                                <td>{`${asset['label']} (${asset['value']})`}</td>
                                                <td>{`${key}`}</td>
                                                <td>{(threat['Risk-Acceptance']['Type'] ? threat['Risk-Acceptance']['Type']['value'] : 'N/A')}</td>
                                                <td>{(threat['Impact-Rating-Value'])}</td>
                                                <td>{(threat['Attack-Feasibility-Rating'])}</td>
                                                <td>{(threat['Attack-Risk-Value'] && threat['Attack-Risk-Value']['Value'])}</td>
                                                <td>{(threat['Attack-CAL'] && threat['Attack-CAL']['Value'])}</td>
                                                <td>{threat['Risk-Acceptance']['Security-Controls'].map(control => {
                                                  return <span className='badge badge-primary mx-1'>{control.value}</span>
                                                }
                                                )}</td>
                                                <td>{threat['Cyber-Security-Goal']}</td>
                                                <td>{threat['Cyber-Security-Requirements']}</td>

                                                <td>{threat['Risk-Acceptance']['Reduced-Risk-Cyber-Security-Requirement']}</td>

                                                <td>{threat['Risk-Acceptance']['Reduced-Risk-Cyber-Security-Claim']}</td>


                                                {/* <td>{threat['Risk-Acceptance']['Cyber-Security-Requirements-Type']}</td> */}
                                                <td>{threat['Risk-Acceptance']['Cyber-Security-Requirements-Linked-To-Component-Software'] ? threat['Risk-Acceptance']['Cyber-Security-Requirements-Linked-To-Component-Software']['label'] : ''}</td>
                                                <td>{threat['Risk-Acceptance']['Cyber-Security-Requirements-Linked-To-Component-Hardware'] ? threat['Risk-Acceptance']['Cyber-Security-Requirements-Linked-To-Component-Hardware']['label'] : ''}</td>

                                              </tr>
                                            })
                                          }
                                        </>

                                      })
                                    }

                                  </tbody>
                                </table>
                              </>
                            }

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
                                  <div className="col-12">
                                    <hr />
                                  </div>
                                </div>



                                {
                                  false &&
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
                                        />
                                      </div>
                                    </div>

                                    <div className="row my-3">
                                      <div className="col-3">
                                        <small>New Cyber Security Requirement</small>  <br />
                                        After Residual Risk
                                      </div>
                                      <div className="col-6">
                                        <input className="form-control md-form-control" placeholder="New Cyber Security Requirement" />
                                      </div>
                                      <div className="col-3">
                                        <span className="input-readonly">{uuidV4()}</span>
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
                                        <input className="form-control md-form-control" placeholder="Cyber Security Claim" />
                                        <a href="#!" className="link-sm link-with-border">
                                          View Claim Document
                                        </a>
                                      </div>
                                    </div>

                                  </div>
                                }

                              </div>
                            }

                          </div>
                          {/* <div className="card-footer">
                            <button type="button" className="btn btn-success btn-lg" onClick={(ev) => this.onSubmitSecurityConcept(ev)}>
                              Submit for <b>Review</b>
                            </button>
                          </div> */}
                        </div>
                      }

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
                              You are about to make the final submission of the concept / development / production / updates phase</label>
                          </div>


                        </div>
                        <div className="card-footer">
                          <button type="button" className="btn btn-success btn-lg" disabled={!this.state.submitReview} onClick={(ev) => this.onSubmitSecurityConcept(ev)}>
                            Submit for <b>Review</b>
                          </button>
                        </div>
                      </div>}

                    </div>
                  </div>
                }
              </div>
            }
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
                        <p>You are about to make the final submission of the concept / development / production / updates phase.</p>
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

        </DashboardLayout>
      </div>
    );
  }
}

// Security Concept
export default withRouter(SecurityConcept);