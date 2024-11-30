import { isPlaceholderLike, segment } from '$lib/segment';
import { downloadData } from '$lib/server/data';

import { cjk2zhs } from 'cjk-conv';
import { latn2kana } from '$lib/script.svelte';

function isWord(word: string): boolean {
	if (isPlaceholderLike(word)) {
		return false;
	}
	if (word.match(/^[\p{P}\p{S}]+$/u)) {
		return false;
	}
	return word.trim().length > 0;
}

function extractLinkableWords(content: string): string[] {
	const words = content.split(/([\s,\{\}]+)/u);

	return words.filter((word) => {
		if (!isWord(word)) {
			return false;
		}

		if (!word.match(/^[a-zA-Z=\-]+$/)) {
			return false;
		}

		if (word.includes('=')) {
			const parts = word.split(/(=)/);
			return parts.filter((part) => !['a', 'an', '='].includes(part));
		}

		return true;
	});
}

function extractLinkableWordsWithLanguage(content: string, language: string): string[] {
	return [
		...segment(content, language).map((segment) => segment.segment),
		...content
			.split(/[\p{P}\p{S}]+/u)
			.filter(isWord)
			.map((word) => word.trim())
	].filter(isWord);
}

function generateSitemap(hostname: string, urls: string[]) {
	return `<?xml version="1.0" encoding="UTF-8" ?>
		<urlset
			xmlns="https://www.sitemaps.org/schemas/sitemap/0.9"
			xmlns:xhtml="https://www.w3.org/1999/xhtml"
			xmlns:mobile="https://www.google.com/schemas/sitemap-mobile/1.0"
			xmlns:news="https://www.google.com/schemas/sitemap-news/0.9"
			xmlns:image="https://www.google.com/schemas/sitemap-image/1.1"
			xmlns:video="https://www.google.com/schemas/sitemap-video/1.1"
		>
      <url>
        <loc>${hostname}</loc>
        <changefreq>daily</changefreq>
      </url>
      ${urls
				.map(
					(url) =>
						`<url><loc>${new URL(url, hostname).toString()}</loc><changefreq>daily</changefreq></url>`
				)
				.join('\n')}
		</urlset>`;
}

export async function GET() {
	const { table } = await downloadData();
	const urls: Set<string> = new Set(
		table.flatMap((item) => [
			...(item.Aynu
				? extractLinkableWords(item.Aynu)
						.flatMap((latn) => [latn, latn2kana(latn)])
						.map((word) => `/${word}`)
				: []),
			...(item.日本語
				? extractLinkableWordsWithLanguage(item.日本語, 'ja').map((word) => `/ja/${word}`)
				: []),
			...(item.English
				? extractLinkableWordsWithLanguage(item.English, 'en').map((word) => `/en/${word}`)
				: []),
			...(item.中文
				? extractLinkableWordsWithLanguage(item.中文, 'zh-Hant')
						.flatMap((word) => [word, cjk2zhs(word)])
						.map((word) => `/zh/${word}`)
				: [])
		])
	);
	return new Response(generateSitemap('https://itak.aynu.org/', Array.from(urls)), {
		headers: { 'Content-Type': 'application/xml', 'Cache-Control': 'max-age=0' }
	});
}
