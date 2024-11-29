import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { fetchData } from '$lib/data';
import { search } from '$lib/search';

function isValidLanguage(lang: string): lang is 'en' | 'ja' | 'zh' {
	return ['en', 'ja', 'zh'].includes(lang);
}

export const load: PageLoad = async ({ params: { query, subquery }, fetch }) => {
	if (!isValidLanguage(query)) {
		error(404, 'Not found');
	}

	const { table, sheets } = await fetchData(fetch);

	const found = search(subquery, [query], table, 0.5);

	if (!found.length) {
		error(404, {
			message: 'Not found',
			other: table.sort(() => Math.random() - 0.5).slice(0, 5),
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
