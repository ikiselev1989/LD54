import type { Loadable } from 'excalibur';
import { Resource } from 'excalibur';
import type { LDtkLayer, LDtkMap } from '../types';

export default class LDtkResource implements Loadable<LDtkMap> {
	data!: LDtkMap;
	private _json: Resource<LDtkMap>;

	constructor(private readonly path: string) {
		this._json = new Resource(this.path, 'json');
	}

	getLevelLayersByType(level: number = 0, type: LDtkLayer['__type']) {
		return this.data.levels[level].layerInstances.filter(layer => layer.__type === type);
	}

	getLevelLayersByName(level: number = 0, name: LDtkLayer['__identifier']) {
		return this.data.levels[level].layerInstances.filter(layer => layer.__identifier === name);
	}

	isLoaded(): boolean {
		return !!this.data;
	}

	async load(): Promise<any> {
		if (this.isLoaded()) return this.data;

		this.data = await this._json.load();

		return this.data;
	}
}
