import { Actor, ActorArgs, CollisionType, Shape, Sprite, vec } from 'excalibur';
import res from '../res';

export default class Table extends Actor {
	constructor(props: ActorArgs) {
		super({
			...props,
			width: 200,
			height: 200,
			anchor: vec(0.5, 0.8),
			collider: Shape.Circle(200 / 2),
			collisionType: CollisionType.Fixed,
		});
	}

	onInitialize() {
		this.addGraphics();
	}

	private addGraphics() {
		this.graphics.use(<Sprite>res.assets.getFrameSprite('graphics/table'), {
			offset: vec(-10, 0),
		});
	}
}
