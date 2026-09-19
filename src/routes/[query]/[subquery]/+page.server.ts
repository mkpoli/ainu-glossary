import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getGlossary } from '$lib/server/glossary';
import { pickRandom, type Language } from '$lib/search';

function isValidLanguage(lang: string): lang is 'en' | 'ja' | 'zh' {
	return ['en', 'ja', 'zh'].includes(lang);
}

export const load: PageServerLoad = async ({ params: { query, subquery }, setHeaders }) => {
	if (!isValidLanguage(query)) {
		error(404, 'Not found');
	}

	setHeaders({
		'Cache-Control': 'public, max-age=3600, s-maxage=86400'
	});
	const { table, sheets, index } = await getGlossary();

	const found = index([query as Language]).search(subquery);

	if (!found.length) {
		error(404, {
			message: 'Not found',
			other: pickRandom(table),
			sheets
		});
	}

	return {
		found,
		query,
		subquery,
		sheets
	};
};
