<script lang="ts">
	import { browser } from '$app/environment';
	import Localized from '$lib/Localized.svelte';
	import MaterialSymbolsArrowBackIosNew from '~icons/material-symbols/arrow-back-ios-new';
	let { data } = $props();

	const TRANSLATIONS = {
		en: 'How to say "{word}" in Ainu?',
		zh: '如何用阿伊努語說「{word}」?',
		ja: 'アイヌ語で「{word}」とはどう言うの？'
	};

	const DESCRIPTIONS = {
		en: "This page explains the expression of '{word}' in Ainu.",
		zh: '這頁解釋了阿伊努語中「{word}」的說法。',
		ja: 'このページでは、アイヌ語で「{word}」の言い方について解説します。'
	};

	if (browser) {
		document.documentElement.lang = data.query;
	}
</script>

{#snippet goBackButton()}
	<a
		href="/"
		class="my-2 flex items-center gap-2 hover:underline no-underline text-inherit hover:text-theme-500"
	>
		<MaterialSymbolsArrowBackIosNew />
		<Localized ain="Hosipire" jap="戻る" eng="Back" />
	</a>
{/snippet}

<svelte:head>
	<title>{TRANSLATIONS[data.query].replace('{word}', data.subquery)}</title>

	<meta name="description" content={DESCRIPTIONS[data.query].replace('{word}', data.subquery)} />
</svelte:head>

<main class="max-w-prose mx-auto p-4 flex flex-col gap-6">
	{@render goBackButton()}
	<h1 class="m-0">{TRANSLATIONS[data.query].replace('{word}', data.subquery)}</h1>
	<p>{DESCRIPTIONS[data.query].replace('{word}', data.subquery)}</p>

	<output class="flex flex-col gap-6">
		{#each data.found as item}
			<section class="px-6 py-4 shadow-hard border border-black">
				<h2 lang="ain" class="m-0">{item.Aynu}</h2>
				<p lang="en">{item.English}</p>
				<p lang="ja">{item.日本語}</p>
				<p lang="zh">{item.中文}</p>
			</section>
		{/each}
	</output>
	{@render goBackButton()}
</main>
