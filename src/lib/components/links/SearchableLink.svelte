<script lang="ts">
	import T from '$lib/components/ui/T.svelte';
	import { segmentWithHighlightIndices } from '$lib/segment';
	import type { FuseResultMatch } from 'fuse.js';
	import m from '$lib/script.svelte';
	let {
		content,
		highlight
	}: { content: string; highlight: readonly FuseResultMatch[] | undefined } = $props();
	const highlightedIndices = $derived(highlight ? highlight.flatMap((h) => h.indices) : []);
</script>

<span class="relative z-20">
	{#each segmentWithHighlightIndices(content, 'ain', highlightedIndices) as { segment, subsegments }}
		{#if segment.match(/^[VNA]\d|YYYY|MM|DD|HH|SS$/)}
			{segment}
		{:else if segment.match(/^[a-zA-Záíúéó='’ ]+$/)}
			{#if segment.includes('=')}
				{#each segment.split(/(=)/) as part}
					{#if ['a', 'an', '='].includes(part)}
						<T t={part} />
					{:else}
						<a href={`/${part}`} tabindex="-1"><T t={part} /></a>
					{/if}
				{/each}
			{:else}
				<a href={`/${segment}`} tabindex="-1">
					{#if highlight}
						{#snippet highlightedText(small: boolean = false)}
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
						{#if m.script === 'Kana' && segment.match(/^[a-zA-Záíúéó='’]+$/)}
							<ruby>
								<T t={segment} />
								<rt class="text-sm">{@render highlightedText(true)}</rt>
							</ruby>
						{:else}
							{@render highlightedText()}
						{/if}
					{:else}
						<T t={segment} />
					{/if}
				</a>
			{/if}
		{:else}
			{segment}
		{/if}
	{/each}
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
