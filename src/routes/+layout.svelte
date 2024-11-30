<script lang="ts">
	import '../app.css';
	import { dev } from '$app/environment';
	import { inject } from '@vercel/analytics';
	import Footer from '$lib/components/Footer.svelte';
	import m, { isScript } from '$lib/script.svelte';

	interface Props {
		children?: import('svelte').Snippet;
		data: {
			script: string;
		};
	}
	let { data, children }: Props = $props();

	m.script = isScript(data.script) ? data.script : 'Latn';

	if (!dev) {
		inject({ mode: dev ? 'development' : 'production' });
	}
</script>

{@render children?.()}

<Footer />

<style>
	:global(*) {
		box-sizing: border-box;
	}
</style>
