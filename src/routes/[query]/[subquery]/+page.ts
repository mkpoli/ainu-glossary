import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { fetchData, type Entry } from '$lib/data';
import Fuse, { type FuseResult } from 'fuse.js';

function isValidLanguage(lang: string): lang is 'en' | 'ja' | 'zh' {
	return ['en', 'ja', 'zh'].includes(lang);
}

export const load: PageLoad = async ({ params: { query, subquery }, fetch }) => {
	if (!isValidLanguage(query)) {
		error(404, 'Not found');
	}

	const { table, sheets } = await fetchData(fetch);

	const key = (
		{
			ja: '日本語',
			en: 'English',
			zh: '中文'
		} as const
	)[query];

	const fuse = new Fuse(table, {
		keys: [key],
		includeScore: true,
		includeMatches: true,
		threshold: 0.5
	});
	const found: FuseResult<Entry>[] = fuse.search(subquery);

	if (!found.length) {
		error(404, {
			message: 'Not found',
			other: table.sort(() => Math.random() - 0.5).slice(0, 5),
			sheets
		});
	}

	return {
		found,
		query,
		subquery,
		sheets
	};
};
