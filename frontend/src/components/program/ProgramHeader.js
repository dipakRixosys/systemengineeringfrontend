import { programLifecycleRoute } from "helpers/common";
import { Link } from "react-router-dom";

function ProgramHeader(props) {

  const statusBadgeClass = (status) => {
    let className = "badge-primary";
    
    switch (String(status).toUpperCase()) {
      
      case 'REJECTED':
        className = "badge-danger";
        break;

      case 'IN-PROCESS':
        className = "badge-info";
        break;

      case 'APPROVED':
        className = "badge-success";
        break;

      case 'UNDER-REVIEW':
        className = "badge-warning";
        break;
    
      default:
        break;
    }
    
    return className;
  }


  return (
    <div>
      <div className="row">
        <div className="col-8">
          { props.title ? <h4>{props.title}</h4> : null }
          <small className="text-muted text-uppercase">Program</small> <br />
          <Link to={programLifecycleRoute('Functional-Safety-View', props.program['uuid'])}>
            { props.program["name"] }
          </Link>
        </div>
        <div className="col-4 text-right mt-3">
          {
            true && 
            <h4 className={`badge badge-v2 px-4 py-2 ${statusBadgeClass(props.program["fs_status"])}`}>
            {
              props.program["fs_status"] === "REJECTED"
              ? "Rejected and Re-Opened"
              : props.program["fs_status"].replace("-", " ")
            }
            </h4>
          }
        </div>
      </div>
    </div>
  )
};

export default ProgramHeader;