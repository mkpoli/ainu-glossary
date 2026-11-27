import { afterEach, beforeEach, describe, expect, it, setSystemTime } from 'bun:test';
import type { Entry, Sheet } from '$lib/data';
import { fakeBucket } from './fake-bucket';
import { getGlossary, invalidateGlossary, REVALIDATE_MS } from './glossary';

const SHEETS: Sheet[] = [{ isContent: true, sheetName: 'basic', description: '', count: 1, id: 0 }];
const TABLE: Entry[] = [{ Aynu: 'kamuy', 日本語: '神', English: 'god', sheetName: 'basic' }];
const UPDATED: Entry[] = [...TABLE, { Aynu: 'cep', 日本語: '魚', English: 'fish', sheetName: 'basic' }];

const START = new Date('2026-01-01T00:00:00Z');

function seeded() {
	return fakeBucket({ 'table.json': TABLE, 'sheets.json': SHEETS });
}

function advance(ms: number) {
	setSystemTime(new Date(Date.now() + ms));
}

beforeEach(() => {
	setSystemTime(START);
	invalidateGlossary();
});

afterEach(() => {
	setSystemTime();
});

describe('getGlossary', () => {
	it('loads the table, sheets, and upload time from the bucket', async () => {
		const { bucket } = seeded();
		const glossary = await getGlossary(bucket);
		expect(glossary.table).toEqual(TABLE);
		expect(glossary.sheets).toEqual(SHEETS);
		expect(glossary.lastModified).toEqual(START);
		expect(glossary.index(['ain']).search('kamuy')).toHaveLength(1);
	});

	it('reuses one build, and one index per language set, between checks', async () => {
		const { bucket, calls } = seeded();
		const first = await getGlossary(bucket);
		advance(REVALIDATE_MS - 1);
		const second = await getGlossary(bucket);
		expect(second).toBe(first);
		expect(second.index(['ja'])).toBe(first.index(['ja']));
		expect(calls).toEqual({ get: 2, head: 0, put: 0 });
	});

	it('runs independent R2 reads for concurrent cold requests without sharing I/O promises', async () => {
		const { bucket, calls } = seeded();
		const [first, second] = await Promise.all([getGlossary(bucket), getGlossary(bucket)]);
		expect(first.table).toEqual(TABLE);
		expect(second.table).toEqual(TABLE);
		expect(calls.get).toBe(4);
		// Subsequent requests reuse the settled build without touching R2.
		expect(await getGlossary(bucket)).toBe(second);
		expect(calls.get).toBe(4);
	});

	it('keeps the build when the stored objects are unchanged after the interval', async () => {
		const { bucket, calls } = seeded();
		const first = await getGlossary(bucket);
		advance(REVALIDATE_MS);
		expect(await getGlossary(bucket)).toBe(first);
		expect(calls).toEqual({ get: 2, head: 2, put: 0 });

		// The check restarts the interval.
		advance(REVALIDATE_MS - 1);
		await getGlossary(bucket);
		expect(calls.head).toBe(2);
	});

	it('rebuilds once the stored table changes', async () => {
		const store = seeded();
		const first = await getGlossary(store.bucket);
		store.set('table.json', UPDATED);

		expect(await getGlossary(store.bucket)).toBe(first);

		advance(REVALIDATE_MS);
		const second = await getGlossary(store.bucket);
		expect(second.table).toEqual(UPDATED);
		expect(second.index(['ain']).search('cep')).toHaveLength(1);
		expect(store.calls.get).toBe(4);
	});

	it('rebuilds when only the sheet list changes', async () => {
		const store = seeded();
		await getGlossary(store.bucket);
		store.set('sheets.json', []);
		advance(REVALIDATE_MS);
		expect((await getGlossary(store.bucket)).sheets).toEqual([]);
	});

	it('serves the previous build while the bucket is failing', async () => {
		const store = seeded();
		const first = await getGlossary(store.bucket);
		store.set('table.json', UPDATED);
		store.fail(new Error('R2 unavailable'));
		advance(REVALIDATE_MS);
		expect(await getGlossary(store.bucket)).toBe(first);

		store.fail();
		advance(REVALIDATE_MS);
		expect((await getGlossary(store.bucket)).table).toEqual(UPDATED);
	});

	it('rejects a cold load when an object is missing, then recovers', async () => {
		const store = fakeBucket({ 'sheets.json': SHEETS });
		expect(getGlossary(store.bucket)).rejects.toThrow('Glossary bucket has no table.json');
		await Promise.resolve();
		store.set('table.json', TABLE);
		expect((await getGlossary(store.bucket)).table).toEqual(TABLE);
	});
});

describe('invalidateGlossary', () => {
	it('forces the next request to download again', async () => {
		const store = seeded();
		await getGlossary(store.bucket);
		store.set('table.json', UPDATED);
		invalidateGlossary();
		expect((await getGlossary(store.bucket)).table).toEqual(UPDATED);
	});

	it('keeps a build that started earlier out of the cache', async () => {
		const store = seeded();
		const early = getGlossary(store.bucket);
		invalidateGlossary();
		store.set('table.json', UPDATED);
		expect((await early).table).toEqual(TABLE);
		expect((await getGlossary(store.bucket)).table).toEqual(UPDATED);
	});
});
