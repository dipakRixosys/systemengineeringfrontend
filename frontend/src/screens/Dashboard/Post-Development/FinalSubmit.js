// React
import React from 'react';
// Router
import { withRouter, Link } from 'react-router-dom';
// React Select
import Select from 'react-select'
// Layout
import DashboardLayout from "screens/Layouts/DashboardLayout";
// Loader
import PlaceholderLoader from 'components/ui/placeholder-loader/placeholder-loader';
// Helpers
import { setTitle, modal, uuidV4, programLifecycleRoute } from "helpers/common";
// Network Helpers
import { httpGet, apify } from 'helpers/network';
// jQuery
const jQuery = window.jQuery;

// Security Concept
class FinalSubmit extends React.Component {
  //
  state = {
    loading: true,
    programUuid: undefined,
    program: undefined,
    threats: undefined,
    assets: undefined,
    securityControls: [],
  };

  //
  prepareAssetOptions = (threats) => {
    var assetArray = [];
    threats['Items'].forEach(item => {
      if (item['Identified']) {

        //
        var securityPropertyOptions = [];
        item['Cyber-Security-Properties'].forEach(securityProperty => {
          securityPropertyOptions.push({
            label: securityProperty,
            value: securityProperty,
          });

        });
        item['Cyber-Security-Properties-Options'] = securityPropertyOptions;

        //
        assetArray.push({
          value: item['RefId'],
          label: item['Name'],
          property: item,
        });

      }
    });
    return assetArray;
  }

  //
  onChangeAssetOption = (ev) => {



    this.setState({
      property: ev['property'],
      label: ev['label'],
    }, () => {
      jQuery('.select').selectpicker('refresh');
    });
  }

  //
  onChangeSecurityControlOptions = (ev) => {
    this.setState({
      securityControls: ev,
    });
  }

  //
  onConfirmation = (ev) => {
    //
    ev.preventDefault();
    //
    modal('#ModalConfirmation', 'hide');
    //

    let { programUuid } = this.props['match']['params'];
    httpGet(apify(`app/programs/state-change?programUuid=${programUuid}`)).then(res => {
      let phaseRoute = programLifecycleRoute('VIEW', this.state.programUuid);
      this.props.history.push({
        pathname: phaseRoute,
      });
    });
  }

  //
  onSubmitFinalSubmit = (ev) => {
    ev.preventDefault();
    modal('#ModalConfirmation');
  }


  //
  async componentDidMount() {
    //
    setTitle("Security Concept");

    //
    jQuery('.select').selectpicker('refresh');

    //
    let { programUuid } = this.props['match']['params'];

    //
    this.setState({
      programUuid: programUuid
    });

    var vm = this;

    httpGet(apify(`app/program/?programUuid=${programUuid}`)).then(res => {
      let threats = res['program']['threats'];
      let assets = vm.prepareAssetOptions(threats);

      vm.setState({
        loading: false,
        program: res['program'],
        threats: threats,
        assets: assets,
      }, () => {

      });
    }).catch(err => {
      vm.setState({
        loading: false,
        program: null,
      }, () => {
        console.error(err);
      });
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

                {
                  !this.state.loading &&
                  <div>
                    {
                      !this.state.program &&
                      <div className="alert alert-warning text-white p-3">
                        <h3>Alert!</h3>
                        No such program in our system.
                      </div>
                    }
                  </div>
                }
              </div>
            </div>

            {
              !this.state.loading &&
              <div>
                {
                  this.state.program &&
                  <div className="row">
                    <div className="col-12">


                      {(this.state.program['status'] !== 'APPROVED' && this.state.program['status'] !== 'UNDER-REVIEW') && <div className="card mt-3">
                        <div className="card-header">
                          <h3>Are You Ready to Review The Program?</h3>
                        </div>
                        <div className="card-body">
                          <div className="col-12 has-checkbox">
                            <input type="checkbox" id="submitReview" className='mr-2' value={``} onChange={(event) => {
                              if (event.currentTarget.checked) {
                                this.setState({
                                  submitReview: true
                                })
                              } else {
                                this.setState({
                                  submitReview: false
                                })
                              }
                            }} />
                            <label>
                              You are about to make the final submission of the {this.state.program['phase']} phase</label>
                          </div>


                        </div>
                        <div className="card-footer">
                          <button type="button" className="btn btn-success btn-lg" disabled={!this.state.submitReview} onClick={(ev) => this.onSubmitFinalSubmit(ev)}>
                            Submit for <b>Review</b>
                          </button>
                        </div>
                      </div>}

                    </div>
                  </div>
                }
              </div>
            }
          </div>

          <div className="modal fade" id="ModalConfirmation" tabIndex="-1" data-keyboard="false" data-backdrop="static">
            <div className="modal-dialog modal-full-width">

              <form id="Form-Modal-Confirmation" onSubmit={(ev) => this.onConfirmation(ev)}>
                <div className="modal-content">
                  <div className="modal-header">
                    <h4 className="modal-title text-primary">
                      Information
                    </h4>
                    <button type="button" className="close" data-dismiss="modal">
                      <span>&times;</span>
                    </button>
                  </div>
                  <div className="modal-body">
                    <div className="row">
                      <div className="col-4 full-fa-icon">
                        <i className="fa fa-exclamation-circle"></i>
                      </div>

                      <div className="col-8">
                        <p>You are about to make the final submission of the concept / development / production / updates phase.</p>
                        <p>Please review the change before submission.</p>
                        <p>Any further changes will required you manager/team leader approval.</p>
                        <p><small>(Email notification will be sent to manager once submitted.)</small></p>
                      </div>

                    </div>
                  </div>
                  <div className="modal-footer">
                    <div className="row w-100">
                      <div className="col-12 text-right">
                        <button type="submit" className="btn btn-success btn-lg" >
                          Confirm &amp; <b>Proceed</b>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </form>

            </div>
          </div>

        </DashboardLayout>
      </div>
    );
  }
}

// Security Concept
export default withRouter(FinalSubmit);