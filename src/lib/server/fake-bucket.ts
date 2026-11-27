import type { GlossaryBucket } from './data';

interface StoredObject {
	body: string;
	etag: string;
	uploaded: Date;
	contentType?: string;
}

/** In-memory stand-in for the `GLOSSARY_BUCKET` binding that records how it is used. */
export function fakeBucket(initial: Record<string, unknown> = {}) {
	const objects = new Map<string, StoredObject>();
	const calls = { get: 0, head: 0, put: 0 };
	let revision = 0;
	let failure: Error | undefined;

	function write(key: string, body: string, contentType?: string) {
		revision += 1;
		objects.set(key, { body, etag: `etag-${revision}`, uploaded: new Date(), contentType });
	}

	function read(key: string): StoredObject | null {
		if (failure) {
			throw failure;
		}
		return objects.get(key) ?? null;
	}

	for (const [key, value] of Object.entries(initial)) {
		write(key, JSON.stringify(value));
	}

	const bucket = {
		async head(key: string) {
			calls.head += 1;
			const object = read(key);
			return object && { etag: object.etag, uploaded: object.uploaded };
		},
		async get(key: string) {
			calls.get += 1;
			const object = read(key);
			return (
				object && {
					etag: object.etag,
					uploaded: object.uploaded,
					json: async () => JSON.parse(object.body)
				}
			);
		},
		async put(key: string, body: string, options?: { httpMetadata?: { contentType?: string } }) {
			calls.put += 1;
			write(key, body, options?.httpMetadata?.contentType);
			return null;
		}
	} as unknown as GlossaryBucket;

	return {
		bucket,
		calls,
		objects,
		set(key: string, value: unknown) {
			write(key, JSON.stringify(value));
		},
		/** Makes every read throw until called again with no error. */
		fail(error?: Error) {
			failure = error;
		}
	};
}
