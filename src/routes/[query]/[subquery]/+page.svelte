<script lang="ts">
	import SearchResultCard from '$lib/components/SearchResultCard.svelte';

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
</script>

<svelte:head>
	<title>{TRANSLATIONS[data.query].replace('{word}', data.subquery)}</title>

	<meta name="description" content={DESCRIPTIONS[data.query].replace('{word}', data.subquery)} />
</svelte:head>

<h1 class="m-0">{TRANSLATIONS[data.query].replace('{word}', data.subquery)}</h1>
<p>{DESCRIPTIONS[data.query].replace('{word}', data.subquery)}</p>

<output class="flex flex-col gap-6">
	{#each data.found as item}
		<SearchResultCard {item} sheets={data.sheets} />
	{/each}
</output>
