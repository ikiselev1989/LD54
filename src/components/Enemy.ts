import Character from './Character';
import res from '../res';
import { Sprite } from 'excalibur';

export class Enemy extends Character {
	onInitialize() {
		super.onInitialize();

		this.addGraphics();
	}

	private addGraphics() {
		this.graphics.use(<Sprite>res.assets.getFrameSprite('graphics/vrag_1'));
	}
}
