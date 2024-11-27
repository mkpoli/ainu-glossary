<script lang="ts">
	import MaterialSymbolsSearch from '~icons/material-symbols/search';
	import MaterialSymbolsCategoryOutline from '~icons/material-symbols/category-outline';

	import Select from '$lib/components/Select.svelte';
	import Localized from '$lib/components/Localized.svelte';
	import SearchableLink from '$lib/components/SearchableLink.svelte';
	import DividedSearchableTags from '$lib/components/DividedSearchableTags.svelte';
	import { formatGenre } from '$lib/genre';
	import type { Entry, Sheet } from '$lib/data';
	import { browser } from '$app/environment';
	import SearchResultCard from './SearchResultCard.svelte';

	interface Props {
		data: Entry[];
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
					label: item.replaceAll('_', ' '),
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

	let isLargeScreen = $state(browser ? window.innerWidth >= 768 : false);
	$inspect('isLargeScreen', isLargeScreen);

	let groupedBySheetName = $derived(Object.groupBy(data, (row) => row.sheetName));
	$inspect('groupedBySheetName', groupedBySheetName);
</script>

<svelte:window on:resize={() => (isLargeScreen = browser ? window.innerWidth >= 768 : false)} />

<div
	class="query-form-container flex flex-col md:grid md:grid-cols-[auto_1fr_1.5fr_1fr] w-full md:w-max md:text-left gap-2 md:gap-4 md:items-center mb-10 md:whitespace-nowrap"
>
	<div class="query-form contents">
		<label for="search" class="flex items-center justify-start gap-2 md:contents">
			<MaterialSymbolsSearch />
			<Localized eng="Search" ain="Ihunara" jpn="検索" />
		</label>
		<input
			type="text"
			name=""
			id="search"
			bind:value={query}
			class="w-full p-2 h-10 m-0 min-w-[220px] bg-white shadow-hard border border-gray-900 text-sm focus:ring-black focus:border-black"
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
			<Localized ain="Katekori" jpn="分類" eng="Categories" />
		</Select>
		<span class="text-xs text-right md:text-base md:text-left"
			>{selectedCategories?.length ?? allCategories.size} / {allCategories.size}</span
		>
	</div>
</div>

<div class="overflow-x-auto w-full">
	{#if isLargeScreen}
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
				{#if filtered.length === 0}
					<tr>
						<td colspan="6" class="text-center"
							><Localized
								ain="A=hunara hike ka isam"
								jpn="検索結果がありません"
								eng="No results found"
							/></td
						>
					</tr>
				{:else}
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
				{/if}
			</tbody>
		</table>
	{:else}
		<div class="flex flex-col">
			{#each Object.entries(groupedBySheetName) as [sheetName, rows]}
				<h2 class="m-0 capitalize my-2">{sheetName.replaceAll('_', ' ')}</h2>
				{#if rows}
					{#each rows as row}
						<div class="border border-black p-2">
							<h3 class="m-0 font-bold">{row.Aynu}</h3>
							<p title="English">{row.English}</p>
							<p title="日本語">{row.日本語}</p>
							<p title="中文">{row.中文}</p>
							<p title="註 / Notes">{row['註 / Notes']}</p>
						</div>
					{/each}
				{:else}
					<p>
						<Localized
							ain="A=hunara hike ka isam"
							jpn="検索結果がありません"
							eng="No results found"
						/>
					</p>
				{/if}
			{/each}
		</div>
	{/if}
</div>

<style lang="postcss">
	th {
		@apply bg-neutral-200 border-black p-2 border;
	}

	td {
		@apply border-black p-1 md:p-2 border;
	}
</style>
