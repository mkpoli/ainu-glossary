import { fetchData } from '$lib/data';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
	const data = await fetchData(fetch);
	return {
		table: data
	};
};
