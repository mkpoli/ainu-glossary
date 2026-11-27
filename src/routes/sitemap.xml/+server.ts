import { isPlaceholderLike } from '$lib/placeholder';
import { segment } from '$lib/segment';
import { glossaryBucket } from '$lib/server/data';
import { getGlossary, type Glossary } from '$lib/server/glossary';
import type { RequestHandler } from './$types';

import { cjk2zhs } from 'cjk-conv';
import { latn2kana } from '$lib/kana';

function isWord(word: string): boolean {
	if (isPlaceholderLike(word)) {
		return false;
	}
	if (word.match(/^[\p{P}\p{S}]+$/u)) {
		return false;
	}
	return word.trim().length > 0;
}

const JAPANESE_PARTICLES = new Set(['の', 'は', 'が', 'を', 'に', 'で', 'と', 'も', 'へ', 'や']);

function isJunkWord(word: string): boolean {
	if (/^\d+$/.test(word)) {
		return true;
	}
	return false;
}

function isJunkJapaneseWord(word: string): boolean {
	if (isJunkWord(word)) {
		return true;
	}
	if (JAPANESE_PARTICLES.has(word)) {
		return true;
	}
	return /^[\p{Script=Hiragana}\p{Script=Katakana}]$/u.test(word);
}

function isJunkEnglishWord(word: string): boolean {
	if (isJunkWord(word)) {
		return true;
	}
	return /^[a-zA-Z]$/.test(word);
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

function escapeXml(text: string): string {
	return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function generateSitemap(hostname: string, urls: string[], lastmod?: string) {
	const lastmodTag = lastmod ? `<lastmod>${lastmod}</lastmod>` : '';
	return `<?xml version="1.0" encoding="UTF-8" ?>
		<urlset
			xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
		>
      <url>
        <loc>${hostname}</loc>
        ${lastmodTag}
      </url>
      ${urls
				.map(
					(url) => `<url><loc>${escapeXml(new URL(url, hostname).toString())}</loc>${lastmodTag}</url>`
				)
				.join('\n')}
		</urlset>`;
}

function buildSitemap({ table, lastModified }: Glossary): string {
	const lastmod = lastModified.toISOString().slice(0, 10);
	const urls: Set<string> = new Set(
		table.flatMap((item) => [
			...(item.Aynu
				? extractLinkableWords(item.Aynu)
						.filter((word) => !isJunkWord(word))
						.flatMap((latn) => [latn, latn2kana(latn)])
						.map((word) => `/${word}`)
				: []),
			...(item.日本語
				? extractLinkableWordsWithLanguage(item.日本語, 'ja')
						.filter((word) => !isJunkJapaneseWord(word))
						.map((word) => `/ja/${word}`)
				: []),
			...(item.English
				? extractLinkableWordsWithLanguage(item.English, 'en')
						.filter((word) => !isJunkEnglishWord(word))
						.map((word) => `/en/${word}`)
				: []),
			...(item.中文
				? extractLinkableWordsWithLanguage(item.中文, 'zh-Hant')
						.filter((word) => !isJunkWord(word))
						.flatMap((word) => [word, cjk2zhs(word)])
						.map((word) => `/zh/${word}`)
				: [])
		])
	);
	return generateSitemap('https://itak.aynu.org/', Array.from(urls), lastmod);
}

// Segmenting every entry is the costly part, so each glossary build renders its sitemap once.
const sitemaps = new WeakMap<Glossary, string>();

export const GET: RequestHandler = async ({ platform }) => {
	const glossary = await getGlossary(glossaryBucket(platform));
	let sitemap = sitemaps.get(glossary);
	if (!sitemap) {
		sitemap = buildSitemap(glossary);
		sitemaps.set(glossary, sitemap);
	}
	return new Response(sitemap, {
		headers: {
			'Content-Type': 'application/xml',
			'Cache-Control': 'public, max-age=3600, s-maxage=86400'
		}
	});
};
