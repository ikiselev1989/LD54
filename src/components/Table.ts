import { Actor, ActorArgs, CollisionType, Sprite, vec } from 'excalibur';
import res from '../res';

export default class Table extends Actor {
	constructor(props: ActorArgs) {
		super({
			...props,
			width: 300,
			height: 100,
			anchor: vec(0.5, 0.8),
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
