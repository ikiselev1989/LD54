import { Keys } from 'excalibur';

export default {
	debug: true,
	showFps: false,
	sceneFadeDuration: 400,
	characterSpeed: 300,
	input: {
		keyboard: {
			left: Keys.A,
			right: Keys.D,
			up: Keys.W,
			down: Keys.S,
			punch: Keys.J,
			kick: Keys.K,
			clinch: Keys.L,
		},
	},
	fightTrigger: {
		xOffset: 100,
		width: 50,
		height: 50,
	},
};
