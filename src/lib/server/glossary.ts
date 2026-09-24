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
// Bumped on invalidation so a build that started before it cannot repopulate the cache.
let generation = 0;

async function build(): Promise<Glossary> {
	const { table, sheets } = await downloadData();
	const augmented = SearchIndex.augmentTable(table);
	const indices = new Map<string, SearchIndex>();
	return {
		table,
		sheets,
		index(langs) {
			const key = langs.join(',');
			let index = indices.get(key);
			if (!index) {
				index = new SearchIndex(augmented, langs);
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
		const started = generation;
		const promise = build()
			.then((glossary) => {
				if (started === generation) {
					cached = { glossary, expires: Date.now() + TTL_MS };
				}
				return glossary;
			})
			.finally(() => {
				if (pending === promise) {
					pending = undefined;
				}
			});
		pending = promise;
	}
	return pending;
}

export function invalidateGlossary(): void {
	generation += 1;
	cached = undefined;
	pending = undefined;
}
