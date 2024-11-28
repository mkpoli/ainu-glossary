<script lang="ts">
	import Localized from '$lib/components/ui/Localized.svelte';
	import MaterialSymbolsArrowBackIosNew from '~icons/material-symbols/arrow-back-ios-new';
	import type { Snippet } from 'svelte';
	import Header from '$lib/components/Header.svelte';

	let { children }: { children: Snippet<[]> } = $props();
</script>

{#snippet goBack()}
	<a
		href="/"
		class="my-2 flex items-center gap-2 text-inherit no-underline hover:text-theme-500 hover:underline"
	>
		<MaterialSymbolsArrowBackIosNew />
		<Localized ain="Hosipire" jpn="戻る" eng="Back" />
	</a>
{/snippet}

<Header />
<main class="mx-auto flex max-w-prose flex-col gap-6 p-4">
	{@render children()}
	{@render goBack()}
</main>
