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
		// interface Platform {}
	}
}

export {};
