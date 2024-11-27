import { fetchData } from '$lib/data';
import type { PageLoad } from './$types';

export const load: PageLoad = async (context) => {
	const data = await fetchData();
	return {
		table: data
	};
};
