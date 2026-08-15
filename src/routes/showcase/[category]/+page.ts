import { error } from '@sveltejs/kit';
import { getShowcaseCategory } from '$lib/showcase/categories';

export const load = ({ params }) => {
	const category = getShowcaseCategory(params.category);
	if (!category) error(404, 'Showcase category not found');

	return { category };
};
