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
				await fetch('/api/gdoc', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({ link: LINK })
				});

				await new Promise((resolve) => setTimeout(resolve, 1000)); //

				const res = await fetch('/api/gdoc', {
					method: 'GET'
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

	<h2>Kanpimoto / 参考文献 / References</h2>
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

	<h2>Uwesere / ライセンス / License</h2>

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
		> sekor uwesere eoripak yakun a=eywanke easkay.
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

	<h2>Rinko / リンク / Links</h2>
	<div class="icon-links">
		<a class="icon" href="https://github.com/mkpoli/ainu-glossary" target="_blank" title="GitHub"
			><svg
				xmlns="http://www.w3.org/2000/svg"
				width="31"
				height="32"
				viewBox="0 0 496 512"
				aria-label="GitHub"
				><path
					fill="currentColor"
					d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6c-3.3.3-5.6-1.3-5.6-3.6c0-2 2.3-3.6 5.2-3.6c3-.3 5.6 1.3 5.6 3.6m-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9c2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2 2.3m44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9c.3 2 2.9 3.3 5.9 2.6c2.9-.7 4.9-2.6 4.6-4.6c-.3-1.9-3-3.2-5.9-2.9M244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2c12.8 2.3 17.3-5.6 17.3-12.1c0-6.2-.3-40.4-.3-61.4c0 0-70 15-84.7-29.8c0 0-11.4-29.1-27.8-36.6c0 0-22.9-15.7 1.6-15.4c0 0 24.9 2 38.6 25.8c21.9 38.6 58.6 27.5 72.9 20.9c2.3-16 8.8-27.1 16-33.7c-55.9-6.2-112.3-14.3-112.3-110.5c0-27.5 7.6-41.3 23.6-58.9c-2.6-6.5-11.1-33.3 2.6-67.9c20.9-6.5 69 27 69 27c20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27c13.7 34.7 5.2 61.4 2.6 67.9c16 17.7 25.8 31.5 25.8 58.9c0 96.5-58.9 104.2-114.8 110.5c9.2 7.9 17 22.9 17 46.4c0 33.7-.3 75.4-.3 83.6c0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252C496 113.3 383.5 8 244.8 8M97.2 352.9c-1.3 1-1 3.3.7 5.2c1.6 1.6 3.9 2.3 5.2 1c1.3-1 1-3.3-.7-5.2c-1.6-1.6-3.9-2.3-5.2-1m-10.8-8.1c-.7 1.3.3 2.9 2.3 3.9c1.6 1 3.6.7 4.3-.7c.7-1.3-.3-2.9-2.3-3.9c-2-.6-3.6-.3-4.3.7m32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2c2.3 2.3 5.2 2.6 6.5 1c1.3-1.3.7-4.3-1.3-6.2c-2.2-2.3-5.2-2.6-6.5-1m-11.4-14.7c-1.6 1-1.6 3.6 0 5.9c1.6 2.3 4.3 3.3 5.6 2.3c1.6-1.3 1.6-3.9 0-6.2c-1.4-2.3-4-3.3-5.6-2"
				/></svg
			></a
		>

		<a
			class="icon"
			href="https://x.com/mkpoli/status/1768640802971156809?s=20"
			target="_blank"
			title="X"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="32"
				height="32"
				viewBox="0 0 512 512"
				aria-label="X"
				><path
					fill="currentColor"
					d="M389.2 48h70.6L305.6 224.2L487 464H345L233.7 318.6L106.5 464H35.8l164.9-188.5L26.8 48h145.6l100.5 132.9zm-24.8 373.8h39.1L151.1 88h-42z"
				/></svg
			>
		</a>
	</div>

	<ul>
		<li></li>
		<li>
			<a href="https://aynu.org/" target="_blank">Aynu.org</a>
		</li>
		<li>
			<a href="https://wiki.aynu.org/" target="_blank">Aynuwiki</a>
		</li>
		<!-- * [https://dict.aynu.org/ Aynuitak-Eonnekunnep -{(dict.aynu.org)}-]
		* [https://itak.aynu.org/ Tane an Aynuitak-kotupte Itak-uwoeroskip -{(itak.aynu.org)}-]
		* [https://site.aynu.org/ Aynuitak Inuypa Ukosammaani Sayto -{(site.aynu.org)}-] -->
		<li>
			<a href="https://dict.aynu.org/" target="_blank">Aynuitak-Eonnekunnep</a>
		</li>
		<li>
			<a href="https://site.aynu.org/" target="_blank">Aynuitak Inuypa Ukosammaani Sayto</a>
		</li>
	</ul>
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

	@media (max-width: 768px) {
		h1 {
			font-size: 1.25rem;
			margin-top: 0.25rem;
			margin-bottom: 0.25rem;
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

		img {
			width: 3rem;
			height: 3rem;
		}
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

	a.icon svg {
		width: 2.5rem;
		height: 2.5rem;
	}
</style>
