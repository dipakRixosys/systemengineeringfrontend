// React
import React from 'react';
// React Router
import { Link } from "react-router-dom";
// Layout
import DashboardLayout from 'screens/Layouts/DashboardLayout';
// Helpers
import { setTitle } from "helpers/common";

// Digital Twin Choose Program
class DigitalTwinChooseProgram extends React.Component {

  state = {
    loading: true,
  };
  
  async componentDidMount() {
    setTitle("Choose Program for Digital Twin");
  }

  render() {
    return (
      <DashboardLayout allowDemoMode={false}>
        <div className="container-fluid">
          <div className="row">
            <div className="col-12">

              <div className="card">
                <div className="card-header">
                  <h3>Digital Twin</h3>
                </div>
                
                <div className="card-body">
                  Please select program/project to view Digital Twin.
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

export default DigitalTwinChooseProgram;