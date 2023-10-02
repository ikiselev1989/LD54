export enum SCENES {
	LEVEL = 'level',
	INTRO = 'intro',
}

export enum DIRECTION {
	LEFT = 'left',
	RIGHT = 'right',
	UP = 'up',
	DOWN = 'down',
}

export enum CHARACTER_STATES {
	INIT = 'init',
	IDLE = 'idle',
	MOVE = 'move',
	PUNCH = 'punch',
	KICK = 'kick',
	BLOCK = 'block',
	DAMAGE = 'damage',
	FALL = 'fall',
}

export enum EVENTS {
	PLAYER_STATUS_UPDATE = 'playerStatusUpdate',
	NEW_ENEMY = 'newEnemy',
	START = 'start',
	GAME_OVER = 'gameOver',
}

export enum ENEMY_STATES {
	IDLE = 'idle',
	FIND_TARGET = 'findTarget',
	FOLLOW_TARGET = 'followTarget',
	FIGHT = 'punch',
	DRINK = 'drink',
}

export enum ENEMY_TYPE {
	ENEMY1 = 'enemy1',
	ENEMY3 = 'enemy3',
}
