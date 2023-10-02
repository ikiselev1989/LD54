import { Actor, ActorArgs, Animation, CollisionType, Shape, Sprite, vec } from 'excalibur';
import res from '../res';
import { TABLE_TYPE } from '../enums';
import SpriteSheetAnimation from '../partials/spritesheet-animation';

export default class Table extends Actor {
	constructor(
		props: ActorArgs,
		private type: TABLE_TYPE = TABLE_TYPE.MAIN,
	) {
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

	protected addGraphics() {
		this.graphics.use(<Sprite>res.assets.getFrameSprite('graphics/table'), {
			offset: vec(-10, 0),
		});

		if (this.type === TABLE_TYPE.CUSTOMER1) {
			const animations = new SpriteSheetAnimation([res.assets]);

			const anim = <Animation>animations.getAnimation('graphics/customer');

			this.graphics.layers
				.create({
					name: 'add',
					order: 0,
					offset: vec(75, 0),
				})
				.use(anim);

			anim.play();
		}

		if (this.type === TABLE_TYPE.CUSTOMER2) {
			const sprite = <Sprite>res.assets.getFrameSprite('graphics/customer7');

			this.graphics.layers
				.create({
					name: 'add',
					order: 0,
					offset: vec(120, 10),
				})
				.use(sprite);
		}

		if (this.type === TABLE_TYPE.CUSTOMER3) {
			const sprite = <Sprite>res.assets.getFrameSprite('graphics/customer3');

			this.graphics.layers
				.create({
					name: 'add',
					order: 0,
					offset: vec(-70, 30),
				})
				.use(sprite);

			const sprite2 = <Sprite>res.assets.getFrameSprite('graphics/customer6');

			this.graphics.layers
				.create({
					name: 'add2',
					order: 0,
					offset: vec(75, 20),
				})
				.use(sprite2);
		}
	}
}
