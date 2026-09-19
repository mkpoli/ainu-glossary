import { deriveExampleExpr } from './corpus';
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
