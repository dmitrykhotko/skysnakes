import { Observer } from '../../observable/observer';
import { CanvasRenderer } from './canvasRenderer';

export class SmartRenderer extends CanvasRenderer implements Observer {
	notify = (): void => console.log('One day I will decide how to move');
}
