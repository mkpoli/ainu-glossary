<script lang="ts">
	let { content, language }: { content: string; language: string } = $props();
	const segmenter = new Intl.Segmenter(language, { granularity: 'word' });
</script>

<span>
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
