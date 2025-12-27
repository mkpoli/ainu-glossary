import { fetchData } from '$lib/data';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, setHeaders }) => {
	setHeaders({
		'Cache-Control': 'public, max-age=3600, s-maxage=86400'
	});
	const { table, sheets } = await fetchData(fetch);
	return {
		table,
		sheets
	};
};
