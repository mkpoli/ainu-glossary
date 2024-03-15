<script lang="ts">
	export let data: any;

	let query: string = '';
	let filtered: any[] = [];

	$: filtered = data.filter((row: any) => {
		return Object.values(row).some((value: any) => {
			if (typeof value === 'string') {
				return value.toLowerCase().includes(query.toLowerCase());
			}
			return false;
		});
	});
</script>

<div class="query-form">
	<label for="search">A=hunara / 検索 / Search</label>
	<input type="text" name="" id="search" bind:value={query} />
</div>

<div class="table-container">
	<table>
		<thead>
			<tr>
				<th>類型 / Type</th>
				<th>日本語</th>
				<th>English</th>
				<th>中文</th>
				<th>Aynuitak</th>
				<th>注 / Notes</th>
			</tr>
		</thead>
		<tbody>
			{#each filtered as row}
				<tr>
					<td style="text-transform: capitalize;">{(row.sheetName ?? '').replace('_', ' ')}</td>
					<td>{row.日本語 ?? ''}</td>
					<td>{row.English ?? ''}</td>
					<td>{row.中文 ?? ''}</td>
					<td>{row.Aynu ?? ''}</td>
					<td>{row['註 / Notes'] ?? ''}</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<style>
	.table-container {
		overflow-x: auto;
	}

	table {
		width: 100%;
		border-collapse: collapse;
		margin: 0;

		overflow-x: auto;
	}

	th,
	td {
		border: 1px solid #000;
		padding: 0.5rem;
	}

	th {
		background-color: #f0f0f0;
	}

	@media (max-width: 768px) {
		table {
			width: 100%;
			font-size: 0.8rem;
		}

		th,
		td {
			padding: 0.1rem;
		}
	}

	.query-form {
		display: flex;

		justify-content: center;
		align-items: center;

		gap: 1rem;

		max-width: 30rem;

		margin: 2rem auto;
	}

	input {
		width: 100%;
		padding: 0.5rem;
		margin: 1rem 0;
	}

	label {
		display: block;
		text-align: left;
		white-space: nowrap;
	}
</style>
