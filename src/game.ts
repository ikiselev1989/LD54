import { Color, DisplayMode, Engine, Loader, PointerScope, ScrollPreventionMode } from 'excalibur';
import { SCENES } from './enums';
import Level from './scenes/Level';
import config from './config';
import { Pane } from 'tweakpane';
import Intro from './scenes/Intro';
import res from './res';
import { easyTween } from './utils';

class Game extends Engine {
	private progress!: number;

	constructor() {
		super({
			viewport: {
				width: 1920 / 2,
				height: 1080 / 2,
			},
			resolution: {
				width: 1920,
				height: 1080,
			},
			pixelRatio: 1,
			enableCanvasTransparency: false,
			snapToPixel: true,
			suppressConsoleBootMessage: true,
			suppressPlayButton: true,
			fixedUpdateFps: 60,
			maxFps: 120,
			pointerScope: PointerScope.Canvas,
			scrollPreventionMode: ScrollPreventionMode.All,
			displayMode: DisplayMode.FitScreen,
			backgroundColor: Color.fromHex('#72AD7D'),
			antialiasing: true,
		});

		config.showFps && this.showFpsCounter();
		config.debug && this.activateDebug();
	}

	async changeScene(key: SCENES) {
		await easyTween(progress => {
			this.canvas.style.setProperty('opacity', (1 - progress).toString());
		}, config.sceneFadeDuration);

		this.goToScene(key);
		await this.waitFor(config.sceneFadeDuration);

		await easyTween(progress => {
			this.canvas.style.setProperty('opacity', progress.toString());
		}, config.sceneFadeDuration);
	}

	onInitialize() {
		this.progress = 0;

		this.addScene(SCENES.INTRO, new Intro());
		this.addScene(SCENES.LEVEL, new Level());
	}

	waitFor(time: number): Promise<void> {
		return new Promise(res => {
			this.clock.schedule(() => res(), time);
		});
	}

	async play() {
		await this.start();

		const loader = new Loader([...Object.values(res)]);
		loader.suppressPlayButton = true;

		await loader.load();

		this.goToScene(SCENES.INTRO);
	}

	addProgress() {
		this.progress++;
	}

	private showFpsCounter() {
		const fpsPane = new Pane();
		fpsPane.addBinding(this.clock.fpsSampler, 'fps', {
			readonly: true,
			view: 'graph',
			min: 20,
		});
	}

	private activateDebug() {
		this.debug.entity.showId = false;
		this.debug.collider.showGeometry = true;
		this.debug.transform.showPosition = true;

		this.showDebug(true);
	}
}

const game = new Game();

export default game;
