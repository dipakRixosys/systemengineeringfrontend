// React
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
// DataTable
import DataTable from 'react-data-table-component';
// Layout
import DashboardLayout from "screens/Layouts/DashboardLayout";
// Helper
import { setTitle, modal, swalPopup } from "helpers/common";
// Network helper
import { httpGet, apify, httpPostMultipart } from "helpers/network";
// Loader
import PlaceholderLoader from "components/ui/placeholder-loader/placeholder-loader";
// Datatable Loader
import DatatableLoader from "components/ui/datatable-loader/datatable-loader";
// Datatable No Rows
import DatatableNoRows from "components/ui/datatable-no-rows/datatable-no-rows";

// List ECUs
function ListEcu() {
  // Title
  setTitle("List ECUs");

  // Data
  const [columns, setColumns] = useState([]);
  const [tableRows, setTableRows] = useState([]);
  const [activeEcu, setActiveEcu] = useState(undefined);
  const [ecuProgressPending, setEcuProgressPending] = useState(true);

  // Edit ECU
  const editEdu = useCallback((ecu) => {
    setActiveEcu({});
    setActiveEcu(ecu);
  }, []);


  // Update ECU (Ajax-call)
  function updateEdu(ev) {
    ev.preventDefault();

    // Create an FormData object 
    const form = ev.currentTarget;
    var formData = new FormData(form);

    // Ajax-call
    httpPostMultipart(apify('app/ecu/edit'), formData).then(data => {
      swalPopup("EDU Configration Updated", 'success');
      modal('#ModalEcuEdit', 'hide');

    }).catch((data) => {
      swalPopup('Something Went Wrong');
    });
  }

  // Constructor
  useEffect(() => {
    // Set DataTable columns
    setColumns([
      {
        name: 'Acronym',
        selector: row => row.acronym,
        sortable: true,
      },
      {
        name: 'Name',
        selector: row => row.name,
      },
      {
        name: 'Configure',
        selector: row => row.name,
        right: true,
        cell: (row, index, column, id) => {
          return (
            <a className="link-sm link-with-border edit-ecu-button" href="!#" onClick={(ev) => {
              ev.preventDefault();

              document.getElementById("updateEdu").reset();
              setActiveEcu({});
              setActiveEcu(row);


              modal('#ModalEcuEdit', {
                show: true,
              });
            }}>
              Update
            </a>
          )
        }
      },
    ]);

    // Get ECU-list
    httpGet(apify('app/ecu')).then(data => {
      setTableRows(data['ecuList']);
      setEcuProgressPending(false);
    });



  }, [editEdu]);

  // UI
  return (
    <div>
      <DashboardLayout>
        <div className="container-fluid">
          <div className="row">
            <div className="col-12 col-lg-6">

              <div className="card">
                <div className="card-header">
                  <h3>ECUs</h3>
                </div>
                <div className="card-body p-0">
                  <DataTable
                    columns={columns}
                    data={tableRows}
                    progressPending={ecuProgressPending}
                    progressComponent={<DatatableLoader />}
                    noDataComponent={<DatatableNoRows text="There are no ECUs in system." />}
                    pagination
                  />
                </div>
                <div className="card-footer">
                  <Link to="/dashboard/new-ecu" className="btn btn-info btn-lg text-white">
                    Create <b>New ECU</b>
                  </Link>
                </div>
              </div>

            </div>
          </div>

        </div>

        {
          true &&
          <div className="modal fade" id="ModalEcuEdit" tabIndex="-1">
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <form onSubmit={updateEdu} encType="multipart/form-data" method="post" name="fileinfo" id="updateEdu">
                  <div className="modal-header">
                    <h4 className="modal-title text-primary">
                      Update <b>ECU</b>
                    </h4>
                    <button type="button" className="close" data-dismiss="modal">
                      <span>&times;</span>
                    </button>
                  </div>
                  <div className="modal-body fixed-height">
                    {
                      !activeEcu &&
                      <PlaceholderLoader />
                    }

                    {
                      activeEcu &&
                      <div>
                        <h4 class="border-top border-bottom w-100 text-primary font-weight-bold py-1 pt-3">Generic Component Information</h4>

                        <div className="form-group">
                          {/* <label>UUID</label> */}
                          <input type="hidden" className="form-control md-form-control" name="uuid" placeholder="ECU Details" defaultValue={activeEcu['uuid']} />
                        </div>
                        <div className="form-group">
                          <label>ECU Acronym</label>
                          <input className="form-control md-form-control" defaultValue={activeEcu['acronym']} name="acronym" placeholder="ECU Acronym" required />
                        </div>
                        <div className="form-group">
                          <label>ECU Full Name</label>
                          <input className="form-control md-form-control" defaultValue={activeEcu['name']} name="name" placeholder="ECU FUll Name" required />
                        </div>
                        <div className="form-group">
                          <label>ECU Details</label>
                          <input className="form-control md-form-control" defaultValue={activeEcu['ecu_details']} name="ecu_details" placeholder="ECU Details" />
                        </div>
                        <div className="form-group">
                          <label>OEM CS Manager</label>
                          <input className="form-control md-form-control" defaultValue={activeEcu['oem_cs_manager']} name="oem_cs_manager" placeholder="OEM CS Manager" />
                        </div>
                        <div className="form-group">
                          <label>ECU Supplier</label>
                          <input className="form-control md-form-control" defaultValue={activeEcu['ecu_supplier']} name="ecu_supplier" placeholder="ECU Supplier" />
                        </div>
                        <div className="form-group">
                          <label>ECU Supplier Manager</label>
                          <input className="form-control md-form-control" defaultValue={activeEcu['ecu_supplier_manager']} name="ecu_supplier_manager" placeholder="ECU Supplier Manager" />
                        </div>
                        <div className="form-group">
                          <label>ECU Technical Data Sheet</label>
                          <input className="form-control md-form-control" defaultValue={activeEcu['edu_technical_data_sheet']} name="edu_technical_data_sheet" placeholder="ECU Supplier Manager" />
                        </div>
                        <div className="form-group">
                          <label>Channel</label>
                          <input className="form-control md-form-control" defaultValue={activeEcu['channel']} name="channel" placeholder="ECU Supplier Manager" />
                        </div>
                        <div className="form-group">
                          <label>CPU Type</label>
                          <input className="form-control md-form-control" defaultValue={activeEcu['cpu_type']} name="cpu_type" placeholder="CPU Type" />
                        </div>
                        <div className="form-group">
                          <label>RAM Size</label>
                          <input className="form-control md-form-control" defaultValue={activeEcu['ram_size']} name="ram_size" placeholder="RAM Size" />
                        </div>
                        <div className="form-group">
                          <label>ROM Size</label>
                          <input className="form-control md-form-control" defaultValue={activeEcu['rom_size']} name="rom_size" placeholder="ROM Size" />
                        </div>
                        <div className="form-group">
                          <label>CPU Core Type</label>
                          <input className="form-control md-form-control" defaultValue={activeEcu['cpu_core_hsm_type']} name="cpu_core_hsm_type" placeholder="CPU Core Type" />
                        </div>
                        <div className="form-group">
                          <label>Internal Flash Type</label>
                          <input className="form-control md-form-control" defaultValue={activeEcu['internal_flash_type']} name="internal_flash_type" placeholder="Internal Flash Type" />
                        </div>
                        <div className="form-group">
                          <label>External Flash Type</label>
                          <input className="form-control md-form-control" defaultValue={activeEcu['external_flash_type']} name="external_flash_type" placeholder="External Flash Type" />
                        </div>
                        <div className="form-group">
                          <label>eMMC Size</label>
                          <input className="form-control md-form-control" defaultValue={activeEcu['emmc_size']} name="emmc_size" placeholder="eMMC Size" />
                        </div>
                        <div className="form-group">
                          <label>Switch Type</label>
                          <input className="form-control md-form-control" defaultValue={activeEcu['switch_type']} name="switch_type" placeholder="Switch Type" />
                        </div>
                        <div className="form-group">
                          <label>Switch CPU</label>
                          <input className="form-control md-form-control" defaultValue={activeEcu['switch_cpu']} name="switch_cpu" placeholder="Switch CPU" />
                        </div>
                        <div className="form-group">
                          <label>Does ECU store Personal Data?</label>
                          <select className="form-control md-form-control" name="does_ecu_store_persional_data">
                            <option>Yes</option>
                            <option>No</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Author</label>
                          <input className="form-control md-form-control" defaultValue={activeEcu['auther']} name="auther" placeholder="Author" />
                        </div>
                        <div className="form-group">
                          <label>Reviewer</label>
                          <input className="form-control md-form-control" defaultValue={activeEcu['reviewer']} name="reviewer" placeholder="Reviewer" />
                        </div>
                        <div className="form-group">
                          <label>ECU Hardware Details</label>
                          <input className="form-control md-form-control" defaultValue={activeEcu['ecu_hardware_details']} name="ecu_hardware_details" placeholder="ECU Hardware Details" />
                        </div>
                        <div className="form-group">
                          <label>CS Analyst Start Date</label>
                          <input type="date" defaultValue={activeEcu['cs_analysis_start_date']} name="cs_analysis_start_date" className="form-control md-form-control" />
                        </div>
                        <div className="form-group">
                          <label>CS Analyst End Date</label>
                          <input type="date" defaultValue={activeEcu['cs_analysis_end_date']} name="cs_analysis_end_date" className="form-control md-form-control" />
                        </div>
                        <div className="form-group">
                          <label>Project Plan/Schedule</label>
                          <input type="file" name="project_plan" />
                        </div>
                        <div className="form-group">
                          <label>Notes</label>
                          <input className="form-control md-form-control" defaultValue={activeEcu['notes']} name="notes" placeholder="Notes" />
                        </div>

                        {<div>
                          <h4 class="border-top border-bottom w-100 text-primary font-weight-bold py-1 pt-3">Network Diagnostic Links</h4>
                          <div className="form-group">
                            <label>Which is the ECU primary communication link?</label>
                            <input type="text" defaultValue={activeEcu['details'] && activeEcu['details']['ECU-primary-communication-link']} name="ECU-primary-communication-link" className="form-control md-form-control" />
                          </div>
                          <div className="form-group">
                            <label>Which network is used for diagnostic functionality?</label>
                            <input type="text" defaultValue={activeEcu['details'] && activeEcu['details']['network-is-used-for-diagnostic-functionality']} name="network-is-used-for-diagnostic-functionality" className="form-control md-form-control" />
                          </div>
                          <div className="form-group">
                            <label>Are there other networks connected to the ECU? If yes, which networks?</label>
                            <input type="text" defaultValue={activeEcu['details'] && activeEcu['details']['networks-connected-to-the-ECU']} name="networks-connected-to-the-ECU" className="form-control md-form-control" />
                          </div>
                          <div className="form-group">
                            <label>If ECU communication link is LIN, provide Diagnostic class information (i.e. I,II or III ref ISO14229-7)</label>
                            <input type="text" defaultValue={activeEcu['details'] && activeEcu['details']['Diagnostic-class-information']} name="Diagnostic-class-information" className="form-control md-form-control" />
                          </div>
                          <div className="form-group">
                            <label>If ECU diagnostic class I or II which ECU acts as diagnostic server on its behalf?</label>
                            <input type="text" defaultValue={activeEcu['details'] && activeEcu['details']['ECU-acts-as-diagnostic-server-on-its-behalf']} name="ECU-acts-as-diagnostic-server-on-its-behalf" className="form-control md-form-control" />
                          </div>

                          <h4 class="border-top border-bottom w-100 text-primary font-weight-bold py-1 pt-3">AUTOSAR Platform</h4>
                          <div className="form-group">
                            <label>Is the ECU implementing AUTOSAR Diagnostic modules? If not, please provide details (e.g. AUTOSAR wrapper, etc)</label>
                            <input type="text" defaultValue={activeEcu['details'] && activeEcu['details']['ECU-implementing-AUTOSAR-Diagnostic-modules']} name="ECU-implementing-AUTOSAR-Diagnostic-modules" className="form-control md-form-control" />
                          </div>
                          <div className="form-group">
                            <label>Which version of Diagnostic Server or AUTOSAR components the ECU is implementing? (please provide AUTOSAR version)</label>
                            <input type="text" defaultValue={activeEcu['details'] && activeEcu['details']['version-of-Diagnostic-Server']} name="version-of-Diagnostic-Server" className="form-control md-form-control" />
                          </div>
                          <div className="form-group">
                            <label>If AUTOSAR modules are provided by a vendor, please provide vendor's name</label>
                            <input type="text" defaultValue={activeEcu['details'] && activeEcu['details']['vendors-name']} name="vendors-name" className="form-control md-form-control" />
                          </div>

                          <h4 class="border-top border-bottom w-100 text-primary font-weight-bold py-1 pt-3">Component software architecture</h4>
                          <div className="form-group">
                            <label>Which is the native file software delivery format?</label>
                            <input type="text" defaultValue={activeEcu['details'] && activeEcu['details']['native-file-software-delivery-format']} name="native-file-software-delivery-format" className="form-control md-form-control" />
                          </div>
                          <div className="form-group">
                            <label>Is the ECU a static or dynamic memory map based architecture? (i.e. software updates performed based on a fixed memory allocation or software copied on ECU as file based software update)</label>
                            <input type="text" defaultValue={activeEcu['details'] && activeEcu['details']['Is-ECU-static-dynamic-memory-map-based-architecture']} name="Is-ECU-static-dynamic-memory-map-based-architecture" className="form-control md-form-control" />
                          </div>
                          <div className="form-group">
                            <label>Is the software a 'signed' software?</label>
                            <select className="form-control md-form-control" name="Is-the-software-signed-software">
                              <option selected={activeEcu['details'] && activeEcu['details']['Is-the-software-signed-software'] === 'Yes'} value="Yes">Yes</option>
                              <option selected={activeEcu['details'] && activeEcu['details']['Is-the-software-signed-software'] === 'No'} value="No">No</option>
                            </select>
                          </div>
                          <div className="form-group">
                            <label>Provide Signature Details</label>
                            <input type="text" defaultValue={activeEcu['details'] && activeEcu['details']['Provide-Signature-Details']} name="Provide-Signature-Details" className="form-control md-form-control" />
                          </div>
                          <div className="form-group">
                            <label>Is the software architecture capable to sustain in house calibration work?</label>
                            <input type="text" defaultValue={activeEcu['details'] && activeEcu['details']['Is-the-software-architecture-capable-sustain-house-calibration-work']} name="Is-the-software-architecture-capable-sustain-house-calibration-work" className="form-control md-form-control" />
                          </div>
                          <div className="form-group">
                            <label>How much time will the ECU take to fully load the operating system and have the application running during a Power ON event?</label>
                            <input type="text" defaultValue={activeEcu['details'] && activeEcu['details']['time-will-the-ECU-take-fully-load-the-operating-system']} name="time-will-the-ECU-take-fully-load-the-operating-system" className="form-control md-form-control" />
                          </div>
                          <div className="form-group">
                            <label>If the ECU is awoken by an internal input or network activity how much time will it take the ECU application to be fully active?</label>
                            <input type="text" defaultValue={activeEcu['details'] && activeEcu['details']['ECU-is-awoken-by-an-internal-input-or-network-activity']} name="ECU-is-awoken-by-an-internal-input-or-network-activity" className="form-control md-form-control" />
                          </div>
                          {/*  */}
                          <h4 class="border-top border-bottom w-100 text-primary font-weight-bold py-1 pt-3">Component hardware architecture</h4>
                          <div className="form-group">
                            <label>Is the ECU a single microcontroller or a multi-microcontroller based architecture?</label>
                            <input type="text" defaultValue={activeEcu['details'] && activeEcu['details']['Is-the-ECU-single-microcontroller-multi-microcontroller-based-architecture']} name="Is-the-ECU-single-microcontroller-multi-microcontroller-based-architecture" className="form-control md-form-control" />
                          </div>
                          <div className="form-group">
                            <label>Will the ECU hardware architecture require special conditions to allow software updates to be performed? (e.g. specific power modes, vehicle states, etc) If yes, please provide details</label>
                            <input type="text" defaultValue={activeEcu['details'] && activeEcu['details']['Will-the-ECU-hardware-architecture-require-special-conditions']} name="Will-the-ECU-hardware-architecture-require-special-conditions" className="form-control md-form-control" />
                          </div>
                          <div className="form-group">
                            <label>Is the ECU hardware resources capable to sustain a dual memory banking for SW updates purposes?</label>
                            <input type="text" defaultValue={activeEcu['details'] && activeEcu['details']['Is-the-ECU-hardware-resources-capable-to-sustain']} name="Is-the-ECU-hardware-resources-capable-to-sustain" className="form-control md-form-control" />
                          </div>
                          <div className="form-group">
                            <label>Please specify ECU microcontroller Family and Derivative</label>
                            <input type="text" defaultValue={activeEcu['details'] && activeEcu['details']['ECU-microcontroller-Family-and-Derivative']} name="ECU-microcontroller-Family-and-Derivative" className="form-control md-form-control" />
                          </div>

                          <h4 class="border-top border-bottom w-100 text-primary font-weight-bold py-1 pt-3">Component software updates</h4>
                          <div className="form-group">
                            <label>Is the ECU software updatable? If yes what is the update method (e.g. UDS 14229)?</label>
                            <input type="text" defaultValue={activeEcu['details'] && activeEcu['details']['ECU-software-update-method']} name="ECU-software-update-method" className="form-control md-form-control" />
                          </div>
                          <div className="form-group">
                            <label>Is the ECU implementing a single Bootloader concept, i.e. Boot Manager and Bootloader?</label>
                            <input type="text" defaultValue={activeEcu['details'] && activeEcu['details']['Is-the-ECU-implementing-single-Bootloader-concept']} name="Is-the-ECU-implementing-single-Bootloader-concept" className="form-control md-form-control" />
                          </div>
                          <div className="form-group">
                            <label>If single bootloader concept is impelemented, is the bootloader updatable via bootloader updater?</label>
                            <input type="text" defaultValue={activeEcu['details'] && activeEcu['details']['If-single-bootloader-concept-is-impelemented']} name="If-single-bootloader-concept-is-impelemented" className="form-control md-form-control" />
                          </div>
                          <div className="form-group">
                            <label>Does the ECU require secondary bootloader to perform software updates?</label>
                            <input type="text" defaultValue={activeEcu['details'] && activeEcu['details']['ECU-require-secondary-bootloader-perform-software-updates']} name="ECU-require-secondary-bootloader-perform-software-updates" className="form-control md-form-control" />
                          </div>
                          <div className="form-group">
                            <label>Is the ECU requiring a 'fail safe mode activation' or a special procedure prior to initiating diagnostic programming session? If Yes, please provide details</label>
                            <input type="text" defaultValue={activeEcu['details'] && activeEcu['details']['Is-the-ECU-requiring-fail-safe-mode-activation']} name="Is-the-ECU-requiring-fail-safe-mode-activation" className="form-control md-form-control" />
                          </div>
                          <div className="form-group">
                            <label>What is the estimated software download time for all the software components within the ECU? (provide approx time in seconds and associated download-rate in Kbits/s or Mbit/s)</label>
                            <input type="text" defaultValue={activeEcu['details'] && activeEcu['details']['estimated-software-download-time-for-all-the-software-components']} name="estimated-software-download-time-for-all-the-software-components" className="form-control md-form-control" />
                          </div>
                          <div className="form-group">
                            <label>Is the ECU implementing or capable of secure boot? If yes, how long is the bootstrappting process of the ECU (provide aprox. Time in Milliseconds)</label>
                            <input type="text" defaultValue={activeEcu['details'] && activeEcu['details']['Is-the-ECU-implementing-or-capable-of-secure-boot']} name="Is-the-ECU-implementing-or-capable-of-secure-boot" className="form-control md-form-control" />
                          </div>
                          <div className="form-group">
                            <label>Is the bootloader supplied by a 3rd party vendor (if yes please provide details)</label>
                            <input type="text" defaultValue={activeEcu['details'] && activeEcu['details']['Is-the-bootloader-supplied-by-3rd-party-vendor']} name="Is-the-bootloader-supplied-by-3rd-party-vendor" className="form-control md-form-control" />
                          </div>
                          <div className="form-group">
                            <label>Which network is used to perform software updates on the ECU? (Please provide the details of the network used of software updates)</label>
                            <input type="text" defaultValue={activeEcu['details'] && activeEcu['details']['network-is-used-to-perform-software-updates']} name="network-is-used-to-perform-software-updates" className="form-control md-form-control" />
                          </div>
                          <div className="form-group">
                            <label>What is the max configured network layer buffer size for the ECU in both Programming as well as Application Default diagnostic session?</label>
                            <input type="text" defaultValue={activeEcu['details'] && activeEcu['details']['max-configured-network-layer-buffer-size-for-the-ECU']} name="max-configured-network-layer-buffer-size-for-the-ECU" className="form-control md-form-control" />
                          </div>
                          <div className="form-group">
                            <label>Which boot software features are implemented by default (e.g. Secure Boot/ Secure Bootloader, etc)?</label>
                            <input type="text" defaultValue={activeEcu['details'] && activeEcu['details']['boot-software-features-are-implemented-by-default']} name="boot-software-features-are-implemented-by-default" className="form-control md-form-control" />
                          </div>

                          <h4 class="border-top border-bottom w-100 text-primary font-weight-bold py-1 pt-3">Diagnostic Services and Diagnostic Data Implementation</h4>
                          <div className="form-group">
                            <label>Is the module fully UDS 14229 compliant on the diagnostic services implemented by the platform software?</label>
                            <input type="text" defaultValue={activeEcu['details'] && activeEcu['details']['Is-the-module-fully-UDS-14229-compliant-on-the-diagnostic-services']} name="Is-the-module-fully-UDS-14229-compliant-on-the-diagnostic-services" className="form-control md-form-control" />
                          </div>
                          <div className="form-group">
                            <label>List of diagnostic services implemented within the platform software</label>
                            <input type="text" defaultValue={activeEcu['details'] && activeEcu['details']['List-of-diagnostic-services-implemented-within-the-platform-software']} name="List-of-diagnostic-services-implemented-within-the-platform-software" className="form-control md-form-control" />
                          </div>
                          <div className="form-group">
                            <label>Which DTCFormatIdentifier is the SW platform configured by default?</label>
                            <input type="text" defaultValue={activeEcu['details'] && activeEcu['details']['Which-DTCFormatIdentifier-is-the-SW-platform-configured-by-default']} name="Which-DTCFormatIdentifier-is-the-SW-platform-configured-by-default" className="form-control md-form-control" />
                          </div>
                          <div className="form-group">
                            <label>Does the ECU implementing a data recorder (flight recorder)?</label>
                            <input type="text" defaultValue={activeEcu['details'] && activeEcu['details']['ECU-implementing-data-recorder']} name="ECU-implementing-data-recorder" className="form-control md-form-control" />
                          </div>
                          <div className="form-group">
                            <label>How many diagnostic fault paths are developed and implemented as platform software?</label>
                            <input type="text" defaultValue={activeEcu['details'] && activeEcu['details']['diagnostic-fault-paths-are-developed-and-implemented']} name="diagnostic-fault-paths-are-developed-and-implemented" className="form-control md-form-control" />
                          </div>
                          <div className="form-group">
                            <label>How many diagnostic IDs (DIDs) are developed and implemented as platform software?</label>
                            <input type="text" defaultValue={activeEcu['details'] && activeEcu['details']['diagnostic-IDs-DIDs-are-developed-and-implemented-as-platform-software']} name="diagnostic-IDs-DIDs-are-developed-and-implemented-as-platform-software" className="form-control md-form-control" />
                          </div>
                          <div className="form-group">
                            <label>How many diagnostic Routines (RIDs) are developed and implemented as platform software?</label>
                            <input type="text" defaultValue={activeEcu['details'] && activeEcu['details']['diagnostic-Routines-RIDs-are-developed-and-implemented']} name="diagnostic-Routines-RIDs-are-developed-and-implemented" className="form-control md-form-control" />
                          </div>
                          <div className="form-group">
                            <label>Is the Diagnostic server configurable based on CDD (Vector CANdelaStudio), ARXML or AUTOSAR DEXT Data? Please provide details</label>
                            <input type="text" defaultValue={activeEcu['details'] && activeEcu['details']['Diagnostic-server-configurable-based-on-CDD']} name="Diagnostic-server-configurable-based-on-CDD" className="form-control md-form-control" />
                          </div>
                          <div className="form-group">
                            <label>Is the Diagnostic data calibratable via calibration tools? (e.g. XCP)</label>
                            <input type="text" defaultValue={activeEcu['details'] && activeEcu['details']['Diagnostic-data-calibratable-via-calibration-tools']} name="Diagnostic-data-calibratable-via-calibration-tools" className="form-control md-form-control" />
                          </div>
                          <div className="form-group">
                            <label>Which CANdelaStudio Version are you planning to use for the development activity?</label>
                            <input type="text" defaultValue={activeEcu['details'] && activeEcu['details']['CANdelaStudio-Version-are-you-planning-to-use-for-the-development']} name="CANdelaStudio-Version-are-you-planning-to-use-for-the-development" className="form-control md-form-control" />
                          </div>

                          <h4 class="border-top border-bottom w-100 text-primary font-weight-bold py-1 pt-3">Component Configuration and Setup</h4>
                          <div className="form-group">
                            <label>Is the ECU Configuration possible via UDS?</label>
                            <input type="text" defaultValue={activeEcu['details'] && activeEcu['details']['Is-the-ECU-Configuration-possible-via-UDS']} name="Is-the-ECU-Configuration-possible-via-UDS" className="form-control md-form-control" />
                          </div>
                          <div className="form-group">
                            <label>is the ECU configuration possible via central gateway network messages?</label>
                            <input type="text" defaultValue={activeEcu['details'] && activeEcu['details']['is-the-ECU-configuration-possible-via-central-gateway']} name="is-the-ECU-configuration-possible-via-central-gateway" className="form-control md-form-control" />
                          </div>
                          <div className="form-group">
                            <label>What is the native ECU configuration method?</label>
                            <input type="text" defaultValue={activeEcu['details'] && activeEcu['details']['What-is-the-native-ECU-configuration-method']} name="What-is-the-native-ECU-configuration-method" className="form-control md-form-control" />
                          </div>
                          <div className="form-group">
                            <label>Does the ECU require a special End Of Line procedure, to enable ECU setup or ECU configuration, which will require extra time or tooling which is otherwise not required? If yes, please provide details</label>
                            <select className="form-control md-form-control" name="Does-the-ECU-require-special-End-Of-Line-procedure">
                              <option selected={activeEcu['details'] && activeEcu['details']['Does-the-ECU-require-special-End-Of-Line-procedure'] === 'Yes'} value="Yes">Yes</option>
                              <option selected={activeEcu['details'] && activeEcu['details']['Does-the-ECU-require-special-End-Of-Line-procedure'] === 'No'} value="No">No</option>
                            </select>
                          </div>
                          <div className="form-group">
                            <label>Provide Special End of Line details </label>
                            <input type="text" defaultValue={activeEcu['details'] && activeEcu['details']['Provide-Special-End-of-Line-details']} name="Provide-Special-End-of-Line-details" className="form-control md-form-control" />
                          </div>

                          <h4 class="border-top border-bottom w-100 text-primary font-weight-bold py-1 pt-3">General Cyber Security</h4>
                          <div className="form-group">
                            <label>What AutoSAR security components does the ECU have? (e.g. csm, CryIf, KeyM etc.)</label>
                            <input type="text" defaultValue={activeEcu['details'] && activeEcu['details']['What-AutoSAR-security-components-does-the-ECU-have']} name="What-AutoSAR-security-components-does-the-ECU-have" className="form-control md-form-control" />
                          </div>
                          <div className="form-group">
                            <label>Do you provide a signed software ? OR
                              Do you expect the OEM to perform based on the software you deliver ?</label>
                            <input type="text" defaultValue={activeEcu['details'] && activeEcu['details']['Do-you-provide-signed-software']} name="Do-you-provide-signed-software" className="form-control md-form-control" />
                          </div>
                          <div className="form-group">
                            <label>Have you conducted a Threat and risk assessment on the platform ECU ?
                              If so, can you share the results with us ?</label>
                            <input type="text" defaultValue={activeEcu['details'] && activeEcu['details']['Have-you-conducted-Threat-and-risk-assessment']} name="Have-you-conducted-Threat-and-risk-assessment" className="form-control md-form-control" />
                          </div>
                          <div className="form-group">
                            <label>Can you also share the results of the Fuzz and Penetration testing on the ECU ?</label>
                            <input type="text" defaultValue={activeEcu['details'] && activeEcu['details']['Can-you-also-share-the-results-of-the-Fuzz']} name="Can-you-also-share-the-results-of-the-Fuzz" className="form-control md-form-control" />
                          </div>
                          <div className="form-group">
                            <label>Does your ECU support firewall and/or any Intrusion detection mechanisms ?</label>
                            <input type="text" defaultValue={activeEcu['details'] && activeEcu['details']['Does-your-ECU-support-firewall']} name="Does-your-ECU-support-firewall" className="form-control md-form-control" />
                          </div>
                          <div className="form-group">
                            <label>Does your ECU support Whitelisting and Blacklisting capabilities?</label>
                            <input type="text" defaultValue={activeEcu['details'] && activeEcu['details']['Does-your-ECU-support-Whitelisting-and-Blacklisting']} name="Does-your-ECU-support-Whitelisting-and-Blacklisting" className="form-control md-form-control" />
                          </div>
                          <div className="form-group">
                            <label>Does the ECU support a Hardware Security Accelerator ?</label>
                            <select className="form-control md-form-control" name="Does-the-ECU-support-Hardware-Security-Accelerator">
                              <option selected={activeEcu['details'] && activeEcu['details']['Does-the-ECU-support-Hardware-Security-Accelerator'] === 'HSM'} value="HSM">HSM</option>
                              <option selected={activeEcu['details'] && activeEcu['details']['Does-the-ECU-support-Hardware-Security-Accelerator'] === 'SHE'} value="SHE">SHE</option>
                              <option selected={activeEcu['details'] && activeEcu['details']['Does-the-ECU-support-Hardware-Security-Accelerator'] === 'TPM'} value="TPM">TPM</option>
                            </select>
                          </div>
                          <div className="form-group">
                            <label>Hardware Accelerator Version </label>
                            <input type="text" defaultValue={activeEcu['details'] && activeEcu['details']['Hardware-Accelerator-Version']} name="Hardware-Accelerator-Version" className="form-control md-form-control" />
                          </div>
                          <div className="form-group">
                            <label>What type of ciphers are suppoted ie do you support symmetric or assymtric keys ?</label>
                            <input type="text" defaultValue={activeEcu['details'] && activeEcu['details']['What-type-of-ciphers-are-suppoted']} name="What-type-of-ciphers-are-suppoted" className="form-control md-form-control" />
                          </div>
                          <div className="form-group">
                            <label>How do you maintain the integrity and authenticity of the software ?</label>
                            <select className="form-control md-form-control" name="How-do-you-maintain-the-integrity">
                              <option selected={activeEcu['details'] && activeEcu['details']['How-do-you-maintain-the-integrity'] === 'Signature'} value="Signature">Signature</option>
                              <option selected={activeEcu['details'] && activeEcu['details']['How-do-you-maintain-the-integrity'] === 'CRC'} value="CRC">CRC</option>
                              <option selected={activeEcu['details'] && activeEcu['details']['How-do-you-maintain-the-integrity'] === 'Other Methods'} value="Other Methods">Other Methods</option>
                            </select>
                          </div>
                          <div className="form-group">
                            <label>If Others, please provide Details </label>
                            <input type="text" defaultValue={activeEcu['details'] && activeEcu['details']['How-do-you-maintain-the-integrity-Others']} name="How-do-you-maintain-the-integrity-Others" className="form-control md-form-control" />
                          </div>
                          <div className="form-group">
                            <label>Do you have any preference for Autosar SecOC profiles ?</label>
                            <input type="text" defaultValue={activeEcu['details'] && activeEcu['details']['any-preference-for-Autosar-SecOC-profiles']} name="any-preference-for-Autosar-SecOC-profiles" className="form-control md-form-control" />
                          </div>

                          <h4 class="border-top border-bottom w-100 text-primary font-weight-bold py-1 pt-3">OTA - Over the Air</h4>
                          <div className="form-group">
                            <label>Does your ECU support Software Over the Air updates ?</label>
                            <select className="form-control md-form-control" name="ECU-support-Software-Over-the-Air-updates">
                              <option selected={activeEcu['details'] && activeEcu['details']['ECU-support-Software-Over-the-Air-updates'] === 'Yes'} value="Yes">Yes</option>
                              <option selected={activeEcu['details'] && activeEcu['details']['ECU-support-Software-Over-the-Air-updates'] === 'No'} value="No">No</option>
                            </select>
                          </div>
                          <div className="form-group">
                            <label>What is the eMMC size ? FOTA memory size ?</label>
                            <input type="text" defaultValue={activeEcu['details'] && activeEcu['details']['What-is-the-eMMC-size']} name="What-is-the-eMMC-size" className="form-control md-form-control" />
                          </div>
                          <div className="form-group">
                            <label>Does the ECU support single or dual banking memory ?</label>
                            <select className="form-control md-form-control" name="ECU-support-single-or-dual-banking-memory">
                              <option selected={activeEcu['details'] && activeEcu['details']['ECU-support-single-or-dual-banking-memory'] === 'Single Bank'} value="Single Bank">Single Bank</option>
                              <option selected={activeEcu['details'] && activeEcu['details']['ECU-support-single-or-dual-banking-memory'] === 'Dual Bank'} value="Dual Bank">Dual Bank</option>
                            </select>
                          </div>
                          <div className="form-group">
                            <label>Please mention the Dual Banking Update Type Supported</label>
                            <select className="form-control md-form-control" name="Dual-Banking-Update-Type-Supported">
                              <option selected={activeEcu['details'] && activeEcu['details']['Dual-Banking-Update-Type-Supported'] === 'Differential Update'} value="Differential Update">Differential Update</option>
                              <option selected={activeEcu['details'] && activeEcu['details']['Dual-Banking-Update-Type-Supported'] === 'Full update'} value="Full update">Full update</option>
                            </select>
                          </div>
                          <div className="form-group">
                            <label>Can you please define "downtime" and "in-vehicle transfer" time ?</label>
                            <input type="text" defaultValue={activeEcu['details'] && activeEcu['details']['define-downtime-and-in-vehicle-transfer-time']} name="define-downtime-and-in-vehicle-transfer-time" className="form-control md-form-control" />
                          </div>
                          <div className="form-group">
                            <label>Have you considered 'validation options' in for 'differential update' solution. In case of 'secure boot' will your solution still execute properly after differential update ?</label>
                            <input type="text" defaultValue={activeEcu['details'] && activeEcu['details']['Have-you-considered-validation-options-for-differential-update-solution']} name="Have-you-considered-validation-options-for-differential-update-solution" className="form-control md-form-control" />
                          </div>
                          <div className="form-group">
                            <label>How is software rollback supported in your ECU ?</label>
                            <input type="text" defaultValue={activeEcu['details'] && activeEcu['details']['software-rollback-supported-in-your-ECU']} name="software-rollback-supported-in-your-ECU" className="form-control md-form-control" />
                          </div>
                          <div className="form-group">
                            <label>Do you compress and decompress the image while installation ? If so, is it handled by some kind of an agent in the ECU ?</label>
                            <input type="text" defaultValue={activeEcu['details'] && activeEcu['details']['compress-and-decompress-the-image-while-installation']} name="compress-and-decompress-the-image-while-installation" className="form-control md-form-control" />
                          </div>
                          <div className="form-group">
                            <label>What are the dependencies for the ECU for performing a OTA update ?</label>
                            <input type="text" defaultValue={activeEcu['details'] && activeEcu['details']['dependencies-for-the-ECU-for-performing-OTA-update']} name="dependencies-for-the-ECU-for-performing-OTA-update" className="form-control md-form-control" />
                          </div>
                          <div className="form-group">
                            <label>Are there any special pre-conditions before performing an OTA update on the ECU ?</label>
                            <input type="text" defaultValue={activeEcu['details'] && activeEcu['details']['pre-conditions-before-performing-an-OTA-update']} name="pre-conditions-before-performing-an-OTA-update" className="form-control md-form-control" />
                          </div>

                          <h4 class="border-top border-bottom w-100 text-primary font-weight-bold py-1 pt-3">Component Network Management Information </h4>
                          <div className="form-group">
                            <label>Please specify the number of CAN, LIN and Ethernet controllers the ECU has.</label>
                            <input type="text" defaultValue={activeEcu['details'] && activeEcu['details']['number-of-CAN-LIN-and-Ethernet-controllers-the-ECU-has']} name="number-of-CAN-LIN-and-Ethernet-controllers-the-ECU-has" className="form-control md-form-control" />
                          </div>
                          <div className="form-group">
                            <label>Please specify what protocol standard is currently being used for each controller (e.g. CAN, CAN-FD, 100Base T etc.)</label>
                            <input type="text" defaultValue={activeEcu['details'] && activeEcu['details']['protocol-standard-is-currently-being-used-for-each-controller']} name="protocol-standard-is-currently-being-used-for-each-controller" className="form-control md-form-control" />
                          </div>
                          <div className="form-group">
                            <label>What is the current operating voltage of the ECU?</label>
                            <input type="text" defaultValue={activeEcu['details'] && activeEcu['details']['current-operating-voltage-of-the-ECU']} name="current-operating-voltage-of-the-ECU" className="form-control md-form-control" />
                          </div>
                          <div className="form-group">
                            <label>Does the ECU support termination on the PCB? (i.e. for termination resistor)</label>
                            <input type="text" defaultValue={activeEcu['details'] && activeEcu['details']['ECU-support-termination-on-the-PCB']} name="ECU-support-termination-on-the-PCB" className="form-control md-form-control" />
                          </div>

                          <h4 class="border-top border-bottom w-100 text-primary font-weight-bold py-1 pt-3">Generic Network Communications</h4>
                          <div className="form-group">
                            <label>What Network Management type is the ECU implenting? (Full, Passive, Light, None)</label>
                            <input type="text" defaultValue={activeEcu['details'] && activeEcu['details']['Network-Management-type']} name="Network-Management-type" className="form-control md-form-control" />
                          </div>
                          <div className="form-group">
                            <label>Which AutoSAR E2E profile is the ECU implementing?</label>
                            <input type="text" defaultValue={activeEcu['details'] && activeEcu['details']['AutoSAR-E2E-profile']} name="AutoSAR-E2E-profile" className="form-control md-form-control" />
                          </div>
                          <div className="form-group">
                            <label>Please specify what type of calibration data is required for development purposes (e.g. XCP, UUDT etc.) and how many frames.</label>
                            <input type="text" defaultValue={activeEcu['details'] && activeEcu['details']['what-type-of-calibration-data-required-for-development-purpose']} name="what-type-of-calibration-data-required-for-development-purpose" className="form-control md-form-control" />
                          </div>

                          <h4 class="border-top border-bottom w-100 text-primary font-weight-bold py-1 pt-3">CAN Network Communications</h4>
                          <div className="form-group">
                            <label>What CAN AutoSAR components does the ECU have? (e.g. CanIf, CanTrcv, CanNm etc.)</label>
                            <input type="text" defaultValue={activeEcu['details'] && activeEcu['details']['CAN-AutoSAR-components-does-the-ECU-have']} name="CAN-AutoSAR-components-does-the-ECU-have" className="form-control md-form-control" />
                          </div>
                          <div className="form-group">
                            <label>Please specify the CAN microcontroller clock speed and Bit Timing Register (BTR) values that the ECU is implementing.</label>
                            <input type="text" defaultValue={activeEcu['details'] && activeEcu['details']['CAN-microcontroller-clock-speed-and-Bit']} name="CAN-microcontroller-clock-speed-and-Bit" className="form-control md-form-control" />
                          </div>
                          <div className="form-group">
                            <label>Please provide any example .dbc files.</label>
                            <input type="text" defaultValue={activeEcu['details'] && activeEcu['details']['CAN-microcontroller-clock-speed-and-Bit-file']} name="CAN-microcontroller-clock-speed-and-Bit-file" className="form-control md-form-control" />
                          </div>

                          <h4 class="border-top border-bottom w-100 text-primary font-weight-bold py-1 pt-3">LIN Network Communications</h4>
                          <div className="form-group">
                            <label>What LIN AutoSAR components does the ECU have? (e.g. LinIf, LinTrcv, LinNm etc.)</label>
                            <input type="text" defaultValue={activeEcu['details'] && activeEcu['details']['LIN-AutoSAR-components-does-the-ECU-have']} name="LIN-AutoSAR-components-does-the-ECU-have" className="form-control md-form-control" />
                          </div>
                          <div className="form-group">
                            <label>What LIN protocol version is the ECU implementing?</label>
                            <input type="text" defaultValue={activeEcu['details'] && activeEcu['details']['LIN-protocol-version-is-the-ECU-implementing']} name="LIN-protocol-version-is-the-ECU-implementing" className="form-control md-form-control" />
                          </div>
                          <div className="form-group">
                            <label>Please specify if a particular NAD is to be used.</label>
                            <input type="text" defaultValue={activeEcu['details'] && activeEcu['details']['if-particular-NAD-is-to-be-used']} name="if-particular-NAD-is-to-be-used" className="form-control md-form-control" />
                          </div>
                          <div className="form-group">
                            <label>If the ECU is a slave, does it have the ability to request wake up?</label>
                            <input type="text" defaultValue={activeEcu['details'] && activeEcu['details']['does-it-have-the-ability-to-request-wake-up']} name="does-it-have-the-ability-to-request-wake-up" className="form-control md-form-control" />
                          </div>
                          <div className="form-group">
                            <label>If the ECU is a slave, does it require SWDL capabilities?</label>
                            <input type="text" defaultValue={activeEcu['details'] && activeEcu['details']['does-it-require-SWDL-capabilities']} name="does-it-require-SWDL-capabilities" className="form-control md-form-control" />
                          </div>
                          <div className="form-group">
                            <label>Please provide any example .ldf files.</label>
                            <input type="text" defaultValue={activeEcu['details'] && activeEcu['details']['SWDL-capabilities-file']} name="SWDL-capabilities-file" className="form-control md-form-control" />
                          </div>

                          <h4 class="border-top border-bottom w-100 text-primary font-weight-bold py-1 pt-3">Ethernet Network Communications</h4>
                          <div className="form-group">
                            <label>What Ethernet AutoSAR components does the ECU have? (e.g. EthIf, EthTrcv, EthNm etc.)</label>
                            <input type="text" defaultValue={activeEcu['details'] && activeEcu['details']['Ethernet-AutoSAR-components-does-the-ECU-have']} name="Ethernet-AutoSAR-components-does-the-ECU-have" className="form-control md-form-control" />
                          </div>
                          <div className="form-group">
                            <label>Please specify what protocol stacks are available? (e.g. TCP/IP, SOME/IP, AVB etc.)</label>
                            <input type="text" defaultValue={activeEcu['details'] && activeEcu['details']['protocol-stacks-are-available']} name="protocol-stacks-are-available" className="form-control md-form-control" />
                          </div>
                          <div className="form-group">
                            <label>Does the ECU support Ethernet port mirroring?</label>
                            <select className="form-control md-form-control" name="ECU-support-Ethernet-port-mirroring">
                              <option selected={activeEcu['details'] && activeEcu['details']['ECU-support-Ethernet-port-mirroring'] === 'Yes'} value="Yes">Yes</option>
                              <option selected={activeEcu['details'] && activeEcu['details']['ECU-support-Ethernet-port-mirroring'] === 'No'} value="No">No</option>
                            </select>
                          </div>


                        </div>}
                      </div>
                    }
                  </div>
                  <div className="modal-footer">
                    <div className="row w-100">
                      <div className="col-6 text-left m-0 p-0">

                      </div>
                      <div className="col-6 text-right m-0 p-0">
                        <button type="submit" className="btn btn-primary">
                          Update
                        </button>
                      </div>
                    </div>
                  </div>

                </form>
              </div>
            </div>
          </div>
        }
      </DashboardLayout>
    </div>
  )
}

//
export default ListEcu;