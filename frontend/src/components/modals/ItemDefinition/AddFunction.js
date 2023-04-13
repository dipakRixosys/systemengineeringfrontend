// React
import { useEffect, useState, useCallback } from "react";
// React Select
import Select from 'react-select'
// Events
import { dispatchAddFunctionEvent } from "helpers/events";
// Helpers
import { modal } from "helpers/common";
// jQuery
const jQuery = window.jQuery;

// Modal > Add Function
function ModalAddFunction(props) {
  // Attributes
  const [refId, setRefId] = useState(undefined);
  const [systemFunctions, setSystemFunctions] = useState([]);
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [inputPorts, setInputPorts] = useState(1);
  const [outputPorts, setOutputPorts] = useState(1);
  
  const [allowAttributes, setAllowAttributes] = useState(false);
  const [allowSubmit, setAllowSubmit] = useState(false);

  // Add Function
  const addFunction = () => {
    // Form validator
    var validForm = jQuery('#AddFunctionForm').valid();

    // Validation failed
    if (!validForm) {
      return;
    }
    
    // Create function
    var func = {
      nodeType: 'FUNCTION',
      refId: refId,
      name: name,
      title: title,
      description: description,
      inputPorts: Number(inputPorts),
      outputPorts: Number(outputPorts),
    };
    // Dispatch `add-function` event
    dispatchAddFunctionEvent(func);
    // Hide modal
    modal('#ModalAddFunction', 'hide');
  }

  // On change event
  const onChangeSystemFunctions = useCallback((ev) => {
    setName(ev['label']);
    setAllowAttributes(true);
    setAllowSubmit(true);
  }, []);

  // Constructor
  useEffect(() => {
    // Validate Upload Form
    const validator = jQuery('#AddFunctionForm').validate({
      rules: {
        
      },
      messages: {
        
      },
      invalidHandler: function(event, validator) {
        
      },
    });
    
    // Validator ref.
    window.validator = validator;

    jQuery('#ModalAddFunction').on('shown.bs.modal', function (e) {
      //
      if (window.FunctionProperty) {
        //
        let previousFunctionProperty = window.FunctionProperty;
        setRefId(previousFunctionProperty['refId']);
        setName(previousFunctionProperty['name']);
        setTitle(previousFunctionProperty['title']);
        setDescription(previousFunctionProperty['description']);
      }

      //
      else {
        setRefId(undefined);
        setName("");
        setTitle("");
        setDescription("");
      }

      //
      jQuery('.select-for-add-function').selectpicker('refresh');
      
      //
      window.FunctionProperty = null;
    });

    //
    let systemFunctions = props['systemFunctions'];
    setSystemFunctions(systemFunctions);

  }, [props]);
  
  // UI 
  return (
    <div>
      <div className="modal fade" id="ModalAddFunction" tabIndex="-1" data-keyboard="false" data-backdrop="static">
        <div className="modal-dialog">
          <div className="modal-content">
            
            <form id="AddFunctionForm" className="form-has-validations">
              <div className="modal-header">
                <h4 className="modal-title text-primary">
                  {
                    refId 
                    ? <span>Update <b>Function</b></span>
                    : <span>Add <b>Function</b></span>
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
                    <input type="text" className="form-control md-form-control" placeholder="Asset Category" defaultValue="Function" readOnly />
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

                {
                  (refId === undefined) && 
                  <div className="form-group row mb-3">
                    <div className="col-4 text-muted">
                      Function
                    </div>
                    <div className="col-8">
                      <Select 
                        options={systemFunctions}
                        onChange={onChangeSystemFunctions}
                      />
                    </div>
                  </div>
                }

                {
                  allowAttributes &&
                  <div>
                    <div className="form-group row">
                      <div className="col-4 text-muted">
                        Name
                      </div>
                      <div className="col-8">
                        <input type="text" className="form-control md-form-control" placeholder="Name" autoFocus name="name" value={name} onChange={e => setName(e.target.value)} required readOnly />
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
                }

              </div>
              
              <div className="modal-footer">
                <div className="row w-100">
                  <div className="col-6 text-left m-0 p-0">
                    
                  </div>
                  <div className="col-6 text-right m-0 p-0">
                    <button type="button" className="btn btn-primary" onClick={addFunction} disabled={!allowSubmit}>
                      {
                        refId 
                        ? <span>Update <b>Function</b></span>
                        : <span>Add <b>Function</b></span>
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

export default ModalAddFunction;