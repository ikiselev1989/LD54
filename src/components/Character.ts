import { Actor, ActorArgs, CollisionType, Engine, Shape, StateMachine, vec, Vector } from 'excalibur';
import config from '../config';
import { characterCanCollide } from '../collisions';
import { CHARACTER_EVENTS, CHARACTER_STATES } from '../enums';

export default abstract class Character extends Actor {
	enemy!: Character | undefined;
	fightTrigger!: Actor;
	protected condition!: number;
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

	onPostUpdate(_engine: Engine, _delta: number) {
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
					transitions: [CHARACTER_STATES.MOVE, CHARACTER_STATES.PUNCH, CHARACTER_STATES.DAMAGE, CHARACTER_STATES.BLOCK],
				},
				[CHARACTER_STATES.MOVE]: {
					onState: this.onMoveState.bind(this),
					transitions: [CHARACTER_STATES.IDLE, CHARACTER_STATES.PUNCH, CHARACTER_STATES.BLOCK, CHARACTER_STATES.DAMAGE],
				},
				[CHARACTER_STATES.PUNCH]: {
					onState: this.onPunchState.bind(this),
					transitions: [CHARACTER_STATES.IDLE],
				},
				[CHARACTER_STATES.BLOCK]: {
					onState: this.onBlockState.bind(this),
					transitions: [CHARACTER_STATES.IDLE, CHARACTER_STATES.MOVE],
				},
				[CHARACTER_STATES.DAMAGE]: {
					onState: this.onHurtState.bind(this),
					transitions: [CHARACTER_STATES.IDLE, CHARACTER_STATES.DAMAGE],
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

	abstract onBlockState(): void;

	abstract onIdleState(): void;

	abstract onMoveState(): void;

	abstract onHurtState(): void;

	protected boozeColdDown(delta: number) {
		this.condition -= (config.character.boozeCoolDown / 1000) * delta;
	}

	protected checkCondition() {
		if (this.condition <= 0) {
			this.events.emit(CHARACTER_EVENTS.NOT_ENOUGH_BOOZE);
		}

		if (this.condition >= 100) {
			this.events.emit(CHARACTER_EVENTS.TOO_MUCH_BOOZE);
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
		this.condition = 50;
	}

	protected resetPunchCount() {
		this.punchCount = -1;
	}

	protected flipX(val = false) {
		this.graphics.flipHorizontal = val;
		this.fightTrigger.pos.x = (val ? -1 : 1) * config.character.trigger.xOffset;
	}

	protected addFightTrigger() {
		this.fightTrigger = new Actor({
			pos: vec(config.character.trigger.xOffset, 0),
			collider: Shape.Circle(config.character.trigger.width / 2),
			collisionGroup: characterCanCollide,
		});

		this.fightTrigger.on('collisionstart', e => {
			this.resetPunchCount();
			const enemy = e.other;
			if (enemy instanceof Character) this.enemy = enemy;
		});

		this.fightTrigger.on('collisionend', () => {
			this.resetPunchCount();
			this.enemy = undefined;
		});

		this.addChild(this.fightTrigger);
	}

	protected punch() {
		this.fsm.go(CHARACTER_STATES.PUNCH);
	}

	protected kick() {
		console.log('kick');
		// this.enemy && this.enemy.damage();
	}

	protected block() {
		this.fsm.go(CHARACTER_STATES.BLOCK);
	}

	protected unBlock() {
		this.fsm.go(CHARACTER_STATES.IDLE);
	}
}
