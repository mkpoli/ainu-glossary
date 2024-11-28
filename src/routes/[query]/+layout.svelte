<script lang="ts">
	import Localized from '$lib/components/Localized.svelte';
	import MaterialSymbolsArrowBackIosNew from '~icons/material-symbols/arrow-back-ios-new';
	import type { Snippet } from 'svelte';
	import Header from '$lib/components/Header.svelte';

	let { children }: { children: Snippet<[]> } = $props();
</script>

{#snippet goBack()}
	<a
		href="/"
		class="my-2 flex items-center gap-2 hover:underline no-underline text-inherit hover:text-theme-500"
	>
		<MaterialSymbolsArrowBackIosNew />
		<Localized ain="Hosipire" jpn="戻る" eng="Back" />
	</a>
{/snippet}

<Header />
<main class="max-w-prose mx-auto p-4 flex flex-col gap-6">
	{@render children()}
	{@render goBack()}
</main>
