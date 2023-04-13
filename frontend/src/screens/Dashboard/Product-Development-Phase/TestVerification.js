
// Layout
import DashboardLayout from 'screens/Layouts/DashboardLayout';
// React Select
import Select from 'react-select'


//
// Helpers
import { setTitle } from "helpers/common";
// React
import React from 'react';


//
class TestVerification extends React.Component {

    state = {
        loading: true,
        groups: []
    };


    //
    onSubmit = (ev) => {
        let phaseRoute = `/dashboard/product-development-phase/test-validation/${this.state.programUuid}`;
        this.props.history.push(phaseRoute);
    }


    //
    async componentDidMount() {
        let { programUuid } = this.props['match']['params'];
        this.setState({
            programUuid: programUuid
        })
        //
        setTitle("Design Specification - product Development Phase");
    }



    render() {
        return (
            <DashboardLayout>
                <div className="container">
                    <div className="row mx-auto">
                        <div className="col-12 col-lg-12">
                            <form>
                                <div className="card">
                                    <div className="card-header">
                                        <h3>Test Verification</h3>
                                        {/* <small className="text-muted">
                                Use this form to define item definition in system.
                            </small> */}
                                    </div>

                                    <div className="card-body">
                                        <div className="form-group row">
                                            <div className="col-4 text-muted">
                                                Asset ID and Asset Name
                                            </div>
                                            <div className="col-8">
                                                <Select options={this.state.groups} />
                                                <span className="text-danger text-error d-none" data-validation-key="groupName">Please select Group.</span>
                                            </div>

                                        </div>

                                        <div className="form-group row">
                                            <div className="col-4 text-muted">
                                                Security Objective (SO Unique id)
                                            </div>
                                            <div className="col-8">
                                                <input type="text" className="form-control" placeholder="" />
                                            </div>
                                        </div>

                                        <div className="form-group row">
                                            <div className="col-4 text-muted">
                                                Cyber Security Requirements (CS.R. 1.1)
                                            </div>
                                            <div className="col-8">
                                                <input type="text" className="form-control" placeholder="" />
                                            </div>
                                        </div>

                                        <div className="form-group row">
                                            <div className="col-4 text-muted">
                                                Defined Test Case CS.TC 1.1
                                            </div>
                                            <div className="col-8">
                                                <input type="text" className="form-control" placeholder="" />
                                            </div>
                                        </div>

                                        <div className="form-group row">
                                            <div className="col-4 text-muted">
                                                Testing methods
                                            </div>
                                            <div className="col-8">
                                                <Select options={this.state.groups} />
                                                <span className="text-danger text-error d-none" data-validation-key="groupName">Please select Group.</span>
                                            </div>
                                        </div>

                                        <div className="form-group row">
                                            <div className="col-4 text-muted">
                                                Testing Rationale
                                            </div>
                                            <div className="col-8">
                                                <input type="text" className="form-control" placeholder="" />
                                            </div>
                                        </div>

                                        <div className="form-group row">
                                            <div className="col-4 text-muted">
                                                Test and Verification Report
                                            </div>
                                            <div className="col-8">
                                                <input type="text" className="form-control" placeholder="" />
                                            </div>
                                        </div>

                                    </div>

                                    <div className="card-footer py-4">
                                        <button type="submit" className="btn btn-success btn-lg float-right" onClick={(ev) => this.onSubmit(ev)}>
                                            Next
                                        </button>
                                    </div>
                                </div>
                            </form>

                        </div>
                    </div>
                </div>

            </DashboardLayout>
        )
    }

}


export default TestVerification

