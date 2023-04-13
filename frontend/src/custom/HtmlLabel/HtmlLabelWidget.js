import { getLinkProperties } from "helpers/properties";

// jQuery
const jQuery = window.jQuery;

// HTML Label widget
function HtmlLabelWidget(props) {
  // Set custom HTML-element
  function renderHtml() {
    return {__html: props.model.options['html']};
  }
  
  // Parent DIV-ref.
  var className = '';
  
  //
  try {
    className = `parent-${props['model']['options']['link']['options']['id']}`;

    // Only populate link-property when connected with `targetPort`
    if (props.model.options['link']['targetPort']) {
      // Link property ref.
      let linkProperty = getLinkProperties(props.model.options['link']);
      linkProperty = JSON.stringify(linkProperty);
      
      // Assign JSON-property to Configure-Button
      jQuery(`.${className} button`).attr('data-link-property', linkProperty);
    }
    
  } catch (error) {
    console.log(error);
  }
  
  // Widget UI
  return(
    <div className={className} dangerouslySetInnerHTML={renderHtml()}></div>
  )
}

//
export default HtmlLabelWidget;