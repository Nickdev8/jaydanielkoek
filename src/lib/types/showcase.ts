import type { Poster } from './poster';

export type ShowcaseDefinition = {
	posters: Poster[];
	distanceByStep: readonly number[];
	cameraStartRotation?: number;
	backgroundColor: string;
	fogDensity: number;
	floorHeight?: number;
};
