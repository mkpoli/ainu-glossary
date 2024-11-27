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
	{@render goBack()}
	<h1 class="text-2xl font-bold">
		<Localized separator="<br/>">
			{#snippet ain()}
				<span class="italic">{data.query}</span> a=hunara wa oka p
			{/snippet}
			{#snippet jap()}
				<span class="font-normal text-lg">
					アイヌ語<span class="italic">{data.query}</span>の意味とは？
				</span>
			{/snippet}
			{#snippet eng()}
				<span class="font-normal text-lg">
					What does <span class="italic">{data.query}</span> mean in Ainu?
				</span>
			{/snippet}
		</Localized>
	</h1>

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
	{@render goBack()}
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
