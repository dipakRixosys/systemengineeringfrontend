// React
import React from 'react';
// React Router
import { Link, withRouter } from 'react-router-dom';
// DataTable
import DataTable from "react-data-table-component";
// Layout
import DashboardLayout from "screens/Layouts/DashboardLayout";
// Helpers
import { setTitle, programColumns } from "helpers/common";
// Network Helpers
import { httpGet, apify } from "helpers/network";
// Datatable Ajax Loader
import DatatableLoader from 'components/ui/datatable-loader/datatable-loader';
// Datatable No-rows UI
import DatatableNoRows from 'components/ui/datatable-no-rows/datatable-no-rows';

const jQuery = window.jQuery;

// List Programs
class ListPrograms extends React.Component {

  state = {
    programs: [],
    columns: [],
    filterPrograms : [],
    programsProgressPending: true,
  }



  setFilterPrograms = () => {
    let filterPrograms = [];
    let myArray = [];
    let query = jQuery('#SearchPrograms').val();
    
    if (query.length === 0) {
      filterPrograms = this.state['programs'];
    }
    
    else {
      let allPrograms = this.state['programs'];
      let allfilterPrograms = [];

      query = String(query).toLowerCase();

      filterPrograms = allPrograms.filter((program) => {
        allfilterPrograms.push({
          group : program["vehicle_program"]["group"]["name"].toLowerCase(),
          oem : program["vehicle_program"]["oem"]["name"].toLowerCase(),
          modelYear : program["vehicle_program"]["year"],
          system : program["system"]["name"].toLowerCase(),
          phase : program["phase"].toLowerCase(),
          program : program,
        });
        return true;
      })

      allfilterPrograms.filter(pro => {
        if(pro.group?.includes(String(query)) || pro.modelYear?.includes(String(query)) || pro.oem?.includes(String(query)) || pro.phase?.includes(String(query)) || pro.system?.includes(String(query))){
          myArray.push(pro.program)
          return pro.program;
        }
        return false;
      })
      filterPrograms = myArray;
      this.setState({
        filterPrograms: myArray
      });
      return filterPrograms;
    } 

    this.setState({
      filterPrograms: filterPrograms
    });
  }


  async componentDidMount() {
    setTitle("My Programs");

    var vm = this;

    jQuery("body").on("input", "#SearchPrograms", function() {
      vm.setFilterPrograms();
    });

    // Get initial columns for Progran DataTable
    let initialProgramColumns = programColumns({
      appName: 'Lifecycle-App',
    });

    // DataTable columns
    this.setState({
      columns: initialProgramColumns
    });

    // Get list of programs
    httpGet(apify(`app/programs`)).then(res => {
      if (res['success']) {
        this.setState({
          programs: res['programs'],
          programsProgressPending: false,
        },()=> this.setFilterPrograms());
      }
    });
  }

  render() {
    return (
      <div>
        <DashboardLayout allowDemoMode={true}>
          <div className="container-fluid">
            <div className="row">
              <div className="col-12">

                <div className="card">
                  <div className="card-header">
                    <h4>My Programs</h4>
                  </div>

                  <div className="card-body p-0">
                    <div className="form-group px-3 py-1">
                      <input 
                        id="SearchPrograms" 
                        className="form-control" 
                        placeholder="Search by Group, OEM, Year, System, Phase..."
                        autoFocus={true}
                      />
                      </div>
                    {
                      <DataTable
                        columns={this.state.columns}
                        data={this.state.filterPrograms}
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

//
export default withRouter(ListPrograms);