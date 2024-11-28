<script lang="ts">
	import T from '../ui/T.svelte';

	let { content }: { content: string } = $props();
</script>

<span>
	{#each content.split(/([\s,\{\}]+)/u) as word}
		{#if word.match(/^[VNA]\d$/)}
			{word}
		{:else if word.match(/^[a-zA-Z=\-]+$/)}
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

<style>
	a {
		text-decoration: none;
		color: inherit;
	}

	a:hover {
		text-decoration: underline;
	}
</style>
