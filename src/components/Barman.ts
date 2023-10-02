import { Actor, ActorArgs, Animation, Timer, vec } from 'excalibur';
import res from '../res';
import SpriteSheetAnimation from '../partials/spritesheet-animation';
import game from '../game';
import { LDtkLayer } from '../types';
import Beer from './Beer';
import config from '../config';

export default class Barman extends Actor {
	private animations!: SpriteSheetAnimation;

	constructor(props: ActorArgs = {}) {
		super({
			...props,
			pos: vec(game.halfDrawWidth, 300),
			anchor: vec(1, 1),
		});
	}

	onInitialize() {
		this.animations = new SpriteSheetAnimation([res.barman]);

		this.addGraphics();

		const timer = new Timer({
			fcn: async () => {
				await this.takeDrinks();
				this.addGraphics();
			},
			repeats: true,
			interval: config.bar.boozeInterval,
		});

		this.scene.add(timer);
		timer.start();
	}

	async takeDrinks() {
		const layer = <LDtkLayer>res.map.getLevelLayersByName(0, 'Entities')[0];
		const boozeSpawns = (layer?.entityInstances || []).filter(ent => ent.__identifier === 'BoozeSpawn');

		for (const spawn of boozeSpawns) {
			this.pos.x = spawn.__worldX;

			const beer = new Beer({
				pos: vec(spawn.__worldX, spawn.__worldY),
			});

			this.scene.add(beer);

			const anim = <Animation>this.animations.getAnimation('barman/take-drink');

			this.graphics.use(anim);

			anim.reset();
			anim.play();

			await game.waitFor(1000);
		}
	}

	private addGraphics() {
		const anim = <Animation>this.animations.getAnimation('barman/idle');

		this.graphics.use(anim);

		anim.play();
	}
}
