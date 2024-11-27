<script lang="ts">
	import Table from '$lib/components/Table.svelte';
	import Localized from '$lib/components/Localized.svelte';
	import type { PageData } from './$types';

	import GitHub from '~icons/simple-icons/github';
	import X from '~icons/simple-icons/x';

	import Download from '~icons/material-symbols/cloud-download-outline-rounded';
	import LineMdDownloadingLoop from '~icons/line-md/downloading-loop';

	import { GOOGLE_SHEET_LINK, type Entry } from '$lib/data';

	interface Props {
		data: PageData;
	}

	let { data = $bindable() }: Props = $props();
	console.log(data);

	let loading = $state(false);
</script>

<svelte:head>
	<title>Tane an Aynuitak-kotupte Itak-uoeroskip</title>
	<meta name="description" content="現代アイヌ語翻訳用語集 / Modern Ainu Translation Glossary" />
	<meta name="og:title" content="Tane an Aynuitak-kotupte Itak-uoeroskip" />
	<meta name="og:description" content="現代アイヌ語翻訳用語集 / Modern Ainu Translation Glossary" />
</svelte:head>

<main class="flex flex-col items-center justify-center gap-1">
	<picture>
		<source srcset="/android-chrome-192x192.avif" type="image/avif" />
		<source srcset="/android-chrome-192x192.webp" type="image/webp" />
		<img src="/android-chrome-192x192.png" alt="Logo" />
	</picture>
	<h1>Tane an Aynuitak-kotupte Itak-uoeroskip</h1>
	<p role="doc-subtitle" lang="ja">
		<span lang="ja">現代アイヌ語翻訳用語集</span> /
		<span lang="en">Modern Ainu Translation Glossary</span>
	</p>

	<p>
		Tanpe anak intennet or ta <a href={GOOGLE_SHEET_LINK} target="_blank">
			<i>Itak-uoeroskip</i>
		</a> a=hunara wa uotutanu a=nukar easkay kuni aeywankep ne.
	</p>
	<p lang="en">
		This is a web application that allows you to easily search, sort, and list <a
			href={GOOGLE_SHEET_LINK}
			target="_blank">the original glossary</a
		>.
	</p>
	<p lang="ja">
		これは、<a href={GOOGLE_SHEET_LINK} target="_blank">元の用語集</a
		>を簡単に検索したり、並べ替えたりして一覧表示できるウェブアプリです。
	</p>

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
		style="display: inline-flex; align-items: center; gap: 0.5rem;"
	>
		{#if loading}
			<LineMdDownloadingLoop width="1.25em" height="1.25em" />
			<Localized ain="Tatum a=etokoyki kor an" jap="データを準備中" eng="Preparing data" />
		{:else}
			<Download width="1.25em" height="1.25em" />
			<Localized ain="Tatum ranke" jap="データをダウンロード" eng="Download data" />
		{/if}
	</button>

	<h2><Localized ain="Kampimoto" jap="参考文献" eng="References" /></h2>
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

	<h2><Localized ain="Uesere" jap="ライセンス" eng="License" /></h2>

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

	<h2><Localized ain="Rinko" jap="リンク" eng="Links" /></h2>
	<div class="icon-links">
		<a
			class="icon"
			href="https://github.com/mkpoli/ainu-glossary"
			target="_blank"
			title="GitHub"
			aria-label="GitHub"
		>
			<GitHub width="2em" height="2em" />
		</a>
		<a
			class="icon"
			href="https://x.com/mkpoli/status/1768640802971156809?s=20"
			target="_blank"
			title="X"
			aria-label="X"
		>
			<X width="2em" height="2em" />
		</a>
	</div>

	<ul class="my-4">
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

<style>
	:body {
		margin: 0;
	}

	main {
		padding: 1rem;
		text-align: center;
	}

	h1 {
		font-size: 2rem;

		margin-top: 0.5rem;
		margin-bottom: 0.5rem;
	}

	h2 {
		font-size: 1.5rem;
	}

	p {
		margin: 0;
	}

	p[role='doc-subtitle'] {
		font-size: 1.5rem;
		font-weight: bold;
		margin-bottom: 2.5rem;
	}

	button {
		padding: 0.5rem 1rem;
		font-size: 1rem;
		margin-top: 1rem;
	}

	ul {
		list-style: none;
		padding: 0;
		display: flex;
		justify-content: center;
		gap: 1rem;
	}

	.icon-links {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 1rem;
	}

	a.icon {
		display: flex;
		justify-content: center;
		align-items: center;

		color: #555;
	}

	a.icon:hover {
		color: black;
	}

	img[alt='Logo'] {
		width: 10rem;
		height: 10rem;
	}

	@media (max-width: 768px) {
		h1 {
			font-size: 1.25rem;
			margin-top: 0.25rem;
			margin-bottom: 0.25rem;
		}

		h2 {
			font-size: 1rem;
		}

		p[role='doc-subtitle'] {
			font-size: 1rem;
			margin-bottom: 0.5rem;
		}

		p:not([role='doc-subtitle']) {
			font-size: 0.75rem;
		}

		p {
			margin-bottom: 0;
		}

		img[alt='Logo'] {
			width: 3rem;
			height: 3rem;
		}

		ul {
			flex-direction: column;
			gap: 0.5rem;
		}
	}
</style>
