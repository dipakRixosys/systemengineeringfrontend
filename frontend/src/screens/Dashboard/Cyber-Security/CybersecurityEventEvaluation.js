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
import { httpGet, apify, httpPost } from 'helpers/network';
// Helpers
import { setTitle, programLifecycleRoute, swalConfirmationPopup } from "helpers/common";

// Cyber Security Event Evaluation
class CybersecurityEventEvaluation extends React.Component {

  state = {
    loading: true,
    yesNoSelects: [
      { label: 'Yes', value: "Yes" },
      { label: 'No', value: "No" },
    ],
    listEvaluation: [],
    allVulnerabilities: [],
  };

  // 
  validate = (requiredParameters, vulnerability) => {

    let index = 0
    let validated = false

    requiredParameters.map(parameter => {
      var referenceNode = document.getElementsByName(parameter)[0]

      if ((!vulnerability || !vulnerability['Evaluation'] || !vulnerability['Evaluation'][parameter] || vulnerability['Evaluation'][parameter] === '')) {
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



  prepareThreatOptions = (threatObject = []) => {
    //
    let threatOptions = [];

    if (threatObject['Identification'] && threatObject['Identification']['Threats']) {
      //
      threatObject['Identification']['Threats'].forEach(threat => {
        if (threat['Threat-Identified']) {
          threatOptions.push({
            label: `${threat['Parent-Asset']} (${threat['Parent-Cyber-Security']})`,
            value: threat['RefId'],
            threat: threat,
          });
        }
      });
    }

    //
    return threatOptions;
  }



  // On submit
  onSubmit = (ev) => {

    let validated = false

    let vulnerability = this.state.vulnerability


    let requiredParameters = ['Analysing-Security-Event', 'Identified-Weakness', 'Threat-Scenarios']
    validated = this.validate(requiredParameters, vulnerability)

    var vm = this;

    if (validated) {

      vulnerability['Event-Evaluation'] = true
      httpPost(apify('app/program/vulnerabilities/add'), {
        programUuid: vm.state.programUuid,
        vulnerability: vm.state.vulnerability,
      }).then(res => {
        if (res['success']) {
          window.location.reload(false);
        }
      });
    }
  }

  // Asset options
  prepareVulnerabilityOptions = (vulnerability) => {
    var vulnerabilityArray = [];
    var listEvaluation = [];
    vulnerability['Items'].forEach(item => {
      if ((item['Is-Internal-Type'] === true || item['Is-External-Type'] === true) && item['Event-Evaluation'] !== true) {

        //
        vulnerabilityArray.push({
          value: item['Uuid'],
          label: item['Name'],
          property: item,
        });

      }
      if (item['Event-Evaluation'] === true) {
        listEvaluation.push(item)
      }
    });

    this.setState({ listEvaluation: listEvaluation })
    return vulnerabilityArray;
  }

  // Change vulnerability option
  onChangeVulnerabilityOption = (ev) => {

    this.setState({
      vulnerability: undefined,
    }, () => {
      this.setState({
        vulnerability: ev['property'],
        vulnerabilitieSelected: ev,
      });
    })

  }


  //
  reConfigure(vulnerability) {
    //
    var vm = this;
    //
    swalConfirmationPopup({
      title: null,
      text: "This action will reset the vulnerability data.",
      confirmButtonText: "Re-configure",
    }, () => {

      vm.setState({
        loading: true
      }, () => {

        this.setState({
          vulnerability: undefined,
        }, () => {

          let ev = {}
          this.state.allVulnerabilities['Items'].map(vul => {
            if (vul['Uuid'] === vulnerability['Uuid']) {
              vul['Event-Evaluation'] = false
            }
            return null
          })

          this.setState({
            vulnerabilities: this.prepareVulnerabilityOptions(this.state.allVulnerabilities)
          }, () => {


            this.state.vulnerabilities.map(vul => {
              if (vul['value'] === vulnerability['Uuid']) {
                ev = vul
              }
              return null
            })

            this.setState({
              loading: false,
              vulnerability: ev['property'],
              vulnerabilitieSelected: ev,
              remediationAvailibility: ev['property']['Evaluation']['Remediation-Availibility'] === true ? { label: 'Yes', value: 'Yes' } : { label: 'No', value: 'No' }
            });
          })

        })
      });

    });
  }


  // On submit
  onDataChange = (event) => {
    this.setState({
      vulnerability: {
        ...this.state.vulnerability,
        'Evaluation': {
          ...this.state.vulnerability['Evaluation'],
          [`${event.target.name}`]: event.target.value,
        }
      },
    })
  }
  //
  saveAndContinue = (ev) => {
    let phaseRoute = `/dashboard/cybersecurity/vulnerability-analysis/${this.state.programUuid}`;
    this.props.history.push(phaseRoute);
  }


  //
  async componentDidMount() {
    //
    setTitle("Cyber Security Event Evaluation");


    //
    let { programUuid } = this.props['match']['params'];

    //
    this.setState({
      programUuid: programUuid,
      vulnerabilities: []
    });


    var vm = this;

    httpGet(apify(`app/program/threats?programUuid=${programUuid}`)).then(res => {
      let vulnerabilities = res['program']['vulnerabilities'];
      vulnerabilities = vm.prepareVulnerabilityOptions(vulnerabilities);

      let threats = res['program']['threats'];
      let threatOptions = vm.prepareThreatOptions(threats);
      vm.setState({
        loading: false,
        program: res['program'],
        vulnerabilities: vulnerabilities,
        threatOptions: threatOptions,
        allVulnerabilities: res['program']['vulnerabilities'],
        canGotoNextPhase: false,
      }, () => {
        const jQuery = window.jQuery;
        jQuery(document).ready(function () {
          jQuery('[data-toggle="popover"]').popover({
            html: true,
            container: 'body',
            placement: 'left',
            trigger: 'click'
          });
        });

        jQuery('body').on('click', '.close-popup', function (ev) {
          jQuery('[data-toggle="popover"]').popover('hide');
        });

      });
    }).catch(err => {
      vm.setState({
        loading: false,
        program: null,
      }, () => {
        console.error(err);
      });
    });
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


  // On submit
  vulDeatils = (vulnerability) => {


    let html = '<div class="row">'
    html += '<div class="col-4 label py-2">Name :</div>'
    html += '<div class="col-8 py-2">' + vulnerability['Name'] + '</div>'
    html += '<div class="col-4 label py-2">Description :</div>'
    html += '<div class="col-8 py-2">' + vulnerability['Description'] + '</div>'
    html += '<div class="col-4 label py-2">Is Internal Type :</div>'
    html += '<div class="col-8 py-2">' + vulnerability['Is-Internal-Type'] + '</div>'

    if (vulnerability['Is-Internal-Type']) {
      html += '<div class="col-4 label py-2">Internal Sources :</div>'
      html += '<div class="col-8 py-2">' + (vulnerability['Internal-Source'] && vulnerability['Internal-Source'].map(sourse => {
        return '<span class="badge badge-primary">' + sourse['value'] + '</span>'
      })) + '</div>'
      html += '<div class="col-4 label py-2">Internal CVE Number :</div>'
      html += '<div class="col-8 py-2">' + vulnerability['Internal-CVE-Number'] + '</div>'
      html += '<div class="col-4 label py-2">Internal Vulnerability ID :</div>'
      html += '<div class="col-8 py-2">' + vulnerability['Internal-Vulnerability-ID'] + '</div>'
    }
    html += '<div class="col-4 label py-2">Is External Type :</div>'
    html += '<div class="col-8 py-2">' + vulnerability['Is-External-Type'] + '</div>'

    if (vulnerability['Is-External-Type']) {
      html += '<div class="col-4 label py-2">External Sources :</div>'
      html += '<div class="col-8 py-2">' + (vulnerability['External-Source'] && vulnerability['External-Source'].map(sourse => {
        return '<span class="badge badge-primary p-1">' + sourse['value'] + '</span>'
      })) + '</div>'
      html += '<div class="col-4 label py-2">External CVE Number :</div>'
      html += '<div class="col-8 py-2">' + vulnerability['External-CVE-Number'] + '</div>'
      html += '<div class="col-4 label py-2">External Vulnerability ID :</div>'
      html += '<div class="col-8 py-2">' + vulnerability['External-Vulnerability-ID'] + '</div>'
    }
    html += '<div class="col-4 label py-2">Triage ID :</div>'
    html += '<div class="col-8 py-2">' + vulnerability['Triage-ID'] + '</div>'
    html += '<div class="col-4 label py-2">Triage Description :</div>'
    html += '<div class="col-8 py-2">' + vulnerability['Triage-Description'] + '</div>'
    html += '<div class="col-4 label py-2">Triage Triggers :</div>'
    html += '<div class="col-8 py-2">' + (vulnerability['Triage-Triggers'] && vulnerability['Triage-Triggers'].map(triger => {
      return '<span class="badge badge-primary p-1">' + triger['value'] + '</span>'
    })) + '</div>'
    if (vulnerability['Evaluation']) {
      // html += '<div class="col-4 label py-2">Analysing-Security-Event :</div>'
      // html += '<div class="col-8 py-2">' + (vulnerability['Evaluation']['Threat-Scenarios'] && vulnerability['Evaluation']['Threat-Scenarios'].map(sourse => {
      //   return '<span class="badge badge-primary p-1">' + sourse['value'] + '</span>'
      // })) + '</div>'
      html += '<div class="col-4 label py-2">Analysing Security Event :</div>'
      html += '<div class="col-8 py-2">' + vulnerability['Evaluation']['Analysing-Security-Event'] + '</div>'
      html += '<div class="col-4 label py-2">Remediation Availibility :</div>'
      html += '<div class="col-8 py-2">' + vulnerability['Evaluation']['Remediation-Availibility'] + '</div>'
      html += '<div class="col-4 label py-2">Identified Weakness :</div>'
      html += '<div class="col-8 py-2">' + vulnerability['Evaluation']['Identified-Weakness'] + '</div>'
    }


    html += '</div>'
    return html


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

                      <div className="card">

                        <div className="card-header">

                          <div className="row">
                            <div className="col-8">
                              <h3>Cyber Security Event Evaluation</h3>
                              <small>Program</small> <br />
                              <Link to={programLifecycleRoute('VIEW', this.state.program['uuid'])}>
                                {this.state.program['name']}
                              </Link>
                            </div>
                            <div className="col-4 text-right mt-3">
                              <h4 className="badge badge-primary">
                                {this.state.program['status'] === 'REJECTED' ? 'Rejected and Re-Opened ' : this.state.program['status'].replace('-', ' ')}
                              </h4>
                            </div>
                          </div>
                        </div>
                        <div className="card-body">
                          <div className="form-group row">
                            <div className="col-4 text-muted">
                              Vulnerabilities
                            </div>
                            <div className="col-8">
                              <Select
                                options={this.state.vulnerabilities}
                                value={this.state.vulnerabilitieSelected}
                                onChange={(ev) => this.onChangeVulnerabilityOption(ev)}
                              />
                            </div>

                          </div>

                          {(this.state.vulnerability !== undefined) && <div className="row">
                            <div className="col-md-12">
                              <div className="form-group row">
                                <div className="col-4 text-muted">
                                  Cyber Security Event
                                </div>
                                <div className="col-8">
                                  <input type="text" className="form-control md-form-control mt-2" disabled value={this.state.vulnerability['CyberSecurity-Event']} placeholder="Cyber Security Event" />
                                </div>
                              </div>
                            </div>

                            <div className="col-md-12">
                              <div className="form-group row">
                                <div className="col-4 text-muted">
                                  Cyber Security Event ID
                                </div>
                                <div className="col-8">
                                  <input type="text" className="form-control md-form-control mt-2" disabled defaultValue={this.state.vulnerability['CyberSecurity-Event-ID']} placeholder="Cyber Security Event ID" />
                                </div>
                              </div>
                            </div>
                            {this.state.vulnerability['Is-Internal-Type'] && <div className="col-md-12">
                              <div className="form-group row">
                                <div className="col-4 text-muted">
                                  Internal Vulnerability ID
                                </div>
                                <div className="col-8">
                                  <input type="text" className="form-control md-form-control mt-2" disabled defaultValue={this.state.vulnerability['Internal-Vulnerability-ID']} placeholder="Internal Vulnerability ID" />
                                </div>
                              </div>
                            </div>}
                            {this.state.vulnerability['Is-Internal-Type'] && <div className="col-md-12">
                              <div className="form-group row">
                                <div className="col-4 text-muted">
                                  Internal Vulnerability Name
                                </div>
                                <div className="col-8">
                                  <input type="text" className="form-control md-form-control mt-2" disabled defaultValue={this.state.vulnerability['Internal-Vulnerability-Name']} placeholder="Internal Vulnerability Name" />
                                </div>
                              </div>
                            </div>}
                            {this.state.vulnerability['Is-Internal-Type'] && <div className="col-md-12">
                              <div className="form-group row">
                                <div className="col-4 text-muted">
                                  Internal Vulnerability Description
                                </div>
                                <div className="col-8">
                                  <input type="text" className="form-control md-form-control mt-2" disabled defaultValue={this.state.vulnerability['Internal-Vulnerability-Description']} placeholder="Internal Vulnerability Description" />
                                </div>
                              </div>
                            </div>}
                            {this.state.vulnerability['Is-External-Type'] && <div className="col-md-12">
                              <div className="form-group row">
                                <div className="col-4 text-muted">
                                  External Vulnerability ID
                                </div>
                                <div className="col-8">
                                  <input type="text" className="form-control md-form-control mt-2" disabled defaultValue={this.state.vulnerability['External-Vulnerability-ID']} placeholder="External Vulnerability ID" />
                                </div>
                              </div>
                            </div>}
                            {this.state.vulnerability['Is-External-Type'] && <div className="col-md-12">
                              <div className="form-group row">
                                <div className="col-4 text-muted">
                                  External Vulnerability Name
                                </div>
                                <div className="col-8">
                                  <input type="text" className="form-control md-form-control mt-2" disabled defaultValue={this.state.vulnerability['External-Vulnerability-Name']} placeholder="External Vulnerability Name" />
                                </div>
                              </div>
                            </div>}
                            {this.state.vulnerability['Is-External-Type'] && <div className="col-md-12">
                              <div className="form-group row">
                                <div className="col-4 text-muted">
                                  External Vulnerability Description
                                </div>
                                <div className="col-8">
                                  <input type="text" className="form-control md-form-control mt-2" disabled defaultValue={this.state.vulnerability['External-Vulnerability-Description']} placeholder="External Vulnerability Description" />
                                </div>
                              </div>
                            </div>}
                            <div className="col-md-12">
                              <div className="form-group row">
                                <div className="col-4 text-muted">
                                  CDS Configuration ID
                                </div>
                                <div className="col-4">
                                  <input type="text" className="form-control md-form-control mt-2" disabled placeholder="CDS Configuration Name " />
                                </div>
                                <div className="col-4">
                                  <input type="text" className="form-control md-form-control mt-2" disabled placeholder="CDS Configuration ID " />
                                </div>
                              </div>
                            </div>
                            <div className="col-md-12">
                              <div className="form-group row">
                                <div className="col-4 text-muted">
                                  CDS Calibration ID
                                </div>
                                <div className="col-4">
                                  <input type="text" className="form-control md-form-control mt-2" disabled placeholder="CDS Calibration Name " />
                                </div>
                                <div className="col-4">
                                  <input type="text" className="form-control md-form-control mt-2" disabled placeholder="CDS Calibration ID " />
                                </div>
                              </div>
                            </div>
                            <div className="col-md-12">
                              <div className="form-group row">
                                <div className="col-4 text-muted">
                                  IV Configuration ID
                                </div>
                                <div className="col-4">
                                  <input type="text" className="form-control md-form-control mt-2" disabled placeholder="IV Configuration Name" />
                                </div>
                                <div className="col-4">
                                  <input type="text" className="form-control md-form-control mt-2" disabled placeholder="IV Configuration ID" />
                                </div>
                              </div>
                            </div>

                            {/*  */}

                            <div className="col-md-12">
                              <div className="form-group row">
                                <div className="col-4 text-muted">
                                  Analysing Security Event
                                </div>
                                <div className="col-8">
                                  <input type="text" className="form-control md-form-control mt-2" defaultValue={this.state.vulnerability['Evaluation'] && this.state.vulnerability['Evaluation']['Analysing-Security-Event']} name="Analysing-Security-Event" placeholder="Analysing Security Event" onChange={(ev) => this.onDataChange(ev)} />

                                </div>
                              </div>
                            </div>
                            <div className="col-md-12">
                              <div className="form-group row">
                                <div className="col-4 text-muted">
                                  Triage Description
                                </div>
                                <div className="col-8">
                                  <input type="text" className="form-control md-form-control mt-2" defaultValue={this.state.vulnerability['Triage-Description']} placeholder="Triage Description" />
                                </div>
                              </div>
                            </div>
                            <div className="col-md-12">
                              <div className="form-group row">
                                <div className="col-4 text-muted">
                                  Triage ID
                                </div>
                                <div className="col-8">
                                  <input type="text" className="form-control md-form-control mt-2" defaultValue={this.state.vulnerability['Triage-ID']} placeholder="Triage ID" />
                                </div>
                              </div>
                            </div>

                            <div className="col-md-12">
                              <div className="form-group row">
                                <div className="col-4 text-muted">
                                  Cyber Security Design Specification Name
                                </div>
                                <div className="col-8">
                                  <input type="text" className="form-control md-form-control mt-2" disabled placeholder="Cyber Security Design Specification Name" />
                                </div>
                              </div>
                            </div>
                            <div className="col-md-12">
                              <div className="form-group row">
                                <div className="col-4 text-muted">
                                  Identified Weakness
                                </div>
                                <div className="col-8">
                                  <input type="text" className="form-control md-form-control mt-2" defaultValue={this.state.vulnerability['Evaluation'] && this.state.vulnerability['Evaluation']['Identified-Weakness']} name="Identified-Weakness" placeholder="Identified Weakness" onChange={(ev) => this.onDataChange(ev)} />

                                </div>
                              </div>
                            </div>
                            <div className="col-md-12">
                              <div className="form-group row">
                                <div className="col-4 text-muted">
                                  Remediation Availibility
                                </div>
                                <div className="col-8">
                                  <Select options={this.state.yesNoSelects}
                                    value={this.state.remediationAvailibility}
                                    onChange={(ev) => {
                                      this.setState({
                                        vulnerability: {
                                          ...this.state.vulnerability,
                                          'Evaluation': {
                                            ...this.state.vulnerability['Evaluation'],
                                            "Remediation-Availibility": ev.value === 'Yes' ? true : false,
                                          }
                                        },
                                        remediationAvailibility: ev
                                      })
                                    }} />

                                </div>
                              </div>
                            </div>
                            <div className="col-md-12">
                              <div className="form-group row">
                                <div className="col-4 text-muted">
                                  Threat Scenarios
                                </div>
                                <div className="col-8">
                                  <Creatable
                                    options={this.state.threatOptions}
                                    onChange={(ev) => {
                                      this.setState({
                                        vulnerability: {
                                          ...this.state.vulnerability,
                                          'Evaluation': {
                                            ...this.state.vulnerability['Evaluation'],
                                            "Threat-Scenarios": ev,
                                          }
                                        },
                                        ThreatScenarios: ev
                                      })
                                    }}
                                    isMulti={true}
                                    name="Threat-Scenarios"
                                    value={this.state.vulnerability['Evaluation'] ? this.state.vulnerability['Evaluation']['Threat-Scenarios'] : []}
                                  />

                                </div>
                              </div>
                            </div>

                          </div>}

                        </div>
                        <div className="card-footer">
                          <button type="button" className="btn btn-success btn-lg" onClick={(ev) => this.onSubmit(ev)}>
                            Submit
                          </button>
                        </div>
                      </div>
                    }


                  </div>

                  {/* Right sidebar */}
                  <div className="col-12 col-md-12 mt-5">
                    <div className="card">
                      <div className="card-header">
                        <h3>Cyber Security Event Evaluations</h3>
                      </div>
                      <div className="card-body p-0">
                        <table className="table table-bordered">
                          <thead>
                            <tr>
                              <th>Vulnerability Name</th>
                              <th>Analysing Security Event</th>
                              <th>Identified Weakness</th>
                              <th>Remediation Availibility</th>
                              <th>Threat Scenarios</th>
                              <th></th>
                            </tr>
                          </thead>
                          <tbody>
                            {/* No Threats */}
                            {
                              this.state.listEvaluation.length === 0
                              &&
                              <tr className="text-center">
                                <td colSpan="6">
                                  No Vulnerabilities added yet.
                                </td>
                              </tr>
                            }

                            {/* Threats */}
                            {
                              this.state.listEvaluation.map(vulnerability => {
                                return (
                                  <tr key={vulnerability['RefId']}>
                                    <td><span data-toggle="popover" title={this.popupTitleHtml(vulnerability['Name'])} data-html="true" data-content={this.vulDeatils(vulnerability)}>{vulnerability['Name']}</span></td>

                                    <td><span className='text-truncate-line1' data-toggle="popover" title={'<h3>Analysing Security Event</h3>'} data-html="true" data-content={vulnerability['Evaluation']['Analysing-Security-Event']}>{vulnerability['Evaluation']['Analysing-Security-Event']}</span></td>
                                    <td><span className='text-truncate-line1' data-toggle="popover" title={'<h3>Identified Weakness</h3>'} data-html="true" data-content={vulnerability['Evaluation']['Identified-Weakness']}>{vulnerability['Evaluation']['Identified-Weakness']}</span></td>
                                    <td><span className='text-truncate-line1'>{vulnerability['Evaluation']['Remediation-Availibility'] === true ? <span class="badge badge-success">True</span> : <span class="badge badge-danger"> False</span>}</span></td>

                                    <td>

                                      <ul>
                                        {vulnerability['Evaluation']['Threat-Scenarios'].map(threst => {
                                          return <li class="">{threst.label}</li>
                                        })}
                                      </ul>

                                    </td>
                                    <td className="text-right">
                                      <a href="#!" className="identified-vulnerability-configure-button" data-ref-id={vulnerability['Uuid']} onClick={() => this.reConfigure(vulnerability)}>
                                        <i className="fa fa-gear mr-1"></i>
                                        Re-Configure
                                      </a>
                                    </td>
                                  </tr>
                                )
                              })
                            }
                          </tbody>
                        </table>

                        <div className="m-2">

                        </div>
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
                        <button className="btn btn-success" onClick={() => this.saveAndContinue()}>
                          Save and Continue
                          <i className="fa fa-chevron-right ml-2"></i>
                        </button>
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

export default CybersecurityEventEvaluation


