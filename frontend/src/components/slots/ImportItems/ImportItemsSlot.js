import { useEffect, useState, useCallback, useRef } from "react";
import PlaceholderLoader from "components/ui/placeholder-loader/placeholder-loader";

// Slot > 
function ImportItemsSlot(props) {
  // Page-load
  const [ pageLoad, setPageLoad ] = useState(false);

  // Component ref.
  const mountedRef = useRef(true);

  // Fetch initial data
  const fetchInitData = useCallback(async() => {

    // 
    setTimeout(() => {
      // Unmounted ref.
      if (!mountedRef.current) return null;

      // Set page properties
      setPageLoad(true);

      // If it is slot-callable
      if (props.onSlotReadyChange) {
        props.onSlotReadyChange(true);
      }
      
    }, 500);

  }, [props, mountedRef]);


  // Effect
  useEffect(() => {
    // Get form ready
    fetchInitData();

    // Clean-up code
    return () => {
      mountedRef.current = false;
    };
  }, [pageLoad, fetchInitData]);

  //
  return(
    <div>
      {/* Show loader when is loading */}
      {
        !pageLoad && 
        <PlaceholderLoader />
      }

      {/* New Program */}
      {
        pageLoad
        && 
        <div className="card">
          <div className="card-header">
            <h3>Import Designs</h3>
            <small className="text-muted">
              Import your existing <b>componets/functions/channels.</b>
            </small>
          </div>
          
          <div className="card-body">
            
            <div className="form-group row">
              <div className="col-4 text-muted">
                Filter/search
              </div>
              <div className="col-8">
                <input className="form-control md-form-control" placeholder="Start typing ID/Name/Title..." autoFocus />
              </div>
            </div>

            <ul className="list-unstyled">
              <li className="item-list" title="Click to Import Design into Canvas">
                <div className="item-container">
                  <b>Bluetooth-ADAS-Connector</b> <br /> 
                  <span className="badge badge-info p-2 mr-2">Component</span>
                  InputPorts: 3 | OutputPorts: 7
                </div>
              </li>
              <li className="item-list" title="Click to Import Design into Canvas">
                <div className="item-container">
                  <b>ADAS-Unit</b> <br /> 
                  <span className="badge badge-info p-2 mr-2">Function</span>
                  InputPorts: 2 | OutputPorts: 1
                </div>
              </li>
              <li className="item-list" title="Click to Import Design into Canvas">
                <div className="item-container">
                  <b>PKi-Audi-Center</b> <br /> 
                  <span className="badge badge-info p-2 mr-2">DFD</span>
                  InputPorts: 1 | OutputPorts: 2
                </div>
              </li>
            </ul>
                      
          </div>

          <div className="card-footer py-4">
            
          </div>
        </div>
      }
    </div>
  );
}

//
export default ImportItemsSlot;