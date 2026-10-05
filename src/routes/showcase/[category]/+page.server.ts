import { error, redirect } from '@sveltejs/kit';
import { getShowcaseCategories } from '$lib/server/showcase-categories';

export const load = async ({ params }) => {
	if (params.category === 'nature' || params.category === 'urban') {
		redirect(307, '/showcase/all');
	}

	const categories = await getShowcaseCategories();
	const category = categories.find((candidate) => candidate.id === params.category);
	if (!category) error(404, 'Showcase category not found');

	return { category };
};
