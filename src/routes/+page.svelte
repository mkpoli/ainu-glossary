<script lang="ts">
	import Table from '$lib/components/Table.svelte';
	import type { PageData } from './$types';

	const LINK =
		'https://docs.google.com/spreadsheets/d/1zV0gl4TWV5fkf2r9i_1P1jmH_p7LOzbhZQgm7mPwDdE/edit?usp=sharing';

	export let data: PageData;
	console.log(data);

	let loading = false;
</script>

<main>
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
</style>
