import { useEffect, useState } from "react";
import { apify, httpGet, httpPost } from "helpers/network";
import { setTitle, swalPopup } from "helpers/common";
import DashboardLayout from "screens/Layouts/DashboardLayout";
import PlaceholderLoader from "components/ui/placeholder-loader/placeholder-loader";

const jQuery = window.jQuery;

function JiraIntegration() {
  const [loading, setLoading] = useState(true);
  const [organization, setOrganization] = useState(undefined);

  // Constructor
  useEffect(() => {
    setTitle("Configure JIRA Integration");
    fetchOrganizationData();
  }, []);

  function fetchOrganizationData() {
    httpGet(apify('app/organization')).then(res => {
      let organization = res['organization'];
      let { jira_server_url, jira_secret_key } = organization['jira_credentials'];

      setOrganization(res['organization']);
      setLoading(false);

      jQuery(`input[name="jira_server_url"]`).val(jira_server_url);
      jQuery(`input[name="jira_secret_key"]`).val(jira_secret_key);
    });
  }

  // Form submit
  function submitJiraForm(ev) {
    ev.preventDefault();
    var params = {
      'jira_server_url': jQuery(`input[name="jira_server_url"]`).val(),
      'jira_secret_key': jQuery(`input[name="jira_secret_key"]`).val(),
    };

    httpPost(apify('app/organization/update-jira-keys'), params).then(res => {
      if (res['success']) {
        swalPopup({
          title: "JIRA Integration Keys updated",
          html: "Now you would be able to sync programs, threats to the JIRA",
        }, 'success');
      }
    });
  }

  // UI 
  return (
    <DashboardLayout allowDemoMode={false}>
      <div className="container-fluid">

        <div className="row">
          <div className="col-12 col-lg-7">
            { loading && <PlaceholderLoader /> }
            
            {
              !loading && 
              organization && 
              <div className="card">
                <form onSubmit={(ev) => submitJiraForm(ev)} method="post">
                  <div className="card-header">
                    <h3>Configure JIRA Integration</h3>
                    <small className="text-muted">
                      Provide details for enabling JIRA integration.
                    </small>
                  </div>

                  <div className="card-body">
                    <div className="form-group row">
                      <label className="col-4 text-muted">JIRA Server URL</label>
                      <input type="url" className="form-control md-form-control col-8" name="jira_server_url" placeholder="Provide Your JIRA Server URL" autoFocus={true} required />
                    </div>
                    <div className="form-group row">
                      <label className="col-4 text-muted">JIRA Secret Key</label>
                      <input type="text" className="form-control md-form-control col-8" name="jira_secret_key" placeholder="Provide Your JIRA Secret Key" required />
                    </div>
                  </div>

                  <div className="card-footer py-4">
                    <div className="row">
                      <div className="col-12 col-md-6">
                        <button type="submit" className="btn btn-success btn-lg">
                          Submit
                          <i className="fa fa-check ml-2" />
                        </button>
                      </div>

                      <div className="col-12 col-md-6 text-right">
                        <a href="https://confluence.atlassian.com/jiracore/setting-up-oauth-2-0-integration-1005784173.html" className="btn btn-dark btn-lg text-white" target="_blank" rel="noreferrer">
                          Setup your JIRA App 
                          <i className="fa fa-arrow-right ml-3" />
                        </a>
                      </div>
                    </div>
                  </div>

                </form>
              </div>
            }
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}

export default JiraIntegration;