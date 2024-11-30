export function generateOgImageURL(latn: string, kana: string): string {
	const searchParams = new URLSearchParams();
	searchParams.set('latn', latn);
	searchParams.set('kana', kana);
	return `/api/ogp?${searchParams.toString()}`;
}
