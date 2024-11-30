<script>
	import { SITE_TITLE } from '$lib/consts';
	import ScriptSwitch from '$lib/components/controls/ScriptSwitch.svelte';
	import T from '$lib/components/ui/T.svelte';
	import MaterialSymbolsSearch from '~icons/material-symbols/search';
	import m from '$lib/script.svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	let search = $state('');
</script>

<header class="mx-auto mb-4 flex max-w-prose flex-col items-center justify-center gap-2">
	<div class="flex items-center gap-2">
		<picture class="my-4">
			<source srcset="/android-chrome-192x192.avif" type="image/avif" />
			<source srcset="/android-chrome-192x192.webp" type="image/webp" />
			<img src="/android-chrome-192x192.png" alt="Logo" class="h-10 w-10" />
		</picture>
		<h1 class="mb-2 mt-2 text-xl md:my-1">
			<a href="/" class="text-inherit no-underline hover:text-theme-800 hover:underline"
				><T t={SITE_TITLE} /></a
			>
		</h1>
	</div>
	<div class="flex w-full flex-col items-center justify-stretch gap-2">
		<form
			onsubmit={(e) => {
				e.preventDefault();
				goto(`/${search}`);
			}}
			class="flex h-fit items-stretch gap-2"
		>
			<input
				type="search"
				placeholder={decodeURI(
					$page.url.pathname.split('/').at(-1) ?? m.localized('Ihunara', '検索', 'Search')
				)}
				class="h-10 w-64 flex-1"
				bind:value={search}
			/>
			<button class="h-10 h-full" type="submit">
				<MaterialSymbolsSearch />
			</button>
		</form>
		<ScriptSwitch short />
	</div>
</header>
