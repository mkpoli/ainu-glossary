<script lang="ts">
	import { isPlaceholderLike, isNonWordLike, type Segment } from '$lib/segment';

	let {
		segments,
		language
	}: {
		segments: readonly Segment[];
		language: string;
	} = $props();
</script>

{#each segments as segment}
	{#if isPlaceholderLike(segment.segment) || isNonWordLike(segment.segment)}
		{segment.segment}
	{:else}
		<a
			href={`/${language}/${segment.segment}`}
			tabindex="-1"
			class="text-inherit no-underline hover:text-inherit hover:underline"
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
