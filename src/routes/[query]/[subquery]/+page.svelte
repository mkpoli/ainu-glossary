<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
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
	<button onclick={() => goto('/')}>
		<MaterialSymbolsArrowBackIosNew />
		<Localized ain="Hosipire" jap="戻る" eng="Back" />
	</button>
{/snippet}

<svelte:head>
	<title>{TRANSLATIONS[data.query].replace('{word}', data.subquery)}</title>

	<meta name="description" content={DESCRIPTIONS[data.query].replace('{word}', data.subquery)} />
</svelte:head>

<main>
	{@render goBackButton()}
	<h1>{TRANSLATIONS[data.query].replace('{word}', data.subquery)}</h1>
	<p>{DESCRIPTIONS[data.query].replace('{word}', data.subquery)}</p>

	<output>
		{#each data.found as item}
			<section>
				<h2 lang="ain">{item.Aynu}</h2>
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

	h1 {
		margin: 0;
	}
</style>
