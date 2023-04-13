import { useState, useEffect } from "react";
import { modal, setTitle, swalPopup, triggerSwalLoader } from "helpers/common";
import AuthFooter from "components/dashboard/AuthFooter";
import { apify, httpPost } from "helpers/network";
import ModalEULA from "components/modals/ModalEULA";
import PlaceholderLoader from "components/ui/placeholder-loader/placeholder-loader";

function VerifyLink(props) {
  const { organizationUuid } = props.match.params;
  const [loading, setLoading] = useState(true);
  const [organizationData, setOrganizationData] = useState({
    'organizationUuid': organizationUuid,
    'email': '',
    'name': '',
    'managerName': '',
    'managerMobileNumber': '',
  });
  const [disableSubmitButton, setDisableSubmitButton] = useState(true);
  
  const updateOrganizationData = (key, value) => {
    setOrganizationData((prev) => ({
      ...prev,
      [key]: value 
    }));
  }

  useEffect(() => {
    setTitle('Verify Organization');
    let ajaxRequest = true;
    if (ajaxRequest) {
      getCanVerifyOrganization();
    }
    return () => {
      ajaxRequest = false;
    }
  }, []);

  const getCanVerifyOrganization = () => {
    const params = {
      'organizationUuid': organizationUuid
    }
    httpPost(apify('organization/can-verify'), params).then(data => {
      if (data['success']) {
        setLoading(false);
        updateOrganizationData('email', data['email']);
      }
    }).catch(err => {
      swalPopup({
        title: "Something went wrong.",
        text: err['xhrJson']['message'] ?? "Please try again. Either link is expired or organization already registered.",
      });
      document.location.href = '/';
    });
  }

  const tocCheckboxToggle = (ev) => {
    setDisableSubmitButton(!ev.target.checked);
  }

  const handleRegister = (ev) => {
    ev.preventDefault();
    triggerSwalLoader();
    
    httpPost(apify('organization/complete-verification'), organizationData).then(data => {
      swalPopup({
        title: "Welcome to CRISKLE",
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
            {
              loading && <PlaceholderLoader />
            }

            {
              !loading && 
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
                      <label>Registered Email</label>
                      <input type="email" className="form-control text-white dark-placeholder mt-n3" defaultValue={organizationData['email']} readOnly={true} />
                    </div>

                    <div className="form-group">
                      <label>Organization Name</label>
                      <input type="text" className="form-control text-white dark-placeholder mt-n3" placeholder="Full Organization Name" value={organizationData['name']} onChange={(ev) => updateOrganizationData('name', ev.target.value)} required />
                    </div>

                    <div className="form-group">
                      <label>Manager Full Name</label>
                      <input type="text" className="form-control text-white dark-placeholder mt-n3" placeholder="Manager Full Name" value={organizationData['managerName']} onChange={(ev) => updateOrganizationData('managerName', ev.target.value)} required />
                    </div>

                    <div className="form-group">
                      <label>Manager Contact Number (including country code)</label>
                      <input type="text" className="form-control text-white dark-placeholder mt-n3" placeholder="+41 1234 5678" value={organizationData['managerMobileNumber']} onChange={(ev) => updateOrganizationData('managerMobileNumber', ev.target.value)} required />
                    </div>

                    <div className="form-group">
                      <p>
                        <input type="checkbox" className="mr-2" onChange={(ev) => tocCheckboxToggle(ev)} />
                        Check to agree to our &nbsp;
                        <a href="#!" onClick={(ev) => modal('#ModalEULA')} title="Click to view our ToC and EULA">terms of conditions &amp; EULA.</a>
                      </p>
                    </div>
                  </div>

                  <div className="card-footer">
                    <button type="submit" className="btn btn-block btn-blue-gradient" disabled={disableSubmitButton}>
                      Complete Registration &amp; <b>Activate Trial License</b>
                    </button>
                    <AuthFooter />
                  </div>

                </div>
              </form>
            }
          </div>
        </div>
      </div>

      { !loading && <ModalEULA /> }

    </div>
  );
}

export default VerifyLink;