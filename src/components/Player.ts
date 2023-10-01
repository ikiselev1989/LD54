import { Animation, AnimationStrategy, vec, Vector } from 'excalibur';
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
		this.vel.setTo(0, 0);

		const anims = this.animations.getAnimation('animations/idle');
		anims?.play();
		this.graphics.use(<Animation>anims);
	}

	onMoveState() {
		const anims = this.animations.getAnimation('animations/move');
		anims?.play();
		this.graphics.use(<Animation>anims);
	}

	async onPunchState() {
		this.vel.setTo(0, 0);
		this.punchCount = this.enemy ? (this.punchCount + 1) % config.character.punchCount : 0;

		const anims = <Animation>this.animations.getAnimation(`animations/punch/punch${this.punchCount + 1}`, {
			strategy: AnimationStrategy.End,
		});

		anims.reset();

		if (this.punchCount < 2) {
			const anchor = vec(65 / (anims?.width || 1), 1);

			this.graphics.use(<Animation>anims, {
				anchor: this.graphics.flipHorizontal ? vec(1 - 65 / (anims?.width || 1), 1) : anchor,
			});
		} else {
			const anchor = vec(260 / (anims?.width || 1), 1);

			this.graphics.use(<Animation>anims, {
				anchor: this.graphics.flipHorizontal ? vec(1 - 260 / (anims?.width || 1), 1) : anchor,
			});
		}

		anims?.play();

		anims.events.once('end', () => {
			this.fsm.go('IDLE');
		});

		if (this.punchCount === config.character.punchCount - 1) {
			await game.waitFor(800);
		}

		this.enemy && this.enemy.hurt(this.enemy.pos.sub(this.pos).normalize(), this.punchCount + 1);
	}

	private addGraphics() {
		// this.graphics.add(<Sprite>res.assets.getFrameSprite('graphics/gg'));
	}

	private setVel(vel: Vector) {
		if (this.fsm.in('MOVE') || this.fsm.in('IDLE')) {
			if (vel.equals(Vector.Zero)) {
				this.fsm.go('IDLE');
			} else {
				this.fsm.go('MOVE');
			}

			this.vel = vel.scaleEqual(config.character.speed);

			if (vel.x === 0) return;
			this.flipX(vel.x < -1);
		}
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
