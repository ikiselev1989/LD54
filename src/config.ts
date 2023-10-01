import { Keys } from 'excalibur';

export default {
	debug: true,
	showFps: false,
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
		width: 70,
		height: 50,
		hurtImpulse: 15,
		trigger: {
			xOffset: 70,
			width: 70,
			height: 50,
		},
		punchCount: 3,
	},
};
