
// Layout
import DashboardLayout from 'screens/Layouts/DashboardLayout';
// Router
import { Link } from 'react-router-dom';
// React Select
import Select from 'react-select'
// Network Helpers
import { httpGet, apify } from 'helpers/network';
// Helpers
import { setTitle, programLifecycleRoute } from "helpers/common";
// React
import React from 'react';


//
class MonitoringTaraScreens extends React.Component {

    state = {
        loading: true,
        groups: []
    };


    //
    onSubmit = (ev) => {
        let phaseRoute = `/dashboard/cybersecurity/integration-verification/${this.state.programUuid}`;
        this.props.history.push(phaseRoute);
    }


    //
    async componentDidMount() {
        //
        setTitle("Design Specification - product Development Phase");


        //
        let { programUuid } = this.props['match']['params'];

        //
        this.setState({
            programUuid: programUuid
        });

        let vm = this

        httpGet(apify(`app/program/threats?programUuid=${programUuid}`)).then(res => {

            vm.setState({
                loading: false,
                program: res['program'],
                canGotoNextPhase: false,
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

    render() {
        return (
            <DashboardLayout>
                <div className="container-fluid">
                    <div className="row mx-auto">
                        <div className="col-12 col-lg-7">
                            {this.state.program && <form>
                                <div className="card">

                                    <div className="card-header">

                                        <div className="row">
                                            <div className="col-8">
                                                <h3>Vulnerability Monitoring and Triage (FOR TARA Screen)</h3>
                                                <small>Program</small> <br />
                                                <Link to={programLifecycleRoute('VIEW', this.state.program['uuid'])}>
                                                    {this.state.program['name']}
                                                </Link>
                                            </div>
                                            <div className="col-4 text-right mt-3">
                                                <h4 class="badge badge-primary">
                                                    {this.state.program['status'] === 'REJECTED' ? 'Rejected and Re-Opened ' : this.state.program['status'].replace('-', ' ')}
                                                </h4>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="card-body">
                                        <div className="row">
                                            <div className="col-md-12 mb-3">
                                                <Select options={this.state.groups} />
                                                <span className="text-danger text-error d-none" data-validation-key="groupName">Please select Group.</span>
                                            </div>
                                        </div>

                                        <div className="row">
                                            <div className="col-md-6">
                                                <div className="form-group row">
                                                    <div className="col-5 text-muted">
                                                        Select Item Definition Name
                                                    </div>
                                                    <div className="col-7">
                                                        <Select options={this.state.groups} />
                                                        <span className="text-danger text-error d-none" data-validation-key="groupName">Please select Group.</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="col-md-6">
                                                <div className="form-group row">
                                                    <div className="col-5 text-muted">
                                                        Asset Category
                                                    </div>
                                                    <div className="col-7">
                                                        <Select options={this.state.groups} />
                                                        <span className="text-danger text-error d-none" data-validation-key="groupName">Please select Group.</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="row">
                                            <div className="col-md-6">
                                                <div className="form-group row">
                                                    <div className="col-5 text-muted">
                                                        Create New Vulnerability
                                                    </div>
                                                    <div className="col-7">
                                                        <input type="text" className="form-control md-form-control" placeholder="" />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="col-md-6">
                                                <div className="form-group row">
                                                    <div className="col-5 text-muted">
                                                        Asset ID, Name
                                                    </div>
                                                    <div className="col-7">
                                                        <input type="text" className="form-control md-form-control" placeholder="" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="form-group row">
                                            <div className="col-4 text-muted">
                                                Phase
                                            </div>
                                            <div className="col-8">
                                                <Select options={this.state.groups} />
                                                <span className="text-danger text-error d-none" data-validation-key="groupName">Please select Group.</span>
                                            </div>
                                        </div>

                                        <div className="row">
                                            <div className="col-md-6">
                                                <div className="form-group row">
                                                    <div className="col-5 text-muted">
                                                        Is this Vulnerability Internal ?
                                                    </div>
                                                    <div className="col-7">
                                                        <Select options={this.state.groups} />
                                                        <span className="text-danger text-error d-none" data-validation-key="groupName">Please select Group.</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="col-md-6">
                                                <div className="form-group row">
                                                    <div className="col-5 text-muted">
                                                        Internal Sources
                                                    </div>
                                                    <div className="col-7">
                                                        <Select options={this.state.groups} />
                                                        <span className="text-danger text-error d-none" data-validation-key="groupName">Please select Group.</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="form-group row">
                                            <div className="col-4 text-muted">
                                                Vulnerability Number /CVE Number (if applicable)
                                            </div>
                                            <div className="col-8">
                                                <input type="text" className="form-control md-form-control" placeholder="" />
                                            </div>
                                        </div>

                                        <div className="row">
                                            <div className="col-md-6">
                                                <div className="form-group row">
                                                    <div className="col-5 text-muted">
                                                        Is this Vulnerability External ?
                                                    </div>
                                                    <div className="col-7">
                                                        <Select options={this.state.groups} />
                                                        <span className="text-danger text-error d-none" data-validation-key="groupName">Please select Group.</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="col-md-6">
                                                <div className="form-group row">
                                                    <div className="col-5 text-muted">
                                                        External Sources
                                                    </div>
                                                    <div className="col-7">
                                                        <Select options={this.state.groups} />
                                                        <span className="text-danger text-error d-none" data-validation-key="groupName">Please select Group.</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="form-group row">
                                            <div className="col-4 text-muted">
                                                Vulnerability Number /CVE Number (if applicable)
                                            </div>
                                            <div className="col-8">
                                                <input type="text" className="form-control md-form-control" placeholder="" />
                                            </div>
                                        </div>

                                        <div className="row">
                                            <div className="col-md-6">
                                                <div className="form-group row">
                                                    <div className="col-5 text-muted">
                                                        Triage Triggers
                                                    </div>
                                                    <div className="col-7">
                                                        <Select options={this.state.groups} />
                                                        <span className="text-danger text-error d-none" data-validation-key="groupName">Please select Group.</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="col-md-6">
                                                <div className="form-group row">
                                                    <div className="col-5 text-muted">
                                                        Triage Description
                                                    </div>
                                                    <div className="col-7">
                                                        <input type="text" className="form-control md-form-control" placeholder="" />
                                                    </div>
                                                </div>
                                            </div>


                                            <div className="col-md-6">
                                                <div className="form-group row">
                                                    <div className="col-5 text-muted">
                                                        Triage ID
                                                    </div>
                                                    <div className="col-7">
                                                        <input type="text" className="form-control md-form-control" placeholder="" />
                                                    </div>
                                                </div>
                                            </div>

                                        </div>
                                    </div>

                                    <div className="card-footer py-4">
                                        <button type="submit" className="btn btn-success btn-lg float-right">
                                            Save/Cancel
                                        </button>
                                        <button type="submit" className="btn btn-success btn-lg float-right mr-3" onClick={(ev) => this.onSubmit(ev)}>
                                            Next
                                        </button>
                                    </div>
                                </div>
                            </form>}

                        </div>
                    </div>
                </div>

            </DashboardLayout>
        )
    }

}

export default MonitoringTaraScreens


