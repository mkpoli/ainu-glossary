<script lang="ts">
	import Localized from '$lib/components/ui/Localized.svelte';
	import SearchResultCard from '$lib/components/search/SearchResultCard.svelte';
	import type { PageData } from './$types';
	import m from '$lib/script.svelte';
	import T from '$lib/components/ui/T.svelte';
	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>アイヌ語で{data.query}とは？ What is {data.query} in Ainu?</title>
	<meta
		name="description"
		content="アイヌ語で{data.query}ってどういう意味？{data.query}は何のことを指すの？意味や使い方について解説します | What does {data.query} mean in Ainu? How to use {data.query} in Ainu?"
	/>
</svelte:head>

{#snippet italicIfLatn(text: string)}
	{#if text.match(/^[a-zA-Záíúéó='’]+$/)}
		<i class="italic">{text}</i>
	{:else}
		{text}
	{/if}
{/snippet}

<h1 class="text-2xl font-bold">
	<Localized separator="<br/>">
		{#snippet ain()}
			{#if m.script === 'Latn'}
				“{@render italicIfLatn(data.query)}”<T t=" hunara wa oka p" />
			{:else}
				「{@render italicIfLatn(data.query)}」<T t=" hunara wa oka p" />
			{/if}
		{/snippet}
		{#snippet jpn()}
			<span class="text-lg font-normal">
				アイヌ語<span class="italic">{@render italicIfLatn(data.query)}</span>の意味とは？
			</span>
		{/snippet}
		{#snippet eng()}
			<span class="text-lg font-normal">
				What does <span class="italic">{@render italicIfLatn(data.query)}</span> mean in Ainu?
			</span>
		{/snippet}
	</Localized>
</h1>

<output class="flex flex-col gap-6">
	{#each data.found as { item, matches }}
		<SearchResultCard {item} sheets={data.sheets} {matches} />
	{/each}
</output>
