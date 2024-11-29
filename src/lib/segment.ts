export function isInSegment(index: number, range: [number, number]): boolean {
	return index >= range[0] && index <= range[1];
}

export function segment(text: string, language: string): Intl.SegmentData[] {
	const segmenter = new Intl.Segmenter(language, { granularity: 'word' });
	return [...segmenter.segment(text)];
}

export function getRelativeHighlightIndicesInRange(
	highlightedIndices: [number, number][],
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

export function segmentWithHighlightIndices(
	text: string,
	language: string,
	highlightedIndices: [number, number][]
): {
	segment: string;
	subsegments: {
		highlighted: boolean;
		content: string;
	}[];
}[] {
	const segments = segment(text, language);
	return segments.map((s) => {
		const segmentHighlights = getRelativeHighlightIndicesInRange(highlightedIndices, s);
		return {
			segment: s.segment,
			subsegments: subdivideSegments(s, segmentHighlights)
		};
	});
}