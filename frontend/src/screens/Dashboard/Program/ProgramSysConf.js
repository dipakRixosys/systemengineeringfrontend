// React
import React from 'react';
// React Router
import { Link } from "react-router-dom";
// React Select
import Select from 'react-select'
// Program
import Program from 'models/Program';
// Placeholder Loader
import PlaceholderLoader from 'components/ui/placeholder-loader/placeholder-loader';
// Layout
import DashboardLayout from "screens/Layouts/DashboardLayout";
// Helpers
import { setTitle, uuidV4, modal, swalPopup } from "helpers/common";
// Network Helpers
import { httpGet, apify, httpPost } from "helpers/network";
// jQuery
const jQuery = window.jQuery;
// Swal
const Swal = window.Swal;

// Program > System Configuration  
class ProgramSysConf extends React.Component {
  // Data
  state = {
    loading: true,
    program: undefined,
    programObject: undefined,

    payload: [],
    payloadAllowed: false,
    payloadInSync: false,

    components: [],
    componentArray: [],
    functions: [],
    allowFormSubmit: false,

    currentSystemConfig: null,
  }

  // Prompt Add System
  promptAddSystemModal = () => {
    jQuery('#FunctionName').trigger('focus');
    jQuery('#FunctionName').val(``);
    jQuery('#FunctionKey').val(``);
    this.setState({
      componentArray: []
    }, () => {
      modal('#ModalAddSystem');
    });
  }

  // Prompt Add System
  promptEditSystemModal = (func) => {
    jQuery('#FunctionName').trigger('focus');
    jQuery('#FunctionName').val(func['name']);
    jQuery('#FunctionKey').val(func['key']);
    this.setState({
      currentSystemConfig: func
    }, () => {

      let components = this.state.components
      let defaultComponent = []

      components.map(comp => {
        func['components'].map(funcComp => {
          if (comp.label === funcComp.label) {
            defaultComponent.push(comp);
          }
          return null;
        });
        return null;
      });

      this.setState({
        componentArray: defaultComponent,
        allowFormSubmit: (defaultComponent.length !== 0)
      }, () => {
        modal('#ModalAddSystem');
      });
    });
  }

  // onChangeComponentArray
  onChangeComponentArray = (ev) => {
    this.setState({
      componentArray: ev,
      allowFormSubmit: (ev.length !== 0)
    }, () => {
    });
  }

  // Function 
  onSubmitAddFunction = () => {
    let functionName = document.getElementById('FunctionName').value;
    let functionkey = document.getElementById('FunctionKey').value;
    let validFunctionName = (String(functionName).trim().length !== 0);
    let validFunctionkey = (String(functionkey).trim().length !== 0);
    let validComponents = (this.state['componentArray'].length !== 0);

    if (!validFunctionName) { alert("Provide valid function name."); return; }
    if (!validComponents) { alert("Provide components."); return; }

    let functions = this.state['functions'];

    if (validFunctionkey) {

      functions.map((func, index) => {
        if (func['key'] === functionkey) {
          functions[index] = {
            "key": functionkey,
            "name": functionName,
            "components": this.state['componentArray'],
          }
        }
        return func;
      });

    } else {
      functions.push({
        "key": uuidV4(),
        "name": functionName,
        "components": this.state['componentArray'],
      });
    }


    this.setState({
      functions: functions
    }, () => {
      modal('#ModalAddSystem', 'hide');
    });
  }

  // Fetch ECU
  fetchEcu = () => {
    httpGet(apify('app/ecu')).then(data => {
      let components = [];
      data['ecuList'].forEach(ecu => {
        components.push({
          label: ecu['name'],
          value: ecu['id'],
        });
      });
      this.setState({
        components: components,
      });
    });
  }

  // Save
  saveSystemConfiguration = () => {
    //
    let vm = this;
    this.setState({
      payloadInSync: true,
    }, () => {
      // Sync/save system-config
      httpPost(apify('app/program/sync-system-config'), {
        programUuid: vm.state.programObject['uuid'],
        payload: vm.state.functions,
      }).then(res => {
        if (res['success']) {
          vm.setState({
            payloadInSync: false,
          }, () => {
            swalPopup('System configuration updated for the program.', 'success', () => {
              vm.fetchSysConf(res['system_configuration']);
            });
          })
        }
      });
    });
  }

  // Fetch system configuration at initial load
  fetchSysConf = (_initialConf = undefined) => {
    let initialConf = _initialConf ?? this.state['programObject']['system_configuration'];
    let functions = [];

    for (const [key, systemFunction] of Object.entries(initialConf)) {
      let componentArray = [];
      systemFunction['components'].forEach(componentObject => {
        componentArray.push({
          'parentKey': key,
          'label': componentObject['component_name'],
          'value': componentObject['component_uuid'],
        });
      });

      functions.push({
        "key": systemFunction['uuid'],
        "name": systemFunction['name'],
        "components": componentArray,
      });
    }

    this.setState({
      functions: functions,
      loading: false,
    }, () => {

    });
  }

  // Delete
  onDeleteFuntion = (ev, functionUuid) => {
    let vm = this;

    // Swal-prompt
    Swal.fire({
      html: `
        Do you want to remove this function? <br />
        <small>(This will delete the Item Definition and subsequent data.)</smll>
      `,
      confirmButtonText: 'Yes',
      showCloseButton: true,
    }).then(async (result) => {
      //
      if (result.isConfirmed) {

        let params = {
          'programUuid': this.state['programObject']['uuid'],
          'functionUuid': functionUuid,
        };

        this.setState({
          payloadInSync: true,
        }, () => {
          // Delete function from system-config
          httpPost(apify('app/program/remove-system-config-function'), params).then(res => {
            if (res['success']) {
              vm.setState({
                payloadInSync: false,
              }, () => {
                let functions = this.state['functions'];

                if (functions.length > 0) {
                  functions = functions.filter(functionData => functionData['key'] !== functionUuid);
                  this.setState({
                    functions: functions
                  });

                }
              })
            }
          });
        });

      }
    });
  }

  // Mock Import
  mockImport = () => {
    modal('#ModalUMLImport', 'show');
  }

  // Mount
  async componentDidMount() {
    let vm = this;

    // Title
    setTitle("System Configuration");

    // Program UUID
    const { programUuid } = this.props['match']['params'];

    // Program Model
    var program = new Program({ 'programUuid': programUuid });

    // Program Object
    var programObject = await program.get();

    // Load program
    this.setState({
      loading: true,
      program: program,
      programObject: programObject['program'],
    }, () => {
      // Fetch ECU
      this.fetchEcu();

      // Pre-load existing system conf.
      this.fetchSysConf();
    });

    // On hide Add-System modal
    jQuery('#ModalAddSystem').on('hidden.bs.modal', function (e) {
      vm.setState({
        componentArray: [],
      }, () => {
        jQuery('#FunctionName').val(``);
      });
    })
  }

  // UI
  render() {
    return (
      <div>
        <DashboardLayout allowDemoMode={true}>
          <div className="container-fluid">
            <div className="row">
              <div className="col-12">

                {
                  this.state.loading &&
                  <PlaceholderLoader />
                }

                {
                  !this.state.loading &&
                  <div className="card">
                    {
                      this.state.payloadInSync &&
                      <div className="in-sync-progress">
                        Please wait <b className="px-2">System Configuration</b> saving...
                      </div>
                    }

                    <div className="card-header">
                      <div className="row">
                        <div className="col-6">
                          <h4>
                            <small>System Configuration</small> <br />
                            {this.state.programObject['name']}
                          </h4>
                        </div>
                        <div className="col-6 text-right py-3">
                          <button className="btn btn-primary" onClick={(ev) => this.mockImport()}>
                            <i className="fa fa-download mr-2" />
                            Import System Elements
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="card-body">
                      <div className="card my-3">
                        <div className="card-body p-0">
                          <table className="table table-bordered">
                            <thead>
                              <tr>
                                <th>Function</th>
                                <th>Component</th>
                                <th>Interface</th>
                                <th></th>
                              </tr>
                            </thead>
                            <tbody>
                              {
                                (this.state['functions'].length === 0) &&
                                <tr>
                                  <td colSpan="2" className="text-center">
                                    There are no functions defined.
                                    <button className="btn btn-outline-primary btn-sm mx-2" onClick={this.promptAddSystemModal}>
                                      <i className="fa fa-plus mr-2"></i>
                                      Add New
                                    </button>
                                  </td>
                                </tr>
                              }
                              {
                                (this.state['functions'].length > 0) &&
                                this.state['functions'].map(func => {
                                  return (
                                    <tr key={func['key']}>
                                      <td>{func['name']}</td>
                                      <td>
                                        {
                                          func['components'].map(component => {
                                            return (
                                              <span key={component['value']} className="badge badge-primary p-2 mr-2">{component['label']}</span>
                                            )
                                          })
                                        }
                                      </td>
                                      <td className="py-3">
                                        <input type="text" className="form-control md-form-control" placeholder="Interface Name" />
                                      </td>
                                      <td className="text-right">
                                        <div className="btn-group">
                                          <button className="btn btn-primary btn-sm mr-2" onClick={() => this.promptEditSystemModal(func)}>
                                            <i className="fa fa-edit"></i> Edit
                                          </button>
                                          <button className="btn btn-danger btn-sm ml-2" onClick={(ev) => this.onDeleteFuntion(ev, func['key'])}>
                                            <i className="fa fa-trash"></i> Remove
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  )
                                })
                              }
                              {
                                (this.state['functions'].length > 0) &&
                                <tr>
                                  <td colSpan="3" className="text-center">
                                    <button className="btn btn-outline-primary btn-sm mx-2" onClick={this.promptAddSystemModal}>
                                      <i className="fa fa-plus mr-2"></i>
                                      Add More
                                    </button>
                                  </td>
                                </tr>
                              }
                            </tbody>
                          </table>
                        </div>
                      </div>

                    </div>

                    <div className="card-footer">
                      <div className="row">

                        <div className="col-6">
                          {
                            (this.state['functions'].length > 0) &&
                            <div>
                              <button className="btn btn-primary" onClick={this.saveSystemConfiguration}>
                                Save System Configuration
                              </button>
                            </div>
                          }
                        </div>

                        <div className="col-6 text-right">
                          <Link to={`/dashboard/program/${this.state.programObject['uuid']}`} className="btn btn-dark text-white">
                            <i className="fa fa-chevron-left mr-2"></i>
                            Back to Program
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                }

              </div>
            </div>
          </div>

          {
            true &&
            <div>
              <div className="modal fade" id="ModalAddSystem" tabIndex="-1" data-keyboard="false" data-backdrop="static">
                <div className="modal-dialog modal-lg">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h4 className="modal-title text-primary">
                        Add <b>Function</b>
                      </h4>
                      <button type="button" className="close" data-dismiss="modal">
                        <span>&times;</span>
                      </button>
                    </div>

                    <div className="modal-body">
                      <div className="form-group row">
                        <div className="col-4 text-muted">
                          Function Name
                        </div>
                        <div className="col-8">
                          <input type="text" id="FunctionKey" className="form-control md-form-control d-none" placeholder="Function Name" name="key" />

                          <input type="text" id="FunctionName" className="form-control md-form-control" placeholder="Function Name" name="name" />
                        </div>
                      </div>
                      <div className="form-group row">
                        <div className="col-4 text-muted">
                          Components
                        </div>
                        <div className="col-8">
                          <Select
                            options={this.state['components']}
                            value={this.state['componentArray']}
                            onChange={(ev) => this.onChangeComponentArray(ev)}
                            isMulti
                          />
                        </div>
                      </div>
                    </div>

                    <div className="modal-footer">
                      <button className="btn btn-primary" onClick={this.onSubmitAddFunction} disabled={!this.state['allowFormSubmit']}>
                        Add Function
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          }


          <div>
            <div className="modal fade" id="ModalUMLImport" tabIndex="-1" data-keyboard="false" data-backdrop="static">
              <div className="modal-dialog modal-lg">
                <div className="modal-content">
                  <div className="modal-header">
                    <h4 className="modal-title text-primary">
                      Import <b>System Elements</b>
                    </h4>
                    <button type="button" className="close" data-dismiss="modal">
                      <span>&times;</span>
                    </button>
                  </div>

                  <div className="modal-body">
                    <img src="/static/images/sample-uml.jpeg" className="img-fluid" />
                  </div>

                  <div className="modal-footer">
                    <input type="file" className="form-control" />
                    <button className="btn btn-primary">
                      Import
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </DashboardLayout>
      </div>
    )
  }
}

//
export default ProgramSysConf;