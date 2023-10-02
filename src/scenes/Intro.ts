import { Actor, Engine, Scene, Sprite, Timer, vec, Vector } from 'excalibur';
import res from '../res';
import { random } from '../utils';
import game from '../game';
import config from '../config';
import { SCENES } from '../enums';

export default class Intro extends Scene {
	private entered!: boolean;

	onInitialize(_engine: Engine) {
		this.entered = false;
		super.onInitialize(_engine);

		this.registerEvents();
	}

	onActivate() {
		const bg2 = new Actor({
			anchor: Vector.Zero,
		});
		bg2.graphics.use(<Sprite>res.assets.getFrameSprite('graphics/intro/off'));

		this.add(bg2);

		const bg = new Actor({
			anchor: Vector.Zero,
		});
		bg.graphics.use(<Sprite>res.assets.getFrameSprite('graphics/intro/on'));

		this.add(bg);

		const timer = new Timer({
			random,
			randomRange: [0, 1000],
			fcn: () => {
				bg.actions.blink(100, 20, 5);
			},
			interval: 3000,
			repeats: true,
		});

		this.add(timer.start());

		const enter = new Actor({
			pos: vec(game.halfDrawWidth, game.drawHeight),
			anchor: vec(0.5, 1),
		});

		enter.graphics.use(<Sprite>res.assets.getFrameSprite('graphics/enter'));

		this.add(enter);
	}

	onDeactivate() {
		for (let entity of this.entities) {
			entity.kill();
		}
	}

	private registerEvents() {
		game.inputMapper.on(
			({ keyboard }) => {
				return (keyboard.wasPressed(config.input.keyboard.enter) || keyboard.wasPressed(config.input.keyboard.space)) && !this.entered;
			},
			async () => {
				this.entered = true;
				await game.changeScene(SCENES.LEVEL);
			},
		);
	}
}
