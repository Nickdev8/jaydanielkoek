export type Poster = {
	image: string;
	angle: number;
	step: number;
};

export type ShowcaseCategory = {
	id: string;
	label: string;
	lens: number;
	posters: Poster[];
};

export const showcaseCategories: ShowcaseCategory[] = [
	{
		id: 'urban',
		label: 'Urban',
		lens: 1,
		posters: [
			{ image: '/posters/urban/MEME.jpg', angle: 0, step: 1 },
			{ image: '/posters/urban/MEME2.jpg', angle: 15, step: 1.3 },
			{ image: '/posters/urban/DuivenDam.jpg', angle: 288, step: 1 },
			{ image: '/posters/urban/nowarwomanprotests.jpg', angle: 72, step: 1 },
			{ image: '/posters/urban/peaceprotestes.jpg', angle: 87, step: 1.3 },
			{ image: '/posters/urban/sadwomanprotests.jpg', angle: 40, step: 2 },
			{ image: '/posters/urban/womanprotests.jpg', angle: 55, step: 2.2 }
		]
	},
	{
		id: 'nature',
		label: 'Nature',
		lens: 2,
		posters: [{ image: '/posters/nature/GIRAFE.jpg', angle: 0, step: 1 }]
	}
];

export const getShowcaseCategory = (id: string) =>
	showcaseCategories.find((category) => category.id === id);

export const getCategoryForLens = (lens: number) =>
	showcaseCategories.find((category) => category.lens === lens);
