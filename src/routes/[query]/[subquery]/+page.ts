import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { fetchData, type Entry } from '$lib/data';

function isValidLanguage(lang: string): lang is 'en' | 'ja' | 'zh' {
	return ['en', 'ja', 'zh'].includes(lang);
}

export const load: PageLoad = async ({ params: { query, subquery }, fetch }) => {
	if (!isValidLanguage(query)) {
		error(404, 'Not found');
	}

	const json = await fetchData();

	const key = (
		{
			ja: '日本語',
			en: 'English',
			zh: '中文'
		} as const
	)[query];

	const found: Entry[] = json.filter((item) => item[key]?.includes(subquery));

	return {
		found,
		query,
		subquery
	};
};
