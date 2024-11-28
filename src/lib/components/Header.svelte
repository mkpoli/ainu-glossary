<script>
	import { SITE_TITLE } from '$lib/consts';
</script>

<header class="flex items-center gap-2 max-w-prose mx-auto justify-center">
	<picture class="my-4">
		<source srcset="/android-chrome-192x192.avif" type="image/avif" />
		<source srcset="/android-chrome-192x192.webp" type="image/webp" />
		<img src="/android-chrome-192x192.png" alt="Logo" class="w-10 h-10" />
	</picture>
	<h1 class="text-xl mt-2 mb-2 md:my-1">
		<a href="/" class="no-underline text-inherit hover:text-theme-800 hover:underline"
			>{SITE_TITLE}</a
		>
	</h1>
</header>
