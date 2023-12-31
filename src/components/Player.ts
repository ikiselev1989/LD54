import { ActorArgs, Animation, AnimationStrategy, CollisionType, Engine, vec, Vector } from 'excalibur';
import config from '../config';
import res from '../res';
import game from '../game';
import Character from './Character';
import SpriteSheetAnimation from '../partials/spritesheet-animation';
import { CHARACTER_STATES, EVENTS } from '../enums';
import Beer from './Beer';

export default class Player extends Character {
	private animations!: SpriteSheetAnimation;

	constructor(props: ActorArgs) {
		super({
			...props,
			name: 'Player',
		});
	}

	onInitialize() {
		this.animations = new SpriteSheetAnimation([res.player]);
		super.onInitialize();

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

	onBlockState() {
		this.vel.setTo(0, 0);

		const anims = <Animation>this.animations.getAnimation(`animations/block`, {
			strategy: AnimationStrategy.Freeze,
		});

		anims.reset();

		const anchor = vec(56 / (anims?.width || 1), 1);

		this.graphics.use(<Animation>anims, {
			anchor: this.graphics.flipHorizontal ? vec(1 - 56 / (anims?.width || 1), 1) : anchor,
		});

		anims.play();
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

		anims.play();

		anims.events.once('end', () => {
			this.fsm.go(CHARACTER_STATES.IDLE);
		});

		if (this.punchCount === config.character.punchCount - 1) {
			await game.waitFor(300);
		}

		this.damageToEnemy();
	}

	onDamageState(): void {
		this.vel.setTo(0, 0);

		const anims = <Animation>this.animations.getAnimation('animations/damage-up', {
			strategy: AnimationStrategy.Freeze,
		});

		anims.reset();

		const anchor = vec(56 / (anims?.width || 1), 1);

		this.graphics.use(<Animation>anims, {
			anchor: this.graphics.flipHorizontal ? vec(1 - 56 / (anims?.width || 1), 1) : anchor,
		});

		anims.events.on('end', () => {
			this.fsm.go(CHARACTER_STATES.IDLE);
		});

		anims.play();
	}

	onPostUpdate(_engine: Engine, _delta: number) {
		super.onPostUpdate(_engine, _delta);

		game.events.emit(EVENTS.PLAYER_STATUS_UPDATE);
	}

	onFallState(): void {
		this.vel.setTo(0, 0);
		let anim;
		if (this.condition < 100) {
			anim = <Animation>this.animations.getAnimation('animations/die', {
				strategy: AnimationStrategy.Freeze,
			});

			const anchor = vec(280 / (anim?.width || 1), 1);

			this.graphics.use(<Animation>anim, {
				anchor: this.graphics.flipHorizontal ? vec(1 - 280 / (anim?.width || 1), 1) : anchor,
			});
		} else {
			anim = <Animation>this.animations.getAnimation('animations/boozed', {
				strategy: AnimationStrategy.Freeze,
			});

			const anchor = vec(280 / (anim?.width || 1), 1);

			this.graphics.use(<Animation>anim, {
				anchor: this.graphics.flipHorizontal ? vec(1 - 280 / (anim?.width || 1), 1) : anchor,
			});
		}

		anim.events.on('end', () => {
			this.body.collisionType = CollisionType.PreventCollision;
			this.scene.events.emit(EVENTS.GAME_OVER);
		});

		anim.reset();
		anim.play();
	}

	async onKickState() {
		this.vel.setTo(0, 0);

		const anims = <Animation>this.animations.getAnimation('animations/kick', {
			strategy: AnimationStrategy.Freeze,
		});

		anims.reset();

		const anchor = vec(80 / (anims?.width || 1), 1);

		this.graphics.use(<Animation>anims, {
			anchor: this.graphics.flipHorizontal ? vec(1 - 80 / (anims?.width || 1), 1) : anchor,
		});

		anims.play();

		anims.events.once('end', () => {
			this.fsm.go(CHARACTER_STATES.IDLE);
		});

		await game.waitFor(150);

		this.damageToEnemy();
	}

	useBooze() {
		const beers = <Beer[]>this.scene.entities.filter(booze => booze instanceof Beer);
		const booze = beers.find(beer => beer.pos.distance(this.pos) < config.bar.useDistance);

		if (!booze) return;

		booze.use();
		this.drink();
	}

	private setVel(vel: Vector) {
		if (this.fsm.in(CHARACTER_STATES.MOVE) || this.fsm.in(CHARACTER_STATES.IDLE)) {
			if (vel.equals(Vector.Zero)) {
				this.fsm.go(CHARACTER_STATES.IDLE);
			} else {
				this.fsm.go(CHARACTER_STATES.MOVE);
			}

			this.vel = vel.scaleEqual(config.character.speed);
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

		game.inputMapper.on(({ keyboard }) => keyboard.wasPressed(config.input.keyboard.punch), this.punch.bind(this));

		game.inputMapper.on(({ keyboard }) => keyboard.wasPressed(config.input.keyboard.kick), this.kick.bind(this));

		game.inputMapper.on(({ keyboard }) => keyboard.wasPressed(config.input.keyboard.block), this.block.bind(this));

		game.inputMapper.on(({ keyboard }) => keyboard.wasReleased(config.input.keyboard.block), this.unBlock.bind(this));

		game.inputMapper.on(({ keyboard }) => keyboard.wasReleased(config.input.keyboard.use), this.useBooze.bind(this));
	}
}
