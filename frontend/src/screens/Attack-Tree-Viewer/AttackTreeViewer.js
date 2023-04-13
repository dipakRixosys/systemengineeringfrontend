import React from 'react';
import Select from 'react-select'
import { withRouter } from 'react-router-dom';
import DashboardLayout from "screens/Layouts/DashboardLayout";
import PlaceholderLoader from 'components/ui/placeholder-loader/placeholder-loader';
import { setTitle, modal } from "helpers/common";
import { httpPost, apify } from 'helpers/network';
// jQuery
const jQuery = window.jQuery;
// Attack Tree Parser
const AttackTreeParser = window.AttackTreeParser;

// Model Viewer 
class AttackTreeViewer extends React.Component {
  state = {
    loading: true,
    programUuid: undefined,
    attackTree: {},
    tree: {},
    root: {},
    nodes: {},
    treeLoading: true,
    errorCtx: false,
  };

  renderD3Chart = (attackTree) => {
    let p = new AttackTreeParser();
    p.setSteps(attackTree);
    p.makeD3Graph('#d3Chart');

    this.setState({
      attackTree: attackTree,
      treeLoading: false,
    });
  }

  onChangeThreat = (ev) => {
    let attackTreeJson = ev['attackTreeJson'];
    this.setState({
      selectedThreatOption: ev,
    }, () => {
      this.renderD3Chart(attackTreeJson);
    });
  }

  setupD3 = () => {
    var vm = this;
    let params = {
      'programUuid': this.state.programUuid
    };

    httpPost(apify(`app/program/attack-tree`), params).then(res => {
      let attackTreeData = res['attackTreeData'];
      let threatOptions = attackTreeData['threats'];
      let defaultThreat = threatOptions[0];

      vm.setState({
        threatOptions: threatOptions,
        selectedThreatOption: defaultThreat,
      }, () => {
        vm.renderD3Chart(defaultThreat['attackTreeJson']);
      });

    }).catch(err => {
      vm.setState({
        errorCtx: true
      });
    });
  }
  
  async componentDidMount() {
    setTitle("Attack Tree Viewer");

    let { programUuid } = this.props['match']['params'];
    
    this.setState({
      loading: false,
      programUuid: programUuid,
    }, () => {
      this.setupD3();

      //
      jQuery('body').on('click', '.has-html-content', function(e) {
        try {
          let html = jQuery(this).attr('data-html');
          modal('#Modal-Show-Attack-Info', {
            show: true,
          });
          html = decodeURI(html);
          jQuery('.widget-modal-body').html(html);

        } catch (error) {
          
        }
      });
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
              this.state.errorCtx && 
              <div className="row">
                <div className="col-12">
                  <div className="alert alert-danger alert-card">
                    No such program/attack tree found in our system.
                  </div>
                </div>
              </div>
            }

            {
              !this.state.errorCtx && 
              !this.state.loading && 
              <div>
                {
                  <div>
                    
                    <div className="card">
                      <div className="card-header">
                        
                        <div className="row py-3">
                          <div className="col-8">
                            <h3 className="card-title mb-2">Attack Tree</h3>
                            <i>Select threat to view attack tree.</i>
                          </div>

                          <div className="col-4">
                            <label>Select Threat</label>
                            <Select
                              options={this.state.threatOptions}
                              value={this.state.selectedThreatOption}
                              onChange={(ev) => this.onChangeThreat(ev)}
                              menuPortalTarget={document.body} styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                            />
                          </div>
                        </div>

                      </div>
                      <div className="card-body">
                        {
                          this.state.treeLoading && 
                          <PlaceholderLoader />
                        }
                        <div id="d3Chart"></div>
                      </div>
                    </div>

                    <div className="modal fade" id="Modal-Show-Attack-Info" tabIndex="-1" data-backdrop="static">
                      <div className="modal-dialog modal-full-width">

                        <div className="modal-content">
                          <div className="modal-header">
                            <h4 className="modal-title text-primary">
                              Attack Info
                            </h4>
                            <button type="button" className="close" data-dismiss="modal">
                              <span>&times;</span>
                            </button>
                          </div>
                          <div className="modal-body widget-modal-body">
                          </div>
                        </div>
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

export default withRouter(AttackTreeViewer);