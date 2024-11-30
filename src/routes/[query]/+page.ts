import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { fetchData, type Entry } from '$lib/data';
import { SearchIndex, type Language } from '$lib/search';

export const load: PageLoad = async ({ params: { query }, fetch }) => {
	const { table, sheets } = await fetchData(fetch);

	const searchIndex = new SearchIndex(table, ['ain', 'en', 'ja', 'zh']);
	const found = searchIndex.search(query);

	if (!found.length) {
		error(404, {
			message: 'Not found',
			other: table.sort(() => Math.random() - 0.5).slice(0, 5),
			sheets
		});
	}

	return {
		found,
		sheets,
		query
	};
};
