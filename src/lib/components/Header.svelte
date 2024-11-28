<script>
	import { SITE_TITLE } from '$lib/consts';
	import ScriptSwitch from '$lib/components/controls/ScriptSwitch.svelte';
	import T from '$lib/components/ui/T.svelte';
</script>

<header class="mx-auto flex max-w-prose flex-col items-center justify-center gap-2">
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
	<div class="ml-auto mr-0 self-end">
		<ScriptSwitch short />
	</div>
</header>
