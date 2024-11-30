<script lang="ts">
	import MaterialSymbolsSearch from '~icons/material-symbols/search';
	import MaterialSymbolsCategoryOutline from '~icons/material-symbols/category-outline';

	import Select from '$lib/components/ui/Select.svelte';
	import Localized from '$lib/components/ui/Localized.svelte';
	import SearchableLink from '$lib/components/links/SearchableLink.svelte';
	import SegmentedTranslationLink from '$lib/components/links/SegmentedTranslationLink.svelte';
	import ReferenceLink from '$lib/components/links/ReferenceLink.svelte';
	import ScriptSwitch from '$lib/components/controls/ScriptSwitch.svelte';
	import T from '$lib/components/ui/T.svelte';

	import { formatGenre } from '$lib/genre';
	import type { Entry, Sheet } from '$lib/data';
	import { browser } from '$app/environment';

	import { goto } from '$app/navigation';

	import groupBy from 'object.groupby';
	import { search } from '$lib/search';
	import type { FuseResultMatch } from 'fuse.js';

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
	let dataFilteredByCategories = $derived(
		data.filter((row) => {
			return selectedCategories?.some((category) => category.value === row.sheetName);
		})
	);
	let filtered: {
		item: Entry;
		matches: readonly FuseResultMatch[] | undefined;
	}[] = $derived(
		query
			? search(query, ['ain', 'en', 'ja', 'zh'], dataFilteredByCategories)
			: dataFilteredByCategories.map((item) => ({ item, matches: undefined }))
	);

	let isLargeScreen = $state(browser ? window.innerWidth >= 768 : false);
	$inspect('isLargeScreen', isLargeScreen);

	let groupedBySheetName = $derived(groupBy(filtered, ({ item }) => item.sheetName));
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
	<ScriptSwitch />
</div>

{#snippet notFound()}
	<div class="flex flex-col items-center gap-2">
		<Localized ain="A=hunara hike ka isam" jpn="検索結果がありません" eng="No results found" />
		<button
			onclick={() => {
				goto(`/${query}`);
			}}
		>
			<Localized ain="Homar ihunara wa inkar" jpn="曖昧検索を試す" eng="Try fuzzy search" />
		</button>
	</div>
{/snippet}

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
						<td colspan="6" class="text-center">
							{@render notFound()}
						</td>
					</tr>
				{:else}
					{#each filtered as { item: row, matches }}
						{@const highlights = groupBy(matches ?? [], (match) => match.key ?? '')}
						<tr class="even:bg-gray-50">
							<td
								class="capitalize"
								title={sheets.find((sheet) => sheet.sheetName === row.sheetName)?.description ??
									formatGenre(row.sheetName)}>{formatGenre(row.sheetName)}</td
							>
							<td
								><SegmentedTranslationLink
									content={row.日本語 ?? ''}
									language="ja"
									highlight={highlights.日本語}
								/></td
							>
							<td
								><SegmentedTranslationLink
									content={row.English ?? ''}
									language="en"
									highlight={highlights.English}
								/></td
							>
							<td
								><SegmentedTranslationLink
									content={row.中文 ?? ''}
									language="zh"
									highlight={highlights.中文}
								/></td
							>
							<td>
								<SearchableLink
									content={row.Aynu ?? ''}
									highlight={highlights.Aynu}
									highlightKana={highlights.カナ}
								/>
							</td>
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
					{#each rows as { item: row, matches }}
						{@const highlights = groupBy(matches ?? [], (match) => match.key ?? '')}
						<div class="border border-black p-2">
							<h3 class="m-0 font-bold">
								<SearchableLink
									content={row.Aynu ?? ''}
									highlight={highlights.Aynu}
									highlightKana={highlights.カナ}
								/>
							</h3>
							<p title="English">
								<SegmentedTranslationLink
									content={row.English ?? ''}
									language="en"
									highlight={highlights.English}
								/>
							</p>
							<p title="日本語">
								<SegmentedTranslationLink
									content={row.日本語 ?? ''}
									language="ja"
									highlight={highlights.日本語}
								/>
							</p>
							<p title="中文">
								<SegmentedTranslationLink
									content={row.中文 ?? ''}
									language="zh"
									highlight={highlights.中文}
								/>
							</p>
							<p title="註 / Notes"><ReferenceLink content={row['註 / Notes'] ?? ''} /></p>
						</div>
					{/each}
				{:else}
					{@render notFound()}
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
