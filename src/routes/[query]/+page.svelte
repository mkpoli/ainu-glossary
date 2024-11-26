<script lang="ts">
	import { goto } from '$app/navigation';
	import Localized from '$lib/Localized.svelte';
	import MaterialSymbolsArrowBackIosNew from '~icons/material-symbols/arrow-back-ios-new';
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
</script>

{#snippet goBackButton()}
	<button onclick={() => goto('/')}>
		<MaterialSymbolsArrowBackIosNew />
		<Localized ain="Hosipire" jap="戻る" eng="Back" />
	</button>
{/snippet}

<main>
	{@render goBackButton()}
	<h1>{data.query}</h1>

	<output>
		{#each data.found as item}
			<section>
				<h2>{item.Aynu}</h2>
				<p lang="en">{item.English}</p>
				<p lang="ja">{item.日本語}</p>
				<p lang="zh">{item.中文}</p>
			</section>
		{/each}
	</output>
	{@render goBackButton()}
</main>

<style>
	main {
		max-width: 80ch;
		margin: 0 auto;

		padding: 1rem;

		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	button {
		background: none;
		border: none;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 1.25rem;
	}

	button:hover {
		text-decoration: underline;
		cursor: pointer;
	}

	output {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	section {
		padding: 1rem 2rem;
		box-shadow: 0 0 0 1px black;
	}
</style>
