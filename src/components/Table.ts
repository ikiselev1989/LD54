import { Actor, ActorArgs, CollisionType, Sprite, vec } from 'excalibur';
import res from '../res';

export default class Table extends Actor {
	constructor(props: ActorArgs) {
		super({
			...props,
			width: 50,
			height: 50,
			anchor: vec(0.5, 1),
			collisionType: CollisionType.Fixed,
		});
	}

	onInitialize() {
		this.addGraphics();
	}

	private addGraphics() {
		this.graphics.use(<Sprite>res.assets.getFrameSprite('graphics/table'));
	}
}
