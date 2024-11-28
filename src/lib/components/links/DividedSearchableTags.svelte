<script lang="ts">
	import type { FuseResultMatch } from 'fuse.js';

	let {
		content,
		language,
		highlight
	}: {
		content: string;
		language: string;
		highlight: readonly FuseResultMatch[];
	} = $props();
	const segmenter = new Intl.Segmenter(language, { granularity: 'word' });
	console.log('highlight', highlight);
</script>

<span class="relative">
	{#each highlight as h}
		{#each h.indices as i}
			<span
				class="absolute bottom-1 h-1 bg-yellow-500/20"
				style={`left: ${i[0]}${language === 'ja' ? 'em' : 'ch'}; width: ${i[1] - i[0]}${language === 'ja' ? 'em' : 'ch'}`}
			></span>
		{/each}
	{/each}
	{#each segmenter.segment(content) as segment}
		{#if segment.segment.match(/^[VNA]\d$/)}
			{segment.segment}
		{:else}
			<a href={`/${language}/${segment.segment}`} tabindex="-1">{segment.segment}</a>
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
