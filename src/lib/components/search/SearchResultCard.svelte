<script lang="ts">
	import type { Entry, Sheet } from '$lib/data';
	import { formatGenre, generateColorHashFromString } from '$lib/genre';
	import SegmentedTranslationLink from '$lib/components/links/SegmentedTranslationLink.svelte';
	import SearchableLink from '../links/SearchableLink.svelte';
	import ReferenceLink from '../links/ReferenceLink.svelte';
	import type { FuseResultMatch } from 'fuse.js';
	import groupBy from 'object.groupby';
	let {
		item,
		sheets,
		matches
	}: { item: Entry; sheets: Sheet[]; matches: readonly FuseResultMatch[] | undefined } = $props();

	let highlights = $derived(groupBy(matches ?? [], (match) => match.key ?? ''));
</script>

<section
	class="grid grid-cols-[1fr_auto] items-start gap-4 border border-black px-6 py-4 shadow-hard"
>
	<h2 class="m-0"><SearchableLink content={item.Aynu ?? ''} highlight={highlights['Aynu']} /></h2>
	<div class="flex justify-end gap-2">
		<!-- Genre -->
		<div
			class={`${generateColorHashFromString(item.sheetName)} w-max rounded-md px-2 py-1 text-neutral-800`}
			title={sheets.find((sheet) => sheet.sheetName === item.sheetName)?.description ??
				formatGenre(item.sheetName)}
		>
			{formatGenre(item.sheetName)}
		</div>
	</div>
	<div>
		<p lang="ja">
			<SegmentedTranslationLink
				content={item.日本語 ?? ''}
				language="ja"
				highlight={highlights['日本語']}
			/>
		</p>
		<p lang="en">
			<SegmentedTranslationLink
				content={item.English ?? ''}
				language="en"
				highlight={highlights['English']}
			/>
		</p>
		<p lang="zh">
			<SegmentedTranslationLink
				content={item.中文 ?? ''}
				language="zh"
				highlight={highlights['中文']}
			/>
		</p>
	</div>
	<div><ReferenceLink content={item['註 / Notes'] ?? ''} /></div>
</section>
