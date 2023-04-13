
// Layout
import DashboardLayout from 'screens/Layouts/DashboardLayout';
// React Select
import Select from 'react-select'
// Router
import { Link } from 'react-router-dom';
// Network Helpers
import { httpGet, apify } from 'helpers/network';

// Helpers
import { setTitle, programLifecycleRoute } from "helpers/common";
// React
import React from 'react';


//
class ArchitecturalDesign extends React.Component {

    state = {
        loading: true,
        groups: []
    };


    //
    onSubmit = (ev) => {
        let phaseRoute = `/dashboard/cybersecurity/vulnerability-management/${this.state.programUuid}`;
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


        var vm = this;

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
                {!this.state.loading && <div className="container-fluid">
                    {this.state.program && <div className="row mx-auto">
                        <div className="col-12 col-lg-9">
                            <form>
                                <div className="card">

                                    <div className="card-header">

                                        <div className="row">
                                            <div className="col-8">
                                                <h3>Cyber Security Requirements Refinement and Architectural Design</h3>
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


                                        <div className="form-group row">
                                            <div className="col-4 text-muted">
                                                Vulnerability ID
                                            </div>
                                            <div className="col-8">
                                                <Select options={this.state.vulnerabilities} />
                                            </div>

                                        </div>

                                        <div className="form-group row">
                                            <div className="col-4 text-muted">
                                                Security Objective (SO Unique id)
                                            </div>
                                            <div className="col-8">
                                                <input type="text" className="form-control md-form-control" placeholder="" />
                                            </div>
                                        </div>

                                        <div className="form-group row">
                                            <div className="col-4 text-muted">
                                                Cyber Security Requirement (CS.R.1.1)
                                            </div>
                                            <div className="col-8">
                                                <input type="text" className="form-control md-form-control" placeholder="" />
                                            </div>
                                        </div>


                                        <div className="row">
                                            <div className="col-md-6">
                                                <div className="form-group row">
                                                    <div className="col-5 text-muted">
                                                        Security Concept / Security Controls
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
                                                        New Cyber Security Requirements based on new Risk Rating (CS.R.1.2)
                                                    </div>
                                                    <div className="col-7">
                                                        <input type="text" className="form-control md-form-control" placeholder="" />

                                                    </div>
                                                </div>
                                            </div>

                                            <div className="col-md-6">
                                                <div className="form-group row">
                                                    <div className="col-5 text-muted">
                                                        New Security Concept / Security Controls Previously applied (SC.ID 1.2)
                                                    </div>
                                                    <div className="col-7">
                                                        <input type="text" className="form-control md-form-control" placeholder="" />

                                                    </div>
                                                </div>
                                            </div>

                                            <div className="col-md-6">
                                                <div className="form-group row">
                                                    <div className="col-5 text-muted">
                                                        Create Cyber Security GOALs = Security Objectives (SO ID 1.2)

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
                                            Save/Close
                                        </button>
                                        <button type="submit" className="btn btn-success btn-lg float-right mr-4" onClick={(ev) => this.onSubmit(ev)}>
                                            Next
                                        </button>
                                    </div>
                                </div>
                            </form>

                        </div>
                        {/* Right sidebar */}
                        <div className="col-12 col-md-3">
                            <div className="card">
                                <div className="card-header">
                                    <h3>Requirements Refinement and Architectural Design</h3>
                                </div>
                                <div className="card-body p-0">
                                    <table className="table table-bordered">
                                        <thead>
                                            <tr>
                                                <th>Refinement</th>
                                                <th></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {/* No Threats */}
                                            {
                                                false && this.state.threats['Identification']['Threats'].length === 0
                                                &&
                                                <tr>
                                                    <td colSpan="2">
                                                        No Vulnerability yet.
                                                    </td>
                                                </tr>
                                            }

                                            {/* Threats */}
                                            {
                                                false && this.state.threats['Identification']['Threats'].map(threat => {
                                                    return (
                                                        <tr key={threat['RefId']}>
                                                            <td>
                                                                {threat['Parent-Asset']} <br />
                                                                <small>{threat['Parent-Cyber-Security']}</small>
                                                            </td>
                                                            <td className="text-right">
                                                                <a href="#!" className="identified-threat-configure-button" data-ref-id={threat['RefId']}>
                                                                    <i className="fa fa-gear mr-1"></i>
                                                                    Configure
                                                                </a>
                                                            </td>
                                                        </tr>
                                                    )
                                                })
                                            }
                                        </tbody>
                                    </table>

                                    <div className="alert alert-info m-2">
                                        <h5>Alert</h5>
                                        0 Vulnerability Assesment
                                    </div>



                                    <div className="m-2">

                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>}
                </div>}

            </DashboardLayout>
        )
    }

}

export default ArchitecturalDesign

