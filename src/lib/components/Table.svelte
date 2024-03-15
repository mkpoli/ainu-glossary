<script lang="ts">
	export let data: any;
</script>

<table>
	<thead>
		<tr>
			<th>類型</th>
			<th>日本語</th>
			<th>English</th>
			<th>中文</th>
			<th>Aynuitak</th>
			<th>注 / Notes</th>
		</tr>
	</thead>
	<tbody>
		{#each data as row}
			<tr>
				<td>{row.sheetName ?? ''}</td>
				<td>{row.日本語 ?? ''}</td>
				<td>{row.English ?? ''}</td>
				<td>{row.中文 ?? ''}</td>
				<td>{row.Aynu ?? ''}</td>
				<td>{row['註 / Notes'] ?? ''}</td>
			</tr>
		{/each}
	</tbody>
</table>

<style>
	table {
		width: 100%;
		border-collapse: collapse;
		margin: 1rem 0;
	}

	th,
	td {
		border: 1px solid #000;
		padding: 0.5rem;
	}

	th {
		background-color: #f0f0f0;
	}
</style>
