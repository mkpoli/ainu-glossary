import { downloadData } from '$lib/server/data';

function extractLinkableWords(content: string): string[] {
	const words = content.split(/([\s,\{\}]+)/u);

	return words.filter((word) => {
		if (word.match(/^[VNA]\d$/)) {
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
	const segmenter = new Intl.Segmenter(language, { granularity: 'word' });
	return Array.from(segmenter.segment(content))
		.map((segment) => segment.segment)
		.filter((word) => {
			if (word.match(/^[VNA]\d$/)) {
				return false;
			}
			if (word.match(/\p{P}/u)) {
				return false;
			}
			return word.trim().length > 0;
		});
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
	const data = await downloadData();
	const urls: Set<string> = new Set(
		data.flatMap((item) => [
			...(item.Aynu ? extractLinkableWords(item.Aynu).map((word) => `/${word}`) : []),
			...(item.日本語
				? extractLinkableWordsWithLanguage(item.日本語, 'ja').map((word) => `/ja/${word}`)
				: []),
			...(item.English
				? extractLinkableWordsWithLanguage(item.English, 'en').map((word) => `/en/${word}`)
				: []),
			...(item.中文
				? extractLinkableWordsWithLanguage(item.中文, 'zh').map((word) => `/zh/${word}`)
				: [])
		])
	);
	return new Response(generateSitemap('https://itak.aynu.org/', Array.from(urls)), {
		headers: { 'Content-Type': 'application/xml', 'Cache-Control': 'max-age=0' }
	});
}
