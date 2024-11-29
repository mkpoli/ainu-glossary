<script lang="ts">
	import { isPlaceholderLike, segmentWithHighlightIndices } from '$lib/segment';
	import type { FuseResultMatch } from 'fuse.js';

	let {
		content,
		language,
		highlight
	}: {
		content: string;
		language: string;
		highlight: readonly FuseResultMatch[] | undefined;
	} = $props();

	let highlightedIndices = $derived(highlight ? highlight.flatMap((h) => h.indices) : []);
</script>

{#each segmentWithHighlightIndices(content, language, highlightedIndices) as segment}
	{#if isPlaceholderLike(segment.segment)}
		{segment.segment}
	{:else}
		<a
			href={`/${language}/${segment.segment}`}
			tabindex="-1"
			class="text-inherit no-underline hover:underline"
		>
			{#each segment.subsegments as { highlighted, content }}
				{#if highlighted}
					<span
						class="relative after:absolute after:bottom-1 after:left-0 after:right-0 after:-z-10 after:h-1 after:bg-theme-400/40 after:content-['']"
					>
						{content}</span
					>
				{:else}
					{content}
				{/if}
			{/each}
		</a>
	{/if}
{/each}
