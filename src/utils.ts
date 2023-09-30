import { Random } from 'excalibur';

export const random = new Random();

export const easyTween = (cb: (progress: number) => void, duration: number): Promise<void> => {
	const now = performance.now();
	return new Promise(resolve => {
		requestAnimationFrame(function loop(time) {
			const progress = Math.min((time - now) / duration, 1);

			cb(progress);

			if (progress === 1) {
				return resolve();
			}

			requestAnimationFrame(loop);
		});
	});
};

export const between = (x: number, min: number, offset: number) => {
	return x >= min && x <= min + offset;
};

export const canUseWebP = () => {
	const elem = document.createElement('canvas');
	if (!!(elem.getContext && elem.getContext('2d'))) {
		return elem.toDataURL('image/webp').indexOf('data:image/webp') == 0;
	}

	return false;
};

export const chunk = (array: any[], chunkSize: number) => {
	const size = Math.ceil(array.length / chunkSize);
	const chunks = new Array(size).fill(0);

	return chunks.map((_, index) => {
		const start = index * chunkSize;
		const end = (index + 1) * chunkSize;
		return array.slice(start, end);
	});
};
