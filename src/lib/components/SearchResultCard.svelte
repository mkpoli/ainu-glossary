<script lang="ts">
	import type { Entry } from '$lib/data';
	import { formatGenre, generateColorHashFromString } from '$lib/genre';

	let { item }: { item: Entry } = $props();
</script>

<section
	class="px-6 py-4 shadow-hard border border-black grid grid-cols-[1fr_auto] gap-4 items-start"
>
	<h2 class="m-0">{item.Aynu}</h2>
	<div>
		<!-- Genre -->
		<div
			class={`${generateColorHashFromString(item.sheetName)} text-neutral-800 rounded-md w-max px-2 py-1`}
		>
			{formatGenre(item.sheetName)}
		</div>
	</div>
	<div class="col-span-2">
		<p lang="en">{item.English}</p>
		<p lang="ja">{item.日本語}</p>
		<p lang="zh">{item.中文}</p>
	</div>
</section>
