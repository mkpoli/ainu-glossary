import { browser } from '$app/environment';
import { latn2kana, kana2latn } from './kana';

export { latn2kana, kana2latn };

export type Script = 'Kana' | 'Latn';
export const AVAILABLE_SCRIPTS: Script[] = ['Kana', 'Latn'];
export function isScript(script: any): script is Script {
	return AVAILABLE_SCRIPTS.includes(script as Script);
}

function createScriptManager() {
	let script = $state<Script>(
		browser ? ((localStorage.getItem('ain-script') as Script) ?? 'Latn') : 'Latn'
	);
	let t = $derived(script === 'Kana' ? latn2kana : (latn: string) => latn);

	return {
		get script() {
			return script;
		},
		set script(value: 'Kana' | 'Latn') {
			script = value;
			if (browser) {
				document.documentElement.lang = value === 'Kana' ? 'ain-Kana' : 'ain-Latn';
				document.cookie = `ain-script=${value}; max-age=31536000; path=/`;

				console.info(`Ainu script set to ${value}`);
			}
		},
		get t() {
			return t;
		},
		localized(ain: string, jpn: string, eng: string, separator = ' / ') {
			const transliterated = ain
				.split(/(-\{.+?\}-)/)
				.map((segment) => {
					if (segment.startsWith('-{')) {
						return segment.slice(2, -2);
					}
					return this.t(segment);
				})
				.join('');

			return `${transliterated}${separator}${jpn}${separator}${eng}`;
		}
	};
}

export default createScriptManager();
