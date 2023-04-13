import React, { useRef, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { modal, programLifecycleRoute } from "helpers/common";
import PlaceholderLoader from "components/ui/placeholder-loader/placeholder-loader";
import { apify, httpPost } from "helpers/network";

const jQuery = window.jQuery;

// Shortcut Key
// When pressed using Ctrl -> Open modal
const SHORTCUT_KEY = "b";

// Event listener for button press (Ctrl + B)
const useEventListener = (eventName, handler, element = window) => {
  const savedHandler = useRef();

  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    const eventListener = (event) => savedHandler.current(event);
    element.addEventListener(eventName, eventListener);
    return () => {
      element.removeEventListener(eventName, eventListener);
    };
  }, [eventName, element]);
};


// Global Search
const GlobalSearch = () => {

  const handler = (key) => {
    if (key.ctrlKey && key.key === SHORTCUT_KEY) {
      modal("#GlobalSearchModal");
    }
  };

  useEventListener("keydown", handler);

  const [recentPrograms, setRecentPrograms] = useState([]);
  const [recentProgramsLoaded, setRecentProgramsLoaded] = useState(false);

  const [defaultMenu, setDefaultMenu] = useState([]);
  const [helpMenu, setHelpMenu] = useState([]);
  const [showDefaultResults, setShowDefaultResults] = useState(true);

  const [queryResults, setQueryResults] = useState({});
  const [queryResultsLoaded, setQueryResultsLoaded] = useState(false);


  useEffect(() => {
    let apiSubscribed = true;

    let defaultMenu = [
      {"title": "My Programs", "url": "/dashboard/programs"},
      {"title": "Under Reviewed Programs", "url": "/dashboard/under-review-programs"},
      {"title": "Functional Safety App", "url": "/app/functional-safety"},
      {"title": "Cyber Security Vulnerability Management", "url": "/dashboard/cybersecurity/vulnerability-management"},
      {"title": "Manage ECUs", "url": "/dashboard/ecu"},
    ];
    setDefaultMenu(defaultMenu);

    let helpMenu = [
      {"title": "How to make program?", "url": "/docs/how-to-make-program"},
      {"title": "How to sync program to JIRA?", "url": "/docs/how-to-sync-program-to-jira"},
    ];
    setHelpMenu(helpMenu);

    fetchRecentProgramList();

    jQuery('body').on('change', '#GlobalSearchInput', function(ev) {
      if (apiSubscribed) {
        let query = jQuery('#GlobalSearchInput').val();
        fetchQueryResults(query);
        setShowDefaultResults(false);
      }
    });

    return () => {
      apiSubscribed = false;
    };

  }, []);

  const fetchRecentProgramList = () => {
    httpPost(apify('app/search')).then(res => {
      let { recentlyVisitedPrograms } = res;
      setRecentPrograms(recentlyVisitedPrograms);
      setRecentProgramsLoaded(true);
    });
  }

  const fetchQueryResults = (query) => {
    let params = {
      'query': query
    };

    httpPost(apify('app/query'), params).then(res => {
      setQueryResults({
        "programs": res['programs'],
        "ecus": res['ecus'],
      });
      setQueryResultsLoaded(true);
    });
  }

  const doResetResults = () => {
    jQuery('#GlobalSearchInput').val('');
    setShowDefaultResults(true);
  }

  return (
    <>
      <div className="modal fade" id="GlobalSearchModal" tabIndex="-1" role="dialog">
        <div className="modal-dialog modal-lg overflow-hidden" role="dialog">
          <div className="modal-content" style={{ height: 600 }}>
            <div className="modal-header">
              <h5 className="modal-title">
                Search in your <strong>CRISKLE Workspace</strong>
              </h5>
            </div>
            <div className="modal-body overflow-auto">
              <div className="form-group">
                <input
                  id="GlobalSearchInput"
                  className="form-control md-form-control"
                  placeholder="Search here (Programs)..."
                  autoFocus={true}
                />
                
                {
                  !showDefaultResults && 
                  <button className="btn btn-outline-primary btn-sm my-2 float-right" onClick={(ev) => doResetResults(ev)}>
                    Reset Results
                  </button>
                }

              </div>

              {
                showDefaultResults && 
                <div>
                  <div className="my-4">
                    <h5>Recently Opened Programs</h5>
                    { !recentProgramsLoaded && <PlaceholderLoader />}
                    { 
                      recentProgramsLoaded &&
                      <ul className="list-group">
                        {
                          recentPrograms.map(row => {
                            return(
                              <Link key={row['program_uuid']} to={programLifecycleRoute('VIEW', row['program_uuid'])} className="list-group-item d-flex justify-content-between align-items-center">
                                {row['program_name']}
                              </Link> 
                            )
                          })
                        }
                      </ul>
                    }
                  </div>

                  <div className="my-4">
                    <h5>Quick Links</h5>
                    <ul className="list-group">
                    {
                      defaultMenu.map(item => {
                        return(
                          <Link key={item['url']} to={item['url']} className="list-group-item d-flex justify-content-between align-items-center">
                            {item['title']}
                          </Link>
                        )
                      })
                    }
                    </ul>
                  </div>

                  <div className="my-4">
                    <h5>Help &amp; Support</h5>
                    <ul className="list-group">
                    {
                      helpMenu.map(item => {
                        return(
                          <Link key={item['url']} to={item['url']} className="list-group-item d-flex justify-content-between align-items-center">
                            {item['title']}
                          </Link>
                        )
                      })
                    }
                    </ul>
                  </div>
                </div>
              }

              {
                !showDefaultResults && 
                <div className="my-5">
                  { !queryResultsLoaded && <PlaceholderLoader /> }
                  
                  {
                    queryResultsLoaded &&
                    <div>
                      <h5>Programs</h5>
                      <ul className="list-group">
                      {
                        queryResults['programs'].map(row => {
                          return(
                            <Link key={row['uuid']} to={programLifecycleRoute('VIEW', row['uuid'])} className="list-group-item d-flex justify-content-between align-items-center">
                              {row['name']}
                            </Link>
                          )
                        })
                      }
                      </ul>
                    </div> 
                  }
                </div>
              }

            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default GlobalSearch;