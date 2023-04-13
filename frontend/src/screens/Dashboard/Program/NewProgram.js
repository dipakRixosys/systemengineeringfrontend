// React
import { useState, useEffect } from "react";
import { Link, useHistory } from "react-router-dom";
// React Select
import Select from 'react-select'
// Layout
import DashboardLayout from "screens/Layouts/DashboardLayout";
// Helpers
import { setTitle, getUniqueListBy, nullIfEmpty, swalPopup } from "helpers/common";
import { httpGet, apify, httpPost } from "helpers/network";
// Loader
import PlaceholderLoader from "components/ui/placeholder-loader/placeholder-loader";
// jQuery
const jQuery = window.jQuery;

// New Progrma
function NewProgram() {
  // Page Title
  setTitle("Create New Program");

  // History context
  const history = useHistory();

  // Data
  const [groups, setGroups] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [oemPartners, setOemPartners] = useState([]);
  const [oemPartner, setOemPartner] = useState('');
  const [vehiclePrograms, setVehiclePrograms] = useState([]);
  const [vehicleProgram, setVehicleProgram] = useState('');
  const [modelYears, setModelYears] = useState([]);
  const [modelYear, setModelYear] = useState('');
  const [systems, setSystems] = useState([]);
  const [systemValue, setSystemValue] = useState('');
  const [phases, setPhases] = useState([]);
  const [phaseValue, setPhaseValue] = useState('');
  // Data > Topology sidebar
  const [topologySidebar, setTopologySidebar] = useState(false);
  const [topologyImage, setTopologyImage] = useState(undefined);

  // Constructor
  useEffect(() => {

    // Phases
    httpGet(apify('app/phases')).then(data => {
      var phases = [];
      data['phases'].forEach(e => {
        phases.push({
          label: e['phase'],
          value: e['phase'],
        });
      });
      //
      setPhases(phases);
    });

    // ECUs
    httpGet(apify('app/ecu')).then(data => {
      var ecu = [];
      data['ecuList'].forEach(e => {
        ecu.push({
          label: e['name'],
          value: e['id'],
        });
      });
      //
    });

    // Systems
    httpGet(apify('app/systems')).then(data => {
      var systems = [];
      data['systems'].forEach(e => {
        systems.push({
          label: e['name'],
          value: e['id'],
        });
      });
      //
      setSystems(systems);
    });

    // Projects
    httpGet(apify('app/projects')).then(data => {
      //
      var groups = [];
      //
      data['groups'].forEach(group => {
        //
        groups.push({
          label: group['name'],
          value: group['id'],
          oem_partners: group['oem_partners'],
        });
      });

      //
      setGroups(groups);
    });

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
  function fillSelectValue(ev, setCallback) {
    if (ev) {
      setCallback(ev.value);

      //
      if (ev['oem_partners']) {
        var partners = [];
        ev['oem_partners'].forEach(partner => {
          partners.push({
            label: partner['name'],
            value: partner['id'],
            vehiclePrograms: partner['vehiclePrograms'],
          });
        });
        setOemPartners(partners);
      }

      //
      if (ev['vehiclePrograms']) {
        var vehiclePrograms = [];
        Object.keys(ev['vehiclePrograms']).map(program => {
          //
          vehiclePrograms.push({
            label: program,
            value: program,
            modelYears: ev['vehiclePrograms'][program],
          });
          return true;
        });
        vehiclePrograms = getUniqueListBy(vehiclePrograms, 'value');
        setVehiclePrograms(vehiclePrograms);
      }

      //
      if (ev['modelYears']) {
        var modelYears = [];
        ev['modelYears'].forEach(y => {
          modelYears.push({
            label: y['year'],
            value: y['id'],
          });
        });
        modelYears = getUniqueListBy(modelYears, 'value');
        setModelYears(modelYears);
      }

    } else {
      setCallback('');
    }
  }

  // Submit new program
  function submitNewProgram(ev) {
    ev.preventDefault();

    // Error keys
    var errorKeys = [];
    if (nullIfEmpty(groupName) === null) { errorKeys.push('groupName'); }
    if (nullIfEmpty(oemPartner) === null) { errorKeys.push('oemPartner'); }
    if (nullIfEmpty(vehicleProgram) === null) { errorKeys.push('vehicleProgram'); }
    if (nullIfEmpty(modelYear) === null) { errorKeys.push('modelYear'); }
    if (nullIfEmpty(systemValue) === null) { errorKeys.push('systemValue'); }
    if (nullIfEmpty(phaseValue) === null) { errorKeys.push('phaseValue'); }

    // Errors
    jQuery('.text-error').addClass('d-none');
    errorKeys.forEach(key => {
      jQuery('.text-error').each(function (idx, error) {
        if (jQuery(error).attr('data-validation-key') === key) {
          jQuery(error).removeClass('d-none');
        }
      })
    });

    // Validation Error
    let hasValidationError = (errorKeys.length > 0);
    errorKeys = [];

    if (!hasValidationError) {

      //
      let params = {
        'groupId': groupName,
        'oemParnterId': oemPartner,
        'vehicleProgramId': modelYear,
        'systemId': systemValue,
        'phase': phaseValue,
      };

      //
      httpPost(apify('app/programs/add'), params).then((res) => {
        if (res['success']) {

          let message = 'New program added.';
          let status = 'success';

          if (res['existingProgram']) {
            message = 'Program Already Exist';
            status = 'failed';
          }

          swalPopup(message, status, () => {
            let nextUrl = `/dashboard/program/${res['programUuid']}`;
            history.push(nextUrl);
          });
        }
      }).catch((error) => {
        console.log(error)

        if (error['xhrJson'] && error['xhrJson']['errorMessage']) {
          swalPopup(error['xhrJson']['errorMessage']);
        } else {
          swalPopup("Something went wrong.");
        }

      });

    }
  }

  // UI
  return (
    <div>
      <DashboardLayout allowDemoMode={true}>
        <div className="container-fluid">
          <div className="row">
            <div className="col-12 col-lg-5">

              <form onSubmit={submitNewProgram}>
                <div className="card">
                  <div className="card-header">
                    <h3>Create New Program</h3>
                    <small className="text-muted">
                      Use this form to define item definition in system.
                    </small>
                  </div>

                  <div className="card-body">

                    <div className="form-group row">
                      <div className="col-4 text-muted">
                        Group
                      </div>
                      <div className="col-8">
                        <Select options={groups} onChange={ev => fillSelectValue(ev, setGroupName)} />
                        <span className="text-danger text-error d-none" data-validation-key="groupName">Please select Group.</span>
                      </div>
                    </div>

                    <div className="form-group row">
                      <div className="col-4 text-muted">
                        OEM/Tier 1
                      </div>
                      <div className="col-8">
                        <Select options={oemPartners} onChange={ev => fillSelectValue(ev, setOemPartner)} />
                        <span className="text-danger text-error d-none" data-validation-key="oemPartner">Please select OEM Partner.</span>
                      </div>
                    </div>

                    <div className="form-group row">
                      <div className="col-4 text-muted">
                        Vehicle Program
                      </div>
                      <div className="col-8">
                        <Select options={vehiclePrograms} onChange={ev => fillSelectValue(ev, setVehicleProgram)} />
                        <span className="text-danger text-error d-none" data-validation-key="vehicleProgram">Please select Vehicle Program.</span>
                      </div>
                    </div>

                    <div className="form-group row">
                      <div className="col-4 text-muted">
                        Model Year
                      </div>
                      <div className="col-8">
                        <div className="row">
                          <div className="col-7">
                            <Select options={modelYears} onChange={ev => fillSelectValue(ev, setModelYear)} />
                            <span className="text-danger text-error d-none" data-validation-key="modelYear">Please select Model Year.</span>
                          </div>
                          <div className="col-5">
                            <a className="link-sm link-with-border" href="!#" title="Click to view EE Topology" onClick={openEETopologySidebar}>
                              View EE Topology
                            </a>
                          </div>
                        </div>
                        {
                          true &&
                          <Link to="/dashboard/new-project" className="btn btn-sm btn-info mt-2 text-white">
                            Create New Project
                          </Link>
                        }
                      </div>
                    </div>

                    <div className="form-group row">
                      <div className="col-4 text-muted">
                        Select System
                      </div>
                      <div className="col-8">
                        <Select options={systems} onChange={ev => fillSelectValue(ev, setSystemValue)} />
                        <span className="text-danger text-error d-none" data-validation-key="systemValue">Please select system.</span>
                        {
                          true &&
                          <Link to="/dashboard/new-system" className="btn btn-sm btn-info mt-2 text-white">
                            Create New System
                          </Link>
                        }
                      </div>
                    </div>

                    <div className="form-group row">
                      <div className="col-4 text-muted">
                        Phase
                      </div>
                      <div className="col-8">
                        <Select options={phases} onChange={ev => fillSelectValue(ev, setPhaseValue)} />
                        <span className="text-danger text-error d-none" data-validation-key="phaseValue">Please select Project Phase.</span>
                      </div>
                    </div>

                  </div>

                  <div className="card-footer py-4">
                    <button type="submit" className="btn btn-success btn-lg">
                      Create Program
                    </button>
                  </div>
                </div>
              </form>

            </div>
          </div>
        </div>
      </DashboardLayout>


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
  )
}

//
export default NewProgram;