import React from "react";
import { withRouter } from "react-router-dom";
import DataTable from "react-data-table-component";
import { programColumns, setTitle } from "helpers/common";
import { apify, httpGet } from "helpers/network";
import DashboardLayout from "screens/Layouts/DashboardLayout";
import PlaceholderLoader from "components/ui/placeholder-loader/placeholder-loader";
import DatatableLoader from "components/ui/datatable-loader/datatable-loader";
import DatatableNoRows from "components/ui/datatable-no-rows/datatable-no-rows";

// Audit Tool Dashboard
class AuditTool extends React.Component {
  state = {
    loading: true,
    programs: [],
    columns: [],
    programsProgressPending: true,
  };

  async componentDidMount() {
    setTitle("Audit Tool");

    let initialProgramColumns = programColumns({
      appName: 'Audit-Tool-App',
    });

    // DataTable columns
    this.setState({
      columns: initialProgramColumns,
    });

    // Get list of programs
    httpGet(apify(`app/programs?app=Audit-Tool-App`)).then(res => {
      if (res['success']) {
        this.setState({
          programs: res['programs'],
          programsProgressPending: false,
          loading: false,
        });
      }
    });
  }

  render() {
    return (
      <div>
        <DashboardLayout app="Criskle-Audit-Tool">
          <div className="container-fluid">
            <div className="row">
              <div className="col-12">
                {this.state.loading && <PlaceholderLoader />}
              </div>
            </div>

            {!this.state.loading && (
              <div>
                {
                  <div>
                    <div className="card">
                      <div className="card-header">
                        <h4>Audit Tool</h4>
                        Select program.
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
                    </div>
                  </div>
                }
              </div>
            )}
          </div>
        </DashboardLayout>
      </div>
    );
  }
}

export default withRouter(AuditTool);