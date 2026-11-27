import { fetchData, GLOSSARY_CACHE_CONTROL } from '$lib/data';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, setHeaders }) => {
	setHeaders({
		'Cache-Control': GLOSSARY_CACHE_CONTROL
	});
	const { table, sheets } = await fetchData(fetch);
	return {
		table,
		sheets
	};
};
