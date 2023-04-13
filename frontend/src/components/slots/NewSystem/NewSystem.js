// React Router
import { useHistory } from "react-router-dom";
// Network
import { httpPostMultipart, apify } from "helpers/network";
// Helper
import { swalPopup } from "helpers/common";

// Slot > New System
function NewSystemSlot() {
  // History context
  const history = useHistory();

  // Submit
  function submitCreateEcu(ev) {
    ev.preventDefault();

    const form = ev.currentTarget;
    var params = new FormData(form);
    
    // Add new system
    httpPostMultipart(apify('app/system/add'), params).then(data => {
      swalPopup("New System added.", 'success');
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
              <h3>Create New System</h3>
              <small className="text-muted">
                Use this form to define new system.
              </small>
            </div>

            <div className="card-body">

              <div className="form-group row">
                <label className="col-4 text-muted">System Full Name</label>
                <input className="form-control md-form-control col-8" name="name" placeholder="System Full Name" required />
              </div>
            </div>

            <div className="card-footer py-4">
              <button type="submit" className="btn btn-success btn-lg">
                Create System
              </button>
            </div>
          </form>
        </div>
      }
    </div>
  );
}

//
export default NewSystemSlot;