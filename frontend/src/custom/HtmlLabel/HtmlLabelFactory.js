import { AbstractReactFactory } from '@projectstorm/react-canvas-core'
import { HtmlLabelModel } from './HtmlLabelModel';
import HtmlLabelWidget from './HtmlLabelWidget';

// HTML Label Factory
export class HtmlLabelFactory extends AbstractReactFactory {
  // Abstract Factory
  constructor() {
		super('editable-label');
  }
  
  // Generate Model
  generateModel() {
    return new HtmlLabelModel();
  }

  // General `React-JSX` wiget
  generateReactWidget(event) {
		return <HtmlLabelWidget model={event.model} />;
	}
}