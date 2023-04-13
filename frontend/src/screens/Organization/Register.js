import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { setTitle, swalPopup, triggerSwalLoader } from "helpers/common";
import AuthFooter from "components/dashboard/AuthFooter";
import { apify, httpPost } from "helpers/network";

function Register() {
  const [email, setEmail] = useState('');
  
  useEffect(() => {
    setTitle('Register');
  }, []);

  const handleRegister = (ev) => {
    ev.preventDefault();
    triggerSwalLoader();

    const params = {
      'email': email
    };
    
    httpPost(apify('organization/get-verification-link'), params).then(data => {
      swalPopup({
        title: "Verification Email Sent",
        text: data['message'],
      }, 'success');
    }).catch(err => {
      swalPopup({
        title: "Something went wrong.",
        text: "Please try again.",
      });
    });
  }

  return (
    <div className="auth-background">
      <div className="container-fluid py-5 h-100">
        <div className="row mt-3 h-100">
          <div className="col-12 col-lg-6">
            <form onSubmit={(ev) => handleRegister(ev)}>
              <div className="card center-box w-75 ml-5 auth-card-v2">
                <div className="card-header">
                  <h3 className="text-primary text-login">
                    <img src="/logo-criskle.png" className="w-50 mb-2 ml-n1" alt="CRISKLE" title="CRISKLE by Secure Elements" />
                    <br />
                    <small>Integrated Product Security Lifecycle Management</small>
                  </h3>
                </div>

                <div className="card-body">
                  <div className="form-group">
                    <label>Email</label>
                    <input type="email" name="email" className="form-control text-white dark-placeholder mt-n3" placeholder="Provide your registered email address" value={email} onChange={e => setEmail(e.target.value)} autoFocus={true} required />
                  </div>
                </div>

                <div className="card-footer">
                  <button type="submit" className="btn btn-block btn-blue-gradient">
                    Get Verification Link 
                    <i className="fa fa-sign-in ml-2"></i>
                  </button>

                  <Link className="btn btn-block btn-dark text-uppercase text-white" to={'/login'}>
                    Login into Existing Account
                    <i className="fa fa-sign-in ml-2"></i>
                  </Link>

                  <AuthFooter />
                </div>

              </div>
            </form>
          </div>
        </div>
      </div>

    </div>
  );
}

export default Register;