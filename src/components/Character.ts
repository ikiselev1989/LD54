import {
	Actor,
	ActorArgs,
	CollisionType,
	EasingFunctions,
	PossibleStates,
	Shape,
	StateMachine,
	vec,
	Vector,
} from 'excalibur';
import config from '../config';
import { characterCanCollide } from '../collisions';

export default abstract class Character extends Actor {
	enemy!: Character | undefined;
	fightTrigger!: Actor;
	protected punchCount!: number;
	protected fsm!: StateMachine<PossibleStates<any>>;

	constructor(props: ActorArgs = {}) {
		super({
			...props,
			anchor: vec(0.5, 1),
			collider: Shape.Box(config.character.width, config.character.height),
			collisionType: CollisionType.Active,
		});
	}

	onInitialize() {
		this.resetPunchCount();

		this.addFightTrigger();

		this.fsm = StateMachine.create({
			start: 'INIT',
			states: {
				INIT: {
					transitions: ['IDLE'],
				},
				IDLE: {
					onState: this.onIdleState.bind(this),
					transitions: ['MOVE', 'PUNCH', 'HURT', 'BLOCK'],
				},
				MOVE: {
					onState: this.onMoveState.bind(this),
					transitions: ['IDLE', 'PUNCH', 'BLOCK'],
				},
				PUNCH: {
					onState: this.onPunchState.bind(this),
					transitions: ['IDLE'],
				},
				BLOCK: {
					onState: this.onBlockState.bind(this),
					transitions: ['IDLE', 'MOVE'],
				},
				HURT: {
					onState: this.onHurtState.bind(this),
					transitions: ['IDLE'],
				},
			},
		});

		this.fsm.go('IDLE');
	}

	async hurt(dir: Vector, punchCount: number) {
		if (this.fsm.in('HURT')) return;


		const hurtImpulse = config.character.hurtImpulse * (punchCount === 3 ? 20 : 1);
		const time = 100 * (punchCount === 3 ? 10 : 1);

		this.fsm.go('HURT');
		await this.actions.easeTo(this.pos.add(dir.scaleEqual(hurtImpulse)), time, EasingFunctions.EaseOutCubic).toPromise();

		// this.fsm.go('IDLE');
	}

	abstract onPunchState(): void

	abstract onBlockState(): void

	abstract onIdleState(): void

	abstract onMoveState(): void

	abstract onHurtState(): void

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
			collider: Shape.Box(config.character.trigger.width, config.character.trigger.height),
			collisionGroup: characterCanCollide,
		});

		this.fightTrigger.on('collisionstart', e => {
			this.resetPunchCount();
			this.enemy = <Character>e.other;
		});

		this.fightTrigger.on('collisionend', () => {
			this.resetPunchCount();
			this.enemy = undefined;
		});

		this.addChild(this.fightTrigger);
	}

	protected punch() {
		this.fsm.go('PUNCH');
	}

	protected kick() {
		console.log('kick');
		this.enemy && this.enemy.hurt();
	}

	protected block() {
		console.log('block');
		this.fsm.go('BLOCK');
	}

	protected unBlock() {
		console.log('unBlock');
		this.fsm.go('IDLE');
	}
}
