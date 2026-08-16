import { error } from '@sveltejs/kit';
import { getShowcaseCategories } from '$lib/server/showcase-categories';

export const load = async ({ params }) => {
	const categories = await getShowcaseCategories();
	const category = categories.find((candidate) => candidate.id === params.category);
	if (!category) error(404, 'Lens selector category not found');

	return { category, categories };
};
