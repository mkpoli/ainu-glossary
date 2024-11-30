import { browser } from '$app/environment';
import { convertLatnToKana } from 'ainconv';
export type Script = 'Kana' | 'Latn';

export function latn2kana(latn: string) {
	const processedLatn = latn
		.replace(/-/g, ' ')
		.replace(/\buo/gi, 'uwo')
		.replace(/\bue/gi, 'uwe')
		.replace(/\bio/gi, 'iyo')
		.replace(/\bie/gi, 'iye')
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
				localStorage.setItem('ain-script', value);
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
