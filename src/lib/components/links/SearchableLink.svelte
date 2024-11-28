<script lang="ts">
	import T from '$lib/components/ui/T.svelte';
	import type { FuseResultMatch } from 'fuse.js';

	let { content, highlight }: { content: string; highlight: FuseResultMatch[] } = $props();
</script>

<span class="relative">
	{#each highlight as h}
		{#each h.indices as i}
			<span
				class="absolute bottom-1 h-1 bg-yellow-500/30"
				style={`left: ${i[0]}ch; width: ${i[1] - i[0]}ch`}
			></span>
		{/each}
	{/each}

	<span class="relative z-20">
		{#each content.split(/([\s,\{\}\?\-\(\)!]+)/u) as word}
			{#if word.match(/^[VN]\d|YYYY|MM|DD|HH|SS$/)}
				{word}
			{:else if word.match(/^[a-zA-Záíúéó='’ ]+$/)}
				{#if word.includes('=')}
					{#each word.split(/(=)/) as part}
						{#if ['a', 'an', '='].includes(part)}
							<T t={part} />
						{:else}
							<a href={`/${part}`} tabindex="-1"><T t={part} /></a>
						{/if}
					{/each}
				{:else}
					<a href={`/${word}`} tabindex="-1"><T t={word} /></a>
				{/if}
			{:else}
				{word}
			{/if}
		{/each}
	</span>
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
