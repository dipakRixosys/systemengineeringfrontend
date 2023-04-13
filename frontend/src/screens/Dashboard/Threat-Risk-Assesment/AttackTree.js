// React
import React from 'react';
// React Router
import { withRouter, Link } from 'react-router-dom';
// React Select
import Select from 'react-select'
// Layout
import DashboardLayout from "screens/Layouts/DashboardLayout";
// Loader
import PlaceholderLoader from 'components/ui/placeholder-loader/placeholder-loader';
// React-Diagrams (Engine)
import createEngine, { DiagramModel } from '@projectstorm/react-diagrams';
// React-Diagrams (Canvas)
import { CanvasWidget } from '@projectstorm/react-canvas-core';
// Custom Factory (React-Diagrams)
import { HtmlLabelFactory } from "custom/HtmlLabel/HtmlLabelFactory";
// Helpers
import { setTitle, modal, nullIfEmpty, programLifecycleRoute } from "helpers/common";
// Network Helpers
import { apify, httpGet } from 'helpers/network';
// jQuery
const jQuery = window.jQuery;

//
window.AttackInfo = {};

// Attack Tree
class AttackTree extends React.Component {
  //
  state = {
    loading: true,
    threats: [],

    engineReady: false,
    engine: undefined,
    model: undefined,

    programObject: {},

    attackInfo: undefined,
  };

  //
  renderExistingDefinition() {
    return new Promise((resolve, reject) => {
      let itemDefinition = this.state.programObject['item_definition'];

      if (itemDefinition && itemDefinition['MODEL_JSON']) {

        if (itemDefinition['KEYSTORE']) {
          window.ItemDefinition['KEYSTORE'] = itemDefinition['KEYSTORE'];
          window.AutoKeyStore = itemDefinition['KEYSTORE'];
        }

        window.ItemDefinition = itemDefinition;

        let modelJson = itemDefinition['MODEL_JSON'];
        let engine = this.state.engine;
        let model = this.state.model;

        model.deserializeModel(modelJson, engine);

        engine.setModel(model);

        this.setState({
          engine: engine,
          model: model,
        }, () => {
          resolve(true);
        });
      }

      else {
        resolve(true);
      }
    });
  }

  //
  async registerEngine() {
    var vm = this;

    var engine = createEngine();

    var model = new DiagramModel();

    engine.getLabelFactories().registerFactory(new HtmlLabelFactory());

    model.setLocked(true);

    engine.setModel(model);

    vm.setState({
      engine: engine,
      model: model,
      engineReady: true,
    }, () => {


    });

  }

  //
  async preUiTasks() {
    try {
      await this.registerEngine();
      let engineReady = await this.renderExistingDefinition();

      this.setState({
        loading: false,
        engineReady: engineReady,
      }, async () => {

      });

    } catch (error) {
    } finally {

      jQuery('.configure-link').addClass('d-none');

    }
  }

  //
  prepareThreatTypes = (threatObject = []) => {
    //
    let threatOptions = [];

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

    //
    return threatOptions;
  }

  //
  drawAttackDiagram = async (params) => {
    //
    let sourceNodeId = params['sourceNodeId'] ?? undefined;
    let sourceLinkId = params['sourceLinkId'] ?? undefined;

    //
    if (sourceNodeId) {
      //
      jQuery('.node').each((id, nodeSvg) => {
        let nodeId = jQuery(nodeSvg).attr('data-nodeid');
        if (nodeId === sourceNodeId) {
          jQuery(nodeSvg).addClass('node-has-attack');
        }
      });
    }

    //
    if (sourceLinkId) {
      //
      jQuery('g').each((id, graphicSvg) => {
        let linkId = jQuery(graphicSvg).attr('data-linkid');
        if (linkId === sourceLinkId) {
          jQuery(graphicSvg).addClass('link-has-attack');
        }
      });
    }

  }

  //
  clearAllAttackPaths = () => {
    jQuery('.node-has-attack').removeClass('node-has-attack');
    jQuery('.link-has-attack').removeClass('link-has-attack');
    return true;
  }

  //
  onChangeThreat = (ev) => {
    //
    var vm = this;

    //
    let sourceNodes = ev['threat']['Attack-Diagram']['Source-Nodes'];
    let sourceLinks = ev['threat']['Attack-Diagram']['Source-Links'];

    //
    window.AttackInfo = ev['threat'];

    //
    vm.clearAllAttackPaths();

    //
    sourceNodes.forEach(sourceNodeId => {
      vm.drawAttackDiagram({
        sourceNodeId: sourceNodeId
      });
    });

    //
    sourceLinks.forEach(sourceLinkId => {
      vm.drawAttackDiagram({
        sourceLinkId: sourceLinkId
      });
    });

    //
    this.setState({
      attackInfo: window.AttackInfo,
    });
  }

  //
  showAttackInfo = () => {
    modal('#Modal-Show-Attack-Info', {
      show: true,
    });
  }

  //
  async componentDidMount() {
    //
    var vm = this;

    //
    setTitle("Attack Tree");

    //
    let { programUuid } = this.props['match']['params'];

    //
    this.setState({
      programUuid: programUuid
    });

    httpGet(apify(`app/program/?programUuid=${programUuid}`)).then(res => {
      //
      if (res['success']) {
        //
        this.setState({
          programObject: res['program'],
          threats: vm.prepareThreatTypes(res['program']['threats']),
        }, () => {
          this.preUiTasks();
        });
      }
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
                  <div>

                    <div className="card">

                      <div className="card-header">
                        <div className="row py-3">
                          <div className="col-8">
                            <h3 className="card-title mb-2">Attack Tree</h3>
                            <small>Program Name</small> <br />
                            <Link to={programLifecycleRoute('VIEW', this.state.programObject['uuid'])}>
                              {this.state.programObject['name']}
                            </Link>
                          </div>
                          <div className="col-4">
                            <label>Select Threat</label>
                            <Select
                              options={this.state.threats}
                              onChange={(ev) => this.onChangeThreat(ev)}
                              menuPortalTarget={document.body} styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="card-body item-definition-drawing">
                        {
                          this.state.engineReady &&
                          <CanvasWidget engine={this.state.engine} className="canvas-widget" />
                        }
                      </div>

                      <div className="card-footer">
                        <div className="row">
                          <div className="col-6">
                            {
                              this.state.attackInfo &&
                              <div>
                                <button type="button" className="btn btn-success btn-lg" onClick={this.showAttackInfo}>
                                  View Attack Info
                                </button>
                              </div>
                            }
                          </div>
                          <div className="col-6 text-right">
                            <button className="btn btn-primary" >
                              <Link to={programLifecycleRoute('VIEW', this.state.programObject['uuid'])}>
                               <span className='text-white'> <i className="fa fa-arrow-left"></i> Back to Program</span>
                              </Link>

                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                }
              </div>
            }

            {
              this.state.attackInfo &&
              <div className="modal fade" id="Modal-Show-Attack-Info" tabIndex="-1" data-keyboard="false" data-backdrop="static">
                <div className="modal-dialog modal-full-width">

                  <div className="modal-content">
                    <div className="modal-header">
                      <h4 className="modal-title text-primary">
                        Attack Info
                      </h4>
                      <button type="button" className="close" data-dismiss="modal">
                        <span>&times;</span>
                      </button>
                    </div>
                    <div className="modal-body widget-modal-body">
                      <div className="row">
                        <div className="col-12">
                          <table className="table table-bordered">
                            <tbody>
                              <tr>
                                <td>RefId</td>
                                <td>{this.state.attackInfo['RefId']}</td>
                              </tr>
                              <tr>
                                <td>Asset</td>
                                <td>{this.state.attackInfo['Parent-Asset']}</td>
                              </tr>
                              <tr>
                                <td>Cyber Security Concept</td>
                                <td>{this.state.attackInfo['Parent-Cyber-Security']}</td>
                              </tr>
                              <tr>
                                <td>Impact Rating Value</td>
                                <td>{this.state.attackInfo['Impact-Rating-Value']}</td>
                              </tr>
                              <tr>
                                <td>Type WP29-Annex-5</td>
                                <td>{this.state.attackInfo['Type-WP24-Annex-5']}</td>
                              </tr>
                              <tr>
                                <td>Threat Sub-Scenario</td>
                                <td>{this.state.attackInfo['Threat-Sub-Scenario']}</td>
                              </tr>
                              <tr>
                                <td>Threat Type</td>
                                <td>{this.state.attackInfo['Threat-Type']}</td>
                              </tr>
                              <tr>
                                <td>Attack Type</td>
                                <td>{this.state.attackInfo['Attack-Type']} ({this.state.attackInfo['Attack-RefId']})</td>
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
                                        this.state.attackInfo['Attack-Steps'].map(step => {
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
                                                <span className="badge badge-info py-2 px-3 ml-2" title="Attack Feasibility Rating">AFR : {step['Attack-Step-Attack-Feasibility-Rating']}</span>
                                                <span className="badge badge-success py-2 px-3 ml-2" title="Impact Rating">IR : {step['Attack-Step-Impact-Rating']}</span>
                                                <span className="badge badge-danger py-2 px-3 ml-2" title="Risk Value">RV : {step['Attack-Step-Risk-Rating']}</span>
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
                                <td>{this.state.attackInfo['Attack-Effect']}</td>
                              </tr>
                              <tr>
                                <td>Attack CAL</td>
                                <td>{this.state.attackInfo['Attack-CAL']['Value']}</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>

                    {
                      false &&
                      <div className="modal-footer">
                        <button type="submit" className="btn btn-success btn-lg">
                          Download as <b>CSV</b>
                          <i className="fa fa-download ml-2"></i>
                        </button>
                      </div>
                    }

                  </div>
                </div>
              </div>
            }

          </div>
        </DashboardLayout>
      </div>
    );
  }
}

// Attack Tree
export default withRouter(AttackTree);