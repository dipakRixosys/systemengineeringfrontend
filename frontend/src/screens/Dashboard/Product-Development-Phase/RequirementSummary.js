// React
import React from 'react';
// Router
import { withRouter, Link } from 'react-router-dom';
// Layout
import DashboardLayout from "screens/Layouts/DashboardLayout";
// Loader
import PlaceholderLoader from 'components/ui/placeholder-loader/placeholder-loader';
// Helpers
import { setTitle, programLifecycleRoute, swalPopup } from "helpers/common";
// Network Helpers
import { httpGet, apify, httpPost } from 'helpers/network';
// jQuery
const jQuery = window.jQuery;

// Requirement Summary
class RequirementSummary extends React.Component {
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
  onConfirmation = (ev) => {
    let params = {
      programUuid: this.state.programUuid,
      cycle: 'Requirements-Summary'
    }

    httpPost(apify('app/program/submit-cycle-status'), params).then(data => {

      let phaseRoute = `/dashboard/product-development-phase/design-specification/${this.state.programUuid}`;
      this.props.history.push(phaseRoute);
    }).catch(() => {
      swalPopup("Something went wrong.");
    });

  }


  //
  async componentDidMount() {
    //
    setTitle("Requirement Summary - Product Development Phase");

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

                            <div className="row">
                              <div className="col-8">
                                <h3>Requirement Summary</h3>
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

                            {
                              <>
                                <table className='table  w-100 table-responsive '>
                                  <thead>
                                    <tr>
                                      <th>Asset Name</th>
                                      <th>Phase</th>
                                      {/* <th>Threat</th>
                                      <th>Risk Acceptance Type</th>
                                      <th>Impact Rating</th>
                                      <th>Attack feasiblity Rating</th>
                                      <th>Risk Value</th>
                                      <th>CAL Level</th> */}
                                      <th>Security Controls</th>
                                      <th>Cybersecurity Goal</th>
                                      <th>Cybersecurity Requirement</th>
                                      <th>After Residual Risk</th>
                                      <th>Cybersecurity Claim</th>
                                      <th>Cybersecurity Requirement Linked to Component Hardware</th>
                                      <th>Cybersecurity Requirement Linked to Component Software</th>
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
                                                <td>{`${asset['label']}  (${asset['value']})`}</td>
                                                <td>{`${this.state.program['phase']}`}</td>
                                                {/* <td>{`${key}`}</td> */}
                                                {/* <td>{(threat['Risk-Acceptance']['Type']['value'])}</td> */}
                                                {/* <td>{(threat['Impact-Rating-Value'])}</td> */}
                                                {/* <td>{(threat['Attack-Feasibility-Rating'])}</td> */}
                                                {/* <td>{(threat['Attack-Risk-Value'] && threat['Attack-Risk-Value']['Value'])}</td> */}
                                                {/* <td>{(threat['Attack-CAL'] && threat['Attack-CAL']['Value'])}</td> */}
                                                <td>{threat['Risk-Acceptance']['Security-Controls'].map(control => {
                                                  return <span className='badge badge-primary mx-1'>{control.value}</span>
                                                }
                                                )}</td>
                                                <td>{threat['Cyber-Security-Goal']}</td>
                                                <td>{threat['Cyber-Security-Requirements']}</td>

                                                <td>{threat['Risk-Acceptance']['Reduced-Risk-Cyber-Security-Requirement']}</td>

                                                <td>{threat['Risk-Acceptance']['Reduced-Risk-Cyber-Security-Claim']}</td>


                                                <td>{threat['Risk-Acceptance']['Cyber-Security-Requirements-Linked-To-Component-Hardware'] ? threat['Risk-Acceptance']['Cyber-Security-Requirements-Linked-To-Component-Hardware']['label'] : ''}</td>
                                                <td>{threat['Risk-Acceptance']['Cyber-Security-Requirements-Linked-To-Component-Software'] ? threat['Risk-Acceptance']['Cyber-Security-Requirements-Linked-To-Component-Software']['label'] : ''}</td>
                                                {/* <td>{threat['Risk-Acceptance']['Reduced-Risk-Cyber-Security-Claim-Document'] && <a target="_blank" rel="noreferrer" href={apiBaseUrl(threat['Risk-Acceptance']['Reduced-Risk-Cyber-Security-Claim-Document'])} className="link-sm link-with-border" download="Reduced-Risk-Cyber-Security-Claim-Document">
                                                  View Claim Document
                                                </a>}</td> */}
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

                          </div>
                          <div className="card-footer">
                            <button type="button" className="btn btn-success btn-lg" onClick={(ev) => this.onConfirmation(ev)}>
                              <b>Next</b>
                            </button>
                          </div>
                        </div>
                      }


                    </div>
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

// Requirement Summary
export default withRouter(RequirementSummary);