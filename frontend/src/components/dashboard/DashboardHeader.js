import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getDashboardMenu } from "helpers/dashboard-menu";
import { modal, getUserProperty, getLocalData, isInDemoMode } from "helpers/common";

// jQuery
const jQuery = window.jQuery;

// Dashboard Header
function DashboardHeader(props) {
  const [menu, setMenu] = useState([]);
  const [innerApps, setInnerApps] = useState([]);
  const [appProperty, setAppProperty] = useState({});

  // Show UserAccount modal
  function toggleUserMenu() {
    modal('#ModalUserAccount', {
      show: true,
    });
  }

  // On load
  useEffect(() => {
    jQuery("#PrimaryNavbar").addClass('d-none');

    // Close/Open HTML
    let closeMenuText = `
      Account <i className='fa fa-chevron-up'></i>
    `;
    let openMenuText = `
      Account <i className='fa fa-chevron-down'></i>
    `;

    // Button text based on menu state
    jQuery('#PrimaryNavbar-Button').html(openMenuText);

    // Open/close logic on Button click
    jQuery('body').on('click', '#PrimaryNavbar-Button', function() {
      let hasHiddenClass = jQuery("#PrimaryNavbar").hasClass('d-none');
      if (hasHiddenClass) { jQuery('#PrimaryNavbar-Button').html(openMenuText); }
      if (!hasHiddenClass) { jQuery('#PrimaryNavbar-Button').html(closeMenuText); }
      return true;
    });

    // Inner Apps array
    let innerApps = getLocalData('innerApps');
    setInnerApps(innerApps);

    // Get default-primary app
    let appName = props['app'] ?? `Criskle-Lifecycle-Management`;
    innerApps.forEach(app => {
      if (app['name'] === appName) {
        setAppProperty(app);
        return;
      }
    });

    // Menu item based on primary app
    let menuItems = getDashboardMenu(appName);
    setMenu(menuItems);
  }, [props]);
  
  // Toggle navbar
  function toggleNavbar() {
    jQuery("#PrimaryNavbar").toggleClass('d-none');
    jQuery("#PrimaryNavbar-Overlay").toggleClass('d-none');
  }

  // UI
  return(
    <div className="DashboardHeader">

      {/* Navbar-Content */}
      <div id="PrimaryNavbar-Content">
        {/* Header  */}
        <header className="header-bg-primary text-white py-2 d-none" id="PrimaryNavbar">
          <div className="container-fluid">
            <div className="row">
              <div className="col-12 col-lg-1 text-left d-none">
                <Link to={appProperty['link'] ?? '/dashboard'}>
                  <img className="logo" src="/logo-sm.png" alt="CRISKLE by Secure Elements" />
                </Link>
              </div>
              
              <div className="col-12 col-lg-6 text-left mt-3">
                <img src="/logo-criskle.png" className="header-criskle-logo" alt="CRISKLE" title="CRISKLE by Secure Elements" />
                <h3 className="text-login">
                  {appProperty['title']}
                </h3>
              </div>

              <div className="col-12 col-lg-6 text-right user-account-menu mt-3" onClick={toggleUserMenu} title="Open User Menu">
                <div className="pr-4 mt-1">
                  <small className="text-uppercase">User Account</small> <br />
                  <h4>
                    {getUserProperty('name')}
                  </h4>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Navigation */}
        <nav className="navbar navbar-expand-lg navbar-light header-submenu-bg m-0 p-0 px-2">
          <div className="col-10">
            <ul className="navbar-nav mr-auto">
              <li className="nav-item mr-4">
                <Link className="nav-link" to={appProperty['link'] ?? '/dashboard'}>
                  Dashboard
                </Link>
              </li>
              
              {
                menu.map(parent => {
                  return (
                    <li key={parent.title} className="nav-item dropdown mr-3">
                      <a className="nav-link dropdown-toggle" href="#!" data-toggle="dropdown">
                        {parent.title}
                      </a>
                      <div className="dropdown-menu">
                        {
                          parent.items.map(item => {
                            return(
                              <div key={item.title}>
                                {
                                  Boolean(item.use_link_prop) && 
                                  <Link className="dropdown-item" to={item.link} title={item.title}>
                                    { item.title }
                                  </Link>
                                }
                                {
                                  !Boolean(item.use_link_prop) && 
                                  <a className="dropdown-item" href={item.link} title={item.title}>
                                    { item.title }
                                  </a>
                                }
                                { item.follow_divider && <div className="dropdown-divider"></div> }
                              </div>
                            )
                          })
                        }
                      </div>
                    </li>
                  )
                })
              }

              {
                innerApps.length > 0 && 
                <li key="innerApps" className="nav-item dropdown mr-3">
                  <a className="nav-link dropdown-toggle" href="#!" data-toggle="dropdown">
                    Switch Apps
                  </a>
                  <div className="dropdown-menu">
                    {
                      innerApps.map(app => {
                        return(
                          <div key={app.title}>
                            <Link className="dropdown-item" to={app.link} title={app.title}>
                              {app.title}
                            </Link>
                          </div>
                        )
                      })
                    }
                  </div>
                </li>
              }
            </ul>
          </div>
          <div className="col-2 text-right">
            <div className="mr-4">
              { isInDemoMode() && <span className="demo-mode-sticker">DEMO Mode</span> }
              <button className="btn btn-primary btn-sm" id="PrimaryNavbar-Button" onClick={toggleNavbar}>
                
              </button>
            </div>
          </div>
        </nav>
      </div>

      {/* Overlay */}
      <div id="PrimaryNavbar-Overlay" className="d-none"></div>
    </div>
  )
}

export default DashboardHeader;