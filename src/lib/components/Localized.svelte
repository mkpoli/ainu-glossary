<script lang="ts">
	import type { Snippet } from 'svelte';
	let {
		ain,
		eng,
		jap,
		separator = ' / '
	}: {
		ain: string | Snippet<[]>;
		eng: string | Snippet<[]>;
		jap: string | Snippet<[]>;
		separator?: string;
	} = $props();
</script>

{#snippet stringOrSnippet(value: string | Snippet<[]>)}
	{#if typeof value === 'string'}
		{value}
	{:else}
		{@render value()}
	{/if}
{/snippet}

<span>
	{@render stringOrSnippet(ain)}
	{@html separator}
	<span lang="en">{@render stringOrSnippet(eng)}</span>
	{@html separator}
	<span lang="ja">{@render stringOrSnippet(jap)}</span>
</span>
