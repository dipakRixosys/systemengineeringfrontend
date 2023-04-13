// React
import React from 'react';
// React router
import { Link } from 'react-router-dom';
// React Select
import Select from 'react-select'
// Layout
import DashboardLayout from 'screens/Layouts/DashboardLayout';
// Placeholder loader
import PlaceholderLoader from 'components/ui/placeholder-loader/placeholder-loader';
// Helpers
import { programLifecycleRoute, setTitle } from "helpers/common";
// Network helpers
import { apify, httpGet } from 'helpers/network';

// Digital Twin
class DigitalTwin extends React.Component {

  state = {
    loading: true,
    modelViewer: undefined,
    modelHotspots: [],
    modelLoading: true,
    modelS3Ref: 'https://criskle-uploads.s3.eu-west-2.amazonaws.com/3d-models/Vehicle-Model-1/named_v.glb',
    undefinedDataset: false,
  };

  // Annotation clicked event
  annotationClicked = (dataset) => {
    let modelViewer = this.state['modelViewer'];
    modelViewer.cameraTarget = dataset.target;
    modelViewer.cameraOrbit = dataset.orbit;
  }

  // Model hotspot change event
  onChangeModelHotspot = (ev) => {
    this.annotationClicked(ev['dataset']);
  }

  // Init. model viewer
  initModelViewer = () => {
    let vm = this;

    let modelViewer = document.querySelector("#hotspot-camera-view-demo");
    modelViewer.querySelectorAll('button').forEach((hotspot) => {
      hotspot.addEventListener('click', () => vm.annotationClicked(hotspot.dataset));
    });

    let modelHotspots = [
      {
        value: 'ADAS',
        label: 'ADAS',
        dataset: {
          target: '0m 0m 0m',
          orbit: '1deg 0deg 300m',
        },
      },
      {
        value: 'OBC',
        label: 'OBC',
        dataset: {
          target: '0m 0m 0m',
          orbit: '10deg -45deg 320m',
        },
      },
      {
        value: 'LIDAR-FRONT-LEFT',
        label: 'LIDAR-FRONT-LEFT',
        dataset: {
          target: '0m 0m 0m',
          orbit: '10deg 90deg 360m',
        },
      },
      {
        value: 'LIDAR-FRONT-RIGHT',
        label: 'LIDAR-FRONT-RIGHT',
        dataset: {
          target: '0m 0m 0m',
          orbit: '-30deg 90deg 360m',
        },
      },
      {
        value: 'GATEWAY-DOMAIN-CONTROL',
        label: 'Gateway Domain Control',
        dataset: {
          target: '-20m -110m -100m',
          orbit: '20deg 30deg 200m',
        },
      },
      {
        value: 'BCM',
        label: 'BCM',
        dataset: {
          target: '-30m -120m -130m',
          orbit: '20deg 0deg 200m',
        },
      },
      {
        value: 'CCU',
        label: 'CCU',
        dataset: {
          target: '-15m 10m -210m',
          orbit: '20deg 0deg 200m',
        },
      },
    ];

    window.modelViewer = modelViewer;

    this.setState({
      modelViewer: modelViewer,
      modelHotspots: modelHotspots,
    });
  }

  // Load model
  loadModel = async () => {
    this.setState({
      modelLoading: false,
    }, () => {
      this.initModelViewer();
    });
  }

  //
  judgeEcuName = (threatName) => {
    let parentEcuName = null;
    threatName = String(threatName).toUpperCase();
    let ecus = ['ADAS', 'CCU', 'CAN'];
    ecus.forEach(ecu => {
      if (threatName.includes(ecu)) {
        parentEcuName = ecu;
        return;
      }
    });
    return parentEcuName;
  }

  //
  onClickViewAtTwin = (threat) => {
    let parentEcuName = this.judgeEcuName(threat['Name']);
    let dataset = undefined;

    this.state.modelHotspots.forEach(hotspot => {
      if (hotspot['value'] === parentEcuName) {
        dataset = hotspot['dataset'];
        return;
      }
    });

    let defaultDataset = {
      'target': '0m 0m 0m',
      'orbit': 'auto auto auto',
      // 'orbit': '0deg 0deg -50m',
      // 'orbit': '0deg 75deg 105%',
    };

    this.setState({
      undefinedDataset: (dataset === undefined),
    }, () => {
      let _dataset = dataset ?? defaultDataset;
      this.annotationClicked(_dataset);
    });

  }

  // Mount
  async componentDidMount() {
    //
    setTitle("Digital Twin");

    //
    let { programUuid } = this.props['match']['params'];

    //
    this.setState({
      programUuid: programUuid
    });

    var vm = this;

    httpGet(apify(`app/program/?programUuid=${programUuid}`)).then(res => {
      vm.setState({
        loading: false,
        program: res['program'],
      }, () => {

        this.loadModel();

      });
    }).catch(() => {
      vm.setState({
        loading: false,
        program: null,
      });
    });
  }

  render() {
    return (
      <DashboardLayout>
        {
          this.state.loading &&
          <div>
            <PlaceholderLoader />
          </div>
        }

        {
          !this.state.loading &&
          !this.state.program &&
          <div className="container-fluid">
            <div className="row">
              <div className="col-12">

                <div className="card">
                  <div className="card-header">
                    <h3>No such program exists.</h3>
                  </div>

                  <div className="card-body">
                    We are unable to find <b>requested program</b> in our application.
                  </div>

                  <div className="card-footer">
                    <Link to={`/dashboard/programs`} className="btn btn-primary text-white">
                      <i className="fa fa-chevron-left mr-2"></i>
                      Back to Programs
                    </Link>
                  </div>
                </div>

              </div>
            </div>
          </div>
        }

        {
          !this.state.loading &&
          this.state.program &&
          <div className="container-fluid">
            <div className="row">
              <div className="col-12 col-lg-5">

                <div className="card">

                  <div className="card-header">

                    <div className="row">
                      <div className="col-8">
                        <h3>Digital Twin</h3>
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
                    <table className="table table-bordered">
                      <thead>
                        <tr>
                          <th>Threats</th>
                          <th className="text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {
                          this.state.program['assets']['Identification']['Items'].map(item => {

                            return (
                              <tr key={item['RefId']}>
                                <td>{item['Name']}</td>
                                <td className="text-right">
                                  <button className="btn btn-primary btn-sm" onClick={(ev) => this.onClickViewAtTwin(item)}>
                                    View at <b>Twin</b>
                                  </button>
                                </td>
                              </tr>
                            )
                          })
                        }
                        {
                          (this.state.program['assets']['Identification']['Items'].length === 0) &&
                          <tr className="text-center">
                            <td colSpan="2">No items identified.</td>
                          </tr>
                        }
                      </tbody>
                    </table>
                  </div>

                  <div className="card-footer py-4">
                    <Link to={programLifecycleRoute('VIEW', this.state.program['uuid'])} className="btn btn-primary text-white">
                      <i className="fa fa-arrow-left mr-2"></i>
                      Back to Program
                    </Link>
                  </div>
                </div>

              </div>

              <div className="col-12 col-lg-7">
                {
                  this.state['modelLoading']
                  &&
                  <div>
                    <PlaceholderLoader />
                  </div>
                }

                {
                  !this.state['modelLoading']
                  &&
                  <div>
                    <div className="row mb-2 d-none">
                      <div className="col-12 col-sm-4">
                        <Select
                          options={this.state.modelHotspots}
                          onChange={(ev) => this.onChangeModelHotspot(ev)}
                        />
                      </div>
                    </div>

                    <model-viewer
                      class="model-viewer-canvas"
                      id="hotspot-camera-view-demo"
                      src={this.state['modelS3Ref']}
                      camera-controls
                      touch-action="none"
                      camera-orbit="1.44deg 0.44deg 655m"
                      camera-target="-0.003m 0.0722m 0.0391m"
                      min-field-of-view="45deg"
                      interpolation-decay="200"
                      // min-camera-orbit="auto auto 10%" 
                      ar
                      ar-modes="webxr scene-viewer quick-look"
                      oncontextmenu="return false;"
                    >
                    </model-viewer>


                    {
                      this.state['undefinedDataset'] &&
                      <div className="mt-3 alert alert-warning">
                        Selected threat/ECU/component is not present as hotspot.
                      </div>
                    }

                  </div>
                }
              </div>

            </div>
          </div>
        }
      </DashboardLayout>
    );
  }
};

export default DigitalTwin;