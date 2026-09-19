import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getGlossary } from '$lib/server/glossary';
import { pickRandom } from '$lib/search';
import { fetchExamples, deriveExampleExpr } from '$lib/server/corpus';
import { removePlaceholders } from '$lib/placeholder';

export const load: PageServerLoad = async ({ params: { query }, setHeaders }) => {
	setHeaders({
		'Cache-Control': 'public, max-age=3600, s-maxage=86400'
	});
	const { table, sheets, index } = await getGlossary();

	const found = index(['ain', 'en', 'ja', 'zh']).search(query);

	if (!found.length) {
		error(404, {
			message: 'Not found',
			other: pickRandom(table),
			sheets
		});
	}

	const expr = deriveExampleExpr(
		removePlaceholders((found[0].segments.ain ?? []).map(({ segment }) => segment).join('')),
		query
	);

	return {
		found,
		sheets,
		query,
		expr,
		examples: await fetchExamples(expr)
	};
};
