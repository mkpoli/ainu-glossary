import { isPlaceholderLike } from './placeholder';
import { expect, it, describe } from 'bun:test';

describe('isPlaceholderLike', () => {
	it('should return true for placeholder-like strings', () => {
		expect(isPlaceholderLike('V1')).toBe(true);
		expect(isPlaceholderLike('N1')).toBe(true);
		expect(isPlaceholderLike('YYYY')).toBe(true);
		expect(isPlaceholderLike('MM')).toBe(true);
		expect(isPlaceholderLike('DD')).toBe(true);
		expect(isPlaceholderLike('HH')).toBe(true);
		expect(isPlaceholderLike('SS')).toBe(true);
		expect(isPlaceholderLike('a')).toBe(false);
		expect(isPlaceholderLike('Hello')).toBe(false);
	});
});
