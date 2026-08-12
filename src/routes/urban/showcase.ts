import type { ShowcaseDefinition } from '$lib/types/showcase';

export const urbanShowcase = {
	posters: [
		{ image: '/posters/urban/MEME.jpg', angle: 72 * 0, step: 1 },
		{ image: '/posters/urban/MEME2.jpg', angle: 72 * 0 + 15, step: 1.3 },
		{ image: '/posters/urban/DuivenDam.jpg', angle: 72 * 4, step: 1 },
		{ image: '/posters/urban/nowarwomanprotests.jpg', angle: 72 * 1, step: 1 },
		{ image: '/posters/urban/peaceprotestes.jpg', angle: 72 * 1 + 15, step: 1.3 },
		{ image: '/posters/urban/sadwomanprotests.jpg', angle: 40 * 1, step: 2 },
		{ image: '/posters/urban/womanprotests.jpg', angle: 40 * 1 + 15, step: 2.2 }
	],
	distanceByStep: [0, 5.63, 13, 20, 27],
	cameraStartRotation: 0,
	backgroundColor: '#080c15',
	fogDensity: 0.075,
	floorHeight: -1.4
} satisfies ShowcaseDefinition;
