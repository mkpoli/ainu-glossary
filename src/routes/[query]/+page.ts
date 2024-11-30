import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { fetchData } from '$lib/data';
import { pickRandom, SearchIndex } from '$lib/search';

export const load: PageLoad = async ({ params: { query }, fetch }) => {
	const { table, sheets } = await fetchData(fetch);

	const searchIndex = new SearchIndex(table, ['ain', 'en', 'ja', 'zh']);
	const found = searchIndex.search(query);

	if (!found.length) {
		error(404, {
			message: 'Not found',
			other: pickRandom(table),
			sheets
		});
	}

	return {
		found,
		sheets,
		query
	};
};
