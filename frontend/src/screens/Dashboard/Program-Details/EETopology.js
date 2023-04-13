//
import { setTitle } from "helpers/common";
import DashboardLayout from "screens/Layouts/DashboardLayout";
import PlaceholderLoader from "components/ui/placeholder-loader/placeholder-loader";
import { httpGet, apify } from "helpers/network";
// React
import React from 'react';

//
class EETopology extends React.Component {


  state = {
    topologyImage: null
  }

  //
  async componentDidMount() {

    //
    setTitle("EE Topology");

    //
    httpGet(apify('app/ee-topology')).then(data => {
      //
      try {
        var defaultTopologyImage = `${data['eeTopology'][0]['image_path']}`;
        this.setState({ topologyImage: defaultTopologyImage });
      }

      //
      catch (error) {
        alert("Something went wrong when fetched EE-Topology image.");
      }
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

                <div className="card">
                  <div className="card-header">
                    <h3>EE Topology</h3>
                  </div>

                  <div className="card-body">
                    {
                      (this.state.topologyImage === undefined) &&
                      <div>
                        <p>Loading EE Topology from server...</p>
                        <PlaceholderLoader />
                      </div>
                    }
                    {
                      (this.state.topologyImage !== undefined) &&
                      <div>
                        <img src={this.state.topologyImage} className="ee-topology-full-preview" alt="EE Topology" />
                      </div>
                    }
                  </div>

                  <div className="card-footer py-4">
                    <button className="btn btn-success btn-lg mr-2">
                      Upload
                    </button>
                    <button className="btn btn-dark btn-lg">
                      History
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </DashboardLayout>
      </div>
    )
  }
}

//
export default EETopology;