import Fuse, { type FuseResultMatch } from 'fuse.js';

import type { Entry } from './data';
import { latn2kana } from './script.svelte';
import { isPlaceholderLike, segment } from './segment';

export type Language = 'ain' | 'en' | 'ja' | 'zh';

export interface SearchResult {
	item: Entry;
	matches?: readonly FuseResultMatch[];
}

export class SearchIndex {
	private readonly fuse: Fuse<Entry>;
	private readonly table: Entry[];

	constructor(table: Entry[], languages: Language[], threshold = 0.3) {
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
		this.table = augmentedTable;
		this.fuse = new Fuse(augmentedTable, {
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
	}

	private static entryEquals(a: Entry, b: Entry): boolean {
		return (
			a.Aynu === b.Aynu && a.English === b.English && a.日本語 === b.日本語 && a.中文 === b.中文
		);
	}

	search(query: string, inside: Entry[] | undefined = undefined): SearchResult[] {
		if (!query) return this.table.map((item) => ({ item, matches: undefined }));
		return this.fuse
			.search(query)
			.filter((result) =>
				inside ? inside.some((item) => SearchIndex.entryEquals(item, result.item)) : true
			);
	}
}
