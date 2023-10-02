import { Actor, ActorArgs, Sprite, Timer, vec } from 'excalibur';
import res from '../res';
import config from '../config';

export default class Beer extends Actor {
	private timer!: Timer;

	constructor(props: ActorArgs = {}) {
		super({
			...props,
			anchor: vec(0.5, 1),
		});
	}

	onInitialize() {
		this.addGraphics();

		this.graphics.opacity = 0;
		this.actions.fade(1, 1000);

		this.timer = new Timer({
			fcn: async () => {
				this.graphics.visible = false;
				await this.actions.blink(250, 250, 4).toPromise();
				this.kill();
			},
			interval: config.bar.beerTimeout,
		});

		this.scene.add(this.timer);
		this.timer.start();
	}

	use() {
		this.timer.cancel();
		this.kill();
	}

	private addGraphics() {
		this.graphics.use(<Sprite>res.assets.getFrameSprite('graphics/beer'));
	}
}
