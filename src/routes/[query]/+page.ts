import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { fetchData, type Entry } from '$lib/data';

export const load: PageLoad = async ({ params: { query }, fetch }) => {
	const { table, sheets } = await fetchData(fetch);

	const found: Entry[] = table.filter((item: any) =>
		[item.Aynu, item.English, item.日本語].join('').toLowerCase().includes(query.toLowerCase())
	);

	if (!found.length) {
		error(404, 'Not found');
	}

	return {
		found,
		sheets,
		query
	};
};
