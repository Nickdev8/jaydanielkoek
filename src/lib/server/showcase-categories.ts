import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { Poster, ShowcaseCategory } from '$lib/showcase/types';

const configPath = process.env.SHOWCASE_CATEGORIES_PATH ?? resolve(process.cwd(), 'showcase.categories.json');

const isPoster = (value: unknown): value is Poster => {
	if (!value || typeof value !== 'object') return false;
	const poster = value as Record<string, unknown>;
	return (
		typeof poster.image === 'string' &&
		typeof poster.angle === 'number' &&
		typeof poster.step === 'number'
	);
};

const isCategory = (value: unknown): value is ShowcaseCategory => {
	if (!value || typeof value !== 'object') return false;
	const category = value as Record<string, unknown>;
	return (
		typeof category.id === 'string' &&
		typeof category.label === 'string' &&
		typeof category.lens === 'number' &&
		Array.isArray(category.posters) &&
		category.posters.every(isPoster)
	);
};

export const getShowcaseCategories = async (): Promise<ShowcaseCategory[]> => {
	const source = await readFile(configPath, 'utf8');
	const categories: unknown = JSON.parse(source);
	if (!Array.isArray(categories) || !categories.every(isCategory)) {
		throw new Error(`Invalid showcase configuration: ${configPath}`);
	}

	return categories;
};
