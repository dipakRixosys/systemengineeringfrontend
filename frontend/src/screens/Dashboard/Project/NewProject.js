import { useEffect } from "react";
import DashboardLayout from "screens/Layouts/DashboardLayout";
import NewProjectSlot from "components/slots/NewProject/NewProject";
import { setTitle } from "helpers/common";

function NewProject() {
  useEffect(() => {
    setTitle("Create New Project");
    
  }, []);

  return (
    <div>
      <DashboardLayout allowDemoMode={true}>
        <div className="container-fluid">

          <div className="row">
            <div className="col-12 col-lg-5">
              <NewProjectSlot />
            </div>
          </div>

        </div>
      </DashboardLayout>
    </div>
  )
}

//
export default NewProject;