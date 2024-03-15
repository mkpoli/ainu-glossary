import type { PageLoad } from './$types';

export const load: PageLoad = async (context) => {
	const { fetch } = context;
	const res = await fetch('/api/gdoc');
	const json = await res.json();
	return {
		table: json
	};
};
