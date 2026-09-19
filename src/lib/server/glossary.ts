import type { Entry, Sheet } from '$lib/data';
import { downloadData } from '$lib/server/data';
import { SearchIndex, type Language } from '$lib/search';

const TTL_MS = 60 * 60 * 1000;

interface Glossary {
	table: Entry[];
	sheets: Sheet[];
	index: (langs: Language[]) => SearchIndex;
}

let cached: { glossary: Glossary; expires: number } | undefined;
let pending: Promise<Glossary> | undefined;

async function build(): Promise<Glossary> {
	const { table, sheets } = await downloadData();
	const indices = new Map<string, SearchIndex>();
	return {
		table,
		sheets,
		index(langs) {
			const key = langs.join(',');
			let index = indices.get(key);
			if (!index) {
				index = new SearchIndex(table, langs);
				indices.set(key, index);
			}
			return index;
		}
	};
}

export function getGlossary(): Promise<Glossary> {
	const now = Date.now();
	if (cached && cached.expires > now) {
		return Promise.resolve(cached.glossary);
	}
	if (!pending) {
		pending = build()
			.then((glossary) => {
				cached = { glossary, expires: Date.now() + TTL_MS };
				return glossary;
			})
			.finally(() => {
				pending = undefined;
			});
	}
	return pending;
}

export function invalidateGlossary(): void {
	cached = undefined;
}
