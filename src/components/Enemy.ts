import Character from './Character';
import res from '../res';
import { Animation, AnimationStrategy, StateMachine, vec } from 'excalibur';
import SpriteSheetAnimation from '../partials/spritesheet-animation';
import { CHARACTER_STATES, ENEMY_STATES } from '../enums';
import { random } from '../utils';
import game from '../game';
import config from '../config';

export class Enemy extends Character {
	private animations!: SpriteSheetAnimation;
	private fsmAI!: StateMachine<ENEMY_STATES, never>;
	private target!: Character;

	async onInitialize() {
		this.animations = new SpriteSheetAnimation([res.enemy]);
		this.fsmAI = StateMachine.create({
			start: ENEMY_STATES.IDLE,
			states: {
				[ENEMY_STATES.IDLE]: {
					onState: this.onAIIdleState.bind(this),
					transitions: [ENEMY_STATES.FIND_TARGET, ENEMY_STATES.FOLLOW_TARGET, ENEMY_STATES.FIGHT],
				},
				[ENEMY_STATES.FIND_TARGET]: {
					onState: this.onFindTargetState.bind(this),
					transitions: [ENEMY_STATES.FOLLOW_TARGET],
				},
				[ENEMY_STATES.FOLLOW_TARGET]: {
					onState: this.onFollowTargetState.bind(this),
					transitions: [ENEMY_STATES.FIGHT, ENEMY_STATES.FOLLOW_TARGET],
				},
				[ENEMY_STATES.FIGHT]: {
					onState: this.onFightState.bind(this),
					transitions: [ENEMY_STATES.FIND_TARGET, ENEMY_STATES.DRINK, CHARACTER_STATES.IDLE],
				},
				[ENEMY_STATES.DRINK]: {
					transitions: [ENEMY_STATES.FIND_TARGET, ENEMY_STATES.IDLE],
				},
			},
		});

		super.onInitialize();

		this.fightTrigger.on('collisionstart', () => {
			this.fsmAI.go(ENEMY_STATES.FIGHT);
		});

		await game.waitFor(1000);
		this.fsmAI.go(ENEMY_STATES.FIND_TARGET);
	}

	onBlockState(): void {}

	onDamageState(): void {
		this.actions.clearActions();

		const anim = <Animation>this.animations.getAnimation('enemy/enemy1/damage-up', {
			strategy: AnimationStrategy.Freeze,
		});

		anim.reset();
		this.graphics.use(anim);

		anim.events.on('end', () => this.fsm.go(CHARACTER_STATES.IDLE));

		anim.play();
	}

	onIdleState(): void {
		this.actions.clearActions();

		const anims = <Animation>this.animations.getAnimation('enemy/enemy1/idle');
		anims.play();
		this.graphics.use(anims);
	}

	onMoveState(): void {
		const anims = this.animations.getAnimation('enemy/enemy1/move');
		anims?.play();
		this.graphics.use(<Animation>anims);
	}

	onPunchState(): void {
		const anim = <Animation>this.animations.getAnimation('enemy/enemy1/punch', {
			strategy: AnimationStrategy.Freeze,
		});

		anim.reset();

		this.graphics.use(<Animation>anim);

		anim.events.once('end', () => {
			this.fsmAI.go(ENEMY_STATES.IDLE);
		});

		anim.play();

		this.damageToEnemy();
	}

	protected onAIIdleState() {
		this.fsm.go(CHARACTER_STATES.IDLE);

		if (this.enemy) return this.fsmAI.go(ENEMY_STATES.FIGHT);
		if (this.target) return this.fsmAI.go(ENEMY_STATES.FOLLOW_TARGET);

		return this.fsmAI.go(ENEMY_STATES.FIND_TARGET);
	}

	protected onFightState() {
		this.actions.clearActions();
		this.vel.setTo(0, 0);
		this.fsm.go(CHARACTER_STATES.PUNCH);
	}

	protected onFindTargetState() {
		const targets = <Character[]>this.scene.entities.filter(en => en instanceof Character && en.id !== this.id);

		this.target = random.pickOne(targets);

		this.fsmAI.go(ENEMY_STATES.FOLLOW_TARGET);
	}

	protected async onFollowTargetState() {
		this.fsm.go(CHARACTER_STATES.MOVE);

		await this.actions.moveTo(vec(this.target.pos.x, this.pos.y), config.character.speed).toPromise();
		await this.actions.moveTo(vec(this.pos.x, this.target.pos.y), config.character.speed).toPromise();

		if (this.enemy) return this.fsmAI.go(ENEMY_STATES.FIGHT);

		return this.fsmAI.go(ENEMY_STATES.FOLLOW_TARGET);
	}
}
