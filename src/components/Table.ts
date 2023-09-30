import { Actor, ActorArgs, Sprite, vec } from 'excalibur';
import res from '../res';

export default class Table extends Actor {
	constructor(props: ActorArgs) {
		super({
			...props,
			anchor: vec(0.5, 1),
		});
	}

	onInitialize() {
		this.addGraphics();
	}

	private addGraphics() {
		this.graphics.use(<Sprite>res.assets.getFrameSprite('graphics/table'));
	}
}
