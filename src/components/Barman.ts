import { Actor, ActorArgs, Animation, AnimationStrategy, Timer, vec } from 'excalibur';
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

		this.idleAnimation();

		const timer = new Timer({
			fcn: async () => {
				await this.takeDrinks();
				this.idleAnimation();
			},
			repeats: true,
			interval: config.bar.boozeInterval,
		});

		this.scene.add(timer);
		timer.start();

		const timer2 = new Timer({
			fcn: () => this.jokeAnimation(),
			repeats: true,
			interval: config.bar.boozeInterval * 4 + config.bar.boozeInterval / 2,
		});

		this.scene.add(timer2);
		timer2.start();
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

	private idleAnimation() {
		const anim = <Animation>this.animations.getAnimation('barman/idle');

		this.graphics.use(anim);

		anim.play();
	}

	private jokeAnimation() {
		const anim = <Animation>this.animations.getAnimation('barman/joke', {
			strategy: AnimationStrategy.End,
		});

		this.graphics.use(anim, {
			offset: vec(150, 200),
		});

		anim.events.on('end', async () => {
			this.pos.x = game.halfDrawWidth - 150;

			await game.waitFor(1000);
			this.idleAnimation();
		});

		anim.reset();
		anim.play();
	}
}
