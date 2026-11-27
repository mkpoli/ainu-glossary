import 'unplugin-icons/types/svelte';
import '@types/nodes';
import type { R2Bucket } from '@cloudflare/workers-types';
// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		interface Error {
			other?: Entry[];
			sheets?: Sheet[];
		}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		interface Platform {
			env: {
				ASSETS: { fetch: typeof fetch };
				/** Holds `table.json` and `sheets.json`, the glossary exported from the spreadsheet. */
				GLOSSARY_BUCKET: R2Bucket;
				/** Secret shared with trusted callers to trigger a data refresh. */
				ADMIN_KEY: string;
			};
		}
	}
}

export {};
