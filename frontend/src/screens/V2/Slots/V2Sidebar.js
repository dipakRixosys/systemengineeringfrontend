// Dashboard Layout
function V2Sidebar(props) {
  //
  return (
    <div>
      <div className="vertical-menu">
          <div data-simplebar className="h-100">
            <div id="sidebar-menu">
                <ul className="metismenu list-unstyled" id="side-menu">
                  <li className="menu-title">Menu</li>
                  <li className="mm-active">
                    <a href="index.html" className="waves-effect">
                      <i className="ri-dashboard-line"></i>
                      <span>Dashboard</span>
                    </a>
                  </li>
                  <li>
                    <a href="calendar.html" className=" waves-effect">
                      <i className="ri-calendar-2-line"></i>
                      <span>Projects</span>
                    </a>
                  </li>

                  <li className="menu-title">Analysis</li>
                  <li>
                    <a href="index.html" className="waves-effect">
                      <i className="ri-dashboard-line"></i>
                      <span>Statistical Analysis</span>
                    </a>
                  </li>
                  <li>
                    <a href="index.html" className="waves-effect">
                      <i className="ri-dashboard-line"></i>
                      <span>CVE Database</span>
                    </a>
                  </li>

                  <li className="menu-title">Organization</li>
                  <li>
                    <a href="index.html" className="waves-effect">
                      <i className="ri-dashboard-line"></i>
                      <span>Risks</span>
                    </a>
                  </li>
                  <li>
                    <a href="index.html" className="waves-effect">
                      <i className="ri-dashboard-line"></i>
                      <span>S-BoM</span>
                    </a>
                  </li>
                  <li>
                    <a href="index.html" className="waves-effect">
                      <i className="ri-dashboard-line"></i>
                      <span>Components</span>
                    </a>
                  </li>
                  <li>
                    <a href="index.html" className="waves-effect">
                      <i className="ri-dashboard-line"></i>
                      <span>Upload</span>
                    </a>
                  </li>
                  

                  <li className="menu-title">Settings</li>
                  <li>
                    <a href="index.html" className="waves-effect">
                      <i className="ri-dashboard-line"></i>
                      <span>My Account</span>
                    </a>
                  </li>
                  

                </ul>
            </div>
          </div>
      </div>
    </div>
  )
}

//
export default V2Sidebar;