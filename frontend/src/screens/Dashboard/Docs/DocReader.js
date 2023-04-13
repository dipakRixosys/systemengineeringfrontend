import { useEffect, useState } from "react";
import { setTitle } from "helpers/common";
import DashboardLayout from "screens/Layouts/DashboardLayout";
import PlaceholderLoader from "components/ui/placeholder-loader/placeholder-loader";

function DocReader() {
  const [loading, setLoading] = useState(true);

  // Constructor
  useEffect(() => {
    setTitle("Help Document");
    setLoading(false);
  }, []);

  // UI 
  return (
    <DashboardLayout>
      <div className="container-fluid">

        <div className="row">
          <div className="col-12">
            { loading && <PlaceholderLoader /> }
            
            {
              !loading && 
              <div className="card">
                <div className="card-header">
                  <h3>
                    <small className="text-primary">Help &amp; Support</small> <br />
                    How to configure JIRA Integrations in your CRISKLE program?
                  </h3>
                </div>

                <div className="card-body">
                  <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer porta mattis imperdiet. In id sapien gravida, vehicula justo sit amet, vehicula purus. Donec blandit mollis magna, non aliquet mauris bibendum eget. Nunc placerat ultrices erat, at pulvinar orci tempus venenatis. Sed vulputate ante id massa lacinia suscipit. Sed quis justo laoreet, blandit odio et, tristique magna. Fusce mattis nibh eget ante volutpat, nec fringilla arcu condimentum. In gravida est non ante accumsan, sit amet imperdiet libero volutpat. Nulla at odio libero. Suspendisse potenti. Cras luctus ligula elit, nec tincidunt nisl pellentesque vel. Curabitur velit tortor, sollicitudin a ex ut, vulputate iaculis arcu.</p>
                  <p>Etiam at auctor eros, nec luctus enim. Suspendisse bibendum, quam et facilisis laoreet, ipsum ex iaculis felis, in sagittis ipsum libero sit amet tellus. Ut blandit venenatis commodo. Donec ullamcorper leo ullamcorper lacinia tempor. Curabitur consequat aliquam lorem, nec accumsan libero convallis finibus. Nullam porttitor viverra diam at auctor. Aenean dapibus est et luctus facilisis. Suspendisse in odio libero. Interdum et malesuada fames ac ante ipsum primis in faucibus. Duis non eros at leo commodo sodales nec ut lorem. Integer vestibulum mauris a ligula gravida interdum. Aenean enim arcu, eleifend sit amet tellus ac, bibendum efficitur eros.</p>
                </div>

                <div className="card-footer">
                  <button className="btn btn-primary">
                    Connect with <b>Support Team</b>
                  </button>
                </div>
              </div>
            }
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}

export default DocReader;