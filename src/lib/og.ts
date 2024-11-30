import { page } from '$app/stores';
import { get } from 'svelte/store';

export function generateOgImageURL(latn: string, kana: string): string {
	const url = new URL(`/api/ogp`, get(page).url);
	url.searchParams.set('latn', latn);
	url.searchParams.set('kana', kana);
	return url.toString();
}
