import Booze from '../Booze';
import { Sprite } from 'excalibur';
import res from '../../res';

export default class Vodka extends Booze {
	addGraphics(): void {
		this.graphics.use(<Sprite>res.assets.getFrameSprite('graphics/vodka'));
	}
}
