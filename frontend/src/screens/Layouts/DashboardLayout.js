import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { applyLocationChangeEvents, isInDemoMode, modal } from "helpers/common";
import DashboardHeader from "components/dashboard/DashboardHeader";
import DashboardFooter from "components/dashboard/DashboardFooter";
import ModalInjector from "components/modals/ModalInjector";
import GlobalSearch from "components/modals/GlobalSearch";
import NotAllowedInDemoMode from "components/dashboard/NotAllowedInDemoMode";

// Dashboard Layout
function DashboardLayout(props) {
  const { children, app, allowDemoMode } = props;
  const [ renderChildren, setRenderChildren ] = useState(false);

  // On history/location change event
  const history = useHistory();
  history.listen((location, action) => {
    applyLocationChangeEvents();
    modal('#GlobalSearchModal', 'hide');
  });

  // [FUNCTION] Check if PAID blocks to render or not
  useEffect(() => {
    const isDemoMode = isInDemoMode();
    if (isDemoMode) {
      setRenderChildren(isDemoMode && allowDemoMode);
    }
    else {
      setRenderChildren(true);
    }
  }, [allowDemoMode]);

  // [UI]
  return (
    <div>
      <DashboardHeader app={app} />
      <main>
        {renderChildren   && children}
        {!renderChildren  && <NotAllowedInDemoMode />}
      </main>
      <DashboardFooter />
      <GlobalSearch className="position-absolute top-0 z-index-2"/>
      <ModalInjector />
    </div>
  )
}

//
export default DashboardLayout;