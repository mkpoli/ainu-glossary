<script lang="ts">
	import Localized from '$lib/components/ui/Localized.svelte';
	import SearchResultCard from '$lib/components/search/SearchResultCard.svelte';
	import type { PageData } from './$types';
	import m from '$lib/script.svelte';
	import T from '$lib/components/ui/T.svelte';
	let { data }: { data: PageData } = $props();
	import { latn2kana, kana2latn } from '$lib/script.svelte';
	function getPairedText(text: string): [string, string] {
		if (data.query.match(/^[a-zA-Záíúéó='’]+$/)) {
			return [data.query, latn2kana(data.query)];
		} else if (
			data.query.match(/^[\p{Script=Hiragana}\p{Script_Extensions=Katakana}\s\p{L}\p{N}]+$/u)
		) {
			return [kana2latn(data.query), data.query];
		}
		return [data.query, ''];
	}
	let [latn, kana] = $derived(getPairedText(data.query));
</script>

<svelte:head>
	<title>アイヌ語で{data.query}とは？ What is {data.query} in Ainu?</title>
	<meta
		name="description"
		content="アイヌ語で{data.query}ってどういう意味？{data.query}は何のことを指すの？意味や使い方について解説します | What does {data.query} mean in Ainu? How to use {data.query} in Ainu?"
	/>
	<meta
		property="og:title"
		content={`アイヌ語で${data.query}とは？ What is ${data.query} in Ainu?`}
	/>
	<meta
		name="og:description"
		content={`アイヌ語で${data.query}ってどういう意味？${data.query}は何のことを指すの？意味や使い方について解説します | What does ${data.query} mean in Ainu? How to use ${data.query} in Ainu?`}
	/>
	<meta property="og:image" content={`/api/ogp?latn=${latn}&kana=${kana}`} />
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
				アイヌ語で「{@render italicIfLatn(data.query)}」の意味とは？
			</span>
		{/snippet}
		{#snippet eng()}
			<span class="text-lg font-normal">
				What does “{@render italicIfLatn(data.query)}” mean in Ainu?
			</span>
		{/snippet}
	</Localized>
</h1>

<output class="flex flex-col gap-6">
	{#each data.found as { item, segments, hasHighlightedSegments }}
		<SearchResultCard {item} sheets={data.sheets} {segments} {hasHighlightedSegments} />
	{/each}
</output>
