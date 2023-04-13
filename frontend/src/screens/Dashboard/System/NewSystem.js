// React
import { useCallback } from "react";
// Layout
import DashboardLayout from "screens/Layouts/DashboardLayout";
// Helpers
import { setTitle } from "helpers/common";
// Slots
import NewSystemSlot from "components/slots/NewSystem/NewSystem";

// New System
function NewSystem() {
  // Title
  setTitle("Create New System");

  //
  const uploadExcel = useCallback(() => {
    alert("Upload Excel/CSV for bulk System updates.");
  }, []);

  //
  return (
    <div>
      <DashboardLayout allowDemoMode={true}>
        <div className="container-fluid">

          <div className="row">
            <div className="col-12 col-lg-7">
              <NewSystemSlot />
            </div>
          </div>


          {/* Upload Bulk-via Excel */}
          {
            false && 
            <div className="row my-2">
              <div className="col-12 col-lg-5">
                <button className="btn btn-primary btn-block" onClick={uploadExcel}>
                  <i className="fa fa-upload mr-2"></i>
                  Upload Excel for <b>Bulk System</b> 
                </button>
                <a className="link-sm link-with-border edit-ecu-button" href="!#">
                  Bulk Upload CSV Template (System)
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
export default NewSystem;