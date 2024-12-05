import Fuse, { type FuseResultMatch } from 'fuse.js';
import * as WanaKana from 'wanakana';
import * as cjkConv from 'cjk-conv';
import type { Entry } from './data';
import { latn2kana } from './script.svelte';
import { isPlaceholderLike, segment, segmentWithHighlightIndices, type Segment } from './segment';
import groupBy from 'object.groupby';

export type Language = 'ain' | 'en' | 'ja' | 'zh';
export type AugmentedLanguage = Language | 'ain-Kana';

export interface SearchResult {
	item: AugmentedEntry;
	// matches?: readonly FuseResultMatch[];
	refIndex: number;
	segments: Record<AugmentedLanguage, readonly Segment[]>;
	hasHighlightedSegments: Record<AugmentedLanguage, boolean>;
}

export type AugmentedEntry = Entry & {
	カナ?: string;
	ひら?: string;
	简体?: string;
};

export class SearchIndex {
	private readonly fuse: Fuse<AugmentedEntry>;
	private readonly table: AugmentedEntry[];

	constructor(table: Entry[], languages: Language[], threshold = 0.3) {
		const augmentedTable: AugmentedEntry[] = table.map((entry) => {
			const カナ = segment(entry.Aynu ?? '', 'ain')
				.map(({ segment }) => {
					if (isPlaceholderLike(segment)) {
						return segment;
					}
					if (segment.includes('=')) {
						return segment
							.split('=')
							.map((s) => (isPlaceholderLike(s) ? s : latn2kana(s)))
							.join('=');
					}
					return latn2kana(segment);
				})
				.join('')
				.replace(/, /g, '、')
				.replace(/\.\.\./g, '…')
				.replace(/\.[$ ]/g, '。');
			return {
				...entry,
				カナ,
				ひら: WanaKana.toHiragana(カナ),
				简体: cjkConv.cjk2zhs(entry.中文 ?? '')
			};
		});
		this.table = augmentedTable;
		this.fuse = new Fuse(augmentedTable, {
			includeScore: true,
			includeMatches: true,
			threshold,
			keys: languages.flatMap(
				(lang) =>
					({
						ain: ['Aynu', 'カナ', 'ひら'],
						ja: ['日本語'],
						en: ['English'],
						zh: ['中文', '简体']
					})[lang] ?? []
			)
		});
	}

	private static entryEquals(a: Entry, b: Entry): boolean {
		return (
			a.Aynu === b.Aynu && a.English === b.English && a.日本語 === b.日本語 && a.中文 === b.中文
		);
	}

	search(query: string, inside: AugmentedEntry[] | undefined = undefined): SearchResult[] {
		if (!query)
			return (inside ?? this.table).map((item, index) => ({
				item,
				// matches: undefined,
				refIndex: index,
				segments: {
					ain: segment(item.Aynu ?? '', 'ain').map(({ segment }) => ({
						segment,
						subsegments: [
							{
								highlighted: false,
								content: segment
							}
						]
					})),
					'ain-Kana': segment(item.カナ ?? '', 'ain-Kana').map(({ segment }) => ({
						segment,
						subsegments: [
							{
								highlighted: false,
								content: segment
							}
						]
					})),
					en: segment(item.English ?? '', 'en').map(({ segment }) => ({
						segment,
						subsegments: [
							{
								highlighted: false,
								content: segment
							}
						]
					})),
					ja: segment(item.日本語 ?? '', 'ja').map(({ segment }) => ({
						segment,
						subsegments: [
							{
								highlighted: false,
								content: segment
							}
						]
					})),
					zh: segment(item.中文 ?? '', 'zh').map(({ segment }) => ({
						segment,
						subsegments: [
							{
								highlighted: false,
								content: segment
							}
						]
					}))
				},
				hasHighlightedSegments: {
					ain: false,
					'ain-Kana': false,
					en: false,
					ja: false,
					zh: false
				}
			}));

		return this.fuse
			.search(query.normalize('NFKC'))
			.filter((result) =>
				inside ? inside.some((item) => SearchIndex.entryEquals(item, result.item)) : true
			)
			.map((result) => {
				const highlights = groupBy(
					result.matches?.map(({ indices, key }) => ({ indices, key })) ?? [],
					(match) => match.key ?? ''
				) as Record<
					'Aynu' | '日本語' | 'English' | '中文' | 'カナ' | 'ひら' | '简体',
					readonly { indices: readonly [number, number][]; key: string | undefined }[] | undefined
				>;

				return {
					...result,
					segments: {
						ain: segmentWithHighlightIndices(
							result.item.Aynu ?? '',
							'ain',
							highlights.Aynu?.flatMap(({ indices }) => indices) ?? []
						),
						'ain-Kana': segmentWithHighlightIndices(result.item.カナ ?? '', 'ain-Kana', [
							...(highlights.カナ?.flatMap(({ indices }) => indices) ?? []),
							...(highlights.ひら?.flatMap(({ indices }) => indices) ?? [])
						]),
						en: segmentWithHighlightIndices(
							result.item.English ?? '',
							'en',
							highlights.English?.flatMap(({ indices }) => indices) ?? []
						),
						ja: segmentWithHighlightIndices(
							result.item.日本語 ?? '',
							'ja',
							highlights.日本語?.flatMap(({ indices }) => indices) ?? []
						),
						zh: segmentWithHighlightIndices(result.item.中文 ?? '', 'zh', [
							...(highlights.中文?.flatMap(({ indices }) => indices) ?? []),
							...(highlights.简体?.flatMap(({ indices }) => indices) ?? [])
						])
					},
					hasHighlightedSegments: {
						ain: !!highlights.Aynu,
						'ain-Kana': !!highlights.カナ,
						en: !!highlights.English,
						ja: !!highlights.日本語,
						zh: !!highlights.中文
					}
				};
			});
	}
}

export function pickRandom(table: readonly Entry[], count: number = 5): SearchResult[] {
	return table
		.toSorted(() => Math.random() - 0.5)
		.slice(0, count)
		.map((item, index) => {
			const kana = segment(item.Aynu ?? '', 'ain')
				.filter(
					({ segment }) =>
						!isPlaceholderLike(segment) && !segment.split('=').some(isPlaceholderLike)
				)
				.map(({ segment }) => latn2kana(segment))
				.join('');
			return {
				item,
				refIndex: index,
				segments: {
					ain: segment(item.Aynu ?? '', 'ain').map(({ segment }) => ({
						segment,
						subsegments: [
							{
								highlighted: false,
								content: segment
							}
						]
					})),
					'ain-Kana': segment(kana, 'ain-Kana').map(({ segment }) => ({
						segment,
						subsegments: [
							{
								highlighted: false,
								content: segment
							}
						]
					})),
					en: segment(item.English ?? '', 'en').map(({ segment }) => ({
						segment,
						subsegments: [
							{
								highlighted: false,
								content: segment
							}
						]
					})),
					ja: segment(item.日本語 ?? '', 'ja').map(({ segment }) => ({
						segment,
						subsegments: [
							{
								highlighted: false,
								content: segment
							}
						]
					})),
					zh: segment(item.中文 ?? '', 'zh').map(({ segment }) => ({
						segment,
						subsegments: [
							{
								highlighted: false,
								content: segment
							}
						]
					}))
				},
				hasHighlightedSegments: {
					ain: false,
					'ain-Kana': false,
					en: false,
					ja: false,
					zh: false
				}
			} satisfies SearchResult;
		});
}
