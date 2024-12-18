import { isPlaceholderLike, removePlaceholders } from './placeholder';
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

describe('removePlaceholders', () => {
	it('should remove placeholder-like strings from a string', () => {
		expect(removePlaceholders('V1 aenuwapto ononno!')).toBe('aenuwapto ononno!');
		expect(removePlaceholders('N1 aenuwapto ononno!')).toBe('aenuwapto ononno!');
		expect(removePlaceholders('YYYY aenuwapto ononno!')).toBe('aenuwapto ononno!');
		expect(removePlaceholders('MM aenuwapto ononno!')).toBe('aenuwapto ononno!');
		expect(removePlaceholders('DD aenuwapto ononno!')).toBe('aenuwapto ononno!');
		expect(removePlaceholders('HH aenuwapto ononno!')).toBe('aenuwapto ononno!');
		expect(removePlaceholders('SS aenuwapto ononno!')).toBe('aenuwapto ononno!');
	});
});
