import { ActorArgs, ScreenElement, Sprite, vec } from 'excalibur';
import res from '../res';
import game from '../game';
import config from '../config';

export default class PlayerAlcoholMeter extends ScreenElement {
	constructor(props: ActorArgs = {}) {
		super({
			...props,
			pos: vec(config.ui.offset, game.drawHeight - config.ui.offset),
			anchor: vec(0, 1),
			z: 5000,
		});
	}

	onInitialize() {
		this.addGraphics();
	}

	private addGraphics() {
		this.graphics.use(<Sprite>res.assets.getFrameSprite('graphics/player-state/2'));
	}
}
