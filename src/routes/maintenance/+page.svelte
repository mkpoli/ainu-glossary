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
	disabled={loading}>{loading ? '◉ データ取得中…' : '最新データを取得'}</button
>
