import React from "react";
import { withRouter } from "react-router-dom";
import DataTable from "react-data-table-component";
import { programColumns, setTitle } from "helpers/common";
import { apify, httpGet } from "helpers/network";
import DashboardLayout from "screens/Layouts/DashboardLayout";
import PlaceholderLoader from "components/ui/placeholder-loader/placeholder-loader";
import DatatableLoader from "components/ui/datatable-loader/datatable-loader";
import DatatableNoRows from "components/ui/datatable-no-rows/datatable-no-rows";

const jQuery = window.jQuery;

// Functional Safety Dashboard
class FunctionalSafety extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      programs: [],
      columns: [],
      filterPrograms : [],
      programsProgressPending: true,
      programType: this.props['programType'],
    };
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
      });

      allfilterPrograms.filter(pro => {
        if(pro.group?.includes(String(query)) || pro.modelYear?.includes(String(query)) || pro.oem?.includes(String(query)) || pro.phase?.includes(String(query)) || pro.system?.includes(String(query))){
          myArray.push(pro.program)
          return pro.program;
        }
        return false;
      });

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
    setTitle("Functional Safety");
    var vm = this;

    jQuery("body").on("input", "#SearchPrograms", function() {
      vm.setFilterPrograms();
    });

    let initialProgramColumns = programColumns({
      appName: 'Functional-Safety-App',
    });

    // DataTable columns
    this.setState({
      columns: initialProgramColumns,
    });

    // Program type

    // Get list of programs
    httpGet(apify(`app/programs?app=Functional-Safety-App`)).then(res => {
      if (res['success']) {
        this.setState({
          programs: res['programs'],
          programsProgressPending: false,
          loading: false,
        },()=> this.setFilterPrograms());
      }
    });

  }

  render() {
    return (
      <div>
        <DashboardLayout app="Criskle-Functional-Safety">
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
                        <h4>Functional Safety</h4>
                        Select program to start/resume your functional safety work.
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
                            data={this.state["filterPrograms"]}
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

export default withRouter(FunctionalSafety);
