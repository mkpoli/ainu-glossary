<script lang="ts">
	import MaterialSymbolsSearch from '~icons/material-symbols/search';
	import MaterialSymbolsCategoryOutline from '~icons/material-symbols/category-outline';

	import Select from '$lib/components/ui/Select.svelte';
	import Localized from '$lib/components/ui/Localized.svelte';
	import SearchableLink from '$lib/components/links/SegmentedAinuLink.svelte';
	import SegmentedTranslationLink from '$lib/components/links/SegmentedTranslationLink.svelte';
	import ReferenceLink from '$lib/components/links/ReferenceLink.svelte';
	import ScriptSwitch from '$lib/components/controls/ScriptSwitch.svelte';
	import T from '$lib/components/ui/T.svelte';

	import { formatGenre } from '$lib/genre';
	import type { Entry, Sheet } from '$lib/data';
	import { browser } from '$app/environment';

	import { goto } from '$app/navigation';

	import groupBy from 'object.groupby';
	import { SearchIndex, type SearchResult } from '$lib/search';

	import m from '$lib/script.svelte';

	import PajamasExternalLink from '~icons/pajamas/external-link';

	interface Props {
		data: Entry[];
		sheets: Sheet[];
	}

	let { data, sheets }: Props = $props();

	let searchIndex = $derived(new SearchIndex(data, ['ain', 'en', 'ja', 'zh']));

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
	let filtered: SearchResult[] = $derived(searchIndex.search(query, dataFilteredByCategories));

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
		<form
			class="relative"
			onsubmit={(e) => {
				e.preventDefault();
				goto(`/${query}`);
			}}
		>
			<input type="text" name="search" id="search" bind:value={query} />
			<a
				class="absolute bottom-0 right-0 top-0 z-10 flex items-center justify-center border-none bg-transparent p-2 text-inherit shadow-none hover:bg-transparent hover:text-theme-600 hover:shadow-none {Boolean(
					query
				)
					? 'visible'
					: 'invisible'}"
				title={m.localized(
					'Asir puyar or wa nukar',
					'新しいウィンドウで見る',
					'Open in new window'
				)}
				href={`/${query}`}
				target="_blank"
			>
				<PajamasExternalLink />
			</a>
		</form>
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
	</div>
{/snippet}

<div class="w-full overflow-x-auto">
	<table class="m-0 hidden w-full border-collapse overflow-x-auto text-sm md:table md:text-base">
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
				{#each filtered as { item: row, hasHighlightedSegments, segments }}
					<tr class="even:bg-gray-50">
						<td
							class="capitalize"
							title={sheets.find((sheet) => sheet.sheetName === row.sheetName)?.description ??
								formatGenre(row.sheetName)}>{formatGenre(row.sheetName)}</td
						>
						<td><SegmentedTranslationLink segments={segments.ja} language="ja" /></td>
						<td><SegmentedTranslationLink segments={segments.en} language="en" /></td>
						<td><SegmentedTranslationLink segments={segments.zh} language="zh" /></td>
						<td>
							<SearchableLink
								hasHighlightInLatn={hasHighlightedSegments.ain}
								hasHighlightInKana={hasHighlightedSegments['ain-Kana']}
								segmentsLatn={segments.ain}
								segmentsKana={segments['ain-Kana']}
							/>
						</td>
						<td><ReferenceLink content={row['註 / Notes'] ?? ''} /></td>
					</tr>
				{/each}
			{/if}
		</tbody>
	</table>
	<div class="flex flex-col md:hidden">
		{#each Object.entries(groupedBySheetName) as [sheetName, rows]}
			<h2 class="m-0 my-2 capitalize">{sheetName.replaceAll('_', ' ')}</h2>
			{#if rows}
				{#each rows as { item: row, hasHighlightedSegments, segments }}
					<div class="border border-black p-2">
						<h3 class="m-0 font-bold">
							<SearchableLink
								hasHighlightInLatn={hasHighlightedSegments.ain}
								hasHighlightInKana={hasHighlightedSegments['ain-Kana']}
								segmentsLatn={segments.ain}
								segmentsKana={segments['ain-Kana']}
							/>
						</h3>
						<p title="日本語">
							<SegmentedTranslationLink segments={segments.ja} language="ja" />
						</p>
						<p title="English">
							<SegmentedTranslationLink segments={segments.en} language="en" />
						</p>
						<p title="中文">
							<SegmentedTranslationLink segments={segments.zh} language="zh" />
						</p>
						<p title="註 / Notes">
							<ReferenceLink content={row['註 / Notes'] ?? ''} />
						</p>
					</div>
				{/each}
			{:else}
				{@render notFound()}
			{/if}
		{/each}
	</div>
</div>

<style lang="postcss">
	th {
		@apply border border-black bg-neutral-200 p-2;
	}

	td {
		@apply border border-black p-1 md:p-2;
	}
</style>
