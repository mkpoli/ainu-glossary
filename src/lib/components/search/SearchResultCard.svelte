<script lang="ts">
	import type { Entry, Sheet } from '$lib/data';
	import { formatGenre, generateColorHashFromString } from '$lib/genre';
	import SegmentedTranslationLink from '$lib/components/links/SegmentedTranslationLink.svelte';
	import SearchableLink from '$lib/components/links/SegmentedAinuLink.svelte';
	import ReferenceLink from '../links/ReferenceLink.svelte';
	import type { Segment } from '$lib/segment';
	import type { AugmentedLanguage } from '$lib/search';
	let {
		item,
		sheets,
		segments,
		hasHighlightedSegments
	}: {
		item: Entry;
		sheets: Sheet[];
		segments: Record<AugmentedLanguage, readonly Segment[]>;
		hasHighlightedSegments: Record<AugmentedLanguage, boolean>;
	} = $props();
</script>

<section
	class="grid grid-cols-[1fr_auto] items-start gap-4 border border-black px-6 py-4 shadow-hard"
>
	<h2 class="m-0">
		<SearchableLink
			segmentsLatn={segments.ain}
			segmentsKana={segments['ain-Kana']}
			hasHighlightInLatn={hasHighlightedSegments.ain}
			hasHighlightInKana={hasHighlightedSegments['ain-Kana']}
		/>
	</h2>
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
			<SegmentedTranslationLink segments={segments.ja} language="ja" />
		</p>
		<p lang="en">
			<SegmentedTranslationLink segments={segments.en} language="en" />
		</p>
		<p lang="zh">
			<SegmentedTranslationLink segments={segments.zh} language="zh" />
		</p>
	</div>
	<div><ReferenceLink content={item['註 / Notes'] ?? ''} /></div>
</section>
