export enum SCENES {
	LEVEL = 'level',
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
	BLOCK = 'block',
	DAMAGE = 'damage',
	FALL = 'fall',
}

export enum CHARACTER_EVENTS {
	TOO_MUCH_BOOZE = 'tooMuchBooze',
	NOT_ENOUGH_BOOZE = 'notEnoughBooze',
}

export enum EVENTS {
	PLAYER_STATUS_UPDATE = 'playerStatusUpdate',
}

export enum ENEMY_STATES {
	IDLE = 'idle',
	FIND_TARGET = 'findTarget',
	FOLLOW_TARGET = 'followTarget',
	FIGHT = 'punch',
	DRINK = 'drink',
}
