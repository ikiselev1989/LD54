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
}

export enum CHARACTER_EVENTS {
	TOO_MUCH_BOOZE = 'tooMuchBooze',
	NOT_ENOUGH_BOOZE = 'notEnoughBooze',
}
