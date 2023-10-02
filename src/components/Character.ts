import { Actor, ActorArgs, CollisionType, Engine, Shape, StateMachine, vec, Vector } from 'excalibur';
import config from '../config';
import { characterCanCollide } from '../collisions';
import { CHARACTER_STATES } from '../enums';

export default abstract class Character extends Actor {
	enemy!: Character | undefined;
	fightTrigger!: Actor;
	condition!: number;
	heading!: Vector;
	protected punchCount!: number;
	protected fsm!: StateMachine<CHARACTER_STATES, never>;

	constructor(props: ActorArgs = {}) {
		super({
			...props,
			anchor: vec(0.5, 1),
			collider: Shape.Circle(config.character.width / 2),
			collisionType: CollisionType.Active,
		});
	}

	setHeading() {
		if (this.vel.x === 0 || !this.fsm.in(CHARACTER_STATES.MOVE)) return;

		this.heading = this.vel.x < 0 ? Vector.Left : Vector.Right;
	}

	onPostUpdate(_engine: Engine, _delta: number) {
		this.setHeading();
		this.flipX();

		this.boozeColdDown(_delta);
		this.checkCondition();
	}

	onInitialize() {
		this.resetCondition();
		this.resetPunchCount();

		this.addFightTrigger();

		this.fsm = StateMachine.create({
			start: CHARACTER_STATES.INIT,
			states: {
				[CHARACTER_STATES.INIT]: {
					transitions: [CHARACTER_STATES.IDLE],
				},
				[CHARACTER_STATES.IDLE]: {
					onState: this.onIdleState.bind(this),
					transitions: [
						CHARACTER_STATES.MOVE,
						CHARACTER_STATES.PUNCH,
						CHARACTER_STATES.KICK,
						CHARACTER_STATES.DAMAGE,
						CHARACTER_STATES.BLOCK,
						CHARACTER_STATES.FALL,
					],
				},
				[CHARACTER_STATES.MOVE]: {
					onState: this.onMoveState.bind(this),
					transitions: [CHARACTER_STATES.IDLE, CHARACTER_STATES.PUNCH, CHARACTER_STATES.KICK, CHARACTER_STATES.BLOCK, CHARACTER_STATES.DAMAGE],
				},
				[CHARACTER_STATES.PUNCH]: {
					onState: this.onPunchState.bind(this),
					transitions: [CHARACTER_STATES.IDLE, CHARACTER_STATES.DAMAGE],
				},
				[CHARACTER_STATES.KICK]: {
					onState: this.onKickState.bind(this),
					transitions: [CHARACTER_STATES.IDLE, CHARACTER_STATES.DAMAGE],
				},
				[CHARACTER_STATES.BLOCK]: {
					onState: this.onBlockState.bind(this),
					transitions: [CHARACTER_STATES.IDLE, CHARACTER_STATES.MOVE],
				},
				[CHARACTER_STATES.DAMAGE]: {
					onState: this.onDamageState.bind(this),
					transitions: [CHARACTER_STATES.IDLE, CHARACTER_STATES.DAMAGE, CHARACTER_STATES.FALL],
				},
				[CHARACTER_STATES.FALL]: {
					onState: this.onFallState.bind(this),
					transitions: [],
				},
			},
		});

		this.fsm.go(CHARACTER_STATES.IDLE);
	}

	async damage(dir: Vector, punchCount: number) {
		if (this.fsm.in(CHARACTER_STATES.BLOCK)) return;

		const hurtImpulse = config.character.hurtImpulse * (punchCount === 3 ? 20 : 1);
		const time = 100 * (punchCount === 3 ? 10 : 1);

		this.fsm.go(CHARACTER_STATES.DAMAGE);
		this.condition -= this.calculateDamage();
		await this.actions.moveTo(this.pos.add(dir.scaleEqual(hurtImpulse)), time).toPromise();
	}

	abstract onPunchState(): void;

	abstract onKickState(): void;

	abstract onBlockState(): void;

	abstract onIdleState(): void;

	abstract onMoveState(): void;

	abstract onDamageState(): void;

	abstract onFallState(): void;

	isDied() {
		return this.condition === 0 || this.condition === 100;
	}

	protected boozeColdDown(delta: number) {
		if (this.fsm.in(CHARACTER_STATES.FALL)) return;

		const deltaValue = (config.character.boozeCoolDown / 1000) * delta;

		if (this.condition - deltaValue >= (100 / 5) * 2) {
			this.condition -= deltaValue;
		}
	}

	protected checkCondition() {
		this.condition = Math.min(Math.max(this.condition, 0), 100);

		if (this.condition === 0 || this.condition === 100) {
			this.fsm.go(CHARACTER_STATES.FALL);
		}
	}

	protected calculateDamage() {
		const { value, ratio } = config.character.damage;

		if (this.condition < 100 / 3) {
			return value * ratio[0];
		}

		if (this.condition > (100 / 3) * 2) {
			return value * ratio[2];
		}

		return value * ratio[1];
	}

	protected resetCondition() {
		this.condition = (100 / 5) * 4;
	}

	protected resetPunchCount() {
		this.punchCount = -1;
	}

	protected flipX() {
		this.graphics.flipHorizontal = this.heading?.equals(Vector.Left);
		this.fightTrigger.pos.x = (this.graphics.flipHorizontal ? -1 : 1) * config.character.trigger.xOffset;
	}

	protected addFightTrigger() {
		this.fightTrigger = new Actor({
			pos: vec(config.character.trigger.xOffset, 0),
			collider: Shape.Circle(config.character.trigger.width / 2),
			collisionGroup: characterCanCollide,
		});

		this.fightTrigger.on('collisionstart', () => {
			this.resetPunchCount();
		});

		this.fightTrigger.on('precollision', e => {
			const enemy = e.other;
			if (enemy instanceof Character) this.enemy = enemy;
		});

		this.fightTrigger.on('collisionend', () => {
			this.resetPunchCount();
			this.enemy = undefined;
		});

		this.addChild(this.fightTrigger);
	}

	protected damageToEnemy() {
		if (!this.fsm.in(CHARACTER_STATES.PUNCH) && !this.fsm.in(CHARACTER_STATES.KICK)) return;

		this.enemy && this.enemy.damage(this.enemy.pos.sub(this.pos).normalize(), this.fsm.in(CHARACTER_STATES.KICK) ? 3 : this.punchCount + 1);
	}

	protected punch() {
		this.fsm.go(CHARACTER_STATES.PUNCH);
	}

	protected kick() {
		this.fsm.go(CHARACTER_STATES.KICK);
		// this.drink();
		// this.enemy && this.enemy.damage();
	}

	protected block() {
		this.fsm.go(CHARACTER_STATES.BLOCK);
	}

	protected unBlock() {
		this.fsm.go(CHARACTER_STATES.IDLE);
	}

	protected drink() {
		this.condition += 20;
	}
}
