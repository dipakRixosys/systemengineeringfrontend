import { AbstractReactFactory } from '@projectstorm/react-canvas-core'
import { HtmlNodeModel } from './HtmlNodeModel';
import HtmlNodeWidget from './HtmlNodeWidget';

// 
export class HtmlNodeFactory extends AbstractReactFactory {
  // Abstract Factory
  constructor() {
		super('editable-node');
  }
  
  // Generate Model
  generateModel() {
    return new HtmlNodeModel();
  }

  // General `React-JSX` wiget
  generateReactWidget(event) {
		return <HtmlNodeWidget model={event.model} />;
	}
}