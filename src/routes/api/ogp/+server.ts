// src/routes/posts/ogp/[title].png/+server.ts
import { generateImage } from '$lib/server/image';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ request, fetch }) => {
	const { searchParams } = new URL(request.url);
	const latn = searchParams.get('latn');
	const kanji = searchParams.get('kana');
	const png = await generateImage([latn ?? 'pirka', kanji ?? 'ピㇼカ'], fetch);

	return new Response(png, {
		headers: {
			'Content-Type': 'image/png'
		}
	});
};
