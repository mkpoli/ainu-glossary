import {
	isInSegment,
	getRelativeHighlightIndicesInRange,
	segmentWithHighlightIndices,
	segment,
	subdivideSegments,
	segmentAinu
} from './segment';
import { expect, it, describe } from 'bun:test';

describe('isInSegment', () => {
	it('should return true if the index is in the segment', () => {
		expect(isInSegment(1, [0, 2])).toBe(true);
		expect(isInSegment(0, [0, 2])).toBe(true);
		expect(isInSegment(2, [0, 2])).toBe(true);
		expect(isInSegment(3, [0, 2])).toBe(false);
		expect(isInSegment(-1, [0, 2])).toBe(false);
	});
});

describe('segment', () => {
	it('should return the correct segment', () => {
		expect(segment('Hello, world!', 'en')).toEqual([
			{ index: 0, input: 'Hello, world!', segment: 'Hello', isWordLike: true },
			{ index: 5, input: 'Hello, world!', segment: ',', isWordLike: false },
			{ index: 6, input: 'Hello, world!', segment: ' ', isWordLike: false },
			{ index: 7, input: 'Hello, world!', segment: 'world', isWordLike: true },
			{ index: 12, input: 'Hello, world!', segment: '!', isWordLike: false }
		]);
	});
});

describe('getRelativeHighlightIndicesInRange', () => {
	it('should return the range unchanged if it is in range for initial segment', () => {
		expect(getRelativeHighlightIndicesInRange([[3, 3]], { index: 0, segment: 'Hello' })).toEqual([
			[3, 3]
		]);
		expect(
			getRelativeHighlightIndicesInRange(
				[
					[0, 1],
					[3, 4]
				],
				{ index: 0, segment: 'Hello' }
			)
		).toEqual([
			[0, 1],
			[3, 4]
		]);
	});

	it('should return nothing if it is out of range', () => {
		expect(
			getRelativeHighlightIndicesInRange([[1, 2]], {
				index: 7,
				segment: 'Hello'
			})
		).toEqual([]);
		expect(
			getRelativeHighlightIndicesInRange([[5, 6]], {
				index: 0,
				segment: 'Hello'
			})
		).toEqual([]);
	});

	it('should return the relative range if it is in range for a segment', () => {
		expect(
			getRelativeHighlightIndicesInRange(
				[
					[8, 9],
					[11, 12]
				],
				{
					index: 7,
					segment: 'Hello'
				}
			)
		).toEqual([
			[1, 2],
			[4, 5]
		]);
	});

	it('should return the trimmed range if it is at the border', () => {
		expect(
			getRelativeHighlightIndicesInRange(
				[
					[0, 1],
					[3, 8]
				],
				{
					index: 0,
					segment: 'Hello'
				}
			)
		).toEqual([
			[0, 1],
			[3, 5]
		]);
	});

	it('should return the trimmed relative range if it is at the border of a non-initial segment', () => {
		expect(
			getRelativeHighlightIndicesInRange(
				[
					[3, 7], // "XXHel"
					[8, 10] // "lo, wo"
				],
				{
					index: 5, // "XXXXXHello, world!"
					segment: 'Hello'
				}
			)
		).toEqual([
			[0, 2],
			[3, 5]
		]);
	});
});

describe('subdivideSegments', () => {
	it('should return the correct subsegments', () => {
		expect(
			subdivideSegments({ index: 0, input: 'Hello, world!', segment: 'Hello' }, [[1, 2]])
		).toEqual([
			{ highlighted: false, content: 'H' },
			{ highlighted: true, content: 'el' },
			{ highlighted: false, content: 'lo' }
		]);
		expect(
			subdivideSegments(
				{
					index: 7,
					input: 'Hello, world!',
					segment: 'world'
				},
				[[0, 3]]
			)
		).toEqual([
			{ highlighted: true, content: 'worl' },
			{ highlighted: false, content: 'd' }
		]);
		expect(
			subdivideSegments(
				{
					index: 0,
					input: 'Highlight the world!',
					segment: 'Highlight'
				},
				[
					[0, 1],
					[3, 5],
					[7, 7]
					// 0 T, 1 T, 2 F, 3 T, 4 T, 5 T, 6 F, 7 T
					// [0, 1] T, [2, 2] F, [3, 5] T, [6, 6] F, [7, 7] T
				]
			)
		).toEqual([
			{ highlighted: true, content: 'Hi' },
			{ highlighted: false, content: 'g' },
			{ highlighted: true, content: 'hli' },
			{
				highlighted: false,
				content: 'g'
			},
			{
				highlighted: true,
				content: 'h'
			},
			{ highlighted: false, content: 't' }
		]);
	});
});

describe('segmentWithHighlightIndices', () => {
	it('should return the correct segments with highlights', () => {
		expect(
			segmentWithHighlightIndices('Hello, world!', 'en', [
				[3, 5], // "lo,"
				[7, 9], // "wor"
				[12, 12] // "!"
			])
		).toEqual([
			{
				segment: 'Hello',
				subsegments: [
					{ highlighted: false, content: 'Hel' },
					{ highlighted: true, content: 'lo' }
				]
			},
			{
				segment: ',',
				subsegments: [{ highlighted: true, content: ',' }]
			},
			{
				segment: ' ',
				subsegments: [
					{
						highlighted: false,
						content: ' '
					}
				]
			},
			{
				segment: 'world',
				subsegments: [
					{ highlighted: true, content: 'wor' },
					{ highlighted: false, content: 'ld' }
				]
			},
			{
				segment: '!',
				subsegments: [{ highlighted: true, content: '!' }]
			}
		]);
	});
});

describe('segmentAinu', () => {
	it('should return the correct segments', () => {
		expect(segmentAinu('aenuwapto ononno!')).toEqual([
			{ index: 0, input: 'aenuwapto ononno!', segment: 'aenuwapto', isWordLike: true },
			{ index: 9, input: 'aenuwapto ononno!', segment: ' ', isWordLike: false },
			{ index: 10, input: 'aenuwapto ononno!', segment: 'ononno', isWordLike: true },
			{ index: 16, input: 'aenuwapto ononno!', segment: '!', isWordLike: false }
		]);
	});
});
