import { deriveExampleExpr, fetchExamples } from './corpus';
import { expect, it, describe } from 'bun:test';

describe('deriveExampleExpr', () => {
	it('returns a plain string as-is', () => {
		expect(deriveExampleExpr('sukup')).toBe('sukup');
	});

	it('picks the variant matching the query out of a comma-separated list', () => {
		expect(
			deriveExampleExpr('Ikatay, Isiorore, issorore, Irankarapte, Inankarapte, ikatay', 'irankarapte')
		).toBe('Irankarapte');
	});

	it('matches the query against a variant via its kana reading', () => {
		expect(deriveExampleExpr('Ikatay, Irankarapte', 'イランカラㇷ゚テ')).toBe('Irankarapte');
	});

	it('falls back to the first variant when nothing matches the query', () => {
		expect(deriveExampleExpr('Ikatay, Isiorore, Irankarapte', 'sukup')).toBe('Ikatay');
	});

	it('falls back to the first variant when no query is given', () => {
		expect(deriveExampleExpr('Ikatay, Isiorore, Irankarapte')).toBe('Ikatay');
	});
});

it('drops non-web source links', async () => {
	const fetchFn = (async () =>
		new Response(
			JSON.stringify({
				api_version: '1',
				data: [
					{ id: '1', text: 'a', translation: null, uri: 'javascript:alert(1)' },
					{ id: '2', text: 'b', translation: null, uri: 'https://example.org/x' }
				]
			})
		)) as unknown as typeof fetch;
	const examples = await fetchExamples('kamuy', fetchFn);
	expect(examples.map((e) => e.uri)).toEqual([null, 'https://example.org/x']);
});
