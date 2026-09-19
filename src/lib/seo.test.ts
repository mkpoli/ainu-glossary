import { describe, expect, it } from 'bun:test';
import { entryPageTitle, entryPageDescription } from './seo';
import type { SearchResult } from './search';

function result(aynu: string, kana: string, ja?: string, en?: string): SearchResult {
	return {
		item: { Aynu: aynu, カナ: kana, 日本語: ja, English: en, sheetName: 'test' },
		refIndex: 0,
		segments: {} as SearchResult['segments'],
		hasHighlightedSegments: {} as SearchResult['hasHighlightedSegments']
	};
}

describe('entryPageTitle / entryPageDescription — ja', () => {
	it('single result', () => {
		const found = [result('iyairaikere', 'イヤイライケレ')];
		expect(entryPageTitle({ lang: 'ja', query: 'ありがとう', found })).toBe(
			'アイヌ語で「ありがとう」は iyairaikere（イヤイライケレ）｜Itak-uoeroskip'
		);
		expect(entryPageDescription({ lang: 'ja', query: 'ありがとう', found })).toBe(
			'「ありがとう」はアイヌ語で iyairaikere（イヤイライケレ）。現代アイヌ語対訳辞書 Itak-uoeroskip。'
		);
	});

	it('three results', () => {
		const found = [
			result('iyairaikere', 'イヤイライケレ'),
			result('hioy\'oy', 'ヒオヨイ'),
			result('nen an', 'ネンアン')
		];
		expect(entryPageDescription({ lang: 'ja', query: 'ありがとう', found })).toBe(
			"「ありがとう」はアイヌ語で iyairaikere（イヤイライケレ）。ほかに hioy'oy、nen an など3件の言い方も掲載。現代アイヌ語対訳辞書 Itak-uoeroskip。"
		);
	});
});

describe('entryPageTitle / entryPageDescription — en', () => {
	it('single result', () => {
		const found = [result('iyairaikere', 'イヤイライケレ')];
		expect(entryPageTitle({ lang: 'en', query: 'thank you', found })).toBe(
			'"thank you" in Ainu: iyairaikere (イヤイライケレ) | Itak-uoeroskip'
		);
		expect(entryPageDescription({ lang: 'en', query: 'thank you', found })).toBe(
			'"thank you" in Ainu is iyairaikere (イヤイライケレ). Itak-uoeroskip, a categorised Ainu glossary.'
		);
	});
});

describe('entryPageTitle / entryPageDescription — zh', () => {
	it('single result', () => {
		const found = [result('iyairaikere', 'イヤイライケレ')];
		expect(entryPageTitle({ lang: 'zh', query: '謝謝', found })).toBe(
			'「謝謝」的阿伊努語是 iyairaikere（イヤイライケレ）｜Itak-uoeroskip'
		);
		expect(entryPageDescription({ lang: 'zh', query: '謝謝', found })).toBe(
			'「謝謝」的阿伊努語是 iyairaikere（イヤイライケレ）。現代阿伊努語對譯詞典 Itak-uoeroskip。'
		);
	});
});

describe('entryPageTitle / entryPageDescription — headword page', () => {
	it('builds from the display form and the first result', () => {
		const found = [result('iyairaikere', 'イヤイライケレ', 'ありがとう', 'thank you')];
		expect(
			entryPageTitle({ lang: 'ain', query: 'iyairaikere', found, latn: 'iyairaikere', kana: 'イヤイライケレ' })
		).toBe('iyairaikere（イヤイライケレ）の意味 — アイヌ語 | Itak-uoeroskip');
		expect(
			entryPageDescription({
				lang: 'ain',
				query: 'iyairaikere',
				found,
				latn: 'iyairaikere',
				kana: 'イヤイライケレ'
			})
		).toBe('アイヌ語 iyairaikere（イヤイライケレ）：ありがとう / thank you。Itak-uoeroskip 現代アイヌ語対訳辞書。');
	});
});

describe('truncation', () => {
	it('truncates a long title by dropping the site suffix first', () => {
		const found = [
			result(
				'a-very-long-ainu-expression-that-exceeds-the-usual-title-length-by-quite-a-lot',
				'カナ'
			)
		];
		const title = entryPageTitle({ lang: 'en', query: 'a long English query phrase here', found });
		expect(title.length).toBeLessThanOrEqual(60);
		expect(title).not.toContain('Itak-uoeroskip');
	});

	it('truncates a long description at a boundary within 155 characters', () => {
		const found = [
			result('iyairaikere', 'イヤイライケレ'),
			result('hioy\'oy', 'ヒオヨイ'),
			result('nen an pe', 'ネンアンペ')
		];
		const description = entryPageDescription({
			lang: 'en',
			query: 'a fairly long English search query used to force truncation of the description',
			found
		});
		expect(description.length).toBeLessThanOrEqual(155);
	});
});

it('keeps apostrophes and person markers in the first variant', () => {
	const found = [
		{ item: { Aynu: 'hioy’oy, iyayraykere.', カナ: 'ヒオイオイ、イヤイライケレ。', 日本語: 'ありがとう', sheetName: 'x' }, refIndex: 0, segments: {}, hasHighlightedSegments: {} }
	] as unknown as Parameters<typeof entryPageTitle>[0]['found'];
	expect(entryPageTitle({ lang: 'ja', query: 'ありがとう', found })).toContain('hioy’oy（ヒオイオイ）');
	const one = [
		{ item: { Aynu: 'a=ramu', カナ: 'アラム', 日本語: '思う', sheetName: 'x' }, refIndex: 0, segments: {}, hasHighlightedSegments: {} }
	] as unknown as Parameters<typeof entryPageTitle>[0]['found'];
	expect(entryPageTitle({ lang: 'ja', query: '思う', found: one })).toContain('a=ramu（アラム）');
});

it('prefers the entry whose translation list holds the query as an exact item', () => {
	const mk = (Aynu: string, カナ: string, 日本語: string) =>
		({ item: { Aynu, カナ, 日本語, sheetName: 'x' }, refIndex: 0, segments: {}, hasHighlightedSegments: {} }) as unknown as SearchResult;
	const found = [
		mk('hap, hinna, hioy’oy', 'ハㇷ゚、ヒンナ、ヒオイオイ', 'ありがとう！'),
		mk('iyayraykere, iyayiraykere, ionkamire', 'イヤイライケレ、イヤイライケレ、イオンカミレ', 'ありがとう、感謝します、ありがとうございます')
	];
	expect(entryPageTitle({ lang: 'ja', query: 'ありがとう', found })).toContain('は iyayraykere（イヤイライケレ）');
	expect(entryPageDescription({ lang: 'ja', query: 'ありがとう', found })).toContain('ほかに hap, hinna, hioy’oy');
});
