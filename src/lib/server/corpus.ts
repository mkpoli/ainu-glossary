import { latn2kana } from '$lib/kana';

export interface Example {
	id: string;
	text: string;
	translation: string | null;
	source: string;
	uri: string | null;
}

interface CorpusResponse {
	api_version: string;
	data: Array<{
		id: string;
		text: string;
		translation: string | null;
		dialect: string | null;
		author: string | null;
		collection: string | null;
		document: string | null;
		uri: string | null;
		source_slug: string | null;
	}>;
}

const CORPUS_SEARCH_URL = 'https://corpus.aynu.org/v1/search';

/**
 * Reduce an entry's Aynu text to the single expression to look up in the corpus.
 * Variant lists ("Ikatay, Isiorore, Irankarapte, ...") are split on comma,
 * semicolon or slash. When `query` (the word the visitor actually searched for)
 * is given, the variant matching it — by exact text or by its kana reading —
 * is preferred; otherwise the first variant is used.
 */
export function deriveExampleExpr(raw: string, query?: string): string {
	const variants = raw
		.split(/[,;/]/)
		.map((variant) => variant.trim())
		.filter(Boolean);
	if (!variants.length) {
		return '';
	}

	if (query) {
		const normalizedQuery = query.trim();
		const lowerQuery = normalizedQuery.toLowerCase();
		const match = variants.find(
			(variant) =>
				variant.toLowerCase() === lowerQuery || latn2kana(variant) === normalizedQuery
		);
		if (match) {
			return match;
		}
	}

	return variants[0];
}

/** Only plain web links from the corpus are rendered as anchors. */
function webUri(uri: string | null): string | null {
	if (!uri) return null;
	try {
		const { protocol } = new URL(uri);
		return protocol === 'https:' || protocol === 'http:' ? uri : null;
	} catch {
		return null;
	}
}

export async function fetchExamples(expr: string, fetchFn = fetch): Promise<Example[]> {
	const query = deriveExampleExpr(expr);
	if (!query || query.length > 60) {
		return [];
	}

	const url = new URL(CORPUS_SEARCH_URL);
	url.searchParams.set('q', query);
	url.searchParams.set('lang', 'any');
	url.searchParams.set('orthography', 'modern');
	url.searchParams.set('limit', '3');

	try {
		const response = await fetchFn(url, { signal: AbortSignal.timeout(1500) });
		if (!response.ok) {
			return [];
		}
		const { data }: CorpusResponse = await response.json();
		return data.map((entry) => ({
			id: entry.id,
			text: entry.text,
			translation: entry.translation,
			source: [entry.collection, entry.document, entry.author].filter(Boolean).join(' · '),
			uri: webUri(entry.uri)
		}));
	} catch {
		return [];
	}
}
