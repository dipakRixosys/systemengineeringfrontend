import { Link } from "react-router-dom";

// Not Found page
function NotFound() {
  return(
    <div className="NotFound">
      <i className="fa fa-exclamation-circle"></i>
      <h3><b>Requested resource/page</b> not found.</h3>

      <Link className="mt-2" to="/dashboard">
        <i className="fa fa-chevron-left mr-2"></i>
        Back to Dashboard
      </Link>
    </div>
  )
}

export default NotFound;