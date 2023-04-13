import { useHistory } from "react-router-dom";
import { useState } from "react";
import { swalPopup } from "helpers/common";
import { httpPost, apify } from "helpers/network";
import { modal, getUserProperty, fireLogoutEvents,setLocalData } from "helpers/common";

// Modal - User Account
function ModalUserAccount() {
  //
  const history = useHistory();
  const [name, setName] = useState(getUserProperty('name'));
  const [email, setEmail] = useState(getUserProperty('email'));
  const [mobile, setMobile] = useState(getUserProperty('mobile_number'));
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Logout event
  function handleLogout() {
    modal('#ModalUserAccount', 'hide');
    fireLogoutEvents();
    history.push("/login");
  }

  // User update
  function userUpdate(ev) {
    //
    ev.preventDefault();
    
    // Params
    let params = {
      'name': name,
      'email': email,
      'mobile_number': mobile,
      'current_password': oldPassword,
      'new_password': newPassword,
      'confirm_password': confirmPassword,
    };
    
    // Update user account
    httpPost(apify('app/update-account'), params).then(data => {
      swalPopup("Your account has been updated.", 'success');

      setLocalData('authToken', data['user']['access_token']);
      setLocalData('user', data['user']);

      modal('#ModalUserAccount', 'hide');
      
    }).catch((data) => {
      let error = data.xhrJson && data.xhrJson.errors && Object.values(data.xhrJson.errors)[0] ? Object.values(data.xhrJson.errors)[0][0] : 'Something went wrong.'
      swalPopup(error);
    });
  }

  // UI
  return (
    <div>
      <div className="modal fade" id="ModalUserAccount" tabIndex="-1">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h4 className="modal-title text-primary">
                Manage <b>User Account</b>
              </h4>
              <button type="button" className="close" data-dismiss="modal">
                <span>&times;</span>
              </button>
            </div>
            <form id="userUpdateForm" className="form-has-validations" onSubmit={userUpdate}>
              <div className="modal-body">

                <div className="form-group row">
                  <div className="col-4 text-muted">
                    Full Name
                  </div>
                  <div className="col-8">
                    <input type="text" onChange={e => setName(e.target.value)} className="form-control md-form-control" placeholder="Full Name" name="name" defaultValue={getUserProperty('name')} />
                  </div>
                </div>

                <div className="form-group row">
                  <div className="col-4 text-muted">
                    Email
                  </div>
                  <div className="col-8">
                    <input type="email" onChange={e => setEmail(e.target.value)} className="form-control md-form-control" placeholder="Email" name="email" defaultValue={getUserProperty('email')} />
                  </div>
                </div>

                <div className="form-group row">
                  <div className="col-4 text-muted">
                    Mobile Number
                  </div>
                  <div className="col-8">
                    <input type="text" onChange={e => setMobile(e.target.value)} className="form-control md-form-control" placeholder="Mobile Number" name="mobile_number" defaultValue={getUserProperty('mobile_number')} />
                  </div>
                </div>

                <div className="form-group row">
                  <div className="col-4 text-muted">
                    Type
                  </div>
                  <div className="col-8">
                    <input type="email"  className="form-control md-form-control" placeholder="Email" defaultValue="Manager" readOnly />
                  </div>
                </div>

                <div className="form-group row">
                  <div className="col-12 text-muted mb-3">
                    <small>Change Account Password</small>
                  </div>
                  <div className="col-4 text-muted">
                    Current Password
                  </div>
                  <div className="col-8">
                    <input type="password" onChange={e => setOldPassword(e.target.value)} className="form-control md-form-control" name="current_password" placeholder="Current Password" />
                  </div>
                </div>

                <div className="form-group row">
                  <div className="col-4 text-muted">
                    New Password
                  </div>
                  <div className="col-8">
                    <input type="password" onChange={e => setNewPassword(e.target.value)} className="form-control md-form-control" name="new_password" placeholder="New Password" />
                  </div>
                </div>

                <div className="form-group row">
                  <div className="col-4 text-muted">
                    Confirm Password
                  </div>
                  <div className="col-8">
                    <input type="password" onChange={e => setConfirmPassword(e.target.value)} className="form-control md-form-control" name="confirm_password" placeholder="Confirm Password" />
                  </div>
                </div>

              </div>
              <div className="modal-footer">
                <div className="row w-100">
                  <div className="col-6 text-left m-0 p-0">
                    <button className="btn btn-outline-danger" onClick={handleLogout}>
                      Logout
                    </button>
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
    </div>
  )
}

export default ModalUserAccount;