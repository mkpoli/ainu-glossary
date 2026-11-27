import type { Entry, Sheet } from '$lib/data';
import { dataVersion, downloadData, type GlossaryBucket } from '$lib/server/data';
import { SearchIndex, type Language } from '$lib/search';

/** How long a built glossary is served before its R2 ETags are checked again. */
export const REVALIDATE_MS = 5 * 60 * 1000;

export interface Glossary {
	table: Entry[];
	sheets: Sheet[];
	lastModified: Date;
	index: (langs: Language[]) => SearchIndex;
}

interface Build {
	glossary: Glossary;
	version: string;
}

let cached: (Build & { checked: number }) | undefined;
// Bumped on invalidation so a build that started before it cannot repopulate the cache.
let generation = 0;

async function build(bucket: GlossaryBucket): Promise<Build> {
	const { table, sheets, lastModified, version } = await downloadData(bucket);
	const augmented = SearchIndex.augmentTable(table);
	const indices = new Map<string, SearchIndex>();
	return {
		version,
		glossary: {
			table,
			sheets,
			lastModified,
			index(langs) {
				const key = langs.join(',');
				let index = indices.get(key);
				if (!index) {
					index = new SearchIndex(augmented, langs);
					indices.set(key, index);
				}
				return index;
			}
		}
	};
}

async function refresh(bucket: GlossaryBucket, previous: Build | undefined): Promise<Build> {
	if (!previous) {
		return build(bucket);
	}
	try {
		// Unchanged ETags mean the parsed table and its search indexes are still current.
		if ((await dataVersion(bucket)) === previous.version) {
			return previous;
		}
		return await build(bucket);
	} catch (e) {
		console.error('[glossary] Refresh failed; serving the previous build', e);
		return previous;
	}
}

export async function getGlossary(bucket: GlossaryBucket): Promise<Glossary> {
	if (cached && Date.now() - cached.checked < REVALIDATE_MS) {
		return cached.glossary;
	}
	// Each request awaits its own R2 I/O: sharing an in-flight promise across requests fails in
	// Cloudflare Workers with a cross-request I/O error. Settled builds remain shared in `cached`.
	const started = generation;
	const { glossary, version } = await refresh(bucket, cached);
	if (started === generation) {
		cached = { glossary, version, checked: Date.now() };
	}
	return glossary;
}

export function invalidateGlossary(): void {
	generation += 1;
	cached = undefined;
}
