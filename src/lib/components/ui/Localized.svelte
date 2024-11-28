<script lang="ts">
	import type { Snippet } from 'svelte';
	let {
		ain,
		eng,
		jpn,
		separator = ' / '
	}: {
		ain: string | Snippet<[]>;
		eng: string | Snippet<[]>;
		jpn: string | Snippet<[]>;
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
	<span lang="ja">{@render stringOrSnippet(jpn)}</span>
	{@html separator}
	<span lang="en">{@render stringOrSnippet(eng)}</span>
</span>
