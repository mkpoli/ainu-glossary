<script lang="ts">
	import Select from '$lib/components/Select.svelte';
	import type { Writable } from 'svelte/store';

	export let data: {
		日本語?: string;
		English?: string;
		中文?: string;
		Aynu?: string;
		'註 / Notes'?: string;
		sheetName: string;
	}[];

	let query: string = '';
	let filtered: any[] = [];

	let allCategories: Map<
		string,
		{
			label: string;
			count: number;
		}
	>;
	let selectedCategories: Writable<
		{
			value: string;
			label: string;
		}[]
	>;
	$: allCategories = new Map(
		[...new Set(data.map((row) => row.sheetName))].map((item) => [
			item,
			{
				label: item.replace('_', ' '),
				count: data.filter((row) => row.sheetName === item).length
			}
		])
	);
	$: console.log('allCategories', allCategories);
	$: console.log('selectedCategories', $selectedCategories);

	$: filtered = data
		.filter((row: any) => {
			return $selectedCategories?.some((category) => category.value === row.sheetName);
		})
		.filter((row: any) => {
			return Object.values(row).some((value: any) => {
				if (typeof value === 'string') {
					return value.toLowerCase().includes(query.toLowerCase());
				}
				return false;
			});
		});
</script>

<div class="query-form-container">
	<div class="query-form">
		<label for="search">A=hunara / 検索 / Search</label>
		<input type="text" name="" id="search" bind:value={query} />
		<span>{filtered.length} / {data.length}</span>
	</div>

	<div class="query-form">
		<Select
			label="Isoneka / 類型 / Type"
			options={allCategories}
			bind:selected={selectedCategories}
		/>
		<span>{$selectedCategories?.length ?? allCategories.size} / {allCategories.size}</span>
	</div>
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

	.query-form-container {
		white-space: nowrap;
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;

		margin: 2rem auto;
		padding: 1rem;

		gap: 1rem;
	}

	.query-form {
		display: flex;

		justify-content: center;
		align-items: center;

		gap: 1rem;

		max-width: 30rem;
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

		.query-form {
			flex-direction: column;
			margin: 0.25rem;
			gap: 0.5rem;
		}

		.query-form-container {
			margin: 0.5rem;
			padding: 0.5rem;
		}

		.query-form :global(input),
		.query-form :global(button) {
			min-width: 75vw !important;
		}
	}

	input {
		width: 100%;
		padding: 0.5rem;
		margin: 0;
		height: 40px;
		min-width: 220px;
		background-color: white;
		padding: 0.5rem 12px;
		box-shadow:
			0 1px 3px rgba(0, 0, 0, 0.1),
			0 1px 2px rgba(0, 0, 0, 0.06);
		border: 1px solid #767676;
		font-family: inherit;
		font-size: 0.875rem;
	}

	label {
		display: block;
		text-align: left;
		white-space: nowrap;
	}
</style>
