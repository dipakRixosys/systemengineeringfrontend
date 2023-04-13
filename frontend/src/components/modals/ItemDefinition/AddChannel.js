//
import { useEffect, useState } from "react";
// Events
import { dispatchConfigureChannelEvent } from "helpers/events";
import { modal } from "helpers/common";
import { getAutoKeyStore } from "helpers/store";
// jQuery
const jQuery = window.jQuery;

// Modal > Add Channel
function ModalAddChannel() {
  //
  const [refId, setRefId] = useState(undefined);
  const [channels, setChannels] = useState([]);
  const [channelValue, setChannelValue] = useState("");
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dataflow, setDataflow] = useState("");
  const [dataflowDescription, setDataflowDescription] = useState("");
  const [dataflowStartPoint, setDataflowStartPoint] = useState("");
  const [dataflowEndPoint, setDataflowEndPoint] = useState("");
  
  //
  const getChannels = () => {
    return [
      "CAN",
      "Ethernet",
      "Most",
      "V2X Communications",
      "Short-range Comunications",
      "Cellular Communications",
      "Other Wireless Communications",
    ];
  }

  // Configure Channel
  const configureChannel = () => {
    // Form validator
    var validForm = jQuery('#ConfigureChannelForm').valid();

    // If form is invalid
    if (!validForm) {
      return;
    }
    
    // Create channel
    var channel = {
      nodeType: 'CHANNEL',
      refId: refId,
      channelValue: channelValue,
      name: name,
      title: title,
      description: description,
      dataflow: dataflow,
      dataflowDescription: dataflowDescription,
      dataflowStartPoint: dataflowStartPoint,
      dataflowEndPoint: dataflowEndPoint,
    };
    // Dispatch `configure-channel` event
    dispatchConfigureChannelEvent(channel);
    // Hide modal
    modal('#ModalAddChannel', 'hide');
  }

  // Constructor
  useEffect(() => {
    // Validate Upload Form
    const validator = jQuery('#ConfigureChannelForm').validate({
      rules: {
        
      },
      messages: {
        
      },
      invalidHandler: function(event, validator) {
        
      },
    });

    // Validator ref.
    window.validator = validator;

    // Channels
    let channels = getChannels();
    setChannels(channels);

    // When modal is shown on UI 
    jQuery('#ModalAddChannel').on('shown.bs.modal', function (e) {
      // Check for existing property
      if (window.ChannelLinkProperty) {
        // Get Link Property
        let linkProperty = window.ChannelLinkProperty;
        // Link ref. ID
        let refId = linkProperty['refId'];
        
        // Get previous channel data (if any) from KeyStore
        let previousData = getAutoKeyStore(refId);
        if (previousData) {
          //
          setName(previousData['channel']['name']);
          setTitle(previousData['channel']['title']);
          setDescription(previousData['channel']['description']);
          setDataflow(previousData['channel']['dataflow']);
          setDataflowDescription(previousData['channel']['dataflowDescription']);

          // Select-picker
          jQuery('#add-channel-channelValue').val(previousData['channel']['channelValue']);
        } 
        
        // Reset form inputs
        else {
          setChannelValue(channels[0]);
          setName("");
          setTitle("");
          setDescription("");
          setDataflow("");
          setDataflowDescription("");
        }

        // Fill system-property
        setRefId(linkProperty['refId']);
        setDataflowStartPoint(linkProperty['sourcePortName']);
        setDataflowEndPoint(linkProperty['targetPortName']);
        //
        jQuery('.select-for-add-channel').selectpicker('refresh');
      }
    });
    
    //
    window.onbeforeunload = function() { return "Your work will be lost."; };
  }, []);

  //
  return (
    <div>
      <div className="modal fade" id="ModalAddChannel" tabIndex="-1" data-keyboard="false" data-backdrop="static">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">

            <form id="ConfigureChannelForm" className="form-has-validations">
              <div className="modal-header">
                <h4 className="modal-title text-primary">
                  Configure <b>Channel</b>
                </h4>
                <button type="button" className="close" data-dismiss="modal">
                  <span>&times;</span>
                </button>
              </div>
              <div className="modal-body">
                
                <div className="form-group row">
                  <div className="col-4 text-muted">
                    Channel
                  </div>
                  <div className="col-8">
                    <select className="form-control select-for-add-channel" id="add-channel-channelValue" name="channelValue" value={channelValue} onChange={e => setChannelValue(e.target.value)} required>
                    {
                      channels.map(c => {
                        return(
                          <option key={c} value={c}>{c}</option>
                        )
                      })
                    }
                    </select>
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
                    Name
                  </div>
                  <div className="col-8">
                    <input type="text" className="form-control md-form-control" placeholder="Name" autoFocus={true} name="name" value={name} onChange={e => setName(e.target.value)} required id="ChannelName" />
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
                    Dataflow
                  </div>
                  <div className="col-8">
                    <input type="text" className="form-control md-form-control" placeholder="Dataflow" name="dataflow" value={dataflow} onChange={e => setDataflow(e.target.value)} required />
                  </div>
                </div>

                <div className="form-group row">
                  <div className="col-4 text-muted">
                    Dataflow Description
                  </div>
                  <div className="col-8">
                    <input type="text" className="form-control md-form-control" placeholder="Dataflow Description" name="dataflowDescription" value={dataflowDescription} onChange={e => setDataflowDescription(e.target.value)} />
                  </div>
                </div>

                <div className="form-group row">
                  <div className="col-4 text-muted">
                    Dataflow Start Point
                  </div>
                  <div className="col-8">
                    <input type="text" className="form-control md-form-control" placeholder="Dataflow Start Point" name="dataflowStartPoint" value={dataflowStartPoint} onChange={e => setDataflowStartPoint(e.target.value)} required />
                  </div>
                </div>
                
                <div className="form-group row">
                  <div className="col-4 text-muted">
                    Dataflow End Point
                  </div>
                  <div className="col-8">
                    <input type="text" className="form-control md-form-control" placeholder="Dataflow End Point" name="dataflowEndPoint" value={dataflowEndPoint} onChange={e => setDataflowEndPoint(e.target.value)} required />
                  </div>
                </div>
                
              </div>
              <div className="modal-footer">
                <div className="row w-100">
                  <div className="col-6 text-left m-0 p-0">
                    
                  </div>
                  <div className="col-6 text-right m-0 p-0">
                    <button type="button" className="btn btn-primary" onClick={configureChannel}>
                      Configure <b>Channel</b>
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

export default ModalAddChannel;