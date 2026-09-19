import type { SearchResult } from './search';

const SITE_SUFFIX_JA = '｜Itak-uoeroskip';
const SITE_SUFFIX_EN = ' | Itak-uoeroskip';

const TITLE_MAX = 60;
const DESCRIPTION_MAX = 155;

/**
 * First variant of a possibly comma-separated field. Only list separators split;
 * apostrophes (hioy’oy) and the person-marker `=` (a=ramu) belong to the word.
 */
function firstVariant(text: string | undefined): string {
	return (
		text
			?.split(/[,;/、；／]+/u)
			.map((variant) => variant.trim().replace(/[.。!！?？…]+$/u, ''))
			.filter(Boolean)
			.at(0) ?? ''
	);
}

function firstAynuSegment(aynu: string | undefined): string {
	return firstVariant(aynu);
}

function firstKanaSegment(kana: string | undefined): string {
	return firstVariant(kana);
}

/** Truncate to `max` characters at the nearest preceding word/punctuation boundary. */
function truncateAtBoundary(text: string, max: number): string {
	if (text.length <= max) return text;
	const slice = text.slice(0, max);
	const boundary = slice.match(/^[\s\S]*[\s、。，,.！？!?]/u);
	return (boundary ? boundary[0] : slice).trimEnd();
}

function truncateTitle(title: string, suffix: string): string {
	if (title.length <= TITLE_MAX) return title;
	if (title.endsWith(suffix)) {
		const withoutSuffix = title.slice(0, -suffix.length);
		if (withoutSuffix.length <= TITLE_MAX) return withoutSuffix;
		return truncateAtBoundary(withoutSuffix, TITLE_MAX);
	}
	return truncateAtBoundary(title, TITLE_MAX);
}

export type EntryPageLang = 'ja' | 'en' | 'zh';

interface TranslationParams {
	lang: EntryPageLang;
	query: string;
	found: readonly SearchResult[];
}

interface HeadwordParams {
	lang: 'ain';
	query: string;
	found: readonly SearchResult[];
	/** Display forms chosen by the page's own script logic. */
	latn: string;
	kana: string;
}

export type EntryPageParams = TranslationParams | HeadwordParams;

const FIELD_BY_LANG = { ja: '日本語', en: 'English', zh: '中文' } as const;

function listItems(field: string | undefined): string[] {
	return (field ?? '')
		.split(/[、,，;；/／]+/u)
		.map((item) => item.trim())
		.filter(Boolean);
}

function stripTrailingPunctuation(text: string): string {
	return text.replace(/[\s.。!！?？…]+$/u, '');
}

/**
 * Order results for the snippet: an entry whose translation list contains the
 * query as an exact item comes first (so ありがとう picks the entry glossed
 * 「ありがとう、感謝します」 over the one glossed 「ありがとう！」), then entries
 * matching once trailing punctuation is ignored, then the search order.
 */
export function orderForSnippet(
	lang: EntryPageLang,
	query: string,
	found: readonly SearchResult[]
): readonly SearchResult[] {
	const q = query.trim().toLowerCase();
	const qBare = stripTrailingPunctuation(q);
	const rank = (result: SearchResult): number => {
		const items = listItems(result.item[FIELD_BY_LANG[lang]]).map((item) => item.toLowerCase());
		if (items.includes(q)) return 0;
		if (items.some((item) => stripTrailingPunctuation(item) === qBare)) return 1;
		return 2;
	};
	return found
		.map((result, index) => ({ result, index, rank: rank(result) }))
		.sort((x, y) => x.rank - y.rank || x.index - y.index)
		.map(({ result }) => result);
}

export function entryPageTitle(params: EntryPageParams): string {
	if (params.lang === 'ain') {
		const { latn, kana } = params;
		return truncateTitle(`${latn}（${kana}）の意味 — アイヌ語 | Itak-uoeroskip`, SITE_SUFFIX_EN);
	}

	const { lang, query } = params;
	const found = orderForSnippet(lang, query, params.found);
	const a = firstAynuSegment(found[0]?.item.Aynu);
	const k = firstKanaSegment(found[0]?.item.カナ);

	switch (lang) {
		case 'ja':
			return truncateTitle(`アイヌ語で「${query}」は ${a}（${k}）｜Itak-uoeroskip`, SITE_SUFFIX_JA);
		case 'en':
			return truncateTitle(`"${query}" in Ainu: ${a} (${k}) | Itak-uoeroskip`, SITE_SUFFIX_EN);
		case 'zh':
			return truncateTitle(`「${query}」的阿伊努語是 ${a}（${k}）｜Itak-uoeroskip`, SITE_SUFFIX_JA);
	}
}

export function entryPageDescription(params: EntryPageParams): string {
	if (params.lang === 'ain') {
		const { found, latn, kana } = params;
		const j = found[0]?.item.日本語;
		const e = found[0]?.item.English;
		const description =
			`アイヌ語 ${latn}（${kana}）：${j ?? ''}` +
			(e ? ` / ${e}` : '') +
			`。Itak-uoeroskip 現代アイヌ語対訳辞書。`;
		return truncateAtBoundary(description, DESCRIPTION_MAX);
	}

	const { lang, query } = params;
	const found = orderForSnippet(lang, query, params.found);
	const a = firstAynuSegment(found[0]?.item.Aynu);
	const k = firstKanaSegment(found[0]?.item.カナ);
	const n = found.length;
	const b = found[1]?.item.Aynu ?? '';
	const c = found[2]?.item.Aynu ?? '';

	let description: string;
	switch (lang) {
		case 'ja':
			description =
				`「${query}」はアイヌ語で ${a}（${k}）。` +
				(n > 1 ? `ほかに ${[b, c].filter(Boolean).join('、')} など${n}件の言い方も掲載。` : '') +
				`現代アイヌ語対訳辞書 Itak-uoeroskip。`;
			break;
		case 'en':
			description =
				`"${query}" in Ainu is ${a} (${k}).` +
				(n > 1
					? ` Also ${[b, c].filter(Boolean).join(', ')} — ${n} expressions listed.`
					: '') +
				` Itak-uoeroskip, a categorised Ainu glossary.`;
			break;
		case 'zh':
			description =
				`「${query}」的阿伊努語是 ${a}（${k}）。` +
				(n > 1 ? `另收錄 ${[b, c].filter(Boolean).join('、')} 等${n}種說法。` : '') +
				`現代阿伊努語對譯詞典 Itak-uoeroskip。`;
			break;
	}
	return truncateAtBoundary(description, DESCRIPTION_MAX);
}
