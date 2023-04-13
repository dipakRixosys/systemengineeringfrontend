import React from 'react';
import { withRouter } from 'react-router-dom';
import DashboardLayout from "screens/Layouts/DashboardLayout";
import PlaceholderLoader from 'components/ui/placeholder-loader/placeholder-loader';
import { setTitle } from "helpers/common";

// Model Viewer 
class ModelViewerSample extends React.Component {
  state = {
    loading: true,
  };
  
  async componentDidMount() {
    setTitle("Sample Model Viewer");
    
    this.setState({
      loading: false,
    }, () => {
      
    });
  }
  
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
                        <h3>3D Model Viewer</h3>
                      </div>
                      <div className="card-body">
                        <model-viewer 
                          class="model-viewer-canvas"
                          alt="Neil Armstrong's Spacesuit from the Smithsonian Digitization Programs Office and National Air and Space Museum" 
                          src="https://criskle-uploads.s3.eu-west-2.amazonaws.com/3d-models/NeilArmstrong.glb" 
                          ar 
                          ar-modes="webxr scene-viewer quick-look" 
                          environment-image="https://criskle-uploads.s3.eu-west-2.amazonaws.com/3d-models/moon_1k.hdr" 
                          poster="https://criskle-uploads.s3.eu-west-2.amazonaws.com/3d-models/NeilArmstrong.webp" 
                          seamless-poster 
                          shadow-intensity="1" 
                          camera-controls
                        ></model-viewer>
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

export default withRouter(ModelViewerSample);