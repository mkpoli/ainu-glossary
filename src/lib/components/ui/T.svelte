<script lang="ts">
	import m from '$lib/script.svelte';
	import { segmentWithHighlightIndices } from '$lib/segment';
	import type { FuseResultMatch } from 'fuse.js';

	let { t, highlightKana }: { t: string; highlightKana?: readonly FuseResultMatch[] } = $props();
	let highlightedIndicesKana = $derived(
		highlightKana ? highlightKana.flatMap((h) => h.indices) : []
	);
</script>

<span class="font-ain">
	{#if highlightKana}
		{#each segmentWithHighlightIndices(m.t(t), 'ain-Kana', highlightedIndicesKana) as { subsegments }}
			{#each subsegments as { highlighted, content }}
				{#if highlighted}
					<span
						class="relative after:absolute after:bottom-1 after:left-0 after:right-0 after:-z-10 after:h-1 after:bg-theme-400/40 after:content-['']"
						>{content}</span
					>
				{:else}
					{content}
				{/if}
			{/each}
		{/each}
	{:else}
		{m.t(t)}
	{/if}
</span>
