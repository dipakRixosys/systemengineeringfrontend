// React
import React from 'react';
//
import { withRouter } from 'react-router-dom';

// React Router
import { Link } from "react-router-dom";
// DataTable
import DataTable from "react-data-table-component";
// Layout
import DashboardLayout from "screens/Layouts/DashboardLayout";
// Helpers
import { setTitle, swalPopup, programColumns } from "helpers/common";
// Network Helpers
import { httpGet, apify, httpPost } from "helpers/network";
// Datatable Ajax Loader
import DatatableLoader from 'components/ui/datatable-loader/datatable-loader';
// Datatable No-rows UI
import DatatableNoRows from 'components/ui/datatable-no-rows/datatable-no-rows';
// Swal
const Swal = window.Swal;

// All Programs
class AllPrograms extends React.Component {
  //
  state = {
    programs: [],
    columns: [],
    programsProgressPending: true,
  }

  // Change State Function
  changeState = (programUuid, state) => {
    //
    Swal.fire({
      html: `
        Do you want to ${state} this program? <br />
      `,
      confirmButtonText: 'Yes',
      input: state === 'REJECT' && "text",
      inputPlaceholder: "Give the reason for reject",
      showCloseButton: true,
    }).then(async (result) => {
      //
      if (result.isConfirmed) {
        let params = {
          'programUuid': programUuid,
          'state': state,
        };

        let message = 'Program Approved Succesfully'

        if (state === 'REJECT') {
          params.rejected_remark = result.value
          message= 'Please review the programme again and re-submit'
        }

        httpPost(apify('app/programs/state-change'), params).then(data => {
          swalPopup(message, 'success');
          // Get list of programs
          httpGet(apify(`app/all-programs`)).then(res => {
            if (res['success']) {
              this.setState({ programs: res['programs'] });
            }
          });
        }).catch(() => {
          swalPopup("Something went wrong.");
        });
      }
    });
  }

  // Constructor
  async componentDidMount() {
    // Title
    setTitle("All Programs");

    // Get initial columns for Progran DataTable
    let initialProgramColumns = programColumns({
      appName: 'Lifecycle-App',
    });

    // DataTable columns
    this.setState({
      columns: initialProgramColumns,
      programsProgressPending: true,
    });

    // Get list of programs
    httpGet(apify(`app/all-programs`)).then(res => {
      if (res['success']) {
        this.setState({
          // Programs
          programs: res['programs'],
          // Hide loader from DataTable
          programsProgressPending: false, 
        });
      }
    });
  }

  // UI
  render() {
    return (
      <div>
        <DashboardLayout>
          <div className="container-fluid">
            <div className="row">
              <div className="col-12">

                <div className="card">
                  <div className="card-header">
                    <h4>All Programs</h4>
                  </div>

                  <div className="card-body p-0">
                    {
                      <DataTable
                        columns={this.state.columns}
                        data={this.state.programs}
                        progressPending={this.state.programsProgressPending}
                        progressComponent={<DatatableLoader />}
                        noDataComponent={<DatatableNoRows text="There are no programs in system." />}
                        pagination
                      />
                    }
                  </div>

                  <div className="card-footer">
                    <Link to="/dashboard/new-program" className="btn btn-info btn-lg text-white">
                      <b>Create New Program</b>
                    </Link>
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

export default withRouter(AllPrograms);