// React
import { useEffect } from "react";
// Layout
import DashboardLayout from "screens/Layouts/DashboardLayout";
// Helpers
import { setTitle } from "helpers/common";
// jQuery
const jQuery = window.jQuery;

// Risk Mapping
function RiskMapping() {
  //
  setTitle("Risk Mapping");

  //
  useEffect(() => {
    jQuery('.select-for-members').selectpicker('refresh');
  }, []);

  //
  return (
    <div>
      <DashboardLayout>
        <div className="container-fluid my-2">
          <div className="row">
            
            <div className="col-12 col-lg-4">
              <div className="card">
                <div className="card-header">
                  <h3>Risk Mapping</h3>
                </div>
                <div className="card-body">
                  <table className="table table-bordered">
                    <tbody>
                      <tr>
                        <td>X</td>
                        <td>Y</td>
                        <td>Z</td>
                      </tr>
                      <tr>
                        <td>X</td>
                        <td>Y</td>
                        <td>Z</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="card-footer">
                  <button className="btn btn-primary">
                    Configure <b>Mapping Paramters</b>
                  </button>
                </div>
              </div>
            </div>

          </div>
          
        </div>
      </DashboardLayout>
    </div>
  )
}

//
export default RiskMapping;