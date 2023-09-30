export interface ISpriteSheetJSON {
	frames: {
		[key: string]: {
			frame: {
				w: number;
				h: number;
				x: number;
				y: number;
			};
		};
	};
	meta: {
		image: string;
	};
}

export interface LDtkMap {
	levels: LDtkLevel[];
}

export interface LDtkLevel {
	iid: string;
	worldDepth: number;
	bgRelPath: string;
	layerInstances: LDtkLayer[];
}

export interface LDtkLayer {
	__type: 'Tiles' | 'Entities';
	__identifier: string;
	__gridSize: number;
	__cWid: number;
	__cHei: number;
	entityInstances?: LDtkEntity[];
	gridTiles: LDtkTile[];
}

export interface LDtkEntity {
	__grid: [x: number, y: number];
	__identifier: string;
	__pivot: [x: number, y: number];
	__worldX: number;
	__worldY: number;
	fieldInstances: LDtkField[];
	iid: string;
}

export interface LDtkField {
	__identifier: string;
	__value: any;
}

export interface LDtkTile {
	t: number;
	px: [x: number, y: number];
}
