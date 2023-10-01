import Character from './Character';
import res from '../res';
import { Actor, Animation, AnimationStrategy } from 'excalibur';
import SpriteSheetAnimation from '../partials/spritesheet-animation';
import { CHARACTER_STATES } from '../enums';

export class Enemy extends Character {
	private animations!: SpriteSheetAnimation;

	onInitialize() {
		this.animations = new SpriteSheetAnimation([res.enemy]);

		super.onInitialize();

		this.fsm.go(CHARACTER_STATES.MOVE);
	}

	onBlockState(): void {}

	onHurtState(): void {
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
		this.actions.follow(<Actor>this.scene.world.entityManager.getByName('Player')[0]);

		const anims = this.animations.getAnimation('enemy/enemy1/move');
		anims?.play();
		this.graphics.use(<Animation>anims);
	}

	onPunchState(): void {}
}
