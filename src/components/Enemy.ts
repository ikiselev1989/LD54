import Character from './Character';
import res from '../res';
import { Animation, AnimationStrategy, Sprite } from 'excalibur';
import SpriteSheetAnimation from '../partials/spritesheet-animation';

export class Enemy extends Character {
	private animations!: SpriteSheetAnimation;

	onInitialize() {
		this.animations = new SpriteSheetAnimation([res.enemy]);

		super.onInitialize();

		this.addGraphics();
	}

	onBlockState(): void {
	}

	onHurtState(): void {
		const anim = <Animation>this.animations.getAnimation('enemy/enemy1/damage-up', {
			strategy: AnimationStrategy.Freeze,
		});

		anim.reset();
		this.graphics.use(anim);

		anim.events.on('end', () => this.fsm.go('IDLE'));

		anim.play();
	}

	onIdleState(): void {
		this.graphics.use(<Sprite>res.assets.getFrameSprite('graphics/vrag_1'));
	}

	onMoveState(): void {
	}

	onPunchState(): void {
	}

	private addGraphics() {
		this.graphics.use(<Sprite>res.assets.getFrameSprite('graphics/vrag_1'));
	}
}
