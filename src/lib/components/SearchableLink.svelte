<script lang="ts">
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
						{part}
					{:else}
						<a href={`/${part}`}>{part}</a>
					{/if}
				{/each}
			{:else}
				<a href={`/${word}`}>{word}</a>
			{/if}
			<!--       
				{#if word.split('=')[0] === 'a'}
					a=<a href={`/${word.split('=')[1]}`}>{word.split('=')[0]}</a>
				{:else if word.split('=').at(-1) === 'an'}
					<a href={`/${word}`}>{word}</a>=an
				{:else}
					<a href={`/${word}`}>{word}</a>
				{/if} -->
			<!-- {/if} -->
		{:else}
			{word}
		{/if}
	{/each}
</span>

<style>
	a {
		text-decoration: none;
	}

	a:hover {
		text-decoration: underline;
	}
</style>
