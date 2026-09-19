<script lang="ts">
	import '../app.css';
	import { dev } from '$app/environment';
	import { page } from '$app/stores';
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

	inject({ mode: dev ? 'development' : 'production' });

	let canonical = $derived('https://itak.aynu.org' + $page.url.pathname);
</script>

<svelte:head>
	<link rel="canonical" href={canonical} />
</svelte:head>

{@render children?.()}

<Footer />

<style>
	:global(*) {
		box-sizing: border-box;
	}
</style>
