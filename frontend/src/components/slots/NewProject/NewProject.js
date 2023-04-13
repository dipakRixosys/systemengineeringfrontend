import { useEffect, useState } from "react";
import CreatableSelect from 'react-select/creatable';
import { httpGet, apify, httpPost } from "helpers/network";
import { nullIfEmpty, swalPopup, getUniqueListBy } from "helpers/common";
import PlaceholderLoader from "components/ui/placeholder-loader/placeholder-loader";
import { useHistory } from "react-router-dom";
import { useCallback } from "react";
// jQuery
const jQuery = window.jQuery;

// Slot > New Project
function NewProjectSlot() {
  //
  const [groups, setGroups] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [oemPartners, setOemPartners] = useState([]);
  const [oemPartner, setOemPartner] = useState('');
  const [vehiclePrograms, setVehiclePrograms] = useState([]);
  const [vehicleProgram, setVehicleProgram] = useState('');
  const [modelYear, setModelYear] = useState('');
  const [topologySidebar, setTopologySidebar] = useState(false);
  const [topologyImage, setTopologyImage] = useState(undefined);

  //
  const history = useHistory();

  // Effect
  useEffect(() => {
    //
    httpGet(apify('app/projects')).then(data => {
      //
      let groups = []; 
      //
      data['groups'].forEach(group => {
        //
        groups.push({
          label: group['name'],
          value: group['name'],
          oem_partners: group['oem_partners'],
        });

      });

      //
      setGroups(groups);
      setOemPartners([]);
      setVehiclePrograms([]);
      setModelYear(2026);
    });

    //
  }, []);
  
  //
  function openEETopologySidebar(ev) {
    ev.preventDefault();
    //
    httpGet(apify('app/ee-topology')).then(data => {
      //
      try {
        var defaultTopologyImage = `${data['eeTopology'][0]['image_path']}`;
        setTopologyImage(defaultTopologyImage);
        setTopologySidebar(true);
      } 

      //
      catch (error) {
        alert("Something went wrong when fetched EE-Topology image.");
      }
    });
  }

  //
  function closeEETopologySidebar(ev) {
    ev.preventDefault();
    setTopologySidebar(false);
  }

  //
  function submitNewProject(ev) {
    ev.preventDefault();
    //
    var errorKeys = [];
    //
    if (nullIfEmpty(groupName) === null) { errorKeys.push('groupName'); }
    if (nullIfEmpty(oemPartner) === null) { errorKeys.push('oemPartner'); }
    if (nullIfEmpty(vehicleProgram) === null) { errorKeys.push('vehicleProgram'); }
    if (nullIfEmpty(modelYear) === null) { errorKeys.push('modelYear'); }

    //
    jQuery('.text-error').addClass('d-none');
    errorKeys.forEach(key => {
      jQuery('.text-error').each(function(idx, error) {
        if (jQuery(error).attr('data-validation-key') === key) {
          jQuery(error).removeClass('d-none');
        }
      })
    });

    //
    let hasValidationError = (errorKeys.length > 0);
    errorKeys = [];

    //
    if (!hasValidationError) {
      //
      let params = {
        'groupName': groupName,
        'oemParnterName': oemPartner,
        'vehicleProgramName': vehicleProgram,
        'modelYear': modelYear,
      };
      //
      httpPost(apify('app/projects/add'), params).then(() => {
        swalPopup("New project added.", 'success', () => {
          history.push("/dashboard/new-program");
        });
      }).catch(() => {
        swalPopup("Something went wrong.");
      });
    }
  }

  //
  function fillSelectValue(ev, setCallback) {
    if (ev) {
      setCallback(ev.value);
      
      if (ev['vehiclePrograms']) {
        let vehiclePrograms = [];
        
        Object.keys(ev['vehiclePrograms']).map(program => {
          vehiclePrograms.push({
            label: program,
            value: program,
          });
          return true;
        });
        
        vehiclePrograms = getUniqueListBy(vehiclePrograms, 'value');

        setVehiclePrograms(vehiclePrograms);
      }
      
      
    } else {
      setCallback('');
    }
  }

  //
  const populateOemPartners = useCallback(() => {
    let partners = [];
    groups.forEach(group => {
      if (group['value'] === groupName) {
        group['oem_partners'].forEach(partner => {
          partners.push({
            label: partner['name'],
            value: partner['name'],
            vehiclePrograms: partner['vehiclePrograms'],
          });
        });
      }
    });
    setOemPartners(partners);
  }, [groups, groupName]);

  //
  useEffect(() => {
    populateOemPartners();
  }, [groupName, populateOemPartners]);

  //
  return(
    <div>
      {/* New Program */}
      {
        true
        &&
        <form onSubmit={submitNewProject} id="AddNewProject" className="form-has-validations">
          <div className="card">
            <div className="card-header">
              <h3>Create New Project</h3>
            </div>
            
            <div className="card-body">
              
              <div className="form-group row">
                <div className="col-4 text-muted">
                  Group
                </div>
                <div className="col-8">
                  <CreatableSelect
                    isClearable
                    onChange={ev => fillSelectValue(ev, setGroupName)}
                    options={groups}
                  />
                  <span className="text-danger text-error d-none" data-validation-key="groupName">Please provide Group Name.</span>
                </div>
              </div>

              {
                (oemPartners.length > 0 || true) && 
                <div className="form-group row">
                  <div className="col-4 text-muted">
                    OEM/Tier 1
                  </div>
                  <div className="col-8">
                    <CreatableSelect
                      isClearable
                      onChange={ev => fillSelectValue(ev, setOemPartner)}
                      options={oemPartners}
                    />
                    <span className="text-danger text-error d-none" data-validation-key="oemPartner">Please provide OEM Partner Name.</span>
                  </div>
                </div>
              }

              {
                (vehiclePrograms.length > 0 || true) && 
                <div className="form-group row">
                  <div className="col-4 text-muted">
                    Vehicle Program
                  </div>
                  <div className="col-8">
                    <CreatableSelect
                      isClearable
                      onChange={ev => fillSelectValue(ev, setVehicleProgram)}
                      options={vehiclePrograms}
                    />
                    <span className="text-danger text-error d-none" data-validation-key="vehicleProgram">Please provide Vehicle Program.</span>
                  </div>
                </div>
              }
              
              {
                (vehiclePrograms.length > 0 || true) && 
                <div className="form-group row">
                  <div className="col-4 text-muted">
                    Model Year
                  </div>
                  <div className="col-8">
                    <div className="row">
                      <div className="col-7">
                        <input type="number" className="form-control md-form-control" placeholder="Year" value={modelYear} onChange={e => setModelYear(e.target.value)} required />
                        <span className="text-danger text-error d-none" data-validation-key="modelYear">Please provide Model Year.</span>
                      </div>
                      <div className="col-5">
                        <a className="link-sm" href="!#" title="Click to view EE Topology" onClick={openEETopologySidebar}>
                          View EE Topology
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              }

            </div>

            <div className="card-footer py-4">
              <button className="btn btn-success btn-lg">
                Create Project
              </button>
            </div>
          </div>
        </form>
      }

      {
        topologySidebar && 
        <div className="Sidebar RightSidebar">
          <div className="content w-75">
            <div className="close-button m-3">
              <button className="btn btn-outline-info btn-sm" onClick={closeEETopologySidebar}>
                <i className="fa fa-times mr-2"></i>
                Close
              </button>
            </div>
            
            <div className="card">
              <div className="card-header">
                <h3>View <b>EE Topology</b></h3>
              </div>
              <div className="card-body">
                {
                  topologyImage && 
                  <div>
                    <img src={topologyImage} className="ee-topology-full-preview" alt="EE Topology" />
                  </div>
                }
                {
                  !topologyImage && 
                  <div>
                    <PlaceholderLoader />
                  </div>
                }
              </div>
              <div className="card-footer">
                
              </div>
            </div>
            
          </div>
        </div>
      }
    </div>
  );
}

//
export default NewProjectSlot;