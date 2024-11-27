import { fetchData } from '$lib/data';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
	const { table, sheets } = await fetchData(fetch);
	return {
		table,
		sheets
	};
};
