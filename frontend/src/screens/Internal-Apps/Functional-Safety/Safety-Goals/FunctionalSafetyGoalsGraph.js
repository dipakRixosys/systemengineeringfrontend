import React from "react";
import { Link, withRouter } from "react-router-dom";
import ReactFlow, { Background, Controls, MiniMap } from 'react-flow-renderer';
import { modal, programLifecycleRoute, setTitle } from "helpers/common";
import { apify, httpGet } from "helpers/network";
import DashboardLayout from "screens/Layouts/DashboardLayout";
import ProgramLayout from "screens/Layouts/ProgramLayout";
import FunctionalSafetyProgramHeader from "../slots/FunctionalSafetyProgramHeader";
import PlaceholderLoader from "components/ui/placeholder-loader/placeholder-loader";
import dagre from "dagre";

// Safety Goals (Graph)
class FunctionalSafetyGoalsGraph extends React.Component {
  constructor(props) {
    super(props);
    let { programUuid } = props.match.params;
    this.state = {
      loading: true,
      programUuid: programUuid,
    };
  }

  async componentDidMount() {
    setTitle("Functional Safety Goals");
  }

  render() {
    return (
      <div>
        <DashboardLayout app="Criskle-Functional-Safety">
          <ProgramLayout 
            programUuid={this.state['programUuid']} 
            header={<FunctionalSafetyProgramHeader />}
            body={<FunctionalSafetyProgramBody />}
          >
            
          </ProgramLayout>
        </DashboardLayout>
      </div>
    );
  }
}

// Body
class FunctionalSafetyProgramBody extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      program: props['program'],
      safetyGoals: [],
      graphElements: [],
      graphNodes: [],
      graphEdges: [],
      modalTitle: undefined,
      modalBody: undefined,
    };
  }

  randomPositionCoord = () => {
    let minRange = 100;
    let maxRange = 500;
    return Math.abs(Math.floor((Math.random() * maxRange) + minRange));
  }

  showGoalDialog = (ev, goal) => {
    let modalTitle = `View Goal : ${goal['Safety-Goal-Id']}`;
    let modalBody = `
      <table class="table table-bordered">
        <thead>
          <tr>
            <th class="text-left">Goal Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>${goal['Safety-Goal-Description']}</td>
          </tr>
        </tbody>
      </table>

      <table class="table table-bordered">
        <thead>
          <tr>
            <th colspan="2" class="text-left">Associated Hazards</th>
          </tr>
          <tr>
            <th class="text-left">Hazard ID</th>
            <th class="text-left">ASIL Rating</th>
          </tr>
        </thead>
        <tbody>
          ${goal['Associated-Hazards'].map((hazard) =>`
          return(
            <tr key={hazard['Hazard-Uuid']}>
              <td>${hazard["Hazard-ID"]}</td>
              <td>${hazard["Event"]['ASIL-Rating-Value']}</td>
            </tr>
          )
          `)}
        </tbody>
      </table>
    `;

    this.setState({
      modalTitle: modalTitle,
      modalBody: modalBody,
    }, () => {
      modal('#ModalGoalDescription');
    });
  }

  fetchSafetyGoals = () => {
    let programUuid = this.state['program']['uuid'];
    let graphElements = [];
    let asilRatingsAndColors = [];

    httpGet(apify(`app/functional-safety/hazop?programUuid=${programUuid}`)).then((res) => {
      if (res['success']) {
        let safetyGoals = res['safetyGoals']['goals'];
        let asilRatings = res['hazopConfig']['ASIL-Background-Colors'];

        for (let [key, value] of Object.entries(asilRatings)) {
          asilRatingsAndColors.push({
            'rating': key,
            'color': value,
          });
        }
        
        let graphNodes = [];
        let graphEdges = [];

        let positionX = 0, positionY = 0;
        
        safetyGoals.forEach(goal => {
          graphNodes.push({
            id: goal['Safety-Goal-Id'],
            type: 'input',
            data: {
              label: <div onClick={(ev) => this.showGoalDialog(ev, goal)}>{goal['Safety-Goal-Id']}</div>
            },
            position: { x: positionX, y: positionY },
          });
          
          positionY = 0;
          positionX = 0;
        });

        safetyGoals.forEach(goal => {
          goal['Associated-Hazards'].forEach(hazardObj => {
            graphNodes.push({
              id: hazardObj['Hazard-Uuid'],
              type: 'output',
              data: { label: `${hazardObj['Hazard-ID']} (ASIL: ${hazardObj["Event"]['ASIL-Rating-Value']})`},
              position: { x: positionX, y: positionY },
              style: { backgroundColor: hazardObj["Event"]['ASIL-Rating-Bg-Color'], color: hazardObj["Event"]['ASIL-Rating-Text-Color'] }
            });

            graphEdges.push({
              id: `el-${goal['Safety-Goal-Id']}-${hazardObj['Hazard-Uuid']}`, 
              source: goal['Safety-Goal-Id'], 
              target: hazardObj['Hazard-Uuid'], 
              label: `Protected by ${goal['Safety-Goal-Id']}`
            });

            positionX = 0;
            positionY = 0;
          });
        });

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
          loading: false,
          safetyGoals: res['safetyGoals']['goals'],
          graphElements: graphElements,
          graphNodes: graphNodes,
          graphEdges: graphEdges,
          asilRatingsAndColors: asilRatingsAndColors,
        });
      }
    });
  }

  onNodesChange = (changes) => {
    
  }

  resetGraph = () => {
    
  }

  componentDidMount() {
    this.fetchSafetyGoals();
  }

  render() {
    return(
      <div>
        { this.state['loading'] && <PlaceholderLoader /> }
        { 
          !this.state['loading'] 
          && 
          <div>
            <div className="card-body p-0">
              <div className="flow-graph-container">
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
              </div>
            </div>
            
            <div className="card-footer">
              <div className="row">
                <div className="col-12 col-md-6" >
                  <table className="">
                    <thead>
                      <tr>
                        <td className="text-primary text-uppercase" colSpan={2}>
                          <b>Legend</b>
                        </td>
                      </tr>
                    </thead>
                    <tbody className="border">
                      <tr className="border">
                        <th className="align-middle h6 border">Goal</th>
                        <td>
                          <div className="w-50 m-2 border border-dark" style={{backgroundColor:"#fff", height:10, width:100 }}></div>
                        </td>
                      </tr>
                      <tr className="border h6">
                        <th colSpan={2}>Hazard</th>
                      </tr>
                      <tr className="border h6">
                        <th className="p-2 border">ASIL Rating</th>
                        <th className="p-2 border">Color</th>
                      </tr>
                      { this.state["asilRatingsAndColors"] && 
                        this.state?.asilRatingsAndColors?.map(asil => {
                          return (
                            <tr className="border">
                              <td className="text-center align-middle border h6">{asil["rating"]}</td>
                              <td className="text-center">
                              <div className="w-50 m-2 border border-dark" style={{backgroundColor:`${asil.color}` , height:10, width:100 }}></div>
                              </td>
                            </tr>
                          )
                      }
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="col-12 col-md-6 text-right">
                  <Link to={programLifecycleRoute('Functional-Safety-FSG', this.state['program']['uuid'])} className="btn btn-info px-3 text-white">
                    <i className="fa fa-arrow-left mr-2"></i>
                    Back to <b>Safety Goals</b>
                  </Link>
                </div>
              </div>

            </div>

            <div className="modal fade" id="ModalGoalDescription" tabIndex="-1" data-keyboard="false" data-backdrop="static">
              <div className="modal-dialog modal-lg">
                <div className="modal-content">
                  <div className="modal-header">
                    <h4 className="modal-title text-primary">
                      <span dangerouslySetInnerHTML={{__html: this.state['modalTitle']}}></span>
                    </h4>
                    <button type="button" className="close" data-dismiss="modal">
                      <span>&times;</span>
                    </button>
                  </div>
                  
                  <div className="modal-body">
                    <div dangerouslySetInnerHTML={{__html: this.state['modalBody']}}></div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        }
      </div>
    )
  }
}

export default withRouter(FunctionalSafetyGoalsGraph);