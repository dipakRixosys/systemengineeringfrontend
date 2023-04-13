
// Layout
import DashboardLayout from 'screens/Layouts/DashboardLayout';
// Helpers
import { setTitle } from "helpers/common";
// React
import React from 'react';


//
class AdvanceSearch extends React.Component {

    state = {
        loading: true,
        groups: []
    };


    //
    onSubmit = () => {
        let phaseRoute = `/dashboard/product-development-phase/integration-verification/${this.state.programUuid}`;
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
                <div className="container-fluid">
                    <div className="row mx-auto">
                        <div className="col-12 col-lg-12">
                            <form>
                                <div className="card">
                                    <div className="card-header">
                                        <h3>Advance Search</h3>
                                        {/* <small className="text-muted">
                                         Use this form to define item definition in system.
                                        </small> */}
                                    </div>

                                    <div className="card-body">
                                        <div className="form-group row">
                                            <div className="col-md-12 text-muted">
                                                <form className="form-inline">
                                                    <input className="form-control mr-sm-2" style={{ width: '90%' }} type="search" placeholder="Search" aria-label="Search" />
                                                    <button className="btn btn-outline-success my-2 mr-3 " type="submit">Search</button>
                                                </form>
                                            </div>
                                        </div>

                                        <div className="d-flex justify-content-between ">
                                            <p className="m-2">Only Submitted entries will be visible in this view</p>
                                            <nav className="nav nav-pills nav-fill">
                                                <a className="nav-item nav-link active" href="#!">Tabular View</a>
                                                <a className="nav-item nav-link" href="#!">Graphical View</a>
                                            </nav>
                                        </div>


                                        <div className="row">
                                            <div className="col-md-11">
                                                <table className="table table-bordered mt-4">
                                                    <thead>
                                                        <tr>
                                                            <th>ECU Name</th>
                                                            <th>Asset Category</th>
                                                            <th>Attack ID & Desscription</th>
                                                            <th>Security Objective</th>
                                                            <th>Threat</th>
                                                            <th>Threat Scenar</th>
                                                            <th>Attack Path</th>
                                                            <th>Attack Feasibility Rating</th>
                                                            <th>Impact Rating</th>
                                                            <th>CAL Level</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr>
                                                            <td>111 Brakes</td>
                                                            <td>abc</td>
                                                            <td>XXX</td>
                                                            <td>abc</td>
                                                            <td>nabc</td>
                                                            <td>Medium</td>
                                                            <td>Major</td>
                                                            <td>CAL 3</td>
                                                            <td></td>
                                                            <td></td>
                                                        </tr>
                                                    </tbody>
                                                </table>

                                            </div>

                                            <div className="col-md-1 mt-4">
                                                <button type="submit" className="btn btn-success btn-lg float-right">
                                                    Add column
                                                </button>
                                            </div>

                                        </div>


                                    </div>

                                    <div className="card-footer py-4">
                                        <button type="submit" className="btn btn-success btn-lg float-right">
                                            Export Excel/Word/Json/CSV
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


export default AdvanceSearch

