// React
import React from 'react';
// React Router
import { Link } from 'react-router-dom';
// Layouts
import DashboardLayout from "screens/Layouts/DashboardLayout";
// Helpers
import { setTitle, modal, resetModalFormValidations, swalPopup, programLifecycleRoute, getUniqueListBy } from "helpers/common";
// Sidebars
import ImportItemsSidebar from "components/sidebars/ImportItems";
// React-Diagrams (Engine)
import createEngine, { DefaultNodeModel, DiagramModel } from '@projectstorm/react-diagrams';
// React-Diagrams (Canvas)
import { CanvasWidget } from '@projectstorm/react-canvas-core';
// Custom Factory (React-Diagrams)
import { HtmlLabelFactory } from "custom/HtmlLabel/HtmlLabelFactory";
// Custom Label (React-Diagrams)
import { HtmlLabelModel } from "custom/HtmlLabel/HtmlLabelModel";
// Events
import { listenAddNodeEvent, listenConfigureChannelEvent, listenAddFunctionEvent, listenAddDiagramEvent } from "helpers/events";
// Store
import { autoKeyStore, addAutoKeyStore, getAutoKeyStore } from "helpers/store";
// Properties
import { getNodeProperties, getFunctionProperties, getDiagramProperties } from "helpers/properties";
// Helpers
import { apify, httpPost, apiBaseUrl, httpFile } from "helpers/network";
// Program
import Program from 'models/Program';
// Loader
import PlaceholderLoader from 'components/ui/placeholder-loader/placeholder-loader';
// Modals for Item Definition
import ModalAddComponent from 'components/modals/ItemDefinition/AddComponent';
import ModalAddChannel from 'components/modals/ItemDefinition/AddChannel';
import ModalAddDiagram from 'components/modals/ItemDefinition/AddDiagram';
import ModalAddFunction from 'components/modals/ItemDefinition/AddFunction';
// jQuery
const jQuery = window.jQuery;

// Item Definition Object
window.ItemDefinition = {
  'INTERNAL': {
    'COMPONENTS': {},
    'FUNCTIONS': {},
    'DIAGRAMS': {},
    'CHANNELS': {},
  },
  'MODEL_JSON': {},
  'KEYSTORE': {},
};

// Position vector for components & functions
var positionVector = {
  x: 150,
  y: 90,
  offsetX: 0,
  offsetY: 0,
};

//Item Definition
class ItemDefinition extends React.Component {
  // State
  state = {
    loading: true,

    allowImportDesign: false,
    allowInfoPicture: true,

    program: undefined,
    programObject: undefined,

    engineReady: false,
    engine: undefined,
    model: undefined,

    systemComponents: [],
    systemFunctions: [],
  }

  // Register engine for Item definition
  async registerEngine() {
    var vm = this;

    // Diagram-Engine ref.
    var engine = createEngine();

    // Diagram-Model ref.
    var model = new DiagramModel();

    // Register custom factory (LabelFactory)
    engine.getLabelFactories().registerFactory(new HtmlLabelFactory());

    // Register custom node (NodeFactory)
    // engine.getNodeFactories().registerFactory(new HtmlNodeFactory());

    // Setup model events
    model.registerListener({
      //
      gridUpdated: function () {
        vm.hideDrawingDropdownMenu();
      },

      //
      nodesUpdated: function () {
        vm.hideDrawingDropdownMenu();
      },

      //
      zoomUpdated: function (e) {
        positionVector['zoom'] = e['zoom'];
        vm.hideDrawingDropdownMenu();
      },

      // When canvas is dragged/moved
      offsetUpdated: function (e) {
        positionVector['offsetX'] = e['offsetX'];
        positionVector['offsetY'] = e['offsetY'];
        vm.hideDrawingDropdownMenu();
      },

      // When new link added/updated in canvas
      linksUpdated: function (e) {
        // Limk has active Source-Port
        if (e.link.sourcePort) {
          // Get ref. (system generated-client end)
          let linkId = e.link['options']['id'];

          //
          window.ItemDefinition['INTERNAL']['CHANNELS'][linkId] = {
            'Property': null,
            'From': {},
            'To': {},
          };

          // Add Configure-Button for channel configuration
          // [ Don't change it to className ]
          e.link.addLabel(
            new HtmlLabelModel({
              value: `Configure`,
              link: e.link,
              html: `<button class="btn btn-info btn-sm configure-link" data-link=${linkId}>Configure</button>`,
            })
          );
          //
        }

        // Hide dropdown
        vm.hideDrawingDropdownMenu();
      },
    });

    // Set model into canvas engine
    engine.setModel(model);

    this.setState({
      engine: engine,
      model: model,
    })
  }

  // Apply Context-menu
  applyContextMenu() {
    // Right click
    jQuery('.item-definition-drawing').contextmenu(function (ev) {
      var top = ev.pageY - 150;
      var left = ev.pageX;

      // Show menu dropdown
      jQuery('.item-definition-drawing-dropdown-menu').css({
        'display': 'block',
        'top': `${top}px`,
        'left': `${left}px`,
      });

      // Prevent default/system right click
      return false;
    });

    jQuery('.item-definition-info-box-picture').contextmenu(function (ev) {
      return false;
    });

    // No scroll
    jQuery('.item-definition-drawing').scroll(function () {
      return false;
    });
  }

  // Configure/update settings gear for Node
  addNodeSettingsGearEvent() {
    var vm = this;

    // When gear button clicked
    jQuery('body').on('click', '.item-definition-node-settings-gear-btn', function () {

      // Get Node Properties for reconfigure
      let nodeType = jQuery(this).attr('data-node-type');
      var nodeId, node, nodeProperty;

      let assetItems = vm.state.assetItems

      // Disallow Backspace - removes nodes if pressed backspace by mistake
      vm.state.model.setLocked(true);

      // Get node property from Key-Store
      nodeId = jQuery(this).attr('data-node-id');
      node = getAutoKeyStore(nodeId);

      // NodeType
      switch (nodeType) {
        // Component-Node
        case 'COMPONENT':
          // Fetch Node Property (Component)
          nodeProperty = getNodeProperties(node, assetItems);
          window.NodeProperty = nodeProperty;

          // Open configure dialog
          vm.addComponentDialog();
          return true;

        // Function-Node
        case 'FUNCTION':
          // Fetch Node Property (Function)
          nodeProperty = getFunctionProperties(node);
          window.FunctionProperty = nodeProperty;

          // Open configure dialog
          vm.addFunctionDialog();
          return true;

        // Diagram-Node 
        case 'DIAGRAM':
          // Fetch Node Property (Diagram)
          nodeProperty = getDiagramProperties(node);
          window.DiagramProperty = nodeProperty;

          // Open configure dialog
          vm.addDiagramDialog();
          return true;

        default:
          alert("Unknown NodeType.");
          return false;
      }
    });
  }

  // Channel-link configure event 
  addConfigureLinkEvent() {
    var vm = this;
    jQuery('body').on('click', '.configure-link', function () {
      // Set Link-Property 
      try {
        // // Set property for Configure-Modal
        let linkProperty = JSON.parse(jQuery(this).attr('data-link-property'));
        window.ChannelLinkProperty = linkProperty;
      } catch (error) {
        //
        console.log(error);

        // Possible reason that Target-Port is not assigned  
        alert("Please attach to component, can't configure orphan link line.");
        return;
      }

      // Hide dropdown
      vm.hideDrawingDropdownMenu();
      modal('#ModalAddChannel', 'show');

      // Reset form validation
      resetModalFormValidations({
        forms: ['#ConfigureChannelForm'],
        validators: ['validator'],
        resetFormControl: null,
      });

    });
  }

  // Inline Picture
  initInfoPictureGallery() {
    // Set picture as background
    let picture = jQuery('.item-definition-info-box-picture').attr('data-picture');
    jQuery('.item-definition-info-box-picture').css({
      'backgroundImage': `url(${picture})`,
    });
    

    // Open image-popup
    jQuery('body').on('click', '.item-definition-info-box-picture', function () {
      // When image-popup is already open
      if (jQuery(this).hasClass('info-box-picture-open')) {
        jQuery(this).unwrap();
        jQuery(this).removeClass('info-box-picture-open');
      }

      // [DON'T DO] : Keep it `class`, don't change it to `className` ]
      else {
        jQuery(this).wrap(`<div class='info-box-picture-open-overlay'></div>`);
        jQuery(this).addClass('info-box-picture-open');
      }
    });
  }

  // Listen to dialog events (add/update/remove) from open modals
  listenDialogEvents() {
    // New node addded into system
    listenAddNodeEvent(this.addNode);

    // New channel added
    listenConfigureChannelEvent(this.configureChannel);

    // New function added
    listenAddFunctionEvent(this.addNewFunction);

    // New diagram added
    listenAddDiagramEvent(this.addDiagram);
  }

  // Close drawing dropdown menu
  closeDrawingDropdownMenu() {
    this.hideDrawingDropdownMenu();
  }

  // Zoom-reset (fit) event
  engineButtonZoomFit() {
    this.state.engine.zoomToFit();
    return true;
  }

  // Item Definition Click Event
  saveItemDefinitionClickEvent() {
    let vm = this;
    // Save Item Definition
    jQuery('body').on('click', '#SaveItemDefinitionButton', function (ev) {
      ev.preventDefault();
      vm.saveItemDefinition();
    });
  }

  // Engine Helper & Contexts
  async forEngineHelperContext() {
    try {
      // Apply right-click
      this.applyContextMenu();
      // Node settings gear
      this.addNodeSettingsGearEvent();
      // Configure link event
      this.addConfigureLinkEvent();
      // Info picture gallery
      this.initInfoPictureGallery();
      // Dialog events (flow from dialogs)
      this.listenDialogEvents();
      // Save item definition click event
      this.saveItemDefinitionClickEvent();
      // Keystore
      autoKeyStore(window.ItemDefinition['KEYSTORE']);
    } catch (error) {
      // [TODO] Store locally & restore on boot-up if possible

      // [TODO] Possible solution to hard reload page

      // Alert
      alert("Something went wrong in setup of Item Definition Engine. error@forEngineHelperContext");
    }
  }

  // Hide node-setting gear
  hideNodeSettingsGearIcon() {
    // Hide gear
    jQuery('.item-definition-node-settings-gear').css({
      'margin-top': 0,
      'margin-left': 0,
      'display': 'none',
    });
  }

  // Hide dropdown menu
  hideDrawingDropdownMenu() {
    jQuery('.item-definition-drawing-dropdown-menu').css({
      'display': 'none',
    });
    this.hideNodeSettingsGearIcon();
  }

  // Add Component Dialog
  addComponentDialog() {
    this.hideDrawingDropdownMenu();
    modal('#ModalAddComponent', 'show');

    // Reset form elements when re-called
    resetModalFormValidations({
      forms: ['#UploadForm'],
      validators: ['validator'],
    });
  }

  // Add node into model/canvas
  addNode = (details) => {
    var vm = this;

    // Get node-property sent from modal
    let _node = details['node'];

    // Check for existing node
    let refId = _node['refId'];
    
    // Node
    var node = undefined;
    
    // If new node
    // Add-into system
    if (refId === undefined) {
      // New Node
      node = new DefaultNodeModel({
        name: _node['name'],
        color: 'rgb(139,195,74)',
      });
      // System-generated reference ID
      _node['refId'] = node['options']['id'];

      // Node position
      let x = _node['x'] ?? positionVector['x'];
      let y = _node['y'] ?? positionVector['y'];
      node.setPosition(x, y);

      // Input ports
      for (let port = 0; port < _node['inputPorts']; port++) {
        node.addInPort(`In#${port}`);
      }

      // Output ports
      for (let port = 0; port < _node['outputPorts']; port++) {
        node.addOutPort(`Out#${port}`);
      }
    }

    //
    else {
      // Update Node
      node = this.state.model.getNode(refId);
      //
      if (!node) {
        alert("Please reload this page, Internal-Diagram-Engine crashed.");
        console.error("Error while getting Node from Diagram-Engine.");
        return false;
      }
      node['options']['name'] = _node['name'];

      // Port-reconfig
      if ((Number(node['portsIn'].length) !== Number(_node['inputPorts'])) || (Number(node['portsOut'].length) !== Number(_node['outputPorts']))) {
        node['ports'] = [];
        node['portsIn'] = [];
        node['portsOut'] = [];

        // Input ports
        for (let port = 0; port < _node['inputPorts']; port++) {
          node.addInPort(`In#${port}`);
        }

        // Output ports
        for (let port = 0; port < _node['outputPorts']; port++) {
          node.addOutPort(`Out#${port}`);
        }
      }
    }

    // Node Selection Event
    // [TODO] Hide in drag-event
    node.registerListener({
      selectionChanged: function (e) {
        // When node is selected
        // Show Configure/Settings gear
        if (e['isSelected']) {
          // Display gear
          jQuery('.item-definition-node-settings-gear').css({
            'display': 'contents',
          });

          // Property
          jQuery('.item-definition-node-settings-gear-btn').attr('data-node-type', 'COMPONENT');
          jQuery('.item-definition-node-settings-gear-btn').attr('data-node-id', e['entity']['options']['id']);

        } 
        
        else {
          // Hide gear
          vm.hideNodeSettingsGearIcon();
        }
      }
    });

    node['node'] = _node;

    // Add channel data in Key-Store
    addAutoKeyStore(_node['refId'], {
      node: node
    });

    // Canvas painting
    vm.canvasRepaintWork({
      node: node
    });
  };

  // Add Function Dialog
  addFunctionDialog() {
    this.hideDrawingDropdownMenu();
    modal('#ModalAddFunction', 'show');
    resetModalFormValidations({
      forms: ['#AddFunctionForm'],
      validators: ['validator'],
      resetFormControl: null,
    });
  }

  // Add new function into canvas
  addNewFunction = (details) => {
    var vm = this;

    // Function Object
    let _node = details['function'];
    // Check for existing node
    let refId = _node['refId'];
    // Node-ref
    var node = undefined;

    // If no Function-Node exists
    if (refId === undefined) {
      // Add new Function-Node
      node = new DefaultNodeModel({
        name: _node['name'],
        color: 'rgb(150, 103, 1)',
      });

      // System-generated reference ID
      _node['refId'] = node['options']['id'];

      // Node position
      let x = _node['x'] ?? positionVector['x'];
      let y = _node['y'] ?? positionVector['y'];
      node.setPosition(x, y);

      // Input ports
      for (let port = 0; port < _node['inputPorts']; port++) {
        node.addInPort(`In#${port}`);
      }

      // Output ports
      for (let port = 0; port < _node['outputPorts']; port++) {
        node.addOutPort(`Out#${port}`);
      }
    }

    else {
      // If Function-Node already exists, update the name  
      node = this.state.model.getNode(refId);
      node['options']['name'] = _node['name'];
    }

    // Node Listener
    node.registerListener({
      selectionChanged: function (e) {
        // When node is selected
        // Show Configure/Settings gear
        if (e['isSelected']) {
          // Display gear
          jQuery('.item-definition-node-settings-gear').css({
            'display': 'contents',
          });

          // Function-Node
          jQuery('.item-definition-node-settings-gear-btn').attr('data-node-type', 'FUNCTION');
          jQuery('.item-definition-node-settings-gear-btn').attr('data-node-id', e['entity']['options']['id']);

        } else {

          // Hide gear
          vm.hideNodeSettingsGearIcon();

        }
      }
    });

    // Node-metadata
    node['node'] = _node;

    // Add function data in Key-Store
    addAutoKeyStore(_node['refId'], {
      node: node
    });

    // Canvas painting
    this.canvasRepaintWork({
      node: node
    });
  }

  // Add Diagram Dialog
  addDiagramDialog() {
    this.hideDrawingDropdownMenu();
    modal('#ModalAddDiagram', 'show');

    // 
    resetModalFormValidations({
      forms: ['#AddDiagramForm'],
      validators: ['validator'],
      resetFormControl: null,
    });
  }

  // Add diagram
  addDiagram = (details) => {
    //
    var vm = this;

    // Get node-property sent from modal
    let _node = details['diagram'];

    // Check for existing node
    let refId = _node['refId'];

    // DFD-ref
    var node = undefined;

    // If new Diagram-DFD, add into system
    if (refId === undefined) {
      // New Node
      node = new DefaultNodeModel({
        name: _node['name'],
        color: 'rgb(255, 0, 0)',
      });
      // System-generated reference ID
      _node['refId'] = node['options']['id'];

      // Node position
      let x = _node['x'] ?? positionVector['x'];
      let y = _node['y'] ?? positionVector['y'];
      node.setPosition(x, y);

      // Input ports
      for (let port = 0; port < _node['inputPorts']; port++) {
        node.addInPort(`In#${port}`);
      }

      // Output ports
      for (let port = 0; port < _node['outputPorts']; port++) {
        node.addOutPort(`Out#${port}`);
      }
    }

    else {
      // If Function-Node already exists, update the name  
      node = this.state.model.getNode(refId);
      node['options']['name'] = _node['name'];
    }

    // Node Listener
    node.registerListener({
      selectionChanged: function (e) {
        // When node is selected
        // Show Configure/Settings gear
        if (e['isSelected']) {
          // Display gear
          jQuery('.item-definition-node-settings-gear').css({
            'display': 'contents',
          });

          // Function-Node
          jQuery('.item-definition-node-settings-gear-btn').attr('data-node-type', 'DIAGRAM');
          jQuery('.item-definition-node-settings-gear-btn').attr('data-node-id', e['entity']['options']['id']);

        } else {

          // Hide gear
          vm.hideNodeSettingsGearIcon();

        }
      }
    });

    //
    node['node'] = _node;

    // Add channel data in Key-Store
    addAutoKeyStore(_node['refId'], {
      node: node
    });

    // Canvas painting
    this.canvasRepaintWork({
      node: node
    });
  }

  // Configure channel into canvas
  configureChannel = (details) => {
    //
    var vm = this;

    // From configure model
    let channel = details['channel'];
    let channelId = channel['refId'];

    // Add channel data in Key-Store
    addAutoKeyStore(channelId, {
      channel: channel
    });

    // Get channel ref. from model
    let refChannel = vm.state.model.getLink(channelId);

    // Label = Name (Dataflow)
    var label = undefined;

    // COMBAK: Sometime app is hanging here? 
    try {
      // If no active label generated for link
      if (refChannel['labelGenerated'] === undefined || (refChannel['labelGenerated'] !== undefined && !refChannel['labelGenerated'])) {
        // Label = Name (Dataflow)
        label = `${channel['name']} (${channel['dataflow']})`;
        refChannel.addLabel(label);
      }

      // In-case of existing label
      else {
        //
        try {
          // Update the DefaultLabel with Channel-Name
          if (refChannel['labels'][1] !== undefined) {
            // Label = Name (Dataflow)
            label = `${channel['name']} (${channel['dataflow']})`;
            refChannel['labels'][1]['options']['label'] = label;
          }
        } catch (error) {
          console.error("Issue while generating Dataflow-Label.");
          console.error(error);
        }
      }

      // For-first time label generation, mux.
      refChannel['labelGenerated'] = true;
      refChannel['channel'] = channel;
      //
    } catch (error) {
      console.error("Issue while fetching Existing-Label.");
      console.error(error);
    }

    //
    vm.canvasRepaintWork();

    vm.flatItemDefinition(channel);
  }

  // Canvas re-painting
  canvasRepaintWork = (object = null) => {
    // If object
    if (object) {
      // Add node if exists in Object
      let node = object['node'] ?? null;
      if (node) {
        this.state.model.addNode(node);
      }
    }

    // Repaint canvas
    this.state.engine.repaintCanvas();

    // Do after paint work
    this.afterRepaintWork(object);
  }

  // After re-painting
  afterRepaintWork = (object = null) => {
    // If something is added into canvas
    if (object) {
      // Increment next node position
      positionVector['x'] += 150;
      // Allow backspace (... to remove node)
      this.state.model.setLocked(false);
      // Fit into canvas (clientWidth error)
      this.state.engine.zoomToFit();
      // Flat diagram into memory
      this.flatItemDefinition(object);
    }
  }

  // Diagram into memory
  flatItemDefinition = (object) => {
    // Model <> JSON
    window.ItemDefinition['MODEL_JSON'] = this.jsonSerialization();

    // Internal Item Definition
    if (object && 'node' in object) {
      let obj = object['node'];

      // Components
      if (obj['node']['nodeType'] === 'COMPONENT') {

        window.ItemDefinition['INTERNAL']['COMPONENTS'][obj['node']['refId']] = {
          'Property': obj['node'],
          'In': {},
          'Out': {},
        };
      }

      // Functions
      if (obj['node']['nodeType'] === 'FUNCTION') {

        window.ItemDefinition['INTERNAL']['FUNCTIONS'][obj['node']['refId']] = {
          'Property': obj['node'],
          'In': {},
          'Out': {},
        };
      }

      // Diagrams
      if (obj['node']['nodeType'] === 'DIAGRAM') {
        window.ItemDefinition['INTERNAL']['DIAGRAMS'][obj['node']['refId']] = {
          'Property': obj['node'],
          'In': {},
          'Out': {},
        };
      }

    }

    // Channels
    if (object && object['nodeType'] === 'CHANNEL') {
      //
      window.ItemDefinition['INTERNAL']['CHANNELS'][object['refId']] = {
        'Property': object,
        'From': {},
        'To': {},
      };

      //
      if (object) {
        this.setSaveReadyButton(true);
      }

    }

    // We can save a copy into local storage if required
  }

  // Save button state
  setSaveReadyButton = (isActive) => {
    if (isActive) {
      jQuery('#SaveItemDefinitionButton').attr('disabled', null);
    } else {
      jQuery('#SaveItemDefinitionButton').attr('disabled', 'disabled');
    }
  }

  // Keystore to JSON object
  keystoreToJson() {
    var keystoreJson = {};

    for (let key in window.AutoKeyStore) {
      if (window.AutoKeyStore[key]['channel']) {
        keystoreJson[key] = {
          'channel': window.AutoKeyStore[key]['channel']
        };
      }

      if (window.AutoKeyStore[key]['node']) {
        let portsIn = [];
        let portsOut = [];

        window.AutoKeyStore[key]['node']['portsIn'].forEach(port => {
          if (port) {
            portsIn.push(port['options']);
          }
        });

        window.AutoKeyStore[key]['node']['portsOut'].forEach(port => {
          if (port) {
            portsOut.push(port['options']);
          }
        });

        keystoreJson[key] = {
          'node': {
            'options': window.AutoKeyStore[key]['node']['options'],
            'node': window.AutoKeyStore[key]['node']['node'],
            'portsIn': portsIn,
            'portsOut': portsOut,
          },
        };
      }
    }

    return keystoreJson;
  }

  // Save item definition for Program
  saveItemDefinition = () => {
    let vm = this;

    // Item-definition keystire
    window.ItemDefinition['KEYSTORE'] = vm.keystoreToJson();

    if (window.ItemDefinition['MODEL_JSON'].length === 0) {
      alert("Please provide the necessary inputs for Item Definition in order to Save and continue.");
      return;
    }

    // Ajax-params
    let params = {
      'programUuid': vm.state.programObject['uuid'],
      'definition': window.ItemDefinition,
    };

    // Store Item Definition
    httpPost(apify('app/program/store-item-definition'), params).then((res) => {
      if (res['success']) {
        swalPopup("Item definition has been updated.", 'success', () => {
          // Redirect it to Asset Identification screen
          let phaseRoute = programLifecycleRoute('Asset-Identification', vm.state.programObject['uuid']);
          vm.props.history.push({
            pathname: phaseRoute,
          });
        });
      }
    }).catch((err) => {
      swalPopup("Something went wrong at save?.");
    });
  }

  // JSON Serialization
  jsonSerialization = (prompt = false) => {
    let serializedModel = this.state.model.serialize();

    if (prompt) {
      alert("Please see console (F12) to see JSON-Serialized-Map.");
    }

    return serializedModel;
  }

  // Node event property
  getNodeEventProperty() {
    let vm = this;
    let eventProperty = {
      selectionChanged: function (e) {
        // When node is selected
        // Show Configure/Settings gear
        if (e['isSelected']) {
          // Display gear
          jQuery('.item-definition-node-settings-gear').css({
            'display': 'contents',
          });

          //
          jQuery('.item-definition-node-settings-gear-btn').attr('data-node-type', 'COMPONENT');
          jQuery('.item-definition-node-settings-gear-btn').attr('data-node-id', e['entity']['options']['id']);

        } else {

          // Hide gear
          vm.hideNodeSettingsGearIcon();

        }
      }
    };
    return eventProperty;
  }

  // Render existing definition
  renderExistingDefinition() {
    let vm = this;

    return new Promise((resolve, reject) => {

      let itemDefinition = this.state.programObject['item_definition'];

      if (itemDefinition && itemDefinition['MODEL_JSON']) {

        if (itemDefinition['KEYSTORE']) {
          window.ItemDefinition['KEYSTORE'] = itemDefinition['KEYSTORE'];
          window.AutoKeyStore = itemDefinition['KEYSTORE'];
        }

        window.ItemDefinition = itemDefinition;
        vm.setSaveReadyButton(true);

        let modelJson = itemDefinition['MODEL_JSON'];
        let engine = this.state.engine;
        let model = this.state.model;

        model.deserializeModel(modelJson, engine);

        //
        let nodes = model.getNodes();
        let eventProperty = vm.getNodeEventProperty();
        nodes.forEach(node => {
          node.registerListener(eventProperty);
        });

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

  // Pre-UI tasks
  async preUiTasks() {
    try {
      await this.registerEngine();
      let engineReady = await this.renderExistingDefinition();

      this.setState({
        loading: false,
        engineReady: engineReady,
      }, async () => {
        this.forEngineHelperContext();
      });

    } catch (error) {
      alert("There is reading/parsing error in item definition context. Please see console log for better debugging.");
      console.error(error);
    }
  }

  // Show System Conf.
  showSystemConf = (ev) => {
    ev.preventDefault();

    this.setState({
      viewSystemConf: true
    }, () => modal('#ModalProgramSysConf'))
  }

  // Get system configuration items
  getSystemConfItems = () => {
    let systemFunctions = [];
    let systemComponents = [];
    
    let systemConfiguration = this.state['programObject']['system_configuration'];

    Object.keys(systemConfiguration).map(key => {
      let systemFunction = systemConfiguration[key]
      systemFunction['components'].forEach(componentObject => {
        systemComponents.push({
          'parentKey': key,
          'label': componentObject['component_name'],
          'value': componentObject['component_uuid'],
        });

        systemFunctions.push({
          "value": systemFunction['uuid'],
          "label": systemFunction['name']
        });
      });
      return true
    });

    systemComponents = getUniqueListBy(systemComponents, 'label');

    this.setState({
      'systemFunctions': systemFunctions,
      'systemComponents': systemComponents,
      'assetItems': this.state['programObject']['assetItems'],
    });
  }

  // Download concept phase report
  phaseReport = (ev, type = "PDF") => {
    ev.preventDefault();

    let params = {
      'programUuid': this.state.programObject['uuid'],
      'selectedInput': this.state.selectedInput ? this.state.selectedInput : [],
      'page': 'item_defination'
    };

    // Get report
    httpPost(apify(`app/programs/phase-report?programUuid=${this.state.programObject['uuid']}`), params).then(data => {
      // window.location.href = apiBaseUrl(data.path);
      if (type === 'PDF') {
        var link = document.getElementById("download");
        link.href = apiBaseUrl(data.path);
        link.setAttribute('target', "_blank");
        link.click();
      }
      else if (type === 'JSON') {
        var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data.jsonData));
        var downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "report.json");
        document.body.appendChild(downloadAnchorNode); // required for firefox
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
      }

    }).catch(() => {
      swalPopup("Something went wrong while downloading report.");
    });
  }

  // Open image uploader
  triggerImageChange = () => {
    jQuery('#InfoPictureFile').click();
  }

  // On submit of Image
  onImageChange = async (event) => {
    let vm = this
    let file = event.target.files && event.target.files.length > 0 ? event.target.files[0] : null;

    if (file) {
      await httpFile(apify('app/upload-file'), file).then((res) => {
        if (res['success']) {
          file = res['url']
  
          httpPost(apify('app/program/item-defination/image-update'), {
            programUuid: vm.state.programObject['uuid'],
            file: file,
          }).then(res => {
            if (res['success']) {
              this.setState({
                infoPicture: res['url'],
              }, () => {
                // Info picture gallery
                // this.initInfoPictureGallery();
                let picture = jQuery('.item-definition-info-box-picture').attr('data-picture');
                jQuery('.item-definition-info-box-picture').css({
                  'backgroundImage': `url(${picture})`,
                });
              })
            }
          });
        }
      });
    }

    else {
      swalPopup("Something went wrong in selecting the picture.");
    }
  }

  // Allow ID update
  allowUpdate = () => {
    return true
    return !this.state.programObject['assets'] || !this.state.programObject['assets']['Identification'] ||  (this.state.programObject['assets']['Identification']['Remaining-Assets'] !== 0) || this.state.programObject['assets']['Identification']['Total-Assets'] === 0;
  }

  //
  checkAndApplyInfoImage = (path) => {
    const DEFAULT_INFO_IMAGE = '/static/images/sample-ee-topology.jpg';
    let infoImageSrc = DEFAULT_INFO_IMAGE;
    jQuery.get(path).then(() => {
      infoImageSrc = path;
    });

    this.setState({
      infoPicture: path,
    });
  }

  // Mount
  async componentDidMount() {
    // Set page title
    setTitle("Item Definition");

    // Program UUID
    const { programUuid } = this.props['match']['params'];

    // Program Model
    var program = new Program({ 'programUuid': programUuid });

    // Program Object
    var programObject = await program.get();

    // Check & apply Info picture
    this.checkAndApplyInfoImage(programObject['program']['info_picture']);

    // Fetch program & run-UI tasks
    this.setState({
      program: program,
      programObject: programObject['program'],
    }, () => {
      this.preUiTasks();
      this.getSystemConfItems();

      let itemDefinition = this.state.programObject['item_definition'];

      if (itemDefinition && itemDefinition['MODEL_JSON']) {
        this.setSaveReadyButton(true);
      } 
      
      else {
        this.setSaveReadyButton(false);
      }
    });

    // [TODO] Disable Backspace 
    // Backspace: Delete channel link from system
    window.addEventListener("keyup", function(ev) {
      if (ev.code === 'Backspace') {
        ev.stopPropagation();
      }
    });

  }

  // UI
  render() {
    return (
      <div>
        <DashboardLayout allowDemoMode={true}>
          <div className="container-fluid">
            <div className="row">
              <div className="col-12 my-2">

                {
                  this.state.loading &&
                  <div>
                    <PlaceholderLoader />
                  </div>
                }

                {
                  this.state.programObject && this.state.programObject['is_system_configured'] &&
                  this.state.viewSystemConf &&
                  <div>
                    <div className="modal fade" id="ModalProgramSysConf" tabIndex="-1" data-keyboard="false" data-backdrop="static">
                      <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                          <div className="modal-header">
                            <h4 className="modal-title text-primary">
                              View <b>System Configuration</b>
                            </h4>
                            <button type="button" className="close" data-dismiss="modal" onClick={ev => this.setState({ viewSystemConf: false })}>
                              <span>&times;</span>
                            </button>
                          </div>
                          <div className="modal-body">
                            <table className="table table-bordered">
                              <thead>
                                <tr>
                                  <th>Function</th>
                                  <th>Component</th>
                                </tr>
                              </thead>
                              <tbody>
                                {
                                  Object.keys(this.state.programObject['system_configuration']).map(row => {
                                    return (
                                      <tr key={this.state.programObject['system_configuration'][row]['uuid']}>
                                        <td>{this.state.programObject['system_configuration'][row]['name']}</td>
                                        <td>
                                          {
                                            this.state.programObject['system_configuration'][row]['components'].map(component => {
                                              return (
                                                <span key={component['component_uuid']} className="badge badge-primary p-2 mr-2">{component['component_name']}</span>
                                              )
                                            })
                                          }
                                        </td>
                                      </tr>
                                    )
                                  })
                                }
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                }

                {
                  this.state.engineReady &&
                  this.state.programObject &&
                  <div className="card">
                    <div className="card-header">
                      <h3>Item Definition</h3>

                      <div className="row">
                        <div className="col-5">
                          <small>Program</small> <br />
                          <Link to={programLifecycleRoute('VIEW', this.state.programObject['uuid'])}>
                            {this.state.programObject['name']}
                          </Link>

                          <span className="pl-3">
                            <a href="#!" className="text-info" title="Click to view View System Configuration" onClick={(ev) => this.showSystemConf(ev)}>
                              View System Configuration
                            </a>
                          </span>

                        </div>

                        <div className="col-1"></div>
                        <div className="col-3"></div>

                        <div className="col-3 text-right">
                          {
                            this.state.allowImportDesign &&
                            <button className="btn btn-info" onClick={() => this.toggleImportItemSidebar}>
                              View <b>Designs</b>
                            </button>
                          }
                        </div>
                      </div>

                    </div>

                    <div className="card-body item-definition-drawing">
                      {
                        false &&
                        <i>Right-click to get started.</i>
                      }

                      {
                        this.state.engine &&
                        <div>
                          {/* Engine Control Button Group */}
                          <div className="engine-buttons">
                            {
                              false &&
                              <div>
                                <button onClick={() => this.engineButtonZoomPlus}>
                                  Zoom +
                                </button>
                                <button onClick={() => this.engineButtonZoomMinus}>
                                  Zoom -
                                </button>
                              </div>
                            }

                            <button className="btn btn-dark btn-sm" onClick={(ev) => this.engineButtonZoomFit(ev)}>
                              <i className="fa fa-search-plus mr-2"></i>
                              Zoom to Fit
                            </button>

                            {/* Node settings gear */}
                            {(this.state.programObject['status'] !== 'APPROVED' && this.state.programObject['status'] !== 'UNDER-REVIEW') && (this.allowUpdate()) && <div className="item-definition-node-settings-gear">
                              <button className="btn btn-warning btn-sm item-definition-node-settings-gear-btn ml-2" title="Configure Node">
                                <i className="fa fa-gear"></i> Update
                              </button>
                            </div>}
                          </div>

                          {
                            this.state.infoPicture && this.state.allowInfoPicture &&
                            <div className="item-definition-info-box-picture" data-picture={this.state.infoPicture} title="Click to Preview">
                            </div>
                          }

                        </div>
                      }

                      {
                        this.state.engine &&
                        <CanvasWidget engine={this.state.engine} className="canvas-widget" />
                      }

                      {/* Right-click menu on canvas */}
                      <div className="dropdown-menu item-definition-drawing-dropdown-menu">
                        <button className="dropdown-item" onClick={() => this.addComponentDialog()}>
                          Add Component
                        </button>
                        <button className="dropdown-item" onClick={() => this.addFunctionDialog()}>
                          Add Function
                        </button>
                        <button className="dropdown-item" onClick={() => this.addDiagramDialog()}>
                          Add DFD
                        </button>
                        <div className="dropdown-divider"></div>
                        <button className="dropdown-item" onClick={() => this.closeDrawingDropdownMenu()}>
                          Close
                        </button>
                      </div>

                    </div>

                    <div className="card-footer py-4 row">
                      <Link to={programLifecycleRoute('VIEW', this.state.programObject['uuid'])} className="btn btn-primary text-white">
                        <i className="fa fa-arrow-left mr-2"></i>
                        Back to Program
                      </Link>

                      {(this.state.programObject['status'] !== 'APPROVED' && this.state.programObject['status'] !== 'UNDER-REVIEW') && (this.allowUpdate()) && <button  id="SaveItemDefinitionButton" className="btn btn-success btn-lg ml-3">
                        Save and <b>Continue</b>
                        <i className="fa fa-arrow-right ml-2"></i>
                      </button>}

                      {
                        false &&
                        <button className="btn btn-dark btn-lg ml-3" onClick={() => this.jsonSerialization}>
                          JSON <b>Serializer</b>
                        </button>
                      }
                      {
                        this.state.programObject['status'] !== 'APPROVED' && this.state.programObject['status'] !== 'UNDER-REVIEW' &&
                        <button className="btn btn-dark btn-lg ml-3" onClick={(ev) => this.phaseReport(ev, 'JSON')} >
                          <i className="fa fa-download mr-2"></i>
                          Download <b> JSON</b>
                        </button>
                      }
                      {
                        this.state.allowInfoPicture &&
                        <>
                        <button className="btn btn-outline-info btn-lg ml-3" onClick={(ev) => this.triggerImageChange(ev)}>
                          <i className="fa fa-upload mr-2"></i>
                          Upload Image
                        </button>

                        <input type="file" id="InfoPictureFile" className="d-none" onChange={(ev) => this.onImageChange(ev)} />
                        </>
                      }

                    </div>
                  </div>
                }


                {
                  this.state.engineReady &&
                  this.state.programObject &&
                  <div>
                    {/* Add Component */}
                    <ModalAddComponent
                      systemComponents={this.state['systemComponents']} 
                      assetItems={this.state.assetItems}
                    />

                    {/* Add Function */}
                    <ModalAddFunction
                      systemFunctions={this.state['systemFunctions']}
                    />

                    {/* Add Channel */}
                    <ModalAddChannel />

                    {/* Add Diagram */}
                    <ModalAddDiagram />
                  </div>
                }
              </div>
            </div>
          </div>

          {/* Import Design Sidebar */}
          {
            this.state.allowImportDesign &&
            <ImportItemsSidebar onSlotReadyChange={() => this.onImportSlotReadyChange} />
          }
        </DashboardLayout >
      </div >
    )
  }
}

// Item Definition
export default ItemDefinition;