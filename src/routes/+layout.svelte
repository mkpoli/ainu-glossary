<script lang="ts">
	import '../app.css';
	import { dev } from '$app/environment';
	import { inject } from '@vercel/analytics';
	import Footer from '$lib/components/Footer.svelte';
	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();
	inject({ mode: dev ? 'development' : 'production' });
</script>

{@render children?.()}

<Footer />

<style>
	:global(*) {
		box-sizing: border-box;
	}
</style>
