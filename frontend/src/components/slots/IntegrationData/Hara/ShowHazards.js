import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { modal, programLifecycleRoute } from "helpers/common";
import PlaceholderLoader from "components/ui/placeholder-loader/placeholder-loader";

function IntegrationShowHazards({ programUuid, hazopFunctions, targetFunctionName, onUpdateHaraHazopUuids }) {
  const [ isLoading, setIsLoading ] = useState(false);
  const [ targetHazopFunction, setTargetHazopFunction ] = useState(null);
  const [ focusHazardObject, setFocusHazardObject ] = useState(null);

  const fetchHazards = () => {
    setIsLoading(true);
    const targetHazopFunctions = hazopFunctions.filter((row) => {
      return (row['Function'] === targetFunctionName);
    });
    const targetHazopFunction = (Array.from(targetHazopFunctions).length > 0) ? targetHazopFunctions[0] : null; 
    setTargetHazopFunction(targetHazopFunction);
    setIsLoading(false);
  }

  useEffect(() => {
    let hazardTargetFunctionUuid = undefined;
    let hazardsUuids = [];
    if (targetHazopFunction && targetHazopFunction['Hazards'].length > 0) {
      hazardTargetFunctionUuid = targetHazopFunction['Function-Uuid'];
      hazardsUuids = targetHazopFunction['Hazards'].map(h => {
        return h['Hazard-Uuid'];
      });
    }
    onUpdateHaraHazopUuids({
      'Hazard-Target-Function-Uuid': hazardTargetFunctionUuid,
      'Hazards-Uuids': hazardsUuids,
    });
  }, [targetHazopFunction]);

  const viewHazardInfo = (hazardObject) => {
    modal('#ModalHazardInfo');
    setFocusHazardObject(hazardObject);
  }

  useEffect(() => {
    let ajaxSubscribed = true;

    if (ajaxSubscribed && targetFunctionName) {
      fetchHazards();
    }
    
    return () => {
      ajaxSubscribed = false;
    }

  }, [targetFunctionName]);

  return (
    <div>
      { isLoading && <PlaceholderLoader />}
      { 
        !isLoading && 
        targetHazopFunction &&
        <div>
          <div className="card p-2 my-4">
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th className="text-left">Hazard ID</th>
                  <th className="text-left">Hazard Name</th>
                  <th className="text-left">ASIL Rating</th>
                  <th className="text-left">Safety Goals</th>
                  <th className="text-left"></th>
                </tr>
              </thead>
              <tbody>
                {
                  targetHazopFunction['Hazards'].map((hazardObject) => {
                    return (
                      <tr key={hazardObject['Hazard-Uuid']}>
                        <td>{hazardObject['Hazard-ID']}</td>
                        <td>{hazardObject['Hazardous-Name']}</td>
                        {
                          hazardObject["Event"] &&
                          <React.Fragment>
                            <td>
                              <span className="badge badge-v2 p-2" style={{backgroundColor: `${hazardObject["Event"]["ASIL-Rating-Bg-Color"]}`, color:`${hazardObject["Event"]["ASIL-Rating-Text-Color"]}`}}>
                                {hazardObject["Event"]['ASIL-Rating-Value']}
                              </span>
                            </td>
                            <td>
                              {
                                hazardObject["Event"]['Safety-Goals'].map((goal, idx) => {
                                  return (
                                    <span key={idx} className="badge badge-primary badge-v2 p-2">
                                      {goal}
                                    </span>
                                  )
                                })
                              }
                            </td>
                          </React.Fragment>
                        }
                        <td className="text-right">
                          <button className="btn btn-outline-primary btn-sm ml-4" onClick={ev => viewHazardInfo(hazardObject)}>
                            <i className="fa fa-eye mr-2"></i>
                            View Hazard Info 
                          </button>
                        </td>
                      </tr>
                    )
                  })
                }
              </tbody>
              <tfooot>
                <tr>
                  <td>
                    <Link to={programLifecycleRoute('Functional-Safety-Concept', programUuid)} className="btn btn-info text-white" target="_blank">
                      View <b>Functional Safety Concept</b>
                      <i className="fa fa-external-link ml-2" />
                    </Link>
                  </td>
                </tr>
              </tfooot>
            </table>
          </div>

          <div className="modal fade" id="ModalHazardInfo" tabIndex="-1" data-keyboard="true" data-backdrop="static">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h4 className="modal-title text-primary">
                  View Hazard Info
                </h4>
                <button type="button" className="close" data-dismiss="modal">
                  <span>&times;</span>
                </button>
              </div>

              <div className="modal-body p-0">
                {
                  focusHazardObject &&
                  <table className="table table-striped table-bordered">
                    <tbody>
                      <tr>
                        <td className="font-weight-bold">Hazard ID</td>
                        <td>{focusHazardObject['Hazard-ID']}</td>
                      </tr>
                      <tr>
                        <td className="font-weight-bold">Hazard Name</td>
                        <td>{focusHazardObject['Hazardous-Name']}</td>
                      </tr>
                      <tr>
                        <td className="font-weight-bold">Hazard Description</td>
                        <td>{focusHazardObject['Hazard-Description']}</td>
                      </tr>
                      <tr>
                        <td className="font-weight-bold">Hazard Remarks</td>
                        <td>{focusHazardObject['Hazard-Remarks']}</td>
                      </tr>
                      <tr>
                        <td className="font-weight-bold">Guide Words</td>
                        <td>
                          <ul>
                          {
                            focusHazardObject['Guide-Words'].map((w) => {
                              return(<li key={w}>{w}</li>)
                            })
                          }
                          </ul>
                        </td>
                      </tr>
                      <tr>
                        <td className="font-weight-bold">Malfunction Behaviour</td>
                        <td>{focusHazardObject['Malfunction-Behaviour']}</td>
                      </tr>
                      <tr>
                        <td className="font-weight-bold">Output Failure Type</td>
                        <td>{focusHazardObject['Output-Failure-Type']}</td>
                      </tr>
                    </tbody>
                  </table>
                }
              </div>

            </div>
          </div>
          </div>
        </div>
      }
    </div>
  );
}

export default IntegrationShowHazards;