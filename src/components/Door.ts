import { Actor, ActorArgs, Sprite, vec, Vector } from 'excalibur';
import res from '../res';

export default class Door extends Actor {
	constructor(props: ActorArgs) {
		super({
			...props,
			anchor: vec(0.5, 1),
		});
	}

	onInitialize() {
		this.close();
	}

	open() {
		this.graphics.use(<Sprite>res.assets.getFrameSprite('graphics/door-open'), {
			offset: vec(0, 50),
		});
	}

	close() {
		this.graphics.use(<Sprite>res.assets.getFrameSprite('graphics/door-closed'), {
			offset: Vector.Zero,
		});
	}
}
