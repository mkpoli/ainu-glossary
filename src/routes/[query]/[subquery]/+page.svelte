<script lang="ts">
	import SearchResultCard from '$lib/components/search/SearchResultCard.svelte';

	let { data } = $props();

	const TRANSLATIONS = {
		en: 'How to say "{word}" in Ainu?',
		zh: '如何用阿伊努語說「{word}」?',
		ja: '「{word}」はアイヌ語でなんて言う？'
	};

	const DESCRIPTIONS = {
		en: "This page explains the expression of '{word}' in Ainu. How do you say '{word}' in the Ainu language? What is '{word}' in Ainu? Similar expressions and alternative phrases are also introduced.",
		zh: '這頁解釋了阿伊努語中「{word}」的說法。阿伊努語怎麼說「{word}」? 阿伊努語中「{word}」是什麼？還有一些類似的表現和替代詞等等。',
		ja: 'このページでは、アイヌ語で「{word}」の言い方について解説します。アイヌ語で「{word}」はどう言えばいい？似たような表現・言い換えも紹介します。'
	};
</script>

<svelte:head>
	<title>{TRANSLATIONS[data.query].replaceAll('{word}', data.subquery)}</title>

	<meta name="description" content={DESCRIPTIONS[data.query].replaceAll('{word}', data.subquery)} />
</svelte:head>

<h1 class="m-0">{TRANSLATIONS[data.query].replaceAll('{word}', data.subquery)}</h1>
<p>{DESCRIPTIONS[data.query].replaceAll('{word}', data.subquery)}</p>

<output class="flex flex-col gap-6">
	{#each data.found as item}
		<SearchResultCard {item} sheets={data.sheets} />
	{/each}
</output>
