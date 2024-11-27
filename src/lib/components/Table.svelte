<script lang="ts">
	import MaterialSymbolsSearch from '~icons/material-symbols/search';
	import MaterialSymbolsCategoryOutline from '~icons/material-symbols/category-outline';

	import Select from '$lib/components/Select.svelte';
	import Localized from '$lib/components/Localized.svelte';
	import SearchableLink from '$lib/components/SearchableLink.svelte';
	import DividedSearchableTags from '$lib/components/DividedSearchableTags.svelte';
	import { formatGenre } from '$lib/genre';
	import type { Sheet } from '$lib/data';

	interface Props {
		data: {
			日本語?: string;
			English?: string;
			中文?: string;
			Aynu?: string;
			'註 / Notes'?: string;
			sheetName: string;
		}[];
		sheets: Sheet[];
	}

	let { data, sheets }: Props = $props();

	let allCategories: Map<
		string,
		{
			label: string;
			count: number;
		}
	> = $derived(
		new Map(
			[...new Set(data.map((row) => row.sheetName))].map((item) => [
				item,
				{
					label: item.replace('_', ' '),
					count: data.filter((row) => row.sheetName === item).length
				}
			])
		)
	);

	let selectedCategories:
		| {
				value: string;
				label: string;
		  }[]
		| undefined = $state(undefined);

	$inspect('allCategories', allCategories);
	$inspect('selectedCategories', selectedCategories);

	let query: string = $state('');
	let filtered = $derived(
		data
			.filter((row: any) => {
				return selectedCategories?.some((category) => category.value === row.sheetName);
			})
			.filter((row: any) => {
				return Object.values(row).some((value: any) => {
					if (typeof value === 'string') {
						return value.toLowerCase().includes(query.toLowerCase());
					}
					return false;
				});
			})
	);
</script>

<div
	class="query-form-container flex flex-col md:grid md:grid-cols-[auto_1fr_1.5fr_1fr] w-full md:w-max md:text-left gap-2 md:gap-4 md:items-center mb-10 md:whitespace-nowrap"
>
	<div class="query-form contents">
		<label for="search" class="flex items-center justify-start gap-2 md:contents">
			<MaterialSymbolsSearch />
			<Localized eng="Search" ain="Ihunara" jap="検索" />
		</label>
		<input
			type="text"
			name=""
			id="search"
			bind:value={query}
			class="w-full p-2 h-10 m-0 min-w-[220px] bg-white shadow-hard border border-gray-900 text-sm"
		/>
		<span class="text-xs text-right md:text-base md:text-left"
			>{filtered.length} / {data.length}</span
		>
	</div>

	<div class="query-form contents">
		<Select
			options={allCategories}
			bind:selected={selectedCategories}
			labelClass="flex items-center justify-start gap-2 md:contents"
		>
			<MaterialSymbolsCategoryOutline />
			<Localized ain="Katekori" jap="分類" eng="Categories" />
		</Select>
		<span class="text-xs text-right md:text-base md:text-left"
			>{selectedCategories?.length ?? allCategories.size} / {allCategories.size}</span
		>
	</div>
</div>

<div class="overflow-x-auto">
	<table class="w-full border-collapse m-0 overflow-x-auto text-sm md:text-base">
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
					<td
						class="capitalize"
						title={sheets.find((sheet) => sheet.sheetName === row.sheetName)?.description ??
							formatGenre(row.sheetName)}>{formatGenre(row.sheetName)}</td
					>
					<td><DividedSearchableTags content={row.日本語 ?? ''} language="ja" /></td>
					<td><DividedSearchableTags content={row.English ?? ''} language="en" /></td>
					<td><DividedSearchableTags content={row.中文 ?? ''} language="zh" /></td>
					<td><SearchableLink content={row.Aynu ?? ''} /></td>
					<td>{row['註 / Notes'] ?? ''}</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<style lang="postcss">
	th {
		@apply bg-neutral-200 border-black p-2 border;
	}

	td {
		@apply border-black p-1 md:p-2 border;
	}
</style>
