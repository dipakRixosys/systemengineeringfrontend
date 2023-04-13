// React
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
// DataTable
import DataTable from 'react-data-table-component';
// Layout
import DashboardLayout from "screens/Layouts/DashboardLayout";
// Helper
import { setTitle } from "helpers/common";
// Network helper
import { httpGet, apify } from "helpers/network";
// Datatable Loader
import DatatableLoader from "components/ui/datatable-loader/datatable-loader";
// Datatable No Rows
import DatatableNoRows from "components/ui/datatable-no-rows/datatable-no-rows";

// List System
function ListSystem() {
  // Title
  setTitle("List System");

  // Data
  const [columns, setColumns] = useState([]);
  const [tableRows, setTableRows] = useState([]);
  // const [activeEcu, setActiveEcu] = useState(undefined);
  const [ecuProgressPending, setEcuProgressPending] = useState(true);

  // Edit ECU
  const editEdu = useCallback((ecu) => {
    // setActiveEcu({});
    // setActiveEcu(ecu);
  }, []);

  // Constructor
  useEffect(() => {
    // Set DataTable columns
    setColumns([
      {
        name: 'ID',
        selector: row => row.id,
        sortable: true,
      },
      {
        name: 'Name',
        selector: row => row.name,
      },
    ]);

    // Get ECU-list
    httpGet(apify('app/systems')).then(data => {
      setTableRows(data['systems']);
      setEcuProgressPending(false);
    });

  }, [editEdu]);

  // UI
  return (
    <div>
      <DashboardLayout>
        <div className="container-fluid">
          <div className="row">
            <div className="col-12 col-lg-6">

              <div className="card">
                <div className="card-header">
                  <h3>Systems</h3>
                </div>
                <div className="card-body p-0">
                  <DataTable
                    columns={columns}
                    data={tableRows}
                    progressPending={ecuProgressPending}
                    progressComponent={<DatatableLoader />}
                    noDataComponent={<DatatableNoRows text="There are no systems." />}
                    pagination
                  />
                </div>
                <div className="card-footer">
                  <Link to="/dashboard/new-system" className="btn btn-info btn-lg text-white">
                    Create <b>New System</b>
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

export default ListSystem;