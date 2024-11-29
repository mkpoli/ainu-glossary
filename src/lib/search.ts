import Fuse, { type FuseResult } from 'fuse.js';

import type { Entry } from './data';
import { latn2kana } from './script.svelte';
import { isPlaceholderLike, segment } from './segment';

export type Language = 'ain' | 'en' | 'ja' | 'zh';

export function search(
	query: string,
	languages: Language[],
	table: Entry[],
	threshold = 0.3
): FuseResult<Entry>[] {
	let augmentedTable = table;
	if (languages.includes('ain')) {
		augmentedTable = augmentedTable.map((entry) => ({
			...entry,
			カナ: segment(entry.Aynu ?? '', 'ain')
				.filter(
					({ segment }) =>
						!isPlaceholderLike(segment) && !segment.split('=').some(isPlaceholderLike)
				)
				.map(({ segment }) => latn2kana(segment))
				.join('')
		}));
	}

	const fuse = new Fuse(augmentedTable, {
		includeScore: true,
		includeMatches: true,
		threshold,
		keys: languages.flatMap(
			(lang) =>
				({
					ain: ['Aynu', 'カナ'],
					ja: ['日本語'],
					en: ['English'],
					zh: ['中文']
				})[lang] ?? []
		)
	});

	return fuse.search(query);
}
