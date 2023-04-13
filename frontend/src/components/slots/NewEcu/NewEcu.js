import { useState } from "react";
import { httpPostMultipart, apify } from "helpers/network";
import { swalPopup } from "helpers/common";
import { useHistory } from "react-router-dom";

// Slot > New ECU
function NewEcuSlot() {
  const [configrable, setConfigrable] = useState(false);
  const history = useHistory();

  // Submit 
  function submitCreateEcu(ev) {
    ev.preventDefault();

    const form = ev.currentTarget;
    
    // Create an FormData object 
    var params = new FormData(form);

    httpPostMultipart(apify('app/ecu/add'), params).then(data => {
      swalPopup("New ECU added.", 'success');
      history.push("/dashboard/new-program");
    }).catch(() => {
      swalPopup("Something went wrong.");
    });
  }

  // UI
  return (
    <div>
      {
        true
        &&
        <div className="card">
          <form onSubmit={submitCreateEcu} encType="multipart/form-data" method="post">
            <div className="card-header">
              <h3>Create New ECU</h3>
              <small className="text-muted">
                Use this form to define new ECU in system.
              </small>
            </div>

            <div className="card-body">
              <div className="form-group row">
                <label className="col-4 text-muted">ECU Acronym</label>
                <input className="form-control md-form-control col-8" name="acronym" placeholder="ECU Acronym" autoFocus required />
              </div>
              <div className="form-group row">
                <label className="col-4 text-muted">ECU Full Name</label>
                <input className="form-control md-form-control col-8" name="name" placeholder="ECU FUll Name" required />
              </div>

              <div className="form-group row">
                <div className="col-12 has-checkbox">
                  <input type="checkbox" id="submitReview" className='mr-2' value={``} onChange={(event) => {
                    if (event.currentTarget.checked) {
                      setConfigrable(true)
                    } else {
                      setConfigrable(false)
                    }
                  }} />
                  <label>
                    Configure Component
                  </label>

                </div>
              </div>

              {
                configrable && <div>
                  <div className="form-group row">
                    <label className="col-4 text-muted">ECU Details</label>
                    <input className="form-control md-form-control col-8" name="ecu_details" placeholder="ECU Details" />
                  </div>
                  <div className="form-group row">
                    <label className="col-4 text-muted">OEM CS Manager</label>
                    <input className="form-control md-form-control col-8" name="oem_cs_manager" placeholder="OEM CS Manager" />
                  </div>
                  <div className="form-group row">
                    <label className="col-4 text-muted">ECU Supplier</label>
                    <input className="form-control md-form-control col-8" name="ecu_supplier" placeholder="ECU Supplier" />
                  </div>
                  <div className="form-group row">
                    <label className="col-4 text-muted">ECU Supplier Manager</label>
                    <input className="form-control md-form-control col-8" name="ecu_supplier_manager" placeholder="ECU Supplier Manager" />
                  </div>
                  <div className="form-group row">
                    <label className="col-4 text-muted">ECU Technical Data Sheet</label>
                    <input className="form-control md-form-control col-8" name="edu_technical_data_sheet" placeholder="ECU Supplier Manager" />
                  </div>
                  <div className="form-group row">
                    <label className="col-4 text-muted">Channel</label>
                    <input className="form-control md-form-control col-8" name="channel" placeholder="ECU Supplier Manager" />
                  </div>
                  <div className="form-group row">
                    <label className="col-4 text-muted">CPU Type</label>
                    <input className="form-control md-form-control col-8" name="cpu_type" placeholder="CPU Type" />
                  </div>
                  <div className="form-group row">
                    <label className="col-4 text-muted">RAM Size</label>
                    <input className="form-control md-form-control col-8" name="ram_size" placeholder="RAM Size" />
                  </div>
                  <div className="form-group row">
                    <label className="col-4 text-muted">ROM Size</label>
                    <input className="form-control md-form-control col-8" name="rom_size" placeholder="ROM Size" />
                  </div>
                  <div className="form-group row">
                    <label className="col-4 text-muted">CPU Core Type</label>
                    <input className="form-control md-form-control col-8" name="cpu_core_hsm_type" placeholder="CPU Core Type" />
                  </div>
                  <div className="form-group row">
                    <label className="col-4 text-muted">Internal Flash Type</label>
                    <input className="form-control md-form-control col-8" name="internal_flash_type" placeholder="Internal Flash Type" />
                  </div>
                  <div className="form-group row">
                    <label className="col-4 text-muted">External Flash Type</label>
                    <input className="form-control md-form-control col-8" name="external_flash_type" placeholder="External Flash Type" />
                  </div>
                  <div className="form-group row">
                    <label className="col-4 text-muted">eMMC Size</label>
                    <input className="form-control md-form-control col-8" name="emmc_size" placeholder="eMMC Size" />
                  </div>
                  <div className="form-group row">
                    <label className="col-4 text-muted">Switch Type</label>
                    <input className="form-control md-form-control col-8" name="switch_type" placeholder="Switch Type" />
                  </div>
                  <div className="form-group row">
                    <label className="col-4 text-muted">Switch CPU</label>
                    <input className="form-control md-form-control col-8" name="switch_cpu" placeholder="Switch CPU" />
                  </div>
                  <div className="form-group row">
                    <label className="col-4 text-muted">Does ECU store Personal Data?</label>
                    <select className="form-control md-form-control col-8" name="does_ecu_store_persional_data">
                      <option>Yes</option>
                      <option>No</option>
                    </select>
                  </div>
                  <div className="form-group row">
                    <label className="col-4 text-muted">Author</label>
                    <input className="form-control md-form-control col-8" name="auther" placeholder="Author" />
                  </div>
                  <div className="form-group row">
                    <label className="col-4 text-muted">Reviewer</label>
                    <input className="form-control md-form-control col-8" name="reviewer" placeholder="Reviewer" />
                  </div>
                  <div className="form-group row">
                    <label className="col-4 text-muted">ECU Hardware Details</label>
                    <input className="form-control md-form-control col-8" name="ecu_hardware_details" placeholder="ECU Hardware Details" />
                  </div>
                  <div className="form-group row">
                    <label className="col-4 text-muted">CS Analyst Start Date</label>
                    <input type="date" name="cs_analysis_start_date" className="form-control md-form-control col-8" />
                  </div>
                  <div className="form-group row">
                    <label className="col-4 text-muted">CS Analyst End Date</label>
                    <input type="date" name="cs_analysis_end_date" className="form-control md-form-control col-8" />
                  </div>
                  <div className="form-group row">
                    <label className="col-4 text-muted">Project Plan/Schedule</label>
                    <input type="file" name="project_plan" className="col-8" />
                  </div>
                  <div className="form-group row">
                    <label className="col-4 text-muted">Notes</label>
                    <input className="form-control md-form-control col-8" name="notes" placeholder="Notes" />
                  </div>
                </div>
              }

            </div>

            <div className="card-footer py-4">
              <button type="submit" className="btn btn-success btn-lg">
                Create ECU
              </button>
            </div>
          </form>
        </div>
      }
    </div>
  );
}

export default NewEcuSlot;