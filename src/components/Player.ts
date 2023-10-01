import { Animation, Vector } from 'excalibur';
import config from '../config';
import res from '../res';
import game from '../game';
import Character from './Character';
import SpriteSheetAnimation from '../partials/spritesheet-animation';

export default class Player extends Character {
	private animations!: SpriteSheetAnimation;

	onInitialize() {
		this.animations = new SpriteSheetAnimation([res.playerAnims]);
		super.onInitialize();

		this.addGraphics();
		this.registerEvents();
	}

	onIdleState() {
		const anims = this.animations.getAnimation('animations/idle');
		anims?.play();
		this.graphics.use(<Animation>anims);
	}

	onMoveState() {
		const anims = this.animations.getAnimation('animations/move');
		anims?.play();
		this.graphics.use(<Animation>anims);
	}

	onPunchState() {
		const anims = this.animations.getAnimation('animations/punch');
		anims?.play();
		this.graphics.use(<Animation>anims);
	}

	private addGraphics() {
		// this.graphics.add(<Sprite>res.assets.getFrameSprite('graphics/gg'));
	}

	private setVel(vel: Vector) {
		this.vel = vel.scaleEqual(config.characterSpeed);

		if (this.vel.equals(Vector.Zero)) {
			this.fsm.in('MOVE') && this.fsm.go('IDLE');
		} else {
			this.fsm.go('MOVE');
		}

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
