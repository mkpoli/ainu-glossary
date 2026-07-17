// src/routes/posts/ogp/[title].png/+server.ts
import { generateImage } from '$lib/server/image';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ request, fetch, platform }) => {
	const { searchParams } = new URL(request.url);
	// Static assets must come from the ASSETS binding: SvelteKit's fetch falls
	// through to the network for them, and the worker cannot reach its own
	// hostname.
	const assetFetch: typeof fetch = platform?.env?.ASSETS
		? (input, init) =>
				platform.env.ASSETS.fetch(
					new Request(new URL(input instanceof Request ? input.url : input, request.url), init)
				)
		: fetch;
	const latn = searchParams.get('latn');
	const kanji = searchParams.get('kana');
	const png = await generateImage([latn ?? 'pirka', kanji ?? 'ピㇼカ'], assetFetch);

	return new Response(png, {
		headers: {
			'Content-Type': 'image/png',
			'Cache-Control': 'public, max-age=604800, s-maxage=31536000'
		}
	});
};
