import Character from './Character';
import SpriteSheetAnimation from '../partials/spritesheet-animation';
import res from '../res';
import { Animation, AnimationStrategy, CollisionType, StateMachine, vec } from 'excalibur';
import { CHARACTER_STATES, ENEMY_STATES } from '../enums';
import { random } from '../utils';
import { Enemy } from './Enemy';
import Player from './Player';
import config from '../config';
import game from '../game';

export default class Runner extends Character {
	private animations!: SpriteSheetAnimation;
	private ai!: StateMachine<ENEMY_STATES, unknown>;
	private target!: Character;

	async onInitialize() {
		this.animations = new SpriteSheetAnimation([res.enemy]);
		this.ai = StateMachine.create({
			start: ENEMY_STATES.IDLE,
			states: {
				[ENEMY_STATES.IDLE]: {
					onState: this.onAiIdleState.bind(this),
					transitions: [ENEMY_STATES.IDLE, ENEMY_STATES.FIND_TARGET],
				},
				[ENEMY_STATES.FIND_TARGET]: {
					onState: this.onAiFindTargetState.bind(this),
					transitions: [ENEMY_STATES.FOLLOW_TARGET],
				},
				[ENEMY_STATES.FOLLOW_TARGET]: {
					onState: this.onAiFollowTarget.bind(this),
					transitions: [ENEMY_STATES.IDLE],
				},
			},
		});
		super.onInitialize();
		this.registerEvents();

		await game.waitFor(1000);
		this.ai.go(ENEMY_STATES.FIND_TARGET);
	}

	onBlockState(): void {}

	onDamageState(): void {
		this.actions.clearActions();

		const anim = <Animation>this.animations.getAnimation('enemy/enemy2/damage', {
			strategy: AnimationStrategy.Freeze,
		});

		this.graphics.use(anim);

		anim.events.on('end', () => {
			this.ai.go(ENEMY_STATES.IDLE);
		});

		anim.reset();
		anim.play();
	}

	onFallState(): void {
		this.actions.clearActions();

		const anim = <Animation>this.animations.getAnimation('enemy/enemy2/die', {
			strategy: AnimationStrategy.Freeze,
		});

		anim.reset();

		this.graphics.use(<Animation>anim, {
			anchor: vec(0.5, 0.5),
		});

		anim.events.once('end', async () => {
			this.body.collisionType = CollisionType.PreventCollision;
			this.graphics.visible = false;
			await this.actions.blink(100, 100, 4).toPromise();
			this.kill();
		});

		anim.play();
	}

	onIdleState(): void {
		const anim = <Animation>this.animations.getAnimation('enemy/enemy2/idle');

		this.graphics.use(anim);
		anim.reset();
		anim.play();
	}

	onKickState(): void {}

	onMoveState(): void {
		const anim = <Animation>this.animations.getAnimation('enemy/enemy2/punch');

		this.graphics.use(anim);
		anim.reset();
		anim.play();
	}

	onPunchState(): void {}

	private registerEvents() {
		this.events.on('collisionstart', e => {
			if (this.ai.in(ENEMY_STATES.FOLLOW_TARGET) && e.other instanceof Character) {
				this.enemy = e.other;
				this.enemy && this.enemy.damage(this.enemy.pos.sub(this.pos).normalize(), 3, this);
				this.ai.go(ENEMY_STATES.IDLE);
			}
		});
	}

	private async onAiFollowTarget() {
		this.fsm.go(CHARACTER_STATES.MOVE);
		await this.actions.moveTo(this.target.pos, config.character.speed * 2).toPromise();
		this.ai.go(ENEMY_STATES.IDLE);
	}

	private onAiFindTargetState() {
		const targets = <Character[]>this.scene.entities.filter(en => (en instanceof Enemy || en instanceof Player) && en.id !== this.id && !en.isDied());

		this.target = random.pickOne(targets);

		this.ai.go(ENEMY_STATES.FOLLOW_TARGET);
	}

	private async onAiIdleState() {
		if (this.isKilled()) return;

		this.actions.clearActions();
		this.fsm.go(CHARACTER_STATES.IDLE);

		await game.waitFor(5000);

		this.ai.go(ENEMY_STATES.FIND_TARGET);
	}
}
