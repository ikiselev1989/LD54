import { Actor, Sprite, Timer, vec } from 'excalibur';
import res from '../res';
import { random } from '../utils';

export default class Logo extends Actor {
	constructor(props = {}) {
		super({ ...props, pos: vec(650, 85) });
	}

	onInitialize() {
		this.addGraphics();

		const overlay = new Actor();
		overlay.graphics.use(<Sprite>res.assets.getFrameSprite('graphics/logo/on'));
		this.addChild(overlay);

		const timer = new Timer({
			random,
			randomRange: [0, 1000],
			fcn: () => {
				overlay.actions.blink(100, 20, 5);
			},
			interval: 10000,
			repeats: true,
		});

		this.scene.add(timer.start());
	}

	addGraphics() {
		this.graphics.use(<Sprite>res.assets.getFrameSprite('graphics/logo/off'));
	}
}
