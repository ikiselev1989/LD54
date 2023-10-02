import { Actor, ActorArgs, Animation, vec } from 'excalibur';
import res from '../res';
import SpriteSheetAnimation from '../partials/spritesheet-animation';
import game from '../game';

export default class Barman extends Actor {
	private animations!: SpriteSheetAnimation;

	constructor(props: ActorArgs = {}) {
		super({
			...props,
			pos: vec(game.halfDrawWidth, 300),
			anchor: vec(1, 1),
		});
	}

	onInitialize() {
		this.animations = new SpriteSheetAnimation([res.barman]);

		this.addGraphics();
	}

	private addGraphics() {
		const anim = <Animation>this.animations.getAnimation('barman/idle');

		this.graphics.use(anim);

		anim.play();
	}
}
