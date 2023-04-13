function NotAllowedInDemoMode() {
  return(
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h4>Can't access in DEMO Mode</h4>
            </div>
            <div className="card-body">
              This <b>module/feature/screen</b> not allowed in DEMO mode.
            </div>
            <div className="card-body">
              <button className="btn btn-primary btn-block btn-large">
                Upgrade License
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotAllowedInDemoMode;