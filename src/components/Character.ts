import { Actor, ActorArgs, CollisionGroup, PossibleStates, Shape, StateMachine, vec } from 'excalibur';
import config from '../config';
import { characterCollisionGroup } from '../collisions';

export default abstract class Character extends Actor {
	enemy!: Character | undefined;
	fightTrigger!: Actor;
	protected fsm!: StateMachine<PossibleStates<any>>;

	constructor(props: ActorArgs = {}) {
		super({
			...props,
			width: 50,
			height: 50,
			anchor: vec(0.5, 1),
		});
	}

	onInitialize() {
		this.addFightTrigger();
		this.fsm = StateMachine.create({
			start: 'INIT',
			states: {
				INIT: {
					transitions: ['IDLE'],
				},
				IDLE: {
					onState: this.onIdleState.bind(this),
					transitions: ['MOVE', 'PUNCH', 'HURT'],
				},
				MOVE: {
					onState: this.onMoveState.bind(this),
					transitions: ['IDLE', 'PUNCH'],
				},
				PUNCH: {
					onState: this.onPunchState.bind(this),
					transitions: ['IDLE', 'MOVE'],
				},
				HURT: {
					onState: this.onHurtState.bind(this),
					transitions: ['HURT'],
				},
			},
		});

		this.fsm.go('IDLE');
	}

	hurt() {
		this.fsm.go('HURT');
	}

	onPunchState() {
	}

	onIdleState() {

	}

	onMoveState() {
	}

	onHurtState() {
		this.actions.blink(100, 100, 2);
	}

	protected flipX(val = false) {
		this.graphics.flipHorizontal = val;
		this.fightTrigger.pos.x = (val ? -1 : 1) * config.fightTrigger.xOffset;
	}

	protected addFightTrigger() {
		this.fightTrigger = new Actor({
			pos: vec(config.fightTrigger.xOffset, 0),
			collider: Shape.Box(config.fightTrigger.width, config.fightTrigger.height),
			collisionGroup: CollisionGroup.collidesWith([characterCollisionGroup]),
		});

		this.fightTrigger.on('collisionstart', e => {
			this.enemy = <Character>e.other;
		});

		this.fightTrigger.on('collisionend', () => {
			this.enemy = undefined;
		});

		this.addChild(this.fightTrigger);
	}

	protected punch() {
		this.fsm.go('PUNCH');

		console.log('punch');
		this.enemy && this.enemy.hurt();
	}

	protected kick() {
		console.log('kick');
		this.enemy && this.enemy.hurt();
	}

	protected clinch() {
		console.log('clinch');
	}
}
