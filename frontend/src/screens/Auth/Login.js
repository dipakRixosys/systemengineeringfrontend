import React, { useEffect, useState } from "react";
import { useHistory } from "react-router";
import { Link } from "react-router-dom";
import { setTitle, removeLocalData, getLocalData, setLocalData, swalPopup, triggerSwalLoader } from "helpers/common";
import { httpPost, apify } from "helpers/network";
import AuthFooter from "components/dashboard/AuthFooter";

// Login
function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);

  // History ref.
  const history = useHistory();

  // Handle login
  function handleLogin() {
    // Login parameters
    let params = {
      'email': email,
      'password': password,
    };

    let ctx = {
      'overrideDefault403Middleware': true,
    };
    
    // POST-request for Login
    httpPost(apify('login'), params, ctx).then(data => {
      // If login is successful, setup Access-Token & User-object
      setLocalData('authToken', data['user']['access_token']);
      setLocalData('innerApps', data['user']['inner_apps']);
      setLocalData('user', data['user']);
      // Move to dashboard
      history.push("/dashboard");
    }).catch(err => {
      // Show Error-Popup
      swalPopup({
        title: "Access Denied.",
        text: "The Username or Password you entered is incorrect. Try entering it again.",
      });
    });
  }

  // Forgot password req. button click
  const forgotPasswordButtonClicked = (ev, mode='SHOW') => {
    ev.preventDefault();
    setIsPasswordRecovery(mode === 'SHOW');
  }

  // Send Password recovery request (API call)
  const handleForgotPassword = (ev) => {
    ev.preventDefault();
    let params = {
      'email': email,
    };
    
    triggerSwalLoader();

    httpPost(apify('forgot-password'), params).then(data => {
      if (data['success']) {
        swalPopup({
          title: "Recovery Email Sent",
          text: data['message'],
        }, 'success');
        
        setIsPasswordRecovery(false);
      }
    }).catch(err => {
      swalPopup({
        title: "Unable to send Recovery Email",
        text: "Please check your email, it seems such email doesn't exists in our system.",
      });
    });
  }

  // Change page title
  useEffect(() => {
    let t = isPasswordRecovery ? "Recover your password" : "Login";
    setTitle(t);
  }, [isPasswordRecovery]);
  
  // On-load
  useEffect(() => {
    // Set page title
    setTitle('Login');

    // Check if any-prompt error
    if (getLocalData('show-login-alert')) {
      swalPopup({
        title: "Access Denied.",
        text: "Please login to access the page/resource.",
      });
      removeLocalData('show-login-alert');
    }

    // Set Email/Password
    const urlParams = new URLSearchParams(window.location.search)
    let setDefaultEmail = urlParams.get('email');
    if (setDefaultEmail) {
      setEmail(setDefaultEmail);
      setPassword("");
    }

    // Developer mode default Email/Password
    if ( !setDefaultEmail && process.env['REACT_APP_DEFAULT_CREDENTIALS'] === "true" ) {
      setEmail("saket.mohan@secureelements.co.uk");
      setPassword("admin@cmp");
    }
  }, []);

  // Login screen
  return(
    <div className="auth-background">
      {/* Login Form */}
      <div className="container-fluid py-5 h-100">
        <div className="row mt-3 h-100">
          <div className="col-12 col-lg-6">

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

                {
                  !isPasswordRecovery &&
                  <div className="form-group">
                    <label>Password</label>
                    <input type="password" name="password" className="form-control text-white dark-placeholder mt-n3" placeholder="Provide your password" value={password} onChange={e => setPassword(e.target.value)} required />
                  </div>
                }

                <div className="mt-4">
                  {
                    !isPasswordRecovery && 
                    <a href="!#" onClick={(ev) => forgotPasswordButtonClicked(ev, 'SHOW')}>
                      Forgot password?
                    </a>
                  }

                  {
                    isPasswordRecovery && 
                    <a href="!#" onClick={(ev) => forgotPasswordButtonClicked(ev, 'HIDE')}>
                      Back to Login
                    </a>
                  }
                </div>

              </div>

              <div className="card-footer">
                {
                  !isPasswordRecovery && 
                  <React.Fragment>
                    <button type="submit" className="btn btn-block btn-blue-gradient" onClick={handleLogin}>
                      Login 
                      <i className="fa fa-sign-in ml-2"></i>
                    </button>

                    <Link className="btn btn-block btn-dark text-uppercase text-white" to={'/register'}>
                      Create Organization
                      <i className="fa fa-user-plus ml-2"></i>
                    </Link>
                  </React.Fragment>
                }

                {
                  isPasswordRecovery && 
                  <button type="button" className="btn btn-block btn-blue-gradient" onClick={handleForgotPassword}>
                    Send Password Recovery Email 
                    <i className="fa fa-sign-in ml-1"></i>
                  </button>
                }

                <AuthFooter />
              </div>

            </div>

          </div>
        </div>
      </div>

    </div>
  )
}

export default Login;