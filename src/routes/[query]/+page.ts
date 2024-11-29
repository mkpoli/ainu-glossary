import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { fetchData, type Entry } from '$lib/data';

import Fuse, { type FuseResultMatch } from 'fuse.js';

export const load: PageLoad = async ({ params: { query }, fetch }) => {
	const { table, sheets } = await fetchData(fetch);

	const fuse = new Fuse(table, {
		includeScore: true,
		includeMatches: true,
		threshold: 0.3,
		keys: ['Aynu', 'English', '日本語']
	});

	const found = fuse.search(query) as {
		item: Entry;
		matches: readonly FuseResultMatch[] | undefined;
	}[];
	console.log(
		found.map(({ item, matches }) => ({ item: item.Aynu, matches: JSON.stringify(matches) }))
	);

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
