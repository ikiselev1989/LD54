import Character from './Character';
import res from '../res';
import { Animation, AnimationStrategy, CollisionType, StateMachine, vec } from 'excalibur';
import SpriteSheetAnimation from '../partials/spritesheet-animation';
import { CHARACTER_STATES, ENEMY_STATES, EVENTS } from '../enums';
import { random } from '../utils';
import game from '../game';
import config from '../config';
import Level from '../scenes/Level';
import Beer from './Beer';

export class Enemy extends Character {
	spawned!: boolean;
	private animations!: SpriteSheetAnimation;
	private ai!: StateMachine<ENEMY_STATES, never>;
	private target!: Character;

	async onInitialize() {
		this.body.collisionType = CollisionType.PreventCollision;
		this.animations = new SpriteSheetAnimation([res.enemy]);
		this.ai = StateMachine.create({
			start: ENEMY_STATES.IDLE,
			states: {
				[ENEMY_STATES.IDLE]: {
					onState: this.onAIIdleState.bind(this),
					transitions: [ENEMY_STATES.FIND_TARGET, ENEMY_STATES.FOLLOW_TARGET, ENEMY_STATES.FIGHT, ENEMY_STATES.DRINK, ENEMY_STATES.IDLE],
				},
				[ENEMY_STATES.FIND_TARGET]: {
					onState: this.onFindTargetState.bind(this),
					transitions: [ENEMY_STATES.FOLLOW_TARGET, ENEMY_STATES.IDLE],
				},
				[ENEMY_STATES.FOLLOW_TARGET]: {
					onState: this.onFollowTargetState.bind(this),
					transitions: [ENEMY_STATES.FOLLOW_TARGET, ENEMY_STATES.IDLE],
				},
				[ENEMY_STATES.FIGHT]: {
					onState: this.onFightState.bind(this),
					transitions: [ENEMY_STATES.FIND_TARGET, CHARACTER_STATES.IDLE],
				},
				[ENEMY_STATES.DRINK]: {
					onState: this.onDrinkState.bind(this),
					transitions: [ENEMY_STATES.FIND_TARGET, ENEMY_STATES.IDLE],
				},
			},
		});

		super.onInitialize();

		this.registerEvents();

		await game.waitFor(1000);
		this.ai.go(ENEMY_STATES.IDLE);
	}

	registerEvents() {
		this.fightTrigger.on('collisionstart', e => {
			if (!(e.other instanceof Character)) return;
			this.ai.go(ENEMY_STATES.IDLE);
		});
	}

	onPreKill() {
		this.scene.events.emit(EVENTS.NEW_ENEMY);
	}

	onBlockState(): void {}

	onKickState(): void {}

	onDamageState(): void {
		this.actions.clearActions();

		const anim = <Animation>this.animations.getAnimation('enemy/enemy1/damage-up', {
			strategy: AnimationStrategy.Freeze,
		});

		anim.reset();
		this.graphics.use(anim);

		anim.events.on('end', () => {
			this.ai.go(ENEMY_STATES.IDLE);
		});

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

		const anchor = vec(110 / (anim.width || 1), 1);

		this.graphics.use(<Animation>anim, {
			anchor: this.graphics.flipHorizontal ? vec(1 - 110 / (anim.width || 1), 1) : anchor,
		});

		anim.events.once('end', () => {
			this.ai.go(ENEMY_STATES.IDLE);
		});

		anim.play();

		this.damageToEnemy();
	}

	onFallState() {
		this.actions.clearActions();

		const anim = <Animation>this.animations.getAnimation('enemy/enemy1/fall', {
			strategy: AnimationStrategy.Freeze,
		});

		anim.reset();

		const anchor = vec(110 / (anim.width || 1), 1);

		this.graphics.use(<Animation>anim, {
			anchor: this.graphics.flipHorizontal ? vec(1 - 110 / (anim.width || 1), 1) : anchor,
		});

		anim.events.once('end', async () => {
			this.body.collisionType = CollisionType.PreventCollision;
			this.graphics.visible = false;
			await this.actions.blink(100, 100, 4).toPromise();
			this.kill();
		});

		anim.play();
	}

	protected async onAIIdleState() {
		if (this.fsm.in(CHARACTER_STATES.FALL)) return;

		if (this.spawned) {
			this.fsm.go(CHARACTER_STATES.MOVE);
			await this.actions.moveTo(vec(this.pos.x, game.halfDrawHeight), config.character.speed).toPromise();
			this.spawned = false;

			return this.ai.go(ENEMY_STATES.FIND_TARGET);
		}

		this.body.collisionType = CollisionType.Active;
		this.fsm.go(CHARACTER_STATES.IDLE);

		if (this.enemy && !this.enemy.isDied()) {
			await game.waitFor(config.enemy.reactionTime);
			return this.ai.go(ENEMY_STATES.FIGHT);
		}
		if (this.target && !this.target.isDied()) {
			await game.waitFor(config.enemy.reactionTime);
			return this.ai.go(ENEMY_STATES.FOLLOW_TARGET);
		}

		return this.ai.go(ENEMY_STATES.FIND_TARGET);
	}

	protected onFightState() {
		this.actions.clearActions();
		this.vel.setTo(0, 0);
		this.fsm.go(CHARACTER_STATES.PUNCH);
	}

	protected onFindTargetState() {
		if (!this.scene || this.isKilled()) return;

		const targets = <Character[]>this.scene.entities.filter(en => en instanceof Character && en.id !== this.id && !en.isDied());

		this.target = random.pickOne(targets);

		this.ai.go(ENEMY_STATES.FOLLOW_TARGET);
	}

	protected async onFollowTargetState() {
		if (!this.target) return this.ai.go(ENEMY_STATES.IDLE);

		this.fsm.go(CHARACTER_STATES.MOVE);

		await this.actions.moveTo(vec(this.target.pos.x + random.pickOne([this.width, -this.width]), this.pos.y), config.character.speed).toPromise();
		await this.actions.moveTo(vec(this.pos.x, this.target.pos.y), config.character.speed).toPromise();

		if (this.enemy) return this.ai.go(ENEMY_STATES.FIGHT);

		return this.ai.go(ENEMY_STATES.FOLLOW_TARGET);
	}

	protected checkCondition() {
		const booze = (<Level>this.scene).getBoozePosition();

		if (this.condition < (100 / 5) * 2 && booze && random.bool()) {
			this.ai.go(ENEMY_STATES.DRINK);
		}

		super.checkCondition();
	}

	protected async onDrinkState() {
		const booze = <Beer>(<Level>this.scene).getBoozePosition();

		if (booze && !booze.isKilled()) {
			this.fsm.go(CHARACTER_STATES.MOVE);
			await this.actions.moveTo(vec(this.pos.x, booze.pos.y + 150), config.character.speed).toPromise();
			await this.actions.moveTo(vec(booze.pos.x, this.pos.y), config.character.speed).toPromise();

			if (booze && !booze.isKilled()) {
				booze.use();
				this.drink();
				return this.ai.go(ENEMY_STATES.IDLE);
			}
		}

		return this.ai.go(ENEMY_STATES.IDLE);
	}
}
