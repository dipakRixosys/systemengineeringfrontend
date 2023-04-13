import React from 'react';
import DashboardLayout from 'screens/Layouts/DashboardLayout';
import PlaceholderLoader from 'components/ui/placeholder-loader/placeholder-loader';
import { setTitle, modal, uuidV4 } from "helpers/common";
import { apify, httpGet, httpPost } from 'helpers/network';
import { httpFile } from 'helpers/network';
const jQuery = window.jQuery;

// S-BoM Management
class SBoMManagement extends React.Component {

  state = {
    loading: true,
    sbomMaterials: [],
    showBinWalkLoading: false,
    showBinWalkOutput: false,
    viewConfigureForm: false,
    actionMode: 'UPDATE_MATERIAL',
  };

  //
  fetchMaterials = async () => {

    var vm = this;
    let { programUuid } = this.props['match']['params'];

    this.setState({
      loading: true,
      sbomMaterials: [],
      programUuid: programUuid
    }, async () => {

      let params = {
        'programUuid': programUuid,
      };

      httpPost(apify(`app/program/sbom/list`), params).then(res => {
        if (res['success']) {
          this.setState({
            loading: false,
           
          }, () => {

            let sbomMaterials = []
            let sbomUUid = []

            res['sbom'].map(sbom => {

              if(!sbomUUid.includes(sbom['Component-Uuid'])){
                sbomMaterials.push(sbom)
                sbomUUid.push(sbom['Component-Uuid'])
              }

              return null
            })


            this.setState({
              sbomMaterials: sbomMaterials,
            }, () => {


              // program fetch
              httpGet(apify(`app/program/threats?programUuid=${programUuid}`)).then(res => {
                let sbomManagement = res['sbom'];
  
                vm.setState({
                  loading: false,
                  program: res['program'],
                  sbomManagement: sbomManagement,
                  // uuidCounters: sbomManagement['uuidCounters'] ? sbomManagement['uuidCounters'] : {},
                  canGotoNextPhase: false,
                }, () => {
                  // this.fetchSysConf()
  
  
                });
              }).catch(err => {
                vm.setState({
                  loading: false,
                  program: null,
                }, () => {
                  console.error(err);
                });
              });
            })



          });
        }
      });

    });
  }

  //
  configureMaterial = (material) => {
    this.setState({
      viewConfigureForm: true,
      currentMaterial: material,
      bomSchemaJson: material['CyclonDX'],
    });
  }

  //
  showBinwalkLog = () => {
    modal('#BinWalk-Run-Iframe', {
      show: true,
    });
  }

  //
  renderCyclonDXJson = () => {
    try {
      var bomSchemaJson = this.state.bomSchemaJson;
      var options = {
        collapsed: true,
        rootCollapsable: true,
        withQuotes: true,
        withLinks: true,
      };
      jQuery('#json-renderer').jsonViewer(bomSchemaJson, options);
      this.setState({
        actionMode: 'DOWNLOAD_JSON'
      });
    }
    catch (error) {
      return false;
    }
  }
  
  tabMaterialDetailsOpen = (_mode) => {
    this.setState({
      actionMode: 'UPDATE_MATERIAL'
    });
  }
  
  tabAnalysisLogsOpen = (_mode) => {
    this.setState({
      actionMode: 'VIEW_ANALYSIS_LOG'
    });
  }


  validate = (requiredParameters, sdomManagement) => {

    let index = 0
    let validated = false

    requiredParameters.map(parameter => {
      var referenceNode = document.getElementsByName(parameter)[0]

      if ((!sdomManagement || !sdomManagement[parameter] || sdomManagement[parameter] === '')) {
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
        return;
      }
      return null
    })

    if (requiredParameters.length === index) {
      validated = true
    }

    return validated
  }

  // On submit
  onSubmit = async (ev) => {
    let validated = false;
    let sbomManagement = this.state.currentMaterial;
    let requiredParameters = [];
    validated = this.validate(requiredParameters, sbomManagement);

    if (sbomManagement['Properties']['Binary-File']) {
      await httpFile(apify('app/upload-file'), sbomManagement['Properties']['Binary-File']).then((res) => {
        if (res['success']) {
          sbomManagement['Properties']['Binary-File'] = res['url']
        }
      });
    }

    if (validated) {
      sbomManagement['Uuid'] = sbomManagement['Uuid'] ? sbomManagement['Uuid'] : uuidV4();
      var vm = this;
      httpPost(apify('app/program/sbom-management/update'), {
        programUuid: vm.state.programUuid,
        sbomManagement: vm.state.currentMaterial,
        uuidCounters: vm.state.uuidCounters
      }).then(res => {
        if (res['success']) {
          window.location.reload(false);
        }
      });
    }
  }

  // On Data Change
  onDataChange = (event) => {
    this.setState({
      currentMaterial: {
        ...this.state.currentMaterial,
        Properties: {
          ...this.state.currentMaterial['Properties'],
          [`${event.target.name}`]: event.target.type === 'file' ? (event.target.files && event.target.files.length > 0 ? event.target.files[0] : null) : event.target.value,
        }
      },
    });
  }

  //
  proxyJSONDownload = (json, name) => {
    json = JSON.stringify(json);
    const a = document.createElement('a');
    a.href = URL.createObjectURL( new Blob([json], { type:`application/json` }) );
    a.download = name;
    a.click();
  }

  //
  downloadCyclonDXJSON = () => {
    try {
      var bomSchemaJson = this.state.bomSchemaJson;
      this.proxyJSONDownload(bomSchemaJson, "CyclonDX-Export.json");   
    } catch (error) {
      console.error(error);
      alert("Something went wrong in exporting JSON.");
    }
  }

  async componentDidMount() {
    // Page title
    setTitle("S-BOM (Software Bill of Materials) Management");

    // Fetch materials
    this.fetchMaterials();
  }

  // UI
  render() {
    return (
      <DashboardLayout>
        <div className="container-fluid">
          <div className="row">
            <div className="col-12">

              <div className="card">
                <div className="card-header">
                  <h3>S-BoM Management</h3>
                </div>
                <div className="card-body">
                  {
                    this.state.loading &&
                    <PlaceholderLoader />
                  }

                  {
                    !this.state.loading &&
                    <div>
                      <table className="table table-bordered">
                        <thead>
                          <tr>
                            <th>System Configuration</th>
                            <th>Config</th>
                          </tr>
                        </thead>
                        <tbody>
                          {
                            this.state['sbomMaterials'].map(material => {
                              return (
                                <tr key={material['Uuid']}>
                                  <td>{material['Name']}</td>
                                  <td>
                                    <button className="btn btn-primary btn-sm btn-block" onClick={(ev) => this.configureMaterial(material)}>
                                      Config <b>Material</b> + CyclonDX
                                    </button>
                                  </td>
                                </tr>
                              )
                            })
                          }
                        </tbody>
                      </table>
                    </div>
                  }
                </div>
              </div>

              {
                this.state.viewConfigureForm && this.state.currentMaterial &&
                <div className="my-4">
                  <div className="card">
                    <div className="card-header">

                      <div className="row">
                        <div className="col12 col-md-6">
                          <h4>
                            <small>Configure Material</small> <br />
                            <b>{this.state.currentMaterial['Name']}</b>
                          </h4>
                        </div>

                        <div className="col12 col-md-6 text-right">
                          {
                            false && 
                            <button className="btn btn-primary">
                              Run <b>Binary Analysis</b>
                            </button>
                          }
                        </div>
                      </div>

                    </div>
                    <div className="card-body p-0">
                      <div>

                        <div>
                          <ul className="nav nav-tabs nav-justified">
                            <li className="nav-item">
                              <a className="nav-link active" data-toggle="tab" href="#TabMaterialDetails" onClick={(ev) => this.tabMaterialDetailsOpen()}>
                                Material Details
                              </a>
                            </li>
                            <li className="nav-item">
                              <a className="nav-link" data-toggle="tab" href="#TabAnalysisLogs" onClick={(ev) => this.tabAnalysisLogsOpen()}>
                                Analysis Logs
                              </a>
                            </li>
                            <li className="nav-item">
                              <a className="nav-link" data-toggle="tab" href="#TabCyclonDXJSON" onClick={(ev) => this.renderCyclonDXJson()}>
                                CyclonDX JSON
                              </a>
                            </li>
                          </ul>
                        </div>
                        <br />

                        <div className="tab-content">
                          <div className="tab-pane container active" id="TabMaterialDetails">

                            <div className="row my-3">
                              <div className="col-4">
                                Component Name
                              </div>
                              <div className="col-8">
                                <input defaultValue={this.state.currentMaterial['Properties']['Component-Name']}
                                  name="Component-Name"
                                  onChange={(ev) => this.onDataChange(ev)}
                                  className="form-control md-form-control" placeholder="Provide Component Name" />
                              </div>
                            </div>

                            <div className="row my-3">
                              <div className="col-4">
                                Component Supplier
                              </div>
                              <div className="col-8">
                                <input defaultValue={this.state.currentMaterial['Properties']['Component-Supplier']}
                                  name="Component-Supplier"
                                  onChange={(ev) => this.onDataChange(ev)}
                                  className="form-control md-form-control" placeholder="Provide Component Supplier" />
                              </div>
                            </div>

                            <div className="row my-3">
                              <div className="col-4">
                                License Type
                              </div>
                              <div className="col-8">
                                <input defaultValue={this.state.currentMaterial['Properties']['Licence-Type']}
                                  name="Licence-Type"
                                  onChange={(ev) => this.onDataChange(ev)}
                                  className="form-control md-form-control" placeholder="Provide License Type" />
                              </div>
                            </div>

                            <div className="row my-3">
                              <div className="col-4">
                                Software version
                              </div>
                              <div className="col-8">
                                <input defaultValue={this.state.currentMaterial['Properties']['Software-Version']}
                                  name="Software-Version"
                                  onChange={(ev) => this.onDataChange(ev)}
                                  className="form-control md-form-control" placeholder="Provide Software version" />
                              </div>
                            </div>

                            <div className="row my-3">
                              <div className="col-4">
                                Hardware version
                              </div>
                              <div className="col-8">
                                <input defaultValue={this.state.currentMaterial['Properties']['Hardware-Version']}
                                  name="Hardware-Version"
                                  onChange={(ev) => this.onDataChange(ev)}
                                  className="form-control md-form-control" placeholder="Provide Hardware version" />
                              </div>
                            </div>

                            <div className="row my-3">
                              <div className="col-4">
                                Firmware Number
                              </div>
                              <div className="col-8">
                                <input defaultValue={this.state.currentMaterial['Properties']['Firmware-Port-Number']}
                                  name="Firmware-Port-Number"
                                  onChange={(ev) => this.onDataChange(ev)}
                                  className="form-control md-form-control" placeholder="Provide Firmware Number" />
                              </div>
                            </div>

                            <div className="row my-3">
                              <div className="col-4">
                                Hardware Architecture
                              </div>
                              <div className="col-8">
                                <input defaultValue={this.state.currentMaterial['Properties']['Hardware-Architecture']}
                                  name="Hardware-Architecture"
                                  onChange={(ev) => this.onDataChange(ev)}
                                  className="form-control md-form-control" placeholder="Provide Hardware Architecture" />
                              </div>
                            </div>

                            <div className="row my-3">
                              <div className="col-4">
                                Operating System configration
                              </div>
                              <div className="col-8">
                                <input defaultValue={this.state.currentMaterial['Properties']['Oprating-System-Configration']}
                                  name="Oprating-System-Configration"
                                  onChange={(ev) => this.onDataChange(ev)}
                                  className="form-control md-form-control" placeholder="Provide Operating System configration" />
                              </div>
                            </div>

                            <div className="row my-3">
                              <div className="col-4">
                                Hardware Security Accelerator
                              </div>
                              <div className="col-8">
                                <input defaultValue={this.state.currentMaterial['Properties']['Hardware-Security-Machanism']}
                                  name="Hardware-Security-Machanism"
                                  onChange={(ev) => this.onDataChange(ev)}
                                  className="form-control md-form-control" placeholder="Provide Hardware Security Accelerator" />
                              </div>
                            </div>

                            <div className="row my-3">
                              <div className="col-4">
                                Hardware Accelerator Version
                              </div>
                              <div className="col-8">
                                <input defaultValue={this.state.currentMaterial['Properties']['Hardware-Accelerator-Version']}
                                  name="Hardware-Accelerator-Version"
                                  onChange={(ev) => this.onDataChange(ev)}
                                  className="form-control md-form-control" placeholder="Provide Hardware Accelerator Version" />
                              </div>
                            </div>

                            <div className="row my-3">
                              <div className="col-4">
                                Keys Stored
                              </div>
                              <div className="col-8">
                                <input defaultValue={this.state.currentMaterial['Properties']['Keys-Stored']}
                                  name="Keys-Stored"
                                  onChange={(ev) => this.onDataChange(ev)}
                                  className="form-control md-form-control" placeholder="Provide Keys Stored" />
                              </div>
                            </div>

                            <div className="row my-3">
                              <div className="col-4">
                                Certificate Type
                              </div>
                              <div className="col-8">
                                <input defaultValue={this.state.currentMaterial['Properties']['Certificate-Type']}
                                  name="Certificate-Type"
                                  onChange={(ev) => this.onDataChange(ev)}
                                  className="form-control md-form-control" placeholder="Provide Certificate Type" />
                              </div>
                            </div>

                            <div className="row my-3">
                              <div className="col-4">
                                Software Security Signature Type
                              </div>
                              <div className="col-8">
                                <input defaultValue={this.state.currentMaterial['Properties']['Software-Security-Signature-Type']}
                                  name="Software-Security-Signature-Type"
                                  onChange={(ev) => this.onDataChange(ev)}
                                  className="form-control md-form-control" placeholder="Provide Software Security Signature Type" />
                              </div>
                            </div>

                            <div className="row my-3">
                              <div className="col-4">
                                Software API Calls
                              </div>
                              <div className="col-8">
                                <input defaultValue={this.state.currentMaterial['Properties']['Software-API-Calls']}
                                  name="Software-API-Calls"
                                  onChange={(ev) => this.onDataChange(ev)}
                                  className="form-control md-form-control" placeholder="Provide Software API Calls" />
                              </div>
                            </div>

                          </div>

                          <div className="tab-pane container fade" id="TabAnalysisLogs">
                            <div className="row my-3">
                              <div className="col-4">
                                Upload Binary File
                              </div>
                              <div className="col-8">
                                <input 
                                // defaultValue={this.state.currentMaterial['Properties']['Binary-File']}
                                  name="Binary-File"
                                  onChange={(ev) => this.onDataChange(ev)}
                                  type="file" className="form-control md-form-control" />
                              </div>
                            </div>

                            <div className="row my-3">
                              <div className="col-4">
                                Binwalk Log
                              </div>
                              <div className="col-8">
                                <a href="#!" className="link" onClick={(ev) => this.showBinwalkLog()}>
                                  View log
                                </a>
                              </div>
                            </div>

                            <div className="row my-3">
                              <div className="col-4">
                                Binwalk (OpCodes)
                              </div>
                              <div className="col-8">
                                <a href="#!" className="link" onClick={(ev) => this.showBinwalkLog()}>
                                  View log
                                </a>
                              </div>
                            </div>

                            <div className="row my-3">
                              <div className="col-4">
                                Binwalk (Entropy)
                              </div>
                              <div className="col-8">
                                <a href="#!" className="link" onClick={(ev) => this.showBinwalkLog()}>
                                  View log
                                </a>
                              </div>
                            </div>

                            <div className="row my-3">
                              <div className="col-4">
                                CVE-Bin Tool
                              </div>
                              <div className="col-8">
                                <a href="#!" className="link" onClick={(ev) => this.showBinwalkLog()}>
                                  View CVE log
                                </a>
                              </div>
                            </div>

                          </div>

                          <div className="tab-pane container fade" id="TabCyclonDXJSON">
                            <div className="row my-3">
                              <pre id="json-renderer"></pre>
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>
                    <div className="card-footer">
                      {
                        this.state.actionMode === 'UPDATE_MATERIAL' &&
                        <button className="btn btn-primary" onClick={() => this.onSubmit()}>
                          Update <b>Material</b>
                        </button>
                      }

                      {
                        this.state.actionMode === 'DOWNLOAD_JSON' &&
                        <button className="btn btn-primary" onClick={() => this.downloadCyclonDXJSON()}>
                          Download <b>CyclonDX JSON</b>
                        </button>
                      }
                    </div>
                  </div>
                </div>
              }

              <div className="modal fade" id="BinWalk-Run-Iframe" tabIndex="-1" data-backdrop="static">
                <div className="modal-dialog modal-full-width">

                  <div className="modal-content">
                    <div className="modal-header">
                      <h4 className="modal-title text-primary">
                        Output of <b>BinWalk Analysis</b>
                      </h4>
                      <button type="button" className="close" data-dismiss="modal">
                        <span>&times;</span>
                      </button>
                    </div>
                    <div className="modal-body widget-modal-body">

                      <code>
                        $ binwalk --signature firmware.bin <br />
                        <br />
                        DECIMAL   	HEX       	DESCRIPTION <br />
                        ------------------------------------------------------------------------------------------------------------------- <br />
                        0         	0x0       	DLOB firmware header, boot partition: "dev=/dev/mtdblock/2" <br />
                        112       	0x70      	LZMA compressed data, properties: 0x5D, dictionary size: 33554432 bytes, uncompressed size: 3797616 bytes <br />
                        1310832   	0x140070  	PackImg section delimiter tag, little endian size: 13644032 bytes; big endian size: 3264512 bytes <br />
                        1310864   	0x140090  	Squashfs filesystem, little endian, version 4.0, compression:lzma, size: 3264162 bytes,  1866 inodes, blocksize: 65536 bytes, created: Tue Apr  3 04:12:22 2012 <br />
                      </code>

                    </div>

                    {
                      true &&
                      <div className="modal-footer">
                        <button className="btn btn-primary">
                          Download Log
                          <i className="fa fa-download ml-2"></i>
                        </button>
                      </div>
                    }
                  </div>

                </div>
              </div>

            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

};

export default SBoMManagement;