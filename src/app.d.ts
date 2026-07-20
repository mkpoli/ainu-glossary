import 'unplugin-icons/types/svelte';
import '@types/nodes';
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
				/** Secret shared with trusted callers to trigger a data refresh. */
				ADMIN_KEY: string;
			};
		}
	}
}

export {};
