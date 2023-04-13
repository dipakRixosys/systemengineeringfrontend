import React, { useState, useEffect } from "react";
import { apify, httpGet } from "helpers/network";
import { setTitle } from "helpers/common";
import PlaceholderLoader from "components/ui/placeholder-loader/placeholder-loader";

// Program Layout
function ProgramLayout (props) {
  // Program UUID
  const { programUuid } = props;
  // Program
  const [program, setProgram] = useState(undefined);
  // Loading
  const [loading, setLoading] = useState(true);

  setTitle("Program loading...");
  
  useEffect(() => {  
    // Fetch from server
    httpGet(apify(`app/program?programUuid=${programUuid}`)).then((res) => {
      if (res["success"]) {
        setProgram(res["program"]);
        setLoading(false);
        setTitle(`${res["program"]["name"]} | Program`);
      }
    });
  }, [programUuid]);
  
  return(
    <div>
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            { loading && <PlaceholderLoader /> }
          </div>
        </div>

        {
          !loading && 
          program && 
          <div>
            {
              <div>
                <div className="card">
                  
                  {
                    props['header'] && 
                    <div className="card-header">
                      { React.cloneElement(props['header'], {program}) }
                    </div>
                  }
                  
                  {
                    props['children'] && 
                    <div className="card-body">
                      { props['children'] }
                    </div>
                  }

                  {
                    props['body'] && 
                    React.cloneElement(props['body'], {program})
                  }

                  {
                    props['footer'] && 
                    <div className="card-footer">
                      { React.cloneElement(props['footer'], {program}) }
                    </div>
                  }
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>
  )
}

export default ProgramLayout;