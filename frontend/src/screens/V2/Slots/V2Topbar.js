// Dashboard Layout
function V2Topbar(props) {
  //
  return (
    <div>
      <header id="page-topbar">
        <div className="navbar-header">

          <div className="d-flex">
            <div className="navbar-brand-box">
              <a href="/" className="logo logo-dark">
                CRISKLE
              </a>
              <a href="/" className="logo logo-light">
                CRISKLE
              </a>
            </div>

            <button type="button" className="btn btn-sm px-3 font-size-24 header-item waves-effect" id="vertical-menu-btn">
                <i className="ri-menu-2-line align-middle"></i>
            </button>

            <form className="app-search d-none d-lg-block">
              <div className="position-relative">
                <input type="text" className="form-control" placeholder="Search Programs, Projects..." />
                <span className="ri-search-line"></span>
              </div>
            </form>
          </div>

          {/* Right Topbar */}
          <div className="d-flex">
            {
              false && 
              <div className="dropdown d-none d-lg-inline-block ms-1">
                <button type="button" className="btn header-item noti-icon waves-effect" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                  <i className="ri-apps-2-line"></i>
                </button>
                <div className="dropdown-menu dropdown-menu-lg dropdown-menu-end">
                  <div className="px-lg-2">
                      <div className="row g-0">
                        <div className="col">
                            <a className="dropdown-icon-item" href="#!">
                            <img src="assets/images/brands/github.png" alt="Github" />
                            <span>GitHub</span>
                            </a>
                        </div>
                        <div className="col">
                            <a className="dropdown-icon-item" href="#!">
                            <img src="assets/images/brands/bitbucket.png" alt="bitbucket" />
                            <span>Bitbucket</span>
                            </a>
                        </div>
                      </div>
                      <div className="row g-0">
                        <div className="col">
                            <a className="dropdown-icon-item" href="#!">
                            <img src="assets/images/brands/dropbox.png" alt="dropbox" />
                            <span>Dropbox</span>
                            </a>
                        </div>
                        <div className="col">
                            <a className="dropdown-icon-item" href="#!">
                            <img src="assets/images/brands/mail_chimp.png" alt="mail_chimp" />
                            <span>Mail Chimp</span>
                            </a>
                        </div>
                      </div>
                  </div>
                </div>
              </div>
            }
            
            {
              false && 
              <div className="dropdown d-none d-lg-inline-block ms-1">
                <button type="button" className="btn header-item noti-icon waves-effect" data-toggle="fullscreen">
                  <i className="ri-fullscreen-line"></i>
                </button>
              </div>
            }

            <div className="dropdown d-inline-block">
              <button type="button" className="btn header-item noti-icon waves-effect" id="page-header-notifications-dropdown" data-bs-toggle="dropdown" aria-expanded="false">
                <i className="ri-notification-3-line"></i>
                <span className="noti-dot"></span>
              </button>
              
              <div className="dropdown-menu dropdown-menu-lg dropdown-menu-end p-0" aria-labelledby="page-header-notifications-dropdown">
                <div className="p-3">
                    <div className="row align-items-center">
                      <div className="col">
                          <h6 className="m-0"> Notifications </h6>
                      </div>
                      <div className="col-auto">
                          <a href="#!" className="small"> View All</a>
                      </div>
                    </div>
                </div>

                <div data-simplebar>
                  <a href="#!" className="text-reset notification-item">
                    <div className="d-flex">
                      <div className="flex-1">
                        <h6 className="mb-1">Your program is reviewed.</h6>
                        <div className="font-size-12 text-muted">
                          <p className="mb-1">If several languages coalesce the grammar</p>
                          <p className="mb-0"><i className="mdi mdi-clock-outline"></i> 3 min ago</p>
                        </div>
                      </div>
                    </div>
                  </a>

                  <a href="#!" className="text-reset notification-item">
                    <div className="d-flex">
                      <div className="flex-1">
                        <h6 className="mb-1">Analysis report is available.</h6>
                        <div className="font-size-12 text-muted">
                          <p className="mb-1">If several languages coalesce the grammar</p>
                          <p className="mb-0"><i className="mdi mdi-clock-outline"></i>13 min ago</p>
                        </div>
                      </div>
                    </div>
                  </a>
                </div>

                  <div className="p-2 border-top">
                    <div className="d-grid">
                      <a className="btn btn-sm btn-link font-size-14 text-center" href="#!">
                        <i className="mdi mdi-arrow-right-circle me-1"></i>
                        View More
                      </a>
                    </div>
                  </div>
                </div>
            </div>

            <div className="dropdown d-inline-block user-dropdown">
              <button type="button" className="btn header-item waves-effect" id="page-header-user-dropdown" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                <img className="rounded-circle header-profile-user" src="/logo-sm.png" alt="Header Avatar" />
                <span className="d-none d-xl-inline-block ms-1">Saket Mohan</span>
                <i className="mdi mdi-chevron-down d-none d-xl-inline-block"></i>
              </button>
              
              <div className="dropdown-menu dropdown-menu-end">
                <a className="dropdown-item" href="#!">
                  <i className="ri-user-line align-middle me-1"></i> 
                  My Account
                </a>

                <a className="dropdown-item" href="#!">
                  <i className="ri-wallet-2-line align-middle me-1"></i> 
                  Manage Organization
                </a>

                <a className="dropdown-item d-block" href="#!">
                  <i className="ri-settings-2-line align-middle me-1"></i> 
                  Settings
                </a>

                <div className="dropdown-divider"></div>
                <a className="dropdown-item text-danger" href="#!">
                  <i className="ri-shut-down-line align-middle me-1 text-danger"></i> 
                  Logout
                </a>
              </div>
            </div>
          </div>
          {/* Right Topbar ENDS */}

        </div>
      </header>
    </div>
  )
}

//
export default V2Topbar;