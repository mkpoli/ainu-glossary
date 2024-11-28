<script lang="ts">
	import Table from '$lib/components/table/Table.svelte';
	import Localized from '$lib/components/ui/Localized.svelte';
	import type { PageData } from './$types';

	import GitHub from '~icons/simple-icons/github';
	import X from '~icons/simple-icons/x';

	import Download from '~icons/material-symbols/cloud-download-outline-rounded';
	import LineMdDownloadingLoop from '~icons/line-md/downloading-loop';

	import { GOOGLE_SHEET_LINK, type Entry } from '$lib/data';
	import { SITE_TITLE } from '$lib/consts';

	interface Props {
		data: PageData;
	}

	let { data = $bindable() }: Props = $props();
	console.log(data);

	let loading = $state(false);

	const DESCRIPTIONS = {
		ain: 'Tan itak-uoeroskip anakne tane an Aynuitak hene koitaktupte kuni p ne. Teeta wano oka iporse patek somo ne no asir itak ne yakka a=kar itak ne yakka ci=omare wa kusu tane an pe a=ye wa kesto an kor a=eywanke easkay kuni iesoye cinumkekampi ne ruwe ne.',
		jpn: 'この語彙集は、アイヌ語、特に現代的なアイヌ語に、翻訳するためのグロッサリーです。昔からある表現のみならず、新語や造語を積極的に取り入れ、現代的な事物や生活を表現しうるような、分類語彙対訳辞書である。',
		eng: 'This glossary is for translating into the Ainu language, particularly for modern usages. It is a categorized multilingual lexicon that actively incorporates coinage besides traditional expressions, enabling the expression of modern objects and contemporary lifestyles.'
	};

	const DESCRIPTION_SHORT =
		'現代的なアイヌ語の使用のための、伝統的な表現および新語の両方を取り入れた、活きるオンライン分類対訳辞書 | A Categorized Multilingual Online Lexicon for Modern Ainu';
</script>

<svelte:head>
	<title>{SITE_TITLE}</title>
	<meta name="description" content={DESCRIPTION_SHORT} />
	<meta name="og:title" content={SITE_TITLE} />
	<meta name="og:description" content={DESCRIPTION_SHORT} />
	<meta name="og:image" content="/screenshot.png" />
	<meta
		name="keywords"
		content="アイヌ語, 現代アイヌ語, 翻訳用語集, 詞典, 辞典, 言語復興, 辭書, Ainu, Modern Ainu, Translation Glossary, Ainu Language, Language Revitalization, Dictionary, Ainu Dictionary"
	/>
</svelte:head>

<main class="flex flex-col items-center justify-center gap-1 p-4 text-center">
	<picture class="my-4">
		<source srcset="/android-chrome-192x192.avif" type="image/avif" />
		<source srcset="/android-chrome-192x192.webp" type="image/webp" />
		<img src="/android-chrome-192x192.png" alt="Logo" class="h-10 w-10 md:h-40 md:w-40" />
	</picture>
	<h1 class="mb-2 mt-2 text-xl md:my-1 md:text-3xl">{SITE_TITLE}</h1>
	<p
		role="doc-subtitle"
		class="mb-4 flex flex-col gap-2 text-base font-bold md:my-1 md:mb-2 md:flex-row md:text-xl"
		lang="ja"
	>
		<span lang="ja">現代アイヌ語翻訳用語集</span><span class="hidden md:inline"> / </span>
		<span lang="en">Modern Ainu Translation Glossary</span>
	</p>

	<div class="my-4 text-sm md:my-8 md:text-base">
		<p>
			Tanpe anak intennet or ta <a href={GOOGLE_SHEET_LINK} target="_blank">
				<i>Itak-uoeroskip</i>
			</a> a=hunara wa uotutanu a=nukar easkay kuni aeywankep ne.
		</p>
		<p lang="ja" class="text-xs md:text-base">
			これは、<a href={GOOGLE_SHEET_LINK} target="_blank">元の用語集</a
			>を簡単に検索したり、並べ替えたりして一覧表示できるウェブアプリです。
		</p>
		<p lang="en" class="text-xs md:text-base">
			This is a web application that allows you to easily search, sort, and list <a
				href={GOOGLE_SHEET_LINK}
				target="_blank">the original glossary</a
			>.
		</p>

		<details class="mx-auto my-4 flex max-w-prose flex-col gap-4 text-center">
			<summary>
				<Localized ain="Uepeker" jpn="詳細" eng="Details" />
			</summary>
			<div class="flex flex-col gap-2 text-justify">
				<p>{DESCRIPTIONS.ain}</p>
				<p lang="ja">{DESCRIPTIONS.jpn}</p>
				<p lang="en">{DESCRIPTIONS.eng}</p>
			</div>
		</details>
	</div>

	{#if data.table && data.table.length && data.table.length > 0}
		<Table data={data.table} sheets={data.sheets} />
	{/if}

	<button
		onclick={() => {
			loading = true;
			const header = [...Object.keys(data.table[0])].join('\n');
			const csv = data.table.map((row: Entry) => Object.values(row).join(',')).join('\n');
			const blob = new Blob([csv], { type: 'text/csv' });
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = 'ainu-glossary.csv';
			a.click();
			loading = false;
		}}
		class="mt-4 inline-flex items-center gap-2 p-2 text-base"
	>
		{#if loading}
			<LineMdDownloadingLoop width="1.25em" height="1.25em" />
			<Localized ain="Tatum a=etokoyki kor an" jpn="データを準備中" eng="Preparing data" />
		{:else}
			<Download width="1.25em" height="1.25em" />
			<Localized ain="Tatum ranke" jpn="データをダウンロード" eng="Download data" />
		{/if}
	</button>

	<h2>
		<Localized ain="Kampimoto" jpn="参考文献" eng="References" />
	</h2>
	<p>
		<a
			href="https://docs.google.com/spreadsheets/d/1zV0gl4TWV5fkf2r9i_1P1jmH_p7LOzbhZQgm7mPwDdE/edit?usp=sharing#gid=1835108336"
			target="_blank">Kampimoto opitta</a
		> nukar wa un=kore yan!
	</p>

	<p lang="ja">
		<a
			href="https://docs.google.com/spreadsheets/d/1zV0gl4TWV5fkf2r9i_1P1jmH_p7LOzbhZQgm7mPwDdE/edit?usp=sharing#gid=1835108336"
			target="_blank">参考文献の一覧</a
		>を御覧ください。
	</p>

	<p lang="en">
		Please see the <a
			href="https://docs.google.com/spreadsheets/d/1zV0gl4TWV5fkf2r9i_1P1jmH_p7LOzbhZQgm7mPwDdE/edit?usp=sharing#gid=1835108336"
			target="_blank">list of references</a
		>.
	</p>

	<h2><Localized ain="Uesere" jpn="ライセンス" eng="License" /></h2>

	<a href="https://creativecommons.org/licenses/by-sa/4.0/deed" class="my-2">
		<img
			src="https://mirrors.creativecommons.org/presskit/buttons/88x31/svg/by-sa.svg"
			class="h-12"
			alt="CC BY-SA"
		/>
	</a>

	<p>
		Tan itak-uoeroskip anak <a
			href="https://creativecommons.org/licenses/by-sa/4.0/deed"
			target="_blank">CC BY-SA 4.0 Deed</a
		> sekor uesere eoripak yakun a=eywanke easkay.
	</p>

	<p lang="ja">
		このデータは、<a href="https://creativecommons.org/licenses/by-sa/4.0/deed.ja" target="_blank"
			>クリエイティブ・コモンズ 表示-継承 4.0 国際 ライセンス</a
		>の下に提供されています。
	</p>

	<p lang="en">
		This data is licensed under a <a
			href="https://creativecommons.org/licenses/by-sa/4.0/"
			target="_blank">Creative Commons Attribution-ShareAlike 4.0 International License</a
		>.
	</p>

	<h2><Localized ain="Rinko" jpn="リンク" eng="Links" /></h2>
	<div class="flex items-center justify-center gap-4">
		<a
			class="flex items-center justify-center text-neutral-600 hover:text-black"
			href="https://github.com/mkpoli/ainu-glossary"
			target="_blank"
			title="GitHub"
			aria-label="GitHub"
		>
			<GitHub class="h-8 w-8" />
		</a>
		<a
			class="flex items-center justify-center text-neutral-600 hover:text-black"
			href="https://x.com/mkpoli/status/1768640802971156809?s=20"
			target="_blank"
			title="X"
			aria-label="X"
		>
			<X class="h-8 w-8" />
		</a>
	</div>

	<ul class="my-4 flex list-none flex-col justify-center gap-2 p-0 md:flex-row md:gap-4">
		<li></li>
		<li>
			<a href="https://aynu.org/" target="_blank">Aynu.org</a>
		</li>
		<li>
			<a href="https://wiki.aynu.org/" target="_blank">Aynuwiki</a>
		</li>
		<!-- * [https://dict.aynu.org/ Aynuitak-Eonnekunnep -{(dict.aynu.org)}-]
		* [https://itak.aynu.org/ Tane an Aynuitak-kotupte Itak-uoeroskip -{(itak.aynu.org)}-]
		* [https://site.aynu.org/ Aynuitak Inuypa Ukosammaani Sayto -{(site.aynu.org)}-] -->
		<li>
			<a href="https://dict.aynu.org/" target="_blank">Aynuitak-Eonnekunnep</a>
		</li>
		<li>
			<a href="https://site.aynu.org/" target="_blank">Aynuitak Inuypa Ukosammaani Sayto</a>
		</li>
	</ul>
</main>

<style lang="postcss">
	h2 {
		@apply text-xl md:text-2xl;
	}
</style>
