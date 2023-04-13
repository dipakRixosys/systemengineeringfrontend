// React
import React from 'react';
// React Router
import { withRouter } from 'react-router-dom';
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

// Under Review Programs
class UnderReviewPrograms extends React.Component {

  state = {
    programs: [],
    columns: [],
    programsProgressPending: true,
  }

  // Constructor
  async componentDidMount() {

    setTitle("Under Review Programs");

    let initialProgramColumns = programColumns({
      appName: 'Lifecycle-App',
    });

    // DataTable columns
    this.setState({
      columns: initialProgramColumns,
    })

    // Get list of programs
    httpGet(apify(`app/under-review-programs`)).then(res => {
      if (res['success']) {
        this.setState({
          programs: res['programs'],
          programsProgressPending: false,
        });
      }
    });

    // return () => mounted = false;
  }

  // [COMBACK]: Check if run or fails due to [changeState] array inclusion 
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
          httpGet(apify(`app/under-review-programs`)).then(res => {
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

  render() { //
    return (
      <div>
        <DashboardLayout>
          <div className="container-fluid">
            <div className="row">
              <div className="col-12">

                <div className="card">
                  <div className="card-header">
                    <h4>Under Review Programs</h4>
                  </div>

                  <div className="card-body p-0">
                    {
                      <DataTable
                        columns={this.state.columns}
                        data={this.state.programs}
                        progressPending={this.state.programsProgressPending}
                        progressComponent={<DatatableLoader />}
                        noDataComponent={<DatatableNoRows text="There are no programs under review." />}
                        pagination
                      />
                    }
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
export default withRouter(UnderReviewPrograms);