import { Keys } from 'excalibur';

export default {
	debug: false,
	showFps: true,
	sceneFadeDuration: 400,
	input: {
		keyboard: {
			left: Keys.A,
			right: Keys.D,
			up: Keys.W,
			down: Keys.S,
			punch: Keys.J,
			kick: Keys.K,
			block: Keys.L,
		},
	},
	character: {
		speed: 300,
		width: 50,
		hurtImpulse: 15,
		trigger: {
			xOffset: 80,
			width: 100,
		},
		punchCount: 3,
		boozeCoolDown: 2,
		damage: {
			value: 5,
			ratio: [1.5, 1, 1.25],
		},
	},
	enemy: {
		startCount: 4,
		reactionTime: 300,
	},
	ui: {
		offset: 50,
	},
};
