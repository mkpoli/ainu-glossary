<script lang="ts">
	import MaterialSymbolsSearch from '~icons/material-symbols/search';
	import MaterialSymbolsCategoryOutline from '~icons/material-symbols/category-outline';

	import Select from '$lib/components/ui/Select.svelte';
	import Localized from '$lib/components/ui/Localized.svelte';
	import SearchableLink from '$lib/components/links/SearchableLink.svelte';
	import DividedSearchableTags from '$lib/components/links/DividedSearchableTags.svelte';
	import { formatGenre } from '$lib/genre';
	import type { Entry, Sheet } from '$lib/data';
	import { browser } from '$app/environment';
	import ReferenceLink from '$lib/components/links/ReferenceLink.svelte';

	import groupBy from 'object.groupby';
	import Switch from '../ui/Switch.svelte';

	import m from '$lib/script.svelte';
	import T from '../ui/T.svelte';

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

	let groupedBySheetName = $derived(groupBy(data, (row) => row.sheetName));
	$inspect('groupedBySheetName', groupedBySheetName);
</script>

<svelte:window on:resize={() => (isLargeScreen = browser ? window.innerWidth >= 768 : false)} />

<div
	class="query-form-container mb-10 flex w-full flex-col gap-2 md:grid md:w-max md:grid-cols-[auto_1fr_1.5fr_1fr] md:items-center md:gap-4 md:whitespace-nowrap md:text-left"
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
			class="m-0 h-10 w-full min-w-[220px] border border-gray-900 bg-white p-2 text-sm shadow-hard focus:border-black focus:ring-black"
		/>
		<span class="text-right text-xs md:text-left md:text-base"
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
		<span class="text-right text-xs md:text-left md:text-base"
			>{selectedCategories?.length ?? allCategories.size} / {allCategories.size}</span
		>
	</div>
	<div class="query-form col-span-4 flex items-center justify-center">
		<Switch
			checked={m.script === 'Kana'}
			onchange={(checked) => (m.script = checked ? 'Kana' : 'Latn')}
		>
			Romanci{#snippet on()}カタカナ{/snippet}
		</Switch>
	</div>
</div>

<div class="w-full overflow-x-auto">
	{#if isLargeScreen}
		<table class="m-0 w-full border-collapse overflow-x-auto text-sm md:text-base">
			<thead>
				<tr>
					<th>類型 / Type</th>
					<th>日本語</th>
					<th>English</th>
					<th>中文</th>
					<th><T t="Aynuitak" /></th>
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
						<tr class="even:bg-gray-50">
							<td
								class="capitalize"
								title={sheets.find((sheet) => sheet.sheetName === row.sheetName)?.description ??
									formatGenre(row.sheetName)}>{formatGenre(row.sheetName)}</td
							>
							<td><DividedSearchableTags content={row.日本語 ?? ''} language="ja" /></td>
							<td><DividedSearchableTags content={row.English ?? ''} language="en" /></td>
							<td><DividedSearchableTags content={row.中文 ?? ''} language="zh" /></td>
							<td><SearchableLink content={row.Aynu ?? ''} /></td>
							<td><ReferenceLink content={row['註 / Notes'] ?? ''} /></td>
						</tr>
					{/each}
				{/if}
			</tbody>
		</table>
	{:else}
		<div class="flex flex-col">
			{#each Object.entries(groupedBySheetName) as [sheetName, rows]}
				<h2 class="m-0 my-2 capitalize">{sheetName.replaceAll('_', ' ')}</h2>
				{#if rows}
					{#each rows as row}
						<div class="border border-black p-2">
							<h3 class="m-0 font-bold"><SearchableLink content={row.Aynu ?? ''} /></h3>
							<p title="English">
								<DividedSearchableTags content={row.English ?? ''} language="en" />
							</p>
							<p title="日本語">
								<DividedSearchableTags content={row.日本語 ?? ''} language="ja" />
							</p>
							<p title="中文"><DividedSearchableTags content={row.中文 ?? ''} language="zh" /></p>
							<p title="註 / Notes"><ReferenceLink content={row['註 / Notes'] ?? ''} /></p>
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
		@apply border border-black bg-neutral-200 p-2;
	}

	td {
		@apply border border-black p-1 md:p-2;
	}
</style>
