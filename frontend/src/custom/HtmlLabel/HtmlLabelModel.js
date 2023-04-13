//
import { LabelModel } from "@projectstorm/react-diagrams"
//
import { getLinkProperties } from "helpers/properties";
// jQuery
const jQuery = window.jQuery;

// HTML Label model
export class HtmlLabelModel extends LabelModel {
  // Label
  constructor(options={}) {
    super({
      ...options,
			type: 'editable-label'
    });
    this.value = options.value || '';
  }

  // Serialize
  serialize() {

    //
    let linkParams = {};

    try {

      linkParams['options'] = this.options['link']['options'];
    
      linkParams['targetPort'] = {
        'options': this.options['link']['targetPort']['options'],
        'parent': {
          'options': this.options['link']['targetPort']['parent']['options'],
          'node': this.options['link']['targetPort']['parent']['node'],
        },
      };
      
      linkParams['sourcePort'] = {
        'options': this.options['link']['sourcePort']['options'],
        'parent': {
          'options': this.options['link']['sourcePort']['parent']['options'],
          'node': this.options['link']['sourcePort']['parent']['node'],
        },
      };

    } 
    
    catch (error) {
      
    }

		return {
			...super.serialize(),
			value: this.value,
			htmlParams: this.options['html'],
			linkParams: linkParams,
		};
  }

  // Deserialize
  deserialize(event) {
		super.deserialize(event);
    this.value = event.data.value;

    var htmlParams = event.data.htmlParams;

    //
    if (event.data.linkParams) {
      this.options['link'] = event.data.linkParams;
      
      let linkProperty = getLinkProperties(event.data.linkParams);
      linkProperty = JSON.stringify(linkProperty);

      if (htmlParams) {
        var buttonHtml = jQuery.parseHTML(htmlParams);
        var bn = buttonHtml[0];
        jQuery(bn).attr('data-link-property', linkProperty);
        this.options['html'] = bn.outerHTML;
      }
    }
    
  }
 
}