import { Actor, CollisionType, Color, Engine, Rectangle, Scene, SceneActivationContext, Sprite, vec, Vector } from 'excalibur';
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
import Beer from '../components/Beer';
import config from '../config';
import { ENEMY_TYPE, EVENTS, TABLE_TYPE } from '../enums';
import Door from '../components/Door';
import Barman from '../components/Barman';
import Runner from '../components/Runner';
import GameOver from '../components/GameOver';

export default class Level extends Scene {
	private player!: Player;
	private door!: Door;
	private tutorialed!: boolean;

	onInitialize(_engine: Engine) {
		this.tutorialed = false;
		this.registerEvents();
	}

	async onActivate(_context: SceneActivationContext<unknown>) {
		this.addBackground();
		this.addBorders();
		this.addBarman();
		this.addBar();
		this.addDoor();
		this.addUI();
		this.addBeam();
		this.addTables();

		if (!this.tutorialed) {
			this.addTutorial();
		} else {
			this.events.emit(EVENTS.START);
		}
	}

	onPreDraw() {
		for (let actor of this.entities) {
			if (actor instanceof Character || actor instanceof Table || actor instanceof Beam) {
				(<Actor>actor).z = game.halfDrawHeight + (<Actor>actor).pos.y;
			}
		}
	}

	getBoozePosition() {
		const boozes = this.entities.filter(en => en instanceof Beer);

		return random.pickOne(boozes);
	}

	private addTutorial() {
		const tutorial = new Actor({
			pos: vec(game.halfDrawWidth, game.halfDrawHeight),
			z: 5000,
		});

		tutorial.graphics.add(
			new Rectangle({
				width: game.drawWidth,
				height: game.drawHeight,
				color: Color.fromRGB(0, 0, 0, 0.6),
			}),
		);
		tutorial.graphics.add(<Sprite>res.assets.getFrameSprite('graphics/tutor'));
		tutorial.graphics.layers
			.create({
				name: 'button',
				order: 0,
				offset: vec(0, game.halfDrawHeight),
			})
			.use(<Sprite>res.assets.getFrameSprite('graphics/enter'), {
				anchor: vec(0.5, 1),
			});

		this.add(tutorial);

		this.events.once(EVENTS.START, async () => {
			await tutorial.actions.fade(0, 400).toPromise();
			tutorial.kill();
		});
	}

	private gameOver() {
		const gameOver = new GameOver();

		this.add(gameOver);
	}

	private registerEvents() {
		this.events.once(EVENTS.GAME_OVER, () => this.gameOver());
		this.events.once(EVENTS.START, () => this.spawnCharacters());

		this.events.on(EVENTS.NEW_ENEMY, () => {
			if (random.bool(0.1) && !this.entities.filter(en => en instanceof Runner && !en.isDied()).length) {
				return this.addRunner();
			}

			return this.addNewEnemy();
		});

		game.inputMapper.on(
			({ keyboard }) => {
				return (keyboard.wasPressed(config.input.keyboard.enter) || keyboard.wasPressed(config.input.keyboard.space)) && !this.tutorialed;
			},
			async () => {
				this.tutorialed = true;
				this.events.emit(EVENTS.START);
			},
		);
	}

	private async addRunner() {
		const layer = <LDtkLayer>res.map.getLevelLayersByName(0, 'Entities')[0];
		const enemySpawn = (layer?.entityInstances || []).filter(ent => ent.__identifier === 'EnemySpawn')[0];

		const runner = new Runner({
			pos: vec(enemySpawn.__worldX, enemySpawn.__worldY),
		});

		this.add(runner);

		this.door.open();

		await game.waitFor(1000);
		this.door.close();
	}

	private async addNewEnemy() {
		const layer = <LDtkLayer>res.map.getLevelLayersByName(0, 'Entities')[0];
		const enemySpawn = (layer?.entityInstances || []).filter(ent => ent.__identifier === 'EnemySpawn')[0];

		const enemy = this.addEnemy(vec(enemySpawn.__worldX, enemySpawn.__worldY));
		enemy.spawned = true;

		this.door.open();

		await game.waitFor(1000);
		this.door.close();

		if (random.bool(0.1)) {
			this.addNewEnemy();
		}
	}

	private addDoor() {
		const layer = <LDtkLayer>res.map.getLevelLayersByName(0, 'Entities')[0];
		const doorConfig = (layer?.entityInstances || []).filter(ent => ent.__identifier === 'Door')[0];
		const { __worldX, __worldY } = doorConfig;

		this.door = new Door({
			pos: vec(__worldX, __worldY),
		});

		this.add(this.door);
	}

	private addUI() {
		const pam = new PlayerAlcoholMeter();

		this.add(pam);
	}

	private spawnCharacters() {
		const layer = <LDtkLayer>res.map.getLevelLayersByName(0, 'Entities')[0];
		let spawns = (layer?.entityInstances || []).filter(ent => ent.__identifier === 'PlayerSpawn');

		const playerSpawn = random.pickOne(spawns);
		spawns = spawns.filter(spawn => spawn.iid !== playerSpawn.iid);

		this.addPlayer(vec(playerSpawn.__worldX, playerSpawn.__worldY));

		for (let i = 0; i < config.enemy.startCount; i++) {
			const spawn = random.pickOne(spawns);
			spawns = spawns.filter(sp => sp.iid !== spawn.iid);

			this.addEnemy(vec(spawn.__worldX, spawn.__worldY));
		}
	}

	private addEnemy(pos: Vector) {
		const enemy = new Enemy(
			{
				pos,
			},
			random.pickOne([ENEMY_TYPE.ENEMY1, ENEMY_TYPE.ENEMY3]),
		);

		enemy.heading = pos.x > game.halfDrawWidth ? Vector.Left : Vector.Right;

		this.add(enemy);

		return enemy;
	}

	private addPlayer(pos: Vector) {
		this.player = new Player({
			pos,
		});

		this.player.heading = pos.x > game.halfDrawWidth ? Vector.Left : Vector.Right;

		this.add(this.player);
	}

	private addTables() {
		const layer = <LDtkLayer>res.map.getLevelLayersByName(0, 'Entities')[0];
		const tables = (layer?.entityInstances || []).filter(ent => ent.__identifier === 'Table');

		for (let [index, tableConfig] of tables.entries()) {
			const { __worldX, __worldY } = tableConfig;

			let type = TABLE_TYPE.MAIN;

			if (index === 0) {
				type = TABLE_TYPE.CUSTOMER1;
			}

			if (index === 1) {
				type = TABLE_TYPE.CUSTOMER2;
			}

			if (index === 2) {
				type = TABLE_TYPE.CUSTOMER3;
			}

			const table = new Table(
				{
					pos: vec(__worldX, __worldY),
				},
				type,
			);

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

	private addBarman() {
		const barman = new Barman();
		this.add(barman);
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
}
