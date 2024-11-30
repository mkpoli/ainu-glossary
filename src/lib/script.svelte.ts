import { browser } from '$app/environment';
import { convertKanaToLatn, convertLatnToKana } from 'ainconv';
import { segment } from './segment';

export type Script = 'Kana' | 'Latn';
export const AVAILABLE_SCRIPTS: Script[] = ['Kana', 'Latn'];
export function isScript(script: any): script is Script {
	return AVAILABLE_SCRIPTS.includes(script as Script);
}

export function latn2kana(latn: string) {
	const processedLatn = latn
		.replace(/-/g, ' ')
		.replace(/\buo/gi, 'uwo')
		.replace(/\bue/gi, 'uwe')
		.replace(/\boue/gi, 'ouwe')
		.replace(/\bio/gi, 'iyo')
		.replace(/\bie/gi, 'iye')
		.replace(/\beie/gi, 'eiye')
		.replace(/or ta/gi, 'otta')
		.replace(/an=ye/gi, 'ayye')
		.replace(/mp/gi, 'np')
		.replace(/mm/gi, 'nm')
		.replace(/b/g, 'p')
		.replace(/d/g, 't')
		.replace(/g/g, 'k')
		.replace(/z/g, 'c');

	try {
		const converted = convertLatnToKana(processedLatn);
		return converted.replace(/ト゚/g, 'ツ゚');
	} catch (e) {
		console.error(`Error converting Latn "${latn}" to Kana`, e);
		return processedLatn;
	}
}

export function kana2latn(kana: string) {
	return segment(kana, 'ain-Kana')
		.map((segment) => convertKanaToLatn(segment.segment))
		.join('');
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
