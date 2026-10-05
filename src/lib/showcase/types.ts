export type Poster = {
	image: string;
	angle: number;
	step: number;
};

export type ShowcaseCategory = {
	id: string;
	label: string;
	posters: Poster[];
};
