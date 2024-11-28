<script lang="ts">
	import type { Snippet } from 'svelte';
	import T from './T.svelte';
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

{#snippet stringOrSnippet(value: string | Snippet<[]>, lang: string)}
	{#if typeof value === 'string'}
		{#if lang === 'ain'}
			<T t={value} />
		{:else}
			{value}
		{/if}
	{:else}
		{@render value()}
	{/if}
{/snippet}

<span>
	{@render stringOrSnippet(ain, 'ain')}
	{@html separator}
	<span lang="ja">{@render stringOrSnippet(jpn, 'jpn')}</span>
	{@html separator}
	<span lang="en">{@render stringOrSnippet(eng, 'eng')}</span>
</span>
