import { DefaultNodeModel } from "@projectstorm/react-diagrams"

// HTML 
export class HtmlNodeModel extends DefaultNodeModel {
  // Label
  constructor(options={}) {
    super({
			...options,
			type: 'editable-node'
    });
    this.value = options.value || '';
  }

  // Serialize
  serialize() {
		return {
			...super.serialize(),
			value: this.value
		};
  }

  // Deserialize
  deserialize(event) {
		super.deserialize(event);
		this.value = event.data.value;
  }
 
}