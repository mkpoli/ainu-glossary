<script>
	import { page } from '$app/stores';
	import Localized from '$lib/components/ui/Localized.svelte';
	import SearchResultCard from '$lib/components/search/SearchResultCard.svelte';
	$inspect($page);
</script>

{#if $page?.status === 404}
	<h1>😭 404 Not Found</h1>
	<p>
		<Localized ain="A=hunara hike ka isam" jpn="検索結果がありません" eng="No results found" />
	</p>
	<h2>
		<Localized ain="Mosma an pe" jpn="他の項目を見てみましょう" eng="Check out others" />
	</h2>
	{#each $page?.error?.other ?? [] as { item, segments, hasHighlightedSegments }}
		<SearchResultCard
			{item}
			sheets={$page?.error?.sheets ?? []}
			{segments}
			{hasHighlightedSegments}
		/>
	{/each}
{:else}
	<h1>500 Internal Server Error</h1>
{/if}
