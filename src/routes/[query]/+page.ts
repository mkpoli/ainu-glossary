import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { fetchData, type Entry } from '$lib/data';

export const load: PageLoad = async ({ params: { query }, fetch }) => {
	const data = await fetchData(fetch);

	const found: Entry[] = data.filter((item: any) =>
		[item.Aynu, item.English, item.日本語].join('').toLowerCase().includes(query.toLowerCase())
	);

	if (!found.length) {
		error(404, 'Not found');
	}

	return {
		found,
		query
	};
};
