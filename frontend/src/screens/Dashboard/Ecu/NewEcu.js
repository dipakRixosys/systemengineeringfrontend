// React
import { useEffect, useCallback } from "react";
// Layout
import DashboardLayout from "screens/Layouts/DashboardLayout";
// Helpers
import { setTitle } from "helpers/common";
// Slots
import NewEcuSlot from "components/slots/NewEcu/NewEcu";

// New ECU
function NewEcu() {
  // Title
  setTitle("Create New ECU");

  // Constructor
  useEffect(() => {

  }, []);

  //
  const uploadExcel = useCallback(() => {
    alert("Upload Excel/CSV for bulk ECU updates.");
  }, []);

  //
  return (
    <div>
      <DashboardLayout>
        <div className="container-fluid">

          <div className="row">
            <div className="col-12 col-lg-7">
              <NewEcuSlot />
            </div>
          </div>


          {/* Upload Bulk-via Excel */}
          {
            false && 
            <div className="row my-2">
              <div className="col-12 col-lg-5">
                <button className="btn btn-primary btn-block" onClick={uploadExcel}>
                  <i className="fa fa-upload mr-2"></i>
                  Upload Excel for <b>Bulk ECU</b> 
                </button>
                <a className="link-sm link-with-border edit-ecu-button" href="!#">
                  Bulk Upload CSV Template
                </a>
              </div>
            </div>
          }

        </div>
      </DashboardLayout>
    </div>
  )
}

//
export default NewEcu;