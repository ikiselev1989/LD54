import { ImageSource } from 'excalibur';
import JSONSpriteSheet from './partials/json-spritesheet';
import LDtkResource from './partials/ldtk-resource';

export default {
	bg: new ImageSource('/bg.jpg'),
	assets: new JSONSpriteSheet('/assets.json'),
	player: new JSONSpriteSheet('/player.json'),
	enemy: new JSONSpriteSheet('/enemy.json'),
	map: new LDtkResource('/map.ldtk'),
};
