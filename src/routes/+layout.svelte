<script lang="ts">
	import { dev } from '$app/environment';
	import { inject } from '@vercel/analytics';
	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();
	inject({ mode: dev ? 'development' : 'production' });
</script>

{@render children?.()}

<style>
	:global(*) {
		box-sizing: border-box;
	}
</style>
