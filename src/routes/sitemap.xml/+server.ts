import type { RequestHandler } from './$types';

const publicPaths = ['/', '/showcase/nature', '/showcase/urban', '/contact'];

export const GET: RequestHandler = ({ url }) => {
	const urls = publicPaths
		.map((path) => `\t<url>\n\t\t<loc>${new URL(path, url.origin)}</loc>\n\t</url>`)
		.join('\n');

	return new Response(
		`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
		{
			headers: {
				'content-type': 'application/xml; charset=utf-8',
				'cache-control': 'public, max-age=3600'
			}
		}
	);
};
