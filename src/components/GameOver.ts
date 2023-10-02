import { Actor, Sprite, vec } from 'excalibur';
import res from '../res';
import game from '../game';
import config from '../config';

export default class GameOver extends Actor {
	constructor() {
		super({
			pos: vec(game.halfDrawWidth, 0),
			anchor: vec(0.5, 1),
			z: 5000,
		});
	}

	onInitialize() {
		this.addGraphics();

		this.actions.moveBy(vec(0, 2200), config.character.speed);
	}

	private addGraphics() {
		this.graphics.layers
			.create({
				name: 'main',
				order: 0,
			})
			.use(<Sprite>res.assets.getFrameSprite('graphics/final'));

		this.graphics.layers
			.create({
				name: 'thanks',
				order: 0,
			})
			.use(<Sprite>res.assets.getFrameSprite('graphics/thanks'));
	}
}
