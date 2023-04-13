// Dashboard Footer
function DashboardFooter() {
  return(
    <div>
      <footer>
        <div className="container-fluid">
          <div className="row">
            <div className="col-12 col-lg-6">
              <p className="mt-3 text-muted">
                &copy; 2022 All Rights Reserved. <br />
                <a href="https://www.secureelements.io/" target="_blank" rel="noreferrer">
                  Secure Elements Ltd
                </a> <br />
                <small>Version 1.0.1c.react</small>
              </p>
            </div>
            <div className="col-12 col-lg-6 text-right">
              <img src="/favicon.png" className="footer-logo" alt="Secure Elements" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default DashboardFooter;