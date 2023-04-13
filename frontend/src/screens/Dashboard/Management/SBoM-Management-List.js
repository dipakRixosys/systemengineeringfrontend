import React from 'react';
import { Link } from "react-router-dom";
import DashboardLayout from 'screens/Layouts/DashboardLayout';
import { setTitle } from "helpers/common";
// S-BoM Management List
class SBoMManagementList extends React.Component {

  state = {
    loading: true,
  };

  //
  async componentDidMount() {
    //
    setTitle("S-BOM (Software Bill of Materials) Management");
  }

  //
  render() {
    return (
      <DashboardLayout>
        <div className="container-fluid">
          <div className="row">
            <div className="col-12">
              
              <div className="card">
                <div className="card-header">
                  <h3>S-BOM Management</h3>
                </div>
                
                <div className="card-body">
                  Please select program/project to view S-BoM.
                </div>

                <div className="card-footer">
                  <Link to={`/dashboard/programs`} className="btn btn-primary text-white">
                    Select Programs
                  </Link>
                </div>
              </div>

            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

};

export default SBoMManagementList;