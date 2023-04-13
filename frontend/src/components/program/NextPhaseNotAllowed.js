import { programLifecycleRoute } from "helpers/common";
import { Link } from "react-router-dom";

function NextPhaseNotAllowed(props) {
  return (
    <div>
      <div className="row">
        <div className="col-12">
          <div className="card-header">
            <h3>{ props['title'] }</h3>
            <small>Program</small> <br />
            <Link to={programLifecycleRoute('VIEW', props.program['uuid'])}>
              { props.program['name'] }
            </Link>
          </div>
          <div className="card-body alert alert-warning text-dark">
            { props['errorMessage'] }
          </div>
          <div className="card-footer">
            { props['backButtonCtx'] }
          </div>
        </div>
      </div>
    </div>
  )
};

export default NextPhaseNotAllowed;