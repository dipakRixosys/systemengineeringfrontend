//
import { useEffect, useState } from "react";
// Events
import { dispatchAddDiagramEvent } from "helpers/events";
//
import { modal } from "helpers/common";
// jQuery
const jQuery = window.jQuery;

// Modal > Add Diagram
function ModalAddDiagram() {
  //
  const [refId, setRefId] = useState(undefined);
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [designs, setDesigns] = useState([]);
  const [designValue, setDesignValue] = useState("");
  const [inputPorts, setInputPorts] = useState(1);
  const [outputPorts, setOutputPorts] = useState(1);
  

  //
  const getDefaultDesigns = () => {
    return [
      {
        group: "Generic Process",
        items: [
          "OBD Port",
          "End user Interface",
          "Other physical access to vehicle",
          "Hosted 3rd party software",
          "Immobiliser or security systems",
          "Other Ports",
          "Paired Mobile Phone",
          "Remotely Operated Vehicle Systems",
          "Other Physical Systems",
          "Other Wireless Systems",
          "Radio Antenna",
          "Other Physical Device",
        ],
      },
      {
        group: "Sensors",
        items: [
          "Radar Sensors",
          "Camera Sensor",
          "Lidar",
          "Other Sensors",
        ],
      },
      {
        group: "Generic External Elements",
        items: [
          "External Server",
          "External Application or Service",
          "Staff",
          "Owner",
        ],
      },
      {
        group: "Generic Data Store",
        items: [
          "Cloud Storage",
          "Database",
          "File System",
          "Configuration File",
          "Device Local Storage",
          "Removable Storage",
          "Bootloader",
        ],
      },
      {
        group: "Others",
        items: [
          "PKI",
          "Internet (Cloud)",
          "Intranet",
        ],
      },
    ];
  }
  
  // Add Diagram
  const addDiagram = () => {
    // Form validator
    var validForm = jQuery('#AddDiagramForm').valid();

    // Validation failed
    if (!validForm) {
      return;
    }
    
    // Create diagram
    var diagram = {
      nodeType: 'DIAGRAM',
      refId: refId,
      name: name,
      title: title,
      description: description,
      designValue: designValue,
      inputPorts: Number(inputPorts),
      outputPorts: Number(outputPorts),
    };
    // Dispatch `add-diagram` event
    dispatchAddDiagramEvent(diagram);
    // Hide modal
    modal('#ModalAddDiagram', 'hide');
  }

  // Constructor
  useEffect(() => {
    // Validate Upload Form
    const validator = jQuery('#AddDiagramForm').validate({
      rules: {
        
      },
      messages: {
        
      },
      invalidHandler: function() {
        
      },
    });
    
    // Validator ref.
    window.validator = validator;

    //
    let designs = getDefaultDesigns();
    setDesigns(designs);

    //
    jQuery('#ModalAddDiagram').on('shown.bs.modal', function (e) {

      //
      if (window.DiagramProperty) {
        //
        let previousDiagramProperty = window.DiagramProperty;

        //
        setRefId(previousDiagramProperty['refId']);
        setName(previousDiagramProperty['name']);
        setTitle(previousDiagramProperty['title']);
        setDescription(previousDiagramProperty['description']);
        
        //
        jQuery('#add-diagram-design').val(previousDiagramProperty['designValue']);
      }

      else {
        setRefId(undefined);
        setName("");
        setTitle("");
        setDescription("");
        setDesignValue(designs[0]);
      }

      //
      jQuery('.select-for-add-diagram').selectpicker('refresh');

      //
      window.DiagramProperty = null;
    });

  }, []);
  
  //
  return (
    <div>
      <div className="modal fade" id="ModalAddDiagram" tabIndex="-1" data-keyboard="false" data-backdrop="static">
        <div className="modal-dialog">
          <div className="modal-content">
            
            <form id="AddDiagramForm" className="form-has-validations">
              <div className="modal-header">
                <h4 className="modal-title text-primary">
                  {
                    refId 
                    ? <span>Update <b>Diagram</b></span>
                    : <span>Add <b>Diagram</b></span>
                  }
                </h4>
                <button type="button" className="close" data-dismiss="modal">
                  <span>&times;</span>
                </button>
              </div>
              
              <div className="modal-body">
                
                <div className="form-group row">
                  <div className="col-4 text-muted">
                    Asset Category
                  </div>
                  <div className="col-8">
                    <input type="text" className="form-control md-form-control" placeholder="Asset Category" defaultValue="DFD (Diagram)" readOnly />
                  </div>
                </div>
                
                <div className="form-group row">
                  <div className="col-4 text-muted">
                    Ref. ID
                  </div>
                  <div className="col-8">
                    <input type="text" className="form-control md-form-control" placeholder="Ref. ID" defaultValue={refId} readOnly />
                  </div>
                </div>

                <div className="form-group row">
                  <div className="col-4 text-muted">
                    Design
                  </div>
                  <div className="col-8">
                    <select className="form-control select-for-add-diagram" id="add-diagram-design" name="design" value={designValue} onChange={e => setDesignValue(e.target.value)} required data-live-search="true">
                      {
                        designs.map(d => {
                          return(
                            <optgroup key={d.group} label={d.group}>
                              {
                                d.items.map(item => {
                                  return(
                                    <option key={item} value={item}>{item}</option>
                                  )
                                })
                              }
                            </optgroup>
                          )
                        })
                      }
                    </select>
                  </div>
                </div>

                <div className="form-group row">
                  <div className="col-4 text-muted">
                    Name
                  </div>
                  <div className="col-8">
                    <input type="text" className="form-control md-form-control" placeholder="Name" autoFocus name="name" value={name} onChange={e => setName(e.target.value)} required />
                  </div>
                </div>
                
                <div className="form-group row">
                  <div className="col-4 text-muted">
                    Title
                  </div>
                  <div className="col-8">
                    <input type="text" className="form-control md-form-control" placeholder="Title" name="title" value={title} onChange={e => setTitle(e.target.value)} />
                  </div>
                </div>
                
                <div className="form-group row">
                  <div className="col-4 text-muted">
                    Description
                  </div>
                  <div className="col-8">
                    <input type="text" className="form-control md-form-control" placeholder="Description" name="description" value={description} onChange={e => setDescription(e.target.value)} />
                  </div>
                </div>

                <div className="form-group row">
                  <div className="col-4 text-muted">
                    Input Ports
                  </div>
                  <div className="col-8">
                    <input type="number" min="1" className="form-control md-form-control" placeholder="Input Ports" name="inputPorts" value={inputPorts} onChange={e => setInputPorts(e.target.value)} required />
                  </div>
                </div>

                <div className="form-group row">
                  <div className="col-4 text-muted">
                    Output Ports
                  </div>
                  <div className="col-8">
                    <input type="number" min="1" className="form-control md-form-control" placeholder="Output Ports" name="outputPorts" value={outputPorts} onChange={e => setOutputPorts(e.target.value)} required />
                  </div>
                </div>
                
              </div>
              
              <div className="modal-footer">
                <div className="row w-100">
                  <div className="col-6 text-left m-0 p-0">
                    
                  </div>
                  <div className="col-6 text-right m-0 p-0">
                    <button type="button" className="btn btn-primary" onClick={addDiagram}>
                      {
                        refId 
                        ? <span>Update <b>Diagram</b></span>
                        : <span>Add <b>Diagram</b></span>
                      }
                    </button>
                  </div>
                </div>
              </div>
            </form>

          </div>
        </div>
      </div>
    </div>
  )
}

export default ModalAddDiagram;