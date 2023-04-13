//
import V2Sidebar from 'screens/V2/Slots/V2Sidebar';
// 
import V2Topbar from 'screens/V2/Slots/V2Topbar';

// Dashboard Layout
function V2DashboardLayout(props) {
  //
  return (
    <div>
      <div id="layout-wrapper">
        <V2Topbar />
        <V2Sidebar />

        <main className="main-content">
          <div className="page-content">
            <div className="container-fluid">
              {props.children}
            </div>
          </div>
        </main>
        
      </div>
    </div>
  )
}

//
export default V2DashboardLayout;