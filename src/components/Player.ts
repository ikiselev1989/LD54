import { Sprite, Vector } from 'excalibur';
import config from '../config';
import res from '../res';
import game from '../game';
import Character from './Character';

export default class Player extends Character {
	onInitialize() {
		super.onInitialize();

		this.addGraphics();
		this.registerEvents();
	}

	private addGraphics() {
		this.graphics.add(<Sprite>res.assets.getFrameSprite('graphics/gg'));
	}

	private setVel(vel: Vector) {
		this.vel = vel.scaleEqual(config.characterSpeed);

		if (vel.x === 0) return;
		this.flipX(vel.x < -1);
	}

	private registerEvents() {
		game.inputMapper.on(({ keyboard }) => {
			if (keyboard.isHeld(config.input.keyboard.left)) return Vector.Left;
			if (keyboard.isHeld(config.input.keyboard.right)) return Vector.Right;
			if (keyboard.isHeld(config.input.keyboard.up)) return Vector.Up;
			if (keyboard.isHeld(config.input.keyboard.down)) return Vector.Down;

			return Vector.Zero;
		}, this.setVel.bind(this));

		game.inputMapper.on(({ keyboard }) => keyboard.wasPressed(config.input.keyboard.punch),
			this.punch.bind(this));

		game.inputMapper.on(({ keyboard }) => keyboard.wasPressed(config.input.keyboard.kick),
			this.kick.bind(this));

		game.inputMapper.on(({ keyboard }) => keyboard.wasPressed(config.input.keyboard.clinch),
			this.clinch.bind(this));
	}
}
