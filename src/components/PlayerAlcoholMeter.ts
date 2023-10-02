import { ActorArgs, GraphicsLayer, ScreenElement, Sprite, vec } from 'excalibur';
import res from '../res';
import game from '../game';
import config from '../config';
import { EVENTS } from '../enums';
import Character from './Character';
import { lerp } from '../utils';

export default class PlayerAlcoholMeter extends ScreenElement {
	private faceLayer!: GraphicsLayer;
	private scaleLayer!: GraphicsLayer;
	private indicatorLayer!: GraphicsLayer;

	constructor(props: ActorArgs = {}) {
		super({
			...props,
			pos: vec(60 + config.ui.offset, game.drawHeight - config.ui.offset - 60),
			anchor: vec(0, 1),
			z: 5000,
		});
	}

	onInitialize() {
		this.faceLayer = this.graphics.layers.create({
			name: 'face',
			order: 0,
		});
		this.scaleLayer = this.graphics.layers.create({
			name: 'scale',
			order: 0,
			offset: vec(80, 100),
		});
		this.indicatorLayer = this.graphics.layers.create({
			name: 'indicator',
			order: 0,
			offset: vec(75, 0),
		});

		this.addGraphics();
		this.registerEvents();
	}

	private registerEvents() {
		game.events.on(EVENTS.PLAYER_STATUS_UPDATE, () => {
			this.updateGraphics();
		});
	}

	private updateGraphics() {
		const { condition } = <Character>this.scene.world.entityManager.getByName('Player')[0];

		const index = 5 - Math.floor(condition / (100 / 5));
		const sprite = res.assets.getFrameSprite(`graphics/player-state/${index - 1}`);

		sprite &&
			this.faceLayer.use(<Sprite>sprite, {
				anchor: vec(0.5, 0.5),
			});

		this.indicatorLayer.offset.y = lerp(100, -90, condition / 100);
	}

	private addGraphics() {
		this.faceLayer.use(<Sprite>res.assets.getFrameSprite('graphics/player-state/2'));
		this.scaleLayer.use(<Sprite>res.assets.getFrameSprite('graphics/scale'));
		this.indicatorLayer.use(<Sprite>res.assets.getFrameSprite('graphics/scale-indicator'));
	}
}
