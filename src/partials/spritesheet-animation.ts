import { Animation, AnimationStrategy, range, Sprite, SpriteSheet } from 'excalibur';
import type { ISpriteSheetJSON } from '../types';
import JSONSpriteSheet from './json-spritesheet';

export default class SpriteSheetAnimation {
	private animationMap = new Map<string, Animation>();
	private frames: ISpriteSheetJSON['frames'];
	private sprites: Sprite[] = [];
	private framesName!: string[];

	constructor(private jsonSpriteSheets: JSONSpriteSheet[], private readonly frameRate = 1000 / 24) {
		this.frames = {
			...jsonSpriteSheets.reduce((acc, { data }) => ({
				...acc,
				...data.frames,
			}), {}),
		};
		this.framesName = Object.keys(this.frames).sort((a, b) =>
			a.localeCompare(b, undefined, {
				numeric: true,
				sensitivity: 'base',
			}));

		this.makeFrameSprites();
		this.parseAnimations();
	}

	private static parseKeyName(key: string) {
		const keys = key.split('/');
		return key.replace(`/${keys[keys.length - 1]}`, '');
	}

	getAnimation(
		name: string,
		conf?: {
			duration?: number;
			strategy?: AnimationStrategy;
		},
	): Animation | null {
		if (this.animationMap.has(name)) {
			const anim = <Animation>this.animationMap.get(name);

			if (conf) {
				anim.strategy = conf?.strategy || AnimationStrategy.Loop;
				anim.frameDuration = conf?.duration || this.frameRate;
			}

			return anim;
		}

		return null;
	}

	private makeFrameSprites() {
		let spritesByFrames = {};

		for (let jsonSpriteSheet of this.jsonSpriteSheets) {
			const framesKeys = Object.keys(jsonSpriteSheet.data.frames);
			const spritesList = SpriteSheet.fromImageSourceWithSourceViews({
				image: jsonSpriteSheet.imageSource,
				sourceViews: Object.values(jsonSpriteSheet.data.frames).map(({ frame }) => ({
					width: frame.w,
					height: frame.h,
					x: frame.x,
					y: frame.y,
				})),
			}).sprites;

			for (let [ind, sprite] of spritesList.entries()) {
				spritesByFrames = {
					...spritesByFrames,
					[framesKeys[ind]]: sprite,
				};
			}
		}

		this.sprites = Object.keys(spritesByFrames).sort((a, b) =>
			a.localeCompare(b, undefined, {
				numeric: true,
				sensitivity: 'base',
			})).map(key => spritesByFrames[key]);
	}

	private parseAnimations() {
		const animationKeys = new Set([
			...this.framesName.map(key => {
				return SpriteSheetAnimation.parseKeyName(key);
			}),
		]);

		for (let key of animationKeys) {
			const startIndex = this.framesName.findIndex(frameKey => SpriteSheetAnimation.parseKeyName(frameKey) === key);
			const endIndex = startIndex + this.framesName.filter(frameKey => SpriteSheetAnimation.parseKeyName(frameKey) === key).length - 1;
			const frameIndices = range(startIndex, endIndex);
			const anim = new Animation({
				frames: this.sprites.filter((val, index) => frameIndices.indexOf(index) > -1).map(val => ({
					graphic: val,
					duration: this.frameRate,
				})),
				strategy: AnimationStrategy.Loop,
			});

			anim.pause();
			this.animationMap.set(key, anim);
		}
	}
}
