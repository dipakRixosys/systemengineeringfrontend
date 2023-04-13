import { programLifecycleRoute } from "helpers/common";
import { Link } from "react-router-dom";

function ProgramSwitchApp(props) {
  let { program, currentApp } = props;
  return (
    <>
      <div className="dropdown d-inline">
        <button className="btn btn-secondary dropdown-toggle" type="button" data-toggle="dropdown">
          Switch to
        </button>
        <div className="dropdown-menu">
          {
            (currentApp !== 'Criskle-Lifecycle-App') && 
            <Link className="dropdown-item" to={programLifecycleRoute('VIEW', program['uuid'])}>
              Lifecycle App
            </Link>
          }

          {
            (currentApp !== 'Criskle-Functional-Safety') && 
            <Link className="dropdown-item" to={programLifecycleRoute('Functional-Safety-View', program['uuid'])}>
              Functional Safety App
            </Link>
          }

          {
            true && 
            <Link className="dropdown-item" to={programLifecycleRoute('System-Configuration', program['uuid'])}>
              System Configuration
            </Link>
          }

          {
            true && 
            <Link className="dropdown-item" to={programLifecycleRoute('Vulnerability-Monitoring-And-Triage', program['uuid'])}>
              Vulnerability Monitoring and Triage
            </Link>
          }
        </div>
      </div>
    </>
  )
};

export default ProgramSwitchApp;