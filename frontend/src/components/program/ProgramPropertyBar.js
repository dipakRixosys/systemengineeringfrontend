import { useState, useEffect } from "react";
import { modal } from "helpers/common";

function ProgramPropertyBar(props) {
  // View Program system conf. table
  const [viewSystemConf, setViewSystemConf] = useState(false);

  // Show system config. modal
  const showSystemConf = (ev) => {
    ev.preventDefault();
    setViewSystemConf(true);
  };

  // Based on viewSystemConf show/hide modal
  useEffect(() => {
    if (viewSystemConf) {
      modal("#ModalProgramSysConf");
    }
  }, [viewSystemConf]);

  return (
    <div>
      <h6 className="text-muted text-uppercase">Property</h6>
      <table className="table table-bordered">
        <thead>
          <tr>
            <th className="text-left">Group</th>
            <th className="text-left">OEM</th>
            <th className="text-left">Vehicle</th>
            <th className="text-left">Model year</th>
            <th className="text-left">System</th>
            <th className="text-left">Phase</th>
            {props.program["is_system_configured"] && ( <th className="text-left">System Configuration</th> )}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{props.program["vehicle_program"]["group"]["name"]}</td>
            <td>{props.program["vehicle_program"]["oem"]["name"]}</td>
            <td>{props.program["vehicle_program"]["program"]}</td>
            <td>{props.program["vehicle_program"]["year"]}</td>
            <td>{props.program["system"]["name"]}</td>
            <td>{props.program["phase"]}</td>
            {props.program["is_system_configured"] && (
              <td>
                <a href="#!" onClick={(ev) => showSystemConf(ev)}>
                  View System Configuration
                </a>
              </td>
            )}
          </tr>
        </tbody>
      </table>

      {props.program && props.program["is_system_configured"] && viewSystemConf && (
        <div>
          <div className="modal fade" id="ModalProgramSysConf" tabIndex="-1" data-keyboard="false" data-backdrop="static">
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h4 className="modal-title text-primary">
                    View <b>System Configuration</b>
                  </h4>
                  <button type="button" className="close" data-dismiss="modal" onClick={(ev) => setViewSystemConf(false)}>
                    <span>&times;</span>
                  </button>
                </div>
                <div className="modal-body">
                  <table className="table table-bordered">
                    <thead>
                      <tr>
                        <th>Function</th>
                        <th>Component</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.keys(props.program["system_configuration"]).map(
                        (row) => {
                          return (
                            <tr key={props.program["system_configuration"][row]["uuid"]}>
                              <td>
                                {props.program["system_configuration"][row]["name"]}
                              </td>
                              <td>
                                {
                                  props.program["system_configuration"][row]["components"].map((component) => {
                                  return (
                                    <span key={component["component_uuid"]} className="badge badge-primary p-2 mr-2">
                                      {component["component_name"]}
                                    </span>
                                  );
                                })}
                              </td>
                            </tr>
                          );
                        }
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
};

export default ProgramPropertyBar;