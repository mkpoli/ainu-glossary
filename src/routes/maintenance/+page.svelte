<script lang="ts">
	import { GOOGLE_SHEET_LINK } from '$lib/data';

	let loading = $state(false);
</script>

<button
	onclick={async () => {
		console.log('Requesting data from Google Sheets...'); // eslint-disable-line no-console
		loading = true;
		try {
			await fetch('/api/gdoc', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ link: GOOGLE_SHEET_LINK })
			});
		} catch (e) {
			console.error(e); // eslint-disable-line no-console
		} finally {
			loading = false;
		}
	}}
	disabled={loading}
	>{loading ? '◉ データ取得中…' : '最新データを取得（Vercel・旧・動かない可能性が大）'}</button
>

<button
	onclick={async () => {
		console.log('Requesting data from Google Sheets...'); // eslint-disable-line no-console
		loading = true;
		try {
			await fetch('https://ainu-glossary-cron-data-update.mkpoli.workers.dev/');
		} catch (e) {
			console.error(e); // eslint-disable-line no-console
		} finally {
			loading = false;
		}
	}}
	disabled={loading}>{loading ? '◉ データ取得中…' : '最新データを取得（Cloudflare・新）'}</button
>

<p>週に一回（UTCの日曜日の朝3時、JSTの日曜日の正午12時）自動的に実行されます。</p>
