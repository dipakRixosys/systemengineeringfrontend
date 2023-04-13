// React
import React from 'react';
//
import { withRouter } from 'react-router-dom';
// Layout
import DashboardLayout from "screens/Layouts/DashboardLayout";
// Loader
import PlaceholderLoader from 'components/ui/placeholder-loader/placeholder-loader';
// Helpers
import { setTitle } from "helpers/common";

// Blank Page
class BlankPage extends React.Component {
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
        <DashboardLayout>
          <div className="container-fluid">
            <div className="row">
              <div className="col-12">
                {
                  this.state.loading && 
                  <PlaceholderLoader />
                }
              </div>
            </div>

            {
              !this.state.loading && 
              <div>
                {
                  <div>
                    
                    <div className="card">
                      <div className="card-header">
                        Header
                      </div>
                      <div className="card-body">
                        Body
                      </div>
                      <div className="card-footer">
                        Footer
                      </div>
                    </div>

                  </div>
                }
              </div>
            }
            
          </div>
        </DashboardLayout>
      </div>
    );
  }
}

// Blank Page
export default withRouter(BlankPage);