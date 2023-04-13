//
import NewProjectSlot from "components/slots/NewProject/NewProject";
import { setBodyOverflow } from "helpers/common";
import { useState } from "react";

// Sidebar > New Project
function NewProjectSidebar(props) {

  //
  setBodyOverflow(true);

  //
  const [slotReady, setSlotReady] = useState(false);

  //
  const onSlotReadyChange = (ready) => {
    if (ready) {
      setSlotReady(true);
    }
  }

  //
  const closeSlotSidebar = () => {
    if (props.onSlotReadyChange) {
      props.onSlotReadyChange(false);
      setBodyOverflow(false);
    }
  }

  //
  return(
    <div className="Sidebar RightSidebar NewProjectSidebar">
      <div className="content">
        
        {
          slotReady && 
          <div className="close-button m-3">
            <button className="btn btn-outline-info btn-sm" onClick={closeSlotSidebar}>
              <i className="fa fa-times mr-2"></i>
              Close
            </button>
          </div>
        }

        <NewProjectSlot onSlotReadyChange={onSlotReadyChange} />
      </div>
    </div>
  )
}

export default NewProjectSidebar;