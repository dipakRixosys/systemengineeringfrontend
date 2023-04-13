// React
import { useEffect, useState, useCallback } from "react";
// React Select
import Select from 'react-select'
// Events
import { dispatchAddNodeEvent } from "helpers/events";
// Helpers
import { modal } from "helpers/common";
// jQuery
const jQuery = window.jQuery;

// Modal > Add Component
function ModalAddComponent(props) {
  // Attributes
  const [refId, setRefId] = useState(undefined);
  const [systemComponents, setSystemComponents] = useState([]);
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [technology, setTechnology] = useState([]);
  const [technologyValue, setTechnologyValue] = useState("");
  const [storedData, setStoreData] = useState([]);
  const [storedDataValue, setStoreDataValue] = useState("");
  const [inputPorts, setInputPorts] = useState(1);
  const [outputPorts, setOutputPorts] = useState(1);
  const [assetItems, setAssetItems] = useState({});

  const [allowAttributes, setAllowAttributes] = useState(false);
  const [allowSubmit, setAllowSubmit] = useState(false);

  // Technologies option array
  const getTechnologies = () => {
    return [
      "Wi-Fi",
      "LTE",
      "V2X",
      "Bluetooth",
      "None",
      "Others"
    ];
  }

  // Stored Data option array
  const getStoredData = () => {
    return [
      "Vehicle Data",
      "Personal Data",
      "Cached Data",
      "Business Data",
    ];
  }

  // Add Component
  const addComponent = () => {
    // Form validator
    var validForm = jQuery('#UploadForm').valid();

    // In case of invalid form
    if (!validForm) {
      return;
    }

    // Create node
    var node = {
      nodeType: 'COMPONENT',
      refId: refId,
      name: name,
      title: title,
      description: description,
      inputPorts: Number(inputPorts),
      outputPorts: Number(outputPorts),
      technologyValue: technologyValue,
      storedDataValue: storedDataValue,
      ...assetItems

    };
    // Dispatch `add-node` event
    dispatchAddNodeEvent(node);
    // Hide modal
    modal('#ModalAddComponent', 'hide');
  }

  // On change event
  const onChangeSystemComponents = useCallback((ev) => {
    setName(ev['label']);
    setAllowAttributes(true);
    setAllowSubmit(true);
  }, []);

  // Is required input field
  const isRequiredField = (field) => {
    const REQUIRED_FIELDS = [
      'logs',
      'secret',
      'software',
    ];
    return REQUIRED_FIELDS.includes(String(field).toLowerCase());
  }

  // Refresh jQuery selector
  useEffect(() => {
    if (allowAttributes) {
      jQuery('.select-for-add-component').selectpicker('refresh');
    }
  }, [allowAttributes])

  // Constructor
  useEffect(() => {
    // Technology Data
    let technology = getTechnologies();
    setTechnology(technology);

    // Stored Data
    let storedData = getStoredData();
    setStoreData(storedData);

    if (jQuery('#UploadForm')) {

      // Validate Upload Form
      const validator = jQuery('#UploadForm').validate({
        rules: {

        },
        messages: {

        },
        invalidHandler: function (event, validator) {

        },
      });

      // Validator ref.
      window.validator = validator;
    }


    // Modal is shown at parent window
    jQuery('#ModalAddComponent').on('shown.bs.modal', function (e) {

      if (window.NodeProperty) {
        // Get object from parent window
        let previousNodeProperty = window.NodeProperty;

        // Data
        setRefId(previousNodeProperty['refId']);
        setName(previousNodeProperty['name']);
        setTitle(previousNodeProperty['title']);
        setDescription(previousNodeProperty['description']);
        setInputPorts(previousNodeProperty['inputPorts']);
        setOutputPorts(previousNodeProperty['outputPorts']);

        let assetItemsData = {}
        props.assetItems && props.assetItems['Components'] && Object.keys(props.assetItems['Components']).map((assetItem) => {

          assetItemsData = {
            ...assetItemsData,
            [`${props.assetItems['Components'][assetItem]}`]: previousNodeProperty[props.assetItems['Components'][assetItem]]
          }
        })

        setAssetItems(assetItemsData)

        setAllowAttributes(true)
        setAllowSubmit(true);

        // Select-picker
        jQuery('#add-component-technology').val(previousNodeProperty['technologyValue']);
        jQuery('#add-component-storedData').val(previousNodeProperty['storedDataValue']);
      }

      // Default
      else {
        setRefId(undefined);
        setName("");
        setTitle("");
        setDescription("");
        setTechnologyValue(technology[0]);
        setStoreDataValue(storedData[0]);
        setInputPorts(1);
        setOutputPorts(1);

        props.assetItems && props.assetItems['Components'] && Object.keys(props.assetItems['Components']).map((assetItem) => {
          setAssetItems({
            ...assetItems,
            [`${props.assetItems['Components'][assetItem]}`]: ""
          })
        })
      }

      // Refresh jQuery-select
      jQuery('.select-for-add-component').selectpicker('refresh');

      // Onload
      window.NodeProperty = null;

    });

    // System Components
    let systemComponents = props['systemComponents'];
    setSystemComponents(systemComponents);
  }, [props]);

  // [UI]
  return (
    <div>
      <div className="modal fade" id="ModalAddComponent" tabIndex="-1" data-keyboard="false" data-backdrop="static">
        <div className="modal-dialog" style={{maxWidth: '70vw'}}>
          <div className="modal-content">

            <form id="UploadForm" className="form-has-validations">
              <div className="modal-header">
                <h4 className="modal-title text-primary">
                  {
                    refId
                      ? <span>Update <b>Component</b></span>
                      : <span>Add <b>Component</b></span>
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
                    <input type="text" className="form-control md-form-control" placeholder="Asset Category" defaultValue="Component" readOnly />
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
                      Component
                    </div>
                    <div className="col-8">
                      <Select
                        options={systemComponents}
                        onChange={onChangeSystemComponents}
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
                        Technology
                      </div>
                      <div className="col-8">
                        <select className="form-control select-for-add-component" id="add-component-technology" name="technology" value={technologyValue} onChange={e => setTechnologyValue(e.target.value)} required>
                          {
                            technology.map(t => {
                              return (
                                <option key={t} value={t}>{t}</option>
                              )
                            })
                          }
                        </select>
                      </div>
                    </div>

                    <div className="form-group row">
                      <div className="col-4 text-muted">
                        Stored Data
                      </div>
                      <div className="col-8">
                        <select className="form-control select-for-add-component" id="add-component-storedData" name="storedData" value={storedDataValue} onChange={e => setStoreDataValue(e.target.value)} required>
                          {
                            storedData.map(d => {
                              return(
                                <option key={d} value={d}>{d}</option>
                              )
                            })
                          }
                        </select>
                      </div>
                    </div>

                    <div className="form-group row">
                      <div className="col-4 text-muted">
                        Input Ports
                      </div>
                      <div className="col-8">
                        <input type="number" min="1" className="form-control md-form-control" placeholder="Input Ports" name="inputPorts" value={inputPorts} onChange={e => setInputPorts(e.target.value)} required />
                        {
                          refId
                            ? <small className="text-muted">[Alert] Re-configuration would orphan previous links.</small>
                            : null
                        }
                      </div>
                    </div>

                    <div className="form-group row">
                      <div className="col-4 text-muted">
                        Output Ports
                      </div>
                      <div className="col-8">
                        <input type="number" min="1" className="form-control md-form-control" placeholder="Output Ports" name="outputPorts" value={outputPorts} onChange={e => setOutputPorts(e.target.value)} required />
                        {
                          refId
                            ? <small className="text-muted">[Alert] Re-configuration would orphan previous links.</small>
                            : null
                        }
                      </div>
                    </div>

                    {
                      props.assetItems && 
                      props.assetItems['Components'] && 
                      Object.keys(props.assetItems['Components']).map((assetItem) => {
                        return (
                          <div 
                            key={props.assetItems['Components'][assetItem]} 
                            data-key={props.assetItems['Components'][assetItem]} 
                            className="form-group row"
                          >

                            <div className="col-4 text-muted">
                              { String(assetItem).replaceAll("-", " ") } 
                              { isRequiredField(assetItem) && <span className="badge badge-primary badge-v2 ml-2">Required</span> }
                              { !isRequiredField(assetItem) && <span className="badge badge-warning badge-v2 ml-2">Optional</span> }
                            </div>

                            <div className="col-8">
                              <input 
                                type="text" 
                                className="form-control md-form-control" 
                                placeholder={assetItem} 
                                name={props.assetItems['Components'][assetItem]} 
                                value={assetItems[props.assetItems['Components'][assetItem]]} 
                                onChange={
                                  e => setAssetItems({
                                    ...assetItems,
                                    [`${props.assetItems['Components'][assetItem]}`]: e.target.value
                                  })
                                }
                                required={isRequiredField(assetItem)}
                              />
                            </div>
                          </div>
                        )
                      })
                    }

                  </div>
                }

              </div>
              <div className="modal-footer">
                <div className="row w-100">
                  <div className="col-6 text-left m-0 p-0">

                  </div>
                  <div className="col-6 text-right m-0 p-0">
                    <button type="button" className="btn btn-primary" onClick={addComponent} disabled={!allowSubmit}>
                      {
                        refId
                          ? <span>Update <b>Component</b></span>
                          : <span>Add <b>Component</b></span>
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

export default ModalAddComponent;