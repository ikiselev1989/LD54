import { ActorArgs, ScreenElement, Sprite, vec } from 'excalibur';
import res from '../res';
import game from '../game';
import config from '../config';
import { EVENTS } from '../enums';
import Character from './Character';

export default class PlayerAlcoholMeter extends ScreenElement {
	constructor(props: ActorArgs = {}) {
		super({
			...props,
			pos: vec(60 + config.ui.offset, game.drawHeight - config.ui.offset - 60),
			anchor: vec(0, 1),
			z: 5000,
		});
	}

	onInitialize() {
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
		const sprite = res.assets.getFrameSprite(`graphics/player-state/${index}`);

		sprite &&
			this.graphics.use(<Sprite>sprite, {
				anchor: vec(0.5, 0.5),
			});
	}

	private addGraphics() {
		this.graphics.use(<Sprite>res.assets.getFrameSprite('graphics/player-state/2'));
	}
}
