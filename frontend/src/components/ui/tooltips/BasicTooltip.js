import { useEffect } from "react";

const jQuery = window.jQuery;

function BasicTooltip(props) {
  const title = "Functional Safety Dependency";
  const content = "Since the Asset identified has Safety relevant properties, please contact the Functional Safety team to ensure it's validity. Where necessary, please configure this in the CRISKLE Functional Safety App to perform a Hazard and Risk Analysis."; 

  useEffect(() => {
    jQuery('[data-toggle="basic-popover"]').popover({
      html: true,
      container: 'body',
      placement: 'left',
      trigger: 'click'
    });
  }, []);

  return (
    <div className="d-inline">
      <span data-toggle="basic-popover" title={title} data-content={content} data-html="true">
        <i className="fa fa-info-circle ml-1"></i>
      </span>
    </div>
  )
};

export default BasicTooltip;