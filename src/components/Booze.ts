import { Actor, ActorArgs, Timer, vec } from 'excalibur';

export default abstract class Booze extends Actor {
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
			interval: 5000,
		});

		this.scene.add(this.timer);
		this.timer.start();
	}

	abstract addGraphics(): void;

	use() {
		this.timer.cancel();
		this.kill();
	}
}
