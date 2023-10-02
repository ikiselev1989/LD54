import { Animation, Sprite, vec } from 'excalibur';
import res from '../res';
import Table from './Table';
import SpriteSheetAnimation from '../partials/spritesheet-animation';

export default class Customer extends Table {
	protected addGraphics() {
		this.graphics.layers
			.create({
				name: 'main',
				order: 0,
				offset: vec(-10, 0),
			})
			.use(<Sprite>res.assets.getFrameSprite('graphics/table'));

		const animations = new SpriteSheetAnimation([res.assets]);

		const anim = <Animation>animations.getAnimation('graphics/customer');

		this.graphics.layers
			.create({
				name: 'add',
				order: 0,
				offset: vec(75, 0),
			})
			.use(anim);

		anim.play();
	}
}
