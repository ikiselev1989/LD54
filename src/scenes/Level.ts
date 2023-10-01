import { Actor, CollisionType, Engine, range, Scene, SceneActivationContext, Sprite, Timer, vec, Vector } from 'excalibur';
import res from '../res';
import Player from '../components/Player';
import game from '../game';
import { LDtkLayer } from '../types';
import Table from '../components/Table';
import Character from '../components/Character';
import { Enemy } from '../components/Enemy';
import Beam from '../components/Beam';
import PlayerAlcoholMeter from '../components/PlayerAlcoholMeter';
import { random } from '../utils';
import Beer from '../components/booze/Beer';
import Cocktail from '../components/booze/Cocktail';
import Vodka from '../components/booze/Vodka';

export default class Level extends Scene {
	private player!: Player;
	private prevSpawnInd!: number;

	onInitialize(_engine: Engine) {}

	onActivate(_context: SceneActivationContext<unknown>) {
		this.addBackground();
		this.addBorders();
		this.addBar();
		this.addDoor();
		this.addUI();
		this.addBeam();
		this.addTables();
		this.addPlayer();
		this.addEnemy();

		const timer = new Timer({
			fcn: () => this.addBooze(),
			repeats: true,
			interval: 5000,
		});

		this.add(timer);
		timer.start();
	}

	onPreDraw() {
		for (let actor of this.entities) {
			if (actor instanceof Character || actor instanceof Table || actor instanceof Beam) {
				(<Actor>actor).z = game.halfDrawHeight + (<Actor>actor).pos.y;
			}
		}
	}

	private addDoor() {
		const layer = <LDtkLayer>res.map.getLevelLayersByName(0, 'Entities')[0];
		const doorConfig = (layer?.entityInstances || []).filter(ent => ent.__identifier === 'Door')[0];
		const { __worldX, __worldY } = doorConfig;

		const door = new Actor({
			pos: vec(__worldX, __worldY),
			anchor: vec(0.5, 1),
		});

		door.graphics.use(<Sprite>res.assets.getFrameSprite('graphics/door'));

		this.add(door);
	}

	private addUI() {
		const pam = new PlayerAlcoholMeter();

		this.add(pam);
	}

	private addEnemy() {
		const enemy = new Enemy({
			pos: vec(game.halfDrawWidth, game.halfDrawHeight),
		});

		this.add(enemy);
	}

	private addPlayer() {
		const layer = <LDtkLayer>res.map.getLevelLayersByName(0, 'Entities')[0];
		const playerSpawn = (layer?.entityInstances || []).filter(ent => ent.__identifier === 'PlayerSpawn')[0];

		this.player = new Player({
			pos: vec(playerSpawn.__worldX, playerSpawn.__worldY),
		});

		this.add(this.player);
	}

	private addTables() {
		const layer = <LDtkLayer>res.map.getLevelLayersByName(0, 'Entities')[0];
		const tables = (layer?.entityInstances || []).filter(ent => ent.__identifier === 'Table');

		for (let tableConfig of tables) {
			const { __worldX, __worldY } = tableConfig;

			const table = new Table({
				pos: vec(__worldX, __worldY),
			});

			this.add(table);
		}
	}

	private addBeam() {
		const layer = <LDtkLayer>res.map.getLevelLayersByName(0, 'Entities')[0];
		const beams = (layer?.entityInstances || []).filter(ent => ent.__identifier === 'Beam');

		for (let beamConfig of beams) {
			const { __worldX, __worldY } = beamConfig;

			const table = new Beam({
				pos: vec(__worldX, __worldY),
			});

			this.add(table);
		}
	}

	private addBackground() {
		const bg = new Actor();
		bg.graphics.use(<Sprite>res.assets.getFrameSprite('graphics/bg'), {
			anchor: Vector.Zero,
		});

		this.add(bg);
	}

	private addBorders() {
		const layer = <LDtkLayer>res.map.getLevelLayersByName(0, 'Entities')[0];
		const borders = (layer?.entityInstances || []).filter(ent => ent.__identifier === 'Border');

		for (let borderConfig of borders) {
			const { width, height, __worldX, __worldY } = borderConfig;
			const border = new Actor({
				width,
				height,
				pos: vec(__worldX, __worldY),
				collisionType: CollisionType.Fixed,
			});

			this.add(border);
		}
	}

	private addBar() {
		const layer = <LDtkLayer>res.map.getLevelLayersByName(0, 'Entities')[0];
		const barConfig = (layer?.entityInstances || []).filter(ent => ent.__identifier === 'Bar')[0];
		const { __worldX, __worldY } = barConfig;

		const bar = new Actor({
			pos: vec(__worldX, __worldY),
			anchor: vec(0.5, 1),
		});

		bar.graphics.use(<Sprite>res.assets.getFrameSprite('graphics/bar'));

		this.add(bar);
	}

	private addBooze() {
		const layer = <LDtkLayer>res.map.getLevelLayersByName(0, 'Entities')[0];
		const boozeSpawn = (layer?.entityInstances || []).filter(ent => ent.__identifier === 'BoozeSpawn');

		this.prevSpawnInd = random.pickOne(range(0, boozeSpawn.length - 1).filter(ind => ind !== this.prevSpawnInd));

		const spawn = boozeSpawn[this.prevSpawnInd];
		const BoozeClass = random.pickOne([Beer, Cocktail, Vodka]);
		const booze = new BoozeClass({
			pos: vec(spawn.__worldX, spawn.__worldY),
		});

		this.add(booze);
	}
}
