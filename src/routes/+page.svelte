<script lang="ts">
	import Table from '$lib/components/Table.svelte';
	import type { PageData } from './$types';

	const LINK =
		'https://docs.google.com/spreadsheets/d/1zV0gl4TWV5fkf2r9i_1P1jmH_p7LOzbhZQgm7mPwDdE/edit?usp=sharing';

	export let data: PageData;
	console.log(data);

	let loading = false;
</script>

<svelte:head>
	<title>Tane an Aynuitak-kotupte Itak-uwoeroskip</title>
	<meta name="description" content="現代アイヌ語翻訳用語集 / Modern Ainu Translation Glossary" />
	<meta name="og:title" content="Tane an Aynuitak-kotupte Itak-uwoeroskip" />
	<meta name="og:description" content="現代アイヌ語翻訳用語集 / Modern Ainu Translation Glossary" />
</svelte:head>

<main>
	<img src="/android-chrome-192x192.png" alt="Logo" />
	<h1>Tane an Aynuitak-kotupte Itak-uwoeroskip</h1>
	<p role="doc-subtitle" lang="ja">
		<span lang="ja">現代アイヌ語翻訳用語集</span> /
		<span lang="en">Modern Ainu Translation Glossary</span>
	</p>

	<p>
		Tanpe anak intennet or ta <a href={LINK} target="_blank">
			<i>Itak-uwoeroskip</i>
		</a> a=hunara wa a=upekare isaykare kusu aeywanke ne.
	</p>
	<p lang="en">
		This is a online web application to easily search and sort <a href={LINK} target="_blank"
			>the original glossary</a
		>.
	</p>
	<p lang="ja">
		これは、<a href={LINK} target="_blank">元の用語集</a
		>を簡単に検索して並べ替えるためのウェブアプリです。
	</p>

	{#if data.table && data.table.length && data.table.length > 0}
		<Table data={data.table} />
	{/if}

	<button
		on:click={async () => {
			console.log('Requesting data from Google Sheets...'); // eslint-disable-line no-console
			loading = true;
			try {
				const res = await fetch('/api/gdoc', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({ link: LINK })
				});
				const json = await res.json();
				data.table = json;
			} catch (e) {
				console.error(e); // eslint-disable-line no-console
			} finally {
				loading = false;
			}
		}}
		disabled={loading}>{loading ? '◉ データ取得中…' : '最新データを取得'}</button
	>

	<h2>参考文献 / References</h2>
	<p>
		<a
			href="https://docs.google.com/spreadsheets/d/1zV0gl4TWV5fkf2r9i_1P1jmH_p7LOzbhZQgm7mPwDdE/edit?usp=sharing#gid=1835108336"
			target="_blank">Kanpimoto opitta</a
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

	<h2>ライセンス / License</h2>

	<a href="https://creativecommons.org/licenses/by-sa/4.0/deed">
		<img
			src="https://mirrors.creativecommons.org/presskit/buttons/88x31/svg/by-sa.svg"
			alt="CC BY-SA"
		/>
	</a>

	<p>
		Tan itak-uwoeroskip anak <a
			href="https://creativecommons.org/licenses/by-sa/4.0/deed"
			target="_blank">CC BY-SA 4.0 Deed</a
		> sekor uweser eoripak yakun a=eywanke easkay.
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
</main>

<hr />
<footer>
	<p>
		© 2024 <a href="https://aynu.org/" target="_blank">Aynu.org</a>
	</p>
</footer>

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

	footer {
		padding: 1rem;
		text-align: center;
	}
</style>
