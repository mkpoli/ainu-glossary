<script lang="ts">
	export let data: any;
</script>

<table>
	<thead>
		<tr>
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
