import { Color, DisplayMode, Engine, Loader, PointerScope, ScrollPreventionMode } from 'excalibur';
import { SCENES } from './enums';
import Level from './scenes/Level';
import res from './res';
import config from './config';

class Game extends Engine {
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
			maxFps: 60,
			pointerScope: PointerScope.Canvas,
			scrollPreventionMode: ScrollPreventionMode.All,
			displayMode: DisplayMode.FitScreen,
			backgroundColor: Color.fromHex('#242424'),
			antialiasing: true,
		});

		config.showFps && this.showFpsCounter();
		config.debug && this.activateDebug();
	}

	onInitialize() {
		this.addScene(SCENES.LEVEL, new Level());
	}

	async play() {
		await this.start(new Loader([
			...Object.values(res),
		]));

		this.goToScene(SCENES.LEVEL);
	}

	private showFpsCounter() {
		// const fpsPane = new Pane();
		// fpsPane.addBinding(this.clock.fpsSampler, 'fps', {
		// 	readonly: true,
		// 	// view: 'graph',
		// 	min: 20,
		// });
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
