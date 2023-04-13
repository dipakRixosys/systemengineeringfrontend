import { nullIfEmpty } from "helpers/common";
import { useState, useEffect } from "react";

function ShowThreatsFromLifecycle (props) {
  const { program, hazardId } = props;
  const [ threatData, setThreatData ] = useState(null);

  useEffect(() => {
    if (hazardId && hazardId[0]) {
      const threatsArray = program['threats']['Identification']['Threats'];
      const targetHazard = hazardId[0];
      
      threatsArray.forEach(threat => {
        if (threat['Hazop-Object-Data']) {
          if (threat['Hazop-Object-Data']['Hazards-Uuids'].includes(targetHazard['uuid'])) {
            console.log("threat", threat);
            setThreatData(threat);
          }
        }
      });

    }
  }, [program, hazardId]);

  return (
    <div>
      {
        threatData && 
        <div>
          <div className="row">
            <div className="col-4 label">Threat ID</div>
            <div className="col-8">
              <input 
                type="text" 
                className="form-control md-form-control" 
                defaultValue={threatData['RefId']} 
                readOnly={true}
              />
            </div>
          </div>

          <div className="row">
            <div className="col-4 label">Threat Type</div>
            <div className="col-8">
              <input 
                type="text" 
                className="form-control md-form-control" 
                defaultValue={threatData['Threat-Type'][0] ? threatData['Threat-Type'][0]['label'] : 'N/A'} 
                readOnly={true}
              />
            </div>
          </div>

          <div className="row">
            <div className="col-4 label">Threat Attack Steps</div>
            <div className="col-8">
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th className="text-left">Attack Step</th>
                    <th className="text-left">Threat Level</th>
                    <th className="text-left">Threat SeCL</th>
                  </tr>
                </thead>
                <tbody>
                {
                  threatData['Attack-Steps'].map(step => {
                    if (step['Attack-Step-SeCL-Pref']) {
                      return (
                        <tr key={step['Attack-Step-RefId']}>
                          <td>{step['Attack-Step']}</td>
                          <td>{step['Attack-Step-Threat-Level']}</td>
                          <td>{step['Attack-Step-Security-Leval-Rating']}</td>
                        </tr>
                      )
                    }
                    return null;
                  })
                }
                </tbody>
              </table>
            </div>
          </div>

        </div>
      }
    </div>
  )
}

export default ShowThreatsFromLifecycle;