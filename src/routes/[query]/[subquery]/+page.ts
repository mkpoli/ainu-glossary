import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { fetchData } from '$lib/data';
import { pickRandom, SearchIndex, type Language } from '$lib/search';

function isValidLanguage(lang: string): lang is 'en' | 'ja' | 'zh' {
	return ['en', 'ja', 'zh'].includes(lang);
}

export const load: PageLoad = async ({ params: { query, subquery }, fetch }) => {
	if (!isValidLanguage(query)) {
		error(404, 'Not found');
	}

	const { table, sheets } = await fetchData(fetch);

	const searchIndex = new SearchIndex(table, [query as Language]);
	const found = searchIndex.search(subquery);

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
