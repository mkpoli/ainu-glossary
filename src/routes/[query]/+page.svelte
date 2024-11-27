<script lang="ts">
	import Localized from '$lib/components/Localized.svelte';
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
</script>

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
