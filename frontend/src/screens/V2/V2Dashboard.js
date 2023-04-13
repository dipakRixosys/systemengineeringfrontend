// React
import React from 'react';
// React Router
import { withRouter } from 'react-router-dom';
// Helpers
import { setTitle } from "helpers/common";
//
import V2DashboardLayout from './Layouts/V2DashboardLayout';

// V2Dashboard
class V2Dashboard extends React.Component {
  //
  state = {
    loading: true,
  };

  //
  async componentDidMount() {
    //
    setTitle("Blank Page");

    //
    this.setState({
      loading: false,
    }, () => {
      
    });
  }
  
  //
  render() {
    return (
      <div>
        <V2DashboardLayout>
          
          <div className="row">
            
              <div className="col-12 col-md-4">
                <div className="card">
                  <div className="card-body">
                    <div className="d-flex">
                      <div className="flex-1 overflow-hidden">
                        <p className="text-truncate font-size-14 mb-2">Total Programs</p>
                        <h4 className="mb-0">1452</h4>
                      </div>
                      <div className="text-primary ms-auto">
                        <i className="ri-stack-line font-size-24"></i>
                      </div>
                    </div>
                  </div>
                  <div className="card-body border-top py-3">
                    <div className="text-truncate">
                      <span className="text-muted">10 programs are into system.</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-12 col-md-4">
                <div className="card">
                  <div className="card-body">
                    <div className="d-flex">
                      <div className="flex-1 overflow-hidden">
                        <p className="text-truncate font-size-14 mb-2">Programs in Review</p>
                        <h4 className="mb-0">1452</h4>
                      </div>
                      <div className="text-primary ms-auto">
                        <i className="ri-stack-line font-size-24"></i>
                      </div>
                    </div>
                  </div>
                  <div className="card-body border-top py-3">
                    <div className="text-truncate">
                      <span className="text-muted">10 programs are into system.</span>
                    </div>
                  </div>
                </div>
              </div>
            
          </div>
          
        </V2DashboardLayout>
      </div>
    );
  }
}

// Blank Page
export default withRouter(V2Dashboard);