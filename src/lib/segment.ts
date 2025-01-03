import { isPlaceholderLike } from './placeholder';

export function isInSegment(index: number, range: [number, number]): boolean {
	return index >= range[0] && index <= range[1];
}

export function isNonWordLike(text: string): boolean {
	return Boolean(text.match(/^[\p{P}\p{S}\s]+$/u));
}

export function segmentAinu(text: string): Intl.SegmentData[] {
	let length = 0;
	return text
		.split(/([\s,\{\}\?\-\(\)!]+)/u)
		.filter(Boolean)
		.map((segment) => {
			const result = {
				index: length,
				input: text,
				segment,
				isWordLike:
					isPlaceholderLike(segment) ||
					isNonWordLike(segment) ||
					Boolean(segment.match(/^[a-zA-Záíúéó='’]+$/))
			} as Intl.SegmentData;
			length += segment.length;
			return result;
		});
}

export function segmentKatakana(text: string): Intl.SegmentData[] {
	let length = 0;
	return text
		.split(/([\p{Script=Katakana}]+|[\p{P}\p{S}]+|[\p{L}\p{M}\p{N}]+)/u)
		.filter(Boolean)
		.map((segment) => {
			const result = {
				index: length,
				input: text,
				segment,
				isWordLike: Boolean(segment.match(/^[\p{Script=Katakana}]+$/u))
			} as Intl.SegmentData;
			length += segment.length;
			return result;
		});
}

export function segment(text: string, language: string): Intl.SegmentData[] {
	return language === 'ain'
		? segmentAinu(text)
		: language === 'ain-Kana'
			? segmentKatakana(text)
			: [...new Intl.Segmenter(language, { granularity: 'word' }).segment(text)];
}

export function getRelativeHighlightIndicesInRange(
	highlightedIndices: readonly [number, number][],
	segment: { index: number; segment: string }
): [number, number][] {
	return highlightedIndices
		.map(
			([start, end]) =>
				[
					Math.max(0, start - segment.index),
					Math.min(end - segment.index, segment.segment.length)
				] as [number, number]
		)
		.filter(([start, end]) => start < segment.segment.length && end >= 0);
}

export function subdivideSegments(
	segment: Intl.SegmentData,
	relativeHighlightIndices: [number, number][]
): {
	highlighted: boolean;
	content: string;
}[] {
	const subsegments = [];
	let lastIndex = -1;
	for (const [start, end] of relativeHighlightIndices) {
		if (start !== lastIndex + 1) {
			subsegments.push({
				highlighted: false,
				content: segment.segment.slice(lastIndex + 1, start)
			});
		}
		subsegments.push({ highlighted: true, content: segment.segment.slice(start, end + 1) });
		lastIndex = end;
	}
	if (lastIndex < segment.segment.length - 1) {
		subsegments.push({
			highlighted: false,
			content: segment.segment.slice(lastIndex + 1)
		});
	}
	return subsegments;
}

export interface Segment {
	segment: string;
	subsegments: {
		highlighted: boolean;
		content: string;
	}[];
}

export function segmentWithHighlightIndices(
	text: string,
	language: string,
	highlightedIndices: readonly [number, number][]
): Segment[] {
	const segments = segment(text, language);
	return segments.map((s) => {
		const segmentHighlights = getRelativeHighlightIndicesInRange(highlightedIndices, s);
		return {
			segment: s.segment,
			subsegments: subdivideSegments(s, segmentHighlights)
		};
	});
}
