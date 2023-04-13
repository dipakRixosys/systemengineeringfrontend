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
import { setTitle, removeItemFromArray, programLifecycleRoute, swalConfirmationPopup, modal, renderBadge } from "helpers/common";
// Network Helpers
import { httpGet, apify, httpPost } from 'helpers/network';
// Next Phase Not Allowed UI 
import NextPhaseNotAllowed from 'components/program/NextPhaseNotAllowed';
import BasicTooltip from 'components/ui/tooltips/BasicTooltip';
// jQuery
const jQuery = window.jQuery;
// Lodash
const lodash = window._;

// Asset Identification
class AssetIdentification extends React.Component {
  //
  state = {
    loading: true,
    programUuid: undefined,
    program: undefined,
    assets: {},
    assetItemList: [],
    activeAssetItem: {
      nodeType: undefined,
      nodeRefId: undefined,
      showSubCategory: false,
      subCategories: [],
      subCategoryValue: {},
      property: {},
    },
    allowFormSubmit: false,
  };

  //
  assetItemList = (items) => {
    var componentLists = [];
    var functionLists = [];
    var channelLists = [];
    var diagramLists = [];

    let assetKeys = ['Components', 'Functions', 'Channels', 'Diagrams'];

    assetKeys.forEach(assetKey => {
      if (items[assetKey]) {
        items[assetKey].map(item => {
          //
          var subCategories = [];

          //
          for (let key in item['Asset-Items']) {
            var subCategory = item['Asset-Items'][key];

            if (!subCategory['Identified']) {
              //
              subCategories.push({
                label: key,
                value: subCategory['RefId'],
                name: subCategory['Name'],
                property: subCategory,
              })

            }
          }

          //
          let obj = {
            label: item['Title'] ?? item['Name'],
            value: item['RefId'],
            nodeType: item['Type'],
            name: item['Name'],
            showSubCategory: true,
            subCategories: subCategories,
          };

          if (subCategories.length > 0) {


            //
            if (assetKey === 'Components')
              componentLists.push(obj);

            if (assetKey === 'Functions')
              functionLists.push(obj);

            if (assetKey === 'Channels')
              channelLists.push(obj);

            if (assetKey === 'Diagrams')
              diagramLists.push(obj);

          }

          return null;
        });
      }
    });

    //
    return [
      {
        label: "Components",
        options: componentLists,
      },
      {
        label: "Functions",
        options: functionLists,
      },
      {
        label: "Channels",
        options: channelLists,
      },
      {
        label: "Diagrams",
        options: diagramLists,
      },
    ];
  }

  //
  onChangeAssetBaseItem = (ev) => {
    this.setState({
      activeAssetItem: {
        nodeType: ev['nodeType'],
        nodeRefId: ev['value'],
        showSubCategory: ev['showSubCategory'],
        subCategories: ev['subCategories'],
        property: {},
        subCategoryValue: {},
      },
      currentItem: ev
    }, () => {

    });
  }

  //
  onChangeAssetSubItem = (ev) => {
    //
    var activeAssetItem = this.state.activeAssetItem;

    //
    activeAssetItem['property'] = ev['property'];
    activeAssetItem['subCategoryValue'] = {
      label: ev['label'],
      value: ev['value'],
    };

    //
    activeAssetItem['property']['Init'] = true;

    //
    let cyberSecurityProperties = activeAssetItem['property']['Cyber-Security-Properties'];
    cyberSecurityProperties.forEach(securityProperty => {
      let securityPropertyKey = `Cyber-Security-Property-${securityProperty}`;
      activeAssetItem['property'][securityPropertyKey] = true;
    });


    //
    this.setState({
      activeAssetItem: activeAssetItem,
    }, () => {
      //
      if (activeAssetItem) {

        if ((activeAssetItem['property']['Cyber-Security-Functional-Safety']['Safety']) !== undefined ||
          (activeAssetItem['property']['Cyber-Security-Functional-Safety']['Security']) !== undefined) {

          this.setState({
            allowFormSubmit: true
          })
        }

        //
        jQuery('.jquery-input-fields').each(function (idx, self) {
          let parameterKey = jQuery(self).attr('data-key');
          if (parameterKey && activeAssetItem['property'][parameterKey]) {
            jQuery(self).val(activeAssetItem['property'][parameterKey]['Value']);
          }
        });

        //
        jQuery('.cyber-security-functional-safety-select').each(function (idx, self) {
          let parameterKey = jQuery(self).attr('data-key');

          if (parameterKey) {
            if ((activeAssetItem['property']['Cyber-Security-Functional-Safety'][parameterKey]) !== undefined) {
              let value = (activeAssetItem['property']['Cyber-Security-Functional-Safety'][parameterKey] === true) ? 'Yes' : 'No';
              jQuery(self).val(value);
            }
          }

        });
      }

      //
      this.refreshjQuerySelect();
    });
  }

  //
  setCyberSecurityProperty = (ev, securityProperty) => {
    let checked = ev.target.checked;
    let cyberSecurityProperties = this.state.activeAssetItem['property']['Cyber-Security-Properties'];

    if (checked) {
      cyberSecurityProperties.push(securityProperty);
    }

    else {
      cyberSecurityProperties = removeItemFromArray(cyberSecurityProperties, securityProperty);
    }

    cyberSecurityProperties = lodash.uniq(cyberSecurityProperties);

    let activeAssetItem = this.state.activeAssetItem;
    activeAssetItem['property']['Cyber-Security-Properties'] = cyberSecurityProperties;

    let securityPropertyKey = `Cyber-Security-Property-${securityProperty}`;
    activeAssetItem['property'][securityPropertyKey] = checked;

    this.setState({
      activeAssetItem: activeAssetItem,
    }, () => {

    });
  }

  // [Action] Identify Asset Item
  identifyAssetItem = () => {
    var vm = this;

    if (!vm.state.activeAssetItem['nodeType']) {
      alert("Please select item from dropdown.");
      return;
    }

    if (!vm.state.activeAssetItem['property']['Init']) {
      alert("Please select relevent-item from dropdown.");
      return;
    }

    // [Ajax] Save it to server
    httpPost(apify('app/program/asset-update'), {
      programUuid: vm.state.programUuid,
      nodeType: vm.state.activeAssetItem['nodeType'],
      nodeRefId: vm.state.activeAssetItem['nodeRefId'],
      internalRefId: vm.state.activeAssetItem['subCategoryValue']['value'],
      internalType: vm.state.activeAssetItem['subCategoryValue']['label'],
      parameter: vm.state.activeAssetItem['property'],
    }).then(res => {
      // [Action] Reload page after asset identification
      if (res['success']) {
        window.location.reload(false);
      }
    });
  }

  //
  allowThreatAnalysisPhase = () => {
    return (this.state.assets['Identification']['Remaining-Assets'] === 0 && this.state.assets['Identification']['Can-Promote-Risk-Analysis']);
  }

  //
  moveThreatAnalysisPhase = () => {
    let phaseRoute = programLifecycleRoute('Threat-Analysis', this.state.programUuid);
    this.props.history.push({
      pathname: phaseRoute,
    });
  }

  //
  backToPhase = () => {
    let phaseRoute = programLifecycleRoute('Item-Definition', this.state.programUuid);
    this.props.history.push({
      pathname: phaseRoute,
    });
  }

  //
  refreshjQuerySelect = () => {
    jQuery('.select').selectpicker('refresh');
  }

  //
  onChangeAssetDescription = (ev) => {
    var activeAssetItem = this.state.activeAssetItem;
    activeAssetItem['property']['Description'] = ev.target.value;
    this.setState({
      activeAssetItem: activeAssetItem,
    }, () => {

    });
  }

  //
  assetRemoveFromIdentificationArray(internalRefId) {
    //
    var vm = this;
    //
    swalConfirmationPopup({
      title: "Warning!",
      text: "This action will reset the asset metadata.",
      confirmButtonText: "Re-configure"
    }, () => {
      vm.setState({
        loading: true
      }, () => {

        // Remove asset metadata
        let params = {
          programUuid: vm.state.programUuid,
          internalRefId: internalRefId,
          action: 'Remove-From-Identification-Array',
        };
        httpPost(apify('app/program/asset-remove-from-identification'), params).then((data) => {
          //
          // window.location.reload();

          let assetItemList = this.assetItemList(data['assets']);
          let currentItem = null;
          let activeAssetItem = null;
          let assetItemListArray = [];


          Object.values(assetItemList).map(asset => {

            asset['options'].map(array => {
              if ((array.name === data['assetdata']['Name'])) {
                currentItem = array

                let subCategoryValue = currentItem['subCategories'] && currentItem['subCategories'].length > 0 && currentItem['subCategories'][0]


                // subCategoryValue= 
                activeAssetItem = {
                  nodeType: currentItem['nodeType'],
                  nodeRefId: currentItem['value'],
                  showSubCategory: currentItem['showSubCategory'],
                  subCategories: currentItem['subCategories'],
                  property: {
                    'Cyber-Security-Functional-Safety': data['assetdata']['Cyber-Security-Functional-Safety'],
                    'Cyber-Security-Properties': data['assetdata']['Cyber-Security-Properties'],
                    'Security-Objective': data['assetdata']['Security-Objective']['value'],
                    'Damage-Scenario': data['assetdata']['Damage-Scenario']['value'],
                    'Damage-Scenario-Comments': data['assetdata']['Damage-Scenario-Comments']['value'],
                  },
                  subCategoryValue: subCategoryValue,
                }

                if (subCategoryValue.length > 0) {
                  assetItemListArray.push(currentItem)
                }
              }

              return null
            })

            return null

          })

          vm.setState({
            loading: false,
            assets: data['assets'],
            assetItemList: assetItemListArray,
            configAsset: data['assetdata'],
            currentItem: currentItem,
            activeAssetItem: activeAssetItem,
            allowFormSubmit: true
          }, () => {
            this.onChangeAssetSubItem(this.state.activeAssetItem.subCategoryValue)
          })
        });

      });
    });
  }

  //
  assetViewFromIdentificationArray(item) {

    let fetched = false;


    let assets = this.state.assets

    if (!fetched) {
      Object.keys(assets).map((nodeType) => {
        if (nodeType !== 'Identification') {
          let items = assets[nodeType]

          items.map((node, idx) => {

            Object.keys(node['Asset-Items']).map((internalType) => {
              if (node['Asset-Items'][internalType]['RefId'] === item['RefId']) {
                item['parent'] = node
                fetched = true
              }
              return true
            })

            return true
          })
        }
        return true
      })
    }

    this.setState({
      currentAssetView: item,
    }, () => {
      modal('#Modal-Show-Details', {
        show: true,
      })
    })


  }

  //
  onChangeCyberSecurityFunctionalOptions = (ev, functionKey) => {
    let vm = this;
    let activeAssetItem = vm.state.activeAssetItem;
    let value = ev['value'];

    if (functionKey && activeAssetItem && activeAssetItem['property'] && activeAssetItem['property']['Cyber-Security-Functional-Safety']) {
      activeAssetItem['property']['Cyber-Security-Functional-Safety'][functionKey] = (value === 'Yes');
      vm.setState({
        activeAssetItem: activeAssetItem
      }, () => {
        vm.mockInputFields();
      });
    }
  }

  //
  mockInputFields = () => {
    jQuery('.jquery-input-fields').each((id, self) => {
      let dataKey = jQuery(self).attr('data-key');
      jQuery(self).val(`${this.state.activeAssetItem['property']['Name']}-${dataKey}`);
      jQuery(self).trigger('keyup');

      this.setState({
        allowFormSubmit: true
      });
    });
  }

  //
  assetConfigureFromIdentificationArray(internalRefId) {

  }

  // [Constructor]
  componentDidMount() {
    // Page title
    setTitle("Asset Identification");

    // Program UUID
    let { programUuid } = this.props['match']['params'];

    this.setState({
      programUuid: programUuid,
      allowNextPhase: false,
    });

    // Fetch program
    var vm = this;
    httpGet(apify(`app/program/?programUuid=${programUuid}`)).then(res => {
      let assetItemList = this.assetItemList(res['program']['assets']);

      vm.setState({
        loading: false,
        program: res['program'],
        assets: res['program']['assets'],
        assetItemList: assetItemList,
        allowNextPhase: (res['program']['assets']['Identification']['Total-Assets'] > 0)
      }, () => {


      });

    }).catch(() => {
      vm.setState({
        loading: false,
        program: null,
      }, () => {

      });
    });

    // Safety Related Options
    let safetyRelatedOptions = [
      { label: "Yes", value: "Yes" },
      { label: "No", value: "No" },
    ];

    vm.setState({
      safetyRelatedOptions: safetyRelatedOptions
    });

    // Input property filler
    jQuery('body').on('keyup', '.jquery-input-fields', function () {
      let value = jQuery(this).val();
      let parameterKey = jQuery(this).attr('data-key');

      let activeAssetItem = vm.state.activeAssetItem;
      if (activeAssetItem['property'][parameterKey] !== undefined) {
        activeAssetItem['property'][parameterKey]['Value'] = value;
      }
      vm.setState({
        activeAssetItem: activeAssetItem
      }, () => {

      });

    });

    // Configure existing asset
    jQuery('body').on('click', '.identified-asset-configure-button', function (ev) {
      ev.preventDefault();

      let refId = jQuery(this).attr('data-ref-id');
      vm.assetRemoveFromIdentificationArray(refId);
      // vm.assetConfigureFromIdentificationArray(refId);

    });
  }

  // [UI]
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
                
                {
                  !this.state.allowNextPhase && 
                  this.state.program &&
                  <NextPhaseNotAllowed 
                    program={this.state.program} 
                    title="Asset Identification"
                    errorMessage="No System Elements found, Please configure the Item Definition in order to proceed to Asset Identification."
                    backButtonCtx={
                      <Link to={programLifecycleRoute('Item-Definition', this.state.program['uuid'])} className="btn btn-primary text-white">
                        <i className="fa fa-arrow-left mr-2"></i>
                        Configure Item Definition
                      </Link>
                    }
                  />
                }
              </div>
            </div>

            {
              this.state.allowNextPhase && 
              !this.state.loading &&
              <div>
                {
                  this.state.program &&
                  <div className="row">
                    {/* Asset Identification */}
                    <div className="col-12 col-md-12">

                      {
                        (!this.allowThreatAnalysisPhase()) &&
                        <div className="card">
                          <div className="card-header">
                            <h3>Asset Identification</h3>
                            <small>Program</small> <br />
                            <Link to={programLifecycleRoute('VIEW', this.state.program['uuid'])}>
                              {this.state.program['name']}
                            </Link>
                          </div>
                          <div className="card-body">

                            <div className="row">
                              <div className="col-2">
                                Select Item
                              </div>
                              <div className="col-6">
                                <Select
                                  options={this.state.assetItemList}
                                  menuPortalTarget={document.body}
                                  onChange={(ev) => this.onChangeAssetBaseItem(ev)}
                                  styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                  value={this.state.currentItem}
                                />
                              </div>
                              <div className="col-1">
                                {
                                  this.state.activeAssetItem['nodeType'] &&
                                  <span>Type</span>
                                }
                              </div>
                              <div className="col-3">
                                {
                                  this.state.activeAssetItem['nodeType'] &&
                                  <span className="input-readonly">{this.state.activeAssetItem['nodeType']}</span>
                                }
                              </div>
                            </div>

                            {
                              this.state.activeAssetItem['showSubCategory'] &&
                              <div className="row my-3">
                                <div className="col-2">
                                  Sub-category
                                </div>
                                <div className="col-6">
                                  <Select
                                    options={this.state.activeAssetItem['subCategories']}
                                    menuPortalTarget={document.body}
                                    value={this.state.activeAssetItem['subCategoryValue']}
                                    onChange={(ev) => this.onChangeAssetSubItem(ev)}
                                    styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                  />
                                </div>
                                <div className="col-1">
                                  {
                                    this.state.activeAssetItem['property']['Name'] &&
                                    <span>Name</span>
                                  }
                                </div>
                                <div className="col-3">
                                  {
                                    this.state.activeAssetItem['property']['Name'] &&
                                    <span className="input-readonly">{this.state.activeAssetItem['property']['Name']}</span>
                                  }
                                </div>
                              </div>
                            }

                            {
                              (this.state.activeAssetItem['property']['Init'] !== undefined) &&
                              <div className="mt-4">
                                <div className="row my-3">
                                  <div className="col-2">
                                    Description
                                  </div>
                                  <div className="col-10">
                                    {/* <input type="text" className="form-control md-form-control" placeholder="Provide Description" value={this.state.activeAssetItem['property']['Description'] ?? this.state.activeAssetItem['property']['Name']} onChange={(ev) => this.onChangeAssetDescription(ev)} /> */}
                                    <span className="input-readonly">{this.state.activeAssetItem['property']['Description'] ?? this.state.activeAssetItem['property']['Name']}</span>                                  </div>
                                </div>

                                <div className="row my-3">
                                  <div className="col-12">
                                    <hr />
                                  </div>
                                </div>

                                <div className="row my-3">
                                  <div className="col-12 mb-3 highlight-label">
                                    Cyber Security Functional Safety
                                  </div>

                                  {/* Safety related Options */}
                                  <div className="col-2">
                                    Safety related 
                                    <BasicTooltip />
                                  </div>
                                  <div className="col-2">
                                    <Select
                                      options={this.state.safetyRelatedOptions}
                                      menuPortalTarget={document.body}
                                      onChange={(ev) => this.onChangeCyberSecurityFunctionalOptions(ev, 'Safety')}
                                      styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                      value={this.state.activeAssetItem['property']['Cyber-Security-Functional-Safety']['Safety'] ? { label: "Yes", value: "Yes" } : { label: "No", value: "No" }}
                                    />
                                  </div>

                                  <div className="col-2">

                                  </div>

                                  {/* Security related Options */}
                                  <div className="col-2">
                                    Security related
                                  </div>
                                  <div className="col-2">
                                    <Select
                                      options={this.state.safetyRelatedOptions}
                                      menuPortalTarget={document.body}
                                      onChange={(ev) => this.onChangeCyberSecurityFunctionalOptions(ev, 'Security')}
                                      styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                      value={this.state.activeAssetItem['property']['Cyber-Security-Functional-Safety']['Security'] !== undefined && (this.state.activeAssetItem['property']['Cyber-Security-Functional-Safety']['Security'] ? { label: "Yes", value: "Yes" } : { label: "No", value: "No" })}

                                    />
                                  </div>
                                </div>

                                <div className="row my-3">
                                  <div className="col-12">
                                    <hr />
                                  </div>
                                </div>

                                <div className="row my-3">
                                  <div className="col-12 mb-2 highlight-label">
                                    Cyber Security Properties
                                  </div>

                                  <div className="col-2 has-checkbox">
                                    <label>Confidentiality</label>
                                    <input type="checkbox" value={this.state.activeAssetItem['property']['Cyber-Security-Property-Confidentiality'] ?? false} defaultChecked={this.state.activeAssetItem['property']['Cyber-Security-Property-Confidentiality']} onChange={(ev) => this.setCyberSecurityProperty(ev, 'Confidentiality')} />
                                  </div>

                                  <div className="col-2 has-checkbox">
                                    <label>Integrity</label>
                                    <input type="checkbox" value={this.state.activeAssetItem['property']['Cyber-Security-Property-Integrity'] ?? false} defaultChecked={this.state.activeAssetItem['property']['Cyber-Security-Property-Integrity']} onChange={(ev) => this.setCyberSecurityProperty(ev, 'Integrity')} />
                                  </div>

                                  <div className="col-2 has-checkbox">
                                    <label>Availability</label>
                                    <input type="checkbox" value={this.state.activeAssetItem['property']['Cyber-Security-Property-Availability'] ?? false} defaultChecked={this.state.activeAssetItem['property']['Cyber-Security-Property-Availability']} onChange={(ev) => this.setCyberSecurityProperty(ev, 'Availability')} />
                                  </div>

                                  <div className="col-2 has-checkbox">
                                    <label>Authencity</label>
                                    <input type="checkbox" value={this.state.activeAssetItem['property']['Cyber-Security-Property-Authencity'] ?? false} defaultChecked={this.state.activeAssetItem['property']['Cyber-Security-Property-Authencity']} onChange={(ev) => this.setCyberSecurityProperty(ev, 'Authencity')} />
                                  </div>

                                  <div className="col-2 has-checkbox">
                                    <label>Governance</label>
                                    <input type="checkbox" value={this.state.activeAssetItem['property']['Cyber-Security-Property-Governance'] ?? false} defaultChecked={this.state.activeAssetItem['property']['Cyber-Security-Property-Governance']} onChange={(ev) => this.setCyberSecurityProperty(ev, 'Governance')} />
                                  </div>
                                </div>

                                <div className="row my-3">
                                  <div className="col-12">
                                    <hr />
                                  </div>
                                </div>

                                <div className="row my-3">
                                  <div className="col-2">
                                    Security Objective
                                  </div>
                                  <div className="col-10">
                                    <input type="text" defaultValue={this.state.activeAssetItem['property']['Security-Objective']} className="form-control md-form-control jquery-input-fields" placeholder="Security Objective" data-key="Security-Objective" />
                                  </div>
                                </div>

                                <div className="row my-3">
                                  <div className="col-2">
                                    Damage Scenario
                                  </div>
                                  <div className="col-10">
                                    <input type="text" defaultValue={this.state.activeAssetItem['property']['Damage-Scenario']} className="form-control md-form-control jquery-input-fields" placeholder="Description of Damage Scenario" data-key="Damage-Scenario" />
                                  </div>
                                </div>

                                <div className="row my-3">
                                  <div className="col-2">
                                    Comments
                                  </div>
                                  <div className="col-10">
                                    <input type="text" defaultValue={this.state.activeAssetItem['property']['Damage-Scenario-Comments']} className="form-control md-form-control jquery-input-fields" placeholder="Comments" data-key="Damage-Scenario-Comments" />
                                  </div>
                                </div>
                              </div>
                            }

                          </div>
                          <div className="card-footer">
                            <button type="button" className="btn btn-success btn-lg" onClick={(ev) => this.identifyAssetItem(ev)} disabled={!this.state.allowFormSubmit}>
                              <i className="fa fa-check mr-2"></i>
                              Mark as Identified
                            </button>
                          </div>
                        </div>
                      }

                      {
                        ((this.allowThreatAnalysisPhase())) &&
                        <div className="card">
                          <div className="card-header">
                            <h3>Asset Identification</h3>
                            <small>Program</small> <br />
                            <Link to={programLifecycleRoute('VIEW', this.state.program['uuid'])}>
                              {this.state.program['name']}
                            </Link>
                          </div>
                          <div className="card-body">
                            <div className="row">
                              <div className="col-12">
                                All asset items have been identified, you may
                                proceed to <b>Threat Analysis.</b>
                              </div>
                            </div>
                          </div>
                          <div className="card-footer">
                            <button type="button" className="btn btn-success" onClick={this.backToPhase} disabled={!this.allowThreatAnalysisPhase()}>
                              <i className="fa fa-arrow-left mr-2"></i>
                              Back to <b>Item Defination</b>
                            </button>

                            <button type="button" className="btn btn-success float-right" onClick={this.moveThreatAnalysisPhase} disabled={!this.allowThreatAnalysisPhase()}>
                              Procced to <b>Threat Analysis</b>
                              <i className="fa fa-arrow-right ml-2"></i>
                            </button>
                          </div>
                        </div>
                      }

                    </div>

                    {/* Identified Assets */}
                    <div className="col-12 col-md-12 mt-5">
                      <div className="card">
                        <div className="card-header">
                          <h3 className="card-title">Identified Assets</h3>
                          <small>These are the indetified assets for your program.</small>
                        </div>
                        <div className="card-body p-0">
                          <table className="table table-bordered">
                            <thead>
                              <tr>
                                <th className="text-left">Asset</th>
                                <th className="text-left">Security</th>
                                <th className="text-left">
                                  Safety
                                  <BasicTooltip />
                                </th>
                                <th></th>
                              </tr>
                            </thead>
                            <tbody>
                              {
                                this.state.assets['Identification']['Items'].map(item => {
                                  return (
                                    <tr key={item['RefId']}>
                                      <td>{item['Name']}</td>
                                      <td dangerouslySetInnerHTML={{__html: renderBadge(item['Cyber-Security-Functional-Safety']['Security'], "True", "False")}}></td>
                                      <td dangerouslySetInnerHTML={{__html: renderBadge(item['Cyber-Security-Functional-Safety']['Safety'], "True", "False")}}></td>
                                      <td className="text-right">
                                        {
                                          (this.state.program['status'] !== 'APPROVED' && this.state.program['status'] !== 'UNDER-REVIEW') &&
                                          <a href="#!" className="identified-asset-configure-button" data-ref-id={item['RefId']}>
                                            <i className="fa fa-gear mr-1"></i>
                                            Re-configure
                                          </a>
                                        }

                                        {
                                          (this.state.program['status'] === 'APPROVED' || this.state.program['status'] === 'UNDER-REVIEW') && 
                                          <a href="#!" onClick={() => this.assetViewFromIdentificationArray(item)}>
                                            <i className="fa fa-eye mr-1"></i>
                                            View
                                          </a>
                                        }
                                      </td>
                                    </tr>
                                  )
                                })
                              }
                              {
                                (this.state.assets['Identification']['Items'].length === 0) &&
                                <tr className="text-center">
                                  <td colSpan="2">No items identified.</td>
                                </tr>
                              }
                            </tbody>
                          </table>

                          {
                            (this.state.program['status'] !== 'APPROVED' && this.state.program['status'] !== 'UNDER-REVIEW') && 
                            (this.state.assets['Identification']['Remaining-Assets'] > 0) &&
                            <div className="alert alert-info m-2">
                              <h4 className="alert-title">Remaining Asset Identification</h4>
                              {this.state.assets['Identification']['Remaining-Assets']} of {this.state.assets['Identification']['Total-Assets']} items needs to be configured.
                            </div>
                          }

                          {
                            (this.state.program['status'] !== 'APPROVED' && this.state.program['status'] !== 'UNDER-REVIEW') &&
                            (this.state.assets['Identification']['Remaining-Assets'] === 0) &&
                            (this.state.assets['Identification']['Can-Promote-Risk-Analysis'] === false) &&
                            <div className="alert alert-danger m-2">
                              <h4 className="alert-title">Warning</h4>
                              Since no Assets have a damage scenario associated hence are not Security related, there is no further need to proceed to perform a Threat Analysis. 
                              Kindly go back to programe and/or reconfigure the options.
                            </div>
                          }

                          <div className="m-2">
                            <button type="button" className="btn btn-success btn-lg btn-block" onClick={this.moveThreatAnalysisPhase} disabled={!this.allowThreatAnalysisPhase()}>
                              Procced to <b>Threat Analysis</b>
                            </button>
                          </div>

                        </div>
                      </div>
                    </div>

                    <div className="modal fade" id="Modal-Show-Details" tabIndex="-1" data-backdrop="static">
                      <div className="modal-dialog modal-full-width">

                        <div className="modal-content">
                          <div className="modal-header">
                            <h4 className="modal-title text-primary">
                              Asset Indentification
                            </h4>
                            <button type="button" className="close" data-dismiss="modal">
                              <span>&times;</span>
                            </button>
                          </div>
                          <div className="modal-body widget-modal-body">
                            {this.state.currentAssetView && <table className="table table-bordered">
                              <thead>
                                <tr>
                                  <th>Label</th>
                                  <th>Value</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr>
                                  <td>Node Type</td>
                                  <td>{this.state.currentAssetView['parent'] && this.state.currentAssetView['parent']['Type']}</td>
                                </tr>
                                <tr>
                                  <td>Node Name</td>
                                  <td>{this.state.currentAssetView['parent'] && this.state.currentAssetView['parent']['Name']}</td>
                                </tr>
                                <tr>
                                  <td>Node Title</td>
                                  <td>{this.state.currentAssetView['parent'] && this.state.currentAssetView['parent']['Title']}</td>
                                </tr>
                                <tr>
                                  <td>Name</td>
                                  <td>{this.state.currentAssetView['Name']}</td>
                                </tr>
                                <tr>
                                  <td>Description</td>
                                  <td>{this.state.currentAssetView['Description']}</td>
                                </tr>
                                <tr>
                                  <td>Cyber Security Properties</td>
                                  <td>{this.state.currentAssetView['Cyber-Security-Properties'] && this.state.currentAssetView['Cyber-Security-Properties'].map((data, index) => {
                                    return <span> {index !== 0 && ', '} {data} </span>
                                  })}</td>
                                </tr>
                                <tr>
                                  <td>Safety related</td>
                                  <td>{this.state.currentAssetView['Cyber-Security-Functional-Safety'] && this.state.currentAssetView['Cyber-Security-Functional-Safety']['Safety'] ? <span className="badge badge-success">True</span> : <span className="badge badge-danger">False</span>}</td>
                                </tr>
                                <tr>
                                  <td>Security related</td>
                                  <td>{this.state.currentAssetView['Cyber-Security-Functional-Security'] && this.state.currentAssetView['Cyber-Security-Functional-Security']['Safety'] ? <span className="badge badge-success">True</span> : <span className="badge badge-danger">False</span>}</td>
                                </tr>
                                <tr>
                                  <td>Security Objective</td>
                                  <td>{this.state.currentAssetView['Security-Objective'] && this.state.currentAssetView['Security-Objective']['Value']}</td>
                                </tr>
                                <tr>
                                  <td>Damage Scenario</td>
                                  <td>{this.state.currentAssetView['Damage-Scenario'] && this.state.currentAssetView['Damage-Scenario']['Value']}</td>
                                </tr>
                                <tr>
                                  <td>Comments</td>
                                  <td>{this.state.currentAssetView['Damage-Scenario-Comments'] && this.state.currentAssetView['Damage-Scenario-Comments']['Value']}</td>
                                </tr>
                              </tbody>
                            </table>}

                            <div className="row">
                              <div className="col-6">
                              </div>
                            </div>

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

// Asset Identification
export default withRouter(AssetIdentification);