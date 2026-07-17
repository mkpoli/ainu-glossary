import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import Icons from 'unplugin-icons/vite';

export default defineConfig({
	plugins: [
		sveltekit(),
		Icons({
			compiler: 'svelte'
		})
	],
	build: {
		// Left as a bare import for wrangler, which bundles .wasm as a module —
		// the form workerd accepts (runtime compilation from bytes is rejected).
		rollupOptions: { external: ['@resvg/resvg-wasm/index_bg.wasm'] }
	}
});
