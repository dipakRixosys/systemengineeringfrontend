import React from 'react';
import Select from 'react-select'
import { Link, withRouter } from 'react-router-dom';
import ReactFlow, { Background, Controls, MiniMap } from 'react-flow-renderer';
import { setTitle, modal, programLifecycleRoute } from "helpers/common";
import { httpPost, apify } from 'helpers/network';
import DashboardLayout from "screens/Layouts/DashboardLayout";
import PlaceholderLoader from 'components/ui/placeholder-loader/placeholder-loader';
import dagre from "dagre";
import AND_GATE_IMAGE from "../../images/and-gate.png"
import Or_GATE_IMAGE from "../../images/or-gate.png"


// jQuery
const jQuery = window.jQuery;

// Model Viewer 
class AttackTreeViewerV2 extends React.Component {
  state = {
    loading: true,
    useDefaultAttackData: true,
    programUuid: undefined,
    attackTree: {},
    tree: {},
    root: {},
    nodes: {},
    treeLoading: true,
    errorCtx: false,
    graphNodes: [],
    graphEdges: [],
    altAttackTreeData: [],
  };

  renderD3Chart = (attackTree) => {
    let graphNodes = [];
    let positionX = 150;
    let positionY = 0;

    let renderAndGate = false;
    let renderFirstNodeCompleted = false;
    let nodeUuids = [];

    attackTree.forEach(step => {
      graphNodes.push({
        id: step['uuid'],
        type: !renderFirstNodeCompleted ? 'input' : null,
        data: {
          label: <div title={step['fullName']}>{step['name']}</div>
        },
        position: { x: positionX, y: positionY },
      });
      renderFirstNodeCompleted = true;

      nodeUuids.push(step['uuid']);

      positionX = 150;
      positionY += renderAndGate ? 100 : 80;

      if (!renderAndGate) {
        graphNodes.push({
          id: `AND-${step['uuid']}`,
          data: {
            label: <div>And GATE</div>
          },
          position: { x: positionX, y: positionY },
          style: {
            'width': '85px',
            'height': '5rem',
            'margin': '0 30px',
            'borderRadius': '4rem 4rem 0 0',
            'background': '#e0e0e0',
            'border': '0.125rem solid #ffa000',
            'padding': '25px',
          },
        });
        renderAndGate = true;
        positionY += 100;

        nodeUuids.push(`AND-${step['uuid']}`);
      }
    });

    graphNodes.push({
      id: `END`,
      type: 'output',
      data: {
        label: <div>END</div>
      },
      position: { x: positionX, y: positionY },
    });
    nodeUuids.push(`END`);

    let graphEdges = [];
    for (let index = 0; index < nodeUuids.length; index++) {
      let currentNode = nodeUuids[index];
      let nextNode = nodeUuids[index+1];
      if (nextNode !== undefined) {
        graphEdges.push({
          id: `el-${currentNode}-${nextNode}`, 
          source: currentNode, 
          target: nextNode, 
          label: `Attack Path`
        });
      }
    }
    
    this.setState({
      treeLoading: false,
      graphNodes: graphNodes,
      graphEdges: graphEdges,
    });
  }

  onChangeThreat = (ev) => {
    let attackTreeJson = ev['attackTreeJson'];
    this.setState({
      selectedThreatOption: ev,
    }, () => {
      this.tryAlternateD3Chart(attackTreeJson);
    });
  }

  tryAlternateD3Chart = (altAttackTreeData) => {
    let graphNodes = [];
    let graphEdges = [];

    let steps = altAttackTreeData['steps'];
    let positionX = 0, positionY = 0;

    // Other steps
    for (let stepKey in steps) {
      let step = steps[stepKey];
      graphNodes.push({
        id: stepKey,
        type: step['type'],
        data: {
          label: 
          <div style={{display:"flex"}} tooltip="TESTING HOVER"> 
            <div style={{flex:"0.5", display:"flex", flexDirection:"column", justifyContent:"space-between", borderRight:"1px solid black"}}>
              <span><i className="bi bi-circle-fill" style={{color:"red"}}/></span>
              <span><i className="bi bi-square-fill" style={{color:"red"}}/></span>
              <span><i className="bi bi-triangle-fill" style={{color:"red"}}/></span>
            </div>
            <div style={{flex:"2", padding:"5px", textAlign:"start"}}><p>{step['name']}</p> </div>
          </div>
        },
        position: {
          x: positionX, 
          y: positionY
        },
        style: {
          "padding": "0px",
          "margin": "0px",
          "width" :"200px",
          "boxShadow": "0px 4px 27px -2px rgba(0,0,0,0.20)",
        },
      });

      let andWith = step['and_with'];
      if (andWith.length > 0) {
        graphNodes.push({
          id: `AND-${stepKey}`,
          data: {
            label: <div style={{display:"flex", justifyContent:"center", alignItems:"center"}}>
                    <img src={AND_GATE_IMAGE} alt="AND"height={80} width={70} /> 
                    <span style={{position : "absolute", fontSize:"20px"}}>AND</span>
                  </div>
          },
          position: {
            x: positionX, 
            y: positionY
          },
          style: {
            "padding": "0px",
            "margin": "0px",
            "border": "0px",
            "width": "70px",
            "height": "80px",
          },
        });
      }

      let orWith = step['or_with'];
      if (orWith.length > 0) {
        graphNodes.push({
          id: `OR-${stepKey}`,
          data: {
            label: <div style={{display:"flex", justifyContent:"center", alignItems:"center"}}>
                      <img src={Or_GATE_IMAGE} alt="AND"height={80} width={70} /> 
                      <span style={{position : "absolute", fontSize:"20px"}}>OR</span>
                    </div>
          },
          position: {
            x: positionX, 
            y: positionY
          },
          style: {
            "padding": "0px",
            "margin": "0px",
            "border": "0px",
            "width": "70px",
            "height": "80px",
          },
        });
      }

    }

    // Draw relationship
    for (let stepKey in steps) {
      let step = steps[stepKey];

      let andWith = step['and_with'];
      let andGateKey = `AND-${stepKey}`;
      if (andWith.length > 0) {
        graphEdges.push({
          id: `el-${andGateKey}-${stepKey}`, 
          source: (step['type'] === 'output') ? andGateKey : stepKey, 
          target: (step['type'] === 'output') ? stepKey : andGateKey, 
          label: `Attack Path`,
          type: 'step'
        });
      }
      andWith.forEach(rel => {
        graphEdges.push({
          id: `el-${andGateKey}-${rel}`, 
          source: (step['type'] === 'output') ? rel : andGateKey, 
          target: (step['type'] === 'output') ? andGateKey : rel, 
          label: `Attack Path`,
          type: 'step',
        });
      });

      let orWith = step['or_with'];
      let orGateKey = `OR-${stepKey}`;
      if (orWith.length > 0) {
        graphEdges.push({
          id: `el-${orGateKey}-${stepKey}`, 
          source: (step['type'] === 'output') ? orGateKey : stepKey, 
          target: (step['type'] === 'output') ? stepKey : orGateKey, 
          label: `Attack Path`,
          type: 'step'
        });
      }
      orWith.forEach(rel => {
        graphEdges.push({
          id: `el-${orGateKey}-${rel}`,
          source: (step['type'] === 'output') ? rel : orGateKey, 
          target: (step['type'] === 'output') ? orGateKey : rel,
          label: `Attack Path`,
          type: 'step'
        });
      });
    }

    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));

    const nodeWidth = 200;
    const nodeHeight = 50;

    dagreGraph.setGraph({ rankdir: 'TB' });

    graphNodes.forEach((node) => {
      dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    });

    graphEdges.forEach((edge) => {
      dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    graphNodes.forEach((node) => {
      const nodeWithPosition = dagreGraph.node(node.id);
      node.position = {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2
      };
      return node;
    });  

    this.setState({
      treeLoading: false,
      graphNodes: graphNodes,
      graphEdges: graphEdges,
    })
  }

  setupD3 = () => {
    var vm = this;
    let params = {
      'programUuid': this.state.programUuid
    };

    httpPost(apify(`app/program/attack-tree`), params).then(res => {
      let attackTreeData = res['attackTreeData'];
      let altAttackTreeData = res['altAttackTreeData'];
      let threatOptions = attackTreeData['threats'];
      let defaultThreat = threatOptions[0];

      vm.setState({
        threatOptions: threatOptions,
        selectedThreatOption: defaultThreat,
        altAttackTreeData: altAttackTreeData,
        useDefaultAttackData: !(altAttackTreeData !== undefined),
      }, () => {
        vm.tryAlternateD3Chart(defaultThreat ? defaultThreat['attackTreeJson'] : []);
      });

    }).catch(err => {
      vm.setState({
        errorCtx: true
      });
    });
  }
  
  async componentDidMount() {
    setTitle("Attack Tree Viewer");

    let { programUuid } = this.props['match']['params'];
    
    this.setState({
      loading: false,
      programUuid: programUuid,
    }, () => {
      // Setup data & render first target attack with steps
      this.setupD3();

      // Onclick open attack information
      jQuery('body').on('click', '.has-html-content', function(e) {
        try {
          let html = jQuery(this).attr('data-html');
          modal('#Modal-Show-Attack-Info', {
            show: true,
          });
          html = decodeURI(html);
          jQuery('.widget-modal-body').html(html);

        } catch (error) {
          
        }
      });
    });
  }
  
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
              this.state.errorCtx && 
              <div className="row">
                <div className="col-12">
                  <div className="alert alert-danger alert-card">
                    No such program/attack tree found in our system.
                  </div>
                </div>
              </div>
            }

            {
              !this.state.errorCtx && 
              !this.state.loading && 
              <div>
                {
                  <div>
                    
                    <div className="card">
                      <div className="card-header">
                        
                        <div className="row py-3">
                          <div className="col-8">
                            <h3 className="card-title mb-2">Attack Tree</h3>
                            <i>Select threat to view attack tree.</i>
                          </div>

                          <div className="col-4">
                            <label>Select Threat</label>
                            <Select
                              options={this.state.threatOptions}
                              value={this.state.selectedThreatOption}
                              onChange={(ev) => this.onChangeThreat(ev)}
                              menuPortalTarget={document.body} styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                            />
                          </div>
                        </div>

                      </div>
                      <div className="card-body">
                        {
                          this.state.treeLoading && 
                          <PlaceholderLoader />
                        }
                        
                        {
                          !this.state.treeLoading && 
                          <div className="flow-graph-container">
                            {
                              this.state.useDefaultAttackData && 
                              <ReactFlow 
                                defaultNodes={this.state['graphNodes']} 
                                defaultEdges={this.state['graphEdges']} 
                                // onNodesChange={this.onNodesChange}
                                fitView
                              >
                                <Background
                                  variant="dots"
                                  gap={16}
                                  size={0.5}
                                />
                                <MiniMap />
                                <Controls />
                              </ReactFlow>
                            }

                            {
                              !this.state.useDefaultAttackData && 
                              <ReactFlow 
                                defaultNodes={this.state['graphNodes']} 
                                defaultEdges={this.state['graphEdges']}
                                fitView
                              >
                                <Background
                                  variant="dots"
                                  gap={16}
                                  size={0.5}
                                />
                                <MiniMap />
                                <Controls />
                              </ReactFlow>
                            }
                          </div>
                        }

                      </div>

                      <div className="card-footer">
                        <div className="row">
                          <div className="col-12 col-md-6">
                            <h6 className="text-primary text-uppercase">Legend</h6>
                            <i className="bi bi-circle-fill mr-2" style={{color: `red`}}></i> AFR/SeCL <br />
                            <i className="bi bi-square-fill mr-2" style={{color: `red`}}></i> IR <br />
                            <i className="bi bi-triangle-fill mr-2" style={{color: `red`}}></i> RR <br />
                          </div>
                          <div className="col-12 col-md-6 text-right">
                            <Link to={programLifecycleRoute('VIEW', this.state.programUuid)} className="btn btn-info text-white">
                              <i className="fa fa-arrow-left mr-2"></i>
                              Back to Program
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="modal fade" id="Modal-Show-Attack-Info" tabIndex="-1" data-backdrop="static">
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
      </div>
    );
  }
}

export default withRouter(AttackTreeViewerV2);