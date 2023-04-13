// React
import React from 'react';
// React Router
import { withRouter } from 'react-router-dom';
// React Select
import Select from 'react-select'
// Layout
import DashboardLayout from "screens/Layouts/DashboardLayout";
// Loader
import PlaceholderLoader from 'components/ui/placeholder-loader/placeholder-loader';
// Helpers
import { modal, swalPopup } from "helpers/common";
// Program
import { httpGet, apify, apiBaseUrl } from "helpers/network";
// Charts & Graphs
import { Chart } from "react-google-charts";

// Statistical Analysis
class StatisticalAnalysis extends React.Component {
  //
  state = {
    loading: true,
    programUuid: undefined,
    program: undefined,
    objects: {},
    phases: [],
    programs: [],
    systemList: [],
    filters: {},
    preDefineFilters: {},
    currentWidgetType: null,
    currentProgram: null,
  };

  //
  async componentDidMount() {


    if (this.props['match']['params']['programUuid']) {
      // Fetch from server
      httpGet(apify(`app/program?programUuid=${this.props['match']['params']['programUuid']}`)).then(res => {
        if (res['success']) {
          let program = res['program']

          this.setState({
            filters: {
              ...this.state.filters,
              system: [program.system_id],
              phase: [program.phase],
              program: [program.uuid],
            },
            preDefineFilters: {
              ...this.state.preDefineFilters,
              system: [{ label: program.system.name, value: program.system_id }],
              phase: [{ label: program.phase, value: program.phase }],
              program: [{ label: program.name, value: program.uuid }],
              programReport: [{ label: program.name, value: program.uuid }],
            },
            currentProgram: program
          }, () => {
            this.analysisData()
          })
        }
      });
    }
    //
    httpGet(apify('app/phases')).then(data => {
      var phases = [];
      data['phases'].forEach(e => {
        phases.push({
          label: e['phase'],
          value: e['phase'],
        });
      });
      //
      this.setState({
        phases: phases
      })

    });

    //
    httpGet(apify('app/systems')).then(data => {
      var system = [];
      data['systems'].forEach(e => {
        system.push({
          label: e['name'],
          value: e['id'],
        });
      });
      //
      this.setState({
        systemList: system
      })

    });

    // Get list of statistical analysis
    // this.analysisData()

    this.setState({
      loading: false,
    }, () => {

    });
  }


  programs = () => {


    this.setState({
      currentProgram: null
    })

    let apiUrl = 'app/program-list'
    let params = this.state.filters

    params = {
      ...params,
      approved: true
    }
    if (params instanceof Object && params && params !== undefined && params !== {}) {

      let query = Object.keys(params)
        .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(params[k]))
        .join('&');
      apiUrl = apiUrl.concat(`?${query}`)
      // apiUrl = apiUrl
    }

    //
    httpGet(apify(apiUrl)).then(data => {
      var program = [];
      data['programs'].forEach(e => {
        program.push({
          label: e['name'],
          value: e['uuid'],
        });
      });

      //
      this.setState({
        programs: program,
      }, () => {

        this.analysisData()
      })

    });


  }

  analysisData = () => {


    this.setState({
      loadingData: true
    })

    let apiUrl = 'app/statistical-analysis'
    let params = this.state.filters
    if (params instanceof Object && params && params !== undefined && params !== {}) {

      let query = Object.keys(params)
        .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(params[k]))
        .join('&');
      apiUrl = apiUrl.concat(`?${query}`)
      // apiUrl = apiUrl
    }

    // Get list of statistical analysis
    httpGet(apify(apiUrl)).then(res => {
      if (res['success']) {

        this.setState({
          objects: res.analysis,
          loadingData: false
        }, () => {
        })
      }
    });
  }

  htmlToCSV = (rows, filename, type) => {
    var data = [];

    for (var i = 0; i < rows.length; i++) {

      data.push(rows[i].join(","));
    }

    this.downloadCSVFile(data.join("\n"), filename, type);
  }

  downloadCSVFile = (csv, filename, type) => {
    var csv_file, download_link;

    csv_file = new Blob([csv], { type: type });

    download_link = document.createElement("a");

    download_link.download = filename;

    download_link.href = window.URL.createObjectURL(csv_file);

    download_link.style.display = "none";

    document.body.appendChild(download_link);

    download_link.click();
  }

  downloadObjectAsJson = (exportObj, exportName) => {

    let system = []
    let programs = []
    let phase = []

    this.state.systemList.map(systemSingle => {
      if (this.state.filters.system && this.state.filters.system.includes(systemSingle.value)) {
        system.push(systemSingle.label)
      }

      return null
    })

    this.state.phases.map(phaseSingle => {
      if (this.state.filters.phase && this.state.filters.phase.includes(phaseSingle.value)) {
        phase.push(phaseSingle.label)
      }

      return null
    })

    this.state.programs.map(programSingle => {
      if (this.state.filters.program && this.state.filters.program.includes(programSingle.value)) {
        programs.push(programSingle.label)
      }

      return null
    })

    let data = {
      System: system,
      Phase: phase,
      Programme: programs,
      'Analysis Type': exportName.replaceAll('-', ' '),
      'Analysis Data': exportObj
    }
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data));
    var downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", exportName + ".json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }


  //
  onChangeImpactRating = (ev) => {
  }

  //
  onChangeSystem = (ev) => {

    let array = []

    ev.map(data => {
      array.push(data.value)
      return null
    })

    this.setState({
      filters: {
        ...this.state.filters,
        system: array
      },
      preDefineFilters: {
        ...this.state.preDefineFilters,
        system: ev
      }
    }, () => {


      if (array.length <= 0) {
        delete this.state.filters.system
      }
      this.programs()
    })

  }

  //
  onChangePhase = (ev) => {

    let array = []

    ev.map(data => {
      array.push(data.value)

      return null
    })

    this.setState({
      filters: {
        ...this.state.filters,
        phase: array
      },
      preDefineFilters: {
        ...this.state.preDefineFilters,
        phase: ev
      }
    }, () => {
      if (array.length <= 0) {
        delete this.state.filters.phase
      }
      this.programs()
    })
  }
  //
  onChangeProgram = (ev) => {

    let array = []

    ev.map(data => {
      array.push(data.value)

      return null
    })

    this.setState({
      filters: {
        ...this.state.filters,
        program: array
      },
      preDefineFilters: {
        ...this.state.preDefineFilters,
        program: ev,
        programReport: ev,
      }
    }, () => {
      if (array.length <= 0) {
        delete this.state.filters.program
      }
      this.programs()
    })
  }

  //
  openWidget = (ev, widgetType) => {
    let modalName = `#Modal-Widget-${widgetType}`;



    this.setState({
      currentWidgetType: widgetType
    }, () => {
      modal(modalName, {
        show: true,
      }, () => {
        var element = document.getElementById(`#Modal-Widget-${widgetType}`);
        element.style.width = (element.offsetWidth - 10) + 'px';
      });


    })
  }

  //
  conceptPhaseReport = (ev) => {
    // ev.preventDefault();
    // Delete on server

    let params = {
      'programUuid': ev.value,
    };

    httpGet(apify(`app/programs/concept-phase-report?programUuid=${ev.value}`), params).then(data => {
      // swalPopup("Program removed from system.", 'success');
      // history.push("/dashboard/programs");

      window.location.href = apiBaseUrl(data.path);

      // const link = document.createElement('a');
      // link.id = 'concept-phase-report'; //give it an ID!
      // link.href = apiBaseUrl(data.path); // Your URL

      // document.getElementById('concept-phase-report').click();
    }).catch(() => {
      swalPopup("Something went wrong.");
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
              </div>
            </div>

            {
              !this.state.loading &&
              <div>
                {

                  <div className="row">
                    <div className="col-12">

                      {
                        (true) &&
                        <div className="card">

                          <div className="card-header">

                            <div className="row my-2">
                              <div className="col-12 col-md-8">
                                <h3>Statistical Analysis</h3>
                                Use filter to do analysis.
                              </div>
                              {
                                this.state.currentProgram && this.state.currentProgram['name'] && <div className="col-12 col-md-4 mt-n2">
                                  <small className="text-uppercase text-muted">Program</small>
                                  <span className="input-readonly">{this.state.currentProgram['name']}</span>
                                </div>
                              }

                            </div>

                            <div className="row">
                              <div className="col-12">
                                <hr />
                              </div>
                            </div>
                            {<div className="row">
                              <div className="col-2">
                                <small className="text-uppercase text-muted">system</small>
                                <Select
                                  options={this.state.systemList}
                                  onChange={(ev) => this.onChangeSystem(ev)}
                                  value={this.state.preDefineFilters && this.state.preDefineFilters.system}
                                  defaultValue={this.state.preDefineFilters && this.state.preDefineFilters.system}
                                  isMulti={true}
                                  menuPortalTarget={document.body} styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                />
                              </div>

                              <div className="col-2">
                                <small className="text-uppercase text-muted">Phases</small>
                                <Select
                                  options={this.state.phases}
                                  onChange={(ev) => this.onChangePhase(ev)}
                                  isMulti={true}
                                  value={this.state.preDefineFilters && this.state.preDefineFilters.phase}
                                  menuPortalTarget={document.body} styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                />
                              </div>

                              <div className="col-2">
                                <small className="text-uppercase text-muted">Programs</small>
                                <Select
                                  options={this.state.programs}
                                  onChange={(ev) => this.onChangeProgram(ev)}
                                  isMulti={true}
                                  value={this.state.preDefineFilters && this.state.preDefineFilters.program}
                                  menuPortalTarget={document.body} styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                />
                              </div>



                              {/* <div className="col-2">
                                <small className="text-uppercase text-muted">Asset ID</small>
                                <Select
                                  options={this.state.assets}
                                  onChange={(ev) => this.onChangeAssetOption(ev)}
                                  menuPortalTarget={document.body} styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                />
                              </div>

                              <div className="col-2">
                                <small className="text-uppercase text-muted">Threat ID</small>
                                <Select
                                  options={this.state.assets}
                                  onChange={(ev) => this.onChangeAssetOption(ev)}
                                  menuPortalTarget={document.body} styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                />
                              </div>

                              <div className="col-2">
                                <small className="text-uppercase text-muted">Attack ID</small>
                                <Select
                                  options={this.state.assets}
                                  onChange={(ev) => this.onChangeAssetOption(ev)}
                                  menuPortalTarget={document.body} styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                />
                              </div> */}

                              {false && <div className="col-2">
                                <small className="text-uppercase text-muted">Impact Rating</small>
                                <Select
                                  options={this.state.impactRatings}
                                  onChange={(ev) => this.onChangeImpactRating(ev)}
                                  menuPortalTarget={document.body} styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                  isMulti
                                />
                              </div>}
                            </div>}

                          </div>

                          {this.state.filters && Object.values(this.state.filters).length > 0 && <div className="card-body">

                            <div className="row">
                              <div className="col-4">
                                <div className="text-center card-widget clickable-widget" onClick={(ev) => this.openWidget(ev, 'Number-Of-Assets-Per-System')}>
                                  <div className="fa-icon">
                                    <i className="fa fa-bullseye"></i>
                                  </div>
                                  Number of Assets per system
                                </div>
                              </div>



                              <div className="col-4">
                                <div className="text-center card-widget clickable-widget" onClick={(ev) => this.openWidget(ev, 'Number-Of-Threats-Per-System')}>
                                  <div className="fa-icon">
                                    <i className="fa fa-exclamation-circle"></i>
                                  </div>
                                  Number of Threats per system
                                </div>
                              </div>


                              <div className="col-4">
                                <div className="text-center card-widget clickable-widget" onClick={(ev) => this.openWidget(ev, 'Number-Of-Risks-Per-System')}>
                                  <div className="fa-icon">
                                    <i className="fa fa-bug"></i>
                                  </div>
                                  Number of Risks per system
                                </div>
                              </div>
                            </div>



                            <div className="row my-4">
                              <div className="col-4">
                                <div className="text-center card-widget clickable-widget" onClick={(ev) => this.openWidget(ev, 'Number-of-Threats-by-STRIDE')}>
                                  <div className="fa-icon">
                                    <i className="fa fa-bullhorn"></i>
                                  </div>
                                  Number Of Threats per STRIDE
                                </div>
                              </div>

                              <div className="col-4">
                                <div className="text-center card-widget clickable-widget" onClick={(ev) => this.openWidget(ev, 'Safety-only-Items-per-System')}>
                                  <div className="fa-icon">
                                    <i className="fa fa-user"></i>
                                  </div>
                                  Safety only Items per system
                                </div>
                              </div>

                              <div className="col-4">
                                <div className="text-center card-widget clickable-widget" onClick={(ev) => this.openWidget(ev, 'Security-only-Items-per-System')}>
                                  <div className="fa-icon">
                                    <i className="fa fa-shield"></i>
                                  </div>
                                  Security only Items per system
                                </div>
                              </div>
                            </div>

                            <div className="row my-4">
                              <div className="col-4">
                                <div className="text-center card-widget clickable-widget" onClick={(ev) => this.openWidget(ev, 'Security-Safety-Combined-per-System')}>
                                  <div className="fa-icon">
                                    <i className="fa fa-exclamation-circle"></i>
                                  </div>
                                  Security &amp; Safety Combined per system
                                </div>
                              </div>

                              <div className="col-4">
                                <div className="text-center card-widget clickable-widget" onClick={(ev) => this.openWidget(ev, 'CAL-Level-per-System')}>
                                  <div className="fa-icon">
                                    <i className="fa fa-adjust"></i>
                                  </div>
                                  CAL Level per system (1, 2, 3, 4)
                                </div>
                              </div>

                              <div className="col-4">
                                <div className="text-center card-widget clickable-widget" onClick={(ev) => this.openWidget(ev, 'concept-phase-report')}>
                                  <div className="fa-icon">
                                    <i className="fa fa-area-chart"></i>
                                  </div>
                                  Report
                                </div>
                              </div>
                            </div>

                          </div>
                          }
                          <div className="card-footer">
                            {this.state.filters && Object.values(this.state.filters).length > 0 && <i>Click on widget to explore more.</i>}
                            {(!this.state.filters || Object.values(this.state.filters).length <= 0) && <i>Select filter to start analysis.</i>}
                          </div>

                        </div>
                      }

                    </div>
                  </div>
                }
              </div>
            }

            {this.state.currentWidgetType !== 'concept-phase-report' && <div className="modal fade" id={`Modal-Widget-${this.state.currentWidgetType}`} tabIndex="-1" data-keyboard="false" data-backdrop="static">
              <div className="modal-dialog modal-full-width modal-dialog-centered modal-sm">

                <div className="modal-content">
                  <div className="modal-header">
                    <h4 className="modal-title text-primary">
                      {this.state.currentWidgetType && this.state.currentWidgetType.replaceAll('-', ' ')}
                    </h4>
                    <button type="button" className="close" data-dismiss="modal">
                      <span>&times;</span>
                    </button>
                  </div>
                  <div className="modal-body widget-modal-body model-width-custom">

                    <div className="row">
                      {(this.state.objects && this.state.objects[this.state.currentWidgetType] && this.state.objects[this.state.currentWidgetType].Table && this.state.objects[this.state.currentWidgetType].Table.Rows.length > 0) &&
                        <div className="col-12 text-center">
                          <ul className="nav nav-pills nav-justified mb-3" id={`${this.state.currentWidgetType}-tab`} role="tablist">
                            <li className="nav-item">
                              <a className="nav-link  active" id={`${this.state.currentWidgetType}-home-tab`} data-toggle="pill" href={`#${this.state.currentWidgetType}-home`} role="tab" aria-controls={`${this.state.currentWidgetType}-home`} aria-selected="true">Tabular</a>
                            </li>
                            <li className="nav-item">
                              <a className="nav-link " id={`${this.state.currentWidgetType}-profile-tab`} data-toggle="pill" href={`#${this.state.currentWidgetType}-profile`} role="tab" aria-controls={`${this.state.currentWidgetType}-profile`} aria-selected="false">Graphical</a>
                            </li>
                          </ul>
                          <div className="tab-content" id={`${this.state.currentWidgetType}-tabContent`}>
                            <div className="tab-pane fade show active" id={`${this.state.currentWidgetType}-home`} role="tabpanel" aria-labelledby={`${this.state.currentWidgetType}-home-tab`}>
                              <table className="table table-bordered w-100">
                                <thead>
                                  <tr>
                                    {
                                      this.state.objects && this.state.objects[this.state.currentWidgetType] && this.state.objects[this.state.currentWidgetType].Table && this.state.objects[this.state.currentWidgetType].Table.Cols.map(col => {
                                        return <th>{col}</th>
                                      })
                                    }
                                  </tr>
                                </thead>
                                <tbody>
                                  {
                                    this.state.objects && this.state.objects[this.state.currentWidgetType] && this.state.objects[this.state.currentWidgetType].Table && this.state.objects[this.state.currentWidgetType].Table.Rows.map(row => {
                                      return <tr>
                                        {
                                          this.state.objects && this.state.objects[this.state.currentWidgetType] && this.state.objects[this.state.currentWidgetType].Table && this.state.objects[this.state.currentWidgetType].Table.Cols.map(col => {
                                            return <td>{row[col]}</td>
                                          })
                                        }
                                      </tr>
                                    })
                                  }
                                </tbody>
                              </table>

                            </div>
                            <div className="tab-pane fade" id={`${this.state.currentWidgetType}-profile`} role="tabpanel" aria-labelledby={`${this.state.currentWidgetType}-profile-tab`}>
                              {this.state.objects && this.state.objects[this.state.currentWidgetType] && this.state.objects[this.state.currentWidgetType].Graph &&


                                <Chart
                                  chartType={this.state.objects[this.state.currentWidgetType].Graph.Type}
                                  data={this.state.objects[this.state.currentWidgetType].Graph.Data}
                                  options={''}
                                  width={"100%"}
                                // height={"400px"}
                                />}
                            </div>
                          </div>
                        </div>
                      }
                      {!this.state.loadingData && (!this.state.objects || !this.state.objects[this.state.currentWidgetType] || !this.state.objects[this.state.currentWidgetType].Table || this.state.objects[this.state.currentWidgetType].Table.Rows.length <= 0) &&
                        <><div className="col-12 text-center mt-2"><h5>No Data Available</h5></div></>}
                      {(this.state.loadingData) &&
                        <><div className="col-12 text-center mt-2"><h5>Loading..</h5></div></>}
                    </div>

                    <div className="row">
                      <div className="col-12">
                        <hr />
                      </div>
                    </div>


                  </div>
                  {true && <div className="modal-footer">

                    {this.state.objects && this.state.objects[this.state.currentWidgetType] && this.state.objects[this.state.currentWidgetType].Graph && <div className="dropdown">
                      <button className="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        Download  <i className="fa fa-download ml-2"></i>
                      </button>
                      <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                        <a
                          href="#!"
                          className="dropdown-item"
                          onClick={() => this.htmlToCSV(this.state.objects[this.state.currentWidgetType].Graph.Data, this.state.currentWidgetType, 'text/csv')}
                        >
                          Download As CSV
                        </a>

                        <a
                          href="#!"
                          className="dropdown-item"
                          onClick={() => this.downloadObjectAsJson(this.state.objects[this.state.currentWidgetType].Table.Rows, this.state.currentWidgetType)}
                        >
                          Download As JSON
                        </a>
                      </div>
                    </div>}
                  </div>}
                </div>
              </div>
            </div>}

            <div className="modal fade" id={`Modal-Widget-concept-phase-report`} tabIndex="-1" data-keyboard="false" data-backdrop="static">
              <div className="modal-dialog modal-full-width modal-dialog-centered modal-sm">

                <div className="modal-content">
                  <div className="modal-header">
                    <h4 className="modal-title text-primary">
                      {this.state.currentWidgetType && this.state.currentWidgetType.replaceAll('-', ' ')}
                    </h4>
                    <button type="button" className="close" data-dismiss="modal">
                      <span>&times;</span>
                    </button>
                  </div>
                  <div className="modal-body widget-modal-body model-width-custom">

                    <div className="row">
                      <div className="col-12 text-center">
                        <div className="my-3">
                          <h5 className="text-uppercase text-muted">Select Proram For download Report</h5>
                          <Select
                            options={this.state.programs}
                            onChange={(ev) => this.conceptPhaseReport(ev)}
                            // isMulti={true}
                            value={this.state.preDefineFilters && this.state.preDefineFilters.programReport}
                            menuPortalTarget={document.body} styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                          />
                        </div>

                      </div>
                    </div>

                    <div className="row">
                      <div className="col-12">
                        <hr />
                      </div>
                    </div>


                  </div>
                </div>
              </div>
            </div>

          </div>
        </DashboardLayout>
      </div>
    );
  }
}

// Statistical Analysis
export default withRouter(StatisticalAnalysis);