<script lang="ts">
	import type { Entry, Sheet } from '$lib/data';
	import { formatGenre, generateColorHashFromString } from '$lib/genre';
	import DividedSearchableTags from '../links/DividedSearchableTags.svelte';
	import SearchableLink from '../links/SearchableLink.svelte';
	import ReferenceLink from '../links/ReferenceLink.svelte';
	let { item, sheets }: { item: Entry; sheets: Sheet[] } = $props();
</script>

<section
	class="grid grid-cols-[1fr_auto] items-start gap-4 border border-black px-6 py-4 shadow-hard"
>
	<h2 class="m-0"><SearchableLink content={item.Aynu ?? ''} /></h2>
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
		<p lang="ja"><DividedSearchableTags content={item.日本語 ?? ''} language="ja" /></p>
		<p lang="en"><DividedSearchableTags content={item.English ?? ''} language="en" /></p>
		<p lang="zh"><DividedSearchableTags content={item.中文 ?? ''} language="zh" /></p>
	</div>
	<div><ReferenceLink content={item['註 / Notes'] ?? ''} /></div>
</section>
