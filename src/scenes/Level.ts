import { Actor, Engine, Scene, SceneActivationContext, vec, Vector } from 'excalibur';
import res from '../res';
import Player from '../components/Player';
import game from '../game';
import { LDtkLayer } from '../types';
import Table from '../components/Table';
import Character from '../components/Character';
import { Enemy } from '../components/Enemy';
import Beam from '../components/Beam';

export default class Level extends Scene {
	private player!: Player;

	onInitialize(_engine: Engine) {
		this.addBackground();
	}

	onActivate(_context: SceneActivationContext<unknown>) {
		this.addBeam();
		this.addTables();
		this.addPlayer();
		this.addEnemy();
	}

	onPreDraw() {
		for (let actor of this.entities) {
			if (actor instanceof Character || actor instanceof Table || actor instanceof Beam) {
				(<Actor>actor).z = game.halfDrawHeight + (<Actor>actor).pos.y;
			}
		}
	}

	private addEnemy() {
		const enemy = new Enemy({
			pos: vec(game.halfDrawWidth, game.halfDrawHeight),
		});

		this.add(enemy);
	}

	private addPlayer() {
		this.player = new Player({
			pos: vec(game.halfDrawWidth, game.halfDrawHeight),
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
		bg.graphics.use(res.bg.toSprite(), {
			anchor: Vector.Zero,
		});

		this.add(bg);
	}
}
