import { Actor, ActorArgs, CollisionType, Sprite, vec } from 'excalibur';
import res from '../res';

export default class Beam extends Actor {
	constructor(props: ActorArgs) {
		super({
			...props,
			width: 50,
			height: 25,
			anchor: vec(0.5, 1),
			collisionType: CollisionType.Fixed,
		});
	}

	onInitialize() {
		this.addGraphics();
	}

	private addGraphics() {
		this.graphics.use(<Sprite>res.assets.getFrameSprite('graphics/beam'), {
			anchor: vec(0.65, 1),
		});
	}
}
