<script lang="ts">
	import { type Segment } from '$lib/segment';
	import m from '$lib/script.svelte';
	let {
		hasHighlightInLatn,
		hasHighlightInKana,
		segmentsLatn,
		segmentsKana
	}: {
		hasHighlightInLatn: boolean;
		hasHighlightInKana: boolean;
		segmentsLatn: readonly Segment[];
		segmentsKana: readonly Segment[];
	} = $props();
</script>

{#snippet highlightedText(subsegments: Segment['subsegments'], small: boolean = false)}
	{#each subsegments as { highlighted, content }}
		{#if highlighted}
			<span
				class="relative after:absolute after:bottom-1 after:left-0 after:right-0 after:-z-10 after:h-1 after:bg-theme-400/40 after:content-['']"
				class:after:h-[0.2rem]={small}>{content}</span
			>
		{:else}
			{content}
		{/if}
	{/each}
{/snippet}

{#snippet diagraphicHighlight(
	primarySegments: readonly Segment[],
	secondarySegments: readonly Segment[]
)}
	<ruby>
		<span>
			{#each primarySegments as { segment, subsegments }}
				<a href={`/${segment}`}>
					{@render highlightedText(subsegments)}
				</a>
			{/each}
		</span>
		<rt>
			{#each secondarySegments as { segment, subsegments }}
				<a href={`/${segment}`}>
					{@render highlightedText(subsegments)}
				</a>
			{/each}
		</rt>
	</ruby>
{/snippet}

<span class="relative z-20">
	{#if m.script === 'Latn'}
		{#if hasHighlightInKana}
			{@render diagraphicHighlight(segmentsLatn, segmentsKana)}
		{:else}
			{#each segmentsLatn as { segment, subsegments }}
				<a href={`/${segment}`}>
					{@render highlightedText(subsegments)}
				</a>
			{/each}
		{/if}
	{:else if m.script === 'Kana'}
		{#if hasHighlightInLatn}
			{@render diagraphicHighlight(segmentsKana, segmentsLatn)}
		{:else}
			{#each segmentsKana as { segment, subsegments }}
				<a href={`/${segment}`}>
					{@render highlightedText(subsegments)}
				</a>
			{/each}
		{/if}
	{/if}
</span>

<style>
	a {
		text-decoration: none;
		color: inherit;
	}

	a:hover {
		text-decoration: underline;
	}
</style>
