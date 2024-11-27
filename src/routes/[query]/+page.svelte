<script lang="ts">
	import Localized from '$lib/Localized.svelte';
	import MaterialSymbolsArrowBackIosNew from '~icons/material-symbols/arrow-back-ios-new';
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
</script>

{#snippet goBack()}
	<a
		href="/"
		class="my-2 flex items-center gap-2 hover:underline no-underline text-inherit hover:text-theme-500"
	>
		<MaterialSymbolsArrowBackIosNew />
		<Localized ain="Hosipire" jap="戻る" eng="Back" />
	</a>
{/snippet}

<main class="max-w-prose mx-auto p-4 flex flex-col gap-6">
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

	<output class="flex flex-col gap-6">
		{#each data.found as item}
			<section class="px-6 py-4 shadow-hard border border-black">
				<h2 class="m-0">{item.Aynu}</h2>
				<p lang="en">{item.English}</p>
				<p lang="ja">{item.日本語}</p>
				<p lang="zh">{item.中文}</p>
			</section>
		{/each}
	</output>
	{@render goBack()}
</main>
