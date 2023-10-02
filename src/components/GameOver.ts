import { Actor, Sprite, vec } from 'excalibur';
import res from '../res';
import game from '../game';
import config from '../config';
import { SCENES } from '../enums';

export default class GameOver extends Actor {
	private restarted!: boolean;

	constructor() {
		super({
			pos: vec(game.halfDrawWidth, 0),
			anchor: vec(0.5, 1),
			z: 5000,
		});
	}

	registerEvents() {
		game.inputMapper.on(
			({ keyboard }) => {
				return keyboard.wasPressed(config.input.keyboard.restart) && !this.restarted;
			},
			async () => {
				this.restarted = true;
				this.kill();
				game.changeScene(SCENES.INTRO);
			},
		);
	}

	async onInitialize() {
		this.restarted = false;
		//
		// this.registerEvents();
		this.addGraphics();

		await this.actions.moveBy(vec(0, 2200), config.character.speed).toPromise();

		await game.waitFor(700);

		this.graphics.layers
			.create({
				name: 'thanks',
				order: 0,
				offset: vec(0, -2000),
			})
			.use(<Sprite>res.assets.getFrameSprite('graphics/thanks'));

		// await game.waitFor(700);
		//
		// this.graphics.layers
		// 	.create({
		// 		name: 'R',
		// 		order: 0,
		// 		offset: vec(700, -1600),
		// 	})
		// 	.use(<Sprite>res.assets.getFrameSprite('graphics/R'));
	}

	private addGraphics() {
		this.graphics.layers
			.create({
				name: 'main',
				order: 0,
			})
			.use(<Sprite>res.assets.getFrameSprite('graphics/final'));
	}
}
