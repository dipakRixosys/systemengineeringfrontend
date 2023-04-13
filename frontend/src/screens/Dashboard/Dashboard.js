import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "screens/Layouts/DashboardLayout";
import { setTitle, getUserProperty } from "helpers/common";
import PlaceholderLoader from "components/ui/placeholder-loader/placeholder-loader";
import { httpGet, apify } from "helpers/network";
const jQuery = window.jQuery;

// Dashboard
function Dashboard() {
  setTitle("Dashboard");

  const [dashboardProperty, setDashboardProperty] = useState({
    'hasSynced': false,
  });

  // Fetch Dashboard Property
  const fetchDashboardProperty = () => {
    httpGet(apify(`app/account`)).then(res => {
      setDashboardProperty({
        'hasSynced': true,
        'dashboard': res['dashboard'],
      });
    });
  }

  useEffect(() => {
    jQuery('.select-for-members').selectpicker('refresh');
    fetchDashboardProperty();
  }, []);

  // UI
  return (
    <div>
      <DashboardLayout allowDemoMode={true}>
        <div className="container-fluid my-2">
          <div className="row">

            <div className="col-12 col-lg-6">
              Welcome, <b>{getUserProperty('name')}</b> <br />
              <p className="mt-1">Status information from where you left off can be found below.</p>
            </div>

            <div className="col-12 col-lg-3 mt-n3 mb-2">
              {
                false &&
                <div>
                  <small>Select User</small>
                  <select className="form-control select-for-members">
                    <option>Saket M. (Manager)</option>
                    <option>Chandra P. (Analyst)</option>
                    <option>Ram Y. (Analyst)</option>
                    <option>Kishor S. (Analyst)</option>
                  </select>
                </div>
              }
            </div>

            <div className="col-12 col-lg-3 text-right">
              <div className="btn-group mt-2">
                <Link to="/dashboard/new-program" className="btn btn-primary text-white">
                  <i className="fa fa-plus mr-2"></i>
                  New Program
                </Link>
              </div>
            </div>
          </div>

          {
            !dashboardProperty['hasSynced']
            &&
            <PlaceholderLoader />
          }

          {
            dashboardProperty['hasSynced']
            &&
            <div>
              <div className="row">
                <div className="col-12 col-md-3">
                  <Link to='/dashboard/programs' title="Total Programs">
                    <div className="alert alert-primary alert-card">
                      <span className="title">Total Programs</span>
                      <span className="body">{dashboardProperty['dashboard']['Program_Count']['All']} Programs are into system.</span>
                    </div>
                  </Link>
                </div>

                <div className="col-12 col-md-3">
                  <Link to='/dashboard/under-review-programs' title="Programs Under Review">
                    <div className="alert alert-info alert-card">
                      <span className="title">Programs Under Review</span>
                      <span className="body">{dashboardProperty['dashboard']['Program_Count']['Under_Review']} of {dashboardProperty['dashboard']['Program_Count']['All']} Programs are under review.</span>
                    </div>
                  </Link>
                </div>

                <div className="col-12 col-md-3">
                  <Link to='/dashboard/approved-programs' title="Programs Under Review">
                    <div className="alert alert-success alert-card">
                      <span className="title">Programs Approved</span>
                      <span className="body">{dashboardProperty['dashboard']['Program_Count']['Approved']} of {dashboardProperty['dashboard']['Program_Count']['All']} Programs are approved.</span>
                    </div>
                  </Link>
                </div>

                <div className="col-12 col-md-3">
                  <Link to='/dashboard/rejected-programs' title="Programs Under Review">
                    <div className="alert alert-danger alert-card">
                      <span className="title">Programs Rejected</span>
                      <span className="body">{dashboardProperty['dashboard']['Program_Count']['Rejected']} of {dashboardProperty['dashboard']['Program_Count']['All']} Programs are rejected.</span>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          }

        </div>
      </DashboardLayout>
    </div>
  )
}

//
export default Dashboard;