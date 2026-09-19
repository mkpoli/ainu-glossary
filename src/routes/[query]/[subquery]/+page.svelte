<script lang="ts">
	import { browser } from '$app/environment';
	import SearchResultCard from '$lib/components/search/SearchResultCard.svelte';
	import Examples from '$lib/components/Examples.svelte';
	import { generateOgImageURL } from '$lib/og.js';
	import { entryPageTitle, entryPageDescription } from '$lib/seo';

	let { data } = $props();

	let [latn, kana] = $derived([
		data.found[0].item.Aynu?.split(/[\p{P}\p{S}]+/u)
			.filter(Boolean)
			.at(0) ?? '',
		data.found[0].item.カナ
			?.split(/[\s\p{P}\p{S}]+/u)
			.filter(Boolean)
			.at(0) ?? ''
	]);

	const TERMS_JSONLD = [
		{
			'@context': 'https://schema.org'
		},
		{
			'@type': 'WebSite',
			name: '現代アイヌ語翻訳用語集 / Modern Ainu Translation Glossary',
			alternateName: ['Tane an Aynuitak-kotupte Itak-uoeroskip', 'Itak-uoeroskip'],
			url: 'https://itak.aynu.org/',
			potentialAction: [
				{
					'@type': 'SearchAction',
					target: {
						'@type': 'EntryPoint',
						urlTemplate: 'https://itak.aynu.org/{search_term_string}'
					},
					'query-input': 'required name=search_term_string'
				}
			]
		},
		{
			'@type': ['DefinedTermSet', 'WebPage'],
			'@id': `https://itak.aynu.org/${data.query}/${data.subquery}`,
			name: '現代アイヌ語翻訳用語集 / Modern Ainu Translation Glossary',
			alternateName: ['Tane an Aynuitak-kotupte Itak-uoeroskip', 'Itak-uoeroskip'],
			url: `https://itak.aynu.org/${data.query}/${data.subquery}`
		},
		...data.found.map(({ item }) => ({
			'@type': 'DefinedTerm',
			'@id': `https://itak.aynu.org/${item.Aynu}`,
			description: [item.カナ, item.日本語, item.English, item.中文, item['註 / Notes']]
				.filter(Boolean)
				.join('\n'),
			inDefinedTermSet: `https://itak.aynu.org/${data.query}/${data.subquery}`
		}))
	];
	if (browser) {
		const script = document.createElement('script');
		script.type = 'application/ld+json';
		script.innerHTML = JSON.stringify(TERMS_JSONLD);
		document.head.appendChild(script);
	}

	const PAGE_TITLE = entryPageTitle({ lang: data.query, query: data.subquery, found: data.found });
	const PAGE_DESCRIPTION = entryPageDescription({
		lang: data.query,
		query: data.subquery,
		found: data.found
	});
</script>

<svelte:head>
	<title>{PAGE_TITLE}</title>
	<meta name="description" content={PAGE_DESCRIPTION} />
	<meta property="og:title" content={PAGE_TITLE} />
	<meta property="og:description" content={PAGE_DESCRIPTION} />
	<meta property="og:image" content={generateOgImageURL(latn, kana)} />
	<meta property="og:url" content={`https://itak.aynu.org/${data.query}/${data.subquery}`} />
	<meta property="og:type" content="website" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={PAGE_TITLE} />
	<meta name="twitter:description" content={PAGE_DESCRIPTION} />
	<meta name="twitter:image" content={generateOgImageURL(latn, kana)} />
</svelte:head>

<h1 class="m-0">{PAGE_TITLE}</h1>
<p>{PAGE_DESCRIPTION}</p>

<output class="flex flex-col gap-6">
	{#each data.found as { item, segments, hasHighlightedSegments }}
		<SearchResultCard {item} sheets={data.sheets} {segments} {hasHighlightedSegments} />
	{/each}
</output>

<Examples expr={data.expr} examples={data.examples} />
